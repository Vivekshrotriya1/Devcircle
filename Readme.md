**DevCircle**

DevCircle is a modern developer networking platform designed to connect, collaborate, and grow. Built with a cutting-edge tech stack—React, Tailwind CSS, Express, and MongoDB—it offers real-time chat, seamless connection requests, and integrated payments to unlock premium features.

---

## 🚀 Features

* **User Authentication & Profiles**

  * Secure registration & login with JWT-based auth middleware
  * Profile management: avatar, bio, skills, and portfolio links

* **Connections & Networking**

  * Send, accept, and manage connection requests
  * Discover other developers by skills, location, or interests

* **Real-Time Chat**

  * 1:1 messaging powered by Socket.IO
  * Message history stored in MongoDB with timestamps and read receipts

* **Activity Feed**

  * Post updates, articles, or project showcases
  * Like and comment to foster engagement

* **Premium Features & Payments**

  * In-app purchase of premium plans
  * Secure payment integration capturing transaction details
  * Unlock advanced filters, priority messaging, and analytics

* **Responsive Design**

  * Mobile-first UI crafted with Tailwind CSS
  * Optimized for desktop and tablet views

* **Scalable Architecture**

  * RESTful API endpoints organized in `src/routes`
  * Mongoose models with schema validation and indexing
  * Environment configuration for easy deployment (Vercel & Render)

---

## 💻 Tech Stack

| Layer          | Technology                  |
| -------------- | --------------------------- |
| Frontend       | React • Vite • Tailwind CSS |
| Backend        | Node.js • Express           |
| Database       | MongoDB • Mongoose          |
| Real-Time      | Socket.IO                   |
| Authentication | JSON Web Tokens             |
| Deployment     | Vercel • Render             |

---

## 📂 Project Structure

```
devCircle-main/
├── backend/                   # Express API
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── middlewares/       # Auth, error handling
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # API endpoints
│   │   ├── utils/             # Helpers & config
│   │   └── server.js          # App entry point
│   └── .env                   # Environment variables

└── web/                       # React frontend
    ├── src/
    │   ├── components/        # UI components
    │   ├── contexts/          # React Contexts
    │   ├── hooks/             # Custom hooks
    │   ├── pages/             # Route views
    │   ├── services/          # API calls & utilities
    │   ├── styles/            # Tailwind config
    │   └── main.jsx           # App entry point
    └── vite.config.js         # Build config
```

---

## 🔧 Installation & Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/yourusername/devCircle-main.git
   ```

2. **Backend**

   ```bash
   cd devCircle-main/backend
   npm install
   cp .env.example .env       # Add your DB URI, JWT secret, and payment keys
   npm run dev                # Starts server on http://localhost:5000
   ```

3. **Frontend**

   ```bash
   cd ../web
   npm install
   npm run dev                # Opens http://localhost:3000
   ```

---

## 📈 Roadmap & Future Enhancements

* **Dark Mode toggle**
* **Group chat & channels**
* **Push notifications**
* **Analytics dashboard for premium users**
* **Microservices for chat and payments**

---

## 🤝 Contributing

Contributions are welcome! Please fork the repo and submit a PR with descriptive commit messages. Ensure all new features include tests and adhere to existing code style (ESLint, Prettier).

---



