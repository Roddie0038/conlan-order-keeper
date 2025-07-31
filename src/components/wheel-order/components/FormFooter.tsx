
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";

interface FormFooterProps {
  isSubmitting: boolean;
  recipientCount?: number;
}

export function FormFooter({ isSubmitting, recipientCount = 1 }: FormFooterProps) {
  const navigate = useNavigate();
  
  return (
    <CardFooter className="flex justify-end gap-4 pb-6 px-6 border-t border-gray-100 pt-6">
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => navigate('/dashboard')}
        className="border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-400 transition-all duration-200"
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting || recipientCount === 0}
        className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-medium transition-all duration-200 hover:shadow-md"
      >
        {isSubmitting ? "Submitting..." : recipientCount === 0 ? "Add Recipients to Submit" : "Submit Order"}
      </Button>
    </CardFooter>
  );
}
