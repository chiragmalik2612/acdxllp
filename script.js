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

  // Dropdown toggle for mobile
  const dropdownItems = document.querySelectorAll(".nav-item-dropdown");
  
  dropdownItems.forEach((item) => {
    const navLink = item.querySelector(".nav-link");
    
    navLink.addEventListener("click", (e) => {
      // Only prevent default on mobile
      if (window.innerWidth <= 768) {
        e.preventDefault();
        item.classList.toggle("active");
      }
    });
  });

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
// Simple Scroll for Anchor Links
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
            behavior: "auto",
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

// ============================================
// Scroll Animations (Intersection Observer) - DISABLED
// ============================================
// Scroll animations have been removed for simple scrolling

// ============================================
// Faculty Carousel Functionality
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  const carouselTrack = document.getElementById("facultyCarousel");
  const prevBtn = document.querySelector(".carousel-btn-prev");
  const nextBtn = document.querySelector(".carousel-btn-next");
  const carouselDots = document.getElementById("carouselDots");
  const facultyCards = document.querySelectorAll(".faculty-card");

  if (!carouselTrack || facultyCards.length === 0) return;

  let currentIndex = 0;
  let cardsPerView = 4; // Default: show 4 cards
  let totalCards = facultyCards.length;
  let maxIndex = Math.max(0, totalCards - cardsPerView);

  // Calculate cards per view based on screen size
  function updateCardsPerView() {
    const width = window.innerWidth;
    if (width <= 480) {
      cardsPerView = 1;
    } else if (width <= 768) {
      cardsPerView = 2;
    } else if (width <= 1024) {
      cardsPerView = 3;
    } else {
      cardsPerView = 4;
    }
    maxIndex = Math.max(0, totalCards - cardsPerView);
    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }
    updateCarousel();
    updateDots();
  }

  // Calculate card width including gap
  function getCardWidth() {
    const card = facultyCards[0];
    if (!card) return 0;
    const cardWidth = card.offsetWidth;
    const width = window.innerWidth;
    let gap = 24; // default gap
    
    // Adjust gap for mobile
    if (width <= 480) {
      gap = 16;
    }
    
    return cardWidth + gap;
  }

  // Update carousel position
  function updateCarousel() {
    const cardWidth = getCardWidth();
    const width = window.innerWidth;
    let translateX = -currentIndex * cardWidth;
    
    // Center the first card on mobile
    if (width <= 480) {
      const container = carouselTrack.parentElement;
      if (container) {
        const containerWidth = container.offsetWidth;
        const card = facultyCards[0];
        if (card) {
          const cardActualWidth = card.offsetWidth;
          const centerOffset = (containerWidth - cardActualWidth) / 2;
          // For first card, add offset. For subsequent cards, maintain spacing
          if (currentIndex === 0) {
            translateX = centerOffset;
          } else {
            translateX = centerOffset - (currentIndex * cardWidth);
          }
        }
      }
    }
    
    carouselTrack.style.transform = `translateX(${translateX}px)`;
    updateButtons();
  }

  // Update navigation buttons state
  function updateButtons() {
    if (prevBtn) {
      prevBtn.disabled = currentIndex === 0;
    }
    if (nextBtn) {
      nextBtn.disabled = currentIndex >= maxIndex;
    }
  }

  // Create dots indicator
  function createDots() {
    if (!carouselDots) return;
    carouselDots.innerHTML = "";
    const totalDots = Math.ceil(totalCards / cardsPerView);
    
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement("button");
      dot.className = "carousel-dot";
      if (i === 0) dot.classList.add("active");
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", () => {
        currentIndex = i * cardsPerView;
        if (currentIndex > maxIndex) currentIndex = maxIndex;
        updateCarousel();
        updateDots();
      });
      carouselDots.appendChild(dot);
    }
  }

  // Update dots active state
  function updateDots() {
    if (!carouselDots) return;
    const dots = carouselDots.querySelectorAll(".carousel-dot");
    const activeDotIndex = Math.floor(currentIndex / cardsPerView);
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === activeDotIndex);
    });
  }

  // Next button click
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentIndex < maxIndex) {
        currentIndex++;
        updateCarousel();
        updateDots();
      }
    });
  }

  // Previous button click
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
        updateDots();
      }
    });
  }

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  let isDragging = false;
  let dragStartX = 0;

  if (carouselTrack) {
    // Touch events
    carouselTrack.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
    });

    carouselTrack.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].clientX;
      handleSwipe();
    });

    // Mouse drag events
    carouselTrack.addEventListener("mousedown", (e) => {
      isDragging = true;
      dragStartX = e.clientX;
      carouselTrack.style.cursor = "grabbing";
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      e.preventDefault();
    });

    document.addEventListener("mouseup", (e) => {
      if (isDragging) {
        isDragging = false;
        carouselTrack.style.cursor = "grab";
        const dragEndX = e.clientX;
        const diff = dragStartX - dragEndX;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
          if (diff > 0 && currentIndex < maxIndex) {
            currentIndex++;
          } else if (diff < 0 && currentIndex > 0) {
            currentIndex--;
          }
          updateCarousel();
          updateDots();
        }
      }
    });

    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0 && currentIndex < maxIndex) {
          // Swipe left - next
          currentIndex++;
        } else if (diff < 0 && currentIndex > 0) {
          // Swipe right - previous
          currentIndex--;
        }
        updateCarousel();
        updateDots();
      }
    }
  }

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    
    if (e.key === "ArrowLeft" && currentIndex > 0) {
      currentIndex--;
      updateCarousel();
      updateDots();
    } else if (e.key === "ArrowRight" && currentIndex < maxIndex) {
      currentIndex++;
      updateCarousel();
      updateDots();
    }
  });

  // Handle window resize
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateCardsPerView();
      createDots();
    }, 250);
  });

  // Initialize
  updateCardsPerView();
  createDots();
  updateButtons();
  carouselTrack.style.cursor = "grab";
});

