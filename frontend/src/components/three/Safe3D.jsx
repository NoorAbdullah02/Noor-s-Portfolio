import { Component, Suspense, useMemo } from "react";
import useMediaQuery from "../../hooks/useMediaQuery";

let webglSupport;
function hasWebGL() {
  if (webglSupport !== undefined) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    webglSupport = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

class Boundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err) {
    console.warn("3D scene disabled:", err?.message);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function Safe3D({ children, fallback = null, minWidth = 768 }) {
  const wideEnough = useMediaQuery(`(min-width: ${minWidth}px)`);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const webgl = useMemo(() => hasWebGL(), []);

  if (!wideEnough || reducedMotion || !webgl) return fallback;

  return (
    <Boundary fallback={fallback}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </Boundary>
  );
}
