
import React from "react";

export const LoginHeader = () => {
  return (
    <div className="text-center">
      <div className="flex justify-center items-center h-24 w-full mb-2 transition-all duration-300 hover:scale-105">
        <img 
          src="/lovable-uploads/46d498f4-cb0a-44a8-9a30-33cd70d45dde.png" 
          alt="Conlan Tire Logo" 
          className="h-full object-contain drop-shadow-lg rounded-2xl animate-float" 
        />
      </div>
      <h1 className="mt-4 text-3xl font-bold text-zinc-100">Store Order System (SOS)</h1>
      <p className="mt-2 text-zinc-300">Manage inventory and orders with ease</p>
    </div>
  );
};
