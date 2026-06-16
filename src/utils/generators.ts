/**
 * Utility functions to analytically generate 3D coordinates for the Mask
 * and the 3D AITO Logo, containing the exact same number of particles.
 */

// Generate a random float between min and max
const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * Generates a 3D physical coordinate (x,y,z) on the surface of a stylized face mask.
 */
function getSingleMaskPoint(): { x: number; y: number; z: number } {
  // We sample coordinates until we get a valid point (e.g., outside eye holes)
  let attempts = 0;
  while (attempts < 100) {
    attempts++;
    // Use semi-spherical coords to get an oval face shield shape
    const u = rand(-1, 1); // horizontal span
    const v = rand(-1.2, 1.2); // vertical span

    // Base oval face dimensions
    let x = u * 1.5;
    let y = v * 2.0;
    
    // Taper towards the chin
    const taper = y < 0 ? (1.0 + y * 0.35) : 1.0;
    x *= taper;

    // Dome base Z contour
    const r2 = (u * u) + (v * v) * 0.6;
    let z = 0;
    if (r2 < 2.5) {
      z = Math.sqrt(Math.max(0, 2.5 - r2)) * 0.9;
    } else {
      z = 0;
    }

    // Flatten forehead margins, keep cheek contours
    if (v > 0.8) {
      z *= (1.2 - v * 0.2);
    }

    // Eye Hole filtering (exclude vertices near left/right eyes)
    // Left eye at (-0.45, 0.35), Right eye at (0.45, 0.35)
    const leftEyeDist = Math.sqrt(Math.pow((x + 0.45) / 0.28, 2) + Math.pow((y - 0.3) / 0.16, 2));
    const rightEyeDist = Math.sqrt(Math.pow((x - 0.45) / 0.28, 2) + Math.pow((y - 0.3) / 0.16, 2));

    if (leftEyeDist < 0.95 || rightEyeDist < 0.95) {
      continue; // Skip eye hole regions
    }

    // Nose Bridge protrusion: vertical ridge
    if (y > -0.4 && y < 0.45 && Math.abs(x) < 0.35) {
      const noseShape = Math.cos((x / 0.35) * Math.PI / 2); // 1 at center, 0 at outer
      const noseProfile = Math.cos(((y - 0.05) / 0.45) * Math.PI / 2); // profile along nose
      z += noseShape * noseProfile * 0.45;
    }

    // Cheeks: nice rounded elevation
    if (Math.abs(x) > 0.4 && Math.abs(x) < 1.0 && y > -0.3 && y < 0.4) {
      const cheekFactor = Math.cos(((Math.abs(x) - 0.7) / 0.3) * Math.PI / 2) * Math.cos((y / 0.4) * Math.PI / 2);
      z += cheekFactor * 0.15;
    }

    // Mouth indentation
    if (y > -0.75 && y < -0.45 && Math.abs(x) < 0.5) {
      const mouthShape = Math.cos((x / 0.5) * Math.PI / 2) * Math.cos(((y + 0.6) / 0.15) * Math.PI / 2);
      z -= mouthShape * 0.08;
      // Lips slightly outstanding
      if (Math.abs(y + 0.6) < 0.04) {
        z += mouthShape * 0.04;
      }
    }

    // Jaw/Chin protrusion
    if (y < -0.8 && y > -1.2 && Math.abs(x) < 0.3) {
      const chinShape = Math.cos((x / 0.3) * Math.PI / 2) * Math.cos(((y + 1.0) / 0.2) * Math.PI / 2);
      z += chinShape * 0.15;
    }

    // Cyberpunk grid cuts/scratches or micro-fracturing (ice-crystal)
    // We add small offsets is all
    const jitter = 0.03;
    x += rand(-jitter, jitter);
    y += rand(-jitter, jitter);
    z += rand(-jitter, jitter);

    // Filter points to keep the shape perfectly proportional
    return { x, y, z };
  }
  return { x: rand(-1, 1), y: rand(-1, 1), z: rand(-0.2, 0.2) };
}

/**
 * Generates a 3D coordinate along the 3D AITO Logo.
 * The logo has:
 * 1. The stylized 'A' letter frame.
 * 2. An orbiting tilted ring.
 * 3. The small sphere orbiting.
 */
