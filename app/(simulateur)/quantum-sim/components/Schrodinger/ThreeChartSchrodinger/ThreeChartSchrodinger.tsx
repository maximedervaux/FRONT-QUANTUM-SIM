'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import styles from './ThreeChartSchrodinger.module.css';

interface SchrodingerData {
	x: number[];
	prob: number[][];
}

interface HoverState {
	visible: boolean;
	left: number;
	top: number;
	label: string;
	x: number;
	t: number;
	prob: number;
}

interface Bounds {
	xMin: number;
	xMax: number;
	tMax: number;
	probMax: number;
}

interface WellDimensions {
	wellWidth: number;
	wellLeft: number;
	wellRight: number;
}

type VisualizationMode = 'surface' | 'slices' | 'particles';

const EMPTY_HOVER: HoverState = {
	visible: false,
	left: 0,
	top: 0,
	label: '',
	x: 0,
	t: 0,
	prob: 0,
};

// ─── coordinate helpers ────────────────────────────────────────────────────

function makeMappers(bounds: Bounds) {
	const spanX = Math.max(1e-9, bounds.xMax - bounds.xMin);
	const spanT = Math.max(1e-9, bounds.tMax);
	const spanProb = Math.max(1e-9, bounds.probMax);

	return {
		toSceneX: (x: number) => ((x - bounds.xMin) / spanX) * 10 - 5,
		toSceneT: (t: number) => (t / spanT) * 6,
		toSceneProb: (prob: number) => (prob / spanProb) * 4,
	};
}

// ─── Color helpers ────────────────────────────────────────────────────────

function probToColor(prob: number, maxProb: number): THREE.Color {
	const normalized = Math.min(1, prob / maxProb);
	const color = new THREE.Color();
	// Gradient: dark blue → cyan → green → yellow → red
	if (normalized < 0.25) {
		color.setHSL(0.66, 0.8, 0.3 + normalized * 0.2); // dark blue → blue
	} else if (normalized < 0.5) {
		color.setHSL(0.55, 0.8, 0.4 + (normalized - 0.25) * 0.2); // blue → cyan
	} else if (normalized < 0.75) {
		color.setHSL(0.35, 0.8, 0.5 + (normalized - 0.5) * 0.2); // cyan → green
	} else {
		color.setHSL(0.1, 0.8, 0.6 + (normalized - 0.75) * 0.2); // green → red
	}
	return color;
}

// ─── component ────────────────────────────────────────────────────────────

interface ThreeChartSchrodingerProps {
	data: SchrodingerData | null;
	potentialType: string;
	wellWidth?: number;
	barrierWidth?: number;
	showWireframe?: boolean;
}

