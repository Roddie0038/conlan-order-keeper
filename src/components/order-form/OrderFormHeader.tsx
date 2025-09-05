
export function OrderFormHeader() {
  return (
    <div className="border-b border-gray-200 pb-5 mb-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">New Order Form</h2>
      <p 
        className="mt-2 text-gray-600 dark:text-gray-400"
        data-editable="form-description"
        data-editable-group="order-form-header"
        data-live-edit="true"
        data-live-targets="background,color,border-radius"
      >
        Please fill out all required fields
      </p>
    </div>
  );
}
