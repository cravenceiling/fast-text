import { FastTextPlayer, type FastTextDisplay } from "./rsvp";

let player: FastTextPlayer | null = null;
let floatingWindow: HTMLElement | null = null;
let isVisible: boolean = false;
let isFullscreen: boolean = false;

function createFloatingWindow(): HTMLElement {
  const container = document.createElement("div");
  container.id = "fast-text-floating-window";
  container.innerHTML = `
    <style>
      #fast-text-floating-window {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 600px;
        max-width: 95vw;
        background: #000000;
        border: 2px solid #333;
        border-radius: 16px;
        padding: 24px;
        z-index: 2147483647;
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', monospace;
        box-shadow: 0 16px 64px rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        gap: 20px;
        transition: all 0.3s ease;
      }
      #fast-text-floating-window.fast-text-fullscreen {
        top: 0;
        left: 0;
        transform: none;
        width: 100vw;
        height: 100vh;
        max-width: none;
        max-height: none;
        border-radius: 0;
        padding: 40px 80px;
      }
      #fast-text-floating-window * {
        box-sizing: border-box;
      }
      #fast-text-header {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      #fast-text-close-btn, #fast-text-fullscreen-btn {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        border: none;
        background: #222;
        color: #888;
        font-size: 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
      }
      #fast-text-close-btn:hover, #fast-text-fullscreen-btn:hover {
        background: #333;
        color: #fff;
      }
      #fast-text-body {
        display: flex;
        flex-direction: column;
        gap: 16px;
        flex: 1;
      }
      #fast-text-progress-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      #fast-text-progress {
        width: 100%;
        height: 6px;
        background: #222;
        border-radius: 3px;
        overflow: hidden;
      }
      #fast-text-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #ff4444, #ff6666);
        width: 0%;
        transition: width 0.1s linear;
      }
      #fast-text-word-counter {
        text-align: right;
        color: #555;
        font-size: 12px;
      }
       #fast-text-display {
         text-align: center;
         font-size: 30px;
         line-height: 1.1;
         color: #ffffff;
         min-height: 80px;
         display: flex;
         justify-content: center;
         align-items: center;
         user-select: none;
         flex: 1;
         position: relative;
         flex-direction: column;
         gap: 0;
       }
       #fast-text-display-inner {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }
        #fast-text-word-container {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          padding-top: 10px;
          padding-bottom: 10px;
          width: 100%;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', monospace;
        }
        #fast-text-anchor {
          color: #ff4444;
          font-weight: bold;
          display: inline;
          z-index: 2;
        }
        #fast-text-before, #fast-text-after {
          display: inline;
        }
           .fast-text-guideline {
             position: absolute;
             left: 50%;
             transform: translateX(-50%);
             width: 3px;
             background-color: #ff4444;
             pointer-events: none;
             z-index: 1;
           }
           .fast-text-guideline-top {
             top: -20px;
             height: 20px;
           }
           .fast-text-guideline-top::before {
             content: '';
             position: absolute;
             bottom: 0;
             left: 50%;
             transform: translateX(-50%);
             height: 4px;
             background-color: #222;
             width: 256px;
           }
           .fast-text-guideline-bottom {
             bottom: -20px;
             height: 20px;
           }
           .fast-text-guideline-bottom::before {
             content: '';
             position: absolute;
             top: 0;
             left: 50%;
             transform: translateX(-50%);
             height: 4px;
             background-color: #222;
             width: 256px;
           }
        #fast-text-anchor {
          color: #ff4444;
          font-weight: bold;
          display: inline;
          z-index: 2;
        }
        #fast-text-before, #fast-text-after {
          display: inline;
        }
       #fast-text-floating-window.fast-text-fullscreen #fast-text-display {
         font-size: 48px;
         min-height: 140px;
       }
      #fast-text-controls {
        display: flex;
        gap: 16px;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
      }
      #fast-text-play-btn {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: none;
        background: #ffffff;
        color: #000000;
        font-size: 28px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.15s ease, opacity 0.15s ease;
      }
      #fast-text-play-btn:hover {
        transform: scale(1.05);
        opacity: 0.9;
      }
      #fast-text-play-btn:active {
        transform: scale(0.95);
      }
      #fast-text-speed-control {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #888;
        font-size: 16px;
      }
      #fast-text-speed-slider {
        width: 150px;
        accent-color: #ff4444;
        cursor: pointer;
      }
      #fast-text-instructions {
        text-align: center;
        color: #444;
        font-size: 14px;
        padding: 12px;
        background: #111;
        border-radius: 8px;
        line-height: 1.5;
      }
      .fast-text-hidden {
        display: none !important;
      }
    </style>
    <div id="fast-text-header">
      <button id="fast-text-fullscreen-btn" title="Fullscreen (F)">⛶</button>
      <button id="fast-text-close-btn" title="Close (Esc)">&times;</button>
    </div>
    <div id="fast-text-body">
      <div id="fast-text-progress-section">
        <div id="fast-text-progress">
          <div id="fast-text-progress-bar"></div>
        </div>
        <div id="fast-text-word-counter"></div>
      </div>
        <div id="fast-text-display">
           <div id="fast-text-word-container">
            <span id="fast-text-placeholder">No text selected</span>
          </div>
        </div>
      <div id="fast-text-controls">
        <button id="fast-text-play-btn">▶</button>
        <div id="fast-text-speed-control">
          <span id="fast-text-wpm-display">300 WPM</span>
          <input type="range" id="fast-text-speed-slider" min="60" max="1000" value="300" step="10">
        </div>
      </div>
    </div>
  `;
  return container;
}

