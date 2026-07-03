// =============================================
// --- LOGIN OVERLAY LOGIC ---
// =============================================

(function () {
    const CORRECT_USER = 'BabySupan';
    const CORRECT_PASS = "Yusaan'sBaby17";
    const STORAGE_KEY  = 'sxyw_logged_in';

    const overlay   = document.getElementById('login-overlay');
    const card      = document.getElementById('login-card');
    const form      = document.getElementById('login-form');
    const userInput = document.getElementById('login-user');
    const passInput = document.getElementById('login-pass');
    const errorEl   = document.getElementById('login-error');
    const hintFill  = document.getElementById('hint-fill-btn');
    const petSpeech = document.getElementById('login-pet-speech');
    const petEyesN  = document.getElementById('lp-eyes-normal');
    const petEyesH  = document.getElementById('lp-eyes-happy');
    const petMouthS = document.getElementById('lp-mouth-stern');
    const petMouthH = document.getElementById('lp-mouth-happy');

    // --- Helper: pet says something ---
    const petSay = (msg) => { if (petSpeech) petSpeech.textContent = msg; };

    // --- Spawn floating hearts in background ---
    const heartsBg = document.getElementById('login-hearts-bg');
    const EMOJIS = ['❤️','💕','💖','💗','💓','💞','🌸','✨'];
    if (heartsBg) {
        for (let i = 0; i < 22; i++) {
            const h = document.createElement('span');
            h.className = 'lheart';
            h.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
            h.style.left = `${Math.random() * 100}%`;
            const dur = 6 + Math.random() * 9;
            h.style.animationDuration = `${dur}s`;
            h.style.animationDelay    = `-${Math.random() * dur}s`;
            h.style.fontSize = `${0.9 + Math.random() * 1.1}rem`;
            heartsBg.appendChild(h);
        }
    }

    // --- Rotating pet dialogues while waiting ---
    const waitingLines = [
        "I won't let strangers in!! 😤",
        "Who are you?! State your name! 🧐",
        "If you're not Sapeen... LEAVE! 😠",
        "Bark bark! Password please! 🐾",
        "Yusaan told me to be strict! 😤",
        "I'm watching you... 👀",
        "This is a Sapeen-only zone! 🛑",
    ];
    let waitIdx = 0;
    const petChatter = setInterval(() => {
        waitIdx = (waitIdx + 1) % waitingLines.length;
        petSay(waitingLines[waitIdx]);
    }, 3200);

    // --- Auto-fill button ---
    if (hintFill) {
        hintFill.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            userInput.value = CORRECT_USER;
            passInput.value = CORRECT_PASS;

            // Briefly pulse the filled inputs
            [userInput, passInput].forEach(el => {
                el.classList.remove('just-filled');
                void el.offsetWidth; // reflow
                el.classList.add('just-filled');
                setTimeout(() => el.classList.remove('just-filled'), 500);
            });

            petSay("Okay fine! I filled it for you! 😅❤️");
        });
    }

    // --- Error sound (Web Audio) ---
    const playErrorSound = () => {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        try {
            const ctx = new AC();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
            gain.gain.setValueAtTime(0.18, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.45);
        } catch (e) {}
    };

    // --- Success sound ---
    const playSuccessSound = () => {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        try {
            const ctx = new AC();
            const notes = [523, 659, 784, 1046]; // C5 E5 G5 C6
            notes.forEach((freq, i) => {
                const osc  = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
                gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.12 + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.12);
                osc.stop(ctx.currentTime + i * 0.12 + 0.35);
            });
        } catch (e) {}
    };

    // --- Heart burst on success ---
    const burstHearts = () => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const BURST_EMOJIS = ['❤️','💕','💖','💗','✨','🌸','💞'];
        for (let i = 0; i < 28; i++) {
            const el = document.createElement('div');
            el.className = 'login-burst-heart';
            el.textContent = BURST_EMOJIS[Math.floor(Math.random() * BURST_EMOJIS.length)];
            el.style.left = `${cx}px`;
            el.style.top  = `${cy}px`;
            const angle = (Math.PI * 2 * i) / 28 + (Math.random() - 0.5) * 0.5;
            const dist  = 120 + Math.random() * 200;
            el.style.setProperty('--bx', `${Math.cos(angle) * dist}px`);
            el.style.setProperty('--by', `${Math.sin(angle) * dist}px`);
            el.style.animationDelay = `${Math.random() * 0.3}s`;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 1600);
        }
    };

    // --- Shake the card ---
    const shakeCard = () => {
        card.classList.remove('card-shake');
        void card.offsetWidth;
        card.classList.add('card-shake');
        setTimeout(() => card.classList.remove('card-shake'), 600);
    };

    // --- Handle form submit ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = userInput.value.trim();
        const pass = passInput.value;

        if (user === CORRECT_USER && pass === CORRECT_PASS) {
            // ✅ Correct!
            clearInterval(petChatter);

            // Pet celebrates
            if (petEyesN) petEyesN.style.display = 'none';
            if (petEyesH) petEyesH.style.display = 'block';
            if (petMouthS) petMouthS.style.display = 'none';
            if (petMouthH) petMouthH.style.display = 'block';
            petSay("YAYYY IT'S MY BABY SAPEEN!! 🎉❤️");

            playSuccessSound();
            burstHearts();

            setTimeout(() => {
                overlay.classList.add('login-exit');
                setTimeout(() => { overlay.style.display = 'none'; }, 850);
            }, 900);

        } else {
            // ❌ Wrong!
            playErrorSound();
            shakeCard();

            errorEl.style.display = 'block';
            // Force re-animation
            errorEl.style.animation = 'none';
            void errorEl.offsetWidth;
            errorEl.style.animation = '';

            const angryLines = [
                "🚨 IMPOSTER ALERT!! That's not my baby! 😡",
                "🚨 WRONG!! Go away, stranger! 😤",
                "🚨 Nope! Only Yusaan's baby knows this! 🔒",
            ];
            errorEl.innerHTML = angryLines[Math.floor(Math.random() * angryLines.length)] +
                '<br><small>Tell the real Sapeen to come back! 👀</small>';

            petSay("STRANGER DANGER!!! 🚨😤");
            setTimeout(() => petSay("I said... password! 🧐"), 2000);
        }
    });

    // --- Input focus: pet reacts ---
    userInput.addEventListener('focus', () => petSay("Ooh, who's typing?? 👀"));
    passInput.addEventListener('focus', () => petSay("Shh... secret password time! 🤫"));
    userInput.addEventListener('blur',  () => petSay("Enter your name, baby! 💕"));
    passInput.addEventListener('blur',  () => petSay("Don't forget the password! 🔑"));

})();

