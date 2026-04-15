import { useState, useEffect, useRef } from "react";

const CHAT_CSS = `
.padi-chat-list { display: flex; flex-direction: column; }
.padi-chat-item { display: flex; gap: 12px; padding: 14px 20px; cursor: pointer; transition: background .15s; align-items: flex-start; position: relative; }
.padi-chat-item:active { background: var(–surface); }
.padi-chat-item.bot-item { background: rgba(255,90,31,.04); border-bottom: 1px solid var(–border); }
.padi-bot-badge { display: inline-flex; align-items: center; gap: 4px; background: linear-gradient(135deg,var(–brand),var(–brand2)); border-radius: 100px; padding: 2px 8px; font-size: 10px; font-weight: 700; color: #fff; margin-left: 6px; }
.padi-avatar-bot { width: 48px; height: 48px; border-radius: 16px; background: linear-gradient(135deg,var(–brand),var(–brand2)); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; box-shadow: 0 4px 16px rgba(255,90,31,.3); }
.padi-online-dot { position: absolute; bottom: 0; right: 0; width: 11px; height: 11px; border-radius: 50%; background: var(–green); border: 2px solid var(–bg); }

/* Chat Room */
.padi-room { display: flex; flex-direction: column; height: 100dvh; background: var(–bg); }
.padi-room-header { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: rgba(14,14,16,.97); backdrop-filter: blur(16px); border-bottom: 1px solid var(–border); flex-shrink: 0; }
.padi-room-messages { flex: 1; overflow-y: auto; padding: 16px 16px 8px; display: flex; flex-direction: column; gap: 8px; background: var(–bg); }
.padi-room-messages::-webkit-scrollbar { display: none; }

/* Bubbles */
.padi-bubble-wrap { display: flex; flex-direction: column; }
.padi-bubble-wrap.out { align-items: flex-end; }
.padi-bubble-wrap.in { align-items: flex-start; }
.padi-bubble { max-width: 80%; padding: 11px 14px; font-size: 14px; line-height: 1.5; word-break: break-word; }
.padi-bubble.out { background: linear-gradient(135deg,var(–brand),var(–brand2)); color: #fff; border-radius: 18px 18px 4px 18px; }
.padi-bubble.in { background: var(–surface2); color: var(–text); border-radius: 18px 18px 18px 4px; border: 1px solid var(–border); }
.padi-bubble.bot { background: var(–surface); border: 1px solid rgba(255,90,31,.2); border-radius: 4px 18px 18px 18px; }
.padi-bubble-time { font-size: 10px; color: var(–muted); margin-top: 3px; padding: 0 4px; }
.padi-bubble-status { font-size: 10px; color: rgba(255,255,255,.6); margin-top: 3px; padding: 0 4px; text-align: right; }

/* Typing indicator */
.padi-typing { display: flex; align-items: center; gap: 4px; padding: 10px 14px; background: var(–surface2); border-radius: 18px 18px 18px 4px; width: fit-content; border: 1px solid var(–border); }
.padi-typing span { width: 7px; height: 7px; border-radius: 50%; background: var(–muted); animation: typingDot 1.2s ease-in-out infinite; }
.padi-typing span:nth-child(2) { animation-delay: .2s; }
.padi-typing span:nth-child(3) { animation-delay: .4s; }
@keyframes typingDot { 0%,60%,100% { transform: translateY(0); opacity:.4 } 30% { transform: translateY(-5px); opacity:1 } }

/* Input bar */
.padi-input-bar { display: flex; gap: 10px; padding: 10px 14px 12px; background: rgba(14,14,16,.97); backdrop-filter: blur(16px); border-top: 1px solid var(–border); flex-shrink: 0; align-items: flex-end; }
.padi-input { flex: 1; background: var(–surface2); border: 1.5px solid var(–border); border-radius: 22px; padding: 11px 16px; color: var(–text); font-family: var(–font-body); font-size: 14px; outline: none; transition: border-color .15s; resize: none; max-height: 100px; line-height: 1.4; }
.padi-input:focus { border-color: var(–brand); }
.padi-send { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg,var(–brand),var(–brand2)); border: none; color: #fff; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(255,90,31,.4); flex-shrink: 0; transition: transform .15s, box-shadow .15s; }
.padi-send:active { transform: scale(.9); }
.padi-send:disabled { opacity: .5; }

/* Quick replies */
.padi-qr { display: flex; gap: 8px; padding: 6px 14px 2px; overflow-x: auto; flex-shrink: 0; }
.padi-qr::-webkit-scrollbar { display: none; }
.padi-qr-chip { background: var(–surface2); border: 1px solid rgba(255,90,31,.3); border-radius: 100px; padding: 7px 14px; font-size: 12px; font-weight: 500; cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: all .15s; color: var(–brand); }
.padi-qr-chip:active { background: var(–pill); }

/* Order card in chat */
.padi-order-card { background: var(–surface); border: 1px solid rgba(255,90,31,.25); border-radius: 14px; padding: 14px; margin-top: 8px; }
.padi-order-card-title { font-size: 11px; font-weight: 700; letter-spacing: 1px; color: var(–brand); margin-bottom: 8px; text-transform: uppercase; }
.padi-order-card-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; }
.padi-order-card-status { display: inline-flex; align-items: center; gap: 6px; background: rgba(0,192,127,.12); border-radius: 100px; padding: 4px 10px; font-size: 12px; font-weight: 600; color: var(–green); margin-top: 8px; }

/* Track mini */
.padi-track-mini { background: var(–surface); border: 1px solid var(–border); border-radius: 14px; padding: 14px; margin-top: 8px; }
.padi-track-step { display: flex; align-items: center; gap: 10px; padding: 5px 0; font-size: 13px; }
.padi-track-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

/* Floating bot button */
.padi-bot-float { position: fixed; bottom: calc(var(–nav-h) + 16px); right: 16px; width: 52px; height: 52px; border-radius: 16px; background: linear-gradient(135deg,var(–brand),var(–brand2)); box-shadow: 0 6px 24px rgba(255,90,31,.5); display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; z-index: 98; border: none; transition: transform .2s, box-shadow .2s; animation: botPop .4s cubic-bezier(.34,1.56,.64,1) both; }
.padi-bot-float:active { transform: scale(.92); }
@keyframes botPop { from { transform: scale(0); opacity: 0 } to { transform: scale(1); opacity: 1 } }
.padi-bot-pulse { position: absolute; top: -3px; right: -3px; width: 14px; height: 14px; border-radius: 50%; background: var(–green); border: 2px solid var(–bg); }

/* Date separator */
.padi-date-sep { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
.padi-date-line { flex: 1; height: 1px; background: var(–border); }
.padi-date-label { font-size: 11px; color: var(–muted); font-weight: 500; white-space: nowrap; }

/* Bot intro card */
.padi-bot-intro { background: linear-gradient(135deg, rgba(255,90,31,.08), rgba(255,140,66,.05)); border: 1px solid rgba(255,90,31,.2); border-radius: 16px; padding: 16px; margin: 8px 0; }
.padi-bot-intro-title { font-family: var(–font-head); font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.padi-bot-intro-sub { font-size: 13px; color: var(–muted); line-height: 1.5; }
.padi-bot-caps { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.padi-bot-cap { background: var(–surface2); border: 1px solid var(–border); border-radius: 8px; padding: 5px 10px; font-size: 12px; font-weight: 500; }
`;

