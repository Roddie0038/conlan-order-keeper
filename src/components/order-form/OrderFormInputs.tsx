
import { FormField } from "./FormField";
import { Button } from "@/components/ui/button";
import { scheduleOptions, crossDockOptions, stores, type FormData } from "./formConfig";
// REMOVED: storeManagerEmails - now using dynamic email routing
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchInventory } from "@/services/inventoryService";
import { InventoryItem } from "@/types/inventory";
import { Info, Package, Calendar, Truck, Building, Mail, MapPin, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getPlantForStore } from "@/utils/plantMapping";
import { InventoryWarningDialog } from "./InventoryWarningDialog";

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
  const { toast } = useToast();
  const { user } = useAuth();
  const [inventoryCheck, setInventoryCheck] = useState<{
    available: boolean;
    quantity: number;
  } | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  // Calculate plant based on selected store
  const plant = formData.store ? getPlantForStore(formData.store) : "";

  // Set the store to the user's store on component mount for non-admin users
  useEffect(() => {
    if (user && user.store && !user.isAdmin && formData.store !== user.store) {
      onChange("store", user.store);
      
      // Set manager email when store changes
      // REMOVED: hardcoded email lookup - now handled dynamically in edge function
    }
  }, [user, formData.store]);

  // Helper function to get manager email
  // REMOVED: getManagerEmail function - now using dynamic email routing in edge function

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
        description: `You're requesting ${formData.quantity} units, but only ${inventoryCheck.quantity} are available. You can still proceed, but the order will be flagged for review.`,
        variant: "destructive"
      });
    }
  }, [formData.quantity, inventoryCheck, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if there's an inventory issue
    const hasInventoryIssue = inventoryCheck !== null && (
      !inventoryCheck.available || 
      (formData.quantity && parseInt(formData.quantity) > inventoryCheck.quantity)
    );
    
    // If there's an inventory issue, show warning dialog
    if (hasInventoryIssue) {
      setPendingSubmit(true);
      setShowWarningDialog(true);
      return;
    }
    
    // Otherwise proceed normally
    onSubmit(e);
  };

  const handleConfirmSubmit = () => {
    setPendingSubmit(false);
    // Call the parent's onSubmit handler without an event since we're bypassing the form submission
    const form = document.createElement('form');
    const fakeEvent = new Event('submit', { cancelable: true, bubbles: true }) as any;
    Object.defineProperty(fakeEvent, 'currentTarget', { value: form, writable: false });
    Object.defineProperty(fakeEvent, 'target', { value: form, writable: false });
    onSubmit(fakeEvent);
  };

  // Determine if there's a critical inventory issue
  const hasInventoryIssue = inventoryCheck !== null && (
    !inventoryCheck.available || 
    (formData.quantity && parseInt(formData.quantity) > inventoryCheck.quantity)
  );

  return (
    <>
      <InventoryWarningDialog
        open={showWarningDialog}
        onOpenChange={setShowWarningDialog}
        onConfirm={handleConfirmSubmit}
        productNumber={formData.productNumber}
        availableQuantity={inventoryCheck?.quantity || 0}
        requestedQuantity={parseInt(formData.quantity) || 0}
        isOutOfStock={inventoryCheck !== null && !inventoryCheck.available}
      />
      
      <form 
        onSubmit={handleSubmit} 
        className={`max-w-2xl mx-auto backdrop-blur-md bg-black/60 p-8 rounded-xl shadow-xl border transition-all ${
          hasInventoryIssue ? 'border-destructive border-2' : 'border-gray-800'
        }`}
      >
        {hasInventoryIssue && (
          <div className="mb-6 bg-destructive/10 border border-destructive rounded-md p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-destructive">Inventory Warning</p>
              <p className="text-sm text-muted-foreground mt-1">
                This order has inventory availability issues. You can still proceed, but it will require manual review.
              </p>
            </div>
          </div>
        )}
        
        <div className="space-y-6">
        {/* Contact Information Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 border-l-4 border-blue-500 pl-3">
            <Info className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-medium text-white">Contact Information</h3>
          </div>

          <div className="pl-4 space-y-4">
            <FormField 
              label="Your Name" 
              required 
              value={formData.yourName} 
              onChange={value => onChange("yourName", value)} 
              placeholder="Enter your name" 
            />

            <div className="space-y-2 group transition-all duration-200">
              <label className="block text-sm font-medium text-gray-100 group-hover:text-gray-50 transition-colors flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-400" />
                Store {<span className="text-red-400">*</span>}
              </label>
              <FormField 
                label="" 
                required 
                value={formData.store} 
                onChange={value => {
                  onChange("store", value);
                  
                  // Set manager email when store changes
                  // REMOVED: hardcoded email lookup - handled dynamically in edge function
                  onChange("managersEmail", "");
                }} 
                options={stores} 
                disabled={!user?.isAdmin}
              />
            </div>

            {/* Plant Field - Read-only, auto-fills based on store */}
            <div className="space-y-2 group transition-all duration-200">
              <label className="block text-sm font-medium text-gray-100 group-hover:text-gray-50 transition-colors flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                Plant
              </label>
              <FormField 
                label="" 
                value={plant || ""} 
                onChange={() => {}} 
                disabled={true} 
                placeholder="Plant will be automatically assigned" 
              />
            </div>

            <div className="space-y-2 group transition-all duration-200">
              <label className="block text-sm font-medium text-gray-100 group-hover:text-gray-50 transition-colors flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                Manager's Email
              </label>
              <FormField 
                label="" 
                type="email" 
                value={formData.managersEmail || ''} 
                onChange={() => {}} 
                disabled={true} 
                placeholder="Manager's email will be automatically set" 
              />
            </div>

            <FormField 
              label="Date Received" 
              type="datetime-local" 
              required 
              value={formData.dateReceived} 
              onChange={value => onChange("dateReceived", value)} 
              disabled={true} 
            />
          </div>
        </div>

        {/* Product Details Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 border-l-4 border-green-500 pl-3">
            <Package className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-medium text-white">Product Details</h3>
          </div>

          <div className="pl-4 space-y-4">
            <div className="bg-zinc-800/50 p-4 rounded-lg">
              <FormField 
                label="Product Number" 
                required 
                value={formData.productNumber} 
                onChange={value => onChange("productNumber", value)} 
                placeholder="Enter product number" 
              />
              
              {inventoryCheck !== null && (
                <div className={`mt-2 rounded-lg p-2 text-sm ${inventoryCheck.available ? 'bg-green-900/40 text-green-400' : 'bg-rose-900/40 text-rose-400'}`}>
                  {inventoryCheck.available 
                    ? `✓ In stock: ${inventoryCheck.quantity} units available` 
                    : '✕ Out of stock'}
                </div>
              )}
            </div>

            <FormField 
              label="Description" 
              required 
              value={formData.description} 
              onChange={value => onChange("description", value)} 
              placeholder="Enter product description" 
            />

            <FormField 
              label="Quantity" 
              type="number" 
              required 
              value={formData.quantity} 
              onChange={value => onChange("quantity", value)} 
              placeholder="Enter quantity" 
            />
          </div>
        </div>

        {/* Logistics Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 border-l-4 border-orange-500 pl-3">
            <Calendar className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-medium text-white">Schedule & Notes</h3>
          </div>

          <div className="pl-4 space-y-4">
            <FormField 
              label="Schedule Arrival" 
              required 
              value={formData.scheduleArrival} 
              onChange={value => onChange("scheduleArrival", value)} 
              options={scheduleOptions} 
              placeholder="Select arrival day" 
            />

            <FormField 
              label="Notes" 
              value={formData.notes} 
              onChange={value => onChange("notes", value)} 
              placeholder="Enter any additional notes" 
            />
          </div>
        </div>

        {/* Cross Dock Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 border-l-4 border-purple-500 pl-3">
            <Truck className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-medium text-white">Cross Dock Options</h3>
          </div>

          <div className="pl-4 space-y-4">
            <FormField 
              label="Cross Dock" 
              required 
              value={formData.crossDock} 
              onChange={value => onChange("crossDock", value)} 
              options={crossDockOptions} 
              placeholder="Select yes/no" 
            />

            {formData.crossDock === "Yes" && (
              <>
                <FormField 
                  label="Cross Dock Destination" 
                  value={formData.crossDockDestination || ""} 
                  onChange={value => {
                    onChange("crossDockDestination", value);
                    // Set manager email based on selected store ID
                    // REMOVED: hardcoded email lookup - handled dynamically in edge function
                    onChange("managersEmail", "");
                  }} 
                  options={stores} 
                  placeholder="Select destination" 
                  required 
                />

                <FormField 
                  label="Receiver No" 
                  required 
                  value={formData.receiverNo || ""} 
                  onChange={value => onChange("receiverNo", value)} 
                  placeholder="Enter receiver number" 
                />

                <FormField 
                  label="ETA Date" 
                  type="date" 
                  required 
                  value={formData.etaDate || ""} 
                  onChange={value => onChange("etaDate", value)} 
                  placeholder="Select ETA date" 
                />

                <div className="bg-yellow-900/30 border border-yellow-800 p-4 rounded-lg">
                  <label className="flex items-center gap-2 text-yellow-400">
                    <input 
                      type="checkbox" 
                      checked={formData.crossDockConfirmation} 
                      onChange={e => onChange("crossDockConfirmation", e.target.checked ? "true" : "false")} 
                      className="rounded border-yellow-600 text-yellow-600 focus:ring-yellow-500" 
                    />
                    <span>I confirm that the cross dock paperwork has been attached to this order</span>
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
        </div>

        <Button 
          type="submit" 
          className={`w-full rounded-3xl mt-8 transition-all hover:scale-[1.01] py-6 text-lg font-semibold shadow-lg ${
            hasInventoryIssue 
              ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' 
              : 'text-slate-50 bg-rose-600 hover:bg-rose-500'
          }`}
        >
          {hasInventoryIssue ? (
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              ADD TO ORDER (INVENTORY WARNING)
            </span>
          ) : (
            'ADD TO ORDER'
          )}
        </Button>
      </form>
    </>
  );
};
