import { BufferGeometry, Float32BufferAttribute, Line } from 'three';
import { useRef } from 'react';

function Orbit({ radius = 4, segments = 64, color = 'white' }) {
  const lineRef = useRef();

  // Create points for the circle
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * 2 * Math.PI;
    points.push(radius * Math.cos(theta), 0, radius * Math.sin(theta));
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(points, 3));

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color={color} />
    </line>
  );
}

export default Orbit;
