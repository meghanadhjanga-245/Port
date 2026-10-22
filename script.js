// ===== DOM Ready =====
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initCarousel();
  initSkillsViewSwitcher();
  initFloatingProjects();
  initProjectFilters();
  initProjectModal();
  initContactForm();
  initSmoothScroll();
  initScrollProgress();
  initBackToTop();
  initCopyEmail();
});

// ===== Navbar Scroll Behavior =====
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  let lastScroll = 0;
  let ticking = false;

  // Show navbar after a short delay on page load
  setTimeout(() => {
    navbar.classList.add('visible');
  }, 800);

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScroll = window.scrollY;

        // Add/remove scrolled class for background
        if (currentScroll > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }

        // Show/hide navbar based on scroll direction
        if (currentScroll > 100) {
          navbar.classList.add('visible');
        }

        lastScroll = currentScroll;
        ticking = false;
      });
      ticking = true;
    }
  });

  // Update active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });
}

// ===== Mobile Menu =====
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  const close = document.querySelector('.mobile-menu-close');
  const overlay = document.querySelector('.mobile-overlay');
  const links = document.querySelectorAll('.mobile-menu a');

  function openMenu() {
    menu.classList.add('open');
    overlay.style.display = 'block';
    requestAnimationFrame(() => overlay.classList.add('active'));
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menu.classList.remove('open');
    overlay.classList.remove('active');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 300);
    document.body.style.overflow = '';
  }

  if (toggle) toggle.addEventListener('click', openMenu);
  if (close) close.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);

  links.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

// ===== Scroll Animations (IntersectionObserver) =====
function initScrollAnimations() {
  const animateElements = document.querySelectorAll(
    '.section-header, .about-card, .project-card, .timeline-item, .note-card, .contact-text, .contact-email, .social-links'
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add stagger delay for grid items
          const parent = entry.target.parentElement;
          if (parent) {
            const siblings = Array.from(parent.children).filter(
              (el) => el.classList.contains(entry.target.classList[0])
            );
            const index = siblings.indexOf(entry.target);
            entry.target.style.transitionDelay = `${index * 100}ms`;
          }
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  animateElements.forEach((el) => observer.observe(el));
}

// ===== Achievement Carousel =====
function initCarousel() {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.querySelector('.carousel-btn-prev');
  const nextBtn = document.querySelector('.carousel-btn-next');
  const progressBar = document.querySelector('.carousel-progress-bar');

  if (slides.length === 0) return;

  let currentIndex = 0;
  let autoPlayInterval;
  const totalSlides = slides.length;

  function goToSlide(index) {
    // Remove active from current
    slides[currentIndex].classList.remove('active');
    slides[currentIndex].classList.add('exit-left');
    dots[currentIndex].classList.remove('active');

    // Reset exit class after transition
    setTimeout(() => {
      slides[currentIndex === 0 ? totalSlides - 1 : currentIndex - 1].classList.remove('exit-left');
    }, 500);

    currentIndex = ((index % totalSlides) + totalSlides) % totalSlides;

    // Add active to new
    slides[currentIndex].classList.remove('exit-left');
    slides[currentIndex].classList.add('active');
    dots[currentIndex].classList.add('active');

    // Update progress bar
    if (progressBar) {
      progressBar.style.width = `${((currentIndex + 1) / totalSlides) * 100}%`;
    }
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoPlay() {
    clearInterval(autoPlayInterval);
  }

  // Event listeners
  if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoPlay(); prevSlide(); startAutoPlay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoPlay(); nextSlide(); startAutoPlay(); });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      stopAutoPlay();
      goToSlide(index);
      startAutoPlay();
    });
  });

  // Touch/swipe support
  const viewport = document.querySelector('.carousel-viewport');
  if (viewport) {
    let touchStartX = 0;
    let touchEndX = 0;

    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoPlay();
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
      startAutoPlay();
    }, { passive: true });
  }

  // Initialize first slide
  if (slides.length > 0) {
    slides[0].classList.add('active');
    dots[0].classList.add('active');
    if (progressBar) {
      progressBar.style.width = `${(1 / totalSlides) * 100}%`;
    }
    startAutoPlay();
  }

  // Pause on hover
  const carouselWrapper = document.querySelector('.carousel-wrapper');
  if (carouselWrapper) {
    carouselWrapper.addEventListener('mouseenter', stopAutoPlay);
    carouselWrapper.addEventListener('mouseleave', startAutoPlay);
  }

  // Keyboard navigation when Education section is in view
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const eduSection = document.getElementById('education');
      if (eduSection) {
        const rect = eduSection.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        if (isInView) {
          stopAutoPlay();
          if (e.key === 'ArrowLeft') prevSlide();
          else nextSlide();
          startAutoPlay();
        }
      }
    }
  });
}

