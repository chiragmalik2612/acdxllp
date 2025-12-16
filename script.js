/* ============================================
   AcadXL - Main JavaScript
   ============================================ */

// ============================================
// URL Cleaning Function (Security)
// ============================================
(function () {
  try {
    const url = new URL(window.location.href);
    let changed = false;

    // Remove unsafe query params
    const unsafeParams = ["param1", "liveClassId", "mode"];
    unsafeParams.forEach((param) => {
      if (url.searchParams.has(param)) {
        url.searchParams.delete(param);
        changed = true;
      }
    });

    // Remove /zstream from path if exists
    if (url.pathname.endsWith("/zstream")) {
      url.pathname = url.pathname.replace(/\/zstream$/, "");
      changed = true;
    }

    // Check for encoded token inside param1 (if someone hardcoded it into the path)
    const suspiciousPatterns = [/eyJ[a-zA-Z0-9_-]{10,}/, /token/i];
    const fullUrl = decodeURIComponent(window.location.href);
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(fullUrl)) {
        changed = true;
        break;
      }
    }

    // If any change needed, redirect to clean URL
    if (changed) {
      window.location.replace(url.origin + url.pathname);
    }
  } catch (err) {
    console.warn("Error cleaning link:", err);
  }
})();

// ============================================
// Mobile Menu Toggle
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const navbarNav = document.querySelector(".navbar-nav");
  const hamburgerLines = document.querySelectorAll(".hamburger-line");

  if (mobileMenuToggle && navbarNav) {
    mobileMenuToggle.addEventListener("click", function () {
      const isExpanded = mobileMenuToggle.getAttribute("aria-expanded") === "true";
      
      // Toggle menu visibility
      navbarNav.classList.toggle("active");
      mobileMenuToggle.setAttribute("aria-expanded", !isExpanded);

      // Animate hamburger icon
      hamburgerLines.forEach((line, index) => {
        if (!isExpanded) {
          // Transform to X
          if (index === 0) {
            line.style.transform = "rotate(45deg) translate(8px, 8px)";
          } else if (index === 1) {
            line.style.opacity = "0";
          } else if (index === 2) {
            line.style.transform = "rotate(-45deg) translate(7px, -7px)";
          }
        } else {
          // Reset to hamburger
          line.style.transform = "";
          line.style.opacity = "";
        }
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (event) {
      if (
        !navbarNav.contains(event.target) &&
        !mobileMenuToggle.contains(event.target) &&
        navbarNav.classList.contains("active")
      ) {
        navbarNav.classList.remove("active");
        mobileMenuToggle.setAttribute("aria-expanded", "false");
        hamburgerLines.forEach((line) => {
          line.style.transform = "";
          line.style.opacity = "";
        });
      }
    });
  }
});

// ============================================
// Hero Slider Functionality
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  const slides = document.querySelectorAll(".hero-slide");
  const sliderDots = document.querySelectorAll(".slider-dot");
  let currentSlide = 0;
  let autoSlideInterval;
  let touchStartX = 0;
  let touchEndX = 0;

  // Function to show specific slide
  function showSlide(index) {
    // Remove active class from all slides and dots
    slides.forEach((slide) => {
      slide.classList.remove("active");
    });
    sliderDots.forEach((dot) => {
      dot.classList.remove("active");
      dot.setAttribute("aria-selected", "false");
    });

    // Add active class to current slide and dot
    if (slides[index]) {
      slides[index].classList.add("active");
    }
    if (sliderDots[index]) {
      sliderDots[index].classList.add("active");
      sliderDots[index].setAttribute("aria-selected", "true");
    }

    currentSlide = index;
  }

  // Function to go to next slide
  function nextSlide() {
    const nextIndex = (currentSlide + 1) % slides.length;
    showSlide(nextIndex);
  }

  // Function to go to previous slide
  function prevSlide() {
    const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prevIndex);
  }

  // Auto-slide functionality (5 seconds)
  function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
      nextSlide();
    }, 5000); // 5 seconds
  }

  function stopAutoSlide() {
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
    }
  }

  // Dot navigation
  sliderDots.forEach((dot, index) => {
    dot.addEventListener("click", function () {
      stopAutoSlide();
      showSlide(index);
      startAutoSlide();
    });
  });

  // Touch/Swipe functionality
  const heroSection = document.querySelector(".hero-section");
  if (heroSection) {
    heroSection.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].screenX;
    });

    heroSection.addEventListener("touchend", function (e) {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });

    function handleSwipe() {
      const swipeThreshold = 50; // Minimum swipe distance
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        stopAutoSlide();
        if (diff > 0) {
          // Swipe left - next slide
          nextSlide();
        } else {
          // Swipe right - previous slide
          prevSlide();
        }
        startAutoSlide();
      }
    }

    // Mouse drag support (optional)
    let isDragging = false;
    let dragStartX = 0;

    heroSection.addEventListener("mousedown", function (e) {
      isDragging = true;
      dragStartX = e.clientX;
      stopAutoSlide();
    });

    heroSection.addEventListener("mousemove", function (e) {
      if (!isDragging) return;
      e.preventDefault();
    });

    heroSection.addEventListener("mouseup", function (e) {
      if (!isDragging) return;
      isDragging = false;
      const dragEndX = e.clientX;
      const diff = dragStartX - dragEndX;
      const swipeThreshold = 50;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
      startAutoSlide();
    });

    heroSection.addEventListener("mouseleave", function () {
      isDragging = false;
      startAutoSlide();
    });
  }

  // Pause auto-slide on hover
  if (heroSection) {
    heroSection.addEventListener("mouseenter", stopAutoSlide);
    heroSection.addEventListener("mouseleave", startAutoSlide);
  }

  // Initialize
  if (slides.length > 0) {
    showSlide(0);
    startAutoSlide();
  }
});

// ============================================
// Smooth Scroll for Anchor Links
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = link.getAttribute("href");
      if (href !== "#" && href !== "") {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    });
  });
});

// ============================================
// Navbar Sticky Behavior Enhancement
// ============================================
window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.12)";
  } else {
    navbar.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
  }
});

// ============================================
// Page Load Animation
// ============================================
window.addEventListener("load", function () {
  console.log("AcadXL page loaded successfully");
  
  // Animate first slide on load
  const firstSlide = document.querySelector(".hero-slide.active");
  if (firstSlide) {
    const heroElements = firstSlide.querySelectorAll(".hero-text, .hero-image");
    heroElements.forEach((element, index) => {
      element.style.opacity = "0";
      element.style.transform = "translateY(30px)";
      
      setTimeout(() => {
        element.style.transition = "opacity 0.8s ease, transform 0.8s ease";
        element.style.opacity = "1";
        element.style.transform = "translateY(0)";
      }, index * 200);
    });
  }
});
