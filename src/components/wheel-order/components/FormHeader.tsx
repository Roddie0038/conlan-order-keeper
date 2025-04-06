
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Disc } from "lucide-react";

export function FormHeader() {
  return (
    <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-lg">
      <div className="flex items-center gap-3">
        <div className="bg-white p-1.5 rounded-full">
          <Disc size={28} className="text-gray-800" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-white">WHEEL POWDER COATING ORDER</CardTitle>
      </div>
      <CardDescription className="text-gray-300 font-medium">
        Complete the form below to submit a wheel powder coating order
      </CardDescription>
    </CardHeader>
  );
}
