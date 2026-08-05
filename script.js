// Estado compartilhado para armazenar as escolhas do usuário
const state = {
  dateType: "",
  location: "",
  contact: ""
};

// Seletores de elementos principais
const screens = document.querySelectorAll(".screen");
const primaryButtons = document.querySelectorAll("[data-target]");
const optionCards = document.querySelectorAll(".option-card");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const sendBtn = document.getElementById("sendBtn");
const contactInput = document.getElementById("contactInput");
const summaryText = document.getElementById("summaryText");

let yesScale = 1;

// Mostra apenas a tela correspondente ao número informado
function showScreen(screenNumber) {
  screens.forEach((screen) => screen.classList.remove("active"));
  const target = document.getElementById(`screen-${screenNumber}`);
  if (target) target.classList.add("active");
}

// Navegação de botões com atributo data-target
primaryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const next = Number(button.dataset.target);
    showScreen(next);
  });
});

// Seleção de cards de opções
optionCards.forEach((card) => {
  card.addEventListener("click", () => {
    const chosen = card.dataset.choice;
    const next = Number(card.dataset.next);

    if (card.closest("#screen-4")) state.dateType = chosen;
    if (card.closest("#screen-5")) state.location = chosen;

    document.querySelectorAll(".option-card").forEach((item) => item.classList.remove("selected"));
    card.classList.add("selected");
    showScreen(next);
  });
});

// Posiciona o botão "Não" sempre ao lado do botão "Sim", sem ficar por cima
function setNoButtonSidePosition() {
  const screen2 = document.getElementById("screen-2");
  const screenRect = screen2.getBoundingClientRect();
  const yesRect = yesBtn.getBoundingClientRect();

  const offsetX = 24;
  const targetX = yesRect.left - screenRect.left + yesRect.width + offsetX;
  const targetY = yesRect.top - screenRect.top + yesRect.height / 2 - noBtn.offsetHeight / 2;

  const maxX = screenRect.width - noBtn.offsetWidth - 16;
  const maxY = screenRect.height - noBtn.offsetHeight - 16;

  const x = Math.min(Math.max(targetX, 16), maxX);
  const y = Math.min(Math.max(targetY, 16), maxY);

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

// Aumenta o botão "Sim" sempre que o usuário tenta clicar no "Não"
function growYesButton() {
  yesScale += 0.1;
  yesBtn.style.transform = `scale(${yesScale})`;
}

noBtn.addEventListener("mouseenter", () => {
  setNoButtonSidePosition();
});

noBtn.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  setNoButtonSidePosition();
  growYesButton();
});

yesBtn.addEventListener("click", () => {
  showScreen(3);
});

// Envia os dados para a API do SheetMonkey e mostra a tela de confirmação
sendBtn.addEventListener("click", async () => {
  state.contact = contactInput.value.trim() || "Sem contato informado";
  summaryText.textContent = `Date: ${state.dateType} | Local: ${state.location} | Contato: ${state.contact}`;

  const formBody = new URLSearchParams();
  formBody.append("Date", state.dateType);
  formBody.append("Local", state.location);
  formBody.append("Contato", state.contact);
  formBody.append("Created", "x-sheetmonkey-current-date-time");

  try {
    await fetch("https://api.sheetmonkey.io/form/uuANJFnxtU2K4XNUoGDtWv", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formBody.toString()
    });
  } catch (error) {
    console.warn("Erro ao enviar para Sheet Monkey:", error);
  }

  showScreen(7);
});

window.addEventListener("load", () => {
  showScreen(1);
  setNoButtonSidePosition();
});
