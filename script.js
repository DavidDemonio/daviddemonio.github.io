const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const menuToggle = document.getElementById('menuToggle');
const navShell = document.querySelector('.nav-shell');
const navLinks = [...document.querySelectorAll('.main-nav a')];
const sections = [...document.querySelectorAll('main section[id]')];
const yearNode = document.getElementById('year');
const progressLine = document.getElementById('progressLine');
const mouseGlow = document.getElementById('mouseGlow');
const particleCanvas = document.getElementById('particleCanvas');

const savedTheme = localStorage.getItem('portfolio-theme');
const preferredLight = window.matchMedia('(prefers-color-scheme: light)').matches;
const initialTheme = savedTheme || (preferredLight ? 'light' : 'dark');
root.setAttribute('data-theme', initialTheme);

const setTheme = (theme) => {
  root.setAttribute('data-theme', theme);
  localStorage.setItem('portfolio-theme', theme);
  document.querySelector('meta[name="theme-color"]').setAttribute(
    'content',
    theme === 'light' ? '#f3f7ff' : '#0b1020'
  );
};

themeToggle?.addEventListener('click', () => {
  const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
});

const toggleMenu = () => {
  const isOpen = navShell.classList.toggle('menu-open');
  document.body.classList.toggle('menu-open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
};

menuToggle?.addEventListener('click', toggleMenu);
navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (navShell.classList.contains('menu-open')) toggleMenu();
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 860 && navShell.classList.contains('menu-open')) {
    navShell.classList.remove('menu-open');
    document.body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
});

const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16, rootMargin: '0px 0px -60px 0px' }
);
revealElements.forEach((el) => revealObserver.observe(el));

const setActiveNav = () => {
  const scrollY = window.scrollY + 160;

  sections.forEach((section) => {
    const id = section.getAttribute('id');
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const active = scrollY >= top && scrollY < top + height;

    navLinks.forEach((link) => {
      if (link.getAttribute('href') === `#${id}`) link.classList.toggle('active', active);
    });
  });
};

const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressLine.style.width = `${Math.min(progress, 100)}%`;
};

window.addEventListener('scroll', () => {
  setActiveNav();
  updateProgress();
}, { passive: true });
setActiveNav();
updateProgress();

yearNode.textContent = new Date().getFullYear();

const magneticItems = document.querySelectorAll('.magnetic');
magneticItems.forEach((item) => {
  item.addEventListener('mousemove', (event) => {
    if (window.innerWidth < 860) return;
    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    item.style.transform = `translate(${x * 0.07}px, ${y * 0.07}px)`;
  });
  item.addEventListener('mouseleave', () => {
    item.style.transform = '';
  });
});

const cards = document.querySelectorAll('.lift-card');
cards.forEach((card) => {
  card.addEventListener('mousemove', (event) => {
    if (window.innerWidth < 960) return;
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 6;
    const rotateX = (0.5 - py) * 6;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navShell.classList.contains('menu-open')) toggleMenu();
});

window.addEventListener('pointermove', (event) => {
  if (!mouseGlow) return;
  mouseGlow.style.left = `${event.clientX}px`;
  mouseGlow.style.top = `${event.clientY}px`;
});

const floatChips = document.querySelectorAll('.float-chip');
window.addEventListener('pointermove', (event) => {
  if (window.innerWidth < 860) return;
  const px = (event.clientX / window.innerWidth - 0.5) * 18;
  const py = (event.clientY / window.innerHeight - 0.5) * 18;
  floatChips.forEach((chip, index) => {
    const factor = (index + 1) * 0.12;
    chip.style.transform = `translate(${px * factor}px, ${py * factor}px)`;
  });
}, { passive: true });

const setupParticles = () => {
  if (!particleCanvas) return;
  const ctx = particleCanvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rafId;
  let particles = [];

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    particleCanvas.width = Math.floor(window.innerWidth * dpr);
    particleCanvas.height = Math.floor(window.innerHeight * dpr);
    particleCanvas.style.width = `${window.innerWidth}px`;
    particleCanvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(26, Math.min(60, Math.floor(window.innerWidth / 28)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      r: Math.random() * 1.8 + 0.6,
    }));
  };

  const getComputedColor = (name, alpha) => {
    const value = getComputedStyle(root).getPropertyValue(name).trim();
    if (value.startsWith('#')) {
      const hex = value.replace('#', '');
      const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
      const int = Number.parseInt(full, 16);
      const r = (int >> 16) & 255;
      const g = (int >> 8) & 255;
      const b = int & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return `rgba(124,156,255,${alpha})`;
  };

  const render = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const lineColor = getComputedColor('--primary', 0.12);
    const dotColor = getComputedColor('--accent', 0.65);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -20) p.x = window.innerWidth + 20;
      if (p.x > window.innerWidth + 20) p.x = -20;
      if (p.y < -20) p.y = window.innerHeight + 20;
      if (p.y > window.innerHeight + 20) p.y = -20;

      ctx.beginPath();
      ctx.fillStyle = dotColor;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 120) {
          ctx.beginPath();
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = 1;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    if (!reduceMotion) rafId = requestAnimationFrame(render);
  };

  resize();
  render();
  window.addEventListener('resize', resize);
  window.addEventListener('beforeunload', () => cancelAnimationFrame(rafId));
};

setupParticles();