function showFloatingWindow(text: string): void {
  if (floatingWindow) {
    floatingWindow.remove();
  }

  floatingWindow = createFloatingWindow();
  document.body.appendChild(floatingWindow);
  isVisible = true;
  isFullscreen = false;

  player = new FastTextPlayer(
    renderDisplay,
    onComplete,
    { wordsPerMinute: 300 }
  );
  player.load(text);

  setupEventListeners();
  player.renderCurrent();
}

function renderDisplay(display: FastTextDisplay): void {
  if (!floatingWindow) return;

  const wordContainer = floatingWindow.querySelector("#fast-text-word-container") as HTMLElement;
  const progressBar = floatingWindow.querySelector("#fast-text-progress-bar") as HTMLElement;
  const wordCounter = floatingWindow.querySelector("#fast-text-word-counter") as HTMLElement;

  if (display.anchor === "" && display.before === "" && display.after === "") {
    wordContainer.innerHTML = `<span id="fast-text-placeholder">No text selected</span>`;
  } else {
    wordContainer.innerHTML = `
      <div class="fast-text-guideline fast-text-guideline-top"></div>
      <span id="fast-text-before">${escapeHtml(display.before)}</span><span id="fast-text-anchor">${escapeHtml(display.anchor)}</span><span id="fast-text-after">${escapeHtml(display.after)}</span>
      <div class="fast-text-guideline fast-text-guideline-bottom"></div>
    `;

    requestAnimationFrame(() => {
      const beforeSpan = wordContainer.querySelector("#fast-text-before") as HTMLElement;
      const afterSpan = wordContainer.querySelector("#fast-text-after") as HTMLElement;
      const anchorSpan = wordContainer.querySelector("#fast-text-anchor") as HTMLElement;

      if (beforeSpan && afterSpan && anchorSpan) {
        const beforeWidth = beforeSpan.offsetWidth;
        const afterWidth = afterSpan.offsetWidth;
        const anchorWidth = anchorSpan.offsetWidth;
        const containerWidth = wordContainer.offsetWidth;

        const beforeOffset = Math.max(0, (containerWidth / 2) - (anchorWidth / 2) - beforeWidth - 4);
        const afterOffset = Math.max(0, (containerWidth / 2) + (anchorWidth / 2) + 4);

        beforeSpan.style.position = 'absolute';
        beforeSpan.style.left = `${beforeOffset}px`;

        afterSpan.style.position = 'absolute';
        afterSpan.style.left = `${afterOffset}px`;
      }
    });
  }

  progressBar.style.width = `${display.progress}%`;
  wordCounter.textContent = `${display.currentWord} / ${display.totalWords} words`;
}

