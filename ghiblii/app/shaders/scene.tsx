'use client'

import { useRef, useMemo, useState, useEffect } from 'react';
import { extend, useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Group, Vector2 } from 'three';

// === Ripple Shader Material ===
const GhibliShaderMaterial = shaderMaterial(
  {
    u_time: 0,
    u_image_texture: new THREE.Texture(),
    u_resolution: new THREE.Vector2(1, 1),
    u_opacity: 1.0,
    u_mouse: new THREE.Vector2(-1, -1),
    u_ripple_strength: 0.01,
    u_rippleStart: -100.0, // default (no ripple yet)
  },
  `
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
        vUv = vec2(uv.x, 1.0 - uv.y);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform sampler2D u_image_texture;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform float u_opacity;
    uniform float u_ripple_strength;
    uniform vec2 u_mouse;
    uniform float u_rippleStart;

    vec3 enhanceColors(vec3 color) {
        color = pow(color, vec3(0.9));
        color = mix(color, color * color * 3.0, 0.1);
        return color;
    }

    float getGlow(vec2 uv) {
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(uv, center);
        return 1.0 - smoothstep(0.0, 0.7, dist) * 0.2;
    }

    void main() {
        vec2 uv = vUv;
        
        float rippleHeight = 0.0;
        float elapsed = u_time - u_rippleStart;

        if (elapsed >= 0.0 && elapsed < 3.0) { // ripple lasts 3s
          float fade = 1.0 - (elapsed / 3.0); // fade out
          float distToMouse = distance(uv, u_mouse);
          float rippleRadius = 0.3;
          float rippleProgress = elapsed * 2.0 - (distToMouse / rippleRadius);
          rippleHeight = sin(rippleProgress * 6.2831) 
                       * smoothstep(rippleRadius, 0.0, distToMouse) 
                       * fade;
        }

        vec2 rippleUV = uv + rippleHeight * u_ripple_strength;
        
        vec4 textureColor = texture2D(u_image_texture, rippleUV);
        vec3 enhanced = enhanceColors(textureColor.rgb);
        
        float glow = getGlow(uv);
        enhanced *= glow;
        
        vec2 parallaxUv = uv + sin(u_time * 0.5 + vPosition.x * 0.1) * 0.002;
        vec4 parallaxColor = texture2D(u_image_texture, parallaxUv);
        enhanced = mix(enhanced, parallaxColor.rgb, 0.1);
        
        gl_FragColor = vec4(enhanced, textureColor.a * u_opacity);
    }
  `
);

// === Bubble Shader Material ===
const BubbleShaderMaterial = shaderMaterial(
  {
    u_time: 0,
    u_opacity: 0.6,
  },
  `
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float u_time;
    uniform float u_opacity;

    void main() {
        vec2 uv = vUv;
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(uv, center);
        
        float bubble = 1.0 - smoothstep(0.0, 0.5, dist);
        float rim = smoothstep(0.35, 0.5, dist) - smoothstep(0.45, 0.5, dist);
        
        float distortion = sin(u_time * 2.0 + vPosition.x * 10.0) * 0.02;
        bubble *= (1.0 + distortion);
        
        vec3 bubbleColor = vec3(0.8, 0.9, 1.0);
        float alpha = (bubble * 0.1 + rim * 0.8) * u_opacity;
        
        gl_FragColor = vec4(bubbleColor, alpha);
    }
  `
);

// Extend for R3F
extend({
  GhibliShaderMaterial,
  BubbleShaderMaterial
});

// === Image List ===
const images = [
  '/11.webp',
  '/2.webp',
  '/3.webp',
  '/4.webp',
  '/5.webp',
  '/6.webp',
  '/9.webp',
];

