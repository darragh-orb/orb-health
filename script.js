// Mobile video source switching
const heroVideo = document.getElementById("heroVideo");
if (heroVideo) {
  const src = window.innerWidth <= 768
    ? "assets/website_video_mobile.mp4"
    : "assets/website_video.mp4";
  heroVideo.querySelector("source").src = src;
  heroVideo.load();
}

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Fade-in on scroll
const fadeObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    }
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".fade-in").forEach((el) => fadeObserver.observe(el));

/**
 * NAV TEXT COLOUR SWITCHING (reliable)
 * - Nav stays transparent
 * - Text is white by default
 * - Turns dark grey only when the section under the nav has data-nav="light"
 */
const topbar = document.querySelector(".topbar");

function updateNavColour() {
  const navHeight = topbar.getBoundingClientRect().height;
  const x = 24;
  const y = Math.min(window.innerHeight - 1, navHeight + 8);

  const elements = document.elementsFromPoint(x, y);

  const target = elements.find(
    (el) => el.matches("section, footer") && el.hasAttribute("data-nav")
  );

  if (target && target.getAttribute("data-nav") === "light") {
    topbar.classList.add("on-light");
  } else {
    topbar.classList.remove("on-light");
  }
}

updateNavColour();
window.addEventListener("scroll", updateNavColour, { passive: true });
window.addEventListener("resize", updateNavColour);


// Mobile nav (full-screen)
const navToggle = document.getElementById("navToggle");
const mobileNav = document.getElementById("mobileNav");

function openMenu() {
  mobileNav.classList.add("is-open");
  navToggle.classList.add("is-open");
  topbar.classList.add("menu-open");
  navToggle.setAttribute("aria-expanded", "true");
  navToggle.setAttribute("aria-label", "Close menu");
  mobileNav.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeMenu() {
  mobileNav.classList.remove("is-open");
  navToggle.classList.remove("is-open");
  topbar.classList.remove("menu-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open menu");
  mobileNav.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

navToggle?.addEventListener("click", () => {
  const isOpen = mobileNav.classList.contains("is-open");
  isOpen ? closeMenu() : openMenu();
});

document.querySelectorAll(".mobile-nav__link").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

// Word-by-word quote animation
document.querySelectorAll('.pull-quote p').forEach(p => {
  const words = p.textContent.trim().split(/\s+/);
  p.innerHTML = words
    .map((w, i) => `<span class="word" style="transition-delay:${i * 0.07}s">${w}</span>`)
    .join(' ');
});

const quoteObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.word').forEach(w => w.classList.add('is-visible'));
        quoteObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll('.pull-quote').forEach(q => quoteObserver.observe(q));

// Cinematic carousel
function initCarousel(root) {
  if (!root) return;

  const track = root.querySelector(".carousel__track");
  const isMobile = window.innerWidth <= 768;
  const slides = Array.from(root.querySelectorAll(".carousel__slide")).filter(
    s => !isMobile || !s.classList.contains("carousel__slide--desktop-only")
  );
  const dotsWrap = root.querySelector(".carousel__dots");
  const prevBtn = root.querySelector(".carousel__zone--prev");
  const nextBtn = root.querySelector(".carousel__zone--next");

  if (!track || !slides.length || !dotsWrap || !prevBtn || !nextBtn) return;

  let index = 0;

  function clampIndex(i) {
    if (i < 0) return slides.length - 1;
    if (i >= slides.length) return 0;
    return i;
  }

  function updateDots() {
    const dots = Array.from(dotsWrap.children);
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
  }

  function goTo(i) {
    index = clampIndex(i);
    track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
    updateDots();
  }

  function buildDots() {
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "carousel__dot";
      button.setAttribute("aria-label", `Go to image ${i + 1}`);
      button.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(button);
    });
  }

  prevBtn.addEventListener("click", () => goTo(index - 1));
  nextBtn.addEventListener("click", () => goTo(index + 1));

  root.addEventListener("mousemove", (e) => {
    const rect = root.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    root.classList.add("is-hovering");
    root.classList.toggle("is-left", x < rect.width / 2);
    root.classList.toggle("is-right", x >= rect.width / 2);

    root.style.setProperty("--cx", `${x + 14}px`);
    root.style.setProperty("--cy", `${y + 14}px`);
  });

  root.addEventListener("mouseleave", () => {
    root.classList.remove("is-hovering", "is-left", "is-right");
  });

  root.style.setProperty("--cx", "50%");
  root.style.setProperty("--cy", "50%");

  let startX = null;

  root.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
    },
    { passive: true }
  );

  root.addEventListener(
    "touchend",
    (e) => {
      if (startX === null) return;

      const endX = e.changedTouches[0].clientX;
      const dx = endX - startX;
      startX = null;

      if (Math.abs(dx) < 35) return;
      if (dx < 0) goTo(index + 1);
      else goTo(index - 1);
    },
    { passive: true }
  );

  buildDots();
  goTo(0);
}

/* Initialise ALL carousels on the page */
document.querySelectorAll(".image-crop__inner.carousel").forEach(initCarousel);