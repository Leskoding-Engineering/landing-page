document.addEventListener('DOMContentLoaded', () => {

    /* ========================================================
       1. WEB AUDIO API (Synthesizer - Smoothed)
       ======================================================== */
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let isMuted = false;

    function playTone(freq, type, duration, vol=0.05) {
        if (isMuted || audioCtx.state === 'suspended') return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }

    const sounds = {
        shoot: () => playTone(600, 'square', 0.1, 0.02),
        hit: () => playTone(100, 'sawtooth', 0.2, 0.05),
        win: () => {
            if(isMuted) return;
            playTone(440, 'sine', 0.15, 0.05);
            setTimeout(() => playTone(554, 'sine', 0.15, 0.05), 150);
            setTimeout(() => playTone(659, 'sine', 0.3, 0.05), 300);
        },
        click: () => playTone(800, 'sine', 0.05, 0.01)
    };

    document.body.addEventListener('click', () => {
        if(audioCtx.state === 'suspended') audioCtx.resume();
    }, { once: true });

    const toggleSoundBtn = document.getElementById('toggle-sound');
    if (toggleSoundBtn) {
        toggleSoundBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            const icon = document.getElementById('sound-icon');
            icon.className = isMuted ? 'fa-solid fa-volume-xmark text-red-500 text-sm' : 'fa-solid fa-volume-high text-brand-400 text-sm';
        });
    }

    /* ========================================================
       2. HERO CANVAS PARTICLES
       ======================================================== */
    const heroCanvas = document.getElementById('hero-canvas');
    if(heroCanvas) {
        const hCtx = heroCanvas.getContext('2d', { alpha: false });
        let particles = [];
        
        function resizeHero() {
            heroCanvas.width = heroCanvas.offsetWidth;
            heroCanvas.height = heroCanvas.offsetHeight;
        }
        window.addEventListener('resize', resizeHero);
        resizeHero();

        class Particle {
            constructor() {
                this.x = Math.random() * heroCanvas.width;
                this.y = Math.random() * heroCanvas.height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.size = Math.random() * 1.5 + 0.5;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if(this.x < 0 || this.x > heroCanvas.width) this.vx *= -1;
                if(this.y < 0 || this.y > heroCanvas.height) this.vy *= -1;
            }
            draw() {
                hCtx.fillStyle = 'rgba(20, 184, 166, 0.4)';
                hCtx.beginPath();
                hCtx.arc(this.x, this.y, this.size, 0, Math.PI*2);
                hCtx.fill();
            }
        }

        for(let i=0; i<80; i++) particles.push(new Particle());

        function animateHero() {
            hCtx.fillStyle = '#020617'; 
            hCtx.fillRect(0, 0, heroCanvas.width, heroCanvas.height);
            
            particles.forEach(p => { p.update(); p.draw(); });
            
            hCtx.lineWidth = 0.5;
            for(let i=0; i<particles.length; i++){
                for(let j=i+1; j<particles.length; j++){
                    let dx = particles[i].x - particles[j].x;
                    let dy = particles[i].y - particles[j].y;
                    let dist = dx*dx + dy*dy;
                    if(dist < 12000) {
                        hCtx.strokeStyle = `rgba(20, 184, 166, ${0.15 - (dist/12000)*0.15})`;
                        hCtx.beginPath();
                        hCtx.moveTo(particles[i].x, particles[i].y);
                        hCtx.lineTo(particles[j].x, particles[j].y);
                        hCtx.stroke();
                    }
                }
            }
            requestAnimationFrame(animateHero);
        }
        animateHero();
    }

    // Typewriter Effect
    const typeTarget = document.getElementById('typewriter-text');
    if(typeTarget) {
        const words = ["Future.", "Masterpiece.", "Logic.", "Legacy."];
        let i = 0, timer;
        function typingEffect() {
            let word = words[i].split('');
            let loopTyping = function() {
                if (word.length > 0) {
                    typeTarget.innerHTML += word.shift();
                    timer = setTimeout(loopTyping, 100);
                } else {
                    timer = setTimeout(deletingEffect, 2500);
                }
            };
            loopTyping();
        }
        function deletingEffect() {
            let word = words[i].split('');
            let loopDeleting = function() {
                if (word.length > 0) {
                    word.pop();
                    typeTarget.innerHTML = word.join('');
                    timer = setTimeout(loopDeleting, 40);
                } else {
                    i = (i + 1) % words.length;
                    setTimeout(typingEffect, 300);
                }
            };
            loopDeleting();
        }
        setTimeout(typingEffect, 500);
    }


    /* ========================================================
       3. INTERACTIVE FEATURES
       ======================================================== */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                if(entry.target.classList.contains('counter-trigger')) {
                    document.querySelectorAll('.counter').forEach(counter => {
                        const target = parseFloat(counter.getAttribute('data-target'));
                        const duration = 2500;
                        const inc = target / (duration / 16);
                        let val = 0;
                        const update = () => {
                            val += inc;
                            if(val < target) {
                                let displayVal = target % 1 !== 0 ? val.toFixed(1) : Math.floor(val);
                                counter.innerText = target % 1 !== 0 ? displayVal : Number(displayVal).toLocaleString('id-ID');
                                requestAnimationFrame(update);
                            } else {
                                counter.innerText = target % 1 !== 0 ? target.toFixed(1) : target.toLocaleString('id-ID');
                            }
                        };
                        update();
                    });
                    entry.target.classList.remove('counter-trigger');
                }
            }
        });
    }, { threshold: 0.1 });

    const counterSec = document.querySelector('.counter');
    if(counterSec) {
        const sec = counterSec.closest('section');
        if(sec) {
            sec.classList.add('fade-in-up', 'counter-trigger');
        }
    }
    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));

    document.querySelectorAll('.bento-card').forEach(card => {
        const glow = card.querySelector('.magnetic-glow');
        if(!glow) return;
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            window.requestAnimationFrame(() => {
                glow.style.left = (e.clientX - rect.left) + 'px';
                glow.style.top = (e.clientY - rect.top) + 'px';
            });
        });
    });

    const gameWrapper = document.querySelector('.glow-border');
    if(gameWrapper) {
        const parent = gameWrapper.parentElement;
        parent.addEventListener('mousemove', (e) => {
            const rect = parent.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            window.requestAnimationFrame(() => {
                gameWrapper.style.setProperty('--mouse-x', `${x}%`);
                gameWrapper.style.setProperty('--mouse-y', `${y}%`);
            });
        });
    }

    /* ========================================================
       4. EMBEDDED MINI-GAME: BUG SMASHER
       ======================================================== */
    const canvas = document.getElementById('game-canvas');
    if(canvas) {
        const ctx = canvas.getContext('2d', { alpha: false }); 
        const btnStartGame = document.getElementById('start-game-btn');
        const hudScore = document.getElementById('hud-score');
        const scoreDisplay = document.getElementById('score-display');
        const healthBar = document.getElementById('health-bar');
        const gameUi = document.getElementById('game-ui');
        const gameHudOverlay = document.getElementById('game-hud-overlay');

        let isPlaying = false;
        let score = 0;
        let health = 100;
        let bugs = [];
        let gameParticles = [];
        let animationId;
        const WIN_SCORE = 1000;

        function resizeGame() {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        }
        window.addEventListener('resize', resizeGame);
        resizeGame();

        class Bug {
            constructor() {
                this.size = Math.random() * 12 + 16;
                this.x = Math.random() * (canvas.width - this.size*2) + this.size;
                this.y = -this.size;
                this.speed = Math.random() * 1.5 + 1.5 + (score/600);
            }
            draw() {
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
                ctx.lineWidth = 2;
                ctx.strokeRect(this.x - this.size/2 - 2, this.y - this.size/2 - 2, this.size + 4, this.size + 4);
                
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
                
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(this.x - 2, this.y - 2, 4, 4);
            }
            update() {
                this.y += this.speed;
                this.x += Math.sin(this.y * 0.05) * 0.5;
            }
        }

        class GameParticle {
            constructor(x, y, color) {
                this.x = x; this.y = y;
                this.vx = (Math.random() - 0.5) * 12;
                this.vy = (Math.random() - 0.5) * 12;
                this.life = 1;
                this.color = color;
                this.size = Math.random() * 3 + 1;
            }
            update() {
                this.x += this.vx; this.y += this.vy;
                this.life -= 0.04;
            }
            draw() {
                ctx.fillStyle = this.color;
                const currentSize = this.size * this.life;
                if(currentSize > 0.1) {
                    ctx.fillRect(this.x, this.y, currentSize, currentSize);
                }
            }
        }

        function createExplosion(x, y, color) {
            for(let i=0; i<15; i++) gameParticles.push(new GameParticle(x, y, color));
        }

        function updateHUD() {
            const formatted = score.toString().padStart(4, '0');
            if(hudScore) hudScore.innerText = formatted;
            if(scoreDisplay) scoreDisplay.innerText = formatted;
            
            if(healthBar) {
                healthBar.style.width = `${Math.max(0, health)}%`;
                if(health < 30) healthBar.classList.replace('bg-brand-500', 'bg-red-500');
                else healthBar.classList.replace('bg-red-500', 'bg-brand-500');
            }
        }

        function startGame() {
            isPlaying = true;
            score = 0;
            health = 100;
            bugs = [];
            gameParticles = [];
            gameUi.classList.add('opacity-0');
            setTimeout(() => {
                gameUi.classList.add('hidden');
                gameHudOverlay.classList.remove('hidden');
            }, 300);
            updateHUD();
            animateGame();
        }

        function winGame() {
            isPlaying = false;
            sounds.win();
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#14b8a6', '#6366f1', '#f59e0b', '#ffffff'] });
            
            setTimeout(() => {
                const modal = document.getElementById('reward-modal');
                modal.classList.remove('hidden');
                void modal.offsetWidth; 
                modal.classList.add('show');
            }, 800);
        }

        function gameOver() {
            isPlaying = false;
            gameUi.classList.remove('hidden');
            setTimeout(() => gameUi.classList.remove('opacity-0'), 10);
            gameHudOverlay.classList.add('hidden');
            gameUi.innerHTML = `
                <i class="fa-solid fa-triangle-exclamation text-4xl md:text-5xl text-red-500 mb-5 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse"></i>
                <h4 class="font-heading font-bold text-xl md:text-2xl text-white mb-2 tracking-wide">SYSTEM OVERLOAD</h4>
                <p class="text-slate-400 text-[10px] md:text-xs mb-6 font-mono tracking-widest uppercase">Data Score: ${score}</p>
                <button id="restart-game-btn" class="px-6 py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-full uppercase tracking-[0.15em] text-[10px] transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                    Reboot()
                </button>
            `;
            document.getElementById('restart-game-btn').addEventListener('click', startGame);
        }

        function animateGame() {
            if(!isPlaying) return;
            
            ctx.fillStyle = '#050b14';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if(Math.random() < 0.02 + (score/15000)) bugs.push(new Bug());

            for(let i=bugs.length-1; i>=0; i--) {
                bugs[i].update();
                bugs[i].draw();
                
                if(bugs[i].y > canvas.height + bugs[i].size) {
                    health -= 15;
                    createExplosion(bugs[i].x, canvas.height, '#ef4444');
                    sounds.hit();
                    bugs.splice(i, 1);
                    updateHUD();
                    if(health <= 0) { gameOver(); return; }
                }
            }

            for(let i=gameParticles.length-1; i>=0; i--) {
                gameParticles[i].update();
                gameParticles[i].draw();
                if(gameParticles[i].life <= 0) gameParticles.splice(i, 1);
            }

            animationId = requestAnimationFrame(animateGame);
        }

        canvas.addEventListener('mousedown', (e) => {
            if(!isPlaying) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            sounds.shoot();

            ctx.fillStyle = 'rgba(20, 184, 166, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            let hit = false;
            for(let i=bugs.length-1; i>=0; i--) {
                const dist = Math.hypot(bugs[i].x - x, bugs[i].y - y);
                if(dist < bugs[i].size * 1.5) { 
                    createExplosion(bugs[i].x, bugs[i].y, '#14b8a6');
                    bugs.splice(i, 1);
                    score += 50;
                    hit = true;
                    updateHUD();
                    if(score >= WIN_SCORE) { winGame(); return; }
                    break; 
                }
            }
            if(!hit) createExplosion(x, y, '#475569'); 
        });

        if(btnStartGame) btnStartGame.addEventListener('click', () => { sounds.click(); startGame(); });
        
        const btnClaim = document.getElementById('claim-reward');
        if(btnClaim) {
            btnClaim.addEventListener('click', () => {
                sounds.click();
                const modal = document.getElementById('reward-modal');
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.classList.add('hidden');
                    window.location.hash = "#register";
                }, 400);
            });
        }
    }


    /* ========================================================
       5. QUIZ LOGIC (Proportional Updates)
       ======================================================== */
    const quizData = [
        {
            stepName: "Gaya Berimajinasi",
            question: "Saat berimajinasi, apa yang sering kamu lakukan?",
            options: [
                { text: "Membangun dunia 3D luas dan mengundang teman.", icon: "fa-cube", value: "roblox" },
                { text: "Menyusun balok visual menjadi cerita dan karakter.", icon: "fa-shapes", value: "scratch" },
                { text: "Mendesain poster dan mengatur tata letak sistem.", icon: "fa-layer-group", value: "web" }
            ]
        },
        {
            stepName: "Kekuatan Super",
            question: "Jika punya kekuatan super digital, kamu pilih?",
            options: [
                { text: "Arsitek Dimensi: Menciptakan aturan permainan.", icon: "fa-earth-americas", value: "roblox" },
                { text: "Animator: Menghidupkan gambar diam secara instan.", icon: "fa-wand-magic-sparkles", value: "scratch" },
                { text: "Kreator Jaringan: Membuat pintu ajaib untuk dunia.", icon: "fa-network-wired", value: "web" }
            ]
        },
        {
            stepName: "Cara Belajar",
            question: "Gaya belajarmu lebih seperti...",
            options: [
                { text: "Langsung terjun, mencoba objek, & berkolaborasi live.", icon: "fa-gamepad", value: "roblox" },
                { text: "Santai dari dasar dengan blok yang mudah dipahami.", icon: "fa-puzzle-piece", value: "scratch" },
                { text: "Terstruktur, memecahkan kode selangkah demi selangkah.", icon: "fa-code", value: "web" }
            ]
        }
    ];

    let currentStep = 0;
    const scores = { roblox: 0, scratch: 0, web: 0 };
    const quizContent = document.getElementById('quiz-content');
    const quizProgress = document.getElementById('quiz-progress');

    function renderQuizStep(step) {
        if(!quizContent) return;
        if (step >= quizData.length) { showQuizResult(); return; }
        
        const data = quizData[step];
        if(quizProgress) quizProgress.style.width = `${((step) / quizData.length) * 100}%`;
        const stepText = document.getElementById('current-step-text');
        if(stepText) stepText.innerText = step + 1;
        
        let optionsHtml = data.options.map(opt => `
            <button class="quiz-option group relative overflow-hidden rounded-2xl border border-white/5 bg-dark-950 hover:bg-slate-900 p-4 transition-all duration-300 text-left flex items-center gap-4 hover:border-brand-500/50 hover:shadow-[0_0_15px_rgba(20,184,166,0.1)]" data-value="${opt.value}">
                <div class="absolute inset-0 bg-gradient-to-r from-brand-500/0 to-transparent group-hover:from-brand-500/5 transition-all duration-500 pointer-events-none"></div>
                <div class="w-10 h-10 rounded-xl bg-dark-900 border border-white/5 flex items-center justify-center shrink-0 group-hover:border-brand-500/30 transition-colors shadow-inner">
                    <i class="fa-solid ${opt.icon} text-sm text-slate-400 group-hover:text-brand-400"></i>
                </div>
                <div><h4 class="font-medium text-slate-300 text-[13px] group-hover:text-white transition-colors leading-snug">${opt.text}</h4></div>
            </button>
        `).join('');

        quizContent.innerHTML = `
            <div class="quiz-step active fade-in-up visible">
                <h3 class="text-xl md:text-2xl font-heading font-bold mb-6 text-white leading-tight">${data.question}</h3>
                <div class="grid grid-cols-1 gap-3 max-w-2xl mx-auto">${optionsHtml}</div>
            </div>
        `;

        document.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', function() {
                sounds.click();
                scores[this.dataset.value] += 1;
                this.classList.add('border-brand-500', 'bg-slate-800');
                this.style.transform = 'scale(0.98)';
                setTimeout(() => { currentStep++; renderQuizStep(currentStep); }, 350);
            });
        });
    }

    function showQuizResult() {
        let maxScore = 0, recommended = "";
        for (const [c, s] of Object.entries(scores)) { if (s > maxScore) { maxScore = s; recommended = c; } }
        
        const courses = {
            roblox: { 
                title: "Roblox Developer", jargon: "Build, Play, Share!", icon: "fa-cube", color: "from-blue-500 to-indigo-600",
                testimonial: "Setelah ambil jalur ini, game perdanaku dimainkan 1000 orang di minggu pertama! - Sarah, 15 thn"
            },
            scratch: { 
                title: "Beginner Coding", jargon: "Snap, Drag, Animate!", icon: "fa-cat", color: "from-orange-400 to-amber-600",
                testimonial: "Awalnya aku bingung koding itu apa, ternyata semudah menyusun puzzle! - Budi, 12 thn"
            },
            web: { 
                title: "Web Development", jargon: "Code the Web, Architect the Future!", icon: "fa-code", color: "from-brand-400 to-teal-600",
                testimonial: "Skill dari kelas ini membantuku mendapat project freelance pertamaku! - Alex, 18 thn"
            }
        };
        const res = courses[recommended];

        if(quizProgress) quizProgress.style.width = "100%";
        quizContent.innerHTML = `
            <div class="quiz-step active text-center fade-in-up visible py-4">
                <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${res.color} p-[1px] mb-6 shadow-lg">
                    <div class="w-full h-full bg-dark-900 rounded-2xl flex items-center justify-center"><i class="fa-solid ${res.icon} text-2xl text-white"></i></div>
                </div>
                <h4 class="text-2xl font-heading font-bold text-white mb-2 tracking-tight">${res.title}</h4>
                <p class="text-brand-400 font-semibold italic mb-6 text-[11px] tracking-widest uppercase">"${res.jargon}"</p>
                
                <div class="max-w-md mx-auto bg-dark-950/50 border border-white/5 rounded-xl p-4 mb-8 relative">
                    <i class="fa-solid fa-quote-left text-white/10 text-3xl absolute top-2 left-2"></i>
                    <p class="text-slate-300 text-xs italic relative z-10">"${res.testimonial}"</p>
                </div>

                <a href="#register" class="inline-block relative group px-8 py-3 rounded-full overflow-hidden shadow-lg bg-dark-950 border border-white/10 hover:border-brand-500/50 transition-all">
                    <div class="absolute inset-0 bg-gradient-to-r ${res.color} opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <span class="relative text-white font-bold tracking-[0.15em] uppercase text-[10px] flex items-center gap-2">Initialize Course <i class="fa-solid fa-arrow-right"></i></span>
                </a>
            </div>
        `;
    }
    renderQuizStep(0);

    /* ========================================================
       6. REGISTRATION FORM (WhatsApp Integration)
       ======================================================== */
    const regForm = document.getElementById('registration-form');
    if(regForm) {
        regForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nama = document.getElementById('reg-nama').value;
            const panggilan = document.getElementById('reg-panggilan').value;
            const usia = document.getElementById('reg-usia').value;
            const sekolah = document.getElementById('reg-sekolah').value;
            const ortu = document.getElementById('reg-ortu').value;
            const email = document.getElementById('reg-email').value;
            const alamat = document.getElementById('reg-alamat').value;
            const waOrtu = document.getElementById('reg-wa-ortu').value;
            const waAnak = document.getElementById('reg-wa-anak').value || '-';
            
            // Simple Validation
            if (!/^[0-9\+\-\s]+$/.test(waOrtu)) {
                alert("Mohon masukkan format Nomor WA Orang Tua yang valid (angka).");
                document.getElementById('reg-wa-ortu').focus();
                return;
            }
            if (waOrtu.length < 9) {
                alert("Nomor WA terlalu pendek.");
                document.getElementById('reg-wa-ortu').focus();
                return;
            }

            const centerSelect = document.getElementById('reg-center');
            const center = centerSelect ? centerSelect.value : '';
            if (!center) {
                alert("Mohon pilih Learning Center terdekat terlebih dahulu.");
                const trigger = document.getElementById('custom-select-trigger');
                if (trigger) {
                    trigger.classList.add('border-red-500', 'ring-2', 'ring-red-500/40');
                    trigger.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => trigger.classList.remove('ring-2', 'ring-red-500/40'), 2500);
                }
                return;
            }

            const promoInput = document.getElementById('reg-promo');
            const promo = promoInput ? promoInput.value.trim() : '';

            const message = `*Form Pendaftaran Siswa Baru Akademi LesKoding*

Pilihan Learning Center: ${center}
Kode / Nama Promo: ${promo || '-'}

Nama Lengkap: ${nama}
Panggilan: ${panggilan}
Usia: ${usia}
Asal sekolah: ${sekolah}
Nama orang tua: ${ortu}
Email: ${email}
Alamat lengkap: ${alamat}
WA Ortu: ${waOrtu}
WA Anak (opsional): ${waAnak}`;

            const encodedMessage = encodeURIComponent(message);
            
            // Route to appropriate branch admin WhatsApp
            let adminWA = "628518306798"; // default Gianyar / Bedulu
            if (center.includes("Peliatan")) {
                adminWA = "6285792736627"; // Bali Seed Peliatan Ubud
            }
            const whatsappUrl = `https://wa.me/${adminWA}?text=${encodedMessage}`;
            
            window.open(whatsappUrl, '_blank');
        });
    }

    /* ========================================================
       7. DYNAMIC NAVBAR SCROLL EFFECT
       ======================================================== */
    const navbar = document.getElementById('navbar');
    const navContainer = document.getElementById('nav-container');
    const navLogo = document.getElementById('nav-logo');
    
    if (navbar && navContainer && navLogo) {
        const handleNavScroll = () => {
            if (window.scrollY > 30) {
                // Scrolled: Frosted Glass / Translucent Dark with border and shadow
                navbar.classList.add('bg-[#0B0F19]/90', 'backdrop-blur-xl', 'border-white/10', 'shadow-lg');
                navbar.classList.remove('bg-transparent', 'border-transparent');
                
                navContainer.classList.add('h-14', 'sm:h-16', 'lg:h-18');
                navContainer.classList.remove('h-16', 'sm:h-20', 'lg:h-24');
                navLogo.classList.add('h-7', 'sm:h-8', 'lg:h-9');
                navLogo.classList.remove('h-8', 'sm:h-9', 'lg:h-11');
            } else {
                // Top: Completely Transparent
                navbar.classList.add('bg-transparent', 'border-transparent');
                navbar.classList.remove('bg-[#0B0F19]/90', 'backdrop-blur-xl', 'border-white/10', 'shadow-lg');
                
                navContainer.classList.add('h-16', 'sm:h-20', 'lg:h-24');
                navContainer.classList.remove('h-14', 'sm:h-16', 'lg:h-18');
                navLogo.classList.add('h-8', 'sm:h-9', 'lg:h-11');
                navLogo.classList.remove('h-7', 'sm:h-8', 'lg:h-9');
            }
        };

        window.addEventListener('scroll', handleNavScroll);
        handleNavScroll(); // Run on initial load in case user refreshed while scrolled
    }

});

