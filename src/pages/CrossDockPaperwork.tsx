import { Button } from "@/components/ui/button";

export default function CrossDockPaperwork() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            Cross Dock Paperwork
          </h1>
          <div className="text-center mb-8">
            <p className="text-gray-600">
              Access and print the Cross Dock form using the link below.
            </p>
            <Button
              className="mt-4"
              onClick={() => window.open('https://docs.google.com/document/d/1n6SYt0gILrQ1CI3Y2deM_6_8B7dzUIrfJ4pUrKER3GI/edit?tab=t.0', '_blank')}
            >
              Open Printable Document
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}