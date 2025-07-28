# 🔐 Admin API Server Setup

This guide will help you set up the backend API server for secure admin user management.

## 🚀 Quick Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Full Development Environment
```bash
npm run dev:full
```

This will start both:
- **Frontend**: Vite dev server on `http://localhost:3000`
- **Backend**: Express API server on `http://localhost:3001`

### Step 3: Verify Setup
1. Frontend should be accessible at: `http://localhost:3000`
2. Backend API health check: `http://localhost:3001/api/health`

## 🔧 Alternative Commands

### Start Only the Backend Server
```bash
npm run server
```

### Start Only the Frontend
```bash
npm run dev
```

## 🛡️ Security Features

### ✅ Service Role Key Protection
- Service role key is only used in the backend
- Frontend never has access to admin privileges
- All admin operations go through secure API endpoints

### ✅ API Endpoints
- `POST /api/admin/create-user` - Create new users
- `DELETE /api/admin/delete-user` - Delete users
- `PUT /api/admin/update-user` - Update user details

## 🔍 Troubleshooting

### "Service Role Key Not Found"
1. Check your `.env` file has the correct `SUPABASE_SERVICE_ROLE_KEY`
2. Get the key from: Supabase Dashboard → Settings → API → Project API keys

### "Port Already in Use"
If port 3001 is busy, change it in `server.js`:
```javascript
const PORT = process.env.PORT || 3002; // Change to 3002
```

### "CORS Errors"
The backend is configured with CORS to allow requests from `localhost:3000`. If you change ports, update the CORS configuration in `server.js`.

## 🎯 How It Works

1. **Frontend** (React) → Makes API calls to backend
2. **Backend** (Express) → Uses service role key to call Supabase admin functions
3. **Supabase** → Creates/updates/deletes users securely

## 📝 Environment Variables

Make sure your `.env` file contains:
```env
SUPABASE_URL=https://yipyteszzyycbqgzpfrf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_TQ1zSRhSigcOeuSZBWjTtQ_sN35LKE-
```

## 🎉 Success!

Once both servers are running, you can:
1. Navigate to `http://localhost:3000/admin/users`
2. Create users from the employee list
3. Manage user permissions securely

The 403 error should now be resolved! 🎉 