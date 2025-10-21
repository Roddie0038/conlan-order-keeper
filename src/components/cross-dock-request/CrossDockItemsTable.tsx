import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { CrossDockItem } from "@/pages/CrossDockRequest";

interface CrossDockItemsTableProps {
  items: CrossDockItem[];
  onAddItem: (item: Omit<CrossDockItem, "id">) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, field: keyof CrossDockItem, value: string | number) => void;
}

export function CrossDockItemsTable({
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}: CrossDockItemsTableProps) {
  const [newItem, setNewItem] = useState({
    product_number: "",
    description: "",
    quantity: 1,
  });

  const handleAddClick = () => {
    if (!newItem.product_number.trim()) {
      return;
    }

    onAddItem(newItem);
    setNewItem({
      product_number: "",
      description: "",
      quantity: 1,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddClick();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Items to Request</h3>
        <span className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-4 space-y-2">
          <label className="text-sm font-medium">Product Number *</label>
          <Input
            value={newItem.product_number}
            onChange={(e) => setNewItem({ ...newItem, product_number: e.target.value })}
            onKeyPress={handleKeyPress}
            placeholder="Enter product number"
          />
        </div>
        <div className="md:col-span-5 space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Input
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            onKeyPress={handleKeyPress}
            placeholder="Enter description"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium">Quantity *</label>
          <Input
            type="number"
            min="1"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
            onKeyPress={handleKeyPress}
          />
        </div>
        <div className="md:col-span-1">
          <Button
            type="button"
            onClick={handleAddClick}
            disabled={!newItem.product_number.trim()}
            className="w-full"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Number</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-24">Quantity</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Input
                      value={item.product_number}
                      onChange={(e) => onUpdateItem(item.id, "product_number", e.target.value)}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.description}
                      onChange={(e) => onUpdateItem(item.id, "description", e.target.value)}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        onUpdateItem(item.id, "quantity", parseInt(e.target.value) || 1)
                      }
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(item.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground">No items added yet. Add items above to continue.</p>
        </div>
      )}
    </div>
  );
}