/* ========================================================
   8. COURSE FILTERING & PATH MANAGEMENT
   ======================================================== */
function filterCourses(category) {
    // 1. Reset all filter buttons
    const filterBtns = document.querySelectorAll('.course-filter-btn');
    filterBtns.forEach(btn => {
        btn.classList.remove('bg-[#0788F5]', 'text-white', 'border-[#0788F5]', 'shadow-md', 'shadow-blue-500/20');
        btn.classList.add('bg-[#1E293B]', 'text-slate-300', 'border-white/10');
    });

    // 2. Highlight active filter button
    const activeBtn = document.getElementById(`course-filter-${category}`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-[#1E293B]', 'text-slate-300', 'border-white/10');
        activeBtn.classList.add('bg-[#0788F5]', 'text-white', 'border-[#0788F5]', 'shadow-md', 'shadow-blue-500/20');
    }

    // 3. Toggle progression ladder roadmap visibility
    const ladderGuide = document.getElementById('course-ladder-guide');
    if (ladderGuide) {
        if (category === 'specialist') {
            ladderGuide.classList.add('hidden');
        } else {
            ladderGuide.classList.remove('hidden');
        }
    }

    // 4. Filter course cards
    const cards = document.querySelectorAll('.course-card');
    cards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (category === 'all' || cardCat === category) {
            card.classList.remove('hidden');
            setTimeout(() => {
                card.style.display = 'flex';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
            }, 10);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px) scale(0.97)';
            setTimeout(() => {
                card.classList.add('hidden');
                card.style.display = 'none';
            }, 200);
        }
    });
}

