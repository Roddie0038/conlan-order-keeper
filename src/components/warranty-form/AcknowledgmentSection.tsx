
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AcknowledgmentSectionProps {
  acknowledged: boolean;
  onCheckboxChange: (checked: boolean) => void;
  loading: boolean;
  onSubmit: () => void;
}

export function AcknowledgmentSection({ 
  acknowledged, 
  onCheckboxChange, 
  loading, 
  onSubmit 
}: AcknowledgmentSectionProps) {
  return (
    <>
      {/* Acknowledgment */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="acknowledged"
          checked={acknowledged}
          onCheckedChange={onCheckboxChange}
        />
        <Label htmlFor="acknowledged" className="text-sm">
          I understand credit is issued after plant approval (up to 2 weeks) *
        </Label>
      </div>

      {/* Submit Button */}
      <Button 
        onClick={onSubmit}
        disabled={loading || !acknowledged}
        className="w-full"
        size="lg"
      >
        {loading ? "Submitting..." : "Submit Warranty Claim"}
      </Button>
    </>
  );
}
