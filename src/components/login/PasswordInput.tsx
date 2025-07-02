
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal";

interface PasswordInputProps {
  password: string;
  setPassword: (value: string) => void;
}

export const PasswordInput = ({ password, setPassword }: PasswordInputProps) => {
  const [showForgotModal, setShowForgotModal] = useState(false);
  
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-gray-200">
          Password
        </label>
        <button 
          type="button"
          onClick={() => setShowForgotModal(true)}
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
      
      <ForgotPasswordModal 
        isOpen={showForgotModal} 
        onClose={() => setShowForgotModal(false)} 
      />
    </div>
  );
};
