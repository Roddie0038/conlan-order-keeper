
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Save, Trash2, FileSpreadsheet, Pencil, X } from "lucide-react";
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
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="relative w-full md:w-1/3">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-gray-400" size={18} />
        </div>
        <Input 
          placeholder="Search by product # or description..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-50 border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {isAdmin && selectedItems.length > 0 && (
          <Button 
            onClick={handleDeleteSelected} 
            variant="destructive"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
          >
            <Trash2 size={16} />
            Delete Selected ({selectedItems.length})
          </Button>
        )}
        <ExportButton 
          data={inventory} 
          filename="inventory" 
          variant="outline"
          className="flex items-center gap-2 bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50"
        >
          <FileSpreadsheet size={16} />
          Export CSV
        </ExportButton>
        {isAdmin && (
          <>
            {!editMode ? (
              <Button 
                onClick={() => setEditMode(true)} 
                variant="outline"
                className="flex items-center gap-2 border-amber-200 text-amber-700 hover:bg-amber-50"
              >
                <Pencil size={16} />
                Edit Mode
              </Button>
            ) : (
              <>
                <Button 
                  onClick={cancelEdit} 
                  variant="outline"
                  className="flex items-center gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <X size={16} />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveChanges} 
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Save size={16} />
                  Save Changes
                </Button>
              </>
            )}
            <Button 
              onClick={handleAddItem} 
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Plus size={16} />
              Add Item
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
