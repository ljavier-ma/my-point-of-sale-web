import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { User } from 'firebase/auth';
import { productQueryKeys } from '../products/products-queries';
import {
  getUserProfile,
  getUserStore,
  updateUserStore,
  type UserStore,
  type UserStoreUpdate,
} from './user-service';

export const userQueryKeys = {
  all: ['users'] as const,
  profile: (userId: string) => [...userQueryKeys.all, 'profile', userId] as const,
  store: (userId: string) => [...userQueryKeys.all, 'store', userId] as const,
};

export function useUserProfile(user: User | null) {
  return useQuery({
    queryKey: userQueryKeys.profile(user?.uid ?? ''),
    enabled: Boolean(user),
    queryFn: async ({ signal }) => {
      if (!user) {
        throw new Error('A signed-in user is required to load the profile.');
      }

      const token = await user.getIdToken();
      return getUserProfile(token, signal);
    },
  });
}

export function useUserStore(user: User | null) {
  return useQuery({
    queryKey: userQueryKeys.store(user?.uid ?? ''),
    enabled: Boolean(user),
    queryFn: async ({ signal }) => {
      if (!user) {
        throw new Error('A signed-in user is required to load the store.');
      }

      const token = await user.getIdToken();
      return getUserStore(token, signal);
    },
  });
}

export function useUpdateUserStore(user: User | null) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UserStoreUpdate>({
    mutationFn: async (store) => {
      if (!user) {
        throw new Error('A signed-in user is required to update the store.');
      }

      const token = await user.getIdToken();
      await updateUserStore(token, store);
    },
    onSuccess: async (_data, updatedStore) => {
      if (!user) {
        return;
      }

      const storeQueryKey = userQueryKeys.store(user.uid);
      const currentStore = queryClient.getQueryData<UserStore>(storeQueryKey);
      queryClient.setQueryData<UserStore>(storeQueryKey, (currentStore) =>
        currentStore ? { ...currentStore, ...updatedStore } : currentStore
      );

      if (
        currentStore &&
        (currentStore.settings.idealPercentageOfProduct !==
          updatedStore.settings.idealPercentageOfProduct ||
          currentStore.settings.lowPercentageOfProduct !==
            updatedStore.settings.lowPercentageOfProduct)
      ) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: productQueryKeys.belowIdeal(user.uid),
          }),
          queryClient.invalidateQueries({
            queryKey: productQueryKeys.lowQuantity(user.uid),
          }),
        ]);
      }
    },
  });
}
