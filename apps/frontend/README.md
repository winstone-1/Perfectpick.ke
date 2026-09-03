# Perfect Pick 

**Nairobi's Premier Destination for Luxury Bags, Shoes, and Jewelry.**

Perfect Pick is a high-end e-commerce platform designed for the modern fashion enthusiast in Kenya. Featuring a premium aesthetic, seamless M-Pesa integration, and a mobile-first design, it offers a sophisticated shopping experience from discovery to checkout.

---

##  Key Features

### 💎 Premium User Experience
- **Video-First Hero**: Dynamic, high-impact video backgrounds showcasing featured collections.
- **Micro-Animations**: Smooth transitions powered by Framer Motion for a "luxury" feel.
- **Glassmorphism Design**: Modern, sleek UI with frosted glass effects and refined typography.

###  Smart Shopping
- **Dynamic Categories**: Real-time filtering of bags, shoes, jewelry, and more.
- **Collections**: Dedicated sections for *New Arrivals* and *Trending Now*.
- **Wishlist & Cart**: Persistent state management for a seamless cross-page experience.

###  Localized Payments
- **M-Pesa Integration**: Fully integrated secure checkout using M-Pesa Till numbers.
- **Trust Pillars**: Clear visibility of Shipping, Refund, and Authenticity policies.

###  Admin Powerhouse
- **Product Management**: Full CRUD capabilities for products, including image/video uploads via Cloudinary.
- **Order Tracking**: Real-time order status management and customer insights.

---

##  Screenshots



| Home Page | Product Detail | Mobile Menu |
| :---: | :---: | :---: |
| ![Home Page Placeholder](https://via.placeholder.com/400x250?text=Home+Page) | ![Product Detail Placeholder](https://via.placeholder.com/400x250?text=Product+Detail) | ![Mobile Menu Placeholder](https://via.placeholder.com/400x250?text=Mobile+Menu) |

---

## Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Vanilla CSS (Custom System) + TailwindCSS
- **Animations**: Framer Motion
- **Icons**: Lucide React + React Icons
- **UI Components**: Radix UI
- **State Management**: React Context API
- **Notifications**: Sonner

### Backend
- **Environment**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Authentication**: Firebase Admin SDK + JWT
- **File Storage**: Cloudinary (Image & Video)
- **Middleware**: Multer, Helmet, CORS, Morgan

---

##  Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Firebase Project (for Auth)
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/perfect-pick.git
   cd perfect-pick
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` folder:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   FIREBASE_PROJECT_ID=your_id
   CLOUDINARY_CLOUD_NAME=your_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   ```

3. **Setup Frontend**
   ```bash
   cd ..
   npm install
   ```
   Create a `.env` file in the root:
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_FIREBASE_API_KEY=your_key
   ```

### Running the App

- **Start Server**: `cd server && npm run dev`
- **Start Client**: `npm run dev` (from root)

---

## Project Structure

```text
├── server/             # Express API
│   ├── src/
│   │   ├── controllers/# Business logic
│   │   ├── models/     # Mongoose schemas
│   │   ├── routes/     # API endpoints
│   │   └── middleware/ # Security & Uploads
├── src/                # React Frontend
│   ├── components/     # UI & Layout components
│   ├── context/        # Global state (Cart, Auth, Wishlist)
│   ├── pages/          # View components
│   ├── api/            # Axios instance
│   └── assets/         # Static assets
└── public/             # Public static files
```

---

##  License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with  Antigravity**
