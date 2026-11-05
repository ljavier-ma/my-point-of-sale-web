import { getAuthenticatedJson, postAuthenticatedJson } from '../api/api-client';

export interface Product {
  id: string;
  code: string | null;
  name: string;
  stock: number | null;
  unitaryPrice: number | null;
}

export interface NewProduct {
  name: string;
  code?: string;
  barcode?: string;
  stock?: number;
  unitaryPrice?: number;
  idealAmount?: number;
  lowQuantity?: number;
}

export interface PaginatedProducts {
  products: Product[];
  totalOfProducts: number;
}

const productsEndpoint = 'http://localhost:3000/products';

export async function createProduct(token: string, product: NewProduct): Promise<void> {
  await postAuthenticatedJson(productsEndpoint, token, product);
}

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
      (typeof product.code !== 'string' && product.code !== null) ||
      !('name' in product) ||
      typeof product.name !== 'string' ||
      !('stock' in product) ||
      (typeof product.stock !== 'number' && product.stock !== null) ||
      !('unitaryPrice' in product) ||
      (typeof product.unitaryPrice !== 'number' && product.unitaryPrice !== null)
    ) {
      throw new Error('A product in the response has an invalid format.');
    }

    return {
      id: product.id,
      code: product.code,
      name: product.name,
      stock: product.stock,
      unitaryPrice: product.unitaryPrice,
    };
  });

  return {
    products,
    totalOfProducts: response.totalOfProducts,
  };
}
