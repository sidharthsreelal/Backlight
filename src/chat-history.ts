export interface ChatEntry {
    id: string;
    timestamp: string;
    mood: string;
    messages: { role: 'user' | 'assistant'; text: string }[];
}

const CHAT_KEY = 'backlight_chat_history';

export function getChatHistories(): ChatEntry[] {
    try {
        return JSON.parse(localStorage.getItem(CHAT_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveAll(entries: ChatEntry[]): void {
    localStorage.setItem(CHAT_KEY, JSON.stringify(entries));
}

export function saveChatHistory(entry: ChatEntry): void {
    const all = getChatHistories();
    const idx = all.findIndex(e => e.id === entry.id);
    if (idx >= 0) {
        all[idx] = entry;
    } else {
        all.unshift(entry);
    }
    if (all.length > 30) all.length = 30;
    saveAll(all);
}

export function deleteChatHistory(id: string): void {
    saveAll(getChatHistories().filter(e => e.id !== id));
}