// --- Navbar Scroll Effect & Mobile Menu ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu && navLinks) {
    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

// --- Intersection Observer for Scroll Animations ---
const faders = document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-left, .fade-in-right');

const appearOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const appearOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            entry.target.classList.add('appear');
            observer.unobserve(entry.target);
        }
    });
}, appearOptions);

faders.forEach(fader => {
    appearOnScroll.observe(fader);
});

// --- Custom Local Music Player Logic ---
const mainAudio = document.getElementById('main-audio');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-song');
const nextBtn = document.getElementById('next-song');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');
const mainVolumeSlider = document.getElementById('main-volume');
const songTitleEl = document.getElementById('song-title');
const songArtistEl = document.getElementById('song-artist');

const mainPlaylist = [
    {
        title: "I Wanna Be Yours",
        artist: "Arctic Monkeys",
        src: "Music/Arctic Monkeys - I Wanna Be Yours.mp3"
    },
    {
        title: "Those Eyes",
        artist: "New West",
        src: "Music/New West - Those Eyes (Lyrics).mp3"
    }
];

let mainSongIndex = 0;
let isPlaying = false;

function loadMainSong(song) {
    songTitleEl.innerText = song.title;
    songArtistEl.innerText = song.artist;
    mainAudio.src = song.src;
}

function playMainSong() {
    isPlaying = true;
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    mainAudio.play().catch(e => console.log("Playback failed:", e));
}

function pauseMainSong() {
    isPlaying = false;
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    mainAudio.pause();
}

if (mainAudio && playPauseBtn) {
    // Initial load
    loadMainSong(mainPlaylist[mainSongIndex]);
    mainAudio.volume = mainVolumeSlider.value / 100;

    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            pauseMainSong();
        } else {
            playMainSong();
        }
    });

    prevBtn.addEventListener('click', () => {
        mainSongIndex = (mainSongIndex - 1 + mainPlaylist.length) % mainPlaylist.length;
        loadMainSong(mainPlaylist[mainSongIndex]);
        if (isPlaying) playMainSong();
    });

    nextBtn.addEventListener('click', () => {
        mainSongIndex = (mainSongIndex + 1) % mainPlaylist.length;
        loadMainSong(mainPlaylist[mainSongIndex]);
        if (isPlaying) playMainSong();
    });

    mainAudio.addEventListener('timeupdate', () => {
        const { duration, currentTime } = mainAudio;
        if (duration) {
            const progressPercent = (currentTime / duration) * 100;
            progressBar.value = progressPercent;

            // Update time displays
            const formatTime = (time) => {
                const min = Math.floor(time / 60);
                const sec = Math.floor(time % 60);
                return `${min}:${sec.toString().padStart(2, '0')}`;
            };
            currentTimeEl.innerText = formatTime(currentTime);
            totalDurationEl.innerText = formatTime(duration);
        }
    });

    progressBar.addEventListener('input', () => {
        const duration = mainAudio.duration;
        if (duration) {
            mainAudio.currentTime = (progressBar.value / 100) * duration;
        }
    });

    mainVolumeSlider.addEventListener('input', () => {
        mainAudio.volume = mainVolumeSlider.value / 100;
    });

    mainAudio.addEventListener('ended', () => {
        mainSongIndex = (mainSongIndex + 1) % mainPlaylist.length;
        loadMainSong(mainPlaylist[mainSongIndex]);
        playMainSong();
    });
}