// ===== Smooth Scroll =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = 80; // navbar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// ===== Theme Toggle (Dark / Light) =====
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('meghanadh-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Set initial theme
  const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', initialTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('meghanadh-theme', nextTheme);
      showToast(`Switched to ${nextTheme} mode`);
    });
  }

  // Listen for system theme changes if user hasn't set explicit preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('meghanadh-theme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  });
}

// ===== Scroll Progress Bar =====
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress-bar');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;
    const progress = (window.scrollY / totalHeight) * 100;
    progressBar.style.width = `${progress}%`;
  }, { passive: true });
}

// ===== Back to Top Button =====
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== Copy Email to Clipboard =====
function initCopyEmail() {
  const copyBtn = document.getElementById('copy-email-btn');
  const email = 'meghanadhjanga02@gmail.com';

  if (!copyBtn) return;

  copyBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(email);
      copyBtn.classList.add('copied');
      showToast('Email address copied to clipboard! ✓');
      setTimeout(() => {
        copyBtn.classList.remove('copied');
      }, 2500);
    } catch (err) {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = email;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      copyBtn.classList.add('copied');
      showToast('Email address copied to clipboard! ✓');
      setTimeout(() => {
        copyBtn.classList.remove('copied');
      }, 2500);
    }
  });
}

// ===== Toast Notification Helper =====
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const isError = type === 'error';
  toast.className = `toast ${isError ? 'toast-error' : ''}`;

  const icon = isError
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>`;

  toast.innerHTML = `
    ${icon}
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-fadeout');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 350);
  }, 3200);
}

// ===== Floating Projects Showcase (Displays Same as Skills) =====
function initFloatingProjects() {
  const grid = document.getElementById('projects-grid');
  const marqueeContainer = document.getElementById('projects-marquee-container');
  const marqueeTrack = document.getElementById('projects-marquee-track');
  const marqueeRow = document.getElementById('projects-marquee-row');
  const viewFloatingBtn = document.getElementById('view-floating-btn');
  const viewGridBtn = document.getElementById('view-grid-btn');
  const pauseBtn = document.getElementById('float-pause-btn');

  if (!grid || !marqueeRow) return;

  const originalCards = grid.querySelectorAll('.project-card');
  if (!originalCards.length) return;

  function populateMarquee(cardsToUse) {
    marqueeRow.innerHTML = '';
    // Duplicate twice for seamless -50% infinite float
    for (let loop = 0; loop < 2; loop++) {
      cardsToUse.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.classList.remove('project-featured', 'is-hidden');
        clone.classList.add('animate-in');
        clone.style.display = '';
        clone.style.opacity = '1';
        clone.style.transform = 'none';
        marqueeRow.appendChild(clone);
      });
    }
    const cardCount = cardsToUse.length;
    const duration = Math.max(26, cardCount * 8.5);
    marqueeRow.style.animationDuration = `${duration}s`;
  }

  populateMarquee(Array.from(originalCards));

  // Global updater when categories are filtered
  window.updateFloatingProjects = (matchingCards) => {
    if (matchingCards.length === 0) {
      marqueeRow.innerHTML = '<p style="padding: 40px; color: var(--gray-500); text-align: center; width: 100%;">No matching projects in this category.</p>';
      marqueeRow.style.animation = 'none';
    } else {
      marqueeRow.style.animation = '';
      populateMarquee(matchingCards);
    }
  };

  // View Switcher: Floating Stream vs Grid
  if (viewFloatingBtn && viewGridBtn && marqueeContainer) {
    viewFloatingBtn.addEventListener('click', () => {
      viewFloatingBtn.classList.add('active');
      viewGridBtn.classList.remove('active');
      marqueeContainer.style.display = 'block';
      grid.style.display = 'none';
      if (pauseBtn) pauseBtn.style.display = 'inline-flex';
    });

    viewGridBtn.addEventListener('click', () => {
      viewGridBtn.classList.add('active');
      viewFloatingBtn.classList.remove('active');
      marqueeContainer.style.display = 'none';
      grid.style.display = 'grid';
      if (pauseBtn) pauseBtn.style.display = 'none';
    });
  }

  // Float Pause / Resume Button
  if (pauseBtn && marqueeTrack) {
    pauseBtn.addEventListener('click', () => {
      const isPaused = marqueeTrack.classList.toggle('is-paused');
      pauseBtn.classList.toggle('paused', isPaused);
      const textSpan = pauseBtn.querySelector('.float-btn-text');
      if (textSpan) {
        textSpan.textContent = isPaused ? 'Resume Float' : 'Pause Float';
      }
    });
  }

  // Mouse drag-to-scroll physics
  if (marqueeTrack && marqueeRow) {
    let isDown = false;
    let startX = 0;
    let currentMatrixX = 0;

    function getMarqueeTranslateX() {
      const style = window.getComputedStyle(marqueeRow);
      const matrix = new DOMMatrixReadOnly(style.transform);
      return matrix.m41 || 0;
    }

    marqueeTrack.addEventListener('mousedown', (e) => {
      if (e.button !== 0 || e.target.closest('a, button')) return;
      isDown = true;
      marqueeTrack.classList.add('is-dragging');
      startX = e.pageX;
      currentMatrixX = getMarqueeTranslateX();
      marqueeRow.style.animationPlayState = 'paused';
      marqueeRow.style.transform = `translateX(${currentMatrixX}px)`;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const diff = e.pageX - startX;
      marqueeRow.style.transform = `translateX(${currentMatrixX + diff}px)`;
    });

    const stopMarqueeDrag = () => {
      if (!isDown) return;
      isDown = false;
      marqueeTrack.classList.remove('is-dragging');
      if (!marqueeTrack.classList.contains('is-paused')) {
        marqueeRow.style.animationPlayState = '';
        marqueeRow.style.transform = '';
      }
    };

    window.addEventListener('mouseup', stopMarqueeDrag);
  }
}

