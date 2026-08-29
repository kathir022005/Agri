# 🌾 Agri Billing App — வேளாண் கணக்கு

A full-stack **MERN** web application for recording agriculture purchase/sale bills with Tanglish item names, live auto-calculated totals, Excel export, and an earthy custom color theme.

---

## Features
- 📝 **Bill Entry** — date picker, Tanglish item dropdown, multi-row line items, live Capacity × Amount totals, grand total
- 📋 **Bill History** — paginated table, date-range filter, View / Edit / Delete per bill
- 📄 **Bill Detail** — all line items, grand total, edit/delete actions
- 📥 **Excel Export** — styled `.xlsx` with bold headers, alternating row colors, grand total row
- 🎨 **Custom earthy theme** — deep green, warm mustard, soil brown — zero blue

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18 + Vite 5, React Router 6 |
| Styling    | Plain custom CSS (no Bootstrap)   |
| Backend    | Node.js + Express 4               |
| Database   | MongoDB + Mongoose 8              |
| Excel      | ExcelJS                           |
| HTTP       | Axios                             |

---

## Project Structure

```
agri-billing-app/
├── backend/
│   ├── config/db.js
│   ├── controllers/billController.js
│   ├── models/Bill.js
│   ├── routes/billRoutes.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BillForm.jsx
│   │   │   ├── BillList.jsx
│   │   │   └── BillDetail.jsx
│   │   ├── config/items.js   ← Edit Tanglish item list here
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js ≥ 18
- A MongoDB Atlas account (free M0 tier) OR local MongoDB

### 1. Clone & enter project

```bash
git clone <your-github-repo-url>
cd agri-billing-app
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env — paste your MongoDB connection string:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/agri-billing
npm install
npm run dev
# → Server running on http://localhost:5000
```

### 3. Frontend setup (new terminal)

```bash
cd frontend
cp .env.example .env
# .env already points to http://localhost:5000 for local dev
# (Vite proxy handles /api calls automatically — no edit needed for local dev)
npm install
npm run dev
# → App running on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## Adding / Editing Tanglish Items

Edit [`frontend/src/config/items.js`](./frontend/src/config/items.js):

```js
export const AGRI_ITEMS = [
  { code: "nellu", label: "Nellu (நெல்லு) - Paddy" },
  // Add your items here — no other file needs changing
];
```

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/bills` | List all bills (`?from=YYYY-MM-DD&to=YYYY-MM-DD`) |
| `POST` | `/api/bills` | Create a new bill |
| `GET` | `/api/bills/export` | Download Excel file (`?from=&to=` optional) |
| `GET` | `/api/bills/:id` | Get single bill |
| `PUT` | `/api/bills/:id` | Update a bill |
| `DELETE` | `/api/bills/:id` | Delete a bill |

---

## ☁️ Free-Tier Deployment

### Step 1 — Push to GitHub

```bash
# In project root (agri-billing-app/)
git init
git add .
git commit -m "Initial commit — Agri Billing App"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

---

### Step 2 — Deploy Backend to Render (free)

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Environment Variables** → Add:
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `PORT` = `5000`
5. Click **Deploy**
6. Copy the Render URL, e.g. `https://agri-billing-backend.onrender.com`

> Auto-deploy: enabled by default. Every `git push origin main` redeploys the backend.

---

### Step 3 — Deploy Frontend to Vercel (free)

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables** → Add:
   - `VITE_API_BASE_URL` = the Render URL from Step 2  
     e.g. `https://agri-billing-backend.onrender.com`
5. Click **Deploy**

> Auto-deploy: enabled by default. Every `git push origin main` redeploys the frontend.

---

### Step 4 — Verify

- Visit your Vercel URL → app loads
- Create a bill → it saves to MongoDB
- Click "Download Excel" → `.xlsx` file downloads

---

## Environment Variables Reference

**`backend/.env`**
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/agri-billing
PORT=5000
FRONTEND_URL=https://your-app.vercel.app   # optional, for CORS restriction
```

**`frontend/.env`** (Vercel reads this at build time)
```
VITE_API_BASE_URL=https://agri-billing-backend.onrender.com
```

---

## Color Theme

| Role | Color |
|------|-------|
| Background | `#FBF7F0` Cream |
| Primary / Headings | `#2E5339` Deep Green |
| Buttons / Accent | `#E1A83C` Warm Mustard |
| Secondary | `#7A5230` Soil Brown |
| Danger | `#B94040` |

---

## License
MIT
