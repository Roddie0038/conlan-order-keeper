
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "./order-form-schema";
import { format } from "date-fns";
import { stores } from "./formConfig";

interface CrossDockPaperworkFormProps {
  form: UseFormReturn<OrderFormValues>;
}

export function CrossDockPaperworkForm({ form }: CrossDockPaperworkFormProps) {
  const values = form.getValues();
  
  // Find store name from store ID
  const storeFrom = stores.find(s => s.id === values.store)?.name || values.store;
  const storeTo = values.crossDockDestination || '';
  
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white">
      {/* Header with black/orange color scheme */}
      <div className="text-center space-y-2 mb-8 border-b-4 border-orange-500 pb-4">
        <h2 className="text-4xl font-bold bg-black text-white py-2">CROSS DOCK FORM</h2>
        <p className="text-sm italic">
          This form must be attached to all cross dock materials
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <p className="font-bold mb-1 text-gray-700">Date:</p>
          <p className="border p-2 bg-gray-50">{format(new Date(), 'MM/dd/yyyy')}</p>
        </div>

        <div>
          <p className="font-bold mb-1 text-gray-700">Transfer Work Order Number:</p>
          <p className="border p-2 bg-gray-50">{values.transferWorkOrderNumber || '________________'}</p>
        </div>

        <div>
          <p className="font-bold mb-1 text-gray-700">FROM Store:</p>
          <p className="border p-2 bg-gray-50">{storeFrom}</p>
        </div>

        <div>
          <p className="font-bold mb-1 text-gray-700">TO Store:</p>
          <p className="border p-2 bg-gray-50">{storeTo}</p>
        </div>
        
        <div>
          <p className="font-bold mb-1 text-gray-700">Trailer Number:</p>
          <p className="border p-2 bg-gray-50">{values.trailerNumber || '________________'}</p>
        </div>
        
        <div>
          <p className="font-bold mb-1 text-gray-700">ETA Date:</p>
          <p className="border p-2 bg-gray-50">
            {values.etaDate ? format(new Date(values.etaDate), 'MM/dd/yyyy') : '________________'}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <p className="font-bold mb-2 text-gray-700 bg-orange-100 p-2">Product Details:</p>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-black text-white">
              <th className="border p-2 text-left">Product Code</th>
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-left">Qty</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">{values.productNumber}</td>
              <td className="border p-2">{values.description}</td>
              <td className="border p-2">{values.quantity}</td>
            </tr>
            {/* Empty rows for additional items */}
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                <td className="border p-2 h-10"></td>
                <td className="border p-2"></td>
                <td className="border p-2"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 p-4 border-t border-orange-500">
        <div className="flex justify-between">
          <div>
            <p className="font-bold text-gray-700">Sender Signature:</p>
            <div className="border-b border-black w-48 h-8 mt-6"></div>
          </div>
          <div>
            <p className="font-bold text-gray-700">Receiver Signature:</p>
            <div className="border-b border-black w-48 h-8 mt-6"></div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Form Version: CDOF-1.2</p>
      </div>
    </div>
  );
}
