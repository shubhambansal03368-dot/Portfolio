/**
 * ==========================================================================
 * SHUBHAM BANSAL — CINEMATIC ENTRY & SOUND EXPERIENCE ENGINE
 * Pure Vanilla JavaScript · Zero Dependencies · Web Audio API Synthesis
 * ==========================================================================
 */

(function () {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     1. Web Audio API Sound Synthesizer (Zero External Audio Files)
     ========================================================================== */
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = false;
      this.ambientGain = null;
      this.ambientOsc1 = null;
      this.ambientOsc2 = null;
      this.lastHoverTime = 0;

      // Check sessionStorage for previous preference during this session
      try {
        const savedPref = sessionStorage.getItem('sb_portfolio_sound');
        if (savedPref === 'true') {
          // Note: Browser autoplay policies still require user interaction to resume AudioContext
          this.enabled = true;
        }
      } catch (e) {
        // Fallback if sessionStorage is disabled
        this.enabled = false;
      }
    }

    initContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.initContext();
      this.enabled = !this.enabled;

      try {
        sessionStorage.setItem('sb_portfolio_sound', this.enabled ? 'true' : 'false');
      } catch (e) {}

      this.updateUI();

      if (this.enabled) {
        this.playStartup();
        this.startAmbient();
      } else {
        this.stopAmbient();
      }

      return this.enabled;
    }

    updateUI() {
      const toggleBtn = document.getElementById('sound-toggle-btn');
      if (!toggleBtn) return;

      const stateText = toggleBtn.querySelector('.sound-state-text');
      const iconMuted = toggleBtn.querySelector('.sound-icon-muted');
      const iconActive = toggleBtn.querySelector('.sound-icon-active');

      if (this.enabled) {
        toggleBtn.classList.add('sound-on');
        toggleBtn.setAttribute('aria-pressed', 'true');
        toggleBtn.setAttribute('title', 'Sound is ON (Click to Mute)');
        if (stateText) stateText.textContent = 'ON';
        if (iconMuted) iconMuted.style.display = 'none';
        if (iconActive) iconActive.style.display = 'inline-block';
      } else {
        toggleBtn.classList.remove('sound-on');
        toggleBtn.setAttribute('aria-pressed', 'false');
        toggleBtn.setAttribute('title', 'Sound is OFF (Click to Enable)');
        if (stateText) stateText.textContent = 'OFF';
        if (iconMuted) iconMuted.style.display = 'inline-block';
        if (iconActive) iconActive.style.display = 'none';
      }
    }

    // Soft startup chime: harmonic chord swell (C4 - G4 - C5) with warm decay
    playStartup() {
      if (!this.enabled || !this.ctx) return;
      this.initContext();

      const now = this.ctx.currentTime;
      const notes = [261.63, 392.00, 523.25]; // C4, G4, C5

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        // Lowpass filter for smooth warmth
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.06 / (idx + 1), now + idx * 0.08 + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75 + idx * 0.1);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + 0.85 + idx * 0.1);
      });
    }

    // Tactile micro-click for buttons & interactive controls
    playClick() {
      if (!this.enabled || !this.ctx) return;
      this.initContext();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.045);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    }

    // Gentle hover micro-blip (debounced to avoid noise during rapid mouse motion)
    playHover() {
      if (!this.enabled || !this.ctx) return;
      const nowMs = performance.now();
      if (nowMs - this.lastHoverTime < 75) return; // 75ms debounce
      this.lastHoverTime = nowMs;

      this.initContext();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(920, now);

      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    }

    // Smooth dual-tone frequency glide when navigating between sections
    playNav() {
      if (!this.enabled || !this.ctx) return;
      this.initContext();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.09);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    }

    // Keystroke sound for terminal typing simulation
    playKeyClick() {
      if (!this.enabled || !this.ctx) return;
      this.initContext();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Subtle mechanical tick with slight pitch variation
      const freq = 1200 + (Math.random() * 200 - 100);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.012, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.02);
    }

    // Soft futuristic ambient harmonic pad (very subtle background texture)
    startAmbient() {
      if (!this.enabled || !this.ctx || this.ambientOsc1) return;
      try {
        const now = this.ctx.currentTime;
        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(0.0001, now);
        this.ambientGain.gain.linearRampToValueAtTime(0.008, now + 2.0); // Gentle 2s fade in

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(240, now);

        this.ambientOsc1 = this.ctx.createOscillator();
        this.ambientOsc2 = this.ctx.createOscillator();

        this.ambientOsc1.type = 'sine';
        this.ambientOsc1.frequency.setValueAtTime(110.00, now); // A2

        this.ambientOsc2.type = 'sine';
        this.ambientOsc2.frequency.setValueAtTime(164.81, now); // E3

        this.ambientOsc1.connect(filter);
        this.ambientOsc2.connect(filter);
        filter.connect(this.ambientGain);
        this.ambientGain.connect(this.ctx.destination);

        this.ambientOsc1.start();
        this.ambientOsc2.start();
      } catch (e) {
        // Ambient fallback safe
      }
    }

    stopAmbient() {
      if (this.ambientGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + 0.5);
        setTimeout(() => {
          if (this.ambientOsc1) {
            try { this.ambientOsc1.stop(); } catch (e) {}
            this.ambientOsc1 = null;
          }
          if (this.ambientOsc2) {
            try { this.ambientOsc2.stop(); } catch (e) {}
            this.ambientOsc2 = null;
          }
          this.ambientGain = null;
        }, 550);
      }
    }
  }

  const sound = new SoundEngine();

  /* ==========================================================================
     2. Cinematic Website Entry Experience
     ========================================================================== */
  function initCinematicEntry() {
    const introOverlay = document.getElementById('cinematic-intro');
    if (!introOverlay) return;

    // Check if user already saw the intro in this session or prefers reduced motion
    let hasSeenIntro = false;
    try {
      hasSeenIntro = sessionStorage.getItem('sb_intro_seen') === 'true';
    } catch (e) {}

    const skipIntro = prefersReducedMotion || hasSeenIntro;

    function finishIntro() {
      introOverlay.classList.add('intro-fade-out');
      document.body.classList.add('entry-complete');
      try {
        sessionStorage.setItem('sb_intro_seen', 'true');
      } catch (e) {}

      setTimeout(() => {
        introOverlay.remove();
        // Trigger hero terminal typing after entry reveal
        initTerminalTyping();
      }, 550);
    }

    if (skipIntro) {
      introOverlay.style.display = 'none';
      document.body.classList.add('entry-complete');
      introOverlay.remove();
      initTerminalTyping();
      return;
    }

    // Allow user to click or press any key to skip immediately
    const skipHandler = () => {
      window.removeEventListener('keydown', skipHandler);
      introOverlay.removeEventListener('click', skipHandler);
      finishIntro();
    };

    window.addEventListener('keydown', skipHandler, { once: true });
    introOverlay.addEventListener('click', skipHandler, { once: true });

    // Automatic timed cinematic sequence (~1.4s total for instant, snappy engagement)
    setTimeout(() => {
      introOverlay.classList.add('intro-phase-2');
    }, 450);

    setTimeout(() => {
      introOverlay.classList.add('intro-phase-3');
    }, 950);

    setTimeout(() => {
      finishIntro();
    }, 1550);
  }

  /* ==========================================================================
     3. Realistic Terminal Typing Animation
     ========================================================================== */
  function initTerminalTyping() {
    const termBody = document.querySelector('.terminal-body');
    if (!termBody) return;

    // If reduced motion, leave the static HTML as is
    if (prefersReducedMotion) {
      termBody.classList.add('typing-complete');
      return;
    }

    const line1 = termBody.querySelector('.term-line:nth-of-type(1) .term-cmd');
    const out1 = termBody.querySelector('.term-output:nth-of-type(1)');
    const line2 = termBody.querySelector('.term-line:nth-of-type(2) .term-cmd');
    const out2 = termBody.querySelector('.term-output:nth-of-type(2)');
    const metricGrid = termBody.querySelector('.term-metric-grid');

    if (!line1 || !out1 || !line2 || !out2) return;

    const cmd1Text = line1.textContent.trim();
    const cmd2Text = line2.textContent.trim();

    // Prepare elements for animation
    line1.textContent = '';
    out1.style.opacity = '0';
    out1.style.transform = 'translateY(4px)';
    out1.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

    line2.textContent = '';
    out2.style.opacity = '0';
    out2.style.transform = 'translateY(4px)';
    out2.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

    if (metricGrid) {
      metricGrid.style.opacity = '0';
      metricGrid.style.transform = 'translateY(4px)';
      metricGrid.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    }

    // Create terminal cursor
    const cursor = document.createElement('span');
    cursor.className = 'term-cursor';
    cursor.textContent = '▌';
    line1.parentNode.appendChild(cursor);

    function typeString(targetEl, text, speed, onComplete) {
      let i = 0;
      function step() {
        if (i < text.length) {
          targetEl.textContent += text.charAt(i);
          sound.playKeyClick();
          i++;
          setTimeout(step, speed + (Math.random() * 20 - 10));
        } else {
          if (onComplete) onComplete();
        }
      }
      step();
    }

    // Sequence execution
    setTimeout(() => {
      // Type Command 1
      typeString(line1, cmd1Text, 32, () => {
        setTimeout(() => {
          // Reveal Output 1
          out1.style.opacity = '1';
          out1.style.transform = 'translateY(0)';

          // Move cursor to Command 2
          line2.parentNode.appendChild(cursor);

          setTimeout(() => {
            // Type Command 2
            typeString(line2, cmd2Text, 28, () => {
              setTimeout(() => {
                // Reveal Output 2 & metrics
                out2.style.opacity = '1';
                out2.style.transform = 'translateY(0)';

                if (metricGrid) {
                  setTimeout(() => {
                    metricGrid.style.opacity = '1';
                    metricGrid.style.transform = 'translateY(0)';
                  }, 120);
                }

                termBody.classList.add('typing-complete');
              }, 120);
            });
          }, 200);
        }, 150);
      });
    }, 250);
  }

  /* ==========================================================================
     4. Scroll Reveal Animations (IntersectionObserver)
     ========================================================================== */
  function initScrollReveals() {
    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        el.classList.add('is-revealed');
      });
      return;
    }

    // Target elements to animate on scroll
    const targetSelectors = [
      'section .section-header',
      '.about-grid > div',
      '.pillar-card',
      '.stack-card',
      '.cf-card',
      '.featured-project-card',
      '.completed-project-card',
      '.upcoming-card',
      '.leadership-story',
      '.leadership-stat-card',
      '.timeline-item',
      '.explore-card',
      '.vision-banner',
      '.contact-card'
    ];

    const elementsToReveal = document.querySelectorAll(targetSelectors.join(', '));

    elementsToReveal.forEach((el, index) => {
      el.classList.add('reveal-on-scroll');
      // Assign subtle stagger delay for sibling cards
      const parent = el.parentElement;
      if (parent && (parent.classList.contains('stack-grid') || 
                     parent.classList.contains('completed-projects-grid') || 
                     parent.classList.contains('exploring-grid') ||
                     parent.classList.contains('leadership-pillars-grid'))) {
        const childIndex = Array.prototype.indexOf.call(parent.children, el);
        el.style.transitionDelay = `${(childIndex % 4) * 0.08}s`;
      }
    });

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.1
      }
    );

    elementsToReveal.forEach(el => observer.observe(el));
  }

  /* ==========================================================================
     5. Interactive Event Handlers & Audio Bindings
     ========================================================================== */
  function initInteractiveEvents() {
    // Sound Toggle Button
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        sound.toggle();
      });
      sound.updateUI();
    }

    // Nav Links: Section Navigation Sound
    document.querySelectorAll('.nav-link, .brand-logo').forEach(link => {
      link.addEventListener('click', () => {
        sound.playNav();

        // Close mobile menu if open
        const navToggle = document.getElementById('nav-toggle');
        if (navToggle && navToggle.checked) {
          navToggle.checked = false;
        }
      });
    });

    // Buttons: Tactile Click Sound
    document.querySelectorAll('.btn, .contact-method-card').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
      });
    });

    // Subtle Hover Sound on Key Interactive Elements
    const hoverElements = document.querySelectorAll(
      '.nav-link, .btn, .stack-card, .completed-project-card, .social-icon-link, .contact-method-card, .pillar-card, .explore-card'
    );

    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        sound.playHover();
      });
    });
  }

  /* ==========================================================================
     DOM Ready Initialization
     ========================================================================== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initCinematicEntry();
      initScrollReveals();
      initInteractiveEvents();
    });
  } else {
    initCinematicEntry();
    initScrollReveals();
    initInteractiveEvents();
  }
})();

