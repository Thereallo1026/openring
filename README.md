# OpenRing

An open-source webring API built with Cloudflare Workers. Create and manage webrings - a retro web navigation system that connects websites in a circular chain.

## Why?

Traditional webrings require every member site to implement navigation logic. OpenRing centralizes this - members just add anchor tags:

​```html
<a href="https://ring.example/next?url=mysite.com&redirect=true">Next ></a>
​```

No JavaScript required. No logic to maintain. Deploy once, invite members.

## Features

- Navigate between sites (next, previous, random)
- List all sites in the webring
- Admin API for managing sites
- Interactive API documentation via [Scalar](https://scalar.com/)
- Serverless deployment on Cloudflare Workers
- Data stored in Cloudflare KV

## Quick Deploy

### Deploy with Wrangler (Recommended)

#### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.com/)
- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

#### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/Thereallo1026/openring.git
   cd openring
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Login to Cloudflare**

   ```bash
   wrangler login
   ```

4. **Create a KV namespace**

   ```bash
   wrangler kv namespace create OPENRING_KV
   ```

   This will output something like:

   ```
   { binding = "OPENRING_KV", id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxx" }
   ```

   Copy the `id` value.

5. **Create a preview KV namespace** (for local development)

   ```bash
   wrangler kv namespace create OPENRING_KV --preview
   ```

   Copy the `id` value from this output as well.

6. **Update `wrangler.jsonc`**

   Replace the KV namespace IDs with your own:

   ```jsonc
   {
     "kv_namespaces": [
       {
         "binding": "OPENRING_KV",
         "id": "YOUR_KV_NAMESPACE_ID",
         "preview_id": "YOUR_PREVIEW_KV_NAMESPACE_ID"
       }
     ]
   }
   ```

7. **Set your admin token**

   Generate a secure token (you can use any method):

   ```bash
   openssl rand -hex 32
   ```

   Then set it as a secret:

   ```bash
   wrangler secret put ADMIN_TOKEN
   ```

   Paste your token when prompted.

8. **Deploy**

   ```bash
   bun run deploy
   ```

   Your webring API is now live at `https://openring.<your-subdomain>.workers.dev`

### Deploy via Cloudflare Dashboard

1. Fork this repository to your GitHub account
2. Go to [Cloudflare Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
3. Click **Create** > **Workers** > **Create via direct upload** or connect to Git
4. Connect your GitHub account and select the forked repository
5. Configure the build:
   - Build command: `bun install && bun run deploy`
   - Build output directory: (leave empty)
6. Add environment variables:
   - Create a KV namespace in **Workers & Pages** > **KV**
   - Bind it to `OPENRING_KV` in your Worker settings
   - Add `ADMIN_TOKEN` as an encrypted environment variable

## Local Development

1. **Create a `.dev.vars` file** for local secrets:

   ```bash
   ADMIN_TOKEN=your-local-dev-token
   ```

2. **Start the development server**

   ```bash
   bun dev
   ```

3. Open `http://localhost:8787/docs` to view the API documentation

## API Endpoints

### Navigation (Public)

| Endpoint | Description |
|----------|-------------|
| `GET /next?url={url}` | Get the next site in the ring |
| `GET /prev?url={url}` | Get the previous site in the ring |
| `GET /random` | Get a random site |
| `GET /list` | List all sites |

**Query Parameters:**

- `url` - The current site URL (required for `/next` and `/prev`)
- `redirect=true` - Return a 302 redirect instead of JSON
- `exclude` - For `/random`, exclude this URL from results

### Admin (Protected)

| Endpoint | Description |
|----------|-------------|
| `POST /admin/sites` | Add a site to the webring |
| `DELETE /admin/sites` | Remove a site from the webring |

**Authentication:**

Include your admin token in the `Authorization` header:

```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Documentation

| Endpoint | Description |
|----------|-------------|
| `GET /` | Redirect to API docs |
| `GET /docs` | Interactive API documentation |
| `GET /openapi.json` | OpenAPI specification |

## Adding Sites

Use the admin API to add sites to your webring:

```bash
curl -X POST https://your-worker.workers.dev/admin/sites \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "name": "Example Site",
    "description": "A cool website",
    "image": "https://example.com/banner.png"
  }'
```

## Widget Integration

Add this HTML snippet to member sites:

```html
<div id="webring">
  <a href="https://your-worker.workers.dev/prev?url=https://mysite.com&redirect=true">Previous</a>
  <a href="https://your-worker.workers.dev/list">Ring</a>
  <a href="https://your-worker.workers.dev/next?url=https://mysite.com&redirect=true">Next</a>
</div>
```

Or with JavaScript for dynamic navigation:

```html
<div id="webring">
  <a id="prev-link" href="#">Previous</a>
  <a id="ring-link" href="https://your-worker.workers.dev/list">Ring</a>
  <a id="next-link" href="#">Next</a>
</div>

<script>
  const baseUrl = 'https://your-worker.workers.dev';
  const currentSite = encodeURIComponent(window.location.origin);
  
  document.getElementById('prev-link').href = `${baseUrl}/prev?url=${currentSite}&redirect=true`;
  document.getElementById('next-link').href = `${baseUrl}/next?url=${currentSite}&redirect=true`;
</script>
```

## Environment Variables

| Variable | Type | Description |
|----------|------|-------------|
| `OPENRING_KV` | KV Binding | Cloudflare KV namespace for storing sites |
| `ADMIN_TOKEN` | Secret | Bearer token for admin endpoints |


## License

[MIT](LICENSE)
