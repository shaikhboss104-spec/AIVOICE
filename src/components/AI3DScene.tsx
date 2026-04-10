import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, ContactShadows, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface SceneProps {
  isActive: boolean;
  volume: number;
}

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  uniform float uTime;
  uniform float uDistort;
  uniform float uVolume;

  // GLSL noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vUv = uv;
    vNormal = normal;
    
    float noise = snoise(vec3(position * 2.0 + uTime * 0.5));
    vec3 newPosition = position + normal * noise * uDistort * (1.0 + uVolume * 2.0);
    vPosition = newPosition;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uActive;
  uniform float uVolume;

  void main() {
    float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
    
    vec3 color = uColor;
    if (uActive > 0.5) {
      color += vec3(0.1, 0.3, 0.8) * sin(vPosition.y * 10.0 + uTime * 5.0) * 0.5;
      color += vec3(0.5, 0.8, 1.0) * fresnel * (1.0 + uVolume * 3.0);
    } else {
      color *= 0.5 + fresnel * 0.5;
    }
    
    float alpha = 0.6 + fresnel * 0.4;
    gl_FragColor = vec4(color, alpha);
  }
`;

function HolographicCore({ isActive, volume }: SceneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDistort: { value: 0.2 },
    uVolume: { value: 0 },
    uColor: { value: new THREE.Color("#3b82f6") },
    uActive: { value: 0 }
  }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t;
      materialRef.current.uniforms.uDistort.value = isActive ? 0.3 : 0.1;
      materialRef.current.uniforms.uVolume.value = volume;
      materialRef.current.uniforms.uActive.value = isActive ? 1.0 : 0.0;
      materialRef.current.uniforms.uColor.value.lerp(
        new THREE.Color(isActive ? "#3b82f6" : "#1e293b"),
        0.05
      );
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.1;
      meshRef.current.rotation.z = t * 0.05;
    }
  });

  return (
    <Float speed={isActive ? 4 : 1} rotationIntensity={isActive ? 2 : 0.5} floatIntensity={isActive ? 2 : 0.5}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 128, 128]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Inner Core */}
      <mesh scale={0.8}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial 
          color={isActive ? "#60a5fa" : "#0f172a"} 
          emissive={isActive ? "#3b82f6" : "#000000"}
          emissiveIntensity={isActive ? 2 + volume * 5 : 0}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
}

export function AI3DScene({ isActive, volume }: SceneProps) {
  return (
    <div className="w-full h-full min-h-[500px]">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#3b82f6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6366f1" />
        
        <HolographicCore isActive={isActive} volume={volume} />
        
        <Sparkles 
          count={isActive ? 100 : 40} 
          scale={10} 
          size={isActive ? 2 : 1} 
          speed={isActive ? 2 : 0.5} 
          color={isActive ? "#3b82f6" : "#ffffff"} 
          opacity={isActive ? 0.8 : 0.2}
        />

        <Environment preset="night" />
        <ContactShadows
          position={[0, -3, 0]}
          opacity={0.6}
          scale={12}
          blur={2.5}
          far={5}
          color="#000000"
        />
      </Canvas>
    </div>
  );
}
