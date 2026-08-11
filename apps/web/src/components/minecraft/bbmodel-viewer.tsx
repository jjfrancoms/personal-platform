"use client";

import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { GlassCard, GlassButton, Icon } from "@personal-platform/ui";

interface BbmodelViewerProps {
  filename: string;
}

const SAMPLE_BONES = [
  { name: "root", pivot: [0, 0, 0], cubes: 1 },
  { name: "head", pivot: [0, 24, 0], cubes: 2 },
  { name: "torso", pivot: [0, 12, 0], cubes: 3 },
  { name: "left_arm", pivot: [5, 22, 0], cubes: 2 },
  { name: "right_arm", pivot: [-5, 22, 0], cubes: 2 },
  { name: "left_leg", pivot: [2, 12, 0], cubes: 1 },
  { name: "right_leg", pivot: [-2, 12, 0], cubes: 1 },
];

export const BbmodelViewer: React.FC<BbmodelViewerProps> = ({ filename }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedBone, setSelectedBone] = useState<string>("head");
  const [wireframe, setWireframe] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2, 3, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Grid helper
    const grid = new THREE.GridHelper(8, 16, 0x3b82f6, 0x1e293b);
    grid.position.y = -1;
    scene.add(grid);

    // Blockbench Entity Cube Mesh Group
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.6,
      wireframe,
    });

    // Head cube
    const headGeo = new THREE.BoxGeometry(1.0, 1.0, 1.0);
    const headMesh = new THREE.Mesh(headGeo, mat);
    headMesh.position.y = 1.0;
    group.add(headMesh);

    // Body cube
    const bodyGeo = new THREE.BoxGeometry(0.8, 1.2, 0.6);
    const bodyMesh = new THREE.Mesh(bodyGeo, mat);
    bodyMesh.position.y = -0.1;
    group.add(bodyMesh);

    scene.add(group);

    // Animation spin
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      group.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [wireframe]);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white/[0.02] p-2.5 rounded-xl border border-white/5 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase text-[10px]">
            BLOCKBENCH 3D
          </span>
          <span className="text-slate-400 text-xs">12 Cubes • 7 Bones • Texture 64x64</span>
        </div>

        <GlassButton
          onClick={() => setWireframe(!wireframe)}
          variant={wireframe ? "primary" : "secondary"}
          size="sm"
          className="text-xs py-1"
        >
          {wireframe ? "Wireframe ON" : "Wireframe OFF"}
        </GlassButton>
      </div>

      {/* Main Viewport & Bone Tree */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
        {/* 3D Canvas */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 bg-slate-950/80 relative">
          <div ref={containerRef} className="w-full h-full" />
        </div>

        {/* Bone Hierarchy Drawer */}
        <div className="w-full md:w-60 bg-white/[0.02] border border-white/10 rounded-2xl p-3 flex flex-col overflow-hidden">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 shrink-0">
            Bone Hierarchy
          </h4>
          <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs pr-1">
            {SAMPLE_BONES.map((bone) => (
              <button
                key={bone.name}
                onClick={() => setSelectedBone(bone.name)}
                className={`w-full text-left p-2 rounded-lg transition-all flex items-center justify-between ${
                  selectedBone === bone.name
                    ? "bg-emerald-600/30 text-emerald-200 border border-emerald-500/40"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>🦴 {bone.name}</span>
                <span className="text-[10px] text-slate-500">{bone.cubes} cubes</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
