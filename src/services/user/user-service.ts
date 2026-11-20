import { getAuthenticatedJson, patchAuthenticatedJson } from '../api/api-client';
import { API_BASE_URL } from '../api/api-config';

export interface UserProfile {
  name: string;
  isForTesting?: boolean;
}

export interface UserStoreSettings {
  idealPercentageOfProduct: number;
  lowPercentageOfProduct: number;
}

export interface UserStore {
  id: string;
  name: string;
  settings: UserStoreSettings;
}

export interface UserStoreUpdate {
  name: string;
  settings: UserStoreSettings;
}

const userEndpoint = `${API_BASE_URL}/user`;
const storeEndpoint = `${API_BASE_URL}/store`;

export async function updateUserStore(token: string, store: UserStoreUpdate): Promise<void> {
  await patchAuthenticatedJson(storeEndpoint, token, store);
}

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

  const hasTestingFlag = 'isForTesting' in response;
  const isForTesting = Reflect.get(response, 'isForTesting');

  if (hasTestingFlag && typeof isForTesting !== 'boolean') {
    throw new Error('The user response contained an invalid testing flag.');
  }

  return {
    name: response.name.trim(),
    ...(typeof isForTesting === 'boolean' ? { isForTesting } : {}),
  };
}

export async function getUserStore(token: string, signal?: AbortSignal): Promise<UserStore> {
  const response = await getAuthenticatedJson(storeEndpoint, token, signal);
  const settings =
    typeof response === 'object' && response !== null && 'settings' in response
      ? response.settings
      : null;

  if (
    typeof response !== 'object' ||
    response === null ||
    !('id' in response) ||
    typeof response.id !== 'string' ||
    !response.id.trim() ||
    !('name' in response) ||
    typeof response.name !== 'string' ||
    !response.name.trim() ||
    typeof settings !== 'object' ||
    settings === null ||
    !('idealPercentageOfProduct' in settings) ||
    typeof settings.idealPercentageOfProduct !== 'number' ||
    !Number.isFinite(settings.idealPercentageOfProduct) ||
    !('lowPercentageOfProduct' in settings) ||
    typeof settings.lowPercentageOfProduct !== 'number' ||
    !Number.isFinite(settings.lowPercentageOfProduct)
  ) {
    throw new Error('The store response did not contain valid store details and settings.');
  }

  return {
    id: response.id.trim(),
    name: response.name.trim(),
    settings: {
      idealPercentageOfProduct: settings.idealPercentageOfProduct,
      lowPercentageOfProduct: settings.lowPercentageOfProduct,
    },
  };
}