// Fallback compatibility function for any legacy tab callers
function switchCoursePath(courseId) {
    if (courseId === 'game' || courseId === 'ladder') {
        filterCourses('ladder');
    } else if (courseId === 'web' || courseId === 'robotic' || courseId === 'specialist') {
        filterCourses('specialist');
    } else {
        filterCourses('all');
    }
}

/* ========================================================
   9. COURSE MODAL (CURRICULUM & SYLLABUS DETAILS)
   ======================================================== */
function openCourseModal(level, title, iconClass, colorClass, desc, xp, duration, topics) {
    const modal = document.getElementById('course-modal');
    const modalContent = document.getElementById('course-modal-content');
    
    if (!modal || !modalContent) return;

    // Populate text details
    const modalLevel = document.getElementById('modal-level');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalXp = document.getElementById('modal-xp');
    const modalDuration = document.getElementById('modal-duration');
    
    if (modalLevel) modalLevel.textContent = level;
    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.textContent = desc;
    if (modalXp) modalXp.textContent = xp;
    if (modalDuration) modalDuration.textContent = duration;
    
    // Icon
    const iconEl = document.getElementById('modal-icon');
    if (iconEl) {
        iconEl.className = `fa-solid ${iconClass} text-xl sm:text-2xl`;
    }

    // Color bar & icon accent
    const colorBar = document.getElementById('modal-color-bar');
    if (colorBar) {
        colorBar.className = 'absolute top-0 left-0 w-full h-1.5';
        if (colorClass.includes('emerald') || colorClass.includes('teal')) {
            colorBar.classList.add('bg-emerald-500');
            if (iconEl) iconEl.style.color = '#059669';
        } else if (colorClass.includes('purple')) {
            colorBar.classList.add('bg-[#5B0CB5]');
            if (iconEl) iconEl.style.color = '#5B0CB5';
        } else if (colorClass.includes('gold') || colorClass.includes('amber') || colorClass.includes('yellow')) {
            colorBar.classList.add('bg-[#FFC83D]');
            if (iconEl) iconEl.style.color = '#ca8a04';
        } else if (colorClass.includes('red')) {
            colorBar.classList.add('bg-[#F3261D]');
            if (iconEl) iconEl.style.color = '#F3261D';
        } else {
            colorBar.classList.add('bg-[#004E98]');
            if (iconEl) iconEl.style.color = '#004E98';
        }
    }

    // Topics list
    const topicsUl = document.getElementById('modal-topics');
    if (topicsUl) {
        topicsUl.innerHTML = '';
        topics.forEach(topic => {
            const li = document.createElement('li');
            li.className = 'flex items-start gap-2.5';
            li.innerHTML = `<i class="fa-solid fa-circle-check text-xs mt-1 text-[#0788F5] shrink-0"></i> <span class="leading-snug text-slate-200">${topic}</span>`;
            topicsUl.appendChild(li);
        });
    }

    // Show modal with smooth transition
    modal.classList.remove('hidden');
    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeCourseModal() {
    const modal = document.getElementById('course-modal');
    const modalContent = document.getElementById('course-modal-content');
    
    if (!modal || !modalContent) return;

    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 250);
}

