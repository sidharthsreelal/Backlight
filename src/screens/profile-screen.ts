import { getUserProfile, saveUserProfile, type UserProfile } from '../user-profile';

const therapistOptions = [
  { value: 'curious', label: 'The Curious Therapist', icon: '<path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"></path><path d="m21 21-4.3-4.3"></path>' },
  { value: 'reflective', label: 'The Reflective Listener', icon: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>' },
  { value: 'practical', label: 'The Practical Problem Solver', icon: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>' },
  { value: 'calm', label: 'The Calm Grounding Guide', icon: '<path d="M11 20A7 7 0 0 1 4 13V4h9a7 7 0 0 1 7 7v9h-9Z"></path><path d="M11 20v-7"></path>' },
  { value: 'challenging', label: 'The Challenging Insight Therapist', icon: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>' },
  { value: 'custom', label: 'Custom', icon: '<path d="M12 5v14"></path><path d="M5 12h14"></path>' },
];

function getDropdownSVG(paths: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dropdown-icon">${paths}</svg>`;
}

export function renderProfileScreen(onBack: () => void): HTMLElement {
  const screen = document.createElement('div');
  screen.className = 'screen';
  const profile = getUserProfile();

  let currentTherapistType = profile.therapistType || 'curious';
  const selectedOption = therapistOptions.find(opt => opt.value === currentTherapistType) || therapistOptions[0];

  screen.innerHTML = `
    <button class="back-btn">← Back</button>
    <div class="profile-container">
      <div class="selection-header">
        <h2>My Profile</h2>
        <p>Help your therapist know you better</p>
      </div>
      <div class="profile-form">
        <div class="profile-field">
          <label for="profile-name">Name</label>
          <input type="text" id="profile-name" class="profile-input" placeholder="What should I call you?" value="${escapeHtml(profile.name)}" />
        </div>
        <div class="profile-field">
          <label for="profile-about">About Me</label>
          <textarea id="profile-about" class="profile-textarea" placeholder="Anything you'd like your therapist to know — hobbies, struggles, context…" rows="3">${escapeHtml(profile.aboutMe)}</textarea>
        </div>
        <div class="profile-field" style="position: relative; z-index: 50;">
          <label>Therapist Type</label>
          <div class="custom-dropdown" id="therapist-dropdown">
            <button type="button" class="dropdown-toggle" id="therapist-toggle">
              <div class="dropdown-toggle-content" id="therapist-toggle-content">
                ${getDropdownSVG(selectedOption.icon)}
                <span>${selectedOption.label}</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dropdown-arrow"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div class="dropdown-menu" id="therapist-menu" style="display: none;">
              ${therapistOptions.map(opt => `
                <div class="dropdown-item ${opt.value === currentTherapistType ? 'selected' : ''}" data-value="${opt.value}">
                  ${getDropdownSVG(opt.icon)}
                  <span>${opt.label}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        <div class="profile-field" id="custom-therapist-field" style="display: ${currentTherapistType === 'custom' ? 'flex' : 'none'};">
          <label for="profile-therapist">Custom Behavior</label>
          <textarea id="profile-therapist" class="profile-textarea" placeholder="How would you like your therapist to behave? e.g. 'Be more direct', 'Use humor'…" rows="3">${escapeHtml(profile.therapist)}</textarea>
        </div>
        <button class="profile-save-btn">Save</button>
      </div>
    </div>
  `;

  const nameInput = screen.querySelector('#profile-name') as HTMLInputElement;
  const aboutInput = screen.querySelector('#profile-about') as HTMLTextAreaElement;
  const customTherapistField = screen.querySelector('#custom-therapist-field') as HTMLElement;
  const therapistInput = screen.querySelector('#profile-therapist') as HTMLTextAreaElement;

  const dropdownToggle = screen.querySelector('#therapist-toggle') as HTMLButtonElement;
  const dropdownMenu = screen.querySelector('#therapist-menu') as HTMLElement;
  const dropdownToggleContent = screen.querySelector('#therapist-toggle-content') as HTMLElement;
  const dropdownContainer = screen.querySelector('#therapist-dropdown') as HTMLElement;
  const dropdownItems = screen.querySelectorAll('.dropdown-item');

  // Toggle Dropdown
  dropdownToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isEditing = dropdownMenu.style.display === 'flex';
    dropdownMenu.style.display = isEditing ? 'none' : 'flex';
    if (!isEditing) {
      dropdownContainer.classList.add('open');
    } else {
      dropdownContainer.classList.remove('open');
    }
  });

  // Handle Item Selection
  dropdownItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const value = item.getAttribute('data-value') as string;
      currentTherapistType = value;

      const option = therapistOptions.find(o => o.value === value)!;
      dropdownToggleContent.innerHTML = getDropdownSVG(option.icon) + '<span>' + option.label + '</span>';

      dropdownItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');

      dropdownMenu.style.display = 'none';
      dropdownContainer.classList.remove('open');

      if (value === 'custom') {
        customTherapistField.style.display = 'flex';
      } else {
        customTherapistField.style.display = 'none';
      }
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdownContainer.contains(e.target as Node)) {
      dropdownMenu.style.display = 'none';
      dropdownContainer.classList.remove('open');
    }
  });

  screen.querySelector('.profile-save-btn')!.addEventListener('click', () => {
    const updated: UserProfile = {
      name: nameInput.value.trim(),
      aboutMe: aboutInput.value.trim(),
      therapistType: currentTherapistType,
      therapist: therapistInput.value.trim(),
    };
    saveUserProfile(updated);
    screen.classList.add('screen-exit');
    setTimeout(onBack, 300);
  });

  screen.querySelector('.back-btn')!.addEventListener('click', () => {
    screen.classList.add('screen-exit');
    setTimeout(onBack, 300);
  });

  return screen;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
