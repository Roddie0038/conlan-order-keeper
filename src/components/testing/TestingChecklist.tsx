
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { isStaging } from "@/config/environment";

interface TestItem {
  id: string;
  description: string;
  checked: boolean;
  category: 'auth' | 'orders' | 'inventory' | 'cross-dock';
}

interface TestingChecklistProps {
  feature: string;
}

export function TestingChecklist({ feature }: TestingChecklistProps) {
  // Only show in staging environment
  if (!isStaging) return null;
  
  // Sample test items for different features
  const [testItems, setTestItems] = useState<TestItem[]>([
    // Authentication tests
    { id: 'auth-1', description: 'User can sign up with email', checked: false, category: 'auth' },
    { id: 'auth-2', description: 'User can log in with email', checked: false, category: 'auth' },
    { id: 'auth-3', description: 'User can reset password', checked: false, category: 'auth' },
    
    // Order tests
    { id: 'orders-1', description: 'User can create an order', checked: false, category: 'orders' },
    { id: 'orders-2', description: 'User can view order details', checked: false, category: 'orders' },
    { id: 'orders-3', description: 'User can update an order', checked: false, category: 'orders' },
    
    // Inventory tests
    { id: 'inventory-1', description: 'User can view inventory', checked: false, category: 'inventory' },
    { id: 'inventory-2', description: 'User can update inventory', checked: false, category: 'inventory' },
    { id: 'inventory-3', description: 'Low stock alerts are displayed', checked: false, category: 'inventory' },
    
    // Cross-dock tests
    { id: 'cross-dock-1', description: 'User can create cross-dock transfer', checked: false, category: 'cross-dock' },
    { id: 'cross-dock-2', description: 'Cross-dock destinations are displayed', checked: false, category: 'cross-dock' },
  ]);
  
  const toggleItem = (id: string) => {
    setTestItems(items => 
      items.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };
  
  // Filter items based on feature
  const filteredItems = testItems.filter(item => item.category === feature);
  
  // Calculate progress
  const completedItems = filteredItems.filter(item => item.checked).length;
  const progressPercentage = filteredItems.length > 0 
    ? Math.round((completedItems / filteredItems.length) * 100) 
    : 0;
  
  return (
    <div className="border border-gray-200 rounded-md p-4 bg-white shadow-sm max-w-md">
      <h3 className="text-lg font-bold mb-2 capitalize">{feature} Testing Checklist</h3>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        {completedItems} of {filteredItems.length} tests completed ({progressPercentage}%)
      </p>
      
      {/* Test items */}
      <ul className="space-y-2">
        {filteredItems.map(item => (
          <li key={item.id} className="flex items-start space-x-2">
            <Checkbox 
              id={item.id}
              checked={item.checked}
              onCheckedChange={() => toggleItem(item.id)}
            />
            <label 
              htmlFor={item.id}
              className={`text-sm ${item.checked ? 'line-through text-gray-400' : ''}`}
            >
              {item.description}
            </label>
          </li>
        ))}
      </ul>
      
      {filteredItems.length === 0 && (
        <p className="text-sm text-gray-500 italic">No test items for this feature</p>
      )}
    </div>
  );
}
