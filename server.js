const http = require("http");

const PORT = process.env.PORT || 3000;
const TARGET_EMAIL = process.env.INQUIRY_RECIPIENT_EMAIL || "escadpeideas@gmail.com";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

const KNOWLEDGE_BASE = [
  {
    id: "salary-loan",
    keywords: ["salary", "sahod", "sweldo", "enhanced", "salary loan"],
    title: "Enhanced Salary Loan",
    en: "The Enhanced Salary Loan grants up to ₱500,000 with payment terms up to 60 months (5 years) at 8% per annum.\n\n• Loanable Amount: Up to ₱500,000 (subject to Net Take Home Pay / NTHP)\n• Interest Rate: 8% per annum\n• Eligibility: Active uniformed personnel with in-force MBAI Protek & regular payroll deduction\n• Requirements: Application form, Valid ID, latest 3 months payslips, unit endorsement.",
    fil: "Ang Enhanced Salary Loan ay nagpapahiram hanggang ₱500,000 na may termino hanggang 60 buwan (5 taon) sa 8% per annum.\n\n• Halaga ng Loan: Hanggang ₱500,000 (depende sa Net Take Home Pay o NTHP)\n• Interes: 8% kada taon\n• Kwalipikado: Aktibong miyembro na may MBAI Protek at may kaltas sa sahod\n• Requirements: Application form, Valid ID, huling 3 buwang payslip, at endorsement.",
    sources: [
      { title: "AFPMBAI Enhanced Salary Loan", url: "https://afpmbai.com.ph/enhanced-salary-loan/" },
      { title: "AFPMBAI Helpdesk - Salary Loan", url: "https://helpdesk.afpmbai.com.ph/" }
    ]
  },
  {
    id: "policy-loan",
    keywords: ["policy", "cash value", "seguro", "insurance loan", "bale"],
    title: "Policy Loan",
    en: "A Policy Loan allows members to borrow against their insurance accumulated Cash Value.\n\n• Eligibility: In force for at least 2 years on Endowment Plans or 3 years on Whole Life\n• Interest: 6% per annum\n• Advantage: Not subject to Net Take Home Pay (NTHP) salary restriction\n• Payment: Via GCash, Maya, Landbank, or over-the-counter.",
    fil: "Ang Policy Loan ay nagbibigay-daan upang makahiram mula sa naipong Cash Value ng inyong seguro.\n\n• Kwalipikasyon: Hindi bababa sa 2 taong bayad sa Endowment o 3 taon sa Whole Life\n• Interes: 6% kada taon\n• Bentahe: Hindi sakop ng Net Take Home Pay (NTHP) limit sa sahod\n• Bayaran: Pwede sa GCash, Maya, Landbank, o payment centers.",
    sources: [
      { title: "AFPMBAI Policy Loan Overview", url: "https://afpmbai.com.ph/policy-loan/" },
      { title: "AFPMBAI FAQ", url: "https://afpmbai.com.ph/frequently-asked-questions/" }
    ]
  },
  {
    id: "emergency-loan",
    keywords: ["emergency", "sakuna", "kalamidad", "calamity", "ospital", "bereavement", "namatayan"],
    title: "Emergency Loan",
    en: "Emergency Loan provides up to ₱75,000 financial support at 5% per annum with zero processing fee.\n\n• Maximum: ₱75,000\n• Interest: 5.0% per annum (Zero processing fee)\n• Term: Up to 36 months\n• Coverage: Hospitalization of immediate family, death/bereavement, or declared State of Calamity.",
    fil: "Ang Emergency Loan ay nagkakaloob ng hanggang ₱75,000 sa 5% interes kada taon nang walang processing fee.\n\n• Maximum: ₱75,000\n• Interes: 5% bawat taon (Walang processing fee)\n• Termino: Hanggang 36 na buwan\n• Sakop: Pagka-ospital ng pamilya, pagkamatay, o deklaradong State of Calamity.",
    sources: [
      { title: "AFPMBAI Emergency Loan", url: "https://afpmbai.com.ph/emergency-loan/" },
      { title: "AFPMBAI Helpdesk", url: "https://helpdesk.afpmbai.com.ph/" }
    ]
  },
  {
    id: "housing-loan",
    keywords: ["house", "housing", "bahay", "mortgage", "lupa", "pabahay"],
    title: "Real Estate & Housing Loan",
    en: "Mortgage loans up to ₱10 Million for purchasing house & lot or lot acquisition nationwide.\n\n• Maximum Amount: Up to ₱10,000,000 (subject to paying capacity & 70% appraisal)\n• Contact: real.estatediv@afpmbai.ph.",
    fil: "Pabahay at mortgage loan hanggang ₱10 Milyon para sa pagbili ng bahay at lupa o lote sa buong bansa.\n\n• Halaga: Hanggang ₱10,000,000 (batay sa kapasidad at appraisal)\n• Makipag-ugnayan: real.estatediv@afpmbai.ph.",
    sources: [
      { title: "AFPMBAI Real Estate Mortgage Loan", url: "https://afpmbai.com.ph/real-estate-mortgage-loan/" }
    ]
  }
];

