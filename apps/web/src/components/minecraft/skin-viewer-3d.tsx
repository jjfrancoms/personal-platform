"use client";

import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { GlassCard, GlassButton, Icon } from "@personal-platform/ui";

interface SkinViewer3DProps {
  filename: string;
}

export const SkinViewer3D: React.FC<SkinViewer3DProps> = ({ filename }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [outerLayer, setOuterLayer] = useState(true);
  const [pose, setPose] = useState<"walk" | "tpose" | "wave" | "run">("walk");
  const [autoRotate, setAutoRotate] = useState(true);

  // Mesh part references for animation
  const headRef = useRef<THREE.Mesh | null>(null);
  const leftArmRef = useRef<THREE.Mesh | null>(null);
  const rightArmRef = useRef<THREE.Mesh | null>(null);
  const leftLegRef = useRef<THREE.Mesh | null>(null);
  const rightLegRef = useRef<THREE.Mesh | null>(null);
  const outerLayersGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);

    // Ground shadow plane
    const shadowGeo = new THREE.CircleGeometry(1.2, 32);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.3, transparent: true });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.6;
    scene.add(shadowMesh);

    // Character Model Group
    const characterGroup = new THREE.Group();

    // Materials (Minecraft Steve Palette)
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xb4846c, roughness: 0.8 }); // Skin face
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.8 }); // Cyan shirt
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.8 }); // Blue pants
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 }); // Dark brown
    const outerMat = new THREE.MeshStandardMaterial({ color: 0xec4899, transparent: true, opacity: 0.7, roughness: 0.5 }); // Pink armor overlay

    // 1. Head (8x8x8 pixels -> 0.8 scale)
    const headGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const headMesh = new THREE.Mesh(headGeo, [hairMat, hairMat, hairMat, skinMat, skinMat, skinMat]);
    headMesh.position.y = 0.9;
    characterGroup.add(headMesh);
    headRef.current = headMesh;

    // 2. Torso (8x12x4 pixels -> 0.8 x 1.2 x 0.4)
    const torsoGeo = new THREE.BoxGeometry(0.8, 1.2, 0.4);
    const torsoMesh = new THREE.Mesh(torsoGeo, shirtMat);
    torsoMesh.position.y = -0.1;
    characterGroup.add(torsoMesh);

    // 3. Right Arm
    const armGeo = new THREE.BoxGeometry(0.4, 1.2, 0.4);
    const rightArmMesh = new THREE.Mesh(armGeo, shirtMat);
    rightArmMesh.position.set(-0.6, -0.1, 0);
    characterGroup.add(rightArmMesh);
    rightArmRef.current = rightArmMesh;

    // 4. Left Arm
    const leftArmMesh = new THREE.Mesh(armGeo, shirtMat);
    leftArmMesh.position.set(0.6, -0.1, 0);
    characterGroup.add(leftArmMesh);
    leftArmRef.current = leftArmMesh;

    // 5. Right Leg
    const legGeo = new THREE.BoxGeometry(0.4, 1.2, 0.4);
    const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rightLegMesh.position.set(-0.2, -1.0, 0);
    characterGroup.add(rightLegMesh);
    rightLegRef.current = rightLegMesh;

    // 6. Left Leg
    const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
    leftLegMesh.position.set(0.2, -1.0, 0);
    characterGroup.add(leftLegMesh);
    leftLegRef.current = leftLegMesh;

    // Outer Overlay Layer Group (Hat, Jacket, Sleeves)
    const outerGroup = new THREE.Group();
    const hatGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const hatMesh = new THREE.Mesh(hatGeo, outerMat);
    hatMesh.position.y = 0.9;
    outerGroup.add(hatMesh);

    const jacketGeo = new THREE.BoxGeometry(0.9, 1.25, 0.5);
    const jacketMesh = new THREE.Mesh(jacketGeo, outerMat);
    jacketMesh.position.y = -0.1;
    outerGroup.add(jacketMesh);

    characterGroup.add(outerGroup);
    outerLayersGroupRef.current = outerGroup;

    scene.add(characterGroup);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (autoRotate) {
        characterGroup.rotation.y += 0.01;
      }

      // Animate limb movements based on active pose
      if (pose === "walk" && rightArmRef.current && leftArmRef.current && rightLegRef.current && leftLegRef.current) {
        const angle = Math.sin(elapsed * 4) * 0.5;
        rightArmRef.current.rotation.x = angle;
        leftArmRef.current.rotation.x = -angle;
        rightLegRef.current.rotation.x = -angle;
        leftLegRef.current.rotation.x = angle;
      } else if (pose === "run" && rightArmRef.current && leftArmRef.current && rightLegRef.current && leftLegRef.current) {
        const angle = Math.sin(elapsed * 8) * 0.9;
        rightArmRef.current.rotation.x = angle;
        leftArmRef.current.rotation.x = -angle;
        rightLegRef.current.rotation.x = -angle;
        leftLegRef.current.rotation.x = angle;
      } else if (pose === "wave" && rightArmRef.current) {
        rightArmRef.current.rotation.x = 0;
        rightArmRef.current.rotation.z = Math.PI - 0.3 + Math.sin(elapsed * 6) * 0.3;
      } else if (pose === "tpose" && rightArmRef.current && leftArmRef.current) {
        rightArmRef.current.rotation.set(0, 0, -Math.PI / 2);
        leftArmRef.current.rotation.set(0, 0, Math.PI / 2);
        if (rightLegRef.current) rightLegRef.current.rotation.set(0, 0, 0);
        if (leftLegRef.current) leftLegRef.current.rotation.set(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [pose, autoRotate]);

  useEffect(() => {
    if (outerLayersGroupRef.current) {
      outerLayersGroupRef.current.visible = outerLayer;
    }
  }, [outerLayer]);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Controls Bar */}
      <div className="flex items-center justify-between bg-white/[0.02] p-2.5 rounded-xl border border-white/5 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase text-[10px]">
            MINECRAFT SKIN 3D
          </span>
          <span className="text-slate-400 text-xs">64x64 HD Steve Model</span>
        </div>

        {/* Pose Switcher */}
        <div className="flex items-center gap-1.5">
          {(["walk", "run", "wave", "tpose"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPose(p)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                pose === p
                  ? "bg-emerald-600/30 text-emerald-200 border border-emerald-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}

          <GlassButton
            onClick={() => setOuterLayer(!outerLayer)}
            variant={outerLayer ? "primary" : "secondary"}
            size="sm"
            className="text-xs py-1"
          >
            {outerLayer ? "Jacket Layer ON" : "Jacket Layer OFF"}
          </GlassButton>
        </div>
      </div>

      {/* Main 3D Skin Canvas */}
      <div className="flex-1 overflow-hidden border border-white/10 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black relative flex items-center justify-center">
        <div ref={containerRef} className="w-full h-full" />

        {/* Floating UV Texture Map Preview */}
        <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-center space-y-1">
          <p className="text-[9px] font-bold text-slate-400 uppercase">2D UV Skin Map</p>
          <div className="w-16 h-16 bg-emerald-950/60 rounded border border-emerald-500/30 flex items-center justify-center text-[10px] font-mono text-emerald-300">
            64x64
          </div>
        </div>
      </div>
    </div>
  );
};
