import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createEarbuds, createHeadphones, createKeyboard, createMouse, createPhone } from '@/components/three/deviceModels';

export default function RgbDeviceScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 13);

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const lights = [0xff2d55, 0x39ff88, 0x2de2ff].map((color) => {
      const light = new THREE.PointLight(color, 40, 0, 2);
      scene.add(light);
      return light;
    });
    const key = new THREE.DirectionalLight(0xffffff, 0.6);
    key.position.set(3, 6, 8);
    scene.add(key);

    const phone = createPhone();
    phone.group.position.set(-3.6, 0.4, 0);
    const keyboard = createKeyboard();
    keyboard.group.position.set(3.2, -2.8, -2);
    keyboard.group.rotation.x = -0.4;
    const headphones = createHeadphones();
    headphones.position.set(4.2, 3, -3.5);
    const earbuds = createEarbuds();
    earbuds.position.set(-4.8, -3, -1);
    const mouse = createMouse();
    mouse.position.set(-0.6, -3.6, 1.5);
    const scene3d = [phone.group, keyboard.group, headphones, earbuds, mouse];
    scene.add(...scene3d);

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointerMove);

    const resize = () => {
      const { clientWidth: width, clientHeight: height } = container;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.position.z = width < 700 ? 16 : 13;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    const clock = new THREE.Clock();
    let frame = 0;
    const animate = () => {
      const t = clock.getElapsedTime();

      phone.group.rotation.y = Math.sin(t * 0.5) * 0.7;
      phone.group.rotation.x = Math.sin(t * 0.35) * 0.12;
      phone.group.position.y = 0.4 + Math.sin(t * 0.9) * 0.3;
      keyboard.group.position.y = -2.8 + Math.sin(t * 0.6 + 1) * 0.2;
      keyboard.group.rotation.z = Math.sin(t * 0.4) * 0.08;
      headphones.rotation.y = t * 0.3;
      headphones.position.y = 3 + Math.sin(t * 0.7 + 2) * 0.35;
      earbuds.rotation.z = Math.sin(t * 0.8) * 0.4;
      earbuds.position.y = -3 + Math.cos(t * 0.9) * 0.3;
      mouse.rotation.y = Math.sin(t * 0.3) * 0.5;
      mouse.position.y = -3.6 + Math.sin(t * 1.1 + 0.5) * 0.2;

      const hue = (t * 0.06) % 1;
      phone.screenMaterial.emissive.setHSL((hue + 0.55) % 1, 0.9, 0.22);
      keyboard.keyMaterial.emissive.setHSL(hue, 1, 0.5);

      lights.forEach((light, index) => {
        const angle = t * 0.4 + (index * Math.PI * 2) / 3;
        light.position.set(Math.cos(angle) * 7, Math.sin(angle * 1.3) * 4, 5);
        light.color.setHSL((hue + index / 3) % 1, 1, 0.55);
      });

      camera.position.x += (pointer.x * 1.2 - camera.position.x) * 0.04;
      camera.position.y += (-pointer.y * 0.8 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.InstancedMesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={containerRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />;
}
