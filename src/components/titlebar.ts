import { getCurrentWindow } from '@tauri-apps/api/window';

export type MenuAction = 'history' | 'artist-prefs' | 'liked-songs' | 'chat-history' | 'profile';

export function createTitlebar(onMenuAction: (action: MenuAction) => void): HTMLElement {
  const titlebar = document.createElement('div');
  titlebar.className = 'titlebar';

  titlebar.innerHTML = `
    <div class="titlebar-left">
      <img class="titlebar-icon settings-menu-btn" src="/app-icon-small.png" alt="Menu" title="Menu" />
      <div class="titlebar-title">Backlight</div>
      <div class="settings-dropdown hidden">
        <button class="settings-dropdown-item" data-action="history">Session History</button>
        <button class="settings-dropdown-item" data-action="chat-history">Chat History</button>
        <button class="settings-dropdown-item" data-action="artist-prefs">Artist Preferences</button>
        <button class="settings-dropdown-item" data-action="liked-songs">Liked Songs</button>
        <button class="settings-dropdown-item" data-action="profile">My Profile</button>
      </div>
    </div>
    <div class="titlebar-controls">
      <button class="titlebar-btn minimize" title="Minimize to tray">─</button>
      <button class="titlebar-btn close" title="Close">✕</button>
    </div>
  `;

  const appWindow = getCurrentWindow();

  titlebar.querySelector('.minimize')!.addEventListener('click', () => {
    appWindow.hide();
  });

  titlebar.querySelector('.close')!.addEventListener('click', () => {
    appWindow.hide();
  });

  // Settings dropdown
  const menuBtn = titlebar.querySelector('.settings-menu-btn')!;
  const dropdown = titlebar.querySelector('.settings-dropdown')!;

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    dropdown.classList.add('hidden');
  });

  dropdown.querySelectorAll('.settings-dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.add('hidden');
      const action = (item as HTMLElement).dataset.action as MenuAction;
      onMenuAction(action);
    });
  });

  return titlebar;
}
