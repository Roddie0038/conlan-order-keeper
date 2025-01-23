import { OrderForm } from "@/components/OrderForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-primary-foreground py-6 mb-8">
        <div className="container">
          <h1 className="text-3xl font-bold text-center">Conlan Tire GP Orders</h1>
        </div>
      </header>
      
      <main className="container">
        <OrderForm />
      </main>
      
      <footer className="mt-16 py-6 text-center text-gray-600">
        <p>© {new Date().getFullYear()} Conlan Tire. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;