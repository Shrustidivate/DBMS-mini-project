Full Stack E‑Commerce Platform (MERN + MySQL + AI Chatbot)
This project is a complete full‑stack e‑commerce application designed to provide a professional and scalable solution for online retail workflows. It enables users to register or log in securely, browse and view products, manage their shopping cart, place orders, and interact with an integrated AI Store Assistant. The system architecture follows modern web development practices to ensure performance, maintainability, and scalability.

Features
The platform includes secure user authentication using JSON Web Tokens, ensuring that only verified users can access sensitive features such as cart and order management. Products are dynamically loaded from the backend database and displayed through a modern frontend interface. Users can add items to their personal shopping cart, which is stored persistently in the database. Authenticated users can proceed to place and review their orders through a protected section of the platform.

An AI‑powered chatbot is integrated into the user interface to handle product‑related inquiries and assist with navigating the store. The application uses Redux for state management to maintain a consistent global store across all components.

Technology Stack
The frontend is built using React, Redux, and Tailwind CSS to deliver an efficient and responsive user experience. The backend is powered by Node.js and Express.js, which handle API routing, authentication, and database interactions. MySQL serves as the primary database management system. The AI chatbot logic is implemented on the client side and designed to evolve into a backend‑driven model in future enhancements.

Sample Chatbot Products
The chatbot currently provides information about a curated set of sample items, including wireless headphones, smart watches, laptop backpacks, and USB‑C cables. These items serve as initial examples of how the chatbot can assist users with product queries.

Running the Project Locally
To run the frontend, navigate to the frontend directory, install the required dependencies using npm, and start the development server with the appropriate command.

For the backend, move to the backend directory, install the dependencies, and start the server. The backend connects automatically to the configured MySQL database as defined in the project’s environment settings.

Future Enhancements
The roadmap includes several planned improvements. A secure payment gateway is scheduled for integration to enable real‑time transactions. Administrative product management features will be added to provide better inventory control. The AI chatbot will be upgraded to a backend‑powered model for enhanced context retention and natural language understanding. Additionally, a feature allowing users to download their order invoices in PDF format is planned.
