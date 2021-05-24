export function buildAssets(
  mode: string,
  staticBuild: string,
  previewMode: boolean
): boolean {
  switch (mode) {
    case '':
    case 'static':
      if (staticBuild !== 'true' || previewMode) {
        return false;
      }
      return true;
    case 'dynamic':
      if (previewMode) {
        return false;
      }
      return true;
    case 'always':
      return true;
  }
  return false;
}
