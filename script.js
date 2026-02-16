// --- DATA HUB (PRISMA STORAGE) ---
const DB_NAME = "prisma_official_db_v1";
const demoData = [
  {
    id: 1,
    text: "Review API documentation for bugs",
    priority: "high",
    icon: "fa-code",
    color: "cyan",
    completed: true,
    eta: "1h",
    time: "10:30 AM",
  },
  {
    id: 2,
    text: "Evening Fitness Training",
    priority: "low",
    icon: "fa-heart-pulse",
    color: "rose",
    completed: false,
    eta: "24h",
    time: "05:00 PM",
  },
];

let tasks = JSON.parse(localStorage.getItem(DB_NAME)) || demoData;
let currentPriority = "low";
let currentTheme = localStorage.getItem("prisma_theme_v1") || "dark";

// --- CORE LOGIC ---
function setPriority(level, btn) {
  currentPriority = level;
  document
    .querySelectorAll(".priority-btn")
    .forEach((b) => b.classList.remove("bg-indigo-500/20", "text-indigo-500"));
  btn.classList.add("bg-indigo-500/20", "text-indigo-500");
}

function addTask() {
  const input = document.getElementById("taskInput");
  if (!input.value.trim()) return;

  const text = input.value;
  let icon = "fa-prism",
    color = "indigo";

  if (text.match(/code|dev|build|debug|api/i)) {
    icon = "fa-code";
    color = "cyan";
  } else if (text.match(/buy|shop|pay|price/i)) {
    icon = "fa-cart-shopping";
    color = "emerald";
  } else if (text.match(/gym|run|fit|health/i)) {
    icon = "fa-heart-pulse";
    color = "rose";
  }

  tasks.unshift({
    id: Date.now(),
    text: text,
    priority: currentPriority,
    icon: icon,
    color: color,
    completed: false,
    eta:
      currentPriority === "high"
        ? "1h"
        : currentPriority === "med"
          ? "4h"
          : "24h",
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  input.value = "";
  sync();
}

function toggleTask(id) {
  const t = tasks.find((x) => x.id === id);
  t.completed = !t.completed;

  if (t.completed) {
    new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
    ).play();
    if (tasks.length > 0 && tasks.every((task) => task.completed))
      showSuccessScreen();
  }
  sync();
}

function deleteTask(id) {
  tasks = tasks.filter((x) => x.id !== id);
  sync();
}

function sync() {
  localStorage.setItem(DB_NAME, JSON.stringify(tasks));
  render();
}

// --- RENDER ENGINE ---
function render() {
  const list = document.getElementById("taskList");
  const query = document.getElementById("search").value.toLowerCase();
  const filtered = tasks.filter((t) => t.text.toLowerCase().includes(query));

  const done = tasks.filter((t) => t.completed).length;
  document.getElementById("totalTasks").innerText = tasks.length;
  document.getElementById("doneTasks").innerText = done;
  document.getElementById("efficiency").innerText = tasks.length
    ? Math.round((done / tasks.length) * 100) + "%"
    : "0%";
  document.getElementById("vibeScore").innerText =
    done * 50 + tasks.length * 10;

  list.innerHTML = filtered
    .map(
      (t) => `
                <div class="task-item glass-card p-5 border-l-4 ${t.completed ? "opacity-40 border-emerald-500" : "border-" + t.color + "-500"}">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-5">
                            <button onclick="toggleTask(${t.id})" class="text-2xl ${t.completed ? "text-emerald-500" : "text-gray-500 hover:text-indigo-500"} transition-all">
                                <i class="${t.completed ? "fas fa-check-circle" : "far fa-circle"}"></i>
                            </button>
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-[8px] font-black uppercase px-2 py-0.5 bg-black/20 rounded text-gray-400">${t.priority}</span>
                                    <span class="text-[8px] text-indigo-400 font-bold italic">ETA: ${t.eta}</span>
                                </div>
                                <h3 class="font-bold ${t.completed ? "line-through text-gray-500" : "text-white"}">${t.text}</h3>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="openEdit(${t.id})" class="p-2 text-gray-500 hover:text-white"><i class="fas fa-pen-nib"></i></button>
                            <button onclick="deleteTask(${t.id})" class="p-2 text-gray-500 hover:text-rose-500"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `,
    )
    .join("");
}

// --- UI UTILITIES ---
function toggleTheme() {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  localStorage.setItem("prisma_theme_v1", currentTheme);
  document.getElementById("themeIcon").className =
    currentTheme === "dark"
      ? "fas fa-moon text-indigo-500"
      : "fas fa-sun text-orange-500";
}

function toggleZen() {
  const app = document.getElementById("mainApp");
  if (document.getElementById("zen")) {
    document.getElementById("zen").remove();
    app.classList.remove("zen-mode-active");
  } else {
    const top = tasks.find((t) => !t.completed) || {
      text: "All Objectives Cleared",
    };
    const zen = document.createElement("div");
    zen.id = "zen";
    zen.className =
      "fixed inset-0 z-[5000] flex flex-col items-center justify-center bg-black/60 backdrop-blur-3xl p-10 text-center";
    zen.innerHTML = `<p class="text-[10px] font-black uppercase tracking-[0.8em] text-indigo-500 mb-4">Focus Protocol</p>
                                 <h2 class="text-6xl font-black italic mb-10 text-white">${top.text}</h2>
                                 <button onclick="toggleZen()" class="text-xs font-black uppercase text-gray-400 hover:text-white border-b border-gray-800">Exit Focus</button>`;
    document.body.appendChild(zen);
    app.classList.add("zen-mode-active");
  }
}

function showSuccessScreen() {
  document.getElementById("completionOverlay").classList.remove("hidden");
}

function closeSuccess() {
  document.getElementById("completionOverlay").classList.add("hidden");
}
function shareReport() {
  const completedCount = tasks.filter((t) => t.completed).length;
  const efficiency = document.getElementById("efficiency").innerText;
  const score = document.getElementById("vibeScore").innerText;

  const r = `🚀 PRISMA Performance Report:\n- Tasks Cleared: ${completedCount}\n- Efficiency Score: ${efficiency}\n- Vibe Score: ${score}\nGenerated via PRISMA OS.`;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(r)
      .then(() => {
        showSuccessAlert();
      })
      .catch(() => {
        fallbackCopyText(r);
      });
  } else {
    fallbackCopyText(r);
  }
}

