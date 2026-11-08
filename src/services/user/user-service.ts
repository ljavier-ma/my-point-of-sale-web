import { getAuthenticatedJson } from '../api/api-client';

export interface UserProfile {
  name: string;
}

export interface UserStore {
  id: string;
  name: string;
}

const userEndpoint = 'http://localhost:3000/user';
const storeEndpoint = 'http://localhost:3000/store';

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

export async function getUserStore(token: string, signal?: AbortSignal): Promise<UserStore> {
  const response = await getAuthenticatedJson(storeEndpoint, token, signal);

  if (
    typeof response !== 'object' ||
    response === null ||
    !('id' in response) ||
    typeof response.id !== 'string' ||
    !response.id.trim() ||
    !('name' in response) ||
    typeof response.name !== 'string' ||
    !response.name.trim()
  ) {
    throw new Error('The store response did not contain a valid id and name.');
  }

  return { id: response.id.trim(), name: response.name.trim() };
}
