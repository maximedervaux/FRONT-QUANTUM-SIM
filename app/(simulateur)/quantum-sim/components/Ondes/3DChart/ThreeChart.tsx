'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { usePlaneWavesData } from '../../../hooks/usePlaneWavesData';
import styles from './ThreeChart.module.css';

type TraceKind = 'real' | 'imag';

interface ThreeTrace {
	id: string;
	name: string;
	kind: TraceKind;
	x: number[];
	y: number[];
	yImag?: number[];
	harmonicIndex: number;
}

interface HoverState {
	visible: boolean;
	left: number;
	top: number;
	label: string;
	x: number;
	y: number;
}

interface LineUserData {
	trace: ThreeTrace;
}

interface Bounds {
	xMin: number;
	xMax: number;
	yMin: number;
	yMax: number;
	zMax: number;
}

/** One entry per live line object — lets us update positions in-place. */
interface TrackedLine {
	id: string;
	line: THREE.Line;
	geometry: THREE.BufferGeometry;
	pointCount: number;
}

/** Draw-on animation state (only used for structural changes). */
interface DrawAnimation {
	start: number;
	duration: number;
}

interface PointPair {
	x: number;
	y: number;
}

const EMPTY_HOVER: HoverState = {
	visible: false,
	left: 0,
	top: 0,
	label: '',
	x: 0,
	y: 0,
};

// ─── coordinate helpers ────────────────────────────────────────────────────

function makeMappers(bounds: Bounds, traces: ThreeTrace[]) {
	const spanX = Math.max(1e-9, bounds.xMax - bounds.xMin);
	const spanY = Math.max(1e-9, bounds.yMax - bounds.yMin);

	// Calculer les bounds de Z (imaginaire)
	let zMin = Infinity;
	let zMax = -Infinity;
	for (const t of traces) {
		if (t.yImag) {
			for (const z of t.yImag) {
				zMin = Math.min(zMin, z);
				zMax = Math.max(zMax, z);
			}
		}
	}
	const spanZ = Math.max(1e-9, zMax - zMin);

	return {
		toSceneX: (x: number) => ((x - bounds.xMin) / spanX) * 10 - 5,
		toSceneY: (y: number) => ((y - bounds.yMin) / spanY) * 4 - 2,
		toSceneZ: (yImag: number | undefined) =>
			yImag !== undefined ? ((yImag - zMin) / spanZ) * 6 - 3 : 0,
	};
}

// ─── color palette ────────────────────────────────────────────────────────

const REAL_COLORS = ['#74b9ff', '#a29bfe', '#55efc4', '#ffeaa7', '#fab1a0'];
const IMAG_COLORS = ['#0984e3', '#6c5ce7', '#00b894', '#fdcb6e', '#e17055'];

function realColor(index: number) {
	return REAL_COLORS[index % REAL_COLORS.length];
}
function imagColor(index: number) {
	return IMAG_COLORS[index % IMAG_COLORS.length];
}

// ─── component ────────────────────────────────────────────────────────────

