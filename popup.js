let currentTabId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tabs[0]) return showError('Aucun onglet actif');

  currentTabId = tabs[0].id;

  try {
    const state = await chrome.tabs.sendMessage(currentTabId, { type: 'GET_STATE' });
    buildUI(state);
  } catch {
    showError('Oups ! Essaie sur une page web normale (pas chrome://)');
  }
});

function buildUI(state) {
  const list = document.getElementById('effectsList');
  list.innerHTML = '';

  for (const [key, ef] of Object.entries(state.effects)) {
    const item = document.createElement('div');
    item.className = 'effect-item' + (ef.enabled ? ' enabled' : '');
    item.dataset.effect = key;

    item.innerHTML = `
      <span class="icon">${ef.icon}</span>
      <span class="name">${ef.name}</span>
      <div class="toggle${ef.enabled ? ' active' : ''}"></div>
    `;

    item.addEventListener('click', async () => {
      const newState = !ef.enabled;
      try {
        const res = await chrome.tabs.sendMessage(currentTabId, {
          type: 'TOGGLE_EFFECT',
          effect: key,
          enabled: newState
        });
        ef.enabled = newState;
        item.className = 'effect-item' + (newState ? ' enabled' : '');
        item.querySelector('.toggle').className = 'toggle' + (newState ? ' active' : '');
      } catch {
        showError('Erreur de communication');
      }
    });

    list.appendChild(item);
  }

  const intensitySlider = document.getElementById('intensitySlider');
  intensitySlider.value = state.intensity;
  document.getElementById('intensityLabel').textContent = `${state.intensity} / 5`;

  intensitySlider.addEventListener('input', async () => {
    const val = parseInt(intensitySlider.value);
    document.getElementById('intensityLabel').textContent = `${val} / 5`;
    try {
      await chrome.tabs.sendMessage(currentTabId, { type: 'SET_INTENSITY', intensity: val });
    } catch {}
  });

  document.getElementById('chaosTotal').addEventListener('click', async () => {
    try {
      const res = await chrome.tabs.sendMessage(currentTabId, { type: 'CHAOS_TOTAL' });
      buildUI(res);
    } catch {}
  });

  document.getElementById('stopAll').addEventListener('click', async () => {
    try {
      const res = await chrome.tabs.sendMessage(currentTabId, { type: 'STOP_ALL' });
      buildUI(res);
    } catch {}
  });
}

function showError(msg) {
  document.getElementById('effectsList').innerHTML = `<div class="error">${msg}</div>`;
}

document.getElementById('reportLink')?.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: 'https://github.com/tonpseudo/chaos-mode/issues' });
});

document.getElementById('githubLink')?.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: 'https://github.com/tonpseudo/chaos-mode' });
});
