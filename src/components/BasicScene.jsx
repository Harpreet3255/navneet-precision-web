import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

// Simple rotating box component
function RotatingBox(props) {
  const meshRef = useRef();
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });
  
  return (
    <mesh {...props} ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={props.color || "#E25822"} />
    </mesh>
  );
}

// Main scene component
export default function BasicScene() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute' }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <RotatingBox position={[-1.5, 0, 0]} color="#1E293B" />
        <RotatingBox position={[0, 0, 0]} color="#E25822" />
        <RotatingBox position={[1.5, 0, 0]} color="#64748B" />
      </Canvas>
    </div>
  );
}
