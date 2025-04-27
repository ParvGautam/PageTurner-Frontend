import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { OrbitControls, Environment } from '@react-three/drei';
import defaultCover from '../assets/default-cover.png';
import * as THREE from 'three';

// The actual 3D book component inside the Three.js canvas
const Book = ({ coverImage, title, onClick }) => {
  const bookRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [textTexture, setTextTexture] = useState(null);
  
  // Load the cover image as a texture
  const texture = useLoader(TextureLoader, coverImage || defaultCover);
  
  // Set proper texture mapping to avoid white backgrounds
  useEffect(() => {
    if (texture) {
      // Fix transparent background issues
      texture.alphaTest = 0.1;
      texture.anisotropy = 16;
      
      // Remove white background and preserve original colors
      texture.encoding = THREE.sRGBEncoding;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
    }
  }, [texture]);
  
  // Handle hover state
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);
  
  // Create a texture for the book spine text
  useEffect(() => {
    if (!title) return;
    
    // Create a canvas to render the text
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    
    // Set a gradient background color for the spine
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#e1ddd8');
    gradient.addColorStop(1, '#f2ebf4');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text
    context.fillStyle = '#333';
    context.font = 'bold 36px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Scale text to fit
    const maxWidth = canvas.width - 40;
    let fontSize = 36;
    if (context.measureText(title).width > maxWidth) {
      while (context.measureText(title).width > maxWidth && fontSize > 12) {
        fontSize--;
        context.font = `bold ${fontSize}px Arial`;
      }
    }
    
    // Draw the text on the canvas
    context.fillText(title, canvas.width / 2, canvas.height / 2);
    
    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    setTextTexture(texture);
  }, [title]);

  // Animate book rotation and position
  useFrame((state) => {
    if (bookRef.current) {
      if (hovered) {
        // Rotate the book when hovered - reduced rotation
        bookRef.current.rotation.y = THREE.MathUtils.lerp(
          bookRef.current.rotation.y,
          Math.PI * 0.15, // Reduced rotation angle (was 0.3)
          0.1 // Lerp factor (speed of rotation)
        );
        
        // Lift the book up slightly - reduced lift
        bookRef.current.position.y = THREE.MathUtils.lerp(
          bookRef.current.position.y,
          0.08, // Reduced lift height (was 0.3)
          0.1 // Lerp factor
        );
        
        // Add subtle floating animation - reduced amplitude
        bookRef.current.position.y += Math.sin(Date.now() * 0.003) * 0.002;
        
        // Add minimal tilt effect - reduced tilt
        bookRef.current.rotation.z = THREE.MathUtils.lerp(
          bookRef.current.rotation.z,
          Math.PI * 0.005 * Math.sin(state.clock.elapsedTime * 2), // Reduced tilt (was 0.02)
          0.05
        );
      } else {
        // Return to original rotation
        bookRef.current.rotation.y = THREE.MathUtils.lerp(
          bookRef.current.rotation.y,
          0,
          0.1 
        );
        
        // Return to original position
        bookRef.current.position.y = THREE.MathUtils.lerp(
          bookRef.current.position.y,
          0,
          0.1
        );
        
        // Return to original tilt
        bookRef.current.rotation.z = THREE.MathUtils.lerp(
          bookRef.current.rotation.z,
          0,
          0.1
        );
      }
    }
  });

  return (
    <group 
      ref={bookRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onClick}
      position={[0, 0, 0]}
      scale={[1, 1.5, 0.1]} // Book dimensions (width, height, thickness)
    >
      {/* Front cover */}
      <mesh position={[0, 0, 0.5]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial 
          map={texture} 
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Back cover */}
      <mesh position={[0, 0, -0.5]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial 
          color="#f2ebf4" 
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* Book spine */}
      {textTexture && (
        <mesh position={[-0.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial 
            map={textTexture} 
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
      )}

      {/* Pages - add slightly visible pages */}
      <mesh position={[0.47, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1, 0.97]} />
        <meshStandardMaterial 
          color="#f5f5f5"
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {/* Top edge */}
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial 
          color="#f5f5f5" 
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Bottom edge */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial 
          color="#f5f5f5" 
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
};

// Main component that wraps the Three.js canvas
const ThreeJSBook = ({ 
  coverImage, 
  title, 
  onClick, 
  className = '',
  height = 300
}) => {
  return (
    <div className={`${className}`} style={{ height: `${height}px` }}>
      <Canvas
        camera={{ position: [0, 0, 2], fov: 50 }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(0x000000), 0); // Transparent background
          gl.outputEncoding = THREE.sRGBEncoding;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.5;
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <spotLight 
          position={[0, 5, 5]} 
          angle={0.3} 
          penumbra={1} 
          intensity={1} 
          castShadow 
        />
        
        <Suspense fallback={null}>
          <Book 
            coverImage={coverImage} 
            title={title} 
            onClick={onClick} 
          />
          <Environment preset="apartment" intensity={0.8} />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            minPolarAngle={Math.PI/2} 
            maxPolarAngle={Math.PI/2}
            rotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

// Suspense wrapper for async texture loading
import { Suspense } from 'react';

const ThreeJSBookWithSuspense = (props) => (
  <Suspense fallback={<div style={{ height: props.height || 300, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
    <ThreeJSBook {...props} />
  </Suspense>
);

export default ThreeJSBookWithSuspense; 