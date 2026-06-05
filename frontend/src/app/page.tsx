"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shield, ChevronDown, X, ArrowLeft, Check, Scan } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import StructuredData from "@/components/seo/StructuredData";
import Preloader from "@/components/Preloader";
import SidebarNav from "@/components/nav/SidebarNav";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ─── Custom Cursor ──────────────────────────────────

function CustomCursor() {
    const ringRef = useRef<HTMLDivElement>(null);
    const dotRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ring = ringRef.current;
        const dot = dotRef.current;
        if (!ring || !dot) return;

        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        const onMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            gsap.set(dot, { x: mouseX, y: mouseY, xPercent: -50, yPercent: -50 });
        };

        const onEnterLink = () => gsap.to(ring, { scale: 2.5, opacity: 0.3, duration: 0.3 });
        const onLeaveLink = () => gsap.to(ring, { scale: 1, opacity: 1, duration: 0.3 });

        document.addEventListener("mousemove", onMove as any);
        document.querySelectorAll("a, button, [data-hover]").forEach((el) => {
            el.addEventListener("mouseenter", onEnterLink);
            el.addEventListener("mouseleave", onLeaveLink);
        });

        gsap.ticker.add(() => {
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;
            gsap.set(ring, { x: ringX, y: ringY, xPercent: -50, yPercent: -50 });
        });

        return () => {
            document.removeEventListener("mousemove", onMove as any);
            gsap.ticker.lagSmoothing(0);
        };
    }, []);

    return (
        <>
            <div ref={ringRef} className="fixed top-0 left-0 w-8 h-8 rounded-full border border-white/40 pointer-events-none z-[9999] mix-blend-difference hidden md:block" style={{ willChange: "transform" }} />
            <div ref={dotRef} className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-white pointer-events-none z-[9999] hidden md:block" style={{ willChange: "transform" }} />
        </>
    );
}

// ─── Sound Toggle ──────────────────────────────────

function SoundToggle() {
    const [muted, setMuted] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = 24;
        canvas.height = 24;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;

        const draw = () => {
            ctx.clearRect(0, 0, 24, 24);
            ctx.beginPath();
            ctx.moveTo(4, 9);
            ctx.lineTo(8, 9);
            ctx.lineTo(13, 4);
            ctx.lineTo(13, 20);
            ctx.lineTo(8, 15);
            ctx.lineTo(4, 15);
            ctx.closePath();
            ctx.stroke();
            if (!muted) {
                ctx.beginPath();
                ctx.arc(18, 12, 4, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(20, 12, 2, 0, Math.PI * 2);
                ctx.stroke();
            }
        };
        draw();
    }, [muted]);

    return (
        <button onClick={() => setMuted(!muted)} className="w-6 h-6 opacity-40 hover:opacity-100 transition-opacity">
            <canvas ref={canvasRef} width="24" height="24" />
        </button>
    );
}

// ─── 3D Tilt Card ──────────────────────────────────

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const cardRef = useRef<HTMLDivElement>(null);

    const onMouseMove = (e: React.MouseEvent) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(card, { rotateX: -y * 12, rotateY: x * 12, transformPerspective: 1000, duration: 0.4, ease: "power2.out" });
    };

    const onMouseLeave = () => {
        const card = cardRef.current;
        if (!card) return;
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.4, ease: "power2.out" });
    };

    return (
        <div ref={cardRef} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} className={className} style={{ transformStyle: "preserve-3d" }}>
            {children}
        </div>
    );
}

// ─── Hero ──────────────────────────────────────────

function Hero({ onGetStarted }: { onGetStarted: () => void }) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tl = gsap.timeline({ delay: 0.4 });
        tl.fromTo(".hero-line", { opacity: 0, y: 50, clipPath: "inset(0 0 100% 0)" }, { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 1.2, ease: "power3.out", stagger: 0.18 })
          .fromTo(".hero-sub", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "-=0.4")
          .fromTo(".hero-actions", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.3")
          .fromTo(".hero-scroll", { opacity: 0 }, { opacity: 1, duration: 0.6 }, "-=0.2");

        gsap.to(textRef.current, { y: 120, opacity: 0, ease: "none", scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: 0.5 } });
    }, []);

    return (
        <section ref={sectionRef} className="relative z-10 h-screen flex flex-col items-center justify-center px-6 snap-start">
            <div ref={textRef} className="flex flex-col items-center text-center max-w-6xl">
                <div className="hero-line text-5xl md:text-7xl lg:text-[100px] font-black tracking-tighter leading-[0.85] mb-1">
                    Protect your art
                </div>
                <div className="hero-line text-5xl md:text-7xl lg:text-[100px] font-black tracking-tighter leading-[0.85] mb-1 text-white">
                    from AI theft
                </div>

                <p className="hero-sub text-xs md:text-sm text-zinc-500 max-w-xs mt-10 mb-14 leading-relaxed tracking-widest uppercase font-bold">
                    C2PA certificates &bull; DMCA automation &bull; Neural monitoring
                </p>

                <div className="hero-actions flex flex-col sm:flex-row items-center gap-4">
                    <button onClick={onGetStarted} data-hover className="px-10 py-4 bg-white text-black rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all active:scale-[0.97] shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                        Get Started Free
                    </button>
                    <Link href="/features" data-hover className="px-8 py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/20 transition-all">
                        See Features
                    </Link>
                </div>
            </div>

            <div className="hero-scroll absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0">
                <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-[0.4em]">Scroll</span>
                <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />
                </motion.div>
            </div>
        </section>
    );
}

