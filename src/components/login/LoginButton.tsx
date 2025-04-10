
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoginButtonProps {
  isLoading: boolean;
}

export const LoginButton = ({ isLoading }: LoginButtonProps) => {
  return (
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
  );
};
