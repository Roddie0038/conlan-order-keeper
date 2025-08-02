// Enhanced storage service with IndexedDB fallback chain and cross-browser support

interface StorageAdapter {
  isSupported(): boolean;
  save(key: string, data: any): Promise<void>;
  load(key: string): Promise<any>;
  remove(key: string): Promise<void>;
  cleanup(prefix: string, maxAge: number): Promise<void>;
}

interface SavedFormData {
  data: any;
  meta: {
    store: string;
    user: string;
    formType: string;
    updatedAt: string;
    version: string;
    browser: string;
    sessionId: string;
  };
}

// IndexedDB Adapter
class IndexedDBAdapter implements StorageAdapter {
  private dbName = 'ConlanOrderForms';
  private version = 1;
  private storeName = 'formDrafts';

  isSupported(): boolean {
    return typeof indexedDB !== 'undefined';
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };
    });
  }

  async save(key: string, data: any): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put({ key, data });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async load(key: string): Promise<any> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.data);
    });
  }

  async remove(key: string): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async cleanup(prefix: string, maxAge: number): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const cutoff = Date.now() - maxAge;
    
    const request = store.openCursor();
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const key = cursor.key as string;
        const data = cursor.value.data as SavedFormData;
        
        if (key.startsWith(prefix) && new Date(data.meta.updatedAt).getTime() < cutoff) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  }
}

// LocalStorage Adapter
class LocalStorageAdapter implements StorageAdapter {
  isSupported(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  async save(key: string, data: any): Promise<void> {
    localStorage.setItem(key, JSON.stringify(data));
  }

  async load(key: string): Promise<any> {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async cleanup(prefix: string, maxAge: number): Promise<void> {
    const cutoff = Date.now() - maxAge;
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}') as SavedFormData;
          if (new Date(data.meta.updatedAt).getTime() < cutoff) {
            keysToRemove.push(key);
          }
        } catch {
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

// SessionStorage Adapter
class SessionStorageAdapter implements StorageAdapter {
  isSupported(): boolean {
    try {
      const test = '__storage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  async save(key: string, data: any): Promise<void> {
    sessionStorage.setItem(key, JSON.stringify(data));
  }

  async load(key: string): Promise<any> {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  async remove(key: string): Promise<void> {
    sessionStorage.removeItem(key);
  }

  async cleanup(prefix: string, maxAge: number): Promise<void> {
    const cutoff = Date.now() - maxAge;
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(prefix)) {
        try {
          const data = JSON.parse(sessionStorage.getItem(key) || '{}') as SavedFormData;
          if (new Date(data.meta.updatedAt).getTime() < cutoff) {
            keysToRemove.push(key);
          }
        } catch {
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  }
}

// Memory Adapter (fallback)
class MemoryStorageAdapter implements StorageAdapter {
  private storage = new Map<string, any>();

  isSupported(): boolean {
    return true;
  }

  async save(key: string, data: any): Promise<void> {
    this.storage.set(key, data);
  }

  async load(key: string): Promise<any> {
    return this.storage.get(key) || null;
  }

  async remove(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async cleanup(prefix: string, maxAge: number): Promise<void> {
    const cutoff = Date.now() - maxAge;
    for (const [key, data] of this.storage) {
      if (key.startsWith(prefix)) {
        try {
          const formData = data as SavedFormData;
          if (new Date(formData.meta.updatedAt).getTime() < cutoff) {
            this.storage.delete(key);
          }
        } catch {
          this.storage.delete(key);
        }
      }
    }
  }
}

// Main service
export class PersistentStorageService {
  private adapter: StorageAdapter;
  private sessionId: string;

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.adapter = this.selectAdapter();
    this.setupCrossTabCoordination();
  }

  private selectAdapter(): StorageAdapter {
    const adapters = [
      new IndexedDBAdapter(),
      new LocalStorageAdapter(),
      new SessionStorageAdapter(),
      new MemoryStorageAdapter()
    ];

    for (const adapter of adapters) {
      if (adapter.isSupported()) {
        console.log(`✅ Using storage adapter: ${adapter.constructor.name}`);
        return adapter;
      }
    }

    return new MemoryStorageAdapter();
  }

  private setupCrossTabCoordination(): void {
    if (typeof window !== 'undefined' && this.adapter instanceof LocalStorageAdapter) {
      window.addEventListener('storage', (event) => {
        if (event.key?.startsWith('autosave-') && event.newValue === null) {
          // Another tab cleared data - emit custom event
          window.dispatchEvent(new CustomEvent('formDraftCleared', { 
            detail: { key: event.key } 
          }));
        }
      });
    }
  }

  generateKey(storeNumber: string, userEmail: string, formType: string): string {
    return `autosave-${storeNumber}-${userEmail}-${formType}`;
  }

  async save(key: string, formData: any, meta: Omit<SavedFormData['meta'], 'updatedAt' | 'browser' | 'sessionId'>): Promise<void> {
    const saveData: SavedFormData = {
      data: formData,
      meta: {
        ...meta,
        updatedAt: new Date().toISOString(),
        browser: navigator.userAgent.substring(0, 100),
        sessionId: this.sessionId
      }
    };

    try {
      await this.adapter.save(key, saveData);
    } catch (error) {
      console.error('Failed to save form data:', error);
      throw error;
    }
  }

  async load(key: string): Promise<SavedFormData | null> {
    try {
      return await this.adapter.load(key);
    } catch (error) {
      console.error('Failed to load form data:', error);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await this.adapter.remove(key);
    } catch (error) {
      console.error('Failed to remove form data:', error);
    }
  }

  async cleanup(maxAge: number = 60 * 60 * 1000): Promise<void> {
    try {
      await this.adapter.cleanup('autosave-', maxAge);
    } catch (error) {
      console.error('Failed to cleanup old form data:', error);
    }
  }

  isExpired(savedData: SavedFormData, maxAge: number = 60 * 60 * 1000): boolean {
    const age = Date.now() - new Date(savedData.meta.updatedAt).getTime();
    return age > maxAge;
  }

  validateMetadata(savedData: SavedFormData, currentStore: string, currentUser: string, formType: string): boolean {
    return (
      savedData.meta.store === currentStore &&
      savedData.meta.user === currentUser &&
      savedData.meta.formType === formType
    );
  }
}

// Export singleton instance
export const persistentStorageService = new PersistentStorageService();