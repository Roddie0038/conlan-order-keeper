
import { Card } from "@/components/ui/card";

export function ApprovalInfoCard() {
  return (
    <Card className="bg-slate-800/50 border-slate-600 p-6">
      <p className="text-gray-300 text-center leading-relaxed">
        Approval is required from{" "}
        <span className="text-amber-400 font-semibold">Steve Bobovnik</span>,{" "}
        <span className="text-amber-400 font-semibold">Brad Perry</span>, or{" "}
        <span className="text-amber-400 font-semibold">Greg Williamson</span>{" "}
        for any tread not listed below.
      </p>
    </Card>
  );
}