function processMessage(rawText) {
  const text = (rawText || "").trim().toLowerCase();
  const isFil = /ano|paano|magkano|kailan|pwede|ba|ko|sa|mga|po|kamusta|umaga|gabi/i.test(text);

  if (/^(hi|hello|hey|kamusta|kumusta|magandang araw|good morning|good afternoon)/i.test(text)) {
    return {
      reply: isFil 
        ? "Magandang araw! Ako ang AFPMBAI Loan Assistant. Handa akong magbigay ng opisyal na impormasyon tungkol sa Salary Loan, Policy Loan, Emergency Loan, at iba pang benepisyo. Paano kita matutulungan?"
        : "Good day! I am your AFPMBAI Loan Assistant. How may I help you with your loan options, requirements, or member benefits today?",
      sources: [{ title: "AFPMBAI Official Website", url: "https://afpmbai.com.ph/" }],
      needEscalation: false
    };
  }

  if (/balance|magkano pa utang|soa|statement|status ng loan|approved na ba|hulog ko/i.test(text)) {
    return {
      reply: isFil
        ? "Para sa inyong proteksyon alinsunod sa Data Privacy Act, ang inyong personal loan balance at approval status ay hindi maaaring ilabas sa pampublikong chat. Nais niyo po bang magpadala ng direktang inquiry sa escadpeideas@gmail.com upang matulungan kayo ng kinatawan?"
        : "For your privacy and security under the Data Privacy Act, personal account balances and individual loan statuses cannot be accessed in this public chat. Would you like to submit an official inquiry to escadpeideas@gmail.com?",
      sources: [{ title: "AFPMBAI Helpdesk Verification", url: "https://helpdesk.afpmbai.com.ph/" }],
      needEscalation: true
    };
  }

  for (const item of KNOWLEDGE_BASE) {
    if (item.keywords.some(kw => text.includes(kw))) {
      return {
        reply: isFil ? item.fil : item.en,
        sources: item.sources,
        needEscalation: false
      };
    }
  }

  return {
    reply: isFil
      ? "Ipagpaumanhin po, wala sa kasalukuyang opisyal na talaan ng AFPMBAI ang tiyak na detalye para sa inyong tanong. Hindi po kami nag-iimbento ng mga patakaran o halaga. Nais niyo po bang ipasa ang inyong mensahe sa escadpeideas@gmail.com?"
      : "I apologize, but I could not verify official information for that specific inquiry in AFPMBAI records. To maintain accuracy, we do not invent loan policies or rates. Would you like to submit this question directly to escadpeideas@gmail.com?",
    sources: [
      { title: "AFPMBAI Frequently Asked Questions", url: "https://afpmbai.com.ph/frequently-asked-questions/" },
      { title: "AFPMBAI Helpdesk", url: "https://helpdesk.afpmbai.com.ph/" }
    ],
    needEscalation: true
  };
}

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>AFPMBAI LOAN ASSISTANT</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: #f1f5f9; display: flex; flex-direction: column; height: 100dvh; overflow: hidden; }
    header { background-color: #0b2b4f; color: white; padding-top: max(12px, env(safe-area-inset-top)); padding-bottom: 12px; padding-left: 16px; padding-right: 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); flex-shrink: 0; }
    .logo-badge { background: #f59e0b; color: #0b2b4f; font-weight: 900; font-size: 11px; padding: 4px 6px; border-radius: 6px; margin-right: 8px; }
    .header-title h1 { font-size: 15px; font-weight: 700; }
    .header-title p { font-size: 11px; color: #93c5fd; }
    .btn-new-chat { background: #f59e0b; color: #0b2b4f; border: none; font-weight: 700; font-size: 12px; padding: 8px 12px; border-radius: 8px; min-height: 38px; cursor: pointer; }
    #chat-container { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 12px; }
    .bubble { max-width: 86%; padding: 12px 14px; border-radius: 16px; font-size: 14px; line-height: 1.45; word-wrap: break-word; }
    .bubble-user { align-self: flex-end; background-color: #0b2b4f; color: white; border-bottom-right-radius: 4px; }
    .bubble-bot { align-self: flex-start; background-color: white; color: #1e293b; border: 1px solid #e2e8f0; border-bottom-left-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .sources { margin-top: 10px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 11px; }
    .sources a { color: #2563eb; text-decoration: underline; display: block; margin-top: 3px; word-break: break-all; }
    .btn-escalate { margin-top: 10px; width: 100%; min-height: 44px; background: #f59e0b; border: none; color: #0b2b4f; font-weight: bold; font-size: 13px; border-radius: 10px; cursor: pointer; }
    footer { background: white; border-top: 1px solid #e2e8f0; padding: 10px 14px; padding-bottom: max(12px, env(safe-area-inset-bottom)); flex-shrink: 0; }
    .input-row { display: flex; gap: 8px; align-items: center; max-width: 700px; margin: 0 auto; }
    #msg-input { flex: 1; min-height: 44px; font-size: 16px; padding: 8px 16px; border: 1px solid #cbd5e1; border-radius: 22px; outline: none; background: #f8fafc; }
    #msg-input:focus { border-color: #0b2b4f; background: #fff; }
    #send-btn { width: 44px; height: 44px; border-radius: 50%; background: #0b2b4f; color: white; border: none; font-size: 18px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .modal-backdrop { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 100; align-items: flex-end; justify-content: center; }
    @media(min-width: 600px) { .modal-backdrop { align-items: center; padding: 20px; } }
    .modal-card { background: white; width: 100%; max-width: 480px; border-radius: 20px 20px 0 0; max-height: 90vh; overflow-y: auto; padding: 18px; padding-bottom: max(20px, env(safe-area-inset-bottom)); box-shadow: 0 -4px 10px rgba(0,0,0,0.15); }
    @media(min-width: 600px) { .modal-card { border-radius: 16px; } }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 4px; }
    .form-group input, .form-group textarea { width: 100%; min-height: 44px; font-size: 16px; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; }
    .consent-box { display: flex; gap: 8px; align-items: flex-start; font-size: 11px; color: #475569; margin-bottom: 14px; }
    .consent-box input { width: 18px; height: 18px; margin-top: 2px; }
  </style>
</head>
<body>
  <header>
    <div style="display:flex; align-items:center;">
      <span class="logo-badge">MBAI</span>
      <div class="header-title">
        <h1>AFPMBAI LOAN ASSISTANT</h1>
        <p>Opisyal at maaasahang gabay</p>
      </div>
    </div>
    <button class="btn-new-chat" onclick="resetChat()">New Chat</button>
  </header>

  <div id="chat-container"></div>

  <footer>
    <div class="input-row">
      <input type="text" id="msg-input" placeholder="Magtanong ukol sa Salary, Policy Loan..." onkeydown="if(event.key==='Enter') sendUserMessage()">
      <button id="send-btn" onclick="sendUserMessage()">↑</button>
    </div>
  </footer>

  <div id="inquiry-modal" class="modal-backdrop">
    <div class="modal-card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h3 style="font-size:16px; color:#0b2b4f;">Ipadala ang Inquiry</h3>
        <button onclick="closeModal()" style="border:none; background:none; font-size:22px; cursor:pointer;">✕</button>
      </div>
      <p style="font-size:12px; color:#64748b; margin-bottom:14px;">Ipapasa ang mensaheng ito sa <b>escadpeideas@gmail.com</b>.</p>

      <div id="modal-alert" style="display:none; padding:10px; font-size:12px; border-radius:8px; margin-bottom:10px;"></div>

      <div class="form-group">
        <label>Pangalan (Opsyonal)</label>
        <input type="text" id="inq-name" placeholder="Hal. Juan Dela Cruz">
      </div>
      <div class="form-group">
        <label>Email Address <span style="color:red;">*</span></label>
        <input type="email" id="inq-email" placeholder="name@example.com" required>
      </div>
      <div class="form-group">
        <label>Contact Number <span style="color:red;">*</span></label>
        <input type="tel" id="inq-phone" placeholder="0917XXXXXXX" required>
      </div>
      <div class="form-group">
        <label>Tanong o Kahilingan <span style="color:red;">*</span></label>
        <textarea id="inq-msg" rows="3" placeholder="Isulat ang inyong katanungan..."></textarea>
      </div>

      <div class="consent-box">
        <input type="checkbox" id="inq-consent">
        <span>Sumasang-ayon ako na ibahagi ang aking detalye sa <b>escadpeideas@gmail.com</b> alinsunod sa Data Privacy Act. Hindi humihingi ang assistant na ito ng passwords, PINs, o OTPs.</span>
      </div>

      <button id="btn-submit" onclick="submitInquiry()" style="width:100%; min-height:44px; background:#0b2b4f; color:white; border:none; font-size:15px; font-weight:bold; border-radius:10px; cursor:pointer;">
        Isumite ang Mensahe
      </button>
    </div>
  </div>

  <script>
    const chatContainer = document.getElementById('chat-container');

    function addMessage(sender, text, sources, showEscalate) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble ' + (sender === 'user' ? 'bubble-user' : 'bubble-bot');
      bubble.innerHTML = '<div>' + text.replace(/\\n/g, '<br>') + '</div>';

      if (sources && sources.length) {
        let srcHtml = '<div class="sources"><b>Opisyal na Sanggunian:</b>';
        sources.forEach(s => {
          srcHtml += '<a href="' + s.url + '" target="_blank" rel="noopener">🔗 ' + s.title + '</a>';
        });
        srcHtml += '</div>';
        bubble.innerHTML += srcHtml;
      }

      if (showEscalate) {
        const btn = document.createElement('button');
        btn.className = 'btn-escalate';
        btn.textContent = '✉ Isumite sa escadpeideas@gmail.com';
        btn.onclick = () => openModal(text);
        bubble.appendChild(btn);
      }

      chatContainer.appendChild(bubble);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    async function sendUserMessage() {
      const input = document.getElementById('msg-input');
      const val = input.value.trim();
      if (!val) return;
      input.value = '';

      addMessage('user', val);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: val })
        });
        const data = await res.json();
        addMessage('bot', data.reply, data.sources, data.needEscalation);
      } catch (e) {
        addMessage('bot', 'Nagkaroon ng aberya sa koneksyon. Pakisubukan muli.');
      }
    }

    function resetChat() {
      chatContainer.innerHTML = '';
      addMessage('bot', 'Mabuhay! Ako ang AFPMBAI LOAN ASSISTANT. Paano kita matutulungan sa iyong Salary Loan, Policy Loan, o benepisyo ngayon?', [
        { title: 'AFPMBAI Main Page', url: 'https://afpmbai.com.ph/' }
      ]);
    }

    function openModal(defaultText) {
      document.getElementById('inquiry-modal').style.display = 'flex';
      if (!document.getElementById('inq-msg').value) {
        document.getElementById('inq-msg').value = defaultText || '';
      }
    }

    function closeModal() {
      document.getElementById('inquiry-modal').style.display = 'none';
      document.getElementById('modal-alert').style.display = 'none';
    }

    async function submitInquiry() {
      const name = document.getElementById('inq-name').value;
      const email = document.getElementById('inq-email').value;
      const phone = document.getElementById('inq-phone').value;
      const question = document.getElementById('inq-msg').value;
      const consent = document.getElementById('inq-consent').checked;
      const alertBox = document.getElementById('modal-alert');
      const btn = document.getElementById('btn-submit');

      if (!email || !phone || !question) {
        alertBox.style.display = 'block';
        alertBox.style.background = '#fee2e2';
        alertBox.style.color = '#991b1b';
        alertBox.textContent = 'Pakisagutan ang Email, Phone, at Tanong.';
        return;
      }

      if (!consent) {
        alertBox.style.display = 'block';
        alertBox.style.background = '#fee2e2';
        alertBox.style.color = '#991b1b';
        alertBox.textContent = 'Kailangan ang inyong pahintulot (consent checkbox).';
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Ipinapadala...';

      try {
        const res = await fetch('/api/send-inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, question, consent })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        alertBox.style.display = 'block';
        alertBox.style.background = '#dcfce7';
        alertBox.style.color = '#166534';
        alertBox.textContent = data.message;
        setTimeout(() => closeModal(), 2500);
      } catch (err) {
        alertBox.style.display = 'block';
        alertBox.style.background = '#fee2e2';
        alertBox.style.color = '#991b1b';
        alertBox.textContent = err.message || 'Nabigong ipadala ang email.';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Isumite ang Mensahe';
      }
    }

    resetChat();
  </script>
</body>
</html>`;

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(HTML_CONTENT);
  }

  if (req.method === "POST" && req.url === "/api/chat") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const { message } = JSON.parse(body || "{}");
        const result = processMessage(message);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON format" }));
      }
    });
    return;
  }

  if (req.method === "POST" && req.url === "/api/send-inquiry") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        const { name, email, phone, question, consent } = JSON.parse(body || "{}");

        if (!consent) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Kailangan ang inyong pahintulot (consent)." }));
        }

        if (!email || !phone || !question) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Kulang ang detalye sa form." }));
        }

        if (!RESEND_API_KEY) {
          res.writeHead(503, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({
            error: "Hindi pa nai-configure ang RESEND_API_KEY sa server. Maglagay ng libreng key mula sa resend.com bago magpadala.",
            requiresSetup: true
          }));
        }

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + RESEND_API_KEY
          },
          body: JSON.stringify({
            from: "AFPMBAI Assistant <onboarding@resend.dev>",
            to: [TARGET_EMAIL],
            reply_to: email,
            subject: "[AFPMBAI LOAN INQUIRY] Mensahe mula kay " + (name || "Member"),
            html: "<p><b>Pangalan:</b> " + (name || "N/A") + "</p>" +
                  "<p><b>Email:</b> " + email + "</p>" +
                  "<p><b>Telepono:</b> " + phone + "</p>" +
                  "<hr><p><b>Katanungan:</b><br>" + question.replace(/\\n/g, "<br>") + "</p>"
          })
        });

        if (!emailResponse.ok) {
          const errData = await emailResponse.json().catch(() => ({}));
          res.writeHead(502, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: errData.message || "Nabigo ang email server provider." }));
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Matagumpay na naipadala sa escadpeideas@gmail.com!" }));

      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message || "May aberya sa server." }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log("AFPMBAI Assistant is online on port " + PORT);
});
