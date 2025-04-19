
import React from "react";

export const LoginHeader = () => {
  return (
    <div className="text-center">
      <div className="flex justify-center items-center h-24 w-full mb-2 transition-all duration-300 hover:scale-105">
        <img 
          src="/lovable-uploads/5ebace85-f26a-450c-8569-ebcd8a210c1d.png" 
          alt="Conlan Tire Logo" 
          className="h-full object-contain drop-shadow-lg rounded-2xl animate-float" 
        />
      </div>
      <h1 className="mt-4 text-3xl font-bold text-zinc-100">Order Tracking System</h1>
      <p className="mt-2 text-zinc-300">Manage inventory and orders with ease</p>
    </div>
  );
};
