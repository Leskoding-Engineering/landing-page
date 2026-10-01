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
       7. DYNAMIC NAVBAR RESIZE
       ======================================================== */
    const navContainer = document.getElementById('nav-container');
    const navLogo = document.getElementById('nav-logo');
    
    if (navContainer && navLogo) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                // Shrink when scrolled
                navContainer.classList.add('py-2.5', 'md:py-3');
                navContainer.classList.remove('py-4', 'md:py-5');
                navLogo.classList.add('h-5', 'md:h-6');
                navLogo.classList.remove('h-8', 'md:h-10');
            } else {
                // Large when at the top
                navContainer.classList.add('py-4', 'md:py-5');
                navContainer.classList.remove('py-2.5', 'md:py-3');
                navLogo.classList.add('h-8', 'md:h-10');
                navLogo.classList.remove('h-5', 'md:h-6');
            }
        });
    }

});

/* ========================================================
   8. COURSE ADVENTURE MAP TABS
   ======================================================== */
function switchCoursePath(courseId) {
    // 1. Reset all tabs to inactive state
    const allTabs = document.querySelectorAll('.course-tab-btn');
    allTabs.forEach(tab => {
        tab.classList.remove(
            'border-brand-500', 'border-purpleBrand-500', 'border-gold-500',
            'bg-dark-900',
            'shadow-[0_0_20px_rgba(14,165,233,0.15)]',
            'shadow-[0_0_20px_rgba(168,85,247,0.15)]',
            'shadow-[0_0_20px_rgba(250,204,21,0.15)]'
        );
        tab.classList.add('border-white/10', 'bg-dark-950/80');
        
        // Hide bg opacity if exists
        const bg = tab.querySelector('.tab-bg');
        if (bg) { bg.classList.remove('opacity-100'); bg.classList.add('opacity-0'); }
        
        // Reset text colors to slate
        const icon = tab.querySelector('.tab-icon');
        const title = tab.querySelector('.tab-title');
        const subtitle = tab.querySelector('.tab-subtitle');
        if (icon) { icon.classList.remove('text-brand-400', 'text-purpleBrand-400', 'text-gold-400'); icon.classList.add('text-slate-400'); }
        if (title) { title.classList.remove('text-white'); title.classList.add('text-slate-300'); }
        if (subtitle) { subtitle.classList.remove('text-brand-200', 'text-purpleBrand-200', 'text-gold-200'); subtitle.classList.add('text-slate-500'); }
    });

    // 2. Hide all paths
    const allPaths = document.querySelectorAll('.course-path');
    allPaths.forEach(path => {
        path.classList.remove('block', 'opacity-100');
        path.classList.add('hidden', 'opacity-0');
    });

    // 3. Activate selected tab
    const activeTab = document.getElementById(`tab-${courseId}`);
    if (activeTab) {
        activeTab.classList.remove('border-white/10', 'bg-dark-900/50');
        activeTab.classList.add('bg-dark-900');
        
        const bg = activeTab.querySelector('.tab-bg');
        if (bg) { bg.classList.remove('opacity-0'); bg.classList.add('opacity-100'); }
        
        const icon = activeTab.querySelector('.tab-icon');
        const title = activeTab.querySelector('.tab-title');
        const subtitle = activeTab.querySelector('.tab-subtitle');
        
        if (icon) icon.classList.remove('text-slate-400');
        if (title) { title.classList.remove('text-slate-300'); title.classList.add('text-white'); }
        if (subtitle) subtitle.classList.remove('text-slate-500');

        // Apply specific brand colors based on course
        if (courseId === 'game') {
            activeTab.classList.add('border-brand-500', 'shadow-[0_0_20px_rgba(14,165,233,0.15)]');
            if (icon) icon.classList.add('text-brand-400');
            if (subtitle) subtitle.classList.add('text-brand-200');
        } else if (courseId === 'web') {
            activeTab.classList.add('border-purpleBrand-500', 'shadow-[0_0_20px_rgba(168,85,247,0.15)]');
            if (icon) icon.classList.add('text-purpleBrand-400');
            if (subtitle) subtitle.classList.add('text-purpleBrand-200');
        } else if (courseId === 'robotic') {
            activeTab.classList.add('border-gold-500', 'shadow-[0_0_20px_rgba(250,204,21,0.15)]');
            if (icon) icon.classList.add('text-gold-400');
            if (subtitle) subtitle.classList.add('text-gold-200');
        }
    }

    // 4. Show selected path
    const activePath = document.getElementById(`path-${courseId}`);
    if (activePath) {
        activePath.classList.remove('hidden');
        // small delay to allow display block to render before changing opacity for transition
        setTimeout(() => {
            activePath.classList.remove('opacity-0');
            activePath.classList.add('opacity-100');
        }, 50);
    }
}