// ── Simulated vendor auto-replies ──────────────────────────────────────────
const VENDOR_REPLIES = {
1: ["Thanks for reaching out! How can I help?", "Your order is being prepared fresh 🍲", "We typically deliver in 15–20 mins on campus.", "Let me check on that for you!", "Yes, we have that available today!"],
2: ["Hey! Welcome to Campus Grill 🔥", "Our suya is freshly made every hour!", "Delivery to hostels takes about 25 mins.", "Sure, we can do extra spicy for you!", "Your order is on the way 🛵"],
3: ["Hi! Fresh Bites here 🥗", "All our smoothies are made to order.", "We deliver within 10–15 mins.", "Yes, we have vegan options!", "Your bowl will be ready shortly!"],
4: ["Buka Express! How can I serve you? 🍽️", "Today’s special is Eba with Ofe Onugbu!", "Delivery in 20 mins.", "We accept wallet and cash.", "Order confirmed! We’re on it."],
};

const getVendorReply = (vendorId) => {
const replies = VENDOR_REPLIES[vendorId] || ["Thanks for your message!"];
return replies[Math.floor(Math.random() * replies.length)];
};

// ── Padi Bot AI ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Padi Bot, the friendly AI assistant for PADI — a campus super app in Nigeria that offers food delivery, bike rides, groceries, laundry, and pharmacy services.

