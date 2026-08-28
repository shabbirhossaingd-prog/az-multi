# AI Core backend contract

AZ Multi now has a central AI Core UI. The frontend never persists provider secret keys. A production backend should expose the following HTTPS endpoints behind the configured API Gateway URL.

## Required endpoints

### `POST /api/settings/ai-provider`
Receives the provider setup from the signed-in workspace and stores the secret server-side.

Example body:

```json
{
  "provider": "OpenAI",
  "model": "gpt-5",
  "apiKey": "SERVER-WILL-STORE-THIS-SECURELY"
}
```

Recommended response:

```json
{ "status": "OpenAI connected" }
```

The backend should encrypt or move the key into protected secret storage. Never return the raw key to the browser.

### `POST /api/ai/test`
Validates the currently selected provider/model without exposing the secret.

Example response:

```json
{ "status": "AI connected", "message": "Provider test passed." }
```

### `GET /api/ai/status`
Returns a safe connection summary only, for example provider, model, connected state and last test time.

### `POST /api/ai/generate`
Shared generation endpoint used by AI Studio, composer and AI-aware modules.

Typical request types include:

- `Caption`
- `Image Prompt`
- `Video Concept`
- `Ads Strategy`
- `Reply Suggestion`
- `Schedule Recommendation`
- `Keyword Intelligence`
- `Performance Analysis`

The request may also include brand context, platforms, campaign goal, audience or performance data.

## Approval boundary

AI can prepare content, reply suggestions, scheduling recommendations and ad strategy automatically. Production publishing and paid ad spend should still require an explicit approval action before the backend performs the external platform call.

## Gateway configuration

The frontend can use `VITE_API_BASE_URL`, or the AI Core UI can save a public API Gateway URL in the browser. Only the gateway URL is browser-safe. Provider keys, OAuth tokens and app secrets must remain server-side.
