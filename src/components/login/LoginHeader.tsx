
import React from "react";

export const LoginHeader = () => {
  return (
    <div className="text-center">
      <div className="flex justify-center items-center h-64 w-full px-4 mb-4 transition-all duration-300 hover:scale-105">
        <img 
          src="/lovable-uploads/4ef561a4-e81e-40b4-910a-06dd13dc66ca.png" 
          alt="Ordering Platform Logo" 
          className="w-full h-full object-contain drop-shadow-lg rounded-2xl animate-float max-w-none" 
        />
      </div>
      <h1 className="mt-4 text-3xl font-bold uppercase text-zinc-100">ORDERING PLATFORM</h1>
      <p className="mt-2 text-lg italic text-zinc-300">"Your Orders. Our Priority. One Platform."</p>
    </div>
  );
};
