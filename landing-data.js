/* ========================================================
   KONTEN DARI ADMIN PANEL
   Membaca landing-content.json (di-commit oleh tombol "Publish"
   di admin panel) lalu menimpa bagian-bagian berikut:
   partner, program, kisah sukses, lokasi, FAQ, WhatsApp, promo, sosial media.

   - Jangan edit landing-content.json manual: akan ditimpa saat publish berikutnya.
   - Jika file belum ada / gagal dimuat, konten statis di index.html tetap tampil.
   - Jika file termuat tapi daftar sebuah section kosong, section itu menampilkan
     empty state "segera hadir" (copy ada di kamus i18n, key empty_*).
     Pengecualian: Program Belajar kosong → tetap konten statis di index.html.
   - Promo: jika admin tidak punya promo aktif, bar & section promo disembunyikan.
   - Konten admin hanya berbahasa Indonesia, jadi elemen yang diisi dari API
     dilepas dari kamus i18n (data-i18n dihapus).
   ======================================================== */
(() => {
    const SOURCE = 'landing-content.json';

    const STATIC_WA = '6285183046798';
    const STATIC_WA_DISPLAY = '+62 851-8304-6798';
    const STATIC_WA_LABEL = 'Leskoding Official';

    const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    // hanya izinkan http(s), anchor (#...) dan path relatif
    const safeUrl = v => {
        const u = String(v ?? '').trim();
        if (!u) return '';
        if (u.startsWith('#') || /^https?:\/\//i.test(u)) return u;
        if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return '';
        return u;
    };
    const safeColor = (v, fallback) => /^#[0-9a-f]{3,8}$/i.test(String(v || '')) ? v : fallback;
    const faIcon = (v, fallback) => {
        const name = String(v || '').trim().replace(/^fa-(solid|regular|brands)\s+/, '');
        return /^fa-[a-z0-9-]+$/.test(name) ? name : fallback;
    };
    const detach = el => { if (el) el.removeAttribute('data-i18n'); return el; };
    const setText = (el, text) => { if (el) { detach(el).textContent = text; } };
    const emit = section => document.dispatchEvent(new CustomEvent('leskoding:data', { detail: section }));
    const t = key => {
        try {
            const dict = i18nDictionary[localStorage.getItem('leskoding_lang') || 'en'] || i18nDictionary.en;
            return dict[key] || i18nDictionary.id[key] || '';
        } catch (e) { return ''; }
    };

    /* ---------- Empty state "segera hadir" ---------- */
    const EMPTY = {
        partners: { icon: 'fa-handshake', color: '#38BDF8', compact: true },
        stories: { icon: 'fa-envelope', color: '#FFC83D' },
        locations: { icon: 'fa-map-location-dot', color: '#34D399', bare: true, cta: () => ({ href: waLink('Halo Leskoding, saya ingin bertanya tentang lokasi belajar terdekat.'), icon: 'fa-whatsapp', brand: true, ext: true }) },
        faqs: { icon: 'fa-comments', color: '#C084FC' },
    };
    const badge = c => `<span class="relative inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest" style="color:${c};background:${c}14;border:1px solid ${c}40"><span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background:${c}"></span><span data-i18n="empty_badge">${esc(t('empty_badge'))}</span></span>`;
    // dipakai juga oleh renderCourses & renderHof di index.html saat ganti bahasa
    window.leskodingEmptyState = key => {
        const cfg = EMPTY[key];
        if (!cfg) return '';
        const c = cfg.color;
        const icon = `<div class="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl grid place-items-center text-2xl" style="background:${c}1f;color:${c};border:1px solid ${c}55"><i class="fa-solid ${cfg.icon}"></i></div>`;
        const title = `<span data-i18n="empty_${key}_t">${esc(t(`empty_${key}_t`))}</span>`;
        const desc = `<span data-i18n="empty_${key}_d">${esc(t(`empty_${key}_d`))}</span>`;
        if (cfg.compact) {
            return `<div class="lk-empty flex items-center gap-4 rounded-2xl border border-dashed border-white/15 bg-white/[.02] p-4 text-left">
                ${icon}
                <div class="min-w-0">${badge(c)}<div class="font-bold text-white mt-2 leading-snug">${title}</div><div class="text-xs text-slate-400 mt-1 leading-relaxed">${desc}</div></div>
            </div>`;
        }
        const cta = cfg.cta ? cfg.cta() : null;
        const ctaHtml = cta ? `<a href="${esc(cta.href)}" ${cta.ext ? 'target="_blank" rel="noopener"' : ''} class="relative mt-7 inline-flex items-center justify-center gap-2 bg-[#FFC83D] hover:bg-[#fed368] text-[#111827] font-extrabold px-5 py-3 min-h-[44px] rounded-xl text-xs uppercase tracking-wider transition shadow-[0_4px_18px_rgba(255,200,61,0.25)]"><i class="${cta.brand ? 'fa-brands' : 'fa-solid'} ${cta.icon}"></i><span data-i18n="empty_${key}_cta">${esc(t(`empty_${key}_cta`))}</span></a>` : '';
        const frame = cfg.bare ? '' : 'rounded-[1.75rem] border border-dashed border-white/15 bg-[#0B0F19]/60';
        return `<div class="lk-empty relative overflow-hidden ${frame} px-6 py-14 sm:py-16 text-center">
            <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none" style="background:${c}14"></div>
            <div class="relative flex justify-center">${icon}</div>
            <div class="relative mt-5">${badge(c)}</div>
            <h3 class="relative font-display text-2xl sm:text-3xl font-extrabold mt-4 max-w-xl mx-auto leading-tight">${title}</h3>
            <p class="relative text-slate-400 text-sm sm:text-[15px] max-w-lg mx-auto mt-3 leading-relaxed">${desc}</p>
            ${ctaHtml}
        </div>`;
    };

    let wa = { number: STATIC_WA, display: STATIC_WA_DISPLAY, label: STATIC_WA_LABEL, message: 'Halo Leskoding, saya ingin bertanya.' };
    const waLink = text => `https://wa.me/${wa.number}${text ? '?text=' + encodeURIComponent(text) : ''}`;
    const waBadge = topic => `<a href="${esc(waLink(`Halo Leskoding, saya ingin bertanya tentang ${topic}.`))}" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900/80 px-2.5 py-1.5 rounded-md border border-emerald-500/40 text-xs font-bold text-emerald-300 transition"><i class="fa-brands fa-whatsapp text-emerald-400"></i>${esc(wa.display)}${wa.label ? ' · ' + esc(wa.label) : ''}</a>`;

    /* ---------- 6. WhatsApp ---------- */
    function applyWhatsApp(settings) {
        const s = settings && settings.whatsapp;
        if (!s || !s.number) return;
        wa = { number: s.number, display: s.display || s.number, label: s.label || '', message: s.message || wa.message };
        window.LESKODING.whatsapp = wa.number;
        rewriteWhatsAppLinks();
        // label tombol FAQ ikut kamus i18n; tulis ulang setelah ganti bahasa
        document.addEventListener('leskoding:lang', rewriteWhatsAppLinks);
    }

    function rewriteWhatsAppLinks() {
        document.querySelectorAll('a[href*="wa.me/"]').forEach(a => {
            a.href = a.href.replace(/wa\.me\/\d+/, 'wa.me/' + wa.number);
            const walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT);
            const nodes = [];
            while (walker.nextNode()) nodes.push(walker.currentNode);
            nodes.forEach(n => {
                let t = n.nodeValue;
                if (t.includes(STATIC_WA_DISPLAY)) t = t.split(STATIC_WA_DISPLAY).join(wa.display);
                if (wa.label && t.includes(STATIC_WA_LABEL)) t = t.split(STATIC_WA_LABEL).join(wa.label);
                if (t !== n.nodeValue) n.nodeValue = t;
            });
        });
    }

    /* ---------- 8. Sosial media ---------- */
    function applySocial(settings) {
        const box = document.getElementById('footer-social');
        const s = settings && settings.social;
        if (!box || !s) return;
        const item = (url, icon, cls) => url ? `<a href="${esc(url)}" target="_blank" rel="noopener" class="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-colors ${cls}"><i class="fa-brands ${icon} text-xs"></i></a>` : '';
        box.innerHTML = [
            item(safeUrl(s.instagram), 'fa-instagram', 'text-slate-300 hover:text-white hover:border-white/30'),
            item(waLink(), 'fa-whatsapp', 'text-emerald-400 hover:text-emerald-300 hover:border-emerald-400'),
            item(safeUrl(s.youtube), 'fa-youtube', 'text-red-400 hover:text-red-300 hover:border-red-400'),
            item(safeUrl(s.tiktok), 'fa-tiktok', 'text-slate-300 hover:text-white hover:border-white/30'),
            item(safeUrl(s.facebook), 'fa-facebook-f', 'text-sky-400 hover:text-sky-300 hover:border-sky-400'),
        ].join('');
    }

    /* ---------- 1. Partner ---------- */
    function applyPartners(list) {
        const strip = document.getElementById('partners-strip');
        if (!strip || !Array.isArray(list)) return;
        if (!list.length) {
            strip.className = 'flex-1 w-full';
            strip.innerHTML = window.leskodingEmptyState('partners');
            return;
        }
        const cols = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' }[list.length] || 'grid-cols-3 lg:grid-cols-4';
        strip.className = `flex-1 grid ${cols} gap-3 sm:gap-5 w-full`;
        strip.innerHTML = list.map(p => {
            const tag = safeUrl(p.url) ? 'a' : 'div';
            const link = tag === 'a' ? ` href="${esc(safeUrl(p.url))}" target="_blank" rel="noopener"` : '';
            const logo = p.logo
                ? `<img src="${esc(p.logo)}" alt="Logo ${esc(p.name)}" class="max-h-full max-w-full object-contain" loading="lazy">`
                : `<i class="fa-solid fa-handshake text-slate-400"></i>`;
            return `<${tag}${link} class="strip-logo flex items-center justify-center sm:justify-start gap-3 rounded-2xl bg-white/[.03] border border-white/10 p-2.5 sm:p-3 hover:bg-white/[.06] transition-all ${tag === 'a' ? '' : 'cursor-default'}" title="${esc(p.name)}">
                <div class="plate w-12 h-12 sm:w-14 sm:h-14 rounded-xl p-1 shrink-0 bg-white flex items-center justify-center shadow-md">${logo}</div>
                <span class="hidden sm:block text-xs md:text-sm font-bold leading-tight text-white">${esc(p.name)}</span>
            </${tag}>`;
        }).join('');
    }

    /* ---------- 2. Program & kurikulum ---------- */
    function applyPrograms(list) {
        if (typeof P === 'undefined' || !Array.isArray(list)) return;
        const pillars = ['foundation', 'skills', 'specialization'];
        const programs = list.filter(p => pillars.includes(p.pillar)).map(p => ({
            id: String(p.id),
            n: esc(p.n),
            sym: esc(p.sym),
            name: esc(p.name),
            pillar: p.pillar,
            code: p.code ? esc(p.code) : '',
            min: Number(p.min) || 0,
            max: Number(p.max) || 0,
            color: safeColor(p.color, '#FFC83D'),
            icon: faIcon(p.icon, 'fa-code'),
            tagline: esc(p.tagline || ''),
            desc: esc(p.desc || ''),
            tools: (p.tools || []).map(esc),
            outputs: (p.outputs || []).map(esc),
            syllabus: (p.syllabus || []).map(esc),
        }));
        if (!programs.length) return; // kosong → tetap pakai program statis di index.html
        P.splice(0, P.length, ...programs);
        emit('programs');
        applyProgramOptions(programs);
    }

    // Pilihan program di formulir pendaftaran
    function applyProgramOptions(programs) {
        const select = document.getElementById('reg-program');
        if (!select) return;
        const consult = [...select.querySelectorAll('optgroup')].pop();
        const placeholder = select.querySelector('option[value=""]');
        const GROUPS = {
            foundation: 'Program Anak (Fondasi Coding & Kreativitas)',
            skills: 'Skill Digital Praktis',
            specialization: 'Program Remaja (Spesialisasi Coding & Teknologi)',
        };
        const unesc = s => { const t = document.createElement('textarea'); t.innerHTML = s; return t.value; };
        select.innerHTML = '';
        if (placeholder) select.appendChild(placeholder);
        Object.entries(GROUPS).forEach(([k, label]) => {
            const items = programs.filter(p => p.pillar === k);
            if (!items.length) return;
            const g = document.createElement('optgroup');
            g.label = label;
            items.forEach(p => {
                const name = unesc(p.name);
                const o = document.createElement('option');
                o.value = `${name} (${p.min}-${p.max} Tahun)`;
                o.textContent = `${name} (${p.min}–${p.max} Thn)${p.tagline ? ' — ' + unesc(p.tagline) : ''}`;
                g.appendChild(o);
            });
            select.appendChild(g);
        });
        if (consult) select.appendChild(consult);
    }

    /* ---------- 3. Kisah sukses ---------- */
    function applyStories(list) {
        if (typeof W === 'undefined' || !Array.isArray(list)) return;
        const stories = list.map(s => {
            const cta = s.cta && s.cta.label ? { label: esc(s.cta.label), icon: faIcon(s.cta.icon, 'fa-arrow-up-right-from-square'), link: esc(safeUrl(s.cta.link)) } : null;
            return {
                id: esc(s.id),
                title: esc(s.title),
                name: esc(s.name),
                age: Number(s.age) || '',
                award_id: esc(s.award), award_en: esc(s.award),
                category_id: esc(s.category || ''), category_en: esc(s.category || ''),
                field_id: esc(s.field || ''), field_en: esc(s.field || ''),
                desc_id: esc(s.desc || ''), desc_en: esc(s.desc || ''),
                tools: (s.tools || []).map(esc),
                color: safeColor(s.color, '#FFC83D'),
                photo: s.photo ? esc(s.photo) : '',
                cta_id: cta, cta_en: cta,
            };
        });
        W.splice(0, W.length, ...stories);
        if (typeof i18nDictionary !== 'undefined') {
            Object.values(i18nDictionary).forEach(d => {
                if (d.hof_desc2) d.hof_desc2 = d.hof_desc2.replace(/^\d+/, stories.length);
            });
            const desc = document.querySelector('[data-i18n="hof_desc2"]');
            if (desc) desc.textContent = desc.textContent.replace(/^\d+/, stories.length);
        }
        emit('stories');
    }

    /* ---------- 4. Lokasi ---------- */
    function applyLocations(list) {
        const tabs = document.getElementById('loc-tabs');
        const panels = document.getElementById('loc-panels');
        if (!tabs || !panels || !Array.isArray(list)) return;
        if (!list.length) {
            tabs.innerHTML = '';
            tabs.style.display = 'none';
            panels.innerHTML = window.leskodingEmptyState('locations');
            applyCenterChoices([{
                name: t('reg_center_tbd_t'), nameKey: 'reg_center_tbd_t',
                address: t('reg_center_tbd_d'), addressKey: 'reg_center_tbd_d',
                register_value: 'Belum ditentukan (diskusi dengan admin)',
                color: '#38BDF8', icon: 'fa-comments',
            }]);
            emit('locations');
            return;
        }
        const locs = list.map((l, i) => ({
            ...l,
            key: String(l.id || i).replace(/[^a-z0-9-]/gi, ''),
            color: safeColor(l.color, '#38BDF8'),
            icon: faIcon(l.icon, 'fa-location-dot'),
        }));
        const cols = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' }[locs.length] || 'grid-cols-2 lg:grid-cols-4';
        tabs.className = `grid ${cols} gap-3 mb-5`;
        const newBadge = l => l.is_new ? '<span class="loc-new ml-1.5 align-middle">BARU</span>' : '';

        tabs.innerHTML = locs.map((l, i) => `
            <button type="button" role="tab" id="loc-tab-${l.key}" aria-controls="loc-panel-${l.key}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" class="loc-tab text-left rounded-2xl border border-white/10 bg-[#0F172A] p-4 transition hover:border-white/25" style="--c:${l.color}" data-loc="${l.key}">
                <span class="loc-tab-ic w-10 h-10 rounded-xl grid place-items-center text-base transition" style="background:${l.color}22;color:${l.color}"><i class="fa-solid ${l.icon}"></i></span>
                <span class="block font-bold mt-3 leading-tight"><span>${esc(l.name)}</span>${newBadge(l)}</span>
                ${l.subtitle ? `<span class="block text-[11px] text-slate-400 mt-0.5">${esc(l.subtitle)}</span>` : ''}
            </button>`).join('');

        panels.innerHTML = locs.map((l, i) => {
            const isLab = l.type === 'learning_center';
            const mapsQ = l.maps_query || l.address || l.title;
            const head = l.logo
                ? `<div class="bg-white w-14 h-14 rounded-xl p-1.5 shrink-0 flex items-center justify-center"><img src="${esc(l.logo)}" alt="" class="w-full h-full object-contain" loading="lazy"></div>`
                : `<div class="w-14 h-14 rounded-xl grid place-items-center text-2xl shrink-0" style="background:${l.color}22;color:${l.color}"><i class="fa-solid ${l.icon}"></i></div>`;
            const pin = isLab ? 'fa-location-dot' : l.type === 'online' ? 'fa-wifi' : 'fa-map-pin';
            const features = (l.features || []).map(f => `<li class="flex gap-2.5 text-sm"><i class="fa-solid fa-circle-check mt-0.5" style="color:${l.color}"></i><span>${esc(f)}</span></li>`).join('');
            const route = isLab && mapsQ ? `<a href="https://maps.google.com/?q=${encodeURIComponent(mapsQ)}" target="_blank" rel="noopener" class="inline-flex items-center justify-center gap-2 border border-white/15 hover:bg-white/5 text-white font-bold px-4 py-2.5 min-h-[44px] rounded-xl text-xs uppercase tracking-wider transition"><i class="fa-solid fa-route"></i> <span data-i18n="loc_directions">Rute</span></a>` : '';
            const cta = `<a href="#register" data-pick-center="${esc(l.register_value)}" class="inline-flex items-center justify-center gap-2 bg-[#FFC83D] hover:bg-[#fed368] text-[#111827] font-extrabold px-4 py-2.5 min-h-[44px] rounded-xl text-xs uppercase tracking-wider transition shadow-[0_4px_18px_rgba(255,200,61,0.25)]"><i class="fa-solid fa-rocket"></i> <span>${esc(l.cta_label || 'Daftar')}</span></a>`;
            return `
            <div id="loc-panel-${l.key}" role="tabpanel" aria-labelledby="loc-tab-${l.key}" class="loc-panel grid grid-cols-1 lg:grid-cols-2" ${i === 0 ? '' : 'hidden'}>
                <div class="p-6 sm:p-8 flex flex-col">
                    <div class="flex items-center gap-3">
                        ${head}
                        <div>${l.subtitle ? `<div class="font-mono text-[10px] font-bold uppercase tracking-widest" style="color:${l.color}">${esc(l.subtitle)}</div>` : ''}<h3 class="font-display text-2xl sm:text-3xl font-extrabold leading-tight">${esc(l.title)}${newBadge(l)}</h3></div>
                    </div>
                    ${l.address ? `<p class="text-sm text-slate-300 mt-5 flex gap-2"><i class="fa-solid ${pin} mt-0.5" style="color:${l.color}"></i><span>${esc(l.address)}</span></p>` : ''}
                    ${features ? `<ul class="mt-5 space-y-2.5">${features}</ul>` : ''}
                    <div class="mt-auto pt-6 flex flex-wrap items-center gap-3">
                        ${wa.number ? waBadge(l.title) : ''}
                        <span class="flex-1"></span>
                        ${route}${cta}
                    </div>
                </div>
                <div class="border-t lg:border-t-0 lg:border-l border-white/10 relative min-h-[260px]">${locationVisual(l, mapsQ)}</div>
            </div>`;
        }).join('');

        applyCenterChoices(locs);
        if (window.applyLanguage) window.applyLanguage(localStorage.getItem('leskoding_lang') || 'en');
        emit('locations');
    }

    const GRID_BG = 'bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[length:32px_32px]';
    function locationVisual(l, mapsQ) {
        if (l.type === 'private') {
            return `<div class="absolute inset-0 bg-gradient-to-br from-purple-950/70 via-[#0F172A] to-[#0B0F19] grid place-items-center overflow-hidden">
                <div class="absolute inset-0 ${GRID_BG} opacity-60"></div>
                <div class="relative text-center"><div class="w-20 h-20 mx-auto rounded-3xl grid place-items-center text-4xl" style="background:${l.color}33;border:1px solid ${l.color}66;color:${l.color}"><i class="fa-solid fa-house-chimney-user"></i></div>
                <div class="font-mono text-[11px] text-slate-400 mt-3"><i class="fa-solid fa-car-side mr-1" style="color:${l.color}"></i> <span data-i18n="loc5_tutor_home">tutor → rumah Anda</span></div></div>
            </div>`;
        }
        if (l.type === 'online') {
            return `<div class="absolute inset-0 bg-gradient-to-br from-emerald-950/70 via-[#0F172A] to-[#0B0F19] grid place-items-center p-6 overflow-hidden">
                <div class="absolute inset-0 ${GRID_BG} opacity-60"></div>
                <div class="relative w-full max-w-[300px] rounded-xl border border-white/15 bg-[#0B0F19] p-2 shadow-2xl" aria-hidden="true">
                    <div class="flex gap-1 mb-2"><span class="w-2 h-2 rounded-full bg-[#F87171]"></span><span class="w-2 h-2 rounded-full bg-[#FFC83D]"></span><span class="w-2 h-2 rounded-full bg-emerald-400"></span><span class="ml-auto font-mono text-[9px] text-[#F87171]">● LIVE</span></div>
                    <div class="grid grid-cols-3 gap-1.5">
                        <div class="col-span-2 row-span-2 rounded-md bg-[#1E293B] grid place-items-center" style="color:${l.color}"><i class="fa-solid fa-chalkboard-user text-2xl"></i></div>
                        <div class="rounded-md bg-[#1E293B] aspect-video grid place-items-center text-slate-400"><i class="fa-solid fa-child"></i></div>
                        <div class="rounded-md bg-[#1E293B] aspect-video grid place-items-center text-slate-400"><i class="fa-solid fa-child-reaching"></i></div>
                    </div>
                    <div class="mt-2 rounded-md bg-[#1E293B] px-2 py-1 font-mono text-[9px]" style="color:${l.color}" data-i18n="loc5_online_chat">tutor: "coba jalankan programnya 👀"</div>
                </div>
            </div>`;
        }
        const embed = `https://maps.google.com/maps?q=${encodeURIComponent(mapsQ)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
        return `<div class="absolute inset-0 bg-[#1E293B]">
            <button type="button" class="absolute inset-0 grid place-items-center text-center bg-[#0F172A] ${GRID_BG} group" data-loc-map="${esc(embed)}" data-loc-title="${esc(l.title)}">
                <span><span class="w-14 h-14 mx-auto rounded-2xl grid place-items-center text-2xl" style="background:${l.color}22;color:${l.color}"><i class="fa-solid fa-map-location-dot"></i></span>
                <span class="block text-sm font-bold mt-3 group-hover:underline" data-i18n="loc5_show_map">Tampilkan peta</span><span class="block font-mono text-[10px] text-slate-500 mt-1" data-i18n="loc5_map_note">Google Maps dimuat saat diklik</span></span>
            </button>
        </div>`;
    }

    // Kartu lokasi di formulir pendaftaran + <select id="reg-center"> tersembunyi
    function applyCenterChoices(locs) {
        const cards = document.getElementById('reg-center-cards');
        const select = document.getElementById('reg-center');
        if (!cards || !select) return;
        cards.innerHTML = locs.map((l, i) => `
            <button type="button" role="radio" aria-checked="false" tabindex="${i === 0 ? 0 : -1}" class="reg-choice relative text-left rounded-xl border border-slate-700 bg-[#0F172A] p-3.5 transition" style="--c:${l.color}" data-center="${esc(l.register_value)}" data-short="${esc(l.name)}">
                <i class="reg-tick fa-solid fa-circle-check absolute top-3 right-3 text-sm" style="color:${l.color}"></i>
                <div class="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5" style="background:${l.color}26;color:${l.color}"><i class="fa-solid ${l.icon}"></i></div>
                <div class="text-sm font-bold text-white"${l.nameKey ? ` data-i18n="${l.nameKey}"` : ''}>${esc(l.name)}</div>
                ${l.address ? `<div class="text-[11px] text-slate-400 leading-snug mt-0.5"${l.addressKey ? ` data-i18n="${l.addressKey}"` : ''}>${esc(l.address)}</div>` : ''}
            </button>`).join('');
        const first = select.querySelector('option[value=""]');
        select.innerHTML = '';
        if (first) select.appendChild(first);
        locs.forEach(l => {
            const o = document.createElement('option');
            o.value = l.register_value;
            o.textContent = l.register_value;
            select.appendChild(o);
        });
    }

    /* ---------- 5. FAQ ---------- */
    function applyFaqs(list) {
        const box = document.getElementById('faq5-list');
        const col = document.getElementById('faq5-panels');
        if (!box || !col || !Array.isArray(list)) return;
        if (!list.length) {
            box.innerHTML = '';
            box.style.display = 'none';
            col.innerHTML = '';
            col.style.display = 'none';
            box.parentElement.insertAdjacentHTML('afterbegin', `<div class="lg:col-span-12">${window.leskodingEmptyState('faqs')}</div>`);
            emit('faqs');
            return;
        }
        const faqs = list.map(f => ({ ...f, color: safeColor(f.color, '#38BDF8'), icon: faIcon(f.icon, 'fa-circle-question') }));

        const ctaHref = url => {
            if (String(url || '').trim().toLowerCase() === 'whatsapp') return { href: waLink(wa.message), ext: true };
            const u = safeUrl(url);
            return { href: u, ext: /^https?:/i.test(u) };
        };

        box.innerHTML = faqs.map((f, i) => {
            const n = String(i + 1).padStart(2, '0');
            return `<div class="faq5-item">
                <button type="button" role="tab" id="faq5-tab-${i + 1}" aria-controls="faq5-panel-${i + 1}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" class="faq5-q w-full flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0B0F19] p-4 text-left transition hover:border-white/25" style="--c:${f.color}">
                    <span class="faq5-no w-8 h-8 shrink-0 rounded-lg bg-white/5 grid place-items-center font-mono text-xs font-bold transition">${n}</span>
                    <span class="flex-1 font-semibold text-sm leading-snug">${esc(f.question)}</span>
                    <i class="fa-solid fa-chevron-right text-xs text-slate-500 hidden lg:block"></i><i class="faq5-chev fa-solid fa-chevron-down text-xs text-slate-500 lg:hidden transition-transform"></i>
                </button>
            </div>`;
        }).join('');

        col.innerHTML = faqs.map((f, i) => {
            const cta = f.cta_label ? ctaHref(f.cta_url) : null;
            return `<div role="tabpanel" id="faq5-panel-${i + 1}" aria-labelledby="faq5-tab-${i + 1}" class="faq5-panel" ${i === 0 ? '' : 'hidden'}>
                <div class="h-full rounded-[1.75rem] border bg-[#0B0F19] p-7 sm:p-9 relative overflow-hidden" style="border-color:${f.color}55">
                    <div class="absolute -right-6 -bottom-8 text-[11rem] opacity-[.05] pointer-events-none" style="color:${f.color}" aria-hidden="true"><i class="fa-solid ${f.icon}"></i></div>
                    <div class="relative">
                        <div class="flex items-center gap-3"><span class="w-12 h-12 rounded-2xl grid place-items-center text-xl" style="background:${f.color};color:#0B0F19"><i class="fa-solid ${f.icon}"></i></span>${f.category ? `<span class="font-mono text-[11px] font-bold uppercase tracking-widest" style="color:${f.color}">${esc(f.category)}</span>` : ''}</div>
                        <h3 class="font-display text-2xl sm:text-3xl font-extrabold leading-tight mt-5">${esc(f.question)}</h3>
                        ${f.highlight ? `<div class="inline-flex items-baseline gap-2 mt-5 px-4 py-2 rounded-xl" style="background:${f.color}14"><span class="font-display font-black text-2xl" style="color:${f.color}">${esc(f.highlight)}</span>${f.highlight_note ? `<span class="text-xs text-slate-400">${esc(f.highlight_note)}</span>` : ''}</div>` : ''}
                        <p class="text-[15px] text-slate-300 leading-relaxed mt-5 whitespace-pre-line">${esc(f.answer)}</p>
                        ${cta && cta.href ? `<a href="${esc(cta.href)}" ${cta.ext ? 'target="_blank" rel="noopener"' : ''} class="mt-7 inline-flex items-center justify-center gap-2 bg-[#FFC83D] hover:bg-[#fed368] text-[#111827] font-extrabold px-5 py-3 min-h-[44px] rounded-xl text-xs uppercase tracking-wider transition shadow-[0_4px_18px_rgba(255,200,61,0.25)]">${/wa\.me/.test(cta.href) ? '<i class="fa-brands fa-whatsapp"></i>' : ''}<span>${esc(f.cta_label)}</span> <i class="fa-solid fa-arrow-right text-[10px]"></i></a>` : ''}
                    </div>
                </div>
            </div>`;
        }).join('');
        emit('faqs');
    }

    /* ---------- 7. Promo ---------- */
    function applyPromotion(promo) {
        const bar = document.getElementById('promo-bar');
        const pill = document.getElementById('promo-pill');
        const section = document.getElementById('promo');
        const regPromo = document.getElementById('reg-promo');

        if (!promo) {
            // tidak ada promo aktif di admin: sembunyikan semuanya
            window.LESKODING.promoCode = '';
            if (regPromo) regPromo.placeholder = '';
            if (bar) bar.remove();
            if (pill) pill.remove();
            if (section) section.hidden = true;
            document.documentElement.style.setProperty('--promo-bar-h', '0px');
            return;
        }

        const code = promo.code || '';
        window.LESKODING.promoCode = code;

        if (bar) {
            const track = bar.querySelector('.promo-bar-track');
            const text = promo.bar_text || promo.headline || promo.name;
            const chunk = `<span class="px-6"><i class="fa-solid fa-gift mr-1.5"></i>${esc(text)}</span>`
                + (code ? `<span class="px-6">Gunakan kode <span class="font-mono font-semibold tracking-[.12em] bg-[#111827] text-[#FFC83D] px-2 py-0.5 rounded">${esc(code)}</span></span>` : '');
            if (track) track.innerHTML = chunk.repeat(4);
            setText(bar.querySelector('.sr-only'), text);
            bar.setAttribute('aria-label', promo.name);
        }
        if (pill) setText(pill.querySelector('[data-i18n="promo_trigger"]'), promo.name);

        if (section) {
            setText(section.querySelector('[data-i18n="promo_trigger"]'), promo.name);
            const t1 = section.querySelector('[data-i18n="promo2_title_1"]');
            const t2 = section.querySelector('[data-i18n="promo2_title_2"]');
            setText(t1, promo.headline || promo.name);
            if (t2) { if (promo.headline_accent) setText(t2, promo.headline_accent); else detach(t2).remove(); }
            const desc = section.querySelector('[data-i18n="promo2_desc"]');
            if (desc) { if (promo.description) setText(desc, promo.description); else detach(desc).remove(); }
            const note = section.querySelector('[data-i18n="promo2_note"]');
            if (note) { if (promo.note) setText(note, promo.note); else detach(note).remove(); }

            const codeBox = section.querySelector('#promo-copy')?.parentElement;
            if (codeBox) {
                if (code) {
                    setText(codeBox.firstElementChild, code);
                } else {
                    codeBox.previousElementSibling?.remove(); // label "KODE PROMO"
                    codeBox.remove();
                }
            }
            const cta = section.querySelector('[onclick^="claimPromoAndRegister"]');
            if (cta && promo.cta_label) {
                const label = cta.querySelector('[data-i18n]') || cta;
                setText(label, promo.cta_label);
            }
        }
        if (regPromo) regPromo.placeholder = code ? 'Cth: ' + code : '';
    }

    /* ---------- Muat ---------- */
    const run = (name, fn) => { try { fn(); } catch (err) { console.warn(`[landing] gagal menerapkan ${name}:`, err); } };

    // fetch sudah dimulai di <head> (window.__lkContent); fallback bila belum
    const request = window.__lkContent || fetch(SOURCE, { headers: { Accept: 'application/json' }, cache: 'no-cache' })
        .then(r => r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)));
    const reveal = () => document.documentElement.classList.remove('lk-loading');

    request
        .then(({ data }) => {
            if (!data) return;
            run('whatsapp', () => applyWhatsApp(data.settings));
            run('sosial media', () => applySocial(data.settings));
            run('partner', () => applyPartners(data.partners));
            run('program', () => applyPrograms(data.programs));
            run('kisah sukses', () => applyStories(data.stories));
            run('lokasi', () => applyLocations(data.locations));
            run('faq', () => applyFaqs(data.faqs));
            run('promo', () => applyPromotion(data.promotion));
            document.documentElement.dataset.landingSource = 'json';
        })
        .catch(err => console.warn('[landing] memakai konten statis:', err.message || err))
        .finally(reveal);
})();
