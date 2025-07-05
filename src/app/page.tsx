"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState<{ id: number; content: string }[]>(
    []
  );
  const [content, setContent] = useState("");

  const fetchMessages = async () => {
    const res = await fetch("http://localhost:5000/message");
    const data = await res.json();
    setMessages(data);
  };

  const sendMessage = async () => {
    await fetch("http://localhost:5000/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
    setContent("");
    fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center  p-4 bg-white-100 w-full">
      <h1 className="text-3xl font-bold mb-4 bg-dark-100">📡 Flask + Next.js + DB</h1>
    <div style={{ height: '60vh', backgroundColor: '#black' }}>
     Contenido de prueba
    </div>
    <div className="py-20 px-6">
  <h2 className="text-2xl font-bold mb-4">Contenido de prueba</h2>
  <div className="space-y-4">
    <p>Párrafo 1: Este es contenido de prueba para ver el footer.</p>
    <p>Párrafo 2: Haz scroll hacia abajo para ver el footer.</p>
    <p>Párrafo 3: El footer debería aparecer al final de la página.</p>
  </div>
</div>

      <div className="flex mb-4"> 
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border p-2 rounded mr-2"
          placeholder="Type your message"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>

      <div className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Messages:</h2>
        <ul className="bg-white p-4 rounded shadow">
          {messages.map((msg) => (
            <li key={msg.id} className="border-b py-2">
              {msg.content}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
