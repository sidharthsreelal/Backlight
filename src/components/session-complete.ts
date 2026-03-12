import { getCurrentWindow } from '@tauri-apps/api/window';

const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
  { text: "I learned that courage was not the absence of fear, but the triumph over it.", author: "Nelson Mandela" },
  { text: "There is only one thing that makes a dream impossible to achieve: the fear of failure.", author: "Paulo Coelho" },
  { text: "It's not whether you get knocked down, it's whether you get up.", author: "Vince Lombardi" },
  { text: "People who are crazy enough to think they can change the world, are the ones who do.", author: "Rob Siltanen" },
  { text: "We may encounter many defeats but we must not be defeated.", author: "Maya Angelou" },
  { text: "Knowing is not enough; we must apply. Wishing is not enough; we must do.", author: "Johann Wolfgang Von Goethe" },
  { text: "Whether you think you can or think you can't, you're right.", author: "Henry Ford" },
  { text: "Security is mostly a superstition. Life is either a daring adventure or nothing.", author: "Helen Keller" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
  { text: "Do what you can with all you have, wherever you are.", author: "Theodore Roosevelt" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "Today's accomplishments were yesterday's impossibilities.", author: "Robert H. Schuller" },
  { text: "The only way to achieve the impossible is to believe it is possible.", author: "Charles Kingsleigh" },
  { text: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
  { text: "You learn more from failure than from success. Don't let it stop you.", author: "Unknown" },
  { text: "Either you run the day or the day runs you.", author: "Jim Rohn" },
  { text: "When we strive to become better than we are, everything around us becomes better too.", author: "Paulo Coelho" },
  { text: "Opportunity is missed by most people because it is dressed in overalls and looks like work.", author: "Thomas Edison" },
  { text: "Don't wish it were easier. Wish you were better.", author: "Jim Rohn" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
  { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
  { text: "Whatever you do, do with all your might.", author: "Marcus Tullius Cicero" },
  { text: "Nothing is impossible. The word itself says 'I'm possible!'", author: "Audrey Hepburn" },
  { text: "Try not to become a man of success. Rather become a man of value.", author: "Albert Einstein" },
  { text: "Stop chasing the money and start chasing the passion.", author: "Tony Hsieh" },
  { text: "The pessimist sees difficulty in every opportunity. The optimist sees opportunity in every difficulty.", author: "Winston Churchill" },
  { text: "If you really want to do something, you'll find a way. If you don't, you'll find an excuse.", author: "Jim Rohn" },
  { text: "Great things are done by a series of small things brought together.", author: "Vincent Van Gogh" },
  { text: "It is never too late to be what you might have been.", author: "George Eliot" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "A goal is a dream with a deadline.", author: "Napoleon Hill" },
  { text: "We become what we think about.", author: "Earl Nightingale" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "Eighty percent of success is showing up.", author: "Woody Allen" },
  { text: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen Covey" },
  { text: "You can never cross the ocean until you have the courage to lose sight of the shore.", author: "Christopher Columbus" },
  { text: "Whatever the mind of man can conceive and believe, it can achieve.", author: "Napoleon Hill" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Invest in your dreams. Grind now. Shine later.", author: "Unknown" },
];

function randomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

/**
 * Shows the session-complete overlay with animated checkmark and motivational quote.
 * - X button to manually close
 * - Auto-minimizes the app after 10 seconds
 * - Auto-closes after 60 seconds
 * - Calls onClose when dismissed (either way)
 */
export function showSessionComplete(container: HTMLElement, onClose: () => void): void {
  const quote = randomQuote();
  let minimizeTimer: ReturnType<typeof setTimeout> | null = null;
  let autoCloseTimer: ReturnType<typeof setTimeout> | null = null;

  const overlay = document.createElement('div');
  overlay.className = 'session-complete-overlay';
  overlay.innerHTML = `
    <button class="session-complete-close" title="Close">✕</button>
    <div class="session-complete-content">
      <svg class="checkmark-svg" viewBox="0 0 100 100">
        <circle class="checkmark-circle" cx="50" cy="50" r="45"
          fill="none" stroke="url(#checkGrad)" stroke-width="3"/>
        <path class="checkmark-check" d="M30 50 L45 65 L72 35"
          fill="none" stroke="url(#checkGrad)" stroke-width="4"
          stroke-linecap="round" stroke-linejoin="round"/>
        <defs>
          <linearGradient id="checkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:var(--accent-blue)"/>
            <stop offset="100%" style="stop-color:var(--accent-teal)"/>
          </linearGradient>
        </defs>
      </svg>
      <p class="session-quote">"${quote.text}"</p>
      <p class="session-quote-author">— ${quote.author}</p>
    </div>
  `;

  container.appendChild(overlay);

  function cleanup() {
    if (minimizeTimer) clearTimeout(minimizeTimer);
    if (autoCloseTimer) clearTimeout(autoCloseTimer);
    overlay.remove();
    onClose();
  }

  // X button
  overlay.querySelector('.session-complete-close')!.addEventListener('click', cleanup);

  // Minimize app after 10 seconds
  minimizeTimer = setTimeout(async () => {
    try {
      await getCurrentWindow().hide();
    } catch (e) {
      console.warn('Could not minimize:', e);
    }
  }, 10000);

  // Auto-close after 60 seconds and go back to mood
  autoCloseTimer = setTimeout(cleanup, 60000);
}
