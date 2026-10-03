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
            
            const currentLang = localStorage.getItem('leskoding_lang') || 'en';
            // Simple Validation
            if (!/^[0-9\+\-\s]+$/.test(waOrtu)) {
                alert(currentLang === 'en' ? "Please enter a valid Parent WhatsApp number (digits only)." : "Mohon masukkan format Nomor WA Orang Tua yang valid (angka).");
                document.getElementById('reg-wa-ortu').focus();
                return;
            }
            if (waOrtu.length < 9) {
                alert(currentLang === 'en' ? "WhatsApp number is too short." : "Nomor WA terlalu pendek.");
                document.getElementById('reg-wa-ortu').focus();
                return;
            }

            const centerSelect = document.getElementById('reg-center');
            const center = centerSelect ? centerSelect.value : '';
            if (!center) {
                alert(currentLang === 'en' ? "Please choose your nearest Learning Center first." : "Mohon pilih Learning Center terdekat terlebih dahulu.");
                const cards = document.getElementById('reg-center-cards');
                if (cards) {
                    cards.classList.add('reg-error');
                    cards.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => cards.classList.remove('reg-error'), 2500);
                }
                return;
            }

            const programSelect = document.getElementById('reg-program');
            const program = programSelect ? programSelect.value : '';

            const promoInput = document.getElementById('reg-promo');
            const promo = promoInput ? promoInput.value.trim() : '';

            const message = currentLang === 'en' ?
