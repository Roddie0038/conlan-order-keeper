import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
export default function CrossDock() {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  return <div className="min-h-screen bg-emerald-400 hover:bg-emerald-300">
      <main className="container py-8">
        <div className="p-6 rounded-lg shadow-lg max-w-2xl mx-auto bg-gray-500 hover:bg-gray-400">
          <h1 className="text-2xl mb-6 font-extrabold mx-[18px] my-0">Cross Dock Paperwork</h1>
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-center mb-4 text-slate-50 font-bold py-[44px] text-3xl">
              Click below to access the printable Cross Dock documentation.
            </p>
            
            <a href="https://docs.google.com/document/d/1n6SYt0gILrQ1CI3Y2deM_6_8B7dzUIrfJ4pUrKER3GI/edit?tab=t.0" target="_blank" rel="noopener noreferrer" className="w-full max-w-md">
              <Button className="w-full bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white">
                <FileText className="mr-2 h-5 w-5" />
                Open Cross Dock Form
              </Button>
            </a>
          </div>
        </div>
      </main>
    </div>;
}