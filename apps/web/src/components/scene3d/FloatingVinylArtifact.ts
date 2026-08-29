import * as THREE from "three";

export interface VinylArtifactNodes {
  group: THREE.Group;
  discMesh: THREE.Mesh;
  sleeveMesh: THREE.Mesh;
  labelMesh: THREE.Mesh;
  grooveMesh: THREE.Mesh;
  materials: THREE.Material[];
  geometries: THREE.BufferGeometry[];
  textures: THREE.Texture[];
  dispose: () => void;
}

/**
 * Creates the high-fidelity 3D Vinyl Artifact with high-contrast PBR materials
 */
export const createFloatingVinylArtifact = (coverUrl: string): VinylArtifactNodes => {
  const group = new THREE.Group();
  const materials: THREE.Material[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  const textures: THREE.Texture[] = [];

  // 1. Procedural Anisotropic Vinyl Groove Texture Generator
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#0a0a0c";
    ctx.fillRect(0, 0, 1024, 1024);

    // Draw fine concentric micro-grooves
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let r = 160; r < 490; r += 2.5) {
      ctx.beginPath();
      ctx.arc(512, 512, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  const grooveTexture = new THREE.CanvasTexture(canvas);
  grooveTexture.wrapS = THREE.RepeatWrapping;
  grooveTexture.wrapT = THREE.RepeatWrapping;
  textures.push(grooveTexture);

  // 2. High-Poly Vinyl Disc Geometry & PBR Material
  const discGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.04, 64);
  geometries.push(discGeo);

  const discMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#121318"),
    roughness: 0.18,
    metalness: 0.85,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    bumpMap: grooveTexture,
    bumpScale: 0.008,
    reflectivity: 0.95,
  });
  materials.push(discMat);

  const discMesh = new THREE.Mesh(discGeo, discMat);
  discMesh.castShadow = true;
  discMesh.receiveShadow = true;
  group.add(discMesh);

  // 3. Center Label (Inlaid Album Artwork)
  const textureLoader = new THREE.TextureLoader();
  const labelTexture = textureLoader.load(coverUrl);
  textures.push(labelTexture);

  const labelGeo = new THREE.CylinderGeometry(0.88, 0.88, 0.045, 48);
  geometries.push(labelGeo);

  const labelMat = new THREE.MeshStandardMaterial({
    map: labelTexture,
    roughness: 0.35,
    metalness: 0.1,
  });
  materials.push(labelMat);

  const labelMesh = new THREE.Mesh(labelGeo, labelMat);
  group.add(labelMesh);

  // 4. Outer Frosted Acrylic Slipcase (High-Contrast Glass Border)
  const sleeveGeo = new THREE.BoxGeometry(5.2, 0.08, 5.2);
  geometries.push(sleeveGeo);

  const sleeveMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#ffffff"),
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.88, // Liquid glass refraction
    thickness: 1.2,
    ior: 1.52,
    transparent: true,
    opacity: 0.35,
    reflectivity: 0.9,
    clearcoat: 1.0,
  });
  materials.push(sleeveMat);

  const sleeveMesh = new THREE.Mesh(sleeveGeo, sleeveMat);
  sleeveMesh.position.set(-1.2, -0.08, 0);
  sleeveMesh.rotation.y = 0.15;
  group.add(sleeveMesh);

  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
  };

  return {
    group,
    discMesh,
    sleeveMesh,
    labelMesh,
    grooveMesh: discMesh,
    materials,
    geometries,
    textures,
    dispose,
  };
};
