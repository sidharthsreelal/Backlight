import { getChatHistories, deleteChatHistory, type ChatEntry } from '../chat-history';
import { formatSessionTime } from '../sessions';

export function renderChatHistoryOverlay(onClose: () => void): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'session-log-overlay';

    function render() {
        const chats = getChatHistories();

        overlay.innerHTML = `
        <div class="session-log-panel">
          <div class="session-log-header">
            <h3>Chat History</h3>
            <button class="session-log-close">✕</button>
          </div>
          <div class="session-log-list">
            ${chats.length === 0
                ? '<div class="session-log-empty">No chats yet. Start a conversation to see it here.</div>'
                : chats.map(c => `
                <div class="chat-history-item" data-id="${c.id}">
                  <div class="chat-history-row">
                    <div class="chat-history-preview">
                      <div class="session-log-time">${formatSessionTime(c.timestamp)}</div>
                      <div class="chat-history-first-msg">${escapeHtml(getFirstUserMessage(c))}</div>
                    </div>
                    <button class="chat-history-delete" data-id="${c.id}" title="Delete">✕</button>
                  </div>
                  <div class="chat-history-expanded hidden" data-expand="${c.id}">
                    ${c.messages.map(m => `
                      <div class="chat-history-msg ${m.role}">
                        <span class="chat-history-role">${m.role === 'user' ? 'You' : 'Backlight'}</span>
                        <span>${escapeHtml(m.text)}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')
            }
          </div>
        </div>
      `;

        overlay.querySelector('.session-log-close')!.addEventListener('click', onClose);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) onClose();
        });

        // Toggle expand on row click
        overlay.querySelectorAll('.chat-history-row').forEach(row => {
            row.addEventListener('click', (e) => {
                if ((e.target as HTMLElement).classList.contains('chat-history-delete')) return;
                const item = row.closest('.chat-history-item') as HTMLElement;
                const id = item.dataset.id!;
                const expanded = overlay.querySelector(`[data-expand="${id}"]`) as HTMLElement;
                expanded.classList.toggle('hidden');
            });
        });

        // Delete buttons
        overlay.querySelectorAll('.chat-history-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = (btn as HTMLElement).dataset.id!;
                deleteChatHistory(id);
                render();
            });
        });
    }

    render();
    return overlay;
}

function getFirstUserMessage(chat: ChatEntry): string {
    const msg = chat.messages.find(m => m.role === 'user');
    if (!msg) return 'Empty conversation';
    return msg.text.length > 60 ? msg.text.slice(0, 60) + '…' : msg.text;
}

function escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
