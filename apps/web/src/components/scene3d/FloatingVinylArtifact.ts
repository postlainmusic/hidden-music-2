import * as THREE from "three";

export interface VinylArtifactNodes {
  group: THREE.Group;
  discGroup: THREE.Group;
  discMesh: THREE.Mesh;
  sleeveMesh: THREE.Mesh;
  labelMesh: THREE.Mesh;
  materials: THREE.Material[];
  geometries: THREE.BufferGeometry[];
  textures: THREE.Texture[];
  dispose: () => void;
}

/**
 * Creates the luxury 3D Floating Vinyl Artifact with high-contrast PBR materials
 * Oriented dynamically towards camera with anisotropic sheen and center artwork
 */
export const createFloatingVinylArtifact = (coverUrl: string): VinylArtifactNodes => {
  const group = new THREE.Group();
  const discGroup = new THREE.Group();
  const materials: THREE.Material[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  const textures: THREE.Texture[] = [];

  // 1. Procedural High-Contrast Anisotropic Vinyl Groove Texture
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Pure obsidian vinyl base
    ctx.fillStyle = "#0c0d12";
    ctx.fillRect(0, 0, 1024, 1024);

    // Fine concentric micro-grooves
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1.2;
    for (let r = 160; r < 490; r += 2.2) {
      ctx.beginPath();
      ctx.arc(512, 512, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Radial specular highlights for realistic anisotropic reflections
    const grad = ctx.createRadialGradient(512, 512, 160, 512, 512, 490);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.15)");
    grad.addColorStop(0.5, "rgba(255, 255, 255, 0.02)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0.12)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);
  }
  const grooveTexture = new THREE.CanvasTexture(canvas);
  grooveTexture.wrapS = THREE.RepeatWrapping;
  grooveTexture.wrapT = THREE.RepeatWrapping;
  textures.push(grooveTexture);

  // 2. High-Poly Vinyl Disc (Front-facing tilt)
  const discGeo = new THREE.CylinderGeometry(2.3, 2.3, 0.04, 64);
  geometries.push(discGeo);

  const discMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#181920"),
    roughness: 0.16,
    metalness: 0.88,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    bumpMap: grooveTexture,
    bumpScale: 0.012,
    reflectivity: 0.98,
  });
  materials.push(discMat);

  const discMesh = new THREE.Mesh(discGeo, discMat);
  discMesh.rotation.x = Math.PI / 2; // Face the camera directly
  discMesh.castShadow = true;
  discMesh.receiveShadow = true;
  discGroup.add(discMesh);

  // 3. Center Label Inlaid with Real Album Cover Artwork
  const textureLoader = new THREE.TextureLoader();
  const labelTexture = textureLoader.load(coverUrl);
  textures.push(labelTexture);

  const labelGeo = new THREE.CylinderGeometry(0.88, 0.88, 0.045, 48);
  geometries.push(labelGeo);

  const labelMat = new THREE.MeshStandardMaterial({
    map: labelTexture,
    roughness: 0.25,
    metalness: 0.05,
  });
  materials.push(labelMat);

  const labelMesh = new THREE.Mesh(labelGeo, labelMat);
  labelMesh.rotation.x = Math.PI / 2;
  discGroup.add(labelMesh);

  // Add the rotating disc group to root
  discGroup.position.set(0.6, 0.2, 0.1);
  group.add(discGroup);

  // 4. Outer Frosted Liquid Glass Slipcase (Tilted slightly behind disc)
  const sleeveGeo = new THREE.BoxGeometry(4.8, 4.8, 0.12);
  geometries.push(sleeveGeo);

  // Sleeve cover texture
  const sleeveFrontTexture = textureLoader.load(coverUrl);
  textures.push(sleeveFrontTexture);

  const sleeveMat = new THREE.MeshPhysicalMaterial({
    map: sleeveFrontTexture,
    roughness: 0.12,
    metalness: 0.1,
    transmission: 0.65, // Liquid glass sheen
    thickness: 0.8,
    ior: 1.52,
    transparent: true,
    opacity: 0.88,
    reflectivity: 0.95,
    clearcoat: 1.0,
  });
  materials.push(sleeveMat);

  const sleeveMesh = new THREE.Mesh(sleeveGeo, sleeveMat);
  sleeveMesh.position.set(-0.8, -0.1, -0.2);
  sleeveMesh.rotation.z = -0.06;
  group.add(sleeveMesh);

  // Global artistic tilt for optimal cinematic viewing angle
  group.rotation.x = 0.15;
  group.rotation.y = -0.22;

  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
  };

  return {
    group,
    discGroup,
    discMesh,
    sleeveMesh,
    labelMesh,
    materials,
    geometries,
    textures,
    dispose,
  };
};