// ===== Project Filtering =====
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const grid = document.getElementById('projects-grid');
  if (!filterBtns.length || !grid) return;

  const originalCards = Array.from(grid.querySelectorAll('.project-card'));

  // Sync count badges
  filterBtns.forEach((btn) => {
    const filter = btn.getAttribute('data-filter');
    const countBadge = btn.querySelector('.filter-count');
    if (countBadge) {
      if (filter === 'all') {
        countBadge.textContent = originalCards.length;
      } else {
        const matches = originalCards.filter((card) => {
          const cats = (card.getAttribute('data-category') || '').trim().split(/\s+/);
          return cats.includes(filter);
        }).length;
        countBadge.textContent = matches;
      }
    }
  });

  // Filter click handler
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const filter = btn.getAttribute('data-filter');

      // Update active button state
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const matchingCards = [];
      let visibleCount = 0;

      originalCards.forEach((card) => {
        const categories = (card.getAttribute('data-category') || '').trim().split(/\s+/);
        const isMatch = filter === 'all' || categories.includes(filter);

        if (isMatch) {
          card.classList.remove('is-hidden');
          card.style.display = '';
          card.style.transitionDelay = `${visibleCount * 70}ms`;
          visibleCount++;
          matchingCards.push(card);
          requestAnimationFrame(() => {
            card.classList.add('animate-in');
          });
        } else {
          card.classList.add('is-hidden');
          card.classList.remove('animate-in');
          card.style.transitionDelay = '0ms';
        }
      });

      // Synchronize floating marquee stream
      if (typeof window.updateFloatingProjects === 'function') {
        window.updateFloatingProjects(matchingCards);
      }
    });
  });
}

// ===== Skills View Switcher (Stream vs Matrix) =====
function initSkillsViewSwitcher() {
  const tickerTab = document.getElementById('skills-ticker-tab');
  const matrixTab = document.getElementById('skills-matrix-tab');
  const tickerContainer = document.getElementById('skills-marquee-container');
  const matrixContainer = document.getElementById('skills-matrix-container');

  if (!tickerTab || !matrixTab || !tickerContainer || !matrixContainer) return;

  tickerTab.addEventListener('click', () => {
    tickerTab.classList.add('active');
    matrixTab.classList.remove('active');
    tickerContainer.style.display = 'block';
    matrixContainer.style.display = 'none';
  });

  matrixTab.addEventListener('click', () => {
    matrixTab.classList.add('active');
    tickerTab.classList.remove('active');
    tickerContainer.style.display = 'none';
    matrixContainer.style.display = 'grid';
  });
}

