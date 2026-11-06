import { useQuery } from '@tanstack/react-query';
import type { User } from 'firebase/auth';
import { getMovements, type PaginatedMovements } from './movements-service';

export const DEFAULT_MOVEMENTS_PAGE_SIZE = 50;

export const movementQueryKeys = {
  all: ['movements'] as const,
  page: (userId: string, offset: number, limit: number) =>
    [...movementQueryKeys.all, userId, { offset, limit }] as const,
};

export function useMovements(
  user: User | null,
  offset: number,
  limit = DEFAULT_MOVEMENTS_PAGE_SIZE
) {
  return useQuery<PaginatedMovements, Error>({
    queryKey: movementQueryKeys.page(user?.uid ?? '', offset, limit),
    enabled: Boolean(user),
    placeholderData: (previousData) => previousData,
    queryFn: async ({ signal }) => {
      if (!user) {
        throw new Error('A signed-in user is required to load movements.');
      }

      const token = await user.getIdToken();
      return getMovements(token, offset, limit, signal);
    },
  });
}