// --- Envelope Logic ---
const envelope = document.getElementById('envelope');
const openBtn = document.getElementById('open-letter');
const closeBtn = document.getElementById('close-letter');

openBtn.addEventListener('click', () => {
    envelope.classList.remove('close');
    envelope.classList.add('open');
    openBtn.style.display = 'none';
    closeBtn.style.display = 'inline-block';
});

closeBtn.addEventListener('click', () => {
    envelope.classList.remove('open');
    envelope.classList.add('close');
    closeBtn.style.display = 'none';
    openBtn.style.display = 'inline-block';
});

// --- Star Particle Canvas ---
const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class StarParticle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = Math.random() * 0.1 + 0.05;
        this.speedX = (Math.random() - 0.5) * 0.05;
        this.opacity = Math.random() * 0.8 + 0.2;
    }
    
    update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        
        // Twinkle effect
        this.opacity += (Math.random() - 0.5) * 0.05;
        if (this.opacity < 0.1) this.opacity = 0.1;
        if (this.opacity > 1) this.opacity = 1;
        
        if (this.y < -10) {
            this.y = canvas.height + 10;
            this.x = Math.random() * canvas.width;
        }
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
    }
    
    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Subtle glow for larger stars
        if (this.size > 1.5) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = "white";
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
}

function initParticles() {
    particles = [];
    let numberOfParticles = Math.floor(window.innerWidth / 8); // Denser star field
    for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new StarParticle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

// --- Custom Cursor Logic ---
const customCursor = document.getElementById('custom-cursor');
if (customCursor) {
    document.addEventListener('mousemove', (e) => {
        customCursor.style.left = e.clientX + 'px';
        customCursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mouseleave', () => {
        customCursor.style.display = 'none';
    });

    document.addEventListener('mouseenter', () => {
        customCursor.style.display = 'block';
    });
}

// --- Time Together Counter ---
// Set the date when you met or started dating (Year, Month (0-indexed), Day, Hour, Minute)
// The user specified: May 19th 1:13Am
// Note: Month is 0-indexed, so May is 4.
const startDate = new Date(2025, 4, 19, 1, 13).getTime(); 

function updateCounter() {
    const now = new Date().getTime();
    const difference = now - startDate;

    if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if(document.getElementById('days')) {
            document.getElementById('days').innerText = days.toString().padStart(2, '0');
            document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
            document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
        }
    }
}

setInterval(updateCounter, 1000);
updateCounter();

// --- Bucket List LocalStorage ---
const checkboxes = document.querySelectorAll('.bucket-list input[type="checkbox"]');

// Load saved states
checkboxes.forEach((checkbox) => {
    const savedState = localStorage.getItem(checkbox.id);
    if (savedState === 'true') {
        checkbox.checked = true;
    }

    // Save state on change
    checkbox.addEventListener('change', () => {
        localStorage.setItem(checkbox.id, checkbox.checked);
    });
});

// --- Lightbox Logic ---
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxVid = document.getElementById('lightbox-vid');
const closeLightbox = document.querySelector('.lightbox-close');
const galleryMedia = document.querySelectorAll('.gallery-item img, .gallery-item video');

if (lightbox && lightboxImg && lightboxVid && closeLightbox && galleryMedia) {
    galleryMedia.forEach(media => {
        media.style.cursor = 'none'; 
        media.addEventListener('click', () => {
            lightbox.style.display = 'block';
            if (media.tagName.toLowerCase() === 'img') {
                lightboxImg.src = media.src;
                lightboxImg.style.display = 'block';
                lightboxVid.style.display = 'none';
                lightboxVid.pause();
            } else if (media.tagName.toLowerCase() === 'video') {
                lightboxVid.src = media.src;
                lightboxVid.style.display = 'block';
                lightboxImg.style.display = 'none';
                lightboxVid.play();
            }
        });
    });

    closeLightbox.addEventListener('click', () => {
        lightbox.style.display = 'none';
        lightboxVid.pause();
    });

    // Close when clicking outside the media
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
            lightboxVid.pause();
        }
    });
}

