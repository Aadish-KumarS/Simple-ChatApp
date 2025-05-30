// memory storage for chat data
let chatData = {
  emma: [],
  michael: [],
  sarah: [],
  david: [],
  ava: [],
  liam: []
};


let currentChatId = "emma";
let isDarkMode = false;

// DOM elements init
const chatInput = document.querySelector(".chat-input textarea");
const sendButton = document.getElementById("sendBtn");
const chatMessages = document.getElementById("chat-messages");
const typingIndicator = document.querySelector(".typing-indicator");
const darkModeToggle = document.getElementById("darkModeToggle");
const chatItems = document.querySelectorAll(".chat-item");
const hamburger = document.getElementById('hamburger');
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

// Initi APPLICATION ==========================
function init() {
  setupEventListeners();
  loadInitialMessages();
}

function setupEventListeners() {
  sendButton.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  chatInput.addEventListener("input", autoResizeTextarea);
  darkModeToggle.addEventListener("click", toggleDarkMode);

  chatItems.forEach(item => {
    item.addEventListener("click", () => switchChat(item.dataset.chat));
  });

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("reactions") || e.target.parentElement.classList.contains("reactions")) {
      const emoji = e.target.textContent;
      showReactionFeedback(emoji);
    }
  });
}

function autoResizeTextarea() {
  chatInput.style.height = "auto";
  chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + "px";
}

function createMessageElement(type, text, withReaction = true) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", type);

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.textContent = text;

  if (withReaction) {
    const reactionBar = document.createElement("div");
    reactionBar.classList.add("reactions");
    ["👍", "❤️", "😂","👎"].forEach(reaction => {
      const span = document.createElement("span");
      span.textContent = reaction;
      span.style.cursor = "pointer";
      reactionBar.appendChild(span);
    });
    bubble.appendChild(reactionBar);
  }

  const timestamp = document.createElement("div");
  timestamp.classList.add("timestamp");
  timestamp.textContent = new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  messageElement.appendChild(bubble);
  messageElement.appendChild(timestamp);

  return messageElement;
}

function appendMessage(messageElement) {
  chatMessages.insertBefore(messageElement, typingIndicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  const messageData = {
    type: messageElement.classList.contains("user") ? "user" : "bot",
    text: messageElement.querySelector(".bubble").textContent,
    timestamp: messageElement.querySelector(".timestamp").textContent
  };
  chatData[currentChatId].push(messageData);
}

function sendMessage() {
  const text = chatInput.value.trim();
  if (text === "") return;

  const messageElement = createMessageElement("user", text);
  appendMessage(messageElement);
  chatInput.value = "";
  chatInput.style.height = "auto";

  showTypingIndicator();
  setTimeout(() => {
    hideTypingIndicator();
    const responses = [
      "That's interesting! Tell me more.",
      "I understand what you mean.",
      "Thanks for sharing that with me!",
      "That sounds great! 🎉",
      "I'm here if you need anything else.",
      "Absolutely! I agree with you.",
      "That's a good point to consider.",
      "Sounds like a plan! 👍"
    ];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const botReply = createMessageElement("bot", randomResponse);
    appendMessage(botReply);
  }, 1000 + Math.random() * 2000);
}

function showTypingIndicator() {
  typingIndicator.style.display = "flex";
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
  typingIndicator.style.display = "none";
}

function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle("dark-mode");
  darkModeToggle.textContent = isDarkMode ? "☀️" : "🌙";
}

function switchChat(chatId) {
  currentChatId = chatId;
  
  chatItems.forEach(item => {
    item.classList.remove("active");
  });
  document.querySelector(`[data-chat="${chatId}"]`).classList.add("active");
  const messages = chatMessages.querySelectorAll(".message");
  messages.forEach(msg => msg.remove());

  loadMessagesForChat(chatId);
  updateChatHeader(chatId);
}

function loadMessagesForChat(chatId) {
  const messages = chatData[chatId] || [];
  messages.forEach(msgData => {
    const messageElement = createMessageElement(msgData.type, msgData.text);
    messageElement.querySelector(".timestamp").textContent = msgData.timestamp;
    chatMessages.insertBefore(messageElement, typingIndicator);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateChatHeader(chatId) {
  const chatNames = {
    emma: "Emma Thompson",
    michael: "Michael Johnson", 
    sarah: "Sarah Davis",
    david: "David Miller",
    ava: "Ava Martinez",
    liam: "Liam Brown"
  };

  const avatars = {
    emma: "EM",
    michael: "MJ",
    sarah: "SA",
    david: "DM",
    ava: "AM",
    liam: "LB"
  };

  const statuses = {
    emma: { text: "Online", class: "online" },
    michael: { text: "Online", class: "online" },
    sarah: { text: "Last seen 2h ago", class: "inactive" },
    david: { text: "Online", class: "online" },
    ava: { text: "Last seen 30m ago", class: "inactive" },
    liam: { text: "Online", class: "online" }
  };

  
  const chatUserAvatar = document.querySelector(".chat-user-avatar");
  const statusDot = chatUserAvatar.querySelector(".status-dot");
  
  document.querySelector(".chat-user-name").textContent = chatNames[chatId];
  chatUserAvatar.firstChild.textContent = avatars[chatId];
  document.querySelector(".chat-user-status").textContent = statuses[chatId].text;
  
  statusDot.className = `status-dot ${statuses[chatId].class}`;
}

function insertEmoji(emoji) {
  const cursorPos = chatInput.selectionStart;
  const textBefore = chatInput.value.substring(0, cursorPos);
  const textAfter = chatInput.value.substring(cursorPos);
  
  chatInput.value = textBefore + emoji + textAfter;
  chatInput.focus();
  chatInput.selectionStart = chatInput.selectionEnd = cursorPos + emoji.length;
  
  autoResizeTextarea();
}

function showReactionFeedback(emoji) {
  const feedback = document.createElement("div");
  feedback.textContent = `You reacted with ${emoji}`;
  feedback.style.position = "fixed";
  feedback.style.top = "50%";
  feedback.style.left = "50%";
  feedback.style.transform = "translate(-50%, -50%)";
  feedback.style.background = "rgba(0, 0, 0, 0.8)";
  feedback.style.color = "white";
  feedback.style.padding = "0.5rem 1rem";
  feedback.style.borderRadius = "20px";
  feedback.style.fontSize = "0.9rem";
  feedback.style.zIndex = "1000";
  feedback.style.opacity = "0";
  feedback.style.transition = "opacity 0.3s ease";
  
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    feedback.style.opacity = "1";
  }, 10);
  
  setTimeout(() => {
    feedback.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(feedback);
    }, 300);
  }, 2000);
}


