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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const usernames = [
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <img
            src="/lovable-uploads/be43b300-3ff2-43c1-b522-e326db67e4e1.png"
            alt="Conlan Tire Logo"
            className="mx-auto h-24 object-contain"
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome</h2>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Store
                  </label>
                  <Select
                    value={username}
                    onValueChange={(value) => setUsername(value)}
                  >
                    <SelectTrigger className="w-full">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <div className="text-center p-4">
              <p className="text-gray-600">
                Please contact your administrator to create a new account.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                For security reasons, new accounts can only be created by authorized personnel.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}