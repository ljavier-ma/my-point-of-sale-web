import {
  deleteAuthenticated,
  getAuthenticatedJson,
  patchAuthenticatedJson,
  postAuthenticatedJson,
} from '../api/api-client';

export interface Product {
  id: string;
  code: string | null;
  name: string;
  barcode: string | null;
  stock: number | null;
  unitaryPrice: number | null;
  idealAmount: number | null;
  lowQuantity: number | null;
}

export interface ProductFields {
  name: string;
  code: string | null;
  barcode: string | null;
  stock: number | null;
  unitaryPrice: number | null;
  idealAmount: number | null;
  lowQuantity: number | null;
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
    if (typeof product !== 'object' || product === null) {
      throw new Error('A product in the response has an invalid format.');
    }

    const code = 'code' in product ? (product.code ?? null) : null;
    const barcode = 'barcode' in product ? (product.barcode ?? null) : null;
    const stock = 'stock' in product ? (product.stock ?? null) : null;
    const unitaryPrice = 'unitaryPrice' in product ? (product.unitaryPrice ?? null) : null;
    const idealAmount = 'idealAmount' in product ? (product.idealAmount ?? null) : null;
    const lowQuantity = 'lowQuantity' in product ? (product.lowQuantity ?? null) : null;

    if (
      !('id' in product) ||
      typeof product.id !== 'string' ||
      !('name' in product) ||
      typeof product.name !== 'string' ||
      (typeof code !== 'string' && code !== null) ||
      (typeof barcode !== 'string' && barcode !== null) ||
      (typeof stock !== 'number' && stock !== null) ||
      (typeof unitaryPrice !== 'number' && unitaryPrice !== null) ||
      (typeof idealAmount !== 'number' && idealAmount !== null) ||
      (typeof lowQuantity !== 'number' && lowQuantity !== null)
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
      idealAmount,
      lowQuantity,
    };
  });

  return {
    products,
    totalOfProducts: response.totalOfProducts,
  };
}
