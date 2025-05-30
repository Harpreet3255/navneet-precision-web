import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Create a gear component
const Gear = ({ position, rotation, scale, color, speed = 1, reverse = false }: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color?: string;
  speed?: number;
  reverse?: boolean;
}) => {
  const gearRef = useRef<THREE.Mesh>(null);
  const gearScale = scale || 1;
  const gearColor = color || '#64748B'; // Default to navneet-gray

  // Create a gear geometry
  const gearGeometry = useMemo(() => {
    const outerRadius = 1;
    const innerRadius = 0.7;
    const thickness = 0.2;
    const teeth = 12;

    const shape = new THREE.Shape();

    // Create the outer circle
    shape.moveTo(outerRadius, 0);
    for (let i = 0; i < teeth * 2; i++) {
      const angle = (i * Math.PI) / teeth;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      shape.lineTo(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      );
    }
    shape.closePath();

    // Extrude the shape to create a 3D gear
    const extrudeSettings = {
      steps: 1,
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelOffset: 0,
      bevelSegments: 3
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  // Rotate the gear on each frame
  useFrame((_, delta) => {
    if (gearRef.current) {
      gearRef.current.rotation.z += delta * speed * (reverse ? -1 : 1);
    }
  });

  return (
    <mesh
      ref={gearRef}
      position={new THREE.Vector3(...position)}
      rotation={rotation ? new THREE.Euler(...rotation) : undefined}
      scale={gearScale}
      geometry={gearGeometry}
    >
      <meshStandardMaterial
        color={gearColor}
        metalness={0.8}
        roughness={0.3}
      />
    </mesh>
  );
};

// Create a conveyor belt component
const ConveyorBelt = ({ position, scale = [3, 0.1, 1], speed = 0.5 }: {
  position: [number, number, number];
  scale?: [number, number, number];
  speed?: number;
}) => {
  const beltRef = useRef<THREE.Mesh>(null);
  const textureRef = useRef<THREE.Texture | null>(null);

  // Create a repeating texture for the conveyor belt
  useMemo(() => {
    const texture = new THREE.TextureLoader().load('/images/conveyor-texture.svg', (texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(5, 1);
      textureRef.current = texture;
    });
    return texture;
  }, []);

  // Animate the conveyor belt texture
  useFrame((_, delta) => {
    if (textureRef.current) {
      textureRef.current.offset.x += delta * speed;
    }
  });

  return (
    <mesh
      ref={beltRef}
      position={new THREE.Vector3(...position)}
      scale={new THREE.Vector3(...scale)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#334155"
        map={textureRef.current}
      />
    </mesh>
  );
};

// Create a machine component
const Machine = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={new THREE.Vector3(...position)}>
      {/* Machine base */}
      <mesh position={[0, -1, 0]} scale={[2, 0.2, 1.5]}>
        <boxGeometry />
        <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Machine body */}
      <mesh position={[0, 0, 0]} scale={[1.5, 1.5, 1]}>
        <boxGeometry />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Machine top */}
      <mesh position={[0, 1, 0]} scale={[1, 0.5, 0.8]}>
        <boxGeometry />
        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Control panel */}
      <mesh position={[0.8, 0.2, 0.6]} scale={[0.2, 0.6, 0.2]}>
        <boxGeometry />
        <meshStandardMaterial color="#0EA5E9" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Buttons */}
      <mesh position={[0.8, 0.4, 0.7]} scale={[0.05, 0.05, 0.05]}>
        <sphereGeometry />
        <meshStandardMaterial color="#E25822" emissive="#E25822" emissiveIntensity={0.5} />
      </mesh>

      <mesh position={[0.8, 0, 0.7]} scale={[0.05, 0.05, 0.05]}>
        <sphereGeometry />
        <meshStandardMaterial color="#F8FAFC" />
      </mesh>
    </group>
  );
};

// Create a floating particle effect
const Particles = ({ count = 50, color = '#E25822', size = 0.03 }: {
  count?: number;
  color?: string;
  size?: number;
}) => {
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      temp.push({ position: [x, y, z], speed: Math.random() * 0.2 + 0.1 });
    }
    return temp;
  }, [count]);

  return (
    <group>
      {particles.map((particle, i) => (
        <ParticlePoint
          key={i}
          position={particle.position as [number, number, number]}
          speed={particle.speed}
          color={color}
          size={size}
        />
      ))}
    </group>
  );
};

const ParticlePoint = ({ position, speed, color, size }: {
  position: [number, number, number];
  speed: number;
  color: string;
  size: number;
}) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.position.y += delta * speed;

      // Reset position when particle goes too high
      if (ref.current.position.y > 5) {
        ref.current.position.y = -5;
      }
    }
  });

  return (
    <mesh ref={ref} position={new THREE.Vector3(...position)}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
};

// Main industrial scene component
const IndustrialScene = () => {
  return (
    <>
      {/* Main gears */}
      <Gear position={[-2, 1, 0]} scale={1.2} color="#475569" speed={0.5} />
      <Gear position={[-0.5, 1.5, -0.5]} scale={0.8} color="#64748B" speed={0.7} reverse={true} />
      <Gear position={[2, 0.5, 0.2]} scale={1} color="#334155" speed={0.3} />
      <Gear position={[0, -1.5, -0.3]} scale={1.5} color="#1E293B" speed={0.2} />

      {/* Conveyor belt */}
      <ConveyorBelt position={[0, -2, 0]} />

      {/* Machine */}
      <Machine position={[3, -1, -1]} />

      {/* Particles */}
      <Particles count={30} color="#E25822" size={0.02} />
    </>
  );
};

export default IndustrialScene;
