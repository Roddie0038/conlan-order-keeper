
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
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-4xl font-bold underline">Cross Dock Form</h2>
        <p className="text-sm">
          This form is used when sending tires/material to another store using the Warehouse as a cross dock location.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <p className="font-bold mb-1">Date:</p>
          <p className="border p-2">{format(new Date(), 'MM/dd/yyyy')}</p>
        </div>

        <div>
          <p className="font-bold mb-1">Transfer Work Order Number:</p>
          <p className="border p-2">{values.transferWorkOrderNumber || '________________'}</p>
        </div>

        <div>
          <p className="font-bold mb-1">FROM Store:</p>
          <p className="border p-2">{storeFrom}</p>
        </div>

        <div>
          <p className="font-bold mb-1">TO Store:</p>
          <p className="border p-2">{values.crossDockDestination}</p>
        </div>
        
        <div>
          <p className="font-bold mb-1">Trailer Number:</p>
          <p className="border p-2">{values.trailerNumber || '________________'}</p>
        </div>
        
        <div>
          <p className="font-bold mb-1">ETA Date:</p>
          <p className="border p-2">
            {values.etaDate ? format(new Date(values.etaDate), 'MM/dd/yyyy') : '________________'}
          </p>
        </div>
      </div>

      <div>
        <p className="font-bold mb-2">Product Details:</p>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-100 text-left">Product Code</th>
              <th className="border p-2 bg-gray-100 text-left">Description</th>
              <th className="border p-2 bg-gray-100 text-left">Qty</th>
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

      <div className="mt-8 p-4 border-t">
        <div className="flex justify-between">
          <div>
            <p className="font-bold">Sender Signature:</p>
            <div className="border-b border-black w-48 h-8 mt-6"></div>
          </div>
          <div>
            <p className="font-bold">Receiver Signature:</p>
            <div className="border-b border-black w-48 h-8 mt-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
