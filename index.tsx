
import { createRoot } from 'react-dom/client';
import App from './App';
import './components/views/index.css';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { initPWA } from './services/pwaService';

const container = document.getElementById('root');

// PWAの初期化 (Service Worker登録 & インストールイベント待機)
initPWA();

const renderError = (el: HTMLElement, error: any) => {
  console.error("Critical Start Error:", error);
  el.innerHTML = `
    <div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center; background:#fdfbf7; font-family:sans-serif;">
      <div style="font-size:50px; margin-bottom:20px;">🍱</div>
      <h2 style="color:#F88D8D; font-weight:900;">アプリを起動できません</h2>
      <p style="color:#666; font-size:14px; margin-bottom:20px;">読み込み中にエラーが発生しました。ブラウザのキャッシュをクリアするか、再読み込みをお試しください。</p>
      <button onclick="window.location.reload()" style="background:#F88D8D; color:white; border:none; padding:12px 24px; border-radius:12px; font-weight:900;">再読み込み</button>
      <pre style="margin-top:20px; font-size:10px; color:#ccc; max-width:100%; overflow-x:auto;">${error?.message || 'Unknown code error'}</pre>
    </div>
  `;
};

if (container) {
  try {
    // PWA Elements initialization
    // StrictMode is removed to prevent Stencil component initialization errors ($instanceValues$)
    defineCustomElements(window);

    const root = createRoot(container);
    root.render(
      <App />
    );
  } catch (err) {
    renderError(container, err);
  }
}

// グローバルエラーの捕捉
window.addEventListener('error', (event) => {
  if (container && container.innerHTML === "") {
    renderError(container, event.error);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (container && container.innerHTML === "") {
    renderError(container, event.reason);
  }
});