function ThreeChartSchrodinger({
	data,
	potentialType,
	wellWidth = 1.0,
	barrierWidth = 0.5,
	showWireframe = true,
}: ThreeChartSchrodingerProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const sceneRef = useRef<THREE.Scene | null>(null);
	const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
	const controlsRef = useRef<OrbitControls | null>(null);
	const surfaceGroupRef = useRef<THREE.Group | null>(null);
	const slicesGroupRef = useRef<THREE.Group | null>(null);
	const potentialGroupRef = useRef<THREE.Group | null>(null);
	const frameRef = useRef<number | null>(null);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);
	const raycasterRef = useRef(new THREE.Raycaster());
	const pointerRef = useRef(new THREE.Vector2());

	const [hover, setHover] = useState<HoverState>(EMPTY_HOVER);
	const [visualMode, setVisualizationMode] = useState<VisualizationMode>('surface');
	const [currentTimeSlice, setCurrentTimeSlice] = useState(0);
	const [autoPlay, setAutoPlay] = useState(false);

	// ── bounds ───────────────────────────────────────────────────────────────

	const bounds = useMemo<Bounds>(() => {
		if (!data || data.x.length === 0 || data.prob.length === 0) {
			return { xMin: -1, xMax: 1, tMax: 1, probMax: 1 };
		}

		const xMin = Math.min(...data.x);
		const xMax = Math.max(...data.x);
		const tMax = data.prob.length - 1;

		let probMax = 0;
		for (const frame of data.prob) {
			for (const p of frame) {
				probMax = Math.max(probMax, p);
			}
		}

		return { xMin, xMax, tMax, probMax: Math.max(0.01, probMax) };
	}, [data]);

	const wellDimensions = useMemo<WellDimensions>(
		() => ({
			wellWidth,
			wellLeft: -wellWidth / 2,
			wellRight: wellWidth / 2,
		}),
		[wellWidth]
	);

	// ── Three.js scene bootstrap (runs once) ─────────────────────────────────

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// Scene
		const scene = new THREE.Scene();
		scene.background = new THREE.Color('#0d1117');
		scene.fog = new THREE.FogExp2('#0d1117', 0.025);
		sceneRef.current = scene;

		// Camera
		const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
		camera.position.set(4, 3.5, 8);
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
		controls.dampingFactor = 0.05;
		controls.maxDistance = 30;
		controls.minDistance = 2;
		controlsRef.current = controls;

		// Lights
		const ambientLight = new THREE.AmbientLight('#ffffff', 0.7);
		scene.add(ambientLight);

		const dirLight = new THREE.DirectionalLight('#cce8ff', 1.0);
		dirLight.position.set(5, 8, 5);
		dirLight.castShadow = true;
		scene.add(dirLight);

		// Grid — XY plane
		const grid = new THREE.GridHelper(14, 14, '#2a3f5f', '#1a2a3f');
		(grid.material as THREE.Material).transparent = true;
		(grid.material as THREE.Material).opacity = 0.35;
		scene.add(grid);

		// Axes
		const axes = new THREE.AxesHelper(6);
		scene.add(axes);

		// Groups
		const surfaceGroup = new THREE.Group();
		surfaceGroupRef.current = surfaceGroup;
		scene.add(surfaceGroup);

		const slicesGroup = new THREE.Group();
		slicesGroupRef.current = slicesGroup;
		scene.add(slicesGroup);

		const potentialGroup = new THREE.Group();
		potentialGroupRef.current = potentialGroup;
		scene.add(potentialGroup);

		// Raycaster
		raycasterRef.current.params.Line = { threshold: 0.15 };

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
		let lastTime = performance.now();
		const animate = () => {
			const now = performance.now();
			const deltaTime = (now - lastTime) / 1000;
			lastTime = now;

			if (autoPlay && data && data.prob.length > 1) {
				setCurrentTimeSlice(prev => (prev + 1) % data.prob.length);
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
			renderer.dispose();
			if (renderer.domElement.parentElement === container) {
				container.removeChild(renderer.domElement);
			}
		};
	}, []);

	// ── Build 3D surface (complete view) ──────────────────────────────────

	useEffect(() => {
		const group = surfaceGroupRef.current;
		if (!group || !data || data.x.length < 2 || data.prob.length < 2) return;

		// Clear
		while (group.children.length) {
			const child = group.children[0];
			const mesh = child as THREE.Mesh;
			mesh.geometry?.dispose();
			const mat = mesh.material as THREE.Material | THREE.Material[];
			if (Array.isArray(mat)) mat.forEach(m => m.dispose());
			else mat?.dispose();
			group.remove(child);
		}

		if (visualMode !== 'surface') return;

		const { toSceneX, toSceneT, toSceneProb } = makeMappers(bounds);

		const nX = data.x.length;
		const nT = data.prob.length;

		const positions = new Float32Array(nX * nT * 3);
		const colors = new Float32Array(nX * nT * 3);

		// Build vertices
		for (let j = 0; j < nT; j++) {
			for (let i = 0; i < nX; i++) {
				const idx = j * nX + i;
				const prob = data.prob[j][i];

				positions[idx * 3 + 0] = toSceneX(data.x[i]);
				positions[idx * 3 + 1] = toSceneProb(prob);
				positions[idx * 3 + 2] = toSceneT(j);

				const color = probToColor(prob, bounds.probMax);
				colors[idx * 3 + 0] = color.r;
				colors[idx * 3 + 1] = color.g;
				colors[idx * 3 + 2] = color.b;
			}
		}

		// Build indices
		const indices = [];
		for (let j = 0; j < nT - 1; j++) {
			for (let i = 0; i < nX - 1; i++) {
				const a = j * nX + i;
				const b = j * nX + (i + 1);
				const c = (j + 1) * nX + i;
				const d = (j + 1) * nX + (i + 1);

				indices.push(a, c, b);
				indices.push(b, c, d);
			}
		}

		// Create geometry
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
		geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
		geometry.computeVertexNormals();

		// Material
		const material = new THREE.MeshPhongMaterial({
			side: THREE.DoubleSide,
			wireframe: false,
			vertexColors: true,
			emissive: '#000000',
			shininess: 20,
		});

		const mesh = new THREE.Mesh(geometry, material);
		group.add(mesh);

		// Wireframe
		if (showWireframe) {
			const wireGeo = new THREE.BufferGeometry();
			wireGeo.setAttribute('position', geometry.attributes.position);
			wireGeo.setIndex(geometry.getIndex());

			const wireMaterial = new THREE.LineBasicMaterial({
				color: '#ffffff',
				transparent: true,
				opacity: 0.1,
			});

			const wireframe = new THREE.LineSegments(wireGeo, wireMaterial);
			group.add(wireframe);
		}
	}, [data, bounds, visualMode, showWireframe]);

	// ── Build time slices (animated view) ──────────────────────────────────

	useEffect(() => {
		const group = slicesGroupRef.current;
		if (!group || !data || data.x.length < 2) return;

		while (group.children.length) {
			const child = group.children[0];
			const mesh = child as THREE.Mesh;
			mesh.geometry?.dispose();
			const mat = mesh.material as THREE.Material | THREE.Material[];
			if (Array.isArray(mat)) mat.forEach(m => m.dispose());
			else mat?.dispose();
			group.remove(child);
		}

		if (visualMode !== 'slices') return;

		const { toSceneX, toSceneT, toSceneProb } = makeMappers(bounds);
		const t = Math.min(currentTimeSlice, data.prob.length - 1);
		const probs = data.prob[t];

		// Create line geometry for current time slice
		const points: THREE.Vector3[] = [];
		const colors: THREE.Color[] = [];

		for (let i = 0; i < data.x.length; i++) {
			points.push(new THREE.Vector3(toSceneX(data.x[i]), toSceneProb(probs[i]), toSceneT(t)));
			colors.push(probToColor(probs[i], bounds.probMax));
		}

		// Line
		const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
		lineGeo.setAttribute(
			'color',
			new THREE.BufferAttribute(new Float32Array(colors.flatMap(c => [c.r, c.g, c.b])), 3)
		);

		const lineMat = new THREE.LineBasicMaterial({
			vertexColors: true,
			linewidth: 3,
		});

		const line = new THREE.Line(lineGeo, lineMat);
		group.add(line);

		// Points (spheres) at each data point
		for (let i = 0; i < points.length; i += Math.ceil(points.length / 15)) {
			const pointGeo = new THREE.SphereGeometry(0.08, 8, 8);
			const pointMat = new THREE.MeshStandardMaterial({
				color: colors[i],
				metalness: 0.6,
				roughness: 0.4,
				emissive: colors[i],
			});

			const sphere = new THREE.Mesh(pointGeo, pointMat);
			sphere.position.copy(points[i]);
			group.add(sphere);
		}
	}, [data, bounds, visualMode, currentTimeSlice]);

	// ── Update potential walls ──────────────────────────────────────────────

	useEffect(() => {
		const group = potentialGroupRef.current;
		if (!group || !data) return;

		while (group.children.length) {
			const child = group.children[0];
			const mesh = child as THREE.Mesh;
			mesh.geometry?.dispose();
			const mat = mesh.material as THREE.Material | THREE.Material[];
			if (Array.isArray(mat)) mat.forEach(m => m.dispose());
			else mat?.dispose();
			group.remove(child);
		}

		const { toSceneX, toSceneT, toSceneProb } = makeMappers(bounds);

		if (potentialType === 'infiniteWell') {
			const wallHeight = toSceneProb(bounds.probMax) + 1;
			const wallDepth = toSceneT(bounds.tMax) + 0.5;

			const wallGeo = new THREE.BoxGeometry(0.25, wallHeight, wallDepth);
			const wallMat = new THREE.MeshStandardMaterial({
				color: '#ff6b6b',
				metalness: 0.5,
				roughness: 0.5,
				emissive: '#330000',
			});

			const leftWall = new THREE.Mesh(wallGeo, wallMat);
			leftWall.position.set(
				toSceneX(wellDimensions.wellLeft) - 0.125,
				wallHeight / 2,
				wallDepth / 2
			);
			group.add(leftWall);

			const rightWall = new THREE.Mesh(wallGeo, wallMat);
			rightWall.position.set(
				toSceneX(wellDimensions.wellRight) + 0.125,
				wallHeight / 2,
				wallDepth / 2
			);
			group.add(rightWall);
		} else if (potentialType === 'barrier') {
			const barrierHeight = toSceneProb(bounds.probMax) + 1;
			const barrierDepth = toSceneT(bounds.tMax) + 0.5;
			const _barrierWidth = Math.abs(toSceneX(barrierWidth / 2) - toSceneX(-barrierWidth / 2));

			const barrierGeo = new THREE.BoxGeometry(_barrierWidth, barrierHeight, barrierDepth);
			const barrierMat = new THREE.MeshStandardMaterial({
				color: '#4a90e2',
				metalness: 0.4,
				roughness: 0.6,
				emissive: '#1a2a4a',
			});

			const barrier = new THREE.Mesh(barrierGeo, barrierMat);
			barrier.position.set(0, barrierHeight / 2, barrierDepth / 2);
			group.add(barrier);
		}
	}, [potentialType, bounds, wellDimensions, data, barrierWidth]);

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<div className={styles.wrapper}>
			<div ref={containerRef} className={styles.canvas} />

			<div className={styles.axisLabels}>
				<span>X · position (m)</span>
				<span>Y · probabilité |ψ|²</span>
				<span>Z · temps (steps)</span>
			</div>

			{/* Controls */}
			<div className={styles.controls}>
				<button
					className={visualMode === 'surface' ? styles.active : ''}
					onClick={() => setVisualizationMode('surface')}
				>
					Surface
				</button>
				<button
					className={visualMode === 'slices' ? styles.active : ''}
					onClick={() => setVisualizationMode('slices')}
				>
					Slices
				</button>

				{visualMode === 'slices' && data && (
					<div className={styles.sliceControls}>
						<input
							type="range"
							min="0"
							max={data.prob.length - 1}
							value={currentTimeSlice}
							onChange={e => setCurrentTimeSlice(parseInt(e.target.value))}
							className={styles.slider}
						/>
						<span>
							{currentTimeSlice} / {data.prob.length - 1}
						</span>
						<button onClick={() => setAutoPlay(!autoPlay)}>{autoPlay ? '⏸' : '▶'}</button>
					</div>
				)}
			</div>

			{hover.visible && (
				<div className={styles.tooltip} style={{ left: hover.left, top: hover.top }}>
					<strong>{hover.label}</strong>
					<p>x : {hover.x.toFixed(3)}</p>
					<p>t : {Math.round(hover.t)}</p>
					<p>prob : {hover.prob.toFixed(4)}</p>
				</div>
			)}
		</div>
	);
}

export default memo(ThreeChartSchrodinger);
