
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PlantSelect } from "./PlantSelect";
import { StoreSelect } from "./StoreSelect";
import { PasswordInput } from "./PasswordInput";
import { LoginButton } from "./LoginButton";

interface LoginFormProps {
  usernames: string[];
}

export const LoginForm = ({ usernames }: LoginFormProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { selectedPlant, setSelectedPlant } = usePlant();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (login(username, password, selectedPlant)) {
        toast({
          title: "Login successful",
          description: `Welcome back to ${selectedPlant} Store Order System!`,
          className: "bg-green-50 border-green-200",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Login failed",
          description: "Invalid username or password. Please try again.",
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
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <PlantSelect 
          selectedPlant={selectedPlant} 
          setSelectedPlant={setSelectedPlant} 
        />
        
        <StoreSelect 
          username={username} 
          setUsername={setUsername} 
          stores={usernames} 
        />
        
        <PasswordInput 
          password={password} 
          setPassword={setPassword} 
        />
      </div>
      
      <LoginButton isLoading={isLoading} />
    </form>
  );
};
