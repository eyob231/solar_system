
import { Canvas, useFrame,useLoader } from "@react-three/fiber";
import { useRef } from "react";
import { useTexture,useBackground } from "@react-three/drei";
import Orbit from './Orbit.jsx'
import * as THREE from 'three';
import { useControls } from "leva";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

function OscillatingCollision() {
  const obj1 = useRef();
  const obj2 = useRef();
  const radius = 1;
  
  // Store original oscillation parameters
  const originalParams = useRef({
    obj1: { amplitude: 5, speed: 0.001, offset: -2 },
    obj2: { amplitude: 5, speed: 0.001, offset: 2 }
  });
  
  // Track collision and recoil state
  const collisionState = useRef({
    isColliding: false,
    recoilTime: 0,
    recoilDuration: 300, // milliseconds
    recoilForce: 0.2
  });

  useFrame(() => {
    if (!obj1.current || !obj2.current) return;
    
    const currentTime = Date.now();
    const { isColliding, recoilTime, recoilDuration, recoilForce } = collisionState.current;
    
    // Calculate distance
    const distance = obj1.current.position.distanceTo(obj2.current.position);
    
    // COLLISION DETECTION
    if (distance < radius * 2 && !isColliding) {
      collisionState.current.isColliding = true;
      collisionState.current.recoilTime = currentTime;
      
      // Calculate recoil direction (push them apart)
      const dir = new THREE.Vector3()
        .subVectors(obj2.current.position, obj1.current.position)
        .normalize();
      
      // Apply instant recoil
      obj1.current.position.sub(dir.multiplyScalar(recoilForce));
      obj2.current.position.add(dir.multiplyScalar(recoilForce));
    }
    
    // Check if recoil period is over
    if (isColliding && currentTime - recoilTime > recoilDuration) {
      collisionState.current.isColliding = false;
    }
    
    // Calculate positions based on state
    const { amplitude, speed, offset } = originalParams.current.obj1;
    const { amplitude: amp2, speed: speed2, offset: offset2 } = originalParams.current.obj2;
    
    if (!isColliding) {
      // NORMAL OSCILLATION (original motion)
      const x1 = offset + Math.sin(currentTime * speed) * -amplitude;
      const x2 = offset2 + Math.sin(currentTime * speed2) * amp2;
      
      obj1.current.position.set(x1, 0, 0);
      obj2.current.position.set(x2, 0, 0);
    } else {
      // DURING RECOIL: Continue oscillation but with modified offset
      const elapsed = currentTime - recoilTime;
      const progress = elapsed / recoilDuration;
      
      // Ease back to original path
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const x1 = offset + Math.sin(currentTime * speed) * amplitude;
      const x2 = offset2 + Math.sin(currentTime * speed2) * amp2;
      
      // Smoothly interpolate back from recoil position
      obj1.current.position.x = THREE.MathUtils.lerp(
        obj1.current.position.x,
        x1,
        easeOut
      );
      obj2.current.position.x = THREE.MathUtils.lerp(
        obj2.current.position.x,
        x2,
        easeOut
      );
    }
  });

  return (
    <>
      <mesh ref={obj1}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={'red'} />
      </mesh>
      <mesh ref={obj2}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={'blue'} />
      </mesh>
    </>
  );
}

function FirstChild() {
  const t = useRef();
  const { color, speed } = useControls({
    color: 'orange',
    
    speed: { value: 0.01, min: 0.001, max: 0.1, step: 0.001 } })
  useFrame(() => {
    t.current.rotation.x += speed
    t.current.rotation.y += speed
    t.current.rotation.z += speed



    
  })
  return (
    <mesh rotation={[0,0,Math.cos(3 * 2)]} ref={t}>
      <torusKnotGeometry args={[2, 0.4, 128, 32]} />
      <meshToonMaterial color={color} />
    </mesh>
  )
}

function Model() {
  const fbx = useLoader(FBXLoader, '/modle.fbx');
  return <primitive object={fbx} position={[0,0,0]} />;
}

function Background() {
  const texture = useTexture('/texture/space.jpg');
  useBackground(texture);
  return null;
   // This component doesn't render anything visible
}


function Sun() {
  const sunRef = useRef();

  const sunTexture = useTexture('/texture/sun.jpg');
  
  useFrame(() => {
    sunRef.current.rotation.y += 0.01
  })
  
  return (
    <>
    <mesh ref={sunRef} position={[0,0,0]} castShadow receiveShadow>
      <sphereGeometry args={[1.5, 32, 32]} />

      <meshStandardMaterial map={sunTexture}  color={'white'} />
    </mesh>
    <pointLight position={[0,0,0]} intensity={2} />

    </>
  )
}

