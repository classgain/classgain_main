# ClassGain

ClassGain is a MERN education platform with three React + Vite applications and one shared Express + MongoDB API.

## Applications

| Folder | Application | Production host |
| --- | --- | --- |
| `client/` | Student/customer frontend | Vercel |
| `seller/` | Education-center seller frontend | Vercel |
| `admin/` | Admin frontend | Vercel |
| `server/` | Express and MongoDB API | Render |

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete Atlas, Render, and Vercel deployment procedure.

## Local development

Requirements: Node.js 20.19 or newer (and lower than Node 25) plus a MongoDB database.

1. Install all dependencies:

   ```powershell
   npm run install:all
   ```

2. Create `server/.env` from `server/.env.example`. Set `NODE_ENV=development`, a valid `MONGO_URI`, and a random `JWT_SECRET`.

3. Start the API and each frontend in separate terminals:

   ```powershell
   npm run dev:server
   npm run dev:client
   npm run dev:seller
   npm run dev:admin
   ```

To start the admin frontend and backend together (recommended for admin development), run:

```bash
npm run dev:admin:full
```

The committed `.env.development` files keep `/api` requests behind the Vite development proxy. Production builds use `VITE_API_URL` instead.

## Production verification

Build all frontends:

```powershell
npm run build:all
```

Start the server from its deployment root:

```powershell
cd server
npm start
```

The health check is available at `/api/health`.
