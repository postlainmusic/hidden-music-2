// 🌌 GLSL Vertex & Fragment Shaders for Genre/Mood-Driven Particle Systems (High-Vibrancy)

export const GenreParticleVertexShader = `
  uniform float uTime;
  uniform float uSubBass;
  uniform float uKick;
  uniform float uVocalMid;
  uniform float uHighTreble;
  uniform int uMoodTier; // 0 = Chill/Poetic, 1 = Cosmic/Ambient, 2 = Trap/Cybernetic

  attribute float aScale;
  attribute vec3 aRandomVec;
  attribute float aPhase;

  varying vec3 vColor;
  varying float vAlpha;

  // Simplex-style 3D noise approximation
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vec3 pos = position;
    float distFromCenter = length(pos.xy);
    float angle = atan(pos.y, pos.x);

    // ─────────────────────────────────────────────────────────────
    // TIER 0: CHILL / POETIC / MELANCHOLIC (Sinuous Bioluminescent Mist)
    // ─────────────────────────────────────────────────────────────
    if (uMoodTier == 0) {
      float wave = sin(pos.x * 0.35 + uTime * 1.2 + aPhase) * cos(pos.y * 0.3 + uTime * 0.8);
      pos.z += wave * (1.8 + uVocalMid * 3.5);
      pos.y += snoise(pos * 0.2 + vec3(0.0, uTime * 0.4, 0.0)) * (1.2 + uSubBass * 2.8);
      
      // Color: Deep Indigo & Lavender Violet into Silver Starlight
      vec3 colA = vec3(0.38, 0.42, 0.95);
      vec3 colB = vec3(0.85, 0.55, 1.00);
      vColor = mix(colA, colB, sin(distFromCenter * 0.25 + uTime * 0.8) * 0.5 + 0.5);
      vAlpha = (0.75 + uVocalMid * 0.35);
    }
    // ─────────────────────────────────────────────────────────────
    // TIER 1: COSMIC / MYSTICAL / AMBIENT (Gravitational Nebula Vortex)
    // ─────────────────────────────────────────────────────────────
    else if (uMoodTier == 1) {
      float rotSpeed = (0.35 + uKick * 0.85) * (1.0 / (distFromCenter * 0.2 + 1.0));
      float newAngle = angle + uTime * rotSpeed;
      pos.x = cos(newAngle) * distFromCenter;
      pos.y = sin(newAngle) * distFromCenter;
      pos.z += sin(distFromCenter * 0.9 - uTime * 3.0) * (1.0 + uSubBass * 3.5);

      // Color: Electric Sapphire & Radiant Emerald Aurora
      vec3 colA = vec3(0.20, 0.55, 1.00);
      vec3 colB = vec3(0.10, 0.95, 0.70);
      vColor = mix(colA, colB, sin(newAngle * 2.0 + uTime * 1.5) * 0.5 + 0.5);
      vAlpha = (0.80 + uKick * 0.4);
    }
    // ─────────────────────────────────────────────────────────────
    // TIER 2: TRAP / CYBERNETIC / WARP (High-Energy Particle Shockwave)
    // ─────────────────────────────────────────────────────────────
    else {
      vec3 shockDir = normalize(pos + vec3(0.001));
      float pulseWave = sin(distFromCenter * 2.2 - uTime * 8.0);
      pos += shockDir * (pulseWave * (0.8 + uKick * 2.5) + uSubBass * 3.2);

      // Color: Hyper Neon Violet & Electric Cyan
      vec3 colA = vec3(0.85, 0.15, 1.00);
      vec3 colB = vec3(0.00, 0.95, 1.00);
      vColor = mix(colA, colB, fract(distFromCenter * 0.4 + uTime * 3.0));
      vAlpha = (0.85 + uKick * 0.45);
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Dynamic, high-visibility point size scaling with beat and treble sparkle
    float pSize = aScale * (65.0 / -mvPosition.z) * (1.0 + uKick * 0.8 + uHighTreble * 1.2);
    gl_PointSize = clamp(pSize, 4.0, 72.0);
  }
`;

export const GenreParticleFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // High-luminous radial particle falloff with intense core
    vec2 centerCoord = gl_PointCoord - vec2(0.5);
    float dist = length(centerCoord);
    if (dist > 0.5) discard;

    float glow = smoothstep(0.5, 0.0, dist);
    float core = smoothstep(0.15, 0.0, dist) * 1.8;

    vec3 finalColor = vColor + vec3(core * 0.8);
    gl_FragColor = vec4(finalColor, vAlpha * glow);
  }
`;
