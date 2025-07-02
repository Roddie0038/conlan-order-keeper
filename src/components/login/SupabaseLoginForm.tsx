
import React, { useState } from "react";

interface SupabaseLoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  isSubmitting: boolean;
}

export const SupabaseLoginForm = ({ onLogin, isSubmitting }: SupabaseLoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && !isSubmitting) {
      await onLogin(email, password);
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
          <label htmlFor="password" className="sr-only">
            Password
          </label>
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
    </form>
  );
};