Your personality: warm, helpful, uses light Nigerian slang naturally (e.g. "No wahala!", "Omo!", "Sharp sharp"), keeps responses SHORT (2-4 sentences max), uses emojis occasionally.

You can help with:

- Answering FAQs about delivery times (15-30 mins on campus), fees (₦300 flat), payment (PADI Wallet, bank transfer, cash), vendors, and services
- Helping customers place orders conversationally (ask what they want, suggest from menu, confirm)
- Tracking orders: current order is #PADI-2847, Jollof Rice + Chicken from Mama Put Central, rider Emeka is 5 mins away, status: "On the Way"
- Explaining PADI features: wallet top-up, referral bonuses (₦500 per referral), promo code PADI50 (50% off first delivery)

Menu highlights:

- Jollof Rice + Chicken (₦1,500) - Mama Put Central
- Suya Wrap (₦1,200) - Campus Grill
- Eba and Egusi (₦900) - Mama Put Central
- Smoky Burger (₦1,800) - Campus Grill
- Moi Moi and Akara (₦700) - Buka Express
- Fruit Smoothie Bowl (₦1,100) - Fresh Bites

Always be concise. Never write long paragraphs. End order help with a summary and "Want me to add this to your cart?"`;

async function askPadiBot(messages) {
const response = await fetch("https://api.anthropic.com/v1/messages", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
model: "claude-sonnet-4-20250514",
max_tokens: 1000,
system: SYSTEM_PROMPT,
messages,
}),
});
const data = await response.json();
return data.content?.[0]?.text || "No wahala, let me get back to you!";
}

// ── Components ───────────────────────────────────────────────────────────────

function TypingIndicator() {
return (
<div className="padi-bubble-wrap in">
<div className="padi-typing">
<span /><span /><span />
</div>
</div>
);
}

function DateSep({ label }) {
return (
<div className="padi-date-sep">
<div className="padi-date-line" />
<div className="padi-date-label">{label}</div>
<div className="padi-date-line" />
</div>
);
}

function OrderCard() {
return (
<div className="padi-order-card">
<div className="padi-order-card-title">📦 Active Order</div>
<div className="padi-order-card-row"><span style={{color:"var(–muted)"}}>Order</span><span style={{fontWeight:600}}>#PADI-2847</span></div>
<div className="padi-order-card-row"><span style={{color:"var(–muted)"}}>Item</span><span>Jollof Rice + Chicken</span></div>
<div className="padi-order-card-row"><span style={{color:"var(–muted)"}}>Total</span><span style={{color:"var(–brand)",fontWeight:700}}>₦1,500</span></div>
<div className="padi-order-card-status">
<span style={{width:7,height:7,borderRadius:"50%",background:"var(–green)",display:"inline-block"}} />
Rider is 5 mins away
</div>
</div>
);
}

function TrackMini() {
const steps = [
{ label: "Order Confirmed", done: true },
{ label: "Preparing", done: true },
{ label: "Rider Assigned", done: true },
{ label: "On the Way", active: true },
{ label: "Delivered", done: false },
];
return (
<div className="padi-track-mini">
<div style={{fontSize:12,fontWeight:700,color:"var(–muted)",letterSpacing:1,marginBottom:8,textTransform:"uppercase"}}>Order Progress</div>
{steps.map((s) => (
<div className="padi-track-step" key={s.label}>
<div className="padi-track-dot" style={{background: s.done ? "var(–green)" : s.active ? "var(–brand)" : "var(–border)", boxShadow: s.active ? "0 0 0 3px rgba(255,90,31,.2)" : "none"}} />
<span style={{color: s.done ? "var(–text)" : s.active ? "var(–brand)" : "var(–muted)", fontWeight: s.active ? 600 : 400}}>
{s.label}
</span>
{s.done && <span style={{color:"var(–green)",marginLeft:"auto",fontSize:12}}>✓</span>}
</div>
))}
</div>
);
}

// ── Bot Chat Room ─────────────────────────────────────────────────────────────
function BotChatRoom({ onBack }) {
const [msgs, setMsgs] = useState([
{
id: 0,
role: "assistant",
text: null,
isIntro: true,
time: "Now",
}
]);
const [input, setInput] = useState("");
const [typing, setTyping] = useState(false);
const [aiHistory, setAiHistory] = useState([]);
const endRef = useRef(null);
const inputRef = useRef(null);

useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

const QUICK = ["Track my order 📍", "What’s on the menu?", "How long is delivery?", "Top up wallet 💳", "Place an order 🛒", "Promo codes?"];

const send = async (text) => {
if (!text.trim() || typing) return;
const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const userMsg = { id: Date.now(), role: "user", text, time: now };
setMsgs(p => [...p, userMsg]);
setInput("");
setTyping(true);

```
const newHistory = [...aiHistory, { role: "user", content: text }];

