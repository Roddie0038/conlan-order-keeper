
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoginBackground } from "@/components/login/LoginBackground";
import { LoginCard } from "@/components/login/LoginCard";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      console.log("User already authenticated, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
    setIsSubmitting(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Handle remember me functionality
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberMe');
        }
        
        toast({
          title: "Login successful",
          description: "Welcome back to the Ordering Platform!",
          className: "bg-green-50 border-green-200",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Login failed",
          description: result.error || "Invalid email or password. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render if user is already authenticated
  if (!loading && user) {
    return null;
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/lovable-uploads/00512613-69c8-42e6-af5e-e9d8e3c555ed.png')`
      }}
    >
      <LoginCard onLogin={handleLogin} isSubmitting={isSubmitting} />
    </div>
  );
}
