import { getAuthenticatedJson } from '../api/api-client';

export interface Product {
  id: string;
  code: string;
  name: string;
  stock: number;
  publicPrice: number;
}

export interface PaginatedProducts {
  products: Product[];
  totalOfProducts: number;
}

const productsEndpoint = 'http://localhost:3000/products';

export async function getProducts(
  token: string,
  offset: number,
  limit: number,
  signal?: AbortSignal
): Promise<PaginatedProducts> {
  const searchParams = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  const response = await getAuthenticatedJson(
    `${productsEndpoint}?${searchParams.toString()}`,
    token,
    signal
  );

  if (
    typeof response !== 'object' ||
    response === null ||
    !('products' in response) ||
    !Array.isArray(response.products) ||
    !('totalOfProducts' in response) ||
    typeof response.totalOfProducts !== 'number' ||
    !Number.isInteger(response.totalOfProducts) ||
    response.totalOfProducts < 0
  ) {
    throw new Error('The products response has an invalid format.');
  }

  const products = response.products.map((product): Product => {
    if (
      typeof product !== 'object' ||
      product === null ||
      !('id' in product) ||
      typeof product.id !== 'string' ||
      !('code' in product) ||
      typeof product.code !== 'string' ||
      !('name' in product) ||
      typeof product.name !== 'string' ||
      !('stock' in product) ||
      typeof product.stock !== 'number' ||
      !('publicPrice' in product) ||
      typeof product.publicPrice !== 'number'
    ) {
      throw new Error('A product in the response has an invalid format.');
    }

    return {
      id: product.id,
      code: product.code,
      name: product.name,
      stock: product.stock,
      publicPrice: product.publicPrice,
    };
  });

  return {
    products,
    totalOfProducts: response.totalOfProducts,
  };
}
