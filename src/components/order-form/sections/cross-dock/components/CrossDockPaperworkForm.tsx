
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../../order-form-schema";
import { format } from "date-fns";
import { useOTStores } from "@/integrations/ot-platform/hooks/useOTStores";

interface CrossDockPaperworkFormProps {
  form: UseFormReturn<OrderFormValues>;
}

export function CrossDockPaperworkForm({ form }: CrossDockPaperworkFormProps) {
  const values = form.getValues();
  const { data: stores = [] } = useOTStores();

  const storeFrom = stores.find((s) => s.store_number === values.store)?.store_name || values.store;
  const storeTo = stores.find((s) => s.store_number === values.crossDockDestination)?.store_name || values.crossDockDestination;

  return (
    <div className="font-sans px-8 py-6 max-w-4xl mx-auto bg-white text-black">
      <h2 className="text-center text-2xl font-bold border-b-2 border-black pb-2 mb-4">
        Cross Dock Transfer Form
      </h2>

      <p className="text-center text-sm text-gray-600 mb-8">
        Use this form when transferring material between stores using a warehouse as the dock point.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <strong className="block mb-1">Date:</strong>
          <div className="border border-black p-2 min-h-[2rem]">
            {values.dateReceived ? format(new Date(values.dateReceived), "MM/dd/yyyy") : format(new Date(), "MM/dd/yyyy")}
          </div>
        </div>
        <div>
          <strong className="block mb-1">Receiver No (MaddenCo):</strong>
          <div className="border border-black p-2 min-h-[2rem]">{values.receiverNo || ""}</div>
        </div>
        <div>
          <strong className="block mb-1">FROM Store:</strong>
          <div className="border border-black p-2 min-h-[2rem]">{storeFrom}</div>
        </div>
        <div>
          <strong className="block mb-1">TO Store:</strong>
          <div className="border border-black p-2 min-h-[2rem]">{storeTo}</div>
        </div>
        <div>
          <strong className="block mb-1">ETA Date:</strong>
          <div className="border border-black p-2 min-h-[2rem]">
            {values.etaDate ? format(new Date(values.etaDate), "MM/dd/yyyy") : ""}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <strong className="block mb-2">Product Details:</strong>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-black p-2 text-left w-1/4">Product Code</th>
              <th className="border border-black p-2 text-left w-2/4">Description</th>
              <th className="border border-black p-2 text-left w-1/4">Quantity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2">{values.productNumber || ""}</td>
              <td className="border border-black p-2">{values.description || ""}</td>
              <td className="border border-black p-2">{values.quantity || ""}</td>
            </tr>
            {[...Array(3)].map((_, i) => (
              <tr key={i}>
                <td className="border border-black p-4"></td>
                <td className="border border-black p-4"></td>
                <td className="border border-black p-4"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-12">
        <div className="w-5/12">
          <strong className="block mb-2">Sender Signature:</strong>
          <div className="border-b-2 border-black h-8 mb-1"></div>
        </div>
        <div className="w-5/12">
          <strong className="block mb-2">Receiver Signature:</strong>
          <div className="border-b-2 border-black h-8 mb-1"></div>
        </div>
      </div>
    </div>
  );
}
