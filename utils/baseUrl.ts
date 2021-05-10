import { join } from 'path';

export function getBaseUrl(): string {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  } else {
    const [githubUser, githubRepo] = process.env.GITHUB_REPOSITORY
      ? process.env.GITHUB_REPOSITORY.split('/', 2)
      : ['', ''];
    if (githubUser) {
      const _basePath = process.env.STAGING_DIR
        ? join(githubRepo, process.env.STAGING_DIR)
        : githubRepo;
      return `https://${githubUser}.github.io/${_basePath}`;
    }
  }
  return '';
}
