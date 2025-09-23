# Cloudflare API Routing Fix - kroniq.io

## Problem
Cloudflare proxy intercepts `/api/v1/*` requests and returns 404 before they reach the server.

## Solution 1: Cloudflare Page Rules (Recommended)

### Step 1: Create Page Rule for API Routes
1. Login to Cloudflare Dashboard
2. Go to Rules → Page Rules
3. Click "Create Page Rule"
4. Configure:
   - **URL Pattern**: `kroniq.io/api/*`
   - **Settings**:
     - Cache Level: Bypass
     - Security Level: Essentially Off
     - Browser Cache TTL: Respect Existing Headers
     - Always Use HTTPS: Off (let nginx handle it)

### Step 2: Create Page Rule for Webhooks
1. Create another Page Rule
2. Configure:
   - **URL Pattern**: `kroniq.io/v1/*`
   - **Settings**:
     - Cache Level: Bypass
     - Security Level: Essentially Off
     - Browser Cache TTL: Respect Existing Headers

## Solution 2: Cloudflare Workers (Advanced)

Create a Worker script to handle API routing:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // Pass through API and webhook requests without modification
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/v1/')) {
    // Forward directly to origin server
    const originRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body
    })

    return fetch(originRequest, {
      cf: {
        cacheTtl: 0,
        cacheEverything: false
      }
    })
  }

  // For all other requests, use normal Cloudflare behavior
  return fetch(request)
}
```

## Solution 3: Temporary Disable Proxy

**Quick Test Only - Not for Production**

1. Go to Cloudflare DNS settings
2. Find the `kroniq.io` A record
3. Click the orange cloud (proxied) to make it gray (DNS only)
4. Wait 1-2 minutes for propagation
5. Test API calls

**Remember to re-enable proxy after testing!**

## Solution 4: Custom SSL/TLS Settings

1. Go to SSL/TLS → Overview
2. Set to "Full (strict)"
3. Go to SSL/TLS → Edge Certificates
4. Enable "Always Use HTTPS": OFF
5. Let nginx handle the HTTPS redirect

## Testing Commands

```bash
# Test API endpoint
curl -v https://kroniq.io/api/v1/flags

# Test webhook endpoint
curl -v https://kroniq.io/v1/flags

# Test with direct IP (bypass Cloudflare)
curl -H 'Host: kroniq.io' http://YOUR_SERVER_IP/api/v1/flags
```

## Recommended Order

1. Try Solution 1 (Page Rules) first
2. If still issues, check SSL/TLS settings (Solution 4)
3. Use Solution 3 for quick testing only
4. Solution 2 for advanced scenarios

## Verification

After implementing any solution:

1. Test API calls from browser console
2. Check nginx logs for incoming requests
3. Verify PM2 backend is receiving requests
4. Test WhatsApp webhook functionality