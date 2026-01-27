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

// Better, smoothed hero parallax
const hero = document.getElementById("hero");
const heroBg = hero?.querySelector(".hero__bg");
const heroText = document.getElementById("heroText");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let currentBg = 0;
let currentText = 0;
let targetBg = 0;
let targetText = 0;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function computeTargets() {
  if (!hero || !heroBg || !heroText) return;

  const rect = hero.getBoundingClientRect();
  const vh = window.innerHeight;

  const progress = clamp((vh - rect.top) / (vh + rect.height), 0, 1);

  targetBg = -progress * 18;
  targetText = progress * 10;
}

function animate() {
  if (!hero || !heroBg || !heroText) return;

  const ease = 0.09;

  currentBg = lerp(currentBg, targetBg, ease);
  currentText = lerp(currentText, targetText, ease);

  heroBg.style.transform = `translate3d(0, ${currentBg}px, 0) scale(1.06)`;
  heroText.style.transform = `translate3d(0, ${currentText}px, 0)`;

  requestAnimationFrame(animate);
}

if (!reduceMotion && hero && heroBg && heroText) {
  computeTargets();
  window.addEventListener("scroll", computeTargets, { passive: true });
  window.addEventListener("resize", computeTargets);
  requestAnimationFrame(animate);
} else {
  if (heroText) heroText.style.transform = "none";
}

// Mobile nav (full-screen)
const navToggle = document.getElementById("navToggle");
const mobileNav = document.getElementById("mobileNav");
const navClose = document.getElementById("navClose");

function openMenu() {
  mobileNav.classList.add("is-open");
  navToggle.setAttribute("aria-expanded", "true");
  mobileNav.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeMenu() {
  mobileNav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  mobileNav.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

navToggle?.addEventListener("click", () => {
  const isOpen = mobileNav.classList.contains("is-open");
  isOpen ? closeMenu() : openMenu();
});

navClose?.addEventListener("click", closeMenu);

document.querySelectorAll(".mobile-nav__link").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

// Cinematic carousel
(function initCinematicCarousel() {
  const root = document.getElementById("cinematicCarousel");
  if (!root) return;

  const track = root.querySelector(".carousel__track");
  const slides = Array.from(root.querySelectorAll(".carousel__slide"));
  const dotsWrap = root.querySelector(".carousel__dots");
  const prevBtn = root.querySelector(".carousel__zone--prev");
  const nextBtn = root.querySelector(".carousel__zone--next");

  let index = 0;

  function clampIndex(i) {
    if (i < 0) return slides.length - 1;
    if (i >= slides.length) return 0;
    return i;
  }

  function goTo(i) {
    index = clampIndex(i);
    track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
    updateDots();
  }

  function buildDots() {
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "carousel__dot";
      b.setAttribute("aria-label", `Go to image ${i + 1}`);
      b.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(b);
    });
  }

  function updateDots() {
    const dots = Array.from(dotsWrap.children);
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
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

  root.style.setProperty("--cx", `50%`);
  root.style.setProperty("--cy", `50%`);

  // Touch swipe (mobile)
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
})();