function toggleSidebar() {
  hamburger.classList.toggle('active');
  sidebar.classList.toggle('active');
  sidebarOverlay.classList.toggle('active');
}

hamburger.addEventListener('click', toggleSidebar);
sidebarOverlay.addEventListener('click', toggleSidebar);

function loadInitialMessages() {
  chatData.emma = [
    {
      type: "bot",
      text: "Oh, I almost forgot – do you have the latest version of the client presentation?",
      timestamp: "12:05 PM"
    },
    {
      type: "user", 
      text: "I've just sent it to your email. It includes all the updates we discussed!",
      timestamp: "12:15 PM"
    },
    {
      type: "bot",
      text: "Got it, thanks! I'll review it before our lunch.",
      timestamp: "12:20 PM"
    },
    {
      type: "user",
      text: "Looking forward to it! 🔥",
      timestamp: "12:25 PM"
    },
    {
      type: "bot",
      text: "Also, don’t forget the pitch slides for next week.",
      timestamp: "12:26 PM"
    },
    {
      type: "user",
      text: "Noted! I’ll work on those tonight.",
      timestamp: "12:27 PM"
    }
  ];

  chatData.michael = [
    {
      type: "bot",
      text: "Are we still meeting for coffee tomorrow?",
      timestamp: "11:30 AM"
    },
    {
      type: "user",
      text: "Absolutely! Same place at 3 PM?",
      timestamp: "11:45 AM"
    },
    {
      type: "bot",
      text: "Perfect! See you there ☕",
      timestamp: "11:50 AM"
    },
    {
      type: "user",
      text: "I’ll bring those notes we discussed as well.",
      timestamp: "11:52 AM"
    },
    {
      type: "bot",
      text: "Awesome! Looking forward to it.",
      timestamp: "11:53 AM"
    }
  ];

  chatData.sarah = [
    {
      type: "user",
      text: "Thanks for the quick response! 👍",
      timestamp: "2:15 PM"
    },
    {
      type: "bot",
      text: "You're welcome! Always happy to help 😊",
      timestamp: "2:20 PM"
    },
    {
      type: "user",
      text: "By the way, any updates on the recruitment status?",
      timestamp: "2:21 PM"
    },
    {
      type: "bot",
      text: "Still reviewing applications — I’ll update you by tomorrow.",
      timestamp: "2:22 PM"
    }
  ];

  chatData.david = [
    {
      type: "bot",
      text: "Did you get a chance to review the financial report?",
      timestamp: "10:00 AM"
    },
    {
      type: "user",
      text: "Yes, I added comments to the last two slides.",
      timestamp: "10:12 AM"
    },
    {
      type: "bot",
      text: "Awesome. I'll finalize it by this afternoon.",
      timestamp: "10:15 AM"
    },
    {
      type: "user",
      text: "Let me know if you need help formatting the charts.",
      timestamp: "10:16 AM"
    }
  ];

  chatData.ava = [
    {
      type: "user",
      text: "The wireframes are ready for feedback. Let me know your thoughts!",
      timestamp: "3:30 PM"
    },
    {
      type: "bot",
      text: "Thanks! I’ll review them after my meeting and get back to you.",
      timestamp: "3:35 PM"
    },
    {
      type: "bot",
      text: "Just finished reviewing. They look great overall!",
      timestamp: "4:00 PM"
    },
    {
      type: "user",
      text: "Awesome. Happy to make any changes if needed.",
      timestamp: "4:02 PM"
    }
  ];

  chatData.liam = [
    {
      type: "bot",
      text: "Can you send me the analytics report by end of day?",
      timestamp: "9:05 AM"
    },
    {
      type: "user",
      text: "Just finished it – uploading to the shared drive now.",
      timestamp: "9:10 AM"
    },
    {
      type: "bot",
      text: "Perfect. Much appreciated!",
      timestamp: "9:12 AM"
    },
    {
      type: "user",
      text: "Let me know if you want any additional charts.",
      timestamp: "9:13 AM"
    }
  ];

  loadMessagesForChat(currentChatId);
}



document.addEventListener("DOMContentLoaded", init);