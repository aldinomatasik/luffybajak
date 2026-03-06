import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `Kamu adalah Monkey D. Luffy dari One Piece. Sangat energik, santai, obsesi daging, panggil orang 'nakama', ketawa 'Shishishi!'. Balas singkat penuh energi sebagai Luffy! Gunakan bahasa Indonesia yang santai dan gaul.`;

// ⚠️ Ganti dengan API key lo — atau pakai environment variable VITE_ANTHROPIC_KEY
const API_KEY = import.meta.env.VITE_ANTHROPIC_KEY || "AIzaSyCDD5ZmB9IDjgeSF5eOGh8--YdRF3kLVyE";

export default function KaptenLuffy() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Yo! Gw Luffy! Siapa nama lu, nakama? 🏴‍☠️ Kita petualangan bareng!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [ripple, setRipple] = useState(false);
  const bottomRef = useRef(null);
  const mediaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      const reply = data.content?.[0]?.text || "Shishishi! Gw lagi makan daging, coba lagi nakama!";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Shishishi! Ada yang error nih, kayak Zoro nyasar! 🗺️" }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = async () => {
    if (recording) {
      mediaRef.current?.stop();
      setRecording(false);
      setRipple(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      const chunks = [];
      mr.ondataavailable = e => chunks.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        setMessages(prev => [...prev, { role: "user", content: "🎤 [Voice message]" }]);
        sendMessage("Gw baru kirim voice message, balas semangat nakama!");
      };
      mr.start();
      setRecording(true);
      setRipple(true);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Mic-nya ga bisa nih nakama 😅 Ketik aja!" }]);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div style={{
      width: "100%", height: "100vh",
      background: "linear-gradient(135deg, #0a0a1a 0%, #150a25 40%, #0a1520 100%)",
      display: "flex", flexDirection: "column",
      fontFamily: "'Segoe UI', sans-serif",
      overflow: "hidden", position: "relative"
    }}>
      {/* Animated BG orbs */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: `${80 + i * 40}px`, height: `${80 + i * 40}px`,
            borderRadius: "50%",
            background: i % 2 === 0
              ? "radial-gradient(circle, rgba(239,68,68,0.07), transparent)"
              : "radial-gradient(circle, rgba(251,191,36,0.05), transparent)",
            left: `${10 + i * 15}%`, top: `${5 + i * 12}%`,
            animation: `floatOrb ${4 + i}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.5}s`
          }} />
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Nunito:wght@600;700&display=swap');
        @keyframes floatOrb { to { transform: translateY(-25px) rotate(6deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes rippleAnim { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.5);opacity:0} }
        @keyframes typing { 0%,80%,100%{transform:scale(.6);opacity:.4} 40%{transform:scale(1);opacity:1} }
        @keyframes glow {
          0%,100%{text-shadow:3px 3px 0 #ef4444,0 0 20px rgba(251,191,36,.3)}
          50%{text-shadow:3px 3px 0 #ef4444,0 0 40px rgba(251,191,36,.6)}
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(180deg,rgba(239,68,68,.4),rgba(251,191,36,.4)); border-radius:4px; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "16px 24px",
        background: "linear-gradient(90deg,rgba(120,0,0,.5),rgba(0,0,0,.4),rgba(120,0,0,.3))",
        borderBottom: "2px solid rgba(239,68,68,.3)",
        backdropFilter: "blur(20px)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "16px",
        flexShrink: 0, position: "relative", zIndex: 10
      }}>
        <span style={{ fontSize: "40px", animation: "pulse 2s ease-in-out infinite" }}>🏴‍☠️</span>
        <div style={{ textAlign: "center" }}>
          <h1 style={{
            fontFamily: "'Luckiest Guy', cursive",
            fontSize: "clamp(26px,5vw,46px)", color: "#fbbf24",
            animation: "glow 3s ease-in-out infinite",
            margin: 0, letterSpacing: "2px"
          }}>KAPTEN LUFFY</h1>
          <p style={{
            color: "#fca5a5", fontSize: "11px", margin: "3px 0 0",
            letterSpacing: "3px", fontFamily: "'Nunito', sans-serif"
          }}>⚡ GEAR 5 MODE • NAKAMA CHAT ⚡</p>
        </div>
        <span style={{ fontSize: "40px", animation: "pulse 2s ease-in-out infinite 1s" }}>🍖</span>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "20px 16px",
        display: "flex", flexDirection: "column", gap: "12px",
        position: "relative", zIndex: 5
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            animation: "fadeUp .3s ease-out"
          }}>
            {msg.role === "assistant" && (
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg,#ef4444,#f97316)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", marginRight: "8px",
                boxShadow: "0 0 12px rgba(239,68,68,.4)"
              }}>🏴‍☠️</div>
            )}
            <div style={{
              maxWidth: "72%", padding: "12px 16px",
              borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
              background: msg.role === "user"
                ? "linear-gradient(135deg,rgba(99,102,241,.85),rgba(139,92,246,.85))"
                : "linear-gradient(135deg,rgba(239,68,68,.75),rgba(249,115,22,.75))",
              color: "white", fontSize: "14px", lineHeight: "1.6",
              boxShadow: msg.role === "user"
                ? "0 4px 20px rgba(99,102,241,.3)"
                : "0 4px 20px rgba(239,68,68,.3)",
              border: `1px solid ${msg.role === "user" ? "rgba(139,92,246,.3)" : "rgba(249,115,22,.3)"}`,
              fontFamily: "'Nunito', sans-serif", fontWeight: 600
            }}>{msg.content}</div>
            {msg.role === "user" && (
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", marginLeft: "8px",
                boxShadow: "0 0 12px rgba(99,102,241,.4)"
              }}>🧑‍✈️</div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", animation: "fadeUp .3s ease-out" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg,#ef4444,#f97316)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", marginRight: "8px"
            }}>🏴‍☠️</div>
            <div style={{
              padding: "14px 20px",
              borderRadius: "20px 20px 20px 4px",
              background: "linear-gradient(135deg,rgba(239,68,68,.75),rgba(249,115,22,.75))",
              display: "flex", gap: "6px", alignItems: "center"
            }}>
              {[0, 0.2, 0.4].map((d, i) => (
                <div key={i} style={{
                  width: "8px", height: "8px", borderRadius: "50%", background: "white",
                  animation: `typing 1.2s ease-in-out ${d}s infinite`
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div style={{
        padding: "12px 16px 16px",
        background: "rgba(10,10,26,.85)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(239,68,68,.2)",
        flexShrink: 0, position: "relative", zIndex: 10
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          background: "rgba(30,20,50,.8)",
          border: "2px solid rgba(239,68,68,.3)",
          borderRadius: "50px",
          padding: "6px 6px 6px 18px",
          boxShadow: "0 4px 30px rgba(239,68,68,.15)"
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Kirim pesan ke Kapten..."
            disabled={loading}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "white", fontSize: "14px",
              fontFamily: "'Nunito', sans-serif", fontWeight: 600
            }}
          />

          {/* Mic Button */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            {ripple && (
              <div style={{
                position: "absolute", inset: "-4px", borderRadius: "50%",
                background: "rgba(239,68,68,.4)",
                animation: "rippleAnim 1s ease-out infinite"
              }} />
            )}
            <button onClick={toggleRecording} title={recording ? "Stop" : "Voice"} style={{
              width: "42px", height: "42px", borderRadius: "50%", border: "none",
              background: recording
                ? "linear-gradient(135deg,#dc2626,#b91c1c)"
                : "linear-gradient(135deg,rgba(239,68,68,.3),rgba(249,115,22,.3))",
              cursor: "pointer", fontSize: "18px",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .2s",
              boxShadow: recording ? "0 0 20px rgba(239,68,68,.6)" : "none",
              position: "relative", zIndex: 1
            }}>
              {recording ? "⏹️" : "🎤"}
            </button>
          </div>

          {/* Send Button */}
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{
              width: "42px", height: "42px", borderRadius: "50%", border: "none",
              background: input.trim() && !loading
                ? "linear-gradient(135deg,#ef4444,#f97316)"
                : "rgba(60,40,80,.5)",
              cursor: input.trim() && !loading ? "pointer" : "default",
              fontSize: "18px", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .2s",
              boxShadow: input.trim() && !loading ? "0 0 20px rgba(239,68,68,.4)" : "none"
            }}
          >
            {loading ? "⏳" : "➤"}
          </button>
        </div>
        <p style={{
          textAlign: "center", color: "rgba(252,165,165,.4)",
          fontSize: "10px", margin: "8px 0 0",
          fontFamily: "'Nunito', sans-serif", letterSpacing: "1px"
        }}>🏴‍☠️ STRAW HAT PIRATES • GEAR 5 NAKAMA AI</p>
      </div>
    </div>
  );
}
