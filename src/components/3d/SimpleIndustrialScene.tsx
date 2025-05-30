import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Simple rotating gear component
const Gear = ({ position = [0, 0, 0], scale = 1, color = '#475569', speed = 0.5, reverse = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * speed * (reverse ? -1 : 1);
    }
  });
  
  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <cylinderGeometry args={[1, 1, 0.2, 32, 1, false, 0, Math.PI * 2]} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      {/* Gear teeth */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh 
          key={i} 
          position={[
            Math.cos(i * Math.PI / 4) * 1.2, 
            Math.sin(i * Math.PI / 4) * 1.2, 
            0
          ]}
          scale={[0.2, 0.2, 0.2]}
        >
          <boxGeometry />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </mesh>
  );
};

// Simple machine component
const Machine = ({ position = [0, 0, 0] }) => {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, -1, 0]} scale={[2, 0.2, 1]}>
        <boxGeometry />
        <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.2} />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, 0, 0]} scale={[1.5, 1, 0.8]}>
        <boxGeometry />
        <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.3} />
      </mesh>
      
      {/* Control panel */}
      <mesh position={[0.8, 0, 0.5]} scale={[0.2, 0.5, 0.2]}>
        <boxGeometry />
        <meshStandardMaterial color="#0EA5E9" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Button */}
      <mesh position={[0.8, 0.2, 0.6]} scale={[0.05, 0.05, 0.05]}>
        <sphereGeometry />
        <meshStandardMaterial color="#E25822" emissive="#E25822" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
};

// Main scene component
const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Gear position={[-2, 1, 0]} scale={1.2} color="#475569" speed={0.5} />
      <Gear position={[0, 1, -1]} scale={0.8} color="#64748B" speed={0.7} reverse={true} />
      <Gear position={[2, 0, 0]} scale={1} color="#334155" speed={0.3} />
      <Machine position={[0, -1, 0]} />
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.5}
      />
    </>
  );
};

// Main component with error handling
const SimpleIndustrialScene = () => {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 0, 10], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default SimpleIndustrialScene;
