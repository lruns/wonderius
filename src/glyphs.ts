import type { Kind } from "./types";

// Ink pictograms, drawn in a -9..9 box. Stroke only, no emoji.
export const GLYPHS: Record<Kind, string> = {
  city: "M-6,6 V0 A3,3 0 0 1 0,0 A3,3 0 0 1 6,0 V6 Z M-6,6 H6 M-6,-4 H6",
  cave: "M-8,6 L-3,-5 L0,0 L3,-6 L8,6 Z M-2,6 Q0,1 2,6",
  mine: "M-7,-3 Q0,-9 7,-3 M0,-6 V7 M-3,7 H3",
  crystal: "M0,-8 L5,-2 L3,6 L-3,6 L-5,-2 Z M0,-8 L0,6 M-5,-2 L5,-2",
  temple: "M-7,-2 L0,-8 L7,-2 Z M-5,-1 V5 M0,-1 V5 M5,-1 V5 M-7,7 H7",
  bunker: "M-7,6 V-1 Q0,-8 7,-1 V6 Z M-2,6 V1 H2 V6",
  ice: "M0,-8 V8 M-7,-4 L7,4 M-7,4 L7,-4",
  dwellings: "M-6,6 V-1 L0,-7 L6,-1 V6 Z M-1.5,6 V1.5 H1.5 V6",
  tomb: "M-4,7 V-3 Q0,-9 4,-3 V7 Z M-4,2 H4",
};
