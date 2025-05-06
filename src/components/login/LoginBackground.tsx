
import React from "react";

export const LoginBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main background image */}
      <div className="absolute inset-0 bg-cover bg-center z-0" 
           style={{ backgroundImage: "url('/lovable-uploads/667db392-f20d-4ccc-905c-60ef1fabb24f.png')" }}>
        {/* Overlay for better contrast with login form content */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Subtle accent elements for visual interest - kept from original design */}
      <div className="wheel-animation absolute top-[10%] left-[15%] w-40 h-40 rounded-full border-4 border-blue-400/10 opacity-20 animate-spin-slow"></div>
      <div className="wheel-animation absolute bottom-[20%] right-[10%] w-28 h-28 rounded-full border-4 border-blue-300/10 opacity-10 animate-spin-slow-reverse"></div>
      <div className="tire-track absolute top-[30%] right-[5%] w-64 h-8 bg-blue-400/5 rounded-full transform -rotate-45"></div>
      <div className="tire-track absolute bottom-[15%] left-[5%] w-64 h-8 bg-blue-400/5 rounded-full transform rotate-45"></div>
    </div>
  );
};
