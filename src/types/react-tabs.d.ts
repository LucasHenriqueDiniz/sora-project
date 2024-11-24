import "react-tabs";

declare module "react-tabs" {
  export interface TabProps {
    tabIndex?: string;
    className?: string;
    ref?: React.Ref<HTMLElement>;
    children?: React.ReactNode;
  }
}
