import { SITES_DIR } from '../../../shared/paths.ts';

const PROFILE_PICTURE_FILE = (username: string) => `${SITES_DIR}/${username}/profile.jpg`;

export function getProfilePicturePath(username: string): string {
  return PROFILE_PICTURE_FILE(username);
}
