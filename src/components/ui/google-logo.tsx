import Svg, { Path } from "react-native-svg";

import { googleLogo } from "./google-logo-path";

export type GoogleLogoProps = {
  size?: number;
};

/** Google's "G" for "Continue with Google". Decorative: the button carries the label. */
export function GoogleLogo({ size = 22 }: GoogleLogoProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${googleLogo.size} ${googleLogo.size}`}
      accessible={false}
    >
      {googleLogo.paths.map((path) => (
        <Path key={path.fill} fill={path.fill} d={path.d} />
      ))}
    </Svg>
  );
}