// ─── Stats Counter ──────────────────────────────────

function Stats() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".stat-num", { textContent: 0, duration: 2, ease: "power2.out", snap: { textContent: 1 }, scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none none" }, stagger: 0.15 });
            gsap.from(".stat-label", { opacity: 0, y: 15, duration: 0.6, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none none" } });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    const stats = [
        { num: "12M+", label: "Artworks Protected" },
        { num: "99.7%", label: "Detection Rate" },
        { num: "48h", label: "Avg DMCA Response" },
        { num: "150+", label: "Platforms Covered" },
    ];

    return (
        <section ref={sectionRef} className="relative z-10 py-24 px-6 border-t border-white/[0.04] snap-start">
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
                {stats.map((s) => (
                    <div key={s.label} className="text-center">
                        <div className="stat-num text-4xl md:text-5xl font-black tracking-tighter text-white mb-2">{s.num}</div>
                        <div className="stat-label text-[9px] text-zinc-600 font-bold uppercase tracking-[0.3em]">{s.label}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ─── Lusion-style immersive 3D product demo (raw Three.js + GLSL) ─

const DEMO_STEPS = [
    { label: "Your art. Protected.", sub: "Scroll to explore how CVBER works.", color: [1, 1, 1] },
    { label: "Upload.", sub: "Drop any artwork — PSD, PNG, JPG, SVG.", color: [0.9, 0.9, 1] },
    { label: "Analyze.", sub: "AI fingerprints every pixel of your work.", color: [0.3, 0.5, 1] },
    { label: "Scan.", sub: "12.4M+ sites searched in real-time.", color: [1, 1, 1] },
    { label: "Detect.", sub: "3 unauthorized copies found.", color: [1, 0.3, 0.3] },
    { label: "Protect.", sub: "Takedowns filed. You're safe.", color: [0.3, 1, 0.5] },
];

// GLSL — spiral particle shader
const pVert = `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uSpread;
    attribute float aAngle;
    attribute float aRadius;
    attribute float aSpeed;
    varying float vAlpha;
    varying float vDist;
    void main() {
        float angle = aAngle + uTime * aSpeed * 0.4;
        float r = aRadius * uSpread * (0.7 + 0.3 * sin(uTime * aSpeed + aAngle * 2.0));
        vec3 pos = vec3(cos(angle) * r, sin(angle) * r * 0.55, sin(angle) * r * 0.25);
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        vec2 sp = mv.xy / mv.z;
        float md = length(sp - uMouse * 2.0);
        pos.xy += normalize(sp - uMouse * 2.0) * smoothstep(1.2, 0.0, md) * 0.4;
        mv = modelViewMatrix * vec4(pos, 1.0);
        vDist = length(pos);
        vAlpha = smoothstep(7.0, 1.5, vDist) * (0.35 + 0.25 * sin(uTime + aAngle));
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (2.5 + 1.5 * sin(uTime * aSpeed)) * (250.0 / -mv.z);
    }
`;
const pFrag = `
    uniform vec3 uColor;
    uniform float uTime;
    varying float vAlpha;
    varying float vDist;
    void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float glow = pow(1.0 - smoothstep(0.0, 0.5, d), 2.0);
        float f = 0.8 + 0.2 * sin(uTime * 2.5 + vDist * 4.0);
        gl_FragColor = vec4(uColor * f, glow * vAlpha);
    }
`;

function LusionCanvas({ scrollProgress, mouseX, mouseY }: { scrollProgress: React.MutableRefObject<number>; mouseX: React.MutableRefObject<number>; mouseY: React.MutableRefObject<number> }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        let cleanup = false;

        import("three").then((THREE) => {
            if (cleanup) return;

            const scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x000000, 0.1);
            const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
            camera.position.set(0, 0, 6);

            const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.1;

            // ── Lights ──
            scene.add(new THREE.AmbientLight(0xffffff, 0.35));
            const key = new THREE.DirectionalLight(0xffffff, 1.2);
            key.position.set(3, 4, 5);
            scene.add(key);
            const fill = new THREE.PointLight(0x4488ff, 0.4, 10);
            fill.position.set(-3, 1, -2);
            scene.add(fill);

            // ══════════════════════════════════════
            // SCENE ELEMENTS — each step has unique 3D
            // ══════════════════════════════════════

            // ── STEP 0/1: Artwork (icosahedron) ──
            const artGroup = new THREE.Group();
            const artGeo = new THREE.IcosahedronGeometry(0.7, 2);
            const artMat = new THREE.MeshPhysicalMaterial({
                color: 0xffffff, metalness: 0.4, roughness: 0.15,
                emissive: 0xffffff, emissiveIntensity: 0.08,
                clearcoat: 0.5,
            });
            const artMesh = new THREE.Mesh(artGeo, artMat);
            artGroup.add(artMesh);
            const wireGeo = new THREE.IcosahedronGeometry(0.73, 2);
            const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.06 });
            const wireMesh = new THREE.Mesh(wireGeo, wireMat);
            artGroup.add(wireMesh);
            scene.add(artGroup);

            // ── STEP 2: Analysis — orbiting rings + inner core ──
            const analysisGroup = new THREE.Group();
            const coreGeo = new THREE.OctahedronGeometry(0.3, 0);
            const coreMat = new THREE.MeshPhysicalMaterial({
                color: 0x4488ff, emissive: 0x4488ff, emissiveIntensity: 0.4,
                metalness: 0.6, roughness: 0.2, transparent: true, opacity: 0,
            });
            const coreMesh = new THREE.Mesh(coreGeo, coreMat);
            analysisGroup.add(coreMesh);
            const analysisRings: any[] = [];
            for (let i = 0; i < 5; i++) {
                const rr = 0.5 + i * 0.25;
                const rg = new THREE.TorusGeometry(rr, 0.004, 16, 80);
                const rm = new THREE.MeshBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0 });
                const ring = new THREE.Mesh(rg, rm);
                ring.rotation.x = Math.PI / 2 + (i - 2) * 0.15;
                ring.rotation.z = i * 0.3;
                analysisRings.push({ mesh: ring, base: i * 0.3 });
                analysisGroup.add(ring);
            }
            // Fingerprint lines
            const fpLines: any[] = [];
            for (let i = 0; i < 8; i++) {
                const pts = [];
                for (let j = 0; j < 30; j++) {
                    const t = j / 29;
                    const x = (t - 0.5) * 2;
                    const y = Math.sin(t * Math.PI * 3 + i * 0.7) * 0.15 * (1 + i * 0.1);
                    pts.push(new THREE.Vector3(x, y + (i - 3.5) * 0.12, 0));
                }
                const lg = new THREE.BufferGeometry().setFromPoints(pts);
                const lm = new THREE.LineBasicMaterial({ color: 0x4488ff, transparent: true, opacity: 0 });
                const line = new THREE.Line(lg, lm);
                fpLines.push(line);
                analysisGroup.add(line);
            }
            analysisGroup.visible = false;
            scene.add(analysisGroup);

            // ── STEP 3: Scan — expanding wave rings ──
            const scanGroup = new THREE.Group();
            const scanRings: any[] = [];
            for (let i = 0; i < 6; i++) {
                const sg = new THREE.RingGeometry(0.8 + i * 0.3, 0.82 + i * 0.3, 64);
                const sm = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide });
                const sMesh = new THREE.Mesh(sg, sm);
                sMesh.rotation.x = -Math.PI / 2;
                scanRings.push({ mesh: sMesh, delay: i * 0.15 });
                scanGroup.add(sMesh);
            }
            // Scan lines (radial)
            const scanLines: any[] = [];
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2;
                const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(angle) * 4, 0, Math.sin(angle) * 4)];
                const slg = new THREE.BufferGeometry().setFromPoints(pts);
                const slm = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
                const sl = new THREE.Line(slg, slm);
                scanLines.push(sl);
                scanGroup.add(sl);
            }
            scanGroup.visible = false;
            scene.add(scanGroup);

            // ── STEP 4: Detect — red threat cubes ──
            const detectGroup = new THREE.Group();
            const threats: any[] = [];
            for (let i = 0; i < 5; i++) {
                const tg = new THREE.BoxGeometry(0.15, 0.15, 0.15);
                const tm = new THREE.MeshPhysicalMaterial({
                    color: 0xff3333, emissive: 0xff3333, emissiveIntensity: 0.5,
                    transparent: true, opacity: 0, metalness: 0.5, roughness: 0.3,
                });
                const tMesh = new THREE.Mesh(tg, tm);
                const a = (i / 5) * Math.PI * 2;
                tMesh.position.set(Math.cos(a) * 2.5, Math.sin(a) * 1.5, Math.sin(a) * 0.8);
                threats.push({ mesh: tMesh, angle: a, speed: 0.5 + Math.random() * 0.5 });
                detectGroup.add(tMesh);
            }
            // Warning ring
            const warnGeo = new THREE.TorusGeometry(1.8, 0.01, 8, 60);
            const warnMat = new THREE.MeshBasicMaterial({ color: 0xff3333, transparent: true, opacity: 0 });
            const warnRing = new THREE.Mesh(warnGeo, warnMat);
            warnRing.rotation.x = Math.PI / 2;
            detectGroup.add(warnRing);
            detectGroup.visible = false;
            scene.add(detectGroup);

            // ── STEP 5: Protect — shield + green glow ──
            const protectGroup = new THREE.Group();
            const shieldGeo = new THREE.SphereGeometry(1.5, 32, 32);
            const shieldMat = new THREE.MeshPhysicalMaterial({
                color: 0x44ff88, transparent: true, opacity: 0,
                emissive: 0x44ff88, emissiveIntensity: 0.15,
                metalness: 0.2, roughness: 0.3, side: THREE.DoubleSide,
            });
            const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
            protectGroup.add(shieldMesh);
            // Checkmark
            const chkPts = [new THREE.Vector3(-0.3, 0, 0), new THREE.Vector3(-0.05, -0.25, 0), new THREE.Vector3(0.35, 0.3, 0)];
            const chkGeo = new THREE.BufferGeometry().setFromPoints(chkPts);
            const chkMat = new THREE.LineBasicMaterial({ color: 0x44ff88, transparent: true, opacity: 0, linewidth: 2 });
            const chkLine = new THREE.Line(chkGeo, chkMat);
            protectGroup.add(chkLine);
            // Orbiting shield particles
            const shieldParticles: any[] = [];
            for (let i = 0; i < 20; i++) {
                const sg2 = new THREE.SphereGeometry(0.03, 8, 8);
                const sm2 = new THREE.MeshBasicMaterial({ color: 0x44ff88, transparent: true, opacity: 0 });
                const sMesh2 = new THREE.Mesh(sg2, sm2);
                const a = (i / 20) * Math.PI * 2;
                sMesh2.position.set(Math.cos(a) * 1.6, Math.sin(a) * 1.6, 0);
                shieldParticles.push({ mesh: sMesh2, angle: a });
                protectGroup.add(sMesh2);
            }
            protectGroup.visible = false;
            scene.add(protectGroup);

            // ── Particles (GLSL) ──
            const pCount = 800;
            const pPos = new Float32Array(pCount * 3);
            const pAng = new Float32Array(pCount);
            const pRad = new Float32Array(pCount);
            const pSpd = new Float32Array(pCount);
            for (let i = 0; i < pCount; i++) {
                pAng[i] = Math.random() * Math.PI * 2;
                pRad[i] = 1.0 + Math.random() * 4.0;
                pSpd[i] = 0.2 + Math.random() * 0.8;
            }
            const pGeo = new THREE.BufferGeometry();
            pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
            pGeo.setAttribute("aAngle", new THREE.BufferAttribute(pAng, 1));
            pGeo.setAttribute("aRadius", new THREE.BufferAttribute(pRad, 1));
            pGeo.setAttribute("aSpeed", new THREE.BufferAttribute(pSpd, 1));
            const pMat = new THREE.ShaderMaterial({
                uniforms: { uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() }, uSpread: { value: 1 }, uColor: { value: new THREE.Color(1, 1, 1) } },
                vertexShader: pVert, fragmentShader: pFrag,
                transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
            });
            scene.add(new THREE.Points(pGeo, pMat));

            // ── Grid floor ──
            const gridGeo = new THREE.PlaneGeometry(20, 20, 40, 40);
            const gridMat = new THREE.ShaderMaterial({
                uniforms: { uTime: { value: 0 }, uScroll: { value: 0 } },
                vertexShader: `uniform float uTime; uniform float uScroll; varying float vA; void main(){vec3 p=pos;p.z+=sin(p.x*2.+uTime)*.04*uScroll;p.z+=cos(p.y*2.+uTime*.7)*.03*uScroll;vec4 mv=modelViewMatrix*vec4(p,1.);vA=smoothstep(18.,2.,length(p.xy))*.12*uScroll;gl_Position=projectionMatrix*mv;}`,
                fragmentShader: `varying float vA;void main(){gl_FragColor=vec4(1.,1.,1.,vA);}`,
                transparent: true, wireframe: true, depthWrite: false,
            });
            const grid = new THREE.Mesh(gridGeo, gridMat);
            grid.rotation.x = -Math.PI / 2;
            grid.position.y = -2;
            scene.add(grid);

            // ══════════════════════════════════════
            // ANIMATION LOOP
            // ══════════════════════════════════════
            let time = 0;
            const targetCol = new THREE.Color(1, 1, 1);

            const anim = () => {
                if (cleanup) return;
                time += 0.016;
                const sp = scrollProgress.current;
                const mx = mouseX.current;
                const my = mouseY.current;
                const stepF = sp * (DEMO_STEPS.length - 1);
                const step = Math.floor(stepF);
                const blend = stepF - step;

                // Camera — cinematic path
                const camY = Math.sin(sp * Math.PI) * 0.6;
                const camZ = 6 - sp * 1.2;
                camera.position.x += (mx * 0.35 - camera.position.x) * 0.02;
                camera.position.y += (camY - my * 0.15 - camera.position.y) * 0.02;
                camera.position.z += (camZ - camera.position.z) * 0.02;
                camera.lookAt(0, 0, 0);

                // Color
                const sc = DEMO_STEPS[Math.min(step, 5)].color;
                const nc = DEMO_STEPS[Math.min(step + 1, 5)].color;
                targetCol.setRGB(sc[0] + (nc[0] - sc[0]) * blend, sc[1] + (nc[1] - sc[1]) * blend, sc[2] + (nc[2] - sc[2]) * blend);
                (pMat.uniforms.uColor as any).value.lerp(targetCol, 0.04);

                // ── Show/hide scene groups based on step ──
                artGroup.visible = step <= 1;
                analysisGroup.visible = step === 2;
                scanGroup.visible = step === 3;
                detectGroup.visible = step === 4;
                protectGroup.visible = step === 5;

                // ── STEP 0/1: Artwork ──
                if (artGroup.visible) {
                    const artVis = step === 0 ? 1 - blend : step === 1 ? blend : 1;
                    artMesh.visible = true;
                    wireMesh.visible = true;
                    artGroup.scale.setScalar(artVis);
                    artMesh.rotation.x = time * 0.25 + sp * Math.PI;
                    artMesh.rotation.y = time * 0.4 + sp * Math.PI * 0.5;
                    wireMesh.rotation.copy(artMesh.rotation);
                    artMat.emissiveIntensity = 0.08 + Math.sin(time * 2) * 0.03;
                }

                // ── STEP 2: Analysis ──
                if (analysisGroup.visible) {
                    coreMat.opacity = 0.8;
                    coreMesh.rotation.x = time * 0.8;
                    coreMesh.rotation.y = time * 1.2;
                    coreMesh.scale.setScalar(0.8 + Math.sin(time * 3) * 0.15);
                    analysisRings.forEach((r, i) => {
                        (r.mesh.material as any).opacity = 0.25 + Math.sin(time * 2 + i) * 0.1;
                        r.mesh.rotation.z = time * 0.5 * (i + 1) + r.base;
                    });
                    fpLines.forEach((l, i) => {
                        (l.material as any).opacity = 0.3 + Math.sin(time * 2 + i * 0.5) * 0.15;
                    });
                }

                // ── STEP 3: Scan ──
                if (scanGroup.visible) {
                    scanRings.forEach((r, i) => {
                        const t = ((time * 0.8 + r.delay) % 2) / 2;
                        const scale = 0.5 + t * 2;
                        r.mesh.scale.set(scale, scale, 1);
                        (r.material as any).opacity = (1 - t) * 0.3;
                    });
                    scanLines.forEach((l, i) => {
                        (l.material as any).opacity = 0.15 + Math.sin(time * 3 + i) * 0.08;
                    });
                }

                // ── STEP 4: Detect ──
                if (detectGroup.visible) {
                    threats.forEach((t, i) => {
                        (t.mesh.material as any).opacity = 0.8;
                        const a = t.angle + time * t.speed;
                        t.mesh.position.x = Math.cos(a) * (2.0 + Math.sin(time * 2) * 0.3);
                        t.mesh.position.y = Math.sin(a) * (1.2 + Math.cos(time * 1.5) * 0.2);
                        t.mesh.position.z = Math.sin(a) * 0.6;
                        t.mesh.rotation.x = time * 2;
                        t.mesh.rotation.y = time * 1.5;
                    });
                    (warnMat as any).opacity = 0.3 + Math.sin(time * 4) * 0.15;
                    warnRing.rotation.z = time * 0.5;
                }

                // ── STEP 5: Protect ──
                if (protectGroup.visible) {
                    (shieldMat as any).opacity = 0.1 + Math.sin(time * 1.5) * 0.04;
                    shieldMesh.rotation.y = time * 0.15;
                    shieldMesh.rotation.x = time * 0.1;
                    (chkMat as any).opacity = 0.6 + Math.sin(time * 2) * 0.2;
                    shieldParticles.forEach((sp2, i) => {
                        (sp2.mesh.material as any).opacity = 0.6;
                        const a = sp2.angle + time * 0.3;
                        sp2.mesh.position.x = Math.cos(a) * 1.6;
                        sp2.mesh.position.y = Math.sin(a) * 1.6;
                        sp2.mesh.position.z = Math.sin(time + i) * 0.2;
                    });
                }

                // Particles
                (pMat.uniforms.uTime as any).value = time;
                (pMat.uniforms.uMouse as any).value.set(mx, my);
                (pMat.uniforms.uSpread as any).value = step === 3 ? 1.8 : step === 4 ? 0.6 : 1;

                // Grid
                (gridMat.uniforms.uTime as any).value = time;
                (gridMat.uniforms.uScroll as any).value = sp;

                renderer.render(scene, camera);
                requestAnimationFrame(anim);
            };
            anim();

            const ro = new ResizeObserver(() => {
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            });
            ro.observe(canvas);

            return () => { cleanup = true; renderer.dispose(); ro.disconnect(); };
        });
        return () => { cleanup = true; };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }} />;
}

