import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Save, Trash2, List, X } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";

interface InventoryItem {
  id: string;
  productNumber: string;
  description: string;
  quantity: number;
  minThreshold: number;
  lastUpdated: string;
  lowStock: boolean;
}

export function InventoryTable() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editedInventory, setEditedInventory] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load inventory from localStorage
    const savedInventory = localStorage.getItem('inventory');
    let loadedInventory: InventoryItem[] = [];
    
    if (savedInventory) {
      loadedInventory = JSON.parse(savedInventory);
    } else {
      // Sample data if no inventory exists
      loadedInventory = [
        {
          id: "1",
          productNumber: "PT-1234",
          description: "Premium Tire Size 225/65R17",
          quantity: 15,
          minThreshold: 5,
          lastUpdated: new Date().toISOString(),
          lowStock: false
        },
        {
          id: "2",
          productNumber: "RIM-789",
          description: "Alloy Rim 17-inch Black",
          quantity: 3,
          minThreshold: 3,
          lastUpdated: new Date().toISOString(),
          lowStock: true
        },
        {
          id: "3",
          productNumber: "VT-456",
          description: "Valve Stem Kit",
          quantity: 50,
          minThreshold: 10,
          lastUpdated: new Date().toISOString(),
          lowStock: false
        }
      ];
      localStorage.setItem('inventory', JSON.stringify(loadedInventory));
    }
    
    setInventory(loadedInventory);
    setEditedInventory(JSON.parse(JSON.stringify(loadedInventory)));
  }, []);

  const filteredInventory = inventory.filter(item => 
    item.productNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = () => {
    const newItem: InventoryItem = {
      id: crypto.randomUUID(),
      productNumber: "",
      description: "",
      quantity: 0,
      minThreshold: 5,
      lastUpdated: new Date().toISOString(),
      lowStock: false
    };
    
    setInventory([...inventory, newItem]);
    setEditedInventory([...editedInventory, newItem]);
    setEditMode(true);
  };

  const handleSaveChanges = () => {
    // Update the inventory with edited values
    setInventory(editedInventory);
    
    // Save to localStorage
    localStorage.setItem('inventory', JSON.stringify(editedInventory));
    
    // Calculate which items are now low stock
    const itemsNowLowStock = editedInventory.filter(item => 
      item.quantity <= item.minThreshold
    );
    
    toast({
      title: "Inventory Updated",
      description: `${editedInventory.length} items updated. ${itemsNowLowStock.length} items are below threshold.`
    });
    
    setEditMode(false);
  };

  const handleEdit = (id: string, field: keyof InventoryItem, value: string | number | boolean) => {
    setEditedInventory(prev => 
      prev.map(item => {
        if (item.id !== id) return item;
        
        // Create updated item with the new field value
        const updatedItem = { 
          ...item, 
          [field]: value,
          lastUpdated: new Date().toISOString()
        };
        
        // Determine if item is low stock based on updated values
        let isLowStock = item.lowStock;
        
        // Only recalculate low stock status if quantity or min threshold changed
        if (field === 'quantity' || field === 'minThreshold') {
          const currentQuantity = field === 'quantity' ? Number(value) : item.quantity;
          const currentThreshold = field === 'minThreshold' ? Number(value) : item.minThreshold;
          isLowStock = currentQuantity <= currentThreshold;
        } else if (field === 'lowStock') {
          // If directly setting lowStock, use the provided boolean value
          isLowStock = Boolean(value);
        }
        
        return {
          ...updatedItem,
          lowStock: isLowStock
        };
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    // Don't delete in edit mode - wait for save
    if (editMode) {
      setEditedInventory(prev => prev.filter(item => item.id !== id));
    } else {
      // Delete immediately in view mode
      const updatedInventory = inventory.filter(item => item.id !== id);
      setInventory(updatedInventory);
      localStorage.setItem('inventory', JSON.stringify(updatedInventory));
      
      toast({
        title: "Item Deleted",
        description: "Inventory item has been removed."
      });
    }
    // Clear selection if item was selected
    setSelectedItems(prev => prev.filter(itemId => itemId !== id));
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const handleSelectAll = () => {
    const currentItems = (editMode ? editedInventory : inventory)
      .filter(item => 
        item.productNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(item => item.id);
    
    if (selectedItems.length === currentItems.length) {
      // If all are selected, deselect all
      setSelectedItems([]);
    } else {
      // Otherwise, select all filtered items
      setSelectedItems(currentItems);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;

    if (editMode) {
      setEditedInventory(prev => prev.filter(item => !selectedItems.includes(item.id)));
    } else {
      const updatedInventory = inventory.filter(item => !selectedItems.includes(item.id));
      setInventory(updatedInventory);
      localStorage.setItem('inventory', JSON.stringify(updatedInventory));
      
      toast({
        title: "Items Deleted",
        description: `${selectedItems.length} inventory items have been removed.`
      });
    }
    // Clear selection after delete
    setSelectedItems([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 w-1/3">
          <Search className="text-gray-500" size={18} />
          <Input 
            placeholder="Search inventory..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white"
          />
        </div>
        <div className="flex items-center space-x-2">
          {selectedItems.length > 0 && (
            <Button 
              onClick={handleDeleteSelected} 
              variant="destructive"
              className="flex items-center"
            >
              <Trash2 size={18} className="mr-2" />
              Delete Selected ({selectedItems.length})
            </Button>
          )}
          <ExportButton 
            data={inventory} 
            filename="inventory" 
            variant="outline"
          />
          {!editMode ? (
            <Button onClick={() => setEditMode(true)} variant="outline">Edit</Button>
          ) : (
            <>
              <Button onClick={() => {
                setEditMode(false);
                setEditedInventory(JSON.parse(JSON.stringify(inventory)));
                setSelectedItems([]);
              }} variant="outline">Cancel</Button>
              <Button onClick={handleSaveChanges} className="bg-blue-600 hover:bg-blue-700">
                <Save size={18} className="mr-2" />
                Save Changes
              </Button>
            </>
          )}
          <Button onClick={handleAddItem} className="bg-green-600 hover:bg-green-700">
            <Plus size={18} className="mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-200">
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={
                    filteredInventory.length > 0 && 
                    selectedItems.length === filteredInventory.length
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[120px]">Product #</TableHead>
              <TableHead className="w-[300px]">Description</TableHead>
              <TableHead className="w-[100px]">Quantity</TableHead>
              <TableHead className="w-[100px]">Min Stock</TableHead>
              <TableHead className="w-[150px]">Last Updated</TableHead>
              <TableHead className="w-[100px]">Low Stock</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No inventory items found
                </TableCell>
              </TableRow>
            ) : (
              (editMode ? editedInventory : inventory)
                .filter(item => 
                  item.productNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.description.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(item => (
                <TableRow key={item.id} className={item.lowStock ? "bg-red-50" : ""}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                      aria-label={`Select item ${item.productNumber}`}
                    />
                  </TableCell>
                  <TableCell>
                    {editMode ? (
                      <Input 
                        value={item.productNumber} 
                        onChange={(e) => handleEdit(item.id, "productNumber", e.target.value)}
                        className="max-w-[100px]"
                      />
                    ) : (
                      item.productNumber
                    )}
                  </TableCell>
                  <TableCell>
                    {editMode ? (
                      <Input 
                        value={item.description} 
                        onChange={(e) => handleEdit(item.id, "description", e.target.value)}
                      />
                    ) : (
                      item.description
                    )}
                  </TableCell>
                  <TableCell>
                    {editMode ? (
                      <Input 
                        type="number"
                        value={item.quantity} 
                        onChange={(e) => handleEdit(item.id, "quantity", parseInt(e.target.value) || 0)}
                        className="max-w-[80px]"
                      />
                    ) : (
                      item.quantity
                    )}
                  </TableCell>
                  <TableCell>
                    {editMode ? (
                      <Input 
                        type="number"
                        value={item.minThreshold} 
                        onChange={(e) => handleEdit(item.id, "minThreshold", parseInt(e.target.value) || 0)}
                        className="max-w-[80px]"
                      />
                    ) : (
                      item.minThreshold
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(item.lastUpdated).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Checkbox 
                        checked={item.lowStock} 
                        onCheckedChange={(checked) => editMode && handleEdit(item.id, "lowStock", !!checked)}
                        disabled={!editMode}
                        className={item.lowStock ? "bg-red-500 text-white" : ""}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {inventory.some(item => item.lowStock) && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-800">
          <strong>Attention:</strong> Some items are below minimum stock threshold. Please reorder soon.
        </div>
      )}
    </div>
  );
}