try {
  const reply = await askPadiBot(newHistory);
  const botMsg = {
    id: Date.now() + 1,
    role: "assistant",
    text: reply,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    showOrder: text.toLowerCase().includes("track") || text.toLowerCase().includes("order"),
    showTrack: text.toLowerCase().includes("track"),
  };
  setMsgs(p => [...p, botMsg]);
  setAiHistory([...newHistory, { role: "assistant", content: reply }]);
} catch {
  setMsgs(p => [...p, { id: Date.now() + 1, role: "assistant", text: "Omo, network issue! Try again in a sec 😅", time: now }]);
}
setTyping(false);
```

};

return (
<div className="padi-room">
<div className="padi-room-header">
<button className="btn btn-ghost" onClick={onBack} style={{padding:"8px 14px",fontSize:13,flexShrink:0}}>‹ Back</button>
<div className="padi-avatar-bot" style={{width:40,height:40,fontSize:18,borderRadius:13}}>🤖</div>
<div style={{flex:1}}>
<div style={{fontWeight:700,fontSize:15,display:"flex",alignItems:"center",gap:6}}>
Padi Bot
<span className="padi-bot-badge">AI</span>
</div>
<div style={{fontSize:11,color:"var(–green)"}}>Always online · Powered by Claude</div>
</div>
</div>

```
  <div className="padi-room-messages">
    <DateSep label="Today" />
    {msgs.map((m) => (
      <div key={m.id} className={`padi-bubble-wrap ${m.role === "user" ? "out" : "in"}`}>
        {m.isIntro ? (
          <div className="padi-bot-intro">
            <div className="padi-bot-intro-title">👋 Hey! I'm Padi Bot</div>
            <div className="padi-bot-intro-sub">Your smart campus assistant. I can help you order food, track deliveries, answer questions, and more — all in chat!</div>
            <div className="padi-bot-caps">
              {["🍔 Order Food","📍 Track Order","💳 Wallet Help","❓ FAQs","🛵 Delivery Info"].map(c => (
                <div className="padi-bot-cap" key={c}>{c}</div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className={`padi-bubble ${m.role === "user" ? "out" : "bot"}`}>
              {m.text}
              {m.showOrder && <OrderCard />}
              {m.showTrack && <TrackMini />}
            </div>
            <div className={m.role === "user" ? "padi-bubble-status" : "padi-bubble-time"}>
              {m.time}{m.role === "user" ? " ✓✓" : ""}
            </div>
          </>
        )}
      </div>
    ))}
    {typing && <TypingIndicator />}
    <div ref={endRef} />
  </div>

  <div className="padi-qr">
    {QUICK.map(q => (
      <div className="padi-qr-chip" key={q} onClick={() => send(q)}>{q}</div>
    ))}
  </div>

  <div className="padi-input-bar">
    <textarea
      ref={inputRef}
      className="padi-input"
      placeholder="Ask Padi Bot anything..."
      value={input}
      rows={1}
      onChange={e => setInput(e.target.value)}
      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
    />
    <button className="padi-send" onClick={() => send(input)} disabled={!input.trim() || typing}>➤</button>
  </div>
</div>

);
}

// ── Vendor Chat Room ──────────────────────────────────────────────────────────
function VendorChatRoom({ chat, onBack }) {
const [msgs, setMsgs] = useState(() => {
const base = [
{ id: 1, role: "vendor", text: `Hello! Welcome to ${chat.name} 👋 How can I help you today?`, time: "2:10 PM" },
];
if (chat.id === 1) {
base.push({ id: 2, role: "user", text: "Hi! Can I get the Jollof Rice + Chicken please?", time: "2:11 PM" });
base.push({ id: 3, role: "vendor", text: "Sure! Large or regular portion? 🍲", time: "2:11 PM" });
base.push({ id: 4, role: "user", text: "Regular please. How long will it take?", time: "2:12 PM" });
base.push({ id: 5, role: "vendor", text: "About 15 minutes! Your order is confirmed.\n\nTotal: ₦1,500 ✅", time: "2:13 PM", isOrder: true });
}
return base;
});
const [input, setInput] = useState("");
const [typing, setTyping] = useState(false);
const endRef = useRef(null);

useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

const send = (text) => {
if (!text.trim()) return;
const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
setMsgs(p => [...p, { id: Date.now(), role: "user", text, time: now }]);
setInput("");
setTyping(true);
setTimeout(() => {
setMsgs(p => [...p, {
id: Date.now() + 1,
role: "vendor",
text: getVendorReply(chat.id),
time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
}]);
setTyping(false);
}, 1000 + Math.random() * 800);
};

const QUICK_VENDOR = ["Is it available?", "How long?", "Today’s special?", "Add extra spice 🌶️", "Cancel order"];

return (
<div className="padi-room">
<div className="padi-room-header">
<button className="btn btn-ghost" onClick={onBack} style={{padding:"8px 14px",fontSize:13,flexShrink:0}}>‹ Back</button>
<div style={{position:"relative"}}>
<div className="avatar" style={{width:40,height:40,fontSize:13}}>{chat.initials}</div>
{chat.online && <div className="padi-online-dot" style={{position:"absolute",bottom:0,right:0}}/>}
</div>
<div style={{flex:1}}>
<div style={{fontWeight:700,fontSize:15}}>{chat.name}</div>
<div style={{fontSize:11,color: chat.online ? "var(–green)" : "var(–muted)"}}>
{chat.online ? "● Online · Usually replies fast" : "○ Away"}
</div>
</div>
<div style={{fontSize:20,cursor:"pointer"}}>📞</div>
</div>

```
  <div className="padi-room-messages">
    <DateSep label="Today" />
    {msgs.map((m) => (
      <div key={m.id} className={`padi-bubble-wrap ${m.role === "user" ? "out" : "in"}`}>
        <div className={`padi-bubble ${m.role === "user" ? "out" : "in"}`} style={{whiteSpace:"pre-wrap"}}>
          {m.text}
          {m.isOrder && (
            <div className="padi-order-card" style={{marginTop:10}}>
              <div className="padi-order-card-title">✅ Order Confirmed</div>
              <div className="padi-order-card-row"><span style={{color:"var(--muted)"}}>Item</span><span>Jollof Rice + Chicken</span></div>
              <div className="padi-order-card-row"><span style={{color:"var(--muted)"}}>Total</span><span style={{color:"var(--brand)",fontWeight:700}}>₦1,500</span></div>
              <div className="padi-order-card-row"><span style={{color:"var(--muted)"}}>Est. time</span><span>~15 minutes</span></div>
            </div>
          )}
        </div>
        <div className={m.role === "user" ? "padi-bubble-status" : "padi-bubble-time"}>
          {m.time}{m.role === "user" ? " ✓✓" : ""}
        </div>
      </div>
    ))}
    {typing && <TypingIndicator />}
    <div ref={endRef} />
  </div>

  <div className="padi-qr">
    {QUICK_VENDOR.map(q => (
      <div className="padi-qr-chip" key={q} onClick={() => send(q)}>{q}</div>
    ))}
  </div>

  <div className="padi-input-bar">
    <textarea
      className="padi-input"
      placeholder={`Message ${chat.name}...`}
      value={input}
      rows={1}
      onChange={e => setInput(e.target.value)}
      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
    />
    <button className="padi-send" onClick={() => send(input)} disabled={!input.trim()}>➤</button>
  </div>
</div>

);
}

// ── Chat List Screen ──────────────────────────────────────────────────────────
const CHATS = [
{ id:1, name:"Mama Put Central", initials:"MP", preview:"Your order is ready! Rider is on the way.", time:"2m ago", unread:2, online:true },
{ id:2, name:"Campus Grill", initials:"CG", preview:"Thank you for your order 🙏", time:"1h ago", unread:0, online:true },
{ id:3, name:"Padi Rider - Emeka", initials:"EM", preview:"I am at the gate. Please come out.", time:"3h ago", unread:0, online:false },
{ id:4, name:"Fresh Bites", initials:"FB", preview:"We added extra toppings for you!", time:"Yesterday", unread:1, online:true },
];

export function ChatScreen({ openBot }) {
const [activeVendor, setActiveVendor] = useState(null);
const [activeBot, setActiveBot] = useState(false);

if (activeBot) return <BotChatRoom onBack={() => setActiveBot(false)} />;
if (activeVendor) return <VendorChatRoom chat={activeVendor} onBack={() => setActiveVendor(null)} />;

return (
<div className="screen" style={{paddingTop:0}}>
<style>{CHAT_CSS}</style>
<div className="listing-header">
<div style={{flex:1}}>
<div className="h3">Messages</div>
<div style={{color:"var(–muted)",fontSize:11,marginTop:2}}>Chat with vendors and riders</div>
</div>
</div>

```
  {/* Padi Bot pinned entry */}
  <div className="padi-chat-item bot-item" onClick={() => setActiveBot(true)}>
    <div style={{position:"relative"}}>
      <div className="padi-avatar-bot">🤖</div>
      <div className="padi-online-dot" />
    </div>
    <div style={{flex:1,minWidth:0}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontWeight:700,fontSize:15,display:"flex",alignItems:"center"}}>
          Padi Bot
          <span className="padi-bot-badge">AI</span>
        </div>
        <div style={{fontSize:11,color:"var(--muted)"}}>Always on</div>
      </div>
      <div style={{fontSize:13,color:"var(--muted)",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
        Ask me anything — orders, tracking, FAQs...
      </div>
    </div>
  </div>

  <div style={{height:1,background:"var(--border)",margin:"0 20px"}}/>

  {/* Vendor chats */}
  <div className="padi-chat-list">
    {CHATS.map((c, i) => (
      <div key={c.id}>
        <div className="padi-chat-item" onClick={() => setActiveVendor(c)}>
          <div style={{position:"relative"}}>
            <div className="avatar" style={{width:48,height:48,fontSize:14}}>{c.initials}</div>
            {c.online && <div className="padi-online-dot" style={{position:"absolute",bottom:0,right:0}}/>}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontWeight:600,fontSize:15}}>{c.name}</div>
              <div style={{fontSize:11,color:"var(--muted)",flexShrink:0,marginLeft:8}}>{c.time}</div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:2}}>
              <div style={{fontSize:13,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{c.preview}</div>
              {c.unread > 0 && (
                <div style={{background:"var(--brand)",color:"#fff",borderRadius:100,padding:"2px 7px",fontSize:11,fontWeight:700,flexShrink:0,marginLeft:8}}>{c.unread}</div>
              )}
            </div>
          </div>
        </div>
        {i < CHATS.length - 1 && <div style={{height:1,background:"var(--border)",marginLeft:80}}/>}
      </div>
    ))}
  </div>
</div>

);
}

// ── Floating Bot Button ───────────────────────────────────────────────────────
export function PadiBotFloat({ onOpen }) {
return (
<button className="padi-bot-float" onClick={onOpen} title="Chat with Padi Bot">
<style>{CHAT_CSS}</style>
🤖
<div className="padi-bot-pulse" />
</button>
);
}

// ── Full screen bot overlay (used from float button) ─────────────────────────
export function PadiBotOverlay({ onClose }) {
return (
<div style={{position:"fixed",inset:0,zIndex:200,background:"var(–bg)"}}>
<style>{CHAT_CSS}</style>
<BotChatRoom onBack={onClose} />
</div>
);
}