`*New Student Registration Form — LesKoding Academy*

Learning Center: ${center}
Selected Program: ${program || '-'}
Promo Code: ${promo || '-'}

Student Full Name: ${nama}
Nickname: ${panggilan}
Child Age: ${usia}
School: ${sekolah}
Parent/Guardian Name: ${ortu}
Parent Email: ${email}
Home Address: ${alamat}
Parent WhatsApp: ${waOrtu}
Child WhatsApp (optional): ${waAnak}`
:
`*Form Pendaftaran Siswa Baru Akademi LesKoding*

Pilihan Learning Center: ${center}
Program yang Dipilih: ${program || '-'}
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
            if (center.includes("Private") || center.includes("Peliatan") || center.includes("Rumah")) {
                adminWA = "6285792736627"; // Private / Home Visit admin
            }
            const whatsappUrl = `https://wa.me/${adminWA}?text=${encodedMessage}`;
            
            window.open(whatsappUrl, '_blank');
        });
    }

    /* ========================================================
       7. DYNAMIC NAVBAR SCROLL EFFECT
       ======================================================== */
    const navbar = document.getElementById('main-header');
    const navContainer = document.getElementById('nav-container');
    const navLogo = document.getElementById('nav-logo');
    
    if (navbar && navContainer && navLogo) {
        const handleNavScroll = () => {
            if (window.scrollY > 30) {
                // Scrolled: Frosted Glass / Translucent Dark with border and shadow
                navbar.classList.add('bg-[#0B0F19]/90', 'backdrop-blur-xl', 'border-white/10', 'shadow-lg');
                navbar.classList.remove('bg-transparent', 'border-transparent');
                
                navContainer.classList.add('h-14', 'sm:h-16', 'lg:h-[72px]');
                navContainer.classList.remove('h-16', 'sm:h-20', 'lg:h-24');
                navLogo.classList.add('h-7', 'sm:h-8', 'lg:h-9');
                navLogo.classList.remove('h-8', 'sm:h-9', 'lg:h-11');
            } else {
                // Top: Completely Transparent
                navbar.classList.add('bg-transparent', 'border-transparent');
                navbar.classList.remove('bg-[#0B0F19]/90', 'backdrop-blur-xl', 'border-white/10', 'shadow-lg');
                
                navContainer.classList.add('h-16', 'sm:h-20', 'lg:h-24');
                navContainer.classList.remove('h-14', 'sm:h-16', 'lg:h-[72px]');
                navLogo.classList.add('h-8', 'sm:h-9', 'lg:h-11');
                navLogo.classList.remove('h-7', 'sm:h-8', 'lg:h-9');
            }
        };

        window.addEventListener('scroll', handleNavScroll, { passive: true });
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

/* ========================================================
   COURSES DATA (BILINGUAL SYLLABUS & DETAILS)
   ======================================================== */
const coursesData = {
    'kids-innovator': {
        icon: 'fa-cubes',
        color: 'yellow',
        xp: '+500 XP',
        id: {

        "funnel_tag": "Panduan Keputusan Orang Tua",
        "funnel_title": "Alur Mudah: Saya Harus Mulai dari Mana?",
        "step1_title": "Kenali Manfaat",
        "step2_title": "Pilih Level Anak",
        "step3_title": "Lihat Karya Project",
        "step4_title": "Coba Kelas Gratis",
        "step5_title": "Mulai Berkarya",


        "benefit_badge": "INVESTASI MASA DEPAN ANAK",
        "benefit_title_1": "Bukan hanya belajar coding.",
        "benefit_title_2": "Anak belajar <span class=\"text-[#38BDF8]\">berpikir</span>, <span class=\"text-[#34D399]\">mencoba</span>, &amp; <span class=\"text-[#FFC83D]\">berkarya</span>.",
        "b_tab_logic": "Berpikir Logis",
        "b_tab_creative": "Kreatif",
        "b_tab_problem": "Problem Solving",
        "b_tab_present": "Presentasi",
        "b_tab_portfolio": "Portofolio",
        "b1_tag": "LOGIKA TERSTRUKTUR",
        "b1_title": "Berpikir Logis & Terstruktur",
        "b1_desc": "Anak dilatih memecah masalah besar menjadi langkah-langkah kecil yang teratur dan sistematis (computational thinking). Kemampuan ini dapat membantu di pelajaran matematika dan sains di sekolah.",
        "b1_prob_title": "MASALAH: \"Buat robot pulang ke rumah\"",
        "b1_prob_1": "1. maju 3 langkah",
        "b1_prob_2": "2. jika ada tembok → belok kanan",
        "b1_prob_3": "3. ulangi sampai ketemu 🏠",
        "b1_prob_note": "Masalah besar → langkah kecil yang urut",
        "b2_tag": "KREATOR AKTIF",
        "b2_title": "Kreatif Membuat Project",
        "b2_desc": "Kebiasaan screen-time pasif berubah menjadi waktu berkarya. Anak mendesain karakter, jalan cerita, dan aturan permainannya sendiri dari imajinasi mereka.",
        "b2_demo_title": "DESAIN GAME · ide Komang",
        "b2_demo_char": "Karakter:",
        "b2_demo_char_v": "naga kecil penjaga pulau",
        "b2_demo_miss": "Misi:",
        "b2_demo_miss_v": "kumpulkan 10 permata",
        "b2_demo_rule": "Aturan:",
        "b2_demo_rule_v": "kena ombak = mulai lagi",
        "b3_tag": "GROWTH MINDSET",
        "b3_title": "Problem Solving & Tangguh",
        "b3_desc": "Anak tidak takut salah saat menghadapi error (debugging). Mereka belajar menganalisis penyebab masalah, mencoba solusi lain dengan tenang, dan tidak mudah menyerah.",
        "b3_demo_err": "Error: karakter jatuh menembus lantai",
        "b3_demo_chk1": "Cek: apakah lantai punya collider?",
        "b3_demo_chk2": "Coba: aktifkan \"Anchored\"",
        "b3_demo_chk3": "Berhasil! Dicari sendiri 💪",
        "b4_tag": "SHOW & TELL",
        "b4_title": "Percaya Diri Presentasi",
        "b4_desc": "Di akhir setiap proyek, siswa mempresentasikan karyanya di depan tutor dan teman sekelas. Ini membangun keberanian public speaking dan kemampuan menyampaikan ide sejak dini.",
        "b4_demo_title": "SHOWCASE · akhir proyek",
        "b4_demo_quote": "\"Ini game buatanku!\"",
        "b4_demo_note": "Menjelaskan ide, cara main & tantangan yang dihadapi",
        "b5_tag": "PORTOFOLIO NYATA",
        "b5_title": "Portofolio Digital & Sertifikat",
        "b5_desc": "Setiap karya (game, website, aplikasi) tersimpan rapi, dan anak mendapat sertifikat setelah menyelesaikan course. Bukti nyata kompetensi untuk sekolah maupun jenjang berikutnya.",
        "b5_demo_title": "PORTOFOLIO SISWA",
        "b5_demo_item1": "Game Tangkap Bintang",
        "b5_demo_item2": "Website Profil",
        "b5_demo_item3": "Aplikasi Kuis",
        "b5_demo_item4": "Sertifikat",
        "b5_demo_item4_sub": "course selesai",

            level: 'Kids Level (6-8 Tahun)',
            title: 'Innovator',
            duration: '4-8 Minggu',
            desc: 'Level pertama untuk mengenalkan anak pada logika dan cara berpikir seperti programmer melalui permainan dan aktivitas visual.',
            tools: [['Scratch Jr', 'scratch.png'], ['CodeMonkey', 'codemonkey.png']],
            topics: [
                'Urutan perintah (Sequencing)',
                'Logika sederhana',
                'Event dan perintah',
                'Gerakan karakter',
                'Pola dan pengulangan sederhana',
                'Problem solving dasar',
                'Membuat cerita dan animasi'
            ]
        },
        en: {

        "funnel_tag": "Parent Decision Guide",
        "funnel_title": "Easy Flow: Where Should I Start?",
        "step1_title": "Understand the Benefits",
        "step2_title": "Choose Child's Level",
        "step3_title": "View Project Portfolio",
        "step4_title": "Try a Free Class",
        "step5_title": "Start Creating",


        "benefit_badge": "INVESTMENT IN YOUR CHILD'S FUTURE",
        "benefit_title_1": "Not just learning to code.",
        "benefit_title_2": "Learning to <span class=\"text-[#38BDF8]\">think</span>, <span class=\"text-[#34D399]\">try</span>, &amp; <span class=\"text-[#FFC83D]\">create</span>.",
        "b_tab_logic": "Logical Thinking",
        "b_tab_creative": "Creative",
        "b_tab_problem": "Problem Solving",
        "b_tab_present": "Presentation",
        "b_tab_portfolio": "Portfolio",
        "b1_tag": "STRUCTURED LOGIC",
        "b1_title": "Logical & Structured Thinking",
        "b1_desc": "Children are trained to break down big problems into organized, systematic steps (computational thinking). This skill helps them in math and science at school.",
        "b1_prob_title": "PROBLEM: \"Make the robot go home\"",
        "b1_prob_1": "1. move forward 3 steps",
        "b1_prob_2": "2. if there's a wall → turn right",
        "b1_prob_3": "3. repeat until finding 🏠",
        "b1_prob_note": "Big problem → ordered small steps",
        "b2_tag": "ACTIVE CREATOR",
        "b2_title": "Creative Project Making",
        "b2_desc": "Passive screen-time turns into productive creation. Children design their own characters, storylines, and game rules from their imagination.",
        "b2_demo_title": "GAME DESIGN · Komang's idea",
        "b2_demo_char": "Character:",
        "b2_demo_char_v": "little dragon guarding the island",
        "b2_demo_miss": "Mission:",
        "b2_demo_miss_v": "collect 10 gems",
        "b2_demo_rule": "Rules:",
        "b2_demo_rule_v": "hit by wave = restart",
        "b3_tag": "GROWTH MINDSET",
        "b3_title": "Problem Solving & Resilience",
        "b3_desc": "Children aren't afraid of making mistakes when encountering errors (debugging). They learn to analyze causes, calmly try alternatives, and persevere.",
        "b3_demo_err": "Error: character falls through the floor",
        "b3_demo_chk1": "Check: does the floor have a collider?",
        "b3_demo_chk2": "Try: enable \"Anchored\"",
        "b3_demo_chk3": "Success! Found it themselves 💪",
        "b4_tag": "SHOW & TELL",
        "b4_title": "Confident Presentation",
        "b4_desc": "At the end of every project, students present their work in front of the tutor and classmates. This builds early public speaking and communication skills.",
        "b4_demo_title": "SHOWCASE · project finale",
        "b4_demo_quote": "\"This is my game!\"",
        "b4_demo_note": "Explaining ideas, gameplay & challenges faced",
        "b5_tag": "REAL PORTFOLIO",
        "b5_title": "Digital Portfolio & Certificate",
        "b5_desc": "Every creation (game, website, app) is neatly saved, and children get a certificate upon course completion. Real proof of skills for school and beyond.",
        "b5_demo_title": "STUDENT PORTFOLIO",
        "b5_demo_item1": "Star Catcher Game",
        "b5_demo_item2": "Profile Website",
        "b5_demo_item3": "Quiz App",
        "b5_demo_item4": "Certificate",
        "b5_demo_item4_sub": "course completed",

            level: 'Kids Level (6-8 Years)',
            title: 'Innovator',
            duration: '4-8 Weeks',
            desc: 'The first level to introduce children to logic and how to think like a programmer through games and visual activities.',
            tools: [['Scratch Jr', 'scratch.png'], ['CodeMonkey', 'codemonkey.png']],
            topics: [
                'Command Sequencing',
                'Simple Logic',
                'Events and Commands',
                'Character Movement',
                'Patterns and Simple Loops',
                'Basic Problem Solving',
                'Creating Stories and Animations'
            ]
        }
    },
    'kids-beginner': {
        icon: 'fa-gamepad',
        color: 'emerald',
        xp: '+1000 XP',
        id: {

        "funnel_tag": "Panduan Keputusan Orang Tua",
        "funnel_title": "Alur Mudah: Saya Harus Mulai dari Mana?",
        "step1_title": "Kenali Manfaat",
        "step2_title": "Pilih Level Anak",
        "step3_title": "Lihat Karya Project",
        "step4_title": "Coba Kelas Gratis",
        "step5_title": "Mulai Berkarya",


        "benefit_badge": "INVESTASI MASA DEPAN ANAK",
        "benefit_title_1": "Bukan hanya belajar coding.",
        "benefit_title_2": "Anak belajar <span class=\"text-[#38BDF8]\">berpikir</span>, <span class=\"text-[#34D399]\">mencoba</span>, &amp; <span class=\"text-[#FFC83D]\">berkarya</span>.",
        "b_tab_logic": "Berpikir Logis",
        "b_tab_creative": "Kreatif",
        "b_tab_problem": "Problem Solving",
        "b_tab_present": "Presentasi",
        "b_tab_portfolio": "Portofolio",
        "b1_tag": "LOGIKA TERSTRUKTUR",
        "b1_title": "Berpikir Logis & Terstruktur",
        "b1_desc": "Anak dilatih memecah masalah besar menjadi langkah-langkah kecil yang teratur dan sistematis (computational thinking). Kemampuan ini dapat membantu di pelajaran matematika dan sains di sekolah.",
        "b1_prob_title": "MASALAH: \"Buat robot pulang ke rumah\"",
        "b1_prob_1": "1. maju 3 langkah",
        "b1_prob_2": "2. jika ada tembok → belok kanan",
        "b1_prob_3": "3. ulangi sampai ketemu 🏠",
        "b1_prob_note": "Masalah besar → langkah kecil yang urut",
        "b2_tag": "KREATOR AKTIF",
        "b2_title": "Kreatif Membuat Project",
        "b2_desc": "Kebiasaan screen-time pasif berubah menjadi waktu berkarya. Anak mendesain karakter, jalan cerita, dan aturan permainannya sendiri dari imajinasi mereka.",
        "b2_demo_title": "DESAIN GAME · ide Komang",
        "b2_demo_char": "Karakter:",
        "b2_demo_char_v": "naga kecil penjaga pulau",
        "b2_demo_miss": "Misi:",
        "b2_demo_miss_v": "kumpulkan 10 permata",
        "b2_demo_rule": "Aturan:",
        "b2_demo_rule_v": "kena ombak = mulai lagi",
        "b3_tag": "GROWTH MINDSET",
        "b3_title": "Problem Solving & Tangguh",
        "b3_desc": "Anak tidak takut salah saat menghadapi error (debugging). Mereka belajar menganalisis penyebab masalah, mencoba solusi lain dengan tenang, dan tidak mudah menyerah.",
        "b3_demo_err": "Error: karakter jatuh menembus lantai",
        "b3_demo_chk1": "Cek: apakah lantai punya collider?",
        "b3_demo_chk2": "Coba: aktifkan \"Anchored\"",
        "b3_demo_chk3": "Berhasil! Dicari sendiri 💪",
        "b4_tag": "SHOW & TELL",
        "b4_title": "Percaya Diri Presentasi",
        "b4_desc": "Di akhir setiap proyek, siswa mempresentasikan karyanya di depan tutor dan teman sekelas. Ini membangun keberanian public speaking dan kemampuan menyampaikan ide sejak dini.",
        "b4_demo_title": "SHOWCASE · akhir proyek",
        "b4_demo_quote": "\"Ini game buatanku!\"",
        "b4_demo_note": "Menjelaskan ide, cara main & tantangan yang dihadapi",
        "b5_tag": "PORTOFOLIO NYATA",
        "b5_title": "Portofolio Digital & Sertifikat",
        "b5_desc": "Setiap karya (game, website, aplikasi) tersimpan rapi, dan anak mendapat sertifikat setelah menyelesaikan course. Bukti nyata kompetensi untuk sekolah maupun jenjang berikutnya.",
        "b5_demo_title": "PORTOFOLIO SISWA",
        "b5_demo_item1": "Game Tangkap Bintang",
        "b5_demo_item2": "Website Profil",
        "b5_demo_item3": "Aplikasi Kuis",
        "b5_demo_item4": "Sertifikat",
        "b5_demo_item4_sub": "course selesai",

            level: 'Kids Level (8-11 Tahun)',
            title: 'Beginner',
            duration: '8-12 Minggu',
            desc: 'Pada level ini anak mulai belajar block coding dan membuat program yang dapat bergerak, berbunyi, merespons pemain, dan memiliki aturan permainan.',
            tools: [['Scratch', 'scratch.png'], ['PictoBlox', 'pictoblox.png']],
            topics: [
                'Event, Motion & Looks',
                'Sound & Sensing',
                'Control & Loop',
                'Variable dasar',
                'Condition sederhana',
                'Game mechanics dasar'
            ]
        },
        en: {

        "funnel_tag": "Parent Decision Guide",
        "funnel_title": "Easy Flow: Where Should I Start?",
        "step1_title": "Understand the Benefits",
        "step2_title": "Choose Child's Level",
        "step3_title": "View Project Portfolio",
        "step4_title": "Try a Free Class",
        "step5_title": "Start Creating",


        "benefit_badge": "INVESTMENT IN YOUR CHILD'S FUTURE",
        "benefit_title_1": "Not just learning to code.",
        "benefit_title_2": "Learning to <span class=\"text-[#38BDF8]\">think</span>, <span class=\"text-[#34D399]\">try</span>, &amp; <span class=\"text-[#FFC83D]\">create</span>.",
        "b_tab_logic": "Logical Thinking",
        "b_tab_creative": "Creative",
        "b_tab_problem": "Problem Solving",
        "b_tab_present": "Presentation",
        "b_tab_portfolio": "Portfolio",
        "b1_tag": "STRUCTURED LOGIC",
        "b1_title": "Logical & Structured Thinking",
        "b1_desc": "Children are trained to break down big problems into organized, systematic steps (computational thinking). This skill helps them in math and science at school.",
        "b1_prob_title": "PROBLEM: \"Make the robot go home\"",
        "b1_prob_1": "1. move forward 3 steps",
        "b1_prob_2": "2. if there's a wall → turn right",
        "b1_prob_3": "3. repeat until finding 🏠",
        "b1_prob_note": "Big problem → ordered small steps",
        "b2_tag": "ACTIVE CREATOR",
        "b2_title": "Creative Project Making",
        "b2_desc": "Passive screen-time turns into productive creation. Children design their own characters, storylines, and game rules from their imagination.",
        "b2_demo_title": "GAME DESIGN · Komang's idea",
        "b2_demo_char": "Character:",
        "b2_demo_char_v": "little dragon guarding the island",
        "b2_demo_miss": "Mission:",
        "b2_demo_miss_v": "collect 10 gems",
        "b2_demo_rule": "Rules:",
        "b2_demo_rule_v": "hit by wave = restart",
        "b3_tag": "GROWTH MINDSET",
        "b3_title": "Problem Solving & Resilience",
        "b3_desc": "Children aren't afraid of making mistakes when encountering errors (debugging). They learn to analyze causes, calmly try alternatives, and persevere.",
        "b3_demo_err": "Error: character falls through the floor",
        "b3_demo_chk1": "Check: does the floor have a collider?",
        "b3_demo_chk2": "Try: enable \"Anchored\"",
        "b3_demo_chk3": "Success! Found it themselves 💪",
        "b4_tag": "SHOW & TELL",
        "b4_title": "Confident Presentation",
        "b4_desc": "At the end of every project, students present their work in front of the tutor and classmates. This builds early public speaking and communication skills.",
        "b4_demo_title": "SHOWCASE · project finale",
        "b4_demo_quote": "\"This is my game!\"",
        "b4_demo_note": "Explaining ideas, gameplay & challenges faced",
        "b5_tag": "REAL PORTFOLIO",
        "b5_title": "Digital Portfolio & Certificate",
        "b5_desc": "Every creation (game, website, app) is neatly saved, and children get a certificate upon course completion. Real proof of skills for school and beyond.",
        "b5_demo_title": "STUDENT PORTFOLIO",
        "b5_demo_item1": "Star Catcher Game",
        "b5_demo_item2": "Profile Website",
        "b5_demo_item3": "Quiz App",
        "b5_demo_item4": "Certificate",
        "b5_demo_item4_sub": "course completed",

            level: 'Kids Level (8-11 Years)',
            title: 'Beginner',
            duration: '8-12 Weeks',
            desc: 'At this level children start learning block coding and create programs that can move, make sounds, respond to players, and have game rules.',
            tools: [['Scratch', 'scratch.png'], ['PictoBlox', 'pictoblox.png']],
            topics: [
                'Event, Motion & Looks',
                'Sound & Sensing',
                'Control & Loop',
                'Basic Variables',
                'Simple Conditions',
                'Basic Game Mechanics'
            ]
        }
    },
    'kids-intermediate': {
        icon: 'fa-rocket',
        color: 'purple',
        xp: '+1500 XP',
        id: {

        "funnel_tag": "Panduan Keputusan Orang Tua",
        "funnel_title": "Alur Mudah: Saya Harus Mulai dari Mana?",
        "step1_title": "Kenali Manfaat",
        "step2_title": "Pilih Level Anak",
        "step3_title": "Lihat Karya Project",
        "step4_title": "Coba Kelas Gratis",
        "step5_title": "Mulai Berkarya",


        "benefit_badge": "INVESTASI MASA DEPAN ANAK",
        "benefit_title_1": "Bukan hanya belajar coding.",
        "benefit_title_2": "Anak belajar <span class=\"text-[#38BDF8]\">berpikir</span>, <span class=\"text-[#34D399]\">mencoba</span>, &amp; <span class=\"text-[#FFC83D]\">berkarya</span>.",
        "b_tab_logic": "Berpikir Logis",
        "b_tab_creative": "Kreatif",
        "b_tab_problem": "Problem Solving",
        "b_tab_present": "Presentasi",
        "b_tab_portfolio": "Portofolio",
        "b1_tag": "LOGIKA TERSTRUKTUR",
        "b1_title": "Berpikir Logis & Terstruktur",
        "b1_desc": "Anak dilatih memecah masalah besar menjadi langkah-langkah kecil yang teratur dan sistematis (computational thinking). Kemampuan ini dapat membantu di pelajaran matematika dan sains di sekolah.",
        "b1_prob_title": "MASALAH: \"Buat robot pulang ke rumah\"",
        "b1_prob_1": "1. maju 3 langkah",
        "b1_prob_2": "2. jika ada tembok → belok kanan",
        "b1_prob_3": "3. ulangi sampai ketemu 🏠",
        "b1_prob_note": "Masalah besar → langkah kecil yang urut",
        "b2_tag": "KREATOR AKTIF",
        "b2_title": "Kreatif Membuat Project",
        "b2_desc": "Kebiasaan screen-time pasif berubah menjadi waktu berkarya. Anak mendesain karakter, jalan cerita, dan aturan permainannya sendiri dari imajinasi mereka.",
        "b2_demo_title": "DESAIN GAME · ide Komang",
        "b2_demo_char": "Karakter:",
        "b2_demo_char_v": "naga kecil penjaga pulau",
        "b2_demo_miss": "Misi:",
        "b2_demo_miss_v": "kumpulkan 10 permata",
        "b2_demo_rule": "Aturan:",
        "b2_demo_rule_v": "kena ombak = mulai lagi",
        "b3_tag": "GROWTH MINDSET",
        "b3_title": "Problem Solving & Tangguh",
        "b3_desc": "Anak tidak takut salah saat menghadapi error (debugging). Mereka belajar menganalisis penyebab masalah, mencoba solusi lain dengan tenang, dan tidak mudah menyerah.",
        "b3_demo_err": "Error: karakter jatuh menembus lantai",
        "b3_demo_chk1": "Cek: apakah lantai punya collider?",
        "b3_demo_chk2": "Coba: aktifkan \"Anchored\"",
        "b3_demo_chk3": "Berhasil! Dicari sendiri 💪",
        "b4_tag": "SHOW & TELL",
        "b4_title": "Percaya Diri Presentasi",
        "b4_desc": "Di akhir setiap proyek, siswa mempresentasikan karyanya di depan tutor dan teman sekelas. Ini membangun keberanian public speaking dan kemampuan menyampaikan ide sejak dini.",
        "b4_demo_title": "SHOWCASE · akhir proyek",
        "b4_demo_quote": "\"Ini game buatanku!\"",
        "b4_demo_note": "Menjelaskan ide, cara main & tantangan yang dihadapi",
        "b5_tag": "PORTOFOLIO NYATA",
        "b5_title": "Portofolio Digital & Sertifikat",
        "b5_desc": "Setiap karya (game, website, aplikasi) tersimpan rapi, dan anak mendapat sertifikat setelah menyelesaikan course. Bukti nyata kompetensi untuk sekolah maupun jenjang berikutnya.",
        "b5_demo_title": "PORTOFOLIO SISWA",
        "b5_demo_item1": "Game Tangkap Bintang",
        "b5_demo_item2": "Website Profil",
        "b5_demo_item3": "Aplikasi Kuis",
        "b5_demo_item4": "Sertifikat",
        "b5_demo_item4_sub": "course selesai",

            level: 'Kids Level (10-14 Tahun)',
            title: 'Intermediate',
            duration: '10-14 Minggu',
            desc: 'Di level ini anak mulai membuat project yang lebih kompleks dan belajar mengembangkan ide menjadi game atau aplikasi interaktif.',
            tools: [['Scratch', 'scratch.png'], ['PictoBlox AI', 'pictoblox.png']],
            topics: [
                'Variable & Score System',
                'Operator & Logic',
                'Advanced Loop',
                'If–Else & Condition',
                'Custom Block / Function',
                'Debugging & Game Design',
                'AI dasar menggunakan PictoBlox'
            ]
        },
        en: {

        "funnel_tag": "Parent Decision Guide",
        "funnel_title": "Easy Flow: Where Should I Start?",
        "step1_title": "Understand the Benefits",
        "step2_title": "Choose Child's Level",
        "step3_title": "View Project Portfolio",
        "step4_title": "Try a Free Class",
        "step5_title": "Start Creating",


        "benefit_badge": "INVESTMENT IN YOUR CHILD'S FUTURE",
        "benefit_title_1": "Not just learning to code.",
        "benefit_title_2": "Learning to <span class=\"text-[#38BDF8]\">think</span>, <span class=\"text-[#34D399]\">try</span>, &amp; <span class=\"text-[#FFC83D]\">create</span>.",
        "b_tab_logic": "Logical Thinking",
        "b_tab_creative": "Creative",
        "b_tab_problem": "Problem Solving",
        "b_tab_present": "Presentation",
        "b_tab_portfolio": "Portfolio",
        "b1_tag": "STRUCTURED LOGIC",
        "b1_title": "Logical & Structured Thinking",
        "b1_desc": "Children are trained to break down big problems into organized, systematic steps (computational thinking). This skill helps them in math and science at school.",
        "b1_prob_title": "PROBLEM: \"Make the robot go home\"",
        "b1_prob_1": "1. move forward 3 steps",
        "b1_prob_2": "2. if there's a wall → turn right",
        "b1_prob_3": "3. repeat until finding 🏠",
        "b1_prob_note": "Big problem → ordered small steps",
        "b2_tag": "ACTIVE CREATOR",
        "b2_title": "Creative Project Making",
        "b2_desc": "Passive screen-time turns into productive creation. Children design their own characters, storylines, and game rules from their imagination.",
        "b2_demo_title": "GAME DESIGN · Komang's idea",
        "b2_demo_char": "Character:",
        "b2_demo_char_v": "little dragon guarding the island",
        "b2_demo_miss": "Mission:",
        "b2_demo_miss_v": "collect 10 gems",
        "b2_demo_rule": "Rules:",
        "b2_demo_rule_v": "hit by wave = restart",
        "b3_tag": "GROWTH MINDSET",
        "b3_title": "Problem Solving & Resilience",
        "b3_desc": "Children aren't afraid of making mistakes when encountering errors (debugging). They learn to analyze causes, calmly try alternatives, and persevere.",
        "b3_demo_err": "Error: character falls through the floor",
        "b3_demo_chk1": "Check: does the floor have a collider?",
        "b3_demo_chk2": "Try: enable \"Anchored\"",
        "b3_demo_chk3": "Success! Found it themselves 💪",
        "b4_tag": "SHOW & TELL",
        "b4_title": "Confident Presentation",
        "b4_desc": "At the end of every project, students present their work in front of the tutor and classmates. This builds early public speaking and communication skills.",
        "b4_demo_title": "SHOWCASE · project finale",
        "b4_demo_quote": "\"This is my game!\"",
        "b4_demo_note": "Explaining ideas, gameplay & challenges faced",
        "b5_tag": "REAL PORTFOLIO",
        "b5_title": "Digital Portfolio & Certificate",
        "b5_desc": "Every creation (game, website, app) is neatly saved, and children get a certificate upon course completion. Real proof of skills for school and beyond.",
        "b5_demo_title": "STUDENT PORTFOLIO",
        "b5_demo_item1": "Star Catcher Game",
        "b5_demo_item2": "Profile Website",
        "b5_demo_item3": "Quiz App",
        "b5_demo_item4": "Certificate",
        "b5_demo_item4_sub": "course completed",

            level: 'Kids Level (10-14 Years)',
            title: 'Intermediate',
            duration: '10-14 Weeks',
            desc: 'At this level children start creating more complex projects and learn to develop ideas into interactive games or applications.',
            tools: [['Scratch', 'scratch.png'], ['PictoBlox AI', 'pictoblox.png']],
            topics: [
                'Variable & Score System',
                'Operator & Logic',
                'Advanced Loop',
                'If-Else & Condition',
                'Custom Block / Function',
                'Debugging & Game Design',
                'Basic AI using PictoBlox'
            ]
        }
    },
    'skills-komputer': {
        icon: 'fa-desktop',
        color: 'blue',
        xp: '+500 XP',
        id: {

        "funnel_tag": "Panduan Keputusan Orang Tua",
        "funnel_title": "Alur Mudah: Saya Harus Mulai dari Mana?",
        "step1_title": "Kenali Manfaat",
        "step2_title": "Pilih Level Anak",
        "step3_title": "Lihat Karya Project",
        "step4_title": "Coba Kelas Gratis",
        "step5_title": "Mulai Berkarya",


        "benefit_badge": "INVESTASI MASA DEPAN ANAK",
        "benefit_title_1": "Bukan hanya belajar coding.",
        "benefit_title_2": "Anak belajar <span class=\"text-[#38BDF8]\">berpikir</span>, <span class=\"text-[#34D399]\">mencoba</span>, &amp; <span class=\"text-[#FFC83D]\">berkarya</span>.",
        "b_tab_logic": "Berpikir Logis",
        "b_tab_creative": "Kreatif",
        "b_tab_problem": "Problem Solving",
        "b_tab_present": "Presentasi",
        "b_tab_portfolio": "Portofolio",
        "b1_tag": "LOGIKA TERSTRUKTUR",
        "b1_title": "Berpikir Logis & Terstruktur",
        "b1_desc": "Anak dilatih memecah masalah besar menjadi langkah-langkah kecil yang teratur dan sistematis (computational thinking). Kemampuan ini dapat membantu di pelajaran matematika dan sains di sekolah.",
        "b1_prob_title": "MASALAH: \"Buat robot pulang ke rumah\"",
        "b1_prob_1": "1. maju 3 langkah",
        "b1_prob_2": "2. jika ada tembok → belok kanan",
        "b1_prob_3": "3. ulangi sampai ketemu 🏠",
        "b1_prob_note": "Masalah besar → langkah kecil yang urut",
        "b2_tag": "KREATOR AKTIF",
        "b2_title": "Kreatif Membuat Project",
        "b2_desc": "Kebiasaan screen-time pasif berubah menjadi waktu berkarya. Anak mendesain karakter, jalan cerita, dan aturan permainannya sendiri dari imajinasi mereka.",
        "b2_demo_title": "DESAIN GAME · ide Komang",
        "b2_demo_char": "Karakter:",
        "b2_demo_char_v": "naga kecil penjaga pulau",
        "b2_demo_miss": "Misi:",
        "b2_demo_miss_v": "kumpulkan 10 permata",
        "b2_demo_rule": "Aturan:",
        "b2_demo_rule_v": "kena ombak = mulai lagi",
        "b3_tag": "GROWTH MINDSET",
        "b3_title": "Problem Solving & Tangguh",
        "b3_desc": "Anak tidak takut salah saat menghadapi error (debugging). Mereka belajar menganalisis penyebab masalah, mencoba solusi lain dengan tenang, dan tidak mudah menyerah.",
        "b3_demo_err": "Error: karakter jatuh menembus lantai",
        "b3_demo_chk1": "Cek: apakah lantai punya collider?",
        "b3_demo_chk2": "Coba: aktifkan \"Anchored\"",
        "b3_demo_chk3": "Berhasil! Dicari sendiri 💪",
        "b4_tag": "SHOW & TELL",
        "b4_title": "Percaya Diri Presentasi",
        "b4_desc": "Di akhir setiap proyek, siswa mempresentasikan karyanya di depan tutor dan teman sekelas. Ini membangun keberanian public speaking dan kemampuan menyampaikan ide sejak dini.",
        "b4_demo_title": "SHOWCASE · akhir proyek",
        "b4_demo_quote": "\"Ini game buatanku!\"",
        "b4_demo_note": "Menjelaskan ide, cara main & tantangan yang dihadapi",
        "b5_tag": "PORTOFOLIO NYATA",
        "b5_title": "Portofolio Digital & Sertifikat",
        "b5_desc": "Setiap karya (game, website, aplikasi) tersimpan rapi, dan anak mendapat sertifikat setelah menyelesaikan course. Bukti nyata kompetensi untuk sekolah maupun jenjang berikutnya.",
        "b5_demo_title": "PORTOFOLIO SISWA",
        "b5_demo_item1": "Game Tangkap Bintang",
        "b5_demo_item2": "Website Profil",
        "b5_demo_item3": "Aplikasi Kuis",
        "b5_demo_item4": "Sertifikat",
        "b5_demo_item4_sub": "course selesai",

            level: 'Digital Skills (8-14 Tahun)',
            title: 'Komputer Dasar',
            duration: '4-6 Minggu',
            desc: 'Siswa belajar menggunakan komputer untuk membuat dokumen, mengolah data sederhana, dan membuat presentasi.',
            tools: [['Word', 'ms_word.png'], ['PowerPoint', 'ms_powerpoint.webp'], ['Excel', 'ms_excel.webp']],
            topics: [
                'Mengetik & formatting dokumen (Word)',
                'Membuat slide & animasi presentasi (PowerPoint)',
                'Cell, row & column management (Excel)',
                'Formula dasar & pengolahan data sederhana'
            ]
        },
        en: {

        "funnel_tag": "Parent Decision Guide",
        "funnel_title": "Easy Flow: Where Should I Start?",
        "step1_title": "Understand the Benefits",
        "step2_title": "Choose Child's Level",
        "step3_title": "View Project Portfolio",
        "step4_title": "Try a Free Class",
        "step5_title": "Start Creating",


        "benefit_badge": "INVESTMENT IN YOUR CHILD'S FUTURE",
        "benefit_title_1": "Not just learning to code.",
        "benefit_title_2": "Learning to <span class=\"text-[#38BDF8]\">think</span>, <span class=\"text-[#34D399]\">try</span>, &amp; <span class=\"text-[#FFC83D]\">create</span>.",
        "b_tab_logic": "Logical Thinking",
        "b_tab_creative": "Creative",
        "b_tab_problem": "Problem Solving",
        "b_tab_present": "Presentation",
        "b_tab_portfolio": "Portfolio",
        "b1_tag": "STRUCTURED LOGIC",
        "b1_title": "Logical & Structured Thinking",
        "b1_desc": "Children are trained to break down big problems into organized, systematic steps (computational thinking). This skill helps them in math and science at school.",
        "b1_prob_title": "PROBLEM: \"Make the robot go home\"",
        "b1_prob_1": "1. move forward 3 steps",
        "b1_prob_2": "2. if there's a wall → turn right",
        "b1_prob_3": "3. repeat until finding 🏠",
        "b1_prob_note": "Big problem → ordered small steps",
        "b2_tag": "ACTIVE CREATOR",
        "b2_title": "Creative Project Making",
        "b2_desc": "Passive screen-time turns into productive creation. Children design their own characters, storylines, and game rules from their imagination.",
        "b2_demo_title": "GAME DESIGN · Komang's idea",
        "b2_demo_char": "Character:",
        "b2_demo_char_v": "little dragon guarding the island",
        "b2_demo_miss": "Mission:",
        "b2_demo_miss_v": "collect 10 gems",
        "b2_demo_rule": "Rules:",
        "b2_demo_rule_v": "hit by wave = restart",
        "b3_tag": "GROWTH MINDSET",
        "b3_title": "Problem Solving & Resilience",
        "b3_desc": "Children aren't afraid of making mistakes when encountering errors (debugging). They learn to analyze causes, calmly try alternatives, and persevere.",
        "b3_demo_err": "Error: character falls through the floor",
        "b3_demo_chk1": "Check: does the floor have a collider?",
        "b3_demo_chk2": "Try: enable \"Anchored\"",
        "b3_demo_chk3": "Success! Found it themselves 💪",
        "b4_tag": "SHOW & TELL",
        "b4_title": "Confident Presentation",
        "b4_desc": "At the end of every project, students present their work in front of the tutor and classmates. This builds early public speaking and communication skills.",
        "b4_demo_title": "SHOWCASE · project finale",
        "b4_demo_quote": "\"This is my game!\"",
        "b4_demo_note": "Explaining ideas, gameplay & challenges faced",
        "b5_tag": "REAL PORTFOLIO",
        "b5_title": "Digital Portfolio & Certificate",
        "b5_desc": "Every creation (game, website, app) is neatly saved, and children get a certificate upon course completion. Real proof of skills for school and beyond.",
        "b5_demo_title": "STUDENT PORTFOLIO",
        "b5_demo_item1": "Star Catcher Game",
        "b5_demo_item2": "Profile Website",
        "b5_demo_item3": "Quiz App",
        "b5_demo_item4": "Certificate",
        "b5_demo_item4_sub": "course completed",

            level: 'Digital Skills (8-14 Years)',
            title: 'Basic Computing',
            duration: '4-6 Weeks',
            desc: 'Students learn to use computers to create documents, process simple data, and create presentations.',
            tools: [['Word', 'ms_word.png'], ['PowerPoint', 'ms_powerpoint.webp'], ['Excel', 'ms_excel.webp']],
            topics: [
                'Typing & document formatting (Word)',
                'Creating slides & presentation animations (PowerPoint)',
                'Cell, row & column management (Excel)',
                'Basic formulas & simple data processing'
            ]
        }
    },
    'skills-design': {
        icon: 'fa-pen-nib',
        color: 'pink',
        xp: '+800 XP',
        id: {

        "funnel_tag": "Panduan Keputusan Orang Tua",
        "funnel_title": "Alur Mudah: Saya Harus Mulai dari Mana?",
        "step1_title": "Kenali Manfaat",
        "step2_title": "Pilih Level Anak",
        "step3_title": "Lihat Karya Project",
        "step4_title": "Coba Kelas Gratis",
        "step5_title": "Mulai Berkarya",


        "benefit_badge": "INVESTASI MASA DEPAN ANAK",
        "benefit_title_1": "Bukan hanya belajar coding.",
        "benefit_title_2": "Anak belajar <span class=\"text-[#38BDF8]\">berpikir</span>, <span class=\"text-[#34D399]\">mencoba</span>, &amp; <span class=\"text-[#FFC83D]\">berkarya</span>.",
        "b_tab_logic": "Berpikir Logis",
        "b_tab_creative": "Kreatif",
        "b_tab_problem": "Problem Solving",
        "b_tab_present": "Presentasi",
        "b_tab_portfolio": "Portofolio",
        "b1_tag": "LOGIKA TERSTRUKTUR",
        "b1_title": "Berpikir Logis & Terstruktur",
        "b1_desc": "Anak dilatih memecah masalah besar menjadi langkah-langkah kecil yang teratur dan sistematis (computational thinking). Kemampuan ini dapat membantu di pelajaran matematika dan sains di sekolah.",
        "b1_prob_title": "MASALAH: \"Buat robot pulang ke rumah\"",
        "b1_prob_1": "1. maju 3 langkah",
        "b1_prob_2": "2. jika ada tembok → belok kanan",
        "b1_prob_3": "3. ulangi sampai ketemu 🏠",
        "b1_prob_note": "Masalah besar → langkah kecil yang urut",
        "b2_tag": "KREATOR AKTIF",
        "b2_title": "Kreatif Membuat Project",
        "b2_desc": "Kebiasaan screen-time pasif berubah menjadi waktu berkarya. Anak mendesain karakter, jalan cerita, dan aturan permainannya sendiri dari imajinasi mereka.",
        "b2_demo_title": "DESAIN GAME · ide Komang",
        "b2_demo_char": "Karakter:",
        "b2_demo_char_v": "naga kecil penjaga pulau",
        "b2_demo_miss": "Misi:",
        "b2_demo_miss_v": "kumpulkan 10 permata",
        "b2_demo_rule": "Aturan:",
        "b2_demo_rule_v": "kena ombak = mulai lagi",
        "b3_tag": "GROWTH MINDSET",
        "b3_title": "Problem Solving & Tangguh",
        "b3_desc": "Anak tidak takut salah saat menghadapi error (debugging). Mereka belajar menganalisis penyebab masalah, mencoba solusi lain dengan tenang, dan tidak mudah menyerah.",
        "b3_demo_err": "Error: karakter jatuh menembus lantai",
        "b3_demo_chk1": "Cek: apakah lantai punya collider?",
        "b3_demo_chk2": "Coba: aktifkan \"Anchored\"",
        "b3_demo_chk3": "Berhasil! Dicari sendiri 💪",
        "b4_tag": "SHOW & TELL",
        "b4_title": "Percaya Diri Presentasi",
        "b4_desc": "Di akhir setiap proyek, siswa mempresentasikan karyanya di depan tutor dan teman sekelas. Ini membangun keberanian public speaking dan kemampuan menyampaikan ide sejak dini.",
        "b4_demo_title": "SHOWCASE · akhir proyek",
        "b4_demo_quote": "\"Ini game buatanku!\"",
        "b4_demo_note": "Menjelaskan ide, cara main & tantangan yang dihadapi",
        "b5_tag": "PORTOFOLIO NYATA",
        "b5_title": "Portofolio Digital & Sertifikat",
        "b5_desc": "Setiap karya (game, website, aplikasi) tersimpan rapi, dan anak mendapat sertifikat setelah menyelesaikan course. Bukti nyata kompetensi untuk sekolah maupun jenjang berikutnya.",
        "b5_demo_title": "PORTOFOLIO SISWA",
        "b5_demo_item1": "Game Tangkap Bintang",
        "b5_demo_item2": "Website Profil",
        "b5_demo_item3": "Aplikasi Kuis",
        "b5_demo_item4": "Sertifikat",
        "b5_demo_item4_sub": "course selesai",

            level: 'Digital Skills (9-14 Tahun)',
            title: 'Design Grafis',
            duration: '6-8 Minggu',
            desc: 'Siswa belajar mengubah ide menjadi desain visual yang menarik dan komunikatif menggunakan Canva dan Figma.',
            tools: [['Canva', 'canva.png'], ['Figma', 'figma.png']],
            topics: [
                'Warna, Typography & Layout',
                'Image & Elements',
                'Shape & Icon',
                'Poster & Social Media Design',
                'Presentation Design',
                'UI/UX dasar'
            ]
        },
        en: {

        "funnel_tag": "Parent Decision Guide",
        "funnel_title": "Easy Flow: Where Should I Start?",
        "step1_title": "Understand the Benefits",
        "step2_title": "Choose Child's Level",
        "step3_title": "View Project Portfolio",
        "step4_title": "Try a Free Class",
        "step5_title": "Start Creating",


        "benefit_badge": "INVESTMENT IN YOUR CHILD'S FUTURE",
        "benefit_title_1": "Not just learning to code.",
        "benefit_title_2": "Learning to <span class=\"text-[#38BDF8]\">think</span>, <span class=\"text-[#34D399]\">try</span>, &amp; <span class=\"text-[#FFC83D]\">create</span>.",
        "b_tab_logic": "Logical Thinking",
        "b_tab_creative": "Creative",
        "b_tab_problem": "Problem Solving",
        "b_tab_present": "Presentation",
        "b_tab_portfolio": "Portfolio",
        "b1_tag": "STRUCTURED LOGIC",
        "b1_title": "Logical & Structured Thinking",
        "b1_desc": "Children are trained to break down big problems into organized, systematic steps (computational thinking). This skill helps them in math and science at school.",
        "b1_prob_title": "PROBLEM: \"Make the robot go home\"",
        "b1_prob_1": "1. move forward 3 steps",
        "b1_prob_2": "2. if there's a wall → turn right",
        "b1_prob_3": "3. repeat until finding 🏠",
        "b1_prob_note": "Big problem → ordered small steps",
        "b2_tag": "ACTIVE CREATOR",
        "b2_title": "Creative Project Making",
        "b2_desc": "Passive screen-time turns into productive creation. Children design their own characters, storylines, and game rules from their imagination.",
        "b2_demo_title": "GAME DESIGN · Komang's idea",
        "b2_demo_char": "Character:",
        "b2_demo_char_v": "little dragon guarding the island",
        "b2_demo_miss": "Mission:",
        "b2_demo_miss_v": "collect 10 gems",
        "b2_demo_rule": "Rules:",
        "b2_demo_rule_v": "hit by wave = restart",
        "b3_tag": "GROWTH MINDSET",
        "b3_title": "Problem Solving & Resilience",
        "b3_desc": "Children aren't afraid of making mistakes when encountering errors (debugging). They learn to analyze causes, calmly try alternatives, and persevere.",
        "b3_demo_err": "Error: character falls through the floor",
        "b3_demo_chk1": "Check: does the floor have a collider?",
        "b3_demo_chk2": "Try: enable \"Anchored\"",
        "b3_demo_chk3": "Success! Found it themselves 💪",
        "b4_tag": "SHOW & TELL",
        "b4_title": "Confident Presentation",
        "b4_desc": "At the end of every project, students present their work in front of the tutor and classmates. This builds early public speaking and communication skills.",
        "b4_demo_title": "SHOWCASE · project finale",
        "b4_demo_quote": "\"This is my game!\"",
        "b4_demo_note": "Explaining ideas, gameplay & challenges faced",
        "b5_tag": "REAL PORTFOLIO",
        "b5_title": "Digital Portfolio & Certificate",
        "b5_desc": "Every creation (game, website, app) is neatly saved, and children get a certificate upon course completion. Real proof of skills for school and beyond.",
        "b5_demo_title": "STUDENT PORTFOLIO",
        "b5_demo_item1": "Star Catcher Game",
        "b5_demo_item2": "Profile Website",
        "b5_demo_item3": "Quiz App",
        "b5_demo_item4": "Certificate",
        "b5_demo_item4_sub": "course completed",

            level: 'Digital Skills (9-14 Years)',
            title: 'Graphic Design',
            duration: '6-8 Weeks',
            desc: 'Students learn to transform ideas into attractive and communicative visual designs using Canva and Figma.',
            tools: [['Canva', 'canva.png'], ['Figma', 'figma.png']],
            topics: [
                'Color, Typography & Layout',
                'Image & Elements',
                'Shape & Icon',
                'Poster & Social Media Design',
                'Presentation Design',
                'Basic UI/UX'
            ]
        }
    },
    'teens-game': {
        icon: 'fa-gamepad',
        color: 'red',
        xp: '+2000 XP',
        id: {

        "funnel_tag": "Panduan Keputusan Orang Tua",
        "funnel_title": "Alur Mudah: Saya Harus Mulai dari Mana?",
        "step1_title": "Kenali Manfaat",
        "step2_title": "Pilih Level Anak",
        "step3_title": "Lihat Karya Project",
        "step4_title": "Coba Kelas Gratis",
        "step5_title": "Mulai Berkarya",


        "benefit_badge": "INVESTASI MASA DEPAN ANAK",
        "benefit_title_1": "Bukan hanya belajar coding.",
        "benefit_title_2": "Anak belajar <span class=\"text-[#38BDF8]\">berpikir</span>, <span class=\"text-[#34D399]\">mencoba</span>, &amp; <span class=\"text-[#FFC83D]\">berkarya</span>.",
        "b_tab_logic": "Berpikir Logis",
        "b_tab_creative": "Kreatif",
        "b_tab_problem": "Problem Solving",
        "b_tab_present": "Presentasi",
        "b_tab_portfolio": "Portofolio",
        "b1_tag": "LOGIKA TERSTRUKTUR",
        "b1_title": "Berpikir Logis & Terstruktur",
        "b1_desc": "Anak dilatih memecah masalah besar menjadi langkah-langkah kecil yang teratur dan sistematis (computational thinking). Kemampuan ini dapat membantu di pelajaran matematika dan sains di sekolah.",
        "b1_prob_title": "MASALAH: \"Buat robot pulang ke rumah\"",
        "b1_prob_1": "1. maju 3 langkah",
        "b1_prob_2": "2. jika ada tembok → belok kanan",
        "b1_prob_3": "3. ulangi sampai ketemu 🏠",
        "b1_prob_note": "Masalah besar → langkah kecil yang urut",
        "b2_tag": "KREATOR AKTIF",
        "b2_title": "Kreatif Membuat Project",
        "b2_desc": "Kebiasaan screen-time pasif berubah menjadi waktu berkarya. Anak mendesain karakter, jalan cerita, dan aturan permainannya sendiri dari imajinasi mereka.",
        "b2_demo_title": "DESAIN GAME · ide Komang",
        "b2_demo_char": "Karakter:",
        "b2_demo_char_v": "naga kecil penjaga pulau",
        "b2_demo_miss": "Misi:",
        "b2_demo_miss_v": "kumpulkan 10 permata",
        "b2_demo_rule": "Aturan:",
        "b2_demo_rule_v": "kena ombak = mulai lagi",
        "b3_tag": "GROWTH MINDSET",
        "b3_title": "Problem Solving & Tangguh",
        "b3_desc": "Anak tidak takut salah saat menghadapi error (debugging). Mereka belajar menganalisis penyebab masalah, mencoba solusi lain dengan tenang, dan tidak mudah menyerah.",
        "b3_demo_err": "Error: karakter jatuh menembus lantai",
        "b3_demo_chk1": "Cek: apakah lantai punya collider?",
        "b3_demo_chk2": "Coba: aktifkan \"Anchored\"",
        "b3_demo_chk3": "Berhasil! Dicari sendiri 💪",
        "b4_tag": "SHOW & TELL",
        "b4_title": "Percaya Diri Presentasi",
        "b4_desc": "Di akhir setiap proyek, siswa mempresentasikan karyanya di depan tutor dan teman sekelas. Ini membangun keberanian public speaking dan kemampuan menyampaikan ide sejak dini.",
        "b4_demo_title": "SHOWCASE · akhir proyek",
        "b4_demo_quote": "\"Ini game buatanku!\"",
        "b4_demo_note": "Menjelaskan ide, cara main & tantangan yang dihadapi",
        "b5_tag": "PORTOFOLIO NYATA",
        "b5_title": "Portofolio Digital & Sertifikat",
        "b5_desc": "Setiap karya (game, website, aplikasi) tersimpan rapi, dan anak mendapat sertifikat setelah menyelesaikan course. Bukti nyata kompetensi untuk sekolah maupun jenjang berikutnya.",
        "b5_demo_title": "PORTOFOLIO SISWA",
        "b5_demo_item1": "Game Tangkap Bintang",
        "b5_demo_item2": "Website Profil",
        "b5_demo_item3": "Aplikasi Kuis",
        "b5_demo_item4": "Sertifikat",
        "b5_demo_item4_sub": "course selesai",

            level: 'Teens Level (Advance 1)',
            title: 'Game Developer',
            duration: '12-16 Minggu',
            desc: 'Belajar mengembangkan game tingkat lanjut menggunakan Scratch Advanced, Roblox, Construct 3, hingga dasar Unity.',
            tools: [['Roblox', 'roblox_studio.png'], ['Unity', 'unity.svg'], ['Construct 3', 'construct.svg']],
            topics: [
                'Advanced Game Logic',
                'Storytelling dalam Game',
                '3D Environment & Scripting dasar (Roblox/Lua)',
                'Publish Game Sederhana'
            ]
        },
        en: {

        "funnel_tag": "Parent Decision Guide",
        "funnel_title": "Easy Flow: Where Should I Start?",
        "step1_title": "Understand the Benefits",
        "step2_title": "Choose Child's Level",
        "step3_title": "View Project Portfolio",
        "step4_title": "Try a Free Class",
        "step5_title": "Start Creating",


        "benefit_badge": "INVESTMENT IN YOUR CHILD'S FUTURE",
        "benefit_title_1": "Not just learning to code.",
        "benefit_title_2": "Learning to <span class=\"text-[#38BDF8]\">think</span>, <span class=\"text-[#34D399]\">try</span>, &amp; <span class=\"text-[#FFC83D]\">create</span>.",
        "b_tab_logic": "Logical Thinking",
        "b_tab_creative": "Creative",
        "b_tab_problem": "Problem Solving",
        "b_tab_present": "Presentation",
        "b_tab_portfolio": "Portfolio",
        "b1_tag": "STRUCTURED LOGIC",
        "b1_title": "Logical & Structured Thinking",
        "b1_desc": "Children are trained to break down big problems into organized, systematic steps (computational thinking). This skill helps them in math and science at school.",
        "b1_prob_title": "PROBLEM: \"Make the robot go home\"",
        "b1_prob_1": "1. move forward 3 steps",
        "b1_prob_2": "2. if there's a wall → turn right",
        "b1_prob_3": "3. repeat until finding 🏠",
        "b1_prob_note": "Big problem → ordered small steps",
        "b2_tag": "ACTIVE CREATOR",
        "b2_title": "Creative Project Making",
        "b2_desc": "Passive screen-time turns into productive creation. Children design their own characters, storylines, and game rules from their imagination.",
        "b2_demo_title": "GAME DESIGN · Komang's idea",
        "b2_demo_char": "Character:",
        "b2_demo_char_v": "little dragon guarding the island",
        "b2_demo_miss": "Mission:",
        "b2_demo_miss_v": "collect 10 gems",
        "b2_demo_rule": "Rules:",
        "b2_demo_rule_v": "hit by wave = restart",
        "b3_tag": "GROWTH MINDSET",
        "b3_title": "Problem Solving & Resilience",
        "b3_desc": "Children aren't afraid of making mistakes when encountering errors (debugging). They learn to analyze causes, calmly try alternatives, and persevere.",
        "b3_demo_err": "Error: character falls through the floor",
        "b3_demo_chk1": "Check: does the floor have a collider?",
        "b3_demo_chk2": "Try: enable \"Anchored\"",
        "b3_demo_chk3": "Success! Found it themselves 💪",
        "b4_tag": "SHOW & TELL",
        "b4_title": "Confident Presentation",
        "b4_desc": "At the end of every project, students present their work in front of the tutor and classmates. This builds early public speaking and communication skills.",
        "b4_demo_title": "SHOWCASE · project finale",
        "b4_demo_quote": "\"This is my game!\"",
        "b4_demo_note": "Explaining ideas, gameplay & challenges faced",
        "b5_tag": "REAL PORTFOLIO",
        "b5_title": "Digital Portfolio & Certificate",
        "b5_desc": "Every creation (game, website, app) is neatly saved, and children get a certificate upon course completion. Real proof of skills for school and beyond.",
        "b5_demo_title": "STUDENT PORTFOLIO",
        "b5_demo_item1": "Star Catcher Game",
        "b5_demo_item2": "Profile Website",
        "b5_demo_item3": "Quiz App",
        "b5_demo_item4": "Certificate",
        "b5_demo_item4_sub": "course completed",

            level: 'Teens Level (Advance 1)',
            title: 'Game Developer',
            duration: '12-16 Weeks',
            desc: 'Learn advanced game development using Scratch Advanced, Roblox, Construct 3, to basic Unity.',
            tools: [['Roblox', 'roblox_studio.png'], ['Unity', 'unity.svg'], ['Construct 3', 'construct.svg']],
            topics: [
                'Advanced Game Logic',
                'Storytelling in Games',
                '3D Environment & Basic Scripting (Roblox/Lua)',
                'Publish Simple Games'
            ]
        }
    },
    'teens-web': {
        icon: 'fa-code',
        color: 'teal',
        xp: '+2000 XP',
        id: {

        "funnel_tag": "Panduan Keputusan Orang Tua",
        "funnel_title": "Alur Mudah: Saya Harus Mulai dari Mana?",
        "step1_title": "Kenali Manfaat",
        "step2_title": "Pilih Level Anak",
        "step3_title": "Lihat Karya Project",
        "step4_title": "Coba Kelas Gratis",
        "step5_title": "Mulai Berkarya",


        "benefit_badge": "INVESTASI MASA DEPAN ANAK",
        "benefit_title_1": "Bukan hanya belajar coding.",
        "benefit_title_2": "Anak belajar <span class=\"text-[#38BDF8]\">berpikir</span>, <span class=\"text-[#34D399]\">mencoba</span>, &amp; <span class=\"text-[#FFC83D]\">berkarya</span>.",
        "b_tab_logic": "Berpikir Logis",
        "b_tab_creative": "Kreatif",
        "b_tab_problem": "Problem Solving",
        "b_tab_present": "Presentasi",
        "b_tab_portfolio": "Portofolio",
        "b1_tag": "LOGIKA TERSTRUKTUR",
        "b1_title": "Berpikir Logis & Terstruktur",
        "b1_desc": "Anak dilatih memecah masalah besar menjadi langkah-langkah kecil yang teratur dan sistematis (computational thinking). Kemampuan ini dapat membantu di pelajaran matematika dan sains di sekolah.",
        "b1_prob_title": "MASALAH: \"Buat robot pulang ke rumah\"",
        "b1_prob_1": "1. maju 3 langkah",
        "b1_prob_2": "2. jika ada tembok → belok kanan",
        "b1_prob_3": "3. ulangi sampai ketemu 🏠",
        "b1_prob_note": "Masalah besar → langkah kecil yang urut",
        "b2_tag": "KREATOR AKTIF",
        "b2_title": "Kreatif Membuat Project",
        "b2_desc": "Kebiasaan screen-time pasif berubah menjadi waktu berkarya. Anak mendesain karakter, jalan cerita, dan aturan permainannya sendiri dari imajinasi mereka.",
        "b2_demo_title": "DESAIN GAME · ide Komang",
        "b2_demo_char": "Karakter:",
        "b2_demo_char_v": "naga kecil penjaga pulau",
        "b2_demo_miss": "Misi:",
        "b2_demo_miss_v": "kumpulkan 10 permata",
        "b2_demo_rule": "Aturan:",
        "b2_demo_rule_v": "kena ombak = mulai lagi",
        "b3_tag": "GROWTH MINDSET",
        "b3_title": "Problem Solving & Tangguh",
        "b3_desc": "Anak tidak takut salah saat menghadapi error (debugging). Mereka belajar menganalisis penyebab masalah, mencoba solusi lain dengan tenang, dan tidak mudah menyerah.",
        "b3_demo_err": "Error: karakter jatuh menembus lantai",
        "b3_demo_chk1": "Cek: apakah lantai punya collider?",
        "b3_demo_chk2": "Coba: aktifkan \"Anchored\"",
        "b3_demo_chk3": "Berhasil! Dicari sendiri 💪",
        "b4_tag": "SHOW & TELL",
        "b4_title": "Percaya Diri Presentasi",
        "b4_desc": "Di akhir setiap proyek, siswa mempresentasikan karyanya di depan tutor dan teman sekelas. Ini membangun keberanian public speaking dan kemampuan menyampaikan ide sejak dini.",
        "b4_demo_title": "SHOWCASE · akhir proyek",
        "b4_demo_quote": "\"Ini game buatanku!\"",
        "b4_demo_note": "Menjelaskan ide, cara main & tantangan yang dihadapi",
        "b5_tag": "PORTOFOLIO NYATA",
        "b5_title": "Portofolio Digital & Sertifikat",
        "b5_desc": "Setiap karya (game, website, aplikasi) tersimpan rapi, dan anak mendapat sertifikat setelah menyelesaikan course. Bukti nyata kompetensi untuk sekolah maupun jenjang berikutnya.",
        "b5_demo_title": "PORTOFOLIO SISWA",
        "b5_demo_item1": "Game Tangkap Bintang",
        "b5_demo_item2": "Website Profil",
        "b5_demo_item3": "Aplikasi Kuis",
        "b5_demo_item4": "Sertifikat",
        "b5_demo_item4_sub": "course selesai",

            level: 'Teens Level (Advance 2)',
            title: 'Junior Web Developer',
            duration: '12-16 Minggu',
            desc: 'Membangun pondasi menjadi web developer profesional menggunakan HTML, CSS, dan JavaScript.',
            tools: [['HTML', 'html.webp'], ['CSS', 'css.webp'], ['JavaScript', 'js.svg']],
            topics: [
                'Struktur website dengan HTML',
                'Styling & Layout dengan CSS',
                'Interaktivitas dengan JavaScript',
                'Membuat Website Portfolio Pribadi'
            ]
        },
        en: {

        "funnel_tag": "Parent Decision Guide",
        "funnel_title": "Easy Flow: Where Should I Start?",
        "step1_title": "Understand the Benefits",
        "step2_title": "Choose Child's Level",
        "step3_title": "View Project Portfolio",
        "step4_title": "Try a Free Class",
        "step5_title": "Start Creating",


        "benefit_badge": "INVESTMENT IN YOUR CHILD'S FUTURE",
        "benefit_title_1": "Not just learning to code.",
        "benefit_title_2": "Learning to <span class=\"text-[#38BDF8]\">think</span>, <span class=\"text-[#34D399]\">try</span>, &amp; <span class=\"text-[#FFC83D]\">create</span>.",
        "b_tab_logic": "Logical Thinking",
        "b_tab_creative": "Creative",
        "b_tab_problem": "Problem Solving",
        "b_tab_present": "Presentation",
        "b_tab_portfolio": "Portfolio",
        "b1_tag": "STRUCTURED LOGIC",
        "b1_title": "Logical & Structured Thinking",
        "b1_desc": "Children are trained to break down big problems into organized, systematic steps (computational thinking). This skill helps them in math and science at school.",
        "b1_prob_title": "PROBLEM: \"Make the robot go home\"",
        "b1_prob_1": "1. move forward 3 steps",
        "b1_prob_2": "2. if there's a wall → turn right",
        "b1_prob_3": "3. repeat until finding 🏠",
        "b1_prob_note": "Big problem → ordered small steps",
        "b2_tag": "ACTIVE CREATOR",
        "b2_title": "Creative Project Making",
        "b2_desc": "Passive screen-time turns into productive creation. Children design their own characters, storylines, and game rules from their imagination.",
        "b2_demo_title": "GAME DESIGN · Komang's idea",
        "b2_demo_char": "Character:",
        "b2_demo_char_v": "little dragon guarding the island",
        "b2_demo_miss": "Mission:",
        "b2_demo_miss_v": "collect 10 gems",
        "b2_demo_rule": "Rules:",
        "b2_demo_rule_v": "hit by wave = restart",
        "b3_tag": "GROWTH MINDSET",
        "b3_title": "Problem Solving & Resilience",
        "b3_desc": "Children aren't afraid of making mistakes when encountering errors (debugging). They learn to analyze causes, calmly try alternatives, and persevere.",
        "b3_demo_err": "Error: character falls through the floor",
        "b3_demo_chk1": "Check: does the floor have a collider?",
        "b3_demo_chk2": "Try: enable \"Anchored\"",
        "b3_demo_chk3": "Success! Found it themselves 💪",
        "b4_tag": "SHOW & TELL",
        "b4_title": "Confident Presentation",
        "b4_desc": "At the end of every project, students present their work in front of the tutor and classmates. This builds early public speaking and communication skills.",
        "b4_demo_title": "SHOWCASE · project finale",
        "b4_demo_quote": "\"This is my game!\"",
        "b4_demo_note": "Explaining ideas, gameplay & challenges faced",
        "b5_tag": "REAL PORTFOLIO",
        "b5_title": "Digital Portfolio & Certificate",
        "b5_desc": "Every creation (game, website, app) is neatly saved, and children get a certificate upon course completion. Real proof of skills for school and beyond.",
        "b5_demo_title": "STUDENT PORTFOLIO",
        "b5_demo_item1": "Star Catcher Game",
        "b5_demo_item2": "Profile Website",
        "b5_demo_item3": "Quiz App",
        "b5_demo_item4": "Certificate",
        "b5_demo_item4_sub": "course completed",

            level: 'Teens Level (Advance 2)',
            title: 'Junior Web Developer',
            duration: '12-16 Weeks',
            desc: 'Build a foundation to become a professional web developer using HTML, CSS, and JavaScript.',
            tools: [['HTML', 'html.webp'], ['CSS', 'css.webp'], ['JavaScript', 'js.svg']],
            topics: [
                'Website structure with HTML',
                'Styling & Layout with CSS',
                'Interactivity with JavaScript',
                'Creating a Personal Portfolio Website'
            ]
        }
    },
    'teens-robotics': {
        icon: 'fa-robot',
        color: 'orange',
        xp: '+2500 XP',
        id: {

        "funnel_tag": "Panduan Keputusan Orang Tua",
        "funnel_title": "Alur Mudah: Saya Harus Mulai dari Mana?",
        "step1_title": "Kenali Manfaat",
        "step2_title": "Pilih Level Anak",
        "step3_title": "Lihat Karya Project",
        "step4_title": "Coba Kelas Gratis",
        "step5_title": "Mulai Berkarya",


        "benefit_badge": "INVESTASI MASA DEPAN ANAK",
        "benefit_title_1": "Bukan hanya belajar coding.",
        "benefit_title_2": "Anak belajar <span class=\"text-[#38BDF8]\">berpikir</span>, <span class=\"text-[#34D399]\">mencoba</span>, &amp; <span class=\"text-[#FFC83D]\">berkarya</span>.",
        "b_tab_logic": "Berpikir Logis",
        "b_tab_creative": "Kreatif",
        "b_tab_problem": "Problem Solving",
        "b_tab_present": "Presentasi",
        "b_tab_portfolio": "Portofolio",
        "b1_tag": "LOGIKA TERSTRUKTUR",
        "b1_title": "Berpikir Logis & Terstruktur",
        "b1_desc": "Anak dilatih memecah masalah besar menjadi langkah-langkah kecil yang teratur dan sistematis (computational thinking). Kemampuan ini dapat membantu di pelajaran matematika dan sains di sekolah.",
        "b1_prob_title": "MASALAH: \"Buat robot pulang ke rumah\"",
        "b1_prob_1": "1. maju 3 langkah",
        "b1_prob_2": "2. jika ada tembok → belok kanan",
        "b1_prob_3": "3. ulangi sampai ketemu 🏠",
        "b1_prob_note": "Masalah besar → langkah kecil yang urut",
        "b2_tag": "KREATOR AKTIF",
        "b2_title": "Kreatif Membuat Project",
        "b2_desc": "Kebiasaan screen-time pasif berubah menjadi waktu berkarya. Anak mendesain karakter, jalan cerita, dan aturan permainannya sendiri dari imajinasi mereka.",
        "b2_demo_title": "DESAIN GAME · ide Komang",
        "b2_demo_char": "Karakter:",
        "b2_demo_char_v": "naga kecil penjaga pulau",
        "b2_demo_miss": "Misi:",
        "b2_demo_miss_v": "kumpulkan 10 permata",
        "b2_demo_rule": "Aturan:",
        "b2_demo_rule_v": "kena ombak = mulai lagi",
        "b3_tag": "GROWTH MINDSET",
        "b3_title": "Problem Solving & Tangguh",
        "b3_desc": "Anak tidak takut salah saat menghadapi error (debugging). Mereka belajar menganalisis penyebab masalah, mencoba solusi lain dengan tenang, dan tidak mudah menyerah.",
        "b3_demo_err": "Error: karakter jatuh menembus lantai",
        "b3_demo_chk1": "Cek: apakah lantai punya collider?",
        "b3_demo_chk2": "Coba: aktifkan \"Anchored\"",
        "b3_demo_chk3": "Berhasil! Dicari sendiri 💪",
        "b4_tag": "SHOW & TELL",
        "b4_title": "Percaya Diri Presentasi",
        "b4_desc": "Di akhir setiap proyek, siswa mempresentasikan karyanya di depan tutor dan teman sekelas. Ini membangun keberanian public speaking dan kemampuan menyampaikan ide sejak dini.",
        "b4_demo_title": "SHOWCASE · akhir proyek",
        "b4_demo_quote": "\"Ini game buatanku!\"",
        "b4_demo_note": "Menjelaskan ide, cara main & tantangan yang dihadapi",
        "b5_tag": "PORTOFOLIO NYATA",
        "b5_title": "Portofolio Digital & Sertifikat",
        "b5_desc": "Setiap karya (game, website, aplikasi) tersimpan rapi, dan anak mendapat sertifikat setelah menyelesaikan course. Bukti nyata kompetensi untuk sekolah maupun jenjang berikutnya.",
        "b5_demo_title": "PORTOFOLIO SISWA",
        "b5_demo_item1": "Game Tangkap Bintang",
        "b5_demo_item2": "Website Profil",
        "b5_demo_item3": "Aplikasi Kuis",
        "b5_demo_item4": "Sertifikat",
        "b5_demo_item4_sub": "course selesai",

            level: 'Teens Level (Advance 3)',
            title: 'Robotika & IoT',
            duration: '14-16 Minggu',
            desc: 'Menggabungkan perangkat keras (hardware) dan perangkat lunak (software) menggunakan Arduino dan PictoBlox IoT.',
            tools: [['Arduino', 'arduino.webp'], ['PictoBlox IoT', 'pictoblox.png']],
            topics: [
                'Pengenalan Komponen Elektronik & Sensor',
                'Dasar Pemrograman Mikrokontroler (Arduino)',
                'Integrasi Hardware & Software (IoT)',
                'Membuat Project Smart Device'
            ]
        },
        en: {

        "funnel_tag": "Parent Decision Guide",
        "funnel_title": "Easy Flow: Where Should I Start?",
        "step1_title": "Understand the Benefits",
        "step2_title": "Choose Child's Level",
        "step3_title": "View Project Portfolio",
        "step4_title": "Try a Free Class",
        "step5_title": "Start Creating",


        "benefit_badge": "INVESTMENT IN YOUR CHILD'S FUTURE",
        "benefit_title_1": "Not just learning to code.",
        "benefit_title_2": "Learning to <span class=\"text-[#38BDF8]\">think</span>, <span class=\"text-[#34D399]\">try</span>, &amp; <span class=\"text-[#FFC83D]\">create</span>.",
        "b_tab_logic": "Logical Thinking",
        "b_tab_creative": "Creative",
        "b_tab_problem": "Problem Solving",
        "b_tab_present": "Presentation",
        "b_tab_portfolio": "Portfolio",
        "b1_tag": "STRUCTURED LOGIC",
        "b1_title": "Logical & Structured Thinking",
        "b1_desc": "Children are trained to break down big problems into organized, systematic steps (computational thinking). This skill helps them in math and science at school.",
        "b1_prob_title": "PROBLEM: \"Make the robot go home\"",
        "b1_prob_1": "1. move forward 3 steps",
        "b1_prob_2": "2. if there's a wall → turn right",
        "b1_prob_3": "3. repeat until finding 🏠",
        "b1_prob_note": "Big problem → ordered small steps",
        "b2_tag": "ACTIVE CREATOR",
        "b2_title": "Creative Project Making",
        "b2_desc": "Passive screen-time turns into productive creation. Children design their own characters, storylines, and game rules from their imagination.",
        "b2_demo_title": "GAME DESIGN · Komang's idea",
        "b2_demo_char": "Character:",
        "b2_demo_char_v": "little dragon guarding the island",
        "b2_demo_miss": "Mission:",
        "b2_demo_miss_v": "collect 10 gems",
        "b2_demo_rule": "Rules:",
        "b2_demo_rule_v": "hit by wave = restart",
        "b3_tag": "GROWTH MINDSET",
        "b3_title": "Problem Solving & Resilience",
        "b3_desc": "Children aren't afraid of making mistakes when encountering errors (debugging). They learn to analyze causes, calmly try alternatives, and persevere.",
        "b3_demo_err": "Error: character falls through the floor",
        "b3_demo_chk1": "Check: does the floor have a collider?",
        "b3_demo_chk2": "Try: enable \"Anchored\"",
        "b3_demo_chk3": "Success! Found it themselves 💪",
        "b4_tag": "SHOW & TELL",
        "b4_title": "Confident Presentation",
        "b4_desc": "At the end of every project, students present their work in front of the tutor and classmates. This builds early public speaking and communication skills.",
        "b4_demo_title": "SHOWCASE · project finale",
        "b4_demo_quote": "\"This is my game!\"",
        "b4_demo_note": "Explaining ideas, gameplay & challenges faced",
        "b5_tag": "REAL PORTFOLIO",
        "b5_title": "Digital Portfolio & Certificate",
        "b5_desc": "Every creation (game, website, app) is neatly saved, and children get a certificate upon course completion. Real proof of skills for school and beyond.",
        "b5_demo_title": "STUDENT PORTFOLIO",
        "b5_demo_item1": "Star Catcher Game",
        "b5_demo_item2": "Profile Website",
        "b5_demo_item3": "Quiz App",
        "b5_demo_item4": "Certificate",
        "b5_demo_item4_sub": "course completed",

            level: 'Teens Level (Advance 3)',
            title: 'Robotics & IoT',
            duration: '14-16 Weeks',
            desc: 'Combining hardware and software using Arduino and PictoBlox IoT.',
            tools: [['Arduino', 'arduino.webp'], ['PictoBlox IoT', 'pictoblox.png']],
            topics: [
                'Introduction to Electronic Components & Sensors',
                'Basics of Microcontroller Programming (Arduino)',
                'Hardware & Software Integration (IoT)',
                'Creating Smart Device Projects'
            ]
        }
    },
    'teens-app': {
        icon: 'fa-mobile-screen',
        color: 'indigo',
        xp: '+2500 XP',
        id: {

        "funnel_tag": "Panduan Keputusan Orang Tua",
        "funnel_title": "Alur Mudah: Saya Harus Mulai dari Mana?",
        "step1_title": "Kenali Manfaat",
        "step2_title": "Pilih Level Anak",
        "step3_title": "Lihat Karya Project",
        "step4_title": "Coba Kelas Gratis",
        "step5_title": "Mulai Berkarya",


        "benefit_badge": "INVESTASI MASA DEPAN ANAK",
        "benefit_title_1": "Bukan hanya belajar coding.",
        "benefit_title_2": "Anak belajar <span class=\"text-[#38BDF8]\">berpikir</span>, <span class=\"text-[#34D399]\">mencoba</span>, &amp; <span class=\"text-[#FFC83D]\">berkarya</span>.",
        "b_tab_logic": "Berpikir Logis",
        "b_tab_creative": "Kreatif",
        "b_tab_problem": "Problem Solving",
        "b_tab_present": "Presentasi",
        "b_tab_portfolio": "Portofolio",
        "b1_tag": "LOGIKA TERSTRUKTUR",
        "b1_title": "Berpikir Logis & Terstruktur",
        "b1_desc": "Anak dilatih memecah masalah besar menjadi langkah-langkah kecil yang teratur dan sistematis (computational thinking). Kemampuan ini dapat membantu di pelajaran matematika dan sains di sekolah.",
        "b1_prob_title": "MASALAH: \"Buat robot pulang ke rumah\"",
        "b1_prob_1": "1. maju 3 langkah",
        "b1_prob_2": "2. jika ada tembok → belok kanan",
        "b1_prob_3": "3. ulangi sampai ketemu 🏠",
        "b1_prob_note": "Masalah besar → langkah kecil yang urut",
        "b2_tag": "KREATOR AKTIF",
        "b2_title": "Kreatif Membuat Project",
        "b2_desc": "Kebiasaan screen-time pasif berubah menjadi waktu berkarya. Anak mendesain karakter, jalan cerita, dan aturan permainannya sendiri dari imajinasi mereka.",
        "b2_demo_title": "DESAIN GAME · ide Komang",
        "b2_demo_char": "Karakter:",
        "b2_demo_char_v": "naga kecil penjaga pulau",
        "b2_demo_miss": "Misi:",
        "b2_demo_miss_v": "kumpulkan 10 permata",
        "b2_demo_rule": "Aturan:",
        "b2_demo_rule_v": "kena ombak = mulai lagi",
        "b3_tag": "GROWTH MINDSET",
        "b3_title": "Problem Solving & Tangguh",
        "b3_desc": "Anak tidak takut salah saat menghadapi error (debugging). Mereka belajar menganalisis penyebab masalah, mencoba solusi lain dengan tenang, dan tidak mudah menyerah.",
        "b3_demo_err": "Error: karakter jatuh menembus lantai",
        "b3_demo_chk1": "Cek: apakah lantai punya collider?",
        "b3_demo_chk2": "Coba: aktifkan \"Anchored\"",
        "b3_demo_chk3": "Berhasil! Dicari sendiri 💪",
        "b4_tag": "SHOW & TELL",
        "b4_title": "Percaya Diri Presentasi",
        "b4_desc": "Di akhir setiap proyek, siswa mempresentasikan karyanya di depan tutor dan teman sekelas. Ini membangun keberanian public speaking dan kemampuan menyampaikan ide sejak dini.",
        "b4_demo_title": "SHOWCASE · akhir proyek",
        "b4_demo_quote": "\"Ini game buatanku!\"",
        "b4_demo_note": "Menjelaskan ide, cara main & tantangan yang dihadapi",
        "b5_tag": "PORTOFOLIO NYATA",
        "b5_title": "Portofolio Digital & Sertifikat",
        "b5_desc": "Setiap karya (game, website, aplikasi) tersimpan rapi, dan anak mendapat sertifikat setelah menyelesaikan course. Bukti nyata kompetensi untuk sekolah maupun jenjang berikutnya.",
        "b5_demo_title": "PORTOFOLIO SISWA",
        "b5_demo_item1": "Game Tangkap Bintang",
        "b5_demo_item2": "Website Profil",
        "b5_demo_item3": "Aplikasi Kuis",
        "b5_demo_item4": "Sertifikat",
        "b5_demo_item4_sub": "course selesai",

            level: 'Teens Level (Advance 4)',
            title: 'Apps Developer',
            duration: '12-16 Minggu',
            desc: 'Merancang dan membuat aplikasi mobile secara mandiri menggunakan MIT App Inventor dan dasar Flutter.',
            tools: [['App Inventor', 'mit_app_inventor.png'], ['Flutter', 'flutter.webp']],
            topics: [
                'UI/UX Design untuk Mobile App',
                'Logika Pemrograman Berbasis Event',
                'Integrasi Fitur Smartphone (Kamera, GPS)',
                'Membuat Aplikasi Android Sederhana'
            ]
        },
        en: {

        "funnel_tag": "Parent Decision Guide",
        "funnel_title": "Easy Flow: Where Should I Start?",
        "step1_title": "Understand the Benefits",
        "step2_title": "Choose Child's Level",
        "step3_title": "View Project Portfolio",
        "step4_title": "Try a Free Class",
        "step5_title": "Start Creating",


        "benefit_badge": "INVESTMENT IN YOUR CHILD'S FUTURE",
        "benefit_title_1": "Not just learning to code.",
        "benefit_title_2": "Learning to <span class=\"text-[#38BDF8]\">think</span>, <span class=\"text-[#34D399]\">try</span>, &amp; <span class=\"text-[#FFC83D]\">create</span>.",
        "b_tab_logic": "Logical Thinking",
        "b_tab_creative": "Creative",
        "b_tab_problem": "Problem Solving",
        "b_tab_present": "Presentation",
        "b_tab_portfolio": "Portfolio",
        "b1_tag": "STRUCTURED LOGIC",
        "b1_title": "Logical & Structured Thinking",
        "b1_desc": "Children are trained to break down big problems into organized, systematic steps (computational thinking). This skill helps them in math and science at school.",
        "b1_prob_title": "PROBLEM: \"Make the robot go home\"",
        "b1_prob_1": "1. move forward 3 steps",
        "b1_prob_2": "2. if there's a wall → turn right",
        "b1_prob_3": "3. repeat until finding 🏠",
        "b1_prob_note": "Big problem → ordered small steps",
        "b2_tag": "ACTIVE CREATOR",
        "b2_title": "Creative Project Making",
        "b2_desc": "Passive screen-time turns into productive creation. Children design their own characters, storylines, and game rules from their imagination.",
        "b2_demo_title": "GAME DESIGN · Komang's idea",
        "b2_demo_char": "Character:",
        "b2_demo_char_v": "little dragon guarding the island",
        "b2_demo_miss": "Mission:",
        "b2_demo_miss_v": "collect 10 gems",
        "b2_demo_rule": "Rules:",
        "b2_demo_rule_v": "hit by wave = restart",
        "b3_tag": "GROWTH MINDSET",
        "b3_title": "Problem Solving & Resilience",
        "b3_desc": "Children aren't afraid of making mistakes when encountering errors (debugging). They learn to analyze causes, calmly try alternatives, and persevere.",
        "b3_demo_err": "Error: character falls through the floor",
        "b3_demo_chk1": "Check: does the floor have a collider?",
        "b3_demo_chk2": "Try: enable \"Anchored\"",
        "b3_demo_chk3": "Success! Found it themselves 💪",
        "b4_tag": "SHOW & TELL",
        "b4_title": "Confident Presentation",
        "b4_desc": "At the end of every project, students present their work in front of the tutor and classmates. This builds early public speaking and communication skills.",
        "b4_demo_title": "SHOWCASE · project finale",
        "b4_demo_quote": "\"This is my game!\"",
        "b4_demo_note": "Explaining ideas, gameplay & challenges faced",
        "b5_tag": "REAL PORTFOLIO",
        "b5_title": "Digital Portfolio & Certificate",
        "b5_desc": "Every creation (game, website, app) is neatly saved, and children get a certificate upon course completion. Real proof of skills for school and beyond.",
        "b5_demo_title": "STUDENT PORTFOLIO",
        "b5_demo_item1": "Star Catcher Game",
        "b5_demo_item2": "Profile Website",
        "b5_demo_item3": "Quiz App",
        "b5_demo_item4": "Certificate",
        "b5_demo_item4_sub": "course completed",

            level: 'Teens Level (Advance 4)',
            title: 'Apps Developer',
            duration: '12-16 Weeks',
            desc: 'Design and create mobile applications independently using MIT App Inventor and basic Flutter.',
            tools: [['App Inventor', 'mit_app_inventor.png'], ['Flutter', 'flutter.webp']],
            topics: [
                'UI/UX Design for Mobile Apps',
                'Event-Based Programming Logic',
                'Smartphone Feature Integration (Camera, GPS)',
                'Creating Simple Android Applications'
            ]
        }
    }
};





function applyExpandState(courseKey, data) {
    const detailPane = document.getElementById('inline-detail-pane');
    const targetCard = document.getElementById('card-' + courseKey);
    const targetSlot = document.getElementById('detail-slot-' + courseKey);
    
    targetSlot.appendChild(detailPane);
    detailPane.classList.remove('hidden');
    detailPane.classList.add('flex');

    populateSplitPane(data.id, data.icon, data.color, data.xp, data.tools);

    document.querySelectorAll('.course-card').forEach(card => {
        const baseClass = card.dataset.baseClass;
        card.className = baseClass; 

        const defaultContent = card.querySelector('.default-content');
        const cardCat = card.querySelector('.card-cat');
        const cardNum = card.querySelector('.card-num');
        const cardIcon = card.querySelector('.card-icon');
        const cardDesc = card.querySelector('.card-desc');
        const cardTools = card.querySelector('.card-tools');
        const cardTitle = card.querySelector('.card-title');
        const bgHover = card.querySelector('.card-bg-hover');

        if (card.id === 'card-' + courseKey) {
            card.classList.add('ring-1', 'ring-white/20', 'md:row-span-2');
            card.classList.remove('cursor-pointer', 'hover:-translate-y-1');
            card.onclick = null; 
            
            
        } else {
            // Keep original col-span, just change visual content 
            
            defaultContent.classList.remove('p-6', 'sm:p-8');
            defaultContent.classList.add('p-5');
            defaultContent.parentElement.classList.remove('min-h-[400px]', 'min-h-[440px]', 'min-h-[380px]'); 
            
            cardDesc.classList.add('hidden');
            cardTools.classList.add('hidden');
            cardNum.classList.add('hidden');
            bgHover.classList.add('hidden');
            
            cardIcon.classList.remove('hidden');
            cardIcon.classList.add('flex');
            
            const headerRow = cardCat.parentElement;
            headerRow.classList.remove('mb-12');
            headerRow.classList.add('mb-4');
            
            cardTitle.classList.remove('text-3xl', 'sm:text-4xl');
            cardTitle.classList.add('text-xl');
            
            card.onclick = () => window.openCourseExpand(card.id.replace('card-', ''));
        }
    });
}

window.openCourseExpand = function(courseKey) {
    const data = coursesData[courseKey];
    if (!data) return;

    if (document.startViewTransition) {
        document.startViewTransition(() => applyExpandState(courseKey, data));
    } else {
        applyExpandState(courseKey, data);
    }
    
    setTimeout(() => {
        const targetCard = document.getElementById('card-' + courseKey);
        if(targetCard) {
            const offset = 100;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = targetCard.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
        }
    }, 150);
};

function applyCloseState() {
    const detailPane = document.getElementById('inline-detail-pane');
    detailPane.classList.add('hidden');
    detailPane.classList.remove('flex');
    document.body.appendChild(detailPane);

    document.querySelectorAll('.course-card').forEach(card => {
        card.className = card.dataset.baseClass;
        card.onclick = () => window.openCourseExpand(card.id.replace('card-', ''));

        const defaultContent = card.querySelector('.default-content');
        const cardCat = card.querySelector('.card-cat');
        const cardNum = card.querySelector('.card-num');
        const cardIcon = card.querySelector('.card-icon');
        const cardDesc = card.querySelector('.card-desc');
        const cardTools = card.querySelector('.card-tools');
        const cardTitle = card.querySelector('.card-title');
        const bgHover = card.querySelector('.card-bg-hover');

        defaultContent.classList.remove('hidden', 'p-5');
        defaultContent.classList.add('p-6', 'sm:p-8');
        
        cardDesc.classList.remove('hidden');
        cardTools.classList.remove('hidden');
        cardNum.classList.remove('hidden');
        bgHover.classList.remove('hidden');
        
        cardIcon.classList.remove('flex');
        cardIcon.classList.add('hidden');
        
        const headerRow = cardCat.parentElement;
        headerRow.classList.remove('mb-4');
        headerRow.classList.add('mb-12');
        
        cardTitle.classList.remove('text-xl');
        cardTitle.classList.add('text-3xl', 'sm:text-4xl');
    });
}

window.closeCourseExpand = function(event) {
    if(event) event.stopPropagation();
    
    if (document.startViewTransition) {
        document.startViewTransition(() => applyCloseState());
    } else {
        applyCloseState();
    }
    
    setTimeout(() => {
        document.getElementById('course').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
};



function populateSplitPane(data, iconClass, colorClass, xp, tools) {
    document.getElementById('split-level').textContent = data.level;
    document.getElementById('split-title').textContent = data.title;
    document.getElementById('split-desc').textContent = data.desc;
    document.getElementById('split-xp').textContent = xp;
    document.getElementById('split-duration').textContent = data.duration;
    
    document.getElementById('split-icon').className = `fa-solid ${iconClass} text-white relative z-10`;

    const colorBar = document.getElementById('split-color-bar');
    const glow = document.getElementById('split-glow');
    let themeColor = '#0788F5'; 
    
    if (colorClass.includes('emerald') || colorClass.includes('teal')) themeColor = '#10B981';
    else if (colorClass.includes('purple')) themeColor = '#A855F7';
    else if (colorClass.includes('yellow') || colorClass.includes('amber')) themeColor = '#FFC83D';
    else if (colorClass.includes('red') || colorClass.includes('pink') || colorClass.includes('orange')) themeColor = '#F43F5E';
    else if (colorClass.includes('indigo')) themeColor = '#6366F1';
    
    if (colorBar) colorBar.style.backgroundColor = themeColor;
    if (glow) glow.style.backgroundColor = themeColor;

    // Tools
    const toolsContainer = document.getElementById('split-tools-container');
    if (toolsContainer) {
        if (data.tools && data.tools.length > 0) {
            toolsContainer.innerHTML = data.tools.map(t => `
                <span class="inline-flex items-center gap-2 pl-1 pr-2.5 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <span class="w-6 h-6 rounded-full bg-white p-0.5 flex items-center justify-center shrink-0">
                        <img src="assets/tech/${t[1]}" alt="${t[0]}" class="w-full h-full object-contain">
                    </span>
                    <span class="text-[11px] font-semibold text-slate-200">${t[0]}</span>
                </span>
            `).join('');
        } else {
            toolsContainer.innerHTML = '';
        }
    }

    // Topics
    const topicsUl = document.getElementById('split-topics');
    if (topicsUl) {
        topicsUl.innerHTML = '';
        data.topics.forEach((topic, index) => {
            const li = document.createElement('li');
            li.className = 'flex items-start gap-3 p-4 rounded-xl bg-[#0B0F19] border border-white/5';
            li.innerHTML = `
                <div class="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span class="text-[10px] font-mono font-bold text-slate-300">${index+1}</span>
                </div>
                <span class="leading-relaxed text-slate-300 text-sm font-medium pt-0.5">${topic}</span>`;
            topicsUl.appendChild(li);
        });
    }
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
    const lang = localStorage.getItem('leskoding_lang') || 'en';
    
    if(!input.value.trim()) {
        alert(lang === 'en' ? "Please enter your location or district first." : "Silakan masukkan lokasi Anda terlebih dahulu.");
        return;
    }
    
    // Animate button
    const originalText = btn.innerHTML;
    btn.innerHTML = lang === 'en' ? '<i class="fa-solid fa-spinner fa-spin"></i> Calculating...' : '<i class="fa-solid fa-spinner fa-spin"></i> Menghitung...';
    btn.classList.add('opacity-80');
    
    // Mock API call (simulate delay)
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('opacity-80');
        
        // Randomize mock distance for gamification effect
        const randomMins = Math.floor(Math.random() * 20) + 10; // 10-30 mins
        const randomKm = Math.floor(Math.random() * 15) + 3; // 3-18 km
        const campuses = ['Gents Robotic Gianyar', 'Bali Seed Bedulu', 'Layanan Private (Home Visit)'];
        const randomCampus = campuses[Math.floor(Math.random() * campuses.length)];
        
        if (lang === 'en') {
            resultText.innerHTML = `Only <strong>${randomMins} Minutes (${randomKm} km)</strong> from your location!`;
        } else {
            resultText.innerHTML = `Hanya <strong>${randomMins} Menit (${randomKm} km)</strong> dari lokasi Anda!`;
        }
        
        const nearestCampusText = resultBox.querySelector('strong.nearest-campus-name') || resultBox.querySelectorAll('strong')[1];
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

// Mobile navigation: lihat bagian 15 (bottom sheet)

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
            const cards = document.getElementById('reg-center-cards');
            if (cards) {
                cards.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const first = cards.querySelector('.reg-choice');
                if (first) first.focus({ preventScroll: true });
            }
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

/* 13. Pilihan Learning Center: lihat bagian 15 (kartu pilihan) */

/* ========================================================
   14. THEME & INTERNATIONALIZATION (I18N) ENGINE
   ======================================================== */

// Comprehensive Bilingual Translation Dictionary (English Default & Indonesian)
const i18nDictionary = {
    en: {

        /* --- cara belajar opsi 3 --- */
        "cb3_title": "Up to 120 minutes, <span class=\"text-transparent bg-clip-text bg-gradient-to-r from-[#FFC83D] via-[#38BDF8] to-[#C084FC]\">full of creation.</span>",
        "cb3_desc": "Each session runs up to 120 minutes: 15 minutes of concepts, 90 minutes of hands-on practice, and 15 minutes of review. Drag the timeline to see what happens on your child's screen.",
        "cb3_minute": "minute",
        "cb3_seg2": "02 Hands-on practice · 90'",
        "cb3_goal_mark": "Milestone",
        "cb3_play": "Autoplay",
        "cb3_pause": "Pause",
        "cb3_replay": "Replay",
        "cb3_range_label": "Session minute",
        "cb3_note": "Up to 120 minutes per session. Screen shown is an illustration.",
        "cb3_s1": "Concept",
        "cb3_s2": "Hands-on Practice",
        "cb3_s3": "Review &amp; Feedback",
        "cb3_s4": "Milestones &amp; Progress",
        "cb3_code": "CODE BLOCKS",
        "cb3_b1": "when 🏁 clicked",
        "cb3_b2": "forever",
        "cb3_b3": "if ➡ pressed → move 10",
        "cb3_b4": "if ⬆ pressed → jump",
        "cb3_b5": "if touching ⭐ → score +1",
        "cb3_b6": "if score = 5 → win 🎉",
        "cb3_quiz_tag": "QUIZ · 1/3",
        "cb3_quiz_q": "What is a loop like?",
        "cb3_q_a": "🚪 A door",
        "cb3_q_b": "🔁 A song on repeat ✓",
        "cb3_q_c": "📦 A box",
        "cb3_q_d": "🌧️ Rain",
        "cb3_score": "SCORE",
        "cb3_xp_saved": "💾 saved to portfolio",
        "cb3_report_sent": "Session report sent to parents",
        "cb3_st1_t": "Concept quiz",
        "cb3_st1_d": "The tutor opens with a visual analogy and a quick quiz on today's concept.",
        "cb3_st2_t": "Start building",
        "cb3_st2_d": "Your child opens the software and starts building their own project.",
        "cb3_st3_t": "Tutor checks in",
        "cb3_st3_d": "During practice, the tutor gives hints, not ready-made answers.",
        "cb3_tip1": "Nice! Now try making the character jump.",
        "cb3_st4_t": "Found a bug!",
        "cb3_st4_d": "The character won't jump. Your child is guided to track down the cause themselves.",
        "cb3_st5_t": "Bug fixed",
        "cb3_st5_d": "Healthy trial and error builds problem solving and persistence.",
        "cb3_st6_t": "A new idea",
        "cb3_st6_d": "The tutor celebrates your child's original ideas during practice.",
        "cb3_tip2": "Adding stars was a great idea!",
        "cb3_st7_t": "Almost done",
        "cb3_st7_d": "Your child tests their game and polishes the final details.",
        "cb3_st8_t": "Review &amp; presentation",
        "cb3_st8_d": "Final 15 minutes: your child presents their work and gets personal feedback and tips (max. 5 students per tutor).",
        "cb3_tip3": "Tell your friends how your game works!",
        "cb3_st9_t": "Progress recorded",
        "cb3_st9_d": "XP goes up, the project is saved to the portfolio, and a session report is published for parents.",

        /* --- redesign 2026-10 --- */
        "nav2_grp_prog": "Programs &amp; Tech",
        "nav2_grp_method": "Method &amp; Progress",
        "nav2_location": "Locations",
        "nav2_location_full": "Learning Centers",
        "nav2_faq": "FAQ",
        "nav2_cta": "Try a Free Class",
        "nav2_cta_short": "Enroll",
        "nav2_p_found": "Coding Foundations",
        "nav2_p_skill": "Digital Skills",
        "nav2_p_teens": "Teen Specializations",
        "nav2_yrs": "yrs",
        "nav2_prog_komputer": "Computer Basics",
        "nav2_prog_desain": "Graphic Design",
        "nav2_prog_robotik": "Robotics &amp; IoT",
        "nav2_feat_tag": "Not sure which one?",
        "nav2_feat_title": "Try 1 free session and our tutor will help find the right level.",
        "nav2_feat_cta": "Try Free",
        "nav2_tech": "Tools &amp; Tech Flow",
        "nav2_works": "Student Works Gallery",
        "nav2_all": "See all programs →",
        "nav2_program": "Learning Programs",
        "nav2_m1_t": "Learning Benefits",
        "nav2_m1_d": "Logic, creativity &amp; problem solving",
        "nav2_m2_t": "How We Teach",
        "nav2_m2_d": "4 fun, interactive phases",
        "nav2_m3_t": "Parent Progress Reports",
        "nav2_m3_d": "Transparent feedback every session",
        "nav2_rpt_tag": "Sample session report",
        "nav2_rpt_r1": "Concept Understanding",
        "nav2_rpt_r2": "Creativity",
        "nav2_rpt_r3": "Participation",
        "nav2_rpt_cta": "See the full report →",
        "nav2_alur": "Easy Flow: Where Do I Start?",
        "nav2_trial_link": "Try a free class →",
        "nav2_g1": "Programs &amp; Works",
        "nav2_g2": "Method &amp; Progress",
        "nav2_g3": "Campus Info",
        "hero7_title_1": "Today they <span class=\"text-slate-400\">play</span> games.",
        "hero7_title_2": "Tomorrow, they build them.",
        "hero7_desc": "Same screen time, different outcome. At LesKoding, kids aged 6–17 learn to turn their favorite games, animations, and apps into <b class=\"text-white\">their own creations</b>, guided by a tutor every session.",
        "hero7_mode_watch": "Mode: Viewer",
        "hero7_mode_make": "Mode: Creator ✨",
        "hero7_sub_watch": "Flip the switch, see the difference →",
        "hero7_sub_make": "Logic, creativity, and their own creations",
        "hero7_switch_label": "Switch from viewer to creator mode",
        "hero7_cta": "Try a Free Class",
        "hero7_cta2": "View Curriculum",
        "hero7_assure": "1 free session · no commitment · no experience needed",
        "hero7_watch_status": "Screen time keeps ticking…",
        "hero7_watch_tag": "watching",
        "hero7_blocks": "CODE BLOCKS",
        "hero7_b1": "when 🏁 clicked",
        "hero7_b2": "forever",
        "hero7_b3": "if ➡ key pressed",
        "hero7_b4": "move 10 steps",
        "hero7_b5": "if touching ⭐",
        "hero7_b6": "change score by 1",
        "hero7_score": "SCORE 3",
        "hero7_make_status": "Their own game, their own rules",
        "hero7_make_tag": "creating",
        "hero7_tools": "Industry-standard tools",
        "partners_tag": "Our Partners",
        "partners_title": "In collaboration with",
        "rpt3_title_1": "More than a grade.",
        "rpt3_title_2": "Explanations you can act on.",
        "rpt3_generic_label": "A typical report card",
        "rpt3_paper_head": "LEARNING RESULTS",
        "rpt3_paper_course": "Computer Course",
        "rpt3_paper_name": "Name",
        "rpt3_paper_subject": "Subject",
        "rpt3_paper_grade": "Grade",
        "rpt3_paper_remarks": "Remarks",
        "rpt3_paper_remark_val": "\"Good, keep improving.\"",
        "rpt3_q1": "B+ for what?",
        "rpt3_q2": "Improve what, exactly?",
        "rpt3_q3": "How can I help?",
        "rpt3_th_content": "Report contents",
        "rpt3_th_typical": "Typical",
        "rpt3_row1": "Attendance per session",
        "rpt3_row2": "Tutor name &amp; verification",
        "rpt3_row3": "Score + explanation per skill",
        "rpt3_row4": "Child's strengths",
        "rpt3_row5": "Current focus area",
        "rpt3_row6": "Next-session recommendation",
        "rpt3_row7": "Home practice ideas",
        "rpt3_hint": "Hover (or tap) a row to see where it appears in the report.",
        "rpt3_ours_label": "LesKoding session report · Student Space",
        "reg5_card_heading": "Create their very first <span class=\"text-transparent bg-clip-text bg-gradient-to-r from-[#FFC83D] via-[#38BDF8] to-[#C084FC]\">explorer card.</span>",
        "reg5_card_title": "EXPLORER CARD",
        "reg5_ph_nick": "Nickname",
        "reg5_ph_name": "Full name",
        "reg5_ph_age": "Age",
        "reg5_ph_school": "School",
        "reg5_ph_program": "Choose a program",
        "reg5_required": "required",
        "reg_lbl_program": "Selected Learning Program",
        "reg_program_sub": "Choose a program or a free consultation",
        "reg_program_default": "-- Choose a Learning Program --",
        "reg_prog_opt_innovator": "Innovator (6–8 yrs) — Visual Coding &amp; Early Logic",
        "reg_prog_opt_beginner": "Beginner (8–11 yrs) — Scratch &amp; Creative Games",
        "reg_prog_opt_intermediate": "Intermediate (10–14 yrs) — Advanced Logic &amp; Intro to AI",
        "reg_prog_opt_komputer": "Computer Basics (8–14 yrs) — Word, Excel, PPT &amp; Typing",
        "reg_prog_opt_desain": "Graphic Design (9–14 yrs) — Canva, Figma &amp; UI",
        "reg_prog_opt_game_dev": "Game Developer (11–17 yrs) — Roblox, Construct &amp; Game Lab",
        "reg_prog_opt_web_dev": "Junior Web Dev (11–17 yrs) — HTML, CSS, JavaScript",
        "reg_prog_opt_robotics": "Robotics &amp; IoT (11–17 yrs) — Arduino &amp; Smart Sensors",
        "reg_prog_opt_apps": "Apps Developer (11–17 yrs) — App Inventor &amp; Flutter Mobile",
        "reg_prog_opt_consult": "Not Sure Yet — Consultation / Interest Assessment First",

        "funnel_tag": "Parent Decision Guide",
        "funnel_title": "Easy Flow: Where Should I Start?",
        "step1_title": "Understand the Benefits",
        "step2_title": "Choose Child's Level",
        "step3_title": "View Project Portfolio",
        "step4_title": "Try a Free Class",
        "step5_title": "Start Creating",


        "benefit_badge": "INVESTMENT IN YOUR CHILD'S FUTURE",
        "benefit_title_1": "Not just learning to code.",
        "benefit_title_2": "Learning to <span class=\"text-[#38BDF8]\">think</span>, <span class=\"text-[#34D399]\">try</span>, &amp; <span class=\"text-[#FFC83D]\">create</span>.",
        "b_tab_logic": "Logical Thinking",
        "b_tab_creative": "Creative",
        "b_tab_problem": "Problem Solving",
        "b_tab_present": "Presentation",
        "b_tab_portfolio": "Portfolio",
        "b1_tag": "STRUCTURED LOGIC",
        "b1_title": "Logical & Structured Thinking",
        "b1_desc": "Children are trained to break down big problems into organized, systematic steps (computational thinking). This skill helps them in math and science at school.",
        "b1_prob_title": "PROBLEM: \"Make the robot go home\"",
        "b1_prob_1": "1. move forward 3 steps",
        "b1_prob_2": "2. if there's a wall → turn right",
        "b1_prob_3": "3. repeat until finding 🏠",
        "b1_prob_note": "Big problem → ordered small steps",
        "b2_tag": "ACTIVE CREATOR",
        "b2_title": "Creative Project Making",
        "b2_desc": "Passive screen-time turns into productive creation. Children design their own characters, storylines, and game rules from their imagination.",
        "b2_demo_title": "GAME DESIGN · Komang's idea",
        "b2_demo_char": "Character:",
        "b2_demo_char_v": "little dragon guarding the island",
        "b2_demo_miss": "Mission:",
        "b2_demo_miss_v": "collect 10 gems",
        "b2_demo_rule": "Rules:",
        "b2_demo_rule_v": "hit by wave = restart",
        "b3_tag": "GROWTH MINDSET",
        "b3_title": "Problem Solving & Resilience",
        "b3_desc": "Children aren't afraid of making mistakes when encountering errors (debugging). They learn to analyze causes, calmly try alternatives, and persevere.",
        "b3_demo_err": "Error: character falls through the floor",
        "b3_demo_chk1": "Check: does the floor have a collider?",
        "b3_demo_chk2": "Try: enable \"Anchored\"",
        "b3_demo_chk3": "Success! Found it themselves 💪",
        "b4_tag": "SHOW & TELL",
        "b4_title": "Confident Presentation",
        "b4_desc": "At the end of every project, students present their work in front of the tutor and classmates. This builds early public speaking and communication skills.",
        "b4_demo_title": "SHOWCASE · project finale",
        "b4_demo_quote": "\"This is my game!\"",
        "b4_demo_note": "Explaining ideas, gameplay & challenges faced",
        "b5_tag": "REAL PORTFOLIO",
        "b5_title": "Digital Portfolio & Certificate",
        "b5_desc": "Every creation (game, website, app) is neatly saved, and children get a certificate upon course completion. Real proof of skills for school and beyond.",
        "b5_demo_title": "STUDENT PORTFOLIO",
        "b5_demo_item1": "Star Catcher Game",
        "b5_demo_item2": "Profile Website",
        "b5_demo_item3": "Quiz App",
        "b5_demo_item4": "Certificate",
        "b5_demo_item4_sub": "course completed",

        "nav_program": "Programs",
        "nav_method": "How We Teach",
        "nav_works": "Student Works",
        "nav_progress": "Progress Tracking",
        "nav_location": "Locations",
        "nav_faq": "FAQ",
        "nav_cta": "Get Info",
        "nav_cta_short": "Enroll",
        "nav_mobile_lang_label": "Select Language:",
        "hero_badge": "Playful Future Lab — Coding &amp; Robotics Bali",
        "hero_title_1": "Turn curiosity into",
        "hero_title_2": "digital creations.",
        "hero_desc_main": "Children learn step by step, conquer exciting hands-on challenges, and track their growth every session guided by experienced tutors.",
        "hero_btn_info": "Request Info / Schedule",
        "hero_btn_works": "View Student Works",
        "hero_trust_1_title": "Structured Curriculum",
        "hero_trust_1_sub": "Beginner to Advanced",
        "hero_trust_2_title": "Parent Progress Reports",
        "hero_trust_2_sub": "Track Learning Milestones",
        "hero_trust_3_title": "2 Centers + Private",
        "hero_trust_3_sub": "Gianyar, Bedulu &amp; Home Visit",
        "hero_vis_badge": "Real Student Session",
        "hero_vis_tag": "Project Showcase",
        "hero_vis_title": "Robotics &amp; Interactive Mini Games",
        "hero_vis_feedback_title": "Tutor Feedback Every Session",
        "hero_vis_feedback_sub": "Real-time progress notes sent directly to parents",
        "hero_vis_active": "Active",
        "course_title": "Learning Programs & Curriculum",
        "course_desc": "Structured step-by-step for ages 6–16. Real-world project-based curriculum, interactive challenges, and guidance from experienced mentors.",
        "course_tab_all": "All Programs (10)",
        "course_tab_ladder": "Progression Track (6)",
        "course_tab_specialist": "Specialist Track (4)",
        "course_ladder_tag": "Continuous Learning Pathway",
        "course_ladder_title": "Student Progression Ladder (Level 0 to Level 5)",
        "course_ladder_badge": "Milestone assessment &amp; graduation certificate for each level advancement",
        "course_lvl0_tag": "LEVEL 0",
        "course_lvl0_name": "Basic Computing",
        "course_lvl0_age": "Ages 6–8 Yrs",
        "course_lvl1_tag": "LEVEL 1",
        "course_lvl1_name": "Beginner 1",
        "course_lvl1_age": "Ages 7–9 Yrs",
        "course_lvl2_tag": "LEVEL 2",
        "course_lvl2_name": "Beginner 2",
        "course_lvl2_age": "Ages 8–10 Yrs",
        "course_lvl3_tag": "LEVEL 3",
        "course_lvl3_name": "Intermediate 1",
        "course_lvl3_age": "Ages 9–12 Yrs",
        "course_lvl4_tag": "LEVEL 4",
        "course_lvl4_name": "Intermediate 2",
        "course_lvl4_age": "Ages 10–14 Yrs",
        "course_lvl5_tag": "LEVEL 5",
        "course_lvl5_name": "Innovator",
        "course_lvl5_age": "Ages 11–16 Yrs",
        "course_btn_syllabus": "View Syllabus &amp; Details",
        "c1_lvl": "Level 0 · Foundation",
        "c1_age": "Ages 6–8 Yrs",
        "c1_title": "Basic Computing",
        "c1_desc": "Introduction to computer hardware, mouse &amp; keyboard dexterity, safe software navigation, and fundamental digital logic.",
        "c1_b1": "Hardware &amp; operating system basics",
        "c1_b2": "Typing dexterity &amp; mouse navigation",
        "c1_b3": "Internet safety &amp; digital ethics",
        "c1_b4": "Creative software &amp; foundational logic",
        "c1_dur": "4–6 Weeks",
        "c2_lvl": "Level 1 · Visual Logic",
        "c2_age": "Ages 7–9 Yrs",
        "c2_title": "Beginner 1",
        "c2_desc": "Build computational thinking foundations through visual block coding (Scratch). Turn imagination into first interactive animations.",
        "c2_b1": "Algorithmic logic &amp; command sequencing",
        "c2_b2": "Scratch workspace &amp; event triggers",
        "c2_b3": "Character motion, costumes &amp; audio",
        "c2_b4": "Project: Interactive story &amp; mini game",
        "c2_dur": "6–8 Weeks",
        "c3_lvl": "Level 2 · Game Logic",
        "c3_age": "Ages 8–10 Yrs",
        "c3_title": "Beginner 2",
        "c3_desc": "Master conditional branching, 2D coordinates, dynamic loops, and variable systems to build interactive arcade games.",
        "c3_b1": "X &amp; Y coordinates &amp; collision detection",
        "c3_b2": "Advanced loops &amp; nested loops",
        "c3_b3": "Conditional branching (if-else logic)",
        "c3_b4": "Project: Object catching arcade game &amp; score tracking",
        "c3_dur": "6–8 Weeks",
        "c4_lvl": "Level 3 · Platformer",
        "c4_age": "Ages 9–12 Yrs",
        "c4_title": "Intermediate 1",
        "c4_desc": "Complex multi-level game mechanics, dynamic sprite cloning, mathematical algorithms, and platformer gravity physics.",
        "c4_b1": "Dynamic sprite cloning &amp; memory management",
        "c4_b2": "Jumping physics, inertia &amp; gravity",
        "c4_b3": "Global/local variables &amp; list data structures",
        "c4_b4": "Project: Multi-level challenge platformer game",
        "c4_dur": "8 Weeks",
        "c5_lvl": "Level 4 · Pre-Syntax",
        "c5_age": "Ages 10–14 Yrs",
        "c5_title": "Intermediate 2",
        "c5_desc": "Bridge the transition from visual blocks to text-based syntax. Understand function abstraction (custom blocks) and structured debugging.",
        "c5_b1": "Modular functions (custom blocks with parameters)",
        "c5_b2": "Search &amp; sorting algorithm logic",
        "c5_b3": "Introduction to typed syntax &amp; pseudocode",
        "c5_b4": "Project: Boss battle game with enemy AI",
        "c5_dur": "8 Weeks",
        "c6_lvl": "Level 5 · Capstone",
        "c6_age": "Ages 11–16 Yrs",
        "c6_title": "Innovator",
        "c6_desc": "The capstone summit of the progression curriculum. Students design a major independent project, integrate diverse engineering concepts, and build a showcase digital portfolio.",
        "c6_b1": "Idea design, wireframing &amp; system architecture",
        "c6_b2": "Advanced computational thinking &amp; error handling",
        "c6_b3": "Quality testing, peer review &amp; bug fixing",
        "c6_b4": "Project: Capstone showcase &amp; digital portfolio exhibition",
        "c6_dur": "8–10 Weeks",
        "c7_lvl": "Specialist · 3D Game",
        "c7_age": "Ages 10–16 Yrs",
        "c7_title": "Roblox",
        "c7_desc": "Build multiplayer 3D worlds in Roblox Studio and program gameplay interactions with real typed Lua code.",
        "c7_b1": "Roblox Studio navigation &amp; 3D terrain design",
        "c7_b2": "Lua syntax: Variables, functions &amp; events",
        "c7_b3": "Interactive mechanics, leaderboards &amp; game HUD",
        "c7_b4": "Project: Multiplayer Obby game published to Roblox",
        "c7_dur": "8–10 Weeks",
        "c8_lvl": "Specialist · Hardware",
        "c8_age": "Ages 8–15 Yrs",
        "c8_title": "Robotics",
        "c8_desc": "Wire breadboard electronic circuits, interface real-world sensors, and program microcontrollers (Arduino/ESP32).",
        "c8_b1": "Core electronic circuits &amp; breadboards",
        "c8_b2": "Arduino C++ &amp; microcontroller programming",
        "c8_b3": "Ultrasonic, light &amp; motor sensor integration",
        "c8_b4": "Project: Line follower robot &amp; smart IoT system",
        "c8_dur": "8–10 Weeks",
        "c9_lvl": "Specialist · Modern Web",
        "c9_age": "Ages 11–16 Yrs",
        "c9_title": "Web Programming",
        "c9_desc": "Learn modern responsive website development from semantic HTML5 structure and CSS3 layouts to interactive JavaScript logic.",
        "c9_b1": "Semantic HTML5 &amp; web accessibility",
        "c9_b2": "Responsive CSS3 styling, Flexbox &amp; Grid",
        "c9_b3": "Modern JavaScript interactivity &amp; DOM events",
        "c9_b4": "Project: Responsive portfolio published to the cloud",
        "c9_dur": "8–10 Weeks",
        "c10_lvl": "Specialist · Mobile App",
        "c10_age": "Ages 11–16 Yrs",
        "c10_title": "App Programming",
        "c10_desc": "Design mobile app interfaces (UI/UX), architect multi-screen flows, leverage smartphone sensors, and test live apps on phones.",
        "c10_b1": "Intuitive mobile UI/UX design principles",
        "c10_b2": "Event-driven programming &amp; multi-screen logic",
        "c10_b3": "Smartphone sensors &amp; local storage integration",
        "c10_b4": "Project: Interactive utility app tested on real smartphones",
        "c10_dur": "8–10 Weeks",
        "method_badge": "Learning Methodology",
        "method_title": "How Students Learn at LesKoding",
        "method_desc": "We guide young minds through 4 proven stages: not just rote memorization, but creating real digital projects and experiencing true mastery.",
        "method_s1_step": "Step 01",
        "method_s1_dur": "15 Mins",
        "method_s1_title": "Concept Fundamentals",
        "method_s1_desc": "Coding and engineering concepts explained via intuitive visual analogies and engaging quizzes kids genuinely love.",
        "method_s1_note": "Visual blocks &amp; fun quizzes",
        "method_s2_step": "Step 02",
        "method_s2_dur": "50 Mins",
        "method_s2_title": "Exploratory Practice",
        "method_s2_desc": "Kids assemble real games, write clean logic, and wire robot sensors. Emphasizing trial and error for problem solving.",
        "method_s2_note": "Direct hands-on in class",
        "method_s3_step": "Step 03",
        "method_s3_dur": "Every Session",
        "method_s3_title": "Personal Tutor Feedback",
        "method_s3_desc": "Dedicated mentors guide each child, refine code structure, and appreciate unique inventive ideas.",
        "method_s3_note": "1:4 tutor-to-student ratio",
        "method_s4_step": "Step 04",
        "method_s4_dur": "Tracked Milestones",
        "method_s4_title": "Measurable Progress &amp; XP",
        "method_s4_desc": "Milestones recorded automatically: XP points, published student portfolio, and transparent reports sent to parents.",
        "method_s4_note": "Portfolio &amp; level certificates",
        "hof_title": "Success Stories from <span class=\"foil\">Our Explorers!</span>",
        "hof_desc2": "4 award categories · click the envelope to open",
        "hof_btn_open": "Open all envelopes",
        "hof_btn_nominate": "Make your child the next nominee",
        "hof_desc": "This is where our students' extraordinary creations take the spotlight! Each project is a milestone of relentless dedication, logic, and creativity. Inspired by their achievements? Join us and begin your journey!",
        "hof_masterpiece_heading": "Featured Project Spotlight",
        "hof_badge_masterpiece": "Top Masterpiece",
        "hof_curator_pick": "Curator's Pick",
        "hof_sarah_age": "(12 Years Old)",
        "hof_sarah_role": "Lead Roblox Creator",
        "hof_masterpiece_desc": "A massive 3D Roleplay universe built in Roblox Studio with cyberpunk architecture, virtual economies, and advanced interactive NPCs.",
        "btn_view_project": "View Project",
        "hof_gallery_heading": "Exhibition Gallery",
        "hof_top_creations": "Top Creations",
        "hof_c1_badge": "Most Popular",
        "hof_c1_title": "Smart AI Cashier System",
        "hof_c1_author": "Budi (14 Years Old)",
        "hof_web_dev_tag": "· Web Dev",
        "hof_c1_desc": "Web-based cashier application utilizing complex JavaScript logic for real-time inventory calculations and dynamic receipt printing.",
        "hof_c2_badge": "Future Tech",
        "hof_c2_title": "Smart Waste Sorting Robot",
        "hof_c2_author": "Kevin (10 Years Old)",
        "hof_robotics_tag": "· Robotics",
        "hof_c2_desc": "Arduino-powered engineering project featuring ultrasonic sensors and servo motors to automate waste sorting and smart lid control.",
        "hof_c3_badge": "Best Design",
        "hof_c3_title": "3D Web Animation Portfolio",
        "hof_c3_author": "Nadia (15 Years Old)",
        "hof_c3_desc": "Personal portfolio website packed with seamless CSS 3D animations and fluid scroll transitions created without external libraries.",
        "hof_btn_load_more": "Load More Creations",
        "parent_badge": "Learning reports parents can truly understand",
        "parent_title": "Know what your child learns—and what comes next.",
        "parent_desc": "Once a session report is published, parents can review attendance, skills evaluated by tutors, child strengths, current focus areas, and next-step recommendations. Progress is also tracked seamlessly over time.",
        "parent_p1_title": "Concept Understanding &amp; Problem Solving",
        "parent_p1_desc": "Measures the student's grasp of concepts based on their ability to solve challenges and problems.",
        "parent_p2_title": "Creativity &amp; Innovation",
        "parent_p2_desc": "Evaluates whether the student can develop and modify projects beyond given examples.",
        "parent_p3_title": "Active Participation &amp; Enthusiasm",
        "parent_p3_desc": "Assesses the student's motivation, curiosity, and engagement throughout the learning session.",
        "parent_sync": "Automatic synchronization with Student Space app",
        "report_course_title": "Game Programming (Roblox &amp; Lua)",
        "report_session": "Session #4",
        "report_present": "Present",
        "report_tutor_role": "Lead Tutor",
        "report_tutor_name": "Danu (Facilitator)",
        "report_verified": "Verified Session",
        "report_superhero_label": "Superhero Character",
        "report_superhero_name": "Iron Man (The Innovator)",
        "report_superhero_quote": "\"Diligently solves obstacle logic problems and courageously explores new tech solutions independently.\"",
        "report_rubric_header": "Skill Evaluation (Active Rubric)",
        "report_r1_name": "Concept Understanding &amp; Problem Solving",
        "report_r1_desc": "Measures the student's grasp of concepts based on structured arena problem solving.",
        "report_r2_name": "Creativity &amp; Innovation",
        "report_r2_desc": "Evaluates the student's ability to expand and modify projects beyond base examples with unique features.",
        "report_r3_name": "Active Participation &amp; Enthusiasm",
        "report_r3_desc": "Assesses high motivation, curiosity, and lively discussion throughout the learning session.",
        "report_eval_header": "Tutor Evaluation",
        "report_strengths_label": "Strengths",
        "report_strengths_desc": "Confidently explains ideas and tries to solve challenges independently before asking for help.",
        "report_improvements_label": "Focus Area (Currently Practicing)",
        "report_improvements_desc": "More thorough when checking lines of code that cause syntax errors in the game script.",
        "report_recommendation_label": "Tutor Recommendation",
        "report_recommendation_desc": "\"In the next session, test solutions with several different inputs to ensure no error loopholes.\"",
        "report_parent_tips_label": "Home Practice Ideas (Parent Tips)",
        "report_parent_tips_desc": "Ask your child to share the steps they attempted and their reasoning behind them to foster computational thinking.",
        "loc_badge": "Campuses &amp; Laboratories",
        "loc_title": "Learning Centers in Bali",
        "loc_desc": "Choose the nearest learning center for interactive in-person classes, or choose our Private Home Visit option where our tutors come directly to your home.",
        "loc_c2_name": "Private Classes (Home Visit)",
        "loc_c2_tag": "Tutor Visits Home",
        "loc_c2_box_title": "Learn from the Comfort of Home",
        "loc_c2_box_sub": "1-on-1 or small group. Personalized curriculum & flexible schedule tailored to your family.",
        "loc_c2_addr": "Coverage Area: Gianyar, Ubud, Denpasar & surrounding areas",
        "loc_c2_cta": "Book Private Class",
        "loc_directions": "Directions",
        "loc_calc_title": "Find Nearest Campus",
        "loc_calc_desc": "Enter your neighborhood or district to discover which campus is closest to your home.",
        "loc_btn_check": "Check Location",
        "loc_est_label": "Estimated Travel Time",
        "loc_calc_nearest_label": "Nearest campus:",
        "faq_badge": "Questions &amp; Answers",
        "faq_title": "Frequently Asked Questions",
        "faq_desc": "Transparent answers about class schedules, hardware, age requirements, and free trial sessions.",
        "faq_q1": "Can a child with zero prior coding experience join?",
        "faq_a1": "Absolutely! Over 80% of our new students start from scratch. We introduce structured computational thinking through intuitive visual blocks before advancing to real typed syntax.",
        "faq_q2": "Is a free trial class available?",
        "faq_a2": "Yes, we offer complimentary Free Trial sessions at our Gianyar and Bedulu centers, as well as consultation/trial options for Private Home Visit classes. Book a slot using the form below or chat directly with our team.",
        "faq_q3": "Does my child need to bring their own laptop?",
        "faq_a3": "Our labs are fully equipped with dedicated PCs and robotic hardware ready for each student. However, students who prefer to bring their own laptop so projects stay on their machine are welcome.",
        "faq_q4": "What is the tutor-to-student ratio per class?",
        "faq_a4": "We maintain small interactive classes of 4 to 6 students per tutor, ensuring personalized guidance and immediate support during hands-on projects.",
        "reg_badge": "Registration Form",
        "reg_title": "Start Your Child's Tech Journey",
        "reg_desc": "Fill in the brief form below to schedule a class consultation or book a free trial. Confirmation will be sent directly via WhatsApp.",
        "reg_form_header": "Student &amp; Parent Registration Details",
        "reg_required_notice": "Required",
        "reg_lbl_center": "Choose Campus or Learning Mode",
        "reg_campus_count": "2 Campuses + Private Home Visit",
        "reg_choice_private_title": "Private / Home Visit",
        "reg_choice_private_desc": "Learn at your own home (Gianyar &amp; Ubud)",
        "reg_choose_center": "Choose Campus or Learning Mode",
        "reg_choose_center_sub": "Click to select your child's learning center or private option",
        "reg_select_default": "-- Choose Campus or Learning Mode --",
        "reg_lbl_promo": "Promo Code / Voucher (Optional)",
        "reg_promo_sub": "Auto-filled when claiming promo voucher",
        "reg_promo_applied": "Promo Applied",
        "reg_lbl_name": "Full Student Name",
        "reg_lbl_nickname": "Nickname",
        "reg_lbl_age": "Child's Age",
        "reg_lbl_school": "School Name",
        "reg_lbl_parent": "Parent / Guardian Name",
        "reg_lbl_email": "Parent's Email",
        "reg_lbl_address": "Home Address",
        "reg_lbl_wa_parent": "Parent's WhatsApp",
        "reg_lbl_wa_child": "Child's WhatsApp (Optional)",
        "reg_security_note": "Your information is secure and exclusively used for class scheduling confirmation by official LesKoding mentors.",
        "reg_btn_submit": "Send via WhatsApp",
        "promo_badge": "Limited 2026 Promo",
        "promo_sub": "Free Trial + Registration Discount",
        "promo_title": "Launch Your Digital<br><span class=\"text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-yellow-500\">Creator Journey!</span>",
        "promo_body": "Claim a complimentary trial session and registration discount across all LesKoding Learning Centers now:",
        "promo_cta": "Enroll Now &amp; Claim Promo",
        "promo_trigger": "2026 Promo",
        "modal_xp_label": "XP Achievement",
        "modal_duration_label": "Estimated Duration",
        "modal_topics_label": "Syllabus Learning Topics:",
        "modal_btn_enroll": "Enroll / Consultation Schedule",
        "modal_btn_close": "Close",
        "footer_tagline": "Future Programming &amp; Robotics Academy in Bali. Guiding children to transform curiosity into real technology.",
        "footer_col_prog": "Learning Programs",
        "footer_f1": "Foundation Level: Basic Computing &amp; Beginner",
        "footer_f2": "Advanced Level: Intermediate &amp; Innovator",
        "footer_f3": "Specialist: Roblox (3D &amp; Lua)",
        "footer_f4": "Specialist: Robotics &amp; IoT Engineering",
        "footer_f5": "Specialist: Web &amp; App Programming",
        "footer_f6": "Free Trial Class Schedule &rarr;",
        "footer_col_center": "Learning Centers",
        "footer_c_check": "Check Map &amp; Nearest Route &rarr;",
        "footer_col_contact": "Contact &amp; Inquiries",
        "footer_form_btn": "Online Registration Form",
        "footer_rights": "&copy; 2026 LesKoding Bali. All rights reserved. Education Technology &amp; Community.",
        "footer_back_top": "Back to Top",
        "footer_nav_method": "How We Teach",
        "footer_nav_privacy": "Privacy Policy",
        "reward_title": "SYSTEM UNLOCKED",
        "reward_desc": "Target [1000 Points] Reached!",
        "reward_btn": "Claim Reward"
},
    id: {

        /* --- cara belajar opsi 3 --- */
        "cb3_title": "Hingga 120 menit yang <span class=\"text-transparent bg-clip-text bg-gradient-to-r from-[#FFC83D] via-[#38BDF8] to-[#C084FC]\">penuh karya.</span>",
        "cb3_desc": "Setiap sesi maksimal 120 menit: 15 menit konsep, 90 menit praktik, dan 15 menit review. Geser waktunya dan lihat apa yang terjadi di layar anak.",
        "cb3_minute": "menit",
        "cb3_seg2": "02 Praktik eksploratif · 90'",
        "cb3_goal_mark": "Capaian",
        "cb3_play": "Putar otomatis",
        "cb3_pause": "Jeda",
        "cb3_replay": "Putar ulang",
        "cb3_range_label": "Menit sesi",
        "cb3_note": "Maksimal 120 menit per sesi. Tampilan layar adalah ilustrasi.",
        "cb3_s1": "Materi Konsep",
        "cb3_s2": "Praktik Eksploratif",
        "cb3_s3": "Review &amp; Feedback",
        "cb3_s4": "Pencapaian &amp; Progres",
        "cb3_code": "BLOK KODE",
        "cb3_b1": "ketika 🏁 diklik",
        "cb3_b2": "ulangi terus",
        "cb3_b3": "jika tekan ➡ → gerak 10",
        "cb3_b4": "jika tekan ⬆ → lompat",
        "cb3_b5": "jika sentuh ⭐ → skor +1",
        "cb3_b6": "jika skor = 5 → menang 🎉",
        "cb3_quiz_tag": "KUIS · 1/3",
        "cb3_quiz_q": "Loop itu mirip apa?",
        "cb3_q_a": "🚪 Pintu",
        "cb3_q_b": "🔁 Lagu diulang ✓",
        "cb3_q_c": "📦 Kotak",
        "cb3_q_d": "🌧️ Hujan",
        "cb3_score": "SKOR",
        "cb3_xp_saved": "💾 tersimpan ke portofolio",
        "cb3_report_sent": "Laporan sesi terkirim ke orang tua",
        "cb3_st1_t": "Kuis konsep",
        "cb3_st1_d": "Tutor membuka sesi dengan analogi visual dan kuis singkat tentang konsep hari ini.",
        "cb3_st2_t": "Mulai menyusun",
        "cb3_st2_d": "Anak membuka software dan mulai menyusun proyeknya sendiri.",
        "cb3_st3_t": "Tutor berkeliling",
        "cb3_st3_d": "Selama praktik, tutor memberi petunjuk, bukan jawaban jadi.",
        "cb3_tip1": "Bagus! Coba tambahkan cara karakternya melompat.",
        "cb3_st4_t": "Ketemu bug!",
        "cb3_st4_d": "Karakter tidak mau melompat. Anak diajak menelusuri sendiri penyebabnya.",
        "cb3_st5_t": "Bug diperbaiki",
        "cb3_st5_d": "Trial &amp; error yang sehat melatih problem solving dan kegigihan.",
        "cb3_st6_t": "Ide baru",
        "cb3_st6_d": "Tutor mengapresiasi ide orisinal anak saat praktik berlangsung.",
        "cb3_tip2": "Idemu menambah bintang itu keren!",
        "cb3_st7_t": "Game hampir jadi",
        "cb3_st7_d": "Anak menguji game buatannya dan merapikan detail terakhir.",
        "cb3_st8_t": "Review &amp; presentasi",
        "cb3_st8_d": "15 menit terakhir: anak mempresentasikan karyanya, tutor memberi feedback personal dan tips (maks. 5 anak per tutor).",
        "cb3_tip3": "Coba ceritakan cara kerja game-mu ke teman-teman!",
        "cb3_st9_t": "Capaian tercatat",
        "cb3_st9_d": "XP bertambah, karya tersimpan di portofolio, dan laporan sesi terbit untuk orang tua.",

        /* --- redesign 2026-10 --- */
        "nav2_grp_prog": "Program &amp; Teknologi",
        "nav2_grp_method": "Metode &amp; Progres",
        "nav2_location": "Lokasi",
        "nav2_location_full": "Lokasi Belajar",
        "nav2_faq": "FAQ",
        "nav2_cta": "Coba Kelas Gratis",
        "nav2_cta_short": "Daftar",
        "nav2_p_found": "Fondasi Coding",
        "nav2_p_skill": "Skill Digital",
        "nav2_p_teens": "Spesialisasi Remaja",
        "nav2_yrs": "thn",
        "nav2_prog_komputer": "Komputer Dasar",
        "nav2_prog_desain": "Desain Grafis",
        "nav2_prog_robotik": "Robotika &amp; IoT",
        "nav2_feat_tag": "Bingung pilih?",
        "nav2_feat_title": "Coba 1 sesi gratis, tutor bantu tentukan level.",
        "nav2_feat_cta": "Coba Gratis",
        "nav2_tech": "Alur Tools &amp; Teknologi",
        "nav2_works": "Galeri Karya Siswa",
        "nav2_all": "Lihat semua program →",
        "nav2_program": "Program Belajar",
        "nav2_m1_t": "Manfaat Belajar",
        "nav2_m1_d": "Logika, kreativitas &amp; problem solving",
        "nav2_m2_t": "Cara Belajar",
        "nav2_m2_d": "4 fase interaktif yang menyenangkan",
        "nav2_m3_t": "Laporan Progres Wali",
        "nav2_m3_d": "Evaluasi transparan setiap sesi",
        "nav2_rpt_tag": "Contoh laporan sesi",
        "nav2_rpt_r1": "Pemahaman Konsep",
        "nav2_rpt_r2": "Kreativitas",
        "nav2_rpt_r3": "Keaktifan",
        "nav2_rpt_cta": "Lihat laporan lengkap →",
        "nav2_alur": "Alur Mudah: Mulai dari Mana?",
        "nav2_trial_link": "Coba kelas gratis →",
        "nav2_g1": "Program &amp; Karya",
        "nav2_g2": "Metode &amp; Progres",
        "nav2_g3": "Informasi Kampus",
        "hero7_title_1": "Hari ini dia <span class=\"text-slate-400\">main</span> game.",
        "hero7_title_2": "Besok dia yang bikin.",
        "hero7_desc": "Waktu layar yang sama, hasil yang berbeda. Di LesKoding, anak 6–17 tahun belajar mengubah game, animasi, dan aplikasi favoritnya menjadi <b class=\"text-white\">karya buatan sendiri</b>, didampingi tutor setiap sesi.",
        "hero7_mode_watch": "Mode: Penonton",
        "hero7_mode_make": "Mode: Pencipta ✨",
        "hero7_sub_watch": "Geser saklarnya, lihat bedanya →",
        "hero7_sub_make": "Logika, kreativitas, dan karya sendiri",
        "hero7_switch_label": "Ubah mode penonton menjadi pencipta",
        "hero7_cta": "Coba Kelas Gratis",
        "hero7_cta2": "Lihat Kurikulum",
        "hero7_assure": "1 sesi gratis · tanpa komitmen · bisa mulai dari nol",
        "hero7_watch_status": "Waktu layar terus berjalan…",
        "hero7_watch_tag": "menonton",
        "hero7_blocks": "BLOK KODE",
        "hero7_b1": "ketika 🏁 diklik",
        "hero7_b2": "ulangi terus",
        "hero7_b3": "jika tombol ➡ ditekan",
        "hero7_b4": "gerak 10 langkah",
        "hero7_b5": "jika menyentuh ⭐",
        "hero7_b6": "ubah skor +1",
        "hero7_score": "SKOR 3",
        "hero7_make_status": "Game buatan sendiri, aturan sendiri",
        "hero7_make_tag": "mencipta",
        "hero7_tools": "Tools standar industri",
        "partners_tag": "Partner Kami",
        "partners_title": "Berkolaborasi dengan",
        "rpt3_title_1": "Bukan sekadar nilai.",
        "rpt3_title_2": "Penjelasan yang bisa ditindaklanjuti.",
        "rpt3_generic_label": "Rapor pada umumnya",
        "rpt3_paper_head": "LAPORAN HASIL BELAJAR",
        "rpt3_paper_course": "Kursus Komputer",
        "rpt3_paper_name": "Nama",
        "rpt3_paper_subject": "Materi",
        "rpt3_paper_grade": "Nilai",
        "rpt3_paper_remarks": "Keterangan",
        "rpt3_paper_remark_val": "\"Baik, tingkatkan lagi.\"",
        "rpt3_q1": "B+ untuk apa?",
        "rpt3_q2": "Tingkatkan yang mana?",
        "rpt3_q3": "Saya bisa bantu apa?",
        "rpt3_th_content": "Isi laporan",
        "rpt3_th_typical": "Biasa",
        "rpt3_row1": "Kehadiran per sesi",
        "rpt3_row2": "Nama tutor &amp; verifikasi",
        "rpt3_row3": "Nilai + penjelasan per keterampilan",
        "rpt3_row4": "Kekuatan anak",
        "rpt3_row5": "Hal yang sedang dilatih",
        "rpt3_row6": "Rekomendasi sesi berikutnya",
        "rpt3_row7": "Ide latihan di rumah",
        "rpt3_hint": "Arahkan kursor (atau ketuk) baris tabel untuk melihat bagiannya di laporan.",
        "rpt3_ours_label": "Laporan sesi LesKoding · Student Space",
        "reg5_card_heading": "Buat kartu penjelajah <span class=\"text-transparent bg-clip-text bg-gradient-to-r from-[#FFC83D] via-[#38BDF8] to-[#C084FC]\">pertamanya.</span>",
        "reg5_card_title": "KARTU PENJELAJAH",
        "reg5_ph_nick": "Nama Panggilan",
        "reg5_ph_name": "Nama lengkap",
        "reg5_ph_age": "Usia",
        "reg5_ph_school": "Sekolah",
        "reg5_ph_program": "Pilih program",
        "reg5_required": "wajib",
        "reg_lbl_program": "Program Belajar yang Dipilih",
        "reg_program_sub": "Pilih program atau konsultasi gratis",
        "reg_program_default": "-- Pilih Program Belajar --",
        "reg_prog_opt_innovator": "Innovator (6–8 Thn) — Coding Visual &amp; Logika Awal",
        "reg_prog_opt_beginner": "Beginner (8–11 Thn) — Scratch &amp; Game Kreatif",
        "reg_prog_opt_intermediate": "Intermediate (10–14 Thn) — Logika Lanjut &amp; AI Dasar",
        "reg_prog_opt_komputer": "Komputer Dasar (8–14 Thn) — Word, Excel, PPT &amp; Ketik",
        "reg_prog_opt_desain": "Desain Grafis (9–14 Thn) — Canva, Figma &amp; UI Kreator",
        "reg_prog_opt_game_dev": "Game Developer (11–17 Thn) — Roblox, Construct &amp; Game Lab",
        "reg_prog_opt_web_dev": "Junior Web Dev (11–17 Thn) — HTML, CSS, JavaScript",
        "reg_prog_opt_robotics": "Robotika &amp; IoT (11–17 Thn) — Arduino &amp; Sensor Pintar",
        "reg_prog_opt_apps": "Apps Developer (11–17 Thn) — App Inventor &amp; Flutter Mobile",
        "reg_prog_opt_consult": "Belum Yakin — Ingin Konsultasi / Tes Minat Terlebih Dahulu",

        "funnel_tag": "Panduan Keputusan Orang Tua",
        "funnel_title": "Alur Mudah: Saya Harus Mulai dari Mana?",
        "step1_title": "Kenali Manfaat",
        "step2_title": "Pilih Level Anak",
        "step3_title": "Lihat Karya Project",
        "step4_title": "Coba Kelas Gratis",
        "step5_title": "Mulai Berkarya",


        "benefit_badge": "INVESTASI MASA DEPAN ANAK",
        "benefit_title_1": "Bukan hanya belajar coding.",
        "benefit_title_2": "Anak belajar <span class=\"text-[#38BDF8]\">berpikir</span>, <span class=\"text-[#34D399]\">mencoba</span>, &amp; <span class=\"text-[#FFC83D]\">berkarya</span>.",
        "b_tab_logic": "Berpikir Logis",
        "b_tab_creative": "Kreatif",
        "b_tab_problem": "Problem Solving",
        "b_tab_present": "Presentasi",
        "b_tab_portfolio": "Portofolio",
        "b1_tag": "LOGIKA TERSTRUKTUR",
        "b1_title": "Berpikir Logis & Terstruktur",
        "b1_desc": "Anak dilatih memecah masalah besar menjadi langkah-langkah kecil yang teratur dan sistematis (computational thinking). Kemampuan ini dapat membantu di pelajaran matematika dan sains di sekolah.",
        "b1_prob_title": "MASALAH: \"Buat robot pulang ke rumah\"",
        "b1_prob_1": "1. maju 3 langkah",
        "b1_prob_2": "2. jika ada tembok → belok kanan",
        "b1_prob_3": "3. ulangi sampai ketemu 🏠",
        "b1_prob_note": "Masalah besar → langkah kecil yang urut",
        "b2_tag": "KREATOR AKTIF",
        "b2_title": "Kreatif Membuat Project",
        "b2_desc": "Kebiasaan screen-time pasif berubah menjadi waktu berkarya. Anak mendesain karakter, jalan cerita, dan aturan permainannya sendiri dari imajinasi mereka.",
        "b2_demo_title": "DESAIN GAME · ide Komang",
        "b2_demo_char": "Karakter:",
        "b2_demo_char_v": "naga kecil penjaga pulau",
        "b2_demo_miss": "Misi:",
        "b2_demo_miss_v": "kumpulkan 10 permata",
        "b2_demo_rule": "Aturan:",
        "b2_demo_rule_v": "kena ombak = mulai lagi",
        "b3_tag": "GROWTH MINDSET",
        "b3_title": "Problem Solving & Tangguh",
        "b3_desc": "Anak tidak takut salah saat menghadapi error (debugging). Mereka belajar menganalisis penyebab masalah, mencoba solusi lain dengan tenang, dan tidak mudah menyerah.",
        "b3_demo_err": "Error: karakter jatuh menembus lantai",
        "b3_demo_chk1": "Cek: apakah lantai punya collider?",
        "b3_demo_chk2": "Coba: aktifkan \"Anchored\"",
        "b3_demo_chk3": "Berhasil! Dicari sendiri 💪",
        "b4_tag": "SHOW & TELL",
        "b4_title": "Percaya Diri Presentasi",
        "b4_desc": "Di akhir setiap proyek, siswa mempresentasikan karyanya di depan tutor dan teman sekelas. Ini membangun keberanian public speaking dan kemampuan menyampaikan ide sejak dini.",
        "b4_demo_title": "SHOWCASE · akhir proyek",
        "b4_demo_quote": "\"Ini game buatanku!\"",
        "b4_demo_note": "Menjelaskan ide, cara main & tantangan yang dihadapi",
        "b5_tag": "PORTOFOLIO NYATA",
        "b5_title": "Portofolio Digital & Sertifikat",
        "b5_desc": "Setiap karya (game, website, aplikasi) tersimpan rapi, dan anak mendapat sertifikat setelah menyelesaikan course. Bukti nyata kompetensi untuk sekolah maupun jenjang berikutnya.",
        "b5_demo_title": "PORTOFOLIO SISWA",
        "b5_demo_item1": "Game Tangkap Bintang",
        "b5_demo_item2": "Website Profil",
        "b5_demo_item3": "Aplikasi Kuis",
        "b5_demo_item4": "Sertifikat",
        "b5_demo_item4_sub": "course selesai",

        "nav_program": "Program",
        "nav_method": "Cara Belajar",
        "nav_works": "Karya",
        "nav_progress": "Progres",
        "nav_location": "Lokasi",
        "nav_faq": "FAQ",
        "nav_cta": "Minta Info",
        "nav_cta_short": "Daftar",
        "nav_mobile_lang_label": "Pilih Bahasa:",
        "hero_badge": "Playful Future Lab — Coding &amp; Robotic Bali",
        "hero_title_1": "Ubah rasa penasaran jadi",
        "hero_title_2": "karya digital.",
        "hero_desc_main": "Anak belajar langkah demi langkah, mencoba tantangan seru, dan melihat progres belajarnya setiap sesi bersama tutor berpengalaman.",
        "hero_btn_info": "Minta Info / Jadwal Kelas",
        "hero_btn_works": "Lihat Karya Siswa",
        "hero_trust_1_title": "Kurikulum Bertahap",
        "hero_trust_1_sub": "Pemula hingga Mahir",
        "hero_trust_2_title": "Laporan Wali Murid",
        "hero_trust_2_sub": "Pantau Progres Belajar",
        "hero_trust_3_title": "2 Kampus + Private",
        "hero_trust_3_sub": "Gianyar, Bedulu &amp; Home Visit",
        "hero_vis_badge": "Sesi Nyata Siswa",
        "hero_vis_tag": "Pameran Proyek",
        "hero_vis_title": "Robotika &amp; Mini Game Interaktif",
        "hero_vis_feedback_title": "Feedback Tutor Setiap Sesi",
        "hero_vis_feedback_sub": "Catatan perkembangan langsung ke wali",
        "hero_vis_active": "Aktif",
        "course_title": "Program Belajar & Kurikulum",
        "course_desc": "Dirancang bertahap untuk anak usia 6–16 tahun. Kurikulum berbasis proyek nyata, kuis interaktif, dan pendampingan tutor berpengalaman.",
        "course_tab_all": "Semua Program (10)",
        "course_tab_ladder": "Jenjang Bertahap (6)",
        "course_tab_specialist": "Peminatan Spesialis (4)",
        "course_ladder_tag": "Alur Pembelajaran Berkelanjutan",
        "course_ladder_title": "Tahapan Jenjang Siswa (Level 0 s/d Level 5)",
        "course_ladder_badge": "Evaluasi capaian &amp; sertifikat kelulusan setiap kenaikan level",
        "course_lvl0_tag": "LEVEL 0",
        "course_lvl0_name": "Komputer Dasar",
        "course_lvl0_age": "Usia 6–8 Thn",
        "course_lvl1_tag": "LEVEL 1",
        "course_lvl1_name": "Beginner 1",
        "course_lvl1_age": "Usia 7–9 Thn",
        "course_lvl2_tag": "LEVEL 2",
        "course_lvl2_name": "Beginner 2",
        "course_lvl2_age": "Usia 8–10 Thn",
        "course_lvl3_tag": "LEVEL 3",
        "course_lvl3_name": "Intermediate 1",
        "course_lvl3_age": "Usia 9–12 Thn",
        "course_lvl4_tag": "LEVEL 4",
        "course_lvl4_name": "Intermediate 2",
        "course_lvl4_age": "Usia 10–14 Thn",
        "course_lvl5_tag": "LEVEL 5",
        "course_lvl5_name": "Innovator",
        "course_lvl5_age": "Usia 11–16 Thn",
        "course_btn_syllabus": "Lihat Silabus &amp; Detail",
        "c1_lvl": "Level 0 · Fondasi",
        "c1_age": "Usia 6–8 Thn",
        "c1_title": "Komputer Dasar",
        "c1_desc": "Pengenalan perangkat keras komputer, ketangkasan mouse &amp; keyboard, navigasi software yang aman, serta logika digital awal.",
        "c1_b1": "Pengenalan hardware &amp; sistem operasi",
        "c1_b2": "Ketangkasan mengetik &amp; navigasi mouse",
        "c1_b3": "Keamanan berinternet &amp; etika digital",
        "c1_b4": "Eksplorasi aplikasi kreatif &amp; logika awal",
        "c1_dur": "4–6 Minggu",
        "c2_lvl": "Level 1 · Visual Logic",
        "c2_age": "Usia 7–9 Thn",
        "c2_title": "Beginner 1",
        "c2_desc": "Membangun fondasi computational thinking melalui visual block coding (Scratch). Mengubah imajinasi menjadi animasi interaktif pertama.",
        "c2_b1": "Logika algoritma &amp; urutan perintah (sequencing)",
        "c2_b2": "Workspace Scratch &amp; event triggers",
        "c2_b3": "Animasi gerak karakter, kostum &amp; audio",
        "c2_b4": "Proyek: Storytelling interaktif &amp; mini game",
        "c2_dur": "6–8 Minggu",
        "c3_lvl": "Level 2 · Game Logic",
        "c3_age": "Usia 8–10 Thn",
        "c3_title": "Beginner 2",
        "c3_desc": "Memperdalam logika percabangan, koordinat 2D, perulangan, dan sistem variabel untuk menciptakan game arcade interaktif.",
        "c3_b1": "Koordinat X &amp; Y dan deteksi tabrakan",
        "c3_b2": "Perulangan lanjutan (loops &amp; nested loops)",
        "c3_b3": "Percabangan kondisional (if-else logic)",
        "c3_b4": "Proyek: Game arcade tangkap objek &amp; skor",
        "c3_dur": "6–8 Minggu",
        "c4_lvl": "Level 3 · Platformer",
        "c4_age": "Usia 9–12 Thn",
        "c4_title": "Intermediate 1",
        "c4_desc": "Mekanika game multi-level kompleks, kloning sprite dinamis, algoritma matematika game, serta fisika gravitasi platformer.",
        "c4_b1": "Kloning sprite dinamis &amp; manajemen memori",
        "c4_b2": "Fisika lompatan, inersia &amp; gravitasi",
        "c4_b3": "Variabel global/lokal &amp; struktur data list",
        "c4_b4": "Proyek: Game platformer multi-level tantangan",
        "c4_dur": "8 Minggu",
        "c5_lvl": "Level 4 · Pre-Syntax",
        "c5_age": "Usia 10–14 Thn",
        "c5_title": "Intermediate 2",
        "c5_desc": "Transisi dari blok visual ke struktur pemrograman teks. Memahami abstraksi fungsi (custom blocks) dan debugging terstruktur.",
        "c5_b1": "Fungsi mandiri (custom blocks with parameters)",
        "c5_b2": "Algoritma pencarian &amp; pengurutan data",
        "c5_b3": "Pengenalan sintaks teks &amp; pseudocode",
        "c5_b4": "Proyek: Game boss battle dengan strategi AI",
        "c5_dur": "8 Minggu",
        "c6_lvl": "Level 5 · Capstone",
        "c6_age": "Usia 11–16 Thn",
        "c6_title": "Innovator",
        "c6_desc": "Puncak kurikulum bertahap. Siswa mendesain proyek mandiri berskala besar (Capstone Project), problem solving nyata, dan pameran portofolio.",
        "c6_b1": "Desain ideasi, wireframe &amp; arsitektur sistem",
        "c6_b2": "Penerapan advanced computational thinking",
        "c6_b3": "Quality testing, peer review &amp; bug fixing",
        "c6_b4": "Proyek: Capstone showcase &amp; pameran portofolio",
        "c6_dur": "8–10 Minggu",
        "c7_lvl": "Peminatan · 3D Game",
        "c7_age": "Usia 10–16 Thn",
        "c7_title": "Roblox",
        "c7_desc": "Membangun dunia 3D multiplayer di Roblox Studio dan memprogram interaksi permainan menggunakan bahasa pemrograman teks Lua.",
        "c7_b1": "Navigasi Roblox Studio &amp; desain terrain 3D",
        "c7_b2": "Sintaks Lua: Variabel, function &amp; events",
        "c7_b3": "Mekanika interaktif, leaderboard &amp; HUD game",
        "c7_b4": "Proyek: Game Obby / multiplayer rilis ke Roblox",
        "c7_dur": "8–10 Minggu",
        "c8_lvl": "Peminatan · Hardware",
        "c8_age": "Usia 8–15 Thn",
        "c8_title": "Robotika",
        "c8_desc": "Merakit sirkuit elektronika breadboard, menghubungkan aneka sensor fisik, dan memprogram mikrokontroler (Arduino/ESP32).",
        "c8_b1": "Rangkaian elektronika dasar &amp; breadboard",
        "c8_b2": "Pemrograman Arduino C++ &amp; mikrokontroler",
        "c8_b3": "Integrasi sensor ultrasonik, cahaya &amp; motor",
        "c8_b4": "Proyek: Robot line follower &amp; sistem smart IoT",
        "c8_dur": "8–10 Minggu",
        "c9_lvl": "Peminatan · Modern Web",
        "c9_age": "Usia 11–16 Thn",
        "c9_title": "Web Programming",
        "c9_desc": "Mempelajari pembuatan website modern responsif mulai dari struktur semantik HTML5, tata letak CSS3, hingga interaktivitas JavaScript.",
        "c9_b1": "Struktur HTML5 semantik &amp; web accessibility",
        "c9_b2": "Styling responsif CSS3, Flexbox &amp; Grid",
        "c9_b3": "Interaktivitas JavaScript modern &amp; DOM event",
        "c9_b4": "Proyek: Portofolio responsif &amp; deploy cloud",
        "c9_dur": "8–10 Minggu",
        "c10_lvl": "Peminatan · Mobile App",
        "c10_age": "Usia 11–16 Thn",
        "c10_title": "App Programming",
        "c10_desc": "Merancang antarmuka mobile apps (UI/UX), menyusun alur multi-screen, memanfaatkan sensor smartphone, dan menguji aplikasi di ponsel.",
        "c10_b1": "Prinsip desain antarmuka mobile intuitif (UI/UX)",
        "c10_b2": "Event-driven programming &amp; multi-screen logic",
        "c10_b3": "Pemanfaatan sensor smartphone &amp; local storage",
        "c10_b4": "Proyek: Aplikasi utilitas diuji langsung di ponsel",
        "c10_dur": "8–10 Minggu",
        "method_badge": "Metodologi Belajar",
        "method_title": "Cara Belajar di LesKoding",
        "method_desc": "Kami memandu anak melalui 4 tahapan belajar yang terbukti efektif: bukan sekadar teori hafalan, melainkan proses langsung berkreasi dan melihat hasil nyata.",
        "method_s1_step": "Langkah 01",
        "method_s1_dur": "15 Menit",
        "method_s1_title": "Materi Konsep",
        "method_s1_desc": "Konsep koding dan robotika disajikan melalui analogi visual sederhana dan kuis interaktif yang mudah dipahami anak tanpa rasa jenuh.",
        "method_s1_note": "Visual block &amp; kuis seru",
        "method_s2_step": "Langkah 02",
        "method_s2_dur": "50 Menit",
        "method_s2_title": "Praktik Eksploratif",
        "method_s2_desc": "Anak langsung merakit game, menyusun baris logika kode, atau merangkai sensor robot. Fokus pada trial &amp; error yang menumbuhkan pemecahan masalah.",
        "method_s2_note": "Hands-on langsung di kelas",
        "method_s3_step": "Langkah 03",
        "method_s3_dur": "Setiap Sesi",
        "method_s3_title": "Feedback Tutor",
        "method_s3_desc": "Tutor membimbing secara personal, mengulas logika kode, memberikan tips penyempurnaan, serta apresiasi atas ide unik yang dikembangkan siswa.",
        "method_s3_note": "Rasio tutor 1:4 anak",
        "method_s4_step": "Langkah 04",
        "method_s4_dur": "Tercatat Nyata",
        "method_s4_title": "Pencapaian &amp; Progres",
        "method_s4_desc": "Setiap pencapaian tercatat dalam sistem: poin XP bertambah, proyek masuk portofolio, dan laporan capaian diteruskan langsung ke orang tua.",
        "method_s4_note": "Portofolio &amp; sertifikat level",
        "hof_title": "Kisah Sukses dari <span class=\"foil\">Penjelajah Kami!</span>",
        "hof_desc2": "4 kategori penghargaan · klik amplop untuk membuka",
        "hof_btn_open": "Buka semua amplop",
        "hof_btn_nominate": "Jadikan anak Anda nominasi berikutnya",
        "hof_desc": "Di sinilah karya luar biasa dari siswa kami ditampilkan! Setiap proyek adalah petualangan yang menceritakan perjalanan kreativitas dan dedikasi. Terinspirasi oleh pencapaian mereka? Bergabunglah dan biarkan petualangan Anda dimulai!",
        "hof_masterpiece_heading": "Pajangan Proyek Pilihan",
        "hof_badge_masterpiece": "Masterpiece Terbaik",
        "hof_curator_pick": "Pilihan Kurator",
        "hof_sarah_age": "(12 Tahun)",
        "hof_sarah_role": "Lead Roblox Creator",
        "hof_masterpiece_desc": "Sebuah dunia Roleplay 3D masif yang dibangun dalam Roblox Studio — arsitektur cyberpunk, sistem mata uang virtual, dan NPC interaktif tingkat lanjut.",
        "btn_view_project": "Lihat Proyek",
        "hof_gallery_heading": "Galeri Eksibisi",
        "hof_top_creations": "Karya Teratas",
        "hof_c1_badge": "Terfavorit",
        "hof_c1_title": "Sistem AI Kasir Pintar",
        "hof_c1_author": "Budi (14 Tahun)",
        "hof_web_dev_tag": "· Web Dev",
        "hof_c1_desc": "Aplikasi kasir berbasis web menggunakan logika JavaScript kompleks untuk kalkulasi inventaris dan struk real-time.",
        "hof_c2_badge": "Teknologi Masa Depan",
        "hof_c2_title": "Robot Pemilah Sampah",
        "hof_c2_author": "Kevin (10 Tahun)",
        "hof_robotics_tag": "· Robotika",
        "hof_c2_desc": "Proyek Arduino dengan sensor ultrasonik dan motor servo yang secara otomatis membuka tutup tempat sampah.",
        "hof_c3_badge": "Desain Terbaik",
        "hof_c3_title": "Portofolio Animasi Web",
        "hof_c3_author": "Nadia (15 Tahun)",
        "hof_c3_desc": "Website portofolio pribadi yang penuh dengan animasi CSS 3D dan transisi scroll mulus tanpa framework eksternal.",
        "hof_btn_load_more": "Muat Lebih Banyak Karya",
        "parent_badge": "Laporan belajar yang bisa dipahami wali",
        "parent_title": "Tahu apa yang anak pelajari—dan langkah berikutnya.",
        "parent_desc": "Setelah laporan sesi diterbitkan, wali dapat melihat kehadiran, keterampilan yang dinilai tutor, kekuatan anak, hal yang sedang dilatih, dan rekomendasi untuk sesi berikutnya. Progres juga bisa dipantau dari waktu ke waktu.",
        "parent_p1_title": "Pemahaman Konsep &amp; Problem Solving",
        "parent_p1_desc": "Mengukur tingkat pemahaman konsep siswa berdasarkan kemampuan dalam menyelesaikan masalah dan tantangan.",
        "parent_p2_title": "Kreativitas &amp; Inovasi",
        "parent_p2_desc": "Mengukur apakah siswa dapat mengembangkan dan memodifikasi projek dari contoh yang diberikan.",
        "parent_p3_title": "Keaktifan &amp; Antusiasme",
        "parent_p3_desc": "Mengukur tingkat motivasi, rasa ingin tahu, dan keaktifan siswa saat proses belajar berlangsung.",
        "parent_sync": "Sinkronisasi otomatis dengan aplikasi Student Space",
        "report_course_title": "Game Programming (Roblox &amp; Lua)",
        "report_session": "Sesi #4",
        "report_present": "Hadir",
        "report_tutor_role": "Tutor Utama",
        "report_tutor_name": "Danu (Fasilitator)",
        "report_verified": "Sesi Terverifikasi",
        "report_superhero_label": "Karakter Superhero",
        "report_superhero_name": "Iron Man (Sang Inovator)",
        "report_superhero_quote": "\"Tekun memecahkan masalah logika rintangan dan berani mencoba solusi teknologi baru secara mandiri.\"",
        "report_rubric_header": "Evaluasi Keterampilan (Rubrik Aktif)",
        "report_r1_name": "Pemahaman Konsep &amp; Problem Solving",
        "report_r1_desc": "Mengukur tingkat pemahaman konsep siswa berdasarkan kemampuan menyelesaikan masalah dan tantangan arena secara terstruktur.",
        "report_r2_name": "Kreativitas &amp; Inovasi",
        "report_r2_desc": "Mengukur kemampuan siswa mengembangkan dan memodifikasi projek di luar contoh dasar yang diberikan dengan fitur unik.",
        "report_r3_name": "Keaktifan &amp; Antusiasme",
        "report_r3_desc": "Mengukur tingkat motivasi, rasa ingin tahu yang tinggi, dan keaktifan berdiskusi selama sesi belajar berlangsung.",
        "report_eval_header": "Evaluasi Tutor",
        "report_strengths_label": "Kekuatan",
        "report_strengths_desc": "Mampu menjelaskan idenya dengan percaya diri dan mencoba menyelesaikan tantangan secara mandiri sebelum bertanya.",
        "report_improvements_label": "Sedang Dilatih",
        "report_improvements_desc": "Lebih teliti saat memeriksa baris kode yang menyebabkan error syntax pada script game.",
        "report_recommendation_label": "Rekomendasi Tutor",
        "report_recommendation_desc": "\"Pada sesi berikutnya, coba uji solusi dengan beberapa contoh input berbeda untuk memastikan tidak ada celah error.\"",
        "report_parent_tips_label": "Ide Latihan di Rumah",
        "report_parent_tips_desc": "Minta anak menceritakan langkah yang ia coba dan alasan mengapa memilih langkah tersebut untuk melatih computational thinking.",
        "loc_badge": "Kampus &amp; Laboratorium",
        "loc_title": "Lokasi Belajar di Bali",
        "loc_desc": "Pilih Learning Center terdekat untuk kelas tatap muka interaktif, atau pilih layanan Private di mana tutor kami datang langsung mendampingi anak belajar di rumah sendiri.",
        "loc_c2_name": "Kelas Private (Home Visit)",
        "loc_c2_tag": "Tutor ke Rumah",
        "loc_c2_box_title": "Belajar di Rumah Sendiri",
        "loc_c2_box_sub": "1-on-1 atau grup kecil. Tutor membawa kurikulum &amp; pendampingan langsung ke rumah Anda.",
        "loc_c2_addr": "Jangkauan Area: Gianyar, Ubud, Denpasar &amp; sekitarnya",
        "loc_c2_cta": "Daftar Private",
        "loc_directions": "Rute",
        "loc_calc_title": "Cek Kampus Terdekat",
        "loc_calc_desc": "Masukkan area atau kecamatan Anda untuk melihat cabang mana yang paling mudah diakses.",
        "loc_btn_check": "Cek Lokasi",
        "loc_est_label": "Estimasi Perjalanan",
        "loc_calc_nearest_label": "Kampus terdekat:",
        "faq_badge": "Tanya Jawab",
        "faq_title": "Pertanyaan yang Sering Diajukan",
        "faq_desc": "Jawaban transparan seputar jadwal belajar, perangkat, usia minimal, dan sistem kelas percobaan.",
        "faq_q1": "Apakah anak yang belum pernah memegang coding bisa ikut?",
        "faq_a1": "Tentu bisa! 80% siswa baru kami memulai dari nol. Kami mengajarkan logika berpikir terstruktur (computational thinking) melalui blok visual interaktif terlebih dahulu sebelum beralih ke sintaks kode teks asli.",
        "faq_q2": "Apakah tersedia kelas percobaan (trial class)?",
        "faq_a2": "Ya, kami menyediakan sesi Free Trial di Learning Center Gianyar dan Bedulu, serta opsi kelas Private di rumah sendiri (Home Visit). Anda dapat mendaftarkan jadwal percobaan melalui form di bawah atau via WhatsApp admin kami.",
        "faq_q3": "Apakah siswa harus membawa laptop sendiri?",
        "faq_a3": "Setiap lab Learning Center kami sudah dilengkapi dengan PC/Laptop dan perangkat robotik siap pakai. Namun, siswa yang ingin membawa laptop pribadi agar proyek tersimpan langsung di perangkatnya sangat dipersilakan.",
        "faq_q4": "Berapa rasio tutor per siswa di setiap kelas?",
        "faq_a4": "Kami menjaga kualitas pembelajaran dengan kelas kecil: maksimal 4–6 anak per tutor agar setiap anak mendapat pendampingan intensif dan tidak ada yang tertinggal dalam proses praktek.",
        "reg_badge": "Formulir Pendaftaran",
        "reg_title": "Mulai Petualangan Belajar",
        "reg_desc": "Isi data singkat berikut untuk konsultasi jadwal kelas reguler atau klaim kelas percobaan gratis (trial). Konfirmasi akan otomatis diteruskan ke WhatsApp admin cabang.",
        "reg_form_header": "Data Calon Siswa &amp; Wali Murid",
        "reg_required_notice": "Wajib diisi",
        "reg_lbl_center": "Pilihan Lokasi / Metode Belajar",
        "reg_campus_count": "2 Kampus + Layanan Private",
        "reg_choice_private_title": "Private / Home Visit",
        "reg_choice_private_desc": "Belajar di rumah sendiri (Gianyar &amp; Ubud)",
        "reg_choose_center": "Pilih Lokasi / Metode Belajar",
        "reg_choose_center_sub": "Klik untuk memilih cabang belajar atau opsi private",
        "reg_select_default": "-- Pilih Lokasi / Metode Belajar --",
        "reg_lbl_promo": "Kode / Nama Promo (Opsional)",
        "reg_promo_sub": "Otomatis terisi jika klaim voucher promo",
        "reg_promo_applied": "Promo Terpasang",
        "reg_lbl_name": "Nama Lengkap Siswa",
        "reg_lbl_nickname": "Nama Panggilan",
        "reg_lbl_age": "Usia Anak",
        "reg_lbl_school": "Asal Sekolah",
        "reg_lbl_parent": "Nama Orang Tua / Wali",
        "reg_lbl_email": "Email Orang Tua",
        "reg_lbl_address": "Alamat Domisili",
        "reg_lbl_wa_parent": "WhatsApp Orang Tua",
        "reg_lbl_wa_child": "WhatsApp Anak (Opsional)",
        "reg_security_note": "Data Anda aman dan hanya digunakan untuk konfirmasi jadwal kelas oleh admin resmi LesKoding.",
        "reg_btn_submit": "Kirim via WhatsApp",
        "promo_badge": "Promo Terbatas 2026",
        "promo_sub": "Free Trial + Diskon Pendaftaran",
        "promo_title": "Mulai Petualangan<br><span class=\"text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-yellow-500\">Kreator Digital!</span>",
        "promo_body": "Klaim sesi uji coba gratis dan potongan biaya pendaftaran di seluruh Learning Center LesKoding sekarang:",
        "promo_cta": "Daftar Sekarang &amp; Klaim Promo",
        "promo_trigger": "Promo 2026",
        "modal_xp_label": "Pencapaian XP",
        "modal_duration_label": "Estimasi Durasi",
        "modal_topics_label": "Topik Silabus Pembelajaran:",
        "modal_btn_enroll": "Daftar / Konsultasi Jadwal",
        "modal_btn_close": "Tutup",
        "footer_tagline": "Akademi Pemrograman &amp; Robotika Masa Depan di Bali. Membimbing anak mengubah rasa penasaran menjadi karya teknologi nyata.",
        "footer_col_prog": "Program Belajar",
        "footer_f1": "Jenjang Dasar: Komputer Dasar &amp; Beginner",
        "footer_f2": "Jenjang Lanjutan: Intermediate &amp; Innovator",
        "footer_f3": "Peminatan: Roblox (3D &amp; Lua)",
        "footer_f4": "Peminatan: Robotika &amp; IoT Engineering",
        "footer_f5": "Peminatan: Web &amp; App Programming",
        "footer_f6": "Jadwal Kelas Percobaan (Trial) &rarr;",
        "footer_col_center": "Learning Center",
        "footer_c_check": "Cek Peta &amp; Rute Terdekat &rarr;",
        "footer_col_contact": "Kontak &amp; Konsultasi",
        "footer_form_btn": "Formulir Pendaftaran Online",
        "footer_rights": "&copy; 2026 LesKoding Bali. Hak cipta dilindungi. Education Technology &amp; Community.",
        "footer_back_top": "Kembali ke Atas",
        "footer_nav_method": "Cara Belajar",
        "footer_nav_privacy": "Kebijakan &amp; Privasi",
        "reward_title": "SYSTEM UNLOCKED",
        "reward_desc": "Target [1000 Poin] Tercapai!",
        "reward_btn": "Klaim Hadiah"
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
    if (regAge) regAge.placeholder = lang === 'en' ? 'e.g. 10 yrs' : 'Cth: 10 Thn';

    const regSchool = document.getElementById('reg-sekolah');
    if (regSchool) regSchool.placeholder = lang === 'en' ? 'e.g. SD Sutha Dharma' : 'Cth: SD Sutha Dharma';

    const regParent = document.getElementById('reg-ortu');
    if (regParent) regParent.placeholder = lang === 'en' ? 'e.g. Arik Ayu Rastini' : 'Cth: Arik Ayu Rastini';

    const regEmail = document.getElementById('reg-email');
    if (regEmail) regEmail.placeholder = lang === 'en' ? 'e.g. parent@gmail.com' : 'Cth: ayuarik071@gmail.com';

    const regAddress = document.getElementById('reg-alamat');
    if (regAddress) regAddress.placeholder = lang === 'en' ? 'e.g. Br Katiklantang Singakerta Ubud' : 'Cth: Br Katiklantang Singakerta Ubud';

    const regPromo = document.getElementById('reg-promo');
    if (regPromo) regPromo.placeholder = lang === 'en' ? 'e.g. PETUALANGAN2026' : 'Cth: PETUALANGAN2026';


    // Update document title and html lang attribute
    document.documentElement.lang = lang;
    document.title = lang === 'en' 
        ? "LesKoding Bali — Future Tech Academy | Coding & Robotics for Kids"
        : "LesKoding Bali — Akademi Koding & Robotika Anak Modern di Bali";
};

// Initialize Language on Page Load (DEFAULT: 'en')
document.addEventListener('DOMContentLoaded', () => {
    // Ensure dark theme is active
    document.documentElement.classList.remove('light-mode');
    localStorage.removeItem('leskoding_theme');

    // Initialize Language (DEFAULT: 'en')
    const savedLang = localStorage.getItem('leskoding_lang') || 'en';
    applyLanguage(savedLang);
/* ------------------------------------------------------------------ DATA */
const T = 'assets/tech/';
const tracks = [
  { id:'k1', group:'kids', age:'6–14', color:'#FFC83D', icon:'fa-gamepad', art:'game',
    interest:'Suka main game', title:'Bikin Game & Animasi', tag:'Jalur populer anak',
    before:'Main game buatan orang lain berjam-jam', after:'Bikin game & kartun dengan karakter dan cerita sendiri',
    idea:'Anak suka main game? Yuk ajak buat game sendiri dengan karakter, labirin, dan jalan cerita buatan mereka.',
    skill:'Logika & pemecahan masalah',
    tools:[['Scratch','scratch.png'],['PictoBlox AI','pictoblox.png'],['CodeMonkey','codemonkey.png']],
    outputs:[['Game 2D buatan sendiri','Dimainkan bersama teman & keluarga'],['Kartun dongeng interaktif','Dengan rekaman suara anak sendiri']],
    course:'beginner' },
  { id:'k2', group:'kids', age:'8–14', color:'#10B981', icon:'fa-desktop', art:'doc',
    interest:'Sering mengerjakan tugas di laptop', title:'Pintar Komputer & Tugas Sekolah', tag:'Kebutuhan sekolah',
    before:'Masih minta tolong orang tua untuk mengetik tugas', after:'Mengetik 10 jari, bikin makalah & slide presentasi sendiri',
    idea:'Anak mandiri memakai komputer: mengetik tugas tanpa bantuan terus-menerus dan siap presentasi di kelas.',
    skill:'Mengetik 10 jari & literasi digital',
    tools:[['Word','ms_word.png'],['Excel','ms_excel.webp'],['PowerPoint','ms_powerpoint.webp']],
    outputs:[['Makalah & laporan rapi','Margin, tabel, dan daftar isi otomatis'],['Slide presentasi keren','Percaya diri presentasi di kelas']],
    course:'komputer-dasar' },
  { id:'k3', group:'kids', age:'9–14', color:'#EC4899', icon:'fa-palette', art:'poster',
    interest:'Suka menggambar & mewarnai', title:'Desain & Gambar Digital', tag:'Kreatif visual',
    before:'Coretan gambar di buku tulis', after:'Poster & desain tampilan aplikasi yang siap dicetak',
    idea:'Anak punya rasa seni? Salurkan ke media digital untuk membuat karya visual yang estetik dan membanggakan.',
    skill:'Komposisi warna & tipografi',
    tools:[['Canva','canva.png'],['Figma','figma.png']],
    outputs:[['Poster edukasi','Siap dicetak dan dipajang di kamar'],['Desain tampilan aplikasi','Mockup layar buatan anak sendiri']],
    course:'design-grafis' },
  { id:'t1', group:'teens', age:'11–17', color:'#0788F5', icon:'fa-cube', art:'world',
    interest:'Hobi main Roblox / game 3D', title:'Game Developer 3D', tag:'Spesialisasi game',
    before:'Main Roblox setiap hari', after:'Menerbitkan game Roblox sendiri yang dimainkan teman online',
    idea:'Dari sekadar bermain, remaja diarahkan merancang dunia 3D dan aturan permainannya sendiri.',
    skill:'Logika game, world building & scripting Lua',
    tools:[['Roblox Studio','roblox_studio.png'],['Construct 3','construct.svg'],['Unity','unity.svg']],
    outputs:[['Game 3D siap main di Roblox','Link bisa dibagikan ke teman'],['Game HTML5 di browser','Dibuka di HP tanpa install']],
    course:'advance-1' },
  { id:'t2', group:'teens', age:'11–17', color:'#8B5CF6', icon:'fa-code', art:'web',
    interest:'Ingin punya website sendiri', title:'Junior Web Developer', tag:'Spesialisasi web',
    before:'Hanya scroll website orang lain', after:'Punya website portofolio pribadi yang live di internet',
    idea:'Website profil pribadi untuk memamerkan hobi, sertifikat, dan karya buatan sendiri.',
    skill:'HTML, CSS & JavaScript asli',
    tools:[['HTML5','html.webp'],['CSS3','css.webp'],['JavaScript','js.svg']],
    outputs:[['Website portofolio online','Live dan bisa dibuka di HP siapa saja'],['Tampilan responsif','Rapi di HP, tablet & laptop']],
    course:'advance-2' },
  { id:'t3', group:'teens', age:'11–17', color:'#14B8A6', icon:'fa-microchip', art:'circuit',
    interest:'Suka membongkar alat elektronik', title:'Robotika & IoT', tag:'Spesialisasi robotik',
    before:'Penasaran kenapa lampu bisa menyala sendiri', after:'Merakit alat otomatis dengan sensor yang terhubung ke HP',
    idea:'Bagaimana lampu bisa menyala sendiri saat orang masuk kamar? Remaja merangkai alat otomatis dengan sensor nyata.',
    skill:'Elektronika dasar & otomasi',
    tools:[['Arduino','arduino.webp'],['PictoBlox IoT','pictoblox.png']],
    outputs:[['Prototipe alat otomatis','Lampu sensor gerak atau alarm'],['Alat terkoneksi HP (IoT)','Pantau data sensor dari smartphone']],
    course:'advance-3' },
  { id:'t4', group:'teens', age:'11–17', color:'#F3261D', icon:'fa-mobile-screen', art:'phone',
    interest:'Tidak pernah lepas dari HP', title:'Apps Developer', tag:'Spesialisasi aplikasi',
    before:'Hanya memakai aplikasi buatan orang lain', after:'Aplikasi Android buatan sendiri terpasang di HP keluarga',
    idea:'Punya ide aplikasi jadwal belajar, kalkulator uang saku, atau kuis seru? Remaja merancangnya jadi aplikasi ponsel.',
    skill:'Desain UI & logika aplikasi mobile',
    tools:[['App Inventor','mit_app_inventor.png'],['Flutter','flutter.webp']],
    outputs:[['Aplikasi terpasang di HP','File .apk yang berjalan mulus'],['Karya siap pamer','Ditunjukkan ke keluarga & teman']],
    course:'advance-4' },
];

/* --------------------------------------------- ARTIFACT MOCKS (pure CSS) */
function art(type, c, size='md') {
  const h = size === 'lg' ? 'h-64 sm:h-72' : size === 'sm' ? 'h-36' : 'h-44';
  const wrap = (inner, bg='#0F172A') => `<div class="relative ${h} w-full rounded-2xl overflow-hidden border border-white/10" style="background:${bg}">${inner}</div>`;
  switch (type) {
    case 'game': return wrap(`
      <div class="absolute inset-0" style="background:linear-gradient(#1e3a8a,#0F172A)"></div>
      <div class="absolute top-3 left-3 font-mono text-[10px] text-white/80">SCORE 0420</div>
      <div class="absolute top-3 right-3 flex gap-1">${'<i class="fa-solid fa-heart text-[10px] text-[#F3261D]"></i>'.repeat(3)}</div>
      <div class="absolute bottom-0 left-0 right-0 h-6" style="background:repeating-linear-gradient(90deg,#16a34a 0 16px,#15803d 16px 32px)"></div>
      <div class="absolute bottom-14 left-[22%] w-16 h-3 rounded bg-[#a16207]"></div>
      <div class="absolute bottom-24 left-[52%] w-20 h-3 rounded bg-[#a16207]"></div>
      <div class="absolute bottom-[7.5rem] left-[58%] w-3 h-3 rounded-full blink" style="background:${c}"></div>
      <div class="absolute bottom-[4.5rem] left-[30%] w-3 h-3 rounded-full blink" style="background:${c}"></div>
      <div class="absolute bottom-6 left-[12%] text-3xl bob">🐱</div>`);
    case 'doc': return wrap(`
      <div class="absolute left-[8%] top-5 w-[46%] h-[78%] bg-white rounded-lg shadow-xl p-3 rotate-[-4deg]">
        <div class="h-2 w-2/3 rounded bg-slate-800 mb-2"></div>
        ${'<div class="h-1.5 rounded bg-slate-300 mb-1.5"></div>'.repeat(5)}
        <div class="h-1.5 w-1/2 rounded bg-slate-300"></div>
      </div>
      <div class="absolute right-[8%] top-8 w-[44%] h-[46%] rounded-lg shadow-xl p-2 rotate-[3deg] flex items-end gap-1.5" style="background:#ecfdf5">
        ${[40,70,55,90,65].map(v=>`<div class="flex-1 rounded-t" style="height:${v}%;background:${c}"></div>`).join('')}
      </div>
      <div class="absolute right-[12%] bottom-4 w-[40%] h-[30%] rounded-lg shadow-xl rotate-[-2deg] p-2" style="background:#fb923c">
        <div class="h-2 w-1/2 rounded bg-white/90 mb-1.5"></div><div class="h-1.5 w-3/4 rounded bg-white/60"></div>
      </div>`, '#0b2a22');
    case 'poster': return wrap(`
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[46%] h-[86%] rounded-lg shadow-2xl overflow-hidden rotate-[-3deg]" style="background:linear-gradient(160deg,${c},#8B5CF6)">
        <div class="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-[#FFC83D]"></div>
        <div class="absolute bottom-10 left-3 font-display font-black text-white text-xl leading-none">SAVE<br>OUR<br>OCEAN</div>
        <div class="absolute bottom-3 left-3 h-1.5 w-1/2 rounded bg-white/70"></div>
      </div>
      <div class="absolute right-[8%] bottom-5 w-12 h-12 rounded-full border-4 border-white/20"></div>
      <div class="absolute left-[9%] top-6 flex flex-col gap-1">${['#FFC83D',c,'#8B5CF6','#0788F5'].map(x=>`<span class="w-5 h-5 rounded-full border-2 border-white/30" style="background:${x}"></span>`).join('')}</div>`, '#2a0f1f');
    case 'world': return wrap(`
      <div class="absolute inset-0" style="background:linear-gradient(#38bdf8,#1e3a8a)"></div>
      <div class="absolute inset-x-0 bottom-0 h-1/2" style="perspective:300px"><div class="absolute inset-0 origin-bottom" style="transform:rotateX(55deg);background:repeating-linear-gradient(90deg,rgba(255,255,255,.12) 0 1px,transparent 1px 28px),repeating-linear-gradient(0deg,rgba(255,255,255,.12) 0 1px,transparent 1px 28px),#166534"></div></div>
      ${[[18,52,'#F3261D'],[38,42,'#FFC83D'],[58,34,'#8B5CF6'],[76,26,'#10B981']].map(([l,b,col])=>`<div class="absolute w-12 h-5 rounded-sm shadow-lg" style="left:${l}%;bottom:${b}%;background:${col};box-shadow:0 6px 0 rgba(0,0,0,.35)"></div>`).join('')}
      <div class="absolute bottom-[50%] left-[20%] w-4 h-7 rounded-sm bg-[#FFC83D] bob border-2 border-black/30"></div>
      <div class="absolute top-3 left-3 px-2 py-1 rounded bg-black/40 font-mono text-[10px]">🏁 OBBY · 12 players</div>`);
    case 'web': return wrap(`
      <div class="absolute inset-3 rounded-xl bg-white overflow-hidden shadow-2xl">
        <div class="h-6 bg-slate-100 flex items-center gap-1 px-2"><span class="w-2 h-2 rounded-full bg-red-400"></span><span class="w-2 h-2 rounded-full bg-amber-400"></span><span class="w-2 h-2 rounded-full bg-green-400"></span><span class="ml-2 flex-1 h-3 rounded bg-white text-[8px] text-slate-400 font-mono px-1 leading-3">nadia.dev</span></div>
        <div class="p-3 flex gap-3 items-center">
          <div class="w-10 h-10 rounded-full shrink-0" style="background:${c}"></div>
          <div class="flex-1"><div class="h-2.5 w-2/3 rounded bg-slate-800 mb-1.5"></div><div class="h-1.5 w-1/2 rounded bg-slate-300"></div></div>
        </div>
        <div class="px-3 grid grid-cols-3 gap-2">${[c,'#FFC83D','#0788F5'].map(x=>`<div class="h-14 rounded-lg" style="background:${x}22;border:1px solid ${x}55"></div>`).join('')}</div>
      </div>`, '#1b1433');
    case 'circuit': return wrap(`
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[62%] h-[62%] rounded-lg shadow-2xl" style="background:#0e7490;border:2px solid #155e75">
        <div class="absolute top-2 left-2 right-2 flex gap-[3px]">${'<span class="flex-1 h-2 bg-black/60 rounded-[1px]"></span>'.repeat(12)}</div>
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-8 bg-black/80 rounded-sm font-mono text-[8px] text-white/70 flex items-center justify-center">ATmega</div>
        <div class="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-[#FFC83D] blink shadow-[0_0_12px_#FFC83D]"></div>
        <div class="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-[#F3261D] shadow-[0_0_10px_#F3261D]"></div>
      </div>
      <svg class="absolute inset-0 w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none"><path d="M0 20 H40 V40" stroke="${c}" stroke-width="1.2" fill="none" stroke-dasharray="3 3"/><path d="M200 80 H160 V60" stroke="${c}" stroke-width="1.2" fill="none" stroke-dasharray="3 3"/></svg>
      <div class="absolute top-3 right-3 px-2 py-1 rounded bg-black/40 font-mono text-[10px]">📡 23.4°C · Wi-Fi</div>`, '#062a2a');
    case 'phone': return wrap(`
      <div class="absolute left-1/2 top-3 -translate-x-1/2 w-[34%] min-w-[110px] h-[120%] rounded-[1.4rem] bg-black p-1.5 shadow-2xl">
        <div class="w-full h-full rounded-[1.1rem] bg-white overflow-hidden">
          <div class="h-14 p-2.5" style="background:${c}"><div class="h-1.5 w-1/3 rounded bg-white/70 mb-1.5"></div><div class="h-2.5 w-2/3 rounded bg-white"></div></div>
          <div class="p-2 space-y-1.5">${['Matematika','Bahasa','IPA'].map((s,i)=>`<div class="flex items-center gap-1.5 p-1.5 rounded-md bg-slate-100"><span class="w-3 h-3 rounded ${i===0?'':'border border-slate-300'}" style="${i===0?`background:${c}`:''}"></span><span class="text-[8px] text-slate-600 font-semibold">${s}</span></div>`).join('')}</div>
        </div>
      </div>`, '#2a0d0d');
  }
}

const toolChip = ([n, img], dark=true) => `
  <span class="tool-chip inline-flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full ${dark?'bg-white/5 border border-white/10':'bg-white text-slate-800'}">
    <span class="w-6 h-6 rounded-full bg-white p-0.5 flex items-center justify-center"><img src="${T+img}" alt="${n}" class="w-full h-full object-contain"></span>
    <span class="text-[11px] font-semibold">${n}</span>
  </span>`;

const filterBtns = (wrapId, onChange) => {
  const wrap = document.getElementById(wrapId);
  wrap.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    wrap.querySelectorAll('button').forEach(x => x.className = 'px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300');
    b.className = 'px-3.5 py-1.5 rounded-full bg-white text-[#0B0F19]';
    onChange(b.dataset.age);
  }));
};

/* ------------------------------------------------------------- OPSI A */
let aAge = 'all', aSel = 'k1';
function renderA() {
  const list = tracks.filter(t => aAge === 'all' || t.group === aAge);
  if (!list.find(t => t.id === aSel)) aSel = list[0].id;
  document.getElementById('a-list').innerHTML = list.map((t, i) => `
    <button role="tab" aria-selected="${t.id===aSel}" data-id="${t.id}" style="--c:${t.color}"
      class="interest-btn w-full text-left flex items-center gap-3.5 p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/5 transition-all">
      <span class="dot w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-sm transition-colors"><i class="fa-solid ${t.icon}"></i></span>
      <span class="flex-1">
        <span class="block font-bold text-sm sm:text-base">${t.interest}</span>
        <span class="block text-[11px] text-slate-400">${t.group==='kids'?'Anak':'Remaja'} · ${t.age} thn</span>
      </span>
      <i class="fa-solid fa-arrow-right text-xs text-slate-500"></i>
    </button>`).join('');
  document.querySelectorAll('#a-list .interest-btn').forEach(b => b.onclick = () => { aSel = b.dataset.id; renderA(); });

  const t = tracks.find(x => x.id === aSel);
  document.getElementById('a-stage').innerHTML = `
    <div class="fade rounded-[2rem] border border-white/10 bg-[#111827] p-5 sm:p-7 shadow-2xl relative overflow-hidden">
      <div class="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[100px] opacity-30" style="background:${t.color}"></div>
      <div class="relative">
        <div class="flex items-center justify-between mb-4">
          <span class="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md" style="color:${t.color};background:${t.color}1a;border:1px solid ${t.color}40">${t.tag}</span>
          <span class="text-xs text-slate-400">Usia ${t.age} thn</span>
        </div>
        <h3 class="font-display text-2xl sm:text-3xl font-extrabold mb-5">${t.title}</h3>
        ${art(t.art, t.color, 'lg')}

        <!-- 3-step ribbon -->
        <div class="grid sm:grid-cols-3 gap-3 mt-5">
          <div class="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
            <div class="text-[10px] font-mono font-bold text-slate-400 mb-2">01 · RASA PENASARAN</div>
            <p class="text-xs text-slate-300 leading-relaxed">${t.idea}</p>
          </div>
          <div class="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
            <div class="text-[10px] font-mono font-bold text-slate-400 mb-2">02 · BELAJAR PAKAI</div>
            <div class="flex flex-wrap gap-1.5">${t.tools.map(x=>toolChip(x)).join('')}</div>
            <p class="text-[11px] text-slate-400 mt-2.5"><i class="fa-solid fa-bolt mr-1" style="color:${t.color}"></i>${t.skill}</p>
          </div>
          <div class="rounded-2xl p-4 border" style="background:${t.color}12;border-color:${t.color}40">
            <div class="text-[10px] font-mono font-bold mb-2" style="color:${t.color}">03 · DIBAWA PULANG</div>
            <ul class="space-y-2">${t.outputs.map(([a,b])=>`<li><strong class="block text-xs">${a}</strong><span class="text-[11px] text-slate-400">${b}</span></li>`).join('')}</ul>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-2.5 mt-5">
          <a href="#" class="flex-1 text-center bg-[#FFC83D] hover:bg-[#fed368] text-[#111827] font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider">Lihat detail program →</a>
          <a href="#" class="text-center px-5 py-3 rounded-xl border border-white/15 text-xs font-bold hover:bg-white/5"><i class="fa-solid fa-certificate text-[#FFC83D] mr-1"></i>Dapat sertifikat kelulusan</a>
        </div>
      </div>
    </div>`;
}
filterBtns('a-age', v => { aAge = v; renderA(); });
renderA();

});

/* ========================================================
   15. REDESIGN 2026-10: HERO SAKLAR, MEGA MENU, LAPORAN WALI, KARTU PENJELAJAH
   Semua dibungkus IIFE agar tidak bentrok dengan const global di script inline.
   ======================================================== */
(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const currentLang = () => localStorage.getItem('leskoding_lang') || 'en';
    const t = (key, fallback = '') => {
        const dict = i18nDictionary[currentLang()] || i18nDictionary.en;
        return dict[key] !== undefined ? dict[key] : fallback;
    };

    // Beri tahu komponen dinamis saat bahasa berganti
    const baseApplyLanguage = window.applyLanguage;
    window.applyLanguage = function (lang) {
        baseApplyLanguage(lang);
        document.dispatchEvent(new CustomEvent('leskoding:lang', { detail: lang }));
    };

    /* ---------- Hero: saklar Penonton → Pencipta ---------- */
    const heroRoot = document.getElementById('hero-root');
    const heroSwitch = document.getElementById('hero-switch');
    if (heroRoot && heroSwitch) {
        const title = document.getElementById('hero-mode-title');
        const sub = document.getElementById('hero-mode-sub');
        let on = false, timer = null, touched = false;
        const renderLabels = () => {
            title.textContent = on ? t('hero7_mode_make', 'Mode: Pencipta ✨') : t('hero7_mode_watch', 'Mode: Penonton');
            sub.textContent = on ? t('hero7_sub_make', 'Logika, kreativitas, dan karya sendiri') : t('hero7_sub_watch', 'Geser saklarnya, lihat bedanya →');
            heroSwitch.setAttribute('aria-label', t('hero7_switch_label', 'Ubah mode penonton menjadi pencipta'));
        };
        const set = v => {
            on = v;
            heroSwitch.setAttribute('aria-checked', String(v));
            heroRoot.classList.toggle('creator', v);
            heroRoot.classList.toggle('watcher', !v);
            renderLabels();
        };
        heroSwitch.addEventListener('click', () => { touched = true; clearInterval(timer); set(!on); });
        // Demo otomatis sampai pengunjung menyentuh saklar
        new IntersectionObserver(entries => {
            clearInterval(timer);
            if (entries[0].isIntersecting && !touched && !reduceMotion) timer = setInterval(() => set(!on), 3500);
        }, { threshold: 0.35 }).observe(heroRoot);
        document.addEventListener('leskoding:lang', renderLabels);
        set(false);
    }

    /* ---------- Hero: marquee tools standar industri ---------- */
    const toolsTrack = document.getElementById('hero-tools');
    if (toolsTrack) {
        const TOOLS = [['scratch.png', 'Scratch'], ['roblox_studio.png', 'Roblox Studio'], ['arduino.webp', 'Arduino'], ['mit_app_inventor.png', 'App Inventor'], ['figma.png', 'Figma'], ['unity.svg', 'Unity'], ['pictoblox.png', 'PictoBlox'], ['js.svg', 'JavaScript'], ['canva.png', 'Canva'], ['flutter.webp', 'Flutter']];
        const row = TOOLS.map(([file, name]) => `<span class="inline-flex items-center gap-2.5 shrink-0 opacity-70 hover:opacity-100 transition"><img src="assets/tech/${file}" alt="" loading="lazy" class="w-7 h-7 object-contain rounded bg-white/90 p-0.5"><span class="text-sm font-semibold text-slate-300 whitespace-nowrap">${name}</span></span>`).join('');
        toolsTrack.innerHTML = row + row; // diduplikasi agar loop mulus
        toolsTrack.lastElementChild && [...toolsTrack.children].slice(TOOLS.length).forEach(el => el.setAttribute('aria-hidden', 'true'));
    }

    /* ---------- Navbar: mega menu (desktop) ---------- */
    const header = document.getElementById('main-header');
    if (header) {
        const triggers = [...header.querySelectorAll('[data-mega]')];
        const panels = [...header.querySelectorAll('[data-panel]')];
        let closeTimer;
        const openMega = key => {
            clearTimeout(closeTimer);
            panels.forEach(p => p.classList.toggle('open', p.dataset.panel === key));
            triggers.forEach(b => b.setAttribute('aria-expanded', String(b.dataset.mega === key)));
        };
        const closeSoon = () => { closeTimer = setTimeout(() => openMega(null), 180); };
        triggers.forEach(b => {
            b.addEventListener('mouseenter', () => openMega(b.dataset.mega));
            b.addEventListener('mouseleave', closeSoon);
            b.addEventListener('click', () => openMega(b.getAttribute('aria-expanded') === 'true' ? null : b.dataset.mega));
        });
        panels.forEach(p => {
            p.addEventListener('mouseenter', () => clearTimeout(closeTimer));
            p.addEventListener('mouseleave', closeSoon);
            p.addEventListener('click', e => {
                const course = e.target.closest('[data-course]');
                const pillar = e.target.closest('[data-pillar]');
                if (course && typeof window.focusCourse === 'function') {
                    e.preventDefault();
                    window.focusCourse(course.dataset.course);
                } else if (pillar) {
                    const tab = document.querySelector(`#x-tabs [data-v="${pillar.dataset.pillar}"]`);
                    if (tab) tab.click();
                    document.getElementById('course')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
                }
                if (course || pillar || e.target.closest('a')) openMega(null);
            });
        });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') openMega(null); });
        document.addEventListener('click', e => { if (!header.contains(e.target)) openMega(null); });
    }

    /* ---------- Navbar: bottom sheet (mobile) ---------- */
    const sheet = document.getElementById('mobile-menu');
    const sheetBtn = document.getElementById('mobile-menu-btn');
    const sheetDim = document.getElementById('mobile-menu-dim');
    if (sheet && sheetBtn && sheetDim) {
        const setSheet = open => {
            sheet.classList.toggle('open', open);
            sheet.setAttribute('aria-hidden', String(!open));
            sheetBtn.setAttribute('aria-expanded', String(open));
            sheetDim.style.opacity = open ? '1' : '0';
            sheetDim.style.pointerEvents = open ? 'auto' : 'none';
            document.body.style.overflow = open ? 'hidden' : '';
        };
        sheetBtn.addEventListener('click', e => { e.stopPropagation(); setSheet(!sheet.classList.contains('open')); });
        sheetDim.addEventListener('click', () => setSheet(false));
        sheet.addEventListener('click', e => {
            const acc = e.target.closest('[data-acc]');
            if (acc) {
                const wrap = acc.parentElement;
                wrap.classList.toggle('open');
                acc.setAttribute('aria-expanded', String(wrap.classList.contains('open')));
            }
            if (e.target.closest('.mobile-nav-link')) setSheet(false);
        });
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheet.classList.contains('open')) setSheet(false); });
    }

    /* ---------- Laporan wali: tabel perbandingan menyorot bagian laporan ---------- */
    const reportSection = document.getElementById('progress-wali');
    const compare = document.getElementById('rpt-compare');
    if (reportSection && compare) {
        // Bagian laporan dipilih lewat data-i18n yang sudah ada; markup kartu tidak diubah
        const pick = (key, fn) => { const el = reportSection.querySelector(`[data-i18n="${key}"]`); return el ? fn(el) : null; };
        const parts = {
            header: pick('report_present', el => el.closest('.pb-5')),
            tutor: pick('report_tutor_name', el => el.closest('.my-4')),
            rubric: pick('report_rubric_header', el => el.parentElement),
            strengths: pick('report_strengths_label', el => el.parentElement),
            improve: pick('report_improvements_label', el => el.parentElement),
            recommend: pick('report_recommendation_label', el => el.parentElement),
            tips: pick('report_parent_tips_label', el => el.parentElement),
        };
        Object.values(parts).forEach(el => el && el.classList.add('rpt-target'));
        let locked = null;
        const highlight = key => {
            Object.entries(parts).forEach(([k, el]) => el && el.classList.toggle('rpt-hl', k === key));
            compare.querySelectorAll('[data-rpt]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.rpt === key)));
        };
        compare.addEventListener('mouseover', e => { const b = e.target.closest('[data-rpt]'); if (b && !locked) highlight(b.dataset.rpt); });
        compare.addEventListener('mouseleave', () => { if (!locked) highlight(null); });
        compare.addEventListener('focusin', e => { const b = e.target.closest('[data-rpt]'); if (b && !locked) highlight(b.dataset.rpt); });
        compare.addEventListener('focusout', () => { if (!locked) highlight(null); });
        compare.addEventListener('click', e => {
            const b = e.target.closest('[data-rpt]'); if (!b) return;
            locked = locked === b.dataset.rpt ? null : b.dataset.rpt;
            highlight(locked || b.dataset.rpt);
            // Di layar kecil laporan ada di bawah tabel: bawa bagiannya ke layar
            if (locked && window.innerWidth < 1024 && parts[locked]) parts[locked].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
            if (!locked) highlight(null);
        });
    }

    /* ---------- Pendaftaran: kartu pilihan lab + kartu penjelajah ---------- */
    const form = document.getElementById('registration-form');
    const centerCards = document.getElementById('reg-center-cards');
    const centerSelect = document.getElementById('reg-center');
    if (form && centerCards && centerSelect) {
        const choices = [...centerCards.querySelectorAll('.reg-choice')];
        const choose = btn => {
            choices.forEach(c => {
                const on = c === btn;
                c.setAttribute('aria-checked', String(on));
                c.tabIndex = on ? 0 : -1;
            });
            centerSelect.value = btn.dataset.center;
            centerSelect.dispatchEvent(new Event('change', { bubbles: true }));
            centerCards.classList.remove('reg-error');
        };
        choices.forEach((c, i) => c.tabIndex = i === 0 ? 0 : -1);
        centerCards.addEventListener('click', e => { const b = e.target.closest('.reg-choice'); if (b) choose(b); });
        // Navigasi panah ala radiogroup
        centerCards.addEventListener('keydown', e => {
            const i = choices.indexOf(document.activeElement);
            if (i < 0) return;
            const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
            if (step) { e.preventDefault(); const n = choices[(i + step + choices.length) % choices.length]; n.focus(); choose(n); }
        });

        const $ = id => document.getElementById(id);
        const REQUIRED = ['reg-center', 'reg-program', 'reg-nama', 'reg-panggilan', 'reg-usia', 'reg-sekolah', 'reg-ortu', 'reg-email', 'reg-alamat', 'reg-wa-ortu'];
        const setVal = (el, value) => {
            if (!el) return;
            el.textContent = value || t(el.dataset.ph, el.dataset.fallback);
            el.classList.toggle('empty', !value);
        };
        const renderCard = () => {
            const nick = $('reg-panggilan').value.trim();
            setVal($('idc-nick'), nick);
            setVal($('idc-name'), $('reg-nama').value.trim());
            setVal($('idc-age'), $('reg-usia').value.trim());
            setVal($('idc-school'), $('reg-sekolah').value.trim());
            const prog = $('reg-program');
            const progText = prog.value ? (prog.options[prog.selectedIndex].textContent || '').split(' — ')[0].trim() : '';
            setVal($('idc-program'), progText);

            const avatar = $('idc-avatar');
            if (nick) avatar.textContent = nick.charAt(0).toUpperCase();
            else avatar.innerHTML = '<i class="fa-solid fa-user-astronaut text-2xl text-white/50"></i>';

            const lab = $('idc-lab');
            const chosen = choices.find(c => c.getAttribute('aria-checked') === 'true');
            lab.textContent = chosen ? chosen.dataset.short : 'LAB?';
            lab.style.background = chosen ? getComputedStyle(chosen).getPropertyValue('--c') : '';
            lab.classList.toggle('opacity-40', !chosen);

            const done = REQUIRED.filter(id => ($(id).value || '').trim()).length;
            $('reg-progress-bar').style.width = `${done / REQUIRED.length * 100}%`;
            $('reg-progress-count').textContent = `${done}/${REQUIRED.length}`;
        };
        form.addEventListener('input', renderCard);
        form.addEventListener('change', renderCard);
        document.addEventListener('leskoding:lang', renderCard);
        renderCard();
    }
})();