function getSingleLogoPoint(index: number, total: number): { x: number; y: number; z: number } {
  // Let's divide particles structurally:
  // 55% -> Stylized 'A' frame
  // 35% -> Orbiting tilted ring
  // 5% -> Orbiting sphere (the glowing satellite)
  // 5% -> Bottom text elements (A I T O) to anchor the logo
  const choice = index / total;

  if (choice < 0.55) {
    // Stylized 'A' Frame
    // Standard 'A' consists of two main diagonals, a crossbar, and the top arch
    const subChoice = Math.random();
    if (subChoice < 0.4) {
      // Left leg: slanted from top (0.0, 1.2) to bottom (-1.2, -1.2)
      const t = rand(0, 1);
      const x = -1.2 * t;
      const y = 1.2 - 2.4 * t;
      const z = rand(-0.12, 0.12) - 0.1 * y; // slanted depth
      return { x, y, z };
    } else if (subChoice < 0.8) {
      // Right leg: slanted from top (0.0, 1.2) to bottom (1.2, -1.2)
      const t = rand(0, 1);
      const x = 1.2 * t;
      const y = 1.2 - 2.4 * t;
      const z = rand(-0.12, 0.12) - 0.1 * y;
      return { x, y, z };
    } else {
      // Crossbar: connecting left leg inside to right leg inside
      // Roughly y is between -0.1 and -0.3
      const t = rand(-1, 1);
      const y = rand(-0.3, -0.1);
      // Width depends on y
      const limitX = 1.2 * (1.2 - y) / 2.4;
      const x = t * limitX * 0.75;
      const z = rand(-0.1, 0.1);
      return { x, y, z };
    }
  } else if (choice < 0.90) {
    // Orbiting Ring: A tilted ellipse wrapping around the 'A'
    // Equation of a tilted circle:
    const angle = rand(0, Math.PI * 2);
    // Base radius
    const r = 1.9 + rand(-0.06, 0.06);
    
    // Un-tilted coords
    const xBase = Math.cos(angle) * r;
    const zBase = Math.sin(angle) * r * 0.5; // flatter ellipse
    const yBase = -0.1 + Math.sin(angle) * 0.5; // tilted down/up

    // Let's tilt the whole thing around the X-axis for cosmetic swoop
    // y' = y cos(a) - z sin(a)
    // z' = y sin(a) + z cos(a)
    const tilt = 0.38; // approx 22 degrees
    const x = xBase;
    const y = yBase * Math.cos(tilt) - zBase * Math.sin(tilt);
    const z = yBase * Math.sin(tilt) + zBase * Math.cos(tilt);

    return { x, y, z };
  } else if (choice < 0.95) {
    // Orbiting Sphere: top right of orbit
    const theta = rand(0, Math.PI * 2);
    const phi = rand(0, Math.PI);
    const radius = 0.18 + rand(0, 0.02);

    const cx = 1.5;
    const cy = 0.5;
    const cz = 0.5; // Orbit position

    const x = cx + radius * Math.sin(phi) * Math.cos(theta);
    const y = cy + radius * Math.sin(phi) * Math.sin(theta);
    const z = cz + radius * Math.cos(phi);

    return { x, y, z };
  } else {
    // Bottom logo text (A I T O) - distributed as dotted base points
    // Let's create positions for 4 letters: A at -1, I at -0.3, T at 0.3, O at 1
    // y will be -1.7
    const letters = [
      // 'A' points
      () => {
        const t = Math.random();
        if (t < 0.4) return { x: rand(-1.0, -0.85), y: rand(-1.8, -1.6) };
        if (t < 0.8) return { x: rand(-0.85, -0.7), y: rand(-1.6, -1.8) };
        return { x: rand(-0.95, -0.75), y: rand(-1.72, -1.68) };
      },
      // 'I' points
      () => {
        const t = Math.random();
        if (t < 0.7) return { x: rand(-0.32, -0.28), y: rand(-1.8, -1.6) };
        return { x: rand(-0.35, -0.25), y: rand(-1.6, -1.6) }; // Top bar
      },
      // 'T' points
      () => {
        const t = Math.random();
        if (t < 0.5) return { x: rand(0.28, 0.32), y: rand(-1.8, -1.6) };
        return { x: rand(0.2, 0.4), y: rand(-1.62, -1.58) }; // Bar
      },
      // 'O' points
      () => {
        const angle = rand(0, Math.PI * 2);
        const rx = 0.12;
        const ry = 0.1;
        return { x: 0.9 + Math.cos(angle) * rx, y: -1.7 + Math.sin(angle) * ry };
      }
    ];

    const picker = Math.floor(rand(0, 4));
    const coords = letters[picker]();
    return {
      x: coords.x,
      y: coords.y,
      z: rand(-0.05, 0.05)
    };
  }
}

/**
 * Generates initial configurations for full particle arrays.
 * Returns { maskPositions, logoPositions, initialPositions }
 */
export function generateParticlePositions(count: number) {
  const maskPositions = new Float32Array(count * 3);
  const logoPositions = new Float32Array(count * 3);
  const flowVectors = new Float32Array(count * 3); // Flow patterns, wiring vectors

  for (let i = 0; i < count; i++) {
    // Generate Mask coordinate
    const mp = getSingleMaskPoint();
    maskPositions[i * 3] = mp.x;
    maskPositions[i * 3 + 1] = mp.y;
    maskPositions[i * 3 + 2] = mp.z;

    // Generate Logo coordinate
    const lp = getSingleLogoPoint(i, count);
    logoPositions[i * 3] = lp.x;
    logoPositions[i * 3 + 1] = lp.y;
    logoPositions[i * 3 + 2] = lp.z;

    // Generate neat circular or winding flow vectors for the circuits animation
    // We can use normalized tangents to the position
    const radius = Math.sqrt(mp.x * mp.x + mp.y * mp.y + 0.1);
    flowVectors[i * 3] = -mp.y / radius; // Tangent X
    flowVectors[i * 3 + 1] = mp.x / radius; // Tangent Y
    flowVectors[i * 3 + 2] = Math.sin(mp.x * 5.0) * 0.15; // Small wiggle
  }

  return { maskPositions, logoPositions, flowVectors };
}
