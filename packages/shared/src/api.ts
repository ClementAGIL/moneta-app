// API client shared by both apps. Types will be generated from moneta-api's docs/openapi.yaml (milestone W1).

/** True when the API at `baseUrl` ('' = same origin, as on the web) answers its health check. */
export async function checkHealth(baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}
