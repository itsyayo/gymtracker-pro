"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function AICoachChat() {
  const { data: session } = useSession();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session?.user?.id) {
      const savedChat = localStorage.getItem(`gymtracker_chat_${session.user.id}`);
      
      if (savedChat) {
        setMessages(JSON.parse(savedChat));
      } else {
        setMessages([
          { role: "ai", content: `¡Hola, ${session?.user?.name?.split(' ')[0] || 'Atleta'}! Soy tu Coach Virtual. Ya he revisado tu expediente. ¿En qué te puedo ayudar hoy?` }
        ]);
      }
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id && messages.length > 0) {
      localStorage.setItem(`gymtracker_chat_${session.user.id}`, JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, session?.user?.id]);

  const handleClearChat = () => {
    if(confirm("¿Estás seguro de borrar el historial con tu Coach?")) {
      const initialMessage: Message[] = [{ role: "ai", content: `¡Historial borrado! ¿Empezamos de nuevo, ${session?.user?.name?.split(' ')[0] || 'Atleta'}?` }];
      setMessages(initialMessage);
      if (session?.user?.id) {
        localStorage.setItem(`gymtracker_chat_${session.user.id}`, JSON.stringify(initialMessage));
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: newMessages.length > 1 ? newMessages.slice(1, -1) : []
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "ai", content: data.response }]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", content: "Lo siento, tuve un problema procesando eso. Intenta de nuevo." }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", content: "Error de conexión." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-1rem)] bg-zinc-950 text-white p-4 max-w-4xl mx-auto w-full">
      
      {/* Header del Chat */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-t-2xl p-4 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
            <svg className="w-6 h-6 text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h1 className="font-bold text-lg text-emerald-400">Coach Virtual IA</h1>
            <p className="text-xs text-zinc-400 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1 animate-pulse"></span> En línea
            </p>
          </div>
        </div>
        
        {/* Botón para limpiar el chat */}
        <button onClick={handleClearChat} className="text-zinc-500 hover:text-red-400 transition-colors p-2" title="Borrar historial">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>

      {/* Área de Mensajes */}
      <div className="flex-1 overflow-y-auto bg-zinc-900/50 border-x border-zinc-800 p-4 space-y-6 custom-scrollbar">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-md ${
              msg.role === "user" 
                ? "bg-emerald-600 text-white rounded-br-none" 
                : "bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-bl-none"
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {msg.content}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-bl-none px-5 py-4 shadow-md flex space-x-2 items-center">
              <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Mensaje */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-b-2xl p-3 shadow-xl">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregúntame sobre tu entrenamiento..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-zinc-950 px-5 rounded-xl transition-colors flex items-center justify-center shadow-lg"
          >
            <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
      </div>

    </div>
  );
}