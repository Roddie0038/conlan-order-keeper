import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOTStores } from "@/integrations/ot-platform/hooks/useOTStores";

interface CrossDockRequestFormProps {
  formData: {
    requesting_store: string;
    sending_store: string;
    desired_delivery_date: string;
    notes: string;
    submitted_by_name: string;
  };
  onFormChange: (data: any) => void;
  userStore: string;
  isAdmin: boolean;
}

export function CrossDockRequestForm({
  formData,
  onFormChange,
  userStore,
  isAdmin,
}: CrossDockRequestFormProps) {
  const { data: storesData = [], isLoading } = useOTStores();
  
  const handleChange = (field: string, value: string) => {
    onFormChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Request Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="requesting_store">Requesting Store *</Label>
            {isAdmin ? (
              <Select
                value={formData.requesting_store}
                onValueChange={(value) => handleChange("requesting_store", value)}
              >
                <SelectTrigger id="requesting_store">
                  <SelectValue placeholder="Select requesting store" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="" disabled>Loading stores...</SelectItem>
                  ) : (
                    storesData.map((store) => (
                      <SelectItem key={store.store_number} value={store.store_number}>
                        {store.store_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="requesting_store"
                value={userStore}
                disabled
                className="bg-muted"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sending_store">Sending Store *</Label>
            <Select
              value={formData.sending_store}
              onValueChange={(value) => handleChange("sending_store", value)}
            >
              <SelectTrigger id="sending_store">
                <SelectValue placeholder="Select sending store" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="" disabled>Loading stores...</SelectItem>
                ) : (
                  storesData
                    .filter((store) => store.store_number !== formData.requesting_store)
                    .map((store) => (
                      <SelectItem key={store.store_number} value={store.store_number}>
                        {store.store_name}
                      </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desired_delivery_date">Desired Delivery Date</Label>
            <Input
              id="desired_delivery_date"
              type="date"
              value={formData.desired_delivery_date}
              onChange={(e) => handleChange("desired_delivery_date", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="submitted_by_name">Your Name *</Label>
            <Input
              id="submitted_by_name"
              value={formData.submitted_by_name}
              onChange={(e) => handleChange("submitted_by_name", e.target.value)}
              placeholder="Enter your name"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Add any additional notes or special instructions..."
          rows={4}
        />
      </div>
    </div>
  );
}