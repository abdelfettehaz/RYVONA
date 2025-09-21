<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat Widget</title>
  <style>
    .chat-widget-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 56px; height: 56px; border-radius: 50%; background: #7c3aed;
      color: #fff; font-size: 2rem; border: none; box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      transition: background 0.2s;
    }
    .chat-widget-btn:hover { background: #5b21b6; }
    .chat-widget-window {
      position: fixed; bottom: 90px; right: 24px; z-index: 9999;
      width: 340px; max-width: 95vw; background: #fff; border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18); display: none; flex-direction: column;
      overflow: hidden; border: 1px solid #e5e7eb;
    }
    .chat-widget-window.open { display: flex; }
    .chat-header { background: #7c3aed; color: #fff; padding: 14px; font-weight: 600; }
    .chat-messages { flex: 1; padding: 14px; overflow-y: auto; background: #f9fafb; }
    .chat-input-row { display: flex; border-top: 1px solid #e5e7eb; background: #fff; }
    .chat-input-row input { flex: 1; border: none; padding: 12px; font-size: 1rem; outline: none; }
    .chat-input-row button { background: #7c3aed; color: #fff; border: none; padding: 0 18px; font-size: 1rem; cursor: pointer; }
    .chat-msg { margin-bottom: 10px; padding: 10px 14px; border-radius: 8px; max-width: 80%; word-break: break-word; }
    .chat-msg.user { background: #ede9fe; color: #5b21b6; margin-left: auto; }
    .chat-msg.bot { background: #fff; color: #222; border: 1px solid #e5e7eb; margin-right: auto; }
    .chat-thinking { color: #7c3aed; font-size: 0.95em; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
    .chat-dot { width: 7px; height: 7px; background: #a78bfa; border-radius: 50%; display: inline-block; animation: bounce 1s infinite alternate; }
    .chat-dot:nth-child(2) { animation-delay: 0.2s; }
    .chat-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce { to { transform: translateY(-6px); } }
  </style>
</head>
<body>
  <button class="chat-widget-btn" id="chatWidgetBtn" title="Chat with us">💬</button>
  <div class="chat-widget-window" id="chatWidgetWindow">
    <div class="chat-header">Ask RYVONA AI</div>
    <div class="chat-messages" id="chatMessages"></div>
    <form class="chat-input-row" id="chatForm" autocomplete="off">
      <input type="text" id="chatInput" placeholder="Type your question..." required />
      <button type="submit">Send</button>
    </form>
  </div>
  <script>
    const btn = document.getElementById('chatWidgetBtn');
    const win = document.getElementById('chatWidgetWindow');
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    let thinkingDiv = null;
    let chatOpened = false;

    // Welcome/demo message
    const welcomeMsg = `Hey there! 👋 Glad to see you exploring RYVONA's **Chat Widget** page. All is great over here—just ready to help you build powerful, lightweight chat experiences for your website! If you're on this page, you're probably interested in features like:\n- 🔌 **3-click website integration**\n- 🎨 Customizable UI (colors, placement, behavior)\n- 🌍 Multilingual AI support\n- 🔒 TLS encrypted & GDPR-ready\n\nWant to know how to embed it or tweak its design? Just ask! 😊`;

    btn.onclick = () => {
      win.classList.toggle('open');
      if (win.classList.contains('open')) {
        input.focus();
        if (!chatOpened) {
          addMsg(welcomeMsg, 'bot');
          chatOpened = true;
        }
      }
    };
    function addMsg(text, who) {
      const div = document.createElement('div');
      div.className = 'chat-msg ' + who;
      div.textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }
    function showThinking() {
      thinkingDiv = document.createElement('div');
      thinkingDiv.className = 'chat-thinking';
      thinkingDiv.innerHTML = 'RYVONA is thinking <span class="chat-dot"></span><span class="chat-dot"></span><span class="chat-dot"></span>';
      messages.appendChild(thinkingDiv);
      messages.scrollTop = messages.scrollHeight;
    }
    function hideThinking() {
      if (thinkingDiv) { thinkingDiv.remove(); thinkingDiv = null; }
    }
    // Dynamically determine the correct fetch path
    function getChatbotPath() {
      // Try to find '/project' in the current path
      if (window.location.pathname.split('/').includes('project')) {
        return '/project/backend/chatbot.php';
      } else {
        return '/backend/chatbot.php';
      }
    }
    form.onsubmit = async e => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      addMsg(text, 'user');
      input.value = '';
      showThinking();
      try {
        const res = await fetch(getChatbotPath(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            pageTitle: document.title,
            pageUrl: window.location.pathname
          })
        });
        const data = await res.json();
        hideThinking();
        if (data.reply) addMsg(data.reply, 'bot');
        else if (data.error) addMsg('Error: ' + data.error, 'bot');
        else addMsg('Sorry, I could not get a response.', 'bot');
      } catch (err) {
        hideThinking();
        addMsg('Network error. Please try again.', 'bot');
      }
    };
  </script>
</body>
</html> 