/* ========================================================
   16. CARA BELAJAR (opsi 3): GARIS WAKTU SESI 0–120 MENIT
   0–15 konsep · 15–105 praktik · 105–120 review · 120 capaian
   ======================================================== */
(() => {
    const screen = document.getElementById('cb-screen');
    const caption = document.getElementById('cb-caption');
    const range = document.getElementById('cb-range');
    const minEl = document.getElementById('cb-min');
    const playBtn = document.getElementById('cb-play');
    if (!screen || !caption || !range || !minEl || !playBtn) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = key => {
        const dict = i18nDictionary[localStorage.getItem('leskoding_lang') || 'en'] || i18nDictionary.en;
        return dict[key] || i18nDictionary.id[key] || key;
    };
    const PHASES = [
        { key: 'cb3_s1', n: '01', c: '#38BDF8', ic: 'fa-lightbulb' },
        { key: 'cb3_s2', n: '02', c: '#FFC83D', ic: 'fa-laptop-code' },
        { key: 'cb3_s3', n: '03', c: '#C084FC', ic: 'fa-comments' },
        { key: 'cb3_s4', n: '04', c: '#F87171', ic: 'fa-trophy' },
    ];
    // [key label, warna balok, warna teks]
    const BLOCKS = [['cb3_b1', '#E6A817', '#111827'], ['cb3_b2', '#7C3AED'], ['cb3_b3', '#0788F5'], ['cb3_b4', '#0788F5'], ['cb3_b5', '#10B981'], ['cb3_b6', '#F97316']];
    const INDENT = ['', 'ml-2', 'ml-4', 'ml-4', 'ml-4', 'ml-4'];

    const stateAt = m => {
        if (m < 15) return { phase: 0, st: 1 };
        if (m < 35) return { phase: 1, st: 2, blocks: 2 };
        if (m < 45) return { phase: 1, st: 3, blocks: 3, tip: 'cb3_tip1' };
        if (m < 60) return { phase: 1, st: 4, blocks: 4, bug: true };
        if (m < 70) return { phase: 1, st: 5, blocks: 4 };
        if (m < 80) return { phase: 1, st: 6, blocks: 5, tip: 'cb3_tip2' };
        if (m < 105) return { phase: 1, st: 7, blocks: 6, run: true };
        if (m < 118) return { phase: 2, st: 8, blocks: 6, run: true, tip: 'cb3_tip3' };
        return { phase: 3, st: 9, blocks: 6, run: true, done: true };
    };

    const quizHTML = () => `
        <div class="absolute inset-0 flex items-center justify-center p-4 sm:p-6 cb-fade">
            <div class="w-full max-w-md rounded-2xl bg-[#1E293B] border border-[#38BDF8]/40 p-4 sm:p-5">
                <div class="text-[10px] font-mono text-[#38BDF8] font-bold">${t('cb3_quiz_tag')}</div>
                <div class="font-bold mt-1 text-white">${t('cb3_quiz_q')}</div>
                <div class="grid grid-cols-2 gap-2 mt-3 text-xs sm:text-sm text-slate-200">
                    <div class="rounded-lg bg-white/5 px-3 py-2">${t('cb3_q_a')}</div>
                    <div class="rounded-lg bg-[#38BDF8]/20 border border-[#38BDF8] px-3 py-2">${t('cb3_q_b')}</div>
                    <div class="rounded-lg bg-white/5 px-3 py-2">${t('cb3_q_c')}</div>
                    <div class="rounded-lg bg-white/5 px-3 py-2">${t('cb3_q_d')}</div>
                </div>
            </div>
        </div>`;

    const editorHTML = s => `
        <div class="absolute inset-0 grid grid-cols-[1fr_1.1fr]">
            <div class="bg-[#0F172A] p-2.5 sm:p-3 space-y-1.5 overflow-hidden">
                <div class="text-[9px] font-mono text-slate-500 mb-1">${t('cb3_code')}</div>
                ${BLOCKS.slice(0, s.blocks).map(([key, bg, fg], i) => {
                    const isBug = s.bug && i === 3;
                    return `<div class="cb-blk ${INDENT[i]} ${isBug ? 'cb-bug' : ''}" style="background:${isBug ? '#F87171' : bg};color:${fg || '#fff'}">${t(key)}${isBug ? ' ⚠️' : ''}</div>`;
                }).join('')}
            </div>
            <div class="relative" style="background:linear-gradient(#1e3a8a,#38BDF8 70%)">
                <div class="absolute bottom-0 inset-x-0 h-[22%] bg-[#A16207] border-t-[8px] border-[#16A34A]"></div>
                <div class="absolute text-2xl sm:text-3xl ${s.run ? 'cb-run' : ''}" style="bottom:22%;left:12%">🐱</div>
                ${s.blocks >= 5 ? '<div class="absolute text-lg sm:text-xl" style="right:20%;bottom:45%">⭐</div>' : ''}
                ${s.blocks >= 5 ? `<div class="absolute top-2 left-2 font-mono text-[10px] font-bold bg-black/40 text-white px-2 py-0.5 rounded">${t('cb3_score')} ${s.done ? 5 : 2}</div>` : ''}
                ${s.done ? `<div class="absolute inset-0 flex items-center justify-center bg-black/40 cb-fade"><div class="text-center"><div class="font-display font-black text-2xl sm:text-3xl text-[#FFC83D]">+120 XP</div><div class="text-[11px] sm:text-xs mt-1 text-white">${t('cb3_xp_saved')}</div></div></div>` : ''}
            </div>
        </div>
        ${s.tip ? `<div class="absolute left-2 sm:left-3 bottom-2 sm:bottom-3 max-w-[70%] sm:max-w-[60%] flex items-end gap-2 cb-fade">
            <span class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#C084FC] text-[#0B0F19] flex items-center justify-center text-xs sm:text-sm shrink-0"><i class="fa-solid fa-chalkboard-user"></i></span>
            <span class="bg-white text-[#111827] text-[11px] sm:text-xs font-bold rounded-2xl rounded-bl-sm px-3 py-2">${t(s.tip)}</span>
        </div>` : ''}`;

    let lastKey = '';
    const render = (force = false) => {
        const m = +range.value;
        const s = stateAt(m);
        const ph = PHASES[s.phase];
        minEl.textContent = m;
        range.setAttribute('aria-valuetext', `${m} ${t('cb3_minute')} · ${t(`cb3_st${s.st}_t`).replace(/&amp;/g, '&')}`);
        const key = JSON.stringify(s);
        if (!force && key === lastKey) return;
        lastKey = key;
        screen.innerHTML = s.st === 1 ? quizHTML() : editorHTML(s);
        caption.innerHTML = `<div class="cb-fade">
            <div class="inline-flex items-center gap-2 text-[11px] font-mono font-bold px-2.5 py-1 rounded-md" style="color:${ph.c};background:${ph.c}1a;border:1px solid ${ph.c}55"><i class="fa-solid ${ph.ic}"></i>${ph.n} · ${t(ph.key)}</div>
            <h3 class="font-display text-2xl sm:text-3xl font-bold mt-3 text-white">${t(`cb3_st${s.st}_t`)}</h3>
            <p class="text-slate-300 mt-2 leading-relaxed">${t(`cb3_st${s.st}_d`)}</p>
            ${s.done ? `<div class="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300"><i class="fa-solid fa-paper-plane mr-1.5"></i>${t('cb3_report_sent')}</div>` : ''}
        </div>`;
    };

    // Tombol putar otomatis
    let timer = null;
    const setPlayLabel = state => {
        const icon = { play: 'fa-play', pause: 'fa-pause', replay: 'fa-rotate-right' }[state];
        playBtn.dataset.state = state;
        playBtn.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${t('cb3_' + state)}</span>`;
    };
    const stop = state => { clearInterval(timer); timer = null; setPlayLabel(state); };
    playBtn.addEventListener('click', () => {
        if (timer) return stop('play');
        if (+range.value >= 120) range.value = 0;
        setPlayLabel('pause');
        timer = setInterval(() => {
            range.value = +range.value + 1;
            render();
            if (+range.value >= 120) stop('replay');
        }, reduceMotion ? 10 : 110);
    });
    range.addEventListener('input', () => { if (timer) stop('play'); render(); });

    const relabel = () => {
        range.setAttribute('aria-label', t('cb3_range_label'));
        setPlayLabel(playBtn.dataset.state || 'play');
        render(true);
    };
    document.addEventListener('leskoding:lang', relabel);
    relabel();
})();