/* ========================================================
   10. HALL OF FAME INTERACTIONS
   ======================================================== */
function upvoteProject(btn) {
    // Prevent multiple clicks
    if (btn.classList.contains('voted')) return;
    
    const countSpan = btn.querySelector('.vote-count');
    let currentCount = parseInt(countSpan.textContent.replace(/\D/g, ''));
    if (isNaN(currentCount)) currentCount = parseFloat(countSpan.textContent) * 1000;
    
    currentCount += 1;
    
    // Format back (naive formatting for demo)
    if (currentCount >= 1000) {
        countSpan.textContent = (currentCount / 1000).toFixed(1) + 'k';
    } else {
        countSpan.textContent = currentCount;
    }
    
    // Animate button
    btn.classList.add('voted', 'text-red-500', 'border-red-500/50');
    btn.classList.remove('text-slate-500');
    
    const icon = btn.querySelector('i');
    icon.classList.add('scale-125', 'text-red-500');
    
    // Confetti effect could go here
}

document.addEventListener('DOMContentLoaded', () => {
    // 3D Tilt Effect for Gallery Cards
    const tiltElements = document.querySelectorAll('.tilt-element');
    
    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10; // max 10deg
            const rotateY = ((x - centerX) / centerX) * 10;
            
            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            el.style.transition = 'transform 0.5s ease';
        });
        
        el.addEventListener('mouseenter', () => {
            el.style.transition = 'none'; // remove transition for smooth tracking
        });
    });
});

/* ========================================================
   11. LOCATION SECTION (MOCK DISTANCE CHECK)
   ======================================================== */
