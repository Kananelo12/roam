import Svg, { Path } from "react-native-svg";

import { colors } from "@/theme";

const HEIGHT = 48; // how far the edge falls from left to right
const CORNER = 32; // top-left radius

type SheetCurveProps = {
  width: number;
};

/**
 * The curved top edge of the onboarding sheet: a rounded top-left corner, then
 * a smooth fall that meets the right edge vertically. Sits directly on the
 * white sheet so the two read as one shape.
 */
export function SheetCurve({ width }: SheetCurveProps) {
  const d = [
    `M0 ${HEIGHT}`,
    `L0 ${CORNER}`,
    `Q0 0 ${CORNER} 0`,
    `C${width * 0.6} 0 ${width} ${HEIGHT * 0.2} ${width} ${HEIGHT}`,
    "Z",
  ].join(" ");

  return (
    // -1 margin hides the hairline Android can leave between the curve and the sheet.
    <Svg width={width} height={HEIGHT} style={{ marginBottom: -1 }}>
      <Path d={d} fill={colors.surface} />
    </Svg>
  );
}
