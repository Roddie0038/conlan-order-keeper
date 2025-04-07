
import { motion } from "framer-motion";

export function DashboardBanner() {
  return <motion.div className="w-full max-w-5xl mx-auto mt-4 mb-8" initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.8
  }}>
      <div className="relative">
        <img 
          src="/lovable-uploads/96697586-f8cf-4aa5-8415-fee779a6cd7b.webp" 
          alt="Retreading America - Conlan Tire" 
          className="w-full h-auto rounded-lg shadow-2xl" 
          width="1024"
          height="576"
          loading="lazy"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
          
        </div>
      </div>
    </motion.div>;
}
