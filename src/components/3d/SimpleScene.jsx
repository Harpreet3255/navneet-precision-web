import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// Simple rotating gear
const SimpleGear = ({ position, scale = 1, color = '#475569', speed = 0.5, reverse = false }) => {
  const meshRef = useRef();
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * speed * (reverse ? -1 : 1);
    }
  });
  
  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <cylinderGeometry args={[1, 1, 0.2, 32]} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      {/* Simple gear teeth */}
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
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </mesh>
  );
};

// Simple machine
const SimpleMachine = ({ position }) => {
  return (
    <group position={position}>
      <mesh position={[0, -0.5, 0]} scale={[2, 0.2, 1]}>
        <boxGeometry />
        <meshStandardMaterial color="#1E293B" />
      </mesh>
      <mesh position={[0, 0.2, 0]} scale={[1.5, 0.7, 0.8]}>
        <boxGeometry />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
};

// Main scene component
const SimpleScene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      <SimpleGear position={[-2, 1, 0]} scale={1.2} color="#475569" speed={0.5} />
      <SimpleGear position={[0, 1, -1]} scale={0.8} color="#64748B" speed={0.7} reverse={true} />
      <SimpleGear position={[2, 0, 0]} scale={1} color="#334155" speed={0.3} />
      
      <SimpleMachine position={[0, -1, 0]} />
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.5}
      />
    </>
  );
};

export default SimpleScene;
