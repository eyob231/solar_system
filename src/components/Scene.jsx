import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useTexture } from "@react-three/drei";
import Orbit from './Orbit.jsx'





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
      
      <Sun />
       <Orbit radius={10} />
      
      <EarthWithMoon />
      <Orbit radius={14} />
      <MarsWithMoon />
      <Orbit radius={4} />
      <Venus />
      <Orbit radius={2.5} />
      <Mercury /> 
      
      <OrbitControls />
    </Canvas>
  )
}