const EFFECTS = {
  comicSans: {
    name: 'Comic Sans',
    icon: '🔤',
    enable() {
      const s = document.createElement('style');
      s.id = 'chaos-comic-sans';
      s.textContent = '* { font-family: "Comic Sans MS", "Comic Sans", cursive !important; }';
      document.head.appendChild(s);
    },
    disable() {
      document.getElementById('chaos-comic-sans')?.remove();
    }
  },

  upsideDown: {
    name: 'Upside Down',
    icon: '🙃',
    enable() {
      document.documentElement.style.transition = 'transform 0.6s ease';
      document.documentElement.style.transform = 'rotate(180deg)';
    },
    disable() {
      document.documentElement.style.transform = '';
      document.documentElement.style.transition = '';
    }
  },

  shake: {
    name: 'Shake',
    icon: '📳',
    enable(intensity) {
      const ratio = [0.1, 0.25, 0.4, 0.6, 0.8][intensity - 1] || 0.3;
      const targets = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, img, button, a, li');
      targets.forEach(el => {
        if (Math.random() < ratio) el.classList.add('chaos-shake');
      });
    },
    disable() {
      document.querySelectorAll('.chaos-shake').forEach(el => el.classList.remove('chaos-shake'));
    }
  },

  emojiTrail: {
    name: 'Emoji Trail',
    icon: '🌟',
    _handler: null,
    enable(intensity) {
      const emojis = ['🌟', '✨', '🔥', '💫', '⭐', '🎉', '💥', '👾', '🤖', '👻', '🦄', '🌈', '🍕', '🎮', '💀', '👽', '🤡', '🎪'];
      const throttle = Math.max(40, 160 - intensity * 25);
      let last = 0;
      this._handler = (e) => {
        const now = Date.now();
        if (now - last < throttle) return;
        last = now;
        const el = document.createElement('div');
        el.className = 'chaos-emoji';
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.left = (e.clientX - 14) + 'px';
        el.style.top = (e.clientY - 14) + 'px';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1200);
      };
      document.addEventListener('mousemove', this._handler);
    },
    disable() {
      if (this._handler) {
        document.removeEventListener('mousemove', this._handler);
        this._handler = null;
      }
      document.querySelectorAll('.chaos-emoji').forEach(el => el.remove());
    }
  },

  rainbow: {
    name: 'Rainbow',
    icon: '🌈',
    enable(intensity) {
      const ratio = [0.2, 0.35, 0.5, 0.7, 0.9][intensity - 1] || 0.4;
      const targets = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, li, label, strong, em');
      targets.forEach(el => {
        if (Math.random() < ratio) el.classList.add('chaos-rainbow');
      });
    },
    disable() {
      document.querySelectorAll('.chaos-rainbow').forEach(el => el.classList.remove('chaos-rainbow'));
    }
  },

  spin: {
    name: 'Spin',
    icon: '🌀',
    enable(intensity) {
      const ratio = [0.1, 0.2, 0.3, 0.5, 0.7][intensity - 1] || 0.2;
      const targets = document.querySelectorAll('img, button, article, .card, div[class*=card], div[class*=box]');
      targets.forEach(el => {
        if (Math.random() < ratio) el.classList.add('chaos-spin');
      });
    },
    disable() {
      document.querySelectorAll('.chaos-spin').forEach(el => el.classList.remove('chaos-spin'));
    }
  },

  blur: {
    name: 'Blur',
    icon: '🌫️',
    enable(intensity) {
      const ratio = [0.1, 0.2, 0.3, 0.5, 0.65][intensity - 1] || 0.2;
      const targets = document.querySelectorAll('p, img, div, section, article, li');
      targets.forEach(el => {
        if (Math.random() < ratio) el.classList.add('chaos-blur');
      });
    },
    disable() {
      document.querySelectorAll('.chaos-blur').forEach(el => el.classList.remove('chaos-blur'));
    }
  }
};

let activeEffects = {};
let currentIntensity = 3;

function getState() {
  const effects = {};
  for (const [key, ef] of Object.entries(EFFECTS)) {
    effects[key] = { enabled: !!activeEffects[key], name: ef.name, icon: ef.icon };
  }
  return { effects, intensity: currentIntensity };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {
    case 'GET_STATE':
      sendResponse(getState());
      break;
    case 'TOGGLE_EFFECT':
      if (msg.enabled && !activeEffects[msg.effect]) {
        EFFECTS[msg.effect].enable(currentIntensity);
        activeEffects[msg.effect] = true;
      } else if (!msg.enabled && activeEffects[msg.effect]) {
        EFFECTS[msg.effect].disable();
        delete activeEffects[msg.effect];
      }
      sendResponse(getState());
      break;
    case 'CHAOS_TOTAL':
      for (const key of Object.keys(EFFECTS)) {
        if (!activeEffects[key]) {
          EFFECTS[key].enable(currentIntensity);
          activeEffects[key] = true;
        }
      }
      sendResponse(getState());
      break;
    case 'STOP_ALL':
      for (const key of Object.keys(activeEffects)) {
        EFFECTS[key].disable();
      }
      activeEffects = {};
      sendResponse(getState());
      break;
    case 'SET_INTENSITY':
      currentIntensity = Math.max(1, Math.min(5, msg.intensity));
      sendResponse(getState());
      break;
  }
  return true;
});