function onComplete(): void {
  if (!floatingWindow) return;
  const playBtn = floatingWindow.querySelector("#fast-text-play-btn") as HTMLButtonElement;
  playBtn.textContent = "▶";
  const instructions = floatingWindow.querySelector("#fast-text-instructions") as HTMLElement;
  if (instructions) {
    instructions.textContent = "Reading complete! Select new text or replay.";
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function toggleFullscreen(): void {
  if (!floatingWindow) return;
  isFullscreen = !isFullscreen;
  floatingWindow.classList.toggle("fast-text-fullscreen", isFullscreen);
}

function setupEventListeners(): void {
  if (!floatingWindow) return;

  const closeBtn = floatingWindow.querySelector("#fast-text-close-btn") as HTMLButtonElement;
  const fullscreenBtn = floatingWindow.querySelector("#fast-text-fullscreen-btn") as HTMLButtonElement;
  const playBtn = floatingWindow.querySelector("#fast-text-play-btn") as HTMLButtonElement;
  const speedSlider = floatingWindow.querySelector("#fast-text-speed-slider") as HTMLInputElement;
  const wpmDisplay = floatingWindow.querySelector("#fast-text-wpm-display") as HTMLElement;

  closeBtn.addEventListener("click", (e: Event) => {
    e.stopPropagation();
    closeWindow();
  });

  fullscreenBtn.addEventListener("click", (e: Event) => {
    e.stopPropagation();
    toggleFullscreen();
  });

  playBtn.addEventListener("click", (e: Event) => {
    e.stopPropagation();
    if (player) {
      player.toggle();
      playBtn.textContent = player.getIsPlaying() ? "⏸" : "▶";
      const instructions = floatingWindow?.querySelector("#fast-text-instructions") as HTMLElement;
      if (instructions) {
        instructions.classList.add("fast-text-hidden");
      }
    }
  });

  speedSlider.addEventListener("input", (e: Event) => {
    e.stopPropagation();
    const target = e.target as HTMLInputElement;
    const wpm = parseInt(target.value);
    if (player) {
      player.setWPM(wpm);
      wpmDisplay.textContent = `${wpm} WPM`;
    }
  });

  floatingWindow.addEventListener("click", (e: Event) => {
    e.stopPropagation();
  });

  document.addEventListener("keydown", handleKeydown);

  document.addEventListener("click", handleOutsideClick);
}

function handleKeydown(e: KeyboardEvent): void {
  if (!isVisible || !floatingWindow) return;

  if (e.key === " " || e.key === "k") {
    e.preventDefault();
    if (player) {
      player.toggle();
      const playBtn = floatingWindow.querySelector("#fast-text-play-btn") as HTMLButtonElement;
      if (playBtn) {
        playBtn.textContent = player.getIsPlaying() ? "⏸" : "▶";
      }
    }
  } else if (e.key === "Escape") {
    if (isFullscreen) {
      toggleFullscreen();
    } else {
      closeWindow();
    }
  } else if (e.key === "f" || e.key === "F") {
    toggleFullscreen();
  }
}

function handleOutsideClick(e: MouseEvent): void {
  if (floatingWindow && !floatingWindow.contains(e.target as Node)) {
    return;
  }
}

function closeWindow(): void {
  if (player) {
    player.pause();
    player = null;
  }
  if (floatingWindow) {
    floatingWindow.remove();
    floatingWindow = null;
  }
  isVisible = false;
  isFullscreen = false;
  document.removeEventListener("click", handleOutsideClick);
  document.removeEventListener("keydown", handleKeydown);
}

function getSelectedText(): string {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return "";
  return selection.toString().trim();
}

function handleMessage(
  message: { type: string; text?: string }, 
  _sender: unknown, 
  sendResponse: (response?: Record<string, unknown>) => void,
): void {
  if (message.type === "FAST_TEXT_OPEN") {
    const text = message.text || getSelectedText();
    if (text && text.length > 0) {
      showFloatingWindow(text);
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: "No text selected" });
    }
  } else if (message.type === "FAST_TEXT_TOGGLE") {
    if (isVisible && player) {
      player.toggle();
      const playBtn = floatingWindow?.querySelector("#fast-text-play-btn") as HTMLButtonElement;
      if (playBtn) {
        playBtn.textContent = player.getIsPlaying() ? "⏸" : "▶";
      }
      sendResponse({ success: true, isPlaying: player.getIsPlaying() });
    } else {
      const text = getSelectedText();
      if (text) {
        showFloatingWindow(text);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: "No text selected" });
      }
    }
  } else if (message.type === "FAST_TEXT_CLOSE") {
    closeWindow();
    sendResponse({ success: true });
  }
}

declare const chrome: {
  runtime: {
    onMessage: {
      addListener: (callback: (message: { type: string; text?: string }, sender: unknown, sendResponse: (response?: Record<string, unknown>) => void) => void) => void;
    };
  };
};

if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener(handleMessage);
}
