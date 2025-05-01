
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "./order-form-schema";
import { format } from "date-fns";
import { stores } from "./formConfig";

interface CrossDockPaperworkFormProps {
  form: UseFormReturn<OrderFormValues>;
}

export function CrossDockPaperworkForm({ form }: CrossDockPaperworkFormProps) {
  const values = form.getValues();

  const storeFrom = stores.find((s) => s.id === values.store)?.name || values.store;
  const storeTo = stores.find((s) => s.id === values.crossDockDestination)?.name || values.crossDockDestination;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", fontSize: "1.75rem", borderBottom: "2px solid black", paddingBottom: "0.5rem" }}>
        Cross Dock Transfer Form
      </h2>

      <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#666" }}>
        Use this form when transferring material between stores using a warehouse as the dock point.
      </p>

      <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <strong>Date:</strong>
          <div style={{ border: "1px solid black", padding: "0.5rem" }}>
            {format(new Date(values.dateReceived), "MM/dd/yyyy")}
          </div>
        </div>
        <div>
          <strong>Receiver No (MaddenCo):</strong>
          <div style={{ border: "1px solid black", padding: "0.5rem" }}>{values.receiverNo}</div>
        </div>
        <div>
          <strong>FROM Store:</strong>
          <div style={{ border: "1px solid black", padding: "0.5rem" }}>{storeFrom}</div>
        </div>
        <div>
          <strong>TO Store:</strong>
          <div style={{ border: "1px solid black", padding: "0.5rem" }}>{storeTo}</div>
        </div>
        <div>
          <strong>ETA Date:</strong>
          <div style={{ border: "1px solid black", padding: "0.5rem" }}>
            {values.etaDate ? format(new Date(values.etaDate), "MM/dd/yyyy") : ""}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <strong>Product Details:</strong>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid black", padding: "0.5rem" }}>Product Code</th>
              <th style={{ border: "1px solid black", padding: "0.5rem" }}>Description</th>
              <th style={{ border: "1px solid black", padding: "0.5rem" }}>Quantity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid black", padding: "0.5rem" }}>{values.productNumber}</td>
              <td style={{ border: "1px solid black", padding: "0.5rem" }}>{values.description}</td>
              <td style={{ border: "1px solid black", padding: "0.5rem" }}>{values.quantity}</td>
            </tr>
            {[...Array(3)].map((_, i) => (
              <tr key={i}>
                <td style={{ border: "1px solid black", padding: "1.5rem" }}></td>
                <td style={{ border: "1px solid black", padding: "1.5rem" }}></td>
                <td style={{ border: "1px solid black", padding: "1.5rem" }}></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
        <div>
          <strong>Sender Signature:</strong>
          <div style={{ borderBottom: "2px solid black", width: "250px", height: "2rem", marginTop: "1rem" }}></div>
        </div>
        <div>
          <strong>Receiver Signature:</strong>
          <div style={{ borderBottom: "2px solid black", width: "250px", height: "2rem", marginTop: "1rem" }}></div>
        </div>
      </div>
    </div>
  );
}
