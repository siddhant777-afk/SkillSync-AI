import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Sparkles, Trophy, ShieldCheck, Code2 } from "lucide-react";
import { SiLeetcode, SiCodeforces, SiCodechef } from "react-icons/si";
import { FaGithub } from "react-icons/fa";

const Auth3DCanvas = ({ title = "AI Career Intelligence", subtitle = "Automated Placement Verification" }) => {
  const mountRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7.5;

    // 2. WebGL Renderer with Anti-aliasing
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 3, 20); // Indigo
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x10b981, 2.5, 20); // Emerald
    pointLight2.position.set(-5, -4, 4);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x38bdf8, 2, 20); // Sky Cyan
    pointLight3.position.set(0, 5, -3);
    scene.add(pointLight3);

    // 4. Geometries & Meshes
    // Inner Solid Faceted Core
    const coreGeo = new THREE.DodecahedronGeometry(1.2, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Outer Tech Wireframe Lattice (Icosahedron)
    const wireGeo = new THREE.IcosahedronGeometry(2.0, 1);
    const wireframe = new THREE.WireframeGeometry(wireGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.45 });
    const wireMesh = new THREE.LineSegments(wireframe, lineMat);
    scene.add(wireMesh);

    // Outer Secondary Floating Nodes (Vertices)
    const nodeGeo = new THREE.BufferGeometry();
    const nodeCount = 35;
    const nodePositions = new Float32Array(nodeCount * 3);
    for (let i = 0; i < nodeCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.0 + (Math.random() - 0.5) * 0.2;
      nodePositions[i] = r * Math.sin(phi) * Math.cos(theta);
      nodePositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      nodePositions[i + 2] = r * Math.cos(phi);
    }
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));
    const nodeMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.09,
      transparent: true,
      opacity: 0.9,
    });
    const nodePoints = new THREE.Points(nodeGeo, nodeMat);
    scene.add(nodePoints);

    // Orbiting Planetary Torus Ring 1
    const ring1Geo = new THREE.TorusGeometry(2.8, 0.018, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.4 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);

    // Orbiting Planetary Torus Ring 2
    const ring2Geo = new THREE.TorusGeometry(3.3, 0.015, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.35 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 6;
    scene.add(ring2);

    // Outer Particle Constellation Cloud
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 9;
      particlePositions[i + 1] = (Math.random() - 0.5) * 9;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xc7d2fe,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);

    // 5. Mouse & Tilt Tracking
    let targetRotX = 0;
    let targetRotY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;
      targetRotY = x * 0.85;
      targetRotX = -y * 0.85;
      setMousePos({ x, y });
    };

    window.addEventListener("pointermove", handlePointerMove);

    // 6. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 7. Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Constant rotation + smooth mouse tilt
      coreMesh.rotation.y += 0.008;
      coreMesh.rotation.x += 0.004;

      wireMesh.rotation.y -= 0.005;
      wireMesh.rotation.x += 0.003;

      nodePoints.rotation.y -= 0.005;
      nodePoints.rotation.x += 0.003;

      ring1.rotation.z += 0.006;
      ring2.rotation.z -= 0.005;

      particlePoints.rotation.y += 0.001;

      // Smooth camera interpolation towards mouse tilt
      camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 1.2 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Subtle breathing float
      coreMesh.position.y = Math.sin(elapsedTime * 1.5) * 0.12;
      wireMesh.position.y = Math.sin(elapsedTime * 1.5) * 0.12;
      nodePoints.position.y = Math.sin(elapsedTime * 1.5) * 0.12;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup on unmount
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);

      // Dispose Three.js objects
      coreGeo.dispose();
      coreMat.dispose();
      wireGeo.dispose();
      lineMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[420px] lg:min-h-[580px] flex items-center justify-center overflow-hidden select-none">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Ambient Gradient Glow Backdrop */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

      {/* Floating Holographic Telemetry Pills with CSS 3D Parallax */}
      <div
        style={{
          transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0)`,
          transition: "transform 0.15s ease-out",
        }}
        className="absolute top-8 left-6 sm:left-10 z-10 pointer-events-none rounded-2xl bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-indigo-500/30 p-3 shadow-xl flex items-center gap-2.5 text-white animate-bounce-subtle"
      >
        <div className="h-8 w-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
          <SiLeetcode size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Live Telemetry</p>
          <p className="text-xs font-black text-white">Contest Rating 1840+ · Knight</p>
        </div>
      </div>

      <div
        style={{
          transform: `translate3d(${-mousePos.x * 15}px, ${-mousePos.y * 15}px, 0)`,
          transition: "transform 0.15s ease-out",
        }}
        className="absolute bottom-12 left-6 sm:left-12 z-10 pointer-events-none rounded-2xl bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-indigo-500/30 p-3 shadow-xl flex items-center gap-2.5 text-white"
      >
        <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
          <FaGithub size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Verified Codebase</p>
          <p className="text-xs font-black text-white">850+ Commits · Production Repos</p>
        </div>
      </div>

      <div
        style={{
          transform: `translate3d(${mousePos.x * 16}px, ${-mousePos.y * 14}px, 0)`,
          transition: "transform 0.15s ease-out",
        }}
        className="absolute top-12 right-6 sm:right-10 z-10 pointer-events-none rounded-2xl bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-indigo-500/30 p-3 shadow-xl flex items-center gap-2.5 text-white"
      >
        <div className="h-8 w-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
          <Trophy size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Placement Readiness</p>
          <p className="text-xs font-black text-white">96/100 · Tier-1 FAANG Ready</p>
        </div>
      </div>

      {/* Bottom Center Brand Subtitle */}
      <div className="absolute bottom-4 z-10 text-center pointer-events-none px-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-950/60 backdrop-blur-md border border-indigo-500/30 px-3.5 py-1 text-[11px] font-bold text-indigo-200 shadow-sm">
          <Sparkles size={13} className="text-indigo-400" />
          <span>Interactive 3D Career Intelligence Model · Move cursor to interact</span>
        </div>
      </div>
    </div>
  );
};

export default Auth3DCanvas;
