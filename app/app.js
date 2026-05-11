(function () {
  const header = document.querySelector("[data-header]");
  const navCollapse = document.getElementById("mainNav");

  function syncHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  }

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  if (navCollapse) {
    navCollapse.addEventListener("show.bs.collapse", () => header.classList.add("menu-open"));
    navCollapse.addEventListener("hidden.bs.collapse", () => header.classList.remove("menu-open"));
    navCollapse.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        const collapse = bootstrap.Collapse.getInstance(navCollapse);
        if (collapse) collapse.hide();
      });
    });
  }

  const auctionItemsCarousel = document.getElementById("auctionItemsCarousel");
  if (auctionItemsCarousel && window.bootstrap) {
    const carousel = new bootstrap.Carousel(auctionItemsCarousel, {
      interval: 1800,
      ride: "carousel",
      pause: false,
      touch: false,
      wrap: true,
    });
    carousel.cycle();
  }

  const winnersCarousel = document.querySelector("[data-winners-carousel]");
  if (winnersCarousel) {
    const track = winnersCarousel.querySelector(".winners-track");
    const originals = track ? Array.from(track.children) : [];
    let currentIndex = 0;
    let stepWidth = 0;
    let autoAdvance;

    function measure() {
      const firstCard = track.querySelector("article");
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || "0");
      stepWidth = firstCard ? firstCard.getBoundingClientRect().width + gap : 0;
      track.style.transition = "none";
      track.style.transform = `translateX(-${stepWidth * currentIndex}px)`;
      requestAnimationFrame(() => {
        track.style.transition = "transform .62s ease";
      });
    }

    function goNext() {
      currentIndex += 1;
      track.style.transform = `translateX(-${stepWidth * currentIndex}px)`;
    }

    if (track && originals.length > 1) {
      const clonesNeeded = 3;
      originals.slice(0, clonesNeeded).forEach((card) => {
        const clone = card.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      });

      measure();
      window.addEventListener("resize", measure, { passive: true });
      track.addEventListener("transitionend", () => {
        if (currentIndex >= originals.length) {
          currentIndex = 0;
          track.style.transition = "none";
          track.style.transform = "translateX(0)";
          requestAnimationFrame(() => {
            track.style.transition = "transform .62s ease";
          });
        }
      });

      autoAdvance = window.setInterval(goNext, 2200);
      winnersCarousel.addEventListener("mouseenter", () => window.clearInterval(autoAdvance));
      winnersCarousel.addEventListener("mouseleave", () => {
        autoAdvance = window.setInterval(goNext, 2200);
      });
    }
  }

  const revealItems = document.querySelectorAll(".reveal");
  function syncChallengeProgress(root = document) {
    root.querySelectorAll(".challenge-progress span[data-progress]").forEach((bar) => {
      bar.style.width = "0%";
      bar.classList.remove("is-animated");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bar.style.width = `${bar.dataset.progress || "0"}%`;
          bar.classList.add("is-animated");
        });
      });
    });
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const replayStroke = entry.target.querySelector(".script-stroke");
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            syncChallengeProgress(entry.target);
            if (!replayStroke) {
              observer.unobserve(entry.target);
            }
          } else if (replayStroke) {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px 22% 0px" }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => {
      item.classList.add("is-visible");
      syncChallengeProgress(item);
    });
  }

})();
