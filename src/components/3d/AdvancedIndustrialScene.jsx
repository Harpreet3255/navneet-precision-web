import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  MeshReflectorMaterial, 
  Float, 
  Environment, 
  useGLTF, 
  OrbitControls,
  PerspectiveCamera,
  useTexture
} from '@react-three/drei';
import * as THREE from 'three';

// Create a detailed gear component
const Gear = ({ position, rotation = [0, 0, 0], scale = 1, color = '#475569', speed = 0.5, reverse = false, teeth = 12 }) => {
  const meshRef = useRef();
  
  // Create a more detailed gear geometry
  const gearGeometry = useMemo(() => {
    const outerRadius = 1;
    const innerRadius = 0.7;
    const thickness = 0.2;
    
    // Create the gear shape
    const shape = new THREE.Shape();
    
    // Create the outer circle with teeth
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
      steps: 2,
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelOffset: 0,
      bevelSegments: 5
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [teeth]);

  // Rotate the gear on each frame
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * speed * (reverse ? -1 : 1);
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={position}
      rotation={rotation}
      scale={scale}
      geometry={gearGeometry}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial 
        color={color} 
        metalness={0.9}
        roughness={0.2}
        envMapIntensity={1}
      />
    </mesh>
  );
};

// Create a conveyor belt component
const ConveyorBelt = ({ position = [0, -2, 0], scale = [4, 0.1, 1], speed = 0.5 }) => {
  const meshRef = useRef();
  const [texture] = useTexture(['/images/conveyor-texture.svg']);
  
  // Set up the texture
  useMemo(() => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 1);
  }, [texture]);
  
  // Animate the conveyor belt texture
  useFrame((_, delta) => {
    if (texture) {
      texture.offset.x += delta * speed;
    }
  });
  
  return (
    <mesh 
      ref={meshRef} 
      position={position}
      scale={scale}
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color="#334155" 
        map={texture}
        metalness={0.7}
        roughness={0.3}
      />
    </mesh>
  );
};

// Create a machine component
const Machine = ({ position = [3, -1, -1] }) => {
  return (
    <group position={position}>
      {/* Machine base */}
      <mesh position={[0, -1, 0]} scale={[2, 0.2, 1.5]} castShadow receiveShadow>
        <boxGeometry />
        <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Machine body */}
      <mesh position={[0, 0, 0]} scale={[1.5, 1.5, 1]} castShadow receiveShadow>
        <boxGeometry />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Machine top */}
      <mesh position={[0, 1, 0]} scale={[1, 0.5, 0.8]} castShadow receiveShadow>
        <boxGeometry />
        <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Control panel */}
      <mesh position={[0.8, 0.2, 0.6]} scale={[0.2, 0.6, 0.2]} castShadow receiveShadow>
        <boxGeometry />
        <meshStandardMaterial color="#0EA5E9" metalness={0.4} roughness={0.6} />
      </mesh>
      
      {/* Buttons */}
      <mesh position={[0.8, 0.4, 0.7]} scale={[0.05, 0.05, 0.05]} castShadow>
        <sphereGeometry />
        <meshStandardMaterial color="#E25822" emissive="#E25822" emissiveIntensity={0.5} />
      </mesh>
      
      <mesh position={[0.8, 0, 0.7]} scale={[0.05, 0.05, 0.05]} castShadow>
        <sphereGeometry />
        <meshStandardMaterial color="#F8FAFC" />
      </mesh>
    </group>
  );
};

// Create a floating particle effect
const Particles = ({ count = 30, color = '#E25822', size = 0.03 }) => {
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
        <Float key={i} speed={1} rotationIntensity={1} floatIntensity={2}>
          <mesh position={particle.position} castShadow>
            <sphereGeometry args={[size, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

// Create a reflective floor
const Floor = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={50}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#050505"
        metalness={0.5}
      />
    </mesh>
  );
};

// Main industrial scene component
const AdvancedIndustrialScene = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
      
      <color attach="background" args={['#050505']} />
      
      <fog attach="fog" args={['#050505', 5, 30]} />
      
      <ambientLight intensity={0.5} />
      
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024} 
      />
      
      <spotLight 
        position={[-10, 10, 5]} 
        angle={0.3} 
        penumbra={1} 
        intensity={1} 
        castShadow
      />
      
      {/* Main gears */}
      <Gear position={[-2, 1, 0]} scale={1.2} color="#475569" speed={0.5} teeth={16} />
      <Gear position={[-0.5, 1.5, -0.5]} scale={0.8} color="#64748B" speed={0.7} reverse={true} teeth={12} />
      <Gear position={[2, 0.5, 0.2]} scale={1} color="#334155" speed={0.3} teeth={20} />
      <Gear position={[0, -1.5, -0.3]} scale={1.5} color="#1E293B" speed={0.2} teeth={24} />
      
      {/* Conveyor belt */}
      <ConveyorBelt position={[0, -2, 0]} />
      
      {/* Machine */}
      <Machine position={[3, -1, -1]} />
      
      {/* Particles */}
      <Particles count={30} color="#E25822" size={0.02} />
      
      {/* Floor */}
      <Floor />
      
      {/* Environment map for realistic reflections */}
      <Environment preset="city" />
      
      {/* Controls */}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        enableRotate={true}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 3}
      />
    </>
  );
};

export default AdvancedIndustrialScene;
