const providerBaseUrl = process.env.EXPO_PUBLIC_PROVIDER_BASE_URL ?? "http://localhost:4100";

export async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${providerBaseUrl}${path}`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed ${response.status}: ${text}`);
  }
  return (await response.json()) as T;
}

export { providerBaseUrl };
