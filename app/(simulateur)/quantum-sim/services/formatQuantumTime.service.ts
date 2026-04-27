// Constants for quantum-sim conversions
const REDUCED_PLANCK = 1.054571817e-34; // J·s (ℏ)
const ELECTRON_MASS = 9.10938356e-31; // kg
const SPEED_OF_LIGHT = 2.99792458e8; // m/s

// Characteristic time scale for electron dynamics
const CHARACTERISTIC_TIME = REDUCED_PLANCK / (ELECTRON_MASS * SPEED_OF_LIGHT ** 2);

/**
 * Format time for quantum wave functions (plane waves with electron mass)
 * Optimized for quantum_sim library
 * @param {number} time - Time in seconds
 * @returns {string} Formatted time with appropriate unit
 */
export const formatTimeQuantum = (time: number): string => {
	if (time === 0) return '0 s';

	const absTime = Math.abs(time);

	// Define time scales relevant to quantum mechanics
	const attoseconds = absTime / 1e-18;
	const femtoseconds = absTime / 1e-15;
	const picoseconds = absTime / 1e-12;
	const nanoseconds = absTime / 1e-9;

	// Choose the most appropriate unit (value between 0.1 and 1000)
	if (attoseconds >= 0.1 && attoseconds < 1000) {
		return `${attoseconds.toFixed(2)} as`;
	}
	if (femtoseconds >= 0.1 && femtoseconds < 1000) {
		return `${femtoseconds.toFixed(2)} fs`;
	}
	if (picoseconds >= 0.1 && picoseconds < 1000) {
		return `${picoseconds.toFixed(2)} ps`;
	}
	if (nanoseconds >= 0.1 && nanoseconds < 1000) {
		return `${nanoseconds.toFixed(2)} ns`;
	}

	return `${absTime.toExponential(1)} s`;
};

/**
 * Format time in characteristic time units (τ₀)
 * Useful for understanding oscillation timescales
 * @param {number} time - Time in seconds
 * @returns {string} Formatted time in characteristic units
 */
export const formatTimeInCharacteristicUnits = (time: number): string => {
	if (time === 0) return '0 τ₀';

	const inCharacteristicUnits = Math.abs(time) / CHARACTERISTIC_TIME;

	if (inCharacteristicUnits < 0.001) {
		return `${inCharacteristicUnits.toExponential(2)} τ₀`;
	}

	return `${inCharacteristicUnits.toFixed(2)} τ₀`;
};

/**
 * Format time with both SI and characteristic units
 * @param {number} time - Time in seconds
 * @returns {string} Formatted time with both scales
 */
export const formatTimeDetailed = (time: number): string => {
	const siFormat = formatTimeQuantum(time);
	const characteristicFormat = formatTimeInCharacteristicUnits(time);

	return `${siFormat} (${characteristicFormat})`;
};

/**
 * Convert SI time to oscillation periods for a given angular frequency
 * Useful for plane wave analysis
 * @param {number} time - Time in seconds
 * @param {number} angularFrequency - Angular frequency ω in rad/s
 * @returns {string} Number of oscillation periods
 */
export const formatTimeInPeriods = (time: number, angularFrequency: number): string => {
	if (angularFrequency === 0) return 'N/A';

	const period = (2 * Math.PI) / angularFrequency;
	const numberOfPeriods = Math.abs(time) / period;

	if (numberOfPeriods < 0.001) {
		return `${numberOfPeriods.toExponential(2)} periods`;
	}

	return `${numberOfPeriods.toFixed(2)} periods`;
};
