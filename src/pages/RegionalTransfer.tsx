import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useOTStores } from "@/integrations/ot-platform/hooks/useOTStores";
import { useOTPlants } from "@/integrations/ot-platform/hooks/useOTPlants";

type TransportMethod = "PAM_TRANSPORT" | "CENTRAL_TRANSPORT" | "CUSTOM";
type CostResponsibility = "SHIPPER" | "RECEIVER";
type TransferType = "plant_to_store" | "cross_plant";

export default function RegionalTransfer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [userStore, setUserStore] = useState<string>("");
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  // Fetch data from OT Platform - Single source of truth
  const { data: otPlants, isLoading: plantsLoading } = useOTPlants();
  const { data: otStores, isLoading: storesLoading } = useOTStores();

  // Derive PLANTS and ALL_STORES from OT Platform data
  const PLANTS = otPlants?.map(p => p.plant_name) || [];
  const ALL_STORES = otStores?.map(s => s.store_name).sort() || [];

  // Auto-filled metadata (locked fields)
  const submittedByName = user?.name || user?.email || "";
  const submittedByEmail = user?.email || "";
  const submittedDate = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    // Product details
    productNumber: "",
    productDescription: "",
    quantity: "1",
    
    // Transport details
    transportMethod: "" as TransportMethod | "",
    transportCustomCarrier: "",
    costResponsibility: "" as CostResponsibility | "",
    
    // Transfer routing
    transferType: "" as TransferType | "",
    sourcePlant: "",
    targetStore: "",
    targetPlant: "",
    
    // Optional notes
    notes: ""
  });

  // Fetch user's store from platform_users table
  useEffect(() => {
    const fetchUserStore = async () => {
      if (!user?.email) {
        setIsLoadingUserData(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('platform_users')
          .select('store')
          .eq('email', user.email)
          .eq('status', 'active')
          .maybeSingle();

        if (error) {
          console.error('Error fetching user store:', error);
          setUserStore("");
        } else if (data?.store) {
          setUserStore(data.store);
        } else {
          setUserStore("");
        }
      } catch (error) {
        console.error('Error querying platform_users:', error);
        setUserStore("");
      } finally {
        setIsLoadingUserData(false);
      }
    };

    fetchUserStore();
  }, [user?.email]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user has a store assigned
    if (!userStore || userStore === "Unassigned") {
      toast({
        title: "Store Not Assigned",
        description: "Your account does not have a store assigned. Please contact your administrator.",
        variant: "destructive"
      });
      return;
    }

    // Validate all required fields
    const requiredFields = [
      { value: formData.productNumber, name: "Product Number" },
      { value: formData.productDescription, name: "Product Description" },
      { value: formData.transportMethod, name: "Transport Method" },
      { value: formData.costResponsibility, name: "Transport Cost Responsibility" },
      { value: formData.transferType, name: "Transfer Type" },
      { value: formData.sourcePlant, name: "Source Plant" },
      { value: formData.targetStore, name: "Target Store" }
    ];

    for (const field of requiredFields) {
      if (!field.value?.toString().trim()) {
        toast({
          title: "Missing Required Field",
          description: `Please fill in ${field.name}`,
          variant: "destructive"
        });
        return;
      }
    }

    // Validate custom carrier if selected
    if (formData.transportMethod === "CUSTOM" && !formData.transportCustomCarrier?.trim()) {
      toast({
        title: "Custom Carrier Required",
        description: "Please enter the carrier name for custom transport",
        variant: "destructive"
      });
      return;
    }

    // Validate target plant for cross-plant transfers
    if (formData.transferType === "cross_plant" && !formData.targetPlant?.trim()) {
      toast({
        title: "Target Plant Required",
        description: "Cross-plant transfers require a target plant",
        variant: "destructive"
      });
      return;
    }

    // Validate quantity
    const qty = parseInt(formData.quantity);
    if (isNaN(qty) || qty < 1) {
      toast({
        title: "Invalid Quantity",
        description: "Quantity must be at least 1",
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
      // Generate unique order number for idempotency
      const orderNumber = `ORD-TRANSFER-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      
      // Determine store and plant from OT Platform data
      const storeData = otStores?.find(s => s.store_name === userStore);
      const storePlant = storeData?.plant || formData.sourcePlant;
      
      // Build the exact payload structure for OT Platform (snake_case as required)
      const payload: any = {
        type: "REGIONAL_TRANSFER",
        order_number: orderNumber,
        
        // Required: Submitter info
        submitted_by_name: submittedByName,
        submitted_by_email: submittedByEmail,
        submitted_by_store: userStore,
        
        // Required: Product details
        product_number: formData.productNumber,
        product_description: formData.productDescription,
        quantity: parseInt(formData.quantity),
        
        // Required: Store and Plant (for routing)
        store: userStore,
        plant: storePlant,
        
        // Required: Transport details
        transport_method: formData.transportMethod,
        cost_responsibility: formData.costResponsibility,
        
        // Required: Transfer routing
        transfer_type: formData.transferType,
        source_plant: formData.sourcePlant,
        target_store: formData.targetStore,
        target_plant: formData.transferType === "cross_plant" ? formData.targetPlant : null,
        
        // Optional fields
        transport_custom_carrier: formData.transportMethod === "CUSTOM" ? formData.transportCustomCarrier : null,
        notes: formData.notes || "",
        schedule_arrival: "",
        cross_dock: false,
        cross_dock_destination: "",
        receiver_no: "",
        eta_date: ""
      };

      console.log("🚀 REGIONAL TRANSFER - Submitting to OT Platform:", payload);
      
      // Send to OT Platform via forward-to-ot edge function
      const { data, error } = await supabase.functions.invoke("forward-to-ot", {
        body: payload
      });

      if (error) {
        throw new Error(error.message || "Failed to submit regional transfer");
      }

      if (data?.status === "error") {
        throw new Error(data.error?.message || "OT Platform error");
      }

      toast({
        title: "✅ Regional Transfer Submitted",
        description: `Transfer submitted successfully to OT Platform`,
      });

      // Reset form
      setFormData({
        productNumber: "",
        productDescription: "",
        quantity: "1",
        transportMethod: "",
        transportCustomCarrier: "",
        costResponsibility: "",
        transferType: "",
        sourcePlant: "",
        targetStore: "",
        targetPlant: "",
        notes: ""
      });

      // Navigate back to dashboard after short delay
      setTimeout(() => navigate("/dashboard"), 1500);

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
        <Card className="border-[1.5px] border-[#FFA500] bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900">Transfer Details</CardTitle>
            <CardDescription className="text-slate-600">All fields marked with * are required</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUserData ? (
              <div className="py-8 text-center text-slate-600">Loading user data...</div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Auto-filled Metadata Section */}
                <div className="pb-4 mb-4 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Submitter Information (Auto-filled)</h3>
                  
                  <div className="grid grid-cols-[200px_1fr] gap-4 items-center mb-3">
                    <Label className="text-slate-700 font-medium text-right">Your Name:</Label>
                    <Input 
                      value={submittedByName} 
                      disabled 
                      className="bg-slate-100 border-slate-300 text-slate-600 cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="grid grid-cols-[200px_1fr] gap-4 items-center mb-3">
                    <Label className="text-slate-700 font-medium text-right">Manager Email:</Label>
                    <Input 
                      value={submittedByEmail} 
                      disabled 
                      className="bg-slate-100 border-slate-300 text-slate-600 cursor-not-allowed"
                    />
                  </div>
                  
                  <div className="grid grid-cols-[200px_1fr] gap-4 items-center mb-3">
                    <Label className="text-slate-700 font-medium text-right">Store:</Label>
                    <Input 
                      value={userStore || "Not Assigned"} 
                      disabled 
                      className={`bg-slate-100 border-slate-300 cursor-not-allowed ${!userStore ? "text-red-600 font-semibold" : "text-slate-600"}`}
                    />
                  </div>
                  
                  <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                    <Label className="text-slate-700 font-medium text-right">Date Received:</Label>
                    <Input 
                      value={submittedDate} 
                      disabled 
                      className="bg-slate-100 border-slate-300 text-slate-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Product Details Section */}
                <div className="pb-4 mb-4 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Product Details</h3>
                  
                  <div className="grid grid-cols-[200px_1fr] gap-4 items-center mb-3">
                    <Label htmlFor="productNumber" className="text-slate-700 font-medium text-right">
                      <span className="text-red-500">* </span>Product Number:
                    </Label>
                    <Input
                      id="productNumber"
                      value={formData.productNumber}
                      onChange={(e) => setFormData({ ...formData, productNumber: e.target.value })}
                      placeholder="Enter product number"
                      className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-[200px_1fr] gap-4 items-center mb-3">
                    <Label htmlFor="productDescription" className="text-slate-700 font-medium text-right">
                      <span className="text-red-500">* </span>Description:
                    </Label>
                    <Input
                      id="productDescription"
                      value={formData.productDescription}
                      onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                      placeholder="Enter product description"
                      className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                    <Label htmlFor="quantity" className="text-slate-700 font-medium text-right">
                      <span className="text-red-500">* </span>Quantity:
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="bg-slate-50 border-slate-200 text-slate-900"
                      required
                    />
                  </div>
                </div>

                {/* Transport Details Section */}
                <div className="pb-4 mb-4 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Transport Details</h3>
                  
                  <div className="grid grid-cols-[200px_1fr] gap-4 items-center mb-3">
                    <Label htmlFor="transportMethod" className="text-slate-700 font-medium text-right">
                      <span className="text-red-500">* </span>Transport Method:
                    </Label>
                    <Select
                      value={formData.transportMethod}
                      onValueChange={(value: TransportMethod) => setFormData({ 
                        ...formData, 
                        transportMethod: value,
                        transportCustomCarrier: value === "CUSTOM" ? formData.transportCustomCarrier : ""
                      })}
                    >
                      <SelectTrigger id="transportMethod" className="bg-slate-50 border-slate-200 text-slate-900">
                        <SelectValue placeholder="Select transport method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PAM_TRANSPORT">PAM Transport</SelectItem>
                        <SelectItem value="CENTRAL_TRANSPORT">Central Transport</SelectItem>
                        <SelectItem value="CUSTOM">Custom Carrier (+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.transportMethod === "CUSTOM" && (
                    <div className="grid grid-cols-[200px_1fr] gap-4 items-center mb-3">
                      <Label htmlFor="transportCustomCarrier" className="text-slate-700 font-medium text-right">
                        <span className="text-red-500">* </span>Carrier Name:
                      </Label>
                      <Input
                        id="transportCustomCarrier"
                        value={formData.transportCustomCarrier}
                        onChange={(e) => setFormData({ ...formData, transportCustomCarrier: e.target.value })}
                        placeholder="Enter carrier name"
                        className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
                        required
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                    <Label htmlFor="costResponsibility" className="text-slate-700 font-medium text-right">
                      <span className="text-red-500">* </span>Who Pays:
                    </Label>
                    <Select
                      value={formData.costResponsibility}
                      onValueChange={(value: CostResponsibility) => setFormData({ ...formData, costResponsibility: value })}
                    >
                      <SelectTrigger id="costResponsibility" className="bg-slate-50 border-slate-200 text-slate-900">
                        <SelectValue placeholder="Select who pays for transport" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SHIPPER">Shipper</SelectItem>
                        <SelectItem value="RECEIVER">Receiver</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Transfer Routing Section */}
                <div className="pb-4 mb-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Transfer Routing</h3>
                  
                  <div className="grid grid-cols-[200px_1fr] gap-4 items-center mb-3">
                    <Label htmlFor="transferType" className="text-slate-700 font-medium text-right">
                      <span className="text-red-500">* </span>Transfer Type:
                    </Label>
                    <Select
                      value={formData.transferType}
                      onValueChange={(value: TransferType) => setFormData({ 
                        ...formData, 
                        transferType: value,
                        targetPlant: value === "plant_to_store" ? "" : formData.targetPlant
                      })}
                    >
                      <SelectTrigger id="transferType" className="bg-slate-50 border-slate-200 text-slate-900">
                        <SelectValue placeholder="Select transfer type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cross_plant">Cross-Plant Transfer</SelectItem>
                        <SelectItem value="plant_to_store">Plant-to-Store Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-[200px_1fr] gap-4 items-center mb-3">
                    <Label htmlFor="sourcePlant" className="text-slate-700 font-medium text-right">
                      <span className="text-red-500">* </span>Source Plant:
                    </Label>
                    <Select
                      value={formData.sourcePlant}
                      onValueChange={(value) => setFormData({ ...formData, sourcePlant: value })}
                    >
                      <SelectTrigger id="sourcePlant" className="bg-slate-50 border-slate-200 text-slate-900">
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
                  
                  <div className="grid grid-cols-[200px_1fr] gap-4 items-center mb-3">
                    <Label htmlFor="targetStore" className="text-slate-700 font-medium text-right">
                      <span className="text-red-500">* </span>Target Store:
                    </Label>
                    <Select
                      value={formData.targetStore}
                      onValueChange={(value) => setFormData({ ...formData, targetStore: value })}
                    >
                      <SelectTrigger id="targetStore" className="bg-slate-50 border-slate-200 text-slate-900">
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
                  
                  {formData.transferType === "cross_plant" && (
                    <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
                      <Label htmlFor="targetPlant" className="text-slate-700 font-medium text-right">
                        <span className="text-red-500">* </span>Target Plant:
                      </Label>
                      <Select
                        value={formData.targetPlant}
                        onValueChange={(value) => setFormData({ ...formData, targetPlant: value })}
                      >
                        <SelectTrigger id="targetPlant" className="bg-slate-50 border-slate-200 text-slate-900">
                          <SelectValue placeholder="Select target plant" />
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
                  )}
                </div>

                {/* Notes Section */}
                <div className="grid grid-cols-[200px_1fr] gap-4 items-start pb-4">
                  <Label htmlFor="notes" className="text-slate-700 font-medium text-right pt-2">
                    Notes:
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any special instructions or notes..."
                    rows={3}
                    className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                  <Button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="bg-red-600 hover:bg-red-700 text-black font-bold tracking-wide px-6 rounded-md"
                  >
                    CANCEL
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !userStore}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Regional Transfer"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Confirm Regional Transfer</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                Please review all transfer details before submitting to OT Platform:
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Submitter Info */}
              <div>
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Submitter Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white font-medium">{submittedByName}</span>
                  
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white font-medium">{submittedByEmail}</span>
                  
                  <span className="text-gray-400">Store:</span>
                  <span className="text-white font-medium">{userStore}</span>
                  
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white font-medium">{submittedDate}</span>
                </div>
              </div>

              {/* Product Details */}
              <div>
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Product Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-400">Product Number:</span>
                  <span className="text-white font-medium">{formData.productNumber}</span>
                  
                  <span className="text-gray-400">Description:</span>
                  <span className="text-white font-medium">{formData.productDescription}</span>
                  
                  <span className="text-gray-400">Quantity:</span>
                  <span className="text-white font-medium">{formData.quantity}</span>
                </div>
              </div>

              {/* Transport Details */}
              <div>
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Transport Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-400">Method:</span>
                  <span className="text-white font-medium">
                    {formData.transportMethod === "PAM_TRANSPORT" && "PAM Transport"}
                    {formData.transportMethod === "CENTRAL_TRANSPORT" && "Central Transport"}
                    {formData.transportMethod === "CUSTOM" && `Custom: ${formData.transportCustomCarrier}`}
                  </span>
                  
                  <span className="text-gray-400">Who Pays:</span>
                  <span className="text-white font-medium">{formData.costResponsibility}</span>
                </div>
              </div>

              {/* Transfer Routing */}
              <div>
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Transfer Routing</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white font-medium">
                    {formData.transferType === "cross_plant" ? "Cross-Plant Transfer" : "Plant-to-Store Transfer"}
                  </span>
                  
                  <span className="text-gray-400">Source Plant:</span>
                  <span className="text-white font-medium">{formData.sourcePlant}</span>
                  
                  <span className="text-gray-400">Target Store:</span>
                  <span className="text-white font-medium">{formData.targetStore}</span>
                  
                  {formData.transferType === "cross_plant" && formData.targetPlant && (
                    <>
                      <span className="text-gray-400">Target Plant:</span>
                      <span className="text-white font-medium">{formData.targetPlant}</span>
                    </>
                  )}
                </div>
              </div>
              
              {formData.notes && (
                <div>
                  <h4 className="text-sm font-semibold text-blue-400 mb-2">Notes</h4>
                  <p className="text-white text-sm bg-slate-800 p-2 rounded">{formData.notes}</p>
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmedSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmitting ? "Submitting..." : "Confirm & Submit to OT Platform"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