function ThreeChart() {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const sceneRef = useRef<THREE.Scene | null>(null);
	const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
	const controlsRef = useRef<OrbitControls | null>(null);
	const lineGroupRef = useRef<THREE.Group | null>(null);
	const frameRef = useRef<number | null>(null);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);
	const raycasterRef = useRef(new THREE.Raycaster());
	const pointerRef = useRef(new THREE.Vector2());

	/**
	 * Tracked lines — persistent across time updates.
	 * We only rebuild this when the *structure* changes (harmonic count,
	 * showImaginary, etc.), not on every time tick.
	 */
	const trackedLinesRef = useRef<TrackedLine[]>([]);

	/**
	 * Draw-on animation: fraction 0→1, stored as { start, duration }.
	 * null = no animation running.
	 */
	const drawAnimRef = useRef<DrawAnimation | null>(null);

	const [hover, setHover] = useState<HoverState>(EMPTY_HOVER);

	const { waves, showImaginary } = usePlaneWavesData();

	// ── traces ──────────────────────────────────────────────────────────────

	const traces = useMemo<ThreeTrace[]>(() => {
		return waves.flatMap((wave, index) => {
			const realPoints = sanitizePairs(wave.x, wave.yReal);
			const real: ThreeTrace = {
				id: `h-${index + 1}-real`,
				name: `H${index + 1} Réel`,
				kind: 'real',
				x: realPoints.map(p => p.x),
				y: realPoints.map(p => p.y),
				yImag: wave.yImag ? sanitizePairs(wave.x, wave.yImag).map(p => p.y) : undefined,
				harmonicIndex: index,
			};

			// if (!showImaginary || !wave.yImag) {
			// 	return real.x.length > 1 ? [real] : [];
			// }

			// const imagPoints = sanitizePairs(wave.x, wave.yImag);
			// const imag: ThreeTrace = {
			// 	id: `h-${index + 1}-imag`,
			// 	name: `H${index + 1} Imag`,
			// 	kind: 'imag',
			// 	x: imagPoints.map(p => p.x),
			// 	y: imagPoints.map(p => p.y),
			// 	harmonicIndex: index,
			// };

			return [real];
		});
	}, [waves, showImaginary]);

	// ── bounds ───────────────────────────────────────────────────────────────

	const bounds = useMemo<Bounds>(() => {
		if (traces.length === 0) {
			return { xMin: -1, xMax: 1, yMin: -1, yMax: 1, zMax: 1 };
		}

		let xMin = Infinity;
		let xMax = -Infinity;
		let yMin = Infinity;
		let yMax = -Infinity;
		let zMax = 0;

		for (const t of traces) {
			zMax = Math.max(zMax, t.harmonicIndex + (t.kind === 'imag' ? 0.35 : 0));
			for (let i = 0; i < t.x.length; i++) {
				xMin = Math.min(xMin, t.x[i]);
				xMax = Math.max(xMax, t.x[i]);
				yMin = Math.min(yMin, t.y[i]);
				yMax = Math.max(yMax, t.y[i]);
			}
		}

		if (xMin === xMax) {
			xMin -= 1;
			xMax += 1;
		}
		if (yMin === yMax) {
			yMin -= 1;
			yMax += 1;
		}

		return { xMin, xMax, yMin, yMax, zMax: Math.max(1, zMax) };
	}, [traces]);

	// ── Three.js scene bootstrap (runs once) ─────────────────────────────────

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// Scene
		const scene = new THREE.Scene();
		scene.background = new THREE.Color('#0d1117');
		scene.fog = new THREE.FogExp2('#0d1117', 0.04);
		sceneRef.current = scene;

		// Camera
		const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
		camera.position.set(0, 4, 10);
		cameraRef.current = camera;

		// Renderer
		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		renderer.domElement.style.display = 'block';
		renderer.domElement.style.width = '100%';
		renderer.domElement.style.height = '100%';
		rendererRef.current = renderer;
		container.appendChild(renderer.domElement);

		// Controls
		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.06;
		controls.maxDistance = 25;
		controls.minDistance = 3;
		controlsRef.current = controls;

		// Lights
		scene.add(new THREE.AmbientLight('#ffffff', 0.5));
		const dir = new THREE.DirectionalLight('#cce8ff', 1.4);
		dir.position.set(3, 8, 6);
		scene.add(dir);

		// Grid — XZ plane
		const grid = new THREE.GridHelper(12, 12, '#2a3f5f', '#1a2a3f');
		(grid.material as THREE.Material).transparent = true;
		(grid.material as THREE.Material).opacity = 0.5;
		scene.add(grid);

		// Axes
		const axes = new THREE.AxesHelper(5.5);
		scene.add(axes);

		// Line group
		const lineGroup = new THREE.Group();
		lineGroupRef.current = lineGroup;
		scene.add(lineGroup);

		// Raycaster threshold
		raycasterRef.current.params.Line = { threshold: 0.18 };

		// Resize
		const updateSize = () => {
			const w = container.clientWidth;
			const h = container.clientHeight;
			if (w <= 0 || h <= 0) return;
			renderer.setSize(w, h, true);
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
		};
		updateSize();
		const ro = new ResizeObserver(updateSize);
		ro.observe(container);
		resizeObserverRef.current = ro;

		// Animate loop
		const animate = () => {
			const anim = drawAnimRef.current;
			if (anim) {
				const progress = Math.min(1, (performance.now() - anim.start) / anim.duration);
				for (const tl of trackedLinesRef.current) {
					const visible = Math.max(2, Math.floor(tl.pointCount * progress));
					tl.geometry.setDrawRange(0, visible);
				}
				if (progress >= 1) {
					// Ensure full draw
					for (const tl of trackedLinesRef.current) {
						tl.geometry.setDrawRange(0, tl.pointCount);
					}
					drawAnimRef.current = null;
				}
			}

			controls.update();
			renderer.render(scene, camera);
			frameRef.current = requestAnimationFrame(animate);
		};
		frameRef.current = requestAnimationFrame(animate);

		// Pointer hover
		const handleMove = (e: PointerEvent) => {
			const rdr = rendererRef.current;
			const cam = cameraRef.current;
			if (!rdr || !cam) return;
			const rect = rdr.domElement.getBoundingClientRect();
			pointerRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
			pointerRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
			raycasterRef.current.setFromCamera(pointerRef.current, cam);
			const lines = trackedLinesRef.current.map(tl => tl.line);
			const hits = raycasterRef.current.intersectObjects(lines, false);
			if (!hits.length) {
				setHover(prev => (prev.visible ? EMPTY_HOVER : prev));
				return;
			}
			const hit = hits[0];
			const ud = hit.object.userData as LineUserData;
			const tr = ud.trace;
			const idx = Math.max(0, Math.min(tr.x.length - 1, hit.index ?? 0));
			setHover({
				visible: true,
				left: e.clientX - rect.left + 12,
				top: e.clientY - rect.top + 12,
				label: tr.name,
				x: tr.x[idx],
				y: tr.y[idx],
			});
		};
		const handleLeave = () => setHover(prev => (prev.visible ? EMPTY_HOVER : prev));
		renderer.domElement.addEventListener('pointermove', handleMove);
		renderer.domElement.addEventListener('pointerleave', handleLeave);

		return () => {
			renderer.domElement.removeEventListener('pointermove', handleMove);
			renderer.domElement.removeEventListener('pointerleave', handleLeave);
			if (frameRef.current) cancelAnimationFrame(frameRef.current);
			controls.dispose();
			ro.disconnect();
			disposeGroup(lineGroupRef.current);
			renderer.dispose();
			if (renderer.domElement.parentElement === container) {
				container.removeChild(renderer.domElement);
			}
			controlsRef.current = null;
			rendererRef.current = null;
			cameraRef.current = null;
			sceneRef.current = null;
		};
	}, []);

	// ── Update lines when traces / bounds change ──────────────────────────────
	//
	// KEY LOGIC:
	//   • If the set of trace IDs hasn't changed → only update positions in-place
	//     (no draw animation restart, smooth time updates).
	//   • If IDs changed (new harmonics, toggled imaginary) → rebuild geometries
	//     and restart the draw-on animation.

	const prevTraceIdsRef = useRef<string>('');

	useEffect(() => {
		const group = lineGroupRef.current;
		if (!group) return;

		const newIds = traces.map(t => t.id).join('|');
		const structuralChange = newIds !== prevTraceIdsRef.current;
		prevTraceIdsRef.current = newIds;

		if (structuralChange) {
			clearGroup(group);
			trackedLinesRef.current = [];

			const { toSceneX, toSceneY, toSceneZ } = makeMappers(bounds, traces);

			traces.forEach((trace, i) => {
				if (trace.x.length < 2) return;

				// Utiliser yImag pour Z (ou 0 si pas imaginaire)
				const pts = trace.x.map((xv, j) => {
					const z = trace.yImag ? toSceneZ(trace.yImag[j]) : 0;
					return new THREE.Vector3(toSceneX(xv), toSceneY(trace.y[j]), z);
				});

				const geo = new THREE.BufferGeometry().setFromPoints(pts);
				geo.setDrawRange(0, 2);

				const color = realColor(i);
				const mat = new THREE.LineBasicMaterial({
					color,
					transparent: true,
					opacity: 0.95,
					linewidth: 2,
				});

				const line = new THREE.Line(geo, mat);
				line.userData = { trace } satisfies LineUserData;
				group.add(line);

				trackedLinesRef.current.push({
					id: trace.id,
					line,
					geometry: geo,
					pointCount: pts.length,
				});
			});

			if (trackedLinesRef.current.length > 0) {
				drawAnimRef.current = { start: performance.now(), duration: 650 };
			} else {
				drawAnimRef.current = null;
			}
		} else {
			// ── In-place position update ──────────────────────────────────
			drawAnimRef.current = null;

			const { toSceneX, toSceneY, toSceneZ } = makeMappers(bounds, traces);

			traces.forEach((trace, i) => {
				const tl = trackedLinesRef.current[i];
				if (!tl || trace.x.length < 2) return;

				const posAttr = tl.geometry.attributes.position as THREE.BufferAttribute;
				const count = Math.min(trace.x.length, posAttr.count);

				for (let j = 0; j < count; j++) {
					const z = trace.yImag ? toSceneZ(trace.yImag[j]) : 0;
					posAttr.setXYZ(j, toSceneX(trace.x[j]), toSceneY(trace.y[j]), z);
				}
				posAttr.needsUpdate = true;
				tl.geometry.setDrawRange(0, count);
				tl.geometry.computeBoundingSphere();

				(tl.line.userData as LineUserData).trace = trace;
			});
		}
	}, [traces, bounds]);

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<div className={styles.wrapper}>
			<div ref={containerRef} className={styles.canvas} />

			<div className={styles.axisLabels}>
				<span>X · position (m)</span>
				<span>Y · réel Re(ψ)</span>
				<span>Z · imaginaire Im(ψ)</span>
			</div>

			{hover.visible && (
				<div className={styles.tooltip} style={{ left: hover.left, top: hover.top }}>
					<strong>{hover.label}</strong>
					<p>x : {hover.x.toFixed(3)}</p>
					<p>amp : {hover.y.toFixed(3)}</p>
				</div>
			)}
		</div>
	);
}

// ─── helpers ──────────────────────────────────────────────────────────────

function clearGroup(group: THREE.Group | null) {
	if (!group) return;
	while (group.children.length) {
		const child = group.children[0];
		disposeObject3D(child);
		group.remove(child);
	}
}

function disposeGroup(group: THREE.Group | null) {
	clearGroup(group);
}

function disposeObject3D(obj: THREE.Object3D) {
	const mesh = obj as THREE.Mesh;
	mesh.geometry?.dispose();
	const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
	if (Array.isArray(mat)) mat.forEach(m => m.dispose());
	else mat?.dispose();
	obj.children.forEach(disposeObject3D);
}

function sanitizePairs(xs: number[], ys: number[]): PointPair[] {
	const limit = Math.min(xs.length, ys.length);
	const out: PointPair[] = [];
	for (let i = 0; i < limit; i++) {
		if (Number.isFinite(xs[i]) && Number.isFinite(ys[i])) {
			out.push({ x: xs[i], y: ys[i] });
		}
	}
	return out;
}

export default memo(ThreeChart);
