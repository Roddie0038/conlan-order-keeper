
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal";

interface SupabaseLoginFormProps {
  onLogin: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  isSubmitting: boolean;
}

export const SupabaseLoginForm = ({ onLogin, isSubmitting }: SupabaseLoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && savedRememberMe) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && !isSubmitting) {
      await onLogin(email, password, rememberMe);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="relative block w-full px-3 py-3 border-0 rounded-xl text-gray-900 placeholder-gray-500 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 shadow-lg"
            placeholder="Email address"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="text-sm font-medium text-white/90">
              Password
            </label>
            <button 
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-xs text-blue-300 hover:text-blue-200 transition-colors focus:outline-none focus:underline"
              disabled={isSubmitting}
            >
              Forgot Password?
            </button>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="relative block w-full px-3 py-3 border-0 rounded-xl text-gray-900 placeholder-gray-500 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 shadow-lg"
            placeholder="Password"
            disabled={isSubmitting}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="remember-me"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
        <label
          htmlFor="remember-me"
          className="text-sm text-white/90 cursor-pointer select-none"
        >
          Remember me for faster login
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting || !email || !password}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Signing in...
            </>
          ) : (
            'Sign in to Dashboard'
          )}
        </button>
      </div>

      <div className="text-center">
        <p className="text-white/70 text-sm mb-3">
          Don't have an account?
        </p>
        <Link 
          to="/signup" 
          className="w-full inline-flex justify-center items-center py-3 px-4 border border-white/30 rounded-xl text-white/90 hover:text-white hover:border-white/50 hover:bg-white/10 transition-all duration-200 font-medium backdrop-blur-sm"
        >
          Create Account
        </Link>
      </div>

      <ForgotPasswordModal 
        isOpen={showForgotModal} 
        onClose={() => setShowForgotModal(false)} 
      />
    </form>
  );
};