// --- Daily Love Generator ---
const loveReasons = [
    "You have the most beautiful smile.",
    "Your laugh is my favorite sound in the world.",
    "You always know how to make me feel better.",
    "You have a heart of gold.",
    "Your eyes hold the whole universe.",
    "You are incredibly smart and driven.",
    "I love the way you look at me.",
    "Every moment with you feels like magic.",
    "You are my safe space.",
    "I love your silly jokes.",
    "You make my world so much brighter.",
    "I love the way we understand each other.",
    "You inspire me to be a better person.",
    "My heart still skips a beat when I see you.",
    "I love how you care for everyone around you.",
    "The way you handle challenges is so inspiring.",
    "You make even the simplest moments special.",
    "I love our deep midnight conversations.",
    "You are my best friend and my soulmate.",
    "I love how you always know what I'm thinking.",
    "Your kindness knows no bounds.",
    "I love the way you dream about our future.",
    "You are the most beautiful person, inside and out.",
    "I love how you make me feel like I can do anything.",
    "Being with you feels like being home."
];

const generateBtn = document.getElementById('generate-btn');
const loveReasonText = document.getElementById('love-reason-text');

if (generateBtn && loveReasonText) {
    generateBtn.addEventListener('click', () => {
        const randomIndex = Math.floor(Math.random() * loveReasons.length);
        
        // Add a small fade-out effect
        loveReasonText.style.opacity = 0;
        
        setTimeout(() => {
            loveReasonText.innerText = loveReasons[randomIndex];
            loveReasonText.style.opacity = 1;
            loveReasonText.style.transition = "opacity 0.5s ease";
        }, 300);
    });
}

// --- Love Coupons ---
const redeemBtns = document.querySelectorAll('.redeem-btn');

redeemBtns.forEach((btn) => {
    const couponCard = btn.closest('.coupon');
    
    btn.addEventListener('click', () => {
        couponCard.classList.add('redeemed');
    });
});

// --- Scratch-Off Logic ---
function setupScratchCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const sCtx = canvas.getContext('2d');
    let isDrawing = false;
    
    // Set canvas size to match container
    const setCanvasSize = () => {
        const rect = canvas.parentElement.getBoundingClientRect();
        // Fallback dimensions if rect is 0
        canvas.width = rect.width || 400;
        canvas.height = rect.height || 250;
        
        // Fill with a color/pattern initially
        sCtx.fillStyle = '#2a2a35'; // Slightly lighter than background
        sCtx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some text over the scratch layer
        sCtx.fillStyle = '#ff4d6d';
        sCtx.font = '24px Playfair Display';
        sCtx.textAlign = 'center';
        sCtx.fillText('Scratch Here', canvas.width / 2, canvas.height / 2);
    };
    
    // Initialize after a small delay to ensure CSS is applied
    setTimeout(setCanvasSize, 100);

    const getMousePos = (canvas, evt) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (evt.clientX || (evt.touches && evt.touches[0].clientX)) - rect.left,
            y: (evt.clientY || (evt.touches && evt.touches[0].clientY)) - rect.top
        };
    };

    const scratch = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        
        const pos = getMousePos(canvas, e);
        
        sCtx.globalCompositeOperation = 'destination-out';
        sCtx.beginPath();
        sCtx.arc(pos.x, pos.y, 30, 0, Math.PI * 2, false);
        sCtx.fill();
    };

    canvas.addEventListener('mousedown', () => isDrawing = true);
    canvas.addEventListener('mousemove', scratch);
    window.addEventListener('mouseup', () => isDrawing = false);

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        isDrawing = true;
        scratch(e);
    });
    canvas.addEventListener('touchmove', scratch);
    window.addEventListener('touchend', () => isDrawing = false);
}

setupScratchCanvas('scratch-canvas-1');
setupScratchCanvas('scratch-canvas-2');

// --- Virtual Pet Logic ---
const petMessages = [
    "Woof! You're the prettiest person in the world!",
    "Bark! Yussan is thinking about you right now! ❤️",
    "Pant pant... Can we go on a walk together?",
    "*Happy tail wags* You make my owner so happy!",
    "Woof! I love your cuddles!",
    "Arf! You're his absolute favorite person!",
    "I love you ya habibi enty ❤️",
    "*Sniffs* I smell a lot of love in the air!",
    "Bark! Don't forget to smile today!",
    "Woof! You're the best thing that ever happened to him!",
    "Bark! He told me a secret... he loves you more than anything!",
    "Wag wag! You're simply amazing!"
];

const virtualPet = document.getElementById('virtual-pet');
const petSpeech = document.getElementById('pet-speech');
const petMessageText = document.getElementById('pet-message');
let petTimeout;

if (virtualPet && petSpeech && petMessageText) {
    virtualPet.addEventListener('click', () => {
        const randomIndex = Math.floor(Math.random() * petMessages.length);
        petMessageText.innerText = petMessages[randomIndex];
        
        petSpeech.classList.add('show');
        
        clearTimeout(petTimeout);
        petTimeout = setTimeout(() => {
            petSpeech.classList.remove('show');
        }, 3500);
    });
}

