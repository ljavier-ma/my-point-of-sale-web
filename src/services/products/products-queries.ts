import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { User } from 'firebase/auth';
import {
  createProduct,
  deleteProduct,
  getProducts,
  type NewProduct,
  type PaginatedProducts,
  type ProductFields,
  updateProduct,
} from './products-service';

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
