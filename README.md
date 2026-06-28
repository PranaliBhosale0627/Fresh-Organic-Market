<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/16fbec70-bef3-4e26-bd39-04d47c670968

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy Backend on Render

The backend now uses MongoDB Atlas. Do not paste your MongoDB password into source code.

1. Push this repository to GitHub.
2. In Render, create a new Web Service for the backend.
3. Set the root directory to `backend`.
4. Set the build command to `npm install`.
5. Set the start command to `npm start`.
6. Add these Render environment variables:
   - `NODE_ENV=production`
   - `MONGODB_URI=mongodb+srv://pranalibhosale578_db_user:<your-password>@cluster0.bhbbhay.mongodb.net/verdant_harvest?retryWrites=true&w=majority&appName=Cluster0`
   - `MONGODB_DB=verdant_harvest`
   - `CORS_ORIGIN=<your deployed frontend URL>`

After Render deploys, test:

```text
https://your-render-service.onrender.com/api/health
```

## Connect Deployed Frontend

In your frontend hosting provider, set:

```text
VITE_API_URL=https://your-render-service.onrender.com
```

Then redeploy the frontend so it calls the Render backend instead of `/api`.