function calculateDistance() {
    const input = document.getElementById('user-location');
    const resultBox = document.getElementById('distance-result-box');
    const resultText = document.getElementById('distance-result-text');
    const btn = document.getElementById('check-distance-btn');
    
    if(!input.value.trim()) {
        alert("Silakan masukkan lokasi Anda terlebih dahulu.");
        return;
    }
    
    // Animate button
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menghitung...';
    btn.classList.add('opacity-80');
    
    // Mock API call (simulate delay)
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('opacity-80');
        
        // Randomize mock distance for gamification effect
        const randomMins = Math.floor(Math.random() * 20) + 10; // 10-30 mins
        const randomKm = Math.floor(Math.random() * 15) + 3; // 3-18 km
        const campuses = ['Gents Robotic Gianyar', 'Bali Seed Peliatan', 'Bali Seed Bedulu'];
        const randomCampus = campuses[Math.floor(Math.random() * campuses.length)];
        
        resultText.innerHTML = `Hanya <strong>${randomMins} Menit (${randomKm} km)</strong> dari lokasi Anda!`;
        const nearestCampusText = resultBox.querySelector('strong');
        if (nearestCampusText) nearestCampusText.textContent = randomCampus;
        
        resultBox.classList.remove('hidden');
        resultBox.classList.add('animate-[pulse_1s]');
        setTimeout(() => resultBox.classList.remove('animate-[pulse_1s]'), 1000);
        
    }, 1500);
}

// Global Confetti Trigger for Hall of Fame
window.triggerConfetti = function() {
    if (typeof confetti === 'function') {
        confetti({ 
            particleCount: 200, 
            spread: 120, 
            origin: { y: 0.6 }, 
            colors: ['#facc15', '#eab308', '#a16207', '#ffffff'] 
        });
    }
};

// Enhanced upvoteProject for Gamified Voting
window.upvoteProject = function(btn) {
    if (btn.classList.contains('voted')) return;
    
    const countSpan = btn.querySelector('.vote-count');
    let currentCount = parseInt(countSpan.textContent.replace(/[^0-9]/g, ''));
    if (isNaN(currentCount)) currentCount = 0;
    
    currentCount += 1;
    countSpan.textContent = currentCount;
    
    // Add visual feedback
    btn.classList.add('voted', 'text-red-500', 'scale-110');
    btn.querySelector('i').classList.add('text-red-500', 'animate-ping');
    
    // Small confetti just for voting
    if (typeof confetti === 'function') {
        const rect = btn.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;
        
        confetti({
            particleCount: 30,
            spread: 50,
            origin: { x, y },
            colors: ['#ef4444', '#f87171', '#fca5a5'],
            disableForReducedMotion: true
        });
    }
    
    // Cleanup animation classes after a short delay
    setTimeout(() => {
        btn.classList.remove('scale-110');
        btn.querySelector('i').classList.remove('animate-ping');
    }, 500);
};

// Mobile Navigation Drawer Toggle
document.addEventListener('DOMContentLoaded', () => {
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenu.classList.toggle('hidden');
        });
        
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
        
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !mobileBtn.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
    }
});

/* ========================================================
   12. ACTIVE PROMOTION POPUP & AUTO-COMPLETE
   ======================================================== */
window.openPromoModal = function() {
    const modal = document.getElementById('promo-modal');
    if (modal) {
        modal.classList.remove('hidden');
        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            modal.classList.add('opacity-100');
            const content = document.getElementById('promo-modal-content');
            if (content) {
                content.classList.remove('scale-95');
                content.classList.add('scale-100');
            }
        });
    }
};

window.closePromoModal = function() {
    const modal = document.getElementById('promo-modal');
    if (modal) {
        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0');
        const content = document.getElementById('promo-modal-content');
        if (content) {
            content.classList.remove('scale-100');
            content.classList.add('scale-95');
        }
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }
};

window.claimPromoAndRegister = function(promoCode = 'PETUALANGAN2026') {
    // 1. Close modal
    window.closePromoModal();

    // 2. Auto-complete promo input
    const promoInput = document.getElementById('reg-promo');
    const badge = document.getElementById('promo-applied-badge');
    if (promoInput) {
        promoInput.value = promoCode;
        promoInput.classList.add('border-gold-500', 'ring-2', 'ring-gold-500/40');
        setTimeout(() => {
            promoInput.classList.remove('ring-2', 'ring-gold-500/40');
        }, 3000);
    }
    if (badge) {
        badge.classList.remove('hidden');
    }

    // 3. Smooth scroll to registration section
    const regSection = document.getElementById('register');
    if (regSection) {
        regSection.scrollIntoView({ behavior: 'smooth' });
    }

    // 4. Focus on learning center select (open enhanced menu if not selected)
    setTimeout(() => {
        const centerSelect = document.getElementById('reg-center');
        if (centerSelect && !centerSelect.value) {
            const menu = document.getElementById('custom-select-menu');
            if (menu && menu.classList.contains('hidden')) {
                window.toggleCustomSelect();
            }
            const trigger = document.getElementById('custom-select-trigger');
            if (trigger) trigger.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            const nameInput = document.getElementById('reg-nama');
            if (nameInput) nameInput.focus();
        }
    }, 500);

    // Celebratory confetti
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#facc15', '#0ea5e9', '#ffffff']
        });
    }
};

