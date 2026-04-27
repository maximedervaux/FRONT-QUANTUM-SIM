'use client';

import { memo, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import styles from './ThreeChartSchrodinger.module.css';
import { useSchrodingerStore } from '../../../store/schrodinger.store';

// ─── Types ─────────────────────────────────────────────────────────────────

interface SchrodingerData {
	x: number[];
	prob: number[][];
	real?: number[][];   // Re(ψ) — needed for spiral
	imag?: number[][];   // Im(ψ) — needed for spiral
}

interface ThreeChartSchrodingerProps {
	data: SchrodingerData | null;
	potentialType: string;
	wellWidth?: number;
	barrierWidth?: number;
	showWireframe?: boolean;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const SCENE_BG = new THREE.Color('#080c14');
const TUBE_SEGMENTS = 6; // sides of the tube cross-section
const TUBE_RADIUS_BASE = 0.035;
const SCENE_WIDTH = 10;  // scene X span
const SCENE_HEIGHT = 3;  // Re / Im max amplitude in scene units

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Map physics x → scene x in [-5, 5] */
function makeXMapper(xArr: number[]) {
	const xMin = Math.min(...xArr);
	const xMax = Math.max(...xArr);
	const span = Math.max(1e-9, xMax - xMin);
	return (x: number) => ((x - xMin) / span) * SCENE_WIDTH - SCENE_WIDTH / 2;
}

/** Build a normaliser so amplitude fits in [-SCENE_HEIGHT, SCENE_HEIGHT] */
function makeAmpMapper(real: number[][], imag: number[][]) {
	let maxAmp = 0;
	for (let t = 0; t < real.length; t++) {
		for (let i = 0; i < real[t].length; i++) {
			const amp = Math.sqrt(real[t][i] ** 2 + imag[t][i] ** 2);
			if (amp > maxAmp) maxAmp = amp;
		}
	}
	maxAmp = Math.max(1e-9, maxAmp);
	return (v: number) => (v / maxAmp) * SCENE_HEIGHT;
}

/** HSL colour keyed to |ψ|² — blue → cyan → green → yellow → red */
function probColor(prob: number, probMax: number): THREE.Color {
	const t = Math.min(1, prob / probMax);
	// hue: 0.66 (blue) → 0 (red) as t goes 0 → 1
	const hue = 0.66 - t * 0.66;
	return new THREE.Color().setHSL(hue, 0.9, 0.55);
}

/** Build a CatmullRom curve from spiral points, return TubeGeometry */
function buildSpiralTube(
	x: number[],
	reArr: number[],
	imArr: number[],
	mapX: (v: number) => number,
	mapAmp: (v: number) => number,
	tubeRadius: number
): { geometry: THREE.TubeGeometry; colors: Float32Array; prob: number[] } {
	const points: THREE.Vector3[] = x.map((xi, i) =>
		new THREE.Vector3(mapX(xi), mapAmp(reArr[i]), mapAmp(imArr[i]))
	);

	const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
	const tubeDivisions = Math.min(points.length * 3, 900);
	const geometry = new THREE.TubeGeometry(curve, tubeDivisions, tubeRadius, TUBE_SEGMENTS, false);

	// Per-vertex colours — sample prob along the tube
	const probArr: number[] = x.map((_, i) => reArr[i] ** 2 + imArr[i] ** 2);
	const probMax = Math.max(...probArr, 1e-9);

	const posCount = geometry.attributes.position.count;
	const colBuf = new Float32Array(posCount * 3);

	for (let v = 0; v < posCount; v++) {
		// Map vertex index → original sample index
		const t = v / (posCount - 1);
		const si = Math.min(Math.floor(t * (x.length - 1)), x.length - 1);
		const c = probColor(probArr[si], probMax);
		colBuf[v * 3 + 0] = c.r;
		colBuf[v * 3 + 1] = c.g;
		colBuf[v * 3 + 2] = c.b;
	}

	geometry.setAttribute('color', new THREE.BufferAttribute(colBuf, 3));

	return { geometry, colors: colBuf, prob: probArr };
}

/** Build faint wall projection lines (Re on XY, Im on XZ) */
function buildProjectionLines(
	x: number[],
	reArr: number[],
	imArr: number[],
	mapX: (v: number) => number,
	mapAmp: (v: number) => number
): { reGeo: THREE.BufferGeometry; imGeo: THREE.BufferGeometry } {
	const rePoints = x.map((xi, i) => new THREE.Vector3(mapX(xi), mapAmp(reArr[i]), -SCENE_HEIGHT - 0.5));
	const imPoints = x.map((xi, i) => new THREE.Vector3(mapX(xi), -SCENE_HEIGHT - 0.5, mapAmp(imArr[i])));

	const reGeo = new THREE.BufferGeometry().setFromPoints(rePoints);
	const imGeo = new THREE.BufferGeometry().setFromPoints(imPoints);
	return { reGeo, imGeo };
}

// ─── Component ─────────────────────────────────────────────────────────────

function ThreeChartSchrodinger({
	data,
	potentialType,
	wellWidth = 1.0,
	barrierWidth = 0.5,
}: ThreeChartSchrodingerProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);

	// Three.js refs — created once
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
	const sceneRef    = useRef<THREE.Scene | null>(null);
	const cameraRef   = useRef<THREE.PerspectiveCamera | null>(null);
	const controlsRef = useRef<OrbitControls | null>(null);
	const frameRef    = useRef<number | null>(null);

	// Groups updated when data / time changes
	const spiralGroupRef     = useRef<THREE.Group | null>(null);
	const projGroupRef       = useRef<THREE.Group | null>(null);
	const potentialGroupRef  = useRef<THREE.Group | null>(null);
	const axisGroupRef       = useRef<THREE.Group | null>(null);

	const [currentTime, setCurrentTime]   = useState(0);
	const isPlaying = useSchrodingerStore(state => state.isAnimatingTime);
	const [showProj,    setShowProj]      = useState(true);
	const [showWalls,   setShowWalls]     = useState(true);

	// Keep playing ref in sync for use inside rAF closure
	const isPlayingRef    = useRef(false);
	const currentTimeRef  = useRef(0);
	const dataTotalFrames = data?.prob.length ?? 0;

	const setAnimatingTime = useSchrodingerStore(s => s.setAnimatingTime);

	useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
	useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);

	// ── Bootstrap Three.js scene (once) ──────────────────────────────────

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const scene = new THREE.Scene();
		scene.background = SCENE_BG;
		scene.fog = new THREE.FogExp2('#080c14', 0.018);
		sceneRef.current = scene;

		const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 200);
		camera.position.set(0, 4, 12);
		camera.lookAt(0, 0, 0);
		cameraRef.current = camera;

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.1;
		renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;';
		rendererRef.current = renderer;
		container.appendChild(renderer.domElement);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor  = 0.06;
		controls.maxDistance    = 40;
		controls.minDistance    = 2;
		controls.target.set(0, 0, 0);
		controlsRef.current = controls;

		// Lights
		scene.add(new THREE.AmbientLight('#ffffff', 0.5));
		const dir = new THREE.DirectionalLight('#b0d4ff', 1.2);
		dir.position.set(6, 10, 8);
		scene.add(dir);
		const fill = new THREE.DirectionalLight('#ffd0a0', 0.4);
		fill.position.set(-6, -4, -4);
		scene.add(fill);

		// Groups
		[spiralGroupRef, projGroupRef, potentialGroupRef, axisGroupRef].forEach(ref => {
			const g = new THREE.Group();
			ref.current = g;
			scene.add(g);
		});

		// Static axis labels (THREE.js LineSegments)
		const axisGroup = axisGroupRef.current!;
		const axMat = new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 2 });
		const axPos = new Float32Array([
			// X axis — white
			-SCENE_WIDTH / 2, 0, 0,   SCENE_WIDTH / 2, 0, 0,
			// Y axis (Re) — green
			0, -SCENE_HEIGHT, 0,   0, SCENE_HEIGHT, 0,
			// Z axis (Im) — magenta
			0, 0, -SCENE_HEIGHT,   0, 0, SCENE_HEIGHT,
		]);
		const axCol = new Float32Array([
			1, 1, 1,  1, 1, 1,
			0.3, 1, 0.4,  0.3, 1, 0.4,
			1, 0.3, 0.9,  1, 0.3, 0.9,
		]);
		const axGeo = new THREE.BufferGeometry();
		axGeo.setAttribute('position', new THREE.BufferAttribute(axPos, 3));
		axGeo.setAttribute('color',    new THREE.BufferAttribute(axCol, 3));
		axisGroup.add(new THREE.LineSegments(axGeo, axMat));

		// Resize
		const resize = () => {
			const w = container.clientWidth;
			const h = container.clientHeight;
			if (!w || !h) return;
			renderer.setSize(w, h, true);
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
		};
		resize();
		const ro = new ResizeObserver(resize);
		ro.observe(container);

		// Render loop — animation is driven here
		let lastTick = 0;
		const FRAME_MS = 60; // target ~16 fps for time animation

		const loop = (now: number) => {
			frameRef.current = requestAnimationFrame(loop);
			controls.update();

			if (isPlayingRef.current && dataTotalFrames > 1) {
				if (now - lastTick > FRAME_MS) {
					lastTick = now;
					setCurrentTime(t => (t + 1) % dataTotalFrames);
				}
			}
			renderer.render(scene, camera);
		};
		frameRef.current = requestAnimationFrame(loop);

		return () => {
			if (frameRef.current) cancelAnimationFrame(frameRef.current);
			ro.disconnect();
			controls.dispose();
			renderer.dispose();
			if (renderer.domElement.parentElement === container) {
				container.removeChild(renderer.domElement);
			}
		};
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// ── Derived per-frame data ─────────────────────────────────────────────

	const { mapX, mapAmp, reFrame, imFrame } = useMemo(() => {
		if (!data || !data.real || !data.imag || data.x.length < 2) {
			return { mapX: null, mapAmp: null, reFrame: null, imFrame: null };
		}
		const t = Math.min(currentTime, data.prob.length - 1);
		return {
			mapX:    makeXMapper(data.x),
			mapAmp:  makeAmpMapper(data.real, data.imag),
			reFrame: data.real[t],
			imFrame: data.imag[t],
		};
	}, [data, currentTime]);

	// ── Build / update spiral mesh ─────────────────────────────────────────

	useEffect(() => {
		const group = spiralGroupRef.current;
		if (!group) return;

		// Clear previous
		while (group.children.length) {
			const m = group.children[0] as THREE.Mesh;
			m.geometry?.dispose();
			(m.material as THREE.Material)?.dispose();
			group.remove(m);
		}

		if (!data || !mapX || !mapAmp || !reFrame || !imFrame) return;

		const { geometry } = buildSpiralTube(
			data.x, reFrame, imFrame, mapX, mapAmp, TUBE_RADIUS_BASE
		);

		const mat = new THREE.MeshPhongMaterial({
			vertexColors: true,
			side: THREE.FrontSide,
			shininess: 80,
			emissive: new THREE.Color(0.02, 0.02, 0.04),
		});

		group.add(new THREE.Mesh(geometry, mat));

		// Glow line on top of tube
		const probMax = Math.max(...data.x.map((_, i) => reFrame[i] ** 2 + imFrame[i] ** 2), 1e-9);
		const linePoints = data.x.map((xi, i) =>
			new THREE.Vector3(mapX(xi), mapAmp(reFrame[i]), mapAmp(imFrame[i]))
		);
		const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
		const lineCols = new Float32Array(linePoints.length * 3);
		linePoints.forEach((_, i) => {
			const c = probColor(reFrame[i] ** 2 + imFrame[i] ** 2, probMax);
			lineCols[i * 3 + 0] = c.r;
			lineCols[i * 3 + 1] = c.g;
			lineCols[i * 3 + 2] = c.b;
		});
		lineGeo.setAttribute('color', new THREE.BufferAttribute(lineCols, 3));
		group.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ vertexColors: true })));

	}, [data, mapX, mapAmp, reFrame, imFrame]);

	// ── Build projection lines ─────────────────────────────────────────────

	useEffect(() => {
		const group = projGroupRef.current;
		if (!group) return;

		while (group.children.length) {
			const m = group.children[0] as THREE.Mesh;
			m.geometry?.dispose();
			(m.material as THREE.Material)?.dispose();
			group.remove(m);
		}

		if (!showProj || !data || !mapX || !mapAmp || !reFrame || !imFrame) return;

		const { reGeo, imGeo } = buildProjectionLines(data.x, reFrame, imFrame, mapX, mapAmp);

		group.add(new THREE.Line(reGeo, new THREE.LineBasicMaterial({ color: '#4ade80', transparent: true, opacity: 0.4 })));
		group.add(new THREE.Line(imGeo, new THREE.LineBasicMaterial({ color: '#e879f9', transparent: true, opacity: 0.4 })));

	}, [data, mapX, mapAmp, reFrame, imFrame, showProj]);

	// ── Build potential walls ──────────────────────────────────────────────

	useEffect(() => {
		const group = potentialGroupRef.current;
		if (!group) return;

		while (group.children.length) {
			const m = group.children[0] as THREE.Mesh;
			m.geometry?.dispose();
			(m.material as THREE.Material)?.dispose();
			group.remove(m);
		}

		if (!showWalls || !data || !mapX) return;

		const wallMat = new THREE.MeshStandardMaterial({
			color: '#ff4444',
			metalness: 0.3,
			roughness: 0.5,
			transparent: true,
			opacity: 0.6,
			emissive: new THREE.Color('#400000'),
		});

		const wallH = SCENE_HEIGHT * 2 + 1;

		if (potentialType === 'infiniteWell') {
			const lx = mapX(-wellWidth / 2);
			const rx = mapX(wellWidth / 2);

			[lx, rx].forEach(wx => {
				const geo = new THREE.BoxGeometry(0.15, wallH, wallH);
				const mesh = new THREE.Mesh(geo, wallMat);
				mesh.position.set(wx, 0, 0);
				group.add(mesh);
			});
		} else if (potentialType === 'barrier') {
			const bw = Math.abs(mapX(barrierWidth / 2) - mapX(-barrierWidth / 2));
			const geo = new THREE.BoxGeometry(bw, wallH, wallH);
			const mat = wallMat.clone();
			mat.color.set('#4488ff');
			mat.emissive.set('#001030');
			group.add(new THREE.Mesh(geo, mat));
		}
	}, [potentialType, wellWidth, barrierWidth, data, mapX, showWalls]);

	// ── Fallback: no real/imag data ────────────────────────────────────────

	const hasComplexData = Boolean(data?.real && data?.imag);

	// ── Render ────────────────────────────────────────────────────────────

	return (
		<div style={{ position: 'relative', width: '100%', height: '100%', background: '#080c14' }}>
			<div ref={containerRef} style={{ width: '100%', height: '100%' }} />

			{/* HUD */}
			<div style={{
				position: 'absolute', top: 12, left: 12,
				display: 'flex', gap: 8, flexWrap: 'wrap',
			}}>
				{/* Projections */}
				<button
					onClick={() => setShowProj(p => !p)}
					style={hudBtn(showProj)}
					title="Projections Re / Im"
				>
					∫ Projections
				</button>

				{/* Walls */}
				{potentialType !== 'free' && (
					<button
						onClick={() => setShowWalls(p => !p)}
						style={hudBtn(showWalls)}
						title="Afficher les murs de potentiel"
					>
						⬛ Potentiel
					</button>
				)}
			</div>

			{/* Time slider */}
			{data && data.prob.length > 1 && (
				<div style={{
					position: 'absolute', bottom: 44, left: 16, right: 16,
					display: 'flex', alignItems: 'center', gap: 10,
				}}>
					<span style={{ color: '#8899bb', fontSize: 11, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
						t = {currentTime.toString().padStart(3, '0')} / {data.prob.length - 1}
					</span>
					<input
						type="range"
						min={0}
						max={data.prob.length - 1}
						value={currentTime}
						onChange={e => {
							setAnimatingTime(false); // stop global animation
							setCurrentTime(+e.target.value);
							}}
						style={{ flex: 1, accentColor: '#60a5fa' }}
					/>
				</div>
			)}

			{/* Axis legend */}
			<div style={{
				position: 'absolute', bottom: 10, left: 16,
				display: 'flex', gap: 16, fontSize: 11, fontFamily: 'monospace',
			}}>
				<span style={{ color: '#4ade80' }}>— Re(ψ)</span>
				<span style={{ color: '#e879f9' }}>— Im(ψ)</span>
			</div>

			{/* Warning if no complex data */}
			{!hasComplexData && data && (
				<div style={{
					position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)',
					background: 'rgba(0,0,0,0.8)', border: '1px solid #f59e0b',
					color: '#fbbf24', padding: '16px 24px', borderRadius: 8,
					fontSize: 13, fontFamily: 'monospace', textAlign: 'center', maxWidth: 340,
				}}>
					⚠ Le solveur doit retourner <code>real</code> et <code>imag</code> pour la vue spirale.<br />
					Vérifiez que <code>schrodinger_solving_function</code> retourne <code>[x, prob, real, imag]</code>.
				</div>
			)}
		</div>
	);
}

// ─── Tiny style helper ─────────────────────────────────────────────────────

function hudBtn(active: boolean): React.CSSProperties {
	return {
		padding: '4px 10px',
		fontSize: 12,
		fontFamily: 'monospace',
		cursor: 'pointer',
		borderRadius: 4,
		border: `1px solid ${active ? '#60a5fa' : '#2a3f5f'}`,
		background: active ? '#1a3560' : '#0d1a2e',
		color: active ? '#93c5fd' : '#4a6080',
		transition: 'all 0.15s',
	};
}

export default memo(ThreeChartSchrodinger);