// --- Night Light Toggle Logic ---
const nightLightToggle = document.getElementById('night-light-toggle');
if (nightLightToggle) {
    nightLightToggle.addEventListener('click', () => {
        document.body.classList.toggle('night-light-active');
        const icon = nightLightToggle.querySelector('i');
        const isNight = document.body.classList.contains('night-light-active');
        
        if (isNight) {
            icon.className = 'fas fa-sun';
            nightLightToggle.innerHTML = '<i class="fas fa-sun"></i> Day Mode';
        } else {
            icon.className = 'fas fa-moon';
            nightLightToggle.innerHTML = '<i class="fas fa-moon"></i> Night Mode';
        }
    });
}

// --- Interactive Constellation Game ---
const cCanvas = document.getElementById('constellation-canvas');
const cSuccess = document.getElementById('constellation-success');
if (cCanvas) {
    const cCtx = cCanvas.getContext('2d');
    let points = [];
    let connections = [];
    let lastPoint = null;

    const heartPoints = [
        {x: 400, y: 150},
        {x: 300, y: 100},
        {x: 200, y: 150},
        {x: 200, y: 250},
        {x: 400, y: 350},
        {x: 600, y: 250},
        {x: 600, y: 150},
        {x: 500, y: 100}
    ];

    function initConstellation() {
        const rect = cCanvas.parentElement.getBoundingClientRect();
        cCanvas.width = rect.width || 800;
        cCanvas.height = 400;
        
        points = [];
        connections = [];
        lastPoint = null;
        cSuccess.style.display = 'none';

        const scaleX = cCanvas.width / 800;
        const scaleY = cCanvas.height / 400;

        heartPoints.forEach(p => {
            points.push({
                x: p.x * scaleX,
                y: p.y * scaleY,
                active: false,
                isHeart: true
            });
        });

        for (let i = 0; i < 15; i++) {
            points.push({
                x: Math.random() * cCanvas.width,
                y: Math.random() * cCanvas.height,
                active: false,
                isHeart: false
            });
        }
        drawConstellation();
    }

    function drawConstellation() {
        cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);
        
        cCtx.strokeStyle = 'rgba(255, 77, 109, 0.6)';
        cCtx.lineWidth = 2;
        cCtx.shadowBlur = 10;
        cCtx.shadowColor = "#ff4d6d";
        
        connections.forEach(conn => {
            cCtx.beginPath();
            cCtx.moveTo(conn.p1.x, conn.p1.y);
            cCtx.lineTo(conn.p2.x, conn.p2.y);
            cCtx.stroke();
        });

        points.forEach(p => {
            cCtx.fillStyle = p.active ? '#ff4d6d' : (p.isHeart ? 'rgba(255, 77, 109, 0.4)' : 'rgba(255, 255, 255, 0.3)');
            cCtx.shadowBlur = p.active ? 20 : (p.isHeart ? 10 : 0);
            cCtx.shadowColor = "#ff4d6d";
            cCtx.beginPath();
            cCtx.arc(p.x, p.y, p.active ? 8 : (p.isHeart ? 6 : 4), 0, Math.PI * 2);
            cCtx.fill();
        });
        cCtx.shadowBlur = 0;
    }

    cCanvas.addEventListener('mousedown', (e) => {
        const rect = cCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        points.forEach(p => {
            const dist = Math.sqrt((p.x - mouseX)**2 + (p.y - mouseY)**2);
            if (dist < 40) {
                p.active = true;
                if (lastPoint && lastPoint !== p) {
                    connections.push({p1: lastPoint, p2: p});
                }
                lastPoint = p;
                checkWin();
            }
        });
        drawConstellation();
    });

    function checkWin() {
        const activeHeartPoints = points.filter(p => p.isHeart && p.active);
        if (activeHeartPoints.length === heartPoints.length) {
            setTimeout(() => {
                cSuccess.style.display = 'block';
            }, 500);
        }
    }

    window.resetConstellation = () => {
        initConstellation();
    };

    window.addEventListener('resize', initConstellation);
    setTimeout(initConstellation, 100);
}
// --- Background Music Logic ---
const bgMusic = document.getElementById('bg-music');
const bgMusicToggle = document.getElementById('bg-music-toggle');
let isBgMusicPlaying = false;