/* ========================================================
   9. COURSE MODAL (GAMIFICATION DETAILS)
   ======================================================== */
function openCourseModal(level, title, iconClass, colorClass, desc, xp, duration, topics) {
    const modal = document.getElementById('course-modal');
    const modalContent = document.getElementById('course-modal-content');
    
    if (!modal || !modalContent) return;

    // Populate data
    document.getElementById('modal-level').textContent = level;
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-desc').textContent = desc;
    document.getElementById('modal-xp').textContent = xp;
    document.getElementById('modal-duration').textContent = duration;
    
    // Icon
    const iconEl = document.getElementById('modal-icon');
    iconEl.className = `fa-solid ${iconClass} text-white`;

    // Colors
    const colorBar = document.getElementById('modal-color-bar');
    const iconContainer = document.getElementById('modal-icon-container');
    const modalBtn = document.getElementById('modal-btn');
    
    // Reset previous color classes
    colorBar.className = 'absolute top-0 left-0 w-full h-1.5';
    iconContainer.className = 'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-white/10 bg-dark-950';
    modalBtn.className = 'w-full inline-flex justify-center items-center gap-2 text-dark-950 font-bold py-3.5 rounded-xl uppercase tracking-[0.1em] text-xs transition-all';
    
    // Apply specific color theme
    if (colorClass.includes('emerald')) {
        colorBar.classList.add('bg-emerald-500');
        iconContainer.classList.add('shadow-[0_0_15px_rgba(16,185,129,0.3)]');
        modalBtn.classList.add('bg-emerald-500', 'hover:bg-emerald-400', 'shadow-[0_0_15px_rgba(16,185,129,0.3)]', 'hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]');
    } else if (colorClass.includes('brand')) {
        colorBar.classList.add('bg-brand-500');
        iconContainer.classList.add('shadow-[0_0_15px_rgba(20,184,166,0.3)]');
        modalBtn.classList.add('bg-brand-500', 'hover:bg-brand-400', 'shadow-[0_0_15px_rgba(20,184,166,0.3)]', 'hover:shadow-[0_0_25px_rgba(20,184,166,0.5)]');
    } else if (colorClass.includes('purple')) {
        colorBar.classList.add('bg-purpleBrand-500');
        iconContainer.classList.add('shadow-[0_0_15px_rgba(147,51,234,0.3)]');
        modalBtn.classList.add('bg-purpleBrand-500', 'hover:bg-purpleBrand-400', 'shadow-[0_0_15px_rgba(147,51,234,0.3)]', 'hover:shadow-[0_0_25px_rgba(147,51,234,0.5)]');
    } else if (colorClass.includes('gold')) {
        colorBar.classList.add('bg-gold-500');
        iconContainer.classList.add('shadow-[0_0_15px_rgba(250,204,21,0.3)]');
        modalBtn.classList.add('bg-gold-500', 'hover:bg-gold-400', 'shadow-[0_0_15px_rgba(250,204,21,0.3)]', 'hover:shadow-[0_0_25px_rgba(250,204,21,0.5)]');
    }

    // Topics list
    const topicsUl = document.getElementById('modal-topics');
    topicsUl.innerHTML = '';
    topics.forEach(topic => {
        const li = document.createElement('li');
        li.className = 'flex items-start gap-2';
        li.innerHTML = `<i class="fa-solid fa-check text-[10px] mt-1 text-slate-500"></i> <span>${topic}</span>`;
        topicsUl.appendChild(li);
    });

    // Show modal
    modal.classList.remove('hidden');
    // small delay for transition
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
    }, 300);
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
        nav_hof: "Hall of Fame",
        nav_course: "Courses",
        nav_location: "Locations",
        nav_enroll: "Enroll",
        nav_start_adventure: "Start Adventure",
        
        // Hero Section
        hero_title_1: "Experience an Unforgettable",
        hero_title_2: "Coding Adventure!",
        hero_desc_1: "Every epic journey begins with a single step. At <span class=\"text-white font-bold\">LesKoding</span>, we don\'t just teach code – we guide young minds on an inspiring quest where boundless creativity meets cutting-edge technology.",
        hero_desc_2: "Ready to explore a world of infinite possibilities? Sharpen your logic, build real games and robots alongside great friends, and watch your digital ideas come to life. Start your adventure today!",
        hero_btn_start: "Start Adventure!",
        hero_btn_route: "Explore Routes",
        stats_students: "Active Students",
        stats_projects: "Completed Projects",
        hero_slogan_title: "From <span class=\"text-redBrand-400 line-through decoration-2 decoration-redBrand-500/50\">Zero</span><br>to <span class=\"text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purpleBrand-400\">Tech Creator!</span>",
        hero_slogan_desc: "Far beyond ordinary classes. We transform children\'s curiosity into tangible, future-ready digital masterpieces.",
        
        // Hall of Fame
        hof_title: "Success Stories from<br><span class=\"text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-yellow-600\">Our Explorers!</span>",
        hof_desc: "This is where our students\' extraordinary creations take the spotlight! Each project is a milestone of relentless dedication, logic, and creativity. Inspired by their triumphs? Join us and ignite your own journey!",
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
        
        // Features (Bento Grid)
        feat_badge: "Learning Adventure",
        feat_title: "Why is This Adventure Invaluable?",
        feat_desc: "At LesKoding, every single class is a fresh, exciting digital expedition.",
        feat_f1_title: "Interactive Courses",
        feat_f1_desc: "Follow a dynamic learning roadmap where each session propels you closer to your grand coding goals.",
        feat_f2_title: "Expert Facilitators",
        feat_f2_desc: "Your adventure guides are seasoned industry experts eager to share practical knowledge and inspiration.",
        feat_f3_title: "Community Network",
        feat_f3_desc: "Connect with fellow young explorers, share achievements, and inspire one another in a creative circle.",
        feat_f4_title: "Micro-Learning RPG",
        feat_f4_desc: "Lessons broken down into exciting quests. Learning code is as thrilling as leveling up in your favorite RPG.",
        
        // Course Section
        course_badge: "Adventure Awaits",
        course_title: "Choose Your Learning Path!",
        course_desc: "Find the route that fits you best! Are you ready to dive into the coding universe in an exciting way?",
        course_game_title: "Game Developer Path",
        course_game_desc: "From core algorithmic logic to building interactive 3D worlds played by thousands on Roblox.",
        course_web_title: "Web Architect Path",
        course_web_desc: "Build modern interactive websites and web apps from fundamental styling to full internet deployment.",
        course_robotic_title: "Robotic Engineer Path",
        course_robotic_desc: "Master electronic circuits, microcontroller coding, and engineer autonomous robots for the future.",
        
        // Location Section
        loc_title: "Find Your Route to Adventure!",
        loc_desc: "Visit one of our learning centers in Gianyar, Ubud, or Bedulu for in-person interactive classes.",
        loc_calc_title: "Check Nearest Campus",
        loc_calc_desc: "Enter your district or area to discover which campus is closest to your location.",
        loc_btn_check: "Check Location",
        loc_est_label: "Estimated Arrival",
        
        // Registration Form
        reg_title: "Enroll in Your Adventure",
        reg_desc: "Fill out the form below to begin your child\'s digital journey. Confirmation is processed automatically via WhatsApp.",
        reg_form_header: "LesKoding New Student Registration Form",
        reg_campus_count: "3 Campuses Available in Bali",
        reg_choose_center: "Choose Nearest Learning Center",
        reg_choose_center_sub: "Click to choose your child\'s study center",
        reg_promo_sub: "Auto-filled when claiming promo voucher",
        reg_lbl_name: "Full Name",
        reg_lbl_nickname: "Nickname",
        reg_lbl_age: "Age",
        reg_lbl_school: "School Name",
        reg_lbl_parent: "Parent\'s Name",
        reg_lbl_address: "Full Home Address",
        reg_lbl_wa_parent: "Parent\'s WhatsApp",
        reg_lbl_wa_child: "Child\'s WhatsApp (Optional)",
        reg_btn_submit: "Submit Registration via WhatsApp",
        
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
        nav_hof: "Hall of Fame",
        nav_course: "Course",
        nav_location: "Location",
        nav_enroll: "Enroll",
        nav_start_adventure: "Mulai Petualangan",
        
        // Hero Section
        hero_title_1: "Rasakan Petualangan Coding yang",
        hero_title_2: "Tak Terlupakan!",
        hero_desc_1: "Setiap petualangan dimulai dengan langkah pertama. Di <span class=\"text-white font-bold\">LesKoding</span>, kami tidak hanya mengajarkan coding – kami membawa Anda dalam perjalanan yang menggugah semangat, di mana kreativitas dan teknologi bertemu.",
        hero_desc_2: "Apakah Anda siap untuk menjelajahi dunia yang penuh dengan kemungkinan? Bersiaplah untuk mengasah keterampilan Anda, berkolaborasi dengan teman baru, dan menyaksikan ide-ide Anda hidup. Mulailah petualangan Anda hari ini!",
        hero_btn_start: "Mulai Petualangan!",
        hero_btn_route: "Pelajari Rute Kami",
        stats_students: "Siswa Aktif",
        stats_projects: "Proyek Selesai",
        hero_slogan_title: "Dari <span class=\"text-redBrand-400 line-through decoration-2 decoration-redBrand-500/50\">Nol</span><br>Menjadi <span class=\"text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purpleBrand-400\">Kreator Teknologi!</span>",
        hero_slogan_desc: "Bukan sekadar belajar biasa. Kami sulap rasa penasaranmu menjadi karya digital nyata berstandar masa depan.",
        
        // Hall of Fame
        hof_title: "Kisah Sukses dari<br><span class=\"text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-yellow-600\">Penjelajah Kami!</span>",
        hof_desc: "Di sinilah karya luar biasa dari siswa kami ditampilkan! Setiap proyek adalah petualangan yang menceritakan perjalanan kreativitas dan dedikasi. Terinspirasi oleh pencapaian mereka? Bergabunglah dan biarkan petualangan Anda dimulai!",
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
        
        // Features (Bento Grid)
        feat_badge: "Petualangan Belajar",
        feat_title: "Mengapa Petualangan Ini Sangat Berharga?",
        feat_desc: "Di LesKoding, setiap kelas adalah sebuah eksplorasi baru.",
        feat_f1_title: "Kursus Interaktif",
        feat_f1_desc: "Ikuti peta belajar yang dinamis, di mana setiap sesi membawa Anda lebih dekat menuju tujuan besar Anda dalam petualangan coding.",
        feat_f2_title: "Fasilitator Ahli",
        feat_f2_desc: "Pemandu Anda dalam petualangan ini adalah para ahli yang siap membagikan pengetahuan berharga.",
        feat_f3_title: "Koneksi Komunitas",
        feat_f3_desc: "Bergabunglah dengan sesama petualang, berbagi pengalaman, dan saling membantu dalam belajar.",
        feat_f4_title: "Micro-Learning RPG",
        feat_f4_desc: "Materi dipecah menjadi quest. Belajar koding semenarik menaikkan level karakter di game favorit Anda.",
        
        // Course Section
        course_badge: "Petualangan Menanti",
        course_title: "Pilih Jalur Petualanganmu!",
        course_desc: "Temukan rute yang paling sesuai untuk Anda! Apakah Anda siap untuk menjelajahi dunia coding dengan cara yang menyenangkan?",
        course_game_title: "Jalur Game Developer",
        course_game_desc: "Dari logika dasar hingga membangun dunia 3D interaktif yang dimainkan ribuan orang di Roblox.",
        course_web_title: "Jalur Web Architect",
        course_web_desc: "Bangun situs web interaktif dan aplikasi modern dari pondasi kode hingga rilis penuh ke internet.",
        course_robotic_title: "Jalur Robotic Engineer",
        course_robotic_desc: "Kuasai sirkuit elektronik, pemrograman mikrokontroler, dan bangun robot otomatis masa depan.",
        
        // Location Section
        loc_title: "Temukan Rute Menuju Petualangan Anda!",
        loc_desc: "Kunjungi salah satu pusat belajar kami di Gianyar, Ubud, atau Bedulu untuk petualangan tatap muka langsung.",
        loc_calc_title: "Cek Kampus Terdekat",
        loc_calc_desc: "Masukkan area/kecamatan Anda untuk melihat cabang mana yang paling mudah diakses.",
        loc_btn_check: "Cek Lokasi",
        loc_est_label: "Estimasi Tiba",
        
        // Registration Form
        reg_title: "Daftar Petualangan Anda",
        reg_desc: "Isi formulir di bawah ini untuk memulai perjalanan digital anak Anda. Konfirmasi pendaftaran akan diproses otomatis melalui WhatsApp.",
        reg_form_header: "Formulir Pendaftaran Siswa Baru LesKoding",
        reg_campus_count: "3 Kampus Tersedia di Bali",
        reg_choose_center: "Pilih Learning Center Terdekat",
        reg_choose_center_sub: "Klik untuk memilih cabang belajar anak Anda",
        reg_promo_sub: "Otomatis terisi jika klaim voucher promo",
        reg_lbl_name: "Nama Lengkap",
        reg_lbl_nickname: "Panggilan",
        reg_lbl_age: "Usia",
        reg_lbl_school: "Asal Sekolah",
        reg_lbl_parent: "Nama Orang Tua",
        reg_lbl_address: "Alamat Lengkap",
        reg_lbl_wa_parent: "WA Orang Tua",
        reg_lbl_wa_child: "WA Anak (Opsional)",
        reg_btn_submit: "Kirim Pendaftaran via WhatsApp",
        
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
    const mobileLangText = document.getElementById('mobile-lang-text');
    const displayLabel = lang.toUpperCase();
    
    if (langText) langText.textContent = displayLabel;
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
