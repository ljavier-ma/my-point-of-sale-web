import {
  deleteAuthenticated,
  getAuthenticatedJson,
  patchAuthenticatedJson,
  postAuthenticatedJson,
} from '../api/api-client';
import { API_BASE_URL } from '../api/api-config';

export interface Product {
  id: string;
  code: string | null;
  name: string;
  barcode: string | null;
  stock: number | null;
  unitaryPrice: number | null;
  baseStockAmount: number | null;
}

export interface ProductFields {
  name: string;
  code: string;
  barcode: string;
  stock: number;
  unitaryPrice: number;
  baseStockAmount: number;
}

export type NewProduct = ProductFields;

export interface PaginatedProducts {
  products: Product[];
  totalOfProducts: number;
}

export type ProductsBelowIdeal = Product[];
export type ProductsWithLowQuantity = Product[];

export interface ProductSearchResult {
  id: string;
  name: string;
}

const productsEndpoint = `${API_BASE_URL}/products`;

export async function createProduct(token: string, product: NewProduct): Promise<void> {
  await postAuthenticatedJson(productsEndpoint, token, product);
}

export async function updateProduct(
  token: string,
  id: string,
  product: ProductFields
): Promise<void> {
  await patchAuthenticatedJson(`${productsEndpoint}/${encodeURIComponent(id)}`, token, product);
}

export async function deleteProduct(token: string, id: string): Promise<void> {
  await deleteAuthenticated(`${productsEndpoint}/${encodeURIComponent(id)}`, token);
}

export async function getProductName(
  token: string,
  id: string,
  signal?: AbortSignal
): Promise<string> {
  const response = await getAuthenticatedJson(
    `${productsEndpoint}/${encodeURIComponent(id)}`,
    token,
    signal
  );

  if (
    typeof response !== 'object' ||
    response === null ||
    !('id' in response) ||
    response.id !== id ||
    !('name' in response) ||
    typeof response.name !== 'string'
  ) {
    throw new Error('The product response has an invalid format.');
  }

  return response.name;
}

export async function searchProductsByName(
  token: string,
  name: string,
  signal?: AbortSignal
): Promise<ProductSearchResult[]> {
  const searchParams = new URLSearchParams({ name });
  const response = await getAuthenticatedJson(
    `${productsEndpoint}/search?${searchParams.toString()}`,
    token,
    signal
  );
  const products = Array.isArray(response)
    ? response
    : typeof response === 'object' &&
        response !== null &&
        'products' in response &&
        Array.isArray(response.products)
      ? response.products
      : null;

  if (!products) {
    throw new Error('The product search response has an invalid format.');
  }

  return products.map((product: unknown): ProductSearchResult => {
    if (
      typeof product !== 'object' ||
      product === null ||
      !('id' in product) ||
      typeof product.id !== 'string' ||
      !('name' in product) ||
      typeof product.name !== 'string'
    ) {
      throw new Error('A product in the search response has an invalid format.');
    }

    return { id: product.id, name: product.name };
  });
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
    !('totalOfProducts' in response) ||
    typeof response.totalOfProducts !== 'number' ||
    !Number.isInteger(response.totalOfProducts) ||
    response.totalOfProducts < 0
  ) {
    throw new Error('The products response has an invalid format.');
  }

  return {
    products: parseProducts(response),
    totalOfProducts: response.totalOfProducts,
  };
}

export async function getProductsBelowIdeal(
  token: string,
  signal?: AbortSignal
): Promise<ProductsBelowIdeal> {
  const response = await getAuthenticatedJson(`${productsEndpoint}/bellowIdeal`, token, signal);
  return parseProducts(response);
}

export async function getProductsWithLowQuantity(
  token: string,
  signal?: AbortSignal
): Promise<ProductsWithLowQuantity> {
  const response = await getAuthenticatedJson(`${productsEndpoint}/lowQuantity`, token, signal);
  return parseProducts(response);
}

function parseProducts(response: unknown): Product[] {
  if (
    typeof response !== 'object' ||
    response === null ||
    !('products' in response) ||
    !Array.isArray(response.products)
  ) {
    throw new Error('The products response has an invalid format.');
  }

  return response.products.map((product): Product => {
    if (typeof product !== 'object' || product === null) {
      throw new Error('A product in the response has an invalid format.');
    }

    const code = 'code' in product ? (product.code ?? null) : null;
    const barcode = 'barcode' in product ? (product.barcode ?? null) : null;
    const stock = 'stock' in product ? (product.stock ?? null) : null;
    const unitaryPrice = 'unitaryPrice' in product ? (product.unitaryPrice ?? null) : null;
    const baseStockAmount =
      'baseStockAmount' in product ? (product.baseStockAmount ?? null) : null;

    if (
      !('id' in product) ||
      typeof product.id !== 'string' ||
      !('name' in product) ||
      typeof product.name !== 'string' ||
      (typeof code !== 'string' && code !== null) ||
      (typeof barcode !== 'string' && barcode !== null) ||
      (typeof stock !== 'number' && stock !== null) ||
      (typeof unitaryPrice !== 'number' && unitaryPrice !== null) ||
      (typeof baseStockAmount !== 'number' && baseStockAmount !== null)
    ) {
      throw new Error('A product in the response has an invalid format.');
    }

    return {
      id: product.id,
      code,
      name: product.name,
      barcode,
      stock,
      unitaryPrice,
      baseStockAmount,
    };
  });
}
