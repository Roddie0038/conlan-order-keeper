import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpCircle, Loader2, Building, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const usernames = [
  "Conlan97", "Fort Worth22", "Grand Prairie27", "Houston28", "San Antonio29", 
  "Oklahoma30", "Little Rock32", "Kansas33", "Laredo35", "Tulsa36", "Austin39",
  "Miami 3", "Pompano Beach7", "Fort Myers9", "Jacksonville2", "Ocala5", 
  "Tallahassee15", "Mulberry99", "Orlando4", "Tampa6", "Vero Beach21", 
  "Sarasota23", "Romulus098", "Toledo8", "Detroit11", "Grand Rapids13", 
  "Cleveland18", "Chicago41", "Grand Prairie 97", "Romulus 98", "Mulberry 99"
];

const plants = [
  { value: "Grand Prairie 97", label: "Grand Prairie 97" },
  { value: "Romulus 098", label: "Romulus 098" },
  { value: "Mulberry 99", label: "Mulberry 99" }
];

export default function Login() {
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
          description: `Welcome back to ${selectedPlant} Order Tracking!`,
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-slate-800 relative overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="wheel-animation absolute top-[10%] left-[15%] w-40 h-40 rounded-full border-4 border-blue-400/20 opacity-30 animate-spin-slow"></div>
        <div className="wheel-animation absolute bottom-[20%] right-[10%] w-28 h-28 rounded-full border-4 border-blue-300/30 opacity-20 animate-spin-slow-reverse"></div>
        <div className="tire-track absolute top-[30%] right-[5%] w-64 h-8 bg-blue-400/10 rounded-full transform -rotate-45"></div>
        <div className="tire-track absolute bottom-[15%] left-[5%] w-64 h-8 bg-blue-400/10 rounded-full transform rotate-45"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 p-8 backdrop-blur-sm shadow-2xl border border-white/20 rounded-3xl bg-zinc-700/80 hover:bg-zinc-600/80 transition-all duration-300 z-10">
        <div className="text-center">
          <div className="relative mx-auto h-24 w-auto mb-2 transition-all duration-300 hover:scale-105">
            <img src="/lovable-uploads/b6f875b5-dba1-457d-b748-3b6e0578f676.png" alt="Conlan Tire Logo" className="h-full object-contain drop-shadow-lg rounded-2xl animate-float" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-zinc-100">Order Tracking System</h1>
          <p className="mt-2 text-zinc-300">Manage inventory and orders with ease</p>
        </div>
        
        <Alert className="border-amber-600 bg-amber-50/20 text-amber-100">
          <AlertTriangle className="h-4 w-4 text-amber-400 mr-2" />
          <AlertDescription className="text-sm">
            Please note: The login screen has been updated. Users must now select the correct warehouse before placing orders. Make sure to review your selection to ensure accurate processing.
          </AlertDescription>
        </Alert>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-200">
                  Select Plant
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-0">
                        <HelpCircle className="h-4 w-4 text-gray-300" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-800 text-white">
                      <p>Select the plant you're working with</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={selectedPlant} onValueChange={value => setSelectedPlant(value as any)}>
                <SelectTrigger className="w-full bg-white/10 border-white/20 text-white focus:ring-offset-blue-500">
                  <div className="flex items-center gap-2">
                    <Building size={16} />
                    <SelectValue placeholder="Select plant" />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {plants.map(plant => (
                    <SelectItem key={plant.value} value={plant.value}>
                      {plant.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-200">
                  Select Store
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-0">
                        <HelpCircle className="h-4 w-4 text-gray-300" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-800 text-white">
                      <p>Select your store from the dropdown</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={username} onValueChange={value => setUsername(value)}>
                <SelectTrigger className="w-full bg-white/10 border-white/20 text-white focus:ring-offset-blue-500">
                  <SelectValue placeholder="Select your store" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {usernames.map(name => <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-200">
                  Password
                </label>
                <button 
                  type="button"
                  onClick={() => toast({ 
                    title: "Password Reset", 
                    description: "Please contact your administrator to reset your password." 
                  })}
                  className="text-xs text-blue-300 hover:text-blue-200 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <Input 
                type="password" 
                placeholder="Enter your password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:ring-blue-500" 
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="relative w-full bg-blue-600 hover:bg-blue-700 text-white py-3 overflow-hidden group"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </div>
            ) : (
              <>
                <span className="relative z-10">Sign in</span>
                <span className="absolute bottom-0 left-0 w-0 h-1 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
              </>
            )}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-300">
            © {new Date().getFullYear()} Conlan Tire. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
