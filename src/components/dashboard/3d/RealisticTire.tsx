import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface RealisticTireProps {
  scale?: number;
  rotationSpeed?: number;
}

export function RealisticTire({ scale = 1, rotationSpeed = 0.5 }: RealisticTireProps) {
  const tireRef = useRef<THREE.Group>(null);
  
  // For now, create a procedural tire until we have the GLB model
  const geometry = new THREE.TorusGeometry(1.2, 0.6, 16, 32);
  const material = new THREE.MeshPhongMaterial({ 
    color: '#1a1a1a',
    shininess: 5,
    specular: '#333333'
  });

  // Auto-rotation animation
  useFrame((state, delta) => {
    if (tireRef.current) {
      tireRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={tireRef} scale={[scale, scale, scale]} position={[0, 0, 0]}>
      {/* Main tire body */}
      <mesh geometry={geometry} material={material} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhongMaterial 
          color="#1a1a1a" 
          shininess={5}
          specular="#333333"
        />
      </mesh>
      
      {/* Tire sidewall detail */}
      <mesh position={[0, 0.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 0.1, 32]} />
        <meshPhongMaterial color="#2a2a2a" />
      </mesh>
      
      <mesh position={[0, -0.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 0.1, 32]} />
        <meshPhongMaterial color="#2a2a2a" />
      </mesh>

      {/* Rim/wheel center */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 1.5, 16]} />
        <meshPhongMaterial color="#666666" shininess={100} specular="#999999" />
      </mesh>
    </group>
  );
}

// Fallback for when GLB model is available
export function GLBTire({ scale = 1, rotationSpeed = 0.5 }: RealisticTireProps) {
  const tireRef = useRef<THREE.Group>(null);
  
  // Uncomment when GLB model is available
  // const { scene } = useGLTF('/models/semi_truck_tire.glb');
  
  useFrame((state, delta) => {
    if (tireRef.current) {
      tireRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={tireRef} scale={[scale, scale, scale]}>
      {/* Fallback to procedural tire */}
      <RealisticTire scale={1} rotationSpeed={0} />
    </group>
  );
}