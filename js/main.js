(() => {
  'use strict';

  /* ---------------------------------------------------------
     Room data
     Each room's primary video lives in assets/videos/.
     Swap `video` for one of the listed backups any time —
     no other markup changes are needed.
  --------------------------------------------------------- */
  const ROOMS = {
    resources: {
      title: 'Resources',
      eyebrow: 'Life-giving. Abundant.',
      video: 'assets/videos/R_crashing_waves.mp4',
      backups: [
        'assets/videos/R_majestic_waterfall_one_person_way_back.mp4',
        'assets/videos/R_ocean_view_behind_a_stalk_of_wheat.mp4',
        'assets/videos/R_wow_exotic_cliff_formation_beach.mp4',
        'assets/videos/R_tall_grass_blowing.mp4'
      ],
      description: "Life poured out, not measured in drops. Sermons, teachings, and practical resources that overflow — because you were never meant to run on empty.",
      cta: 'Explore Resources'
    },
    community: {
      title: 'Community',
      eyebrow: 'Real people. Real conversations.',
      video: 'assets/videos/C_group_of_old_men_talking.mp4',
      backups: [
        'assets/videos/C_funny_couple_dancing.mp4',
        'assets/videos/c_couple_talking.mp4'
      ],
      description: 'Pull up a chair. This is where real people wrestle with real life — no performing required, just honest conversation and people who’ll walk with you.',
      cta: 'Join the Community'
    },
    scripture: {
      title: 'Scripture',
      eyebrow: 'Immerse in the Word.',
      video: 'assets/videos/S_hands_on_bible.mp4',
      backups: [
        'assets/videos/S_bible_study_group.mp4',
        'assets/videos/S_man_on_stairs_reading_bible.mp4',
        'assets/videos/S_man_singing_in_choir_robe.mp4'
      ],
      description: 'Come sit in the Word a while. Slow down, open the pages, and let it read you back — verse by verse, day by day.',
      cta: 'Open Scripture'
    },
    tools: {
      title: 'Tools',
      eyebrow: 'Build what God called you to build.',
      video: 'assets/videos/T_man_working_with_tools.mp4',
      backups: [
        'assets/videos/t_men_on_high_rise_scaffolding.mp4',
        'assets/videos/t_woman_hands_on_a_keyboard.mp4',
        'assets/videos/t_gears_shifting.mp4',
        'assets/videos/t_woman_counting_cash.mp4'
      ],
      description: 'Whatever God put in your hands, we’ve got what you need to build it. Practical tools for the calling you’re carrying.',
      cta: 'Get the Tools'
    },
    library: {
      title: 'Library',
      eyebrow: 'Wisdom for the road ahead.',
      video: 'assets/videos/L_woman_sitting_in_front_of_book_shelf.mp4',
      backups: [
        'assets/videos/L_man_reading_with_glasses___magnifying_glass.mp4',
        'assets/videos/L_man_hands_turning_pages_in_a_book.mp4',
        'assets/videos/L_peeking_around_a_corner_at_a_interesting_architectural_library.mp4'
      ],
      description: 'Wisdom doesn’t rush. Settle in among the shelves and gather what you’ll need for the road still ahead.',
      cta: 'Visit the Library'
    }
  };

  const welcome = document.getElementById('welcome');
  const carousel = document.getElementById('carousel');
  const enterBtn = document.getElementById('enterBtn');
  const stage = document.getElementById('stage');
  const horseshoe = document.getElementById('horseshoe');
  const cards = Array.from(document.querySelectorAll('.card'));

  const modal = document.getElementById('modal');
  const modalVideo = document.getElementById('modalVideo');
  const modalEyebrow = document.getElementById('modalEyebrow');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalCta = document.getElementById('modalCta');
  const modalCtaLabel = document.getElementById('modalCtaLabel');

  let carouselStarted = false;
  let lastFocused = null;

  /* ---------------------------------------------------------
     Welcome -> Carousel
  --------------------------------------------------------- */
  function enterCarousel() {
    welcome.classList.add('is-leaving');
    carousel.hidden = false;
    carousel.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(() => {
      carousel.classList.add('is-visible');
    });

    if (!carouselStarted) {
      carouselStarted = true;
      loadCardVideos();
    }

    window.setTimeout(() => {
      welcome.hidden = true;
    }, 950);
  }

  enterBtn.addEventListener('click', enterCarousel);
  enterBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      enterCarousel();
    }
  });

  /* ---------------------------------------------------------
     Lazy-load & autoplay card videos once the carousel is shown
  --------------------------------------------------------- */
  function loadCardVideos() {
    cards.forEach((card) => {
      const video = card.querySelector('.card__video');
      const src = video.getAttribute('data-src');
      if (!src) return;

      video.addEventListener('loadeddata', () => video.classList.add('is-ready'), { once: true });
      video.addEventListener('error', () => {
        // Leave the gradient fallback (.card__glow) visible if the file is missing.
        video.classList.remove('is-ready');
      });

      video.src = src;
      video.play().catch(() => {
        /* Autoplay may be blocked until further interaction; safe to ignore. */
      });
    });
  }

  /* ---------------------------------------------------------
     Subtle parallax on pointer move (desktop only)
  --------------------------------------------------------- */
  const canHover = window.matchMedia('(hover: hover) and (min-width: 781px)');

  function handlePointerMove(e) {
    if (!canHover.matches) return;
    const rect = stage.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    horseshoe.style.transform = `rotateX(${py * -4}deg) rotateY(${px * 6}deg)`;
  }

  function resetPointer() {
    horseshoe.style.transform = '';
  }

  stage.addEventListener('pointermove', handlePointerMove);
  stage.addEventListener('pointerleave', resetPointer);

  /* ---------------------------------------------------------
     Modal
  --------------------------------------------------------- */
  function openModal(roomKey) {
    const room = ROOMS[roomKey];
    if (!room) return;

    lastFocused = document.activeElement;

    modalEyebrow.textContent = room.eyebrow;
    modalTitle.textContent = room.title;
    modalDesc.textContent = room.description;
    modalCtaLabel.textContent = room.cta;
    modalCta.href = `#${roomKey}`;

    modalVideo.pause();
    modalVideo.removeAttribute('src');
    modalVideo.src = room.video;
    modalVideo.load();
    modalVideo.play().catch(() => {});

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal__close').focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    modalVideo.pause();
    if (lastFocused) lastFocused.focus();
  }

  cards.forEach((card) => {
    card.addEventListener('click', () => openModal(card.dataset.room));
  });

  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
})();
