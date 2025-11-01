import React, { useState } from "react";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hi! I’m your store assistant. Ask me about our products, prices, or categories!" },
  ]);
  const [userInput, setUserInput] = useState("");

  // YOUR ACTUAL PRODUCTS
  const products = [
    {
      id: 1,
      name: "Wireless Headphones",
      price: 99.99,
      category: "Electronics",
      stock: 50
    },
    {
      id: 2,
      name: "Smart Watch",
      price: 199.99,
      category: "Electronics",
      stock: 30
    },
    {
      id: 3,
      name: "Laptop Backpack",
      price: 49.99,
      category: "Accessories",
      stock: 100
    },
    {
      id: 4,
      name: "USB-C Cable",
      price: 14.99,
      category: "Accessories",
      stock: 200
    },
  ];

  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  const handleSend = () => {
    if (!userInput.trim()) return;
    const input = userInput;
    addMessage("user", input);
    setUserInput("");
    setTimeout(() => {
      const reply = findProduct(input);
      addMessage("bot", reply);
    }, 400);
  };

  const findProduct = (query) => {
    query = query.toLowerCase();
    
    let result = products.find(
      (p) => query.includes(p.name.toLowerCase()) || query.includes(p.category.toLowerCase())
    );

    if (result)
      return `🛍️ ${result.name} — ₹${result.price}. Available stock: ${result.stock}. Category: ${result.category}.`;

    if (query.includes("category")) {
      const cats = [...new Set(products.map((p) => p.category))].join(", ");
      return `📦 We have these categories: ${cats}.`;
    }

    if (query.includes("price range"))
      return "💰 Our prices range from ₹14.99 to ₹199.99.";

    if (query.includes("help") || query.includes("hello") || query.includes("hi"))
      return "👋 You can ask me about product prices, stock, or categories.";

    return "❓ Sorry, I couldn’t find that product. Try asking about 'Headphones', 'Smart Watch', 'Accessories' or 'Electronics'.";
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "340px",
        height: "450px",
        background: "white",
        border: "2px solid #333",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        overflow: "hidden",
        zIndex: 1000,
      }}
    >
      {/* Chat Messages */}
      <div
        style={{
          flex: 1,
          padding: "10px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              background: msg.sender === "user" ? "#007bff" : "#ececec",
              color: msg.sender === "user" ? "white" : "black",
              borderRadius: "10px",
              padding: "8px 12px",
              margin: "6px 0",
              maxWidth: "80%",
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div style={{ display: "flex", borderTop: "1px solid #ccc" }}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "10px",
            border: "none",
            outline: "none",
            fontSize: "14px",
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            padding: "10px 15px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
