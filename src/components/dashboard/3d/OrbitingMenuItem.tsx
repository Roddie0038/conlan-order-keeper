import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { MenuItem3D, orbitConfig } from './menuItems';

interface OrbitingMenuItemProps {
  item: MenuItem3D;
  index: number;
  totalItems: number;
  elapsedTime: number;
}

export function OrbitingMenuItem({ item, index, totalItems, elapsedTime }: OrbitingMenuItemProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  // Calculate orbital position
  const angle = (index / totalItems) * Math.PI * 2;
  const x = Math.cos(angle + elapsedTime * orbitConfig.speed) * orbitConfig.radius;
  const z = Math.sin(angle + elapsedTime * orbitConfig.speed) * orbitConfig.radius;
  const y = Math.sin(elapsedTime * orbitConfig.speed * 2) * orbitConfig.height;

  // Update position each frame
  useFrame(() => {
    if (meshRef.current) {
      const currentAngle = angle + elapsedTime * orbitConfig.speed;
      meshRef.current.position.set(
        Math.cos(currentAngle) * orbitConfig.radius,
        Math.sin(elapsedTime * orbitConfig.speed * 2) * orbitConfig.height,
        Math.sin(currentAngle) * orbitConfig.radius
      );
      
      // Face the center (tire)
      meshRef.current.lookAt(0, 0, 0);
    }
  });

  const handleClick = () => {
    navigate(item.path);
  };

  const scale = hovered ? orbitConfig.hoverScale : orbitConfig.itemScale;

  return (
    <group>
      {/* 3D Button Base */}
      <mesh
        ref={meshRef}
        scale={[scale, scale, scale]}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[1, 0.6, 0.2]} />
        <meshPhongMaterial 
          color={item.color}
          transparent
          opacity={hovered ? 0.9 : 0.7}
        />
      </mesh>

      {/* 3D Text Label */}
      <Text
        position={[x, y + 0.4, z]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {item.title}
      </Text>

      {/* HTML Overlay for better UX */}
      <Html
        position={[x, y, z]}
        center
        distanceFactor={10}
        style={{
          pointerEvents: hovered ? 'auto' : 'none',
          userSelect: 'none'
        }}
      >
        <div 
          className={`
            bg-background/80 backdrop-blur-sm border border-border rounded-lg p-2 
            transition-all duration-200 cursor-pointer
            ${hovered ? 'scale-110 shadow-lg' : 'scale-100'}
          `}
          onClick={handleClick}
          style={{
            minWidth: '120px',
            textAlign: 'center'
          }}
        >
          <div className="text-2xl mb-1">{item.icon}</div>
          <div className="text-xs font-bold text-foreground">{item.title}</div>
          <div className="text-xs text-muted-foreground">{item.description}</div>
        </div>
      </Html>
    </group>
  );
}