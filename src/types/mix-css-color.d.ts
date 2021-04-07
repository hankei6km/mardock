declare module 'mix-css-color' {
  const mixCssColor: (
    color1: string,
    color2: string,
    percentage: number
  ) => {
    hex: string;
    hexa: string;
    rgba: number[];
    hsla: number[];
  };
  export default mixCssColor;
}
