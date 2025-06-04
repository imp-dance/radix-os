import "csstype";

declare module "csstype" {
  interface Properties {
    [index: `--${string}`]: string | number;
  }
}
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}
