import { showSessionComplete } from '../components/session-complete';

export function renderBreathingScreen(onBack: () => void, onSessionEnd: () => void): HTMLElement {
  const screen = document.createElement('div');
  screen.className = 'screen';

  // Step 1: Show start screen
  screen.innerHTML = `
    <button class="back-btn">← Back</button>
    <div class="breathing-container">
      <div class="breathing-circle-wrapper" style="cursor: pointer;">
        <div class="breathing-circle">
          <span class="breathing-timer" style="font-size: 32px;">START</span>
        </div>
      </div>
      <div class="breathing-info">
        <div class="phase-label">4-7-8 Breathing</div>
        <div class="phase-desc">Click the circle to begin</div>
      </div>
    </div>
  `;

  let intervalId: ReturnType<typeof setInterval> | null = null;
  let running = false;

  function cleanup() {
    running = false;
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
  }

  function startCountdown() {
    if (running) return;
    const timerEl = screen.querySelector('.breathing-timer') as HTMLElement;
    const phaseLabel = screen.querySelector('.phase-label') as HTMLElement;
    const phaseDesc = screen.querySelector('.phase-desc') as HTMLElement;
    const wrapper = screen.querySelector('.breathing-circle-wrapper') as HTMLElement;
    wrapper.style.cursor = 'default';
    timerEl.style.fontSize = ''; // Reset to default CSS size

    let count = 3;
    timerEl.textContent = String(count);
    phaseLabel.textContent = 'Get Ready';
    phaseDesc.textContent = 'Find a comfortable position';

    const countdownId = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(countdownId);
        startBreathing();
      } else {
        timerEl.textContent = String(count);
      }
    }, 1000);
  }

  function startBreathing() {
    const circle = screen.querySelector('.breathing-circle') as HTMLElement;
    const timerEl = screen.querySelector('.breathing-timer') as HTMLElement;
    const phaseLabel = screen.querySelector('.phase-label') as HTMLElement;
    const phaseDesc = screen.querySelector('.phase-desc') as HTMLElement;

    // Add session timer and stop button
    const container = screen.querySelector('.breathing-container') as HTMLElement;
    const sessionTimerEl = document.createElement('div');
    sessionTimerEl.className = 'breathing-session-timer';
    sessionTimerEl.textContent = 'Session: 0:00';
    container.appendChild(sessionTimerEl);

    const stopBtn = document.createElement('button');
    stopBtn.className = 'stop-btn';
    stopBtn.textContent = 'End Session';
    container.appendChild(stopBtn);

    stopBtn.addEventListener('click', () => {
      cleanup();
      screen.classList.add('screen-exit');
      setTimeout(onBack, 300);
    });

    const phases = [
      { label: 'Breathe In', desc: 'Inhale slowly through your nose', duration: 4, className: 'inhale' },
      { label: 'Hold', desc: 'Hold your breath gently', duration: 7, className: 'hold' },
      { label: 'Breathe Out', desc: 'Exhale slowly through your mouth', duration: 8, className: 'exhale' },
    ];

    let phaseIndex = 0;
    let countdown = phases[0].duration;
    let sessionSeconds = 0;
    running = true;

    function updatePhase() {
      const phase = phases[phaseIndex];
      circle.className = 'breathing-circle ' + phase.className;
      phaseLabel.textContent = phase.label;
      phaseDesc.textContent = phase.desc;
      countdown = phase.duration;
      timerEl.textContent = String(countdown);
    }

    updatePhase();

    intervalId = setInterval(() => {
      if (!running) return;
      countdown--;
      sessionSeconds++;

      if (countdown <= 0) {
        phaseIndex = (phaseIndex + 1) % phases.length;
        updatePhase();
      } else {
        timerEl.textContent = String(countdown);
      }

      const mins = Math.floor(sessionSeconds / 60);
      const secs = sessionSeconds % 60;
      sessionTimerEl.textContent = `Session: ${mins}:${secs.toString().padStart(2, '0')}`;

      if (sessionSeconds === 180) {
        cleanup();
        showSessionComplete(screen, onSessionEnd);
      }
    }, 1000);
  }

  screen.querySelector('.breathing-circle-wrapper')!.addEventListener('click', startCountdown);

  screen.querySelector('.back-btn')!.addEventListener('click', () => {
    cleanup();
    screen.classList.add('screen-exit');
    setTimeout(onBack, 300);
  });

  return screen;
}
