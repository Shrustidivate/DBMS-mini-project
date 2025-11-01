Full Stack Ecommerce Store 

This is a full-stack MERN style Ecommerce platform where users can browse products, add items to cart, login, place orders and also chat with an AI Store Assistant chatbot inside the frontend UI.

Features

User Authentication (JWT based)

Product Listing

Add to Cart / Remove from Cart

Orders Page (logged in users only)

Chatbot that answers product related queries

Protected Routes (Cart + Orders)

Redux used for global state management

Tech Stack
Layer	Technology
Frontend	React + Redux + Tailwind
Backend	Node + Express JS
Database	MySQL
Extra	AI Chatbot (Frontend Local Logic)
Folder Structure
/backend
   ├── config/db.js
   ├── middleware/auth.js
   ├── routes/auth.js
   ├── routes/products.js
   ├── routes/cart.js
   ├── routes/orders.js
/frontend
   ├── src/components
   ├── src/pages
   ├── src/redux
   ├── src/api.js

Chatbot Product Data Example
Wireless Headphones  
Smart Watch  
Laptop Backpack  
USB-C Cable

Run Locally
Frontend
cd frontend
npm install
npm run dev

Backend
cd backend
npm install
npm start