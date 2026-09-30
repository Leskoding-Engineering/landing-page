import re

with open("index.html", "r") as f:
    lines = f.readlines()

new_html = """                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 hof-grid">
                    <!-- Gallery Card 1 (3D Flip) -->
                    <div class="hof-card group/flip w-full h-[450px] perspective-1000">
                        <div class="flip-inner relative w-full h-full transition-transform duration-700 preserve-3d">
                            <!-- Front Side -->
                            <div class="absolute inset-0 backface-hidden bg-dark-900/60 backdrop-blur-xl border border-gold-500/30 rounded-3xl overflow-hidden flex flex-col shadow-lg">
                                <div class="relative h-2/3 overflow-hidden">
                                    <div class="absolute inset-0 bg-dark-950/20 z-10 transition-opacity group-hover/flip:opacity-0"></div>
                                    <div class="absolute top-4 left-4 z-20 badge-shine">
                                        <span class="bg-purpleBrand-500/90 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg border border-purpleBrand-300/50"><i class="fa-solid fa-fire mr-1"></i> Terfavorit</span>
                                    </div>
                                    <img src="assets/sessions/01M3RSJWMWDKRWTNA3D0HEP47C.jpg" class="w-full h-full object-cover" alt="Project">
                                </div>
                                <div class="p-6 h-1/3 flex flex-col justify-center items-center text-center">
                                    <h4 class="font-heading font-bold text-white text-xl">Sistem AI Kasir Pintar</h4>
                                    <p class="text-[10px] text-brand-400 mt-2 font-mono uppercase tracking-widest"><i class="fa-solid fa-arrow-rotate-right mr-1"></i> Arahkan Kursor</p>
                                </div>
                            </div>
                            <!-- Back Side -->
                            <div class="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-dark-900 via-dark-900/90 to-purpleBrand-950/40 backdrop-blur-xl border border-gold-400/50 rounded-3xl p-6 md:p-8 flex flex-col shadow-[0_0_40px_rgba(250,204,21,0.2)]">
                                <div class="absolute -top-6 right-6 border-4 border-dark-900 rounded-full shadow-xl z-30">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Budi" class="w-12 h-12 rounded-full " alt="User">
                                </div>
                                <p class="text-[10px] font-bold text-gold-400 uppercase tracking-wider mb-4 mt-2 border-b border-white/10 pb-2">Budi (14 Tahun) <span class="text-slate-400 font-normal">· Web Dev</span></p>
                                <p class="text-sm text-slate-300 mb-4 leading-relaxed flex-grow">Aplikasi kasir berbasis web menggunakan logika JavaScript kompleks untuk kalkulasi inventaris dan struk real-time.</p>
                                <div class="flex flex-wrap gap-2 mb-6">
                                    <span class="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[9px] text-slate-300 font-mono">JS</span>
                                    <span class="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[9px] text-slate-300 font-mono">HTML/CSS</span>
                                </div>
                                <div class="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                                    <button onclick="triggerConfetti()" class="text-[10px] font-bold uppercase tracking-widest text-dark-950 bg-gold-400 hover:bg-gold-300 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                                        Lihat <i class="fa-solid fa-play"></i>
                                    </button>
                                    <button onclick="upvoteProject(this)" class="upvote-btn text-slate-400 hover:text-red-500 transition-colors text-xs flex items-center gap-1.5 font-mono">
                                        <i class="fa-solid fa-heart"></i> <span class="vote-count text-white font-bold">856</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Gallery Card 2 (3D Flip) -->
                    <div class="hof-card group/flip w-full h-[450px] perspective-1000">
                        <div class="flip-inner relative w-full h-full transition-transform duration-700 preserve-3d">
                            <!-- Front Side -->
                            <div class="absolute inset-0 backface-hidden bg-dark-900/60 backdrop-blur-xl border border-gold-500/30 rounded-3xl overflow-hidden flex flex-col shadow-lg">
                                <div class="relative h-2/3 overflow-hidden">
                                    <div class="absolute inset-0 bg-dark-950/20 z-10 transition-opacity group-hover/flip:opacity-0"></div>
                                    <div class="absolute top-4 left-4 z-20 badge-shine">
                                        <span class="bg-brand-500/90 text-dark-950 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg border border-brand-300/50"><i class="fa-solid fa-robot mr-1"></i> Future Tech</span>
                                    </div>
                                    <img src="assets/sessions/01M3JK50X16R206D3HK7Z9A9G0.jpeg" class="w-full h-full object-cover" alt="Project">
                                </div>
                                <div class="p-6 h-1/3 flex flex-col justify-center items-center text-center">
                                    <h4 class="font-heading font-bold text-white text-xl">Robot Pemilah Sampah</h4>
                                    <p class="text-[10px] text-brand-400 mt-2 font-mono uppercase tracking-widest"><i class="fa-solid fa-arrow-rotate-right mr-1"></i> Arahkan Kursor</p>
                                </div>
                            </div>
                            <!-- Back Side -->
                            <div class="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-dark-900 via-dark-900/90 to-brand-950/40 backdrop-blur-xl border border-gold-400/50 rounded-3xl p-6 md:p-8 flex flex-col shadow-[0_0_40px_rgba(250,204,21,0.2)]">
                                <div class="absolute -top-6 right-6 border-4 border-dark-900 rounded-full shadow-xl z-30">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin" class="w-12 h-12 rounded-full " alt="User">
                                </div>
                                <p class="text-[10px] font-bold text-gold-400 uppercase tracking-wider mb-4 mt-2 border-b border-white/10 pb-2">Kevin (10 Tahun) <span class="text-slate-400 font-normal">· Robotics</span></p>
                                <p class="text-sm text-slate-300 mb-4 leading-relaxed flex-grow">Proyek Arduino dengan sensor ultrasonik dan motor servo yang secara otomatis membuka tutup tempat sampah.</p>
                                <div class="flex flex-wrap gap-2 mb-6">
                                    <span class="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[9px] text-slate-300 font-mono">Arduino</span>
                                    <span class="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[9px] text-slate-300 font-mono">C++</span>
                                </div>
                                <div class="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                                    <button onclick="triggerConfetti()" class="text-[10px] font-bold uppercase tracking-widest text-dark-950 bg-gold-400 hover:bg-gold-300 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                                        Lihat <i class="fa-solid fa-play"></i>
                                    </button>
                                    <button onclick="upvoteProject(this)" class="upvote-btn text-slate-400 hover:text-red-500 transition-colors text-xs flex items-center gap-1.5 font-mono">
                                        <i class="fa-solid fa-heart"></i> <span class="vote-count text-white font-bold">642</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Gallery Card 3 (3D Flip) -->
                    <div class="hof-card group/flip w-full h-[450px] perspective-1000">
                        <div class="flip-inner relative w-full h-full transition-transform duration-700 preserve-3d">
                            <!-- Front Side -->
                            <div class="absolute inset-0 backface-hidden bg-dark-900/60 backdrop-blur-xl border border-gold-500/30 rounded-3xl overflow-hidden flex flex-col shadow-lg">
                                <div class="relative h-2/3 overflow-hidden">
                                    <div class="absolute inset-0 bg-dark-950/20 z-10 transition-opacity group-hover/flip:opacity-0"></div>
                                    <div class="absolute top-4 left-4 z-20 badge-shine">
                                        <span class="bg-gold-500/90 text-dark-950 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg border border-gold-300/50"><i class="fa-solid fa-gem mr-1"></i> Desain Terbaik</span>
                                    </div>
                                    <img src="assets/sessions/01M3JK1KMW3XQ7DFP5F7YZ8J0D.jpg" class="w-full h-full object-cover" alt="Project">
                                </div>
                                <div class="p-6 h-1/3 flex flex-col justify-center items-center text-center">
                                    <h4 class="font-heading font-bold text-white text-xl">Portofolio Animasi Web</h4>
                                    <p class="text-[10px] text-brand-400 mt-2 font-mono uppercase tracking-widest"><i class="fa-solid fa-arrow-rotate-right mr-1"></i> Arahkan Kursor</p>
                                </div>
                            </div>
                            <!-- Back Side -->
                            <div class="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-dark-900 via-dark-900/90 to-gold-950/40 backdrop-blur-xl border border-gold-400/50 rounded-3xl p-6 md:p-8 flex flex-col shadow-[0_0_40px_rgba(250,204,21,0.2)]">
                                <div class="absolute -top-6 right-6 border-4 border-dark-900 rounded-full shadow-xl z-30">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Nadia" class="w-12 h-12 rounded-full " alt="User">
                                </div>
                                <p class="text-[10px] font-bold text-gold-400 uppercase tracking-wider mb-4 mt-2 border-b border-white/10 pb-2">Nadia (15 Tahun) <span class="text-slate-400 font-normal">· Web Dev</span></p>
                                <p class="text-sm text-slate-300 mb-4 leading-relaxed flex-grow">Website portofolio pribadi yang penuh dengan animasi CSS 3D dan transisi scroll mulus tanpa framework eksternal.</p>
                                <div class="flex flex-wrap gap-2 mb-6">
                                    <span class="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[9px] text-slate-300 font-mono">TailwindCSS</span>
                                    <span class="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[9px] text-slate-300 font-mono">JavaScript</span>
                                </div>
                                <div class="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                                    <button onclick="triggerConfetti()" class="text-[10px] font-bold uppercase tracking-widest text-dark-950 bg-gold-400 hover:bg-gold-300 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                                        Lihat <i class="fa-solid fa-play"></i>
                                    </button>
                                    <button onclick="upvoteProject(this)" class="upvote-btn text-slate-400 hover:text-red-500 transition-colors text-xs flex items-center gap-1.5 font-mono">
                                        <i class="fa-solid fa-heart"></i> <span class="vote-count text-white font-bold">1100</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>\n"""

# find index of `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`
start_idx = -1
for i, line in enumerate(lines):
    if '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">' in line:
        start_idx = i
        break

# find index of `<!-- Gallery Card 3 -->` and the following closing divs
end_idx = start_idx
open_divs = 0
for i in range(start_idx, len(lines)):
    if '<div' in lines[i]:
        open_divs += lines[i].count('<div')
    if '</div' in lines[i]:
        open_divs -= lines[i].count('</div')
    if open_divs == 0:
        end_idx = i
        break

# Replace
if start_idx != -1:
    lines[start_idx:end_idx+1] = [new_html]
    with open("index.html", "w") as f:
        f.writelines(lines)
    print("Successfully replaced.")
else:
    print("Could not find start index.")
