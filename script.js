// ===== DOM Ready =====
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initCarousel();
  initProjectFilters();
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
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-fadeout');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 350);
  }, 2600);
}

// ===== Project Filtering =====
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (!filterBtns.length || !projectCards.length) return;

  // Auto-sync count badges to actual card categories
  filterBtns.forEach((btn) => {
    const filter = btn.getAttribute('data-filter');
    const countBadge = btn.querySelector('.filter-count');
    if (countBadge) {
      if (filter === 'all') {
        countBadge.textContent = projectCards.length;
      } else {
        const matches = Array.from(projectCards).filter((card) => {
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

      let visibleCount = 0;
      projectCards.forEach((card) => {
        const categories = (card.getAttribute('data-category') || '').trim().split(/\s+/);
        const isMatch = filter === 'all' || categories.includes(filter);

        if (isMatch) {
          card.classList.remove('is-hidden');
          card.style.display = '';
          // Smooth fade in
          card.style.transitionDelay = `${visibleCount * 70}ms`;
          visibleCount++;
          requestAnimationFrame(() => {
            card.classList.add('animate-in');
          });
        } else {
          card.classList.add('is-hidden');
          card.classList.remove('animate-in');
          card.style.transitionDelay = '0ms';
        }
      });
    });
  });
}
