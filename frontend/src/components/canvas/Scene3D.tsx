"use client";

import { useRef, useMemo, Component, ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";

class CanvasErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
    state = { hasError: false };
    static getDerivedStateFromError() { return { hasError: true }; }
    render() {
        if (this.state.hasError) return this.props.fallback;
        return this.props.children;
    }
}

function FloatingShape({ geometry, color, position, rotationSpeed }: {
    geometry: JSX.Element;
    color: string;
    position: [number, number, number];
    rotationSpeed: number;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * rotationSpeed * 0.3;
            meshRef.current.rotation.y += delta * rotationSpeed * 0.2;
        }
    });

    return (
        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.6}>
            <mesh ref={meshRef} position={position}>
                {geometry}
                <meshPhysicalMaterial
                    color={color}
                    metalness={0.1}
                    roughness={0.05}
                    transparent
                    opacity={0.75}
                    envMapIntensity={1}
                />
            </mesh>
        </Float>
    );
}

function Shapes() {
    const shapes = useMemo(() => [
        { geometry: <icosahedronGeometry args={[0.6, 0]} />, color: "#a855f7", pos: [-1.8, 0.5, -2] as [number, number, number], speed: 0.8 },
        { geometry: <torusKnotGeometry args={[0.5, 0.18, 100, 16]} />, color: "#6366f1", pos: [2, -0.8, -3] as [number, number, number], speed: 1.2 },
        { geometry: <octahedronGeometry args={[0.5, 0]} />, color: "#8b5cf6", pos: [-0.5, 1.8, -4] as [number, number, number], speed: 0.6 },
        { geometry: <dodecahedronGeometry args={[0.45, 0]} />, color: "#3b82f6", pos: [1.5, 1.5, -5] as [number, number, number], speed: 0.9 },
        { geometry: <torusGeometry args={[0.4, 0.15, 16, 50]} />, color: "#a855f7", pos: [-1.2, -1.2, -1.5] as [number, number, number], speed: 0.7 },
    ], []);

    return shapes.map((s, i) => (
        <FloatingShape key={i} geometry={s.geometry} color={s.color} position={s.pos} rotationSpeed={s.speed} />
    ));
}

function Scene() {
    return (
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
            <color attach="background" args={["#050505"]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={1} color="#a855f7" />
            <pointLight position={[-5, -3, 2]} intensity={0.8} color="#3b82f6" />
            <spotLight position={[0, 5, 5]} angle={0.3} penumbra={0.5} intensity={0.5} color="#a855f7" />
            <Shapes />
            <Environment preset="night" />
        </Canvas>
    );
}

function Fallback() {
    return (
        <div className="fixed inset-0 z-0 bg-[#050505]" />
    );
}

export default function Scene3D() {
    return (
        <div className="fixed inset-0 z-0">
            <CanvasErrorBoundary fallback={<Fallback />}>
                <Scene />
            </CanvasErrorBoundary>
        </div>
    );
}
