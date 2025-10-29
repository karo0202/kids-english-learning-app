# Auth Setup (Google, Apple, Email)

Follow these steps once, then deploy.

## 1) Firebase Console
- Create a Firebase project
- Add a Web app (</>) and copy these values:
  - API Key, Auth Domain, Project ID, App ID
- Enable Authentication providers:
  - Email/Password: Enable
  - Google: Enable
  - Apple: Enable and complete Service ID + Key setup (Apple Developer account)

## 2) Local env (.env.local)
Create `app/.env.local` with:

```
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=1:xxx:web:yyy
```

## 3) Vercel env
Set the same variables in Vercel (Project Settings → Environment Variables):
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Redeploy after saving.

## 4) Test
- Visit `/register` to create account (email/password or Google/Apple)
- Visit `/login` to sign in