// ============================================
// Testimonials Carousel Functionality
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  const testimonialsCarouselTrack = document.getElementById("testimonialsCarousel");
  const testimonialsPrevBtn = document.querySelector(".testimonial-carousel-btn-prev");
  const testimonialsNextBtn = document.querySelector(".testimonial-carousel-btn-next");
  const testimonialsCarouselDots = document.getElementById("testimonialsCarouselDots");
  const testimonialCards = document.querySelectorAll(".testimonial-card");

  if (!testimonialsCarouselTrack || testimonialCards.length === 0) return;

  let currentTestimonialIndex = 0;
  let testimonialsPerView = 4; // Default: show 4 cards
  let totalTestimonials = testimonialCards.length;
  let maxTestimonialIndex = Math.max(0, totalTestimonials - testimonialsPerView);

  // Calculate cards per view based on screen size
  function updateTestimonialsPerView() {
    const width = window.innerWidth;
    if (width <= 480) {
      testimonialsPerView = 1;
    } else if (width <= 768) {
      testimonialsPerView = 2;
    } else if (width <= 1024) {
      testimonialsPerView = 3;
    } else {
      testimonialsPerView = 4;
    }
    maxTestimonialIndex = Math.max(0, totalTestimonials - testimonialsPerView);
    if (currentTestimonialIndex > maxTestimonialIndex) {
      currentTestimonialIndex = maxTestimonialIndex;
    }
    updateTestimonialsCarousel();
    updateTestimonialsDots();
  }

  // Calculate card width including gap
  function getTestimonialCardWidth() {
    const card = testimonialCards[0];
    if (!card) return 0;
    const cardWidth = card.offsetWidth;
    const gap = 24; // gap between cards
    return cardWidth + gap;
  }

  // Update carousel position
  function updateTestimonialsCarousel() {
    const cardWidth = getTestimonialCardWidth();
    const translateX = -currentTestimonialIndex * cardWidth;
    testimonialsCarouselTrack.style.transform = `translateX(${translateX}px)`;
    updateTestimonialsButtons();
  }

  // Update navigation buttons state
  function updateTestimonialsButtons() {
    if (testimonialsPrevBtn) {
      testimonialsPrevBtn.disabled = currentTestimonialIndex === 0;
    }
    if (testimonialsNextBtn) {
      testimonialsNextBtn.disabled = currentTestimonialIndex >= maxTestimonialIndex;
    }
  }

  // Create dots indicator
  function createTestimonialsDots() {
    if (!testimonialsCarouselDots) return;
    testimonialsCarouselDots.innerHTML = "";
    const totalDots = Math.ceil(totalTestimonials / testimonialsPerView);
    
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement("button");
      dot.className = "testimonials-carousel-dot";
      if (i === 0) dot.classList.add("active");
      dot.setAttribute("aria-label", `Go to testimonial ${i + 1}`);
      dot.addEventListener("click", () => {
        currentTestimonialIndex = i * testimonialsPerView;
        if (currentTestimonialIndex > maxTestimonialIndex) currentTestimonialIndex = maxTestimonialIndex;
        updateTestimonialsCarousel();
        updateTestimonialsDots();
      });
      testimonialsCarouselDots.appendChild(dot);
    }
  }

  // Update dots active state
  function updateTestimonialsDots() {
    if (!testimonialsCarouselDots) return;
    const dots = testimonialsCarouselDots.querySelectorAll(".testimonials-carousel-dot");
    const activeDotIndex = Math.floor(currentTestimonialIndex / testimonialsPerView);
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === activeDotIndex);
    });
  }

  // Next button click
  if (testimonialsNextBtn) {
    testimonialsNextBtn.addEventListener("click", () => {
      if (currentTestimonialIndex < maxTestimonialIndex) {
        currentTestimonialIndex++;
        updateTestimonialsCarousel();
        updateTestimonialsDots();
      }
    });
  }

  // Previous button click
  if (testimonialsPrevBtn) {
    testimonialsPrevBtn.addEventListener("click", () => {
      if (currentTestimonialIndex > 0) {
        currentTestimonialIndex--;
        updateTestimonialsCarousel();
        updateTestimonialsDots();
      }
    });
  }

  // Touch/swipe support
  let testimonialsTouchStartX = 0;
  let testimonialsTouchEndX = 0;
  let isTestimonialsDragging = false;
  let testimonialsDragStartX = 0;

  if (testimonialsCarouselTrack) {
    // Touch events
    testimonialsCarouselTrack.addEventListener("touchstart", (e) => {
      testimonialsTouchStartX = e.touches[0].clientX;
    });

    testimonialsCarouselTrack.addEventListener("touchend", (e) => {
      testimonialsTouchEndX = e.changedTouches[0].clientX;
      handleTestimonialsSwipe();
    });

    // Mouse drag events
    testimonialsCarouselTrack.addEventListener("mousedown", (e) => {
      isTestimonialsDragging = true;
      testimonialsDragStartX = e.clientX;
      testimonialsCarouselTrack.style.cursor = "grabbing";
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (!isTestimonialsDragging) return;
      e.preventDefault();
    });

    document.addEventListener("mouseup", (e) => {
      if (isTestimonialsDragging) {
        isTestimonialsDragging = false;
        testimonialsCarouselTrack.style.cursor = "grab";
        const dragEndX = e.clientX;
        const diff = testimonialsDragStartX - dragEndX;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
          if (diff > 0 && currentTestimonialIndex < maxTestimonialIndex) {
            currentTestimonialIndex++;
          } else if (diff < 0 && currentTestimonialIndex > 0) {
            currentTestimonialIndex--;
          }
          updateTestimonialsCarousel();
          updateTestimonialsDots();
        }
      }
    });

    function handleTestimonialsSwipe() {
      const swipeThreshold = 50;
      const diff = testimonialsTouchStartX - testimonialsTouchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0 && currentTestimonialIndex < maxTestimonialIndex) {
          // Swipe left - next
          currentTestimonialIndex++;
        } else if (diff < 0 && currentTestimonialIndex > 0) {
          // Swipe right - previous
          currentTestimonialIndex--;
        }
        updateTestimonialsCarousel();
        updateTestimonialsDots();
      }
    }
  }

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (!document.querySelector(".testimonials-section")) return;
    
    if (e.key === "ArrowLeft" && currentTestimonialIndex > 0) {
      currentTestimonialIndex--;
      updateTestimonialsCarousel();
      updateTestimonialsDots();
    } else if (e.key === "ArrowRight" && currentTestimonialIndex < maxTestimonialIndex) {
      currentTestimonialIndex++;
      updateTestimonialsCarousel();
      updateTestimonialsDots();
    }
  });

  // Handle window resize
  let testimonialsResizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(testimonialsResizeTimeout);
    testimonialsResizeTimeout = setTimeout(() => {
      updateTestimonialsPerView();
      createTestimonialsDots();
    }, 250);
  });

  // Initialize
  updateTestimonialsPerView();
  createTestimonialsDots();
  updateTestimonialsButtons();
  if (testimonialsCarouselTrack) {
    testimonialsCarouselTrack.style.cursor = "grab";
  }
});

