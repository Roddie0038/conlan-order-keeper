import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Truck, ArrowLeft } from "lucide-react";
import { CrossDockRequestForm } from "@/components/cross-dock-request/CrossDockRequestForm";
import { CrossDockItemsTable } from "@/components/cross-dock-request/CrossDockItemsTable";
import { supabase } from "@/integrations/supabase/client";

export interface CrossDockItem {
  id: string;
  product_number: string;
  description: string;
  quantity: number;
}

export default function CrossDockRequest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentPlant } = usePlant();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    requesting_store: user?.store || "",
    sending_store: "",
    desired_delivery_date: "",
    notes: "",
    submitted_by_name: user?.name || "",
  });

  const [items, setItems] = useState<CrossDockItem[]>([]);

  const handleAddItem = (item: Omit<CrossDockItem, "id">) => {
    setItems([...items, { ...item, id: crypto.randomUUID() }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof CrossDockItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.requesting_store || !formData.sending_store) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select both requesting and sending stores.",
      });
      return;
    }

    if (formData.requesting_store === formData.sending_store) {
      toast({
        variant: "destructive",
        title: "Invalid Selection",
        description: "Requesting and sending stores cannot be the same.",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "No Items",
        description: "Please add at least one item to the request.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      // @ts-ignore - Function exists but types not yet regenerated
      const response = await supabase.functions.invoke("submit-cross-dock-request", {
        body: {
          requestData: {
            ...formData,
            plant: currentPlant,
          },
          items: items.map(({ id, ...item }) => item),
        },
      });

      if (response.error) {
        throw response.error;
      }

      toast({
        title: "Request Submitted",
        description: `Cross-dock request ${response.data.request.request_number} has been submitted successfully.`,
      });

      // Reset form
      setFormData({
        requesting_store: user?.store || "",
        sending_store: "",
        desired_delivery_date: "",
        notes: "",
        submitted_by_name: user?.name || "",
      });
      setItems([]);

      // Navigate to requests list after 1 second
      setTimeout(() => {
        navigate("/cross-dock-requests");
      }, 1000);
    } catch (error: any) {
      console.error("Error submitting request:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Failed to submit cross-dock request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <Truck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Cross-Dock Request</h1>
            <p className="text-muted-foreground mt-1">
              Request tires from another store via warehouse cross-dock
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <CrossDockRequestForm
            formData={formData}
            onFormChange={setFormData}
            userStore={user?.store || ""}
            isAdmin={user?.isAdmin || false}
          />
        </Card>

        <Card className="p-6">
          <CrossDockItemsTable
            items={items}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onUpdateItem={handleUpdateItem}
          />
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || items.length === 0}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </div>
    </div>
  );
}