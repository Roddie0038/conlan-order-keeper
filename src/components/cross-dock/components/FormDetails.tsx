
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { stores } from "@/components/order-form/formConfig";

interface FormDetailsProps {
  date: string;
  setDate: (date: string) => void;
  fromStore: string;
  setFromStore: (store: string) => void;
  toStore: string;
  setToStore: (store: string) => void;
  receiverNo: string;
  setReceiverNo: (receiver: string) => void;
}

export const FormDetails = ({
  date,
  setDate,
  fromStore,
  setFromStore,
  toStore,
  setToStore,
  receiverNo,
  setReceiverNo
}: FormDetailsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Date:</label>
        <Input 
          type="date" 
          value={date} 
          onChange={e => setDate(e.target.value)} 
          className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Receiver No (MaddenCo):</label>
        <Input 
          type="text" 
          value={receiverNo} 
          onChange={e => setReceiverNo(e.target.value)} 
          placeholder="Enter receiver number"
          className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">FROM Store:</label>
        <Select value={fromStore} onValueChange={setFromStore}>
          <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm">
            <SelectValue placeholder="Select store" />
          </SelectTrigger>
          <SelectContent>
            {stores.map(store => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">TO Store:</label>
        <Select value={toStore} onValueChange={setToStore}>
          <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm">
            <SelectValue placeholder="Select store" />
          </SelectTrigger>
          <SelectContent>
            {stores.map(store => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
