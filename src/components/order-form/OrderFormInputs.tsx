import { FormField } from "./FormField";
import { Button } from "@/components/ui/button";
import { scheduleOptions, crossDockOptions, stores, type FormData, storeManagerEmails } from "./formConfig";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchInventory } from "@/services/inventoryService";
import { InventoryItem } from "@/types/inventory";
interface OrderFormInputsProps {
  formData: FormData;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: keyof FormData, value: string) => void;
}
export const OrderFormInputs = ({
  formData,
  onSubmit,
  onChange
}: OrderFormInputsProps) => {
  const {
    toast
  } = useToast();
  const [inventoryCheck, setInventoryCheck] = useState<{
    available: boolean;
    quantity: number;
  } | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  // Fetch inventory on component mount
  useEffect(() => {
    const loadInventory = async () => {
      try {
        const items = await fetchInventory();
        setInventoryItems(items);
        // Cache for offline access
        localStorage.setItem('inventory', JSON.stringify(items.map(item => ({
          productNumber: item.product_number,
          quantity: item.quantity,
          lowStock: item.low_stock
        }))));
      } catch (error) {
        console.error("Error loading inventory:", error);
        // Try to use cached inventory
        const cachedInventory = localStorage.getItem('inventory');
        if (cachedInventory) {
          setInventoryItems(JSON.parse(cachedInventory));
        }
      }
    };
    loadInventory();
  }, []);

  // Check inventory when product number changes
  useEffect(() => {
    if (formData.productNumber) {
      // First try to find in our fetched inventory
      const productItem = inventoryItems.find(item => item.product_number.toLowerCase() === formData.productNumber.toLowerCase());
      if (productItem) {
        setInventoryCheck({
          available: productItem.quantity > 0,
          quantity: productItem.quantity
        });

        // Show toast if product is low in stock
        if (productItem.low_stock) {
          toast({
            title: "Low Stock Alert",
            description: `This product (${formData.productNumber}) is low in stock. Only ${productItem.quantity} units available.`,
            variant: "destructive"
          });
        }
      } else {
        // Fall back to localStorage cache if not found
        const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
        const cachedItem = inventory.find((item: any) => item.productNumber.toLowerCase() === formData.productNumber.toLowerCase());
        if (cachedItem) {
          setInventoryCheck({
            available: cachedItem.quantity > 0,
            quantity: cachedItem.quantity
          });
          if (cachedItem.lowStock) {
            toast({
              title: "Low Stock Alert",
              description: `This product (${formData.productNumber}) is low in stock. Only ${cachedItem.quantity} units available.`,
              variant: "destructive"
            });
          }
        } else {
          setInventoryCheck(null);
        }
      }
    } else {
      setInventoryCheck(null);
    }
  }, [formData.productNumber, inventoryItems, toast]);

  // Check if requested quantity is available when quantity changes
  useEffect(() => {
    if (inventoryCheck && formData.quantity && Number(formData.quantity) > inventoryCheck.quantity) {
      toast({
        title: "Insufficient Stock",
        description: `You're requesting ${formData.quantity} units, but only ${inventoryCheck.quantity} are available.`,
        variant: "destructive"
      });
    }
  }, [formData.quantity, inventoryCheck, toast]);
  return <form onSubmit={onSubmit} className="space-y-6 max-w-2xl mx-auto p-6 shadow rounded-md px-[100px] bg-transparent">
      <div className="space-y-4">
        <FormField label="Your Name" required value={formData.yourName} onChange={value => onChange("yourName", value)} placeholder="Enter your name" />

        <FormField label="Date Received" type="datetime-local" required value={formData.dateReceived} onChange={value => onChange("dateReceived", value)} disabled={true} />

        <FormField label="Manager's Email" type="email" value={formData.managersEmail || ''} onChange={() => {}} // No-op since it's read-only
      disabled={true} placeholder="Manager's email will be automatically set" />

        <div className="bg-zinc-50">
          <FormField label="Product Number" required value={formData.productNumber} onChange={value => onChange("productNumber", value)} placeholder="Enter product number" />
          {inventoryCheck !== null && <div className="bg-rose-600 rounded-lg px-[120px]">
              {inventoryCheck.available ? `In stock: ${inventoryCheck.quantity} units available` : 'Out of stock'}
            </div>}
        </div>

        <FormField label="Description" required value={formData.description} onChange={value => onChange("description", value)} placeholder="Enter product description" />

        <FormField label="Quantity" type="number" required value={formData.quantity} onChange={value => onChange("quantity", value)} placeholder="Enter quantity" />

        <FormField label="Schedule Arrival" required value={formData.scheduleArrival} onChange={value => onChange("scheduleArrival", value)} options={scheduleOptions} placeholder="Select arrival day" />

        <FormField label="Notes" value={formData.notes} onChange={value => onChange("notes", value)} placeholder="Enter any additional notes" />

        <FormField label="Cross Dock" required value={formData.crossDock} onChange={value => onChange("crossDock", value)} options={crossDockOptions} placeholder="Select yes/no" />

        {formData.crossDock === "yes" && <FormField label="Cross Dock Destination" value={formData.crossDockDestination || ""} onChange={value => {
        onChange("crossDockDestination", value);
        // Set manager email based on selected store ID
        const managersEmail = storeManagerEmails[value] || '';
        onChange("managersEmail", managersEmail);
      }} options={stores} placeholder="Select destination" required />}
      </div>

      <Button type="submit" className="w-full text-slate-50 rounded-3xl bg-rose-600 hover:bg-rose-500" disabled={inventoryCheck !== null && !inventoryCheck.available}>
        ADD TO ORDER
      </Button>
    </form>;
};