import type { Layout as RGLLayout, Layouts as RGLLayouts } from "react-grid-layout";

export interface TabData {
  id: string;
  title: string;
  type: "code" | "preview" | "blueprint" | "image";
  path: string;
  content: string;
}

export interface TabContainer {
  id: string;
  tabs: TabData[];
  activeTab: number;
}

export interface Layout extends RGLLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Layouts extends RGLLayouts {
  lg: Layout[];
  [key: string]: Layout[];
}

export interface GridContainer {
  id: string;
  tabs: TabData[];
  activeTab: number;
}

export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
}

export interface CodeEditorProps extends BaseComponentProps {
  file: string;
  content: string;
}

export interface ScenePreviewProps extends BaseComponentProps {
  file: string;
}

export interface NodeEditorProps extends BaseComponentProps {
  file: string;
  content: string;
}

export interface TabProps {
  children?: React.ReactNode;
  className?: string;
  selectedClassName?: string;
  tabIndex?: string;
  ref?: React.Ref<HTMLElement>;
}
