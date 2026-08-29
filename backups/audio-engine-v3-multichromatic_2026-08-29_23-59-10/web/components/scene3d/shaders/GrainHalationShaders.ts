// 🎬 35mm Film Halation, Dynamic Grain, Chromatic Aberration & ACES Filmic Post-Processing Shaders

export const GrainHalationVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const GrainHalationFragmentShader = `
  uniform sampler2D tDiffuse;
  uniform float uTime;
  uniform float uGrainIntensity;
  uniform float uHalationIntensity;
  uniform float uChromaticAberration;
  uniform float uVignetteIntensity;
  varying vec2 vUv;

  // High-performance pseudo-random noise generator
  float random(vec2 p) {
    vec2 k1 = vec2(
      23.14069263277926, // e^pi (transcendental)
      2.665144142690225  // 2^sqrt(2) (algebraic)
    );
    return fract(cos(dot(p, k1)) * 12345.6789);
  }

  // ACES Filmic Tone Mapping Curve (Narkowicz 2015)
  vec3 ACESFilmicToneMapping(vec3 x) {
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
  }

  void main() {
    vec2 uv = vUv;
    vec2 center = vec2(0.5);
    vec2 dir = uv - center;
    float dist = length(dir);

    // 1. Sub-Bass Driven Chromatic Aberration (Radial Lens Separation)
    float caOffset = uChromaticAberration * (dist * 0.025 + 0.002);
    float r = texture2D(tDiffuse, uv + dir * caOffset).r;
    float g = texture2D(tDiffuse, uv).g;
    float b = texture2D(tDiffuse, uv - dir * caOffset).b;
    vec3 color = vec3(r, g, b);

    // 2. 35mm Film Halation (Warm reddish-orange diffusion on bright highlights)
    if (uHalationIntensity > 0.01) {
      vec3 bloomSample = texture2D(tDiffuse, uv + vec2(0.003, 0.002)).rgb;
      float luminance = dot(bloomSample, vec3(0.2126, 0.7152, 0.0722));
      if (luminance > 0.65) {
        vec3 halationColor = vec3(1.0, 0.28, 0.08); // Warm 35mm emulsion glow
        color += halationColor * (luminance - 0.65) * uHalationIntensity * 1.8;
      }
    }

    // 3. Dynamic 35mm Film Grain (Animated per frame at 60fps)
    float grain = (random(uv * 3.5 + vec2(sin(uTime * 15.0), cos(uTime * 23.0))) - 0.5) * uGrainIntensity;
    color += grain;

    // 4. Subtle Cinematic Vignette (Preserves dark room comfort)
    float vignette = smoothstep(1.2, 0.45, dist * uVignetteIntensity);
    color *= vignette;

    // 5. ACES Filmic Tone Mapping
    color = ACESFilmicToneMapping(color);

    gl_FragColor = vec4(color, 1.0);
  }
`;
