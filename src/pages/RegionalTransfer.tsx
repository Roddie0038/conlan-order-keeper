import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, Building2, Package, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { submitOtOrder, type OtOrderPayload } from "@/services/submitOtOrder";
import { PLANT_STORE_MAP } from "@/utils/plantMapping";

const PLANTS = ["Grand Prairie 097", "Romulus 098", "Mulberry 099"];

// Flatten all stores from plant map and filter out any empty values
const ALL_STORES = Object.values(PLANT_STORE_MAP)
  .flat()
  .filter(store => store && store.trim() !== '')
  .sort();

export default function RegionalTransfer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [formData, setFormData] = useState({
    sourcePlant: "",
    targetStore: "",
    targetPlant: "",
    productNumber: "",
    quantity: "1",
    notes: ""
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.sourcePlant || !formData.targetStore || !formData.productNumber) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in source plant, target store, and product number.",
        variant: "destructive"
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmedSubmit = async () => {
    setShowConfirmDialog(false);
    setIsSubmitting(true);

    try {
      const payload: OtOrderPayload = {
        type: "REGIONAL_TRANSFER", // TODO: Coordinate with OT Platform team for handling this order type
        order_number: `REG-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        product_number: formData.productNumber,
        quantity: parseInt(formData.quantity) || 1,
        store: formData.targetStore,
        plant: formData.sourcePlant,
        submitted_by_email: user?.email || "",
        submitted_by_name: user?.storeManager?.name || user?.email || "",
        metadata: {
          source_plant: formData.sourcePlant,
          target_plant: formData.targetPlant || undefined,
          notes: formData.notes || undefined,
          order_subtype: "regional_transfer"
        }
      };

      console.log("🚀 REGIONAL TRANSFER - Submitting:", payload);
      const result = await submitOtOrder(payload);

      if (result.ok === false) {
        throw new Error(result.message);
      }

      toast({
        title: "✅ Regional Transfer Submitted",
        description: `Order ${result.order_number} submitted successfully. Trace ID: ${result.trace_id}`
      });

      // Reset form
      setFormData({
        sourcePlant: "",
        targetStore: "",
        targetPlant: "",
        productNumber: "",
        quantity: "1",
        notes: ""
      });

    } catch (error: any) {
      console.error("❌ REGIONAL TRANSFER - Error:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit regional transfer",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4 text-white hover:text-blue-400"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Regional / Plant-to-Plant Transfer</h1>
              <p className="text-gray-300 mt-1">
                For cross-plant and regional transfer orders with explicit source/destination selection
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-6 border-blue-500/20 bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-blue-400">What is a Regional Transfer?</CardTitle>
            <CardDescription className="text-gray-300">
              Use this page for special cases where you need to explicitly specify the source plant
              and destination store/plant. Normal store orders automatically determine the plant based
              on your store location.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Main Form */}
        <Card className="border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Transfer Details</CardTitle>
            <CardDescription>All fields marked with * are required</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Source Plant */}
              <div className="space-y-2">
                <Label htmlFor="sourcePlant" className="text-white flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Source Plant *
                </Label>
                <Select
                  value={formData.sourcePlant}
                  onValueChange={(value) => setFormData({ ...formData, sourcePlant: value })}
                >
                  <SelectTrigger id="sourcePlant" className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Select source plant" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLANTS.map((plant) => (
                      <SelectItem key={plant} value={plant}>
                        {plant}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Store */}
              <div className="space-y-2">
                <Label htmlFor="targetStore" className="text-white flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Target Store *
                </Label>
                <Select
                  value={formData.targetStore}
                  onValueChange={(value) => setFormData({ ...formData, targetStore: value })}
                >
                  <SelectTrigger id="targetStore" className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Select target store" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {ALL_STORES.map((store) => (
                      <SelectItem key={store} value={store}>
                        {store}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Plant (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="targetPlant" className="text-white flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Target Plant (Optional - for plant-to-plant transfers)
                </Label>
                <Select
                  value={formData.targetPlant || "none"}
                  onValueChange={(value) => setFormData({ ...formData, targetPlant: value === "none" ? "" : value })}
                >
                  <SelectTrigger id="targetPlant" className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Select target plant (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Store delivery)</SelectItem>
                    {PLANTS.map((plant) => (
                      <SelectItem key={plant} value={plant}>
                        {plant}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product Number */}
              <div className="space-y-2">
                <Label htmlFor="productNumber" className="text-white flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Product Number *
                </Label>
                <Input
                  id="productNumber"
                  value={formData.productNumber}
                  onChange={(e) => setFormData({ ...formData, productNumber: e.target.value })}
                  placeholder="Enter product number"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-white">
                  Quantity *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white">
                  Notes / Special Instructions
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any special instructions or notes..."
                  rows={4}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting ? "Submitting..." : "Submit Regional Transfer"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="border-slate-600 text-white hover:bg-slate-800"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent className="bg-slate-900 border-slate-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Confirm Regional Transfer</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                Please review the transfer details before submitting:
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="space-y-3 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-400">Source Plant:</span>
                <span className="text-white font-medium">{formData.sourcePlant}</span>
                
                <span className="text-gray-400">Target Store:</span>
                <span className="text-white font-medium">{formData.targetStore}</span>
                
                {formData.targetPlant && (
                  <>
                    <span className="text-gray-400">Target Plant:</span>
                    <span className="text-white font-medium">{formData.targetPlant}</span>
                  </>
                )}
                
                <span className="text-gray-400">Product Number:</span>
                <span className="text-white font-medium">{formData.productNumber}</span>
                
                <span className="text-gray-400">Quantity:</span>
                <span className="text-white font-medium">{formData.quantity}</span>
              </div>
              
              {formData.notes && (
                <div className="pt-2 border-t border-slate-700">
                  <span className="text-gray-400 text-sm">Notes:</span>
                  <p className="text-white text-sm mt-1">{formData.notes}</p>
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmedSubmit}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Confirm & Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
