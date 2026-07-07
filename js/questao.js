/* ============================================
   Binary Learning — motor de perguntas (MVP)
   Tipos suportados: "tf" (verdadeiro/falso),
   "mc" (múltipla escolha), "match" (relacionar)
   ============================================ */

const QUESTION_BANK = {
  binarios: [
    {
      type: "tf",
      text: "No sistema binário, a representação numérica 10 equivale ao valor decimal dez.",
      correct: false
    },
    {
      type: "mc",
      text: "Qual é o valor decimal do binário 101?",
      options: ["5", "3", "6", "8"],
      correctIndex: 0
    },
    {
      type: "match",
      text: "Relacione corretamente as sentenças abaixo:",
      pairs: [
        { left: "1011", right: "11" },
        { left: "1111", right: "15" },
        { left: "0110", right: "06" }
      ]
    },
    {
      type: "mc",
      text: "No sistema binário, a representação numérica 10 equivale qual dos valores abaixo?",
      options: ["1101", "1111", "1001", "Nenhum"],
      correctIndex: 3
    },
    {
      type: "tf",
      text: "O binário 1111 equivale a 15 em decimal.",
      correct: true
    }
  ],
  octal: [
    {
      type: "tf",
      text: "No sistema octal, o número 10 equivale ao valor decimal oito.",
      correct: true
    },
    {
      type: "mc",
      text: "Qual é o valor decimal do octal 17?",
      options: ["15", "17", "8", "Nenhum"],
      correctIndex: 0
    },
    {
      type: "match",
      text: "Relacione corretamente as sentenças abaixo:",
      pairs: [
        { left: "12", right: "10" },
        { left: "20", right: "16" },
        { left: "07", right: "07" }
      ]
    },
    {
      type: "mc",
      text: "No sistema octal, a representação numérica 10 equivale a qual valor abaixo?",
      options: ["8", "10", "2", "Nenhum"],
      correctIndex: 0
    },
    {
      type: "tf",
      text: "O octal 20 equivale a 16 em decimal.",
      correct: true
    }
  ]
};

const fase = blGetQueryParam("fase", "binarios");
const nivel = blGetQueryParam("nivel", "1");
const questions = QUESTION_BANK[fase] || QUESTION_BANK.binarios;

let currentIndex = 0;
let hearts = 3;
let stars = 0;
let locked = false; // trava input enquanto mostra feedback

const els = {
  faseLabel: document.getElementById("faseLabel"),
  levelTitle: document.getElementById("levelTitle"),
  progressBar: document.getElementById("progressBar"),
  heartsCount: document.getElementById("heartsCount"),
  starsCount: document.getElementById("starsCount"),
  questionNumber: document.getElementById("questionNumber"),
  questionText: document.getElementById("questionText"),
  optionsArea: document.getElementById("optionsArea")
};

function init() {
  els.faseLabel.textContent = fase === "octal" ? "Octal" : "Binários";
  els.levelTitle.textContent = "Nível " + nivel + " - Introdução " + (fase === "octal" ? "ao octal" : "aos binários");
  renderQuestion();
}

function updateHud() {
  els.heartsCount.textContent = hearts;
  els.starsCount.textContent = stars;
  const pct = (currentIndex / questions.length) * 100;
  els.progressBar.style.width = pct + "%";
}

function renderQuestion() {
  locked = false;
  const q = questions[currentIndex];
  updateHud();
  els.questionNumber.textContent = (currentIndex + 1) + ".";
  els.questionText.textContent = q.text;
  els.optionsArea.innerHTML = "";

  if (q.type === "tf") renderTrueFalse(q);
  else if (q.type === "mc") renderMultipleChoice(q);
  else if (q.type === "match") renderMatch(q);
}

function renderTrueFalse(q) {
  const wrap = document.createElement("div");
  wrap.className = "option-grid two-col";
  wrap.innerHTML =
    '<button class="opt-btn true-false-false" data-value="false">Falso</button>' +
    '<button class="opt-btn true-false-true" data-value="true">Verdadeiro</button>';

  wrap.addEventListener("click", function (e) {
    const btn = e.target.closest(".opt-btn");
    if (!btn || locked) return;
    const chosen = btn.dataset.value === "true";
    const isCorrect = chosen === q.correct;
    highlightTfFeedback(wrap, q, isCorrect);
    handleAnswer(isCorrect);
  });

  els.optionsArea.appendChild(wrap);
}

function highlightTfFeedback(wrap, q, isCorrect) {
  const correctBtn = wrap.querySelector('[data-value="' + q.correct + '"]');
  const wrongBtn = wrap.querySelector('[data-value="' + (!q.correct) + '"]');
  correctBtn.classList.add("correct");
  if (!isCorrect) wrongBtn.classList.add("wrong");
}