// ============================================
// Videos Carousel
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  const videosCarouselTrack = document.getElementById("videosCarousel");
  const videosPrevBtn = document.querySelector(".video-carousel-btn-prev");
  const videosNextBtn = document.querySelector(".video-carousel-btn-next");
  const videosCarouselDots = document.getElementById("videosCarouselDots");
  const videoCards = document.querySelectorAll(".video-card");

  if (!videosCarouselTrack || videoCards.length === 0) return;

  let currentVideoIndex = 0;
  let videosPerView = 4; // Default: show 4 cards
  let totalVideos = videoCards.length;
  let maxVideoIndex = Math.max(0, totalVideos - videosPerView);

  // Update videos per view based on screen size
  function updateVideosPerView() {
    const width = window.innerWidth;
    if (width <= 480) {
      videosPerView = 1;
    } else if (width <= 768) {
      videosPerView = 2;
    } else if (width <= 1024) {
      videosPerView = 2;
    } else if (width <= 1200) {
      videosPerView = 3;
    } else {
      videosPerView = 4;
    }
    maxVideoIndex = Math.max(0, totalVideos - videosPerView);
    if (currentVideoIndex > maxVideoIndex) {
      currentVideoIndex = maxVideoIndex;
    }
    updateVideosCarousel();
    updateVideosButtons();
  }

  // Get card width including gap
  function getVideoCardWidth() {
    if (videoCards.length === 0) return 0;
    const card = videoCards[0];
    const cardStyle = window.getComputedStyle(card);
    const cardWidth = card.offsetWidth;
    const gap = 24;
    return cardWidth + gap;
  }

  // Update carousel position
  function updateVideosCarousel() {
    const cardWidth = getVideoCardWidth();
    const translateX = -currentVideoIndex * cardWidth;
    videosCarouselTrack.style.transform = `translateX(${translateX}px)`;
    updateVideosButtons();
  }

  // Update navigation buttons state
  function updateVideosButtons() {
    if (videosPrevBtn) {
      videosPrevBtn.disabled = currentVideoIndex === 0;
    }
    if (videosNextBtn) {
      videosNextBtn.disabled = currentVideoIndex >= maxVideoIndex;
    }
  }

  // Create dots indicator
  function createVideosDots() {
    if (!videosCarouselDots) return;
    videosCarouselDots.innerHTML = "";
    const totalDots = Math.ceil(totalVideos / videosPerView);
    
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement("button");
      dot.className = "video-carousel-dot";
      if (i === 0) dot.classList.add("active");
      dot.setAttribute("aria-label", `Go to video ${i + 1}`);
      dot.addEventListener("click", () => {
        currentVideoIndex = i * videosPerView;
        if (currentVideoIndex > maxVideoIndex) currentVideoIndex = maxVideoIndex;
        updateVideosCarousel();
        updateVideosDots();
      });
      videosCarouselDots.appendChild(dot);
    }
  }

  // Update dots active state
  function updateVideosDots() {
    if (!videosCarouselDots) return;
    const dots = videosCarouselDots.querySelectorAll(".video-carousel-dot");
    const activeDotIndex = Math.floor(currentVideoIndex / videosPerView);
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === activeDotIndex);
    });
  }

  // Next button click
  if (videosNextBtn) {
    videosNextBtn.addEventListener("click", () => {
      if (currentVideoIndex < maxVideoIndex) {
        currentVideoIndex++;
        updateVideosCarousel();
        updateVideosDots();
      }
    });
  }

  // Previous button click
  if (videosPrevBtn) {
    videosPrevBtn.addEventListener("click", () => {
      if (currentVideoIndex > 0) {
        currentVideoIndex--;
        updateVideosCarousel();
        updateVideosDots();
      }
    });
  }

  // Touch/swipe support
  let videosTouchStartX = 0;
  let videosTouchEndX = 0;
  let isVideosDragging = false;
  let videosDragStartX = 0;

  if (videosCarouselTrack) {
    // Touch events
    videosCarouselTrack.addEventListener("touchstart", (e) => {
      videosTouchStartX = e.touches[0].clientX;
    });

    videosCarouselTrack.addEventListener("touchend", (e) => {
      videosTouchEndX = e.changedTouches[0].clientX;
      handleVideosSwipe();
    });

    // Mouse drag events
    videosCarouselTrack.addEventListener("mousedown", (e) => {
      isVideosDragging = true;
      videosDragStartX = e.clientX;
      videosCarouselTrack.style.cursor = "grabbing";
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (!isVideosDragging) return;
      e.preventDefault();
    });

    document.addEventListener("mouseup", (e) => {
      if (isVideosDragging) {
        isVideosDragging = false;
        videosCarouselTrack.style.cursor = "grab";
        const dragEndX = e.clientX;
        const diff = videosDragStartX - dragEndX;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
          if (diff > 0 && currentVideoIndex < maxVideoIndex) {
            currentVideoIndex++;
          } else if (diff < 0 && currentVideoIndex > 0) {
            currentVideoIndex--;
          }
          updateVideosCarousel();
          updateVideosDots();
        }
      }
    });

    function handleVideosSwipe() {
      const swipeThreshold = 50;
      const diff = videosTouchStartX - videosTouchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0 && currentVideoIndex < maxVideoIndex) {
          // Swipe left - next
          currentVideoIndex++;
        } else if (diff < 0 && currentVideoIndex > 0) {
          // Swipe right - previous
          currentVideoIndex--;
        }
        updateVideosCarousel();
        updateVideosDots();
      }
    }
  }

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (!document.querySelector(".videos-section")) return;
    
    if (e.key === "ArrowLeft" && currentVideoIndex > 0) {
      currentVideoIndex--;
      updateVideosCarousel();
      updateVideosDots();
    } else if (e.key === "ArrowRight" && currentVideoIndex < maxVideoIndex) {
      currentVideoIndex++;
      updateVideosCarousel();
      updateVideosDots();
    }
  });

  // Handle window resize
  let videosResizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(videosResizeTimeout);
    videosResizeTimeout = setTimeout(() => {
      updateVideosPerView();
      createVideosDots();
    }, 250);
  });

  // Initialize
  updateVideosPerView();
  createVideosDots();
  updateVideosButtons();
  if (videosCarouselTrack) {
    videosCarouselTrack.style.cursor = "grab";
  }

  // Add click handlers to video cards (you can update these URLs with actual YouTube video IDs)
  videoCards.forEach((card, index) => {
    card.addEventListener("click", () => {
      // Example: Replace with actual YouTube video URLs
      const videoUrls = [
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Replace with actual video ID
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      ];
      if (videoUrls[index]) {
        window.open(videoUrls[index], "_blank", "noopener,noreferrer");
      }
    });
  });
});