export function GhibliScene() {
  const groupRef = useRef<Group | null>(null);
  const bubblesRef = useRef<Group | null>(null);
  const [loadedTextures, setLoadedTextures] = useState<THREE.Texture[]>([]);
  const [imageDimensions, setImageDimensions] = useState<
    { width: number; height: number; aspectRatio: number }[]
  >([]);

  // Bubble setup
  const bubbles = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      ] as [number, number, number],
      size: 0.1 + Math.random() * 0.4,
      speed: 0.5 + Math.random() * 1,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  // Load Textures
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const promises = images.map((url, index) =>
      new Promise<THREE.Texture | null>((resolve) => {
        loader.load(
          url,
          (loadedTexture) => {
            loadedTexture.minFilter = THREE.LinearMipmapLinearFilter;
            loadedTexture.magFilter = THREE.LinearFilter;
            loadedTexture.generateMipmaps = true;
            loadedTexture.anisotropy = 16;
            loadedTexture.format = THREE.RGBAFormat;
            loadedTexture.flipY = false;

            if (loadedTexture.image) {
              setImageDimensions(prev => {
                const newDimensions = [...prev];
                newDimensions[index] = {
                  width: loadedTexture.image.width,
                  height: loadedTexture.image.height,
                  aspectRatio: loadedTexture.image.width / loadedTexture.image.height
                };
                return newDimensions;
              });
            }
            resolve(loadedTexture);
          },
          undefined,
          (error) => {
            console.error(`Failed to load texture ${url}:`, error);
            resolve(null);
          }
        );
      })
    );

    Promise.all(promises).then((results) => {
      const texs: THREE.Texture[] = results.filter((t): t is THREE.Texture => !!t);
      setLoadedTextures(texs);
    });
  }, []);

  const baseWidth = 4;
  const spacing = 0.4;
  const totalImages = images.length;
  const totalScrollWidth = (baseWidth + spacing) * totalImages;

  // Animation Loop
  useFrame((state, delta) => {
    const { clock } = state;

    // update time for planes
    if (groupRef.current) {
      groupRef.current.children.forEach((child) => {
        const mat: any = (child as any).material;
        if (mat && mat.uniforms.u_time) {
          mat.uniforms.u_time.value = clock.elapsedTime;
        }
      });
    }

    // update bubbles
    if (bubblesRef.current) {
      bubblesRef.current.children.forEach((bubble, index) => {
        const bubbleData = bubbles[index];
        if (bubble && bubbleData) {
          bubble.position.y += delta * bubbleData.speed;
          bubble.position.x += Math.sin(clock.elapsedTime + bubbleData.phase) * delta * 0.2;
          if (bubble.position.y > 15) {
            bubble.position.y = -15;
            bubble.position.x = (Math.random() - 0.5) * 30;
          }
          const bmat: any = (bubble as any).material;
          if (bmat && bmat.uniforms.u_time) bmat.uniforms.u_time.value = clock.elapsedTime;
        }
      });
    }

    // scrolling effect
    if (groupRef.current) {
      groupRef.current.position.x -= delta * 0.8;
      if (groupRef.current.position.x < -totalScrollWidth) {
        groupRef.current.position.x = spacing;
      }
    }

    // expose clock for pointer events
    state.camera.userData.clock = clock;
  });

  return (
    <>
      <color attach="background" args={["#001a33"]} />

      {/* Floating bubbles */}
      <group ref={bubblesRef}>
        {bubbles.map((bubble) => (
          <group key={bubble.id} position={bubble.position}>
            <mesh scale={[bubble.size, bubble.size, bubble.size]}>
              <circleGeometry args={[1, 16]} />
              {/* @ts-ignore */}
              <bubbleShaderMaterial u_time={0} u_opacity={0.6} transparent blending={THREE.NormalBlending} />
            </mesh>
            <mesh position={[-0.18, 0.18, 0.01]} scale={[bubble.size * 0.18, bubble.size * 0.18, bubble.size * 0.18]}>
              <circleGeometry args={[1, 16]} />
              <meshBasicMaterial color="#e0f7fa" transparent opacity={0.14} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Image planes */}
      <group ref={groupRef}>
        {[...loadedTextures, ...loadedTextures].map((texture, index) => {
          if (!texture) return null;
          const dimensions = imageDimensions[index % totalImages];
          let aspectRatio = 16 / 9;
          if (dimensions) aspectRatio = dimensions.aspectRatio;
          const planeWidth = baseWidth;
          const planeHeight = baseWidth / aspectRatio;

          return (
            <mesh
              key={index}
              position={[index * (planeWidth + spacing), 0, 0]}
              onPointerOver={(e: any) => {
                const uv = e.uv;
                const mat: any = (e.object as any).material;
                if (mat && e.camera.userData.clock && uv) {
                  mat.uniforms.u_rippleStart.value = e.camera.userData.clock.getElapsedTime();
                  mat.uniforms.u_mouse.value.set(uv.x, 1.0 - uv.y);
                }
              }}
              onPointerMove={(e: any) => {
                const uv = e.uv;
                const mat: any = (e.object as any).material;
                if (mat && uv) {
                  mat.uniforms.u_mouse.value.set(uv.x, 1.0 - uv.y);
                }
              }}
              // Do not reset u_mouse onPointerOut, let the shader fade out naturally
            >
              <planeGeometry args={[planeWidth, planeHeight, 32, 32]} />
              {/* @ts-ignore */}
              <ghibliShaderMaterial
                u_image_texture={texture}
                u_time={0}
                u_ripple_strength={0.02}
                u_resolution={[planeWidth, planeHeight]}
                u_opacity={1.0}
                transparent
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
      </group>
    </>
  );
}

export default GhibliScene;
