
import React from "react";
import { LoginHeader } from "./LoginHeader";
import { SupabaseLoginForm } from "./SupabaseLoginForm";
import { LoginFooter } from "./LoginFooter";

interface LoginCardProps {
  onLogin: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  isSubmitting: boolean;
}

export const LoginCard = ({ onLogin, isSubmitting }: LoginCardProps) => {
  return (
    <div className="max-w-md w-full space-y-8 p-8 backdrop-blur-md shadow-2xl border border-white/30 rounded-3xl bg-zinc-700/60 hover:bg-zinc-600/60 transition-all duration-300 z-10">
      <LoginHeader />
      <SupabaseLoginForm onLogin={onLogin} isSubmitting={isSubmitting} />
      <LoginFooter />
    </div>
  );
};
