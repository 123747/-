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
  // We sample coordinates until we get a valid point with high anthropomorphic detail
  let attempts = 0;
  while (attempts < 150) {
    attempts++;
    // Angle theta from a rounded face arc and vertical span v
    const u = rand(-1, 1); // horizontal factor
    const v = rand(-1.25, 1.25); // vertical factor

    // Base face proportions
    let x = u * 1.4;
    let y = v * 1.8;

    // Standard human face proportions:
    // Chin tapering down, forehead scaling up
    // Smoothed transition at the bottom to ensure elegant chin contour without sharp corners
    const taper = y < 0 
      ? (1.0 + y * 0.28 + (y * y) * 0.04) 
      : (1.0 - (y - 0.6) * 0.08);
    x *= taper;

    // Generates a smooth base spherical/dome depth Z
    const r2 = (u * u) + (v * v) * 0.7;
    let z = 0;
    if (r2 < 2.5) {
      z = Math.sqrt(Math.max(0, 2.5 - r2)) * 0.85;
    } else {
      z = 0;
    }

    // Prohibit points too far to the back to keep the frontal portrait view sleek
    if (z < 0.1) {
      continue;
    }

    // 1. Realistic Prominent Hollow Eye Sockets (exactly like the reference image)
    // Eyes are placed at y = 0.25, x = ±0.44
    const leftEyeX = -0.44;
    const rightEyeX = 0.44;
    const eyeY = 0.25;
    // We define a larger, more realistic rounded socket shape so that the eyes form complete hollow gaps
    const leftEyeSlot = Math.sqrt(Math.pow((x - leftEyeX) / 0.32, 2) + Math.pow((y - eyeY) / 0.18, 2));
    const rightEyeSlot = Math.sqrt(Math.pow((x - rightEyeX) / 0.32, 2) + Math.pow((y - eyeY) / 0.18, 2));

    // Exclude points inside the eye sockets to create highly defined, dark human eye-cutouts
    if (leftEyeSlot < 0.92 || rightEyeSlot < 0.92) {
      continue;
    }

    // Orbits/Eyelids modeling around eyes
    const leftOrbit = Math.sqrt(Math.pow((x - leftEyeX) / 0.42, 2) + Math.pow((y - eyeY) / 0.24, 2));
    const rightOrbit = Math.sqrt(Math.pow((x - rightEyeX) / 0.42, 2) + Math.pow((y - eyeY) / 0.24, 2));
    if (leftOrbit < 1.0) {
      const factor = Math.cos(leftOrbit * Math.PI);
      z -= 0.18 * (1.0 + factor);
      if (leftOrbit > 0.6) {
        z += 0.06 * Math.sin((leftOrbit - 0.6) * Math.PI * 2.5); // prominent eyebrow / eyelid fold
      }
    }
    if (rightOrbit < 1.0) {
      const factor = Math.cos(rightOrbit * Math.PI);
      z -= 0.18 * (1.0 + factor);
      if (rightOrbit > 0.6) {
        z += 0.06 * Math.sin((rightOrbit - 0.6) * Math.PI * 2.5);
      }
    }

    // 2. Tall, Sharp and Highly Defined Human Nose Shape (from the brow down to a clear tip)
    const noseBaseY = -0.22;
    const noseTopY = 0.45;
    if (y > noseBaseY && y < noseTopY) {
      const noseLength = noseTopY - noseBaseY;
      const progress = (y - noseBaseY) / noseLength; // 0 at base, 1 at bridge top
      
      const noseWidth = 0.13 + (1.0 - progress) * 0.13; // expands naturally at the tip
      if (Math.abs(x) < noseWidth) {
        // Cosine cross section (sharp ridge)
        const noseCrossSection = Math.cos((x / noseWidth) * Math.PI / 2);
        
        let noseHeight = 0.52; // Very tall & sharp 3D profile
        if (progress < 0.15) {
          // Sharp slope up to the nose tip
          noseHeight = 0.25 + (progress / 0.15) * 0.32;
        } else {
          // Sleek straight nose bridge descending to the brow intersection
          noseHeight = 0.57 - (progress - 0.15) * 0.26;
        }
        z += noseCrossSection * noseHeight;

        // Flare and curves of nostrils base
        if (Math.abs(x) > 0.05 && progress < 0.22) {
          z += Math.sin(((Math.abs(x) - 0.05) / (noseWidth - 0.05)) * Math.PI) * 0.08;
        }
      }
    }

    // 3. Realistic Cupid's Bow & Lips Structure
    // Centered at y = -0.58
    const mouthY = -0.58;
    const mouthYDist = y - mouthY;
    const mouthWidth = 0.45;
    if (Math.abs(x) < mouthWidth && Math.abs(mouthYDist) < 0.16) {
      const mouthXRatio = x / mouthWidth;
      const mouthWidthFactor = Math.cos(mouthXRatio * Math.PI / 2);
      
      // Upper lip & Lower lip profiles
      if (Math.abs(mouthYDist) < 0.08) {
        const lipPartFactor = Math.cos((mouthYDist / 0.08) * Math.PI / 2);
        
        // Cupid's bow dip around center top
        let cupidsBow = 1.0;
        if (mouthYDist > 0 && Math.abs(x) < 0.1) {
          cupidsBow = 0.85 + 0.15 * Math.abs(x / 0.1);
        }
        
        // Add lip thickness
        z += 0.15 * mouthWidthFactor * lipPartFactor * cupidsBow;

        // Realistic split gap between lip lines
        if (Math.abs(mouthYDist) < 0.016) {
          z -= 0.08 * mouthWidthFactor;
        }
      }

      // Philtrum indentation (vertical trough between nose and mouth)
      if (y > -0.48 && y < -0.18 && Math.abs(x) < 0.1) {
        const philtrumFactor = Math.cos((x / 0.1) * Math.PI / 2);
        z -= 0.04 * philtrumFactor;
      }
    }

    // 4. Rounded Prominent Cheeks & Face Contour
    // High zygomatic arches at y = -0.05, x = ±0.72
    const leftCheekDist = Math.sqrt(Math.pow((x - (-0.72)) / 0.42, 2) + Math.pow((y - (-0.05)) / 0.38, 2));
    const rightCheekDist = Math.sqrt(Math.pow((x - 0.72) / 0.42, 2) + Math.pow((y - (-0.05)) / 0.38, 2));
    if (leftCheekDist < 1.0) {
      z += Math.cos(leftCheekDist * Math.PI / 2) * 0.12;
    }
    if (rightCheekDist < 1.0) {
      z += Math.cos(rightCheekDist * Math.PI / 2) * 0.12;
    }

    // 5. Eyebrows Contour ridge
    const leftBrowDist = Math.sqrt(Math.pow((x - (-0.46)) / 0.35, 2) + Math.pow((y - 0.48) / 0.12, 2));
    const rightBrowDist = Math.sqrt(Math.pow((x - 0.46) / 0.35, 2) + Math.pow((y - 0.48) / 0.12, 2));
    if (leftBrowDist < 1.0) {
      z += Math.cos(leftBrowDist * Math.PI / 2) * 0.07;
    }
    if (rightBrowDist < 1.0) {
      z += Math.cos(rightBrowDist * Math.PI / 2) * 0.07;
    }

    // 6. Styled Chin & Jaw Contour
    const chinY = -1.1;
    const chinYDist = y - chinY;
    const chinWidth = 0.28;
    if (Math.abs(x) < chinWidth && Math.abs(chinYDist) < 0.18) {
      const chinPartFactor = Math.cos((x / chinWidth) * Math.PI / 2) * Math.cos((chinYDist / 0.18) * Math.PI / 2);
      z += chinPartFactor * 0.12;
    }

    // Cyberpunk grid jitter to keep the particle aesthetics floating
    const jitter = 0.012;
    x += rand(-jitter, jitter);
    y += rand(-jitter, jitter);
    z += rand(-jitter, jitter);

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
  // 50% -> Stylized 'A' frame
  // 30% -> Orbiting tilted ring
  // 5% -> Orbiting sphere (the glowing satellite)
  // 15% -> Bottom text elements (A I T O) to anchor the logo with superb high definition
  const choice = index / total;

  if (choice < 0.50) {
    // Stylized 'A' Frame (50% particles)
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
  } else if (choice < 0.80) {
    // Orbiting Ring: A tilted ellipse wrapping around the 'A' (30% particles)
    const angle = rand(0, Math.PI * 2);
    // Base radius
    const r = 1.9 + rand(-0.06, 0.06);
    
    // Un-tilted coords
    const xBase = Math.cos(angle) * r;
    const zBase = Math.sin(angle) * r * 0.5; // flatter ellipse
    const yBase = -0.1 + Math.sin(angle) * 0.5; // tilted down/up

    // Let's tilt the whole thing around the X-axis for cosmetic swoop
    const tilt = 0.38; // approx 22 degrees
    const x = xBase;
    const y = yBase * Math.cos(tilt) - zBase * Math.sin(tilt);
    const z = yBase * Math.sin(tilt) + zBase * Math.cos(tilt);

    return { x, y, z };
  } else if (choice < 0.85) {
    // Orbiting Sphere: top right of orbit (5% particles)
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
    // Bottom logo text (A I T O) (15% particles for massive density, clarity and sharpness) - distributed as precise geometric point outlines
    const letters = [
      // 'A' points
      () => {
        const sub = Math.random();
        const t = Math.random();
        const centerX = -0.75;
        if (sub < 0.45) {
          // Left slanted leg of A
          const lx = centerX - 0.15 + 0.15 * t;
          const ly = -1.85 + 0.35 * t;
          return { x: lx, y: ly };
        } else if (sub < 0.9) {
          // Right slanted leg of A
          const rx = centerX + 0.15 - 0.15 * t;
          const ry = -1.85 + 0.35 * t;
          return { x: rx, y: ry };
        } else {
          // Cross bar of A
          const cx = centerX - 0.08 + 0.16 * t;
          const cy = -1.68 + rand(-0.005, 0.005);
          return { x: cx, y: cy };
        }
      },
      // 'I' points
      () => {
        const sub = Math.random();
        const t = Math.random();
        const centerX = -0.25;
        if (sub < 0.6) {
          // Vertical stem of I
          const ix = centerX + rand(-0.015, 0.015);
          const iy = -1.85 + 0.35 * t;
          return { x: ix, y: iy };
        } else if (sub < 0.8) {
          // Top serif horizontal bar of I
          const ix = centerX - 0.1 + 0.2 * t;
          const iy = -1.5 + rand(-0.005, 0.005);
          return { x: ix, y: iy };
        } else {
          // Bottom serif horizontal bar of I
          const ix = centerX - 0.1 + 0.2 * t;
          const iy = -1.85 + rand(-0.005, 0.005);
          return { x: ix, y: iy };
        }
      },
      // 'T' points
      () => {
        const sub = Math.random();
        const t = Math.random();
        const centerX = 0.25;
        if (sub < 0.6) {
          // Vertical central stem of T
          const tx = centerX + rand(-0.015, 0.015);
          const ty = -1.85 + 0.35 * t;
          return { x: tx, y: ty };
        } else {
          // Top horizontal cross bar of T
          const tx = centerX - 0.15 + 0.3 * t;
          const ty = -1.5 + rand(-0.005, 0.005);
          return { x: tx, y: ty };
        }
      },
      // 'O' points
      () => {
        const angle = rand(0, Math.PI * 2);
        const centerX = 0.75;
        // Draw a thick rounded oval outline for O
        const rx = 0.14 + rand(-0.015, 0.015);
        const ry = 0.17 + rand(-0.015, 0.015);
        return { 
          x: centerX + Math.cos(angle) * rx, 
          y: -1.675 + Math.sin(angle) * ry 
        };
      }
    ];

    const picker = Math.floor(rand(0, 4));
    const coords = letters[picker]();
    return {
      x: coords.x,
      y: coords.y,
      z: rand(-0.04, 0.04)
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
