
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VehicleInfoFieldsProps {
  vehicleMake: string;
  vinOrUnit: string;
  modelYear: string;
  purchaseDate: string;
  wheelPosition: string;
  onFieldChange: (field: string, value: string) => void;
}

export function VehicleInfoFields({
  vehicleMake,
  vinOrUnit,
  modelYear,
  purchaseDate,
  wheelPosition,
  onFieldChange
}: VehicleInfoFieldsProps) {
  const wheelPositions = [
    { value: "LF", label: "LF - Left Front" },
    { value: "RF", label: "RF - Right Front" },
    { value: "LR", label: "LR - Left Rear" },
    { value: "RR", label: "RR - Right Rear" }
  ];

  return (
    <>
      {/* Vehicle Make */}
      <div>
        <Label htmlFor="vehicleMake">Vehicle Make *</Label>
        <Input
          id="vehicleMake"
          value={vehicleMake}
          onChange={(e) => onFieldChange("vehicleMake", e.target.value)}
          placeholder="e.g., Ford, Chevrolet, International"
          required
        />
      </div>

      {/* VIN or Unit # */}
      <div>
        <Label htmlFor="vinOrUnit">VIN or Unit # *</Label>
        <Input
          id="vinOrUnit"
          value={vinOrUnit}
          onChange={(e) => onFieldChange("vinOrUnit", e.target.value)}
          placeholder="Vehicle identification or unit number"
          required
        />
      </div>

      {/* Model Year */}
      <div>
        <Label htmlFor="modelYear">Model Year *</Label>
        <Input
          id="modelYear"
          type="number"
          min="1990"
          max="2030"
          value={modelYear}
          onChange={(e) => onFieldChange("modelYear", e.target.value)}
          placeholder="e.g., 2020"
          required
        />
      </div>

      {/* Purchase Date */}
      <div>
        <Label htmlFor="purchaseDate">Purchase Date *</Label>
        <Input
          id="purchaseDate"
          type="date"
          value={purchaseDate}
          onChange={(e) => onFieldChange("purchaseDate", e.target.value)}
          required
        />
      </div>

      {/* Wheel Position */}
      <div>
        <Label htmlFor="wheelPosition">Wheel Position Removed *</Label>
        <Select value={wheelPosition} onValueChange={(value) => onFieldChange("wheelPosition", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select wheel position" />
          </SelectTrigger>
          <SelectContent>
            {wheelPositions.map((position) => (
              <SelectItem key={position.value} value={position.value}>
                {position.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
