"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export interface ThreeViewportProps {
  filename: string;
  wireframe: boolean;
  autoRotate: boolean;
  showGrid: boolean;
  showAxes: boolean;
  lightIntensity: number;
  lightColor: string;
  envTheme: "void" | "studio" | "cyber";
  onStatsUpdate?: (stats: { vertices: number; triangles: number; meshes: number }) => void;
  viewportRef?: React.MutableRefObject<{ getSnapshot: () => string } | null>;
}

export const ThreeViewport: React.FC<ThreeViewportProps> = ({
  filename,
  wireframe,
  autoRotate,
  showGrid,
  showAxes,
  lightIntensity,
  lightColor,
  envTheme,
  onStatsUpdate,
  viewportRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const pointLightRef = useRef<THREE.PointLight | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);

  // Orbit control state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const cameraRotationRef = useRef({ x: 0.3, y: 0.6 });
  const cameraDistanceRef = useRef(7);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2, 7);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6 * lightIntensity);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2 * lightIntensity);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const pointLight = new THREE.PointLight(new THREE.Color(lightColor), 2, 20);
    pointLight.position.set(-4, 3, -3);
    scene.add(pointLight);
    pointLightRef.current = pointLight;

    // 5. Helpers
    const gridHelper = new THREE.GridHelper(12, 24, 0x3b82f6, 0x1e293b);
    gridHelper.position.y = -1.5;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    const axesHelper = new THREE.AxesHelper(3);
    axesHelper.position.y = -1.5;
    scene.add(axesHelper);
    axesHelperRef.current = axesHelper;

    // 6. Build High-Detail Procedural 3D Model (Cyber Vehicle / Sci-Fi Drone Mech)
    const modelGroup = new THREE.Group();

    // Chassis
    const bodyGeo = new THREE.BoxGeometry(3.2, 0.8, 1.8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      metalness: 0.85,
      roughness: 0.2,
      wireframe,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    modelGroup.add(bodyMesh);

    // Cockpit Glass
    const cockpitGeo = new THREE.SphereGeometry(0.8, 16, 12);
    cockpitGeo.scale(1.2, 0.6, 0.9);
    const cockpitMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.6,
      opacity: 0.8,
      transparent: true,
      roughness: 0.1,
      wireframe,
    });
    const cockpitMesh = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpitMesh.position.set(0.2, 0.6, 0);
    modelGroup.add(cockpitMesh);

    // Thruster engines / Wheels
    const thrusterGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.8, 16);
    const thrusterMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.3,
      wireframe,
    });

    const positions: [number, number, number][] = [
      [-1.2, -0.4, 1.0],
      [1.2, -0.4, 1.0],
      [-1.2, -0.4, -1.0],
      [1.2, -0.4, -1.0],
    ];

    positions.forEach(([x, y, z]) => {
      const thruster = new THREE.Mesh(thrusterGeo, thrusterMat);
      thruster.rotation.x = Math.PI / 2;
      thruster.position.set(x, y, z);
      modelGroup.add(thruster);
    });

    // Glowing Neon Ring Accents
    const ringGeo = new THREE.TorusGeometry(0.3, 0.05, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(-1.6, 0, 0);
    ringMesh.rotation.y = Math.PI / 2;
    modelGroup.add(ringMesh);

    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // Calculate total stats
    let totalVertices = 0;
    let totalTriangles = 0;
    let meshCount = 0;

    modelGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        meshCount++;
        const geo = mesh.geometry;
        if (geo.index) {
          totalTriangles += geo.index.count / 3;
        } else if (geo.attributes.position) {
          totalTriangles += geo.attributes.position.count / 3;
        }
        if (geo.attributes.position) {
          totalVertices += geo.attributes.position.count;
        }
      }
    });

    if (onStatsUpdate) {
      onStatsUpdate({
        vertices: totalVertices,
        triangles: totalTriangles,
        meshes: meshCount,
      });
    }

    // 7. Mouse interaction events for Orbit
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - prevMousePosRef.current.x;
      const deltaY = e.clientY - prevMousePosRef.current.y;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };

      cameraRotationRef.current.y += deltaX * 0.008;
      cameraRotationRef.current.x = Math.max(
        -Math.PI / 3,
        Math.min(Math.PI / 3, cameraRotationRef.current.x + deltaY * 0.008)
      );
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraDistanceRef.current = Math.max(3, Math.min(15, cameraDistanceRef.current + e.deltaY * 0.005));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    domElement.addEventListener("wheel", handleWheel, { passive: false });

    // 8. Snapshot helper export
    if (viewportRef) {
      viewportRef.current = {
        getSnapshot: () => {
          renderer.render(scene, camera);
          return renderer.domElement.toDataURL("image/png");
        },
      };
    }

    // 9. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && !isDraggingRef.current) {
        cameraRotationRef.current.y += 0.008;
      }

      // Update camera position on sphere
      const dist = cameraDistanceRef.current;
      const rotX = cameraRotationRef.current.x;
      const rotY = cameraRotationRef.current.y;

      camera.position.x = dist * Math.sin(rotY) * Math.cos(rotX);
      camera.position.y = dist * Math.sin(rotX) + 0.5;
      camera.position.z = dist * Math.cos(rotY) * Math.cos(rotX);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      domElement.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  // Update dynamic properties
  useEffect(() => {
    if (!modelGroupRef.current) return;
    modelGroupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (mat) mat.wireframe = wireframe;
      }
    });
  }, [wireframe]);

  useEffect(() => {
    if (gridHelperRef.current) gridHelperRef.current.visible = showGrid;
  }, [showGrid]);

  useEffect(() => {
    if (axesHelperRef.current) axesHelperRef.current.visible = showAxes;
  }, [showAxes]);

  useEffect(() => {
    if (dirLightRef.current) dirLightRef.current.intensity = 1.2 * lightIntensity;
  }, [lightIntensity]);

  useEffect(() => {
    if (pointLightRef.current) pointLightRef.current.color = new THREE.Color(lightColor);
  }, [lightColor]);

  // Environment background
  const bgClass =
    envTheme === "void"
      ? "bg-slate-950"
      : envTheme === "studio"
      ? "bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950"
      : "bg-radial from-purple-950/40 via-slate-950 to-slate-950";

  return (
    <div
      ref={containerRef}
      className={`w-full h-full rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing relative select-none ${bgClass}`}
    />
  );
};
