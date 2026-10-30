import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, Sparkles, Html } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitImpl } from "three-stdlib";
import type { Milestone, ViewMode } from "@/types/life";
import { MOOD_COLORS, hash01 } from "@/utils/palette";

interface Props {
  milestones: Milestone[];
  visibleCount: number;
  mode: ViewMode;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const ISLAND_R = 9;
const terrainH = (x: number, z: number) => {
  const d = Math.hypot(x, z) / ISLAND_R;
  const n = Math.sin(x * 0.7) * Math.cos(z * 0.6) * 0.5 + Math.sin((x + z) * 0.35) * 0.4;
  return Math.max(0.5, Math.round((1.6 - d * 1.4 + n) * 2) / 2);
};

function layoutIsland(list: Milestone[]) {
  return list.map((m, i) => {
    const a = i * 2.39996 + hash01(m.id) * 0.4;
    const r = 1.4 + Math.sqrt((i + 0.5) / Math.max(list.length, 1)) * (ISLAND_R - 2.4);
    const x = Math.round(Math.cos(a) * r);
    const z = Math.round(Math.sin(a) * r);
    return new THREE.Vector3(x, terrainH(x, z), z);
  });
}

function layoutSky(list: Milestone[]) {
  return list.map((m, i) => {
    const t = i / Math.max(list.length - 1, 1);
    const a = t * Math.PI * 3.2 + hash01(m.id) * 0.6;
    const r = 4 + t * 5;
    return new THREE.Vector3(Math.cos(a) * r, 2 + (hash01(m.id, 7) - 0.5) * 5 + t * 3, Math.sin(a) * r);
  });
}

/* ---------- Terrain ---------- */
function Terrain() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const cells = useMemo(() => {
    const out: { x: number; z: number; h: number }[] = [];
    for (let x = -ISLAND_R; x <= ISLAND_R; x++)
      for (let z = -ISLAND_R; z <= ISLAND_R; z++)
        if (Math.hypot(x, z) <= ISLAND_R + hash01(`${x},${z}`) * 0.8) out.push({ x, z, h: terrainH(x, z) });
    return out;
  }, []);
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    cells.forEach((cell, i) => {
      o.position.set(cell.x, cell.h / 2 - 1, cell.z);
      o.scale.set(1, cell.h + 2, 1);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      const edge = Math.hypot(cell.x, cell.z) > ISLAND_R - 1.2;
      c.set(edge ? "#e8d6a8" : cell.h > 1.4 ? "#6fbf73" : "#86d18a");
      c.offsetHSL(0, 0, (hash01(`${cell.x}:${cell.z}`) - 0.5) * 0.08);
      mesh.setColorAt(i, c);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [cells]);
  return (
    <group>
      <instancedMesh ref={ref} args={[undefined, undefined, cells.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.9} flatShading />
      </instancedMesh>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.2} receiveShadow>
        <circleGeometry args={[40, 48]} />
        <meshStandardMaterial color="#1d3b63" roughness={0.3} metalness={0.2} transparent opacity={0.92} />
      </mesh>
    </group>
  );
}

/* ---------- Structures per category ---------- */
function Structure({ m }: { m: Milestone }) {
  const col = MOOD_COLORS[m.mood];
  const s = m.significance;
  const mat = <meshStandardMaterial color={col} roughness={0.6} flatShading emissive={col} emissiveIntensity={0.12} />;
  switch (m.category) {
    case "Career":
      return (
        <group>
          {Array.from({ length: s + 1 }).map((_, i) => (
            <mesh key={i} position-y={i * 0.5 + 0.25} castShadow scale={[0.8 - i * 0.06, 0.5, 0.8 - i * 0.06]}>
              <boxGeometry />{i % 2 ? <meshStandardMaterial color="#f4efe6" flatShading /> : mat}
            </mesh>
          ))}
        </group>
      );
    case "Relationships":
      return (
        <group scale={0.6 + s * 0.12}>
          <mesh position-y={0.4} castShadow><boxGeometry args={[0.9, 0.8, 0.9]} /><meshStandardMaterial color="#f4efe6" flatShading /></mesh>
          <mesh position-y={1.05} rotation-y={Math.PI / 4} castShadow><coneGeometry args={[0.8, 0.6, 4]} />{mat}</mesh>
          <mesh position={[0, 0.3, 0.46]}><boxGeometry args={[0.22, 0.4, 0.02]} /><meshStandardMaterial color="#5a3d2b" /></mesh>
        </group>
      );
    case "Growth":
      return (
        <group scale={0.6 + s * 0.15}>
          <mesh position-y={0.4} castShadow><boxGeometry args={[0.2, 0.8, 0.2]} /><meshStandardMaterial color="#7a5236" flatShading /></mesh>
          <mesh position-y={1.0} castShadow><boxGeometry args={[0.8, 0.6, 0.8]} />{mat}</mesh>
          <mesh position-y={1.45} castShadow><boxGeometry args={[0.5, 0.4, 0.5]} />{mat}</mesh>
        </group>
      );
    case "Health":
      return (
        <group scale={0.6 + s * 0.12}>
          <mesh position-y={0.3} castShadow><cylinderGeometry args={[0.12, 0.16, 0.6, 6]} /><meshStandardMaterial color="#f4efe6" flatShading /></mesh>
          <mesh position-y={0.7} castShadow><sphereGeometry args={[0.45, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />{mat}</mesh>
        </group>
      );
    case "Creative":
      return (
        <group scale={0.5 + s * 0.15}>
          <mesh position-y={0.8} castShadow><octahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.6} roughness={0.2} flatShading />
          </mesh>
          <mesh position-y={0.1}><boxGeometry args={[0.7, 0.2, 0.7]} /><meshStandardMaterial color="#a69a8a" flatShading /></mesh>
        </group>
      );
    case "Travel":
    default:
      return (
        <group scale={0.6 + s * 0.12}>
          <mesh position-y={0.8} castShadow><cylinderGeometry args={[0.22, 0.32, 1.6, 6]} /><meshStandardMaterial color="#f4efe6" flatShading /></mesh>
          <mesh position-y={1.2}><cylinderGeometry args={[0.25, 0.25, 0.25, 6]} />{mat}</mesh>
          <mesh position-y={1.75}><boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.2} />
          </mesh>
        </group>
      );
  }
}

function Grow({ visible, children, position, onClick, selected, label }: {
  visible: boolean; children: React.ReactNode; position: THREE.Vector3;
  onClick: () => void; selected: boolean; label: string;
}) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    if (!g.current) return;
    const target = visible ? (selected ? 1.15 : 1) : 0.0001;
    const s = THREE.MathUtils.lerp(g.current.scale.x, target, 1 - Math.exp(-8 * dt));
    g.current.scale.setScalar(s);
    g.current.visible = s > 0.01;
  });
  return (
    <group ref={g} position={position} scale={0.0001}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}>
      {children}
      {selected && (
        <Html position={[0, 2.6, 0]} center distanceFactor={14} zIndexRange={[10, 0]}>
          <div className="pixel-tag">{label}</div>
        </Html>
      )}
    </group>
  );
}

