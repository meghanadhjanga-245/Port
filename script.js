// ===== DOM Ready =====
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initCarousel();
  initSmoothScroll();
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