function EarthWithMoon() {
  const earthRef = useRef()
  const moonRef = useRef()

  const texture = useTexture('/texture/earth.jpg');
  const moonTexture = useTexture('/texture/moon.jpg');
  
  
  // Earth orbit around Sun
  const earthOrbitRadius = 10
  const earthOrbitSpeed = 0.5
  const earthRotationSpeed = 0.01
  
  // Moon orbit around Earth
  
  const moonOrbitRadius = 0.8  // Distance from Earth
  const moonOrbitSpeed = 3  
     // Moon orbits faster than Earth
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // 1. Calculate Earth's position (orbit around Sun)
    const earthAngle = time * earthOrbitSpeed
    const earthX = Math.cos(earthAngle) * earthOrbitRadius
    const earthZ = Math.sin(earthAngle) * earthOrbitRadius
    
    // Set Earth's position
    earthRef.current.position.x = earthX
    earthRef.current.position.z = earthZ
    
    // Earth's rotation
    earthRef.current.rotation.y += earthRotationSpeed
    
    // 2. Calculate Moon's position (orbit around Earth)
    const moonAngle = time * moonOrbitSpeed
    const moonOffsetX = Math.cos(moonAngle) * moonOrbitRadius
    const moonOffsetZ = Math.sin(moonAngle) * moonOrbitRadius
    
    // Set Moon's position: Earth's position + Moon's offset
    moonRef.current.position.x = earthX + moonOffsetX
    moonRef.current.position.z = earthZ + moonOffsetZ
    moonRef.current.position.y = 0  // Keep Moon at same height
   
    
    // Optional: Moon rotation
    moonRef.current.rotation.y += 0.02
  })
  
  return (
    <>
      {/* Earth */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="white" map={texture} />
        <Orbit radius={0.8} />
      </mesh>
      
      {/* Moon */}
      <mesh ref={moonRef}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial  map={moonTexture}  color={'white'}/>
      </mesh>
    </>
  )
}

function MarsWithMoon() {
  const marsRef = useRef()
  const moon1Ref = useRef()
  const moon2Ref = useRef()

  const marstexture = useTexture('/texture/mars.jpg');

  // Mars movement
  const marsOrbitRadius = 14
  const marsOrbitSpeed = 0.9
  const marsRotationSpeed = 0.01

  // Moon 1
  const moon1Radius = 0.8
  const moon1Speed = 3

  // Moon 2
  const moon2Radius = 1.1
  const moon2Speed = 2.2   // different speed => more realistic

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    // === Mars orbit ===
    const marsAngle = time * marsOrbitSpeed
    const marsX = Math.cos(marsAngle) * marsOrbitRadius
    const marsZ = Math.sin(marsAngle) * marsOrbitRadius

    marsRef.current.position.set(marsX, 0, marsZ)
    marsRef.current.rotation.y += marsRotationSpeed

    // === Moon 1 orbit ===
    const moon1Angle = time * moon1Speed
    moon1Ref.current.position.set(
      marsX + Math.cos(moon1Angle) * moon1Radius,
      0,
      marsZ + Math.sin(moon1Angle) * moon1Radius
    )
    moon1Ref.current.rotation.y += 0.02

    // === Moon 2 orbit (independent) ===
    const moon2Angle = time * moon2Speed
    moon2Ref.current.position.set(
      marsX + Math.cos(moon2Angle) * moon2Radius,
      0,
      marsZ + Math.sin(moon2Angle) * moon2Radius
    )
    moon2Ref.current.rotation.y += 0.02
  })

  return (
    <>
      {/* Mars */}
      <mesh ref={marsRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial map={marstexture} color="white" />
        <Orbit radius={1.1} />
        <Orbit radius={0.8} />
      </mesh>

      {/* Moon 1 */}
      <mesh ref={moon1Ref}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial  color="gray" />
        
      </mesh>
      

      {/* Moon 2 */}
      <mesh ref={moon2Ref}>
        <sphereGeometry args={[0.17, 32, 32]} />
        <meshStandardMaterial color="lightgray" />
      </mesh>
    </>
  )
}


function Venus() {
  const venusRef = useRef()

  const venustexture = useTexture('/texture/venus.jpg');

  const radius = 4
  const speed = 0.7

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    venusRef.current.position.x = Math.cos(t * speed) * radius
    venusRef.current.position.z = Math.sin(t * speed) * radius

    venusRef.current.rotation.y += 0.01
  })

  return (
    <mesh ref={venusRef}>
      <sphereGeometry args={[0.35, 32, 32]} />
      <meshStandardMaterial 
        map={venustexture}
        color="white"
      />
    </mesh>
  )
}


function Mercury() {
  const mercuryRef = useRef()

  const mercurytexture = useTexture('/texture/mercury.jpg');

  const radius = 2.5
  const speed = 1.4
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    mercuryRef.current.position.x = Math.cos(t * speed) * radius
    mercuryRef.current.position.z = Math.sin(t * speed) * radius
    mercuryRef.current.rotation.y += 0.01
  })

  return (
    <mesh ref={mercuryRef}>
      <sphereGeometry args={[0.25, 32, 32]} />
      <meshStandardMaterial 
        map={mercurytexture}
        color="white"
      />
    </mesh>
  )

}



export default function Scene() {
  return (
    <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      
       

      <Model />
      <Background />
     
      
      <OrbitControls />
    </Canvas>
  )
}