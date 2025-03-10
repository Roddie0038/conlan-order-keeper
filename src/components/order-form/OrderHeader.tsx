
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const OrderHeader = () => {
  return (
    <Tabs defaultValue="order-form" className="w-full">
      <TabsList className="grid w-full grid-cols-1">
        <TabsTrigger 
          value="order-form" 
          className="font-bold text-sm rounded-3xl text-[#101010] bg-yellow-300 hover:bg-yellow-200"
        >
          For any orders exceeding 50 retread tires, please submit an MTO order to guarantee we can fulfill the complete request. If you're ordering more than 50 new tires, you can place the order here.
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