// ===== Project Architecture & Specs Modal =====
function initProjectModal() {
  const modal = document.getElementById('project-modal');
  const modalContent = document.getElementById('modal-content');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!modal || !modalContent) return;

  const projectSpecs = {
    lob: {
      title: "LOB Simulator | High-Frequency Exchange Terminal",
      category: "FinTech · Low-Latency Systems",
      image: "images/lob-simulator.png",
      alt: "LOB Simulator Terminal Specs",
      desc: "Deterministic high-frequency exchange engine & limit order book (LOB) microstructure terminal simulating real-world financial markets. Implements sub-millisecond price-time priority matching, an Avellaneda-Stoikov inventory-aware market-making bot, real-time depth visualization, and order flow imbalance (OFI) analytics.",
      specs: [
        "Deterministic Matching Engine: Sub-millisecond order cycle processing with FIFO price-time priority queues.",
        "Algorithmic Market Maker: Dynamic Avellaneda-Stoikov stochastic control model adapting bid/ask spreads to inventory risk and market volatility.",
        "Telemetry & OFI Analytics: Real-time Order Flow Imbalance calculation and Level 2 / Level 3 market depth telemetry.",
        "Engineered with React 18, Vite, High-Performance 2D Canvas/WebGL, and decoupled Web Worker simulation threads."
      ],
      liveUrl: "https://lob-59je.onrender.com",
      liveText: "Launch Live Terminal",
      codeUrl: "https://github.com/meghanadhjanga-245/LOB"
    },
    campus: {
      title: "Campus Signal Tracer (RVRJC 5G Massive MIMO)",
      category: "Telecommunications · 3D Spatial GIS",
      image: "images/campus-signal.png",
      alt: "Campus Signal Tracer Specs",
      desc: "5G Massive MIMO Radiometry & 3D Cartographic Navigation System for R.V.R. & J.C. College of Engineering. Delivers real-time 64T64R beam radiation modeling, digital twin 3D spatial navigation, RSRP radiometry telemetry, and campus-wide Wi-Fi 6E hotspot tracking.",
      specs: [
        "Massive MIMO Beam Simulation: Real-time 64T64R radiation modeling calculating spatial beamforming and RSRP signal degradation.",
        "3D Cartography & Ray-Lock: Three.js WebGL scene coupled with georeferenced Mapbox spatial layers for precision building elevation ray-casting.",
        "Digital Twin Telemetry: Comprehensive spatial polygon mapping of departmental buildings, research centers, and edge Wi-Fi 6E access nodes.",
        "Built with React.js, Three.js, Mapbox GL JS, D3.js, Spatial GIS GeoJSON, and Tailwind CSS."
      ],
      liveUrl: "https://campusnetworkfinder.netlify.app/",
      liveText: "Explore Live System",
      codeUrl: "https://github.com/meghanadhjanga-245/Campus-network-finder"
    },
    synk: {
      title: "Synk Board",
      category: "Cloud · Process Automation",
      image: "images/synk-board.jpg",
      alt: "Synk Board Specs",
      desc: "Production-grade, high-availability process automation board utilizing event-driven micro-architecture to streamline enterprise workflows with real-time state synchronization.",
      specs: [
        "Event-Driven Micro-Architecture: Decoupled workflow pipeline with Redux Toolkit and normalized caching for sub-100ms response times.",
        "90% Latency Reduction: Optimistic UI state updates with WebSockets fallback delivering near-instantaneous state convergence.",
        "Automated Task Orchestration: Dynamic rule-triggering engine supporting multi-stage task routing and progress telemetry.",
        "Built with React.js, TypeScript, Redux, Node.js, WebSockets, and Tailwind CSS."
      ],
      liveUrl: "https://synk-board-delta.vercel.app/",
      liveText: "View Live Demo",
      codeUrl: "https://github.com/meghanadhjanga-245/SynkBoard"
    },
    forge: {
      title: "Forge Fit",
      category: "Full Stack · Health & Analytics",
      image: "images/forge-fit.jpg",
      alt: "Forge Fit Specs",
      desc: "Scalable health and fitness tracking web application built on clean code principles and OOP design patterns, achieving 30% load time reduction with modular component architecture.",
      specs: [
        "Clean OOP Architecture: Applied Factory and Observer design patterns to isolate business domain logic from presentation layers.",
        "30% Performance Optimization: Route-based lazy loading, image asset optimization, and aggressive tree-shaking.",
        "Modular Metric Visualizations: Custom responsive SVG analytical charts computing moving averages, volume loads, and progression trends.",
        "Built with TypeScript, React.js, Tailwind CSS, LocalStorage Sync, and Vite."
      ],
      liveUrl: "https://forge-fit-three.vercel.app/",
      liveText: "View Live Demo",
      codeUrl: "https://github.com/meghanadhjanga-245/Forge-Fit"
    },
    tome: {
      title: "Tome Tick",
      category: "Productivity · DevOps & CI/CD",
      image: "images/tome-tick.png",
      alt: "Tome Tick Specs",
      desc: "High-performance real-time task tracking and reporting application integrated with automated CI/CD deployment pipelines via GitHub Actions for seamless continuous delivery.",
      specs: [
        "Automated CI/CD Pipeline: GitHub Actions workflow with automated linting, test suites, and zero-downtime edge deployments.",
        "Real-Time Telemetry & Tracking: Sub-second state reconciliation, milestone countdowns, and exportable audit logs.",
        "Reliability Engineering: Strict TypeScript types with defensive error boundaries eliminating uncaught runtime exceptions.",
        "Built with TypeScript, React.js, GitHub Actions, Vercel Edge Network, and CSS3 Custom Properties."
      ],
      liveUrl: "https://tome-tick.vercel.app/",
      liveText: "View Live Demo",
      codeUrl: "https://github.com/meghanadhjanga-245/TomeTick"
    }
  };

  function openModal(projectId) {
    const data = projectSpecs[projectId];
    if (!data) return;

    modalContent.innerHTML = `
      <img src="${data.image}" alt="${data.alt}" class="modal-hero-img" loading="lazy">
      <span class="modal-category-tag">${data.category}</span>
      <h3 class="modal-title">${data.title}</h3>
      <p class="modal-desc">${data.desc}</p>
      <div class="modal-specs-box">
        <h4 class="modal-specs-title">Architecture & System Specifications</h4>
        ${data.specs.map(spec => `
          <div class="modal-spec-item">
            <span class="modal-spec-bullet">▸</span>
            <span>${spec}</span>
          </div>
        `).join('')}
      </div>
      <div class="modal-actions">
        <a href="${data.liveUrl}" target="_blank" rel="noopener noreferrer" class="project-btn-primary">
          <span>${data.liveText}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
        <a href="${data.codeUrl}" target="_blank" rel="noopener noreferrer" class="project-btn-secondary">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span>Source Code</span>
        </a>
      </div>
    `;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Delegated click listener to catch both grid & marquee buttons
  document.addEventListener('click', (e) => {
    const archBtn = e.target.closest('.project-btn-arch');
    if (archBtn) {
      e.preventDefault();
      e.stopPropagation();
      const projectKey = archBtn.getAttribute('data-project');
      if (projectKey) openModal(projectKey);
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}

// ===== Inline Interactive Contact Form (Web3Forms Direct Email Delivery & Firebase Sync) =====
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  // Set redirect URL for native Web3Forms fallback
  const nextInput = document.getElementById('form-redirect-next');
  if (nextInput) {
    try {
      nextInput.value = window.location.origin + window.location.pathname + '?submitted=true#contact';
    } catch (_) {}
  }

  // Check if page reloaded after a successful submission redirect
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('submitted') === 'true') {
      showToast("Thank you! Your message was delivered directly to Meghanadh's inbox. ✓");
      window.history.replaceState({}, document.title, window.location.pathname + '#contact');
    }
  } catch (_) {}

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('contact-submit-btn');
    const originalText = submitBtn ? submitBtn.innerHTML : '';

    const name = form.querySelector('[name="name"]')?.value.trim();
    const email = form.querySelector('[name="email"]')?.value.trim();
    const subject = form.querySelector('[name="subject"]')?.value.trim();
    const message = form.querySelector('[name="message"]')?.value.trim();

    if (!name || !email || !message) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spin-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10"></path>
        </svg>
        <span>Sending Message to Meghanadh...</span>
      `;
    }

    // 1. Concurrently save to Firebase database as cloud archive
    try {
      if (typeof window.sendContactMessage === 'function') {
        window.sendContactMessage({ name, email, subject, message }).catch(() => {});
      }
    } catch (_) {}

    // 2. Dispatch email directly to meghanadhjanga02@gmail.com via Web3Forms API
    try {
      const formData = new FormData(form);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success !== false) {
        showToast("Message sent! Dispatched directly to Meghanadh's Gmail inbox. ✓");
        form.reset();
      } else {
        // Fallback to native form submission
        form.submit();
      }
    } catch (err) {
      console.warn('Web3Forms AJAX blocked, falling back to native submission:', err);
      try {
        form.submit();
      } catch (submitErr) {
        showToast('Opening email client to deliver your message...', 'warning');
        setTimeout(() => {
          const mailtoUrl = `mailto:meghanadhjanga02@gmail.com?subject=${encodeURIComponent(subject || 'Portfolio Inquiry')}&body=${encodeURIComponent(`Hi Meghanadh,\n\nName: ${name}\nEmail: ${email}\n\n${message}`)}`;
          window.location.href = mailtoUrl;
        }, 800);
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    }
  });
}
