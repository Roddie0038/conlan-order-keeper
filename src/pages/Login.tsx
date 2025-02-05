import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const usernames = [
  "Conlan97",
  "Fort Worth22",
  "Grand Prairie27",
  "San Antonio29",
  "Oklahoma30",
  "Little Rock32",
  "Kansas33",
  "Laredo35",
  "Tulsa36",
  "Austin39",
];

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate("/pending-orders");
    } else {
      toast({
        title: "Error",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/lovable-uploads/33922cc2-73cb-40a4-8ba9-c0b505c7d9f0.png')",
      }}
    >
      <div className="max-w-md w-full space-y-8 p-8 bg-black/70 backdrop-blur-sm rounded-lg shadow-2xl border border-white/20">
        <div className="text-center">
          <img
            src="/lovable-uploads/b6f875b5-dba1-457d-b748-3b6e0578f676.png"
            alt="Conlan Tire Logo"
            className="mx-auto h-24 object-contain drop-shadow-lg"
          />
          <h2 className="mt-6 text-3xl font-bold text-white">Sign in</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Select Store
              </label>
              <Select
                value={username}
                onValueChange={(value) => setUsername(value)}
              >
                <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select your store" />
                </SelectTrigger>
                <SelectContent>
                  {usernames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Password
              </label>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}