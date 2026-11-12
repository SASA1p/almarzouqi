import * as THREE from 'three';

function roundedRectShape(width: number, height: number, radius: number) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

export function createPhone() {
  const group = new THREE.Group();
  const bodyGeometry = new THREE.ExtrudeGeometry(roundedRectShape(1.5, 3, 0.3), {
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 4,
    curveSegments: 18,
  });
  bodyGeometry.center();
  const body = new THREE.Mesh(
    bodyGeometry,
    new THREE.MeshStandardMaterial({ color: 0x1b1f29, metalness: 0.9, roughness: 0.22 }),
  );

  const screenMaterial = new THREE.MeshStandardMaterial({
    color: 0x060812,
    emissive: 0x1a3c5c,
    emissiveIntensity: 0.9,
    roughness: 0.08,
    metalness: 0.3,
  });
  const screen = new THREE.Mesh(new THREE.ShapeGeometry(roundedRectShape(1.3, 2.8, 0.2), 8), screenMaterial);
  screen.position.z = 0.13;

  const cameraLens = new THREE.Mesh(
    new THREE.CircleGeometry(0.09, 20),
    new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x2de2ff, emissiveIntensity: 1.2 }),
  );
  cameraLens.position.set(-0.4, 1.12, 0.14);

  group.add(body, screen, cameraLens);
  return { group, screenMaterial };
}

export function createKeyboard() {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.14, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x14171f, metalness: 0.6, roughness: 0.35 }),
  );

  const rows = 4;
  const columns = 12;
  const keyMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2f3a,
    emissive: 0x2de2ff,
    emissiveIntensity: 0.35,
    roughness: 0.4,
  });
  const keys = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.08, 0.22), keyMaterial, rows * columns);
  const matrix = new THREE.Matrix4();
  let index = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      matrix.makeTranslation(-1.5 + column * 0.27, 0.11, -0.45 + row * 0.3);
      keys.setMatrixAt(index, matrix);
      index += 1;
    }
  }

  group.add(base, keys);
  return { group, keyMaterial };
}

export function createHeadphones() {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: 0x20242e, metalness: 0.7, roughness: 0.3 });
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.09, 14, 48, Math.PI), material);
  const leftCup = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.26, 28), material);
  const rightCup = leftCup.clone();
  leftCup.rotation.z = Math.PI / 2;
  rightCup.rotation.z = Math.PI / 2;
  leftCup.position.set(-0.9, 0, 0);
  rightCup.position.set(0.9, 0, 0);
  group.add(band, leftCup, rightCup);
  return group;
}

export function createMouse() {
  const mouse = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 28, 18),
    new THREE.MeshStandardMaterial({ color: 0x171b24, metalness: 0.5, roughness: 0.3 }),
  );
  mouse.scale.set(0.75, 0.3, 1.1);
  const glow = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.02, 8, 36),
    new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x39ff88, emissiveIntensity: 1.4 }),
  );
  glow.rotation.x = Math.PI / 2;
  glow.position.y = 0.18;
  const group = new THREE.Group();
  group.add(mouse, glow);
  return group;
}

export function createEarbuds() {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: 0xf2f4f8, metalness: 0.2, roughness: 0.35 });
  for (const x of [-0.45, 0.45]) {
    const bud = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 16), material);
    bud.position.x = x;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.28, 12), material);
    stem.position.set(x, -0.22, 0);
    group.add(bud, stem);
  }
  return group;
}
