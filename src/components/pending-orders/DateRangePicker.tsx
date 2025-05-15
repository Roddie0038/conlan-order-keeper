
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

interface DatePickerWithRangeProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({ date, setDate }: DatePickerWithRangeProps) {
  return (
    <div className="grid gap-2">
      <Calendar
        initialFocus
        mode="range"
        defaultMonth={date?.from}
        selected={date}
        onSelect={setDate}
        numberOfMonths={2}
        className="border rounded-md p-3"
      />
      <div className="flex items-center justify-between px-3 pb-3">
        <Button
          variant="outline"
          className="h-8"
          onClick={() => setDate(undefined)}
        >
          Clear
        </Button>
        <Button
          className="h-8"
          onClick={() => {
            // Set date range to last 7 days
            const today = new Date();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(today.getDate() - 7);
            setDate({ from: sevenDaysAgo, to: today });
          }}
        >
          Last 7 Days
        </Button>
      </div>
    </div>
  );
}
