import { CrossDockForm } from "@/components/cross-dock/CrossDockForm";

const CrossDockPaperwork = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-4">Cross Dock Paperwork</h1>
      <p className="text-center mb-8 text-gray-600">
        This form is designed for transferring tires or materials to another store using the Warehouse as a cross dock location
      </p>
      <CrossDockForm />
    </div>
  );
};

export default CrossDockPaperwork;