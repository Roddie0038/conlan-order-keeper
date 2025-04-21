
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  
  return (
    <div className="container py-12 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Tulsa 36 Order Tracking</CardTitle>
          <CardDescription>View orders and track inventory for Tulsa 36 location</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button 
            className="w-full flex items-center justify-between" 
            onClick={() => navigate("/order-management")}
            size="lg"
          >
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              View Tulsa 36 Orders (April 18)
            </div>
            <ArrowRight className="h-5 w-5" />
          </Button>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
