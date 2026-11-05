import { useQuery } from '@tanstack/react-query';
import type { User } from 'firebase/auth';
import { getProducts, type PaginatedProducts } from './products-service';

export const DEFAULT_PRODUCTS_PAGE_SIZE = 50;

export const productQueryKeys = {
  all: ['products'] as const,
  page: (userId: string, offset: number, limit: number) =>
    [...productQueryKeys.all, userId, { offset, limit }] as const,
};

export function useProducts(user: User | null, offset: number, limit = DEFAULT_PRODUCTS_PAGE_SIZE) {
  return useQuery<PaginatedProducts, Error>({
    queryKey: productQueryKeys.page(user?.uid ?? '', offset, limit),
    enabled: Boolean(user),
    placeholderData: (previousData) => previousData,
    queryFn: async ({ signal }) => {
      if (!user) {
        throw new Error('A signed-in user is required to load products.');
      }

      const token = await user.getIdToken();
      return getProducts(token, offset, limit, signal);
    },
  });
}