/* ---------- Constellation ---------- */
function Star({ m }: { m: Milestone }) {
  const col = MOOD_COLORS[m.mood];
  const ref = useRef<THREE.Mesh>(null);
  const phase = hash01(m.id) * 6;
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.8 + phase;
  });
  const size = 0.18 + m.significance * 0.09;
  return (
    <group>
      <mesh ref={ref}><boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <mesh><sphereGeometry args={[size * 2.6, 12, 12]} />
        <meshBasicMaterial color={col} transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Links({ points, list, count }: { points: THREE.Vector3[]; list: Milestone[]; count: number }) {
  const geom = useMemo(() => {
    const pos: number[] = [];
    const colors: number[] = [];
    const c = new THREE.Color();
    for (let i = 1; i < Math.min(count, points.length); i++) {
      const a = points[i - 1]!;
      const b = points[i]!;
      const mA = list[i - 1];
      const mB = list[i];
      pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
      c.set(MOOD_COLORS[mA?.mood ?? "Calm"]); colors.push(c.r, c.g, c.b);
      c.set(MOOD_COLORS[mB?.mood ?? "Calm"]); colors.push(c.r, c.g, c.b);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return g;
  }, [points, list, count]);
  return (
    <lineSegments geometry={geom}>
      <lineBasicMaterial vertexColors transparent opacity={0.7} toneMapped={false} />
    </lineSegments>
  );
}

/* ---------- Camera focus ---------- */
function Focus({ target }: { target: THREE.Vector3 | null }) {
  const controls = useThree((s) => s.controls) as OrbitImpl | null;
  const goal = useRef(new THREE.Vector3(0, 1, 0));
  useEffect(() => { goal.current.copy(target ?? new THREE.Vector3(0, 1, 0)); }, [target]);
  useFrame((_, raw) => {
    if (!controls) return;
    const k = 1 - Math.exp(-4 * Math.min(raw, 0.05));
    controls.target.lerp(goal.current, k);
    controls.update();
  });
  return null;
}

export function World({ milestones, visibleCount, mode, selectedId, onSelect }: Props) {
  const islandPts = useMemo(() => layoutIsland(milestones), [milestones]);
  const skyPts = useMemo(() => layoutSky(milestones), [milestones]);
  const pts = mode === "island" ? islandPts : skyPts;
  const selIdx = milestones.findIndex((m) => m.id === selectedId);
  const selPt = selIdx >= 0 ? pts[selIdx] : undefined;
  const focus = selPt ? selPt.clone().add(new THREE.Vector3(0, 0.8, 0)) : null;

  return (
    <>
      <color attach="background" args={[mode === "island" ? "#141a33" : "#0b0c1d"]} />
      <fog attach="fog" args={[mode === "island" ? "#141a33" : "#0b0c1d", 25, 70]} />
      <ambientLight intensity={mode === "island" ? 0.5 : 0.25} />
      <directionalLight position={[10, 18, 8]} intensity={mode === "island" ? 1.8 : 0.4} color="#ffe9cf" castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} />
      <Environment resolution={64}>
        <Lightformer intensity={1.5} position={[0, 6, 0]} scale={[10, 10, 1]} color="#ffd9f0" />
        <Lightformer intensity={1} color="#8fd8ff" position={[-6, 2, -2]} rotation-y={Math.PI / 2} scale={[20, 2, 1]} />
      </Environment>

      <group onPointerMissed={() => onSelect(null)}>
        {mode === "island" ? (
          <>
            <Terrain />
            {milestones.map((m, i) => (
              <Grow key={m.id} position={islandPts[i] ?? new THREE.Vector3()} visible={i < visibleCount}
                selected={m.id === selectedId} onClick={() => onSelect(m.id)} label={m.title}>
                <Structure m={m} />
              </Grow>
            ))}
            <Sparkles count={60} scale={[20, 6, 20]} position={[0, 3, 0]} size={3} speed={0.3} color="#ffe6a8" />
          </>
        ) : (
          <>
            <Links points={skyPts} list={milestones} count={visibleCount} />
            {milestones.map((m, i) => (
              <Grow key={m.id} position={skyPts[i] ?? new THREE.Vector3()} visible={i < visibleCount}
                selected={m.id === selectedId} onClick={() => onSelect(m.id)} label={m.title}>
                <Star m={m} />
              </Grow>
            ))}
            <Sparkles count={200} scale={[40, 20, 40]} position={[0, 4, 0]} size={2} speed={0.15} color="#cfd8ff" />
          </>
        )}
      </group>

      <OrbitControls makeDefault enableDamping maxPolarAngle={mode === "island" ? Math.PI / 2.2 : Math.PI}
        minDistance={5} maxDistance={40} />
      <Focus target={focus} />
    </>
  );
}