if (bgMusic && bgMusicToggle) {
    // Set calm volume
    bgMusic.volume = 0.3;

    // Create the welcome audio element
    const welcomeAudio = new Audio('Music/Welcome.wav');
    welcomeAudio.volume = 0.3; // Same volume as bgMusic

    let activeBgAudio = welcomeAudio;
    let welcomePlayed = false;

    const playActiveAudio = () => {
        activeBgAudio.play().then(() => {
            isBgMusicPlaying = true;
            bgMusicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
            removeInteractionListeners();
        }).catch(e => console.log("Audio play blocked:", e));
    };

    const toggleBgMusic = (e) => {
        if (e) {
            e.stopPropagation(); // Prevent triggering document interaction listeners if clicked directly
        }
        if (activeBgAudio.paused) {
            playActiveAudio();
        } else {
            activeBgAudio.pause();
            bgMusicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
            isBgMusicPlaying = false;
        }
    };

    bgMusicToggle.addEventListener('click', toggleBgMusic);

    // Transition to background music when welcome audio ends
    welcomeAudio.addEventListener('ended', () => {
        welcomePlayed = true;
        activeBgAudio = bgMusic;
        if (isBgMusicPlaying) {
            playActiveAudio();
        }
    });

    // Auto-play on first interaction (browser policy)
    const startAudioOnInteraction = () => {
        playActiveAudio();
    };

    const removeInteractionListeners = () => {
        document.removeEventListener('click', startAudioOnInteraction);
        document.removeEventListener('touchstart', startAudioOnInteraction);
        document.removeEventListener('scroll', startAudioOnInteraction);
    };

    document.addEventListener('click', startAudioOnInteraction);
    document.addEventListener('touchstart', startAudioOnInteraction);
    document.addEventListener('scroll', startAudioOnInteraction);
}

// --- Gallery Tab Switching Logic ---
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

if (tabButtons && tabContents) {
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const targetTabId = btn.getAttribute('data-tab');
            tabContents.forEach(content => {
                if (content.id === targetTabId) {
                    content.classList.add('active-content');
                } else {
                    content.classList.remove('active-content');
                    // Pause any videos in the hidden tab
                    const videos = content.querySelectorAll('video');
                    videos.forEach(vid => vid.pause());
                }
            });
        });
    });
}

// --- Hover Video Playback Logic ---
const galleryVideos = document.querySelectorAll('.gallery-item video');
galleryVideos.forEach(video => {
    video.style.cursor = 'none';
    
    video.addEventListener('mouseenter', () => {
        video.play().catch(e => console.log("Hover play prevented:", e));
    });
    
    video.addEventListener('mouseleave', () => {
        video.pause();
    });
});

