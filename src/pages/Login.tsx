
import { useState } from "react";
import { LoginBackground } from "@/components/login/LoginBackground";
import { LoginCard } from "@/components/login/LoginCard";

const usernames = [
  "Conlan97", "Fort Worth22", "Grand Prairie27", "Houston28", "San Antonio29", "Rpetty",
  "Oklahoma30", "Little Rock32", "Kansas33", "Laredo35", "Tulsa36", "Austin39",
  "Miami 3", "Pompano Beach7", "Fort Myers9", "Jacksonville2", "Ocala5", 
  "Tallahassee15", "Mulberry99", "Orlando4", "Tampa6", "Vero Beach21", 
  "Sarasota23", "Romulus098", "Toledo8", "Detroit11", "Grand Rapids13", 
  "Cleveland18", "Chicago41", "Grand Prairie 97", "Romulus 98", "Mulberry 99"
];

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat" 
         style={{ backgroundImage: 'url(/lovable-uploads/retread-rock-bg.png)' }}>
      <LoginBackground />
      <LoginCard usernames={usernames} />
    </div>
  );
}