function renderMultipleChoice(q) {
  const wrap = document.createElement("div");
  wrap.className = "option-grid two-col";
  q.options.forEach(function (opt, idx) {
    const btn = document.createElement("button");
    btn.className = "opt-btn mc";
    btn.dataset.idx = idx;
    const letter = String.fromCharCode(97 + idx);
    btn.textContent = letter + ")  " + opt;
    wrap.appendChild(btn);
  });

  wrap.addEventListener("click", function (e) {
    const btn = e.target.closest(".opt-btn");
    if (!btn || locked) return;
    const idx = Number(btn.dataset.idx);
    const isCorrect = idx === q.correctIndex;
    btn.classList.add(isCorrect ? "correct" : "wrong");
    if (!isCorrect) {
      wrap.querySelector('[data-idx="' + q.correctIndex + '"]').classList.add("correct");
    }
    handleAnswer(isCorrect);
  });

  els.optionsArea.appendChild(wrap);
}

function renderMatch(q) {
  const wrap = document.createElement("div");
  wrap.className = "option-grid two-col";

  const leftItems = q.pairs.map(function (p, i) { return { text: p.left, pairId: i }; });
  const rightItems = shuffle(q.pairs.map(function (p, i) { return { text: p.right, pairId: i }; }));

  const leftCol = document.createElement("div");
  leftCol.className = "match-col";
  leftItems.forEach(function (item) {
    const el = document.createElement("div");
    el.className = "match-item";
    el.dataset.pairId = item.pairId;
    el.dataset.side = "left";
    el.textContent = item.text;
    leftCol.appendChild(el);
  });

  const rightCol = document.createElement("div");
  rightCol.className = "match-col";
  rightItems.forEach(function (item) {
    const el = document.createElement("div");
    el.className = "match-item";
    el.dataset.pairId = item.pairId;
    el.dataset.side = "right";
    el.textContent = item.text;
    rightCol.appendChild(el);
  });

  wrap.appendChild(leftCol);
  wrap.appendChild(rightCol);
  els.optionsArea.appendChild(wrap);

  let selectedLeft = null;
  let matchedCount = 0;
  const total = q.pairs.length;

  wrap.addEventListener("click", function (e) {
    const item = e.target.closest(".match-item");
    if (!item || locked) return;
    if (item.classList.contains("matched")) return;

    if (item.dataset.side === "left") {
      if (selectedLeft) selectedLeft.classList.remove("selected");
      selectedLeft = item;
      item.classList.add("selected");
      return;
    }

    // clicou em um item da direita
    if (!selectedLeft) return;

    if (selectedLeft.dataset.pairId === item.dataset.pairId) {
      selectedLeft.classList.remove("selected");
      selectedLeft.classList.add("matched");
      item.classList.add("matched");
      matchedCount++;
      selectedLeft = null;

      if (matchedCount === total) {
        handleAnswer(true);
      }
    } else {
      selectedLeft.classList.add("wrong-flash");
      item.classList.add("wrong-flash");
      hearts = Math.max(0, hearts - 1);
      updateHud();
      locked = true;
      setTimeout(function () {
        selectedLeft.classList.remove("selected", "wrong-flash");
        item.classList.remove("wrong-flash");
        selectedLeft = null;
        locked = false;
        if (hearts === 0) showGameOver();
      }, 550);
    }
  });
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function handleAnswer(isCorrect) {
  locked = true;
  if (isCorrect) {
    stars++;
  } else {
    hearts = Math.max(0, hearts - 1);
  }
  updateHud();

  setTimeout(function () {
    if (hearts === 0) {
      showGameOver();
      return;
    }
    currentIndex++;
    if (currentIndex >= questions.length) {
      showCompletion();
    } else {
      renderQuestion();
    }
  }, 700);
}

function showCompletion() {
  els.progressBar.style.width = "100%";
  const levelStars = Math.max(1, hearts);
  blCompleteLevel(fase, nivel, levelStars);

  document.getElementById("completionStars").textContent = levelStars;
  const modal = new bootstrap.Modal(document.getElementById("completionModal"), { backdrop: "static" });
  modal.show();
}

function showGameOver() {
  const modal = new bootstrap.Modal(document.getElementById("gameOverModal"), { backdrop: "static" });
  modal.show();
}

document.getElementById("btnVoltarNiveis").addEventListener("click", function () {
  window.location.href = "niveis.html?fase=" + fase;
});

document.getElementById("btnTentarNovamente").addEventListener("click", function () {
  window.location.reload();
});

init();
