import { getAuthenticatedJson } from '../api/api-client';

export interface UserProfile {
  name: string;
}

const userEndpoint = 'http://localhost:3000/user';

export async function getUserProfile(token: string, signal?: AbortSignal): Promise<UserProfile> {
  const response = await getAuthenticatedJson(userEndpoint, token, signal);

  if (
    typeof response !== 'object' ||
    response === null ||
    !('name' in response) ||
    typeof response.name !== 'string' ||
    !response.name.trim()
  ) {
    throw new Error('The user response did not contain a valid name.');
  }

  return { name: response.name.trim() };
}
