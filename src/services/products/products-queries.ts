import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import type { User } from 'firebase/auth';
import {
  createProduct,
  deleteProduct,
  getProductName,
  getProducts,
  getProductsBelowIdeal,
  searchProductsByName,
  type NewProduct,
  type PaginatedProducts,
  type ProductsBelowIdeal,
  type ProductSearchResult,
  type ProductFields,
  updateProduct,
} from './products-service';

export const DEFAULT_PRODUCTS_PAGE_SIZE = 50;

export const productQueryKeys = {
  all: ['products'] as const,
  detail: (userId: string, productId: string) =>
    [...productQueryKeys.all, userId, 'detail', productId] as const,
  belowIdeal: (userId: string) => [...productQueryKeys.all, userId, 'belowIdeal'] as const,
  search: (userId: string, name: string) =>
    [...productQueryKeys.all, userId, 'search', name] as const,
  page: (userId: string, offset: number, limit: number) =>
    [...productQueryKeys.all, userId, { offset, limit }] as const,
};

export function useSearchProducts(user: User | null, name: string, enabled = true) {
  return useQuery<ProductSearchResult[], Error>({
    queryKey: productQueryKeys.search(user?.uid ?? '', name),
    enabled: Boolean(user) && enabled && name.trim().length >= 3,
    queryFn: async ({ signal }) => {
      if (!user) {
        throw new Error('A signed-in user is required to search products.');
      }

      const token = await user.getIdToken();
      return searchProductsByName(token, name.trim(), signal);
    },
  });
}

export function useProductNames(user: User | null, productIds: string[]) {
  return useQueries({
    queries: productIds.map((productId) => ({
      queryKey: productQueryKeys.detail(user?.uid ?? '', productId),
      enabled: Boolean(user),
      queryFn: async ({ signal }: { signal: AbortSignal }) => {
        if (!user) {
          throw new Error('A signed-in user is required to load a product.');
        }

        const token = await user.getIdToken();
        return getProductName(token, productId, signal);
      },
    })),
  });
}

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

export function useProductsBelowIdeal(user: User | null) {
  return useQuery<ProductsBelowIdeal, Error>({
    queryKey: productQueryKeys.belowIdeal(user?.uid ?? ''),
    enabled: Boolean(user),
    queryFn: async ({ signal }) => {
      if (!user) {
        throw new Error('A signed-in user is required to load products.');
      }

      const token = await user.getIdToken();
      return getProductsBelowIdeal(token, signal);
    },
  });
}

export function useCreateProduct(user: User | null) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, NewProduct>({
    mutationFn: async (product) => {
      if (!user) {
        throw new Error('A signed-in user is required to create a product.');
      }

      const token = await user.getIdToken();
      await createProduct(token, product);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
    },
  });
}

export function useUpdateProduct(user: User | null) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; product: ProductFields }>({
    mutationFn: async ({ id, product }) => {
      if (!user) {
        throw new Error('A signed-in user is required to update a product.');
      }

      const token = await user.getIdToken();
      await updateProduct(token, id, product);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
    },
  });
}

export function useDeleteProduct(user: User | null) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      if (!user) {
        throw new Error('A signed-in user is required to delete a product.');
      }

      const token = await user.getIdToken();
      await deleteProduct(token, id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
    },
  });
}
