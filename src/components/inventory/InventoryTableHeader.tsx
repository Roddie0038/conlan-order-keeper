
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Save, Trash2 } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";
import { useInventoryContext } from "@/contexts/InventoryContext";

interface InventoryTableHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleAddItem: () => void;
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  handleSaveChanges: () => void;
  cancelEdit: () => void;
  selectedItems: string[];
  handleDeleteSelected: () => void;
  inventory: any[];
}

export function InventoryTableHeader({
  searchTerm,
  setSearchTerm,
  handleAddItem,
  editMode,
  setEditMode,
  handleSaveChanges,
  cancelEdit,
  selectedItems,
  handleDeleteSelected,
  inventory
}: InventoryTableHeaderProps) {
  const { isAdmin } = useInventoryContext();
  
  return (
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
        {isAdmin && selectedItems.length > 0 && (
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
        {isAdmin && (
          <>
            {!editMode ? (
              <Button onClick={() => setEditMode(true)} variant="outline">Edit</Button>
            ) : (
              <>
                <Button onClick={cancelEdit} variant="outline">Cancel</Button>
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
          </>
        )}
      </div>
    </div>
  );
}
