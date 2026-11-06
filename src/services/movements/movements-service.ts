import { getAuthenticatedJson } from '../api/api-client';

export interface MovementProductDetail {
  productTotal: number;
  productId: string;
  quantity: number;
}

export interface Movement {
  id: string;
  productDetails: MovementProductDetail[];
  time: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface PaginatedMovements {
  movements: Movement[];
  totalOfMovements: number;
}

const movementsEndpoint = 'http://localhost:3000/movements';

export async function getMovements(
  token: string,
  offset: number,
  limit: number,
  signal?: AbortSignal
): Promise<PaginatedMovements> {
  const searchParams = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  const response = await getAuthenticatedJson(
    `${movementsEndpoint}?${searchParams.toString()}`,
    token,
    signal
  );

  if (
    typeof response !== 'object' ||
    response === null ||
    !('movements' in response) ||
    !Array.isArray(response.movements) ||
    !('totalOfMovements' in response) ||
    typeof response.totalOfMovements !== 'number' ||
    !Number.isInteger(response.totalOfMovements) ||
    response.totalOfMovements < 0
  ) {
    throw new Error('The movements response has an invalid format.');
  }

  const movements = response.movements.map((movement): Movement => {
    if (
      typeof movement !== 'object' ||
      movement === null ||
      !('id' in movement) ||
      typeof movement.id !== 'string' ||
      !('productDetails' in movement) ||
      !Array.isArray(movement.productDetails) ||
      !('time' in movement) ||
      typeof movement.time !== 'object' ||
      movement.time === null ||
      !('_seconds' in movement.time) ||
      typeof movement.time._seconds !== 'number' ||
      !Number.isFinite(movement.time._seconds) ||
      !('_nanoseconds' in movement.time) ||
      typeof movement.time._nanoseconds !== 'number' ||
      !Number.isFinite(movement.time._nanoseconds)
    ) {
      throw new Error('A movement in the response has an invalid format.');
    }

    const productDetails = movement.productDetails.map((detail: unknown): MovementProductDetail => {
      if (
        typeof detail !== 'object' ||
        detail === null ||
        !('productTotal' in detail) ||
        typeof detail.productTotal !== 'number' ||
        !Number.isFinite(detail.productTotal) ||
        !('productId' in detail) ||
        typeof detail.productId !== 'string' ||
        !('quantity' in detail) ||
        typeof detail.quantity !== 'number' ||
        !Number.isFinite(detail.quantity)
      ) {
        throw new Error('A movement product detail in the response has an invalid format.');
      }

      return {
        productTotal: detail.productTotal,
        productId: detail.productId,
        quantity: detail.quantity,
      };
    });

    return {
      id: movement.id,
      productDetails,
      time: {
        _seconds: movement.time._seconds,
        _nanoseconds: movement.time._nanoseconds,
      },
    };
  });

  return {
    movements,
    totalOfMovements: response.totalOfMovements,
  };
}