function fallbackCopyText(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    if (successful) showSuccessAlert();
  } catch (err) {
    console.error("Unable to copy", err);
  }

  document.body.removeChild(textArea);
}

// دالة إظهار الرسالة الجميلة
function showSuccessAlert() {
  // تشغيل صوت النجاح إذا كان موجوداً
  if (typeof playSnd === "function") playSnd(doneSnd);

  Swal.fire({
    title: "Report Copied!",
    text: "Summary saved to clipboard",
    background: "#1e1b4b",
    color: "#fff",
    background: "#ddf",
    icon: "success",
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 2500,
  });
}

let editId = null;
function openEdit(id) {
  editId = id;
  document.getElementById("editInput").value = tasks.find(
    (x) => x.id === id,
  ).text;
  document.getElementById("editModal").classList.remove("hidden");
}
document.getElementById("saveEdit").onclick = () => {
  tasks.find((x) => x.id === editId).text =
    document.getElementById("editInput").value;
  document.getElementById("editModal").classList.add("hidden");
  sync();
};

function exportData() {
  const a = document.createElement("a");
  a.href =
    "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks));
  a.download = "prisma_backup.json";
  a.click();
}

// --- ANIMATIONS & TIMERS ---
function updateTimer() {
  const targetDate = new Date("Feb 17, 2026 13:00:00").getTime();
  const now = new Date().getTime();
  const diff = targetDate - now;

  if (diff > 0) {
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const displayH = String(hours).padStart(2, "0");
    const displayM = String(minutes).padStart(2, "0");
    const displayS = String(seconds).padStart(2, "0");

    document.getElementById("deadline").innerText =
      `${displayH}:${displayM}:${displayS}`;
  } else {
    document.getElementById("deadline").innerText = "MISSION EXPIRED";
  }
}

setInterval(updateTimer, 1000);

updateTimer();

const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");
let pts = [];
window.onresize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};
window.onresize();
for (let i = 0; i < 45; i++)
  pts.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: Math.random() - 0.5,
    vy: Math.random() - 0.5,
  });
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle =
    currentTheme === "dark" ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)";
  pts.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(animate);
}

// Initialize
document.documentElement.setAttribute("data-theme", currentTheme);
document.getElementById("themeIcon").className =
  currentTheme === "dark"
    ? "fas fa-moon text-indigo-500"
    : "fas fa-sun text-orange-500";
setInterval(updateTimer, 60000);
updateTimer();
render();
animate();
