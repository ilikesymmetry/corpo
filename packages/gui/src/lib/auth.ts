const TOKEN_KEY = 'corpo:github_token'

// ─── Token storage ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// ─── GitHub OAuth Device Flow ─────────────────────────────────────────────────

interface DeviceCodeResponse {
  device_code: string
  user_code: string
  verification_uri: string
  expires_in: number
  interval: number
}

interface AccessTokenResponse {
  access_token?: string
  error?: string
  error_description?: string
}

/**
 * Initiates GitHub OAuth Device Flow.
 * Returns the access token on success, or null if the user cancels or the flow expires.
 *
 * The caller is responsible for showing the user_code and verification_uri
 * from the onCode callback before polling begins.
 */
export async function githubDeviceAuth(
  clientId: string,
  onCode?: (userCode: string, verificationUri: string) => void,
): Promise<string | null> {
  // Step 1: Request device and user codes
  const codeRes = await fetch('https://github.com/login/device/code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      scope: 'public_repo user:email',
    }),
  })

  if (!codeRes.ok) {
    throw new Error(`Device code request failed: HTTP ${codeRes.status}`)
  }

  const codeData = (await codeRes.json()) as DeviceCodeResponse
  const { device_code, user_code, verification_uri, expires_in, interval } = codeData

  // Step 2: Show the code to the user
  if (onCode) {
    onCode(user_code, verification_uri)
  }

  // Step 3: Poll for the access token
  const pollIntervalMs = (interval ?? 5) * 1000
  const expiresAt = Date.now() + (expires_in ?? 900) * 1000

  while (Date.now() < expiresAt) {
    await sleep(pollIntervalMs)

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        device_code,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    })

    if (!tokenRes.ok) continue

    const tokenData = (await tokenRes.json()) as AccessTokenResponse

    if (tokenData.access_token) {
      return tokenData.access_token
    }

    // Errors that mean we should keep polling
    if (tokenData.error === 'authorization_pending' || tokenData.error === 'slow_down') {
      // slow_down means we need to increase the interval
      if (tokenData.error === 'slow_down') {
        await sleep(pollIntervalMs) // extra wait
      }
      continue
    }

    // Terminal errors
    if (tokenData.error === 'expired_token' || tokenData.error === 'access_denied') {
      return null
    }
  }

  return null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ─── GitHub user email ────────────────────────────────────────────────────────

interface GitHubEmail {
  email: string
  primary: boolean
  verified: boolean
}

/**
 * Fetches the authenticated user's primary verified email from the GitHub API.
 * Returns null if unauthenticated or the request fails.
 */
export async function fetchUserEmail(token: string): Promise<string | null> {
  const res = await fetch('https://api.github.com/user/emails', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (!res.ok) return null
  const emails = (await res.json()) as GitHubEmail[]
  const primary = emails.find(e => e.primary && e.verified)
  return primary?.email ?? null
}