// ============================================
// FAQ Accordion
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  const faqItems = document.querySelectorAll(".faq-item");
  const faqQuestions = document.querySelectorAll(".faq-question");
  const hiddenFaqItems = document.querySelectorAll(".faq-item-hidden");
  const showMoreBtn = document.getElementById("faqShowMoreBtn");
  const showMoreText = showMoreBtn?.querySelector(".faq-show-more-text");
  let isExpanded = false;

  // FAQ accordion functionality
  faqQuestions.forEach((question, index) => {
    question.addEventListener("click", () => {
      const faqItem = faqItems[index];
      const isActive = faqItem.classList.contains("active");

      // Close all FAQ items
      faqItems.forEach((item) => {
        item.classList.remove("active");
        const btn = item.querySelector(".faq-question");
        if (btn) {
          btn.setAttribute("aria-expanded", "false");
        }
      });

      // Open clicked item if it wasn't active
      if (!isActive) {
        faqItem.classList.add("active");
        question.setAttribute("aria-expanded", "true");
      }
    });
  });

  // Show More/Less functionality
  if (showMoreBtn && showMoreText) {
    showMoreBtn.addEventListener("click", () => {
      isExpanded = !isExpanded;

      hiddenFaqItems.forEach((item) => {
        if (isExpanded) {
          item.classList.add("show");
        } else {
          item.classList.remove("show");
        }
      });

      // Update button text and icon
      if (isExpanded) {
        showMoreText.textContent = "Show Less";
        showMoreBtn.classList.add("expanded");
      } else {
        showMoreText.textContent = "Show More";
        showMoreBtn.classList.remove("expanded");
      }
    });
  }
});

