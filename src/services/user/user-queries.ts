import { useQuery } from '@tanstack/react-query';
import type { User } from 'firebase/auth';
import { getUserProfile, getUserStore } from './user-service';

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
