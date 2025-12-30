let customerName = "";
const sessionId = "SID_" + Math.floor(Math.random() * 100000);
let conversationLog = [];

// Load existing complaints (simulated DB)
let allComplaints = JSON.parse(localStorage.getItem("complaints")) || [];

const chatFlow = {
  Q1: {
    question: "What issue are you facing with your order?",
    options: [
      { text: "Did not receive my order", next: "Q2" },
      { text: "Received wrong item", next: "Q3" },
      { text: "Food quality issue", next: "Q4" }
    ]
  },

  Q2: {
    question: "When was your order supposed to arrive?",
    options: [
      { text: "It is late", response: "Your order will arrive shortly." },
      { text: "It never arrived", response: "A full refund will be initiated within 24 hours." }
    ]
  },

  Q3: {
    question: "What was wrong with the order?",
    options: [
      { text: "Item missing", response: "A partial refund has been issued." },
      { text: "Completely different item", response: "Please upload an image of the received item." }
    ]
  },

  Q4: {
    question: "What issue did you face with the food quality?",
    options: [
      { text: "Food was cold", response: "A compensation coupon has been added to your account." },
      { text: "Food tasted bad", response: "We will process a refund for your order." }
    ]
  }
};

const chatBox = document.getElementById("chat-box");
const optionsBox = document.getElementById("options");

function botMessage(text) {
  chatBox.innerHTML += `<div class="bot">${text}</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;
}

function userMessage(text) {
  chatBox.innerHTML += `<div class="user">${text}</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;
}

function loadQuestion(id) {
  optionsBox.innerHTML = "";
  const node = chatFlow[id];
  botMessage(node.question);

  node.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt.text;
    btn.onclick = () => {
  userMessage(opt.text);

  conversationLog.push({
    session_id: sessionId,
    selected_option: opt.text,
    timestamp: new Date().toLocaleString()
  });
  updateLog();


  optionsBox.innerHTML = "";
  opt.next ? loadQuestion(opt.next) : endChat(opt.response);
};

    optionsBox.appendChild(btn);
  });
}

loadQuestion("Q1");
function endChat(finalResponse) {
  botMessage(finalResponse);

  setTimeout(() => {
    botMessage("Was this chat helpful?");
    showFeedback();
  }, 800);
}
function showFeedback() {
  const feedbackOptions = [
    "⭐ Very Helpful",
    "🙂 Helpful",
    "😐 Neutral",
    "☹️ Not Helpful"
  ];

  feedbackOptions.forEach(fb => {
    const btn = document.createElement("button");
    btn.innerText = fb;

    btn.onclick = () => {
      userMessage(fb);

      conversationLog.push({
        session_id: sessionId,
        feedback: fb,
        timestamp: new Date().toLocaleString()
      });
      updateLog();
      allComplaints.push({
  customer_name: customerName,
  session_id: sessionId,
  issue: conversationLog[0]?.selected_option,
  conversation: conversationLog.map(c => c.selected_option || c.feedback),
  date: new Date().toLocaleString()
});

localStorage.setItem("complaints", JSON.stringify(allComplaints));
updateAdminPanel();



      optionsBox.innerHTML = "";
      botMessage("Thank you for your feedback!");

      console.log("SESSION DATA:", conversationLog);
    };

    optionsBox.appendChild(btn);
  });
}
function updateLog() {
  document.getElementById("log-output").textContent =
    JSON.stringify(conversationLog, null, 2);
}
function startChat() {
  const input = document.getElementById("customer-name").value;

  if (!input) {
    alert("Please enter your name");
    return;
  }

  customerName = input;

  document.getElementById("login-box").style.display = "none";
  document.getElementById("chat-section").style.display = "block";

  loadQuestion("Q1");
}
function updateAdminPanel() {
  const list = document.getElementById("complaint-list");
  list.innerHTML = "";

  allComplaints.forEach(c => {
    const li = document.createElement("li");
    li.textContent = `${c.customer_name} – ${c.issue}`;
    list.appendChild(li);
  });
}
updateAdminPanel();
function logout() {
  // Clear session-only data
  conversationLog = [];
  chatBox.innerHTML = "";
  optionsBox.innerHTML = "";

  // Reset UI
  document.getElementById("chat-section").style.display = "none";
  document.getElementById("login-box").style.display = "block";

  // Clear input
  document.getElementById("customer-name").value = "";
}
function clearAllComplaints() {
  if (!confirm("Clear all complaints for today?")) return;

  localStorage.removeItem("complaints");
  allComplaints = [];
  updateAdminPanel();
}


