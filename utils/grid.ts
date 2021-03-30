export function gridTempalteAreasFromLayout({
  top,
  main,
  bottom
}: {
  top: any;
  main: any;
  bottom: any;
}): string {
  if (top && main && bottom) {
    return '"top top main main main main main main bot bot bot"';
  } else if (top && main && !bottom) {
    return '"top top main main main main main main main main main"';
  } else if (!top && main && bottom) {
    return '"main main main main main main main main bot bot bot"';
  }
  return '"main main main main main main main main main main main"';
}
