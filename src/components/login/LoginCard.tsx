
import React from "react";
import { LoginHeader } from "./LoginHeader";
import { LoginAlert } from "./LoginAlert";
import { LoginForm } from "./LoginForm";
import { LoginFooter } from "./LoginFooter";

interface LoginCardProps {
  usernames: string[];
}

export const LoginCard = ({ usernames }: LoginCardProps) => {
  return (
    <div className="max-w-md w-full space-y-8 p-8 backdrop-blur-md shadow-2xl border border-white/30 rounded-3xl bg-zinc-800/90 hover:bg-zinc-700/90 transition-all duration-300 z-10 mx-4">
      <LoginHeader />
      <LoginAlert />
      <LoginForm usernames={usernames} />
      <LoginFooter />
    </div>
  );
};