function LusionDemo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollProgress = useRef(0);
    const mouseX = useRef(0);
    const mouseY = useRef(0);
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const onScroll = () => {
            const el = containerRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const h = el.offsetHeight - window.innerHeight;
            const p = Math.max(0, Math.min(1, -rect.top / h));
            scrollProgress.current = p;
            setActiveStep(Math.min(DEMO_STEPS.length - 1, Math.floor(p * DEMO_STEPS.length)));
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            mouseX.current = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY.current = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, []);

    return (
        <div ref={containerRef} className="relative" style={{ height: `${DEMO_STEPS.length * 100}vh` }}>
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                <LusionCanvas scrollProgress={scrollProgress} mouseX={mouseX} mouseY={mouseY} />

                {/* Text overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStep}
                            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            className="text-center px-6"
                        >
                            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.9] mb-4">
                                {DEMO_STEPS[activeStep].label}
                            </h2>
                            <p className="text-sm md:text-base text-zinc-400 max-w-lg mx-auto leading-relaxed">
                                {DEMO_STEPS[activeStep].sub}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Scroll hint */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-10">
                    <div className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/30">Scroll</div>
                    <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
                </div>

                {/* Step dots */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 pointer-events-none z-10">
                    {DEMO_STEPS.map((s, i) => (
                        <div key={i} className="relative">
                            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === activeStep ? "bg-white scale-150" : "bg-white/15"}`} />
                            {i === activeStep && <motion.div layoutId="dot" className="absolute -inset-1 rounded-full border border-white/20" />}
                        </div>
                    ))}
                </div>

                {/* Progress */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5 z-10">
                    <motion.div className="h-full bg-white/20" style={{ width: `${scrollProgress.current * 100}%` }} />
                </div>
            </div>
        </div>
    );
}

// ─── Interactive Product Demo ──────────────────────

function ProductDemo() {
    const [phase, setPhase] = useState<"idle" | "scanning" | "results" | "protecting" | "protected">("idle");
    const [progress, setProgress] = useState(0);
    const sectionRef = useRef<HTMLDivElement>(null);
    const scanlineRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const demoImage = "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop&q=80";

    // Animated background grid
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = 600;
        canvas.height = 600;
        let dots: { x: number; y: number; vx: number; vy: number }[] = [];
        for (let i = 0; i < 60; i++) {
            dots.push({ x: Math.random() * 600, y: Math.random() * 600, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3 });
        }
        let frame: number;
        const animate = () => {
            ctx.clearRect(0, 0, 600, 600);
            dots.forEach((d) => {
                d.x += d.vx; d.y += d.vy;
                if (d.x < 0) d.x = 600; if (d.x > 600) d.x = 0;
                if (d.y < 0) d.y = 600; if (d.y > 600) d.y = 0;
                ctx.beginPath();
                ctx.arc(d.x, d.y, 1, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255,255,255,0.15)";
                ctx.fill();
            });
            frame = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(frame);
    }, []);

    // Scanline animation
    useEffect(() => {
        if (phase !== "scanning") return;
        setProgress(0);
        let start: number;
        const duration = 2500;
        const animate = (t: number) => {
            if (!start) start = t;
            const elapsed = t - start;
            const p = Math.min(elapsed / duration, 1);
            setProgress(p);
            if (scanlineRef.current) {
                scanlineRef.current.style.top = `${p * 100}%`;
            }
            if (p < 1) requestAnimationFrame(animate);
        };
        const raf = requestAnimationFrame(animate);
        const timeout = setTimeout(() => setPhase("results"), duration + 300);
        return () => { cancelAnimationFrame(raf); clearTimeout(timeout); };
    }, [phase]);

    const startScan = () => setPhase("scanning");
    const startProtect = () => {
        setPhase("protecting");
        setTimeout(() => setPhase("protected"), 1800);
    };
    const reset = () => { setPhase("idle"); setProgress(0); };

    return (
        <section ref={sectionRef} className="relative z-10 py-28 px-6 border-t border-white/[0.04] snap-start">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-14">
                    <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600 mb-4">Try It Yourself</div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9]">Scan an artwork.<br />See what CVBER finds.</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-10 items-center">
                    {/* LEFT: Artwork + Scanner */}
                    <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/[0.08] bg-[#0a0a0a]">
                        <img src={demoImage} alt="Sample artwork" className="w-full h-full object-cover" />
                        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
                        {phase === "scanning" && (
                            <div ref={scanlineRef} className="absolute left-0 right-0 h-[3px] z-10 pointer-events-none" style={{ top: "0%" }}>
                                <div className="w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
                            </div>
                        )}
                        {phase === "protected" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                                    <div className="w-24 h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                        <Shield className="w-12 h-12 text-white" />
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Controls + Results */}
                    <div className="flex flex-col gap-6">
                        {phase === "idle" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    Upload any artwork to scan for AI vulnerabilities, missing C2PA certificates, and unprotected metadata.
                                </p>
                                <button onClick={startScan} data-hover className="px-8 py-4 bg-white text-black rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all active:scale-[0.97] self-start shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center gap-3">
                                    <Scan className="w-4 h-4" /> Scan This Artwork
                                </button>
                            </motion.div>
                        )}

                        {phase === "scanning" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                                <div className="flex items-center gap-3">
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                                        <Scan className="w-5 h-5 text-white" />
                                    </motion.div>
                                    <span className="text-sm font-bold tracking-wider uppercase text-zinc-300">Scanning...</span>
                                </div>
                                <div className="h-px bg-white/[0.08] relative overflow-hidden rounded-full">
                                    <motion.div className="absolute inset-y-0 left-0 bg-white" style={{ width: `${progress * 100}%` }} />
                                </div>
                                <p className="text-xs text-zinc-500">Analyzing metadata, C2PA signatures, blockchain records, and AI training datasets...</p>
                            </motion.div>
                        )}

                        {phase === "results" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                                <div className="text-sm font-bold tracking-wider uppercase text-zinc-300 mb-1">Scan Results</div>
                                {[
                                    { label: "C2PA Certificate", found: false, detail: "No cryptographic proof detected" },
                                    { label: "Blockchain Record", found: false, detail: "No timestamp found" },
                                    { label: "AI Training Data", found: true, detail: "Found in 3 datasets (LAION, CommonCrawl, WikiArt)" },
                                    { label: "DMCA History", found: false, detail: "No prior takedowns" },
                                ].map((r) => (
                                    <div key={r.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${r.found ? "bg-red-500/20" : "bg-white/[0.06]"}`}>
                                            <div className={`w-2 h-2 rounded-full ${r.found ? "bg-red-400" : "bg-zinc-500"}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-zinc-300">{r.label}</div>
                                            <div className="text-[10px] text-zinc-600">{r.detail}</div>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={startProtect} data-hover className="mt-2 px-8 py-4 bg-white text-black rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all active:scale-[0.97] self-start shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center gap-3">
                                    <Shield className="w-4 h-4" /> Protect with CVBER
                                </button>
                            </motion.div>
                        )}

                        {phase === "protecting" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                                <div className="flex items-center gap-3">
                                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                                        <Shield className="w-5 h-5 text-white" />
                                    </motion.div>
                                    <span className="text-sm font-bold tracking-wider uppercase text-zinc-300">Applying Protection...</span>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {["Generating C2PA certificate", "Writing blockchain record", "Registering DMCA agent", "Adding monitoring watch"].map((s, i) => (
                                        <motion.div key={s} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.4 }} className="flex items-center gap-3 text-xs text-zinc-400">
                                            <motion.div animate={{ opacity: [0, 1] }} transition={{ delay: i * 0.4 + 0.2 }} className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                                                <Check className="w-2.5 h-2.5 text-white" />
                                            </motion.div>
                                            {s}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {phase === "protected" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10 }} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                        <Check className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Fully Protected</div>
                                        <div className="text-[10px] text-zinc-500">C2PA + Blockchain + DMCA + Monitoring active</div>
                                    </div>
                                </motion.div>
                                <div className="grid grid-cols-2 gap-2">
                                    {["C2PA Certificate", "Blockchain Proof", "DMCA Agent", "24/7 Monitoring"].map((s) => (
                                        <div key={s} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                            <Check className="w-3 h-3 text-green-400 shrink-0" />
                                            <span className="text-[10px] text-zinc-400">{s}</span>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={reset} data-hover className="px-8 py-3 rounded-full text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/20 transition-all self-start">
                                    Scan Another
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Product Cards ──────────────────────────────────

const products = [
    { id: "c2pa", num: "01", title: "C2PA Certificates", desc: "Cryptographic proof of ownership embedded in your files. Recognized by Adobe, Microsoft, and Google.", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&h=1200&fit=crop&q=80", tag: "Cryptographic Proof" },
    { id: "monitoring", num: "02", title: "Neural Monitoring", desc: "24/7 deep-web scanning across social platforms, marketplaces, and AI training datasets.", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=1200&fit=crop&q=80", tag: "AI Scanning" },
    { id: "dmca", num: "03", title: "DMCA Automation", desc: "One-click DMCA takedown notices. Send to any platform instantly with pre-filled legal forms.", img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=900&h=1200&fit=crop&q=80", tag: "Automated Enforcement" },
    { id: "blockchain", num: "04", title: "Blockchain Proof", desc: "Permanent, tamper-proof timestamps on the blockchain for irrefutable legal evidence.", img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=900&h=1200&fit=crop&q=80", tag: "Immutable Record" },
    { id: "sdk", num: "05", title: "Universal SDK", desc: "Protect your entire portfolio with two lines of code. Works with React, Vue, WordPress, and more.", img: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=900&h=1200&fit=crop&q=80", tag: "Developer API" },
];

// ─── Inline Onboarding ─────────────────────────────

function InlineOnboarding({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState("");
    const [answer, setAnswer] = useState("");
    const questions = [
        { q: "What kind of artist are you?", options: ["Digital Illustrator", "Photographer", "3D Artist", "AI Artist"] },
        { q: "Where do you publish your work?", options: ["Instagram", "DeviantArt", "ArtStation", "TikTok", "YouTube"] },
        { q: "What worries you most?", options: ["AI scraping", "Art theft", "Proving ownership", "DMCA hassle"] },
    ];

    const createAccount = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem("cvber_onboarding_complete", "true");
        onComplete();
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-[#050505] flex items-center justify-center">
            <div className="w-full max-w-lg px-6">
                <AnimatePresence mode="wait">
                    {step < questions.length ? (
                        <motion.div key={`q-${step}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600 mb-6">Step {step + 1} of {questions.length + 2}</div>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-8">{questions[step].q}</h2>
                            <div className="space-y-3">
                                {questions[step].options.map((opt) => (
                                    <button key={opt} onClick={() => { setAnswer(opt); setTimeout(() => setStep(step + 1), 200); }} className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all ${answer === opt ? "bg-white/10 border-white/20 text-white" : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:border-white/[0.12]"}`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                            {step > 0 && <button onClick={() => setStep(step - 1)} className="mt-6 text-xs text-zinc-500 hover:text-white flex items-center gap-2"><ArrowLeft className="w-3 h-3" /> Back</button>}
                        </motion.div>
                    ) : step === questions.length ? (
                        <motion.div key="email" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600 mb-6">Step {step + 1} of {step + 2}</div>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3">Create your account</h2>
                            <p className="text-zinc-500 text-sm mb-8">Free forever. No credit card.</p>
                            <form onSubmit={createAccount} className="space-y-3">
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className="w-full p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-white/20" />
                                <button type="submit" className="w-full py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 flex items-center justify-center gap-2 active:scale-[0.98]">Create Account <ArrowRight className="w-4 h-4" /></button>
                            </form>
                            <button onClick={() => setStep(step - 1)} className="mt-6 text-xs text-zinc-500 hover:text-white flex items-center gap-2"><ArrowLeft className="w-3 h-3" /> Back</button>
                        </motion.div>
                    ) : (
                        <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.6 }} className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-8">
                                <Check className="w-10 h-10 text-white" />
                            </motion.div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">You&apos;re all set.</h2>
                            <Link href="/dashboard" className="px-10 py-5 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 inline-flex items-center gap-3 active:scale-95">
                                Go to Dashboard <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
                {step <= questions.length && (
                    <button onClick={() => step === 0 ? onComplete() : setStep(step - 1)} className="absolute top-6 right-6 w-10 h-10 rounded-full border border-white/[0.08] flex items-center justify-center hover:border-white/20">
                        <X className="w-4 h-4 text-zinc-400" />
                    </button>
                )}
            </div>
        </motion.div>
    );
}

// ─── Page ───────────────────────────────────────────

export default function Home() {
    const [loaded, setLoaded] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [onboardingOpen, setOnboardingOpen] = useState(false);
    const gridRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!loaded) return;

        const el = gridRef.current;
        if (el) {
            const totalScroll = el.scrollWidth - window.innerWidth;
            if (totalScroll > 0) {
                gsap.to(el, { x: -totalScroll, ease: "none", scrollTrigger: { trigger: ".grid-section", start: "top 20%", end: "bottom top", scrub: 1, pin: true } });
            }
        }

        gsap.from("[data-anim='split'] > div", {
            opacity: 0, y: 40, duration: 1, stagger: 0.2, ease: "power3.out",
            scrollTrigger: { trigger: "[data-anim='split']", start: "top 75%", toggleActions: "play none none none" },
        });

        gsap.from("[data-anim='cta'] [data-child]", {
            opacity: 0, y: 30, duration: 0.8, stagger: 0.15, ease: "power2.out",
            scrollTrigger: { trigger: "[data-anim='cta']", start: "top 70%", toggleActions: "play none none none" },
        });
    }, [loaded]);

    return (
        <>
            <StructuredData />
            <Preloader onComplete={() => setLoaded(true)} />
            <AnimatePresence>
                {loaded && (
                    <motion.div ref={mainRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative bg-[#050505] text-white overflow-x-hidden">
                        <div className="fixed inset-0 z-[1] pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                        <CustomCursor />
                        <SidebarNav open={menuOpen} onClose={() => setMenuOpen(false)} onStartOnboarding={() => setOnboardingOpen(true)} />
                        <AnimatePresence>{onboardingOpen && <InlineOnboarding onComplete={() => setOnboardingOpen(false)} />}</AnimatePresence>

                        {/* ─── HEADER ─── */}
                        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 mix-blend-exclusion" style={{ zIndex: 60 }}>
                            <Link href="/" className="flex items-center gap-2.5">
                                <Shield className="w-5 h-5" />
                                <span className="text-sm font-black tracking-tight uppercase italic">CVBER</span>
                            </Link>
                            <div className="flex items-center gap-8">
                                <SoundToggle />
                                <Link href="/login" className="text-[10px] font-bold uppercase tracking-[0.25em] hover:opacity-60 transition-opacity">Log In</Link>
                                <button onClick={() => setOnboardingOpen(true)} className="text-[10px] font-bold uppercase tracking-[0.25em] hover:opacity-60 transition-opacity">Get Started</button>
                                <button onClick={() => setMenuOpen(true)} className="text-[10px] font-bold uppercase tracking-[0.25em] hover:opacity-60 transition-opacity">Menu</button>
                            </div>
                        </header>

                        {/* ─── HERO ─── */}
                        <Hero onGetStarted={() => setOnboardingOpen(true)} />

                        {/* ─── STATS ─── */}
                        <Stats />

                        {/* ─── LUSION-STYLE 3D DEMO ─── */}
                        <LusionDemo />

                        {/* ─── INTERACTIVE PRODUCT DEMO ─── */}
                        <ProductDemo />

                        {/* ─── PRODUCT GRID (horizontal scroll) ─── */}
                        <section className="grid-section relative z-10 h-screen overflow-hidden snap-start">
                            <div className="h-full flex flex-col justify-center px-6 md:px-16">
                                <div className="mb-14">
                                    <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600 mb-4">Products</div>
                                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9]">Everything you need</h2>
                                </div>
                                <div ref={gridRef} className="flex gap-6 w-max pb-8">
                                    {products.map((p) => (
                                        <TiltCard key={p.id} className="group w-[440px] shrink-0">
                                            <div className="relative h-[560px] rounded-3xl overflow-hidden border border-white/[0.06]">
                                                <img src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                                                <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] text-[9px] font-bold uppercase tracking-wider text-zinc-300">
                                                    {p.tag}
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                                                    <div className="text-[11px] font-mono text-zinc-500 mb-2">{p.num}</div>
                                                    <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-3">{p.title}</h3>
                                                    <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">{p.desc}</p>
                                                </div>
                                            </div>
                                        </TiltCard>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* ─── PROBLEM / SOLUTION ─── */}
                        <section className="relative z-10 py-48 px-6 border-t border-white/[0.04] snap-start">
                            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20" data-anim="split">
                                <div>
                                    <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600 mb-5">The Problem</div>
                                    <p className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1]">
                                        Every day, AI companies scrape millions of artworks without consent.
                                    </p>
                                </div>
                                <div>
                                    <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600 mb-5">The Solution</div>
                                    <p className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1] text-zinc-300">
                                        CVBER gives every artist free C2PA certificates, 24/7 AI monitoring, and automated DMCA enforcement.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* ─── CTA ─── */}
                        <section className="relative z-10 h-screen flex items-center justify-center px-6 snap-start border-t border-white/[0.04]" data-anim="cta">
                            <div className="text-center max-w-3xl">
                                <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600 mb-6" data-child>CVBER</div>
                                <h2 className="text-6xl md:text-8xl lg:text-[100px] font-black tracking-tighter leading-[0.85] mb-6 uppercase italic" data-child>Join the<br />Resistance.</h2>
                                <p className="text-zinc-500 text-xs max-w-md mx-auto mb-14 tracking-widest uppercase font-bold" data-child>Reclaim your digital sovereignty today.</p>
                                <div data-child>
                                    <button onClick={() => setOnboardingOpen(true)} data-hover className="px-12 py-4 bg-white text-black rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-zinc-100 transition-all active:scale-[0.97] shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                                        Secure Your Art
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* ─── FOOTER ─── */}
                        <footer className="relative z-10 py-16 px-6 border-t border-white/[0.04] snap-start">
                            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-zinc-600 font-bold text-[9px] uppercase tracking-[0.3em]">
                                <div className="flex items-center gap-3 opacity-30">
                                    <Shield className="w-5 h-5" />
                                    <span className="text-xs font-black tracking-tighter uppercase italic">CVBER</span>
                                </div>
                                <div className="flex flex-wrap justify-center gap-8">
                                    <Link href="/terms" className="hover:text-white">Terms</Link>
                                    <Link href="/privacy" className="hover:text-white">Privacy</Link>
                                    <Link href="/art-hub" className="hover:text-white">Help</Link>
                                </div>
                                <div className="opacity-40">&copy; 2026 CVBER</div>
                            </div>
                        </footer>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