// ============================================
// Entrance Animations on Scroll
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  // Add animation classes to elements
  const sections = document.querySelectorAll(
    ".offer-section, .exam-categories-section, .faculties-section, .testimonials-section, .trust-section"
  );
  
  const sectionTitles = document.querySelectorAll(
    ".offer-section-title, .exam-section-title, .faculties-section-title, .testimonials-title, .trust-headline"
  );
  
  const sectionSubtitles = document.querySelectorAll(
    ".exam-section-subtitle, .faculties-section-subtitle, .testimonials-label"
  );
  
  const offerCards = document.querySelectorAll(".offer-card");
  const examCards = document.querySelectorAll(".exam-card");
  const facultyCards = document.querySelectorAll(".faculty-card");
  const testimonialCards = document.querySelectorAll(".testimonial-card");
  const founderCard = document.querySelector(".founder-card");

  // Add animation classes
  sections.forEach((section) => {
    section.classList.add("fade-in");
  });

  sectionTitles.forEach((title) => {
    title.classList.add("fade-in-up");
  });

  sectionSubtitles.forEach((subtitle) => {
    subtitle.classList.add("fade-in-up", "stagger-1");
  });

  // Animate offer cards with stagger
  offerCards.forEach((card, index) => {
    card.classList.add("slide-up");
    if (index % 4 === 0) card.classList.add("stagger-1");
    else if (index % 4 === 1) card.classList.add("stagger-2");
    else if (index % 4 === 2) card.classList.add("stagger-3");
    else card.classList.add("stagger-4");
  });

  // Animate exam cards with stagger
  examCards.forEach((card, index) => {
    card.classList.add("slide-up");
    if (index % 3 === 0) card.classList.add("stagger-1");
    else if (index % 3 === 1) card.classList.add("stagger-2");
    else card.classList.add("stagger-3");
  });

  // Animate founder card
  if (founderCard) {
    founderCard.classList.add("slide-up");
  }

  // Animate faculty cards
  facultyCards.forEach((card, index) => {
    card.classList.add("fade-in-up");
    if (index < 4) {
      card.classList.add(`stagger-${(index % 4) + 1}`);
    }
  });

  // Animate testimonial cards
  testimonialCards.forEach((card, index) => {
    card.classList.add("slide-up");
    if (index < 4) {
      card.classList.add(`stagger-${(index % 4) + 1}`);
    }
  });

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        // Unobserve after animation to improve performance
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all animated elements
  const animatedElements = document.querySelectorAll(
    ".fade-in, .fade-in-up, .slide-up, .slide-in-left, .slide-in-right"
  );
  
  animatedElements.forEach((element) => {
    observer.observe(element);
  });

  // Animate trust section content
  const trustText = document.querySelector(".trust-text");
  const trustIllustration = document.querySelector(".trust-illustration");
  
  if (trustText) {
    trustText.classList.add("slide-in-left");
    observer.observe(trustText);
  }
  
  if (trustIllustration) {
    trustIllustration.classList.add("slide-in-right", "stagger-1");
    observer.observe(trustIllustration);
  }
});
