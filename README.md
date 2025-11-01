Full Stack E-Commerce Store (MERN + MySQL + AI Chatbot)
This project implements a full-stack e-commerce platform using the MERN stack (MongoDB, Express.js, React, Node.js) with MySQL as the primary database and an integrated AI chatbot for product assistance. The system enables users to browse products, authenticate securely, manage their cart, place orders, and interact with an AI Store Assistant within the user interface.

Features
User Authentication: Secure login and registration using JWT tokens.

Product Listing: Dynamic display of products fetched from the backend.

Add to Cart: Persistent cart system with data stored in the database.

Orders Page: Only authenticated users can place and view orders.

Protected Routes: Cart and Orders pages are accessible only to authenticated users.

AI Chatbot: Client-side chatbot for product-related queries.

State Management: Redux is used for global state and session management.

Technology Stack
Layer	Technologies Used
Frontend	React, Redux, Tailwind CSS
Backend	Node.js, Express.js
Database	MySQL
Extra	AI Chatbot (Client-side)
Project Structure
text
project/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   └── orders.js
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── redux/
    │   └── api.js
    └── package.json
Sample Chatbot Products
Wireless Headphones

Smart Watch

Laptop Backpack

USB-C Cable

Local Setup Instructions
Frontend

text
cd frontend
npm install
npm run dev
Backend

text
cd backend
npm install
npm start
Future Enhancements (Roadmap)
Feature	Status
Payment Integration	Coming Soon
Admin Product Management	Planned
AI Model-Powered Chatbot	Planned
Order Invoice Download (PDF)	Planned
