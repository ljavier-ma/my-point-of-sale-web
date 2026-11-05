export async function getAuthenticatedJson(
  url: string,
  token: string,
  signal?: AbortSignal
): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  return response.json();
}
