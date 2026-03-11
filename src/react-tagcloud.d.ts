declare module "react-tagcloud" {
  export interface TagCloudTag {
    value: string;
    count: number;
  }

  export interface TagCloudProps {
    tags: TagCloudTag[];
    minSize: number;
    maxSize: number;
    shuffle?: boolean;
    randomSeed?: number;
    disableRandomColor?: boolean;
    renderer?: (tag: TagCloudTag, fontSize: number, color?: string) => React.ReactElement;
    onClick?: (tag: TagCloudTag, event: React.MouseEvent) => void;
    className?: string;
    containerComponent?: React.ElementType;
  }

  export const TagCloud: React.FC<TagCloudProps>;
}
