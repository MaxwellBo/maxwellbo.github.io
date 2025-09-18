import suncalc from "https://esm.sh/suncalc";

/**
 * From https://github.com/dnlzro/horizon, rewritten by Claude.
 * 
 * Atmosphere gradient renderer (single scattering) using CSS linear-gradient
 *
 * Physical model and parameter choices derived from "A Scalable and Production
 * Ready Sky and Atmosphere Rendering Technique" (Sébastien Hillaire).
 *
 * Implementation derived from "Production Sky Rendering" (Andrew Helmer,
 * MIT License). Source: https://www.shadertoy.com/view/slSXRW
 */



/**
 * @typedef {[number, number, number]} Vec3
 */

// ========== UTILITY FUNCTIONS ==========

/**
 * Clamp a value between min and max
 * @param {number} x - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

/**
 * Calculate dot product of two 3D vectors
 * @param {Vec3} v1 - First vector
 * @param {Vec3} v2 - Second vector
 * @returns {number} Dot product
 */
function dot(v1, v2) {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

/**
 * Calculate length of a 3D vector
 * @param {Vec3} v - Vector
 * @returns {number} Vector length
 */
function len(v) {
  return Math.hypot(v[0], v[1], v[2]);
}

/**
 * Normalize a 3D vector
 * @param {Vec3} v - Vector to normalize
 * @returns {Vec3} Normalized vector
 */
function norm(v) {
  const l = len(v) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

/**
 * Add two 3D vectors
 * @param {Vec3} v1 - First vector
 * @param {Vec3} v2 - Second vector
 * @returns {Vec3} Sum of vectors
 */
function add(v1, v2) {
  return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
}

/**
 * Scale a 3D vector by a scalar
 * @param {Vec3} v - Vector to scale
 * @param {number} s - Scalar value
 * @returns {Vec3} Scaled vector
 */
function scale(v, s) {
  return [v[0] * s, v[1] * s, v[2] * s];
}

/**
 * Apply exponential function to each component of a 3D vector
 * @param {Vec3} v - Input vector
 * @returns {Vec3} Vector with exp applied to each component
 */
function exp(v) {
  return [Math.exp(v[0]), Math.exp(v[1]), Math.exp(v[2])];
}

// ========== ATMOSPHERE RENDERING ==========

const PI = Math.PI;

// Coefficients of media components (m^-1)
const RAYLEIGH_SCATTER = [5.802e-6, 13.558e-6, 33.1e-6];
const MIE_SCATTER = 3.996e-6;
const MIE_ABSORB = 4.44e-6;
const OZONE_ABSORB = [0.65e-6, 1.881e-6, 0.085e-6];

// Altitude density distribution metrics
const RAYLEIGH_SCALE_HEIGHT = 8e3;
const MIE_SCALE_HEIGHT = 1.2e3;

// Additional parameters
const GROUND_RADIUS = 6_360e3;
const TOP_RADIUS = 6_460e3;
const SUN_INTENSITY = 1.0;

// Rendering
const SAMPLES = 32; // used for gradient stops and integration steps
const FOV_DEG = 75;

// Post-processing
const EXPOSURE = 25.0;
const GAMMA = 2.2;
const SUNSET_BIAS_STRENGTH = 0.1;

/**
 * ACES tonemapper (Knarkowicz)
 * @param {Vec3} color - Input color
 * @returns {Vec3} Tone-mapped color
 */
function aces(color) {
  return color.map((c) => {
    const n = c * (2.51 * c + 0.03);
    const d = c * (2.43 * c + 0.59) + 0.14;
    return Math.max(0, Math.min(1, n / d));
  });
}

/**
 * Enhance sunset hues (i.e., make warmer)
 * @param {Vec3} color - Input RGB color [r, g, b]
 * @returns {Vec3} Color with sunset bias applied
 */
function applySunsetBias([r, g, b]) {
  // Relative luminance (sRGB)
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // Weight is higher for darker sky (near horizon/twilight), lower midday
  const w = 1.0 / (1.0 + 2.0 * lum);
  const k = SUNSET_BIAS_STRENGTH; // overall strength
  const rb = 1.0 + 0.5 * k * w; // boost red
  const gb = 1.0 - 0.5 * k * w; // suppress green
  const bb = 1.0 + 1.0 * k * w; // boost blue
  return [Math.max(0, r * rb), Math.max(0, g * gb), Math.max(0, b * bb)];
}

/**
 * Rayleigh phase function
 * @param {number} angle - Scattering angle
 * @returns {number} Phase function value
 */
function rayleighPhase(angle) {
  return (3 * (1 + Math.cos(angle) ** 2)) / (16 * PI);
}

/**
 * Mie phase function
 * @param {number} angle - Scattering angle
 * @returns {number} Phase function value
 */
function miePhase(angle) {
  const g = 0.8;
  const scale = 3 / (8 * PI);
  const num = (1 - g ** 2) * (1 + Math.cos(angle) ** 2);
  const denom =
    (2 + g ** 2) * (1 + g ** 2 - 2 * g * Math.cos(angle)) ** (3 / 2);
  return (scale * num) / denom;
}

/**
 * Ray-sphere intersection (from "Real-Time Collision Detection")
 * @param {Vec3} p - Ray origin
 * @param {Vec3} d - Ray direction
 * @param {number} r - Sphere radius
 * @returns {number|null} Distance to intersection or null if no intersection
 */
function intersectSphere(p, d, r) {
  // Sphere center is at origin, so M = P - C = P
  const m = p;
  const b = dot(m, d);
  const c = dot(m, m) - r ** 2;
  const discr = b ** 2 - c;
  if (discr < 0)
    // Ray misses sphere
    return null;
  const t = -b - Math.sqrt(discr);
  if (t < 0)
    // Ray inside sphere; Use far discriminant
    return -b + Math.sqrt(discr);
  return t;
}

/**
 * Optical depth approximation
 * @param {number} height - Height above ground
 * @param {number} angle - Ray angle
 * @returns {Vec3} Transmittance [r, g, b]
 */
function computeTransmittance(height, angle) {
  const rayOrigin = [0, GROUND_RADIUS + height, 0];
  const rayDirection = [Math.sin(angle), Math.cos(angle), 0];

  const distance = intersectSphere(rayOrigin, rayDirection, TOP_RADIUS);
  if (!distance) return [1, 1, 1];

  // March along the ray using a fixed step size
  const segmentLength = distance / SAMPLES;
  let t = 0.5 * segmentLength;

  // Accumulate path-integrated densities
  let odRayleigh = 0; // molecules (Rayleigh)
  let odMie = 0; // aerosols (Mie)
  let odOzone = 0; // ozone (absorption only)
  for (let i = 0; i < SAMPLES; i++) {
    // Position along the ray and its altitude above ground
    const pos = add(rayOrigin, scale(rayDirection, t));
    const h = len(pos) - GROUND_RADIUS;

    // Exponential falloff with altitude for Rayleigh and Mie densities
    const dR = Math.exp(-h / RAYLEIGH_SCALE_HEIGHT);
    const dM = Math.exp(-h / MIE_SCALE_HEIGHT);

    // Integrate (density × path length)
    odRayleigh += dR * segmentLength;

    // Simple ozone layer: triangular profile centered at 25 km, width 30 km
    const ozoneDensity = 1.0 - Math.min(Math.abs(h - 25e3) / 15e3, 1.0);
    odOzone += ozoneDensity * segmentLength;

    odMie += dM * segmentLength;
    t += segmentLength;
  }

  // Convert integrated densities into per-channel optical depth (Beer-Lambert)
  const tauR = [
    RAYLEIGH_SCATTER[0] * odRayleigh,
    RAYLEIGH_SCATTER[1] * odRayleigh,
    RAYLEIGH_SCATTER[2] * odRayleigh,
  ];
  const tauM = [MIE_ABSORB * odMie, MIE_ABSORB * odMie, MIE_ABSORB * odMie];
  const tauO = [
    OZONE_ABSORB[0] * odOzone,
    OZONE_ABSORB[1] * odOzone,
    OZONE_ABSORB[2] * odOzone,
  ];

  // Total optical depth: transmittance T = exp(-tau)
  const tau = [
    -(tauR[0] + tauM[0] + tauO[0]),
    -(tauR[1] + tauM[1] + tauO[1]),
    -(tauR[2] + tauM[2] + tauO[2]),
  ];
  return exp(tau);
}

/**
 * Render sky at given solar elevation
 * @param {number} altitude - Solar elevation angle in radians
 * @returns {[string, Vec3, Vec3]} Array containing [CSS gradient string, top color RGB, bottom color RGB]
 */
function renderGradient(altitude) {
  const cameraPosition = [0, GROUND_RADIUS, 0];
  const sunDirection = norm([Math.cos(altitude), Math.sin(altitude), 0]);

  // Projection constant (used to tilt rays upward)
  const focalZ = 1.0 / Math.tan((FOV_DEG * 0.5 * PI) / 180.0);

  const stops = [];
  for (let i = 0; i < SAMPLES; i++) {
    const s = i / (SAMPLES - 1);

    const viewDirection = norm([0, s, focalZ]);

    let inscattered = [0, 0, 0];

    const tExitTop = intersectSphere(cameraPosition, viewDirection, TOP_RADIUS);
    if (tExitTop !== null && tExitTop > 0) {
      const rayOrigin = cameraPosition.slice();

      // Fixed-step integration along the valid path segment
      const segmentLength = tExitTop / SAMPLES;
      let tRay = segmentLength * 0.5;

      // Precompute camera-to-space transmittance and the direction polarity
      const rayOriginRadius = len(rayOrigin);
      const isRayPointingDownwardAtStart =
        dot(rayOrigin, viewDirection) / rayOriginRadius < 0.0;
      const startHeight = rayOriginRadius - GROUND_RADIUS;
      const startRayCos = clamp(
        dot(
          [
            rayOrigin[0] / rayOriginRadius,
            rayOrigin[1] / rayOriginRadius,
            rayOrigin[2] / rayOriginRadius,
          ],
          viewDirection,
        ),
        -1,
        1,
      );
      const startRayAngle = Math.acos(Math.abs(startRayCos));
      const transmittanceCameraToSpace = computeTransmittance(
        startHeight,
        startRayAngle,
      );

      for (let j = 0; j < SAMPLES; j++) {
        // Position and local frame
        const samplePos = add(rayOrigin, scale(viewDirection, tRay));
        const sampleRadius = len(samplePos);
        const upUnit = [
          samplePos[0] / sampleRadius,
          samplePos[1] / sampleRadius,
          samplePos[2] / sampleRadius,
        ];
        const sampleHeight = sampleRadius - GROUND_RADIUS;

        // Angles for view ray and sun relative to local up
        const viewCos = clamp(dot(upUnit, viewDirection), -1, 1);
        const sunCos = clamp(dot(upUnit, sunDirection), -1, 1);
        const viewAngle = Math.acos(Math.abs(viewCos));
        const sunAngle = Math.acos(sunCos);

        // Transmittance camera→sample and sample→space
        const transmittanceToSpace = computeTransmittance(
          sampleHeight,
          viewAngle,
        );
        const transmittanceCameraToSample = [0, 0, 0];
        for (let k = 0; k < 3; k++) {
          transmittanceCameraToSample[k] = isRayPointingDownwardAtStart
            ? transmittanceToSpace[k] / transmittanceCameraToSpace[k]
            : transmittanceCameraToSpace[k] / transmittanceToSpace[k];
        }

        // Transmittance from sample toward the sun
        const transmittanceLight = computeTransmittance(sampleHeight, sunAngle);

        // Local densities and phase functions
        const opticalDensityRay = Math.exp(
          -sampleHeight / RAYLEIGH_SCALE_HEIGHT,
        );
        const opticalDensityMie = Math.exp(-sampleHeight / MIE_SCALE_HEIGHT);
        const sunViewCos = clamp(dot(sunDirection, viewDirection), -1, 1);
        const sunViewAngle = Math.acos(sunViewCos);
        const phaseR = rayleighPhase(sunViewAngle);
        const phaseM = miePhase(sunViewAngle);

        // Single-scattering contribution
        const scatteredRgb = [0, 0, 0];
        for (let k = 0; k < 3; k++) {
          const rayleighTerm = RAYLEIGH_SCATTER[k] * opticalDensityRay * phaseR;
          const mieTerm = MIE_SCATTER * opticalDensityMie * phaseM;
          scatteredRgb[k] = transmittanceLight[k] * (rayleighTerm + mieTerm);
        }

        // Accumulate along the ray
        for (let k = 0; k < 3; k++) {
          inscattered[k] +=
            transmittanceCameraToSample[k] * scatteredRgb[k] * segmentLength;
        }
        tRay += segmentLength;
      }

      for (let k = 0; k < 3; k++) inscattered[k] *= SUN_INTENSITY;
    }

    // Post-process: exposure → gentle sunset bias → ACES tonemap → gamma → 8-bit RGB
    let color = inscattered.slice();
    color = color.map((c) => c * EXPOSURE);
    color = applySunsetBias(color);
    color = aces(color);
    color = color.map((c) => Math.pow(c, 1.0 / GAMMA));
    const rgb = color.map((c) => Math.round(clamp(c, 0, 1) * 255));

    // 0% at zenith (top), 100% at horizon (bottom)
    const percent = (1 - s) * 100;
    stops.push({ percent, rgb });
  }

  // Compose CSS gradient string from the ordered stops
  stops.sort((a, b) => a.percent - b.percent);
  const colorStops = stops
    .map(
      ({ percent, rgb }) =>
        `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]}) ${
          Math.round(percent * 100) / 100
        }%`,
    )
    .join(", ");
  return [
    `linear-gradient(to bottom, ${colorStops})`,
    stops[0].rgb,
    stops[stops.length - 1].rgb,
  ];
}


/**
 * Renders the sky gradient at a specific geographic location based on the current time.
 *
 * @param {number} latitude - The latitude of the location in decimal degrees (float).
 * @param {number} longitude - The longitude of the location in decimal degrees (float).
 * @returns {{ gradient: string, top: string, bottom: string }} Object containing CSS gradient and top/bottom RGB colors.
 */
export function renderSkyAtLocation(latitude, longitude) {
  const now = new Date();
  const sunPos = suncalc.getPosition(
    now,
    latitude,
    longitude,
  );

  const [gradient, topVec, bottomVec] = renderGradient(sunPos.altitude);

  const top = `rgb(${topVec[0]}, ${topVec[1]}, ${topVec[2]})`;
  const bottom = `rgb(${bottomVec[0]}, ${bottomVec[1]}, ${bottomVec[2]})`

  return { gradient, top, bottom }
}