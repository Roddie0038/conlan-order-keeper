
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AllStoreOrders } from "@/components/pending-orders/AllStoreOrders";

export default function AllOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Shield className="mr-2 h-6 w-6 text-red-500" />
              <h2 className="text-xl font-bold">Access Restricted</h2>
            </div>
            <p className="mb-4">
              This page is only accessible to administrators.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-6 mb-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold">All Store Orders</h1>
          <p className="text-blue-100">View and manage all orders across all stores</p>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <AllStoreOrders />
        </div>
      </main>
    </div>
  );
}
