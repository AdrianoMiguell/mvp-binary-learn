/* ============================================
   Binary Learning — helpers compartilhados
   Guarda o progresso (estrelas / níveis completos)
   no localStorage, só pra dar uma sensação real
   de progresso nesse MVP. Nada de backend aqui.
   ============================================ */

const BL_STORAGE_KEY = "bl_progress_v1";

function blGetProgress() {
  const raw = localStorage.getItem(BL_STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { /* ignora e recria */ }
  }
  // Estado inicial: nível 1 desbloqueado, resto bloqueado
  const initial = {
    fases: {
      binarios: {
        niveis: {
          1: { unlocked: true, stars: 0, completed: false },
          2: { unlocked: false, stars: 0, completed: false },
          3: { unlocked: false, stars: 0, completed: false },
          4: { unlocked: false, stars: 0, completed: false }
        }
      },
      octal: {
        niveis: {
          1: { unlocked: true, stars: 0, completed: false },
          2: { unlocked: false, stars: 0, completed: false },
          3: { unlocked: false, stars: 0, completed: false },
          4: { unlocked: false, stars: 0, completed: false }
        }
      }
    }
  };
  localStorage.setItem(BL_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function blSaveProgress(progress) {
  localStorage.setItem(BL_STORAGE_KEY, JSON.stringify(progress));
}

function blCompleteLevel(fase, nivel, stars) {
  const progress = blGetProgress();
  const niveis = progress.fases[fase].niveis;
  niveis[nivel].completed = true;
  niveis[nivel].stars = Math.max(niveis[nivel].stars || 0, stars);
  const next = Number(nivel) + 1;
  if (niveis[next]) niveis[next].unlocked = true;
  blSaveProgress(progress);
}

function blGetQueryParam(name, fallback) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || fallback;
}

function blLogout(e) {
  e.preventDefault();
  if (confirm("Deseja realmente sair?")) {
    window.location.href = "index.html";
  }
}
