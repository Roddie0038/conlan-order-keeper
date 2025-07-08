import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { RealisticTire } from './RealisticTire';
import { OrbitingMenuItem } from './OrbitingMenuItem';
import { menuItems3D } from './menuItems';
import { useAuth } from '@/contexts/AuthContext';

function Scene() {
  const sceneRef = useRef<THREE.Group>(null);
  const elapsedTimeRef = useRef(0);

  useFrame((state, delta) => {
    elapsedTimeRef.current += delta;
  });

  const { user } = useAuth();
  
  // Filter menu items based on user permissions
  const availableItems = menuItems3D.filter(item => {
    // Show admin-only items only to admins
    if (item.id === 'all-orders' && !user?.isAdmin) return false;
    return true;
  });

  return (
    <group ref={sceneRef}>
      {/* Lighting Setup */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-10, -10, -5]} intensity={0.3} />

      {/* Central Tire */}
      <RealisticTire scale={1.5} rotationSpeed={0.3} />

      {/* Orbiting Menu Items */}
      {availableItems.map((item, index) => (
        <OrbitingMenuItem
          key={item.id}
          item={item}
          index={index}
          totalItems={availableItems.length}
          elapsedTime={elapsedTimeRef.current}
        />
      ))}

      {/* Environment for better lighting */}
      <Environment preset="city" />
    </group>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading 3D Dashboard...</p>
      </div>
    </div>
  );
}

interface TireDashboardProps {
  className?: string;
}

export function TireDashboard({ className }: TireDashboardProps) {
  return (
    <div className={`w-full h-[600px] ${className}`}>
      <Canvas
        camera={{ position: [0, 5, 8], fov: 60 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <Scene />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 3}
            autoRotate={false}
            rotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}