// Auto-trigger promo modal on load
window.addEventListener('load', () => {
    // Open active promotion popup after 1.5s
    setTimeout(() => {
        window.openPromoModal();
    }, 1500);

    // Close promo modal on backdrop click
    const promoModal = document.getElementById('promo-modal');
    if (promoModal) {
        promoModal.addEventListener('click', (e) => {
            if (e.target === promoModal) {
                window.closePromoModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (promoModal && !promoModal.classList.contains('hidden')) {
                window.closePromoModal();
            }
            const courseModal = document.getElementById('course-modal');
            if (courseModal && !courseModal.classList.contains('hidden')) {
                closeCourseModal();
            }
        }
    });
});

/* ========================================================
   13. CUSTOM ENHANCED LEARNING CENTER DROPDOWN
   ======================================================== */
window.toggleCustomSelect = function() {
    const menu = document.getElementById('custom-select-menu');
    const chevron = document.getElementById('custom-select-chevron');
    if (menu) {
        const isClosed = menu.classList.contains('hidden');
        if (isClosed) {
            menu.classList.remove('hidden');
            if (chevron) chevron.classList.add('rotate-180');
        } else {
            menu.classList.add('hidden');
            if (chevron) chevron.classList.remove('rotate-180');
        }
    }
};

window.selectCustomCenter = function(name, address, iconClass, theme, badgeText) {
    const nameEl = document.getElementById('selected-center-name');
    const subEl = document.getElementById('selected-center-sub');
    const iconEl = document.getElementById('selected-center-icon');
    const tagEl = document.getElementById('selected-center-tag');
    const trigger = document.getElementById('custom-select-trigger');
    const select = document.getElementById('reg-center');

    if (nameEl) nameEl.textContent = name;
    if (subEl) subEl.textContent = address;
    
    let themeBg = 'bg-brand-500/10 border-brand-500/30 text-brand-400';
    let tagBg = 'bg-brand-500/20 text-brand-400 border-brand-500/30';
    let triggerBorder = 'border-brand-500/60 shadow-[0_0_20px_rgba(14,165,233,0.15)]';
    
    if (theme === 'purpleBrand') {
        themeBg = 'bg-purpleBrand-500/10 border-purpleBrand-500/30 text-purpleBrand-400';
        tagBg = 'bg-purpleBrand-500/20 text-purpleBrand-400 border-purpleBrand-500/30';
        triggerBorder = 'border-purpleBrand-500/60 shadow-[0_0_20px_rgba(168,85,247,0.15)]';
    } else if (theme === 'gold') {
        themeBg = 'bg-gold-500/10 border-gold-500/30 text-gold-400';
        tagBg = 'bg-gold-500/20 text-gold-400 border-gold-500/30';
        triggerBorder = 'border-gold-500/60 shadow-[0_0_20px_rgba(250,204,21,0.15)]';
    }

    if (iconEl) {
        iconEl.className = `w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base transition-all border ${themeBg}`;
        iconEl.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
    }

    if (tagEl) {
        tagEl.className = `text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md border ${tagBg}`;
        tagEl.textContent = badgeText;
        tagEl.classList.remove('hidden');
    }

    if (trigger) {
        trigger.className = `w-full bg-dark-950 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all duration-300 shadow-lg border ${triggerBorder}`;
    }

    // Sync underlying select
    if (select) {
        select.value = name;
        select.dispatchEvent(new Event('change'));
    }

    // Close menu
    const menu = document.getElementById('custom-select-menu');
    const chevron = document.getElementById('custom-select-chevron');
    if (menu) menu.classList.add('hidden');
    if (chevron) chevron.classList.remove('rotate-180');
};

// Auto-close custom select when clicking outside
document.addEventListener('click', (e) => {
    const trigger = document.getElementById('custom-select-trigger');
    const menu = document.getElementById('custom-select-menu');
    const chevron = document.getElementById('custom-select-chevron');
    if (trigger && menu && !trigger.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.add('hidden');
        if (chevron) chevron.classList.remove('rotate-180');
    }
});
/* ========================================================
   14. THEME & INTERNATIONALIZATION (I18N) ENGINE
   ======================================================== */

// Comprehensive Bilingual Translation Dictionary (English Default & Indonesian)
const i18nDictionary = {
    en: {
        // Navigation
        nav_program: "Programs",
        nav_method: "How It Works",
        nav_works: "Student Works",
        nav_progress: "Progress Tracking",
        nav_location: "Locations",
        nav_faq: "FAQ",
        nav_cta: "Request Info / Trial",
        nav_hof: "Hall of Fame",
        nav_course: "Programs",
        nav_enroll: "Enroll Now",
        nav_start_adventure: "Request Info",
        
        // Hero Section
        hero_badge: "Playful Future Lab — Coding &amp; Robotic Bali",
        hero_title_1: "Turn curiosity into",
        hero_title_2: "digital creations.",
        hero_desc_main: "Children learn step by step, conquer hands-on challenges, and track their growth each session guided by expert tutors.",
        hero_btn_info: "Request Info / Schedule",
        hero_btn_works: "View Student Works",
        hero_trust_1_title: "Structured Curriculum",
        hero_trust_1_sub: "Beginner to Advanced",
        hero_trust_2_title: "Parent Progress Reports",
        hero_trust_2_sub: "Track Learning Milestones",
        hero_trust_3_title: "3 Learning Centers",
        hero_trust_3_sub: "Gianyar, Ubud &amp; Bedulu",
        
        // Method (Cara Belajar)
        method_badge: "Learning Methodology",
        method_title: "How Students Learn at LesKoding",
        method_desc: "We guide young minds through 4 proven stages: not just textbook memorization, but creating real digital projects and experiencing true mastery.",
        method_s1_title: "Core Concepts",
        method_s1_desc: "Coding and engineering concepts explained via visual analogies and engaging quizzes kids genuinely love.",
        method_s2_title: "Hands-on Practice",
        method_s2_desc: "Kids assemble real games, write clean logic, and wire robot sensors. Emphasizing trial and error for problem solving.",
        method_s3_title: "Personal Tutor Feedback",
        method_s3_desc: "Dedicated mentors guide each child, refine code structure, and appreciate unique inventive ideas.",
        method_s4_title: "Real Progress & XP",
        method_s4_desc: "Milestones recorded automatically: XP points, published student portfolio, and transparent reports sent to parents.",

        // Parent Progress Section
        parent_badge: "Learning reports parents can truly understand",
        parent_title: "Know what your child learns—and what comes next.",
        parent_desc: "Once a session report is published, parents can review attendance, skills evaluated by tutors, child strengths, current focus areas, and next-step recommendations. Progress is also tracked seamlessly over time.",
        parent_cta_preview: "View Sample Report",
        parent_cta_consult: "Consult Your Child's Needs",
        parent_cta: "Consult Your Child's Needs",

        // Course Section
        course_badge: "Active Programs 2026",
        course_title: "Available Learning Programs",
        course_desc: "Structured step-by-step for ages 6–16. Real-world project-based curriculum, interactive challenges, and guidance from experienced mentors.",
        course_game_title: "Game Developer Path",
        course_game_desc: "From core algorithmic logic to building interactive 3D worlds played by thousands on Roblox.",
        course_web_title: "Web Architect Path",
        course_web_desc: "Build modern interactive websites and web apps from fundamental styling to full internet deployment.",
        course_robotic_title: "Robotic Engineer Path",
        course_robotic_desc: "Master electronic circuits, microcontroller coding, and engineer autonomous robots for the future.",
        
        // Hall of Fame
        hof_title: "Success Stories from<br><span class=\"text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-yellow-600\">Our Explorers!</span>",
        hof_desc: "This is where our students\' extraordinary creations take the spotlight! Each project is a milestone of relentless dedication, logic, and creativity.",
        hof_masterpiece_heading: "Curator\'s Masterpiece Showcase",
        hof_badge_masterpiece: "Top Masterpiece",
        hof_curator_pick: "Curator\'s Pick",
        hof_sarah_age: "(12 Years Old)",
        hof_masterpiece_desc: "A massive 3D Roleplay universe built in Roblox Studio with cyberpunk architecture, virtual economies, and advanced interactive NPCs.",
        btn_view_project: "View Project",
        hof_gallery_heading: "Exhibition Gallery",
        hof_top_creations: "Top Student Projects",
        hof_c1_badge: "Most Popular",
        hof_c1_title: "Smart AI Cashier System",
        hof_c1_author: "Budi (14 Years Old)",
        hof_c1_desc: "Web-based cashier application utilizing complex JavaScript logic for real-time inventory calculations and dynamic receipt printing.",
        hof_c2_badge: "Future Tech",
        hof_c2_title: "Smart Waste Sorting Robot",
        hof_c2_author: "Kevin (10 Years Old)",
        hof_c2_desc: "Arduino-powered engineering project featuring ultrasonic sensors and servo motors to automate waste sorting and smart lid control.",
        hof_c3_badge: "Best Design",
        hof_c3_title: "3D Web Animation Portfolio",
        hof_c3_author: "Nadia (15 Years Old)",
        hof_c3_desc: "Personal portfolio website packed with seamless CSS 3D animations and fluid scroll transitions created without external libraries.",
        hof_btn_load_more: "Load More Creations",
        
        // Location Section
        loc_title: "Learning Centers in Bali",
        loc_desc: "Visit one of our learning centers in Gianyar, Ubud, or Bedulu for in-person interactive classes with air-conditioned labs and friendly tutors.",
        loc_calc_title: "Check Nearest Campus",
        loc_calc_desc: "Enter your district or area to discover which campus is closest to your home.",
        loc_btn_check: "Check Location",
        loc_est_label: "Estimated Travel Time",
        
        // FAQ Section
        faq_badge: "Questions & Answers",
        faq_title: "Frequently Asked Questions",
        faq_desc: "Transparent answers about class schedules, hardware, age requirements, and free trial sessions.",
        faq_q1: "Can a child with zero prior coding experience join?",
        faq_a1: "Absolutely! Over 80% of our new students start from scratch. We introduce structured computational thinking through intuitive visual blocks before advancing to real typed syntax.",
        faq_q2: "Is a trial class available?",
        faq_a2: "Yes, we offer complimentary Free Trial sessions across Gianyar, Ubud Peliatan, and Bedulu centers. Book a slot using the form below or chat with our admin.",
        faq_q3: "Does my child need to bring their own laptop?",
        faq_a3: "Our labs are fully equipped with dedicated PCs and robotic equipment. However, students who prefer to use their own laptop to keep projects directly on their machine are welcome.",
        faq_q4: "What is the tutor-to-student ratio per class?",
        faq_a4: "We maintain small interactive classes of 4 to 6 students per tutor, ensuring personalized guidance and immediate support during hands-on projects.",

        // Registration Form
        reg_title: "Start Your Child\'s Tech Journey",
        reg_desc: "Fill in the brief form below to schedule a class consultation or book a free trial. Confirmation will be sent directly via WhatsApp.",
        reg_form_header: "Student &amp; Parent Registration Details",
        reg_campus_count: "3 Campuses Available in Bali",
        reg_choose_center: "Choose Nearest Learning Center",
        reg_choose_center_sub: "Click to choose your child\'s study center",
        reg_promo_sub: "Auto-filled when claiming promo voucher",
        reg_lbl_name: "Full Student Name",
        reg_lbl_nickname: "Nickname",
        reg_lbl_age: "Child\'s Age",
        reg_lbl_school: "School Name",
        reg_lbl_parent: "Parent / Guardian Name",
        reg_lbl_address: "Home Address",
        reg_lbl_wa_parent: "Parent\'s WhatsApp",
        reg_lbl_wa_child: "Child\'s WhatsApp (Optional)",
        reg_btn_submit: "Send via WhatsApp",
        
        // Promo Popup
        promo_badge: "Limited 2026 Promo",
        promo_sub: "Free Trial + Registration Discount",
        promo_title: "Launch Your Digital<br><span class=\"text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-yellow-500\">Creator Journey!</span>",
        promo_body: "Claim a complimentary trial session and registration discount across all LesKoding Learning Centers now:",
        promo_cta: "Enroll Now & Claim Promo",
        promo_trigger: "2026 Promo"
    },
    id: {
        // Navigation
        nav_program: "Program",
        nav_method: "Cara Belajar",
        nav_works: "Karya Siswa",
        nav_progress: "Progres Belajar",
        nav_location: "Lokasi",
        nav_faq: "FAQ",
        nav_cta: "Minta Info / Jadwal",
        nav_hof: "Karya Siswa",
        nav_course: "Program",
        nav_enroll: "Daftar",
        nav_start_adventure: "Minta Jadwal",
        
        // Hero Section
        hero_badge: "Playful Future Lab — Coding &amp; Robotic Bali",
        hero_title_1: "Ubah rasa penasaran jadi",
        hero_title_2: "karya digital.",
        hero_desc_main: "Anak belajar langkah demi langkah, mencoba tantangan seru, dan melihat progres belajarnya setiap sesi bersama tutor berpengalaman.",
        hero_btn_info: "Minta Info / Jadwal Kelas",
        hero_btn_works: "Lihat Karya Siswa",
        hero_trust_1_title: "Kurikulum Bertahap",
        hero_trust_1_sub: "Pemula hingga Mahir",
        hero_trust_2_title: "Laporan Wali Murid",
        hero_trust_2_sub: "Pantau Progres Belajar",
        hero_trust_3_title: "3 Learning Center",
        hero_trust_3_sub: "Gianyar, Ubud &amp; Bedulu",

        // Method (Cara Belajar)
        method_badge: "Metodologi Belajar",
        method_title: "Cara Belajar di LesKoding",
        method_desc: "Kami memandu anak melalui 4 tahapan belajar yang terbukti efektif: bukan sekadar teori hafalan, melainkan proses langsung berkreasi dan melihat hasil nyata.",
        method_s1_title: "Materi Konsep",
        method_s1_desc: "Konsep koding dan robotika disajikan melalui analogi visual sederhana dan kuis interaktif yang mudah dipahami anak tanpa rasa jenuh.",
        method_s2_title: "Praktik Eksploratif",
        method_s2_desc: "Anak langsung merakit game, menyusun baris logika kode, atau merangkai sensor robot. Fokus pada trial & error yang menumbuhkan pemecahan masalah.",
        method_s3_title: "Feedback Tutor",
        method_s3_desc: "Tutor membimbing secara personal, mengulas logika kode, memberikan tips penyempurnaan, serta apresiasi atas ide unik yang dikembangkan siswa.",
        method_s4_title: "Pencapaian & Progres",
        method_s4_desc: "Setiap pencapaian tercatat dalam sistem: poin XP bertambah, proyek masuk portofolio, dan laporan capaian diteruskan langsung ke orang tua.",

        // Parent Progress Section
        parent_badge: "Laporan belajar yang bisa dipahami wali",
        parent_title: "Tahu apa yang anak pelajari—dan langkah berikutnya.",
        parent_desc: "Setelah laporan sesi diterbitkan, wali dapat melihat kehadiran, keterampilan yang dinilai tutor, kekuatan anak, hal yang sedang dilatih, dan rekomendasi untuk sesi berikutnya. Progres juga bisa dipantau dari waktu ke waktu.",
        parent_cta_preview: "Lihat Contoh Laporan",
        parent_cta_consult: "Konsultasikan Kebutuhan Anak",
        parent_cta: "Konsultasikan Kebutuhan Anak",

        // Course Section
        course_badge: "Program Aktif 2026",
        course_title: "Pilihan Program Belajar",
        course_desc: "Dirancang bertahap untuk anak usia 6–16 tahun. Kurikulum berbasis proyek nyata, kuis interaktif, dan pendampingan tutor berpengalaman.",
        course_game_title: "Jalur Game Developer",
        course_game_desc: "Dari logika dasar hingga membangun dunia 3D interaktif yang dimainkan ribuan orang di Roblox.",
        course_web_title: "Jalur Web Architect",
        course_web_desc: "Bangun situs web interaktif dan aplikasi modern dari pondasi kode hingga rilis penuh ke internet.",
        course_robotic_title: "Jalur Robotic Engineer",
        course_robotic_desc: "Kuasai sirkuit elektronik, pemrograman mikrokontroler, dan bangun robot otomatis masa depan.",
        
        // Hall of Fame
        hof_title: "Kisah Sukses dari<br><span class=\"text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-yellow-600\">Penjelajah Kami!</span>",
        hof_desc: "Di sinilah karya luar biasa dari siswa kami ditampilkan! Setiap proyek adalah petualangan yang menceritakan perjalanan kreativitas dan dedikasi.",
        hof_masterpiece_heading: "Pajangan Proyek Pilihan",
        hof_badge_masterpiece: "Masterpiece Terbaik",
        hof_curator_pick: "Pilihan Kurator",
        hof_sarah_age: "(12 Tahun)",
        hof_masterpiece_desc: "Sebuah dunia Roleplay 3D masif yang dibangun dalam Roblox Studio — arsitektur cyberpunk, sistem mata uang virtual, dan NPC interaktif tingkat lanjut.",
        btn_view_project: "Lihat Proyek",
        hof_gallery_heading: "Galeri Eksibisi",
        hof_top_creations: "Karya Teratas",
        hof_c1_badge: "Terfavorit",
        hof_c1_title: "Sistem AI Kasir Pintar",
        hof_c1_author: "Budi (14 Tahun)",
        hof_c1_desc: "Aplikasi kasir berbasis web menggunakan logika JavaScript kompleks untuk kalkulasi inventaris dan struk real-time.",
        hof_c2_badge: "Future Tech",
        hof_c2_title: "Robot Pemilah Sampah",
        hof_c2_author: "Kevin (10 Tahun)",
        hof_c2_desc: "Proyek Arduino dengan sensor ultrasonik dan motor servo yang secara otomatis membuka tutup tempat sampah.",
        hof_c3_badge: "Desain Terbaik",
        hof_c3_title: "Portofolio Animasi Web",
        hof_c3_author: "Nadia (15 Tahun)",
        hof_c3_desc: "Website portofolio pribadi yang penuh dengan animasi CSS 3D dan transisi scroll mulus tanpa framework eksternal.",
        hof_btn_load_more: "Muat Lebih Banyak Karya",
        
        // Location Section
        loc_title: "Lokasi Belajar di Bali",
        loc_desc: "Pilih Learning Center terdekat dari rumah Anda untuk kelas tatap muka interaktif. Setiap cabang dilengkapi dengan lab komputer ber-AC, perangkat robotika, dan tutor ramah.",
        loc_calc_title: "Cek Kampus Terdekat",
        loc_calc_desc: "Masukkan area atau kecamatan Anda untuk melihat cabang mana yang paling mudah diakses.",
        loc_btn_check: "Cek Lokasi",
        loc_est_label: "Estimasi Perjalanan",
        
        // FAQ Section
        faq_badge: "Tanya Jawab",
        faq_title: "Pertanyaan yang Sering Diajukan",
        faq_desc: "Jawaban transparan seputar jadwal belajar, perangkat, usia minimal, dan sistem kelas percobaan.",
        faq_q1: "Apakah anak yang belum pernah memegang coding bisa ikut?",
        faq_a1: "Tentu bisa! 80% siswa baru kami memulai dari nol. Kami mengajarkan logika berpikir terstruktur (computational thinking) melalui blok visual interaktif terlebih dahulu sebelum beralih ke sintaks kode teks asli.",
        faq_q2: "Apakah tersedia kelas percobaan (trial class)?",
        faq_a2: "Ya, kami menyediakan sesi Free Trial di Learning Center Gianyar, Ubud Peliatan, dan Bedulu. Anda dapat mendaftarkan jadwal percobaan melalui form di bawah atau via WhatsApp admin kami.",
        faq_q3: "Apakah siswa harus membawa laptop sendiri?",
        faq_a3: "Setiap lab Learning Center kami sudah dilengkapi dengan PC/Laptop dan perangkat robotik siap pakai. Namun, siswa yang ingin membawa laptop pribadi agar proyek tersimpan langsung di perangkatnya sangat dipersilakan.",
        faq_q4: "Berapa rasio tutor per siswa di setiap kelas?",
        faq_a4: "Kami menjaga kualitas pembelajaran dengan kelas kecil: maksimal 4–6 anak per tutor agar setiap anak mendapat pendampingan intensif dan tidak ada yang tertinggal dalam proses praktek.",

        // Registration Form
        reg_title: "Mulai Petualangan Belajar",
        reg_desc: "Isi data singkat berikut untuk konsultasi jadwal kelas reguler atau klaim kelas percobaan gratis (trial). Konfirmasi akan otomatis diteruskan ke WhatsApp admin cabang.",
        reg_form_header: "Data Calon Siswa &amp; Wali Murid",
        reg_campus_count: "3 Kampus Tersedia di Bali",
        reg_choose_center: "Pilih Learning Center Terdekat",
        reg_choose_center_sub: "Klik untuk memilih cabang belajar anak Anda",
        reg_promo_sub: "Otomatis terisi jika klaim voucher promo",
        reg_lbl_name: "Nama Lengkap Siswa",
        reg_lbl_nickname: "Nama Panggilan",
        reg_lbl_age: "Usia Anak",
        reg_lbl_school: "Asal Sekolah",
        reg_lbl_parent: "Nama Orang Tua / Wali",
        reg_lbl_address: "Alamat Domisili",
        reg_lbl_wa_parent: "WhatsApp Orang Tua",
        reg_lbl_wa_child: "WhatsApp Anak (Opsional)",
        reg_btn_submit: "Kirim via WhatsApp",
        
        // Promo Popup
        promo_badge: "Promo Terbatas 2026",
        promo_sub: "Free Trial + Diskon Pendaftaran",
        promo_title: "Mulai Petualangan<br><span class=\"text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-yellow-500\">Kreator Digital!</span>",
        promo_body: "Klaim sesi uji coba gratis dan potongan biaya pendaftaran di seluruh Learning Center LesKoding sekarang:",
        promo_cta: "Daftar Sekarang & Klaim Promo",
        promo_trigger: "Promo 2026"
    }
};



// Language Toggle Functionality (DEFAULT: 'en')
window.toggleLanguage = function() {
    const currentLang = localStorage.getItem('leskoding_lang') || 'en';
    const nextLang = currentLang === 'en' ? 'id' : 'en';
    localStorage.setItem('leskoding_lang', nextLang);
    applyLanguage(nextLang);
};

window.applyLanguage = function(lang) {
    const dict = i18nDictionary[lang] || i18nDictionary.en;
    
    // Update all [data-i18n] elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.innerHTML = dict[key];
        }
    });
    
    // Update labels in buttons
    const langText = document.getElementById('current-lang-text');
    const mobileLangTopText = document.getElementById('mobile-lang-top-text');
    const mobileLangText = document.getElementById('mobile-lang-text');
    const displayLabel = lang.toUpperCase();
    
    if (langText) langText.textContent = displayLabel;
    if (mobileLangTopText) mobileLangTopText.textContent = displayLabel;
    if (mobileLangText) mobileLangText.textContent = displayLabel;
    
    // Update input placeholders
    const locInput = document.getElementById('user-location');
    if (locInput) {
        locInput.placeholder = lang === 'en' ? 'e.g. South Denpasar or Ubud' : 'Contoh: Denpasar Selatan atau Ubud';
    }

    const regName = document.getElementById('reg-nama');
    if (regName) regName.placeholder = lang === 'en' ? 'e.g. Putu Johan Lasya Hara' : 'Cth: Putu Johan Lasya Hara';

    const regNick = document.getElementById('reg-panggilan');
    if (regNick) regNick.placeholder = lang === 'en' ? 'e.g. Johan' : 'Cth: Johan';

    const regAge = document.getElementById('reg-usia');
    if (regAge) regAge.placeholder = lang === 'en' ? 'e.g. 10 yrs' : 'Cth: 10y';

    const regSchool = document.getElementById('reg-sekolah');
    if (regSchool) regSchool.placeholder = lang === 'en' ? 'e.g. SD Sutha Dharma' : 'Cth: SD Sutha Dharma';

    const regParent = document.getElementById('reg-ortu');
    if (regParent) regParent.placeholder = lang === 'en' ? 'e.g. Arik Ayu Rastini' : 'Cth: Arik Ayu Rastini';

    const regAddress = document.getElementById('reg-alamat');
    if (regAddress) regAddress.placeholder = lang === 'en' ? 'e.g. Br Katiklantang Singakerta Ubud' : 'Cth: Br Katiklantang Singakerta Ubud';

    const regPromo = document.getElementById('reg-promo');
    if (regPromo) regPromo.placeholder = lang === 'en' ? 'e.g. PETUALANGAN2026' : 'Cth: PETUALANGAN2026';
};

// Initialize Language on Page Load (DEFAULT: 'en')
document.addEventListener('DOMContentLoaded', () => {
    // Ensure dark theme is active
    document.documentElement.classList.remove('light-mode');
    localStorage.removeItem('leskoding_theme');

    // Initialize Language (DEFAULT: 'en' as requested)
    const savedLang = localStorage.getItem('leskoding_lang') || 'en';
    applyLanguage(savedLang);
});
