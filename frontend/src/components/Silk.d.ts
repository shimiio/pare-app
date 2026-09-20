// Types for the vendored Silk.jsx background component (see .gitattributes: linguist-generated)
import type { JSX } from "react";

export interface SilkProps {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
}

declare const Silk: (props: SilkProps) => JSX.Element;

export default Silk;
