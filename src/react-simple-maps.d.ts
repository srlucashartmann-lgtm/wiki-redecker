declare module "react-simple-maps" {
  import { FC } from "react";

  export const ComposableMap: FC<{
    width?: number;
    height?: number;
    projection?: string;
    projectionConfig?: { center?: [number, number]; scale?: number };
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }>;

  export const Geographies: FC<{
    geography: string | object;
    parseGeographies?: (geos: unknown[]) => unknown[];
    children: (props: { geographies: unknown[] }) => React.ReactNode;
  }>;

  export const Geography: FC<{
    geography: { svgPath: string };
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  }>;

  export const Marker: FC<{
    coordinates: [number, number];
    children?: React.ReactNode;
    onMouseEnter?: (evt: React.MouseEvent) => void;
    onMouseLeave?: (evt: React.MouseEvent) => void;
  }>;
}