// ==========================================
// --- Yassap Virtual Pet Game Logic ---
// ==========================================
const YassapPet = {
    // Current Stats
    stats: {
        hunger: 100,      // Boosted by kisses
        thirst: 100,      // Boosted by water
        cleanliness: 100, // Boosted by shower
        lastUpdate: Date.now()
    },

    // Decays per hour
    decayRates: {
        hunger: 10,       // 10% per hour
        thirst: 15,       // 15% per hour
        cleanliness: 4.17 // 100% per 24 hours (4.17% per hour)
    },

    // Dialog messages
    dialogs: {
        happy: [
            "Woof! You make my heart happy! ❤️",
            "Mwah! I love your sweet kisses!",
            "I'm feeling so clean and refreshed! ✨",
            "Thank you for taking care of me! 🥰",
            "Yussan + Sapeen forever! 🐾"
        ],
        neutral: [
            "I could use a little hug or a kiss... 🥺",
            "A bit thirsty, is there any fresh water? 💧",
            "Yassap is waiting for your attention! 🐾",
            "I'm doing okay, but kisses make me happy! 💋"
        ],
        sad: [
            "Please feed me kisses! I'm starving! 😭",
            "So thirsty... Need water! 💧",
            "I'm feeling a bit dirty, let's take a shower! 🚿",
            "Yassap is sad... don't ignore me! 💔"
        ],
        shower: [
            "Splish splash! Shower time! 🚿🫧",
            "Rubber ducky says hello! 🦆✨",
            "So clean, so fresh! 🧼"
        ]
    },

    // Initialize elements
    init() {
        this.cacheDOM();
        if (!this.el.container) return; // If section isn't on page
        
        this.loadState();
        this.bindEvents();
        this.updateUI();
        
        // Start game loop (updates every 10 seconds)
        setInterval(() => this.tick(), 10000);
        
        // Setup initial dialog
        this.speakRandom('happy');
    },

    cacheDOM() {
        this.el = {
            container: document.getElementById('pet-section'),
            hungerBar: document.getElementById('yassap-hunger-bar'),
            thirstBar: document.getElementById('yassap-thirst-bar'),
            cleanBar: document.getElementById('yassap-clean-bar'),
            hungerText: document.getElementById('yassap-hunger-text'),
            thirstText: document.getElementById('yassap-thirst-text'),
            cleanText: document.getElementById('yassap-clean-text'),
            bubble: document.getElementById('yassap-bubble'),
            character: document.getElementById('yassap-character'),
            particles: document.getElementById('yassap-particles'),
            kissBtn: document.getElementById('yassap-kiss-btn'),
            waterBtn: document.getElementById('yassap-water-btn'),
            showerBtn: document.getElementById('yassap-shower-btn'),
            
            // SVG Face Elements
            eyesHappy: document.getElementById('eyes-happy'),
            eyesNeutral: document.getElementById('eyes-neutral'),
            eyesSad: document.getElementById('eyes-sad'),
            eyesClosed: document.getElementById('eyes-closed'),
            
            mouthHappy: document.getElementById('mouth-happy'),
            mouthNeutral: document.getElementById('mouth-neutral'),
            mouthSad: document.getElementById('mouth-sad'),
            
            dirtSpots: document.getElementById('dirt-spots')
        };
    },

    bindEvents() {
        this.el.kissBtn.addEventListener('click', () => this.care('hunger', 20, '💋', 'kiss'));
        this.el.waterBtn.addEventListener('click', () => this.care('thirst', 20, '💧', 'water'));
        this.el.showerBtn.addEventListener('click', () => this.care('cleanliness', 100, '🧼', 'shower'));
    },

    loadState() {
        const saved = localStorage.getItem('yassap_pet_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.stats.hunger = parsed.hunger !== undefined ? parsed.hunger : 100;
                this.stats.thirst = parsed.thirst !== undefined ? parsed.thirst : 100;
                this.stats.cleanliness = parsed.cleanliness !== undefined ? parsed.cleanliness : 100;
                this.stats.lastUpdate = parsed.lastUpdate || Date.now();
                
                // Calculate elapsed decay
                this.applyDecay();
            } catch (e) {
                console.error("Failed to parse pet state, resetting", e);
            }
        }
    },

    saveState() {
        this.stats.lastUpdate = Date.now();
        localStorage.setItem('yassap_pet_state', JSON.stringify(this.stats));
    },

    applyDecay() {
        const now = Date.now();
        const elapsedHours = (now - this.stats.lastUpdate) / (1000 * 60 * 60);
        
        if (elapsedHours > 0) {
            this.stats.hunger = Math.max(0, this.stats.hunger - elapsedHours * this.decayRates.hunger);
            this.stats.thirst = Math.max(0, this.stats.thirst - elapsedHours * this.decayRates.thirst);
            this.stats.cleanliness = Math.max(0, this.stats.cleanliness - elapsedHours * this.decayRates.cleanliness);
        }
        this.saveState();
    },

    tick() {
        // Calculate decay in real time
        this.applyDecay();
        this.updateUI();
        
        // Random chance of speaking
        if (Math.random() < 0.15) {
            const minStat = Math.min(this.stats.hunger, this.stats.thirst, this.stats.cleanliness);
            if (minStat < 30) {
                this.speakRandom('sad');
            } else if (minStat < 60) {
                this.speakRandom('neutral');
            } else {
                this.speakRandom('happy');
            }
        }
    },

    updateUI() {
        // Round values for display
        const h = Math.round(this.stats.hunger);
        const t = Math.round(this.stats.thirst);
        const c = Math.round(this.stats.cleanliness);

        // Update Text
        this.el.hungerText.innerText = `${h}%`;
        this.el.thirstText.innerText = `${t}%`;
        this.el.cleanText.innerText = `${c}%`;

        // Update Progress Bars Width
        this.el.hungerBar.style.width = `${h}%`;
        this.el.thirstBar.style.width = `${t}%`;
        this.el.cleanBar.style.width = `${c}%`;

        // Update colors based on levels
        this.updateBarColor(this.el.hungerBar, h);
        this.updateBarColor(this.el.thirstBar, t);
        this.updateBarColor(this.el.cleanBar, c);

        // Update dirt spots opacity
        if (this.el.dirtSpots) {
            // Dirt starts showing as cleanliness drops below 70%
            const dirtOpacity = c < 70 ? (70 - c) / 70 : 0;
            this.el.dirtSpots.style.opacity = dirtOpacity.toFixed(2);
        }

        // Update Yassap's facial expression based on lowest stat
        const minStat = Math.min(h, t, c);
        
        // Clear shiver/sad states
        this.el.character.classList.remove('yassap-shiver');

        if (minStat < 30) {
            // Sad State
            this.setFace('sad');
            this.el.character.classList.add('yassap-shiver');
        } else if (minStat < 60) {
            // Neutral/Bored State
            this.setFace('neutral');
        } else {
            // Happy State
            this.setFace('happy');
        }
    },

    updateBarColor(bar, value) {
        bar.className = 'bar-inner'; // Reset classes
        if (value > 60) {
            bar.classList.add('bar-green');
        } else if (value > 30) {
            bar.classList.add('bar-orange');
        } else {
            bar.classList.add('bar-red');
        }
    },

    setFace(state) {
        // Hide all eyes
        this.el.eyesHappy.style.display = 'none';
        this.el.eyesNeutral.style.display = 'none';
        this.el.eyesSad.style.display = 'none';
        this.el.eyesClosed.style.display = 'none';

        // Hide all mouths
        this.el.mouthHappy.style.display = 'none';
        this.el.mouthNeutral.style.display = 'none';
        this.el.mouthSad.style.display = 'none';

        if (state === 'happy') {
            this.el.eyesHappy.style.display = 'block';
            this.el.mouthHappy.style.display = 'block';
        } else if (state === 'neutral') {
            this.el.eyesNeutral.style.display = 'block';
            this.el.mouthNeutral.style.display = 'block';
        } else if (state === 'sad') {
            this.el.eyesSad.style.display = 'block';
            this.el.mouthSad.style.display = 'block';
        } else if (state === 'closed') {
            this.el.eyesClosed.style.display = 'block';
            this.el.mouthHappy.style.display = 'block';
        }
    },

    speak(text) {
        this.el.bubble.innerText = text;
        this.el.bubble.style.animation = 'none';
        // Trigger reflow to restart float animation
        void this.el.bubble.offsetWidth;
        this.el.bubble.style.animation = 'bubbleFloat 4s ease-in-out infinite';
    },

    speakRandom(type) {
        const lines = this.dialogs[type];
        const randomLine = lines[Math.floor(Math.random() * lines.length)];
        this.speak(randomLine);
    },

    care(stat, amount, particleChar, actionType) {
        // Audio synthesis for click response
        this.playCuteSound(actionType);

        // Apply stat increase
        if (actionType === 'shower') {
            this.stats.cleanliness = 100;
        } else {
            this.stats[stat] = Math.min(100, this.stats[stat] + amount);
        }
        
        this.saveState();
        this.updateUI();

        // Bounce animation
        this.el.character.classList.remove('yassap-bounce');
        void this.el.character.offsetWidth; // Reflow
        this.el.character.classList.add('yassap-bounce');

        // Swap to Closed/Pleasant eyes during action
        this.setFace('closed');
        
        // Remove bounce class after it completes
        setTimeout(() => {
            this.el.character.classList.remove('yassap-bounce');
            this.updateUI(); // Restore face based on actual stats
        }, 600);

        // Handle specific action behaviors
        if (actionType === 'shower') {
            this.speakRandom('shower');
            this.startShowerEffect();
        } else {
            const praises = ["Yum! 💋", "Glug glug! 💧", "Awww! 🥰", "Happy! ✨", "More! ❤️"];
            this.speak(praises[Math.floor(Math.random() * praises.length)]);
            
            // Spawn standard particles (hearts or water drops)
            for (let i = 0; i < 5; i++) {
                setTimeout(() => this.spawnParticle(particleChar), i * 150);
            }
        }
    },

    spawnParticle(char) {
        const particle = document.createElement('div');
        particle.className = 'pet-particle';
        particle.innerText = char;
        
        // Random offset and drift
        const left = 60 + Math.random() * 80; // center around pet
        const drift = (Math.random() - 0.5) * 50;
        
        particle.style.left = `${left}px`;
        particle.style.setProperty('--drift', `${drift}px`);
        
        this.el.particles.appendChild(particle);
        
        // Cleanup particle
        setTimeout(() => {
            particle.remove();
        }, 1500);
    },

    startShowerEffect() {
        // Spawn rain droplets from top of pet-display
        const display = document.querySelector('.pet-display');
        const interval = setInterval(() => {
            const drop = document.createElement('div');
            drop.className = 'shower-drop';
            drop.style.left = `${20 + Math.random() * 80}%`;
            display.appendChild(drop);
            
            setTimeout(() => drop.remove(), 800);
        }, 50);

        // Stop shower drops after 2 seconds
        setTimeout(() => {
            clearInterval(interval);
        }, 2000);
    },

    // Synthetic Web Audio Generator for Cute Retro Sound Effects
    playCuteSound(type) {
        // Check if Web Audio API is supported
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        try {
            const ctx = new AudioContext();
            
            if (type === 'kiss') {
                // Short mwah sound: low pitch sweeping to high pitch quickly
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(150, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
                
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start();
                osc.stop(ctx.currentTime + 0.2);
            } else if (type === 'water') {
                // Drip pop sound: very quick sine wave pitch sweep
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
                
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start();
                osc.stop(ctx.currentTime + 0.15);
            } else if (type === 'shower') {
                // Shower noise sweep
                const bufferSize = ctx.sampleRate * 1.5; // 1.5 seconds
                const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const output = noiseBuffer.getChannelData(0);
                
                // Fill buffer with random white noise
                for (let i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1;
                }
                
                const whiteNoise = ctx.createBufferSource();
                whiteNoise.buffer = noiseBuffer;
                
                const filter = ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 1000;
                
                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
                
                whiteNoise.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);
                
                whiteNoise.start();
                whiteNoise.stop(ctx.currentTime + 1.5);
            }
        } catch (err) {
            console.log("AudioContext blocked or failed to initialize", err);
        }
    }
};

// Start Yassap on page load
YassapPet.init();
