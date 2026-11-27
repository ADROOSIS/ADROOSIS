        // CORE MODULES DEFINITION

        let currentGermCategory = 'all';

        function calcInfusion() {
            const dose = parseFloat(document.getElementById('inf-dose')?.value || 0);
            const weight = parseFloat(document.getElementById('inf-weight')?.value || 0);
            const mg = parseFloat(document.getElementById('inf-mg')?.value || 0);
            const vol = parseFloat(document.getElementById('inf-vol')?.value || 0);
            const resEl = document.getElementById('inf-result');

            if (!resEl || !mg || !vol) return;

            // Dose in mcg/min = dose * weight
            // Conc in mcg/mL = (mg * 1000) / vol
            // Flow in mL/h = (Dose_mcg_min * 60) / Conc_mcg_mL
            const concMcgMl = (mg * 1000) / vol;
            const flowMlH = ((dose * weight) * 60) / concMcgMl;

            resEl.textContent = `${flowMlH.toFixed(2)} mL/h`;
        }

        function switchInfectoSubTab(subTab) {
            const views = ['sindrome', 'germen', 'antibiograma'];
            views.forEach(v => {
                const viewEl = document.getElementById(`inf-view-${v}`);
                if (viewEl) viewEl.classList.add('hidden');
                const btnEl = document.getElementById(`btn-infsub-${v}`);
                if (btnEl) {
                    btnEl.classList.remove('bg-rose-600', 'text-white', 'shadow');
                    btnEl.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
                }
            });

            const targetView = document.getElementById(`inf-view-${subTab}`);
            if (targetView) targetView.classList.remove('hidden');

            const targetBtn = document.getElementById(`btn-infsub-${subTab}`);
            if (targetBtn) {
                targetBtn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
                targetBtn.classList.add('bg-rose-600', 'text-white', 'shadow');
            }

            if (subTab === 'sindrome') renderInfectoSindromes();
            if (subTab === 'germen') renderInfectoGermenes();
            if (subTab === 'antibiograma') loadAbgGermPanel();
        }

        // ANTIBIOGRAM INTERPRETER LOGIC (EUCAST v16.1, 2026)
        // Puntos de corte de CMI en mg/L: s = "S ≤", r = "R >" (rIncl = "R ≥").
        // offScale: EUCAST usa S ≤ 0.001 para no informar S (el wild-type queda como I).
        // clsi: combinación sin corte de CMI en EUCAST; se usa CLSI y se rotula.
        // ecoff: corte basado en ECOFF (nota 11/12 de EUCAST); interpretar con cautela.
        const ABG_CRITERIA = 'EUCAST v16.1 (2026)';

        const ABG_BP = {
            ent: {
                amp: { s: 8, r: 8 },
                sam: { s: 8, r: 8 },
                amc: { s: 8, r: 8 },
                tzp: { s: 8, r: 16 },
                cro: { s: 1, r: 2, sMen: 1, rMen: 1 },
                fep: { s: 1, r: 4 },
                mer: { s: 2, r: 8, sMen: 2, rMen: 2 },
                ert: { s: 0.5, r: 0.5 },
                cip: { s: 0.25, r: 0.5 },
                ami: { s: 8, r: 8, ecoff: true },
                gen: { s: 2, r: 2, ecoff: true },
                nit: { s: 64, r: 64 },
                sxt: { s: 0.5, r: 0.5 },
                fos: { s: 8, r: 8 }
            },
            pse: {
                tzp: { s: 0.001, r: 16, offScale: true },
                caz: { s: 0.001, r: 8, offScale: true },
                fep: { s: 0.001, r: 8, offScale: true },
                mer: { s: 2, r: 8 },
                imi: { s: 0.001, r: 4, offScale: true },
                azt: { s: 0.001, r: 16, offScale: true },
                cip: { s: 0.001, r: 0.5, offScale: true },
                lev: { s: 0.001, r: 2, offScale: true },
                ami: { s: 16, r: 16, ecoff: true },
                gen: { s: 4, r: 16, rIncl: true, clsi: true },
                col: { s: 4, r: 4, ecoff: true, note: 'La CMI de colistina es poco reproducible; confirma con el laboratorio.' }
            },
            acb: {
                mer: { s: 2, r: 8, sMen: 2, rMen: 2 },
                imi: { s: 2, r: 4 },
                cip: { s: 0.001, r: 1, offScale: true },
                lev: { s: 0.5, r: 1 },
                ami: { s: 8, r: 8, ecoff: true },
                gen: { s: 4, r: 4, ecoff: true },
                sxt: { s: 0.5, r: 0.5 },
                col: { s: 2, r: 2, ecoff: true, note: 'La CMI de colistina es poco reproducible; confirma con el laboratorio.' }
            },
            sta: {
                oxa: { s: 2, r: 4, rIncl: true, clsi: true, sCoNS: 0.25, rCoNS: 0.5, note: 'EUCAST recomienda tamizaje con cefoxitina; el corte de oxacilina es CLSI (CoNS: S ≤ 0,25 · R ≥ 0,5).' },
                fox: { s: 4, r: 8, rIncl: true, clsi: true, note: 'Tamizaje de mecA/SARM; no es un antibiótico para tratar.' },
                van: { s: 2, r: 2, sCoNS: 4, rCoNS: 4 },
                cli: { s: 0.25, r: 0.25 },
                ery: { s: 1, r: 1 },
                sxt: { s: 0.5, r: 0.5 },
                dap: { s: 1, r: 1, note: 'S. aureus; no usar en neumonía (se inactiva por el surfactante).' },
                lzd: { s: 4, r: 4 },
                rif: { s: 0.06, r: 0.06, note: 'Solo como adyuvante en combinación; nunca en monoterapia.' }
            },
            entc: {
                amp: { s: 4, r: 4 },
                van: { s: 4, r: 4 },
                lzd: { s: 4, r: 4 },
                dap: { s: 4, r: 8, rIncl: true, clsi: true, note: 'CLSI para E. faecalis; EUCAST no da corte (IE). No usar en neumonía.' },
                nit: { s: 64, r: 64 }
            },
            spn: {
                pen: { s: 0.06, r: 1, sMen: 0.06, rMen: 0.06 },
                cro: { s: 0.5, r: 2, sMen: 0.5, rMen: 0.5 },
                van: { s: 2, r: 2 },
                lev: { s: 0.001, r: 2, offScale: true },
                ery: { s: 0.25, r: 0.25 },
                cli: { s: 0.5, r: 0.5 },
                sxt: { s: 1, r: 1 }
            }
        };

        const abgPanelData = {
            ecoli: [
                { id: 'amp', name: 'Ampicilina' },
                { id: 'sam', name: 'Ampicilina / Sulbactam' },
                { id: 'tzp', name: 'Piperacilina / Tazobactam' },
                { id: 'cro', name: 'Ceftriaxona' },
                { id: 'fep', name: 'Cefepime' },
                { id: 'mer', name: 'Meropenem' },
                { id: 'ert', name: 'Ertapenem' },
                { id: 'cip', name: 'Ciprofloxacino' },
                { id: 'ami', name: 'Amikacina' },
                { id: 'gen', name: 'Gentamicina' },
                { id: 'sxt', name: 'TMP / SMX' },
                { id: 'nit', name: 'Nitrofurantoína', only: 'ITU no complicada' },
                { id: 'fos', name: 'Fosfomicina', only: 'ITU no complicada' }
            ],
            klebsiella: [
                { id: 'sam', name: 'Ampicilina / Sulbactam' },
                { id: 'tzp', name: 'Piperacilina / Tazobactam' },
                { id: 'cro', name: 'Ceftriaxona' },
                { id: 'fep', name: 'Cefepime' },
                { id: 'mer', name: 'Meropenem' },
                { id: 'ert', name: 'Ertapenem' },
                { id: 'cip', name: 'Ciprofloxacino' },
                { id: 'ami', name: 'Amikacina' },
                { id: 'gen', name: 'Gentamicina' },
                { id: 'sxt', name: 'TMP / SMX' }
            ],
            proteus: [
                { id: 'amp', name: 'Ampicilina' },
                { id: 'sam', name: 'Ampicilina / Sulbactam' },
                { id: 'tzp', name: 'Piperacilina / Tazobactam' },
                { id: 'cro', name: 'Ceftriaxona' },
                { id: 'fep', name: 'Cefepime' },
                { id: 'mer', name: 'Meropenem' },
                { id: 'ert', name: 'Ertapenem' },
                { id: 'cip', name: 'Ciprofloxacino' },
                { id: 'ami', name: 'Amikacina' },
                { id: 'gen', name: 'Gentamicina' },
                { id: 'sxt', name: 'TMP / SMX' }
            ],
            enterobacter: [
                { id: 'sam', name: 'Ampicilina / Sulbactam' },
                { id: 'tzp', name: 'Piperacilina / Tazobactam' },
                { id: 'cro', name: 'Ceftriaxona' },
                { id: 'fep', name: 'Cefepime' },
                { id: 'mer', name: 'Meropenem' },
                { id: 'ert', name: 'Ertapenem' },
                { id: 'cip', name: 'Ciprofloxacino' },
                { id: 'ami', name: 'Amikacina' },
                { id: 'gen', name: 'Gentamicina' },
                { id: 'sxt', name: 'TMP / SMX' }
            ],
            paeruginosa: [
                { id: 'tzp', name: 'Piperacilina / Tazobactam' },
                { id: 'caz', name: 'Ceftazidima' },
                { id: 'fep', name: 'Cefepime' },
                { id: 'mer', name: 'Meropenem' },
                { id: 'imi', name: 'Imipenem' },
                { id: 'azt', name: 'Aztreonam' },
                { id: 'cip', name: 'Ciprofloxacino' },
                { id: 'lev', name: 'Levofloxacino' },
                { id: 'ami', name: 'Amikacina' },
                { id: 'gen', name: 'Gentamicina' },
                { id: 'col', name: 'Colistina' }
            ],
            acinetobacter: [
                { id: 'mer', name: 'Meropenem' },
                { id: 'imi', name: 'Imipenem' },
                { id: 'cip', name: 'Ciprofloxacino' },
                { id: 'lev', name: 'Levofloxacino' },
                { id: 'ami', name: 'Amikacina' },
                { id: 'gen', name: 'Gentamicina' },
                { id: 'sxt', name: 'TMP / SMX' },
                { id: 'col', name: 'Colistina' }
            ],
            saureus: [
                { id: 'oxa', name: 'Oxacilina' },
                { id: 'fox', name: 'Cefoxitina (tamizaje SARM)' },
                { id: 'van', name: 'Vancomicina' },
                { id: 'cli', name: 'Clindamicina' },
                { id: 'ery', name: 'Eritromicina' },
                { id: 'sxt', name: 'TMP / SMX' },
                { id: 'dap', name: 'Daptomicina' },
                { id: 'lzd', name: 'Linezolida' },
                { id: 'rif', name: 'Rifampicina' }
            ],
            sepidermidis: [
                { id: 'oxa', name: 'Oxacilina' },
                { id: 'fox', name: 'Cefoxitina (tamizaje SARM)' },
                { id: 'van', name: 'Vancomicina' },
                { id: 'cli', name: 'Clindamicina' },
                { id: 'ery', name: 'Eritromicina' },
                { id: 'sxt', name: 'TMP / SMX' },
                { id: 'lzd', name: 'Linezolida' },
                { id: 'rif', name: 'Rifampicina' }
            ],
            efaecalis: [
                { id: 'amp', name: 'Ampicilina' },
                { id: 'van', name: 'Vancomicina' },
                { id: 'lzd', name: 'Linezolida' },
                { id: 'dap', name: 'Daptomicina' },
                { id: 'nit', name: 'Nitrofurantoína', only: 'ITU no complicada' }
            ],
            efaecium: [
                { id: 'amp', name: 'Ampicilina', intrinsicR: true },
                { id: 'van', name: 'Vancomicina' },
                { id: 'lzd', name: 'Linezolida' },
                { id: 'dap', name: 'Daptomicina', note: 'Sin corte de CMI validado para E. faecium; interpreta el S/I/R del laboratorio.' }
            ],
            spneumoniae: [
                { id: 'pen', name: 'Penicilina' },
                { id: 'cro', name: 'Ceftriaxona' },
                { id: 'van', name: 'Vancomicina' },
                { id: 'lev', name: 'Levofloxacino' },
                { id: 'ery', name: 'Eritromicina' },
                { id: 'cli', name: 'Clindamicina' },
                { id: 'sxt', name: 'TMP / SMX' }
            ]
        };

        function abgFamily(germ) {
            if (['ecoli', 'klebsiella', 'proteus', 'enterobacter'].includes(germ)) return 'ent';
            if (germ === 'paeruginosa') return 'pse';
            if (germ === 'acinetobacter') return 'acb';
            if (germ === 'saureus' || germ === 'sepidermidis') return 'sta';
            if (germ === 'efaecalis' || germ === 'efaecium') return 'entc';
            return 'spn';
        }

        function abgSiteValue() {
            return document.getElementById('abg-site-select')?.value || 'otro';
        }

        function abgMeningitis() {
            return abgSiteValue() === 'snc';
        }

        function getAbgBreakpoint(germ, drugId) {
            const fam = abgFamily(germ);
            const bp = ABG_BP[fam]?.[drugId];
            if (!bp) return null;
            if (germ === 'efaecium' && drugId === 'dap') return null;
            const out = Object.assign({}, bp);
            if (abgMeningitis() && bp.sMen !== undefined) {
                out.s = bp.sMen;
                out.r = bp.rMen;
            }
            if (germ === 'sepidermidis' && bp.sCoNS !== undefined) {
                out.s = bp.sCoNS;
                out.r = bp.rCoNS;
            }
            return out;
        }

        function interpretAbgMic(mic, bp) {
            if (!bp || !isFinite(mic) || mic < 0) return null;
            if (bp.offScale) return mic > bp.r ? 'R' : 'I';
            if (mic <= bp.s) return 'S';
            if (bp.rIncl ? mic >= bp.r : mic > bp.r) return 'R';
            return 'I';
        }

        function fmtAbgNum(n) {
            return String(n).replace('.', ',');
        }

        function abgBpLabel(bp) {
            if (!bp) return 'Sin corte CMI';
            const pre = bp.clsi ? 'CLSI ' : '';
            const rOp = bp.rIncl ? '≥' : '>';
            if (bp.offScale) return `${pre}I ≤ ${fmtAbgNum(bp.r)} · R > ${fmtAbgNum(bp.r)}`;
            return `${pre}S ≤ ${fmtAbgNum(bp.s)} · R ${rOp} ${fmtAbgNum(bp.r)}`;
        }

        function abgChip(cat) {
            const map = {
                S: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                I: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                R: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            };
            return `<span class="px-1.5 py-0.5 rounded border text-[10px] font-bold ${map[cat] || 'bg-slate-700 text-slate-300 border-slate-600'}">${cat}</span>`;
        }

        function loadAbgGermPanel() {
            const select = document.getElementById('abg-germ-select');
            const grid = document.getElementById('abg-drugs-grid');
            if (!select || !grid) return;

            const germ = select.value;
            const drugs = abgPanelData[germ] || [];

            grid.innerHTML = drugs.map(d => {
                const bp = getAbgBreakpoint(germ, d.id);
                const label = d.intrinsicR ? 'R intrínseca' : abgBpLabel(bp);
                const only = d.only ? `<span class="text-[9px] font-semibold text-slate-500 dark:text-slate-400">${d.only}</span>` : '';
                const extra = d.note ? `<p class="text-[9px] leading-snug text-slate-500 dark:text-slate-400">${d.note}</p>` : '';
                const bpNote = bp && bp.note ? `<p class="text-[9px] leading-snug text-slate-500 dark:text-slate-400">${bp.note}</p>` : '';

                if (d.intrinsicR) {
                    return `
                        <div class="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/60 flex flex-col justify-between gap-2">
                            <div class="flex items-start justify-between gap-2">
                                <span class="font-bold text-slate-800 dark:text-slate-200">${d.name}</span>
                                <span class="text-[10px] font-bold text-rose-600 dark:text-rose-400">${label}</span>
                            </div>
                            <p class="text-[10px] leading-snug text-rose-700 dark:text-rose-300">No usar: resistencia intrínseca en E. faecium.</p>
                        </div>`;
                }

                return `
                    <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                        <div class="flex items-start justify-between gap-2">
                            <span class="font-bold text-slate-800 dark:text-slate-200">${d.name}</span>
                            <span class="text-[10px] font-mono font-semibold text-teal-700 dark:text-teal-300 whitespace-nowrap">${label}</span>
                        </div>
                        ${only}
                        <div class="flex items-center gap-2">
                            <label for="abg-mic-${d.id}" class="text-[10px] font-bold text-slate-500 dark:text-slate-400">CMI</label>
                            <input type="number" step="any" min="0" inputmode="decimal" id="abg-mic-${d.id}" placeholder="mg/L"
                                class="w-20 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-slate-900 dark:text-white"
                                oninput="onAbgMicInput('${germ}','${d.id}')">
                            <span id="abg-micres-${d.id}" class="text-[10px] font-bold"></span>
                        </div>
                        <div class="grid grid-cols-4 gap-1.5 text-xs font-bold select-none">
                            <label id="abg-lbl-${d.id}-S" class="cursor-pointer text-center py-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all active:scale-95" onclick="abgSelectRadio('${d.id}','S')">
                                <input type="radio" name="abg_${d.id}" value="S" class="sr-only" onchange="onAbgRadioChange('${d.id}',this.value)"> S
                            </label>
                            <label id="abg-lbl-${d.id}-I" class="cursor-pointer text-center py-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all active:scale-95" onclick="abgSelectRadio('${d.id}','I')">
                                <input type="radio" name="abg_${d.id}" value="I" class="sr-only" onchange="onAbgRadioChange('${d.id}',this.value)"> I
                            </label>
                            <label id="abg-lbl-${d.id}-R" class="cursor-pointer text-center py-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all active:scale-95" onclick="abgSelectRadio('${d.id}','R')">
                                <input type="radio" name="abg_${d.id}" value="R" class="sr-only" onchange="onAbgRadioChange('${d.id}',this.value)"> R
                            </label>
                            <label id="abg-lbl-${d.id}-NR" class="cursor-pointer text-center py-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all active:scale-95" onclick="abgSelectRadio('${d.id}','NR')">
                                <input type="radio" name="abg_${d.id}" value="NR" class="sr-only" checked onchange="onAbgRadioChange('${d.id}',this.value)"> NR
                            </label>
                        </div>
                        ${extra}
                        ${bpNote}
                    </div>`;
            }).join('');

            const resultBox = document.getElementById('abg-result-box');
            if (resultBox) {
                resultBox.classList.add('hidden');
                resultBox.innerHTML = '';
            }
            drugs.forEach(d => { if (!d.intrinsicR) abgUpdateRadioVisuals(d.id, 'NR'); });
            abgUpdateLiveCount();
        }

        function onAbgMicInput(germ, drugId) {
            const input = document.getElementById(`abg-mic-${drugId}`);
            const badge = document.getElementById(`abg-micres-${drugId}`);
            if (!input || !badge) return;
            const raw = input.value.trim();
            if (raw === '') {
                badge.textContent = '';
                badge.className = 'text-[10px] font-bold';
                const nr = document.querySelector(`input[name="abg_${drugId}"][value="NR"]`);
                if (nr) nr.checked = true;
                abgUpdateRadioVisuals(drugId, 'NR');
                abgUpdateLiveCount();
                return;
            }
            const mic = parseFloat(raw.replace(',', '.'));
            const bp = getAbgBreakpoint(germ, drugId);
            const cat = interpretAbgMic(mic, bp);
            if (!cat) {
                badge.textContent = 'sin corte';
                badge.className = 'text-[10px] font-bold text-amber-600 dark:text-amber-400';
                const nr = document.querySelector(`input[name="abg_${drugId}"][value="NR"]`);
                if (nr) nr.checked = true;
                return;
            }
            const radio = document.querySelector(`input[name="abg_${drugId}"][value="${cat}"]`);
            if (radio) radio.checked = true;
            abgUpdateRadioVisuals(drugId, cat);
            abgUpdateLiveCount();
            badge.textContent = cat === 'I' && bp.offScale ? 'I (exp. ↑)' : cat;
            badge.className = 'text-[10px] font-bold ' + (cat === 'S' ? 'text-emerald-600 dark:text-emerald-400' : cat === 'I' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400');
        }

        function onAbgRadioChange(drugId, value) {
            const input = document.getElementById(`abg-mic-${drugId}`);
            const badge = document.getElementById(`abg-micres-${drugId}`);
            if (input) input.value = '';
            if (badge) {
                badge.textContent = '';
                badge.className = 'text-[10px] font-bold';
            }
            abgUpdateRadioVisuals(drugId, value);
            abgUpdateLiveCount();
        }

        function abgSelectRadio(drugId, value) {
            const radio = document.querySelector(`input[name="abg_${drugId}"][value="${value}"]`);
            if (radio) radio.checked = true;
            onAbgRadioChange(drugId, value);
        }

        function abgUpdateRadioVisuals(drugId, value) {
            const selectedClasses = {
                S: ['bg-emerald-600', 'text-white', 'shadow-md'],
                I: ['bg-amber-500', 'text-white', 'shadow-md'],
                R: ['bg-rose-600', 'text-white', 'shadow-md'],
                NR: ['bg-slate-500', 'text-white', 'shadow-md']
            };
            const defaultClasses = ['bg-slate-200', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300'];
            ['S', 'I', 'R', 'NR'].forEach(v => {
                const lbl = document.getElementById(`abg-lbl-${drugId}-${v}`);
                if (!lbl) return;
                // remove all possible
                [...selectedClasses.S, ...selectedClasses.I, ...selectedClasses.R, ...selectedClasses.NR, ...defaultClasses].forEach(c => lbl.classList.remove(c));
                if (v === value) {
                    lbl.classList.add(...selectedClasses[v]);
                } else {
                    lbl.classList.add(...defaultClasses);
                }
            });
        }

        function onAbgManualChange(drugId) {
            onAbgRadioChange(drugId, document.querySelector(`input[name="abg_${drugId}"]:checked`)?.value || 'NR');
        }

        function abgUpdateLiveCount() {
            const el = document.getElementById('abg-live-count');
            if (!el) return;
            const germ = document.getElementById('abg-germ-select')?.value;
            const panel = abgPanelData[germ] || [];
            let s = 0, i = 0, r = 0, n = 0;
            panel.forEach(d => {
                if (d.intrinsicR) { r++; return; }
                const v = document.querySelector(`input[name="abg_${d.id}"]:checked`)?.value || 'NR';
                if (v === 'S') s++; else if (v === 'I') i++; else if (v === 'R') r++; else n++;
            });
            const total = s + i + r;
            el.innerHTML = total === 0
                ? '<span class="text-slate-400">Sin resultados marcados</span>'
                : `<span class="text-emerald-600 dark:text-emerald-400 font-bold">${s} S</span> · <span class="text-amber-600 dark:text-amber-400 font-bold">${i} I</span> · <span class="text-rose-600 dark:text-rose-400 font-bold">${r} R</span>${n ? ` · <span class="text-slate-400">${n} NR</span>` : ''}`;
        }

        function getAbgMic(drugId) {
            const el = document.getElementById(`abg-mic-${drugId}`);
            if (!el || el.value.trim() === '') return null;
            const n = parseFloat(el.value.replace(',', '.'));
            return isFinite(n) && n >= 0 ? n : null;
        }

        function getAbgVal(drugId) {
            const germ = document.getElementById('abg-germ-select')?.value;
            const panel = abgPanelData[germ] || [];
            const entry = panel.find(d => d.id === drugId);
            if (entry && entry.intrinsicR) return 'R';
            const mic = getAbgMic(drugId);
            if (mic !== null) {
                const cat = interpretAbgMic(mic, getAbgBreakpoint(germ, drugId));
                if (cat) return cat;
            }
            const rad = document.querySelector(`input[name="abg_${drugId}"]:checked`);
            return rad ? rad.value : 'NR';
        }

        function loadAbgExample() {
            const germSel = document.getElementById('abg-germ-select');
            const siteSel = document.getElementById('abg-site-select');
            if (!germSel) return;
            germSel.value = 'ecoli';
            if (siteSel) siteSel.value = 'bacteriemia';
            loadAbgGermPanel();
            const demo = { amp: 32, sam: 16, tzp: 8, cro: 8, fep: 2, mer: 0.25, ert: 0.25, cip: 8, ami: 4, gen: 1, sxt: 4, nit: 32, fos: 2 };
            Object.keys(demo).forEach(id => {
                const input = document.getElementById(`abg-mic-${id}`);
                if (input) {
                    input.value = demo[id];
                    onAbgMicInput('ecoli', id);
                }
            });
            runAntibiogramAnalysis();
        }

        function runAntibiogramAnalysis() {
            const germ = document.getElementById('abg-germ-select')?.value;
            const resultBox = document.getElementById('abg-result-box');
            if (!germ || !resultBox) return;

            const panel = abgPanelData[germ] || [];
            const site = abgSiteValue();
            const men = abgMeningitis();

            const rows = panel.map(d => {
                const cat = getAbgVal(d.id);
                const mic = getAbgMic(d.id);
                const bp = getAbgBreakpoint(germ, d.id);
                return Object.assign({}, d, { cat, mic, bp });
            }).filter(r => r.cat !== 'NR' || r.mic !== null);

            if (!rows.length) {
                resultBox.innerHTML = '<p class="text-amber-300">Marca al menos un resultado (S / I / R) o ingresa una CMI antes de analizar.</p>';
                resultBox.classList.remove('hidden');
                return;
            }

            const val = id => {
                const row = rows.find(r => r.id === id);
                return row ? row.cat : 'NR';
            };
            const R = id => val(id) === 'R';
            const I = id => val(id) === 'I';
            const S = id => val(id) === 'S';
            const has = id => panel.some(d => d.id === id);

            const pheno = [];
            const options = [];
            const avoid = [];
            const alerts = [];

            if (['ecoli', 'klebsiella', 'proteus', 'enterobacter'].includes(germ)) {
                const croR = R('cro');
                const fepR = R('fep');
                const merR = R('mer') || (has('ert') && R('ert'));
                const esbl = croR && !merR;

                if (merR) {
                    pheno.push('Enterobacteral resistente a carbapenémicos (CRE): posible carbapenemasa (KPC, NDM u OXA-48).');
                    options.push('Ceftazidima/avibactam (KPC, OXA-48), meropenem/vaborbactam (KPC) o cefiderocol (todas) según el tipo de carbapenemasa y la sensibilidad.');
                    options.push('Aztreonam/avibactam si se sospecha metalo-betalactamasa (NDM).');
                    if (S('ami') || S('gen')) options.push('Amikacina o gentamicina como parte de una combinación, no en monoterapia.');
                    if (S('fos') || S('nit') || S('sxt')) options.push('En cistitis no complicada: fosfomicina, nitrofurantoína o TMP-SMX si son S.');
                    avoid.push('Cefalosporinas, aztreonam, pip-tazo y carbapenémicos salvo combinación guiada por sensibilidad.');
                    avoid.push('Tigeciclina en bacteriemia (baja concentración sérica).');
                    alerts.push('Solicita estudio de carbapenemasa (PCR o inmunocromatografía), aislamiento de contacto e interconsulta a infectología.');
                } else if (germ === 'enterobacter') {
                    pheno.push('Enterobacter cloacae complex: AmpC cromosómico inducible.');
                    options.push('Cefepime 2 g IV c/8h o meropenem 1 g IV c/8h para infección invasiva.');
                    options.push('En cistitis: TMP-SMX, ciprofloxacino o aminoglucósido según sensibilidad.');
                    avoid.push('Ceftriaxona/cefotaxima y pip-tazo aunque sean S: riesgo de selección de AmpC de-reprimido.');
                    alerts.push('Si el aislado es de hemocultivo, UCI o hay fracaso de un betalactámico, prefiere cefepime o carbapenémico.');
                } else if (esbl) {
                    pheno.push('BLEE probable: resistencia a ceftriaxona/cefotaxima con carbapenémicos aún sensibles.');
                    options.push('Meropenem 1 g IV c/8h o ertapenem 1 g IV c/24h para infección invasiva (bacteriemia, pielonefritis, intraabdominal).');
                    options.push('En cistitis no complicada: fosfomicina, nitrofurantoína, TMP-SMX o ciprofloxacino si son S.');
                    avoid.push('Ceftriaxona/cefotaxima aunque el laboratorio las informe S (efecto inóculo).');
                    avoid.push('Pip-tazo para bacteriemia por BLEE (estudio MERINO: mayor mortalidad).');
                    alerts.push('Confirma BLEE con sinergia de doble disco, test de Hodge o PCR. Si hay bacteriemia, prefiere carbapenémico.');
                } else if (fepR) {
                    pheno.push('Resistencia a cefepime con ceftriaxona sensible: posible AmpC o BLEE de bajo nivel.');
                    options.push('Meropenem 1 g IV c/8h o ertapenem 1 g IV c/24h para infección invasiva; confirma el mecanismo.');
                    avoid.push('Cefalosporinas de tercera generación y cefepime.');
                    alerts.push('Confirma con el laboratorio (AmpC, BLEE, carbapenemasa).');
                } else {
                    pheno.push('Sensible a los fármacos probados (sin mecanismo de resistencia de alto impacto detectado).');
                    options.push('Elige según el sitio: ampicilina/sulbactam, ceftriaxona, ciprofloxacino o TMP-SMX si son S.');
                    if (S('nit') || S('fos')) options.push('En cistitis no complicada: nitrofurantoína o fosfomicina.');
                    avoid.push('Aminoglucósido en monoterapia para infección sistémica.');
                }

                if (R('cip')) alerts.push('Resistencia a fluoroquinolonas: evita ciprofloxacino y levofloxacino.');
                if (R('sxt')) alerts.push('TMP-SMX resistente: no usar para ITU ni para P. jirovecii.');
                if (I('mer')) alerts.push('Meropenem I: usa 2 g IV c/8h en infusión extendida (3 h) y confirma el control del foco.');
                if (I('cro')) alerts.push('Ceftriaxona I: requiere dosis alta (2 g c/12h) o elegir otro fármaco.');
                if (S('ami') || S('gen')) alerts.push('Aminoglucósido sensible: útil en combinación, no en monoterapia.');
            } else if (germ === 'paeruginosa') {
                const mdr = (R('mer') && (R('fep') || R('caz') || R('tzp'))) || (R('fep') && R('caz') && R('tzp'));
                if (mdr) {
                    pheno.push('Pseudomonas aeruginosa multirresistente (MDR/XDR).');
                    options.push('Ceftolozano/tazobactam, ceftazidima/avibactam, imipenem/relebactam o cefiderocol según sensibilidad.');
                    options.push('Colistina o amikacina solo en combinación; añade un segundo fármaco activo.');
                    avoid.push('Monoterapia con aminoglucósido o colistina.');
                    avoid.push('Carbapenémicos si son R.');
                    alerts.push('Solicita sensibilidad a los nuevos betalactámicos y consulta a infectología. Aislamiento si MDR.');
                } else {
                    pheno.push('Pseudomonas aeruginosa no MDR.');
                    options.push('Cefepime 2 g IV c/8h, pip-tazo 4.5 g c/6h o meropenem 1 g c/8h; usa infusión extendida si la CMI es alta.');
                    options.push('Añade amikacina si es S en infección grave o MDR.');
                    avoid.push('Ceftriaxona, ertapenem, ampicilina/sulbactam y TMP-SMX no cubren Pseudomonas.');
                    alerts.push('EUCAST informa I (exposición aumentada) para muchos aislamientos sensibles: no es resistencia; requiere dosis altas e infusión extendida.');
                }
                if (R('cip') || R('lev')) alerts.push('Resistencia a fluoroquinolonas: evita ciprofloxacino y levofloxacino.');
                if (R('col')) alerts.push('Colistina R: no usar.');
                if (site === 'pulmonar') alerts.push('En neumonía por Pseudomonas usa dosis altas e infusión extendida; considera tobramicina inhalada en MDR.');
            } else if (germ === 'acinetobacter') {
                const crab = R('mer') || R('imi');
                if (crab) {
                    pheno.push('Acinetobacter baumannii resistente a carbapenémicos (CRAB).');
                    options.push('Colistina + tigeciclina dosis alta, o cefiderocol; ampicilina/sulbactam dosis alta (9 g de sulbactam/día) si es S; minociclina como alternativa.');
                    avoid.push('Carbapenémicos, cefalosporinas y fluoroquinolonas si son R.');
                    alerts.push('CRAB es un patógeno de UCI: consulta infectología. Colistina requiere dosis de carga y monitoría renal.');
                } else {
                    pheno.push('Acinetobacter baumannii sensible a carbapenémicos.');
                    options.push('Meropenem 1 g IV c/8h o imipenem 500 mg IV c/6h; añade ampicilina/sulbactam en infección grave.');
                    alerts.push('Confirma sensibilidad a sulbactam, colistina y tigeciclina; Acinetobacter suele ser multirresistente.');
                }
                if (R('sxt')) alerts.push('TMP-SMX R: no usar.');
            } else if (germ === 'saureus' || germ === 'sepidermidis') {
                const mrsa = R('oxa') || R('fox');
                const coNS = germ === 'sepidermidis';
                if (mrsa) {
                    pheno.push(coNS ? 'Staphylococcus coagulasa-negativo resistente a meticilina (SARM-CoNS).' : 'SARM (MRSA).');
                    options.push('Vancomicina 15-20 mg/kg IV c/8-12h (AUC/MIC 400-600), daptomicina 6-10 mg/kg c/24h (no neumonía), linezolida 600 mg c/12h, ceftarolina 600 mg c/8h o TMP-SMX si es S.');
                    avoid.push('Betalactámicos (oxacilina, cefazolina, ceftriaxona) y vancomicina si el aislado es sensible a oxacilina.');
                    alerts.push('Si la CMI de vancomicina es ≥ 2 mg/L, considera daptomicina o linezolida. Daptomicina se inactiva en pulmón: no usar en neumonía.');
                } else {
                    pheno.push(coNS ? 'Staphylococcus coagulasa-negativo sensible a meticilina.' : 'SASM (MSSA).');
                    options.push('Cefazolina 2 g IV c/8h u oxacilina/nafcilina 2 g IV c/4h; en alergia grave a betalactámico, vancomicina o daptomicina.');
                    avoid.push('Vancomicina si es sensible a oxacilina (peor resultado en bacteriemia).');
                }
                if (R('cli')) alerts.push('Clindamicina R: no usar. Si eritromicina es R y clindamicina S, solicita D-test (resistencia inducible).');
                else if (R('ery') && S('cli')) alerts.push('Eritromicina R + clindamicina S: posible resistencia inducible (D-test). No uses clindamicina empíricamente hasta el resultado.');
                if (R('van')) alerts.push('Vancomicina R: usa linezolida, daptomicina o ceftarolina.');
                if (R('rif')) alerts.push('Rifampicina R: no usar como adyuvante.');
                if (site === 'pulmonar' && mrsa) alerts.push('En neumonía por SARM usa linezolida o ceftarolina; daptomicina no sirve en pulmón.');
                if (site === 'snc') alerts.push('En meningitis estafilocócica usa vancomicina + rifampicina; daptomicina no penetra bien el SNC.');
            } else if (germ === 'efaecalis' || germ === 'efaecium') {
                const faecium = germ === 'efaecium';
                const vre = R('van');
                if (vre) {
                    pheno.push('Enterococo resistente a vancomicina (VRE).');
                    options.push('Linezolida 600 mg IV/VO c/12h o daptomicina 8-12 mg/kg IV c/24h (no neumonía).');
                    avoid.push('Ampicilina (intrínseca en E. faecium), vancomicina y teicoplanina.');
                    alerts.push('Daptomicina no se usa en neumonía. En bacteriemia considera dosis altas y combinación con betalactámico (sinergia).');
                } else {
                    pheno.push(faecium ? 'E. faecium sensible a vancomicina (ampicilina intrínsecamente R).' : 'E. faecalis sensible a ampicilina/vancomicina.');
                    options.push(faecium ? 'Vancomicina 15-20 mg/kg c/8-12h; linezolida o daptomicina si hay alergia o falla.' : 'Ampicilina 2 g IV c/4h o amoxicilina 500 mg VO c/8h; vancomicina si hay alergia.');
                    if (S('nit')) options.push('En ITU no complicada por E. faecalis: nitrofurantoína.');
                    avoid.push('Cefalosporinas (no cubren enterococo) y aminoglucósidos en monoterapia.');
                    alerts.push('E. faecium es intrínsecamente resistente a ampicilina: no la uses aunque no se reporte.');
                }
                if (R('amp') && !faecium) alerts.push('Ampicilina R: usa vancomicina si es S; si también es R, linezolida o daptomicina.');
                if (site === 'snc') alerts.push('Enterococo en SNC: ampicilina + ceftriaxona (sinergia) o vancomicina; consulta infectología.');
            } else if (germ === 'spneumoniae') {
                const penR = R('pen');
                const penI = I('pen');
                const croR = R('cro');
                if (croR || penR) {
                    pheno.push('Neumococo resistente a penicilina/cefalosporinas (PRSP).');
                    options.push('Meningitis: vancomicina 15-20 mg/kg c/8-12h + ceftriaxona 2 g c/12h (o cefotaxima); añade rifampicina si la CMI de ceftriaxona es alta.');
                    options.push('Neumonía no meníngea: ceftriaxona 2 g/día o amoxicilina 3 g/día si la CMI es ≤ 2; levofloxacino 750 mg/día si es S.');
                    avoid.push('Penicilina/amoxicilina en meningitis si la CMI es > 0.06; cefalosporinas solas si la CMI de ceftriaxona es > 0.5 en SNC.');
                    alerts.push('Confirma con el laboratorio; en meningitis añade vancomicina y rifampicina si hay resistencia a ceftriaxona.');
                } else if (penI && !men) {
                    pheno.push('Neumococo con sensibilidad intermedia a penicilina (solo neumonía no meníngea).');
                    options.push('Amoxicilina 3 g/día o ceftriaxona 2 g/día; no uses penicilina en meningitis.');
                    alerts.push('La categoría I en neumonía no meníngea se trata con dosis altas; en SNC se considera R.');
                } else {
                    pheno.push('Neumococo sensible a penicilina.');
                    options.push('Amoxicilina 1 g c/8h o ceftriaxona 1-2 g/día; en meningitis, ceftriaxona 2 g c/12h + vancomicina hasta confirmar la sensibilidad.');
                    avoid.push('Macrólidos empíricos por alta resistencia; confirma con sensibilidad.');
                }
                if (R('ery')) alerts.push('Resistencia a macrólidos: no uses azitromicina ni eritromicina.');
                if (R('sxt')) alerts.push('TMP-SMX R: no usar.');
                if (site === 'pulmonar' && penR) alerts.push('En neumonía por PRSP usa ceftriaxona 2 g/día o amoxicilina 3 g/día; considera vancomicina si es grave.');
            }

            if (site === 'urinario') alerts.push('Nitrofurantoína y fosfomicina solo sirven para cistitis no complicada; no para pielonefritis.');
            if (site === 'snc') alerts.push('En SNC usa dosis altas y fármacos con buena penetración (ceftriaxona/cefotaxima, meropenem, vancomicina); evita aminoglucósidos, daptomicina y tigeciclina.');
            if (site === 'pulmonar') alerts.push('En neumonía evita daptomicina y tigeciclina; los aminoglucósidos no son monoterapia.');
            if (site === 'bacteriemia') alerts.push('En bacteriemia busca y controla el foco (drenaje, retiro de catéter); considera ecocardiograma si hay riesgo de endocarditis.');
            if (site === 'hueso') alerts.push('En infección osteoarticular se requieren dosis altas, 4-6 semanas y valoración quirúrgica.');
            if (site === 'piel') alerts.push('En piel y partes blandas drena el absceso y cubre Streptococcus si hay celulitis.');
            if (site === 'abdominal') alerts.push('En intraabdominal el control del foco (cirugía/drenaje) es esencial; añade cobertura de anaerobios.');

            const usedClsi = rows.some(r => r.bp && r.bp.clsi);
            const usedEcoff = rows.some(r => r.bp && r.bp.ecoff);
            const usedOffScale = rows.some(r => r.bp && r.bp.offScale && r.cat === 'I');
            if (usedClsi) alerts.push('Algunos cortes son de CLSI porque EUCAST no ofrece CMI para esa combinación (oxacilina/cefoxitina, daptomicina en enterococo, gentamicina en Pseudomonas).');
            if (usedEcoff) alerts.push('Algunos cortes se basan en ECOFF (amikacina, gentamicina, colistina): interpreta con cautela y confirma con el laboratorio.');
            if (usedOffScale) alerts.push('EUCAST define I como "susceptible con exposición aumentada" (no resistencia): requiere dosis altas o infusión extendida.');
            alerts.push('Criterio: ' + ABG_CRITERIA + (men ? ' · puntos de corte para meningitis/SNC' : '') + '. La CMI es el estándar; la categoría depende del corte y del sitio de infección.');
            alerts.push('Confirma siempre con el laboratorio de microbiología local y las guías institucionales.');

            const tableRows = rows.map(r => `
                <tr class="border-t border-slate-700/60">
                    <td class="py-1.5 pr-2 font-semibold text-slate-100">${r.name}</td>
                    <td class="py-1.5 px-2 text-center font-mono text-slate-300">${r.mic !== null ? fmtAbgNum(r.mic) : '—'}</td>
                    <td class="py-1.5 px-2 text-center font-mono text-[10px] text-slate-400">${r.intrinsicR ? 'intrínseca' : abgBpLabel(r.bp)}</td>
                    <td class="py-1.5 pl-2 text-center">${abgChip(r.cat)}</td>
                </tr>`).join('');

            const uniq = arr => [...new Set(arr)];

            resultBox.innerHTML = `
                <div class="space-y-4">
                    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-rose-800/80 pb-2">
                        <h4 class="font-bold text-sm text-amber-400 flex items-center gap-2">
                            <i class="fa-solid fa-microscope"></i> Interpretación del antibiograma
                        </h4>
                        <div class="flex items-center gap-2">
                            <button id="abg-copy-btn" onclick="abgCopyResult()" class="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-bold transition-all flex items-center gap-1">
                                <i class="fa-solid fa-copy"></i> Copiar
                            </button>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-900/80 text-rose-200">${ABG_CRITERIA}${men ? ' · SNC' : ''}</span>
                        </div>
                    </div>
                    <div>
                        <strong class="text-slate-400 block text-[11px] uppercase tracking-wider">Fenotipo probable:</strong>
                        <ul class="list-disc list-inside text-slate-100 mt-1 space-y-0.5">${uniq(pheno).map(p => `<li>${p}</li>`).join('')}</ul>
                    </div>
                    <div>
                        <strong class="text-teal-400 block text-[11px] uppercase tracking-wider">Opciones recomendadas:</strong>
                        <ul class="list-disc list-inside text-slate-200 mt-1 space-y-0.5">${uniq(options).map(p => `<li>${p}</li>`).join('')}</ul>
                    </div>
                    ${avoid.length ? `
                    <div>
                        <strong class="text-rose-400 block text-[11px] uppercase tracking-wider">A evitar:</strong>
                        <ul class="list-disc list-inside text-rose-200 mt-1 space-y-0.5">${uniq(avoid).map(p => `<li>${p}</li>`).join('')}</ul>
                    </div>` : ''}
                    <div class="p-3 bg-slate-800 rounded-xl text-slate-300 border border-slate-700 space-y-1">
                        <strong class="text-amber-400 block">Alertas clínicas:</strong>
                        <ul class="list-disc list-inside space-y-0.5">${uniq(alerts).map(p => `<li>${p}</li>`).join('')}</ul>
                    </div>
                    <div>
                        <strong class="text-slate-400 block text-[11px] uppercase tracking-wider">Lectura fármaco por fármaco:</strong>
                        <div class="overflow-x-auto mt-1">
                            <table class="w-full text-[11px]">
                                <thead>
                                    <tr class="text-slate-400 text-left">
                                        <th class="pb-1">Fármaco</th>
                                        <th class="pb-1 text-center">CMI</th>
                                        <th class="pb-1 text-center">Corte (mg/L)</th>
                                        <th class="pb-1 text-center">Categoría</th>
                                    </tr>
                                </thead>
                                <tbody>${tableRows}</tbody>
                            </table>
                        </div>
                    </div>
                    <p class="text-[10px] text-slate-400">CMI = concentración mínima inhibitoria. La categoría se calcula con el punto de corte del sitio seleccionado. Los cortes marcados CLSI se usan solo cuando EUCAST no ofrece CMI.</p>
                </div>`;

            resultBox.classList.remove('hidden');
        }

        function abgCopyResult() {
            const box = document.getElementById('abg-result-box');
            if (!box) return;
            const text = box.innerText;
            const btn = document.getElementById('abg-copy-btn');
            const done = () => { if (btn) { btn.innerHTML = '<i class="fa-solid fa-check"></i> Copiado'; setTimeout(() => { if (btn) btn.innerHTML = '<i class="fa-solid fa-copy"></i> Copiar'; }, 1500); } };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done).catch(() => {
                    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); done();
                });
            } else {
                const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); done();
            }
        }

        function resetAntibiogramForm() {
            const siteSel = document.getElementById('abg-site-select');
            if (siteSel) siteSel.value = 'otro';
            loadAbgGermPanel();
        }

        function filterGermsCategory(cat) {
            currentGermCategory = cat;
            document.querySelectorAll('.germ-cat-btn').forEach(btn => {
                btn.classList.remove('bg-rose-600', 'text-white');
                btn.classList.add('bg-slate-100', 'dark:bg-slate-700', 'text-slate-600', 'dark:text-slate-300');
            });
            event.target.classList.remove('bg-slate-100', 'dark:bg-slate-700', 'text-slate-600', 'dark:text-slate-300');
            event.target.classList.add('bg-rose-600', 'text-white');
            renderInfectoGermenes();
        }

        function renderInfectoSindromes() {
            const container = document.getElementById('inf-sindromes-container');
            if (!container) return;

            const sindromes = window.sindromesData = [
                { title: 'Sepsis y Choque Séptico', germs: 'E. coli, Klebsiella, S. aureus, P. aeruginosa', gravity: 'qSOFA ≥ 2. Lactato > 2 mmol/L, PAM < 65 mmHg', empiric: 'Cefepime 2g IV c/8h O Piperacilina/Tazobactam 4.5g IV c/6h + Vancomicina 15-20 mg/kg IV', alt: 'Alergia Penicilina: Aztreonam 2g IV c/8h + Vancomicina', duration: '7 - 10 días' },
                { title: 'Neumonía Adquirida en la Comunidad (NAC)', germs: 'S. pneumoniae, Mycoplasma, L. pneumophila', gravity: 'CURB-65 ≥ 2 o PSI IV-V.', empiric: 'Ambulatorio: Amoxicilina/Clavulanato + Azitromicina. Hospitalizado: Ceftriaxona 2g IV c/24h + Claritromicina 500mg IV c/12h.', alt: 'Levofloxacino 750mg IV/VO c/24h', duration: '5 - 7 días' },
                { title: 'Infección Urinaria (ITU) / Pielonefritis', germs: 'E. coli (80%), K. pneumoniae, Proteus', gravity: 'Sepsis urinaria, embarazo, monorreno.', empiric: 'Cistitis: Nitrofurantoína 100mg VO c/12h x 5d. Pielonefritis: Ceftriaxona 1-2g IV c/24h.', alt: 'Gentamicina 5mg/kg IV c/24h', duration: 'Cistitis: 3-5d. Pielonefritis: 7-10d' },
                { title: 'Piel y Tejidos Blandos (Celulitis / Erisipela)', germs: 'S. pyogenes, S. aureus', gravity: 'Afectación sistémica, crepitación (fascitis).', empiric: 'Sin SARM: Cefazolina 1-2g IV c/8h o Oxacilina 2g IV c/4h. Con SARM: TMP/SMX o Vancomicina.', alt: 'Clindamicina 300-450mg VO c/8h', duration: '5 - 7 días' },
                { title: 'Meningitis Bacteriana Aguda', germs: 'S. pneumoniae, N. meningitidis, L. monocytogenes (> 50 años, inmunosuprimidos), H. influenzae', gravity: 'Fiebre + cefalea + rigidez de nuca + alteración del estado mental; petequias o púrpura (meningococo); choque. Urgencia: no retrases el antibiótico.', empiric: 'Ceftriaxona 2g IV c/12h + Vancomicina 15-20 mg/kg IV c/8-12h + Dexametasona 0.15 mg/kg IV c/6h x 4 días (primera dosis antes o con el antibiótico). Si > 50 años, inmunosupresión o embarazo: agregar Ampicilina 2g IV c/4h (Listeria).', alt: 'Alergia grave a betalactámicos: consulta a Infectología (p. ej. Vancomicina + Moxifloxacino; TMP/SMX si se cubre Listeria).', duration: 'Neumococo 10-14 d · Meningococo 7 d · Listeria ≥ 21 d' },
                { title: 'Infección Intraabdominal Complicada (peritonitis, colecistitis, diverticulitis)', germs: 'Enterobacterales (E. coli, Klebsiella), Bacteroides, estreptococos, enterococos', gravity: 'Peritonitis difusa, sepsis o choque, foco no controlable, inmunosupresión. El control del foco (cirugía / drenaje) es parte del tratamiento.', empiric: 'Comunitaria leve-moderada: Ceftriaxona 2g IV c/24h + Metronidazol 500 mg IV c/8h. Grave o nosocomial: Piperacilina/Tazobactam 4.5g IV c/6h.', alt: 'Ertapenem 1g IV c/24h. Alergia grave a penicilina: consulta a Infectología.', duration: '≈ 4 días tras un control adecuado del foco' },
                { title: 'Diarrea Aguda Infecciosa', germs: 'Virus (rotavirus, norovirus), E. coli, Shigella, Salmonella, Campylobacter, V. cholerae', gravity: 'Deshidratación grave, sangre en heces con fiebre alta, inmunosupresión, > 7 días, ancianos o lactantes.', empiric: 'La mayoría NO requiere antibiótico: rehidratación (SRO, Planes A/B/C) y zinc en niños. Si hay disentería o cuadro grave: Azitromicina 500 mg VO c/24h x 3 días (niños 10 mg/kg c/24h).', alt: 'Ciprofloxacino 500 mg VO c/12h x 3 días en adultos (evítalo si sospechas E. coli productora de toxina Shiga). Loperamida solo en diarrea acuosa sin fiebre ni sangre.', duration: '3 días de antibiótico, si está indicado' },
                { title: 'Faringoamigdalitis Estreptocócica', germs: 'S. pyogenes (estreptococo del grupo A)', gravity: 'Absceso periamigdalino, trismus, sialorrea, estridor (epiglotitis).', empiric: 'Confirma con Centor + prueba rápida. Penicilina G benzatínica 1.2 millones UI IM dosis única, o Amoxicilina 500 mg VO c/12h x 10 días (niños 50 mg/kg/día).', alt: 'Alergia no grave a penicilina: Cefalexina 500 mg VO c/12h x 10 días. Alergia grave: Azitromicina o Clindamicina.', duration: '10 días (vía oral)' },
                { title: 'Malaria no complicada', germs: 'Plasmodium vivax, P. falciparum', gravity: 'Malaria complicada: alteración de la conciencia, convulsiones, ictericia, falla renal, hipoglucemia, hemorragias, hiperparasitemia, choque. Remite de inmediato.', empiric: 'Confirma con gota gruesa o prueba rápida y define la especie. P. falciparum: Artemeter-Lumefantrina x 3 días + Primaquina dosis única. P. vivax: Cloroquina x 3 días + Primaquina (duración según la guía vigente).', alt: 'Dosis por peso según la guía vigente del Ministerio de Salud / INS. Antes de la primaquina: descarta embarazo y valora déficit de G6PD.', duration: '3 días (+ primaquina según especie)' }
            ];

            const query = (document.getElementById('inf-sindrome-search')?.value || '').toLowerCase();
            const filtered = sindromes.filter(s => s.title.toLowerCase().includes(query) || s.germs.toLowerCase().includes(query));

            container.innerHTML = filtered.map(s => `
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                    <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                        <h3 class="font-extrabold text-base text-slate-900 dark:text-white">${s.title}</h3>
                        <button onclick="switchInfectoSubTab('antibiograma')" class="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1">
                            <i class="fa-solid fa-vial-virus"></i> Antibiograma
                        </button>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div><strong class="text-slate-500">Gérmenes:</strong> <p class="text-slate-800 dark:text-slate-200">${s.germs}</p></div>
                        <div><strong class="text-slate-500">Gravedad:</strong> <p class="text-rose-600 dark:text-rose-400 font-semibold">${s.gravity}</p></div>
                    </div>
                    <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs space-y-1">
                        <div><strong class="text-teal-600 dark:text-teal-400">Esquema 1ª Línea:</strong> ${s.empiric}</div>
                        <div><strong class="text-amber-600 dark:text-amber-400">Alternativa:</strong> ${s.alt}</div>
                        <div><strong class="text-slate-500">Duración:</strong> ${s.duration}</div>
                    </div>
                </div>
            `).join('');
        }

        function renderInfectoGermenes() {
            const container = document.getElementById('inf-germenes-container');
            if (!container) return;

            const germenes = window.germenesData = [
                { name: 'Escherichia coli', cat: 'gram_neg', type: 'Bacilo Gram -', infections: 'ITU, Sepsis, Peritonitis', primary: 'Ceftriaxona, Ciprofloxacino, Nitrofurantoína' },
                { name: 'Staphylococcus aureus', cat: 'gram_pos', type: 'Coco Gram +', infections: 'Bacteremia, Endocarditis, SSTI', primary: 'SASM: Cefazolina / Oxacilina. SARM: Vancomicina' },
                { name: 'Pseudomonas aeruginosa', cat: 'gram_neg', type: 'Bacilo Gram - no fermentador', infections: 'Neumonía nosocomial, Quemaduras', primary: 'Cefepime, Piperacilina/Tazobactam, Meropenem' },
                { name: 'Streptococcus pneumoniae', cat: 'gram_pos', type: 'Diplococo Gram +', infections: 'NAC, Meningitis, Otitis', primary: 'Penicilina, Amoxicilina, Ceftriaxona' },
                { name: 'Klebsiella pneumoniae', cat: 'gram_neg', type: 'Bacilo Gram - encapsulado', infections: 'Neumonía, ITU, bacteriemia, absceso hepático, infección nosocomial', primary: 'Según antibiograma: Ceftriaxona si es sensible; BLEE: Meropenem o Ertapenem; carbapenemasa (KPC): Ceftazidima/Avibactam (con Infectología)' },
                { name: 'Enterococcus faecalis / faecium', cat: 'gram_pos', type: 'Coco Gram + en cadenas', infections: 'ITU, endocarditis, infección intraabdominal, bacteriemia por catéter', primary: 'E. faecalis: Ampicilina. E. faecium resistente a ampicilina: Vancomicina si es sensible; VRE: Linezolid o Daptomicina' },
                { name: 'Streptococcus pyogenes (grupo A)', cat: 'gram_pos', type: 'Coco Gram + en cadenas', infections: 'Faringoamigdalitis, erisipela, impétigo, fascitis necrosante', primary: 'Penicilina o Amoxicilina. Fascitis necrosante: Clindamicina + Penicilina + cirugía urgente' },
                { name: 'Bacteroides fragilis', cat: 'anaerobios', type: 'Bacilo Gram - anaerobio', infections: 'Infección intraabdominal, abscesos, infección pélvica', primary: 'Metronidazol, Piperacilina/Tazobactam, Amoxicilina/Clavulanato o carbapenémicos' },
                { name: 'Clostridioides difficile', cat: 'anaerobios', type: 'Bacilo Gram + esporulado anaerobio', infections: 'Colitis asociada a antibióticos', primary: 'Vancomicina VO 125 mg c/6h x 10 días (o Fidaxomicina). Suspende el antibiótico desencadenante si es posible' },
                { name: 'Mycoplasma pneumoniae', cat: 'atipicos', type: 'Atípico (sin pared celular)', infections: 'NAC leve ("neumonía ambulante"), traqueobronquitis', primary: 'Azitromicina o Doxiciclina (no responde a betalactámicos)' },
                { name: 'Legionella pneumophila', cat: 'atipicos', type: 'Bacilo Gram - intracelular', infections: 'NAC grave, a veces con diarrea, hiponatremia y hepatitis', primary: 'Levofloxacino o Azitromicina' },
                { name: 'Chlamydia trachomatis', cat: 'atipicos', type: 'Bacteria intracelular obligada', infections: 'Uretritis, cervicitis, enfermedad inflamatoria pélvica, conjuntivitis', primary: 'Doxiciclina 100 mg VO c/12h x 7 días (o Azitromicina 1 g dosis única)' }
            ];

            const query = (document.getElementById('inf-germen-search')?.value || '').toLowerCase();
            const filtered = germenes.filter(g => (currentGermCategory === 'all' || g.cat === currentGermCategory) && g.name.toLowerCase().includes(query));

            container.innerHTML = filtered.map(g => `
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2 text-xs">
                    <div class="flex items-center justify-between">
                        <h4 class="font-bold text-slate-900 dark:text-white text-sm italic">${g.name}</h4>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">${g.type}</span>
                    </div>
                    <p><strong class="text-slate-500">Infecciones:</strong> ${g.infections}</p>
                    <p><strong class="text-teal-600 dark:text-teal-400">Tratamiento de Elección:</strong> ${g.primary}</p>
                </div>
            `).join('');
        }

        // GASES ARTERIALES ANALYSIS
function analyzeGases() {
    const num = id => parseFloat(document.getElementById(id)?.value);
    const ph = num('gas-ph'), paco2 = num('gas-paco2'), hco3 = num('gas-hco3'), pao2 = num('gas-pao2');
    const na = num('gas-na'), cl = num('gas-cl'), edad = num('gas-edad');
    let fio2 = num('gas-fio2'); if (isNaN(fio2) || fio2 <= 0) fio2 = 21;
    let alb = num('gas-alb'); const albDado = !isNaN(alb); if (!albDado) alb = 4.0;
    let alt = num('gas-alt'); if (isNaN(alt) || alt < 0) alt = 0;
    const container = document.getElementById('gas-steps-container');
    if (!container || isNaN(ph) || isNaN(paco2) || isNaN(hco3)) { alert('Por favor ingresa al menos pH, PaCO₂ y HCO₃⁻.'); return; }

    // 1. pH
    const acid = ph < 7.35, alk = ph > 7.45;
    const phTxt = acid ? 'Acidemia (pH < 7.35)' : alk ? 'Alcalemia (pH > 7.45)' : 'Normal (7.35 - 7.45)';

    // 2. Trastorno primario
    const mAc = hco3 < 22, mAl = hco3 > 26, rAc = paco2 > 45, rAl = paco2 < 35;
    let prim = 'N', primTxt;
    if (acid) {
        if (mAc && rAc) { prim = 'MIX'; primTxt = 'Acidosis mixta (metabólica + respiratoria)'; }
        else if (mAc) { prim = 'AcM'; primTxt = 'Acidosis metabólica'; }
        else if (rAc) { prim = 'AcR'; primTxt = 'Acidosis respiratoria'; }
        else primTxt = 'Acidemia sin HCO₃⁻ bajo ni PaCO₂ alta: revisa los datos ingresados';
    } else if (alk) {
        if (mAl && rAl) { prim = 'MIX'; primTxt = 'Alcalosis mixta (metabólica + respiratoria)'; }
        else if (mAl) { prim = 'AlM'; primTxt = 'Alcalosis metabólica'; }
        else if (rAl) { prim = 'AlR'; primTxt = 'Alcalosis respiratoria'; }
        else primTxt = 'Alcalemia sin HCO₃⁻ alto ni PaCO₂ baja: revisa los datos ingresados';
    } else {
        primTxt = (mAc || mAl || rAc || rAl)
            ? 'pH normal con HCO₃⁻ / PaCO₂ alterados: trastorno compensado o mixto con efectos opuestos'
            : 'Equilibrio ácido-base normal';
    }

    // 3. Compensación
    let comp = 'No aplica (sin un trastorno primario único definido).';
    if (prim === 'AcM') {
        const e = 1.5 * hco3 + 8, lo = e - 2, hi = e + 2;
        comp = `Winter: PaCO₂ esperada ${e.toFixed(1)} ± 2 (${lo.toFixed(1)}–${hi.toFixed(1)}). ` +
            (paco2 > hi ? '<b>PaCO₂ mayor a la esperada → acidosis respiratoria agregada.</b>'
                : paco2 < lo ? '<b>PaCO₂ menor a la esperada → alcalosis respiratoria agregada.</b>'
                : 'Compensación respiratoria adecuada.');
    } else if (prim === 'AlM') {
        const e = 40 + 0.7 * (hco3 - 24), lo = e - 5, hi = e + 5;
        comp = `PaCO₂ esperada ${e.toFixed(1)} ± 5 (${lo.toFixed(1)}–${hi.toFixed(1)}). ` +
            (paco2 > hi ? '<b>PaCO₂ mayor a la esperada → acidosis respiratoria agregada.</b>'
                : paco2 < lo ? '<b>PaCO₂ menor a la esperada → alcalosis respiratoria agregada.</b>'
                : 'Compensación respiratoria adecuada.');
    } else if (prim === 'AcR') {
        const a = 24 + 0.1 * (paco2 - 40), c = 24 + 0.35 * (paco2 - 40);
        comp = `HCO₃⁻ esperado ≈ ${a.toFixed(1)} si es AGUDA; ≈ ${c.toFixed(1)} si es CRÓNICA. ` +
            (hco3 < a - 2 ? '<b>HCO₃⁻ menor al esperado → acidosis metabólica agregada.</b>'
                : hco3 > c + 2 ? '<b>HCO₃⁻ mayor al esperado → alcalosis metabólica agregada.</b>'
                : hco3 <= a + 2 ? 'Compatible con trastorno AGUDO.'
                : hco3 >= c - 2 ? 'Compatible con trastorno CRÓNICO (o agudizado sobre crónico).'
                : 'Compatible con fase subaguda.');
    } else if (prim === 'AlR') {
        const a = 24 - 0.2 * (40 - paco2), c = 24 - 0.4 * (40 - paco2);
        comp = `HCO₃⁻ esperado ≈ ${a.toFixed(1)} si es AGUDA; ≈ ${c.toFixed(1)} si es CRÓNICA. ` +
            (hco3 > a + 2 ? '<b>HCO₃⁻ mayor al esperado → alcalosis metabólica agregada.</b>'
                : hco3 < c - 2 ? '<b>HCO₃⁻ menor al esperado → acidosis metabólica agregada.</b>'
                : hco3 >= a - 2 ? 'Compatible con trastorno AGUDO.'
                : hco3 <= c + 2 ? 'Compatible con trastorno CRÓNICO.'
                : 'Compatible con fase subaguda.');
    } else if (prim === 'MIX') comp = 'Los dos componentes se suman: no hay compensación que calcular.';

    // 4. Anion gap + delta ratio
    let agTxt = 'Ingresa Na⁺ y Cl⁻ para calcular el anion gap y el delta ratio.';
    if (!isNaN(na) && !isNaN(cl)) {
        const ag = na - (cl + hco3), agc = ag + 2.5 * (4.0 - alb);
        agTxt = `Anion gap: <b>${ag.toFixed(1)}</b> mEq/L · corregido por albúmina${albDado ? '' : ' (asumida 4.0 g/dL)'}: <b>${agc.toFixed(1)}</b> (normal ≈ 8–12).`;
        if (agc > 12) {
            agTxt += ' <b>Anion gap elevado:</b> piensa en GOLDMARK (glicoles, 5-oxoprolina, L-lactato, D-lactato, metanol, aspirina, renal, cetoacidosis).';
            if (hco3 < 24) {
                const dr = (agc - 12) / (24 - hco3);
                const t = dr < 0.4 ? 'acidosis hiperclorémica (brecha normal) predominante'
                    : dr < 0.8 ? 'acidosis mixta: brecha elevada + hiperclorémica'
                    : dr <= 2 ? 'acidosis metabólica de brecha elevada pura'
                    : 'brecha elevada + alcalosis metabólica concomitante (o HCO₃⁻ basal alto)';
                agTxt += `<br>Delta ratio (ΔAG/ΔHCO₃⁻): <b>${dr.toFixed(2)}</b> → ${t}.`;
            } else agTxt += '<br>Delta ratio: con HCO₃⁻ ≥ 24 sugiere alcalosis metabólica concomitante.';
        } else if (mAc) {
            agTxt += ' Acidosis con brecha normal (hiperclorémica): diarrea, acidosis tubular renal, exceso de suero salino, fístulas, acetazolamida.';
        }
    }

    // 5. Oxigenación (con altitud)
    const patm = 760 * Math.pow(1 - 2.25577e-5 * alt, 5.25588);
    let oxTxt = 'Ingresa PaO₂ (y FiO₂) para calcular PaFi y gradiente A-a.';
    if (!isNaN(pao2)) {
        const f = fio2 / 100, pafi = pao2 / f;
        const cat = v => v <= 100 ? 'severa (≤ 100)' : v <= 200 ? 'moderada (101-200)' : v <= 300 ? 'leve (201-300)' : '> 300 (sin criterio de gravedad)';
        oxTxt = `PaFi medida: <b>${pafi.toFixed(0)}</b> mmHg`;
        if (alt > 1000) {
            const pc = pafi * patm / 760;
            oxTxt += ` · corregida por altitud (Berlín, Patm ≈ ${patm.toFixed(0)} mmHg): <b>${pc.toFixed(0)}</b> → hipoxemia ${cat(pc)}. <i>La corrección de Berlín es discutida en altura: interpreta con la clínica.</i>`;
        } else oxTxt += ` → hipoxemia ${cat(pafi)}.`;
        oxTxt += '<br><i>Estas categorías solo hablan de SDRA si se cumplen los demás criterios de Berlín: inicio ≤ 1 semana, opacidades bilaterales, no explicado solo por falla cardíaca y PEEP/CPAP ≥ 5.</i>';
        const alv = f * (patm - 47) - paco2 / 0.8, aa = alv - pao2;
        oxTxt += `<br>PAO₂ alveolar ≈ ${alv.toFixed(0)} mmHg · Gradiente A-a: <b>${aa.toFixed(0)} mmHg</b>`;
        if (!isNaN(edad)) {
            const ex = edad / 4 + 4;
            oxTxt += ` (esperado ≈ ${ex.toFixed(0)} en aire ambiente)`;
            if (fio2 === 21) oxTxt += aa > ex
                ? ' → <b>elevado</b>: shunt, desequilibrio V/Q o alteración de difusión.'
                : ' → normal: si hay hipoxemia, piensa en hipoventilación o en la menor PiO₂ por la altitud.';
            else oxTxt += ' — el gradiente aumenta con la FiO₂: no lo compares con el valor de aire ambiente.';
        }
    }

    const steps = [['Estado del pH', phTxt], ['Trastorno primario', primTxt], ['Respuesta compensatoria', comp], ['Anion gap y delta ratio', agTxt], ['Oxigenación', oxTxt]];
    container.innerHTML = `
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
            <h3 class="font-extrabold text-sm text-teal-600 dark:text-teal-400 border-b pb-2">Resultados del Análisis Arterial</h3>
            ${steps.map((s, i) => `<p><strong>${i + 1}. ${s[0]}:</strong> ${s[1]}</p>`).join('')}
        </div>`;
    container.classList.remove('hidden');
}

        function loadGasPreset(ph, paco2, hco3, pao2, fio2, na, cl, alb) {
            document.getElementById('gas-ph').value = ph;
            document.getElementById('gas-paco2').value = paco2;
            document.getElementById('gas-hco3').value = hco3;
            document.getElementById('gas-pao2').value = pao2;
            document.getElementById('gas-fio2').value = fio2;
            document.getElementById('gas-na').value = na;
            document.getElementById('gas-cl').value = cl;
            document.getElementById('gas-alb').value = alb;
            analyzeGases();
        }

        function resetGasForm() {
            document.getElementById('gas-form')?.reset();
            const container = document.getElementById('gas-steps-container');
            if (container) container.classList.add('hidden');
        }

        // TRIADAS CLÍNICAS DATABASE

        let currentTriadCategory = 'all';

        function filterTriads(category) {
            currentTriadCategory = category;
            document.querySelectorAll('.triad-filter-btn').forEach(btn => {
                btn.classList.remove('bg-teal-600', 'text-white', 'shadow');
                btn.classList.add('font-medium', 'text-slate-600', 'dark:text-slate-300');
            });
            if (event && event.target) {
                event.target.classList.remove('font-medium', 'text-slate-600', 'dark:text-slate-300');
                event.target.classList.add('bg-teal-600', 'text-white', 'shadow');
            }
            renderTriads();
        }

        function renderTriads() {
            const container = document.getElementById('triads-grid');
            if (!container) return;

            const query = (document.getElementById('triad-search')?.value || '').toLowerCase();
            const filtered = triadsDatabase.filter(t => {
                const matchesCat = currentTriadCategory === 'all' || t.category === currentTriadCategory;
                const matchesQuery = t.name.toLowerCase().includes(query) || t.entity.toLowerCase().includes(query);
                return matchesCat && matchesQuery;
            });

            container.innerHTML = filtered.map(t => `
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4">
                    <div class="space-y-3">
                        <div class="flex items-start justify-between border-b pb-2">
                            <div>
                                <h3 class="font-extrabold text-slate-900 dark:text-white text-base">${t.name}</h3>
                                <p class="text-xs font-bold text-teal-600 dark:text-teal-400 mt-0.5">${t.entity}</p>
                            </div>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">${t.category}</span>
                        </div>
                        <ul class="space-y-1 text-xs text-slate-700 dark:text-slate-300 font-medium">
                            ${t.items.map(i => `<li class="flex items-center gap-2"><i class="fa-solid fa-circle-check text-teal-500 text-xs"></i> ${i}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="pt-3 border-t text-xs">
                        <p class="text-amber-800 dark:text-amber-300 bg-amber-500/10 p-2.5 rounded-xl"><strong>Perla:</strong> ${t.pearl}</p>
                    </div>
                </div>
            `).join('');
        }

        // RENDER CALCULATORS & SCALES
        let currentCalcCategory = 'all';

        function filterCalcCategory(cat) {
            currentCalcCategory = cat;
            document.querySelectorAll('.calc-cat-btn').forEach(btn => {
                btn.classList.remove('bg-teal-600', 'text-white', 'shadow');
                btn.classList.add('bg-transparent', 'text-slate-600', 'dark:text-slate-300');
            });
            if (event && event.target) {
                event.target.classList.remove('bg-transparent', 'text-slate-600', 'dark:text-slate-300');
                event.target.classList.add('bg-teal-600', 'text-white', 'shadow');
            }
            renderCalculators();
        }

        function renderCalculators() {
            const container = document.getElementById('calculators-grid');
            if (!container) return;

            const calcs = window.calcsData = [
                // 1. GLASGOW COMA SCALE
                {
                    id: 'glasgow',
                    cat: 'neuro',
                    title: 'Escala de Coma de Glasgow (GCS)',
                    desc: 'Evaluación neurológica estandarizada de apertura ocular, respuesta verbal y motora.',
                    body: `
                        <div class="space-y-2 text-xs">
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div>
                                    <label class="block font-medium text-slate-500 mb-0.5">Ocular (1-4):</label>
                                    <select id="gcs-o" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                                        <option value="4">4 - Espontánea</option>
                                        <option value="3">3 - Al sonido</option>
                                        <option value="2">2 - Al dolor</option>
                                        <option value="1">1 - Ausente</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block font-medium text-slate-500 mb-0.5">Verbal (1-5 o NT):</label>
<label class="block font-medium text-slate-500 mb-0.5">Verbal (1-5 o NT):</label>
<select id="gcs-v" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
    <option value="5">5 - Orientado</option>
    <option value="4">4 - Confuso</option>
    <option value="3">3 - Palabras inapropiadas</option>
    <option value="2">2 - Sonidos incomprensibles</option>
    <option value="1">1 - Sin respuesta</option>
    <option value="NT">NT - No evaluable</option>
</select>
                                </div>
                                <div>
                                    <label class="block font-medium text-slate-500 mb-0.5">Motora (1-6):</label>
                                    <select id="gcs-m" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                                        <option value="6">6 - Obedece órdenes</option>
                                        <option value="5">5 - Localiza el dolor</option>
                                        <option value="4">4 - Retirada al dolor</option>
                                        <option value="3">3 - Flexión anormal (Decorticación)</option>
                                        <option value="2">2 - Extensión anormal (Descerebración)</option>
                                        <option value="1">1 - Ausente</option>
                                    </select>
                                </div>
                            </div>
                            <button onclick="calcGlasgow()" class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow transition-all">Calcular Glasgow</button>
                            <div id="gcs-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 font-bold hidden space-y-1"></div>
                        </div>
                    `
                },
                // 2. APGAR SCORE
                {
                    id: 'apgar',
                    cat: 'urgencias',
                    title: 'Test de APGAR (Recién Nacido)',
                    desc: 'Apariencia, Pulso, Gesticulación/reflejos, Actividad, Respiración',
                    body: `
    <div class="space-y-2 text-xs">

        <label class="block font-medium">Momento de evaluación</label>
        <select id="ap-min" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <option value="" selected disabled>Seleccionar minuto</option>
            <option value="1">1 minuto</option>
            <option value="5">5 minutos</option>
            <option value="10">10 minutos</option>
            <option value="15">15 minutos</option>
            <option value="20">20 minutos</option>
        </select>

        <div class="grid grid-cols-2 gap-2">
            <div>
                <label class="block font-medium text-slate-500 mb-0.5">Frecuencia cardíaca</label>
                <select id="ap-fc" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <option value="" selected disabled>Seleccionar</option>
                    <option value="2">≥100 lpm (2)</option>
                    <option value="1"><escape><</escape>100 lpm (1)</option>
                    <option value="0">Ausente (0)</option>
                </select>
            </div>

            <div>
                <label class="block font-medium text-slate-500 mb-0.5">Esfuerzo respiratorio</label>
                <select id="ap-resp" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <option value="" selected disabled>Seleccionar</option>
                    <option value="2">Llanto vigoroso (2)</option>
                    <option value="1">Débil o irregular (1)</option>
                    <option value="0">Ausente (0)</option>
                </select>
            </div>

            <div>
                <label class="block font-medium text-slate-500 mb-0.5">Tono muscular</label>
                <select id="ap-tono" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <option value="" selected disabled>Seleccionar</option>
                    <option value="2">Movimiento activo (2)</option>
                    <option value="1">Cierta flexión (1)</option>
                    <option value="0">Flácido (0)</option>
                </select>
            </div>

            <div>
                <label class="block font-medium text-slate-500 mb-0.5">Irritabilidad refleja</label>
                <select id="ap-ref" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <option value="" selected disabled>Seleccionar</option>
                    <option value="2">Tos, estornudo o llanto (2)</option>
                    <option value="1">Mueca (1)</option>
                    <option value="0">Sin respuesta (0)</option>
                </select>
            </div>

            <div class="col-span-2">
                <label class="block font-medium text-slate-500 mb-0.5">Coloración</label>
                <select id="ap-col" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <option value="" selected disabled>Seleccionar</option>
                    <option value="2">Completamente rosado (2)</option>
                    <option value="1">Cuerpo rosado, extremidades cianóticas (1)</option>
                    <option value="0">Palidez o cianosis generalizada (0)</option>
                </select>
            </div>
        </div>

        <button onclick="calcApgar()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl">
            Calcular APGAR
        </button>

        <div id="ap-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden space-y-2"></div>

        <p class="text-[10px] text-slate-500">
            Registrar a 1 y 5 minutos en todos los recién nacidos.
            Si el puntaje a los 5 minutos es menor de 7, repetir cada
            5 minutos hasta los 20 minutos.
        </p>
    </div>
`
                },
                // 3. SILVERMAN ANDERSEN
                {
                    id: 'silverman',
                    cat: 'urgencias',
                    title: 'Test de Silverman-Andersen (Dificultad Respiratoria Neonatal)',
                    desc: 'Evaluación clínica de la dificultad respiratoria en recién nacidos mediante cinco signos observables.',
                    body: `
    <div class="space-y-2 text-xs">

        <p class="text-slate-500">
            Evalúa los cinco signos de dificultad respiratoria neonatal.
            Cada componente puntúa de 0 a 2.
        </p>

        <label class="block font-medium">Movimiento del tórax superior</label>
        <select id="sa-mta" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <option value="" selected disabled>Seleccionar</option>
            <option value="0">Sincrónico con abdomen (0)</option>
            <option value="1">Retraso inspiratorio (1)</option>
            <option value="2">Movimiento paradójico / en balancín (2)</option>
        </select>

        <label class="block font-medium">Retracción torácica inferior</label>
        <select id="sa-tir" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <option value="" selected disabled>Seleccionar</option>
            <option value="0">Ausente (0)</option>
            <option value="1">Apenas visible (1)</option>
            <option value="2">Marcada (2)</option>
        </select>

        <label class="block font-medium">Retracción xifoidea</label>
        <select id="sa-xif" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <option value="" selected disabled>Seleccionar</option>
            <option value="0">Ausente (0)</option>
            <option value="1">Apenas visible (1)</option>
            <option value="2">Marcada (2)</option>
        </select>

        <label class="block font-medium">Aleteo nasal</label>
        <select id="sa-ale" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <option value="" selected disabled>Seleccionar</option>
            <option value="0">Ausente (0)</option>
            <option value="1">Leve (1)</option>
            <option value="2">Intenso (2)</option>
        </select>

        <label class="block font-medium">Quejido respiratorio</label>
        <select id="sa-que" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <option value="" selected disabled>Seleccionar</option>
            <option value="0">Ausente (0)</option>
            <option value="1">Audible con estetoscopio (1)</option>
            <option value="2">Audible sin estetoscopio (2)</option>
        </select>

        <button onclick="calcSilverman()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl">
            Calcular Silverman-Andersen
        </button>

        <div id="sa-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden space-y-2"></div>
    </div>
`
                },
                // 4. IMC & SUP. CORPORAL (Res. 2465)
                {
                    id: 'imc',
                    cat: 'metabolico',
                    title: 'Índice de Masa Corporal (IMC) & Superficie Corporal',
                    desc: 'Clasificación nutricional para adultos según Res. 2465 de MinSalud Colombia.',
                    body: `   
<div class="space-y-3 text-xs">

    <div class="grid grid-cols-2 gap-2">
        <div>
            <label class="block font-medium mb-1">Edad (años)</label>
            <input type="number" inputmode="decimal" id="imc-edad" min="18" max="120" placeholder="Ej. 35" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        </div>
        <div>
            <label class="block font-medium mb-1">Peso (kg)</label>
            <input type="number" inputmode="decimal" id="imc-peso" min="20" max="300" step="0.1" placeholder="Ej. 70" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        </div>
        <div>
            <label class="block font-medium mb-1">Talla (cm)</label>
            <input type="number" inputmode="decimal" id="imc-talla" min="100" max="250" step="0.1" placeholder="Ej. 170" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        </div>
        <div>
            <label class="block font-medium mb-1">Cintura (cm) — opcional</label>
            <input type="number" inputmode="decimal" id="imc-cintura" min="40" max="200" step="0.1" placeholder="Opcional" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        </div>
    </div>

    <div>
        <label class="block font-medium mb-1">Sexo biológico</label>
        <select id="imc-sexo" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <option value="">Seleccionar</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
        </select>
    </div>

    <div>
        <label class="block font-medium mb-1">¿Embarazo?</label>
        <select id="imc-gestante" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <option value="">Seleccionar</option>
            <option value="no">No</option>
            <option value="si">Sí</option>
        </select>
    </div>

    <button onclick="calcIMC()" class="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl">
        Calcular
    </button>

    <div id="imc-res" class="hidden p-3 rounded-xl bg-slate-100 dark:bg-slate-900 space-y-2"></div>

</div>

                    `
                },
                {
                    id: 'liquidos-ped',
                    cat: 'metabolico',
                    title: 'Líquidos basales en pediatría (Holliday-Segar)',
                    desc: 'Volumen de mantenimiento en niños con la regla 4-2-1 y alternativa por superficie corporal.',
                    body: `
<div class="space-y-3 text-xs">

    <div>
        <label class="block font-medium mb-1">Peso (kg)</label>
        <input type="number" inputmode="decimal" id="liq-peso" min="0.5" max="150" step="0.1" placeholder="Ej. 12" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
    </div>

    <div class="grid grid-cols-2 gap-2">
        <div>
            <label class="block font-medium mb-1">Talla (cm) — opcional</label>
            <input type="number" inputmode="decimal" id="liq-talla" min="30" max="200" step="0.1" placeholder="Para superficie corporal" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        </div>
        <div>
            <label class="block font-medium mb-1">Edad (años) — opcional</label>
            <input type="number" inputmode="decimal" id="liq-edad" min="0" max="18" step="0.1" placeholder="Ej. 3" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        </div>
    </div>

    <button onclick="calcLiquidosPed()" class="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl">
        Calcular
    </button>

    <div id="liq-res" class="hidden p-3 rounded-xl bg-slate-100 dark:bg-slate-900 space-y-1.5"></div>

    <details class="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 p-2">
        <summary class="cursor-pointer font-bold text-[11px] text-slate-600 dark:text-slate-300">Regla 4-2-1 (Holliday-Segar)</summary>
        <ul class="mt-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
            <li>≤ 10 kg: <strong>100 mL/kg/día</strong> (4 mL/kg/h).</li>
            <li>10 - 20 kg: <strong>1.000 mL + 50 mL/kg</strong> por cada kg &gt; 10 (40 + 2 mL/kg/h).</li>
            <li>&gt; 20 kg: <strong>1.500 mL + 20 mL/kg</strong> por cada kg &gt; 20 (60 + 1 mL/kg/h).</li>
            <li>Alternativa &gt; 30 kg: 1.500 mL/m²/día de superficie corporal.</li>
        </ul>
    </details>

</div>
                    `
                },
                // 5. CENTOR MODIFICADO
                {
                    id: 'centor',
                    cat: 'urgencias',
                    title: 'Criterios de Centor Modificados (Faringoamigdalitis Estreptocócica)',
                    desc: 'Probabilidad clínica de faringitis por S. pyogenes y guía de antibiótico.',
                    body: `
    <div class="space-y-2 text-xs">
        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="cn-f" class="cn-chk">
            <span>Temperatura ≥ 38 °C (+1)</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="cn-t" class="cn-chk">
            <span>Ausencia de tos (+1)</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="cn-a" class="cn-chk">
            <span>Adenopatías cervicales anteriores dolorosas (+1)</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="cn-e" class="cn-chk">
            <span>Exudado o hipertrofia amigdalina (+1)</span>
        </label>

        <div>
            <label class="block font-medium text-slate-500 mb-1">
                Edad:
            </label>
            <select id="cn-ed"
                class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                <option value="" selected disabled>Seleccionar edad</option>
                <option value="1">3 - 14 años (+1)</option>
                <option value="0">15 - 44 años (0)</option>
                <option value="-1">45 años o más (−1)</option>
            </select>
        </div>

        <button onclick="calcCentor()"
            class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">
            Calcular Centor
        </button>

        <div id="centor-res"
            class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden">
        </div>

        <p class="text-[10px] text-slate-500 leading-relaxed">
            La escala orienta la necesidad de pruebas diagnósticas.
            No confirma por sí sola una infección estreptocócica.
        </p>
    </div>
`
                },
                // 2. MINI-MENTAL (MMSE)
                {
                    id: 'mmse',
                    cat: 'neuro',
                    title: 'Mini-Mental State Examination (MMSE - Folstein)',
                    desc: 'Cribado neuropsicológico estándar de 30 puntos para deterioro cognitivo y demencia.',
                    body: `
    <div class="space-y-2 text-xs">

        <p class="text-[11px] text-slate-500">
            Registra los puntos obtenidos en cada dominio después de aplicar
            la versión validada del instrumento.
        </p>

        <div class="grid grid-cols-2 gap-2">
            <div>
                <label class="block font-medium">Orientación temporal (0–5)</label>
                <input type="number" inputmode="decimal" id="mmse-ot" min="0" max="5" step="1"
                    placeholder="0–5"
                    class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            </div>
            <div>
                <label class="block font-medium">Orientación espacial (0–5)</label>
                <input type="number" inputmode="decimal" id="mmse-oe" min="0" max="5" step="1"
                    placeholder="0–5"
                    class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            </div>
            <div>
                <label class="block font-medium">Fijación / registro (0–3)</label>
                <input type="number" inputmode="decimal" id="mmse-fij" min="0" max="3" step="1"
                    placeholder="0–3"
                    class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            </div>
            <div>
                <label class="block font-medium">Atención / cálculo (0–5)</label>
                <input type="number" inputmode="decimal" id="mmse-at" min="0" max="5" step="1"
                    placeholder="0–5"
                    class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            </div>
            <div>
                <label class="block font-medium">Memoria diferida (0–3)</label>
                <input type="number" inputmode="decimal" id="mmse-mem" min="0" max="3" step="1"
                    placeholder="0–3"
                    class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            </div>
            <div>
                <label class="block font-medium">Lenguaje / dibujo (0–9)</label>
                <input type="number" inputmode="decimal" id="mmse-leng" min="0" max="9" step="1"
                    placeholder="0–9"
                    class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            </div>
        </div>

        <div class="border-t border-slate-300 dark:border-slate-700 pt-2 space-y-2">

            <label class="block font-medium">Edad (años)</label>
            <input type="number" inputmode="decimal" id="mmse-edad" min="18" max="120"
                placeholder="Ej. 72"
                class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">

            <label class="block font-medium">Escolaridad completada</label>
            <select id="mmse-esc"
                class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <option value="" selected disabled>Seleccionar</option>
                <option value="21">0–5 años</option>
                <option value="24">6–12 años</option>
                <option value="26">Más de 12 años</option>
            </select>

            <label class="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" id="mmse-visual" class="mt-0.5">
                <span>Alteración visual evidente (ajuste de +2 puntos según documento de referencia colombiano).</span>
            </label>
        </div>

        <button onclick="calcMMSE()"
            class="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl">
            Calcular MMSE
        </button>

        <div id="mmse-res"
            class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden space-y-2">
        </div>

        <p class="text-[10px] text-slate-500">
            Herramienta de puntuación. No sustituye la aplicación estandarizada
            del instrumento ni la evaluación clínica. Los ajustes y puntos de
            corte deben interpretarse según la versión utilizada y el contexto.
        </p>
    </div>
`
                },
                // 3. PFEFFER (FAQ)
                {
    id: 'pfeffer',
    cat: 'neuro',
    title: 'Cuestionario de Actividades Funcionales de Pfeffer (FAQ)',
    desc: 'Evaluación funcional del adulto mayor a través del cuidador (punto de corte ≥ 6 sugiere deterioro funcional; algunos autores usan ≥ 9).',
    body: `
    <div class="space-y-2 text-xs">

        <p class="text-[11px] text-slate-500">
            Debe responder un familiar o cuidador que conozca las actividades
            habituales del paciente. Valora su desempeño actual comparado
            con su funcionamiento previo.
        </p>

        ${PFEFFER_ITEMS.map((t, i) => `
            <div class="space-y-1 border-b border-slate-200 dark:border-slate-700 pb-2">
                <label class="block font-medium">
                    ${i + 1}. ${t}
                </label>

                <select id="pf-${i + 1}"
                    class="pf-sel w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <option value="" selected disabled>Seleccionar respuesta</option>
                    <option value="0">0 - Realiza la actividad normalmente</option>
                    <option value="1">1 - Tiene dificultad, pero la realiza solo</option>
                    <option value="2">2 - Necesita ayuda</option>
                    <option value="3">3 - Es dependiente</option>
                    <option value="0">0 - Nunca la realizó, pero podría hacerla</option>
                    <option value="1">1 - Nunca la realizó y tendría dificultad</option>
                </select>
            </div>
        `).join('')}

        <button onclick="calcPfeffer()"
            class="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl">
            Calcular Pfeffer
        </button>

        <div id="pfeffer-res"
            class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden space-y-2">
        </div>

        <p class="text-[10px] text-slate-500">
            Un puntaje elevado indica mayor dificultad en actividades
            instrumentales. Interpretar considerando escolaridad, cultura,
            oportunidades previas para realizar cada actividad y limitaciones
            físicas o sensoriales.
        </p>
    </div>
`
},
                // 4. CHA2DS2-VASc
                {
                    id: 'chads',
                    cat: 'cardio',
                    title: 'Riesgo Embolígeno CHA₂DS₂-VASc (Fibrilación Auricular)',
                    desc: 'Decisión de anticoagulación oral en FA no valvular.',
                    body: `
    <div class="space-y-2 text-xs">

        <label class="block font-medium">Edad (años)</label>
        <input type="number" inputmode="decimal" id="ch-edad" min="18" max="120"
            placeholder="Ej. 68"
            class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">

        <label class="block font-medium">Categoría de sexo para CHA₂DS₂-VASc</label>
        <select id="ch-sexo"
            class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <option value="" selected disabled>Seleccionar</option>
            <option value="m">Masculino</option>
            <option value="f">Femenino</option>
        </select>

        <div class="border-t border-slate-300 dark:border-slate-700 pt-2 space-y-2">

            <label class="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" id="ch-c" class="ch-chk mt-0.5">
                <span><strong>C (+1):</strong> Insuficiencia cardíaca clínica, independientemente de la FEVI, o FEVI ≤40%.</span>
            </label>

            <label class="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" id="ch-h" class="ch-chk mt-0.5">
                <span><strong>H (+1):</strong> Hipertensión diagnosticada o tratamiento antihipertensivo actual.</span>
            </label>

            <label class="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" id="ch-d" class="ch-chk mt-0.5">
                <span><strong>D (+1):</strong> Diabetes mellitus tipo 1 o 2.</span>
            </label>

            <label class="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" id="ch-s2" class="ch-chk mt-0.5">
                <span><strong>S₂ (+2):</strong> ACV, AIT o tromboembolismo arterial previo.</span>
            </label>

            <label class="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" id="ch-v" class="ch-chk mt-0.5">
                <span><strong>V (+1):</strong> Enfermedad vascular: infarto de miocardio, enfermedad arterial periférica o placa aórtica significativa.</span>
            </label>

        </div>

        <button onclick="calcCHA2DS2VASc()"
            class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">
            Calcular riesgo tromboembólico
        </button>

        <div id="chads-res"
            class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden space-y-2">
        </div>

    </div>
`
                },
                // 5. HAS-BLED
                {
                    id: 'hasbled',
                    cat: 'cardio',
                    title: 'Riesgo de Sangrado HAS-BLED',
                    desc: 'Evaluación del riesgo de sangrado mayor bajo anticoagulación.',
                    body: `
    <div class="space-y-2 text-xs">

        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="hb-h" class="hb-chk">
            <span>H - Hipertensión no controlada: PAS > 160 mmHg (+1)</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="hb-s" class="hb-chk">
            <span>S - ACV previo, isquémico o hemorrágico (+1)</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="hb-b" class="hb-chk">
            <span>B - Antecedente de sangrado mayor o predisposición al sangrado (+1)</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="hb-l" class="hb-chk">
            <span>L - INR lábil: TTR < 60% en tratamiento con warfarina u otro AVK (+1)</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="hb-e" class="hb-chk">
            <span>E - Edad ≥ 65 años (+1)</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="hb-a1" class="hb-chk">
            <span>A - Función renal alterada: diálisis, trasplante renal o creatinina > 2.26 mg/dL (+1)</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="hb-a2" class="hb-chk">
            <span>A - Función hepática alterada: cirrosis o bilirrubina > 2 veces el límite normal junto con AST, ALT o FA > 3 veces el límite normal (+1)</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="hb-d1" class="hb-chk">
            <span>D - Uso concomitante de antiagregantes o AINE (+1)</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="hb-d2" class="hb-chk">
            <span>D - Consumo excesivo de alcohol (≥ 8 unidades por semana) (+1)</span>
        </label>

        <button onclick="calcHASBLED()"
            class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">
            Calcular HAS-BLED
        </button>

        <div id="hasbled-res"
            class="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 font-bold hidden">
        </div>

        <p class="text-[10px] text-slate-500 leading-relaxed">
            HAS-BLED estima el riesgo de sangrado en pacientes con fibrilación
            auricular. Un puntaje elevado indica la necesidad de revisar y
            corregir factores modificables; no constituye por sí solo una
            contraindicación para anticoagular.
        </p>
    </div>
`
                },
                // 6. CURB-65
                {
                    id: 'curb65',
                    cat: 'urgencias',
                    title: 'Escala CURB-65 (Mortalidad por NAC)',
                    desc: 'Estimación del riesgo de mortalidad a 30 días y orientación del lugar de atención en adultos con NAC.',
                    body: `
    <div class="space-y-2 text-xs">

        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="cb-c" class="cb-chk">
            <span>C - Confusión mental de novo (desorientación o alteración aguda del estado mental) (+1)</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="cb-u" class="cb-chk">
            <span>U - Urea > 7 mmol/L o BUN > 19 mg/dL (+1)</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="cb-r" class="cb-chk">
            <span>R - Frecuencia respiratoria ≥ 30 rpm (+1)</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="cb-b" class="cb-chk">
            <span>B - Presión arterial: PAS < 90 mmHg o PAD ≤ 60 mmHg (+1)</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="cb-65" class="cb-chk">
            <span>65 - Edad ≥ 65 años (+1)</span>
        </label>

        <button onclick="calcCURB65()"
            class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">
            Calcular CURB-65
        </button>

        <div id="curb65-res"
            class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden">
        </div>

        <p class="text-[10px] text-slate-500 leading-relaxed">
            Escala para adultos con neumonía adquirida en la comunidad.
            Estima riesgo de mortalidad; no determina por sí sola el
            ingreso a UCI ni garantiza que el manejo ambulatorio sea seguro.
        </p>
    </div>
`
                },
                // 7. qSOFA
                {
                    id: 'qsofa',
                    cat: 'urgencias',
                    title: 'Criterios qSOFA (Quick SOFA - Sepsis)',
                    desc: 'Tamizaje rápido de riesgo en sospecha de infección fuera de UCI.',
                    body: `
    <div class="space-y-2 text-xs">

        <p class="text-slate-500">
            Evaluación de riesgo en adultos con sospecha de infección.
        </p>

        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="qs-m" class="qs-chk">
            <span>Alteración aguda del estado mental (Glasgow < 15) (+1)</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="qs-r" class="qs-chk">
            <span>Frecuencia respiratoria ≥ 22 rpm (+1)</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="qs-p" class="qs-chk">
            <span>Presión arterial sistólica ≤ 100 mmHg (+1)</span>
        </label>

        <button onclick="calcQSOFA()"
            class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">
            Evaluar qSOFA
        </button>

        <div id="qsofa-res"
            class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden">
        </div>

        <p class="text-[10px] text-slate-500 leading-relaxed">
            qSOFA es una herramienta de estratificación de riesgo,
            no diagnostica ni descarta sepsis. No debe utilizarse
            como única herramienta de cribado.
        </p>
    </div>
`
                },
                // 8. CHILD-PUGH
                {
                    id: 'childpugh',
                    cat: 'gastro',
                    title: 'Escala de Child-Pugh (Cirrosis Hepática)',
                    desc: 'Clasificación de gravedad de la enfermedad hepática crónica mediante cinco parámetros clínicos y de laboratorio.',
                    body: `
                        <div class="space-y-2 text-xs">
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <label class="block font-medium text-slate-500 mb-0.5">Bilirrubina (mg/dL):</label>
                                    <select id="cp-bili" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                        <option value="1">&lt; 2.0 (1 pt)</option>
                                        <option value="2">2.0 - 3.0 (2 pts)</option>
                                        <option value="3">&gt; 3.0 (3 pts)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block font-medium text-slate-500 mb-0.5">Albúmina (g/dL):</label>
                                    <select id="cp-alb" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                        <option value="1">&gt; 3.5 (1 pt)</option>
                                        <option value="2">2.8 - 3.5 (2 pts)</option>
                                        <option value="3">&lt; 2.8 (3 pts)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <label class="block font-medium text-slate-500 mb-0.5">INR:</label>
                                    <select id="cp-inr" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                        <option value="1">&lt; 1.7 (1 pt)</option>
                                        <option value="2">1.7 - 2.3 (2 pts)</option>
                                        <option value="3">&gt; 2.3 (3 pts)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block font-medium text-slate-500 mb-0.5">Ascitis:</label>
                                    <select id="cp-asc" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                        <option value="1">Ausente (1 pt)</option>
                                        <option value="2">Leve o controlada con diuréticos (2 pts)</option>
                                        <option value="3">Moderada-severa o refractaria (3 pts)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label class="block font-medium text-slate-500 mb-0.5">Encefalopatía Hepática:</label>
                                <select id="cp-enc" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                    <option value="1">Ausente (1 pt)</option>
                                    <option value="2">Grado I - II (2 pts)</option>
                                    <option value="3">Grado III - IV (3 pts)</option>
                                </select>
                            </div>
                            <button onclick="calcChildPugh()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular Child-Pugh</button>
                            <div id="cp-res" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 font-bold hidden"></div>
                        </div>
                    `
                },
                // 9. ALVARADO (Apendicitis)
                {
                    id: 'alvarado',
                    cat: 'gastro',
                    title: 'Escala de Alvarado (Apendicitis Aguda)',
                    desc: 'Estratificación clínica de probabilidad de apendicitis aguda mediante criterios clínicos y de laboratorio.',
                    body: `
                        <div class="space-y-1.5 text-xs">
                            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="al-m" class="al-chk"> <span>Migración del dolor a FID (+1)</span></label>
                            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="al-a" class="al-chk"> <span>Anorexia / Cetonuria (+1)</span></label>
                            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="al-n" class="al-chk"> <span>Náuseas / Vómito (+1)</span></label>
                            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="al-t" class="al-chk"> <span>Sensibilidad en FID (+2)</span></label>
                            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="al-r" class="al-chk"> <span>Rebote / Blumberg positivo (+1)</span></label>
                            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="al-e" class="al-chk"> <span>Temperatura > 37.3 °C (+1)</span></label>
                            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="al-l" class="al-chk"> <span>Leucocitosis > 10.000 /mm³ (+2)</span></label>
                            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="al-s" class="al-chk"> <span>Desviación a la izquierda (Neutrófilos > 75%) (+1)</span></label>
                            <button onclick="calcAlvarado()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular Alvarado</button>
                            <div id="alvarado-res" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 font-bold hidden"></div>
                        </div>
                    `
                },
                // 10. WELLS TVP
                {
                    id: 'wellstvp',
                    cat: 'urgencias',
                    title: 'Escala de Wells para TVP',
                    desc: 'Probabilidad pre-test de Trombosis Venosa Profunda.',
                    body: `
    <div class="space-y-2 text-xs">

        <p class="font-medium text-slate-500">
            Marca los criterios presentes en el paciente.
            Cada criterio suma 1 punto, excepto el diagnóstico alternativo (-2).
        </p>

        <label class="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" id="wt-c" class="wt-chk mt-0.5">
            <span><strong>+1:</strong> Cáncer activo: tratamiento en curso, tratamiento en los últimos 6 meses o manejo paliativo.</span>
        </label>

        <label class="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" id="wt-p" class="wt-chk mt-0.5">
            <span><strong>+1:</strong> Parálisis, paresia o inmovilización reciente con yeso de una extremidad inferior.</span>
        </label>

        <label class="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" id="wt-r" class="wt-chk mt-0.5">
            <span><strong>+1:</strong> Encamamiento durante 3 días o más, o cirugía mayor en las últimas 12 semanas con anestesia general o regional.</span>
        </label>

        <label class="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" id="wt-t" class="wt-chk mt-0.5">
            <span><strong>+1:</strong> Dolor a la palpación localizado en el trayecto del sistema venoso profundo.</span>
        </label>

        <label class="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" id="wt-s" class="wt-chk mt-0.5">
            <span><strong>+1:</strong> Edema de toda la extremidad inferior.</span>
        </label>

        <label class="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" id="wt-d" class="wt-chk mt-0.5">
            <span><strong>+1:</strong> Pantorrilla al menos 3 cm mayor que la contralateral, medida 10 cm por debajo de la tuberosidad tibial.</span>
        </label>

        <label class="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" id="wt-e" class="wt-chk mt-0.5">
            <span><strong>+1:</strong> Edema con fóvea, limitado a la extremidad sintomática.</span>
        </label>

        <label class="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" id="wt-v" class="wt-chk mt-0.5">
            <span><strong>+1:</strong> Venas colaterales superficiales no varicosas.</span>
        </label>

        <label class="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" id="wt-a" class="wt-chk mt-0.5">
            <span><strong>+1:</strong> Antecedente de TVP documentada.</span>
        </label>

        <label class="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" id="wt-alt" class="wt-chk mt-0.5">
            <span><strong>-2:</strong> Diagnóstico alternativo al menos tan probable como TVP.</span>
        </label>

        <button onclick="calcWellsTVP()"
            class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">
            Calcular Wells TVP
        </button>

        <div id="wellstvp-res"
            class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden space-y-2">
        </div>
    </div>
`
                },
                // 11. FINDRISC
                {
                    id: 'findrisc',
                    cat: 'metabolico',
                    title: 'Riesgo de Diabetes a 10 Años (FINDRISC)',
                    desc: 'Test de detección rápida del riesgo de desarrollar Diabetes Mellitus Tipo 2.',
                    body: `
                        <div class="space-y-2 text-xs">
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <label class="block font-medium text-slate-500 mb-0.5">Edad:</label>
                                    <select id="fd-edad" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                        <option value="0">&lt; 45 años (0 pt)</option>
                                        <option value="2">45 - 54 años (2 pts)</option>
                                        <option value="3">55 - 64 años (3 pts)</option>
                                        <option value="4">&gt; 64 años (4 pts)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block font-medium text-slate-500 mb-0.5">IMC (kg/m²):</label>
                                    <select id="fd-imc" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                        <option value="0">&lt; 25 (0 pt)</option>
                                        <option value="1">25 - 30 (1 pt)</option>
                                        <option value="3">≥ 30 (3 pts)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div>
    <label class="block font-medium text-slate-500 mb-0.5">
        Sexo para puntos de corte de cintura:
    </label>

    <select id="fd-sexo"
        class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        <option value="" selected disabled>Seleccionar</option>
        <option value="h">Hombre</option>
        <option value="m">Mujer</option>
    </select>
</div>

<div>
    <label class="block font-medium text-slate-500 mb-0.5">
        Perímetro abdominal (cm):
    </label>

    <input type="number" inputmode="decimal" id="fd-perim" min="30" max="200"
        step="0.1" placeholder="Ej. 95"
        class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
</div>
                                <div>
                                    <label class="block font-medium text-slate-500 mb-0.5">Actividad Física 30 min/día:</label>
                                    <select id="fd-actividad" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                        <option value="0">Sí (0 pt)</option>
                                        <option value="2">No (2 pts)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <label class="block font-medium text-slate-500 mb-0.5">Antecedente de Glucosa Alta:</label>
                                    <select id="fd-glucosa" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                        <option value="0">No (0 pt)</option>
                                        <option value="5">Sí (5 pts)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block font-medium text-slate-500 mb-0.5">Familiares con Diabetes:</label>
                                    <select id="fd-fam" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                        <option value="0">No (0 pt)</option>
                                        <option value="3">Abuelos/Tíos/Primos (3 pts)</option>
                                        <option value="5">Padres/Hermanos/Hijos (5 pts)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
    <div>
        <label class="block font-medium text-slate-500 mb-0.5">Verduras o frutas:</label>
        <select id="fd-fruta" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <option value="0">Todos los días (0 pt)</option>
            <option value="1">No todos los días (1 pt)</option>
        </select>
    </div>
    <div>
        <label class="block font-medium text-slate-500 mb-0.5">Medicación antihipertensiva:</label>
        <select id="fd-hta" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <option value="0">No la toma (0 pt)</option>
            <option value="2">Sí la toma (2 pts)</option>
        </select>
    </div>
</div>
                            <button onclick="calcFindrisc()" class="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow transition-all">Calcular FINDRISC</button>
                            <div id="fd-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 font-bold hidden space-y-1"></div>
                        </div>
                    `
                },
                // 12. OSMOLARIDAD EFECTIVA
                {
                    id: 'osmolaridad',
                    cat: 'metabolico',
                    title: 'Osmolaridad Efectiva & Sodio Corregido',
                    desc: 'Cálculo para EHH (≥ 320 mOsm/kg) y Cetoacidosis Diabética.',
                    body: `
    <div class="space-y-2 text-xs">
        <label class="block font-medium">Sodio medido (mEq/L)</label>
        <input type="number" inputmode="decimal" id="osm-na" min="80" max="200" step="0.1"
            placeholder="Ej. 140"
            class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">

        <label class="block font-medium">Glucosa (mg/dL)</label>
        <input type="number" inputmode="decimal" id="osm-glu" min="1" max="2000" step="1"
            placeholder="Ej. 600"
            class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">

        <label class="block font-medium">BUN (mg/dL) — opcional</label>
        <input type="number" inputmode="decimal" id="osm-bun" min="0" max="300" step="0.1"
            placeholder="Ej. 30 (opcional)"
            class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">

        <p class="text-slate-500">
            El BUN permite calcular la osmolalidad total. Si no lo tienes, se calcula únicamente la efectiva.
        </p>

        <button onclick="calcOsmolaridad()"
            class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl">
            Calcular
        </button>

        <div id="osm-res"
            class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden space-y-2">
        </div>
    </div>
`
                },
                // 13. PAM
                {
                    id: 'pam',
                    cat: 'cardio',
                    title: 'Presión Arterial Media (PAM)',
desc: 'Cálculo de presión arterial media y orientación de metas iniciales en shock séptico según Surviving Sepsis Campaign 2026.',
                    body: `   
<div class="space-y-3 text-xs">

    <div class="grid grid-cols-2 gap-2">
        <div>
            <label class="block font-medium mb-1">Presión sistólica (PAS), mmHg</label>
            <input type="number" inputmode="decimal" id="pam-pas" min="40" max="300" step="1" placeholder="Ej. 120" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        </div>
        <div>
            <label class="block font-medium mb-1">Presión diastólica (PAD), mmHg</label>
            <input type="number" inputmode="decimal" id="pam-pad" min="20" max="200" step="1" placeholder="Ej. 80" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        </div>
    </div>

    <div>
        <label class="block font-medium mb-1">Contexto clínico</label>
        <select id="pam-contexto" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <option value="">Seleccione el contexto</option>
            <option value="shock">Shock séptico en tratamiento con vasopresores</option>
            <option value="otro">Otro contexto clínico</option>
        </select>
    </div>

    <div id="pam-edad-contenedor">
        <label class="block font-medium mb-1">Edad (años)</label>
        <input type="number" inputmode="decimal" id="pam-edad" min="18" max="120" step="1" placeholder="Ej. 65" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
    </div>

    <div class="text-[10px] text-slate-500">
        Fórmula: PAM = (PAS + 2 × PAD) / 3. Es una estimación; la interpretación depende del contexto clínico.
    </div>

    <button onclick="calcPAM()" class="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl">
        Calcular PAM
    </button>

    <div id="pam-res" class="hidden p-3 rounded-xl bg-slate-100 dark:bg-slate-900 space-y-2"></div>

</div>
                    `
                },
                // 14. eTFG CKD-EPI
                {
                    id: 'tfg',
                    cat: 'metabolico',
                    title: 'Tasa de Filtración Glomerular (eTFG CKD-EPI 2021)',
                    desc: 'Estimación de función renal según creatinina plasmática sin raza.',
                    body: `
    <div class="space-y-2 text-xs">

        <label class="block font-medium">Creatinina sérica (mg/dL)</label>
        <input type="number" inputmode="decimal" id="tfg-cr" min="0.1" max="20" step="0.01"
            placeholder="Ej. 1.0"
            class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">

        <label class="block font-medium">Edad (años)</label>
        <input type="number" inputmode="decimal" id="tfg-edad" min="18" max="120" step="1"
            placeholder="Ej. 65"
            class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">

        <label class="block font-medium">Sexo utilizado por la ecuación CKD-EPI 2021</label>
        <select id="tfg-sexo"
            class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <option value="" selected disabled>Seleccionar</option>
            <option value="F">Femenino</option>
            <option value="M">Masculino</option>
        </select>

        <p class="text-slate-500">
            Utiliza creatinina sérica estandarizada. Esta ecuación está destinada
            a adultos y no debe utilizarse en menores de 18 años.
        </p>

        <button onclick="calcTFG()"
            class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl">
            Calcular TFG
        </button>

        <div id="tfg-res"
            class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden space-y-2">
        </div>
    </div>
`
                },
                // 15. TABAQUISMO
                {
                    id: 'tabaquismo',
                    cat: 'urgencias',
                    title: 'Índice tabáquico (Paquetes/año)',
                    desc: 'Cuantifica la exposición acumulada al cigarrillo en fumadores actuales y exfumadores.',
                    body: `     
<div class="space-y-3 text-xs">
    <div>
        <label class="block font-medium mb-1">Antecedente de tabaquismo</label>
        <select id="tab-estado" onchange="toggleTabInputs()" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <option value="">Seleccione</option>
            <option value="nunca">Nunca ha fumado</option>
            <option value="actual">Fumador actual</option>
            <option value="ex">Exfumador</option>
        </select>
    </div>

    <div id="tab-datos" class="hidden space-y-2">

        <div>
            <label class="block font-medium mb-1">Promedio de cigarrillos al día</label>
            <input type="number" inputmode="decimal" id="tab-cigs" min="0.1" max="100" step="0.1" placeholder="Ej. 20" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        </div>

        <div>
            <label class="block font-medium mb-1">Años de consumo</label>
            <input type="number" inputmode="decimal" id="tab-anos" min="0.1" max="80" step="0.1" placeholder="Ej. 15" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        </div>

        <div id="tab-abandono" class="hidden">
            <label class="block font-medium mb-1">Años desde que dejó de fumar (opcional)</label>
            <input type="number" inputmode="decimal" id="tab-anos-abandono" min="0" max="100" step="0.1" placeholder="Ej. 5" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        </div>

    </div>

    <div class="text-[10px] text-slate-500">
        Un paquete estándar equivale a 20 cigarrillos.
        Si el consumo cambió con el tiempo, estime el promedio de exposición por periodos.
    </div>

    <button onclick="calcTabaquismo()" class="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl">
        Calcular paquetes/año
    </button>

    <div id="tab-res" class="hidden p-3 rounded-xl bg-slate-100 dark:bg-slate-900 space-y-2"></div>

</div>
                    `
                },
                {
                    id: 'framingham',
                    cat: 'cardio',
                    title: 'Framingham 2008 — Riesgo cardiovascular global',
                    desc: 'Estimación de riesgo cardiovascular global a 10 años. Modelo original, no recalibrado para Colombia. Uso de referencia, no primera línea.',
                    body: `      
<div class="space-y-3 text-xs">

    <div class="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
        <strong>Modelo de referencia:</strong> Framingham 2008 original. No está recalibrado para Colombia y no es la herramienta de primera línea recomendada actualmente en Colombia.
    </div>

    <div class="font-bold text-sm">1. Datos del paciente</div>

    <div class="grid grid-cols-2 gap-2">
        <div>
            <label class="block mb-1 font-medium">Edad (años)</label>
            <input type="number" inputmode="decimal" id="fr-edad" min="30" max="74" step="1" placeholder="30–74" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        </div>

        <div>
            <label class="block mb-1 font-medium">Sexo</label>
            <select id="fr-sexo" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <option value="">Seleccionar</option>
                <option value="F">Mujer</option>
                <option value="M">Hombre</option>
            </select>
        </div>
    </div>

    <div class="font-bold text-sm pt-1">2. Perfil lipídico</div>

    <div class="grid grid-cols-2 gap-2">
        <div>
            <label class="block mb-1 font-medium">Colesterol total (mg/dL)</label>
            <input type="number" inputmode="decimal" id="fr-ct" min="80" max="400" step="1" placeholder="Ej. 200" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        </div>

        <div>
            <label class="block mb-1 font-medium">HDL (mg/dL)</label>
            <input type="number" inputmode="decimal" id="fr-hdl" min="10" max="120" step="1" placeholder="Ej. 50" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        </div>
    </div>

    <div class="font-bold text-sm pt-1">3. Presión arterial</div>

    <div>
        <label class="block mb-1 font-medium">Presión arterial sistólica (mmHg)</label>
        <input type="number" inputmode="decimal" id="fr-pas" min="70" max="250" step="1" placeholder="Ej. 120" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
    </div>

    <div>
        <label class="block mb-1 font-medium">¿Recibe tratamiento antihipertensivo?</label>
        <select id="fr-trat" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <option value="">Seleccionar</option>
            <option value="0">No</option>
            <option value="1">Sí</option>
        </select>
    </div>

    <div class="font-bold text-sm pt-1">4. Factores de riesgo</div>

    <div>
        <label class="block mb-1 font-medium">¿Es fumador actualmente?</label>
        <select id="fr-fuma" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <option value="">Seleccionar</option>
            <option value="0">No</option>
            <option value="1">Sí</option>
        </select>
    </div>

    <div>
        <label class="block mb-1 font-medium">¿Tiene diabetes mellitus?</label>
        <select id="fr-dm" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <option value="">Seleccionar</option>
            <option value="0">No</option>
            <option value="1">Sí</option>
        </select>
    </div>

    <div class="border-t border-slate-200 dark:border-slate-700 pt-3">
        <label class="block mb-1 font-medium">¿Tiene enfermedad cardiovascular establecida?</label>
        <select id="fr-ecv" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <option value="">Seleccionar</option>
            <option value="0">No</option>
            <option value="1">Sí</option>
        </select>
        <p class="text-[10px] text-slate-500 mt-1">
            Ejemplos: infarto, angina, ACV isquémico, enfermedad arterial periférica o insuficiencia cardiaca de origen cardiovascular.
        </p>
    </div>

    <button type="button" onclick="calcFramingham()" class="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl">
        Calcular riesgo cardiovascular
    </button>

    <div id="fr-res" class="hidden p-3 rounded-xl bg-slate-100 dark:bg-slate-900 space-y-2"></div>

</div>

                    `
                },  
{
    id: 'lawton',
    cat: 'neuro',
    title: 'Escala de Lawton-Brody (Actividades Instrumentales)',
    desc: 'Evalúa ocho dominios de funcionamiento instrumental. Registra el nivel funcional habitual de la persona.',
    body: `
        <div class="space-y-2 text-xs">
            <p class="text-slate-500 dark:text-slate-400">
                Selecciona una opción por actividad. Valora lo que la persona realmente puede hacer, no solamente lo que acostumbra hacer.
            </p>

            <div class="space-y-1">
                <label class="font-semibold">1. Uso del teléfono</label>
                <select id="lw-1" class="lw-sel w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <option value="">Seleccionar...</option>
                    <option value="1">1 punto — Usa el teléfono, marca números conocidos o contesta</option>
                    <option value="0">0 puntos — No utiliza el teléfono</option>
                    <option value="na">No evaluable / nunca lo ha realizado</option>
                </select>
            </div>

            <div class="space-y-1">
                <label class="font-semibold">2. Compras</label>
                <select id="lw-2" class="lw-sel w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <option value="">Seleccionar...</option>
                    <option value="1">1 punto — Realiza sus compras habituales sin ayuda</option>
                    <option value="0">0 puntos — Solo compra artículos pequeños, necesita acompañamiento o no puede comprar</option>
                    <option value="na">No evaluable / nunca lo ha realizado</option>
                </select>
            </div>

            <div class="space-y-1">
                <label class="font-semibold">3. Preparación de alimentos</label>
                <select id="lw-3" class="lw-sel w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <option value="">Seleccionar...</option>
                    <option value="1">1 punto — Planifica, prepara y sirve comidas adecuadas de forma independiente</option>
                    <option value="0">0 puntos — Requiere ingredientes preparados, solo recalienta o necesita que otra persona prepare la comida</option>
                    <option value="na">No evaluable / nunca lo ha realizado</option>
                </select>
            </div>

            <div class="space-y-1">
                <label class="font-semibold">4. Tareas del hogar</label>
                <select id="lw-4" class="lw-sel w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <option value="">Seleccionar...</option>
                    <option value="1">1 punto — Realiza tareas domésticas, incluso tareas ligeras</option>
                    <option value="0">0 puntos — No participa en las tareas del hogar</option>
                    <option value="na">No evaluable / nunca lo ha realizado</option>
                </select>
            </div>

            <div class="space-y-1">
                <label class="font-semibold">5. Lavado de ropa</label>
                <select id="lw-5" class="lw-sel w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <option value="">Seleccionar...</option>
                    <option value="1">1 punto — Lava toda su ropa o prendas pequeñas</option>
                    <option value="0">0 puntos — Otra persona realiza todo el lavado</option>
                    <option value="na">No evaluable / nunca lo ha realizado</option>
                </select>
            </div>

            <div class="space-y-1">
                <label class="font-semibold">6. Transporte</label>
                <select id="lw-6" class="lw-sel w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <option value="">Seleccionar...</option>
                    <option value="1">1 punto — Usa transporte público, gestiona su taxi o conduce</option>
                    <option value="0">0 puntos — Solo se desplaza en vehículo con ayuda de otra persona o no viaja</option>
                    <option value="na">No evaluable / nunca lo ha realizado</option>
                </select>
            </div>

            <div class="space-y-1">
                <label class="font-semibold">7. Manejo de medicamentos</label>
                <select id="lw-7" class="lw-sel w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <option value="">Seleccionar...</option>
                    <option value="1">1 punto — Administra correctamente sus dosis y horarios sin ayuda</option>
                    <option value="0">0 puntos — Necesita que otra persona prepare o administre sus medicamentos</option>
                    <option value="na">No evaluable / no tiene medicamentos prescritos</option>
                </select>
            </div>

            <div class="space-y-1">
                <label class="font-semibold">8. Manejo del dinero</label>
                <select id="lw-8" class="lw-sel w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <option value="">Seleccionar...</option>
                    <option value="1">1 punto — Maneja sus finanzas o compras cotidianas, aunque requiera ayuda en asuntos mayores</option>
                    <option value="0">0 puntos — No puede manejar dinero</option>
                    <option value="na">No evaluable / nunca lo ha realizado</option>
                </select>
            </div>

            <button type="button" onclick="calcLawton()" class="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl mt-2">
                Evaluar Lawton-Brody
            </button>

            <div id="lawton-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>

            <p class="text-[10px] text-slate-500">
                Se registran los ocho dominios en todos los pacientes. Las actividades no evaluables se excluyen del denominador y deben interpretarse con cautela. No se asignan grados de dependencia mediante puntos de corte no validados.
            </p>
        </div>
    `
                },

                // EPOC: evaluación de síntomas, obstrucción, pronóstico y exacerbación
                
{
    id: 'epoc-cat',
    cat: 'urgencias',
    title: 'CAAT (antes CAT) — Impacto de la EPOC',
    desc: 'Cuantifica el impacto de la enfermedad respiratoria en el estado de salud. Puntaje total de 0 a 40.',
    body: `
        <div class="space-y-2 text-xs">
            <label class="block font-semibold">
                Puntaje total CAAT / CAT (0–40)
            </label>

            <input
                type="number" inputmode="decimal"
                id="epoc-cat-score"
                min="0"
                max="40"
                step="1"
                placeholder="Ej.: 12"
                class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
            >

            <button
                type="button"
                onclick="calcEpocCAT()"
                class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl"
            >
                Interpretar CAAT / CAT
            </button>

            <div id="epoc-cat-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>

            <p class="text-[10px] text-slate-500">
                El cuestionario oficial contiene ocho ítems, cada uno puntuado de 0 a 5. Introduce el resultado total después de aplicar el instrumento validado. No se reproducen sus preguntas aquí.
            </p>

            <p class="text-[10px] text-slate-500">
                CAAT es el nombre actual del CAT. Ambos instrumentos son equivalentes y sus puntuaciones son intercambiables. Un resultado ≥10 indica mayor carga de síntomas según GOLD 2026.
            </p>
        </div>
    `
},
                
{
    id: 'epoc-mmrc',
    cat: 'urgencias',
    title: 'mMRC — Escala de disnea',
    desc: 'Evalúa la limitación de las actividades cotidianas por disnea, de 0 a 4.',
    body: `
        <div class="space-y-2 text-xs">
            <label class="block font-semibold">
                Selecciona el grado que describe mejor al paciente
            </label>

            <select id="epoc-mmrc-grade" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <option value="">Seleccionar grado...</option>
                <option value="0">0 — Disnea solo con ejercicio intenso</option>
                <option value="1">1 — Disnea al caminar rápido en terreno plano o subir una pendiente leve</option>
                <option value="2">2 — Camina más lento que personas de su edad en terreno plano o debe detenerse para respirar</option>
                <option value="3">3 — Se detiene por disnea después de unos 100 metros o pocos minutos caminando</option>
                <option value="4">4 — Disnea que impide salir de casa o aparece al vestirse</option>
            </select>

            <button type="button" onclick="calcEpocMMRC()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl">
                Interpretar mMRC
            </button>

            <div id="epoc-mmrc-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>

            <p class="text-[10px] text-slate-500">
                mMRC 0–1: menor carga de disnea. mMRC ≥2: mayor carga de síntomas para la clasificación GOLD ABE. No mide la obstrucción espirométrica.
            </p>
        </div>`
},                  
{
    id: 'epoc-gold',
    cat: 'urgencias',
    title: 'Clasificación GOLD 2026 — Espirometría y grupos ABE',
    desc: 'Clasifica la obstrucción espirométrica y el grupo clínico A, B o E en pacientes con EPOC confirmada.',
    body: `
        <div class="space-y-2 text-xs">

            <label class="block font-semibold">
                Relación FEV₁/CVF posbroncodilatador
            </label>

            <select id="epoc-gold-ratio" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <option value="">Seleccionar resultado...</option>
                <option value="yes">Menor de 0,70</option>
                <option value="no">0,70 o mayor</option>
            </select>

            <label class="block font-semibold">
                FEV₁ posbroncodilatador (% del predicho)
            </label>

            <input type="number" inputmode="decimal" id="epoc-gold-fev" min="1" max="150" step="0.1" placeholder="Ej.: 58" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">

            <div class="border-t border-slate-200 dark:border-slate-700 pt-2">
                <p class="font-bold">Evaluación de síntomas</p>

                <label class="block font-semibold mt-2">
                    Puntaje CAAT / CAT (opcional, 0–40)
                </label>

                <input type="number" inputmode="decimal" id="epoc-gold-cat" min="0" max="40" step="1" placeholder="Ej.: 14" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">

                <label class="block font-semibold mt-2">
                    Grado mMRC (opcional, 0–4)
                </label>

                <select id="epoc-gold-mmrc" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <option value="">No evaluado</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                </select>

                <p class="text-[10px] text-slate-500 mt-1">
                    Introduce al menos una de las dos escalas. Si ambas están disponibles, se considera mayor carga sintomática cuando cualquiera alcanza su umbral.
                </p>
            </div>

            <label class="block font-semibold">
                Número de exacerbaciones moderadas o graves en los últimos 12 meses
            </label>

            <input type="number" inputmode="decimal" id="epoc-gold-exac" min="0" max="30" step="1" placeholder="Ej.: 0" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">

            <button type="button" onclick="calcEpocGOLD()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl">
                Clasificar EPOC
            </button>

            <div id="epoc-gold-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>

            <p class="text-[10px] text-slate-500">
                Requiere diagnóstico clínico y obstrucción persistente confirmada por espirometría posbroncodilatador FEV₁/CVF <0,70. El grupo E corresponde a una o más exacerbaciones moderadas o graves en el último año, independientemente de los síntomas.
            </p>

            <p class="text-[10px] text-slate-500">
                Clasificación ABE para evaluación inicial. No sustituye la valoración clínica ni constituye una prescripción.
            </p>
        </div>`
},
                {
                    id: 'epoc-bode', cat: 'urgencias',
                    title: 'Índice BODE — Pronóstico multidimensional',
                    desc: 'Integra IMC, FEV₁ (% predicho), disnea mMRC y distancia recorrida en caminata de 6 minutos.',
                    body: `
                        <div class="space-y-2 text-xs">
                            <div class="grid grid-cols-2 gap-2">
                                <input type="number" inputmode="decimal" id="epoc-bode-weight" min="1" step="0.1" placeholder="Peso (kg)" class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                <input type="number" inputmode="decimal" id="epoc-bode-height" min="50" step="0.1" placeholder="Talla (cm)" class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                <input type="number" inputmode="decimal" id="epoc-bode-fev" min="1" max="150" step="0.1" placeholder="FEV₁ (% predicho)" class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                <select id="epoc-bode-mmrc" class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"><option value="0">mMRC 0</option><option value="1">mMRC 1</option><option value="2">mMRC 2</option><option value="3">mMRC 3</option><option value="4">mMRC 4</option></select>
                            </div>
                            <label class="block font-semibold">Distancia en caminata de 6 minutos (metros)</label>
                            <input type="number" inputmode="decimal" id="epoc-bode-walk" min="0" max="1200" step="1" placeholder="Ej.: 320" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                            <button type="button" onclick="calcEpocBODE()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl">Calcular BODE</button>
                            <div id="epoc-bode-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
                            <p class="text-[10px] text-slate-500">Usa espirometría posbroncodilatador y una caminata de 6 minutos estandarizada. El puntaje va de 0 a 10; mayor puntaje indica peor pronóstico, no determina por sí solo una conducta.</p>
                        </div>`
                },
                {
                    id: 'epoc-dose', cat: 'urgencias',
                    title: 'Índice DOSE — Carga y riesgo en EPOC',
                    desc: 'Combina disnea mMRC, obstrucción FEV₁, tabaquismo actual y número de exacerbaciones anuales.',
                    body: `
                        <div class="space-y-2 text-xs">
                            <div class="grid grid-cols-2 gap-2">
                                <div><label class="block font-semibold mb-1">mMRC</label><select id="epoc-dose-mmrc" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"><option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></div>
                                <div><label class="block font-semibold mb-1">FEV₁ (% predicho)</label><input type="number" inputmode="decimal" id="epoc-dose-fev" min="1" max="150" step="0.1" placeholder="Ej.: 45" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"></div>
                                <div><label class="block font-semibold mb-1">¿Fumador actual?</label><select id="epoc-dose-smoke" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"><option value="0">No</option><option value="1">Sí</option></select></div>
                                <div><label class="block font-semibold mb-1">Exacerbaciones en 12 meses</label><input type="number" inputmode="decimal" id="epoc-dose-exac" min="0" max="30" step="1" value="0" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"></div>
                            </div>
                            <button type="button" onclick="calcEpocDOSE()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl">Calcular DOSE</button>
                            <div id="epoc-dose-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
                            <p class="text-[10px] text-slate-500">Puntaje 0–8. Es una herramienta de estratificación y seguimiento; no sustituye la evaluación clínica ni la clasificación GOLD ABE.</p>
                        </div>`
                },
                {
                    id: 'epoc-anthonisen', cat: 'urgencias',
                    title: 'Criterios de Anthonisen — Exacerbación',
                    desc: 'Clasifica el cambio agudo de disnea, volumen y purulencia del esputo (tipos I, II y III).',
                    body: `
                        <div class="space-y-2 text-xs">
                            <label class="flex items-center gap-2"><input type="checkbox" id="epoc-anth-dysp"> <span>Aumento de la disnea respecto al estado basal</span></label>
                            <label class="flex items-center gap-2"><input type="checkbox" id="epoc-anth-vol"> <span>Aumento del volumen del esputo</span></label>
                            <label class="flex items-center gap-2"><input type="checkbox" id="epoc-anth-pur"> <span>Aumento de la purulencia del esputo</span></label>
                            <label class="flex items-center gap-2"><input type="checkbox" id="epoc-anth-vent"> <span>Requiere ventilación mecánica invasiva o no invasiva</span></label>
                            <button type="button" onclick="calcEpocAnthonisen()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl">Clasificar exacerbación</button>
                            <div id="epoc-anth-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
                            <p class="text-[10px] text-slate-500">Anthonisen describe síntomas cardinales. La decisión de antibiótico requiere integrar gravedad, purulencia, ventilación, diagnósticos diferenciales y guía local.</p>
                        </div>`
                },
// === CALCULADORAS: LOTE 1 (urgencias/crítico) ===
// Insertar en calcsData (antes del cierre ]) y las funciones calcX() después de calcLiquidosPed

// --- calcsData entries ---
{
    id: 'news2', cat: 'urgencias', title: 'NEWS2 (National Early Warning Score)',
    desc: 'Puntuación de deterioro clínico para detectar sepsis y deterioro.',
    body: `
        <div class="space-y-2 text-xs">
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block font-medium text-slate-500 mb-0.5">FR (rpm):</label>
                    <select id="news2-fr" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                        <option value="0">12-20 (0)</option>
                        <option value="1">< 12 o 21-24 (1)</option>
                        <option value="2">9-11 o 25-30 (2)</option>
                        <option value="3">< 9 o > 30 (3)</option>
                    </select></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">SatO₂ (%):</label>
                    <select id="news2-sat" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                        <option value="0">≥ 96 (0)</option>
                        <option value="1">94-95 (1)</option>
                        <option value="2">92-93 (2)</option>
                        <option value="3">< 92 (3)</option>
                    </select></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Temp (°C):</label>
                    <select id="news2-t" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                        <option value="0">36.1-38.0 (0)</option>
                        <option value="1">35.1-36.0 o 38.1-39.0 (1)</option>
                        <option value="2">< 35.1 o > 39.0 (2)</option>
                    </select></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">PAS (mmHg):</label>
                    <select id="news2-pas" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                        <option value="0">111-219 (0)</option>
                        <option value="1">101-110 (1)</option>
                        <option value="2">91-100 (2)</option>
                        <option value="3">< 91 (3)</option>
                    </select></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">FC (lpm):</label>
                    <select id="news2-fc" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                        <option value="0">51-90 (0)</option>
                        <option value="1">41-50 o 91-110 (1)</option>
                        <option value="2">< 41 o 111-130 (2)</option>
                        <option value="3">> 130 (3)</option>
                    </select></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Conciencia:</label>
                    <select id="news2-avpu" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                        <option value="0">Alerta (0)</option>
                        <option value="3">Voz, dolor o inconsciente (3)</option>
                    </select></div>
            </div>
            <button onclick="calcNEWS2()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular NEWS2</button>
            <div id="news2-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">NEWS2 ≥ 5 o cualquier parámetro con 3 puntos = riesgo alto. Activar respuesta rápida.</p>
        </div>
    `
},
{
    id: 'sofa', cat: 'urgencias', title: 'SOFA (Sequential Organ Failure Assessment)',
    desc: 'Evaluación de disfunción orgánica en sepsis. Score ≥ 2 = sepsis.',
    body: `
        <div class="space-y-2 text-xs">
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block font-medium text-slate-500 mb-0.5">PaO₂/FiO₂:</label>
                    <select id="sofa-pafi" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                        <option value="0">≥ 400 (0)</option>
                        <option value="1">300-399 (1)</option>
                        <option value="2">200-299 (2)</option>
                        <option value="3">100-199 (3)</option>
                        <option value="4">< 100 (4)</option>
                    </select></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Plaquetas (×10³):</label>
                    <select id="sofa-plq" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                        <option value="0">≥ 150 (0)</option>
                        <option value="1">100-149 (1)</option>
                        <option value="2">50-99 (2)</option>
                        <option value="3">20-49 (3)</option>
                        <option value="4">< 20 (4)</option>
                    </select></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Bilirrubina (mg/dL):</label>
                    <select id="sofa-bili" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                        <option value="0">< 1.2 (0)</option>
                        <option value="1">1.2-1.9 (1)</option>
                        <option value="2">2.0-5.9 (2)</option>
                        <option value="3">6.0-11.9 (3)</option>
                        <option value="4">≥ 12 (4)</option>
                    </select></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">PAM / vasopresores:</label>
                    <select id="sofa-pam" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                        <option value="0">PAM ≥ 70 (0)</option>
                        <option value="1">PAM < 70 (1)</option>
                        <option value="2">Dopamina ≤ 5 o dobutamina (2)</option>
                        <option value="3">Dopamina > 5 o noradrenalina ≤ 0.1 (3)</option>
                        <option value="4">Dopamina > 15 o noradrenalina > 0.1 (4)</option>
                    </select></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Glasgow (GCS):</label>
                    <select id="sofa-gcs" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                        <option value="0">15 (0)</option>
                        <option value="1">13-14 (1)</option>
                        <option value="2">10-12 (2)</option>
                        <option value="3">6-9 (3)</option>
                        <option value="4">< 6 (4)</option>
                    </select></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Creatinina (mg/dL):</label>
                    <select id="sofa-cr" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                        <option value="0">< 1.2 (0)</option>
                        <option value="1">1.2-1.9 (1)</option>
                        <option value="2">2.0-3.4 (2)</option>
                        <option value="3">3.5-4.9 (3)</option>
                        <option value="4">≥ 5.0 (4)</option>
                    </select></div>
            </div>
            <button onclick="calcSOFA()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular SOFA</button>
            <div id="sofa-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">SOFA ≥ 2 = sepsis. ΔSOFA ≥ 2 = deterioro. Mortalidad aumenta con el score.</p>
        </div>
    `
},
{
    id: 'wells-tep', cat: 'urgencias', title: 'Wells para TEP (probabilidad clínica)',
    desc: 'Estratificación de probabilidad clínica de tromboembolismo pulmonar.',
    body: `
        <div class="space-y-2 text-xs">
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="wtep-tvp" class="cn-chk"> Signos clínicos de TVP (+3)</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="wtep-alt" class="cn-chk"> TEP más probable que alternativa (+3)</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="wtep-fc" class="cn-chk"> FC > 100 lpm (+1.5)</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="wtep-inm" class="cn-chk"> Inmovilización o cirugía en 4 semanas (+1.5)</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="wtep-hem" class="cn-chk"> Hemoptisis (+1)</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="wtep-can" class="cn-chk"> Cáncer activo (+1)</label>
            <button onclick="calcWellsTEP()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular Wells TEP</button>
            <div id="wells-tep-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">Wells > 4 = probabilidad alta. Wells ≤ 4 = probabilidad baja/intermedia → D-dímero.</p>
        </div>
    `
},
{
    id: 'perc', cat: 'urgencias', title: 'PERC (Pulmonary Embolism Rule-Out Criteria)',
    desc: 'Excluir TEP en pacientes de bajo riesgo sin pruebas adicionales.',
    body: `
        <div class="space-y-2 text-xs">
            <p class="text-[10px] text-slate-500">Solo usar si el paciente tiene probabilidad pre-test baja (< 15%). Todos los criterios deben cumplirse para excluir TEP.</p>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="perc-edad" class="cn-chk"> Edad ≥ 50 años</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="perc-fc" class="cn-chk"> FC ≥ 100 lpm</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="perc-sat" class="cn-chk"> SatO₂ < 95%</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="perc-hem" class="cn-chk"> Hemoptisis</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="perc-est" class="cn-chk"> Uso de estrógenos</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="perc-tvp" class="cn-chk"> TVP o TEP previo</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="perc-trauma" class="cn-chk"> Cirugía o trauma en 4 semanas</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="perc-unilat" class="cn-chk"> Edema unilateral de pierna</label>
            <button onclick="calcPERC()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Evaluar PERC</button>
            <div id="perc-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
        </div>
    `
},
{
    id: 'pesi', cat: 'urgencias', title: 'PESI / sPESI (Severidad de TEP)',
    desc: 'Predicción de mortalidad a 30 días en TEP.',
    body: `
        <div class="space-y-2 text-xs">
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block font-medium text-slate-500 mb-0.5">Edad (años):</label>
                    <input id="pesi-edad" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 65"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">FC (lpm):</label>
                    <input id="pesi-fc" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 90"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">PAS (mmHg):</label>
                    <input id="pesi-pas" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 120"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">SatO₂ (%):</label>
                    <input id="pesi-sat" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 95"></div>
            </div>
            <div class="space-y-1">
                <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="pesi-can" class="cn-chk"> Cáncer activo (+30)</label>
                <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="pesi-ic" class="cn-chk"> Insuficiencia cardíaca (+10)</label>
                <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="pesi-enf" class="cn-chk"> Enfermedad pulmonar crónica (+10)</label>
            </div>
            <button onclick="calcPESI()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular PESI</button>
            <div id="pesi-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">PESI clase I-II (≤ 85): bajo riesgo, considerar manejo ambulatorio. sPESI: 0 = bajo riesgo.</p>
        </div>
    `
},
{
    id: 'glasgow-blatchford', cat: 'urgencias', title: 'Glasgow-Blatchford (Hemorragia digestiva alta)',
    desc: 'Predicción de necesidad de intervención en hemorragia digestiva alta.',
    body: `
        <div class="space-y-2 text-xs">
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block font-medium text-slate-500 mb-0.5">Urea (mg/dL):</label>
                    <input id="gb-urea" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 30"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Hb (g/dL):</label>
                    <input id="gb-hb" type="number" step="0.1" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 12"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">PAS (mmHg):</label>
                    <input id="gb-pas" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 110"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">FC (lpm):</label>
                    <input id="gb-fc" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 80"></div>
            </div>
            <div class="space-y-1">
                <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="gb-melena" class="cn-chk"> Melena (+1)</label>
                <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="gb-sincope" class="cn-chk"> Síncope (+2)</label>
                <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="gb-hepatic" class="cn-chk"> Enfermedad hepática (+2)</label>
                <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="gb-cardiac" class="cn-chk"> Insuficiencia cardíaca (+2)</label>
            </div>
            <button onclick="calcGlasgowBlatchford()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular Glasgow-Blatchford</button>
            <div id="gb-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">Score 0-1: bajo riesgo, puede manejarse ambulatoriamente. Score ≥ 2: requiere hospitalización.</p>
        </div>
    `
},
{
    id: 'rockall', cat: 'urgencias', title: 'Rockall (Hemorragia digestiva alta)',
    desc: 'Predicción de mortalidad y resangrado en hemorragia digestiva alta.',
    body: `
        <div class="space-y-2 text-xs">
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block font-medium text-slate-500 mb-0.5">Edad:</label>
                    <select id="rock-edad" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                        <option value="0">< 60 años (0)</option>
                        <option value="1">60-79 años (1)</option>
                        <option value="2">≥ 80 años (2)</option>
                    </select></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Shock:</label>
                    <select id="rock-shock" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                        <option value="0">Sin shock (0)</option>
                        <option value="1">Taquicardia (1)</option>
                        <option value="2">Hipotensión (2)</option>
                    </select></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Comorbilidad:</label>
                    <select id="rock-com" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                        <option value="0">Ninguna (0)</option>
                        <option value="2">Cardiopatía/otra mayor (2)</option>
                        <option value="3">Falla renal/hepática/malignidad (3)</option>
                    </select></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Diagnóstico endoscópico:</label>
                    <select id="rock-dx" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                        <option value="0">Mallory-Weiss o sin lesión (0)</option>
                        <option value="1">Todos los demás (1)</option>
                        <option value="2">Malignidad (2)</option>
                    </select></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Sangrado:</label>
                    <select id="rock-sang" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                        <option value="0">Sin sangrado (0)</option>
                        <option value="2">Sangrado activo (2)</option>
                    </select></div>
            </div>
            <button onclick="calcRockall()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular Rockall</button>
            <div id="rockall-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">Rockall ≤ 2: bajo riesgo. Rockall ≥ 3: alto riesgo de resangrado/mortalidad.</p>
        </div>
    `
},
{
    id: 'aims65', cat: 'urgencias', title: 'AIMS65 (Hemorragia digestiva alta)',
    desc: 'Predicción de mortalidad hospitalaria en hemorragia digestiva alta.',
    body: `
        <div class="space-y-2 text-xs">
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="aims-alb" class="cn-chk"> Albúmina < 3.0 g/dL (+1)</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="aims-inr" class="cn-chk"> INR > 1.5 (+1)</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="aims-pas" class="cn-chk"> PAS ≤ 90 mmHg (+1)</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="aims-edad" class="cn-chk"> Edad > 65 años (+1)</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="aims-alt" class="cn-chk"> Alteración del estado mental (+1)</label>
            <button onclick="calcAIMS65()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular AIMS65</button>
            <div id="aims65-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">AIMS65 ≥ 2: alto riesgo de mortalidad. Requiere UCI y manejo agresivo.</p>
        </div>
    `
},
{
    id: 'phq9', cat: 'neuro', title: 'PHQ-9 (Depresión)',
    desc: 'Cuestionario de 9 ítems para tamizaje y severidad de depresión.',
    body: `
        <div class="space-y-2 text-xs">
            <p class="text-[10px] text-slate-500">En las últimas 2 semanas, ¿con qué frecuencia ha tenido estos problemas?</p>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">1. Poco interés o placer en hacer cosas:</label>
                <select id="phq9-q1" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Nunca (0)</option>
                    <option value="1">Varios días (1)</option>
                    <option value="2">Más de la mitad de los días (2)</option>
                    <option value="3">Casi todos los días (3)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">2. Sentirse deprimido/a o sin esperanza:</label>
                <select id="phq9-q2" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Nunca (0)</option>
                    <option value="1">Varios días (1)</option>
                    <option value="2">Más de la mitad de los días (2)</option>
                    <option value="3">Casi todos los días (3)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">3. Problemas para dormir o dormir demasiado:</label>
                <select id="phq9-q3" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Nunca (0)</option>
                    <option value="1">Varios días (1)</option>
                    <option value="2">Más de la mitad de los días (2)</option>
                    <option value="3">Casi todos los días (3)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">4. Cansancio o falta de energía:</label>
                <select id="phq9-q4" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Nunca (0)</option>
                    <option value="1">Varios días (1)</option>
                    <option value="2">Más de la mitad de los días (2)</option>
                    <option value="3">Casi todos los días (3)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">5. Poco apetito o comer en exceso:</label>
                <select id="phq9-q5" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Nunca (0)</option>
                    <option value="1">Varios días (1)</option>
                    <option value="2">Más de la mitad de los días (2)</option>
                    <option value="3">Casi todos los días (3)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">6. Sentirse mal consigo mismo/a:</label>
                <select id="phq9-q6" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Nunca (0)</option>
                    <option value="1">Varios días (1)</option>
                    <option value="2">Más de la mitad de los días (2)</option>
                    <option value="3">Casi todos los días (3)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">7. Dificultad para concentrarse:</label>
                <select id="phq9-q7" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Nunca (0)</option>
                    <option value="1">Varios días (1)</option>
                    <option value="2">Más de la mitad de los días (2)</option>
                    <option value="3">Casi todos los días (3)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">8. Moverse o hablar muy lento/rápido:</label>
                <select id="phq9-q8" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Nunca (0)</option>
                    <option value="1">Varios días (1)</option>
                    <option value="2">Más de la mitad de los días (2)</option>
                    <option value="3">Casi todos los días (3)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">9. Pensamientos de muerte o suicidio:</label>
                <select id="phq9-q9" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Nunca (0)</option>
                    <option value="1">Varios días (1)</option>
                    <option value="2">Más de la mitad de los días (2)</option>
                    <option value="3">Casi todos los días (3)</option>
                </select>
            </div>
            <button onclick="calcPHQ9()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular PHQ-9</button>
            <div id="phq9-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">PHQ-9 ≥ 10: depresión moderada. ≥ 15: moderadamente severa. ≥ 20: severa. Pregunta 9 positiva: evaluar riesgo suicida.</p>
        </div>
    `
},
{
    id: 'gad7', cat: 'neuro', title: 'GAD-7 (Ansiedad generalizada)',
    desc: 'Cuestionario de 7 ítems para tamizaje de ansiedad generalizada.',
    body: `
        <div class="space-y-2 text-xs">
            <p class="text-[10px] text-slate-500">En las últimas 2 semanas, ¿con qué frecuencia ha tenido estos problemas?</p>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">1. Sentirse nervioso/a, ansioso/a o al límite:</label>
                <select id="gad7-q1" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Nunca (0)</option>
                    <option value="1">Varios días (1)</option>
                    <option value="2">Más de la mitad de los días (2)</option>
                    <option value="3">Casi todos los días (3)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">2. No poder dejar de preocuparse:</label>
                <select id="gad7-q2" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Nunca (0)</option>
                    <option value="1">Varios días (1)</option>
                    <option value="2">Más de la mitad de los días (2)</option>
                    <option value="3">Casi todos los días (3)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">3. Preocuparse demasiado por diferentes cosas:</label>
                <select id="gad7-q3" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Nunca (0)</option>
                    <option value="1">Varios días (1)</option>
                    <option value="2">Más de la mitad de los días (2)</option>
                    <option value="3">Casi todos los días (3)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">4. Dificultad para relajarse:</label>
                <select id="gad7-q4" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Nunca (0)</option>
                    <option value="1">Varios días (1)</option>
                    <option value="2">Más de la mitad de los días (2)</option>
                    <option value="3">Casi todos los días (3)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">5. Estar tan inquieto/a que no puede quedarse quieto/a:</label>
                <select id="gad7-q5" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Nunca (0)</option>
                    <option value="1">Varios días (1)</option>
                    <option value="2">Más de la mitad de los días (2)</option>
                    <option value="3">Casi todos los días (3)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">6. Irritarse o enojarse fácilmente:</label>
                <select id="gad7-q6" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Nunca (0)</option>
                    <option value="1">Varios días (1)</option>
                    <option value="2">Más de la mitad de los días (2)</option>
                    <option value="3">Casi todos los días (3)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">7. Sentir miedo de que algo terrible va a pasar:</label>
                <select id="gad7-q7" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Nunca (0)</option>
                    <option value="1">Varios días (1)</option>
                    <option value="2">Más de la mitad de los días (2)</option>
                    <option value="3">Casi todos los días (3)</option>
                </select>
            </div>
            <button onclick="calcGAD7()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular GAD-7</button>
            <div id="gad7-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">GAD-7 ≥ 5: ansiedad leve. ≥ 10: moderada. ≥ 15: severa.</p>
        </div>
    `
},
{
    id: 'auditc', cat: 'neuro', title: 'AUDIT-C (Consumo de alcohol)',
    desc: 'Tamizaje de consumo de alcohol de riesgo (3 preguntas).',
    body: `
        <div class="space-y-2 text-xs">
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">1. ¿Con qué frecuencia consume bebidas alcohólicas?</label>
                <select id="auditc-q1" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Nunca (0)</option>
                    <option value="1">1 vez al mes o menos (1)</option>
                    <option value="2">2-4 veces al mes (2)</option>
                    <option value="3">2-3 veces por semana (3)</option>
                    <option value="4">4 o más veces por semana (4)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">2. ¿Cuántas bebidas consume en un día típico de consumo?</label>
                <select id="auditc-q2" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">1-2 (0)</option>
                    <option value="1">3-4 (1)</option>
                    <option value="2">5-6 (2)</option>
                    <option value="3">7-9 (3)</option>
                    <option value="4">10 o más (4)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">3. ¿Con qué frecuencia consume 6 o más bebidas en una ocasión?</label>
                <select id="auditc-q3" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Nunca (0)</option>
                    <option value="1">Menos de 1 vez al mes (1)</option>
                    <option value="2">1 vez al mes (2)</option>
                    <option value="3">1 vez por semana (3)</option>
                    <option value="4">Diariamente o casi (4)</option>
                </select>
            </div>
            <button onclick="calcAUDITC()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular AUDIT-C</button>
            <div id="auditc-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">Hombres: ≥ 4 = consumo de riesgo. Mujeres: ≥ 3 = consumo de riesgo. Requiere intervención breve.</p>
        </div>
    `
},
{
    id: 'moca', cat: 'neuro', title: 'MoCA (Montreal Cognitive Assessment)',
    desc: 'Tamizaje cognitivo (0-30). Más sensible que MMSE para deterioro leve.',
    body: `
        <div class="space-y-2 text-xs">
            <p class="text-[10px] text-slate-500">Ingrese el puntaje obtenido en cada dominio.</p>
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block font-medium text-slate-500 mb-0.5">Visuoespacial/Ejecutivo (0-5):</label>
                    <input id="moca-ve" type="number" min="0" max="5" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="0-5"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Denominación (0-3):</label>
                    <input id="moca-den" type="number" min="0" max="3" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="0-3"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Atención (0-6):</label>
                    <input id="moca-at" type="number" min="0" max="6" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="0-6"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Lenguaje (0-3):</label>
                    <input id="moca-len" type="number" min="0" max="3" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="0-3"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Abstracción (0-2):</label>
                    <input id="moca-abs" type="number" min="0" max="2" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="0-2"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Recuerdo diferido (0-5):</label>
                    <input id="moca-rec" type="number" min="0" max="5" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="0-5"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Orientación (0-6):</label>
                    <input id="moca-ori" type="number" min="0" max="6" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="0-6"></div>
            </div>
            <button onclick="calcMoCA()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular MoCA</button>
            <div id="moca-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">MoCA ≥ 26: normal. 18-25: deterioro cognitivo leve. < 18: deterioro moderado-severo. Añadir 1 punto si ≤ 12 años de educación.</p>
        </div>
    `
},
{
    id: 'cam', cat: 'neuro', title: 'CAM (Confusion Assessment Method - Delirium)',
    desc: 'Tamizaje de delirium en hospitalizados.',
    body: `
        <div class="space-y-2 text-xs">
            <p class="text-[10px] text-slate-500">El CAM requiere: (1) inicio agudo y curso fluctuante, (2) inatención, y (3) pensamiento desorganizado O (4) alteración del nivel de conciencia.</p>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="cam-1" class="cn-chk"> 1. Inicio agudo y curso fluctuante</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="cam-2" class="cn-chk"> 2. Inatención</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="cam-3" class="cn-chk"> 3. Pensamiento desorganizado</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="cam-4" class="cn-chk"> 4. Alteración del nivel de conciencia</label>
            <button onclick="calcCAM()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Evaluar CAM</button>
            <div id="cam-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">CAM positivo: criterios 1 + 2 + (3 o 4). Indica delirium. Requiere evaluación y tratamiento de la causa.</p>
        </div>
    `
},
{
    id: '4at', cat: 'neuro', title: '4AT (Delirium)',
    desc: 'Tamizaje rápido de delirium (0-12). ≥ 4 = probable delirium.',
    body: `
        <div class="space-y-2 text-xs">
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Alertness (0-4):</label>
                <select id="4at-alert" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Normal (0)</option>
                    <option value="4">Alterado (4)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">AMT4 (0-2):</label>
                <select id="4at-amt" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">4 correctas (0)</option>
                    <option value="1">1-3 correctas (1)</option>
                    <option value="2">0 correctas (2)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Atención (0-2):</label>
                <select id="4at-at" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Normal (0)</option>
                    <option value="1">Alteración leve (1)</option>
                    <option value="2">Alteración marcada (2)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Cambio agudo o fluctuante (0-4):</label>
                <select id="4at-cambio" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">No (0)</option>
                    <option value="4">Sí (4)</option>
                </select>
            </div>
            <button onclick="calc4AT()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular 4AT</button>
            <div id="4at-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">4AT 0: delirium improbable. 1-3: posible deterioro cognitivo. ≥ 4: probable delirium.</p>
        </div>
    `
},
{
    id: 'flacc', cat: 'urgencias', title: 'FLACC (Dolor pediátrico)',
    desc: 'Escala de dolor en niños de 2 meses a 7 años (0-10).',
    body: `
        <div class="space-y-2 text-xs">
            <p class="text-[10px] text-slate-500">Evalúa 5 categorías (0-2 cada una). Total 0-10.</p>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Cara (0-2):</label>
                <select id="flacc-cara" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">0 - Expresión normal/sonriente</option>
                    <option value="1">1 - Mueca ocasional</option>
                    <option value="2">2 - Mueca frecuente, ceño fruncido</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Piernas (0-2):</label>
                <select id="flacc-piernas" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">0 - Relajadas/normal</option>
                    <option value="1">1 - Inquietas, tensas</option>
                    <option value="2">2 - Patadas, piernas flexionadas</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Actividad (0-2):</label>
                <select id="flacc-act" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">0 - Acostado tranquilo, posición normal</option>
                    <option value="1">1 - Se retuerce, se balancea</option>
                    <option value="2">2 - Arqueado, rígido, sacudidas</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Llanto (0-2):</label>
                <select id="flacc-llanto" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">0 - Sin llanto</option>
                    <option value="1">1 - Gemidos, quejidos</option>
                    <option value="2">2 - Llanto persistente, gritos</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Consolabilidad (0-2):</label>
                <select id="flacc-cons" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">0 - Contento, relajado</option>
                    <option value="1">1 - Se consuela con toques/abrazos</option>
                    <option value="2">2 - Inconsolable</option>
                </select>
            </div>
            <button onclick="calcFLACC()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular FLACC</button>
            <div id="flacc-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">FLACC 0: sin dolor. 1-3: dolor leve. 4-6: moderado. 7-10: severo.</p>
        </div>
    `
},
{
    id: 'braden', cat: 'urgencias', title: 'Braden (Riesgo de úlcera por presión)',
    desc: 'Escala de riesgo de úlceras por presión (6-23). Menor = mayor riesgo.',
    body: `
        <div class="space-y-2 text-xs">
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Percepción sensorial:</label>
                <select id="braden-sens" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="1">1 - Completamente limitada</option>
                    <option value="2">2 - Muy limitada</option>
                    <option value="3">3 - Ligeramente limitada</option>
                    <option value="4">4 - Sin limitación</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Humedad:</label>
                <select id="braden-hum" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="1">1 - Constantemente húmeda</option>
                    <option value="2">2 - Muy húmeda</option>
                    <option value="3">3 - Ocasionalmente húmeda</option>
                    <option value="4">4 - Raramente húmeda</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Actividad:</label>
                <select id="braden-act" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="1">1 - En cama</option>
                    <option value="2">2 - Confinado a silla</option>
                    <option value="3">3 - Camina ocasionalmente</option>
                    <option value="4">4 - Camina frecuentemente</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Movilidad:</label>
                <select id="braden-mov" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="1">1 - Completamente inmóvil</option>
                    <option value="2">2 - Muy limitada</option>
                    <option value="3">3 - Ligeramente limitada</option>
                    <option value="4">4 - Sin limitación</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Nutrición:</label>
                <select id="braden-nut" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="1">1 - Muy pobre</option>
                    <option value="2">2 - Probablemente inadecuada</option>
                    <option value="3">3 - Adecuada</option>
                    <option value="4">4 - Excelente</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Fricción y cizallamiento:</label>
                <select id="braden-fric" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="1">1 - Problema</option>
                    <option value="2">2 - Problema potencial</option>
                    <option value="3">3 - Sin problema aparente</option>
                </select>
            </div>
            <button onclick="calcBraden()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular Braden</button>
            <div id="braden-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">Braden ≤ 9: riesgo muy alto. 10-12: alto. 13-14: moderado. 15-18: leve. 19-23: sin riesgo.</p>
        </div>
    `
},
{
    id: 'morse', cat: 'urgencias', title: 'Morse (Riesgo de caídas)',
    desc: 'Escala de riesgo de caídas (0-125).',
    body: `
        <div class="space-y-2 text-xs">
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Historia de caídas:</label>
                <select id="morse-hist" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">No (0)</option>
                    <option value="25">Sí (25)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Diagnóstico secundario:</label>
                <select id="morse-dx" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">No (0)</option>
                    <option value="15">Sí (15)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Ayuda para deambular:</label>
                <select id="morse-ayuda" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Sin ayuda / reposo en cama (0)</option>
                    <option value="15">Bastón/muletas/andador (15)</option>
                    <option value="30">Se apoya en muebles (30)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Vía IV / heparina lock:</label>
                <select id="morse-iv" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">No (0)</option>
                    <option value="20">Sí (20)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Marcha/transferencia:</label>
                <select id="morse-marcha" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Normal/encamado (0)</option>
                    <option value="10">Débil (10)</option>
                    <option value="20">Alterada (20)</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Estado mental:</label>
                <select id="morse-mental" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">Orientado (0)</option>
                    <option value="15">Olvidadizo/confuso (15)</option>
                </select>
            </div>
            <button onclick="calcMorse()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular Morse</button>
            <div id="morse-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">Morse < 25: bajo riesgo. 25-44: riesgo moderado. ≥ 45: alto riesgo.</p>
        </div>
    `
},
{
    id: 'cpot', cat: 'urgencias', title: 'CPOT (Dolor en UCI)',
    desc: 'Critical-Care Pain Observation Tool (0-8). Para pacientes no verbales.',
    body: `
        <div class="space-y-2 text-xs">
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Expresión facial (0-2):</label>
                <select id="cpot-cara" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">0 - Relajada, neutral</option>
                    <option value="1">1 - Ceño fruncido, tensa</option>
                    <option value="2">2 - Mueca, ojos cerrados</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Movimientos corporales (0-2):</label>
                <select id="cpot-mov" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">0 - Sin movimiento</option>
                    <option value="1">1 - Movimientos protectores</option>
                    <option value="2">2 - Agitación, sacudidas</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Tensión muscular (0-2):</label>
                <select id="cpot-musc" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">0 - Relajado</option>
                    <option value="1">1 - Tenso, resistente</option>
                    <option value="2">2 - Muy tenso, rígido</option>
                </select>
            </div>
            <div class="space-y-1">
                <label class="block font-medium text-slate-500 mb-0.5">Ventilación (0-2):</label>
                <select id="cpot-vent" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                    <option value="0">0 - Tolerancia al ventilador</option>
                    <option value="1">1 - Tos pero tolera</option>
                    <option value="2">2 - Lucha contra el ventilador</option>
                </select>
            </div>
            <button onclick="calcCPOT()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular CPOT</button>
            <div id="cpot-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">CPOT ≥ 3: dolor significativo. Tratar con analgesia.</p>
        </div>
    `
},
{
    id: 'cockcroft-gault', cat: 'metabolico', title: 'Cockcroft-Gault (CrCl)',
    desc: 'Estimación de depuración de creatinina (mL/min) para ajuste de dosis.',
    body: `
        <div class="space-y-2 text-xs">
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block font-medium text-slate-500 mb-0.5">Edad (años):</label>
                    <input id="cg-edad" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 65"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Peso (kg):</label>
                    <input id="cg-peso" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 70"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Creatinina (mg/dL):</label>
                    <input id="cg-cr" type="number" step="0.01" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 1.2"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Sexo:</label>
                    <select id="cg-sexo" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                        <option value="m">Masculino</option>
                        <option value="f">Femenino (× 0.85)</option>
                    </select></div>
            </div>
            <button onclick="calcCockcroftGault()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular CrCl</button>
            <div id="cg-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">CrCl (mL/min) = (140 - edad) × peso / (72 × Cr). × 0.85 si es mujer. Usar peso ideal si obeso.</p>
        </div>
    `
},
{
    id: 'ibw', cat: 'metabolico', title: 'Pesos para dosificación (IBW/ABW/LBW)',
    desc: 'Peso ideal, peso ajustado y peso magro para dosificación de fármacos.',
    body: `
        <div class="space-y-2 text-xs">
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block font-medium text-slate-500 mb-0.5">Sexo:</label>
                    <select id="ibw-sexo" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                        <option value="m">Masculino</option>
                        <option value="f">Femenino</option>
                    </select></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Altura (cm):</label>
                    <input id="ibw-altura" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 170"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Peso actual (kg):</label>
                    <input id="ibw-peso" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 80"></div>
            </div>
            <button onclick="calcIBW()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular pesos</button>
            <div id="ibw-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">IBW: peso ideal. ABW: peso ajustado (para obesos). LBW: peso magro. Usar el peso adecuado según el fármaco.</p>
        </div>
    `
},
{
    id: 'kdigo', cat: 'metabolico', title: 'KDIGO (Lesión renal aguda)',
    desc: 'Clasificación de AKI por creatinina y diuresis.',
    body: `
        <div class="space-y-2 text-xs">
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block font-medium text-slate-500 mb-0.5">Cr basal (mg/dL):</label>
                    <input id="kdigo-cr-basal" type="number" step="0.01" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 1.0"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Cr actual (mg/dL):</label>
                    <input id="kdigo-cr-actual" type="number" step="0.01" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 2.5"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Diuresis (mL/kg/h):</label>
                    <input id="kdigo-diuresis" type="number" step="0.1" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 0.3"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Duración (h):</label>
                    <input id="kdigo-duracion" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 12"></div>
            </div>
            <button onclick="calcKDIGO()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Clasificar KDIGO</button>
            <div id="kdigo-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">KDIGO 1: Cr 1.5-1.9× basal o ≥ 0.3 mg/dL en 48h. KDIGO 2: Cr 2.0-2.9× basal. KDIGO 3: Cr ≥ 3× basal o ≥ 4.0 o diálisis.</p>
        </div>
    `
},
{
    id: 'parkland', cat: 'urgencias', title: 'Parkland (Quemaduras)',
    desc: 'Fórmula de Parkland para reanimación de quemaduras.',
    body: `
        <div class="space-y-2 text-xs">
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block font-medium text-slate-500 mb-0.5">Peso (kg):</label>
                    <input id="parkland-peso" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 70"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">% SCTQ:</label>
                    <input id="parkland-sctq" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 30"></div>
            </div>
            <button onclick="calcParkland()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular Parkland</button>
            <div id="parkland-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">Volumen 24h = 4 mL × kg × %SCTQ. Mitad en las primeras 8 h, mitad en las siguientes 16 h.</p>
        </div>
    `
},
{
    id: 'rule-of-nines', cat: 'urgencias', title: 'Regla de los 9 (Quemaduras)',
    desc: 'Estimación rápida de superficie corporal quemada (SCTQ).',
    body: `
        <div class="space-y-2 text-xs">
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block font-medium text-slate-500 mb-0.5">Cabeza (%):</label>
                    <input id="ron-cabeza" type="number" value="0" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Tronco anterior (%):</label>
                    <input id="ron-troncoant" type="number" value="0" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Tronco posterior (%):</label>
                    <input id="ron-troncopost" type="number" value="0" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Brazo derecho (%):</label>
                    <input id="ron-brd" type="number" value="0" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Brazo izquierdo (%):</label>
                    <input id="ron-bri" type="number" value="0" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Pierna derecha (%):</label>
                    <input id="ron-pd" type="number" value="0" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Pierna izquierda (%):</label>
                    <input id="ron-pi" type="number" value="0" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Genitales (%):</label>
                    <input id="ron-gen" type="number" value="0" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold"></div>
            </div>
            <button onclick="calcRuleOfNines()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular SCTQ</button>
            <div id="ron-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">Regla de los 9: cabeza 9%, tronco anterior 18%, tronco posterior 18%, cada brazo 9%, cada pierna 18%, genitales 1%.</p>
        </div>
    `
},
{
    id: 'morcft', cat: 'metabolico', title: 'MELD (Model for End-Stage Liver Disease)',
    desc: 'Predicción de mortalidad a 3 meses en cirrosis.',
    body: `
        <div class="space-y-2 text-xs">
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block font-medium text-slate-500 mb-0.5">Bilirrubina (mg/dL):</label>
                    <input id="meld-bili" type="number" step="0.1" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 2.5"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">INR:</label>
                    <input id="meld-inr" type="number" step="0.01" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 1.5"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Creatinina (mg/dL):</label>
                    <input id="meld-cr" type="number" step="0.01" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 1.2"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Na (mEq/L):</label>
                    <input id="meld-na" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 135"></div>
            </div>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="meld-dialisis" class="cn-chk"> En diálisis (creatinina = 4.0)</label>
            <button onclick="calcMELD()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular MELD</button>
            <div id="meld-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">MELD ≥ 15: prioridad para trasplante. MELD-Na incluye sodio para mejor predicción.</p>
        </div>
    `
},
{
    id: 'geneva', cat: 'urgencias', title: 'Geneva (Probabilidad de TEP)',
    desc: 'Score de Ginebra revisado para probabilidad clínica de TEP.',
    body: `
        <div class="space-y-2 text-xs">
            <div class="space-y-1">
                <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="geneva-tvp" class="cn-chk"> TVP o TEP previo (+3)</label>
                <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="geneva-fc" class="cn-chk"> FC > 95 lpm (+5)</label>
                <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="geneva-hem" class="cn-chk"> Hemoptisis (+2)</label>
                <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="geneva-can" class="cn-chk"> Cáncer activo (+2)</label>
                <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="geneva-unilat" class="cn-chk"> Dolor unilateral de pierna (+3)</label>
                <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="geneva-dolor" class="cn-chk"> Dolor a la palpación de la pierna y edema unilateral (+4)</label>
                <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="geneva-cir" class="cn-chk"> Cirugía o fractura en 1 mes (+2)</label>
            </div>
            <button onclick="calcGeneva()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular Geneva</button>
            <div id="geneva-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">Geneva ≤ 3: probabilidad baja. 4-10: intermedia. ≥ 11: alta.</p>
        </div>
    `
},
{
    id: 'hestia', cat: 'urgencias', title: 'Hestia (TEP ambulatorio)',
    desc: 'Criterios para manejo ambulatorio de TEP.',
    body: `
        <div class="space-y-2 text-xs">
            <p class="text-[10px] text-slate-500">Si TODOS los criterios son negativos, el paciente puede manejarse ambulatoriamente.</p>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="hestia-1" class="cn-chk"> Inestabilidad hemodinámica</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="hestia-2" class="cn-chk"> Trombólisis o embolectomía necesaria</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="hestia-3" class="cn-chk"> Sangrado activo o alto riesgo de sangrado</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="hestia-4" class="cn-chk"> CrCl < 30 mL/min</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="hestia-5" class="cn-chk"> Embarazo</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="hestia-6" class="cn-chk"> Historia de HIT</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="hestia-7" class="cn-chk"> Dolor que requiere analgesia IV</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="hestia-8" class="cn-chk"> Comorbilidad médica o social que requiere hospitalización</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="hestia-9" class="cn-chk"> Historia de TEP con anticoagulación</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="hestia-10" class="cn-chk"> Barriers para tratamiento o seguimiento</label>
            <button onclick="calcHestia()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Evaluar Hestia</button>
            <div id="hestia-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
        </div>
    `
},
{
    id: 'pim3', cat: 'urgencias', title: 'PIM3 (Mortalidad pediátrica)',
    desc: 'Pediatric Index of Mortality 3 (probabilidad de muerte).',
    body: `
        <div class="space-y-2 text-xs">
            <p class="text-[10px] text-slate-500">Ingrese los valores del primer contacto en UCI.</p>
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block font-medium text-slate-500 mb-0.5">PAS (mmHg):</label>
                    <input id="pim3-pas" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 90"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">PaO₂ (mmHg):</label>
                    <input id="pim3-pao2" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 80"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">FiO₂ (%):</label>
                    <input id="pim3-fio2" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 40"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">PaCO₂ (mmHg):</label>
                    <input id="pim3-paco2" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 40"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">BE (mEq/L):</label>
                    <input id="pim3-be" type="number" step="0.1" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: -5"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Pupilas:</label>
                    <select id="pim3-pup" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                        <option value="0">Ambas reactivas (0)</option>
                        <option value="1">Una fija/dilatada (1)</option>
                        <option value="2">Ambas fijas/dilatadas (2)</option>
                    </select></div>
            </div>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="pim3-vent" class="cn-chk"> Ventilación mecánica en la primera hora</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="pim3-bypass" class="cn-chk"> Bypass cardiopulmonar</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="pim3-nocancer" class="cn-chk"> Sin cáncer (no oncológico)</label>
            <button onclick="calcPIM3()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular PIM3</button>
            <div id="pim3-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">PIM3 estima la probabilidad de muerte en UCI pediátrica. Requiere validación local.</p>
        </div>
    `
},
{
    id: 'ottawa-tobillo', cat: 'urgencias', title: 'Ottawa (Fractura de tobillo)',
    desc: 'Regla de Ottawa para fractura de tobillo. Radiografía si hay dolor + alguno de los criterios.',
    body: `
        <div class="space-y-2 text-xs">
            <p class="text-[10px] text-slate-500">Dolor en la zona malleolar + al menos uno de:</p>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="ott-tob-1" class="cn-chk"> Dolor en la punta del maléolo lateral (6 cm distal)</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="ott-tob-2" class="cn-chk"> Dolor en la punta del maléolo medial (6 cm distal)</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="ott-tob-3" class="cn-chk"> Incapacidad para dar 4 pasos inmediatamente y en urgencias</label>
            <button onclick="calcOttawaTobillo()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Evaluar Ottawa</button>
            <div id="ottawa-tobillo-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">Si algún criterio es positivo → radiografía de tobillo. Si todos negativos → no radiografía.</p>
        </div>
    `
},
{
    id: 'rifle', cat: 'metabolico', title: 'RIFLE (Lesión renal aguda)',
    desc: 'Clasificación de AKI por creatinina y diuresis (RIFLE).',
    body: `
        <div class="space-y-2 text-xs">
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block font-medium text-slate-500 mb-0.5">Cr basal (mg/dL):</label>
                    <input id="rifle-cr-basal" type="number" step="0.01" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 1.0"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Cr actual (mg/dL):</label>
                    <input id="rifle-cr-actual" type="number" step="0.01" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 2.5"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Diuresis (mL/kg/h):</label>
                    <input id="rifle-diuresis" type="number" step="0.1" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 0.3"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Duración (h):</label>
                    <input id="rifle-duracion" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 12"></div>
            </div>
            <button onclick="calcRIFLE()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Clasificar RIFLE</button>
            <div id="rifle-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">R: Cr 1.5× basal o diuresis < 0.5 × 6h. I: Cr 2× basal o diuresis < 0.5 × 12h. F: Cr 3× basal o Cr ≥ 4 o diuresis < 0.3 × 24h.</p>
        </div>
    `
},
{
    id: 'akin', cat: 'metabolico', title: 'AKIN (Lesión renal aguda)',
    desc: 'Clasificación de AKI por creatinina y diuresis (AKIN).',
    body: `
        <div class="space-y-2 text-xs">
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block font-medium text-slate-500 mb-0.5">Cr basal (mg/dL):</label>
                    <input id="akin-cr-basal" type="number" step="0.01" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 1.0"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Cr actual (mg/dL):</label>
                    <input id="akin-cr-actual" type="number" step="0.01" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 2.5"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Diuresis (mL/kg/h):</label>
                    <input id="akin-diuresis" type="number" step="0.1" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 0.3"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Duración (h):</label>
                    <input id="akin-duracion" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 12"></div>
            </div>
            <button onclick="calcAKIN()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Clasificar AKIN</button>
            <div id="akin-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">AKIN 1: Cr 1.5-2× basal o ≥ 0.3 en 48h. AKIN 2: Cr 2-3× basal. AKIN 3: Cr > 3× basal o ≥ 4.0 o diálisis.</p>
        </div>
    `
},
{
    id: 'prism', cat: 'urgencias', title: 'PRISM (Mortalidad pediátrica)',
    desc: 'Pediatric Risk of Mortality (probabilidad de muerte).',
    body: `
        <div class="space-y-2 text-xs">
            <p class="text-[10px] text-slate-500">Ingrese los valores del primer contacto en UCI.</p>
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block font-medium text-slate-500 mb-0.5">PAS (mmHg):</label>
                    <input id="prism-pas" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 90"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">FC (lpm):</label>
                    <input id="prism-fc" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 120"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">FR (rpm):</label>
                    <input id="prism-fr" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 30"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Glasgow:</label>
                    <input id="prism-gcs" type="number" min="3" max="15" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="3-15"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Pupilas:</label>
                    <select id="prism-pup" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold">
                        <option value="0">Ambas reactivas (0)</option>
                        <option value="1">Una fija/dilatada (1)</option>
                        <option value="2">Ambas fijas/dilatadas (2)</option>
                    </select></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">PaO₂ (mmHg):</label>
                    <input id="prism-pao2" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 80"></div>
            </div>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="prism-vent" class="cn-chk"> Ventilación mecánica</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="prism-conv" class="cn-chk"> Convulsiones</label>
            <button onclick="calcPRISM()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular PRISM</button>
            <div id="prism-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">PRISM estima la probabilidad de muerte en UCI pediátrica. Requiere validación local.</p>
        </div>
    `
},
{
    id: 'pelod', cat: 'urgencias', title: 'PELOD (Disfunción orgánica pediátrica)',
    desc: 'Pediatric Logistic Organ Dysfunction (0-71).',
    body: `
        <div class="space-y-2 text-xs">
            <p class="text-[10px] text-slate-500">Ingrese los valores del peor día en UCI.</p>
            <div class="grid grid-cols-2 gap-2">
                <div><label class="block font-medium text-slate-500 mb-0.5">Glasgow:</label>
                    <input id="pelod-gcs" type="number" min="3" max="15" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="3-15"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">FC (lpm):</label>
                    <input id="pelod-fc" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 120"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">PAS (mmHg):</label>
                    <input id="pelod-pas" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 90"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">PaO₂ (mmHg):</label>
                    <input id="pelod-pao2" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 80"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">PaCO₂ (mmHg):</label>
                    <input id="pelod-paco2" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 40"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Creatinina (mg/dL):</label>
                    <input id="pelod-cr" type="number" step="0.01" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 1.2"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Plaquetas (×10³):</label>
                    <input id="pelod-plq" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 150"></div>
                <div><label class="block font-medium text-slate-500 mb-0.5">Leucocitos (×10³):</label>
                    <input id="pelod-leu" type="number" class="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold" placeholder="Ej: 10"></div>
            </div>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="pelod-vent" class="cn-chk"> Ventilación mecánica</label>
            <button onclick="calcPELOD()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Calcular PELOD</button>
            <div id="pelod-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">PELOD ≥ 20: alto riesgo de mortalidad. Requiere validación local.</p>
        </div>
    `
},
{
    id: 'ps (phoenix)', cat: 'urgencias', title: 'Phoenix (Sepsis pediátrica)',
    desc: 'Criterios de sepsis pediátrica (Phoenix).',
    body: `
        <div class="space-y-2 text-xs">
            <p class="text-[10px] text-slate-500">Criterios de sepsis pediátrica (Phoenix 2024). Requiere disfunción orgánica.</p>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="phoenix-resp" class="cn-chk"> Disfunción respiratoria (PaO₂/FiO₂ < 400 o SatO₂/FiO₂ < 264)</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="phoenix-cv" class="cn-chk"> Disfunción cardiovascular (hipotensión o vasopresor)</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="phoenix-coag" class="cn-chk"> Disfunción de coagulación (plaquetas < 100 o INR > 1.5 o D-dímero elevado)</label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="phoenix-hep" class="cn-chk"> Disfunción hepática (bilirrubina > 1.0 o ALT > 2× normal)</label>
            <button onclick="calcPhoenix()" class="w-full py-2 bg-teal-600 text-white font-bold rounded-xl mt-2">Evaluar Phoenix</button>
            <div id="phoenix-res" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hidden"></div>
            <p class="text-[10px] text-slate-500 leading-relaxed">Phoenix ≥ 2: sepsis. Phoenix ≥ 2 con cardiovascular: choque séptico.</p>
        </div>
    `
}





  

            ];

            const query = (document.getElementById('calc-search-input')?.value || '').toLowerCase().trim();

            const filtered = calcs.filter(c => {
                const matchesCat = currentCalcCategory === 'all' || c.cat === currentCalcCategory;
                const matchesQuery = !query || c.title.toLowerCase().includes(query) || c.desc.toLowerCase().includes(query) || c.id.toLowerCase().includes(query);
                return matchesCat && matchesQuery;
            });

            container.innerHTML = filtered.map(c => `
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                    <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                        <h3 class="font-bold text-slate-900 dark:text-white text-sm">${c.title}</h3>
                        <div class="flex items-center gap-1.5 shrink-0"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase">${c.cat}</span>${favStar('calc:' + c.id)}</div>                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">${c.desc}</p>
                    ${c.body}
                </div>
            `).join('');
        }

        // ADDITIONAL CALCULATOR LOGIC HELPERS
        function calcGlasgow() {
    const o = parseInt(document.getElementById('gcs-o')?.value);
    const vRaw = document.getElementById('gcs-v')?.value;
    const m = parseInt(document.getElementById('gcs-m')?.value);
    const resEl = document.getElementById('gcs-res');

    if (!resEl || !Number.isInteger(o) || !Number.isInteger(m) ||
        !['1', '2', '3', '4', '5', 'NT'].includes(vRaw)) {
        alert('Verifica los componentes de Glasgow.');
        return;
    }

    const v = vRaw === 'NT' ? null : parseInt(vRaw);
    const componentes = `O:${o} V:${v === null ? 'NT' : v} M:${m}`;

    if (v === null) {
        const parcial = o + m;

        resEl.innerHTML = `
            <div class="text-indigo-600 font-bold">
                Glasgow: componente verbal no evaluable
            </div>
            <div>Componentes registrados: ${componentes}</div>
            <div>Suma de componentes evaluables (O + M): ${parcial} / 10</div>
            <div class="text-amber-700 dark:text-amber-400 font-normal text-[11px] mt-2">
                No se calcula un total sobre 15 porque el componente verbal es NT.
                Registra y comunica cada componente por separado. Documenta la causa
                (por ejemplo, intubación, sedación o barrera de comunicación).
            </div>
        `;
    } else {
        const total = o + v + m;

        let interp = '';
        if (total >= 13) {
            interp = 'Alteración leve del nivel de conciencia (13–15).';
        } else if (total >= 9) {
            interp = 'Alteración moderada del nivel de conciencia (9–12).';
        } else {
            interp = 'Alteración grave del nivel de conciencia (3–8). Requiere valoración urgente.';
        }

        resEl.innerHTML = `
            <div class="font-bold">
                Glasgow total:
                <span class="text-indigo-600">${total} / 15</span>
            </div>
            <div>Componentes: ${componentes}</div>
            <div>${interp}</div>
            <div class="text-amber-700 dark:text-amber-400 font-normal text-[11px] mt-2">
                Un puntaje de 8 o menos exige evaluación urgente de la vía aérea
                y protección de reflejos, pero no indica intubación automática.
                Considerar contexto, evolución, ventilación, oxigenación y causas
                reversibles. Registrar siempre E, V y M por separado.
            </div>
        `;
    }

    resEl.classList.remove('hidden');
}

        function calcApgar() {
    const ids = ['ap-fc', 'ap-resp', 'ap-tono', 'ap-ref', 'ap-col'];
    const minuto = document.getElementById('ap-min')?.value;
    const resEl = document.getElementById('ap-res');

    if (!resEl) return;

    if (!['1', '5', '10', '15', '20'].includes(minuto)) {
        alert('Selecciona el minuto de evaluación.');
        return;
    }

    const valores = ids.map(id =>
        document.getElementById(id)?.value
    );

    if (valores.some(v => !['0', '1', '2'].includes(v))) {
        alert('Debes evaluar los cinco componentes del APGAR.');
        return;
    }

    const total = valores.reduce((suma, v) => suma + Number(v), 0);

    let interpretacion = '';

    if (minuto === '1') {
        interpretacion = `
            Evaluación inicial de la transición neonatal.
            Registrar también el APGAR a los 5 minutos.
        `;
    } else if (total >= 7) {
        interpretacion = 'Puntaje tranquilizador (7–10).';
    } else if (total >= 4) {
        interpretacion = 'Puntaje moderadamente anormal (4–6).';
    } else {
        interpretacion = 'Puntaje bajo (0–3). Requiere evaluación clínica inmediata.';
    }

    let seguimiento = '';

    if (Number(minuto) >= 5 && total < 7 && Number(minuto) < 20) {
        seguimiento = `
            Repetir APGAR cada 5 minutos hasta los 20 minutos,
            documentando simultáneamente las intervenciones de reanimación.
        `;
    }

    resEl.innerHTML = `
        <div class="font-bold text-sm">
            APGAR al minuto ${minuto}:
            <span class="text-teal-600">${total}/10 puntos</span>
        </div>

        <div class="font-normal">${interpretacion}</div>

        ${seguimiento ? `
            <div class="text-amber-700 dark:text-amber-400 text-xs font-medium">
                ${seguimiento}
            </div>
        ` : ''}

        <div class="text-[11px] text-slate-500 font-normal">
            APGAR describe el estado del recién nacido en un momento
            determinado y su respuesta a las intervenciones. No determina
            el inicio de la reanimación, no diagnostica asfixia y no predice
            por sí solo el pronóstico neurológico individual.
        </div>
    `;

    resEl.classList.remove('hidden');
}

        function calcSilverman() {
    const ids = ['sa-mta', 'sa-tir', 'sa-xif', 'sa-ale', 'sa-que'];
    const resEl = document.getElementById('sa-res');

    if (!resEl) return;

    const valores = ids.map(id =>
        document.getElementById(id)?.value
    );

    if (valores.some(v => !['0', '1', '2'].includes(v))) {
        alert('Debes evaluar los cinco componentes de Silverman-Andersen.');
        return;
    }

    const total = valores.reduce((suma, v) => suma + Number(v), 0);

    let interpretacion = '';

    if (total === 0) {
        interpretacion = 'Sin signos puntuables de dificultad respiratoria.';
    } else if (total <= 3) {
        interpretacion = 'Dificultad respiratoria leve.';
    } else if (total <= 6) {
        interpretacion = 'Dificultad respiratoria moderada.';
    } else {
        interpretacion = 'Dificultad respiratoria severa; posible falla respiratoria inminente.';
    }

    resEl.innerHTML = `
        <div class="font-bold text-sm">
            Silverman-Andersen:
            <span class="text-rose-600">${total}/10 puntos</span>
        </div>

        <div class="font-bold">${interpretacion}</div>

        <div class="text-[11px] font-normal text-slate-500">
            La puntuación debe interpretarse junto con frecuencia respiratoria,
            saturación de oxígeno, requerimiento de oxígeno, edad gestacional
            y evolución clínica. Repetir la evaluación para vigilar cambios.
        </div>

        <div class="text-[11px] font-normal text-amber-700 dark:text-amber-400">
            No utilizar el puntaje como único criterio para iniciar CPAP,
            intubación o ventilación mecánica. La dificultad respiratoria
            neonatal requiere valoración clínica inmediata.
        </div>
    `;

    resEl.classList.remove('hidden');
}

        
function calcIMC() {
    const edad = Number(document.getElementById('imc-edad').value);
    const peso = Number(document.getElementById('imc-peso').value);
    const tallaCm = Number(document.getElementById('imc-talla').value);
    const cinturaValor = document.getElementById('imc-cintura').value.trim();
    const sexo = document.getElementById('imc-sexo').value;
    const gestante = document.getElementById('imc-gestante').value;
    const res = document.getElementById('imc-res');

    if (!Number.isInteger(edad) || edad < 18 || edad > 120) {
        alert('Ingrese una edad válida entre 18 y 120 años.');
        return;
    }

    if (!Number.isFinite(peso) || peso < 20 || peso > 300) {
        alert('Ingrese un peso válido entre 20 y 300 kg.');
        return;
    }

    if (!Number.isFinite(tallaCm) || tallaCm < 100 || tallaCm > 250) {
        alert('Ingrese una talla válida entre 100 y 250 cm.');
        return;
    }

    if (!gestante) {
        alert('Seleccione si existe embarazo.');
        return;
    }

    let cintura = null;

    if (cinturaValor !== '') {
        cintura = Number(cinturaValor);

        if (!Number.isFinite(cintura) || cintura < 40 || cintura > 200) {
            alert('Ingrese una circunferencia de cintura válida.');
            return;
        }

        if (!sexo) {
            alert('Seleccione el sexo biológico para interpretar la cintura.');
            return;
        }
    }

    const tallaM = tallaCm / 100;
    const imc = peso / (tallaM * tallaM);
    const sc = Math.sqrt((peso * tallaCm) / 3600);

    let html = `
        <div class="text-lg font-bold text-teal-600">
            IMC: ${imc.toFixed(1)} kg/m²
        </div>
        <div>
            Superficie corporal: <strong>${sc.toFixed(2)} m²</strong>
        </div>
        <div class="text-[10px] text-slate-500">
            Superficie corporal calculada mediante fórmula de Mosteller.
        </div>
    `;

    if (gestante === 'si') {
        html += `
            <div class="border-t pt-2 mt-2 text-amber-600">
                <strong>Embarazo:</strong>
                No utilizar la clasificación habitual del IMC adulto durante la gestación.
                <p class="text-[11px] font-normal mt-1">
                    Valorar el IMC pregestacional y la evolución del peso según edad gestacional, utilizando la curva de Atalah.
                </p>
            </div>
        `;
    } else if (edad <= 64) {
        let categoria;

        if (imc < 18.5) categoria = 'Delgadez';
        else if (imc < 25) categoria = 'Normal';
        else if (imc < 30) categoria = 'Sobrepeso';
        else if (imc < 35) categoria = 'Obesidad grado I';
        else if (imc < 40) categoria = 'Obesidad grado II';
        else categoria = 'Obesidad grado III';

        html += `
            <div class="border-t pt-2 mt-2">
                <div>Clasificación nutricional:</div>
                <strong class="text-teal-600 text-base">${categoria}</strong>
                <p class="text-[10px] text-slate-500 mt-1">
                    Puntos de corte para adultos de 18 a 64 años.
                </p>
            </div>
        `;
    } else {
        html += `
            <div class="border-t pt-2 mt-2 text-amber-600">
                <strong>Adulto de 65 años o más:</strong>
                No aplicar automáticamente los puntos de corte de adultos de 18 a 64 años.
                <p class="text-[11px] font-normal mt-1">
                    Complementar con valoración nutricional geriátrica, pérdida de peso, masa muscular y funcionalidad.
                </p>
            </div>
        `;
    }

    if (cintura !== null) {
        const limite = sexo === 'M' ? 90 : 80;
        const riesgo = cintura >= limite;

        html += `
            <div class="border-t pt-2 mt-2">
                <strong>Circunferencia de cintura:</strong> ${cintura.toFixed(1)} cm
                <div class="${riesgo ? 'text-amber-600' : 'text-teal-600'} font-bold mt-1">
                    ${riesgo
                        ? `Por encima o igual al punto de corte (${limite} cm).`
                        : `Por debajo del punto de corte (${limite} cm).`}
                </div>
                <p class="text-[10px] text-slate-500">
                    Punto de corte de referencia para adultos colombianos: hombres ≥90 cm y mujeres ≥80 cm.
                </p>
            </div>
        `;
    }

    html += `
        <div class="border-t pt-2 mt-2 text-[10px] text-slate-500">
            El IMC es una herramienta de tamizaje. No diferencia masa grasa de masa muscular. Interpretar con el contexto clínico, especialmente ante edema, ascitis o alteraciones de la composición corporal.
        </div>
    `;

    res.innerHTML = html;
    res.classList.remove('hidden');
}


        function calcCentor() {
    const resEl = document.getElementById('centor-res');
    const edadEl = document.getElementById('cn-ed');

    if (!resEl || !edadEl) return;

    const edad = edadEl.value;

    if (edad === '') {
        resEl.innerHTML = `
            <p class="text-amber-600 font-bold">
                Selecciona el grupo de edad para calcular la escala.
            </p>
        `;
        resEl.classList.remove('hidden');
        return;
    }

    const criterios = document.querySelectorAll('.cn-chk:checked').length;
    const puntaje = criterios + Number(edad);

    let interpretacion = '';

    if (puntaje <= 1) {
        interpretacion = `
            <strong class="text-green-600">Probabilidad clínica baja.</strong>
            Generalmente no requiere prueba diagnóstica ni antibiótico,
            si no existen factores de alto riesgo.
        `;
    } else if (puntaje <= 3) {
        interpretacion = `
            <strong class="text-amber-600">Probabilidad clínica intermedia.</strong>
            Considerar prueba rápida de antígeno, prueba molecular
            o cultivo faríngeo. Tratar si se confirma infección.
        `;
    } else {
        interpretacion = `
            <strong class="text-red-600">Probabilidad clínica alta.</strong>
            Realizar prueba diagnóstica para confirmar infección.
            No iniciar antibiótico únicamente por el puntaje.
        `;
    }

    resEl.innerHTML = `
        <div class="space-y-2">
            <div class="text-base font-bold">
                Puntaje McIsaac:
                <span class="text-teal-600">${puntaje} / 5</span>
            </div>

            <div>${interpretacion}</div>

            <div class="border-t border-slate-300 dark:border-slate-700 pt-2 text-[11px] font-normal">
                <strong>Importante:</strong>
                Ante contacto domiciliario con infección estreptocócica,
                antecedente de fiebre reumática o sospecha de complicaciones,
                considerar pruebas incluso con puntajes bajos.
                La decisión clínica debe considerar el contexto del paciente.
            </div>
        </div>
    `;

    resEl.classList.remove('hidden');
}

        function calcHASBLED() {
    const pts = document.querySelectorAll('.hb-chk:checked').length;
    const resEl = document.getElementById('hasbled-res'); if (!resEl) return;
    const rec = pts >= 3 ? 'Riesgo ALTO de sangrado (≥ 3): corrige los factores modificables y vigila más de cerca'
        : pts === 2 ? 'Riesgo moderado (2)' : 'Riesgo bajo (0-1)';
    resEl.innerHTML = `Puntaje: <span class="text-rose-600">${pts} / 9</span> — ${rec}<div class="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-1">Un puntaje alto, por sí solo, no es motivo para negar la anticoagulación.</div>`;
    resEl.classList.remove('hidden');
}

        function calcCURB65() {
    const resEl = document.getElementById('curb65-res');
    if (!resEl) return;

    const pts = document.querySelectorAll('.cb-chk:checked').length;

    let interpretacion = '';

    if (pts <= 1) {
        interpretacion = `
            <strong class="text-green-600">Riesgo bajo.</strong>
            Mortalidad estimada menor del 3%.
            Puede considerarse manejo ambulatorio si la valoración
            clínica, la oxigenación y las condiciones del paciente lo permiten.
        `;
    } else if (pts === 2) {
        interpretacion = `
            <strong class="text-amber-600">Riesgo intermedio.</strong>
            Mortalidad estimada del 3 al 15%.
            Considerar manejo hospitalario o una alternativa de atención
            supervisada según la condición clínica y los recursos disponibles.
        `;
    } else {
        interpretacion = `
            <strong class="text-red-600">Riesgo alto.</strong>
            Mortalidad estimada mayor del 15%.
            Se recomienda hospitalización y valoración urgente de gravedad.
            Considerar evaluación por cuidados críticos según el estado clínico.
        `;
    }

    resEl.innerHTML = `
        <div class="space-y-2">
            <div class="text-base font-bold">
                Puntaje CURB-65:
                <span class="text-teal-600">${pts} / 5</span>
            </div>

            <div>${interpretacion}</div>

            <div class="border-t border-slate-300 dark:border-slate-700 pt-2 text-[11px] font-normal">
                <strong>Importante:</strong>
                valorar también saturación de oxígeno, trabajo respiratorio,
                comorbilidades, estabilidad hemodinámica, tolerancia oral,
                fragilidad y condiciones del entorno. Un puntaje bajo
                no excluye complicaciones ni necesidad de hospitalización.
                CURB-65 no es un criterio aislado para ingreso a UCI.
            </div>
        </div>
    `;

    resEl.classList.remove('hidden');
}

        function calcQSOFA() {
    const pts = document.querySelectorAll('.qs-chk:checked').length;
    const resEl = document.getElementById('qsofa-res');

    if (!resEl) return;

    let interpretacion = '';

    if (pts >= 2) {
        interpretacion = `
            <strong class="text-red-600">
                qSOFA positivo: ≥ 2 puntos.
            </strong>

            <p>
                Mayor riesgo de desenlaces adversos en pacientes
                con sospecha de infección. Requiere evaluación
                clínica inmediata, búsqueda de disfunción orgánica
                y valoración de necesidad de escalar la atención.
            </p>
        `;
    } else {
        interpretacion = `
            <strong class="text-amber-600">
                qSOFA menor de 2 puntos.
            </strong>

            <p>
                No alcanza el umbral de qSOFA positivo, pero
                esto NO descarta sepsis ni disfunción orgánica.
                Continuar la evaluación clínica y utilizar
                herramientas de cribado apropiadas.
            </p>
        `;
    }

    resEl.innerHTML = `
        <div class="space-y-2">
            <div class="text-base font-bold">
                Puntaje qSOFA:
                <span class="text-teal-600">${pts} / 3</span>
            </div>

            ${interpretacion}

            <div class="border-t border-slate-300 dark:border-slate-700 pt-2 text-[11px] font-normal">
                <strong>Importante:</strong>
                La guía Surviving Sepsis Campaign 2026 recomienda
                NEWS, NEWS2, MEWS o SIRS por encima de qSOFA
                como herramienta única de cribado hospitalario.
                La sospecha clínica de sepsis exige evaluación
                y actuación oportunas, independientemente del puntaje.
                Un qSOFA positivo tampoco equivale automáticamente
                a diagnóstico de sepsis ni a ingreso a UCI.
            </div>
        </div>
    `;

    resEl.classList.remove('hidden');
}

        function calcChildPugh() {
    const ids = ['cp-bili', 'cp-alb', 'cp-inr', 'cp-asc', 'cp-enc'];
    const valores = ids.map(id =>
        parseInt(document.getElementById(id)?.value)
    );

    const resEl = document.getElementById('cp-res');
    if (!resEl) return;

    if (valores.some(v => !Number.isInteger(v) || v < 1 || v > 3)) {
        alert('Verifica los cinco parámetros de Child-Pugh.');
        return;
    }

    const [b, a, i, asc, enc] = valores;
    const total = b + a + i + asc + enc;

    let clase = '';
    let interpretacion = '';

    if (total <= 6) {
        clase = 'A';
        interpretacion = 'Menor grado de alteración según Child-Pugh.';
    } else if (total <= 9) {
        clase = 'B';
        interpretacion = 'Grado intermedio de alteración según Child-Pugh.';
    } else {
        clase = 'C';
        interpretacion = 'Mayor grado de alteración según Child-Pugh.';
    }

    resEl.innerHTML = `
        <div class="font-bold text-sm">
            Child-Pugh:
            <span class="text-teal-600">${total} / 15 puntos</span>
        </div>
        <div class="text-base font-bold">
            Clase ${clase}
        </div>
        <div class="font-normal">${interpretacion}</div>
        <div class="text-[11px] font-normal text-slate-500 mt-2">
            Clasificación basada en bilirrubina, albúmina, INR, ascitis y
            encefalopatía. No equivale por sí sola a determinar compensación,
            pronóstico individual ni indicación de trasplante.
            En colangitis biliar primaria pueden utilizarse puntos de corte
            diferentes para bilirrubina.
        </div>
    `;

    resEl.classList.remove('hidden');
}

        function calcAlvarado() {
    const resEl = document.getElementById('alvarado-res');
    if (!resEl) return;

    const ids = [
        'al-m', 'al-a', 'al-n', 'al-t',
        'al-r', 'al-e', 'al-l', 'al-s'
    ];

    const pts = ids.reduce((total, id) => {
        const checked = document.getElementById(id)?.checked;
        if (!checked) return total;

        return total + (
            id === 'al-t' || id === 'al-l' ? 2 : 1
        );
    }, 0);

    let nivel = '';
    let conducta = '';

    if (pts < 5) {
        nivel = 'Baja probabilidad';
        conducta = `
            Puntaje con alta sensibilidad para ayudar a excluir apendicitis.
            Si persiste la sospecha clínica o los síntomas progresan, requiere
            reevaluación y no debe descartarse únicamente por este resultado.
        `;
    } else if (pts <= 6) {
        nivel = 'Probabilidad intermedia';
        conducta = `
            Requiere valoración clínica, observación y reevaluación.
            Considerar imágenes diagnósticas según disponibilidad y contexto.
        `;
    } else if (pts <= 8) {
        nivel = 'Probabilidad elevada';
        conducta = `
            Requiere valoración médica y quirúrgica oportuna.
            Considerar imágenes diagnósticas según edad, presentación y contexto.
        `;
    } else {
        nivel = 'Probabilidad muy elevada';
        conducta = `
            Requiere valoración quirúrgica urgente. La decisión diagnóstica
            y terapéutica debe integrar la evaluación clínica y las imágenes
            cuando estén indicadas.
        `;
    }

    resEl.innerHTML = `
        <div class="font-bold text-sm">
            Alvarado:
            <span class="text-amber-600">${pts} / 10 puntos</span>
        </div>

        <div class="font-bold">${nivel}</div>

        <div class="font-normal text-xs">${conducta}</div>

        <div class="text-[11px] font-normal text-slate-500 mt-2">
            El puntaje no confirma por sí solo apendicitis ni diferencia
            enfermedad complicada de no complicada. En adultos, Alvarado
            es más útil para identificar bajo riesgo que para confirmar
            el diagnóstico. La escala requiere interpretación individual,
            especialmente en embarazadas, adultos mayores y pacientes
            con presentaciones atípicas.
        </div>
    `;

    resEl.classList.remove('hidden');
}

        function calcWellsTVP() {
    const resEl = document.getElementById('wellstvp-res');
    if (!resEl) return;

    const ids = [
        'wt-c', 'wt-p', 'wt-r', 'wt-t', 'wt-s',
        'wt-d', 'wt-e', 'wt-v', 'wt-a', 'wt-alt'
    ];

    const seleccionados = ids.filter(id =>
        document.getElementById(id)?.checked
    );

    const pts = seleccionados.reduce((total, id) =>
        total + (id === 'wt-alt' ? -2 : 1), 0
    );

    const probable = pts >= 2;

    resEl.innerHTML = `
        <div class="font-bold text-sm">
            Wells TVP:
            <span class="text-teal-600">${pts} puntos</span>
        </div>

        <div class="font-bold">
            ${probable ? 'TVP probable (≥2 puntos)' : 'TVP improbable (≤1 punto)'}
        </div>

        <div class="font-normal text-xs">
            ${
                probable
                ? `Realizar ecografía venosa proximal con prioridad. Si no está disponible oportunamente, seguir el protocolo diagnóstico para TVP probable, incluyendo dímero D, anticoagulación provisional cuando esté indicada y ecografía dentro del plazo recomendado.`
                : `Solicitar dímero D de alta sensibilidad según el protocolo diagnóstico. Si es negativo, generalmente permite excluir TVP en este contexto; si es positivo, realizar ecografía venosa.`
            }
        </div>

        <div class="text-[11px] font-normal text-slate-500 mt-2">
            Wells estima probabilidad clínica, no confirma ni descarta por sí solo
            una TVP. La interpretación del dímero D depende del contexto clínico,
            edad, ensayo utilizado y protocolo local.
        </div>

        <div class="text-[11px] font-normal text-amber-700 dark:text-amber-400">
            Si hay disnea súbita, dolor torácico, síncope o hemoptisis,
            evaluar urgentemente posible tromboembolismo pulmonar.
        </div>
    `;

    resEl.classList.remove('hidden');
}

        function calcOsmolaridad() {
    const na = parseFloat(document.getElementById('osm-na')?.value);
    const glu = parseFloat(document.getElementById('osm-glu')?.value);
    const bunInput = document.getElementById('osm-bun')?.value;
    const bun = bunInput === '' ? null : parseFloat(bunInput);
    const resEl = document.getElementById('osm-res');

    if (!resEl) return;

    if (
        !Number.isFinite(na) || na < 80 || na > 200 ||
        !Number.isFinite(glu) || glu <= 0 || glu > 2000
    ) {
        alert('Ingresa un sodio válido (80–200 mEq/L) y una glucosa válida (1–2000 mg/dL).');
        return;
    }

    if (bunInput !== '' && (!Number.isFinite(bun) || bun < 0 || bun > 300)) {
        alert('El BUN debe estar entre 0 y 300 mg/dL.');
        return;
    }

    // Osmolalidad efectiva calculada (mOsm/kg)
    const osmEfectiva = (2 * na) + (glu / 18);

    // Osmolalidad total calculada, si se dispone de BUN
    const osmTotal = bun !== null
        ? osmEfectiva + (bun / 2.8)
        : null;

    // Sodio corregido: fórmulas de Katz y Hillier
    const naKatz = na + (1.6 * (glu - 100) / 100);
    const naHillier = na + (2.4 * (glu - 100) / 100);

    let interpretacion = '';

    if (glu >= 600 && (osmEfectiva > 300 || (osmTotal !== null && osmTotal > 320))) {
        interpretacion = `
            <div class="text-red-600 font-bold">
                ⚠️ Cumple umbral de hiperglucemia e hiperosmolalidad para sospechar EHH.
            </div>
            <div class="text-amber-700 dark:text-amber-400">
                No confirma EHH: verificar cetonemia/cetonuria, pH y bicarbonato.
            </div>
        `;
    } else if (osmEfectiva > 300 || (osmTotal !== null && osmTotal > 320)) {
        interpretacion = `
            <div class="text-amber-700 dark:text-amber-400 font-bold">
                ⚠️ Hiperosmolalidad calculada.
            </div>
            <div>Interpretar junto con glucosa, estado clínico, cetonas y equilibrio ácido-base.</div>
        `;
    } else {
        interpretacion = `
            <div class="text-teal-700 dark:text-teal-400 font-bold">
                No alcanza los umbrales de hiperosmolalidad del EHH.
            </div>
            <div>Este resultado no descarta una crisis hiperglucémica.</div>
        `;
    }

    resEl.innerHTML = `
        <div class="font-bold text-sm">Resultados</div>

        <div>
            Osmolalidad efectiva:
            <strong class="text-teal-600">${osmEfectiva.toFixed(1)} mOsm/kg</strong>
            <div class="text-[10px] text-slate-500">Umbral de hiperosmolalidad: >300 mOsm/kg</div>
        </div>

        ${osmTotal !== null ? `
            <div>
                Osmolalidad total:
                <strong class="text-teal-600">${osmTotal.toFixed(1)} mOsm/kg</strong>
                <div class="text-[10px] text-slate-500">Umbral de hiperosmolalidad: >320 mOsm/kg</div>
            </div>
        ` : `
            <div class="text-slate-500">
                Osmolalidad total: no calculada (falta BUN).
            </div>
        `}

        <div class="border-t border-slate-300 dark:border-slate-700 pt-2">
            <div>Sodio corregido — Katz (1,6):
                <strong class="text-indigo-600">${naKatz.toFixed(1)} mEq/L</strong>
            </div>
            <div>Sodio corregido — Hillier (2,4):
                <strong class="text-indigo-600">${naHillier.toFixed(1)} mEq/L</strong>
            </div>
        </div>

        <div class="text-[11px] mt-2">${interpretacion}</div>

        <div class="text-[10px] text-slate-500 mt-2">
            Fórmulas estimativas. El diagnóstico de EHH requiere valorar también cetonas,
            pH, bicarbonato y contexto clínico. No utilizar este cálculo de forma aislada
            para decidir el tratamiento.
        </div>
    `;

    resEl.classList.remove('hidden');
}

        // ADDITIONAL CALCULATORS: FRAMINGHAM, MMSE, PFEFFER, PAM, TFG, TABAQUISMO
        function calcMMSE() {
    const ids = [
        'mmse-ot', 'mmse-oe', 'mmse-fij',
        'mmse-at', 'mmse-mem', 'mmse-leng'
    ];

    const maximos = [5, 5, 3, 5, 3, 9];

    const valores = ids.map(id => {
        const raw = document.getElementById(id)?.value;
        return raw === '' || raw == null ? NaN : Number(raw);
    });

    const edadRaw = document.getElementById('mmse-edad')?.value;
    const edad = edadRaw === '' ? NaN : Number(edadRaw);
    const corteRaw = document.getElementById('mmse-esc')?.value;
    const corte = corteRaw === '' ? NaN : Number(corteRaw);
    const visual = document.getElementById('mmse-visual')?.checked || false;
    const resEl = document.getElementById('mmse-res');

    if (!resEl) return;

    if (valores.some((v, i) =>
        !Number.isInteger(v) || v < 0 || v > maximos[i]
    )) {
        alert('Completa todos los dominios con valores enteros dentro de sus rangos.');
        return;
    }

    if (!Number.isInteger(edad) || edad < 18 || edad > 120) {
        alert('Ingresa una edad válida entre 18 y 120 años.');
        return;
    }

    if (![21, 24, 26].includes(corte)) {
        alert('Selecciona el nivel de escolaridad.');
        return;
    }

    const bruto = valores.reduce((s, v) => s + v, 0);

    // Ajustes descritos en el documento de referencia colombiano.
    const ajusteEdad = edad > 75 ? 2 : (edad > 65 ? 1 : 0);
    const ajusteVisual = visual ? 2 : 0;

    const ajustado = Math.min(30, bruto + ajusteEdad + ajusteVisual);

    const sospecha = ajustado <= corte;

    resEl.innerHTML = `
        <div class="font-bold text-sm">Resultado MMSE</div>

        <div>
            Puntaje obtenido:
            <strong class="text-indigo-600">${bruto}/30</strong>
        </div>

        <div>
            Ajuste por edad:
            <strong>${ajusteEdad} puntos</strong>
        </div>

        <div>
            Ajuste visual:
            <strong>${ajusteVisual} puntos</strong>
        </div>

        <div>
            Puntaje ajustado:
            <strong class="text-teal-600">${ajustado}/30</strong>
        </div>

        <div>
            Punto de corte seleccionado:
            <strong>≤${corte}</strong>
        </div>

        <div class="font-bold">
            ${sospecha
                ? 'Tamizaje positivo: sospecha de alteración cognitiva.'
                : 'Tamizaje no positivo según el punto de corte seleccionado.'}
        </div>

        <div class="text-[11px] font-normal text-slate-500">
            Un resultado positivo requiere evaluación clínica integral,
            evolución temporal, repercusión funcional y búsqueda de causas
            potencialmente reversibles. Un resultado no positivo no excluye
            deterioro cognitivo.
        </div>

        <div class="text-[11px] font-normal text-amber-700 dark:text-amber-400">
            El puntaje no establece por sí solo diagnóstico ni gravedad de
            demencia. Considerar escolaridad, idioma, audición, visión,
            delirium, depresión y condiciones socioculturales. Los ajustes
            por edad y visión corresponden al documento de referencia
            colombiano y no deben extrapolarse automáticamente a otras
            versiones del MMSE.
        </div>
    `;

    resEl.classList.remove('hidden');
}

        function calcFindrisc() {
    const get = id => document.getElementById(id);

    const sexo = get('fd-sexo')?.value;
    const perimetro = parseFloat(get('fd-perim')?.value);

    const resEl = get('fd-res');
    if (!resEl) return;

    if (!sexo || !Number.isFinite(perimetro) ||
        perimetro < 30 || perimetro > 200) {

        resEl.innerHTML = `
            <span class="text-amber-600">
                Selecciona el sexo y registra un perímetro abdominal válido.
            </span>
        `;
        resEl.classList.remove('hidden');
        return;
    }

    const e = Number(get('fd-edad').value);
    const i = Number(get('fd-imc').value);
    const a = Number(get('fd-actividad').value);
    const g = Number(get('fd-glucosa').value);
    const f = Number(get('fd-fam').value);
    const fr = Number(get('fd-fruta').value);
    const ht = Number(get('fd-hta').value);

    let p = 0;

    if (sexo === 'h') {
        p = perimetro < 94 ? 0 : perimetro < 102 ? 3 : 4;
    } else {
        p = perimetro < 80 ? 0 : perimetro < 88 ? 3 : 4;
    }

    const total = e + i + p + a + g + f + fr + ht;

    let nivel = '';
    let riesgo = '';

    if (total < 7) {
        nivel = 'Bajo';
        riesgo = '1%';
    } else if (total <= 11) {
        nivel = 'Ligeramente elevado';
        riesgo = '4%';
    } else if (total <= 14) {
        nivel = 'Moderado';
        riesgo = '17%';
    } else if (total <= 20) {
        nivel = 'Alto';
        riesgo = '33%';
    } else {
        nivel = 'Muy alto';
        riesgo = '50%';
    }

    resEl.innerHTML = `
        <div class="space-y-2">
            <div>
                Puntaje FINDRISC:
                <span class="text-teal-600 font-bold">${total}/26 puntos</span>
            </div>

            <div>
                Nivel de riesgo:
                <strong class="text-indigo-600">${nivel}</strong>
            </div>

            <div>
                Riesgo estimado de desarrollar diabetes tipo 2
                en 10 años:
                <strong>${riesgo}</strong>
            </div>

            <div class="border-t border-slate-300 dark:border-slate-700 pt-2 text-[11px] font-normal">
                FINDRISC es una herramienta de estimación de riesgo,
                no diagnostica diabetes. Considerar evaluación
                mediante glucemia en ayunas o HbA1c según el contexto
                clínico. Un puntaje bajo no excluye diabetes.
            </div>
        </div>
    `;

    resEl.classList.remove('hidden');
}

        function calcPAM() {
    const pasValor = document.getElementById('pam-pas')?.value;
    const padValor = document.getElementById('pam-pad')?.value;
    const contexto = document.getElementById('pam-contexto')?.value;
    const edadValor = document.getElementById('pam-edad')?.value;
    const res = document.getElementById('pam-res');

    if (!res) return;

    res.classList.add('hidden');
    res.innerHTML = '';

    if (pasValor === '' || !Number.isFinite(Number(pasValor)) ||
        Number(pasValor) < 40 || Number(pasValor) > 300) {
        alert('Ingrese una PAS válida entre 40 y 300 mmHg.');
        return;
    }

    if (padValor === '' || !Number.isFinite(Number(padValor)) ||
        Number(padValor) < 20 || Number(padValor) > 200) {
        alert('Ingrese una PAD válida entre 20 y 200 mmHg.');
        return;
    }

    const pas = Number(pasValor);
    const pad = Number(padValor);

    if (pas <= pad) {
        alert('La PAS debe ser mayor que la PAD.');
        return;
    }

    if (!contexto) {
        alert('Seleccione el contexto clínico.');
        return;
    }

    const pam = (pas + (2 * pad)) / 3;

    let interpretacion = '';

    if (contexto === 'shock') {
        if (edadValor === '' ||
            !Number.isInteger(Number(edadValor)) ||
            Number(edadValor) < 18 ||
            Number(edadValor) > 120) {
            alert('Ingrese una edad válida entre 18 y 120 años.');
            return;
        }

        const edad = Number(edadValor);
        const minimo = edad >= 65 ? 60 : 60;
        const maximo = edad >= 65 ? 65 : 70;
        const objetivo = edad >= 65 ? '60–65' : '65 mmHg (aproximadamente ±5 mmHg)';

        if (pam < minimo) {
            interpretacion = `
                <div class="font-bold text-rose-600">
                    PAM inferior al rango objetivo inicial.
                </div>
                <p class="text-[11px] font-normal">
                    Revisar inmediatamente la situación hemodinámica,
                    perfusión y respuesta al tratamiento.
                </p>
            `;
        } else if (pam > maximo) {
            interpretacion = `
                <div class="font-bold text-amber-600">
                    PAM superior al rango objetivo inicial orientativo.
                </div>
                <p class="text-[11px] font-normal">
                    Individualizar la meta y valorar el contexto clínico.
                    No reducir vasopresores automáticamente por este resultado.
                </p>
            `;
        } else {
            interpretacion = `
                <div class="font-bold text-teal-600">
                    PAM dentro del rango objetivo inicial orientativo.
                </div>
                <p class="text-[11px] font-normal">
                    Esto no confirma perfusión tisular adecuada.
                    Evaluar estado mental, diuresis, lactato, llenado capilar
                    y evolución clínica.
                </p>
            `;
        }

        interpretacion += `
            <div class="text-[10px] text-slate-500 mt-2">
                Meta inicial de referencia SSC 2026: ${objetivo}.
                En adultos de 65 años o más se sugiere un rango de 60–65 mmHg.
                La meta debe individualizarse.
            </div>
        `;
    } else {
        interpretacion = `
            <div class="font-semibold">
                No se asigna una meta universal de PAM.
            </div>
            <p class="text-[11px] font-normal">
                Interpretar según diagnóstico, presión arterial basal,
                perfusión de órganos y contexto clínico.
                Una PAM aislada no confirma ni descarta hipoperfusión.
            </p>
        `;
    }

    res.innerHTML = `
        <div class="text-xl font-bold text-teal-600">
            PAM: ${pam.toFixed(1)} mmHg
        </div>
        <div class="text-[11px] text-slate-500">
            PAS: ${pas} mmHg · PAD: ${pad} mmHg
        </div>
        <div class="border-t border-slate-300 dark:border-slate-700 pt-2 mt-2">
            ${interpretacion}
        </div>
    `;

    res.classList.remove('hidden');
}


        function calcTFG() {
    const cr = Number(document.getElementById('tfg-cr')?.value);
    const edad = Number(document.getElementById('tfg-edad')?.value);
    const sexo = document.getElementById('tfg-sexo')?.value;
    const resEl = document.getElementById('tfg-res');

    if (!resEl) return;

    if (!Number.isFinite(cr) || cr < 0.1 || cr > 20) {
        alert('Ingresa una creatinina válida entre 0.1 y 20 mg/dL.');
        return;
    }

    if (!Number.isInteger(edad) || edad < 18 || edad > 120) {
        alert('Ingresa una edad válida entre 18 y 120 años.');
        return;
    }

    if (!['F', 'M'].includes(sexo)) {
        alert('Selecciona el sexo utilizado por la ecuación.');
        return;
    }

    // CKD-EPI 2021 basada en creatinina, sin variable de raza
    const mujer = sexo === 'F';
    const k = mujer ? 0.7 : 0.9;
    const alpha = mujer ? -0.241 : -0.302;

    const relacion = cr / k;

    const tfg =
        142 *
        Math.pow(Math.min(relacion, 1), alpha) *
        Math.pow(Math.max(relacion, 1), -1.2) *
        Math.pow(0.9938, edad) *
        (mujer ? 1.012 : 1);

    let categoria = '';
    let descripcion = '';

    if (tfg >= 90) {
        categoria = 'G1';
        descripcion = 'Normal o alta (≥90 mL/min/1.73 m²).';
    } else if (tfg >= 60) {
        categoria = 'G2';
        descripcion = 'Levemente disminuida (60–89 mL/min/1.73 m²).';
    } else if (tfg >= 45) {
        categoria = 'G3a';
        descripcion = 'Disminución leve-moderada (45–59 mL/min/1.73 m²).';
    } else if (tfg >= 30) {
        categoria = 'G3b';
        descripcion = 'Disminución moderada-severa (30–44 mL/min/1.73 m²).';
    } else if (tfg >= 15) {
        categoria = 'G4';
        descripcion = 'Disminución severa (15–29 mL/min/1.73 m²).';
    } else {
        categoria = 'G5';
        descripcion = 'Falla renal (<15 mL/min/1.73 m²).';
    }

    let advertencia = '';

    if (tfg >= 60) {
        advertencia = `
            Una TFG G1 o G2 aislada no establece enfermedad renal crónica.
            Se requieren marcadores de daño renal, como albuminuria,
            u otras alteraciones renales persistentes durante al menos
            3 meses.
        `;
    } else {
        advertencia = `
            Una TFG reducida aislada no confirma enfermedad renal crónica.
            Se debe demostrar persistencia durante al menos 3 meses
            o contar con otros datos clínicos que establezcan cronicidad.
            Considerar lesión renal aguda si la creatinina está cambiando.
        `;
    }

    resEl.innerHTML = `
        <div class="font-bold text-sm">Resultado CKD-EPI 2021</div>

        <div>
            TFG estimada:
            <strong class="text-teal-600">
                ${tfg.toFixed(1)} mL/min/1.73 m²
            </strong>
        </div>

        <div>
            Categoría de TFG:
            <strong class="text-indigo-600">${categoria}</strong>
        </div>

        <div class="font-normal">${descripcion}</div>

        <div class="text-[11px] font-normal text-slate-500 mt-2">
            ${advertencia}
        </div>

        <div class="text-[11px] font-normal text-slate-500">
            Para clasificar la enfermedad renal crónica se requiere integrar
            la categoría G con la albuminuria (A1, A2 o A3), la causa y la
            duración. La TFG estimada está normalizada a una superficie
            corporal de 1.73 m².
        </div>

        <div class="text-[11px] font-normal text-amber-700 dark:text-amber-400">
            La estimación puede ser poco fiable en lesión renal aguda,
            embarazo, extremos de masa muscular o situaciones de producción
            atípica de creatinina. Considerar cistatina C o medición de TFG
            cuando la precisión sea importante para una decisión clínica.
        </div>
    `;

    resEl.classList.remove('hidden');
}

        
function toggleTabInputs() {
    const estado = document.getElementById('tab-estado')?.value;
    const datos = document.getElementById('tab-datos');
    const abandono = document.getElementById('tab-abandono');
    const res = document.getElementById('tab-res');

    if (datos) {
        datos.classList.toggle('hidden', estado === '' || estado === 'nunca');
    }

    if (abandono) {
        abandono.classList.toggle('hidden', estado !== 'ex');
    }

    if (res) {
        res.classList.add('hidden');
        res.innerHTML = '';
    }
}

function calcTabaquismo() {
    const estado = document.getElementById('tab-estado')?.value;
    const cigsValor = document.getElementById('tab-cigs')?.value;
    const anosValor = document.getElementById('tab-anos')?.value;
    const abandonoValor = document.getElementById('tab-anos-abandono')?.value;
    const res = document.getElementById('tab-res');

    if (!res) return;

    res.classList.add('hidden');
    res.innerHTML = '';

    if (!estado) {
        alert('Seleccione el antecedente de tabaquismo.');
        return;
    }

    if (estado === 'nunca') {
        res.innerHTML = `
            <div class="text-xl font-bold text-teal-600">
                0 paquetes/año
            </div>
            <p class="text-[11px] font-normal">
                El paciente refiere que nunca ha fumado cigarrillos.
                Investigar otras exposiciones al tabaco si corresponde.
            </p>
        `;

        res.classList.remove('hidden');
        return;
    }

    if (cigsValor === '' || !Number.isFinite(Number(cigsValor)) ||
        Number(cigsValor) <= 0 || Number(cigsValor) > 100) {
        alert('Ingrese un promedio válido de cigarrillos al día, mayor de 0 y hasta 100.');
        return;
    }

    if (anosValor === '' || !Number.isFinite(Number(anosValor)) ||
        Number(anosValor) <= 0 || Number(anosValor) > 80) {
        alert('Ingrese un tiempo válido de consumo, mayor de 0 y hasta 80 años.');
        return;
    }

    const cigs = Number(cigsValor);
    const anos = Number(anosValor);

    let tiempoAbandono = null;

    if (estado === 'ex' && abandonoValor.trim() !== '') {
        tiempoAbandono = Number(abandonoValor);

        if (!Number.isFinite(tiempoAbandono) ||
            tiempoAbandono < 0 || tiempoAbandono > 100) {
            alert('Ingrese un tiempo válido desde el abandono del cigarrillo.');
            return;
        }
    }

    const paquetesAno = (cigs * anos) / 20;
    const estadoTexto = estado === 'actual' ? 'Fumador actual' : 'Exfumador';

    res.innerHTML = `
        <div class="text-[11px] text-slate-500 font-semibold">
            EXPOSICIÓN ACUMULADA AL CIGARRILLO
        </div>

        <div class="text-xl font-bold text-teal-600">
            ${paquetesAno.toFixed(2)} paquetes/año
        </div>

        <div class="text-[11px]">
            <strong>Antecedente:</strong> ${estadoTexto}
        </div>

        <div class="text-[11px]">
            <strong>Consumo promedio:</strong> ${cigs} cigarrillos/día
        </div>

        <div class="text-[11px]">
            <strong>Tiempo de consumo:</strong> ${anos} años
        </div>

        ${tiempoAbandono !== null ? `
            <div class="text-[11px]">
                <strong>Tiempo desde el abandono:</strong> ${tiempoAbandono} años
            </div>
        ` : ''}

        <div class="border-t border-slate-300 dark:border-slate-700 pt-2 mt-2 text-[11px] font-normal">
            <strong>Interpretación:</strong>
            El resultado cuantifica la exposición acumulada al cigarrillo.
            No diagnostica EPOC ni cáncer de pulmón y no determina por sí solo el riesgo individual.
        </div>

        <div class="text-[10px] text-slate-500 font-normal">
            Fórmula: (cigarrillos al día × años de consumo) / 20.
            Un paquete estándar equivale a 20 cigarrillos.
        </div>
    `;

    res.classList.remove('hidden');
}
        /* ================================================================
           CALCULADORAS EPOC — GOLD 2026 / BODE / DOSE / ANTHONISEN
           ================================================================ */
        function epocNum(id) {
            const el = document.getElementById(id);
            if (!el || el.value.trim() === '') return null;
            const n = Number(el.value);
            return Number.isFinite(n) ? n : null;
        }
        function epocValid(res, message) {
            if (res) { res.innerHTML = `<span class="text-rose-600">${message}</span>`; res.classList.remove('hidden'); }
            return false;
        }
        
function calcEpocCAT() {
    const v = epocNum('epoc-cat-score');
    const r = document.getElementById('epoc-cat-res');

    if (!r) return;

    if (v === null || !Number.isInteger(v) || v < 0 || v > 40) {
        return epocValid(r, 'Ingresa un puntaje entero entre 0 y 40.');
    }

    const mayorCarga = v >= 10;

    const nivel = mayorCarga
        ? 'Mayor carga de síntomas (CAAT ≥ 10)'
        : 'Menor carga de síntomas (CAAT < 10)';

    const interpretacion = mayorCarga
        ? 'Este resultado corresponde al umbral de mayor carga sintomática utilizado en GOLD 2026.'
        : 'Este resultado corresponde al rango de menor carga sintomática utilizado en GOLD 2026.';

    r.innerHTML = `
        <strong class="text-teal-600">
            CAAT / CAT: ${v}/40 puntos
        </strong>

        <div class="mt-1 font-semibold">
            ${nivel}
        </div>

        <div class="mt-1 font-normal">
            ${interpretacion}
        </div>

        <div class="mt-2 text-[11px] font-normal text-slate-500 dark:text-slate-400">
            Para clasificar GOLD ABE, integra este resultado con los antecedentes de exacerbaciones moderadas o graves del último año. Una o más exacerbaciones moderadas o graves sitúan al paciente en el grupo E, independientemente de los síntomas.
        </div>

        <div class="mt-1 text-[11px] font-normal text-slate-500 dark:text-slate-400">
            No diagnostica EPOC ni sustituye la espirometría.
        </div>
    `;

    r.classList.remove('hidden');
}
        
function calcEpocMMRC() {
    const v = epocNum('epoc-mmrc-grade');
    const r = document.getElementById('epoc-mmrc-res');

    if (!r) return;

    if (v === null || !Number.isInteger(v) || v < 0 || v > 4) {
        return epocValid(r, 'Selecciona un grado mMRC válido entre 0 y 4.');
    }

    const mayorDisnea = v >= 2;

    r.innerHTML = `
        <strong class="text-teal-600">mMRC: ${v}/4</strong>

        <div class="mt-1 font-semibold">
            ${mayorDisnea
                ? 'Mayor carga de disnea (mMRC ≥ 2)'
                : 'Menor carga de disnea (mMRC 0–1)'}
        </div>

        <div class="mt-1 font-normal text-[11px]">
            ${mayorDisnea
                ? 'Cumple el umbral de síntomas elevados utilizado en GOLD ABE.'
                : 'No alcanza por sí solo el umbral de síntomas elevados utilizado en GOLD ABE.'}
        </div>

        <div class="mt-1 font-normal text-[11px] text-slate-500">
            La mMRC mide limitación funcional por disnea. No determina por sí sola la gravedad espirométrica ni diagnostica EPOC.
        </div>
    `;

    r.classList.remove('hidden');
}
        
function calcEpocGOLD() {
    const ratio = document.getElementById('epoc-gold-ratio')?.value;
    const fev = epocNum('epoc-gold-fev');
    const cat = epocNum('epoc-gold-cat');
    const mmrc = epocNum('epoc-gold-mmrc');
    const ex = epocNum('epoc-gold-exac');

    const r = document.getElementById('epoc-gold-res');
    if (!r) return;

    if (ratio !== 'yes' && ratio !== 'no') {
        return epocValid(r, 'Selecciona la relación FEV₁/CVF posbroncodilatador.');
    }

    if (ratio === 'no') {
        r.innerHTML = `
            <div class="font-semibold text-rose-600">
                No se demuestra obstrucción persistente según el criterio espirométrico GOLD.
            </div>
            <div class="mt-1 text-[11px] font-normal">
                FEV₁/CVF ≥0,70. No se asigna grado espirométrico GOLD ni grupo ABE. Revisa el contexto clínico y la calidad de la espirometría.
            </div>
        `;
        r.classList.remove('hidden');
        return;
    }

    if (fev === null || fev <= 0 || fev > 150) {
        return epocValid(r, 'Ingresa un FEV₁ (% predicho) válido.');
    }

    if (cat !== null && (!Number.isInteger(cat) || cat < 0 || cat > 40)) {
        return epocValid(r, 'El CAAT/CAT debe ser un número entero entre 0 y 40.');
    }

    if (mmrc !== null && (!Number.isInteger(mmrc) || mmrc < 0 || mmrc > 4)) {
        return epocValid(r, 'El grado mMRC debe estar entre 0 y 4.');
    }

    if (cat === null && mmrc === null) {
        return epocValid(r, 'Introduce al menos una escala de síntomas: CAAT/CAT o mMRC.');
    }

    if (ex === null || !Number.isInteger(ex) || ex < 0 || ex > 30) {
        return epocValid(r, 'Ingresa el número de exacerbaciones moderadas o graves (0–30).');
    }

    let grade = '';

    if (fev >= 80) {
        grade = 'GOLD 1 — obstrucción leve';
    } else if (fev >= 50) {
        grade = 'GOLD 2 — obstrucción moderada';
    } else if (fev >= 30) {
        grade = 'GOLD 3 — obstrucción grave';
    } else {
        grade = 'GOLD 4 — obstrucción muy grave';
    }

    const caatElevado = cat !== null && cat >= 10;
    const mmrcElevado = mmrc !== null && mmrc >= 2;

    const symptomatic = caatElevado || mmrcElevado;

    let group = '';

    if (ex >= 1) {
        group = 'E';
    } else if (symptomatic) {
        group = 'B';
    } else {
        group = 'A';
    }

    let symptomExplanation = '';

    if (cat !== null && mmrc !== null) {
        symptomExplanation = symptomatic
            ? 'Mayor carga sintomática: CAAT ≥10 o mMRC ≥2.'
            : 'Menor carga sintomática: CAAT <10 y mMRC 0–1.';
    } else if (cat !== null) {
        symptomExplanation = caatElevado
            ? 'Mayor carga sintomática según CAAT ≥10.'
            : 'Menor carga sintomática según CAAT <10.';
    } else {
        symptomExplanation = mmrcElevado
            ? 'Mayor carga sintomática según mMRC ≥2.'
            : 'Menor carga sintomática según mMRC 0–1.';
    }

    const groupExplanation = group === 'E'
        ? 'Una o más exacerbaciones moderadas o graves en los últimos 12 meses. El grupo E se asigna independientemente de los síntomas.'
        : group === 'B'
            ? 'Sin exacerbaciones moderadas o graves en el último año y con mayor carga de síntomas.'
            : 'Sin exacerbaciones moderadas o graves en el último año y con menor carga de síntomas.';

    const discordance = cat !== null && mmrc !== null &&
        caatElevado !== mmrcElevado;

    r.innerHTML = `
        <div class="text-base">
            <strong class="text-teal-600">
                Grupo GOLD ${group}
            </strong>
        </div>

        <div class="mt-1 font-semibold">
            ${grade}
        </div>

        <div class="mt-2">
            <strong>Clasificación clínica:</strong>
            ${groupExplanation}
        </div>

        <div class="mt-2">
            <strong>Síntomas:</strong>
            ${symptomExplanation}
        </div>

        ${discordance ? `
            <div class="mt-2 text-amber-600 text-[11px] font-normal">
                CAAT y mMRC no coinciden en la clasificación sintomática. Revisa ambos resultados y el contexto clínico.
            </div>
        ` : ''}

        <div class="mt-2 text-[11px] font-normal text-slate-500 dark:text-slate-400">
            FEV₁/CVF posbroncodilatador <0,70. El grado espirométrico y el grupo ABE representan dimensiones diferentes. Integra comorbilidades, eosinófilos, tratamiento previo y evolución clínica.
        </div>
    `;

    r.classList.remove('hidden');
}
        function calcEpocBODE() {
            const kg = epocNum('epoc-bode-weight'), cm = epocNum('epoc-bode-height');
            const fev = epocNum('epoc-bode-fev'), mmrc = epocNum('epoc-bode-mmrc'), walk = epocNum('epoc-bode-walk');
            const r = document.getElementById('epoc-bode-res'); if (!r) return;
            if (kg === null || kg <= 0 || cm === null || cm < 50 || cm > 250) return epocValid(r, 'Ingresa peso y talla válidos.');
            if (fev === null || fev <= 0 || fev > 150) return epocValid(r, 'Ingresa FEV₁ (% predicho) válido.');
            if (mmrc === null || !Number.isInteger(mmrc) || mmrc < 0 || mmrc > 4) return epocValid(r, 'Selecciona mMRC de 0 a 4.');
            if (walk === null || walk < 0 || walk > 1200) return epocValid(r, 'Ingresa una distancia válida de 0 a 1200 m.');
            const bmi = kg / Math.pow(cm / 100, 2);
            const pBmi = bmi > 21 ? 0 : 1;
            const pFev = fev >= 65 ? 0 : fev >= 50 ? 1 : fev >= 36 ? 2 : 3;
            const pMmrc = mmrc <= 1 ? 0 : mmrc === 2 ? 1 : mmrc === 3 ? 2 : 3;
            const pWalk = walk >= 350 ? 0 : walk >= 250 ? 1 : walk >= 150 ? 2 : 3;
            const total = pBmi + pFev + pMmrc + pWalk;
            r.innerHTML = `<div class="text-base"><strong class="text-teal-600">BODE: ${total}/10 puntos</strong></div><div>IMC ${bmi.toFixed(1)} (${pBmi} pt) · FEV₁ ${pFev} pt · mMRC ${pMmrc} pt · caminata 6 min ${pWalk} pt.</div><div class="mt-1 font-normal">${total <= 2 ? 'Cuartil BODE 1 (0–2).' : total <= 4 ? 'Cuartil BODE 2 (3–4).' : total <= 6 ? 'Cuartil BODE 3 (5–6).' : 'Cuartil BODE 4 (7–10).'}</div><div class="mt-1 text-[11px] font-normal text-slate-500">Mayor puntaje se asocia con peor pronóstico. Los cuartiles no equivalen a una predicción individual exacta de supervivencia.</div>`;
            r.classList.remove('hidden');
        }
        function calcEpocDOSE() {
            const mmrc = epocNum('epoc-dose-mmrc'), fev = epocNum('epoc-dose-fev');
            const smoke = epocNum('epoc-dose-smoke'), ex = epocNum('epoc-dose-exac');
            const r = document.getElementById('epoc-dose-res'); if (!r) return;
            if (mmrc === null || !Number.isInteger(mmrc) || mmrc < 0 || mmrc > 4) return epocValid(r, 'Selecciona mMRC de 0 a 4.');
            if (fev === null || fev <= 0 || fev > 150) return epocValid(r, 'Ingresa FEV₁ (% predicho) válido.');
            if (ex === null || !Number.isInteger(ex) || ex < 0 || ex > 30) return epocValid(r, 'Ingresa exacerbaciones válidas (0–30).');
            const pD = mmrc <= 1 ? 0 : mmrc === 2 ? 1 : mmrc === 3 ? 2 : 3;
            const pO = fev >= 50 ? 0 : fev >= 30 ? 1 : 2;
            const pS = smoke === 1 ? 1 : 0;
            const pE = ex <= 1 ? 0 : ex <= 3 ? 1 : 2;
            const total = pD + pO + pS + pE;
            r.innerHTML = `<div class="text-base"><strong class="text-teal-600">DOSE: ${total}/8 puntos</strong></div><div>Disnea ${pD} pt · obstrucción ${pO} pt · tabaquismo ${pS} pt · exacerbaciones ${pE} pt.</div><div class="mt-1">${total <= 1 ? 'Puntaje 0–1.' : total <= 3 ? 'Puntaje 2–3.' : 'Puntaje ≥4: se asocia con mayor riesgo de ingreso hospitalario y falla respiratoria.'}</div><div class="mt-1 text-[11px] font-normal text-slate-500">No es una escala para decidir por sí sola tratamiento agudo ni reemplaza GOLD ABE.</div>`;
            r.classList.remove('hidden');
        }
        function calcEpocAnthonisen() {
            const d = !!document.getElementById('epoc-anth-dysp')?.checked;
            const v = !!document.getElementById('epoc-anth-vol')?.checked;
            const p = !!document.getElementById('epoc-anth-pur')?.checked;
            const vent = !!document.getElementById('epoc-anth-vent')?.checked;
            const n = [d, v, p].filter(Boolean).length;
            const r = document.getElementById('epoc-anth-res'); if (!r) return;
            const type = n === 3 ? 'Tipo I (tres síntomas cardinales)' : n === 2 ? 'Tipo II (dos síntomas cardinales)' : n === 1 ? 'Un síntoma cardinal (tipo III solo si hay síntomas/signos de apoyo)' : 'Sin síntomas cardinales seleccionados';
            const antibiotic = vent || n === 3 || (n === 2 && p);
            r.innerHTML = `<strong class="text-teal-600">${type}</strong><div>${n}/3 síntomas cardinales presentes.</div><div class="mt-1">${antibiotic ? 'Cumple características en las que suele considerarse antibiótico, tras valoración clínica y según protocolo local.' : 'Los criterios cardinales seleccionados no establecen por sí solos indicación de antibiótico.'}</div><div class="mt-1 text-[11px] font-normal text-slate-500">Valora gravedad, gases, necesidad de soporte ventilatorio y diagnósticos diferenciales (neumonía, TEP, insuficiencia cardiaca, neumotórax).</div>`;
            r.classList.remove('hidden');
        }

        // ================= PLANTILLAS MÉDICAS INTELIGENTES =================
const TPL_TEMPLATES = {
  urg_dolor: {
    name: 'Urgencias · Dolor torácico',
    blocks: [
      {title:'Motivo de consulta', text:'Dolor torácico.'},
      {title:'Enfermedad actual', text:'Paciente [sexo] de [edad] años, quien consulta por cuadro clínico de [tiempo de evolución] consistente en dolor torácico de localización [localización], inicio [súbito/progresivo], carácter [opresivo/punzante/urente], intensidad , irradiación , duración , con factores desencadenantes , atenuantes  y exacerbantes .'},
      {title:'Síntomas concomitantes y ALICIA', text:'Concomitante presenta [disnea / diaforesis / náuseas / vómito / palpitaciones / síncope / tos / fiebre / otros]. Niega . Relación con esfuerzo: . Episodios previos: .'},
      {title:'Antecedentes y factores de riesgo cardiovascular', text:'Antecedentes personales: [HTA / DM / dislipidemia / enfermedad cardiovascular / tabaquismo / enfermedad renal / otros]. Medicación habitual: . Alergias: . Antecedentes familiares cardiovasculares: .'},
      {title:'Examen físico y signos vitales', text:'PA  mmHg, FC  lpm, FR  rpm, SatO₂  %, T  °C. Estado general {r}alterado{/r} / {v}bueno{/v}. Cardiovascular: {r}soplos, galope, roce{/r} / {v}sin soplos ni galope{/v}. Respiratorio: {r}crepitantes, sibilancias, hipoventilación{/r} / {v}murmullo vesicular conservado, sin agregados{/v}. Pulsos periféricos {r}asimétricos o ausentes{/r} / {v}presentes y simétricos{/v}. Perfusión {r}alterada (llenado capilar > 2 s){/r} / {v}adecuada (llenado capilar < 2 s){/v}.'},
      {title:'Estudios y evaluación', text:'ECG: [hora y hallazgos]. Troponina: [valor / hora / referencia]. Otros estudios: . Impresión clínica y diagnósticos diferenciales: .'},
      {title:'Análisis y conducta', text:'Se realiza valoración de riesgo y estabilidad hemodinámica. Conducta: . Reevaluación: . Criterios de observación, hospitalización o remisión: .'}
    ]
  },
  urg_disnea: {
    name: 'Urgencias · Disnea',
    blocks: [
      {title:'Motivo de consulta', text:'Disnea.'},
      {title:'Enfermedad actual', text:'Paciente [sexo] de [edad] años, con cuadro de [tiempo] de evolución consistente en disnea de inicio [súbito/progresivo], curso , actualmente [en reposo/con esfuerzo], clase funcional habitual  y actual .'},
      {title:'Caracterización y síntomas concomitantes', text:'Se acompaña de [tos / expectoración / fiebre / dolor torácico / sibilancias / ortopnea / disnea paroxística nocturna / edema / hemoptisis / otros]. Exposición a humo, biomasa o tabaco: . Episodios previos: .'},
      {title:'Antecedentes relevantes', text:'Antecedentes cardiopulmonares: [asma / EPOC / falla cardiaca / TEP / otros]. Hospitalizaciones o intubaciones previas: . Oxígeno domiciliario: . Medicación y adherencia: . Alergias: .'},
      {title:'Signos vitales y examen físico', text:'PA  mmHg, FC  lpm, FR  rpm, SatO₂  % [con/sin oxígeno], T  °C. Trabajo respiratorio . Habla . Auscultación pulmonar . Ruidos cardiacos . Edemas/perfusión .'},
      {title:'Estudios y análisis', text:'Gasometría . Radiografía/imagen . ECG . Laboratorios . Impresión diagnóstica y diferenciales .'},
      {title:'Conducta y reevaluación', text:'Intervenciones realizadas . Respuesta clínica . Plan de monitorización . Criterios de hospitalización/remisión .'}
    ]
  },
  consulta: {
    name: 'Consulta externa · Medicina general',
    blocks: [
      {title:'Motivo de consulta', text:'Paciente consulta por [motivo principal].'},
      {title:'Enfermedad actual', text:'Paciente [sexo] de [edad] años, quien acude por cuadro de [tiempo] de evolución caracterizado por [síntoma principal]. Inicio , localización , características , intensidad , frecuencia , duración , factores agravantes , atenuantes  y síntomas concomitantes .'},
      {title:'Antecedentes', text:'Patológicos . Farmacológicos . Quirúrgicos . Alérgicos . Toxicológicos . Familiares . Gineco-obstétricos, si aplica .'},
      {title:'Tratamiento habitual y adherencia', text:'Tratamiento formulado . Refiere adherencia [buena / parcial / baja / nula]. Omisiones o barreras para cumplirlo . Efectos adversos .'},
      {title:'Revisión por sistemas', text:'Positivos: . Negativos relevantes: .'},
      {title:'Examen físico', text:'Signos vitales: PA , FC , FR , SatO₂ , T , peso , talla . Estado general {r}alterado{/r} / {v}bueno{/v}. Hallazgos por sistemas: {v}sin hallazgos patológicos{/v}. Anormal: {r}hallazgos anormales: .'},
      {title:'Análisis', text:'Paciente con [problemas clínicos], hallazgos relevantes . Impresión diagnóstica . Diagnósticos diferenciales .'},
      {title:'Plan', text:'Paraclínicos . Tratamiento . Educación y signos de alarma . Seguimiento .'}
    ]
  },
examen_fisico_completo: {
    name: 'Examen físico general (checklist, céfalo-caudal)',
    cat: 'examen',
    blocks: [
      {title:'Signos vitales', text:'Temperatura: \nLugar de toma: \nHorario: \nPresión arterial D: sedente , bipedestación \nPresión arterial I: sedente , bipedestación \nFrecuencia cardíaca: \nFrecuencia de pulso:  Rítmico / arrítmico\nAmplitud: magnus / parvus / filiforme / {v}normal{/v}\nTensión o dureza: \nIgualdad (misma amplitud): \nSimetría: \nFrecuencia respiratoria: '},
      {title:'Apariencia general', text:'Género: M / F\nTipo constitucional: brevilíneo / normolíneo / longilíneo\nEdad aparente: concuerda / menor / mayor\nEstado nutricional: {v}normal{/v} / {r}obesidad / desnutrición / caquexia{/r}\nHidratación: {v}hidratado{/v} / {r}deshidratado (leve, moderada, severa){/r}\nFacies: compuesta / {r}descompuesta (hipertiroidismo, hipotiroidismo, parálisis facial, acromegalia, mongoloide, Cushing, renal){/r}\nActitud o postura: mímica normal / bradicinesia, decúbito activo / indiferente / obligado / preferencial / pasivo\nColoración de la piel: {v}normal{/v} / {r}pálida / rubicunda / ictérica / cianótica (central o periférica){/r}\nEvidencia de dolor, tos o disnea: no / dolor / tos / disnea\nMovimientos involuntarios: no / sí (temblor, fasciculaciones, mioclonías, tics, corea, atetosis, balismo, convulsiones)\nMarcha: velocidad , dirección , simetría, base de sustentación, dirección de los pies, altura y longitud de los pasos, postura, balanceo de los brazos\nAnormales: antálgica / hemipléjica / tabética / cerebelosa / parkinsoniana / parapléjica / tijeras / pato / equina o parética / magnética\nOlores anormales: no / sí\nEstado de conciencia: {v}alerta{/v} / {r}obnubilación / estupor / coma{/r}\nOrientación: tiempo / espacio / persona\nEstado emocional: depresión / ansiedad / exaltación / enfado / apatía\nActitud frente a la enfermedad: \nPresencia de elementos externos: sí / no\nEstado aparente de salud: {v}bueno{/v} / {n}regular{/n} / {r}malo{/r}'},
      {title:'Evaluación antropométrica', text:'Peso: \nTalla: \nIMC: \nÍndice cintura-cadera y porcentaje de pérdida de peso: '},
      {title:'Piel', text:'Color: {v}normal{/v} / {r}pálida / cianótica / ictericia / eritema{/r}\nHidratación: {v}hidratada{/v} / {r}deshidratada{/r}\nGrosor: \nElasticidad: \nBrillo: \nAdherencia: \nLesiones: {v}ninguna{/v} / {r}lesiones, petequias, equimosis, hematomas{/r}'},
      {title:'Cabello', text:'Implantación: \nCantidad: \nColor: \nBrillo: \nGrosor: \nAdherencia: \nEstado del cuero cabelludo: {v}normal{/v} / {r}alterado{/r}'},
      {title:'Uñas', text:'Forma: \nColor: \nLesiones: {v}ninguna{/v} / {r}onicomicosis, onicolisis, koilonychia{/r}'},
      {title:'Cabeza', text:'Forma: \nTamaño: \nTransparencia: \nMovimientos anormales: no / sí\nDolor a la palpación: no / sí\nPercusión: \nDeformidades localizadas: no / sí'},
      {title:'Ojos', text:'Párpados: posición , tamaño de la hendidura palpebral , borde libre , pestañas , lesiones {v}ninguna{/v} / {r}ptosis, ectropión, entropión, chalazión, hordéolo{/r}\nConjuntivas: {v}húmedas, normocoloreadas{/v} / {r}pálidas, ictéricas, hiperémicas, quemosis{/r}\nGlobos oculares: {v}normales{/v} / {r}exoftalmos, enoftalmos, ausencia del globo ocular{/r}\nCórnea: {v}transparente, brillante{/v} / {r}opacidad, úlcera, queratitis{/r}\nCámara anterior: profundidad , transparencia \nIris: color , coloboma \nPupilas: posición , forma , tamaño , igualdad , color , bordes , hippus fisiológico \nEsclerótica: {v}blanca{/v} / {r}ictérica, inyectada{/r}\nAgudeza visual: corregida y no corregida , agujero estenopeico \nCampimetría: por confrontación \nFondo de ojo: papila óptica , excavación fisiológica , arterias , venas , relación arteria/vena , hemorragias , exudados , otros \nTensión ocular: a la palpación \nMúsculos extrínsecos: posición primaria de mirada , movimientos oculares unilaterales , conjugados , cover test \nReflejos pupilares: fotomotor directo , fotomotor consensual , acomodación-convergencia '},
      {title:'Nariz y senos paranasales', text:'Inspección: forma , tamaño , lesiones de la piel , aleteo nasal , permeabilidad de las fosas nasales \nPalpación: de la pirámide nasal , senos paranasales , puntos de Valleix del trigémino \nRinoscopia anterior: mucosa , tabique , cornetes , secreciones , cuerpos extraños '},
      {title:'Boca', text:'Labios: {v}normales, rosados, húmedos{/v} / {r}cianóticos, pálidos, secos, lesiones{/r}\nMucosa oral: {v}rosada, húmeda, sin lesiones{/v} / {r}pálida, seca, lesiones, aftas, candidiasis{/r}\nDientes: número , caries , oclusión dental , prótesis \nEncías: {v}rosadas, sin sangrado{/v} / {r}eritematosas, sangrantes, hiperplásicas{/r}\nPaladar duro: forma , mucosa , lesiones \nAmígdalas: {v}normales, sin exudado{/v} / {r}hipertróficas, con exudado, asimétricas{/r}\nFaringe: mucosa , escurrimiento posterior \nLengua: forma , tamaño , color , superficie dorsal y ventral , lesiones \nPiso de la boca: frenillo lingual , mucosa \nATM: desplazamiento de los cóndilos , apertura bucal , dolor a la palpación , crujidos '},
      {title:'Oídos', text:'Pabellón auricular: {v}normal, simétrico{/v} / {r}deformidad, asimetría, lesiones{/r}\nRegión preauricular: apéndices , fístulas , ganglios \nRegión mastoidea: cambios en la piel , dolor a la palpación \nCAE: permeabilidad , secreciones anormales , cerumen , lesiones , cuerpos extraños \nMembrana timpánica: {v}nacarada, brillante, íntegra{/v} / {r}eritematosa, opaca, abombada, perforada, cono luminoso ausente{/r}'},
      {title:'Cuello', text:'Inspección: forma , tamaño , posición , latidos , ingurgitación , deformidades localizadas \nPalpación: cadenas ganglionares cervicales , músculos , pulsos carotídeos , glándulas submaxilares , venas , laringe , tráquea , glándula tiroides \nPercusión: dolor en apófisis espinosas \nAuscultación: {v}sin soplos{/v} / {r}soplos carotídeos{/r}\nMovilidad: {v}activa y pasiva conservada{/v} / {r}limitada, dolorosa{/r}'},
      {title:'Columna vertebral', text:'Inspección: curvatura , postura , deformidades \nPalpación: volumen muscular , dolor en músculos y vértebras \nMovilidad: movimientos activos \nManiobras: Schober , Adams , articulación sacroilíaca , compresión cervical '},
      {title:'Extremidades', text:'Inspección: ejes , longitudes , perímetro , piel , trayectos vasculares , articulares \nPalpación: piel , temperatura , trofismo muscular , puntos dolorosos , articulaciones \nFunción: movimientos activos , movimientos pasivos , movimientos contraresistencia , movilidad anormal \nManiobras para miembro superior: estrecho superior de tórax , Finkelstein , túnel carpiano , maniobra de la O , Allen \nManiobras para miembro inferior: Patrick , Lasègue , choque rotuliano , cajones anterior y posterior , bostezo medial y lateral , signos meniscales '},
      {title:'Sistema linfático', text:'Adenopatías: {v}ausentes{/v} / {r}presentes: localización , forma , tamaño , número , bordes , superficie , consistencia , dolor , movilidad , piel que la recubre , latidos , frémitos , soplos{/r}'},
      {title:'Tórax', text:'INSPECCIÓN\nTipo de tórax: correspondencia con el tipo constitucional , deformidades generalizadas \nDeformidades localizadas: asimetría en la forma y tamaño del tórax \nCaracterísticas de la respiración: frecuencia , ritmo , amplitud , patrón respiratorio , asimetría en la movilidad respiratoria , relación inspiración/espiración \nSignos de dificultad respiratoria: {v}ninguno{/v} / {r}tirajes, retracciones, uso de músculos accesorios{/r}\nCirculación colateral: distribución y dirección del flujo \nTirajes: intercostales , supraesternales , supraclaviculares , subcostales , universales \nGlándula mamaria: forma , deformidades , características del pezón , ginecomastia \nÁrea precordial: choque de punta , otros latidos \n\nPALPACIÓN\nElementos de la pared: piel , TCS , edema , enfisema subcutáneo , músculos , cadenas ganglionares , reja costal , dolor \nCaracterísticas del ápex: localización , intensidad , área , número , movilidad \nElasticidad y expansibilidad \nFrémitos: vocal , brónquico , pericárdico , valvulares \nSucusión hipocrática \n\nPERCUSIÓN\nSonidos anormales: localización del claro pulmonar , matidez hepática , matidez cardíaca , espacio semilunar de Traube \nExcursión diafragmática \nSonidos anormales \n\nAUSCULTACIÓN PULMONAR\nMurmullo vesicular y respiración broncovesicular: intensidad , tono , timbre , continuidad , relación I:E \nRuidos agregados: {v}ninguno{/v} / {r}localización , tono , timbre , ubicación en las fases respiratorias , modificaciones con la tos{/r}\nAuscultación de la voz: transmisión normal , aumentada , disminuida o ausente \n\nAUSCULTACIÓN CARDÍACA\nFrecuencia y ritmo: , sincronismo con el pulso \nCaracterísticas de S1 y S2: intensidad , tono , timbre , unidad \nPresencia de S3 o S4: {v}ninguno{/v} / {r}ruidos fisiológicos o ritmo de galope{/r}\nSoplos valvulares: {v}ninguno{/v} / {r}características semiológicas{/r}\nFrote pericárdico: {v}ninguno{/v} / {r}presente{/r}\nModificaciones con maniobras o posiciones '},
      {title:'Vascular periférico', text:'Inspección: piel y anexos , cambios tróficos \nPalpación: temperatura , edema , volumen muscular , pulsos periféricos \nAuscultación: {v}sin soplos en grandes vasos{/v} / {r}soplos en grandes vasos{/r}\nManiobras especiales: estrecho superior del tórax , Allen , llenado capilar , palidez en elevación y rubor en declive , Perthes y Trendelemburg '},
      {title:'Abdomen y región lumbar', text:'INSPECCIÓN\nForma y tamaño: tipo de abdomen , deformidades generalizadas \nDeformidad localizada \nMovimientos visibles: latidos , peristaltismo , movilidad respiratoria , movimientos fetales \nCirculación colateral: patrón de distribución y dirección del flujo \nOmbligo: forma , tamaño , posición , piel \nPilificación: cantidad y distribución \nPuntos herniarios: línea alba , ombligo , regiones inguinales , región crural \n\nPALPACIÓN\nElementos de la pared: piel , TCS , tensión abdominal y defensa , signo de Blumberg , hernias , ganglios inguinales , puntos dolorosos \nPalpación del contenido: vísceras palpables , pulsos , masas , signos de ascitis , características semiológicas \n\nPERCUSIÓN\nSonoridad normal: tamaño hepático , tamaño esplénico , espacio semilunar de Traube \nSonoridad anormal: signos de ascitis pequeña, mediana y grande , neumoperitoneo , globo vesical , embarazo , tumores \nDolor: signo de Blumberg generalizado \n\nAUSCULTACIÓN\nPeristaltismo: intensidad , tono , timbre , frecuencia , cantidad \nSoplos: aórticos , renales , ilíacos , placentarios \nFetocardia \nFrotes: hepático , esplénico \nTamaño hepático: percusión auscultada \n\nREGIÓN LUMBAR\nInspección: deformidades , escoliosis , cambios de la piel \nPalpación: puntos dolorosos costovertebrales y costomusculares \nPercusión: dolor a la puño percusión renal \nAuscultación: soplos renales '},
      {title:'Examen ano-rectal', text:'Inspección: región anal y perianal \nPalpación: esfínter anal, ampolla rectal, próstata, cuello uterino, fondo de saco de Douglas \nCaracterísticas de las heces: '},
      {title:'Genitales', text:'MASCULINOS - Inspección genitales externos . Palpación . Transiluminación .\nFEMENINOS - Genitales externos . Especuloscopia . Tacto vaginal .'},
      {title:'Sistema nervioso - Examen mental', text:'Funciones globales: orientación , conocimientos generales , atención , razonamiento o raciocinio (abstracción, juicio, introspección) , percepción \nFunciones de localización bilateral: memoria inmediata , reciente , remota . Estado afectivo \nFunciones con localización hemisférica: afasia , agnosias , apraxias '},
      {title:'Sistema nervioso - Pares craneales', text:'Primer par (olfatorio): percepción y discriminación de olores \nSegundo par (oftálmico): agudeza visual , campos visuales , fondo de ojo \nTercero, cuarto y sexto pares (oculomotores): inspección de las hendiduras palpebrales , posición de los globos oculares , pupilas , movimientos oculares en seis posiciones , movimientos de mirada conjugada , reflejos fotomotor directo , indirecto o consensual , acomodación o convergencia , paradójico de Marcus Gunn , cilioespinal \nQuinto par (trigémino): sensibilidad táctil burda , dolorosa , térmica , discriminativa de la cara , músculos masticadores: inspección , palpación , movimientos voluntarios y contraresistencia , reflejos maseterino y corneano , puntos de Valleix \nSéptimo par (facial): inspección de las líneas de expresión facial , movilidad facial voluntaria , movimientos contra resistencia , signo del platisma de Babinski , tremor palpebral , reflejo orbicular de los ojos y de los labios , gusto de los 2/3 anteriores de la lengua \nOctavo par (vestibulococlear): rama vestibular: nistagmus espontáneo y posicional, clasificar según dirección, velocidad, amplitud y grado. Nistagmus provocado (calórico y optiquinético). Rama coclear: examen de la agudeza auditiva: voz hablada normal / cuchicheada / roce de dedos / reloj. Pruebas con el diapasón: Weber , Rinne , Schwabach y Bing \nNoveno y décimo pares (glosofaríngeo y vago): inspección del istmo de las fauces , movilidad voluntaria , reflejo nauseoso \nUndécimo par (accesorio): inspección y palpación del ECOM y trapecio , motilidad voluntaria y contraresistencia \nDuodécimo par (hipogloso): inspección , palpación , movimientos voluntarios de la lengua '},
      {title:'Sistema nervioso - Signos radiculares', text:'Signos radiculares generales: Lasègue , Naffzinger \nSignos radiculares focales: raíces cervicales , lumbares , sacras '},
      {title:'Sistema nervioso - Sistema motor', text:'Inspección: relieves musculares , mediciones , dominancia corporal \nMovimientos involuntarios: temblores , tics , coreas , fasciculaciones , convulsiones \nMarcha: anormalidades de origen neurológico \nMovimientos voluntarios: energía , velocidad , amplitud \nMovimientos contraresistencia \nMovimientos pasivos: espasticidad , rigidez , hipotonía , hipertonía \nReflejos normales profundos del miembro superior: bicipital , tricipital , húmero-estilo-radial , flexores de los dedos \nReflejos normales profundos del miembro inferior: patelar , aquiliano \nReflejos superficiales: cutáneos abdominales (superior, medio, inferior) , cremasteriano , anal superficial , plantar \nReflejos patológicos: Hoffman , Tromner , palmo-mentoniano , presión forzada , enganche y búsqueda , Babinski y sucedáneos , clonus de pie, rótula, mano y mandíbula (hiperreflexia) '},
      {title:'Sistema nervioso - Sistema sensitivo', text:'Esquemas sensitivos cutáneos: radicular, troncular, medular, talámico o cortical \nSensibilidades superficiales: táctil burda , dolorosa objetiva , térmica \nSensibilidades profundas: vibratoria (palestesia) , discriminativa (compás de Weber) , dolor profundo (signos de Pitres y Abadie) , signo de Tinel '},
      {title:'Sistema nervioso - Coordinación y cerebelo', text:'Coordinación equilibratoria - Estación de pies con ojos abiertos y cerrados, pies juntos con ojos abiertos y cerrados, un pie delante del otro con ojos abiertos y cerrados. Extensión del tronco . Características de la marcha normal , sobre una línea , en tándem , alrededor de un punto central . Pulsiones . Discronometría . Coordinación no equilibratoria - Índice-nariz , índice-índice , raya horizontal de Babinski , talón-rodilla . Diadococinesia . Asinergia muscular . Tono: hipotonía , astenia muscular . Lenguaje: palabra explosiva , macrografía . Alteraciones oculares: dismetría ocular . Reflejos pendulares . Desviación del índice de Barany .'},
      {title:'Sistema nervioso - Signos meníngeos', text:'Rigidez de nuca para la flexión . Signos de Kernig y Brudzinski .'}
    ]
  }
,
  evolucion: {
    name: 'Hospitalización · Evolución médica',
    blocks: [
      {title:'Identificación y contexto', text:'Paciente [sexo] de [edad] años, día  de hospitalización, con diagnósticos de .'},
      {title:'Evolución subjetiva', text:'Durante las últimas  horas refiere [mejoría / persistencia / empeoramiento] de [síntomas]. Síntomas nuevos . Tolerancia oral . Diuresis . Deposiciones .'},
      {title:'Hallazgos objetivos', text:'Signos vitales: PA , FC , FR , SatO₂ , T . Balance hídrico . Examen físico dirigido . Paraclínicos relevantes y tendencia .'},
      {title:'Tratamiento y respuesta', text:'Tratamiento actual . Adherencia/administración durante estancia . Respuesta y eventos adversos . Dispositivos/soportes .'},
      {title:'Análisis por problemas', text:'1. [Problema]: [estado y análisis]. 2. [Problema]: [estado y análisis]. 3. [Problema]: [estado y análisis].'},
      {title:'Plan', text:'Continuar/ajustar . Solicitar/seguir . Interconsultas . Vigilancia . Criterios de egreso .'}
    ]
  },
  sbar: {
    name: 'Entrega de turno · SBAR',
    blocks: [
      {title:'S · Situación', text:'Paciente [identificación institucional], [edad] años, ubicado en [servicio/cama], con diagnóstico/problema principal . Motivo de entrega: . Estado actual .'},
      {title:'B · Antecedentes', text:'Antecedentes relevantes . Motivo de ingreso y evolución . Tratamientos/soportes actuales . Alergias .'},
      {title:'A · Evaluación', text:'Signos vitales . Hallazgos actuales . Paraclínicos relevantes . Riesgos identificados . Cambios durante el turno .'},
      {title:'R · Recomendaciones', text:'Pendientes . Medicamentos/horarios por verificar . Monitorización . Signos de alarma y acciones si aparecen .'}
    ]
  },
urg_abdomen: {
    name: 'Urgencias · Dolor abdominal',
    cat: 'urgencias',
    blocks: [
      {title:'Motivo de consulta', text:'Dolor abdominal.'},
      {title:'Enfermedad actual', text:'Paciente [sexo] de [edad] años, quien consulta por cuadro de [tiempo] de evolución consistente en dolor abdominal de localización [epigastrio / HCD / HII / hipogastrio / difuso], carácter [cólico / continuo / punzante], intensidad , con irradiación .'},
      {title:'Síntomas concomitantes', text:'Acompañado de [náuseas / vómito / diarrea / estreñimiento / fiebre / anorexia / melena / hematoquecia / disuria / otros]. Niega . Relación con la ingesta: .'},
      {title:'Antecedentes relevantes', text:'Antecedentes: [cirugía abdominal previa / litiasis biliar / úlcera péptica / EII / otros]. Medicación habitual: . Alergias: .'},
      {title:'Signos vitales y examen físico', text:'PA  mmHg, FC  lpm, FR  rpm, SatO₂  %, T  °C. Abdomen: . Blumberg . Murphy . Rovsing . Psoas . Obturador .'},
      {title:'Estudios y evaluación', text:'Laboratorios . Imágenes . Impresión clínica y diferenciales .'},
      {title:'Conducta', text:'Tratamiento . Observación / hospitalización / remisión . Signos de alarma explicados .'}
    ]
  },
  urg_cefalea: {
    name: 'Urgencias · Cefalea aguda',
    cat: 'urgencias',
    blocks: [
      {title:'Motivo de consulta', text:'Cefalea.'},
      {title:'Enfermedad actual', text:'Paciente [sexo] de [edad] años, quien consulta por cefalea de [tiempo] de evolución, de inicio [súbito / progresivo], localización , carácter [pulsátil / opresivo / punzante], intensidad .'},
      {title:'Caracterización y banderas rojas', text:'Peor cefalea de la vida: [sí / no]. Inicio en segundos: . Fiebre: . Rigidez de nuca: . Déficit focal: . Trauma reciente: . Embarazo: .'},
      {title:'Antecedentes', text:'HTA , migraña , uso de anticoagulantes , cefaleas previas . Medicación habitual .'},
      {title:'Examen neurológico y signos vitales', text:'PA , FC , T . Glasgow . Pupilas . Fondo de ojo . Rigidez nucal . Déficit focal .'},
      {title:'Estudios', text:'TC de cráneo . Punción lumbar . Laboratorios .'},
      {title:'Análisis y conducta', text:'Impresión diagnóstica . Diferenciales . Conducta .'}
    ]
  },
  urg_trauma: {
    name: 'Urgencias · Trauma',
    cat: 'urgencias',
    blocks: [
      {title:'Motivo de consulta', text:'Trauma.'},
      {title:'Mecanismo y cinemática', text:'Mecanismo: . Hora del evento: . Cinemática de alto/bajo impacto: . Uso de casco/cinturón: . Ingesta de alcohol/drogas: .'},
      {title:'Enfermedad actual', text:'Paciente [sexo] de [edad] años, quien consulta por trauma de [tiempo]. Dolor en . Pérdida de conciencia: . Vómito: .'},
      {title:'Revisión por sistemas (trauma)', text:'Cabeza . Cuello . Tórax . Abdomen . Pelvis . Extremidades . Neurológico .'},
      {title:'Signos vitales', text:'PA , FC , FR , SatO₂ , T . Glasgow . Pupilas .'},
      {title:'Examen físico por regiones', text:'[Describir hallazgos por regiones afectadas].'},
      {title:'Estudios', text:'Imágenes . Laboratorios .'},
      {title:'Análisis y conducta', text:'Lesiones identificadas . Plan . Criterios de remisión .'}
    ]
  },
  consulta_ped: {
    name: 'Consulta · Pediatría',
    cat: 'consulta',
    blocks: [
      {title:'Motivo de consulta', text:'Paciente pediátrico consulta por [motivo].'},
      {title:'Enfermedad actual', text:'Paciente de [edad] [meses/años], [sexo], quien consulta por cuadro de [tiempo] consistente en [síntoma]. Inicio , evolución , factores agravantes , atenuantes .'},
      {title:'Antecedentes perinatales', text:'EG  semanas. Parto [vaginal/cesárea]. Peso al nacer  g. APGAR . Complicaciones .'},
      {title:'Alimentación y desarrollo', text:'Alimentación . Vacunación . Desarrollo psicomotor . Escolaridad .'},
      {title:'Antecedentes', text:'Patológicos . Hospitalizaciones previas . Alergias . Medicamentos .'},
      {title:'Examen físico', text:'Signos vitales: PA , FC , FR , SatO₂ , T , peso , talla , PC . Estado general . Hallazgos .'},
      {title:'Análisis y plan', text:'Impresión diagnóstica . Paraclínicos . Tratamiento . Educación a cuidadores . Seguimiento .'}
    ]
  },
  consulta_prenatal: {
    name: 'Consulta · Control prenatal',
    cat: 'consulta',
    blocks: [
      {title:'Identificación', text:'Gestante de [edad] años, G  P  A  C  V , EG  semanas por FUR.'},
      {title:'Motivo de consulta', text:'Control prenatal de rutina / consulta por .'},
      {title:'Enfermedad actual', text:'Evolución del embarazo . Síntomas . Movimientos fetales .'},
      {title:'Signos de alarma obstétrica', text:'Niega / presenta [sangrado, pérdida de líquido, contracciones, cefalea, visión borrosa, edema, epigastralgia, fiebre, disminución de movimientos fetales].'},
      {title:'Antecedentes', text:'Patológicos . Quirúrgicos . Alergias . Medicamentos .'},
      {title:'Signos vitales y examen', text:'PA , FC , peso , altura uterina , FCF , presentación .'},
      {title:'Paraclínicos', text:'Grupo y Rh . VIH . Sífilis . Ecografía . Otros .'},
      {title:'Análisis y plan', text:'Impresión . Conducta . Próximo control . Signos de alarma explicados .'}
    ]
  },
  hosp_ingreso: {
    name: 'Hospitalización · Ingreso',
    cat: 'hospitalizacion',
    blocks: [
      {title:'Identificación', text:'Paciente [sexo] de [edad] años, ingresado por [diagnóstico principal].'},
      {title:'Motivo de ingreso', text:'[Motivo principal de hospitalización].'},
      {title:'Resumen de la enfermedad actual', text:'[Síntesis de la enfermedad actual y evolución hasta el ingreso].'},
      {title:'Antecedentes relevantes', text:'[Antecedentes patológicos, farmacológicos, alérgicos relevantes].'},
      {title:'Examen físico de ingreso', text:'Signos vitales: PA , FC , FR , SatO₂ , T . Hallazgos por sistemas .'},
      {title:'Paraclínicos de ingreso', text:'[Laboratorios, imágenes, ECG].'},
      {title:'Diagnósticos', text:'1. [Diagnóstico principal]. 2. [Comorbilidades].'},
      {title:'Plan inicial', text:'[Tratamiento, estudios pendientes, interconsultas, monitorización].'}
    ]
  },
  hosp_egreso: {
    name: 'Hospitalización · Egreso',
    cat: 'hospitalizacion',
    blocks: [
      {title:'Identificación', text:'Paciente [sexo] de [edad] años, egresa tras  días de hospitalización.'},
      {title:'Diagnóstico de egreso', text:'[Diagnóstico principal] + [comorbilidades].'},
      {title:'Resumen de la estancia', text:'[Resumen de la evolución intrahospitalaria].'},
      {title:'Tratamiento al egreso', text:'[Medicamentos con dosis y frecuencia].'},
      {title:'Indicaciones', text:'[Dieta, actividad, curaciones, seguimiento].'},
      {title:'Signos de alarma', text:'[Signos que deben motivar consulta urgente].'},
      {title:'Control', text:'[Fecha y lugar de control].'}
    ]
  },
  proc_sutura: {
    name: 'Procedimiento · Sutura de herida',
    cat: 'procedimiento',
    blocks: [
      {title:'Indicación', text:'Sutura de herida por [mecanismo].'},
      {title:'Anestesia', text:'Lidocaína  % con/sin epinefrina. Técnica .'},
      {title:'Lavado y desbridamiento', text:'Lavado con  mL de SSN. Desbridamiento .'},
      {title:'Cierre', text:'Sutura con [material] calibre , [número] puntos. Técnica .'},
      {title:'Curación y apósito', text:'[Tipo de apósito].'},
      {title:'Indicaciones', text:'Retiro de puntos en  días. Signos de alarma . Profilaxis antitetánica . Antibiótico .'}
    ]
  },
  remision: {
    name: 'Remisión a mayor nivel',
    cat: 'administrativo',
    blocks: [
      {title:'Identificación', text:'Paciente [sexo] de [edad] años, remitido desde [servicio/institución] a [servicio de destino].'},
      {title:'Motivo de remisión', text:'[Motivo clínico de la remisión].'},
      {title:'Resumen clínico', text:'[Resumen de la enfermedad actual, antecedentes y hallazgos].'},
      {title:'Paraclínicos', text:'[Laboratorios e imágenes realizados].'},
      {title:'Tratamiento administrado', text:'[Medicamentos y dosis].'},
      {title:'Motivo de la remisión', text:'[Por qué se remite y qué se espera del nivel superior].'},
      {title:'Signos de alarma', text:'[Signos que deben motivar atención urgente].'}
    ]
  },
  incapacidad: {
    name: 'Incapacidad laboral',
    cat: 'administrativo',
    blocks: [
      {title:'Identificación', text:'Paciente [sexo] de [edad] años, ocupación , afiliado a [EPS].'},
      {title:'Diagnóstico', text:'[Diagnóstico con CIE-10].'},
      {title:'Motivo de la incapacidad', text:'[Razón médica de la incapacidad].'},
      {title:'Duración', text:'[Número] días, desde [fecha] hasta [fecha].'},
      {title:'Recomendaciones', text:'[Reposo, tratamiento, seguimiento].'},
      {title:'Médico responsable', text:'[Nombre, registro médico, fecha].'}
    ]
  },
  anamnesis_alicia: {
    name: 'Anamnesis completa (ALICIA)',
    cat: 'consulta',
    blocks: [
      {title:'Aparición', text:'Forma de inicio: [súbita / progresiva / intermitente]. Contexto: .'},
      {title:'Localización', text:'Localización: . Irradiación: .'},
      {title:'Intensidad', text:'EVA . Comparación con episodios previos .'},
      {title:'Carácter / calidad', text:'[Opresivo / punzante / cólico / ardor / pulsátil / sordo / eléctrico].'},
      {title:'Irradiación', text:'[Sí / No]. Hacia .'},
      {title:'Atenuantes', text:'[Qué lo mejora].'},
      {title:'Agravantes', text:'[Qué lo empeora].'},
      {title:'Síntomas concomitantes', text:'[Fiebre / náuseas / vómito / disnea / diaforesis / mareo / otros].'},
      {title:'Tiempo de evolución', text:'[Duración total]. Curso: [continuo / intermitente / episódico].'},
      {title:'Episodios previos', text:'[Sí / No]. Frecuencia . Tratamiento previo .'},
      {title:'Factores de riesgo', text:'.'},
      {title:'Medicación habitual', text:'.'}
    ]
  },
  examen_neurologico: {
    name: 'Examen neurológico dirigido',
    cat: 'neuro',
    blocks: [
      {title:'Estado mental', text:'Alerta, orientado en [tiempo/espacio/persona], Glasgow . Lenguaje .'},
      {title:'Pares craneales', text:'I , II , III , IV , V , VI , VII , VIII , IX-X , XI , XII .'},
      {title:'Fuerza muscular (MRC)', text:'Miembros superiores: . Miembros inferiores: . Deriva pronadora: .'},
      {title:'Sensibilidad', text:'Tacto , dolor , temperatura , vibración , propiocepción .'},
      {title:'Reflejos osteotendinosos', text:'Bicipital , tricipital , rotuliano , aquíleo . Signo de Babinski .'},
      {title:'Coordinación', text:'Dedo-nariz , talón-rodilla , movimientos alternantes .'},
      {title:'Marcha y equilibrio', text:'Marcha , Romberg , tándem .'},
      {title:'Signos meníngeos', text:'Rigidez nucal , Kernig , Brudzinski .'}
    ]
  },
rcv_consulta: {
    name: 'Consulta externa · Riesgo cardiovascular (RCV)',
    cat: 'consulta',
    blocks: [
      {title:'Identificación', text:'CONSULTA EXTERNA CRÓNICOS.\nNOMBRE: . EDAD: . EPS: . CC: .'},
      {title:'Antecedentes', text:'ANTECEDENTES:\n- PATOLÓGICOS: {v}NIEGA{/v} / HTA / DM / dislipidemia / ERC / EPOC / otros.\n- ALÉRGICOS: {v}NIEGA{/v} / .\n- FARMACOLÓGICOS: {v}NIEGA{/v} / listar.\n- QUIRÚRGICOS: {v}NIEGA{/v} / .\n- TÓXICOS: {v}NIEGA{/v} / tabaquismo / alcohol / otros.\n- FAMILIARES: {v}NIEGA{/v} / HTA / DM / cardiopatía / dislipidemia / otros.\n- HOSPITALIZACIONES PREVIAS: {v}NIEGA{/v} / .\n- VACUNACIÓN: esquema completo COVID-19, influenza anual, neumococo, etc.\n- GINECOLÓGICOS: .'},
      {title:'Motivo de consulta', text:'PACIENTE QUIEN CONSULTA EL DÍA DE HOY PARA CONTROL DE RIESGO CARDIOVASCULAR.'},
      {title:'Enfermedad actual', text:'Paciente de años de edad, con antecedentes anotados y revisados, a quien se le ha realizado una verificación de sus factores de riesgo cardiovascular modificables y no modificables. Consulta hoy a control de riesgo cardiovascular.\nHÁBITOS Y ESTILOS DE VIDA:\n- Dieta: {r}alta en CHOS simples, ácidos grasos saturados y sal; baja en CHOS complejos{/r} / {n}moderada{/n} / {v}baja en CHOS simples, ácidos grasos saturados y sal; alta en CHOS complejos, ácidos grasos mono y poliinsaturados, aminoácidos esenciales y proteínas de alto valor biológico{/v}.\n- Actividad física: {r}NO realiza actividad física regular{/r} / {v}realiza actividad física regular (tipo, duración, frecuencia){/v}.\n- Clase funcional NYHA: .\n- Adherencia farmacológica: {r}inadecuada, se educa y refuerza{/r} / {v}adecuada (Morisky 4/4){/v}.\n- Intolerancia a medicación: {v}niega{/v}. Anormal: {r}síntomas de intolerancia: .\n- Tabaquismo: {r}consume tabaco{/r} / {n}exfumador{/n} / {v}no consume tabaco{/v}.\n- Condición general: {v}refiere sentirse en buenas condiciones generales, niega síntomas cardiovasculares, respiratorios, neurológicos, metabólicos u otros sistémicos{/v}. Anormal: {r}manifiesta síntomas crónicos: .\n- Red de apoyo psicosocial: {r}mala{/r} / {v}buena{/v}.'},
      {title:'Revisión por sistemas', text:'NIEGA SÍNTOMAS EN OTROS SISTEMAS, además de lo ya referido en la enfermedad actual.'},
      {title:'Paciente con síntomas', text:'.'},
      {title:'Examen físico', text:'ESTADO GENERAL: {v}buenas condiciones generales, {v}estable clínica y hemodinámicamente{/v}, {v}sin alteraciones{/v} CV, respiratorias, neurológicas o metabólicas agudas; {v}afebril{/v}, hidratado, con buen aspecto general{/v}.\nCABEZA: normocéfalo, {v}sin masas o depresiones{/v}, {v}con cabeza centrada, con facies normal{/v}.\nOJOS: conjuntivas húmedas, escleras {v}anictérica{/v}s, reflejos fotomotores presentes, sin defecto pupilar aferente. Oftalmoscopia bilateral adecuada / difícil valoración.\nORL: pirámide nasal y fosas nasales {v}sin alteraciones{/v}. Cavidad oral con mucosas rosadas y húmedas, {v}amígdalas normales{/v}. Oídos normales.\nCUELLO: centrado, {v}sin masas ni adenopatías{/v}, {r}con ingurgitación yugular{/r} / {v}sin ingurgitación yugular{/v}, {v}sin alteraciones{/v} tiroideas.\nTÓRAX: {v}simétrico y normoexpansible{/v}, {v}sin crepitaciones, sin enfisema subcutáneo{/v}, {v}sin signos de dificultad respiratoria{/v}. Campos pulmonares limpios, {v}normoventilados{/v}, con {v}murmullo vesicular presente{/v}, {v}sin sobreagregados{/v}. Ruidos cardíacos {v}rítmicos, de adecuado tono e intensidad, {v}sin soplos{/v} ni desdoblamientos{/v}. Anormal: {r}soplos, desdoblamientos u otros sonidos anormales{/r}.\nABDOMEN: {v}blando, depresible{/v}, {v}sin masas ni visceromegalias{/v}, {v}sonidos peristálticos presentes{/v}, {v}sin signos de irritación peritoneal{/v}. Puño percusión negativa.\nOSTEOMUSCULAR: {v}columna móvil y centrada{/v}. Extremidades simétricas y eutróficas, {v}sin alteraciones{/v} osteoarticulares, {v}sin alteraciones{/v} musculares, con {v}pulsos periféricos simétricos{/v}, de adecuada intensidad, con llenado capilar menor de 2 s. {r}con edema{/r} / {v}Sin edema{/v}.\nPIEL Y FANERAS: piel {v}eutérmica{/v} y {v}anictérica{/v}, {v}sin palidez, cianosis, eritema, exantema, hematomas, equimosis ni petequias{/v}.\nNEUROLÓGICO: {v}funciones corticales preservadas{/v}; {v}consciente, alerta, orientado{/v} en las 3 esferas; {v}pares craneales normales{/v}; {v}sistema motor y sensitivo preservados{/v}; {v}funciones cerebelosas conservadas{/v}; {v}postura y marcha sin cambios agudos{/v}. {v}Glasgow 15/15{/v}.'},
      {title:'Resultados de paraclínicos', text:'- GLUCOSA EN AYUNAS: \n- CREATININA: \n- COLESTEROL TOTAL: \n- HDL: \n- LDL: \n- VLDL: \n- TG: \n- HEMOGRAMA: HB , HTO , LEUCOS , PLQ\n- UROANÁLISIS: no patológico desde el punto de vista cardio-metabólico o infeccioso'},
      {title:'Análisis', text:'Paciente quien ingresa a control de riesgo cardiovascular, con hallazgos anotados. Al ingreso se encuentra en aparentes buenas condiciones generales, {v}estable clínica y hemodinámicamente{/v}, {v}sin alteraciones{/v} CV, respiratorias, neurológicas o metabólicas agudas; {v}sin signos clínicos de SIRS{/v}. Al examen físico, con hallazgos anotados. Se evidencian unas medidas antropométricas, con un IMC indicativo de , con circunferencia abdominal . Tras evaluar, se considera:\n- HTA: {r}fuera de metas, con necesidad de ajuste{/r} / {n}en metas{/n} / {v}sin diagnóstico{/v}.\n- Trastorno metabólico de los carbohidratos (CHOS) tipo (): {r}fuera de metas{/r} / {n}en metas{/n} / {v}sin diagnóstico{/v}. {r}con complicaciones crónicas{/r} / {v}Sin complicaciones crónicas{/v}.\n- Trastorno metabólico de los lípidos: {r}fuera de metas, con necesidad de ajuste{/r} / {n}en metas para su RCV{/n} / {v}sin diagnóstico{/v}.\n- Enfermedad renal crónica: {r}diagnosticada{/r} / {n}en estudio{/n} / {v}sin diagnóstico{/v}. CRS y TFG (estadio ) por CKD-EPI y Cockcroft-Gault. Se prioriza resultado por CKD-EPI. RAC (A ).\n- Enfermedad cardiovascular ateroesclerótica (ASCVD) e insuficiencia cardíaca: {r}miocardiopatía isquémica, IC (FEVI), ECV, enfermedad arterial periférica{/r} / {v}sin diagnóstico{/v}.\n- Otros trastornos endocrinos: {r}diagnosticado (hipotiroidismo). TSH en metas / fuera de metas{/r} / {v}sin diagnóstico{/v}.\n- EPOC: {r}presente, en manejo con{/r} / {v}ausente{/v}.\n- Otros: .\n\nBACTERIURIA ASINTOMÁTICA: {v}paciente niega todo tipo de síntomas urológicos, generales o inflamatorios. Examen físico normal. Ausencia de SIRS. No precisa de manejo{/v}.\n\nRIESGO CARDIOVASCULAR: calculado por Framingham. a los 10 años, calculado por PREVENT y SCORE 2 respectivamente.'},
      {title:'Plan', text:'Tras considerar el caso, se continúa igual manejo médico / se realizan ajustes en el manejo médico. Se brindan recomendaciones generales, dietarias y de actividad física, teniendo en cuenta la carga por edad. Se da orden médica farmacológica y se solicitan paraclínicos requeridos. Se cita a control con la periodicidad requerida. Se dan claros signos y síntomas de alarma para consultar a urgencias o adelantar el contacto médico. Se explica la conducta al paciente quien refiere entender y aceptar.\nPLAN:\n- Se realiza reformulación farmacológica.\n- Se solicitan paraclínicos de control de riesgo cardiovascular.\n- Se indica control individualizado.\n- Recomendaciones generales: énfasis en adherencia al tratamiento y asistencia a controles. No cigarrillo, no alcohol.\n- Recomendaciones dietarias: dieta rica en verduras, frutos secos, leguminosas, lácteos bajos en grasas; no carbohidratos simples (azúcares refinados) ni frutas ricas en azúcares; no bebidas gaseosas; no grasas saturadas; disminución de consumo de sodio, carbohidratos y almidones.\n- Recomendaciones de actividad física: ejercicio regular de 30 a 60 minutos al día, 4 veces a la semana (caminata, trotar, natación, bailar, montar bicicleta). Meta de 150 minutos de actividad moderada.\n- Signos de alarma: dolor torácico intenso irradiado al brazo izquierdo o mandíbula asociado a dificultad para respirar, sudoración, mareo o desmayo. Alteración del estado de conciencia, convulsiones, parálisis de extremidades, vómito o diarrea más de 5 episodios en 1 hora, sangre en orina o heces, dolor abdominal o de cabeza intenso, imposibilidad para orinar, entre otros.\n\nSIGNOS DE ALARMA PARA CONSULTAR POR URGENCIAS: .\n\nNO ENTREGA DE LA MEDICACIÓN POR PARTE DE SU EPS: .\n\nNO TENENCIA DE PARACLÍNICOS: .\n\nINDUCCIÓN DE METFORMINA POR PRIMERA VEZ: .\n\nNOTA EF CUANDO EL PACIENTE NO ACUDE A LA VALORACIÓN: .\n\nMETAS DE GLICEMIA Y ESQUEMA DE AUTO AJUSTE AMBULATORIO DE INSULINA: .\n\nTOMA DE GLUCOMETRÍAS: .\n\nPUFA: .\n\nNOTA: (icosapentanoato de etilo, bupropión para deshabituación tabáquica, etc. si aplica).\n\nPACIENTE ENTIENDE Y ACEPTA.'}
    ]
  }

};

let TPL_STATE = { key: 'urg_dolor', blocks: [], hiddenNormal: false };

function tplEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function tplLoadTemplate(key) {
  const t = TPL_TEMPLATES[key] || TPL_TEMPLATES.urg_dolor;
  TPL_STATE.key = key;
  TPL_STATE.hiddenNormal = false;
  TPL_STATE.blocks = t.blocks.map((b, i) => ({id: `${key}_${i}_${Date.now()}`, title:b.title, text:b.text, status:'pending', visible:true}));
  tplRender();
}
function tplRender() {
  const host = document.getElementById('tpl-blocks');
  if (!host) return;
  const shown = TPL_STATE.blocks.filter(b => b.visible !== false);
  host.innerHTML = shown.map(b => `
    <article class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 space-y-2" data-tpl-id="${tplEscape(b.id)}">
      <div class="flex items-center justify-between gap-2">
        <input aria-label="Título del bloque" value="${tplEscape(b.title)}" onchange="tplUpdate('${tplEscape(b.id)}','title',this.value)" class="min-w-0 flex-1 bg-transparent font-extrabold text-xs text-slate-800 dark:text-slate-100 border-b border-transparent focus:border-teal-500 outline-none">
        <button onclick="tplDeleteBlock('${tplEscape(b.id)}')" title="Eliminar bloque" class="text-slate-400 hover:text-rose-600"><i class="fa-solid fa-trash"></i></button>
      </div>
      <textarea oninput="tplUpdate('${tplEscape(b.id)}','text',this.value)" rows="4" class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-950/60 p-2.5 text-xs leading-relaxed text-slate-800 dark:text-slate-100">${tplEscape(b.text)}</textarea>
      <div class="flex flex-wrap gap-1.5">
        <button onclick="tplSetStatus('${tplEscape(b.id)}','omit')" class="px-2 py-1 rounded-lg text-[10px] font-bold ${b.status==='omit'?'bg-slate-600 text-white':'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}">— No aplica</button>
      </div>
    </article>
  `).join('');
  const p = document.getElementById('tpl-progress');
  if (p) p.textContent = `${shown.length} bloques`;
  tplRenderPreview();
}
function tplUpdate(id, field, value) {
  const b = TPL_STATE.blocks.find(x => x.id === id);
  if (!b) return;
  b[field] = value;
  tplRenderPreview();
}
function tplSetStatus(id, status) {
  const b = TPL_STATE.blocks.find(x => x.id === id);
  if (!b) return;
  b.status = status;
  tplRender();
}
function tplDeleteBlock(id) {
  TPL_STATE.blocks = TPL_STATE.blocks.filter(b => b.id !== id);
  tplRender();
}
function tplAddCustomBlock() {
  TPL_STATE.blocks.push({id:`custom_${Date.now()}`, title:'Nuevo bloque', text:'[Escribe aquí el texto clínico]', status:'pending', visible:true});
  tplRender();
}
function tplRemoveOmitted() {
  TPL_STATE.blocks = TPL_STATE.blocks.filter(b => b.status !== 'omit');
  tplRender();
}
function tplHideNormal() {
  TPL_STATE.hiddenNormal = true;
  tplRender();
}
function tplShowAll() {
  TPL_STATE.hiddenNormal = false;
  TPL_STATE.blocks.forEach(b => b.visible = true);
  tplRender();
}
function tplBuildNote(filter) {
  const context = document.getElementById('tpl-context')?.value.trim();
  const lines = [TPL_TEMPLATES[TPL_STATE.key]?.name || 'Nota clínica'];
  if (context) lines.push(context);
  TPL_STATE.blocks.forEach(b => {
    if (b.status === 'omit') return;
    if (filter === 'abnormal' && !['partial','abnormal'].includes(b.status)) return;
    const cleanText = b.text.replace(/\{[vnr]\}/g, '').replace(/\{\/[vnr]\}/g, '');
    lines.push(`${b.title.toUpperCase()}:\n${cleanText}`.trim());
  });
  return lines.join('\n\n');
}
function tplColorize(text) {
  // Convierte marcadores de color en spans coloreados:
  // {v}...{/v} = verde (normal/bueno), {n}...{/n} = naranja (intermedio), {r}...{/r} = rojo (patológico/malo)
  const escaped = tplEscape(text);
  return escaped
    .replace(/\{v\}([\s\S]*?)\{\/v\}/g, '<span class="text-emerald-600 dark:text-emerald-400 font-semibold">$1</span>')
    .replace(/\{n\}([\s\S]*?)\{\/n\}/g, '<span class="text-amber-600 dark:text-amber-400 font-semibold">$1</span>')
    .replace(/\{r\}([\s\S]*?)\{\/r\}/g, '<span class="text-rose-600 dark:text-rose-400 font-semibold">$1</span>');
}

function tplRenderPreview() {
  const preview = document.getElementById('tpl-preview');
  if (!preview) return;
  const visible = TPL_STATE.blocks.filter(b => b.status !== 'omit');
  preview.innerHTML = `<div class="font-extrabold text-teal-700 dark:text-teal-300 mb-3">${tplEscape(TPL_TEMPLATES[TPL_STATE.key]?.name || 'Nota clínica')}</div>` +
    visible.map(b => `<div class="mb-3"><div class="font-extrabold text-xs text-slate-700 dark:text-slate-200">${tplEscape(b.title)}</div><div class="text-xs whitespace-pre-wrap">${tplColorize(b.text)}</div></div>`).join('');
  const pending = TPL_STATE.blocks.filter(b => b.status === 'pending').length;
  const alerts = TPL_STATE.blocks.filter(b => b.status === 'abnormal' || b.status === 'partial').length;
  const a = document.getElementById('tpl-alerts');
  if (a) {
    a.textContent = pending ? `${pending} pendientes · ${alerts} hallazgos marcados` : `${alerts} hallazgos marcados · revisión final`;
    a.className = `text-[11px] font-bold ${pending ? 'text-amber-600' : 'text-teal-600'}`;
  }
}
async function tplCopyNote() {
  const text = tplBuildNote('all');
  try { await navigator.clipboard.writeText(text); alert('Nota copiada. Revísala antes de usarla.'); }
  catch(e) { alert('No se pudo copiar automáticamente. Selecciona el texto de la vista previa.'); }
}
async function tplCopyOnlyAbnormal() {
  const text = tplBuildNote('abnormal');
  if (!text.includes(':')) { alert('No hay bloques naranja o rojo seleccionados.'); return; }
  try { await navigator.clipboard.writeText(text); alert('Hallazgos seleccionados copiados.'); }
  catch(e) { alert('No se pudo copiar automáticamente.'); }
}
function tplReset() {
  const context = document.getElementById('tpl-context');
  if (context) context.value = '';
  tplLoadTemplate(TPL_STATE.key);
}

        // VADEMECUM & VADEMECUM RENDER

/* =====================================================================
   ADROOSIS · VADEMÉCUM · TANDA 2
   ===================================================================== */


// Une la tanda 2 con tus fármacos actuales
vademecumData.push(...vademecumTanda2);

/* ===== VERIFICACIÓN DEL VADEMÉCUM (lote 1 · 31 oct 2026) ===== */
const VAD_VERSION = 'v1.5 · 25 Nov 2026';

const VAD_VERIF = {
    'Atropina': {
        fuente: { t: 'MSD Manual · medicamentos de reanimación (PALS/ACLS)', url: 'https://www.msdmanuals.com/professional/multimedia/table/medications-commonly-used-for-resuscitation' },
        alcance: 'Dosis de bradicardia (adulto y pediátrica). El esquema de organofosforados no está verificado.'
    },
    'Adrenalina (Epinefrina)': {
        fuente: { t: 'MSD Manual · medicamentos de reanimación (PALS/ACLS)', url: 'https://www.msdmanuals.com/professional/multimedia/table/medications-commonly-used-for-resuscitation' },
        alcance: 'Dosis en paro cardíaco (adulto y pediátrica). Las dosis de anafilaxia no están verificadas en este lote.'
    },
    'Adenosina': {
        fuente: { t: 'MSD Manual · medicamentos de reanimación (PALS/ACLS)', url: 'https://www.msdmanuals.com/professional/multimedia/table/medications-commonly-used-for-resuscitation' },
        alcance: 'Dosis en taquicardia supraventricular (adulto y pediátrica).'
    },
    'Dextrosa (hipoglucemia)': {
        fuente: { t: 'MSD Manual · medicamentos de reanimación (PALS/ACLS)', url: 'https://www.msdmanuals.com/professional/multimedia/table/medications-commonly-used-for-resuscitation' },
        alcance: 'Dosis de hipoglucemia grave (adulto y pediátrica).'
    },
    'Bicarbonato de sodio': {
        fuente: { t: 'MSD Manual · medicamentos de reanimación (PALS 2020)', url: 'https://www.msdmanuals.com/professional/multimedia/table/medications-commonly-used-for-resuscitation' },
        alcance: 'Dosis (1 mEq/kg) e indicaciones pediátricas de PALS 2020. El criterio de pH en CAD no está verificado.',
        warning: 'No usar de rutina en paro cardiorrespiratorio. En pediatría, PALS 2020 solo lo contempla en hiperpotasemia, hipocalcemia, hipermagnesemia e intoxicación por tricíclicos o bloqueadores de canales de calcio. En cetoacidosis diabética solo con pH muy bajo. Riesgo de hipernatremia, hipopotasemia, alcalosis y sobrecarga de volumen. Incompatible con calcio y vasopresores en la misma línea.'
    },
    'Midazolam': {
        fuente: { t: 'Guía AES 2016 · estado epiléptico convulsivo', url: 'https://renaissance.stonybrookmedicine.edu/sites/default/files/CSE%20Treatment%20chart-final_rerelease.pdf' },
        alcance: 'Dosis en estado epiléptico (IM, IV, intranasal y bucal). Las dosis de sedación no están verificadas.'
    },
    'Diazepam': {
        fuente: { t: 'Guía AES 2016 · estado epiléptico convulsivo', url: 'https://renaissance.stonybrookmedicine.edu/sites/default/files/CSE%20Treatment%20chart-final_rerelease.pdf' },
        alcance: 'Dosis en estado epiléptico (IV y rectal). Las dosis de ansiolisis y espasmo muscular no están verificadas.',
        adult: 'Status epiléptico: 0.15 - 0.2 mg/kg IV lento (máx 10 mg/dosis, ≤ 5 mg/min), repetible una vez a los 5 min. Ansiedad o espasmo muscular: 2 - 10 mg VO c/8-12h',
        ped: 'Status: 0.15 - 0.2 mg/kg IV lento (máx 10 mg/dosis), repetible una vez. Rectal: 0.2 - 0.5 mg/kg (máx 20 mg), dosis única. Evitar IM por absorción errática'
    },
    'Levetiracetam': {
        fuente: { t: 'Guía AES 2016 · estado epiléptico convulsivo', url: 'https://renaissance.stonybrookmedicine.edu/sites/default/files/CSE%20Treatment%20chart-final_rerelease.pdf' },
        alcance: 'Dosis de carga en estado epiléptico. El mantenimiento y el ajuste renal no están verificados.'
    },
    'Ácido valproico (Valproato)': {
        fuente: { t: 'Guía AES 2016 · estado epiléptico convulsivo', url: 'https://renaissance.stonybrookmedicine.edu/sites/default/files/CSE%20Treatment%20chart-final_rerelease.pdf' },
        alcance: 'Dosis de carga en estado epiléptico. Las dosis de epilepsia crónica no están verificadas.',
        adult: 'Status: 40 mg/kg IV (máx 3000 mg), dosis única en unos 10 min. Epilepsia: 10 - 15 mg/kg/día VO c/8-12h, titulando hasta 20 - 30 mg/kg/día (máx 60 mg/kg/día)',
        ped: 'Status: 40 mg/kg IV (máx 3000 mg). Epilepsia: 10 - 15 mg/kg/día VO dividido c/8-12h, titulando hasta 30 - 60 mg/kg/día. Evitar en < 2 años (riesgo de hepatotoxicidad)'
    },
    'Ketorolaco': {
        fuente: { t: 'Ficha técnica de ketorolaco inyectable (Pfizer)', url: 'https://www.pfizermedical.com/ketorolac-inj/dosage-admin' },
        alcance: 'Dosis IV/IM/VO del adulto, máximos diarios y duración. La dosis pediátrica es fuera de indicación.',
        adult: 'Dosis única: IV 30 mg (15 mg si ≥ 65 años, < 50 kg o falla renal); IM 60 mg (30 mg en esos casos). Dosis múltiples IV/IM: 30 mg c/6h (máx 120 mg/día); si ≥ 65 años, < 50 kg o falla renal: 15 mg c/6h (máx 60 mg/día). VO solo como continuación: 10 mg c/4-6h (máx 40 mg/día). Duración total máxima (IV/IM + VO): 5 días. Bolo IV en ≥ 15 segundos',
        ped: 'No indicado en < 17 años según la ficha. Uso pediátrico fuera de indicación: 0.5 mg/kg IV (máx 15 mg), solo por especialista y por 48-72h',
        renal: 'Contraindicado en insuficiencia renal avanzada o riesgo de falla renal por hipovolemia (corrígela antes). En insuficiencia renal leve a moderada: 15 mg c/6h (máx 60 mg/día)',
        warning: 'Contraindicado en sangrado activo, úlcera péptica, dengue, asma sensible a AINE, trabajo de parto y antes de cirugía mayor. Duración total máxima 5 días. No mezclar en la misma jeringa con morfina, meperidina, prometazina ni hidroxizina (precipita).'
    },
    'Sulfato de magnesio': {
        fuente: { t: 'ACOG (checklist de eclampsia) y OMS (WHOPAR)', url: 'https://www.scdhhs.gov/sites/default/files/ACOG-District-II-Checklist-Eclampsia.pdf' },
        alcance: 'Esquemas de eclampsia / preeclampsia severa, monitoreo y toxicidad. Las dosis de asma y torsades son orientativas.',
        adult: 'Preeclampsia severa / eclampsia: carga 4 - 6 g IV en 20 - 30 min, mantenimiento 1 - 2 g/h (hasta 24 h posparto). Convulsión recurrente: 2 g IV adicionales en 5 min. Sin acceso IV: 10 g IM (5 g en cada glúteo) y luego 5 g IM c/4h. Asma grave: 2 g IV en 20 min. Torsades de pointes: 1 - 2 g IV en 5 - 20 min',
        renal: 'Se elimina por vía renal. Con oliguria o creatinina ≥ 1 mg/dL: reducir el mantenimiento (1 g/h) y vigilar niveles de magnesio c/4-6h',
        warning: 'ALTO RIESGO. Continuar solo si FR ≥ 16/min, reflejos rotulianos presentes y diuresis ≥ 30 mL/h. Rango terapéutico 5 - 9 mg/dL; pérdida de reflejos > 9; depresión respiratoria > 12. Toxicidad: suspender, dar oxígeno y gluconato de calcio 1 g (10 mL al 10%) IV lento. Evitar en edema pulmonar, falla renal y miastenia gravis.'
    },
    'Enoxaparina': {
        fuente: { t: 'Ficha de Lovenox y guía de dosificación del NHS (Gloucestershire)', url: 'https://hemonc.org/docs/packageinsert/enoxaparin.pdf' },
        alcance: 'Dosis de profilaxis, tratamiento, SCA e IAMCEST del adulto y ajuste renal. La dosis pediátrica no está verificada.',
        adult: 'Profilaxis: 40 mg SC c/24h (cirugía abdominal y pacientes médicos con movilidad limitada); rodilla: 30 mg c/12h; cadera: 30 mg c/12h o 40 mg c/24h. Tratamiento TVP/TEP: 1 mg/kg SC c/12h o 1.5 mg/kg c/24h (hospitalizado); TVP ambulatoria sin TEP: 1 mg/kg c/12h. Angina inestable / IAM sin elevación ST: 1 mg/kg c/12h con aspirina. IAMCEST: < 75 años 30 mg IV en bolo + 1 mg/kg SC y luego 1 mg/kg c/12h; ≥ 75 años 0.75 mg/kg c/12h sin bolo',
        renal: 'Ajustar por aclaramiento de creatinina (Cockcroft-Gault), NO por eTFG. Con ClCr < 30 mL/min: profilaxis 30 mg c/24h; tratamiento 1 mg/kg c/24h. Considera anti-Xa en peso extremo (< 45 kg o > 150 kg).',
        warning: 'ALTO RIESGO: sangrado, trombocitopenia inducida por heparina y hematoma espinal (precaución con anestesia neuroaxial). Verifica la dosis por peso y calcula el ClCr antes de dosificar. En la jeringa prellenada de profilaxis no se expulsa la burbuja de aire.'
    },
    'Insulina cristalina (regular)': {
        fuente: { t: 'Consenso ADA 2024 (revisión CCJM) e ISPAD 2022', url: 'https://www.ccjm.org/content/92/3/152' },
        alcance: 'Dosis de cetoacidosis y estado hiperosmolar (adulto y pediátrica) y umbrales de potasio. La dosis de hiperpotasemia no está verificada.',
        adult: 'Cetoacidosis diabética: infusión IV fija de 0.1 UI/kg/h, solo si K⁺ ≥ 3.5 mEq/L (si es menor, repón potasio primero y retrasa la insulina). Estado hiperosmolar: 0.05 UI/kg/h (si hay cetosis o acidosis significativas, tratar como CAD). Hiperpotasemia: 10 UI IV con 25 g de dextrosa. SC: según esquema de corrección o prandial',
        ped: 'CAD: infusión IV 0.05 - 0.1 UI/kg/h (0.05 si pH > 7.15 o < 5 años), SIN bolo, iniciada al menos 1 hora después de comenzar la hidratación. Si K⁺ < 3.0 mmol/L: retrasa la insulina y repón potasio primero',
        warning: 'ALTO RIESGO: hipoglucemia e hipopotasemia (mide el potasio antes de iniciar y durante la infusión). Usa bomba de infusión y verifica la concentración preparada. En niños no se da bolo IV inicial.'
    },
    // ---- Con ajuste de texto pero SIN verificar (fuente insuficiente) ----
    'Gluconato de calcio': {
        verificado: false,
        nota: 'Discrepancia pendiente: la tabla de reanimación del MSD Manual da 30 mg/kg de gluconato (20 mg/kg de cloruro) en paro; esta ficha usa 50 - 100 mg/kg para hipocalcemia / hiperpotasemia. Confirma según la indicación antes de usar.'
    },
    'Amiodarona': {
        verificado: false,
        nota: 'Texto pediátrico ajustado con fuente secundaria (bolo en paro; 20 - 60 min con pulso). Falta confirmar con la ficha técnica.',
        ped: '5 mg/kg IV (máx 300 mg/dosis): en paro, en bolo; con pulso, en 20 - 60 min con monitoreo. Puede repetirse hasta 15 mg/kg'
    }
};

vademecumData.forEach(v => {
    const o = VAD_VERIF[v.name];
    if (!o) return;
    Object.assign(v, o);
    v.verificado = o.verificado !== false;
    v.revisado = '31 oct 2026';
});

/* ===== VERIFICACIÓN DEL VADEMÉCUM (lote 2 · 1 nov 2026) ===== */
const VAD_VERIF2 = {
    'Noradrenalina': {
        fuente: { t: 'Protocolo de titulación de vasoactivos (UW Health) y revisión de rangos', url: 'https://www.uwhealth.org/cckm/cpg/medications/related/name-121110-en.html' },
        alcance: 'Dosis del adulto. La dosis pediátrica no está verificada.',
        adult: 'Choque séptico / distributivo: iniciar 0.02 - 0.1 mcg/kg/min IV en infusión continua, titulando cada pocos minutos a PAM ≥ 65 mmHg. Rango habitual 0.05 - 0.5 mcg/kg/min (descrito hasta 3 mcg/kg/min en choque refractario). Con requerimientos crecientes, agrega vasopresina a dosis fija de 0.03 U/min (no se titula)'
    },
    'Dobutamina': {
        fuente: { t: 'Protocolo de titulación de vasoactivos (UW Health)', url: 'https://www.uwhealth.org/cckm/cpg/medications/related/name-121110-en.html' },
        alcance: 'Dosis del adulto. La dosis pediátrica no está verificada.',
        adult: 'Iniciar 2 - 2.5 mcg/kg/min IV en infusión continua y titular cada 5 - 15 min según respuesta, hasta 20 mcg/kg/min'
    },
    'Nitroglicerina': {
        fuente: { t: 'Protocolo de titulación de vasoactivos (UW Health)', url: 'https://www.uwhealth.org/cckm/cpg/medications/related/name-121110-en.html' },
        alcance: 'Dosis IV del adulto. La dosis pediátrica no está verificada.',
        adult: 'Iniciar 5 - 10 mcg/min IV en infusión continua; aumentar 5 - 20 mcg/min c/5-15 min según respuesta (rango habitual 5 - 300 mcg/min)'
    },
    'Heparina no fraccionada': {
        fuente: { t: 'Tabla de dosificación de heparina (PMC) y protocolos hospitalarios', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3654192/table/Tab2' },
        alcance: 'Dosis del adulto (VTE, SCA y profilaxis). La dosis pediátrica no se verificó porque las fuentes difieren.',
        adult: 'TVP/TEP: bolo 80 UI/kg IV (máx 5 000 - 10 000 UI según el protocolo de tu hospital) y luego 18 UI/kg/h; ajusta por nomograma de TTPa o anti-Xa. SCA / IAMCEST: bolo 60 UI/kg (máx 4 000 UI) y luego 12 UI/kg/h (máx 1 000 UI/h). Profilaxis: 5 000 UI SC c/8-12h',
        renal: 'Sin ajuste de dosis; opción preferida en falla renal grave',
        warning: 'ALTO RIESGO: sangrado y trombocitopenia inducida por heparina (suspender si las plaquetas bajan de 100 000). Verifica la concentración y la velocidad de la bomba. Antídoto: sulfato de protamina.'
    }
};
Object.assign(VAD_VERIF, VAD_VERIF2);

vademecumData.push(...vademecumTanda3);
vademecumData.forEach(v => {
    const o = VAD_VERIF2[v.name];
    if (!o) return;
    Object.assign(v, o);
    v.verificado = true;
    v.revisado = '2 nov 2026';
});

/* ===== VERIFICACIÓN DEL VADEMÉCUM (lote 3 · 1 nov 2026) ===== */
const VAD_VERIF3 = {
    'Atropina': {
        fuente: { t: 'MSD Manual (reanimación) · LITFL y BMJ Best Practice (organofosforados)', url: 'https://litfl.com/ccc/organophosphate-poisoning' },
        alcance: 'Bradicardia (adulto y pediátrica) y esquema de organofosforados (inicio, duplicación, vía IM y mantenimiento).',
        adult: 'Bradicardia sintomática: 1 mg IV en bolo, repetible c/3-5 min (máx 3 mg). Organofosforados: 1 - 3 mg IV duplicando la dosis c/5 min hasta atropinizar (pecho limpio, FC > 80, PAS > 80, secreciones secas); sin vía IV: 2 - 4 mg IM (leve a moderada) o 6 mg IM (grave). Luego infusión del 10-20% de la dosis total de carga por hora, ajustada a la respuesta',
        ped: 'Bradicardia: 0.02 mg/kg IV/IO (mín 0.1 mg; máx 0.5 mg por dosis en niños y 1 mg en adolescentes), repetible una vez. Organofosforados: 0.02 mg/kg (mín 0.1 mg) IV duplicando c/5 min hasta atropinizar'
    },
    'Vancomicina': {
        fuente: { t: 'Consenso ASHP/IDSA/PIDS/SIDP 2020 · monitoreo de vancomicina', url: 'https://www.binasss.sa.cr/farmaago/7.pdf' },
        alcance: 'Carga, mantenimiento y objetivo de monitoreo (adulto y pediátrico). La dosis en neonatos y la posología en meningitis no están verificadas.',
        adult: 'Carga 20 - 35 mg/kg IV (máx 3 000 mg; en obesidad 20 - 25 mg/kg) en infección grave (sepsis, bacteriemia, endocarditis, meningitis, neumonía). Mantenimiento: 15 - 20 mg/kg (peso real) IV c/8-12h, ajustado por AUC24/MIC 400-600 (el valle de 15-20 mg/L es un objetivo secundario). Infundir a ≤ 10 mg/min',
        ped: '3 meses a < 12 años: 60 - 80 mg/kg/día IV dividido c/6h. ≥ 12 años: 60 - 70 mg/kg/día dividido c/6-8h (la mayoría no supera 3 000 mg/día). Menores de 3 meses: esquema por edad posmenstrual y creatinina, sin dosis de carga',
        renal: 'Ajusta según función renal y monitoreo de AUC o niveles. La dosis de carga no se ajusta. En hemodiálisis, valle prediálisis 15-20 mg/L'
    },
    'Piperacilina / Tazobactam': {
        fuente: { t: 'Guía de infusión extendida (NHS Borders) y tabla de ajuste renal (BMJ Open)', url: 'https://rightdecisions.scot.nhs.uk/media/1731/intravenous-piperacillin-tazobactam-in-adults-in-critical-care-via-extended-infusion-2022-25.pdf' },
        alcance: 'Dosis del adulto, infusión extendida y ajuste renal (los protocolos difieren). La dosis pediátrica no está verificada.',
        adult: '4.5 g IV c/6h (infusión de 30 min). Alternativa en infección grave: carga de 4.5 g en 30 min y luego 4.5 g c/6-8h en infusión extendida de 3 horas. Infecciones menos graves: 3.375 g c/6h',
        renal: 'Los protocolos difieren: ClCr 20-40 mL/min: máx 4.5 g c/8h; < 20: 4.5 g c/12h (protocolo británico); otras tablas usan 2.25 - 3.375 g c/6h. Sigue el protocolo de tu hospital.'
    },
    'Meropenem': {
        fuente: { t: 'Tabla de ajuste renal (BMJ Open) y guías NHS de dosis altas', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7871690/table/T3' },
        alcance: 'Dosis del adulto, dosis alta y ajuste renal. La dosis pediátrica no está verificada.',
        adult: '1 g IV c/8h (infusión de 30 min o extendida de 3h). Dosis alta (meningitis / SNC, gérmenes con CIM elevada): 2 g c/8h',
        renal: 'ClCr > 50: 1 g c/8h; 26-50: 1 g c/12h; 10-25: 0.5 g c/12h; < 10: 0.5 g c/24h'
    },
    'Ceftriaxona': {
        fuente: { t: 'Guía de dosificación antimicrobiana (Wake Forest) y guías NHS de dosis altas', url: 'https://school.wakehealth.edu/-/media/WakeForest/School/Files/Centers-and-Institutes/CAUSE/Antimicrobial-Dosing.pdf?la=en' },
        alcance: 'Dosis del adulto y ajuste renal. La dosis pediátrica, la neonatal y la de gonorrea no están verificadas.',
        adult: '1 - 2 g IV/IM c/24h. Infección del SNC (meningitis) y endocarditis enterocócica: 2 g c/12h. Dosis alta (S. aureus y otras infecciones graves): 2 g c/12h o 4 g c/24h',
        renal: 'Sin ajuste por función renal'
    }
};
Object.assign(VAD_VERIF, VAD_VERIF3);

vademecumData.push(...vademecumTanda4);
vademecumData.forEach(v => {
    const o = VAD_VERIF3[v.name];
    if (!o) return;
    Object.assign(v, o);
    v.verificado = true;
    v.revisado = '1 nov 2026';
});

/* ===== VERIFICACIÓN DEL VADEMÉCUM (lote 4 · 1 nov 2026) ===== */
const VAD_VERIF4 = {
    'Oxitocina': {
        fuente: { t: 'Recomendaciones OMS sobre uterotónicos, ficha OMS (WHOPAR) y protocolo CMT de hemorragia posparto', url: 'https://app.magicapp.org/summary/guideline_10007.html' },
        alcance: 'Dosis de prevención y tratamiento de la hemorragia posparto (bolo e infusión).',
        nota: '',
        adult: 'Prevención del alumbramiento: 10 UI IM (o IV lenta). Hemorragia posparto: 10 UI IM o IV lenta; infusión de 20 - 40 UI en 1 L de cristaloide (máx 40 UI por litro), pasando el primer litro rápido y luego a ritmo de mantenimiento. No pases de 3 L de líquido con oxitocina'
    },
    'Misoprostol': {
        fuente: { t: 'Protocolo CMT de hemorragia posparto y resumen perinatal (fuentes secundarias)', url: 'https://glowm.cms.ama.uk.com/pdf/CMT-Post-Partum-Haemorrhage-V2.pdf' },
        alcance: 'Dosis en hemorragia posparto cuando no hay oxitocina o no responde. Fuentes secundarias.',
        nota: '',
        adult: 'Hemorragia posparto cuando no hay oxitocina o no responde: 800 mcg sublinguales, dosis única (también existe la vía rectal)'
    },
    'Hidrocortisona': {
        fuente: { t: 'Guía de la Endocrine Society (insuficiencia suprarrenal) y monografía de dosificación (Drugs.com)', url: 'https://eguideline.guidelinecentral.com/i/1140169/9' },
        alcance: 'Crisis suprarrenal (adulto y pediátrica) y choque séptico del adulto. La dosis de anafilaxia y el choque séptico pediátrico no están verificados.',
        adult: 'Crisis suprarrenal: 1 L de solución salina en la primera hora, hidrocortisona 100 mg IV en bolo y luego 200 mg en infusión continua en 24 h (o 50 mg IV c/6h); al día siguiente 100 mg. Choque séptico que requiere vasopresor: 200 mg/día (infusión continua o 50 mg c/6h). Anafilaxia (adyuvante): 200 mg IV (no verificado)',
        ped: 'Crisis suprarrenal: 50 - 100 mg/m² IV en bolo (alternativa: 2 - 3 mg/kg, máx 100 mg), luego 50 - 100 mg/m²/día dividido c/6h; bolo de solución salina 20 mL/kg y glucosa si hay hipoglucemia. Choque séptico pediátrico: no verificado',
        warning: 'En insuficiencia suprarrenal no retrases la dosis por pruebas diagnósticas. Hiperglucemia y retención de sodio. En anafilaxia nunca reemplaza a la adrenalina.'
    },
    'Salbutamol (Albuterol)': {
        fuente: { t: 'AFP 2024 · asma aguda, TREKK y guías MSF', url: 'https://www.aafp.org/afp/2024/0100/acute-asthma-exacerbations' },
        alcance: 'Dosis en crisis asmática (adulto y pediátrica). El uso en hiperpotasemia no está verificado.',
        adult: 'Crisis asmática: 4 - 10 inhalaciones (100 mcg) con espaciador c/20 min durante la primera hora, o 5 mg nebulizado c/20 min x 3 dosis; luego según la respuesta. Rescate: 1 - 2 inhalaciones PRN',
        ped: 'Crisis: < 20 kg: 5 inhalaciones con espaciador o 2.5 mg nebulizado; ≥ 20 kg: 10 inhalaciones o 5 mg nebulizado; cada 20 min x 3 dosis, luego c/1-4h según la respuesta'
    },
    'Bromuro de ipratropio': {
        fuente: { t: 'AFP 2024 · asma aguda, TREKK y guías MSF', url: 'https://www.aafp.org/afp/2024/0100/acute-asthma-exacerbations' },
        alcance: 'Dosis en crisis asmática moderada a grave. En niños las guías difieren.',
        adult: 'Crisis moderada a grave: 0.5 mg nebulizado c/20 min x 3 dosis (o 8 inhalaciones de 20 mcg), junto con salbutamol; luego según la respuesta',
        ped: '250 mcg nebulizado (o 4 inhalaciones de 20 mcg) c/20 min x 3 dosis, junto con salbutamol (TREKK). Otras guías usan 500 mcg desde los 5 años'
    },
    'Prednisolona / Prednisona': {
        fuente: { t: 'AFP 2024 · asma aguda, TREKK y guías MSF', url: 'https://www.aafp.org/afp/2024/0100/acute-asthma-exacerbations' },
        alcance: 'Dosis en exacerbación asmática. Las dosis de EPOC y de otras enfermedades inflamatorias no están verificadas.',
        adult: 'Exacerbación de asma: 40 - 50 mg VO c/24h x 5 días (sin descenso gradual). Prednisona y prednisolona son equivalentes en mg. Otras indicaciones: no verificadas en este lote',
        ped: 'Asma: 1 mg/kg VO c/24h (máx 60 mg) x 3 - 5 días; alternativa: dexametasona 0.6 mg/kg (máx 12 mg)'
    },
    'Sales de rehidratación oral (SRO)': {
        fuente: { t: 'Planes de rehidratación de la OMS (guías MSF e IAP)', url: 'https://medicalguidelines.msf.org/en/viewport/mme/english/appendix-14-plan-rehydration-who-32408338.html' },
        alcance: 'Planes A y B pediátricos. La dosis del adulto no está verificada.',
        ped: 'Plan A (sin deshidratación): menor de 2 años 50 - 100 mL; 2 - 10 años 100 - 200 mL tras cada deposición líquida; mayores: a voluntad. Plan B (algún grado de deshidratación): 75 mL/kg en 4 horas y luego reevaluar. Si vomita: espera 5-10 minutos y reinicia más despacio'
    },
    'Zinc (suplemento en diarrea)': {
        fuente: { t: 'Recomendación de la OMS sobre zinc en la diarrea aguda (guías MSF e IAP)', url: 'https://medicalguidelines.msf.org/en/viewport/mme/english/appendix-14-plan-rehydration-who-32408338.html' },
        alcance: 'Dosis pediátrica en diarrea aguda. El uso en adultos no está verificado.',
        ped: 'Diarrea aguda: < 6 meses 10 mg/día; ≥ 6 meses 20 mg/día VO x 10 - 14 días (OMS)'
    },
    'Ácido acetilsalicílico (ASA)': {
        fuente: { t: 'Tarjetas ALS 2025 (Cruz Roja Americana) y guías ACC/AHA de SCA', url: 'https://guidelines.redcross.org/wp-content/uploads/2025/12/ALS-Code-Cards-ADULT-ACUTE-CORONARY-SYNDROMES-FINAL-PRINT.pdf' },
        alcance: 'Dosis de carga en síndrome coronario agudo. El ACV isquémico y la prevención secundaria no están verificados.',
        adult: 'SCA / IAMCEST: 162 - 325 mg VO masticada (carga) y luego 75 - 100 mg c/24h. ACV isquémico agudo y prevención secundaria: 160 - 325 mg y 75 - 100 mg/día (no verificado en este lote)'
    }
};
Object.assign(VAD_VERIF, VAD_VERIF4);
vademecumData.forEach(v => {
    const o = VAD_VERIF4[v.name];
    if (!o) return;
    Object.assign(v, o);
    v.verificado = true;
    v.revisado = '1 nov 2026';
});

/* ===== VERIFICACIÓN DEL VADEMÉCUM (lote 5 · 1 nov 2026) ===== */
const VAD_VERIF5 = {
    'Naloxona': {
        fuente: { t: 'MSD Manual, Epocrates y guías pediátricas (AAP/AHA) de naloxona', url: 'https://www.msdmanuals.com/professional/special-subjects/illicit-drugs-and-intoxicants/opioid-toxicity-and-withdrawal' },
        alcance: 'Dosis en sobredosis y depresión respiratoria por opioides (adulto y pediátrica) e infusión de mantenimiento.',
        adult: 'Sobredosis de opioides: 0.4 - 2 mg IV/IM/SC, repetible c/2-3 min según la respuesta; si no hay respuesta tras 10 mg, reconsidera el diagnóstico. En pacientes dependientes de opioides, titula desde 0.04 - 0.1 mg para evitar la abstinencia aguda. Si recurre la depresión respiratoria: infusión a 2/3 de la dosis efectiva por hora',
        ped: '< 5 años o < 20 kg: 0.1 mg/kg IV/IM/SC/IO; ≥ 5 años o ≥ 20 kg: 2 mg. Repetible c/2-3 min según la respuesta'
    },
    'Morfina': {
        fuente: { t: 'Ficha técnica de morfina inyectable (Pfizer / Hospira, FDA)', url: 'https://www.pfizermedical.com/morphine/dosage-admin' },
        alcance: 'Dosis IV del adulto y pediátrica y advertencias de la ficha. Las vías oral, IM y SC y el uso en cuidados paliativos no están verificados.',
        adult: 'IV: la ficha indica 0.1 - 0.2 mg/kg c/4h según necesidad, inyectado lentamente (la inyección rápida puede causar rigidez de la pared torácica). En urgencias se suele iniciar con 0.05 - 0.1 mg/kg (2 - 5 mg; máx 10 mg por dosis), titulando c/5-15 min según el dolor y la respiración. Dolor del infarto (solo si la nitroglicerina no lo alivia): 2 - 15 mg IV y luego 1 - 4 mg c/5 min según necesidad',
        ped: 'IV: 0.05 - 0.1 mg/kg muy lento (máx 10 mg por dosis). La ficha FDA no establece seguridad en menores de 18 años: uso por especialista y con monitoreo continuo',
        renal: 'Inicia con dosis menores y titula con cuidado (la ficha lo indica en falla renal y hepática). El metabolito activo se acumula: considera fentanilo si hay falla renal grave',
        warning: 'ALTO RIESGO: depresión respiratoria, hipotensión y náuseas. Contraindicada en depresión respiratoria significativa, obstrucción gastrointestinal / íleo paralítico e hipersensibilidad. Evita errores entre mg y mL cuando hay concentraciones distintas. Ten naloxona disponible y monitoreo continuo (SatO₂, FR, sedación). Riesgo aditivo con benzodiacepinas y otros depresores del SNC.'
    },
    'Ketamina': {
        fuente: { t: 'WikEM · ketamina (basado en guías de ACEP). Fuente secundaria', url: 'https://www.wikem.org/wiki/Ketamine' },
        alcance: 'Dosis de analgesia, sedación procedimental (IV e IM) e inducción del adulto, y dosis pediátrica de sedación. Fuente secundaria.',
        adult: 'Analgesia (dosis subdisociativa): 0.1 - 0.3 mg/kg IV, idealmente diluida en 100 mL de SSN en 15 min. Sedación-analgesia para procedimientos: 1 - 2 mg/kg IV lento (en 1 min), con dosis adicionales de 0.5 - 1 mg/kg si hace falta; o 4 - 5 mg/kg IM (repetible 2 - 4 mg/kg a los 10 min). Inducción de secuencia rápida: 1 - 2 mg/kg IV',
        ped: 'Sedación para procedimientos: 1.5 - 2 mg/kg IV lento, o 4 - 5 mg/kg IM; intranasal 3 - 6 mg/kg'
    },
    'Fenitoína': {
        fuente: { t: 'Ficha técnica de fenitoína inyectable (FDA · DailyMed y Pfizer)', url: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=a52cf1bd-dc1f-47be-aba8-29066d9a50fb' },
        alcance: 'Carga en estado epiléptico, velocidad de infusión, mantenimiento y contraindicaciones. Hay una discrepancia documentada entre la ficha FDA y otras guías en la carga del adulto.',
        nota: 'Discrepancia documentada: la ficha FDA indica una carga de 10 - 15 mg/kg en adultos, mientras que otras guías y protocolos de estado epiléptico usan 15 - 20 mg/kg. Sigue el protocolo de tu servicio y no superes 50 mg/min.',
        adult: 'Carga IV (estado epiléptico): 15 - 20 mg/kg según guías de estado epiléptico (la ficha FDA indica 10 - 15 mg/kg), a un máximo de 50 mg/min; más lento (≤ 25 mg/min) en ancianos, cardiópatas o inestables. Mantenimiento: 100 mg IV/VO c/6-8h (5 - 7 mg/kg/día). Diluir solo en SSN 0.9% (concentración final ≥ 5 mg/mL)',
        ped: 'Carga IV 15 - 20 mg/kg a 1 - 3 mg/kg/min (o 50 mg/min, lo que sea más lento). Mantenimiento: 4 - 8 mg/kg/día dividido c/12h',
        warning: 'ALTO RIESGO: hipotensión y arritmias con la infusión rápida (monitoreo continuo de ECG y PA); extravasación (síndrome del guante púrpura). Contraindicada en bradicardia sinusal, bloqueo sinoauricular, bloqueo AV de 2º-3er grado y síndrome de Adams-Stokes. No dar IM en estado epiléptico. Diluir solo en SSN 0.9% (precipita con dextrosa). Margen terapéutico estrecho.'
    },
    'Haloperidol': {
        fuente: { t: 'Ficha de producto del haloperidol inyectable (EMC · Reino Unido)', url: 'https://www.medicines.org.uk/emc/product/101458/smpc' },
        alcance: 'Dosis de agitación y delirium, máximos diarios, precauciones cardíacas y contraindicaciones. La vía IV y la dosis pediátrica no están respaldadas por la ficha.',
        adult: 'Agitación psicomotriz: 5 mg IM; ajusta en incrementos a intervalos de 2 - 4 h (algunas fichas permiten repetir cada hora) hasta un máximo de 10 mg/día con la inyección. Ancianos: la mitad de la dosis mínima del adulto, máx 5 mg/día. Delirium: 1 - 10 mg IM según la gravedad',
        ped: 'La seguridad de la inyección en niños no está establecida: uso solo por especialista',
        warning: 'Prolonga el QT: obtén un ECG basal, corrige K⁺ y Mg²⁺ y suspende si el QTc supera 500 ms. Contraindicado en coma, depresión del SNC, Parkinson, demencia con cuerpos de Lewy, QTc prolongado conocido, IAM reciente, falla cardíaca descompensada y antecedente de arritmia ventricular o torsades. La vía IV no está aprobada: si se usa, con monitoreo continuo del ECG. No está indicado para los trastornos de conducta de la demencia. Riesgo de distonía aguda y síndrome neuroléptico maligno.'
    },
    'Amiodarona': {
        fuente: { t: 'Ficha de Nexterone (FDA), Epocrates y StatPearls', url: 'https://www.epocrates.com/online/drugs/6076/Nexterone' },
        alcance: 'Dosis de paro (ACLS/PALS), taquiarritmias del adulto y pediátricas con pulso, y dosis máxima diaria.',
        nota: '',
        adult: 'Paro (FV / TV sin pulso): 300 mg IV/IO en bolo rápido y, si persiste, 150 mg. Taquiarritmias con pulso: 150 mg IV en 10 min (diluida; no en bolo directo), luego 1 mg/min x 6 h y 0.5 mg/min; puede repetirse 150 mg en 10 min si hay recurrencia. Máximo 2.2 g/24 h',
        ped: 'Paro: 5 mg/kg IV/IO en bolo (máx 300 mg/dosis), repetible hasta 15 mg/kg. Con pulso: 5 mg/kg en 20 - 60 min con monitoreo y luego infusión de 5 mcg/kg/min hasta 15 mcg/kg/min (máx 20 mg/kg/día)',
        renal: 'Sin ajuste de dosis'
    }
};
Object.assign(VAD_VERIF, VAD_VERIF5);
vademecumData.forEach(v => {
    const o = VAD_VERIF5[v.name];
    if (!o) return;
    Object.assign(v, o);
    v.verificado = true;
    v.revisado = '1 nov 2026';
});

/* ===== VERIFICACIÓN DEL VADEMÉCUM (lote 6 · 1 nov 2026) ===== */
const FU_GAS = { t: 'IDSA 2012 · faringitis estreptocócica; AAP (otitis media) y revisión PEM Pearls', url: 'https://academic.oup.com/cid/article/55/10/e86/321183' };
const FU_ITS = { t: 'Guías CDC 2021 de tratamiento de ITS', url: 'https://www.CDC.gov/std/treatment-guidelines/wall-chart.pdf' };
const FU_ITU = { t: 'IDSA 2010 y EAU 2023 · infección urinaria no complicada', url: 'https://academic.oup.com/cid/article/52/5/e103/388285' };

const VAD_VERIF6 = {
    'Penicilina G benzatínica': {
        verificado: true, fuente: { t: 'Guías CDC 2021 de ITS e IDSA 2012 (faringitis)', url: 'https://www.CDC.gov/std/treatment-guidelines/wall-chart.pdf' },
        alcance: 'Dosis en sífilis y faringitis estreptocócica (adulto y pediátrica). La profilaxis de fiebre reumática no está verificada.',
        adult: 'Sífilis temprana (primaria, secundaria y latente temprana): 2.4 millones UI IM, dosis única. Sífilis latente tardía o de duración desconocida: 2.4 millones UI IM semanal x 3 (7.2 millones UI en total). Faringitis estreptocócica: 1.2 millones UI IM, dosis única',
        ped: 'Faringitis: 600.000 UI IM si pesa < 27 kg; 1.2 millones UI si pesa ≥ 27 kg (dosis única). Sífilis adquirida: 50.000 UI/kg (máx 2.4 millones UI) IM; en la latente tardía, una dosis semanal x 3'
    },
    'Ceftriaxona': {
        verificado: true, fuente: { t: 'Guía de dosificación antimicrobiana (Wake Forest), guías NHS y CDC 2021 de ITS', url: 'https://www.CDC.gov/std/treatment-guidelines/wall-chart.pdf' },
        alcance: 'Dosis del adulto, ajuste renal y gonorrea no complicada. La dosis pediátrica y la neonatal no están verificadas.',
        adult: '1 - 2 g IV/IM c/24h. Gonorrea no complicada: 500 mg IM en dosis única (1 g si pesa ≥ 150 kg). Infección del SNC (meningitis) y endocarditis enterocócica: 2 g c/12h. Dosis alta (S. aureus y otras infecciones graves): 2 g c/12h o 4 g c/24h'
    },
    'Amoxicilina': {
        parcial: true, fuente: FU_GAS,
        alcance: 'Faringitis estreptocócica (adulto y niño), otitis media aguda y neumonía pediátrica de dosis alta.',
        nota: 'Faltan las dosis del adulto en sinusitis, neumonía comunitaria y otras indicaciones.',
        adult: 'Faringitis estreptocócica: 1000 mg VO c/24h o 500 mg c/12h x 10 días (verificado). Otras indicaciones: 500 mg c/8h u 875 - 1000 mg c/12h; neumonía leve 1 g c/8h (no verificado en este lote)',
        ped: 'Faringitis estreptocócica: 50 mg/kg VO c/24h (máx 1000 mg) o 25 mg/kg c/12h (máx 500 mg/dosis) x 10 días. Otitis media aguda y neumonía comunitaria: dosis alta 80 - 90 mg/kg/día VO dividido c/12h (otitis: 10 días si < 2 años; 5 - 7 días si ≥ 2 años)'
    },
    'Amoxicilina / Ácido clavulánico': {
        parcial: true, fuente: FU_GAS,
        alcance: 'Dosis pediátrica de otitis media con falla terapéutica o conjuntivitis, absceso periamigdalino y alternativa en cistitis.',
        nota: 'Faltan las dosis del adulto en sinusitis, piel, mordeduras y neumonía, y el ajuste renal.',
        adult: 'Cistitis (alternativa, no primera línea): 500/125 mg VO c/12h x 5 días (verificado). Otras indicaciones: 875/125 mg c/12h o 500/125 mg c/8h; IV 1.2 g c/8h (no verificado en este lote)',
        ped: 'Otitis media con falla terapéutica o conjuntivitis: 80 - 90 mg/kg/día (componente amoxicilina) VO dividido c/12h, presentación 14:1. Absceso periamigdalino: 22.5 mg/kg/dosis c/12h (máx 875 mg). Dosis estándar 25 - 45 mg/kg/día c/12h, presentación 7:1 (no verificada)'
    },
    'Azitromicina': {
        parcial: true, fuente: { t: 'Guías CDC 2021 de ITS, IDSA 2012 (faringitis) y PEM Pearls', url: 'https://www.CDC.gov/std/treatment-guidelines/wall-chart.pdf' },
        alcance: 'Clamidia y M. genitalium (adulto) y dosis pediátrica (neumonía y faringitis).',
        nota: 'Faltan los esquemas del adulto en neumonía comunitaria y diarrea, y la vía IV.',
        adult: 'Clamidia (alternativa a la doxiciclina; preferida en el embarazo): 1 g VO, dosis única. M. genitalium: 1 g el día 1 y luego 500 mg c/24h x 3 días. Otros esquemas (500 mg c/24h x 3 días; 500 mg el día 1 y 250 mg x 4 días; neumonía; vía IV): no verificados en este lote',
        ped: 'Neumonía y otras indicaciones: 10 mg/kg el día 1 (máx 500 mg) y 5 mg/kg los días 2 - 5 (máx 250 mg). Faringitis estreptocócica con alergia a penicilina: 12 mg/kg c/24h x 5 días (máx 500 mg)'
    },
    'Cefalexina': {
        parcial: true, fuente: { t: 'IDSA 2012 (faringitis) e IDSA 2010 (infección urinaria en el embarazo)', url: 'https://academic.oup.com/cid/article/55/10/e86/321183' },
        alcance: 'Faringitis estreptocócica pediátrica con alergia no grave a penicilina y cistitis en el embarazo.',
        nota: 'Faltan las dosis en celulitis, impétigo y otras indicaciones.',
        adult: 'Cistitis en el embarazo: 500 mg VO c/6h (verificado). Otras indicaciones: 500 mg c/6h (o 1 g c/12h); celulitis no purulenta 500 mg c/6h x 5 días (no verificado en este lote)',
        ped: 'Faringitis (alergia no grave a penicilina): 20 mg/kg/dosis VO c/12h (máx 500 mg/dosis) x 10 días. Otras indicaciones: 25 - 50 mg/kg/día c/6-8h (no verificado)'
    },
    'Metronidazol': {
        parcial: true, fuente: FU_ITS,
        alcance: 'Vaginosis bacteriana, tricomoniasis y enfermedad inflamatoria pélvica.',
        nota: 'Faltan las dosis en infecciones por anaerobios IV, amebiasis, giardiasis, colitis por C. difficile y la dosis pediátrica.',
        adult: 'Vaginosis bacteriana: 500 mg VO c/12h x 7 días. Tricomoniasis: mujeres 500 mg VO c/12h x 7 días; hombres 2 g en dosis única. Enfermedad inflamatoria pélvica (con ceftriaxona y doxiciclina): 500 mg c/12h x 14 días. Infecciones por anaerobios: 500 mg VO/IV c/8h; amebiasis y giardiasis: 250 - 750 mg c/8h x 5 - 10 días (no verificado en este lote)'
    },
    'Nitrofurantoína': {
        parcial: true, fuente: FU_ITU,
        alcance: 'Cistitis no complicada del adulto y consideraciones de embarazo y función renal.',
        nota: 'Falta la dosis pediátrica. Hay discrepancia en el umbral renal: algunas fuentes evitan el fármaco con ClCr < 30 y un protocolo institucional lo evita con ClCr < 60.',
        adult: 'Cistitis no complicada: nitrofurantoína monohidrato/macrocristales 100 mg VO c/12h x 5 días, con las comidas (primera línea IDSA). No sirve para pielonefritis ni prostatitis',
        ped: 'No verificada: 5 - 7 mg/kg/día VO dividido c/6h en > 1 mes (uso por especialista)',
        renal: 'Evitar si ClCr < 30 mL/min (algunos protocolos lo evitan con ClCr < 60): sigue el de tu servicio'
    },
    'Trimetoprim / Sulfametoxazol (TMP/SMX)': {
        parcial: true, fuente: FU_ITU,
        alcance: 'Cistitis, pielonefritis, varones y dosis pediátrica de TMP (6 - 12 mg/kg/día).',
        nota: 'Faltan las dosis en infección de piel por SARM y neumonía por P. jirovecii.',
        adult: 'Cistitis no complicada: 160/800 mg VO c/12h x 3 días (si la resistencia local es < 20%). Pielonefritis con germen sensible: 160/800 mg c/12h x 14 días. Varones: 7 días. Piel / SARM comunitario y neumonía por P. jirovecii (15 - 20 mg/kg/día de TMP): no verificados en este lote',
        ped: '6 - 12 mg/kg/día (componente TMP) VO dividido c/12h. Contraindicado en < 2 meses'
    },
    'Ciprofloxacino': {
        parcial: true, fuente: FU_ITU,
        alcance: 'Cistitis no complicada (segunda línea) y pielonefritis ambulatoria del adulto.',
        nota: 'Faltan las dosis IV, de Pseudomonas, diarrea y pediátricas.',
        adult: 'Cistitis no complicada (segunda línea; las quinolonas se reservan para otros usos): 250 mg VO c/12h x 3 días. Pielonefritis ambulatoria: 500 mg VO c/12h x 7 días, con una dosis inicial opcional de 400 mg IV. IV 400 mg c/8-12h y Pseudomonas: no verificados en este lote'
    }
};

Object.assign(VAD_VERIF, VAD_VERIF6);
vademecumData.forEach(v => {
    const o = VAD_VERIF6[v.name];
    if (!o) return;
    Object.assign(v, o);
    v.verificado = o.verificado === true;
    v.parcial = !!o.parcial;
    v.revisado = '1 nov 2026';
});

/* ===== VERIFICACIÓN DEL VADEMÉCUM (lote 7 · 24 nov 2026) =====
   Fuente principal: ficha técnica de la FDA publicada en DailyMed.
   Se verificaron los 49 fármacos que quedaban pendientes.        */
const DM = id => 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=' + id;

const VAD_VERIF7 = {
    // ---------------- Analgésicos ----------------
    'Acetaminofén (Paracetamol)': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · acetaminofén inyectable (DailyMed)', url: DM('0f67c1bd-915b-4681-88dd-22f5154a80b3') },
        alcance: 'Dosis oral e IV del adulto y pediátrica según la ficha FDA.',
        adult: 'Dolor o fiebre: 500 - 1000 mg VO c/4-6h; máx 4 g/día (2 - 3 g/día en hepatopatía, desnutrición o alcoholismo crónico). IV (≥ 50 kg): 1000 mg c/6h o 650 mg c/4h, máx 4000 mg/día, con intervalo mínimo de 4 h',
        ped: 'VO: 10 - 15 mg/kg/dosis c/4-6h (máx 75 mg/kg/día, sin pasar de 4 g/día). IV (< 50 kg): 15 mg/kg c/6h o 12.5 mg/kg c/4h, máx 75 mg/kg/día',
        renal: 'Sin ajuste renal establecido; en hepatopatía reduce a 2 - 3 g/día',
        warning: 'Hepatotoxicidad por sobredosis (antídoto: N-acetilcisteína). Revisa que el paciente no tome otros productos que también lo contengan (antigripales, resfríos).'
    },
    'Ibuprofeno': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · ibuprofeno (DailyMed)', url: DM('00872852-680a-41b3-901b-b991b12a176d') },
        alcance: 'Dosis analgésica y antiinflamatoria del adulto y pediátrica.',
        adult: 'Dolor leve a moderado: 400 mg VO c/4-6h. Artritis: 1200 - 3200 mg/día repartidos c/6-8h. En venta libre el máximo es 1200 mg/día; con prescripción hasta 3200 mg/día',
        ped: '5 - 10 mg/kg/dosis VO c/6-8h; máx 40 mg/kg/día. No usar en < 6 meses',
        renal: 'Evitar si eTFG < 30 mL/min. Suspender ante deshidratación o lesión renal aguda',
        warning: 'Sangrado digestivo, lesión renal y eventos cardiovasculares. Evitar en dengue, úlcera activa, falla cardíaca descompensada y tercer trimestre del embarazo.'
    },
    'Diclofenaco': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · diclofenaco sódico oral (DailyMed)', url: DM('03c4f06f-6a49-4404-bf3b-0aafa33c81ef') },
        alcance: 'Dosis oral del adulto en artrosis, artritis reumatoide y espondilitis.',
        adult: '50 mg VO c/8h o 75 mg c/12h. Artrosis: 100 - 150 mg/día; artritis reumatoide: 150 - 200 mg/día; espondilitis: 100 - 125 mg/día. Máx 200 mg/día',
        ped: 'No recomendado en < 14 años; uso pediátrico solo por especialista',
        renal: 'Evitar si eTFG < 30 mL/min; no usar en insuficiencia renal avanzada',
        warning: 'Riesgo cardiovascular y gastrointestinal. Contraindicado en úlcera o sangrado activo, dengue, tercer trimestre del embarazo y perioperatorio de revascularización.'
    },
    'Dipirona (Metamizol)': {
        verificado: true, parcial: true, nota: '',
        fuente: { t: 'Ficha técnica AEMPS-CIMA · metamizol 575 mg cápsulas', url: 'https://cima.aemps.es/cima/dochtml/ft/68116/FT_68116.html' },
        alcance: 'Dosis oral del adulto verificada en la ficha española. La vía parenteral y la dosis pediátrica no están en esa ficha.',
        adult: 'Adultos y adolescentes ≥ 15 años (> 53 kg): 575 mg VO c/4-6h; máx 3450 mg (6 dosis)/día. Usar la dosis mínima eficaz y por corto tiempo',
        ped: 'No recomendada en < 15 años en la ficha española. En Colombia se usa 10 - 20 mg/kg/dosis c/6-8h (uso fuera de ficha)',
        renal: 'Ajustar en insuficiencia renal grave; evitar en falla renal avanzada',
        warning: 'Agranulocitosis (rara pero grave): suspende ante fiebre, odinofagia o lesiones orales. Hipotensión con infusión rápida. Evitar en tercer trimestre, lactancia y déficit de G6PD.'
    },
    'Tramadol': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · tramadol clorhidrato oral (DailyMed)', url: DM('007bf37f-0e46-426a-ac8c-be63d4b7414c') },
        alcance: 'Dosis oral del adulto y contraindicación pediátrica según la ficha FDA.',
        adult: 'Dolor moderado a grave: 50 - 100 mg VO c/4-6h; máx 400 mg/día (300 mg/día en > 75 años). IV/IM: 50 - 100 mg c/6-8h, máx 400 mg/día',
        ped: 'Contraindicado en < 12 años y después de amigdalectomía o adenoidectomía en < 18 años (depresión respiratoria en metabolizadores ultrarrápidos)',
        renal: 'ClCr < 30: 50 - 100 mg c/12h; máx 200 mg/día',
        warning: 'Opioide: depresión respiratoria, convulsiones y síndrome serotoninérgico. No combinar con IMAO. Riesgo de abuso y dependencia.'
    },
    // ---------------- Urgencias ----------------
    'Dexametasona': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · dexametasona oral (DailyMed)', url: DM('01cfaa3e-5e30-18fa-e063-6394a90a084e') },
        alcance: 'Dosis antiinflamatoria del adulto según la ficha FDA; las dosis de crup y asma son de las guías clínicas.',
        adult: 'Antiinflamatorio: 0.75 - 9 mg/día VO según la enfermedad (0.02 - 0.3 mg/kg/día). Crisis asmática: 40 - 60 mg/día VO/IV x 3 - 5 días. Crup: 0.15 - 0.6 mg/kg dosis única. Náuseas por quimioterapia: 10 - 20 mg IV antes',
        ped: 'Crup: 0.15 - 0.6 mg/kg dosis única (máx 10 mg). Crisis asmática: 0.6 mg/kg (máx 16 mg) dosis única o c/24h',
        renal: 'Sin ajuste renal',
        warning: 'Hiperglucemia, retención de líquidos, úlcera e infecciones. Suprime el eje suprarrenal con uso prolongado: retirar en forma gradual si dura > 2 semanas.'
    },
    'Gluconato de calcio': {
        verificado: true, nota: 'Discrepancia documentada: la dosis de paro de las guías de reanimación es 30 mg/kg, mientras que la ficha FDA para hipocalcemia da 29 - 60 mg/kg en niños y 1000 - 2000 mg en el adulto. Confirma según la indicación.',
        fuente: { t: 'Ficha FDA · gluconato de calcio inyectable 10 % (DailyMed)', url: DM('13d7cfc9-ff7a-437e-8c21-d9709ac07d48') },
        alcance: 'Dosis de hipocalcemia del adulto, pediátrica y neonatal según la ficha FDA.',
        adult: 'Hipocalcemia: 1000 - 2000 mg de gluconato IV (10 - 20 mL al 10 %), repetible c/6h; infusión 5.4 - 21.5 mg/kg/h. Velocidad máx 200 mg/min',
        ped: '> 1 mes y < 17 años: 29 - 60 mg/kg IV, repetible c/6h; infusión 8 - 13 mg/kg/h. Neonatos: 100 - 200 mg/kg, repetible c/6h. Velocidad máx 100 mg/min',
        renal: 'Precaución en falla renal (riesgo de hipercalcemia); monitoriza el calcio sérico c/4-6h',
        warning: 'La extravasación causa necrosis: usa una vía segura. Incompatible con bicarbonato y fosfato. En paro cardíaco la dosis de las guías difiere (30 mg/kg).'
    },
    'Carbón activado': {
        verificado: true, parcial: true, nota: '',
        fuente: { t: 'Ficha FDA · carbón activado 25 g (Actidose, DailyMed)', url: DM('76e4fe6a-afd4-4f68-b12d-0b094f750615') },
        alcance: 'Dosis del adulto según la ficha FDA. La dosis pediátrica (1 g/kg) es la práctica estándar de los centros de toxicología.',
        adult: '20 - 30 g VO o por sonda en al menos 240 mL de agua, lo antes posible y dentro de la primera hora de la ingesta. Repetir 10 - 20 g c/4-6h en intoxicaciones con circulación enterohepática (carbamazepina, teofilina)',
        ped: '1 g/kg (máx 50 g) VO o por sonda, dosis única; repetir 0.5 g/kg c/4-6h si está indicado',
        renal: 'Sin ajuste renal',
        warning: 'Contraindicado en ingestión de cáusticos, hidrocarburos, metales (hierro, litio) y alcohol, y en paciente con riesgo de aspiración o sin protección de la vía aérea. No mezclar con leche ni helado.'
    },
    // ---------------- Antibióticos ----------------
    'Amoxicilina': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · amoxicilina (Amoxil, DailyMed)', url: DM('ec7dd735-dc92-3d29-e053-2a95a90af549') },
        alcance: 'Dosis del adulto y pediátrica en ORL, piel, ITU y neumonía según la ficha FDA.',
        adult: 'Leve a moderada (ORL, piel, ITU): 500 mg VO c/12h o 250 mg c/8h. Grave: 875 mg c/12h o 500 mg c/8h. Neumonía comunitaria: 1 g c/8h. Faringitis: 1 g c/24h o 500 mg c/12h x 10 días',
        ped: '25 mg/kg/día c/12h o 20 mg/kg/día c/8h; grave: 45 mg/kg/día c/12h o 40 mg/kg/día c/8h. Otitis y neumonía: 80 - 90 mg/kg/día c/12h',
        renal: 'ClCr 10 - 30: 250 - 500 mg c/12h; ClCr < 10: 250 - 500 mg c/24h',
        warning: 'Anafilaxia y reacciones cutáneas graves. Ajustar en falla renal. Se puede dar con o sin alimentos.'
    },
    'Amoxicilina / Ácido clavulánico': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · amoxicilina/clavulanato 600/42.9 mg (DailyMed)', url: DM('00b86913-50c8-443f-8467-f4f499d358af') },
        alcance: 'Dosis del adulto y pediátrica (incluida la dosis alta de 90 mg/kg/día) según la ficha FDA.',
        adult: '875/125 mg VO c/12h o 500/125 mg c/8h; infección respiratoria baja o grave: 875/125 mg c/12h. IV: 1.2 g c/8h (grave c/6h)',
        ped: 'Dosis alta (otitis, neumonía, sinusitis): 90 mg/kg/día del componente amoxicilina c/12h, suspensión 600/42.9 mg/5 mL. Dosis estándar: 25 - 45 mg/kg/día c/12h (presentación 7:1). Tomar al inicio de la comida',
        renal: 'ClCr 10 - 30: no usar la presentación de 875 mg y espaciar a c/12h; en diálisis: dosis adicional tras la sesión',
        warning: 'Diarrea y colestasis (más frecuente por el clavulanato). Hepatotoxicidad rara. Ajustar en falla renal.'
    },
    'Cefalexina': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · cefalexina (DailyMed)', url: DM('02b5cd6f-3df8-43c1-879d-217fcf55231a') },
        alcance: 'Dosis del adulto y pediátrica y ajuste renal según la ficha FDA.',
        adult: '250 mg VO c/6h o 500 mg c/12h; infección grave: 500 mg c/6h (hasta 4 g/día). Faringitis: 500 mg c/12h x 10 días',
        ped: 'Otitis media: 75 - 100 mg/kg/día c/6h. Otras infecciones: 25 - 50 mg/kg/día c/6h; graves: 50 - 100 mg/kg/día. Faringitis: 20 mg/kg/dosis c/12h (máx 500 mg)',
        renal: 'ClCr < 30: 250 mg c/8-12h; en diálisis, dosis adicional tras la sesión',
        warning: 'Alergia cruzada con penicilina (bajo riesgo). Colitis por C. difficile. Ajustar en falla renal.'
    },
    'Cefazolina': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · cefazolina sódica inyectable (DailyMed)', url: DM('17f8f038-c204-4dab-80d7-6f7ac41ddbec') },
        alcance: 'Dosis del adulto, profilaxis quirúrgica y ajuste renal según la ficha FDA.',
        adult: 'Infección moderada a grave: 500 mg - 1 g IV/IM c/6-8h. Leve: 250 - 500 mg c/8h. ITU: 1 g c/12h. Grave (endocarditis, sepsis): 1 - 1.5 g c/6h (hasta 12 g/día). Profilaxis: 1 - 2 g IV 30 - 60 min antes de la incisión (2 g si > 120 kg) y repetir intraoperatorio',
        ped: '50 - 100 mg/kg/día c/6-8h; profilaxis 25 - 30 mg/kg',
        renal: 'ClCr 35 - 54: 1 g c/12h; 11 - 34: 500 mg c/12h; < 10: 500 mg c/24h; diálisis: dosis adicional',
        warning: 'Alergia cruzada con penicilina. Flebitis con infusión rápida. Ajustar en falla renal.'
    },
    'Gentamicina': {
        verificado: true, parcial: true, nota: '',
        fuente: { t: 'Ficha FDA · gentamicina inyectable (DailyMed)', url: DM('09cf88af-59da-f147-e063-6294a90aac99') },
        alcance: 'Dosis del adulto según la ficha FDA; el ajuste renal y la dosis extendida provienen de guías de dosificación antimicrobiana.',
        adult: 'Función renal normal: 3 mg/kg/día IV/IM en 3 dosis c/8h; infección potencialmente fatal: hasta 5 mg/kg/día c/6-8h y reducir a 3 mg/kg/día al mejorar. Dosis extendida: 5 - 7 mg/kg c/24h',
        ped: '2.5 mg/kg/dosis c/8h (o 5 - 7.5 mg/kg c/24h en dosis extendida). Neonatos: según edad posmenstrual',
        renal: 'Ajustar por ClCr: espaciar el intervalo (no reducir la dosis) o usar dosis extendida con monitoreo. Objetivo de valle < 1 - 2 mcg/mL',
        warning: 'Nefrotoxicidad y ototoxicidad (irreversibles). Evitar con otros nefro o ototóxicos. Monitorear creatinina y niveles si el tratamiento pasa de 48 - 72 h.'
    },
    'Azitromicina': {
        verificado: true, parcial: true, nota: '',
        fuente: { t: 'Ficha FDA · azitromicina inyectable (Zithromax, DailyMed)', url: DM('3b631aa1-2d46-40bc-a614-d698301ea4f9') },
        alcance: 'Esquema del adulto (IV y paso a oral) y de la EPI según la ficha FDA. Los esquemas orales de 3 - 5 días son de las guías clínicas.',
        adult: 'Neumonía comunitaria: 500 mg IV c/24h por al menos 2 días y luego 500 mg VO c/24h hasta completar 7 - 10 días. Ambulatorio: 500 mg el día 1 y 250 mg los días 2 - 5. Clamidia: 1 g VO dosis única. EPI: 500 mg IV c/24h x 1 - 2 días, luego 250 mg VO c/24h hasta 7 días',
        ped: '10 mg/kg el día 1 (máx 500 mg) y 5 mg/kg los días 2 - 5 (máx 250 mg). Otitis: 10 mg/kg c/24h x 3 días o 30 mg/kg dosis única',
        renal: 'Sin ajuste renal',
        warning: 'Prolonga el QT: evitar con otros fármacos que lo prolongan. Hepatotoxicidad rara. No usar en neumonía con alto riesgo de neumococo resistente.'
    },
    'Ciprofloxacino': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · ciprofloxacino oral (Cipro, DailyMed)', url: DM('888dc7f9-ad9c-4c00-8d50-8ddfd9bd27c0') },
        alcance: 'Dosis del adulto por indicación y ajuste renal según la ficha FDA.',
        adult: 'ITU: 250 - 500 mg VO c/12h x 7 - 14 días; cistitis no complicada: 250 mg c/12h x 3 días. Pielonefritis: 500 mg c/12h x 7 días. Prostatitis: 500 mg c/12h x 28 días. Diarrea infecciosa: 500 mg c/12h x 5 - 7 días. Neumonía: 500 - 750 mg c/12h x 7 - 14 días',
        ped: 'Reservado a indicaciones específicas (ITU complicada, pielonefritis) por riesgo de artropatía: 10 - 20 mg/kg/dosis c/12h (máx 750 mg/dosis)',
        renal: 'ClCr 30 - 50: 250 - 500 mg c/12h; ClCr 5 - 29: 250 - 500 mg c/18h; diálisis: según la ficha',
        warning: 'Tendinopatía y ruptura de tendón, neuropatía periférica, prolongación del QT y aneurisma aórtico. No combinar con tizanidina. Separar 2 h de antiácidos, hierro y calcio.'
    },
    'Trimetoprim / Sulfametoxazol (TMP/SMX)': {
        verificado: true, parcial: true, nota: '',
        fuente: { t: 'Ficha FDA · sulfametoxazol/trimetoprim oral (DailyMed)', url: DM('079c828c-148f-45b9-966e-d8906043b2a2') },
        alcance: 'Dosis del adulto y pediátrica en ITU, shigelosis y otitis según la ficha FDA. La dosis de P. jirovecii es de las guías clínicas.',
        adult: 'ITU y shigelosis: 160/800 mg (1 tableta DS) VO c/12h x 10 - 14 días; cistitis: 3 días. P. jirovecii: 15 - 20 mg/kg/día del componente TMP c/6-8h x 21 días',
        ped: 'ITU y otitis: 40 mg/kg/día de SMX + 8 mg/kg/día de TMP c/12h x 10 días. P. jirovecii: 15 - 20 mg/kg/día de TMP c/6-8h',
        renal: 'ClCr 15 - 30: reducir 50 %; ClCr < 15: no recomendado',
        warning: 'Reacciones cutáneas graves (SJS/TEN), hiperkalemia, cristaluria (hidratar) y hemólisis en déficit de G6PD. Contraindicado en < 2 meses y al término del embarazo.'
    },
    'Nitrofurantoína': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · nitrofurantoína oral (DailyMed)', url: DM('04af8b73-7e15-7da8-e063-6294a90af284') },
        alcance: 'Dosis del adulto y pediátrica en cistitis según la ficha FDA.',
        adult: 'Cistitis no complicada: 50 - 100 mg VO c/6h x 5 - 7 días (o 100 mg c/12h con la presentación de liberación modificada). Profilaxis: 50 - 100 mg al acostarse',
        ped: '5 - 7 mg/kg/día VO c/6h; contraindicada en < 1 mes',
        renal: 'Contraindicada si ClCr < 60 mL/min (ficha); otras fuentes usan < 30. No alcanza concentración urinaria y aumenta la toxicidad',
        warning: 'Neumonitis y fibrosis pulmonar con uso prolongado, neuropatía y hemólisis en déficit de G6PD. No sirve para pielonefritis.'
    },
    'Metronidazol': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · metronidazol oral (DailyMed)', url: DM('02046a22-a5eb-4bb7-bec7-e5a2aa55e142') },
        alcance: 'Dosis del adulto y pediátrica en anaerobios, vaginosis, tricomoniasis y amebiasis según la ficha FDA.',
        adult: 'Anaerobios: 500 mg VO/IV c/8h. Vaginosis bacteriana: 500 mg c/12h x 7 días. Tricomoniasis: 500 mg c/12h x 7 días (o 2 g dosis única). Amebiasis intestinal: 750 mg c/8h x 5 - 10 días; absceso hepático: 500 - 750 mg c/8h x 10 días',
        ped: 'Amebiasis: 35 - 50 mg/kg/día c/8h x 10 días. Anaerobios: 30 mg/kg/día c/8h (máx 4 g/día)',
        renal: 'Sin ajuste en falla renal; reducir en insuficiencia hepática grave',
        warning: 'Efecto disulfiram con alcohol (evitar hasta 72 h después). Neuropatía periférica con uso prolongado. Sabor metálico y náuseas.'
    },
    // ---------------- Cardiovascular ----------------
    'Metoprolol': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · metoprolol tartrato oral (DailyMed)', url: DM('00de1f16-f979-4dbf-aa60-246ffac8d410') },
        alcance: 'Dosis del adulto en HTA y angina según la ficha FDA.',
        adult: 'HTA: 100 mg/día en 1 - 2 dosis; rango 100 - 450 mg/día. Angina: 100 mg/día en 2 dosis; rango 100 - 400 mg/día. Post-IAM y falla cardíaca: titular según tolerancia',
        ped: 'No establecida en la ficha; uso pediátrico por especialista',
        renal: 'Sin ajuste renal; en hepatopatía grave reducir la dosis',
        warning: 'No suspender bruscamente (angina de rebote). Bradicardia, bloqueo AV, broncoespasmo e hipoglucemia enmascarada. Cuidado con verapamilo o diltiazem IV.'
    },
    'Enalapril': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · enalapril maleato (DailyMed)', url: DM('074fe718-88d8-365c-e063-6394a90a299d') },
        alcance: 'Dosis del adulto y ajuste renal según la ficha FDA.',
        adult: 'HTA: 5 mg VO c/24h de inicio; rango 10 - 40 mg/día en 1 - 2 dosis. Con diurético: iniciar 2.5 mg. Falla cardíaca: 2.5 mg c/12h, titular a 10 - 20 mg c/12h',
        ped: 'HTA: 0.08 mg/kg c/24h (máx 5 mg), titular hasta 0.3 mg/kg/día. No recomendado en neonatos ni con eTFG < 30',
        renal: 'ClCr ≤ 30: iniciar 2.5 mg c/24h y titular lento; diálisis: 2.5 mg en los días de sesión',
        warning: 'Angioedema, tos seca, hiperkalemia y deterioro renal. Contraindicado en embarazo. Suspender ante estenosis bilateral de arteria renal.'
    },
    'Losartán': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · losartán potásico (DailyMed)', url: DM('021cd76a-b093-4704-8410-5e7d01e20a54') },
        alcance: 'Dosis del adulto y pediátrica según la ficha FDA.',
        adult: 'HTA: 50 mg VO c/24h; máx 100 mg/día. Nefropatía diabética tipo 2: 50 mg, subir a 100 mg/día. Falla cardíaca: 50 mg c/24h',
        ped: '≥ 6 años: 0.7 mg/kg c/24h (máx 50 mg); rango 0.7 - 1.4 mg/kg (máx 100 mg)',
        renal: 'Sin ajuste inicial; monitoriza potasio y creatinina. Evitar en estenosis bilateral de arteria renal',
        warning: 'Hiperkalemia, hipotensión y deterioro renal. Contraindicado en embarazo. No combinar con aliskirén en diabéticos.'
    },
    'Furosemida': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · furosemida oral (DailyMed)', url: DM('01a5f094-b473-4e46-9e61-69d5ec6dd766') },
        alcance: 'Dosis del adulto y pediátrica según la ficha FDA.',
        adult: 'Edema: 20 - 80 mg VO dosis única; repetir a las 6 - 8 h o aumentar 20 - 40 mg hasta el efecto deseado; mantenimiento 1 - 2 veces/día. Estados edematosos graves: hasta 600 mg/día. IV: 20 - 40 mg (hasta 100 mg)',
        ped: '1 - 2 mg/kg/dosis VO/IV c/6-12h (máx 6 mg/kg/dosis)',
        renal: 'En falla renal puede requerir dosis mayores; vigila ototoxicidad con infusión rápida',
        warning: 'Hipopotasemia, hipovolemia, hiponatremia y lesión renal. Ototoxicidad con bolos rápidos. En cirrosis evita la hipokalemia.'
    },
    'Espironolactona': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · espironolactona (DailyMed)', url: DM('08738ad4-1607-4d55-af71-6790477353bd') },
        alcance: 'Dosis del adulto y umbrales de seguridad según la ficha FDA.',
        adult: 'Falla cardíaca: 25 mg VO c/24h (subir a 50 mg si tolera; 25 mg en días alternos si hay hiperkalemia). HTA: 25 - 100 mg/día. Hiperaldosteronismo primario: 100 - 400 mg/día. Ascitis: 100 mg/día con furosemida 40 mg',
        ped: '1 - 3 mg/kg/día c/24h o dividido (uso por especialista)',
        renal: 'Iniciar solo si K⁺ ≤ 5.0 y eTFG > 50; con eTFG 30 - 50 usar 12.5 - 25 mg y monitorear; contraindicada si eTFG < 30 o K⁺ > 5.5',
        warning: 'Hiperkalemia (riesgo alto con IECA/ARA II y falla renal). Ginecomastia y alteraciones menstruales. Controla K⁺ y creatinina a los 3 días y a la semana.'
    },
    'Verapamilo': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · verapamilo clorhidrato oral (DailyMed)', url: DM('006cf920-04ae-0b53-cb91-85481972abc2') },
        alcance: 'Dosis oral del adulto en HTA, angina y arritmias según la ficha FDA.',
        adult: 'HTA: 80 - 120 mg VO c/8h (o 240 - 480 mg/día en liberación sostenida). Angina: 80 - 120 mg c/8h. Arritmias: 240 - 320 mg/día; profilaxis de TSVP: 240 - 480 mg/día. IV: 5 - 10 mg en 2 min, repetible a los 30 min',
        ped: 'No establecida en la ficha; uso pediátrico por especialista',
        renal: 'Sin ajuste renal; reducir en hepatopatía grave',
        warning: 'No administrar IV con betabloqueadores (bloqueo AV y asistolia). Estreñimiento, hipotensión y edema. Contraindicado en disfunción sistólica grave y en WPW con fibrilación auricular.'
    },
    'Digoxina': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · digoxina (Lanoxin, DailyMed)', url: DM('9ec84cac-6ecc-43dc-8006-6ccc029e2707') },
        alcance: 'Dosis de carga del adulto y pediátrica según la ficha FDA; el mantenimiento y el ajuste renal siguen la misma ficha.',
        adult: 'Carga (si se requiere): 10 - 15 mcg/kg VO (8 - 12 mcg/kg IV) en dosis divididas. Mantenimiento: 0.125 - 0.25 mg VO c/24h, ajustado por edad, peso magro y función renal. En ancianos o falla renal: 0.125 mg/día',
        ped: 'Carga: pretérmino 15 - 25 mcg/kg; a término 20 - 30; 1 - 24 meses 30 - 50; 2 - 5 años 25 - 35; 5 - 10 años 15 - 30; > 10 años 8 - 12 mcg/kg. Mantenimiento: 1/4 a 1/3 de la carga al día',
        renal: 'Ajustar por ClCr: reducir la dosis y monitorear niveles. Rango terapéutico en falla cardíaca 0.5 - 0.9 ng/mL',
        warning: 'Margen terapéutico estrecho: náuseas, visión amarilla, bradicardia y arritmias. La hipokalemia y la hipomagnesemia aumentan la toxicidad. Antídoto: anticuerpos antidigoxina.'
    },
    'Amlodipino': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · amlodipino besilato (DailyMed)', url: DM('003dd1ec-16f8-4f96-b6a8-c4689d35892a') },
        alcance: 'Dosis del adulto y pediátrica según la ficha FDA.',
        adult: 'HTA y angina: 5 mg VO c/24h; máx 10 mg/día. Ancianos, frágiles o hepatopatía: iniciar 2.5 mg. Esperar 7 - 14 días entre ajustes',
        ped: '6 - 17 años: 2.5 - 5 mg c/24h (no se han estudiado dosis > 5 mg)',
        renal: 'Sin ajuste renal',
        warning: 'Edema periférico, cefalea y rubor. Hipotensión en estenosis aórtica grave. No suspender bruscamente.'
    },
    'Hidroclorotiazida': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · hidroclorotiazida (DailyMed)', url: DM('01ad3531-5ed9-434c-b7d5-02d72aa82e46') },
        alcance: 'Dosis del adulto y pediátrica según la ficha FDA.',
        adult: 'HTA: 25 mg VO c/24h de inicio; puede subir a 50 mg/día (dosis > 50 mg no aportan más y causan hipokalemia). Edema: 25 - 100 mg/día en 1 - 2 dosis',
        ped: '1 - 2 mg/kg/día en 1 - 2 dosis; máx 37.5 mg/día (< 2 años) o 100 mg/día (2 - 12 años)',
        renal: 'Poco eficaz si eTFG < 30; monitoriza Na⁺, K⁺ y ácido úrico',
        warning: 'Hiponatremia, hipokalemia, hiperuricemia y fotosensibilidad. Aumenta la calcemia. Cuidado en alérgicos a sulfonamidas.'
    },
    'Captopril': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · captopril (DailyMed)', url: DM('1395ba5b-2fc9-41ff-9c43-e0740d781dee') },
        alcance: 'Dosis del adulto en HTA según la ficha FDA.',
        adult: 'HTA: 25 mg VO c/12h de inicio; si no responde en 1 - 2 semanas, 50 mg c/12h; rango 25 - 150 mg c/12h; máx 450 mg/día. Falla cardíaca: 6.25 - 12.5 mg c/8h',
        ped: '0.3 mg/kg/dosis c/8h (uso por especialista); iniciar bajo por riesgo de hipotensión',
        renal: 'ClCr 10 - 50: 75 % de la dosis; ClCr < 10: 50 %',
        warning: 'Angioedema, tos, hiperkalemia y neutropenia (rara). Contraindicado en embarazo. Tomar 1 h antes de las comidas.'
    },
    'Carvedilol': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · carvedilol (DailyMed)', url: DM('010290af-81f4-0037-e063-6394a90a4638') },
        alcance: 'Dosis del adulto en falla cardíaca, post-IAM e HTA según la ficha FDA.',
        adult: 'Falla cardíaca: 3.125 mg VO c/12h x 2 semanas, luego 6.25, 12.5 y 25 mg c/12h cada ≥ 2 semanas (máx 25 mg c/12h si < 85 kg; 50 mg c/12h si > 85 kg). Post-IAM con disfunción VI: 6.25 mg c/12h, subir a 12.5 y 25 mg c/12h. HTA: 6.25 mg c/12h, subir a 12.5 y 25 mg c/12h',
        ped: 'No establecida',
        renal: 'Sin ajuste renal; contraindicado en hepatopatía grave',
        warning: 'Tomar con alimentos. Bradicardia, hipotensión ortostática y broncoespasmo. No suspender bruscamente.'
    },
    'Atorvastatina': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · atorvastatina cálcica (DailyMed)', url: DM('00afce9b-48c9-487a-a738-e359c005c707') },
        alcance: 'Dosis del adulto y pediátrica según la ficha FDA.',
        adult: '10 - 20 mg VO c/24h de inicio; rango 10 - 80 mg/día. Si se requiere reducir el LDL > 45 %: iniciar 40 mg. A cualquier hora, con o sin comida',
        ped: '≥ 10 años con hipercolesterolemia familiar: 10 mg c/24h (rango 10 - 20 mg en heterocigota; 10 - 80 mg en homocigota)',
        renal: 'Sin ajuste renal',
        warning: 'Mialgia y rabdomiólisis (rara): mide CK si hay dolor muscular. Hepatotoxicidad: controla transaminasas. Contraindicada en embarazo y lactancia.'
    },
    'Tenecteplasa': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · tenecteplasa (TNKase, DailyMed)', url: DM('739a3c53-caf6-40d6-a6af-84ce733a948b') },
        alcance: 'Dosis por peso en IAMCEST según la ficha FDA.',
        adult: 'IAMCEST: bolo IV único de 0.5 mg/kg: < 60 kg 30 mg; 60 - 69 kg 35 mg; 70 - 79 kg 40 mg; 80 - 89 kg 45 mg; ≥ 90 kg 50 mg. Administrar en 5 - 10 segundos, con aspirina y heparina o enoxaparina',
        ped: 'No establecida',
        renal: 'Sin ajuste renal; precaución en > 75 años (mayor riesgo de hemorragia intracraneal)',
        warning: 'Hemorragia grave, incluida intracraneal. Contraindicada en ACV reciente, sangrado activo, disección aórtica, HTA no controlada (> 180/110) y cirugía mayor reciente.'
    },
    // ---------------- Endocrino / Metabolismo ----------------
    'Metformina': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · metformina clorhidrato (DailyMed)', url: DM('011de1a5-1ac0-4831-9e8d-26ec79ba2205') },
        alcance: 'Dosis del adulto y pediátrica y umbrales renales según la ficha FDA.',
        adult: 'Inicio: 500 mg VO c/12h o 850 mg c/24h con las comidas; subir 500 mg/semana (o 850 mg c/2 semanas) hasta máx 2550 mg/día. Dosis > 2000 mg se toleran mejor c/8h',
        ped: '≥ 10 años: 500 mg c/12h con las comidas; subir 500 mg/semana hasta máx 2000 mg/día c/12h',
        renal: 'No iniciar si eTFG 30 - 45; contraindicada si eTFG < 30. Suspender antes de medios de contraste y cirugía',
        warning: 'Acidosis láctica (rara y grave): suspender ante vómito, diarrea, deshidratación, sepsis o hipoxia. Déficit de B12 con uso prolongado. No causa hipoglucemia en monoterapia.'
    },
    'Insulina NPH': {
        verificado: true, parcial: true, nota: '',
        fuente: { t: 'Ficha FDA · insulina humana NPH (Humulin N, DailyMed)', url: DM('f6edd793-440b-40c2-96b5-c16133b7a921') },
        alcance: 'Vía SC e individualización según la ficha FDA; las dosis de inicio son las habituales de las guías de diabetes.',
        adult: 'Individualizar. Diabetes tipo 2: iniciar 10 UI o 0.1 - 0.2 UI/kg/día SC al acostarse; subir 2 UI cada 3 días hasta la meta de glucemia en ayunas. Tipo 1: 0.5 - 1 UI/kg/día, 2/3 en la mañana y 1/3 en la noche, con insulina rápida prandial',
        ped: 'Individualizar; suele requerir 0.5 - 1 UI/kg/día en 2 dosis (2/3 y 1/3)',
        renal: 'Reducir la dosis en falla renal (menor requerimiento); monitorear más',
        warning: 'Hipoglucemia (la principal). Agitar o rodar el vial antes de usar (suspensión turbia). No mezclar con insulina glargina. Rotar los sitios de inyección.'
    },
    'Insulina glargina': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · insulina glargina 100 UI/mL (Basaglar, DailyMed)', url: DM('0ad21db3-2b1c-4ed9-a687-bdd6a74d0aae') },
        alcance: 'Dosis inicial del adulto y uso pediátrico según la ficha FDA.',
        adult: 'Diabetes tipo 2: iniciar 0.2 UI/kg o 10 UI SC c/24h a la misma hora. Tipo 1: ~1/3 de la dosis total diaria como basal. Ajustar 2 - 4 UI cada 3 - 7 días según la glucemia en ayunas',
        ped: '≥ 6 años con tipo 1: individualizar; misma dosis que otras insulinas glargina 100 UI/mL',
        renal: 'Reducir en falla renal',
        warning: 'Hipoglucemia. Solución transparente: no agitar. No mezclar en la misma jeringa. No cambiar de marca sin ajustar la dosis.'
    },
    'Glibenclamida': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · gliburida (glibenclamida) oral (DailyMed)', url: DM('05341afe-5b7a-462a-a196-689cb09f83fc') },
        alcance: 'Dosis del adulto según la ficha FDA.',
        adult: 'Inicio: 2.5 - 5 mg VO c/24h con el desayuno o la primera comida (1.25 mg en sensibles). Subir 2.5 mg cada 1 - 2 semanas; máx 20 mg/día (habitual 10 mg)',
        ped: 'No recomendada',
        renal: 'Evitar si ClCr < 60 (riesgo de hipoglucemia prolongada); contraindicada en falla renal grave',
        warning: 'Hipoglucemia prolongada, sobre todo en ancianos y falla renal. Aumento de peso. Interacciona con muchos fármacos.'
    },
    'Empagliflozina': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · empagliflozina (Jardiance, DailyMed)', url: DM('1782b947-4a72-4feb-a488-1469d9af82bd') },
        alcance: 'Dosis del adulto y umbrales renales según la ficha FDA.',
        adult: 'Diabetes tipo 2: 10 mg VO c/24h por la mañana; subir a 25 mg si se tolera. Falla cardíaca o enfermedad renal crónica: 10 mg c/24h',
        ped: 'No establecida',
        renal: 'No recomendada para control glucémico si eTFG < 30; en falla cardíaca se puede usar hasta eTFG 20; iniciar con precaución si eTFG < 45',
        warning: 'Cetoacidosis euglucémica (suspender 3 días antes de cirugía o ayuno), infecciones genitourinarias, hipotensión y depleción de volumen. No usar en diabetes tipo 1.'
    },
    'Levotiroxina': {
        verificado: true, parcial: true, nota: '',
        fuente: { t: 'Ficha FDA · levotiroxina sódica oral (DailyMed)', url: DM('008de8fd-150f-4022-8ccb-c8bfa94875c7') },
        alcance: 'Administración y dosis del adulto según la ficha FDA; la dosis pediátrica por edad es de las guías de endocrinología pediátrica.',
        adult: 'Hipotiroidismo: 1.6 mcg/kg/día VO c/24h en ayunas, 30 - 60 min antes del desayuno. Ancianos o cardiopatía: iniciar 12.5 - 25 mcg/día y subir cada 6 - 8 semanas. Ajustar por TSH a las 6 - 8 semanas',
        ped: '0 - 3 meses: 10 - 15 mcg/kg/día; 3 - 6 meses: 8 - 10; 6 - 12 meses: 6 - 8; 1 - 5 años: 5 - 6; 6 - 12 años: 4 - 5; > 12 años: 2 - 3 mcg/kg/día',
        renal: 'Sin ajuste renal',
        warning: 'Tomar en ayunas y separada 4 h de hierro, calcio, antiácidos y café. El exceso causa fibrilación auricular y osteoporosis. No cambiar de marca sin control de TSH.'
    },
    // ---------------- Gastrointestinal ----------------
    'Omeprazol': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · omeprazol oral (DailyMed)', url: DM('0344268f-d8e6-48d5-b1e1-f750ed1d8a52') },
        alcance: 'Dosis del adulto y pediátrica según la ficha FDA.',
        adult: 'ERGE: 20 mg VO c/24h x 4 - 8 semanas. Úlcera duodenal: 20 mg c/24h x 4 semanas. Úlcera gástrica: 40 mg c/24h x 4 - 8 semanas. H. pylori (triple terapia): 20 mg + amoxicilina 1 g + claritromicina 500 mg c/12h x 10 días',
        ped: '≥ 2 años: 5 - 10 kg 5 mg; 10 - 20 kg 10 mg; > 20 kg 20 mg, c/24h',
        renal: 'Sin ajuste renal; reducir en hepatopatía grave (máx 20 mg/día)',
        warning: 'Tomar 30 - 60 min antes del desayuno. Uso prolongado: hipomagnesemia, déficit de B12, fracturas y C. difficile. Interacciona con clopidogrel.'
    },
    'Pantoprazol': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · pantoprazol sódico oral (DailyMed)', url: DM('03dea010-4bae-43ab-893e-9bbddb58062d') },
        alcance: 'Dosis del adulto y pediátrica según la ficha FDA.',
        adult: 'Esofagitis erosiva: 40 mg VO c/24h hasta 8 semanas. Mantenimiento: 40 mg c/24h. Zollinger-Ellison: 40 mg c/12h',
        ped: '≥ 5 años: 15 - 40 kg 20 mg c/24h; ≥ 40 kg 40 mg c/24h (hasta 8 semanas)',
        renal: 'Sin ajuste renal; reducir en hepatopatía grave',
        warning: 'Tomar antes del desayuno. Hipomagnesemia y fracturas con uso prolongado. Interacciona con clopidogrel (menos que el omeprazol).'
    },
    'Metoclopramida': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · metoclopramida oral (DailyMed)', url: DM('3cc8ca5b-8b71-4c77-a181-9ce154597b9a') },
        alcance: 'Dosis del adulto, límite de duración y ajuste renal según la ficha FDA.',
        adult: 'Gastroparesia diabética: 10 mg VO 30 min antes de cada comida y al acostarse; máx 40 mg/día x 2 - 8 semanas. ERGE: 10 - 15 mg 30 min antes de las comidas y al acostarse; máx 60 mg/día. IV/IM: 10 mg c/6-8h',
        ped: '0.1 - 0.15 mg/kg/dosis c/6-8h (máx 0.5 mg/kg/día); solo por especialista y por ≤ 5 días',
        renal: 'ClCr < 40: reducir la dosis 50 %; en diálisis reducir 75 %',
        warning: 'Reacciones extrapiramidales y discinesia tardía (aumentan con más de 12 semanas). Máximo 5 días en pediatría. Contraindicada en obstrucción intestinal y feocromocitoma.'
    },
    'Ondansetrón': {
        verificado: true, parcial: true, nota: '',
        fuente: { t: 'Ficha FDA · ondansetrón oral (DailyMed)', url: DM('00327696-c496-4c83-a63e-9e29fd6246d4') },
        alcance: 'Dosis del adulto según la ficha FDA; la dosis pediátrica y la de náuseas no oncológicas son de las guías clínicas.',
        adult: 'Náuseas y vómito: 4 - 8 mg VO c/8-12h (máx 16 mg/día; en hepatopatía grave máx 8 mg/día). Quimioterapia: 8 mg 30 min antes y a las 8 h, luego c/12h. IV: 4 mg c/8h',
        ped: '≥ 4 años: 4 mg VO c/8-12h (máx 8 mg/dosis); IV 0.15 mg/kg c/8h (máx 4 mg/dosis)',
        renal: 'Sin ajuste renal',
        warning: 'Prolonga el QT (cuidado con otros fármacos que lo prolongan y en hipokalemia o hipomagnesemia). Cefalea y estreñimiento. No usar de rutina en íleo.'
    },
    'Hioscina (butilbromuro)': {
        verificado: true, parcial: true, nota: '',
        fuente: { t: 'Ficha técnica AEMPS-CIMA · butilbromuro de hioscina 10 mg', url: 'https://cima.aemps.es/cima/dochtml/ft/18221/FT_18221.html' },
        alcance: 'Dosis oral del adulto según la ficha española (Buscapina). La dosis parenteral no está en esa ficha.',
        adult: 'Cólico abdominal: 10 - 20 mg VO (1 - 2 tabletas de 10 mg) 3 - 5 veces/día; máx 100 mg/día',
        ped: 'No indicada en < 6 años; de 6 a 12 años solo con supervisión médica',
        renal: 'Sin ajuste renal ni hepático',
        warning: 'Anticolinérgico: sequedad de boca, taquicardia y retención urinaria. Contraindicada en glaucoma de ángulo cerrado, miastenia gravis, megacolon e íleo. No usar más de 3 días sin evaluar la causa del dolor.'
    },
    'Loperamida': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · loperamida de venta libre (Imodium A-D, DailyMed)', url: DM('01da76d0-1979-4c45-9d39-c72ae4e4ffe2') },
        alcance: 'Dosis del adulto y pediátrica según la ficha de venta libre.',
        adult: 'Diarrea aguda: 4 mg VO inicial, luego 2 mg después de cada deposición líquida; máx 8 mg/día en venta libre (16 mg/día con prescripción). Suspender a las 48 h sin mejoría',
        ped: 'No usar en < 2 años. 2 - 5 años: solo con indicación médica; 6 - 8 años: 2 mg tras la primera deposición, máx 6 mg/día; 9 - 11 años: 2 mg, máx 8 mg/día',
        renal: 'Sin ajuste renal',
        warning: 'No usar en diarrea sanguinolenta, fiebre alta ni sospecha de infección invasiva (Shigella, Salmonella, C. difficile). Riesgo de íleo y megacolon.'
    },
    'Lactulosa': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · lactulosa oral (Enulose, DailyMed)', url: DM('00c42c5c-d19e-4130-aa08-a8bbd47d3e5b') },
        alcance: 'Dosis del adulto y pediátrica según la ficha FDA.',
        adult: 'Estreñimiento: 30 - 45 mL (20 - 30 g) VO c/24h, ajustando cada 1 - 2 días hasta 2 - 3 deposiciones blandas/día. Encefalopatía hepática: 30 - 45 mL c/6-8h hasta 2 - 3 deposiciones/día, luego la dosis mínima eficaz',
        ped: 'Lactantes: 2.5 - 10 mL/día divididos. Niños y adolescentes: 40 - 90 mL/día',
        renal: 'Sin ajuste renal',
        warning: 'Flatulencia y cólicos al inicio. Contraindicada en obstrucción intestinal y galactosemia. En encefalopatía vigila el Na⁺ y la deshidratación.'
    },
    // ---------------- Neurología ----------------
    'Carbamazepina': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · carbamazepina oral (DailyMed)', url: DM('047bc284-060a-4db9-bf37-75d10f95a0a6') },
        alcance: 'Dosis del adulto en epilepsia según la ficha FDA; la dosis pediátrica y la de neuralgia del trigémino son estándar.',
        adult: 'Epilepsia: 200 mg VO c/12h (o 400 mg/día) de inicio; subir 200 mg/semana hasta respuesta. Máx 1200 mg/día en > 15 años (1000 mg en 12 - 15 años); hasta 1600 mg en casos raros. Neuralgia del trigémino: 100 mg c/12h, subir hasta 200 mg c/8h (máx 1200 mg)',
        ped: '6 - 12 años: 100 mg c/12h (o 200 mg/día), subir 100 mg/semana; mantenimiento 15 - 20 mg/kg/día c/8-12h (máx 1000 mg/día)',
        renal: 'Sin ajuste renal; reducir en hepatopatía',
        warning: 'HLA-B*1502 en asiáticos (riesgo de SJS/TEN): tamizar antes de iniciar. Inductor enzimático potente (reduce anticonceptivos y warfarina). Hiponatremia y agranulocitosis. No suspender bruscamente.'
    },
    'Gabapentina': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · gabapentina oral (DailyMed)', url: DM('01b810b7-f4c8-4412-bbc5-b9220d8770d8') },
        alcance: 'Dosis del adulto y pediátrica y ajuste renal según la ficha FDA.',
        adult: 'Neuralgia posherpética: 300 mg el día 1, 600 mg el día 2, 900 mg el día 3, luego titular hasta 1800 mg/día c/8h (hasta 3600 mg/día). Epilepsia: 300 mg c/8h, subir hasta 600 mg c/8h',
        ped: '3 - 11 años: 10 - 15 mg/kg/día c/8h; 3 - 4 años hasta 40 mg/kg/día; 5 - 11 años 25 - 35 mg/kg/día',
        renal: 'ClCr 30 - 59: 200 - 700 mg c/12h; 15 - 29: 200 - 700 mg c/24h; < 15: 200 - 300 mg c/24h; diálisis: dosis adicional',
        warning: 'Sedación, mareo y edema. Ajustar en falla renal. Riesgo de depresión respiratoria con opioides. No suspender bruscamente.'
    },
    // ---------------- Respiratorio ----------------
    'Budesonida inhalada': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · budesonida inhalada (Pulmicort Flexhaler, DailyMed)', url: DM('10ea5d87-6ed0-4fa5-a37b-2043c8560bc0') },
        alcance: 'Dosis del adulto y pediátrica según la ficha FDA.',
        adult: 'Asma: 180 - 360 mcg c/12h; máx 720 mcg c/12h. Ajustar a la dosis mínima eficaz',
        ped: '6 - 17 años: 180 mcg c/12h; máx 360 mcg c/12h',
        renal: 'Sin ajuste renal',
        warning: 'Enjuagar la boca después de cada inhalación (candidiasis oral y disfonía). No sirve para la crisis asmática. No suspender bruscamente si se usa en dosis altas.'
    },
    'Montelukast': {
        verificado: true, nota: '',
        fuente: { t: 'Ficha FDA · montelukast sódico (DailyMed)', url: DM('04b3faff-1ea1-4d2a-aa31-9d6e742e1759') },
        alcance: 'Dosis por edad según la ficha FDA.',
        adult: 'Asma y rinitis alérgica: 10 mg VO c/24h por la noche. Prevención del broncoespasmo por ejercicio: 10 mg al menos 2 h antes',
        ped: '≥ 15 años: 10 mg; 6 - 14 años: 5 mg (masticable); 2 - 5 años: 4 mg (masticable), c/24h',
        renal: 'Sin ajuste renal',
        warning: 'Advertencia de caja: eventos neuropsiquiátricos (pesadillas, agitación, ideación suicida). Suspender si aparecen. No reemplaza al corticoide inhalado en el asma.'
    },
    'Loratadina': {
        verificado: true, parcial: true, nota: '',
        fuente: { t: 'Ficha FDA · loratadina 10 mg de venta libre (DailyMed)', url: DM('0038bc38-c205-4d8d-ab78-1abbcd76829e') },
        alcance: 'Dosis del adulto según la ficha de venta libre; la dosis pediátrica y el ajuste hepático o renal son de las guías.',
        adult: 'Rinitis alérgica y urticaria: 10 mg VO c/24h. En hepatopatía grave: 10 mg en días alternos',
        ped: '2 - 5 años: 5 mg c/24h; ≥ 6 años: 10 mg c/24h',
        renal: 'ClCr < 30: 10 mg en días alternos',
        warning: 'Poco sedante. No usar en < 2 años. Reducir en hepatopatía.'
    }
};

Object.assign(VAD_VERIF, VAD_VERIF7);
vademecumData.forEach(v => {
    const o = VAD_VERIF7[v.name];
    if (!o) return;
    Object.assign(v, o);
    v.verificado = o.verificado === true;
    v.parcial = !!o.parcial;
    v.revisado = '24 nov 2026';
});

/* ===== VERIFICACIÓN DEL VADEMÉCUM (lote 8 · 25 nov 2026) =====
   Completa la ficha de dipirona con la vía IV (CIMA, ficha técnica
   del inyectable 0,4 g/mL, Nº reg. 63430) y afina las notas de las
   10 entradas que quedaban parciales.                           */
const VAD_VERIF8 = {
    'Dipirona (Metamizol)': {
        verificado: true, parcial: false, nota: '',
        fuente: { t: 'Ficha técnica AEMPS-CIMA · metamizol 0,4 g/mL solución inyectable y para perfusión EFG (Nº reg. 63430)', url: 'https://cima.aemps.es/cima/dochtml/ft/63430/FT_63430.html' },
        alcance: 'Dosis oral e IV/IM del adulto y pediátrica por peso según la ficha española del inyectable.',
        adult: 'Adultos y adolescentes ≥ 15 años (> 53 kg): 400 - 1000 mg IV/IM/SC c/6-8h (1 - 2,5 mL de la solución 0,4 g/mL); máx 4000 mg/día (hasta 5000 mg si es necesario). IV muy lenta para minimizar hipotensión. Oral (cápsulas 575 mg): 575 mg c/4-6h, máx 3450 mg (6 dosis)/día. En dolor oncológico: 800 mg VO c/6-8h, máx 4000 mg/día y no más de 7 días',
        ped: '8 - 16 mg/kg en dosis única (10 mg/kg suele bastar en fiebre), c/6-8h, máx 4 dosis/día. Por peso: 5-8 kg 40-120 mg; 9-15 kg 80-240 mg; 16-23 kg 120-360 mg; 24-30 kg 200-480 mg; 31-45 kg 240-720 mg; 46-53 kg 360-840 mg; > 53 kg 400-1000 mg',
        renal: 'Ajustar en insuficiencia renal grave; evitar en falla renal avanzada',
        warning: 'Agranulocitosis (rara pero grave): suspende ante fiebre, odinofagia o lesiones orales. Hipotensión con infusión rápida (disponer de equipo para shock). Evitar en tercer trimestre, lactancia y déficit de G6PD.'
    },
    'Carbón activado': {
        verificado: true, parcial: true,
        nota: 'La dosis pediátrica (1 g/kg, máx 50 g) es la práctica estándar de los centros de toxicología (AAP/Poison Control); no aparece en la ficha FDA (Actidose, solo adulto 20-30 g).'
    },
    'Gentamicina': {
        verificado: true, parcial: true,
        nota: 'La dosis extendida (5-7 mg/kg c/24h) y el ajuste fino por ClCr provienen de las guías de dosificación antimicrobiana; la ficha FDA da la dosis estándar (3 mg/kg/día en 3 dosis) y el ajuste por intervalo.'
    },
    'Azitromicina': {
        verificado: true, parcial: true,
        nota: 'Los esquemas orales de 3-5 días (500 mg día 1 y 250 mg días 2-5) y la dosis de clamidia provienen de las guías clínicas; la ficha FDA da la vía IV y el esquema de la EPI.'
    },
    'Trimetoprim / Sulfametoxazol (TMP/SMX)': {
        verificado: true, parcial: true,
        nota: 'La dosis de P. jirovecii (15-20 mg/kg/día del componente TMP c/6-8h x 21 días) proviene de las guías clínicas (IDSA); la ficha FDA da ITU, shigelosis y otitis.'
    },
    'Insulina NPH': {
        verificado: true, parcial: true,
        nota: 'Las dosis de inicio (10 UI o 0,1-0,2 UI/kg/día en DM2; 0,5-1 UI/kg/día en DM1) son las habituales de las guías de diabetes (ADA); la ficha FDA individualiza y no las fija.'
    },
    'Levotiroxina': {
        verificado: true, parcial: true,
        nota: 'La dosis pediátrica por edad proviene de las guías de endocrinología pediátrica (AAP/ATA); la ficha FDA da la dosis del adulto y la administración.'
    },
    'Ondansetrón': {
        verificado: true, parcial: true,
        nota: 'La dosis pediátrica y la de náuseas no oncológicas (4-8 mg VO c/8-12h) provienen de las guías clínicas; la ficha FDA da la dosis oncológica y la IV.'
    },
    'Hioscina (butilbromuro)': {
        verificado: true, parcial: true,
        nota: 'La dosis parenteral (20 mg IV/IM/SC c/6-8h, máx 100 mg/día) es la estándar; la ficha CIMA (Nº reg. 18221) solo cubre la vía oral. Sin ficha oficial del inyectable en CIMA.',
        adult: 'Cólico abdominal: 10 - 20 mg VO (1 - 2 tabletas de 10 mg) 3 - 5 veces/día; máx 100 mg/día. IV/IM/SC: 20 mg c/6-8h; máx 100 mg/día'
    },
    'Loratadina': {
        verificado: true, parcial: true,
        nota: 'La dosis pediátrica y el ajuste hepático/renal provienen de las guías; la ficha de venta libre (OTC) da la dosis del adulto (10 mg c/24h).'
    }
};

Object.assign(VAD_VERIF, VAD_VERIF8);
vademecumData.forEach(v => {
    const o = VAD_VERIF8[v.name];
    if (!o) return;
    Object.assign(v, o);
    v.verificado = o.verificado === true;
    v.parcial = !!o.parcial;
    v.revisado = '25 nov 2026';
});


/* ===== VERIFICACIÓN DEL VADEMÉCUM (lote 9 · 25 nov 2026) =====
   Completa azitromicina y levotiroxina con la ficha FDA (oral y
   Synthroid), que incluyen las dosis pediátricas que antes
   atribuíamos a guías. Refina las notas de las 7 restantes.      */
const VAD_VERIF9 = {
    'Azitromicina': {
        verificado: true, parcial: false, nota: '',
        fuente: { t: 'Ficha FDA · azitromicina oral (Zithromax, DailyMed, set_id 003307c5-3f73-4a5d-a704-bfdea3c656e8)', url: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=003307c5-3f73-4a5d-a704-bfdea3c656e8' },
        alcance: 'Dosis del adulto y pediátrica (otitis, sinusitis, neumonía, faringitis) según la ficha FDA oral. La vía IV es la ficha inyectable.',
        adult: 'Neumonía comunitaria: 500 mg VO c/24h por al menos 2 días y luego 500 mg VO c/24h hasta completar 7 - 10 días. Ambulatorio: 500 mg el día 1 y 250 mg los días 2 - 5. Clamidia: 1 g VO dosis única. EPI: 500 mg IV c/24h x 1 - 2 días, luego 250 mg VO c/24h hasta 7 días. Sinusitis: 500 mg c/24h x 3 días. Uretritis/cervicitis gonocócica: 2 g dosis única',
        ped: 'Otitis media (≥ 6 meses): 30 mg/kg dosis única o 10 mg/kg c/24h x 3 días o 10 mg/kg día 1 y 5 mg/kg días 2 - 5. Sinusitis (≥ 6 meses): 10 mg/kg c/24h x 3 días. Neumonía (≥ 6 meses): 10 mg/kg día 1 y 5 mg/kg c/24h días 2 - 5. Faringitis (≥ 2 años): 12 mg/kg c/24h x 5 días. Máx 500 mg/día',
        renal: 'Sin ajuste renal',
        warning: 'Prolonga el QT: evitar con otros fármacos que lo prolongan. Hepatotoxicidad rara. No usar en neumonía con alto riesgo de neumococo resistente.'
    },
    'Levotiroxina': {
        verificado: true, parcial: false, nota: '',
        fuente: { t: 'Ficha FDA · levotiroxina sódica (Synthroid, DailyMed, set_id 1e11ad30-1041-4520-10b0-8f9d30d30fcc)', url: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1e11ad30-1041-4520-10b0-8f9d30d30fcc' },
        alcance: 'Dosis del adulto, pediátrica por edad y administración según la ficha FDA (Synthroid).',
        adult: 'Hipotiroidismo: 1.6 mcg/kg/día VO c/24h en ayunas, 30 - 60 min antes del desayuno. Ancianos o cardiopatía: iniciar 12.5 - 25 mcg/día y subir cada 6 - 8 semanas. Ajustar por TSH a las 6 - 8 semanas',
        ped: '0 - 3 meses: 10 - 15 mcg/kg/día; 3 - 6 meses: 8 - 10; 6 - 12 meses: 6 - 8; 1 - 5 años: 5 - 6; 6 - 12 años: 4 - 5; > 12 años (crecimiento/pubertad incompletos): 2 - 3; crecimiento/pubertad completos: 1.6 mcg/kg/día',
        renal: 'Sin ajuste renal',
        warning: 'Tomar en ayunas y separada 4 h de hierro, calcio, antiácidos y café. El exceso causa fibrilación auricular y osteoporosis. No cambiar de marca sin control de TSH.'
    },
    'Carbón activado': {
        verificado: true, parcial: true,
        nota: 'La dosis pediátrica (1 g/kg, máx 50 g) es la práctica estándar de los centros de toxicología (AAP/Poison Control); no aparece en la ficha FDA (Actidose, solo adulto 20-30 g).'
    },
    'Gentamicina': {
        verificado: true, parcial: true,
        nota: 'La dosis extendida (5-7 mg/kg c/24h) proviene de las guías de dosificación antimicrobiana; la ficha FDA da la dosis estándar (3 mg/kg/día en 3 dosis) y el ajuste por intervalo en falla renal.'
    },
    'Trimetoprim / Sulfametoxazol (TMP/SMX)': {
        verificado: true, parcial: true,
        nota: 'La dosis de P. jirovecii (15-20 mg/kg/día del componente TMP c/6-8h x 21 días) proviene de las guías clínicas (IDSA); la ficha FDA da ITU, shigelosis y otitis.'
    },
    'Insulina NPH': {
        verificado: true, parcial: true,
        nota: 'Las dosis de inicio (10 UI o 0,1-0,2 UI/kg/día en DM2; 0,5-1 UI/kg/día en DM1) son las habituales de las guías de diabetes (ADA); la ficha FDA individualiza y no las fija.'
    },
    'Ondansetrón': {
        verificado: true, parcial: true,
        nota: 'La dosis pediátrica oncológica y la IV provienen de la ficha FDA (Zofran); la dosis de náuseas no oncológicas (4-8 mg VO c/8-12h) proviene de las guías clínicas.'
    },
    'Hioscina (butilbromuro)': {
        verificado: true, parcial: true,
        nota: 'La dosis parenteral (20 mg IV/IM/SC c/6-8h, máx 100 mg/día) es la estándar; la ficha CIMA (Nº reg. 18221) solo cubre la vía oral. Sin ficha oficial del inyectable en CIMA.'
    },
    'Loratadina': {
        verificado: true, parcial: true,
        nota: 'La dosis pediátrica (2-5 años 5 mg; ≥ 6 años 10 mg c/24h) proviene de la ficha de venta libre (OTC); el ajuste hepático/renal proviene de las guías clínicas.'
    }
};

Object.assign(VAD_VERIF, VAD_VERIF9);
vademecumData.forEach(v => {
    const o = VAD_VERIF9[v.name];
    if (!o) return;
    Object.assign(v, o);
    v.verificado = o.verificado === true;
    v.parcial = !!o.parcial;
    v.revisado = '25 nov 2026';
});


/* ===== VERIFICACIÓN DEL VADEMÉCUM (lote 10 · 25 nov 2026) =====
   Completa TMP/SMX: la dosis de P. jirovecii (15-20 mg/kg/día del
   componente TMP c/6h x 14-21 días) SÍ aparece en la ficha FDA
   (sulfametoxazol/trimetoprim, set_id 079c828c-...). Refina las
   notas de los 6 restantes.                                    */
const VAD_VERIF10 = {
    'Trimetoprim / Sulfametoxazol (TMP/SMX)': {
        verificado: true, parcial: false, nota: '',
        fuente: { t: 'Ficha FDA · sulfametoxazol/trimetoprim (DailyMed, set_id 079c828c-148f-45b9-966e-d8906043b2a2)', url: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=079c828c-148f-45b9-966e-d8906043b2a2' },
        alcance: 'Dosis del adulto y pediátrica en ITU, shigelosis, otitis y P. jirovecii según la ficha FDA.',
        adult: 'ITU y shigelosis: 160/800 mg (1 tableta DS) VO c/12h x 10 - 14 días; cistitis: 3 días. P. jirovecii: 75 - 100 mg/kg/día de SMX + 15 - 20 mg/kg/día de TMP c/6h x 14 - 21 días',
        ped: 'ITU y otitis: 40 mg/kg/día de SMX + 8 mg/kg/día de TMP c/12h x 10 días. P. jirovecii: 75 - 100 mg/kg/día de SMX + 15 - 20 mg/kg/día de TMP c/6h x 14 - 21 días',
        renal: 'ClCr 15 - 30: reducir 50 %; ClCr < 15: no recomendado',
        warning: 'Reacciones cutáneas graves (SJS/TEN), hiperkalemia, cristaluria (hidratar) y hemólisis en déficit de G6PD. Contraindicado en < 2 meses y al término del embarazo.'
    },
    'Carbón activado': {
        verificado: true, parcial: true,
        nota: 'La dosis pediátrica (1 g/kg, máx 50 g) es la práctica estándar de los centros de toxicología (AAP/Poison Control); no aparece en la ficha FDA (Actidose, solo adulto 20-30 g).'
    },
    'Gentamicina': {
        verificado: true, parcial: true,
        nota: 'La dosis extendida (5-7 mg/kg c/24h) proviene de las guías de dosificación antimicrobiana; la ficha FDA da la dosis estándar (3 mg/kg/día en 3 dosis, hasta 5 mg/kg/día en infecciones graves) y el ajuste por intervalo en falla renal.'
    },
    'Insulina NPH': {
        verificado: true, parcial: true,
        nota: 'Las dosis de inicio (10 UI o 0,1-0,2 UI/kg/día en DM2; 0,5-1 UI/kg/día en DM1) son las habituales de las guías de diabetes (ADA); la ficha FDA individualiza y no las fija.'
    },
    'Ondansetrón': {
        verificado: true, parcial: true,
        nota: 'La dosis pediátrica oncológica (4 mg en 4-11 años, 8 mg en 12-17 años) y la IV provienen de la ficha FDA (Zofran); la dosis de náuseas no oncológicas (4-8 mg VO c/8-12h) proviene de las guías clínicas.'
    },
    'Hioscina (butilbromuro)': {
        verificado: true, parcial: true,
        nota: 'La dosis parenteral (20 mg IV/IM/SC c/6-8h, máx 100 mg/día) es la estándar; la ficha CIMA (Nº reg. 18221) solo cubre la vía oral. Sin ficha oficial del inyectable en CIMA.'
    },
    'Loratadina': {
        verificado: true, parcial: true,
        nota: 'La dosis pediátrica (2-5 años 5 mg; ≥ 6 años 10 mg c/24h) proviene de la ficha de venta libre (OTC); el ajuste hepático/renal proviene de las guías clínicas.'
    }
};

Object.assign(VAD_VERIF, VAD_VERIF10);
vademecumData.forEach(v => {
    const o = VAD_VERIF10[v.name];
    if (!o) return;
    Object.assign(v, o);
    v.verificado = o.verificado === true;
    v.parcial = !!o.parcial;
    v.revisado = '25 nov 2026';
});


/* =====================================================================
   SELECTOR ADULTO / PEDIÁTRICO
   ===================================================================== */
let vadPoblacion = 'adulto'; 

function setVadPoblacion(pob) {
    vadPoblacion = pob;
    const on = ['bg-teal-600', 'text-white', 'shadow'];
    const off = ['bg-transparent', 'text-slate-600', 'dark:text-slate-300'];
    const a = document.getElementById('vad-pob-adulto');
    const p = document.getElementById('vad-pob-ped');
    if (a && p) {
        [a, p].forEach(b => { b.classList.remove(...on); b.classList.add(...off); });
        const act = pob === 'adulto' ? a : p;
        act.classList.remove(...off);
        act.classList.add(...on);
    }
    renderVademecum();
}


/* =====================================================================
   RENDER DEL VADEMÉCUM (reemplaza a la función vieja)
   ===================================================================== */
function vadStats() {
    const el = document.getElementById('vad-stats'); if (!el) return;
    const total = vademecumData.length, ok = vademecumData.filter(v => v.verificado).length;
    const pct = total ? Math.round(ok * 100 / total) : 0;
    el.innerHTML = `
        <div class="flex items-center justify-between text-xs font-bold">
            <span class="text-slate-800 dark:text-slate-100">${ok} de ${total} fármacos verificados con fuente</span>
            <span class="text-emerald-600 dark:text-emerald-400">${pct}%</span>
        </div>
        <div class="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden"><div class="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style="width:${pct}%"></div></div>
        <div class="text-[10px] text-slate-400">Vademécum ${VAD_VERSION}</div>`;
        vadPendientes();
}

function renderVademecum() {
    const container = document.getElementById('vademecum-grid');
    if (!container) return;
    vadStats();

    const query = (document.getElementById('vademecum-search')?.value || '').toLowerCase().trim();
    const esAdulto = vadPoblacion === 'adulto';
    const soloVerif = !!document.getElementById('vad-only-verified')?.checked;

    const filtered = vademecumData.filter(v => {
        const matchesGrp = currentVadGroup === 'all' || v.group === currentVadGroup;
        const matchesQuery = !query ||
            (v.name || '').toLowerCase().includes(query) ||
            (v.group || '').toLowerCase().includes(query) ||
            (v.presentacion || '').toLowerCase().includes(query) ||
            (v.indicaciones || []).some(ind => ind.toLowerCase().includes(query));
        return matchesGrp && matchesQuery && (!soloVerif || v.verificado);
    });

    if (!filtered.length) {
        container.innerHTML = `<p class="text-xs text-slate-400 col-span-full">${soloVerif ? 'Ningún fármaco verificado coincide con tu búsqueda.' : 'Sin fármacos aún en esta categoría.'}</p>`;
        return;
    }

    container.innerHTML = filtered.map(v => {
        const dosis = esAdulto ? v.adult : v.ped;
        const etiqueta = esAdulto ? 'Dosis Adulto' : 'Dosis Pediátrica';
        const cajaDosis = esAdulto
            ? 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800'
            : 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800';
        const colorEtiqueta = esAdulto ? 'text-teal-700 dark:text-teal-300' : 'text-indigo-700 dark:text-indigo-300';
        const fuente = v.verificado && v.fuente
            ? `<div class="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">Fuente: <a href="${v.fuente.url}" target="_blank" rel="noopener" class="underline hover:text-teal-600">${v.fuente.t}</a> · revisado ${v.revisado}<br><span class="italic">Alcance: ${v.alcance || ''}</span></div>`
            : '';
        const nota = v.nota ? `<div class="p-2 rounded-xl ${v.verificado ? 'bg-amber-500/10 border-l-4 border-amber-500 text-amber-900 dark:text-amber-200' : 'bg-rose-500/10 border-l-4 border-rose-500 text-rose-800 dark:text-rose-300'} text-[11px]"><strong>${v.verificado ? 'Nota' : 'Pendiente'}:</strong> ${v.nota}</div>` : '';

        return `
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2.5 text-xs flex flex-col justify-between">
            <div class="space-y-2">
                <div class="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                    <div class="flex flex-wrap items-center gap-1.5">
                        <h4 class="font-bold text-slate-900 dark:text-white text-sm">${v.name}</h4>
                        ${v.altoRiesgo ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">⚠ Alto riesgo: doble chequeo</span>' : ''}
                        ${v.verificado
                            ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">✔ Verificado</span>'
                            : '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Pendiente de verificación</span>'}
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300">${v.group}</span>
                        ${favStar('drug:' + v.name)}
                    </div>
                </div>
                <p class="text-slate-600 dark:text-slate-300 italic">${v.descripcion || ''}</p>
                <div><strong class="text-slate-500">Indicaciones:</strong> <span class="text-slate-800 dark:text-slate-200">${(v.indicaciones || []).join(', ')}</span></div>
                <div><strong class="text-slate-500">Presentación (Colombia):</strong> <span class="text-slate-800 dark:text-slate-200">${v.presentacion || 'Verificar en fuente'}</span></div>
                <div class="p-2.5 rounded-xl border ${cajaDosis}">
                    <strong class="${colorEtiqueta}">${etiqueta}:</strong>
                    <span class="text-slate-800 dark:text-slate-100 font-medium">${dosis || 'Sin dosis registrada: verificar en fuente'}</span>
                </div>
                <div><strong class="text-indigo-600 dark:text-indigo-400">Ajuste Renal:</strong> ${v.renal || 'Verificar en fuente'}</div>
                <div><strong class="text-rose-600 dark:text-rose-400">Embarazo:</strong> ${v.embarazo || 'Verificar en fuente'}</div>
                <div><strong class="text-amber-600 dark:text-amber-400">Interacciones Clave:</strong> ${(v.interacciones || []).join('; ')}</div>
            </div>
            <p class="text-amber-800 dark:text-amber-300 bg-amber-500/10 p-2 rounded-xl mt-2"><strong>Alerta / Advertencia:</strong> ${v.warning || ''}</p>
            ${nota}
            ${fuente}
            <button type="button" data-n="${favEsc(v.name)}" onclick="vadReport(this.dataset.n)" class="self-start text-[10px] font-bold text-slate-400 hover:text-rose-600"><i class="fa-solid fa-flag mr-1"></i>Reportar un error</button>
        </div>`;
    }).join('');
}

                // Reportar errores del vademécum
        async function vadReport(nombre) {
            const detalle = prompt(
                `¿Qué error encontraste en la información de ${nombre}?`
            );

            if (!detalle || !detalle.trim()) return;

            const reporte = [
                'REPORTE DE ERROR - ADROOSIS',
                `Medicamento: ${nombre}`,
                `Descripción: ${detalle.trim()}`,
                `Fecha: ${new Date().toLocaleString('es-CO')}`
            ].join('\n');

            try {
                await navigator.clipboard.writeText(reporte);
                alert('Reporte copiado. Ya puedes compartirlo con el equipo de ADROOSIS.');
            } catch (error) {
                prompt('Copia este reporte para compartirlo:', reporte);
            }
        }

        let currentVadGroup = 'all';

        function filterVademecumGroup(grp) {
            currentVadGroup = grp;
            document.querySelectorAll('.vad-grp-btn').forEach(btn => {
                btn.classList.remove('bg-teal-600', 'text-white', 'shadow');
                btn.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
            });
            event.target.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
            event.target.classList.add('bg-teal-600', 'text-white', 'shadow');
            renderVademecum();
        }

        // SALUD PÚBLICA, SIVIGILA & RIAS LOGIC
        let spPoblacion = 'pediatria';
        let spSubTab = 'tamizaje';

        function setSpPoblacion(pob) {
            spPoblacion = pob;
            const btnPed = document.getElementById('sp-btn-pediatria');
            const btnAdu = document.getElementById('sp-btn-adultos');

            if (pob === 'pediatria') {
                btnPed?.classList.add('bg-teal-600', 'text-white', 'shadow');
                btnPed?.classList.remove('bg-transparent', 'text-slate-600', 'dark:text-slate-300');
                btnAdu?.classList.remove('bg-teal-600', 'text-white', 'shadow');
                btnAdu?.classList.add('bg-transparent', 'text-slate-600', 'dark:text-slate-300');
                document.getElementById('tam-edad').value = 10;
            } else {
                btnAdu?.classList.add('bg-teal-600', 'text-white', 'shadow');
                btnAdu?.classList.remove('bg-transparent', 'text-slate-600', 'dark:text-slate-300');
                btnPed?.classList.remove('bg-teal-600', 'text-white', 'shadow');
                btnPed?.classList.add('bg-transparent', 'text-slate-600', 'dark:text-slate-300');
                document.getElementById('tam-edad').value = 45;
            }
            calculateTamizajes();
        }

        function switchSpSubTab(sub) {
            spSubTab = sub;
            ['tamizaje', 'rias', 'sivigila'].forEach(s => {
                const view = document.getElementById(`sp-view-${s}`);
                const btn = document.getElementById(`btn-spsub-${s}`);
                if (view) view.classList.add('hidden');
                if (btn) {
                    btn.classList.remove('bg-teal-600', 'text-white', 'shadow');
                    btn.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
                }
            });

            const targetView = document.getElementById(`sp-view-${sub}`);
            const targetBtn = document.getElementById(`btn-spsub-${sub}`);
            if (targetView) targetView.classList.remove('hidden');
            if (targetBtn) {
                targetBtn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
                targetBtn.classList.add('bg-teal-600', 'text-white', 'shadow');
            }

            if (sub === 'tamizaje') calculateTamizajes();
            if (sub === 'rias') filterRiasLifecycle('adultez');
            if (sub === 'sivigila') renderSivigilaDirectory();
        }

        function calculateTamizajes() {
            const edad = parseInt(document.getElementById('tam-edad')?.value || 35);
            const genero = document.getElementById('tam-genero')?.value || 'F';
            const container = document.getElementById('tamizajes-output-grid');
            if (!container) return;

            let tests = [];

            if (genero === 'F') {
                if (edad >= 25 && edad <= 29) tests.push({ name: 'Citología Cervicouterina', freq: 'Esquema 1-1-3 (Anual x 2 consecutivas, luego c/3 años)', goal: 'Detección temprana de cáncer de cuello uterino', calcId: null });
                if (edad >= 30 && edad <= 65) tests.push({ name: 'Tamizaje ADN-VPH', freq: 'Cada 5 años si resulta negativo', goal: 'Detección de genotipos de VPH de alto riesgo', calcId: null });
                if (edad >= 50 && edad <= 69) tests.push({ name: 'Mamografía Bilateral', freq: 'Cada 2 años', goal: 'Tamizaje de cáncer de mama', calcId: null });
            }

            if (genero === 'M') {
                if (edad >= 50 && edad <= 75) tests.push({ name: 'PSA + Tacto Rectal', freq: 'Cada 5 años con oportunidad de decisión compartida', goal: 'Tamizaje de cáncer de próstata', calcId: null });
            }

            if (edad >= 50 && edad <= 75) {
                tests.push({ name: 'Sangre Oculta en Materia Fecal (FIT)', freq: 'Cada 2 años (Colonoscopia si es positivo)', goal: 'Tamizaje de cáncer colorrectal', calcId: null });
            }

            if (edad >= 18) {
                tests.push({ name: 'Perfil Lipídico / Riesgo CV (Framingham)', freq: 'Cada 5 años', goal: 'Riesgo cardiovascular y cardiometabólico', calcId: 'framingham', calcLabel: 'Abrir Framingham' });                tests.push({ name: 'Tamizaje de Diabetes (FINDRISC)', freq: 'Cada 3-5 años según riesgo', goal: 'Detección temprana de Diabetes Mellitus Tipo 2', calcId: 'findrisc', calcLabel: 'Abrir Test FINDRISC' });
            } else {
                tests.push({ name: 'Valoración del Crecimiento y Desarrollo', freq: 'Según esquema de control RIAS primera infancia/infancia', goal: 'Monitoreo pondero-estatural y nutricional', calcId: null });
                tests.push({ name: 'Tamizaje de Agudeza Visual', freq: 'A los 3, 5, 7, 11, 16 años', goal: 'Detección temprana de ambliopía y vicios de refracción', calcId: null });
            }

            container.innerHTML = tests.map(t => `
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2 text-xs flex flex-col justify-between">
                    <div class="space-y-2">
                        <div class="flex items-center justify-between border-b pb-2">
                            <h4 class="font-extrabold text-slate-900 dark:text-white text-sm">${t.name}</h4>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">Res. 3280</span>
                        </div>
                        <p><strong class="text-teal-600 dark:text-teal-400">Frecuencia:</strong> ${t.freq}</p>
                        <p><strong class="text-slate-500">Objetivo Clínico:</strong> ${t.goal}</p>
                    </div>
                    ${t.calcId ? `
                        <div class="pt-2 border-t border-slate-100 dark:border-slate-700">
                            <button onclick="openCalc('${t.calcId}')" class="w-full py-1.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] shadow transition-all flex items-center justify-center gap-1.5">
                                <i class="fa-solid fa-calculator"></i> ${t.calcLabel}
                            </button>
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }

        const riasLifecycles = {
            primera_infancia: { 
                title: 'Primera Infancia (0 - 5 Años)', 
                focus: 'Escala Abreviada de Desarrollo (EAD-3), Vacunación PAI, Tamizaje de Anemia y Valoración del Crecimiento.', 
                interventions: ['Atención en salud por medicina general o pediatría (1, 3, 6, 9, 12, 18, 24, 30, 36 meses).', 'Tamizaje de Hemoglobina a los 6 y 18 meses.', 'Aplicación de barniz de flúor desde los 1-2 años.'],
                calculators: []
            },
            infancia: { 
                title: 'Infancia (6 - 11 Años)', 
                focus: 'Salud Escolar, Agudeza Visual, Salud Oral y Tamizaje Cardiometabólico Temprano.', 
                interventions: ['Atención integral cada 2 años.', 'Valoración de agudeza visual a los 7 y 11 años.', 'Atención en salud oral cada año.'],
                calculators: []
            },
            adolescencia: { 
                title: 'Adolescencia (12 - 17 Años)', 
                focus: 'Salud Sexual y Reproductiva, Tamizaje de Salud Mental (AUDIT / CRAFFT) y Anticoncepción.', 
                interventions: ['Valoración por medicina general cada 2 años.', 'Asesoría en salud sexual y anticoncepción.', 'Vacunación VPH según esquema vigente.'],
                calculators: []
            },
            juventud: { 
                title: 'Juventud (18 - 28 Años)', 
                focus: 'Estilo de Vida Saludable, Prevención de ITS/VIH, Tamizaje de Salud Mental y Planificación.', 
                interventions: ['Valoración integral por medicina general cada 3 años.', 'Prueba rápida VIH / Sífilis.', 'Citología o ADN-VPH desde los 25 años.'],
                calculators: []
            },
            adultez: { 
                title: 'Adultez (29 - 59 Años)', 
                focus: 'Riesgo Cardiovascular, Tamizaje Cáncer de Cérvix, Mama, Próstata y Colorrectal.', 
                interventions: ['Valoración de riesgo cardiovascular cada 5 años.', 'Mamografía cada 2 años (50-69 años).', 'PSA + Tacto rectal cada 5 años (50-75 años).'],
                calculators: [
                    { label: 'Riesgo Diabetes (FINDRISC)', id: 'findrisc' },
                    { label: 'Índice de Tabaquismo', id: 'tabaquismo' },
                    { label: 'Tasa Filtración Glomerular (eTFG)', id: 'tfg' }
                ]
            },
            vejez: { 
                title: 'Vejez (60 Años o Más)', 
                focus: 'Valoración Gerontológica Multidimensional (VGI), Capacidad Funcional y Fragilidad.', 
                interventions: ['Atención integral en salud por medicina general cada año.', 'Valoración del riesgo de caídas y deterioro cognitivo.', 'Tamizaje poblacional ajustado a expectativa de vida.'],
                calculators: [
                    { label: 'Mini-Mental (MMSE)', id: 'mmse' },
                    { label: 'Cuestionario Pfeffer (FAQ)', id: 'pfeffer' },
                    { label: 'Riesgo CV (Framingham)', id: 'framingham' },
                    { label: 'Tasa Filtración Glomerular (eTFG)', id: 'tfg' }
                ]
            }
        };

        function filterRiasLifecycle(cycle) {
            const data = riasLifecycles[cycle];
            const container = document.getElementById('rias-detail-card');
            if (!data || !container) return;

            document.querySelectorAll('.rias-cycle-btn').forEach(b => {
                b.classList.remove('bg-teal-600', 'text-white', 'shadow');
                b.classList.add('bg-transparent', 'text-slate-600', 'dark:text-slate-300');
            });
            if (event && event.target) {
                event.target.classList.remove('bg-transparent', 'text-slate-600', 'dark:text-slate-300');
                event.target.classList.add('bg-teal-600', 'text-white', 'shadow');
            }

            container.innerHTML = `
                <div class="space-y-4">
                    <h3 class="font-extrabold text-base text-slate-900 dark:text-white border-b pb-2">${data.title}</h3>
                    <p class="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl text-teal-900 dark:text-teal-200 font-semibold"><strong>Enfoque Principal:</strong> ${data.focus}</p>
                    <div class="space-y-1">
                        <strong class="text-slate-700 dark:text-slate-300">Intervenciones Obligatorias PyP:</strong>
                        <ul class="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                            ${data.interventions.map(i => `<li>${i}</li>`).join('')}
                        </ul>
                    </div>
                    ${data.calculators && data.calculators.length > 0 ? `
                        <div class="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
                            <strong class="text-teal-600 dark:text-teal-400 block font-bold">Calculadoras & Escalas Aplicables en este Ciclo:</strong>
                            <div class="flex flex-wrap items-center gap-2">
                                ${data.calculators.map(c => `
                                    <button onclick="openCalc('${c.id}')" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-teal-600 hover:text-white text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm">
                                        <i class="fa-solid fa-calculator text-teal-500"></i> ${c.label}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        // SEMIOLOGY CARDS RENDER (SÍNDROMES COMPLETOS & CONECTADOS)

        let currentSemiCat = 'all';
        function filterSemiCat(cat) {
            currentSemiCat = cat;
            document.querySelectorAll('.sem-cat-btn').forEach(btn => {
                btn.classList.remove('bg-teal-600', 'text-white');
                btn.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
            });
            const target = [...document.querySelectorAll('.sem-cat-btn')].find(b => b.getAttribute('onclick')?.includes("'" + cat + "'"));
            if (target) {
                target.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
                target.classList.add('bg-teal-600', 'text-white');
            }
            renderSemiologia();
        }

        function renderSemiologia() {
            const container = document.getElementById('semiologia-cards-container');
            if (!container) return;

            const query = (document.getElementById('semiologia-search')?.value || '').toLowerCase().trim();
            const otrosCats = ['general', 'psiq', 'gineco', 'uro', 'orl', 'oftalmo', 'endo', 'trauma', 'pediatria', 'neonato', 'toxico'];
            const filtered = semiologiaData.filter(s => {
                if (query && !(s.title.toLowerCase().includes(query) || s.desc.toLowerCase().includes(query))) return false;
                if (currentSemiCat === 'all') return true;
                if (currentSemiCat === 'otros') return otrosCats.includes(s.cat);
                return s.cat === currentSemiCat;
            });

            const catColors = {
                cardio: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
                neuro: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
                gastro: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
                infecto: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
                urgencias: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
                respiratorio: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
                renal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
                msk: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
                general: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
                pediatria: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
                neonato: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
            };
            const catLabels = {
                cardio: 'Cardiovascular', neuro: 'Neurológico', gastro: 'Gastrointestinal', infecto: 'Infeccioso',
                urgencias: 'Urgencias', respiratorio: 'Respiratorio', renal: 'Renal', msk: 'Musculoesquelético',
                general: 'General', psiq: 'Psiquiatría', gineco: 'Ginecología', uro: 'Urología',
                orl: 'ORL', oftalmo: 'Oftalmología', endo: 'Endocrino', trauma: 'Trauma',
                pediatria: 'Pediatría', neonato: 'Neonato', toxico: 'Toxicología'
            };

            if (!filtered.length) {
                container.innerHTML = '<p class="col-span-full text-center text-sm text-slate-400 py-8">No hay síndromes que coincidan con la búsqueda o categoría.</p>';
                return;
            }

            container.innerHTML = filtered.map(s => `
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 flex flex-col justify-between text-xs">
                    <div class="space-y-2.5">
                        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                            <h3 class="font-extrabold text-sm text-slate-900 dark:text-white">${s.title}</h3>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${catColors[s.cat] || catColors.general}">${catLabels[s.cat] || s.cat || 'General'}</span>
                        </div>
                        <p class="text-slate-600 dark:text-slate-300">${s.desc}</p>
                        <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1.5 border border-slate-200/60 dark:border-slate-700/60">
                            <div><strong class="text-teal-600 dark:text-teal-400">ALICIA / Semiología:</strong> <span class="text-slate-700 dark:text-slate-300">${s.alicia}</span></div>
                            <div><strong class="text-rose-600 dark:text-rose-400">Banderas Rojas (Red Flags):</strong> <span class="text-rose-700 dark:text-rose-300 font-medium">${s.redFlags}</span></div>
                        </div>
                    </div>
                    ${s.calcId ? `
                        <div class="pt-2 border-t border-slate-100 dark:border-slate-700">
                            <button onclick="openCalc('${s.calcId}')" class="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shadow transition-all flex items-center justify-center gap-1.5">
                                <i class="fa-solid fa-calculator"></i> ${s.calcLabel}
                            </button>
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }

        // CLINICAL PEARLS ROTATOR

        let perlaIdx = 0;

        function rotatePerla() {
            perlaIdx = (perlaIdx + 1) % perlasData.length;
            const textEl = document.getElementById('perla-text');
            const authEl = document.getElementById('perla-author');
            if (textEl) textEl.textContent = perlasData[perlaIdx].text;
            if (authEl) authEl.textContent = `-- ${perlasData[perlaIdx].author}`;
        }

        // GLOBAL SEARCH
        function executeGlobalSearch(query) {
            query = query.toLowerCase().trim();
            if (!query) return;

            if (query.includes('gas') || query.includes('pafi') || query.includes('ph')) {
                switchTab('gases');
            } else if (query.includes('infec') || query.includes('sepsis') || query.includes('nac') || query.includes('itu') || query.includes('abg') || query.includes('antibiogram')) {
                switchTab('infectologia');
            } else if (query.includes('triad') || query.includes('beck') || query.includes('charcot') || query.includes('cushing')) {
                switchTab('triadas');
            } else if (query.includes('farm') || query.includes('vadem') || query.includes('dosis') || query.includes('infus')) {
                switchTab('farmaco');
            } else if (query.includes('sivi') || query.includes('rias') || query.includes('tamiz')) {
                switchTab('sivigila');
            } else if (query.includes('calc') || query.includes('fram') || query.includes('mmse') || query.includes('pfeffer') || query.includes('tfg')) {
                switchTab('calculadoras');
            } else {
                switchTab('semiologia');
            }
        }

        // REORDER MODULES MODAL HELPERS
        function openReorderModal() {
            const modal = document.getElementById('modal-reorder');
            const listContainer = document.getElementById('reorder-items-list');
            if (!modal || !listContainer) return;

            listContainer.innerHTML = moduleList.map((m, idx) => `
                <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                    <span class="flex items-center gap-2"><i class="fa-solid ${m.icon} text-teal-600"></i> ${m.label}</span>
                    <div class="flex items-center gap-1">
                        <button onclick="moveModule(${idx}, -1)" ${idx === 0 ? 'disabled class="opacity-30"' : 'class="p-1.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"'}>
                            <i class="fa-solid fa-arrow-up"></i>
                        </button>
                        <button onclick="moveModule(${idx}, 1)" ${idx === moduleList.length - 1 ? 'disabled class="opacity-30"' : 'class="p-1.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"'}>
                            <i class="fa-solid fa-arrow-down"></i>
                        </button>
                    </div>
                </div>
            `).join('');

            modal.classList.remove('hidden');
        }

        function closeReorderModal() {
            const modal = document.getElementById('modal-reorder');
            if (modal) modal.classList.add('hidden');
        }

        function moveModule(idx, dir) {
            const targetIdx = idx + dir;
            if (targetIdx < 0 || targetIdx >= moduleList.length) return;
            const temp = moduleList[idx];
            moduleList[idx] = moduleList[targetIdx];
            moduleList[targetIdx] = temp;
            renderSidebarModules();
            openReorderModal();
        }

        function resetModuleOrder() {
            moduleList = [
                { id: 'hc', label: 'Historia Clínica', icon: 'fa-file-medical', kw: 'anamnesis historia clinica alicia sample motivo de consulta enfermedad actual revision por sistemas antecedentes examen fisico signos vitales plan nota medica' },
                { id: 'infectologia', label: 'Infectología', icon: 'fa-bugs' },
                { id: 'gases', label: 'Gases Arteriales', icon: 'fa-vial-circle-check' },
                { id: 'semiologia', label: 'Síndromes Clínicos', icon: 'fa-notes-medical' },
                { id: 'calculadoras', label: 'Calculadoras', icon: 'fa-calculator' },
                { id: 'plantillas', label: 'Plantillas inteligentes', icon: 'fa-file-pen' },
                { id: 'farmaco', label: 'Vademécum', icon: 'fa-pills' },
                { id: 'sivigila', label: 'Salud Pública / RIAS', icon: 'fa-hospital-user' },
                { id: 'triadas', label: 'Tríadas Clínicas', icon: 'fa-layer-group' },
                { id: 'algoritmos', label: 'Algoritmos', icon: 'fa-diagram-project', kw: 'algoritmo flujograma decision paso a paso anafilaxia estado epileptico convulsion diarrea deshidratacion planes A B C urgencias de campo' }
            ];
            renderSidebarModules();
            closeReorderModal();
        }

        function renderSidebarModules() {
            const navContainer = document.getElementById('nav-modules-list');
            if (!navContainer) return;

            navContainer.innerHTML = moduleList.map(m => `
                <button onclick="switchTab('${m.id}')" id="nav-btn-${m.id}" class="nav-mod-btn w-full px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-all">
                    <span class="flex items-center gap-2.5">
                        <i class="fa-solid ${m.icon} text-teal-600 dark:text-teal-400 text-sm"></i>
                        <span>${m.label}</span>
                    </span>
                    <i class="fa-solid fa-chevron-right text-[10px] text-slate-400"></i>
                </button>
            `).join('');
        }

        function switchCardioSubTab(subTab) {
            const views = ['ecg', 'ic', 'sca'];
            views.forEach(v => {
                const viewEl = document.getElementById(`cardio-view-${v}`);
                if (viewEl) viewEl.classList.add('hidden');
                const btnEl = document.getElementById(`btn-cardiosub-${v}`);
                if (btnEl) {
                    btnEl.classList.remove('bg-rose-600', 'text-white', 'shadow');
                    btnEl.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
                }
            });
            const targetView = document.getElementById(`cardio-view-${subTab}`);
            if (targetView) targetView.classList.remove('hidden');
            const targetBtn = document.getElementById(`btn-cardiosub-${subTab}`);
            if (targetBtn) {
                targetBtn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
                targetBtn.classList.add('bg-rose-600', 'text-white', 'shadow');
            }
        }

        function switchDengueSubTab(subTab) {
            const views = ['dengue', 'zika', 'chik', 'ama'];
            views.forEach(v => {
                const viewEl = document.getElementById(`dengue-view-${v}`);
                if (viewEl) viewEl.classList.add('hidden');
                const btnEl = document.getElementById(`btn-denguesub-${v}`);
                if (btnEl) {
                    btnEl.classList.remove('bg-emerald-600', 'text-white', 'shadow');
                    btnEl.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
                }
            });
            const targetView = document.getElementById(`dengue-view-${subTab}`);
            if (targetView) targetView.classList.remove('hidden');
            const targetBtn = document.getElementById(`btn-denguesub-${subTab}`);
            if (targetBtn) {
                targetBtn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
                targetBtn.classList.add('bg-emerald-600', 'text-white', 'shadow');
            }
        }

        // NAVIGATION & TAB SWITCHING
        /* ---------------------------------------------------------
   Utilidades de interfaz
   --------------------------------------------------------- */
// Retrasa una función para no redibujar en cada tecla.
const _debounceTimers = Object.create(null);
function runDebounced(key, fn, ms, ...args) {
    clearTimeout(_debounceTimers[key]);
    _debounceTimers[key] = setTimeout(() => fn.apply(null, args), ms || 160);
}

// Teclado numérico adecuado en móviles (decimal si el campo admite decimales).
function enhanceNumericInputs(root) {
    (root || document).querySelectorAll('input[type="number"]:not([inputmode])').forEach(el => {
        const step = el.getAttribute('step') || '';
        el.setAttribute('inputmode', step.includes('.') ? 'decimal' : 'numeric');
    });
}

function switchTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));

            const target = document.getElementById(`tab-${tabId}`);
            if (target) target.classList.remove('hidden');

            document.querySelectorAll('.nav-mod-btn').forEach(btn => {
                btn.classList.remove('bg-teal-50', 'dark:bg-teal-900/40', 'text-teal-800', 'dark:text-teal-300', 'shadow-sm');
                btn.classList.add('text-slate-600', 'dark:text-slate-300');
            });

            const activeNavBtn = document.getElementById(`nav-btn-${tabId}`);
            if (activeNavBtn) {
                activeNavBtn.classList.remove('text-slate-600', 'dark:text-slate-300');
                activeNavBtn.classList.add('bg-teal-50', 'dark:bg-teal-900/40', 'text-teal-800', 'dark:text-teal-300', 'shadow-sm');
            }

            if (window.innerWidth < 1024) {
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('mobile-overlay');
                if (sidebar) sidebar.classList.add('-translate-x-full');
                if (overlay) overlay.classList.add('hidden');
            }

            if (tabId === 'hc') hcOpen();
            if (tabId === 'infectologia') switchInfectoSubTab('sindrome');
            if (tabId === 'cardiologia') switchCardioSubTab('ecg');
            if (tabId === 'dengue') switchDengueSubTab('dengue');
            if (tabId === 'triadas') renderTriads();
            if (tabId === 'neurologico') neuroRender();
            if (tabId === 'calculadoras') {
                if (!window._keepCalcSearch) { const s = document.getElementById('calc-search-input'); if (s) s.value = ''; }
                window._keepCalcSearch = false;
                renderCalculators();
            }
            if (tabId === 'farmaco') { renderVademecum(); calcInfusion(); }
            if (tabId === 'sivigila') switchSpSubTab('tamizaje');
            if (tabId === 'semiologia') renderSemiologia();
            if (tabId === 'favoritos') renderFavoritos();
            if (tabId === 'algoritmos') algInit();
        }

        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('mobile-overlay');
            if (sidebar && overlay) {
                sidebar.classList.toggle('-translate-x-full');
                overlay.classList.toggle('hidden');
            }
        }

        function toggleDarkMode() {
            const root = document.documentElement;
            root.classList.toggle('dark');
            const isDark = root.classList.contains('dark');
            try { localStorage.setItem('adroosis_theme', isDark ? 'dark' : 'light'); } catch (e) {}
            const toggle = document.getElementById('dark-mode-toggle');
            if (toggle) toggle.setAttribute('aria-checked', String(isDark));
        }

        function openCalc(id) {
            currentCalcCategory = 'all';
            window._keepCalcSearch = true;
            switchTab('calculadoras');
        const c = document.getElementById('calc-search-input');
            if (c) { c.value = id; renderCalculators(); }
        }


    // Agrega aquí los demás eventos, tomados del listado oficial del INS


        function renderSivigilaDirectory() {
            const container = document.getElementById('sivigila-directory-grid');
            if (!container) return;
            const q = (document.getElementById('sivigila-search')?.value || '').toLowerCase().trim();
            const list = sivigilaDirectory.filter(e => !q || e.name.toLowerCase().includes(q) || String(e.code).includes(q));
            container.innerHTML = list.length ? list.map(e => `
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2 text-xs">
                    <div class="flex items-center justify-between border-b pb-2">
                        <h4 class="font-bold text-slate-900 dark:text-white text-sm">${e.name}</h4>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">${e.code || 'Verificar'}</span>
                    </div>
                    <p><strong class="text-slate-500">Notificación:</strong> ${e.urgency || 'Verificar en protocolo INS'}</p>
                    <p><strong class="text-slate-500">Ficha:</strong> ${e.ficha || '—'}</p>
                    <p>${e.action || ''}</p>
                </div>`).join('')
                : '<p class="text-xs text-slate-400 col-span-full">No hay eventos que coincidan.</p>';
        }

        /* =====================================================================   
   ===================================================================== */


const novColorMap = {
    rose:    { bar: 'bg-rose-500',    chip: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',       soft: 'bg-rose-50 dark:bg-rose-950/30',       text: 'text-rose-700 dark:text-rose-300' },
    cyan:    { bar: 'bg-cyan-500',    chip: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',       soft: 'bg-cyan-50 dark:bg-cyan-950/30',       text: 'text-cyan-700 dark:text-cyan-300' },
    amber:   { bar: 'bg-amber-500',   chip: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',   soft: 'bg-amber-50 dark:bg-amber-950/30',     text: 'text-amber-700 dark:text-amber-300' },
    indigo:  { bar: 'bg-indigo-500',  chip: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300', soft: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-300' },
    emerald: { bar: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', soft: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300' },
    violet:  { bar: 'bg-violet-500',  chip: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300', soft: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-700 dark:text-violet-300' }
};

function renderNovedades() {
    const track = document.getElementById('novedades-track');
    if (!track) return;

    const act = document.getElementById('nov-actualizado');
    if (act && novedadesData.length) act.textContent = novedadesData[0].revisado;

    track.innerHTML = novedadesData.map(n => {
        const c = novColorMap[n.color] || novColorMap.indigo;

        const filas = (n.cambios || []).map(ch => `
            <div class="text-[11px] leading-snug space-y-1">
                ${ch.antes ? `
                <div class="flex gap-2">
                    <span class="shrink-0 w-11 font-bold uppercase tracking-wide text-slate-400">Antes</span>
                    <span class="text-slate-500 dark:text-slate-400">${ch.antes}</span>
                </div>` : ''}
                <div class="flex gap-2">
                    <span class="shrink-0 w-11 font-bold uppercase tracking-wide ${c.text}">Ahora</span>
                    <span class="text-slate-800 dark:text-slate-100 font-medium">${ch.ahora}</span>
                </div>
            </div>`).join('<div class="border-t border-dashed border-slate-200 dark:border-slate-700"></div>');

        const boton = n.aplica
            ? `<button onclick="novAplicar('${n.aplica.tipo}', '${n.aplica.id}')" class="px-3 py-1.5 rounded-lg ${c.chip} font-bold text-[11px] hover:opacity-80 transition-all"><i class="fa-solid fa-arrow-right mr-1"></i>${n.aplica.label}</button>`
            : '';

        return `
        <article class="snap-start shrink-0 w-[88%] sm:w-[400px] bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
            <div class="h-1.5 ${c.bar}"></div>
            <div class="p-4 space-y-3 flex-1 flex flex-col">
                <div class="flex items-center justify-between gap-2">
                    <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold ${c.chip}"><i class="fa-solid ${n.icono}"></i> ${n.especialidad}</span>
                    ${n.cambiaPractica ? '<span class="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-rose-600 text-white">Cambia tu práctica</span>' : ''}
                </div>
                <h4 class="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">${n.titulo}</h4>

                <div class="rounded-xl p-3 ${c.soft}">
                    <p class="text-xl font-black ${c.text} leading-tight">${n.cifra}</p>
                    <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">${n.cifraTexto}</p>
                </div>

                <div class="space-y-2">${filas}</div>

                <div id="nov-det-${n.id}" class="hidden p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-[11px] text-slate-600 dark:text-slate-300 leading-snug">${n.detalle || ''}</div>

                <div class="mt-auto pt-2 space-y-2">
                    <div class="flex flex-wrap items-center gap-2">
                        <button onclick="toggleNovDetalle('${n.id}')" class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] hover:opacity-80 transition-all">Ver detalle</button>
                        ${boton}
                    </div>
                    <div class="flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-400">
                        <a href="${n.fuente.url}" target="_blank" rel="noopener" class="underline hover:text-teal-600"><i class="fa-solid fa-link mr-1"></i>${n.fuente.texto}</a>
                        <span>${n.fecha} · revisado ${n.revisado}</span>
                    </div>
                    ${!n.verificado ? '<span class="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Pendiente de verificación</span>' : ''}
                </div>
            </div>
        </article>`;
    }).join('');
}

function toggleNovDetalle(id) {
    const el = document.getElementById('nov-det-' + id);
    if (el) el.classList.toggle('hidden');
}

function scrollNovedades(dir) {
    const t = document.getElementById('novedades-track');
    if (t) t.scrollBy({ left: dir * 340, behavior: 'smooth' });
    track.scrollLeft = 0;
}

function novAplicar(tipo, id) {
    if (tipo === 'calc') openCalc(id);
    else if (tipo === 'tab') switchTab(id);
}

/* =====================================================================
   CALCULADORA CHA2DS2-VA / CHA2DS2-VASc (reemplaza a la función vieja)
   ===================================================================== */
function calcCHA2DS2VASc() {
    const edad = Number(document.getElementById('ch-edad')?.value);
    const sexo = document.getElementById('ch-sexo')?.value;
    const resEl = document.getElementById('chads-res');

    if (!resEl) return;

    if (!Number.isInteger(edad) || edad < 18 || edad > 120) {
        alert('Ingresa una edad válida entre 18 y 120 años.');
        return;
    }

    if (!['m', 'f'].includes(sexo)) {
        alert('Selecciona la categoría de sexo para calcular CHA₂DS₂-VASc.');
        return;
    }

    const checked = id => document.getElementById(id)?.checked ? 1 : 0;

    const c = checked('ch-c');
    const h = checked('ch-h');
    const d = checked('ch-d');
    const s2 = checked('ch-s2') * 2;
    const v = checked('ch-v');

    const puntosEdad = edad >= 75 ? 2 : (edad >= 65 ? 1 : 0);
    const sexoFemenino = sexo === 'f' ? 1 : 0;

    const va = c + h + d + s2 + v + puntosEdad;
    const vasc = va + sexoFemenino;

    let recVA = '';
    if (va >= 2) {
        recVA = 'Anticoagulación oral recomendada según ESC 2024.';
    } else if (va === 1) {
        recVA = 'Considerar anticoagulación mediante decisión individualizada.';
    } else {
        recVA = 'Riesgo bajo según CHA₂DS₂-VA; generalmente no se indica anticoagulación por este puntaje aislado.';
    }

    let recVASC = '';
    if (sexo === 'm') {
        if (vasc >= 2) {
            recVASC = 'Anticoagulación recomendada según ACC/AHA 2023.';
        } else if (vasc === 1) {
            recVASC = 'Anticoagulación razonable de considerar según el contexto clínico.';
        } else {
            recVASC = 'Riesgo bajo según CHA₂DS₂-VASc.';
        }
    } else {
        if (vasc >= 3) {
            recVASC = 'Anticoagulación recomendada según ACC/AHA 2023.';
        } else if (vasc === 2) {
            recVASC = 'Anticoagulación razonable de considerar según el contexto clínico.';
        } else {
            recVASC = 'Riesgo bajo según CHA₂DS₂-VASc.';
        }
    }

    resEl.innerHTML = `
        <div class="font-bold text-sm">Resultados</div>

        <div>
            CHA₂DS₂-VA:
            <strong class="text-teal-600">${va} puntos</strong>
        </div>
        <div class="font-normal">${recVA}</div>

        <div class="border-t border-slate-300 dark:border-slate-700 pt-2">
            CHA₂DS₂-VASc:
            <strong class="text-indigo-600">${vasc} puntos</strong>
        </div>
        <div class="font-normal">${recVASC}</div>

        <div class="text-[11px] font-normal text-slate-500 mt-2">
            La categoría de sexo femenino es un modificador del riesgo y no un
            factor independiente en CHA₂DS₂-VA. Revalorar periódicamente el riesgo
            tromboembólico y considerar otros factores clínicos.
        </div>

        <div class="text-[11px] font-normal text-amber-700 dark:text-amber-400">
            No utilizar estos puntajes como única decisión terapéutica.
            En fibrilación auricular con válvula mecánica o estenosis mitral
            reumática moderada-severa, la anticoagulación se determina por
            la condición valvular, no por estos puntajes.
        </div>
    `;

    resEl.classList.remove('hidden');
}

/* =====================================================================
   BUSCADOR GLOBAL
   ===================================================================== */
const GS_GROUPS = {
    calc: { label: 'Calculadoras y escalas', icon: 'fa-calculator',   cls: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300' },
    vad:  { label: 'Vademécum',              icon: 'fa-pills',        cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    sem:  { label: 'Síndromes clínicos',     icon: 'fa-notes-medical',cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
    inf:  { label: 'Infectología',           icon: 'fa-bugs',         cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
    tri:  { label: 'Tríadas clínicas',       icon: 'fa-layer-group',  cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    sp:   { label: 'Salud pública y RIAS',   icon: 'fa-hospital-user',cls: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' },
    nov:  { label: 'Novedades clínicas',     icon: 'fa-newspaper',    cls: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
    gen:  { label: 'Herramientas y módulos', icon: 'fa-toolbox',      cls: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' }
};

let _gsIndex = null, _gsShown = [], _gsActive = -1;

function gsNorm(s) {
    return String(s ?? '')
        .replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ')
        .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
function gsPlain(s) {
    return String(s ?? '').replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}
function gsScroll(id) {
    setTimeout(() => {
        const el = typeof id === 'string' ? document.getElementById(id) : id;
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
}

function gsBuildIndex() {
    const idx = [];
    const add = o => { o.t = gsNorm(o.title); o.k = gsNorm(o.keys); o.b = gsNorm(o.body); idx.push(o); };

    // Calculadoras y escalas
    (window.calcsData || []).forEach(c => add({
        g: 'calc', title: c.title, sub: c.desc, keys: c.id + ' ' + c.cat, body: c.body,
        go: () => { document.querySelector('.calc-cat-btn')?.click(); openCalc(c.id); gsScroll('calculators-grid'); }
    }));

    // Vademécum
    (typeof vademecumData !== 'undefined' ? vademecumData : []).forEach(v => add({
        g: 'vad', title: v.name, sub: v.group + ' · ' + (v.indicaciones || []).join(', '),
        keys: [v.group, (v.indicaciones || []).join(' '), v.presentacion].join(' '),
        body: [v.descripcion, v.adult, v.ped, v.renal, v.embarazo, v.warning, (v.interacciones || []).join(' ')].join(' '),
        go: () => {
            switchTab('farmaco');
            document.querySelector('.vad-grp-btn')?.click();
            const s = document.getElementById('vademecum-search'); if (s) s.value = v.name;
            renderVademecum(); gsScroll('vademecum-search');
        }
    }));

    // Síndromes semiológicos
    semiologiaData.forEach(s => add({
        g: 'sem', title: s.title, sub: s.desc, keys: s.desc, body: s.alicia + ' ' + s.redFlags + ' ' + (s.calcLabel || ''),
        go: () => {
            switchTab('semiologia');
            const i = document.getElementById('semiologia-search'); if (i) i.value = s.title;
            renderSemiologia(); gsScroll('semiologia-cards-container');
        }
    }));

    // Infectología: síndromes
    (window.sindromesData || []).forEach(s => add({
        g: 'inf', title: s.title, sub: 'Síndrome · ' + s.empiric, keys: s.germs + ' ' + s.gravity,
        body: s.empiric + ' ' + s.alt + ' ' + s.duration,
        go: () => {
            switchTab('infectologia'); switchInfectoSubTab('sindrome');
            const i = document.getElementById('inf-sindrome-search'); if (i) i.value = s.title;
            renderInfectoSindromes(); gsScroll('inf-sindromes-container');
        }
    }));

    // Infectología: gérmenes
    (window.germenesData || []).forEach(g => add({
        g: 'inf', title: g.name, sub: 'Germen · ' + g.infections, keys: g.type + ' ' + g.infections, body: g.primary,
        go: () => {
            switchTab('infectologia'); switchInfectoSubTab('germen');
            document.querySelector('.germ-cat-btn')?.click();
            const i = document.getElementById('inf-germen-search'); if (i) i.value = g.name;
            renderInfectoGermenes(); gsScroll('inf-germenes-container');
        }
    }));

    // Infectología: antibiograma por microorganismo
    document.querySelectorAll('#abg-germ-select option').forEach(op => {
        const drugs = (abgPanelData[op.value] || []).map(d => d.name).join(' ');
        add({
            g: 'inf', title: 'Interpretar antibiograma: ' + op.textContent, sub: 'Marca S/I/R o CMI y recibe fenotipo y recomendación',
            keys: 'antibiograma sensibilidad resistencia blee sarm carbapenemasa ' + op.value, body: drugs,
            go: () => {
                switchTab('infectologia'); switchInfectoSubTab('antibiograma');
                const s = document.getElementById('abg-germ-select'); if (s) { s.value = op.value; loadAbgGermPanel(); }
                gsScroll('inf-view-antibiograma');
            }
        });
    });

    // Infectología: arbovirosis (módulo estático)
    add({
        g: 'inf', title: 'Arbovirosis: dengue, Zika, chikungunya (OMS 2025)',
        sub: 'Fases, signos de alarma y lo que se desaconseja',
        keys: 'dengue zika chikungunya fiebre amarilla arbovirosis',
        body: 'fase febril fase crítica recuperación signos de alarma dolor abdominal vómito persistente hepatomegalia letargia plaquetas hemoconcentración AINEs ibuprofeno naproxeno aspirina corticoides inmunoglobulinas transfusión plaquetas',
        go: () => { switchTab('infectologia'); switchInfectoSubTab('sindrome'); gsScroll(document.querySelector('#inf-view-sindrome > div')); }
    });

    // Tríadas
    triadsDatabase.forEach(t => add({
        g: 'tri', title: t.name, sub: t.entity, keys: t.entity + ' ' + t.category, body: t.items.join(' ') + ' ' + t.pearl,
        go: () => {
            switchTab('triadas');
            document.querySelector('.triad-filter-btn')?.click();
            const i = document.getElementById('triad-search'); if (i) i.value = t.name;
            renderTriads(); gsScroll('triads-grid');
        }
    }));

    // SIVIGILA
    sivigilaDirectory.filter(e => e.name).forEach(e => add({
        g: 'sp', title: 'SIVIGILA: ' + e.name, sub: 'Evento de notificación obligatoria', keys: String(e.code || '') + ' sivigila notificacion',
        body: [e.urgency, e.ficha, e.action].join(' '),
        go: () => {
            switchTab('sivigila'); switchSpSubTab('sivigila');
            const i = document.getElementById('sivigila-search'); if (i) i.value = e.name;
            renderSivigilaDirectory(); gsScroll('sivigila-directory-grid');
        }
    }));

    // Rutas RIAS
    Object.entries(riasLifecycles).forEach(([key, r]) => add({
        g: 'sp', title: 'RIAS: ' + r.title, sub: r.focus, keys: 'rias ruta ciclo de vida resolucion 3280', body: r.interventions.join(' '),
        go: () => {
            switchTab('sivigila'); switchSpSubTab('rias');
            setTimeout(() => {
                filterRiasLifecycle(key);
                document.querySelectorAll('.rias-cycle-btn').forEach(b => {
                    const on = (b.getAttribute('onclick') || '').includes("'" + key + "'");
                    b.classList.toggle('bg-teal-600', on); b.classList.toggle('text-white', on); b.classList.toggle('shadow', on);
                    b.classList.toggle('bg-transparent', !on);
                });
                gsScroll('rias-detail-card');
            }, 0);
        }
    }));

    // Tamizaje preventivo (módulo)
    add({
        g: 'sp', title: 'Tamizaje preventivo por edad y sexo (Res. 3280)', sub: 'Citología, ADN-VPH, mamografía, PSA, FIT, perfil lipídico',
        keys: 'tamizaje citologia adn vph mamografia psa colon prostata cuello uterino cancer',
        body: 'frecuencia objetivo clínico edad genero',
        go: () => { switchTab('sivigila'); switchSpSubTab('tamizaje'); gsScroll('sp-view-tamizaje'); }
    });

    // Novedades clínicas
    novedadesData.forEach(n => add({
        g: 'nov', title: n.titulo, sub: n.cifra + ' · ' + n.especialidad, keys: n.especialidad + ' ' + n.cifra,
        body: n.cifraTexto + ' ' + (n.cambios || []).map(c => (c.antes || '') + ' ' + c.ahora).join(' ') + ' ' + (n.detalle || ''),
        go: () => {
            switchTab('inicio');
            document.getElementById('nov-det-' + n.id)?.classList.remove('hidden');
            setTimeout(() => document.getElementById('nov-det-' + n.id)?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' }), 80);
        }
    }));

    // Perlas clínicas
    perlasData.forEach((p, i) => add({
        g: 'nov', title: 'Perla: ' + p.text.slice(0, 70) + '…', sub: p.author, keys: 'perla clinica ' + p.author, body: p.text,
        go: () => {
            switchTab('inicio');
            perlaIdx = (i - 1 + perlasData.length) % perlasData.length; rotatePerla();
            gsScroll('perla-text');
        }
    }));

    // Herramientas sueltas y módulos
    add({
        g: 'gen', title: 'Gases arteriales y equilibrio ácido-base', sub: 'Winter, anion gap, delta, PaFi, SDRA',
        keys: 'gases arteriales gasometria acido base ph paco2 hco3 pao2 fio2 pafi winter anion gap albumina sdra acidosis alcalosis',
        body: 'gradiente A-a oxigenación compensación trastorno primario',
        go: () => { switchTab('gases'); }
    });
    add({
        g: 'gen', title: 'Calculadora de infusión continua (mcg/kg/min → mL/h)', sub: 'Vasopresores, sedantes, dosis por peso',
        keys: 'infusion continua mcg kg min ml h noradrenalina dopamina dobutamina vasopresores sedantes bomba',
        body: 'dosis deseada peso concentración dilución velocidad de infusión',
        go: () => { switchTab('farmaco'); gsScroll('inf-dose'); }
    });
    moduleList.forEach(m => add({
        g: 'gen', title: 'Módulo: ' + m.label, sub: 'Abrir sección', keys: m.id, body: '',
        go: () => switchTab(m.id)
    }));

    _gsIndex = idx;
}

function globalSearch(q) {
    const box = document.getElementById('global-search-results');
    if (!box) return;
    const tokens = gsNorm(q).split(' ').filter(t => t.length > 1);
    _gsActive = -1;
    if (!tokens.length) { box.classList.add('hidden'); _gsShown = []; return; }
    if (!_gsIndex) gsBuildIndex();

    const scored = [];
    _gsIndex.forEach(e => {
        let total = 0, ok = true;
        for (const tk of tokens) {
            let s = 0;
            if (e.t.includes(tk)) s += 10 + (e.t.startsWith(tk) ? 5 : 0);
            if (e.k.includes(tk)) s += 4;
            if (e.b.includes(tk)) s += 1;
            if (!s) { ok = false; break; }
            total += s;
        }
        if (ok) scored.push({ e, total });
    });
    scored.sort((a, b) => b.total - a.total);

    // Agrupar (máx. 5 por grupo, 40 en total), en orden de relevancia
    const groups = {}, order = [];
    scored.forEach(({ e }) => {
        if (!groups[e.g]) { groups[e.g] = []; order.push(e.g); }
        if (groups[e.g].length < 5) groups[e.g].push(e);
    });
    _gsShown = [];
    order.forEach(g => _gsShown.push(...groups[g]));
    _gsShown = _gsShown.slice(0, 40);

    if (!_gsShown.length) {
        box.innerHTML = `<div class="p-4 text-xs text-slate-500 dark:text-slate-400">Sin resultados para "<strong>${gsPlain(q)}</strong>". Prueba con otra palabra (nombre del fármaco, escala, síndrome o germen).</div>`;
        box.classList.remove('hidden');
        return;
    }

    let html = `<div class="px-3 pt-2 pb-1 text-[11px] text-slate-400">${scored.length} resultado${scored.length === 1 ? '' : 's'} · ↑ ↓ para moverte, Enter para abrir</div>`;
    let i = 0;
    order.forEach(g => {
        const items = _gsShown.filter(e => e.g === g);
        if (!items.length) return;
        const G = GS_GROUPS[g];
        html += `<div class="px-3 pt-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">${G.label}</div>`;
        items.forEach(e => {
            const sub = gsPlain(e.sub).slice(0, 110);
            html += `
            <button type="button" data-i="${i}" onclick="gsOpen(${i})" class="gs-item w-full text-left px-3 py-2 rounded-xl hover:bg-teal-50 dark:hover:bg-slate-700 flex items-start gap-3 transition-colors">
                <span class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm ${G.cls}"><i class="fa-solid ${G.icon}"></i></span>
                <span class="min-w-0">
                    <span class="block text-xs font-bold text-slate-900 dark:text-white truncate">${gsPlain(e.title)}</span>
                    <span class="block text-[11px] text-slate-500 dark:text-slate-400 truncate">${sub}</span>
                </span>
            </button>`;
            i++;
        });
    });
    box.innerHTML = html;
    box.classList.remove('hidden');
}

function gsOpen(i) {
    const e = _gsShown[i];
    if (!e) return;
    const box = document.getElementById('global-search-results');
    const inp = document.getElementById('home-main-search');
    if (box) box.classList.add('hidden');
    if (inp) { inp.value = ''; inp.blur(); }
    e.go();
}

function gsKey(ev) {
    const box = document.getElementById('global-search-results');
    const items = document.querySelectorAll('#global-search-results .gs-item');
    if (ev.key === 'Escape') { box?.classList.add('hidden'); return; }
    if (!items.length) return;
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
        ev.preventDefault();
        _gsActive = ev.key === 'ArrowDown' ? Math.min(_gsActive + 1, items.length - 1) : Math.max(_gsActive - 1, 0);
        items.forEach((el, idx) => el.classList.toggle('bg-teal-50', idx === _gsActive));
        items.forEach((el, idx) => el.classList.toggle('dark:bg-slate-700', idx === _gsActive));
        items[_gsActive].scrollIntoView({ block: 'nearest' });
    } else if (ev.key === 'Enter') {
        ev.preventDefault();
        gsOpen(_gsActive >= 0 ? _gsActive : 0);
    }
}

document.addEventListener('click', e => {
    if (!e.target.closest('#global-search-wrap')) document.getElementById('global-search-results')?.classList.add('hidden');
});

/* =====================================================================
   HISTORIA CLÍNICA · ANAMNESIS GUIADA
   ===================================================================== */
const HC = { pob: 'adulto', rendered: false, vis: [] };
const hcEsc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Fábricas de campos
const hcT = (k, l, x = {}) => ({ k, l, ty: 'text', ...x });
const hcN = (k, l, x = {}) => ({ k, l, ty: 'number', ...x });
const hcA = (k, l, x = {}) => ({ k, l, ty: 'area', ...x });
const hcS = (k, l, o, x = {}) => ({ k, l, ty: 'select', o, ...x });
const hcC = (k, l, o, x = {}) => ({ k, l, ty: 'chips', o, wide: true, ...x });

const HC_ROS = [
    { k: 'ros_gen',  l: 'General', o: ['Fiebre', 'Escalofríos', 'Astenia / adinamia', 'Pérdida de peso', 'Sudoración nocturna', 'Hiporexia'] },
    { k: 'ros_piel', l: 'Piel y faneras', o: ['Rash / exantema', 'Prurito', 'Ictericia', 'Lesiones', 'Petequias / equimosis'] },
    { k: 'ros_orl',  l: 'Cabeza, ojos, oído, nariz y garganta', o: ['Cefalea', 'Mareo / vértigo', 'Alteración visual', 'Otalgia', 'Rinorrea / congestión', 'Odinofagia', 'Epistaxis'] },
    { k: 'ros_cr',   l: 'Cardiorrespiratorio', o: ['Dolor torácico', 'Disnea', 'Ortopnea', 'Palpitaciones', 'Tos', 'Expectoración', 'Hemoptisis', 'Edema', 'Síncope'] },
    { k: 'ros_gi',   l: 'Gastrointestinal', o: ['Náuseas', 'Vómito', 'Dolor abdominal', 'Diarrea', 'Estreñimiento', 'Melenas / hematoquecia', 'Disfagia', 'Pirosis'] },
    { k: 'ros_gu',   l: 'Genitourinario', o: ['Disuria', 'Polaquiuria', 'Hematuria', 'Oliguria / poliuria', 'Secreción genital', 'Alteración menstrual'] },
    { k: 'ros_neu',  l: 'Neurológico', o: ['Convulsiones', 'Pérdida de fuerza', 'Parestesias', 'Alteración del lenguaje', 'Alteración de la conciencia', 'Temblor'] },
    { k: 'ros_msk',  l: 'Musculoesquelético', o: ['Dolor articular', 'Mialgias', 'Lumbalgia', 'Limitación funcional', 'Trauma reciente'] },
    { k: 'ros_endo', l: 'Endocrino / metabólico', o: ['Polidipsia', 'Polifagia', 'Poliuria', 'Intolerancia al frío / calor', 'Cambios de peso'] },
    { k: 'ros_psi',  l: 'Psiquiátrico / sueño', o: ['Ánimo bajo', 'Ansiedad', 'Insomnio', 'Ideación suicida', 'Alucinaciones'] },
    { k: 'ros_hem',  l: 'Hematológico', o: ['Sangrado fácil', 'Palidez', 'Adenopatías'] }
];

const HC_EF = [
    { k: 'ef_gen',  l: 'Aspecto general', n: 'Buen estado general, alerta, hidratado, afebril, sin dificultad respiratoria.' },
    { k: 'ef_cab',  l: 'Cabeza y cuello', n: 'Normocéfalo, pupilas isocóricas normorreactivas, mucosa oral húmeda, orofaringe sin eritema ni exudados, cuello móvil sin adenopatías ni ingurgitación yugular.' },
    { k: 'ef_cp',   l: 'Cardiopulmonar', n: 'Tórax simétrico, ruidos cardíacos rítmicos sin soplos, murmullo vesicular conservado sin agregados.' },
    { k: 'ef_abd',  l: 'Abdomen', n: 'Blando, depresible, no doloroso, sin masas ni visceromegalias, ruidos intestinales presentes, sin signos de irritación peritoneal.' },
    { k: 'ef_gu',   l: 'Genitourinario', n: 'Puño percusión bilateral negativa, sin globo vesical.' },
    { k: 'ef_ext',  l: 'Extremidades', n: 'Simétricas, sin edemas, pulsos distales presentes, llenado capilar < 2 segundos.' },
    { k: 'ef_neu',  l: 'Neurológico', n: 'Alerta, orientado en las tres esferas, Glasgow 15/15, pares craneales sin déficit, fuerza 5/5, sensibilidad conservada, sin signos meníngeos.' },
    { k: 'ef_piel', l: 'Piel y faneras', n: 'Íntegra, sin lesiones, rash ni petequias, buena coloración.' }
];

const HC_FORM = [
    { id: 'ident', t: 'Identificación', short: 'Identificación', ic: 'fa-id-card', f: [
        hcT('nombre', 'Nombre completo'), hcT('doc', 'Documento de identidad'),
        hcN('edad', 'Edad'), hcS('edadu', 'Unidad de edad', ['años', 'meses', 'días']),
        hcS('sexo', 'Sexo', ['', 'Femenino', 'Masculino']),
        hcS('fuente', 'Fuente de la información', ['Paciente', 'Familiar / acompañante', 'Historia previa', 'Mixta']),
        hcT('eps', 'EPS / régimen'), hcT('ocup', 'Ocupación'),
        hcT('proc', 'Procedencia / residencia'),
        hcT('resp', 'Acompañante / responsable (parentesco y teléfono)')
    ]},
    { id: 'motivo', t: 'Motivo de consulta', short: 'Motivo', ic: 'fa-comment-medical',
      quick: ['Dolor torácico', 'Dolor abdominal', 'Fiebre', 'Dificultad respiratoria', 'Cefalea', 'Vómito / diarrea', 'Trauma', 'Mareo', 'Control'],
      f: [ hcA('motivo', 'En palabras del paciente (entre comillas)', { rows: 2, wide: true, ph: '"Me duele el pecho desde ayer"' }) ]},
    { id: 'actual', t: 'Enfermedad actual (ALICIA)', short: 'Enf. actual', ic: 'fa-stethoscope', f: [
        hcT('evol', 'Tiempo de evolución', { ph: 'Ej: 3 días' }),
        hcS('ap', 'Aparición / forma de inicio', ['', 'Súbita', 'Progresiva', 'Intermitente / episódica', 'Continua']),
        hcT('loc', 'Localización'),
        hcN('int', 'Intensidad EVA (0-10)', { min: 0, max: 10 }),
        hcT('irr', 'Irradiación'),
        hcT('ate', 'Atenuantes (qué lo mejora)'),
        hcT('agr', 'Agravantes (qué lo empeora)'),
        hcC('car', 'Carácter / calidad', ['Opresivo', 'Punzante', 'Cólico', 'Ardor / quemante', 'Pulsátil', 'Sordo', 'Eléctrico']),
        hcC('aso', 'Síntomas asociados', ['Fiebre', 'Náuseas / vómito', 'Disnea', 'Diaforesis', 'Mareo', 'Síncope', 'Diarrea', 'Tos', 'Pérdida de peso']),
        hcA('narr', 'Relato cronológico', { rows: 4, wide: true, ph: 'Inicio, evolución, qué ha hecho el paciente...' }),
        hcA('prev', 'Consultas y tratamientos previos por este cuadro', { rows: 2, wide: true })
    ]},
    { id: 'ros', t: 'Revisión por sistemas', short: 'Sistemas', ic: 'fa-list-check',
      f: HC_ROS.map(s => hcC(s.k, s.l, [...s.o, 'Sin síntomas'], { ex: 'Sin síntomas', noo: true })) },
    { id: 'ant', t: 'Antecedentes', short: 'Antecedentes', ic: 'fa-clock-rotate-left', f: [
        hcC('alerg', 'Alergias (medicamentos, látex, alimentos)', ['Niega alergias conocidas', 'Penicilina / betalactámicos', 'AINE', 'Sulfas', 'Látex', 'Alimentos', 'Contraste yodado'], { ex: 'Niega alergias conocidas', crit: true }),
        hcA('meds', 'Medicamentos actuales (nombre, dosis, frecuencia)', { rows: 2, wide: true, crit: true, ph: 'Escribe "ninguno" si no toma' }),
        hcC('pat', 'Patológicos', ['Niega antecedentes', 'HTA', 'Diabetes mellitus', 'Dislipidemia', 'Asma', 'EPOC', 'ERC', 'Insuficiencia cardíaca', 'Cardiopatía isquémica', 'ACV', 'Epilepsia', 'Hipotiroidismo', 'Cáncer', 'Tuberculosis', 'VIH', 'Enfermedad hepática', 'Depresión / ansiedad', 'Obesidad'], { ex: 'Niega antecedentes' }),
        hcT('qx', 'Quirúrgicos y hospitalizaciones previas', { wide: true }),
        hcC('tox', 'Hábitos y exposiciones', ['Niega hábitos tóxicos', 'Tabaquismo', 'Alcohol', 'Sustancias psicoactivas', 'Humo de leña / biomasa', 'Plaguicidas / agroquímicos'], { ex: 'Niega hábitos tóxicos' }),
        hcC('fam', 'Familiares', ['Sin antecedentes familiares relevantes', 'HTA', 'Diabetes', 'Cardiopatía / muerte súbita', 'Cáncer', 'ACV', 'Asma / atopia', 'Enfermedad mental', 'Enfermedad hereditaria'], { ex: 'Sin antecedentes familiares relevantes' }),
        hcT('inm', 'Inmunizaciones (PAI, influenza, tétanos, COVID-19)', { wide: true, vis: () => HC.pob !== 'pediatrico' })
    ]},
    { id: 'gineco', t: 'Gineco-obstétricos', short: 'Gineco', ic: 'fa-venus', vis: () => hcGet('sexo') === 'Femenino' && HC.pob !== 'pediatrico', f: [
        hcT('gpac', 'G / P / A / C / V', { ph: 'Ej: G2P1A0C0V1' }),
        { k: 'fum', l: 'Fecha de última menstruación (FUM / FUR)', ty: 'date' },
        hcT('ciclos', 'Ciclos menstruales'),
        hcT('planif', 'Método de planificación'),
        hcT('cito', 'Última citología / tamizaje', { wide: true })
    ]},
    { id: 'gest', t: 'Gestación actual', short: 'Gestación', ic: 'fa-person-pregnant', vis: () => HC.pob === 'gestante',
      after: '<div id="hc-gest-calc" class="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-xs text-teal-900 dark:text-teal-200"></div>', f: [
        hcT('cpn', 'Controles prenatales (número y lugar)'),
        hcT('gs', 'Grupo sanguíneo y Rh'),
        hcS('mov', 'Movimientos fetales', ['', 'Presentes', 'Disminuidos', 'Ausentes', 'No aplica (< 20 semanas)']),
        hcT('labs', 'Paraclínicos prenatales (VIH, sífilis, ecografía)'),
        hcC('alarm', 'Signos de alarma obstétrica', ['Niega signos de alarma', 'Sangrado vaginal', 'Pérdida de líquido', 'Contracciones', 'Cefalea intensa / visión borrosa', 'Edema marcado / epigastralgia', 'Fiebre', 'Disminución de movimientos fetales'], { ex: 'Niega signos de alarma', crit: true })
    ]},
    { id: 'ped', t: 'Datos pediátricos', short: 'Pediatría', ic: 'fa-baby', vis: () => HC.pob === 'pediatrico', f: [
        hcT('eg', 'Edad gestacional al nacer (semanas)'),
        hcS('parto', 'Tipo de parto', ['', 'Vaginal', 'Cesárea']),
        hcT('pn', 'Peso y talla al nacer'),
        hcT('apgar', 'APGAR'),
        hcT('perin', 'Complicaciones perinatales', { wide: true }),
        hcS('lact', 'Alimentación', ['', 'Lactancia materna exclusiva', 'Lactancia mixta', 'Fórmula', 'Alimentación complementaria', 'Dieta del adulto']),
        hcS('vac', 'Vacunación', ['', 'Esquema PAI completo para la edad', 'Esquema incompleto', 'Desconocido / sin carné']),
        hcT('des', 'Desarrollo psicomotor / escolaridad', { wide: true }),
        hcN('pc', 'Perímetro cefálico (cm)')
    ]},
    { id: 'vit', t: 'Signos vitales', short: 'Signos vitales', ic: 'fa-heart-pulse',
      after: '<div id="hc-vit-calc" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs space-y-2"></div>', f: [
        hcN('ta_s', 'TA sistólica (mmHg)'), hcN('ta_d', 'TA diastólica (mmHg)'),
        hcN('fc', 'FC (lpm)'), hcN('fr', 'FR (rpm)'),
        hcN('temp', 'Temperatura (°C)'), hcN('sat', 'SatO₂ (%)'),
        hcS('o2', 'SatO₂ medida con', ['Aire ambiente', 'O₂ suplementario']),
        hcN('gluc', 'Glucometría (mg/dL)'),
        hcN('peso', 'Peso (kg)'), hcN('talla', 'Talla (cm)')
    ]},
    { id: 'tamizaje', t: 'Tamizaje y riesgo', short: 'Tamizaje', ic: 'fa-clipboard-check', f: [
        hcS('eva', 'Dolor EVA (0-10)', ['', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']),
        hcS('nutricion', 'Tamizaje nutricional (MUST)', ['No valorado', 'Bajo riesgo (0 pts)', 'Riesgo medio (1 pt)', 'Alto riesgo (≥ 2 pts)']),
        hcS('caidas', 'Riesgo de caídas (Morse)', ['No valorado', 'Bajo (0-24)', 'Moderado (25-44)', 'Alto (≥ 45)']),
        hcS('tvp', 'Riesgo de TVP (Wells)', ['No valorado', 'Bajo (0-1)', 'Moderado (2)', 'Alto (≥ 3)']),
        hcS('mental', 'Tamizaje de salud mental (PHQ-2)', ['No valorado', 'Negativo (0-2)', 'Positivo (≥ 3) - ampliar PHQ-9']),
        hcS('alcohol', 'Consumo de alcohol (AUDIT-C)', ['No valorado', 'Bajo riesgo', 'Riesgo moderado', 'Riesgo alto']),
        hcC('tabaco', 'Tabaquismo', ['No fuma', 'Fumador activo', 'Exfumador', 'Nunca fumó'], { ex: 'No fuma' }),
        hcS('braden', 'Riesgo de úlcera por presión (Braden)', ['No valorado', 'Bajo riesgo (19-23)', 'Riesgo moderado (15-18)', 'Alto riesgo (13-14)', 'Muy alto riesgo (≤ 12)']),
        hcS('barthel', 'Dependencia funcional (Barthel)', ['No valorado', 'Independiente (100)', 'Dependencia leve (61-99)', 'Dependencia moderada (41-60)', 'Dependencia grave (21-40)', 'Dependencia total (0-20)']),
        hcC('plan_tamizaje', 'Conducta (marca todo lo que aplique)', ['Consejería de cesación tabáquica', 'Consejería de reducción de alcohol', 'Derivación a nutrición', 'Derivación a psicología/psiquiatría', 'Medidas de prevención de caídas', 'Profilaxis de TVP', 'Superficie de apoyo (colchón antiescaras)', 'Tamizaje de cáncer (citología, mamografía, PSA, FIT)'], { noo: true })
    ]},
    { id: 'ef', t: 'Examen físico', short: 'Examen físico', ic: 'fa-user-doctor',
      hdr: { l: 'Todo normal', on: 'hcAllNormal()' },
      f: HC_EF.map(e => hcA(e.k, e.l, { rows: 2, wide: true, normal: true })) },
    { id: 'dx', t: 'Análisis, diagnóstico y plan', short: 'Dx y plan', ic: 'fa-clipboard-check', f: [
        hcA('ana', 'Análisis clínico', { rows: 4, wide: true, ph: 'Síntesis, razonamiento y diagnósticos diferenciales...' }),
        hcA('dx', 'Impresión diagnóstica (uno por línea, con CIE-10 si puedes)', { rows: 3, wide: true }),
        hcC('plan', 'Conducta (marca todo lo que aplique)', ['Hospitalizar', 'Observación en urgencias', 'Egreso con manejo ambulatorio', 'Remisión a mayor nivel', 'Paraclínicos solicitados', 'Imágenes solicitadas', 'Fórmula médica entregada', 'Incapacidad', 'Signos de alarma explicados', 'Control / seguimiento', 'Interconsulta', 'Notificación SIVIGILA'], { noo: true }),
        hcA('conducta', 'Plan detallado: paraclínicos, fórmula, indicaciones y controles', { rows: 4, wide: true }),
        hcT('medico', 'Médico responsable (nombre y registro médico)'),
        { k: 'fh', l: 'Fecha y hora de la atención', ty: 'datetime-local' }
    ]}
];

/* ---------- Render ---------- */
function hcField(f) {
    const id = 'hc-' + f.k;
    const cls = 'w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20';
    let inner;
    if (f.ty === 'select') {
        inner = `<select id="${id}" onchange="hcUpdate()" class="${cls}">${f.o.map(o => `<option value="${hcEsc(o)}">${o || '— Seleccionar —'}</option>`).join('')}</select>`;
    } else if (f.ty === 'area') {
        inner = `<textarea id="${id}" rows="${f.rows || 3}" oninput="hcUpdate()" placeholder="${hcEsc(f.ph || '')}" class="${cls}"></textarea>`;
    } else if (f.ty === 'chips') {
        inner = `<div class="flex flex-wrap gap-1.5">${f.o.map(o => `<button type="button" class="hc-chip${o === f.ex ? ' neg' : ''}" data-k="${f.k}" data-v="${hcEsc(o)}" data-ex="${hcEsc(f.ex || '')}" onclick="hcChip(this)">${o}</button>`).join('')}</div>`
            + (f.noo ? '' : `<input id="${id}__o" type="text" oninput="hcUpdate()" placeholder="Otros (escribe aquí)" class="${cls} mt-1.5">`);
    } else {
        inner = `<input id="${id}" type="${f.ty || 'text'}" ${f.ty === 'number' ? 'step="any"' : ''} ${f.min != null ? `min="${f.min}" max="${f.max}"` : ''} oninput="hcUpdate()" placeholder="${hcEsc(f.ph || '')}" class="${cls}">`;
    }
    const lab = `<label class="flex items-center justify-between gap-2 font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]"><span>${f.l}${f.crit ? ' <span class="ml-1 px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 text-[9px]">No olvidar</span>' : ''}</span>${f.normal ? `<button type="button" onclick="hcNormal('${f.k}')" class="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-[10px] font-bold">Normal</button>` : ''}</label>`;
    return `<div id="hc-f-${f.k}" class="${f.wide ? 'sm:col-span-2' : ''}">${lab}${inner}</div>`;
}

function hcSection(s) {
    const hdr = s.hdr ? `<button type="button" onclick="${s.hdr.on}" class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-[11px] font-bold">${s.hdr.l}</button>` : '';
    const quick = s.quick ? `<div class="flex flex-wrap gap-1.5"><span class="text-[10px] font-bold text-slate-400 self-center">Atajos:</span>${s.quick.map(q => `<button type="button" class="hc-chip" onclick="hcQuick('motivo','${q}')">${q}</button>`).join('')}</div>` : '';
    return `
    <section id="hc-sec-${s.id}" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <button type="button" onclick="hcToggle('${s.id}')" class="flex items-center gap-2.5 font-extrabold text-sm text-slate-900 dark:text-white text-left">
                <span class="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center text-sm"><i class="fa-solid ${s.ic}"></i></span>${s.t}
            </button>
            <div class="flex items-center gap-2">${hdr}<i id="hc-chev-${s.id}" class="fa-solid fa-chevron-up text-slate-400 text-xs"></i></div>
        </div>
        <div id="hc-body-${s.id}" class="p-4 space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${s.f.map(hcField).join('')}</div>
            ${quick}${s.after || ''}
        </div>
    </section>`;
}

function hcRender() {
    HC.vis = [];
    document.getElementById('hc-form').innerHTML = HC_FORM.map(hcSection).join('');
    document.getElementById('hc-stepper').innerHTML = HC_FORM.map(s =>
        `<button type="button" id="hc-step-${s.id}" onclick="hcGo('${s.id}')" class="shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"><i class="fa-solid ${s.ic} mr-1"></i>${s.short}</button>`).join('');
    HC_FORM.forEach(s => {
        if (s.vis) HC.vis.push({ ids: ['hc-sec-' + s.id, 'hc-step-' + s.id], fn: s.vis });
        s.f.forEach(f => { if (f.vis) HC.vis.push({ ids: ['hc-f-' + f.k], fn: f.vis }); });
    });
    const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    const fh = document.getElementById('hc-fh'); if (fh) fh.value = d.toISOString().slice(0, 16);
    hcUpdate();
}

function hcOpen() {
    if (!HC.rendered) { hcRender(); HC.rendered = true; } else hcUpdate();
}

/* ---------- Lectura de datos ---------- */
function hcGet(k) { const el = document.getElementById('hc-' + k); return el ? (el.value || '').trim() : ''; }
function hcChips(k) {
    const arr = [...document.querySelectorAll(`.hc-chip.on[data-k="${k}"]`)].map(b => b.dataset.v);
    const o = (document.getElementById('hc-' + k + '__o')?.value || '').trim();
    if (o) arr.push(o);
    return arr;
}

/* ---------- Interacciones ---------- */
function hcChip(b) {
    const on = !b.classList.contains('on');
    const k = b.dataset.k, ex = b.dataset.ex;
    if (on && ex) {
        document.querySelectorAll(`.hc-chip.on[data-k="${k}"]`).forEach(x => {
            if (b.dataset.v === ex || x.dataset.v === ex) x.classList.remove('on');
        });
    }
    b.classList.toggle('on', on);
    hcUpdate();
}
function hcQuick(k, text) {
    const el = document.getElementById('hc-' + k); if (!el) return;
    el.value = el.value ? el.value + ', ' + text.toLowerCase() : text;
    hcUpdate();
}
function hcNormal(k) {
    const e = HC_EF.find(x => x.k === k), el = document.getElementById('hc-' + k);
    if (e && el) { el.value = e.n; hcUpdate(); }
}
function hcAllNormal() {
    HC_EF.forEach(e => { const el = document.getElementById('hc-' + e.k); if (el && !el.value.trim()) el.value = e.n; });
    hcUpdate();
}
function hcToggle(id) {
    const b = document.getElementById('hc-body-' + id), c = document.getElementById('hc-chev-' + id);
    if (!b) return;
    const hide = !b.classList.contains('hidden');
    b.classList.toggle('hidden', hide);
    if (c) { c.classList.toggle('fa-chevron-up', !hide); c.classList.toggle('fa-chevron-down', hide); }
}
function hcGo(id) {
    document.getElementById('hc-body-' + id)?.classList.remove('hidden');
    document.getElementById('hc-sec-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function setHcPob(p) {
    HC.pob = p;
    ['adulto', 'pediatrico', 'gestante'].forEach(x => {
        const b = document.getElementById('hc-pob-' + x); if (!b) return;
        const on = x === p;
        b.classList.toggle('bg-teal-600', on); b.classList.toggle('text-white', on); b.classList.toggle('shadow', on);
        b.classList.toggle('bg-transparent', !on); b.classList.toggle('text-slate-600', !on); b.classList.toggle('dark:text-slate-300', !on);
    });
    if (p === 'gestante') { const s = document.getElementById('hc-sexo'); if (s) s.value = 'Femenino'; }
    if (HC.rendered) hcUpdate();
}
function hcClear() {
    if (!confirm('¿Borrar todo lo escrito en la historia?')) return;
    hcRender();
}

/* ---------- Cálculos ---------- */
function hcVitals() {
    const n = k => { const v = parseFloat(hcGet(k)); return isNaN(v) ? null : v; };
    const s = n('ta_s'), d = n('ta_d'), fc = n('fc'), fr = n('fr'), t = n('temp'), sat = n('sat'), p = n('peso'), h = n('talla'), g = n('gluc');
    const pam = (s != null && d != null) ? (s + 2 * d) / 3 : null;
    const imc = (p && h) ? p / Math.pow(h / 100, 2) : null;
    const si = (fc != null && s) ? fc / s : null;
    const flags = [];
    let qs = false;
    if (HC.pob !== 'pediatrico') {
        if (s != null && (s >= 180 || (d != null && d >= 120))) flags.push(['r', 'Crisis hipertensiva (≥ 180/120): busca daño de órgano blanco']);
        if ((s != null && s < 90) || (pam != null && pam < 65)) flags.push(['r', 'Hipotensión / PAM < 65: descarta choque']);
        if (fc != null && fc > 100) flags.push(['a', 'Taquicardia (> 100 lpm)']);
        if (fc != null && fc < 60) flags.push(['a', 'Bradicardia (< 60 lpm)']);
        if (fr != null && fr >= 22) flags.push(['a', 'Taquipnea (FR ≥ 22)']);
        if (fr != null && fr < 12) flags.push(['a', 'Bradipnea (FR < 12)']);
        if (t != null && t >= 38) flags.push(['a', 'Fiebre (≥ 38 °C)']);
        if (t != null && t < 36) flags.push(['a', 'Hipotermia (< 36 °C)']);
        if (sat != null && sat < 90) flags.push(['r', 'Hipoxemia (SatO₂ < 90%): considera oxígeno. A gran altitud el rango normal es más bajo.']);
        if (g != null && g < 70) flags.push(['r', 'Hipoglucemia (< 70 mg/dL): trátala primero']);
        if (g != null && g > 250) flags.push(['a', 'Glucemia > 250: descarta CAD / EHH']);
        if (si != null && si >= 0.9) flags.push(['a', 'Índice de shock ≥ 0.9']);
        if (fr != null && fr >= 22 && s != null && s <= 100) { flags.push(['r', 'qSOFA ≥ 2 (FR y PAS): sospecha sepsis']); qs = true; }
    }
    return { s, d, fc, fr, t, sat, p, h, g, pam, imc, si, flags, qs };
}

function hcVitalsUI() {
    const el = document.getElementById('hc-vit-calc'); if (!el) return;
    const v = hcVitals();
    const bits = [];
    if (v.pam != null) bits.push(`PAM <b>${v.pam.toFixed(0)} mmHg</b>`);
    if (v.imc != null) {
        const c = v.imc < 18.5 ? 'bajo peso' : v.imc < 25 ? 'peso normal' : v.imc < 30 ? 'sobrepeso' : 'obesidad';
        bits.push(`IMC <b>${v.imc.toFixed(1)}</b> (${c})`);
    }
    if (v.si != null) bits.push(`Índice de shock <b>${v.si.toFixed(2)}</b>`);
    const col = { r: 'text-rose-600 dark:text-rose-400', a: 'text-amber-600 dark:text-amber-400' };
    let html = bits.length ? `<div class="text-slate-700 dark:text-slate-200">${bits.join(' · ')}</div>` : '<div class="text-slate-400">Ingresa los signos vitales para ver PAM, IMC y alertas.</div>';
    if (HC.pob === 'pediatrico') html += '<div class="text-slate-500">En pediatría las alertas automáticas se desactivan: compara con la tabla de signos vitales por edad.</div>';
    html += v.flags.map(f => `<div class="font-semibold ${col[f[0]]}"><i class="fa-solid fa-triangle-exclamation mr-1"></i>${f[1]}</div>`).join('');
    html += `<div class="flex flex-wrap gap-1.5 pt-1"><span class="text-[10px] font-bold text-slate-400 self-center">Escalas útiles:</span>
        <button type="button" onclick="openCalc('qsofa')" class="hc-chip">qSOFA</button>
        <button type="button" onclick="openCalc('glasgow')" class="hc-chip">Glasgow</button>
        <button type="button" onclick="openCalc('curb65')" class="hc-chip">CURB-65</button></div>`;
    el.innerHTML = html;
}

function hcEG() {
    const v = hcGet('fum'); if (!v) return null;
    const f = new Date(v + 'T00:00:00');
    const days = Math.floor((Date.now() - f.getTime()) / 86400000);
    if (isNaN(days) || days < 0 || days > 300) return null;
    return { sem: Math.floor(days / 7), d: days % 7, fpp: new Date(f.getTime() + 280 * 86400000).toLocaleDateString('es-CO') };
}
function hcGestUI() {
    const el = document.getElementById('hc-gest-calc'); if (!el) return;
    const eg = hcEG();
    el.innerHTML = eg ? `EG por FUR: <b>${eg.sem}+${eg.d} semanas</b> · FPP (Naegele): <b>${eg.fpp}</b>` : 'Ingresa la FUM (sección Gineco-obstétricos) para calcular edad gestacional y FPP.';
}

/* ---------- Checklist "No se te pase" ---------- */
function hcChecks() {
    const f = k => !!hcGet(k), c = k => hcChips(k).length > 0;
    const fem = hcGet('sexo') === 'Femenino', age = parseFloat(hcGet('edad')), yrs = hcGet('edadu') === 'años';
    const ped = HC.pob === 'pediatrico', ges = HC.pob === 'gestante';
    const car = [f('loc'), f('ap'), f('int'), c('car'), f('irr'), f('ate') || f('agr')].filter(Boolean).length;
    const L = [
        { sec: 'ident', t: 'Nombre, documento, edad y sexo', ok: f('nombre') && f('doc') && f('edad') && f('sexo') },
        { sec: 'motivo', t: 'Motivo de consulta en palabras del paciente', ok: f('motivo') },
        { sec: 'actual', t: 'Tiempo de evolución', ok: f('evol') },
        { sec: 'actual', t: 'Caracterizar el síntoma principal (ALICIA, ≥ 3 datos)', ok: car >= 3 },
        { sec: 'ant', t: 'ALERGIAS interrogadas', ok: c('alerg'), crit: true },
        { sec: 'ant', t: 'MEDICAMENTOS actuales', ok: f('meds'), crit: true },
        { sec: 'ant', t: 'Antecedentes patológicos', ok: c('pat') },
        { sec: 'ant', t: 'Quirúrgicos / hospitalizaciones', ok: f('qx') },
        { sec: 'ant', t: 'Hábitos y exposiciones', ok: c('tox') },
        { sec: 'ant', t: 'Antecedentes familiares', ok: c('fam') },
        { sec: 'ros', t: 'Revisión por sistemas (≥ 3 sistemas)', ok: HC_ROS.filter(s => c(s.k)).length >= 3 },
        { sec: 'vit', t: 'Signos vitales: TA, FC, FR, T° y SatO₂', ok: ['ta_s', 'ta_d', 'fc', 'fr', 'temp', 'sat'].every(f), crit: true },
        { sec: 'vit', t: 'PESO (lo necesitas para dosificar)', ok: f('peso'), crit: true },
        { sec: 'tamizaje', t: 'Dolor (EVA) valorado', ok: f('eva') },
        { sec: 'tamizaje', t: 'Tamizaje nutricional (MUST)', ok: f('nutricion') },
        { sec: 'tamizaje', t: 'Riesgo de caídas (Morse)', ok: f('caidas') },
        { sec: 'tamizaje', t: 'Riesgo de TVP (Wells)', ok: f('tvp') },
        { sec: 'tamizaje', t: 'Tamizaje de salud mental (PHQ-2)', ok: f('mental') },
        { sec: 'tamizaje', t: 'Consumo de alcohol (AUDIT-C)', ok: f('alcohol') },
        { sec: 'tamizaje', t: 'Tabaquismo', ok: c('tabaco') },
        { sec: 'tamizaje', t: 'Riesgo de úlcera por presión (Braden)', ok: f('braden') },
        { sec: 'tamizaje', t: 'Dependencia funcional (Barthel)', ok: f('barthel') },
        { sec: 'ef', t: 'Examen físico (≥ 4 sistemas)', ok: HC_EF.filter(e => f(e.k)).length >= 4 },
        { sec: 'dx', t: 'Análisis clínico', ok: f('ana') },
        { sec: 'dx', t: 'Impresión diagnóstica', ok: f('dx') },
        { sec: 'dx', t: 'Plan y conducta', ok: c('plan') || f('conducta') },
        { sec: 'dx', t: 'Signos de alarma explicados al paciente', ok: hcChips('plan').includes('Signos de alarma explicados'), crit: true },
        { sec: 'dx', t: 'Médico responsable, registro y fecha', ok: f('medico') && f('fh') }
    ];
    if (fem && !ped && yrs && age >= 10 && age <= 50) L.push({ sec: 'gineco', t: 'FUM y posibilidad de embarazo', ok: f('fum'), crit: true });
    if (ped) L.push({ sec: 'ped', t: 'Vacunación', ok: f('vac') }, { sec: 'ped', t: 'Alimentación / lactancia', ok: f('lact') }, { sec: 'ped', t: 'Desarrollo psicomotor', ok: f('des') });
    if (ges) L.push({ sec: 'gest', t: 'Controles prenatales', ok: f('cpn') }, { sec: 'gest', t: 'Grupo sanguíneo y Rh', ok: f('gs') }, { sec: 'gest', t: 'Signos de alarma obstétrica', ok: c('alarm'), crit: true });
    return L;
}

function hcAside() {
    const checks = hcChecks();
    const ok = checks.filter(x => x.ok).length;
    const pct = checks.length ? Math.round(ok * 100 / checks.length) : 0;
    document.getElementById('hc-progress-bar').style.width = pct + '%';
    document.getElementById('hc-progress-txt').textContent = `${pct}% · ${ok}/${checks.length}`;
    const pend = checks.filter(x => !x.ok).sort((a, b) => (b.crit ? 1 : 0) - (a.crit ? 1 : 0));
    document.getElementById('hc-pending').innerHTML = pend.length
        ? pend.map(x => `<button type="button" onclick="hcGo('${x.sec}')" class="w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-[11px] ${x.crit ? 'font-bold text-rose-700 dark:text-rose-300' : 'text-slate-600 dark:text-slate-300'}"><i class="fa-solid ${x.crit ? 'fa-triangle-exclamation' : 'fa-circle'} mt-0.5 text-[9px] ${x.crit ? '' : 'text-slate-300 dark:text-slate-600'}"></i><span>${x.t}</span></button>`).join('')
        : '<div class="text-xs font-bold text-emerald-600 dark:text-emerald-400 p-2"><i class="fa-solid fa-circle-check mr-1"></i>Historia completa. Buen trabajo.</div>';

    const txt = (hcGet('dx') + ' ' + hcGet('motivo') + ' ' + hcGet('ana')).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const sivi = /dengue|tuberculosis|\btb\b|sifilis|\bvih\b|intoxicaci|violencia|maltrato|malaria|chagas|leishmania|varicela|sarampion|tos ferina|meningitis|rabia|mordedura|leptospirosis|zika|chikungunya|hepatitis/.test(txt);
    document.getElementById('hc-sivi-alert')?.classList.toggle('hidden', !sivi);

    HC_FORM.forEach(s => {
        const b = document.getElementById('hc-step-' + s.id); if (!b) return;
        const mine = checks.filter(x => x.sec === s.id);
        const done = mine.length > 0 && mine.every(x => x.ok);
        const hidden = b.classList.contains('hidden');
        b.className = 'shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ' + (done ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300') + (hidden ? ' hidden' : '');
    });
}

/* ---------- Construcción de la historia ---------- */
function hcBuild() {
    const L = [], add = t => L.push(t ?? ''), H = t => { add(''); add(t.toUpperCase()); };
    const g = hcGet, ch = hcChips;
    const eg = hcEG(), sx = g('sexo');
    const pobL = { adulto: '', pediatrico: ' · PEDIÁTRICA', gestante: ' · GESTANTE' }[HC.pob];

    add(`HISTORIA CLÍNICA — ${(g('ambito') || 'Urgencias').toUpperCase()}${pobL}`);
    if (g('fh')) add(`Fecha y hora: ${g('fh').replace('T', ' ')}`);

    H('Identificación');
    const idl = [['Nombre', g('nombre')], ['Documento', g('doc')], ['Edad', g('edad') ? `${g('edad')} ${g('edadu')}` : ''], ['Sexo', sx], ['EPS', g('eps')], ['Ocupación', g('ocup')], ['Procedencia', g('proc')], ['Acompañante/Responsable', g('resp')], ['Fuente', g('fuente')]]
        .filter(x => x[1]).map(x => `${x[0]}: ${x[1]}`);
    add(idl.join(' | ') || '—');

    H('Motivo de consulta'); add(g('motivo') || '[PENDIENTE]');

    H('Enfermedad actual');
    const who = sx === 'Femenino' ? 'femenina' : sx === 'Masculino' ? 'masculino' : '';
    const pa = g('edad') ? `Paciente ${who} de ${g('edad')} ${g('edadu')}`.replace(/\s+/g, ' ') : 'Paciente';
    let p = `${pa}${HC.pob === 'gestante' && eg ? `, gestante de ${eg.sem}+${eg.d} semanas por FUR` : ''}, con cuadro clínico${g('evol') ? ` de ${g('evol')} de evolución` : ''}`;
    p += g('narr') ? ` consistente en: ${g('narr')}${/[.!?]$/.test(g('narr')) ? '' : '.'}` : '.';
    add(p);
    [['Aparición', g('ap')], ['Localización', g('loc')], ['Intensidad', g('int') ? `EVA ${g('int')}/10` : ''], ['Carácter', ch('car').join(', ')], ['Irradiación', g('irr')],
     ['Atenuantes', g('ate')], ['Agravantes', g('agr')], ['Síntomas asociados', ch('aso').join(', ')], ['Manejo previo', g('prev')]]
        .filter(x => x[1]).forEach(x => add(`- ${x[0]}: ${x[1]}`));

    H('Revisión por sistemas');
    let any = false;
    HC_ROS.forEach(s => {
        const a = ch(s.k); if (!a.length) return; any = true;
        const neg = a.length === 1 && a[0] === 'Sin síntomas';
        add(`- ${s.l}: ${neg ? 'niega síntomas' : 'refiere ' + a.filter(x => x !== 'Sin síntomas').join(', ')}`);
    });
    if (!any) add('[PENDIENTE]');

    H('Antecedentes');
    add(`Alergias: ${ch('alerg').join(', ') || '[NO INTERROGADAS]'}`);
    add(`Medicamentos actuales: ${g('meds') || '[NO REGISTRADOS]'}`);
    [['Patológicos', ch('pat').join(', ')], ['Quirúrgicos / hospitalarios', g('qx')], ['Hábitos y exposiciones', ch('tox').join(', ')], ['Familiares', ch('fam').join(', ')], ['Inmunizaciones', HC.pob !== 'pediatrico' ? g('inm') : '']]
        .forEach(x => x[1] && add(`${x[0]}: ${x[1]}`));
    if (sx === 'Femenino' && HC.pob !== 'pediatrico') {
        const gi = [['G/P/A/C/V', g('gpac')], ['FUM', g('fum')], ['Ciclos', g('ciclos')], ['Planificación', g('planif')], ['Citología', g('cito')]].filter(x => x[1]).map(x => `${x[0]} ${x[1]}`);
        if (HC.pob === 'gestante' && eg) gi.push(`EG ${eg.sem}+${eg.d} sem`, `FPP ${eg.fpp}`);
        if (gi.length) add('Gineco-obstétricos: ' + gi.join(' | '));
    }
    if (HC.pob === 'gestante') {
        const ge = [['Controles prenatales', g('cpn')], ['Grupo y Rh', g('gs')], ['Movimientos fetales', g('mov')], ['Paraclínicos', g('labs')], ['Signos de alarma', ch('alarm').join(', ')]].filter(x => x[1]).map(x => `${x[0]}: ${x[1]}`);
        if (ge.length) add('Gestación actual: ' + ge.join(' | '));
    }
    if (HC.pob === 'pediatrico') {
        const pe = [['EG al nacer', g('eg')], ['Parto', g('parto')], ['Peso/talla al nacer', g('pn')], ['APGAR', g('apgar')], ['Complicaciones perinatales', g('perin')], ['Alimentación', g('lact')], ['Vacunación', g('vac')], ['Desarrollo', g('des')], ['PC', g('pc') ? g('pc') + ' cm' : '']].filter(x => x[1]).map(x => `${x[0]}: ${x[1]}`);
        if (pe.length) add('Pediátricos: ' + pe.join(' | '));
    }

    H('Signos vitales');
    const v = hcVitals(), vv = [];
    if (v.s != null && v.d != null) vv.push(`TA ${v.s}/${v.d} mmHg (PAM ${v.pam.toFixed(0)})`);
    if (v.fc != null) vv.push(`FC ${v.fc} lpm`);
    if (v.fr != null) vv.push(`FR ${v.fr} rpm`);
    if (v.t != null) vv.push(`T ${v.t} °C`);
    if (v.sat != null) vv.push(`SatO₂ ${v.sat}% (${g('o2').toLowerCase()})`);
    if (v.g != null) vv.push(`Glucometría ${v.g} mg/dL`);
    if (v.p != null) vv.push(`Peso ${v.p} kg`);
    if (v.h != null) vv.push(`Talla ${v.h} cm`);
    if (v.imc != null) vv.push(`IMC ${v.imc.toFixed(1)}`);
    add(vv.join(' | ') || '[PENDIENTE]');

    H('Tamizaje y riesgo');
    const tam = [
        ['Dolor EVA', g('eva')],
        ['Nutrición (MUST)', g('nutricion')],
        ['Caídas (Morse)', g('caidas')],
        ['TVP (Wells)', g('tvp')],
        ['Salud mental (PHQ-2)', g('mental')],
        ['Alcohol (AUDIT-C)', g('alcohol')],
        ['Tabaquismo', ch('tabaco').join(', ')],
        ['Úlcera por presión (Braden)', g('braden')],
        ['Funcional (Barthel)', g('barthel')],
        ['Conducta', ch('plan_tamizaje').join(', ')]
    ].filter(x => x[1]).map(x => `${x[0]}: ${x[1]}`);
    add(tam.join(' | ') || '[PENDIENTE]');

    H('Examen físico');
    let e = false;
    HC_EF.forEach(x => { if (g(x.k)) { e = true; add(`- ${x.l}: ${g(x.k)}`); } });
    if (!e) add('[PENDIENTE]');

    H('Análisis'); add(g('ana') || '[PENDIENTE]');
    H('Impresión diagnóstica'); add(g('dx') || '[PENDIENTE]');
    H('Plan y conducta');
    ch('plan').forEach(x => add(`- ${x}`));
    if (g('conducta')) add(g('conducta'));
    if (!ch('plan').length && !g('conducta')) add('[PENDIENTE]');

    add('');
    add(`Médico responsable: ${g('medico') || '[PENDIENTE]'}`);
    return L.join('\n');
}

/* ---------- Actualización general ---------- */
function hcApplyVis() {
    HC.vis.forEach(v => {
        const show = !!v.fn();
        v.ids.forEach(id => document.getElementById(id)?.classList.toggle('hidden', !show));
    });
}
function hcUpdate() {
    if (!document.getElementById('hc-form')?.children.length) return;
    hcApplyVis();
    hcVitalsUI();
    hcGestUI();
    hcAside();
    const out = document.getElementById('hc-output'); if (out) out.textContent = hcBuild();
}

/* ---------- Exportar ---------- */
function hcToast(m) {
    const b = document.getElementById('hc-copy-msg');
    if (b) { b.textContent = m; setTimeout(() => b.textContent = '', 2500); }
}
function hcFallbackCopy(t) {
    const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); hcToast('Historia copiada ✓'); } catch (e) { alert('No se pudo copiar. Selecciona el texto de la vista previa.'); }
    ta.remove();
}
function hcCopy() {
    const t = hcBuild();
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(() => hcToast('Historia copiada ✓')).catch(() => hcFallbackCopy(t));
    else hcFallbackCopy(t);
}
function hcFillPrint(title, text) {
    const root = document.getElementById('print-root');
    if (!root) return null;
    const date = new Date().toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' });
    root.innerHTML =
        '<div class="print-head"><strong>ADROOSIS</strong><span>' + hcEsc(title) + '</span></div>' +
        '<pre>' + hcEsc(text) + '</pre>' +
        '<div class="print-foot">Generado el ' + hcEsc(date) + ' · Documento clínico. Verifique los datos antes de usarlo.</div>';
    return root;
}
function hcPrint() {
    const root = hcFillPrint('Historia clínica', hcBuild());
    if (!root) return;
    let cleaned = false;
    const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        root.innerHTML = '';
        window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
    setTimeout(cleanup, 300000);
}
function hcShare() {
    const text = hcBuild();
    if (!navigator.share) { hcCopy(); return; }
    navigator.share({ title: 'Historia clínica - ADROOSIS', text: text })
        .then(() => hcToast('Historia compartida'))
        .catch((err) => {
            if (err && err.name === 'AbortError') return;
            hcCopy();
        });
}

/* ===== FAVORITOS ===== */
let favs = [];
try { favs = JSON.parse(localStorage.getItem('adroosis_favs') || '[]'); } catch (e) { favs = []; }
const favEsc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
function favSave() { try { localStorage.setItem('adroosis_favs', JSON.stringify(favs)); } catch (e) {} }
function isFav(key) { return favs.includes(key); }

function favStar(key) {
    const on = isFav(key);
    return `<button type="button" class="fav-btn shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-950/30 ${on ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}" data-fav="${favEsc(key)}" onclick="event.stopPropagation(); toggleFav(this.dataset.fav)" title="Guardar en Mis Favoritos"><i class="fa-${on ? 'solid' : 'regular'} fa-star text-sm"></i></button>`;
}

function toggleFav(key) {
    favs = isFav(key) ? favs.filter(k => k !== key) : [...favs, key];
    favSave();
    document.querySelectorAll('.fav-btn').forEach(b => {
        if (b.dataset.fav !== key) return;
        const on = isFav(key);
        b.querySelector('i').className = `fa-${on ? 'solid' : 'regular'} fa-star text-sm`;
        b.classList.toggle('text-amber-500', on);
        b.classList.toggle('text-slate-300', !on);
        b.classList.toggle('dark:text-slate-600', !on);
    });
    renderFavoritos();
}

function favOpenDrug(name) {
    switchTab('farmaco');
    document.querySelector('.vad-grp-btn')?.click();
    const s = document.getElementById('vademecum-search'); if (s) s.value = name;
    renderVademecum();
}

function renderFavoritos() {
    const box = document.getElementById('favoritos-container'); if (!box) return;
    const btnCls = 'mt-2 px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold';
    const cards = favs.map(key => {
        const i = key.indexOf(':'), type = key.slice(0, i), id = key.slice(i + 1);
        let icon, tone, title, sub, btn;
        if (type === 'calc') {
            const c = (window.calcsData || []).find(x => x.id === id); if (!c) return '';
            icon = 'fa-calculator'; tone = 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400';
            title = c.title; sub = c.desc;
            btn = `<button type="button" onclick="openCalc('${c.id}')" class="${btnCls}">Abrir</button>`;
        } else if (type === 'drug') {
            const d = vademecumData.find(x => x.name === id); if (!d) return '';
            icon = 'fa-pills'; tone = 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400';
            title = d.name; sub = `${d.group} · ${(d.indicaciones || []).join(', ')}`;
            btn = `<button type="button" data-n="${favEsc(d.name)}" onclick="favOpenDrug(this.dataset.n)" class="${btnCls}">Ver ficha</button>`;
        } else return '';
        return `
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-3">
            <span class="shrink-0 w-9 h-9 rounded-xl ${tone} flex items-center justify-center"><i class="fa-solid ${icon}"></i></span>
            <div class="min-w-0 flex-1">
                <h4 class="font-bold text-sm text-slate-900 dark:text-white">${favEsc(title)}</h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">${favEsc(sub)}</p>
                ${btn}
            </div>
            ${favStar(key)}
        </div>`;
    }).filter(Boolean);
    box.innerHTML = cards.length ? cards.join('')
        : '<p class="text-xs text-slate-400 col-span-full">Aún no has guardado ninguna herramienta en tus favoritos. Haz clic en la estrella ★ de cualquier escala o fármaco para anclarla aquí.</p>';
}


function calcFramingham() {
    const getValue = id => document.getElementById(id)?.value;

    const age = Number(getValue('fr-edad'));
    const tc = Number(getValue('fr-ct'));
    const hdl = Number(getValue('fr-hdl'));
    const sbp = Number(getValue('fr-pas'));

    const sex = getValue('fr-sexo');
    const trat = getValue('fr-trat');
    const smokeValue = getValue('fr-fuma');
    const dmValue = getValue('fr-dm');
    const ecv = getValue('fr-ecv');

    const resEl = document.getElementById('fr-res');
    if (!resEl) return;

    resEl.classList.add('hidden');
    resEl.innerHTML = '';

    // Validación de edad
    if (!Number.isInteger(age) || age < 30 || age > 74) {
        alert('Framingham 2008 solo está validado para edades de 30 a 74 años.');
        return;
    }

    // Validación de sexo
    if (!['F', 'M'].includes(sex)) {
        alert('Seleccione el sexo del paciente.');
        return;
    }

    // Validación del perfil lipídico
    if (!Number.isFinite(tc) || tc < 80 || tc > 400) {
        alert('Ingrese un colesterol total válido entre 80 y 400 mg/dL.');
        return;
    }

    if (!Number.isFinite(hdl) || hdl < 10 || hdl > 120) {
        alert('Ingrese un HDL válido entre 10 y 120 mg/dL.');
        return;
    }

    if (hdl >= tc) {
        alert('El HDL no puede ser igual o superior al colesterol total. Verifique el perfil lipídico.');
        return;
    }

    // Validación de presión arterial
    if (!Number.isFinite(sbp) || sbp < 70 || sbp > 250) {
        alert('Ingrese una presión arterial sistólica válida entre 70 y 250 mmHg.');
        return;
    }

    // Validación de variables categóricas
    if (!['0', '1'].includes(trat)) {
        alert('Indique si recibe tratamiento antihipertensivo.');
        return;
    }

    if (!['0', '1'].includes(smokeValue)) {
        alert('Indique si el paciente fuma actualmente.');
        return;
    }

    if (!['0', '1'].includes(dmValue)) {
        alert('Indique si tiene diabetes mellitus.');
        return;
    }

    if (!['0', '1'].includes(ecv)) {
        alert('Indique si existe enfermedad cardiovascular establecida.');
        return;
    }

    // Framingham estima riesgo de primer evento cardiovascular.
    // No corresponde aplicarlo como prevención primaria si ya existe ECV.
    if (ecv === '1') {
        resEl.innerHTML = `
            <div class="font-bold text-amber-600">
                No calcular mediante Framingham.
            </div>
            <p class="text-xs font-normal mt-1">
                El paciente presenta enfermedad cardiovascular establecida.
                Esta calculadora estima riesgo de primer evento en prevención primaria.
                Requiere evaluación y manejo de prevención secundaria.
            </p>
        `;
        resEl.classList.remove('hidden');
        return;
    }

    const fem = sex === 'F';
    const treated = trat === '1';
    const smoke = Number(smokeValue);
    const dm = Number(dmValue);

    // D'Agostino et al. Circulation 2008.
    // Ecuación original de riesgo cardiovascular global.
    const k = fem
        ? {
            age: 2.32888,
            tc: 1.20904,
            hdl: -0.70833,
            sbp: treated ? 2.82263 : 2.76157,
            sm: 0.52873,
            dm: 0.69154,
            mean: 26.1931,
            s0: 0.95012
        }
        : {
            age: 3.06117,
            tc: 1.12370,
            hdl: -0.93263,
            sbp: treated ? 1.99881 : 1.93303,
            sm: 0.65451,
            dm: 0.57367,
            mean: 23.9802,
            s0: 0.88936
        };

    const sum =
        k.age * Math.log(age) +
        k.tc * Math.log(tc) +
        k.hdl * Math.log(hdl) +
        k.sbp * Math.log(sbp) +
        k.sm * smoke +
        k.dm * dm;

    const risk = (1 - Math.pow(k.s0, Math.exp(sum - k.mean))) * 100;

    if (!Number.isFinite(risk) || risk < 0 || risk > 100) {
        alert('No fue posible calcular el riesgo. Verifique los datos ingresados.');
        return;
    }

    let category;
    let color;
    let interpretation;

    if (risk < 10) {
        category = 'Bajo (<10%)';
        color = 'text-emerald-600';
        interpretation = 'Riesgo estimado bajo según las categorías descriptivas utilizadas en esta calculadora.';
    } else if (risk < 20) {
        category = 'Intermedio (10 a <20%)';
        color = 'text-amber-600';
        interpretation = 'Riesgo estimado intermedio. Requiere valoración integral de los factores de riesgo.';
    } else {
        category = 'Alto (≥20%)';
        color = 'text-rose-600';
        interpretation = 'Riesgo estimado alto. Requiere valoración clínica integral y manejo de factores de riesgo.';
    }

    resEl.innerHTML = `
        <div class="text-[11px] text-slate-500 font-semibold">
            FRAMINGHAM 2008 · PREVENCIÓN PRIMARIA
        </div>

        <div class="text-lg font-bold ${color}">
            Riesgo cardiovascular a 10 años: ${risk.toFixed(1)}%
        </div>

        <div class="font-bold ${color}">
            ${category}
        </div>

        <p class="text-xs font-normal mt-1">
            ${interpretation}
        </p>

        <div class="border-t border-slate-300 dark:border-slate-700 pt-2 mt-2 text-[11px] font-normal">
            <strong>Variables evaluadas:</strong>
            edad, sexo, colesterol total, HDL, presión sistólica,
            tratamiento antihipertensivo, tabaquismo y diabetes.
        </div>

        <div class="border-t border-slate-300 dark:border-slate-700 pt-2 mt-2 text-[11px] text-amber-600 font-normal">
            <strong>Limitaciones:</strong>
            modelo original de Framingham 2008, no recalibrado para Colombia.
            La guía colombiana actual recomienda SCORE2-PURE como herramienta principal
            y no recomienda Framingham como primera línea.
            No utilizar este porcentaje de forma aislada para decidir tratamientos.
        </div>
    `;

    resEl.classList.remove('hidden');
}


function calcLawton() {
    const campos = [...document.querySelectorAll('.lw-sel')];
    const resEl = document.getElementById('lawton-res');

    if (!resEl) return;

    if (campos.length !== 8) {
        resEl.innerHTML = '<span class="text-rose-600">Error: no se encontraron los ocho dominios de Lawton-Brody.</span>';
        resEl.classList.remove('hidden');
        return;
    }

    if (campos.some(el => el.value === '')) {
        resEl.innerHTML = '<span class="text-rose-600">Completa las ocho actividades antes de calcular. Puedes seleccionar «No evaluable» cuando corresponda.</span>';
        resEl.classList.remove('hidden');
        return;
    }

    const evaluables = campos.filter(el => el.value !== 'na');
    const noEvaluables = campos.length - evaluables.length;

    if (evaluables.length === 0) {
        resEl.innerHTML = '<span class="text-amber-600">No hay actividades evaluables. No es posible obtener un puntaje.</span>';
        resEl.classList.remove('hidden');
        return;
    }

    const puntos = evaluables.filter(el => el.value === '1').length;
    const total = evaluables.length;

    let interpretacion = '';

    if (noEvaluables > 0) {
        interpretacion = `
            <div class="mt-1 text-amber-600 font-normal">
                Hay ${noEvaluables} actividad(es) no evaluable(s). El resultado no equivale al puntaje estándar completo de 8 dominios.
            </div>
        `;
    } else if (puntos === 8) {
        interpretacion = `
            <div class="mt-1 font-normal">
                Cumple los criterios de puntuación en los ocho dominios evaluados.
            </div>
        `;
    } else {
        interpretacion = `
            <div class="mt-1 font-normal">
                Se identifican una o más actividades con limitación funcional. Revisa cada dominio individualmente.
            </div>
        `;
    }

    resEl.innerHTML = `
        <strong class="text-indigo-600">
            Lawton-Brody: ${puntos} / ${total} puntos
        </strong>
        ${interpretacion}
        <div class="mt-1 text-[11px] font-normal text-slate-500 dark:text-slate-400">
            Evalúa actividades instrumentales; no diagnostica demencia ni determina por sí sola la causa de la dependencia.
        </div>
    `;

    resEl.classList.remove('hidden');
}


function calcPfeffer() {
    const selects = [...document.querySelectorAll('.pf-sel')];
    const resEl = document.getElementById('pfeffer-res');

    if (!resEl) return;

    if (selects.length !== 10 || selects.some(el =>
        !['0', '1', '2', '3'].includes(el.value)
    )) {
        alert('Debes responder las 10 actividades del cuestionario.');
        return;
    }

    const total = selects.reduce((s, el) =>
        s + Number(el.value), 0
    );

    const alteracion = total >= 6;

    resEl.innerHTML = `
        <div class="font-bold text-sm">
            Pfeffer (FAQ):
            <strong class="text-indigo-600">${total}/30 puntos</strong>
        </div>

        <div class="font-bold">
            ${alteracion
                ? 'Tamizaje positivo: posible alteración funcional significativa.'
                : 'Por debajo del umbral de tamizaje de alteración funcional.'}
        </div>

        <div class="text-[11px] font-normal text-slate-500">
            Umbral utilizado: ≥6 puntos. Un resultado positivo requiere
            valoración cognitiva y funcional integral. No establece por sí
            solo diagnóstico de deterioro cognitivo leve ni demencia.
        </div>

        <div class="text-[11px] font-normal text-amber-700 dark:text-amber-400">
            Antes de atribuir la dificultad a deterioro cognitivo, considerar
            limitaciones motoras, visuales, auditivas, enfermedades agudas,
            factores sociales y si el paciente realizaba previamente
            esas actividades.
        </div>
    `;

    resEl.classList.remove('hidden');
}

/* =====================================================================
   ALGORITMOS · motor interactivo + primeros 3 algoritmos
   ===================================================================== */
const ALG = { cur: null, path: [], pob: 'adulto', peso: '', fArea: 'all', fPob: 'all' };
const POB_L = { adulto: 'Adulto', pediatrico: 'Pediátrico', gestante: 'Gestante' };
const algEsc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const algPick = (v, pob) => (v && typeof v === 'object' && !Array.isArray(v) && ('adulto' in v || 'pediatrico' in v)) ? (v[pob] ?? v.adulto ?? v.pediatrico) : v;
const fmtN = d => d >= 100 ? Math.round(d) : (d >= 10 ? +d.toFixed(1) : +d.toFixed(2));

// Dosis por mg/kg con tope
const dMgKg = (n, mgkg, max, nota) => ({ n, nota, f: kg => {
    let d = kg * mgkg, t = '';
    if (max != null && d > max) { d = max; t = ' (dosis máxima)'; }
    return `${fmtN(d)} mg${t}`;
}});

// Adrenalina IM (1 mg/mL: mg = mL). Tope según edad.

const ALG_DATA = [
{
    id: 'anafilaxia', titulo: 'Anafilaxia', area: 'Urgencias', pob: ['adulto', 'pediatrico'], peso: true,
    fuente: { t: 'WAO 2020 · parámetros prácticos de anafilaxia 2020', url: 'https://waojournal.biomedcentral.com/articles/10.1097/WOX.0b013e318211496c/tables/5' },
    revisado: '1 nov 2026',
    alcance: 'Adrenalina IM (dosis, tope y repetición), líquidos, tratamientos adyuvantes y observación. El glucagón y la infusión de adrenalina IV provienen de fuentes secundarias.',
    kw: 'anafilaxia reaccion alergica adrenalina epinefrina urticaria angioedema picadura alergia shock anafilactico estridor',
    nodos: {
        inicio: { tipo: 'q', corto: 'Reconocer anafilaxia',
            t: '¿Inicio agudo (minutos a pocas horas) tras un posible alérgeno, con alguna de estas combinaciones?',
            det: ['Piel o mucosas (urticaria, prurito, angioedema) MÁS dificultad respiratoria (sibilancias, estridor, disnea, hipoxemia) o hipotensión / mala perfusión',
                  'Dos o más de: piel/mucosas, respiratorio, hipotensión, síntomas digestivos persistentes (vómito, dolor cólico)',
                  'Hipotensión aislada tras exposición a un alérgeno conocido para ese paciente'],
            opts: [{ t: 'Sí, cumple al menos una', to: 'adrenalina' },
                   { t: 'Dudoso, pero hay compromiso respiratorio o circulatorio', to: 'adrenalina' },
                   { t: 'No: solo síntomas cutáneos aislados', to: 'local' }] },
        local: { tipo: 'fin', tono: 'warn', corto: 'Reacción localizada',
            t: 'Reacción alérgica localizada (sin criterios de anafilaxia)',
            det: ['Retira el alérgeno y trata los síntomas cutáneos con un antihistamínico oral de segunda generación',
                  'Explica los signos de alarma: dificultad para respirar, hinchazón de lengua o garganta, mareo o desmayo, vómito repetido',
                  'Si aparece cualquiera de ellos: adrenalina IM y consulta urgente (vuelve a este algoritmo)'],
            links: [{ l: 'Ver Loratadina', drug: 'Loratadina' }] },
        adrenalina: { tipo: 'act', corto: 'Adrenalina IM',
            t: 'Aplica adrenalina IM AHORA. No esperes el acceso venoso ni los exámenes.',
            det: {
                adulto: ['Cara anterolateral del muslo (tercio medio), solución 1 mg/mL (1:1000)',
                         'Dosis: 0.01 mg/kg, máximo 0.5 mg. Sin peso conocido: 0.5 mg IM',
                         'Anota la hora de cada dosis',
                         'En paralelo: pide ayuda, acuesta al paciente con las piernas elevadas (no lo sientes ni lo pongas de pie de golpe), retira el alérgeno y da oxígeno si hay dificultad respiratoria'],
                pediatrico: ['Cara anterolateral del muslo (tercio medio), solución 1 mg/mL (1:1000)',
                         'Dosis: 0.01 mg/kg; máximo 0.3 mg en niños prepúberes (0.5 mg en adolescentes)',
                         'Sin balanza (dosis fijas orientativas): 0.1 mg si pesa 7.5-15 kg, 0.15 mg si 15-30 kg, 0.3 mg si ≥ 30 kg, 0.5 mg si es adolescente ≥ 50 kg',
                         'Anota la hora de cada dosis',
                         'En paralelo: pide ayuda, acuesta al niño con las piernas elevadas, retira el alérgeno y da oxígeno si hay dificultad respiratoria'] },
            dosis: [DOSIS_ADRE],
            links: [{ l: 'Ver Adrenalina en el vademécum', drug: 'Adrenalina (Epinefrina)' }],
            sig: 'reeval' },
        reeval: { tipo: 'q', corto: 'Reevaluar a los 5 min',
            t: 'A los 5 minutos: ¿mejoraron la respiración y la presión?',
            opts: [{ t: 'Mejoró y está estable', to: 'estable' },
                   { t: 'Persisten síntomas o empeora', to: 'repetir' }] },
        repetir: { tipo: 'act', corto: 'Repetir y escalar',
            t: 'Repite la adrenalina IM cada 5-15 minutos mientras persistan los síntomas y escala el soporte',
            det: ['Misma dosis que la primera; no hay una dosis acumulada máxima si se necesita repetir',
                  'Acceso IV/IO y bolo de cristaloide (ver dosis); repite según respuesta',
                  'Broncoespasmo: salbutamol nebulizado 2.5-5 mg (no reemplaza la adrenalina)',
                  'Si toma betabloqueadores y no responde: glucagón 1-5 mg IV lento (adultos)',
                  'Estridor o edema de vía aérea progresivo: asegura la vía aérea de forma temprana (puede requerir vía aérea quirúrgica)'],
            dosis: [DOSIS_ADRE,
                { n: 'Bolo de cristaloide (SSN 0.9% o Ringer)', nota: 'Adulto: 5-10 mL/kg en los primeros 5-10 min. Niño: 10 mL/kg.',
                  f: (kg, pob) => pob === 'pediatrico' ? `${Math.round(10 * kg)} mL` : `${Math.round(5 * kg)} - ${Math.round(10 * kg)} mL` }],
            links: [{ l: 'Ver Salbutamol', drug: 'Salbutamol (Albuterol)' }],
            opts: [{ t: 'Mejoró', to: 'estable' },
                   { t: 'Persiste tras 3 dosis de adrenalina IM', to: 'remitir' }] },
        remitir: { tipo: 'fin', tono: 'crit', corto: 'Refractaria',
            t: 'Anafilaxia refractaria: remisión urgente a UCI',
            det: ['Infusión de adrenalina IV solo con monitoreo continuo (iniciar cerca de 0.1 mcg/kg/min y titular a la respuesta)',
                  'Continúa los líquidos y agrega vasopresor según disponibilidad',
                  'Durante el traslado: oxígeno, adrenalina IM repetida si no hay infusión y vía aérea asegurada si hay compromiso',
                  'Entrega al receptor la hora y el número de dosis de adrenalina'],
            links: [{ l: 'Calculadora de infusión (vademécum)', tab: 'farmaco' }] },
        estable: { tipo: 'fin', tono: 'ok', corto: 'Observación y salida',
            t: 'Paciente estabilizado: observación y plan de salida',
            det: ['Observa hasta que los síntomas se resuelvan por completo; más tiempo si la reacción fue grave o necesitó más de una dosis (riesgo de reacción bifásica). La práctica común es al menos 4-6 horas, con evidencia limitada',
                  'Antihistamínicos y corticoides no son tratamiento de primera línea ni previenen la reacción bifásica: úsalos solo para síntomas cutáneos',
                  'Antes de la salida: explica los signos de alarma y entrega un plan de acción por escrito',
                  'Si está disponible, prescribe autoinyector de adrenalina (0.15 mg para 15-30 kg; 0.3 mg para ≥ 30 kg) y remite a alergología',
                  'Investiga el desencadenante y evita la reexposición'] }
    }
},
{
    id: 'estatus', titulo: 'Estado epiléptico (convulsión activa)', area: 'Neurología', pob: ['adulto', 'pediatrico'], peso: true,
    fuente: { t: 'Guía AES 2016 · estado epiléptico convulsivo', url: 'https://renaissance.stonybrookmedicine.edu/sites/default/files/CSE%20Treatment%20chart-final_rerelease.pdf' },
    revisado: '1 nov 2026',
    alcance: 'Benzodiacepinas de primera línea, segunda línea y tiempos según AES 2016, y glucemia según guía pediátrica canadiense. La dosis de midazolam en < 13 kg no es de AES y la fenitoína tiene una discrepancia documentada entre la ficha y las guías.',
    kw: 'estado epileptico convulsion crisis status epilepticus midazolam diazepam lorazepam levetiracetam valproato fosfenitoina fenitoina convulsionando',
    nodos: {
        inicio: { tipo: 'q', corto: 'Convulsión activa',
            t: '¿Convulsión activa por 5 minutos o más, o crisis repetidas sin recuperar la conciencia entre ellas?',
            opts: [{ t: 'Sí', to: 'estab' }, { t: 'No: la crisis ya terminó', to: 'post' }] },
        post: { tipo: 'fin', tono: 'warn', corto: 'Crisis resuelta',
            t: 'Crisis ya resuelta: cuidado post-ictal y búsqueda de la causa',
            det: ['Posición lateral de seguridad, vía aérea, oxígeno y signos vitales',
                  'Glucemia capilar',
                  'Busca la causa: trauma, fiebre, intoxicación, hipoglucemia, alteración del sodio, embarazo (eclampsia)',
                  'Observa hasta la recuperación completa; remite si es una primera crisis, no recupera la conciencia, hay lesión o foco neurológico'] },
        estab: { tipo: 'act', corto: 'Estabilizar',
            t: 'Estabiliza mientras preparas el tratamiento (primeros 5 minutos)',
            det: ['Vía aérea, oxígeno y posición lateral; aspira secreciones; no pongas nada en la boca',
                  'Monitoreo (SatO₂, pulso, PA) y acceso IV/IO',
                  'Glucemia capilar inmediata, pero NO retrases la benzodiacepina esperando el resultado',
                  'Mujer embarazada o en posparto con hipertensión: trátala como eclampsia con sulfato de magnesio'],
            links: [{ l: 'Ver Sulfato de magnesio', drug: 'Sulfato de magnesio' }],
            sig: 'gluc' },
        gluc: { tipo: 'q', corto: 'Glucemia',
            t: '¿La glucemia capilar es menor de 60 mg/dL?',
            opts: [{ t: 'Sí: hipoglucemia', to: 'hipo' }, { t: 'No, o no tengo glucómetro', to: 'benzo' }] },
        hipo: { tipo: 'act', corto: 'Tratar hipoglucemia',
            t: 'Corrige la hipoglucemia',
            det: { adulto: ['Dextrosa al 50%: 25 g (50 mL) IV', 'Si sospechas alcoholismo o desnutrición, da tiamina antes o junto con la glucosa'],
                   pediatrico: ['Dextrosa al 10%: 5 mL/kg IV (0.5 g/kg) en 5-10 minutos', 'Recién nacidos: dextrosa al 10%, 2 mL/kg'] },
            links: [{ l: 'Ver Dextrosa', drug: 'Dextrosa (hipoglucemia)' }],
            sig: 'benzo' },
        benzo: { tipo: 'act', corto: 'Benzodiacepina',
            t: 'Da UNA benzodiacepina ahora (las tres opciones son equivalentes)',
            det: ['Midazolam IM: la opción más práctica si no hay vía IV',
                  'Lorazepam IV: 0.1 mg/kg (máx 4 mg), repetible una vez, si está disponible',
                  'Diazepam IV: 0.15-0.2 mg/kg (máx 10 mg), repetible una vez a los 5 minutos',
                  'Sin vía IV ni IM: diazepam rectal 0.2-0.5 mg/kg (máx 20 mg) o midazolam intranasal / bucal',
                  'Vigila la depresión respiratoria y ten bolsa-mascarilla lista'],
            dosis: [
                { n: 'Midazolam IM (o intranasal)', nota: 'AES 2016: 10 mg si pesa más de 40 kg; 5 mg si pesa 13-40 kg. En menos de 13 kg se muestra 0.2 mg/kg (esquema pediátrico canadiense, no es de AES).',
                  f: kg => kg > 40 ? '10 mg' : kg >= 13 ? '5 mg' : `${fmtN(0.2 * kg)} mg (0.2 mg/kg)` },
                { n: 'Diazepam IV lento', nota: 'Máximo 5 mg/min. Repetible una vez.',
                  f: kg => `${fmtN(Math.min(0.15 * kg, 10))} - ${fmtN(Math.min(0.2 * kg, 10))} mg (máx 10 mg)` },
                dMgKg('Lorazepam IV', 0.1, 4, 'Velocidad máxima 2 mg/min. Repetible una vez a los 5-10 min.')
            ],
            links: [{ l: 'Ver Midazolam', drug: 'Midazolam' }, { l: 'Ver Diazepam', drug: 'Diazepam' }],
            opts: [{ t: 'La convulsión cesó', to: 'cesa' }, { t: 'Sigue convulsionando', to: 'segunda' }] },
        cesa: { tipo: 'fin', tono: 'ok', corto: 'Controlada',
            t: 'Convulsión controlada',
            det: ['Vigila la respiración y el nivel de conciencia (riesgo de depresión respiratoria)',
                  'Si las crisis recurren o hay epilepsia conocida, la decisión de iniciar o ajustar un anticonvulsivante de mantenimiento se toma con neurología',
                  'Busca y trata la causa; remite a un centro con laboratorio y neuroimagen',
                  'Eclampsia sospechada: sulfato de magnesio'] },
        segunda: { tipo: 'act', corto: 'Segunda línea',
            t: 'Si persiste a los 5-20 minutos sin respuesta: dosis ÚNICA de UNO de estos fármacos',
            det: ['Levetiracetam 60 mg/kg IV (máx 4500 mg)',
                  'Fosfenitoína 20 mg PE/kg IV (máx 1500 mg PE)',
                  'Valproato 40 mg/kg IV (máx 3000 mg); evítalo en embarazo y en mujeres en edad fértil si hay alternativa',
                  'Fenitoína IV es la alternativa si no hay fosfenitoína: consulta la ficha del vademécum (hay discrepancia entre la ficha FDA y las guías en la dosis de carga)',
                  'Las tres primeras tuvieron eficacia similar (≈ 45-47% de cese) en el estudio ESETT'],
            dosis: [dMgKg('Levetiracetam IV', 60, 4500, 'Infusión en 5-10 minutos.'),
                    dMgKg('Fosfenitoína IV (mg de equivalentes de fenitoína, PE)', 20, 1500, 'Velocidad hasta 150 mg PE/min.'),
                    dMgKg('Valproato IV', 40, 3000, 'Infusión en unos 10 minutos.')],
            links: [{ l: 'Ver Levetiracetam', drug: 'Levetiracetam' }, { l: 'Ver Valproato', drug: 'Ácido valproico (Valproato)' }, { l: 'Ver Fenitoína', drug: 'Fenitoína' }],
            opts: [{ t: 'La convulsión cesó', to: 'cesa' }, { t: 'Persiste más de 40 minutos', to: 'refrac' }] },
        refrac: { tipo: 'fin', tono: 'crit', corto: 'Refractario',
            t: 'Estado epiléptico refractario: UCI',
            det: ['Remisión urgente a un centro con UCI y EEG continuo',
                  'Requiere anestésicos en infusión (midazolam, propofol, ketamina o barbitúricos) con ventilación mecánica',
                  'Mientras tanto: soporte de vía aérea, ventilación y presión arterial; busca causas tratables (glucosa, sodio, tóxicos, infección del SNC, eclampsia)',
                  'Si hay fiebre y sospecha de meningitis: antibiótico sin demora (Infectología → Meningitis bacteriana aguda)'],
            links: [{ l: 'Ir a Infectología', tab: 'infectologia' }] }
    }
},
{
    id: 'deshidratacion', titulo: 'Diarrea aguda y deshidratación del niño (Planes A, B y C)', area: 'Pediatría', pob: ['pediatrico'], peso: true,
    fuente: { t: 'Planes de rehidratación de la OMS · guías MSF e IAP', url: 'https://medicalguidelines.msf.org/en/viewport/mme/english/appendix-14-plan-rehydration-who-32408338.html' },
    revisado: '1 nov 2026',
    alcance: 'Volúmenes y tiempos de los Planes A, B y C, zinc y desnutrición grave. La lista de signos de deshidratación (AIEPI) sigue el estándar de la OMS y no se re-verificó en este lote.',
    kw: 'diarrea deshidratacion nino pediatria suero oral SRO plan A plan B plan C ringer lactato zinc AIEPI gastroenteritis',
    nodos: {
        inicio: { tipo: 'q', corto: 'Descartar gravedad',
            t: '¿Es menor de 2 meses, tiene desnutrición aguda grave, vómito biliar, distensión importante o sospecha de abdomen quirúrgico?',
            opts: [{ t: 'Sí', to: 'remitir' }, { t: 'No', to: 'eval' }] },
        remitir: { tipo: 'fin', tono: 'crit', corto: 'Manejo especializado',
            t: 'Requiere valoración y manejo especializado: remite',
            det: ['La desnutrición aguda grave se rehidrata con un esquema distinto (ReSoMal o SRO diluida con potasio y glucosa): NO uses los planes estándar',
                  'Lactante menor de 2 meses con diarrea: valoración pediátrica urgente',
                  'Mientras se traslada: SRO en sorbos pequeños y frecuentes si puede beber; continúa la lactancia'] },
        eval: { tipo: 'q', corto: 'Deshidratación grave',
            t: '¿Tiene DOS O MÁS de estos signos?',
            det: ['Letárgico o inconsciente', 'Ojos hundidos', 'No puede beber o bebe mal', 'El pliegue cutáneo vuelve muy lentamente (más de 2 segundos)'],
            opts: [{ t: 'Sí: deshidratación GRAVE', to: 'c' }, { t: 'No', to: 'eval2' }] },
        eval2: { tipo: 'q', corto: 'Algún grado de deshidratación',
            t: '¿Tiene DOS O MÁS de estos signos?',
            det: ['Inquieto o irritable', 'Ojos hundidos', 'Bebe ávidamente, con sed', 'El pliegue cutáneo vuelve lentamente'],
            opts: [{ t: 'Sí: ALGÚN grado de deshidratación', to: 'b' }, { t: 'No: sin deshidratación', to: 'a' }] },
        a: { tipo: 'fin', tono: 'ok', corto: 'Plan A',
            t: 'Plan A: tratamiento en casa',
            det: ['Más líquidos: SRO después de cada deposición líquida. Menor de 2 años: 50-100 mL; 2-10 años: 100-200 mL; mayor: a voluntad',
                  'Continúa la lactancia y la alimentación habitual',
                  'Zinc: 10 mg/día si es menor de 6 meses; 20 mg/día si tiene 6 meses o más, por 10-14 días',
                  'Sangre en las heces (disentería) o sospecha de cólera: requiere antibiótico y control (Infectología → Diarrea aguda infecciosa)',
                  'Signos de alarma para volver: no puede beber, empeora, fiebre alta, sangre en las heces, vómito persistente o sed intensa'],
            links: [{ l: 'Ver SRO', drug: 'Sales de rehidratación oral (SRO)' }, { l: 'Ver Zinc', drug: 'Zinc (suplemento en diarrea)' }, { l: 'Diarrea aguda infecciosa', tab: 'infectologia' }] },
        b: { tipo: 'act', corto: 'Plan B',
            t: 'Plan B: rehidratación oral supervisada en el servicio de salud',
            det: ['SRO de baja osmolaridad: 75 mL/kg en 4 horas',
                  'Si vomita: espera 5-10 minutos y reinicia más despacio. Si el vómito impide la SRO, el ondansetrón en dosis única puede ayudar',
                  'Continúa la lactancia; no des otros alimentos durante las primeras 4 horas',
                  'Reevalúa a las 4 horas: sin signos → Plan A; sin cambios → repite el Plan B; empeora → Plan C'],
            dosis: [{ n: 'SRO en 4 horas (Plan B)', nota: 'Volumen aproximado: peso en kg × 75 mL.',
                      f: kg => `${Math.round(75 * kg)} mL en 4 h (≈ ${Math.round(75 * kg / 4)} mL/h)` }],
            links: [{ l: 'Ver SRO', drug: 'Sales de rehidratación oral (SRO)' }, { l: 'Ver Ondansetrón', drug: 'Ondansetrón' }],
            opts: [{ t: 'Reevaluación: sin deshidratación', to: 'a' }, { t: 'Sigue con algún grado de deshidratación', to: 'b' }, { t: 'Progresó a deshidratación grave', to: 'c' }] },
        c: { tipo: 'act', corto: 'Plan C',
            t: 'Plan C: deshidratación grave. Líquidos IV YA',
            det: ['Lactato de Ringer 100 mL/kg (si no hay: solución salina 0.9%; NUNCA solo dextrosa al 5%)',
                  'Menor de 12 meses: 30 mL/kg en 1 hora y luego 70 mL/kg en 5 horas',
                  '12 meses o más: 30 mL/kg en 30 minutos y luego 70 mL/kg en 2.5 horas',
                  'Repite los 30 mL/kg si el pulso radial sigue débil o ausente',
                  'Reevalúa cada 15-30 minutos y da SRO (5 mL/kg/h) apenas pueda beber',
                  'Sin acceso IV/IO: SRO por sonda nasogástrica a 20 mL/kg/h por 6 horas',
                  'Reevalúa a las 6 horas (lactantes) o 3 horas (mayores) y elige el plan que corresponda'],
            dosis: [{ n: 'Lactato de Ringer (Plan C)', nota: 'Primero 30 mL/kg; luego 70 mL/kg.',
                      f: kg => `Menor de 12 meses: ${Math.round(30 * kg)} mL en 1 h y ${Math.round(70 * kg)} mL en 5 h · 12 meses o más: ${Math.round(30 * kg)} mL en 30 min y ${Math.round(70 * kg)} mL en 2.5 h` }],
            opts: [{ t: 'Rehidratado: continúa con Plan B / A', to: 'b' }, { t: 'Persiste grave o hay choque', to: 'remitir_c' }] },
        remitir_c: { tipo: 'fin', tono: 'crit', corto: 'No responde',
            t: 'No responde al Plan C: remite',
            det: ['Si persiste la deshidratación grave tras el ciclo de líquidos o hay choque, remite a un centro con cuidados intensivos pediátricos',
                  'Considera sepsis o choque séptico si no corrige con líquidos (el esquema de líquidos cambia)',
                  'Durante el traslado: continúa los líquidos y la SRO'] }
    }
},
{
    id: 'sepsis', titulo: 'Sepsis y choque séptico', area: 'Urgencias', pob: ['adulto', 'pediatrico'], peso: true,
    fuente: { t: 'Surviving Sepsis Campaign 2026 · IDSA', url: 'https://www.sccm.org/clinical-resources/guidelines/guidelines/surviving-sepsis-campaign-international-guidelines-for-management-of-sepsis-and-septic-shock-2026' },
    revisado: '26 nov 2026',
    alcance: 'Reconocimiento (qSOFA/SOFA), reanimación inicial, antibióticos empíricos, vasopresores y metas de perfusión.',
    kw: 'sepsis choque septico qsofa sofa lactato antibiotico vasopresor noradrenalina perfusion infeccion',
    nodos: {
        inicio: { tipo: 'q', corto: 'Reconocer sepsis',
            t: '¿Hay sospecha de infección con disfunción orgánica (qSOFA ≥ 2 o SOFA ≥ 2)?',
            det: ['qSOFA: FR ≥ 22, alteración del estado mental (Glasgow < 15), PAS ≤ 100 mmHg',
                  'SOFA: cambios en respiración, coagulación, hígado, cardiovascular, SNC, riñón',
                  'Signos de hipoperfusión: lactato > 2 mmol/L, oliguria, mala perfusión capilar, alteración del estado mental'],
            opts: [{ t: 'Sí: sepsis', to: 'reanimar' },
                   { t: 'Sepsis probable con choque (hipotensión refractaria a líquidos)', to: 'choque' },
                   { t: 'No: infección sin disfunción orgánica', to: 'infeccion' }] },
        infeccion: { tipo: 'fin', tono: 'ok', corto: 'Infección sin sepsis',
            t: 'Infección sin disfunción orgánica: manejo estándar',
            det: ['Trata la infección según el foco (ver guías por síndrome)',
                  'Reevalúa si aparecen signos de sepsis (qSOFA, lactato)',
                  'Antibiótico empírico según el foco y la resistencia local'] },
        reanimar: { tipo: 'act', corto: 'Reanimación inicial',
            t: 'Reanimación dirigida por metas en las primeras 3 horas',
            det: ['Obtén hemocultivos (2 pares) y urocultivo ANTES del antibiótico si no retrasa el tratamiento',
                  'Antibiótico IV de amplio espectro en ≤ 1 hora (ver antibiograma)',
                  'Bolo de cristaloide: al menos 30 mL/kg en las primeras 3 h si hay hipoperfusión o choque (usar peso ajustado si IMC > 30)',
                  'Meta inicial: PAM > 65 mmHg (en > 65 años se sugiere 60-65)',
                  'Mide lactato; si > 2 mmol/L, repite a las 2-4 h',
                  'Reevalúa la respuesta a los líquidos (presión, lactato, perfusión capilar)'],
            dosis: [{ n: 'Bolo de cristaloide (SSN 0.9% o Ringer)', nota: 'Adulto: 30 mL/kg en las primeras 3 h. Niño: 20 mL/kg en bolo.',
                      f: (kg, pob) => pob === 'pediatrico' ? `${Math.round(20 * kg)} mL` : `${Math.round(30 * kg)} mL` }],
            opts: [{ t: 'Estabilizado (PAM > 65, lactato en descenso)', to: 'estable' },
                   { t: 'Persiste hipotensión tras líquidos', to: 'choque' }] },
        choque: { tipo: 'act', corto: 'Choque séptico',
            t: 'Choque séptico: inicia vasopresor y escala el soporte',
            det: ['Noradrenalina es el vasopresor de primera línea (iniciar si PAM < 65 a pesar de líquidos)',
                  'Meta: PAM > 65 mmHg',
                  'Infusión prolongada de betalactámicos (recomendación fuerte tras la dosis de carga)',
                  'Desescalar el antibiótico cuando se conozca el germen y la sensibilidad',
                  'Si no hay respuesta a noradrenalina: agregar vasopresina o adrenalina',
                  'Considera hidrocortisona 200 mg/día si hay choque refractario',
                  'Monitoreo continuo: PA invasiva, lactato, diuresis (meta > 0.5 mL/kg/h)'],
            dosis: [{ n: 'Noradrenalina', nota: '0.05 - 1.0 mcg/kg/min IV en infusión continua. Titular a PAM > 65.',
                      f: (kg, pob) => `Iniciar 0.05 mcg/kg/min = ${Math.round(0.05 * kg * 60)} mcg/h` }],
            opts: [{ t: 'Estabilizado', to: 'estable' },
                   { t: 'Deterioro progresivo', to: 'uci' }] },
        uci: { tipo: 'fin', tono: 'crit', corto: 'Remisión a UCI',
            t: 'Sepsis refractaria: remisión urgente a UCI',
            det: ['Ventilación mecánica si hay falla respiratoria',
                  'Terapia de reemplazo renal si hay falla renal',
                  'Monitoreo hemodinámico invasivo',
                  'Considera ECMO en casos refractarios',
                  'Entrega al receptor: hora de inicio de antibióticos, dosis de vasopresor, balance hídrico'] },
        estable: { tipo: 'fin', tono: 'ok', corto: 'Estabilizado',
            t: 'Paciente estabilizado: continuar manejo y reevaluar',
            det: ['Continúa el antibiótico según el foco y la sensibilidad',
                  'Reevalúa cada 24 h: desescalar si es posible',
                  'Duración: 7 días en pacientes con resolución clínica completa y fuente controlada',
                  'No se recomienda urocultivo de control post-tratamiento en asintomáticos',
                  'Profilaxis de TVP y úlceras por presión',
                  'Nutrición enteral temprana si es posible'] }
    }
},
{
    id: 'paro', titulo: 'Paro cardiorrespiratorio (ACLS)', area: 'Urgencias', pob: ['adulto', 'pediatrico'], peso: true,
    fuente: { t: 'AHA 2025 · ACLS Guidelines', url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines' },
    revisado: '26 nov 2026',
    alcance: 'Reconocimiento del paro, RCP, desfibrilación, adrenalina, amiodarona y causas reversibles (4H 4T).',
    kw: 'paro cardiorrespiratorio acls rcp desfibrilacion adrenalina amiodarona h y t reanimacion',
    nodos: {
        inicio: { tipo: 'q', corto: 'Reconocer paro',
            t: '¿El paciente no responde, no respira (o solo jadeos) y no tiene pulso carotídeo?',
            det: ['Verifica seguridad de la escena',
                  'Activa el código de paro y pide el desfibrilador',
                  'Inicia RCP inmediatamente: compresiones 100-120/min, profundidad 5-6 cm en adultos',
                  'Relación 30:2 si no hay vía aérea avanzada; continuas si hay vía aérea avanzada'],
            opts: [{ t: 'Sí: paro cardíaco', to: 'ritmo' },
                   { t: 'No: paciente con pulso', to: 'con_pulso' }] },
        con_pulso: { tipo: 'fin', tono: 'ok', corto: 'Con pulso',
            t: 'Paciente con pulso: evaluar y tratar la causa',
            det: ['Evalúa vía aérea, respiración y circulación',
                  'Busca la causa de la inestabilidad',
                  'Monitoriza continuamente'] },
        ritmo: { tipo: 'q', corto: 'Identificar ritmo',
            t: '¿Qué ritmo muestra el monitor?',
            det: ['FV / TV sin pulso: desfibrilable',
                  'Asistolia / AESP: no desfibrilable',
                  'Verifica el ritmo en 2 derivaciones'],
            opts: [{ t: 'FV o TV sin pulso', to: 'desfib' },
                   { t: 'Asistolia', to: 'asistolia' },
                   { t: 'AESP', to: 'aesps' }] },
        desfib: { tipo: 'act', corto: 'Desfibrilar',
            t: 'Desfibrila y continúa RCP',
            det: ['Desfibrilación bifásica: 120-200 J (o según el fabricante)',
                  'Monofásica: 360 J',
                  'RCP inmediata tras el choque (2 min)',
                  'Adrenalina 1 mg IV/IO cada 3-5 min',
                  'Amiodarona 300 mg IV/IO en el primer choque, 150 mg en el segundo',
                  'Busca las causas reversibles (4H 4T)'],
            dosis: [{ n: 'Adrenalina', nota: '1 mg IV/IO cada 3-5 min.',
                      f: (kg, pob) => `1 mg IV/IO` },
                    { n: 'Amiodarona', nota: '300 mg IV/IO en el primer choque, 150 mg en el segundo.',
                      f: (kg, pob) => `300 mg IV/IO` }],
            opts: [{ t: 'ROSC (retorno de circulación)', to: 'rosc' },
                   { t: 'Persiste FV/TV', to: 'desfib' },
                   { t: 'Cambia a asistolia/AESP', to: 'asistolia' }] },
        asistolia: { tipo: 'act', corto: 'Asistolia',
            t: 'Asistolia: RCP continua y adrenalina',
            det: ['RCP de alta calidad continua',
                  'Adrenalina 1 mg IV/IO cada 3-5 min',
                  'Considera causas reversibles (4H 4T)',
                  'No desfibrilar',
                  'Verifica el ritmo cada 2 min'],
            dosis: [{ n: 'Adrenalina', nota: '1 mg IV/IO cada 3-5 min.',
                      f: (kg, pob) => `1 mg IV/IO` }],
            opts: [{ t: 'ROSC', to: 'rosc' },
                   { t: 'Persiste', to: 'asistolia' }] },
        aesps: { tipo: 'act', corto: 'AESP',
            t: 'AESP: RCP continua y buscar causa',
            det: ['RCP de alta calidad continua',
                  'Adrenalina 1 mg IV/IO cada 3-5 min',
                  'Busca y trata las causas reversibles (4H 4T) — esta es la clave en AESP',
                  'Verifica el ritmo cada 2 min'],
            dosis: [{ n: 'Adrenalina', nota: '1 mg IV/IO cada 3-5 min.',
                      f: (kg, pob) => `1 mg IV/IO` }],
            opts: [{ t: 'ROSC', to: 'rosc' },
                   { t: 'Persiste', to: 'aesps' }] },
        rosc: { tipo: 'fin', tono: 'ok', corto: 'ROSC',
            t: 'Retorno de circulación espontánea (ROSC)',
            det: ['Asegura vía aérea y ventilación',
                  'Mantén PAM > 65 mmHg (vasopresores si es necesario)',
                  'TC de cráneo y tórax',
                  'Causa del paro: evalúa y trata',
                  'Hipotermia dirigida: 32-36°C por 24 h si el paciente no responde',
                  'Monitoreo en UCI'] },
        causas: { tipo: 'fin', tono: 'warn', corto: '4H 4T',
            t: 'Causas reversibles del paro (4H 4T)',
            det: ['4H: Hipovolemia, Hipoxia, Hidrógeno (acidosis), Hiper/hipokalemia e hipotermia',
                  '4T: Tensión neumotórax, Taponamiento cardíaco, Tóxicos, Trombosis (coronaria o pulmonar)',
                  'Busca y trata la causa durante la RCP'] }
    }
},
{
    id: 'sca', titulo: 'Síndrome coronario agudo (SCA)', area: 'Urgencias', pob: ['adulto'], peso: false,
    fuente: { t: 'ESC 2023 · Guías de SCA', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Acute-Coronary-Syndromes' },
    revisado: '26 nov 2026',
    alcance: 'Reconocimiento, estratificación de riesgo, reperfusión y tratamiento inicial.',
    kw: 'sca sindrome coronario agudo iam infarto angina inestable st elevacion troponina reperfusion',
    nodos: {
        inicio: { tipo: 'q', corto: 'Reconocer SCA',
            t: '¿Dolor torácico agudo sugestivo de isquemia miocárdica?',
            det: ['Dolor opresivo retroesternal con irradiación a cuello, mandíbula, brazo izquierdo',
                  'Duración > 20 min, no cede con reposo ni nitroglicerina',
                  'Síntomas acompañantes: diaforesis, náuseas, disnea, síncope'],
            opts: [{ t: 'Sí: sospecha de SCA', to: 'ecg' },
                   { t: 'No: dolor no isquémico', to: 'no_sca' }] },
        no_sca: { tipo: 'fin', tono: 'ok', corto: 'No es SCA',
            t: 'Dolor no isquémico: evaluar otras causas',
            det: ['Considera: pericarditis, disección aórtica, TEP, neumotórax, esofagitis, musculoesquelético',
                  'ECG y troponina si hay duda'] },
        ecg: { tipo: 'q', corto: 'ECG',
            t: '¿El ECG muestra elevación del ST (STEMI)?',
            det: ['STEMI: elevación del ST ≥ 1 mm en 2 derivaciones contiguas (o ≥ 2 mm en V2-V3)',
                  'NSTEMI/angina inestable: sin elevación del ST, pero con cambios en ST/T o troponina elevada',
                  'Realiza ECG en los primeros 10 min del contacto'],
            opts: [{ t: 'Sí: STEMI', to: 'stemi' },
                   { t: 'No: NSTEMI / angina inestable', to: 'nstemi' }] },
        stemi: { tipo: 'act', corto: 'STEMI: reperfusión',
            t: 'STEMI: reperfusión urgente',
            det: ['ICP primaria en ≤ 120 min del primer contacto médico (si está disponible en ≤ 120 min)',
                  'Si ICP no disponible en ≤ 120 min: fibrinólisis en ≤ 30 min (si no hay contraindicaciones)',
                  'Aspirina 150-300 mg (masticar) + clopidogrel 300-600 mg (o ticagrelor 180 mg)',
                  'Anticoagulación: heparina no fraccionada o enoxaparina',
                  'Nitroglicerina si hay dolor (evitar si PAS < 90 o RV infarto)',
                  'Morfina si el dolor persiste',
                  'Oxígeno solo si SatO₂ < 90%'],
            links: [{ l: 'Ver Aspirina', drug: 'Ácido acetilsalicílico (Aspirina)' },
                    { l: 'Ver Clopidogrel', drug: 'Clopidogrel' }],
            opts: [{ t: 'Reperfundido', to: 'post' }] },
        nstemi: { tipo: 'act', corto: 'NSTEMI: estratificar riesgo',
            t: 'NSTEMI / angina inestable: estratificar riesgo y tratar',
            det: ['Estratificación: GRACE score, troponina, cambios en ECG',
                  'Alto riesgo: coronariografía en ≤ 24 h',
                  'Bajo riesgo: tratamiento médico y coronariografía electiva',
                  'Aspirina + clopidogrel/ticagrelor + heparina',
                  'Nitroglicerina, betabloqueador, estatina de alta intensidad',
                  'Observación y reevaluación'],
            links: [{ l: 'Ver Aspirina', drug: 'Ácido acetilsalicílico (Aspirina)' }],
            opts: [{ t: 'Estabilizado', to: 'post' }] },
        post: { tipo: 'fin', tono: 'ok', corto: 'Post-reperfusión',
            t: 'Post-reperfusión: monitorización y tratamiento',
            det: ['Monitoreo en UCI/intermedios',
                  'Doble antiagregación por 12 meses (ajustar según sangrado)',
                  'Estatina de alta intensidad (atorvastatina 40-80 mg)',
                  'Betabloqueador, IECA/ARA II si hay disfunción VI',
                  'Rehabilitación cardíaca',
                  'Control de factores de riesgo (HTA, DM, dislipidemia, tabaquismo)'] }
    }
},
{
    id: 'tep', titulo: 'Tromboembolismo pulmonar (TEP)', area: 'Urgencias', pob: ['adulto'], peso: true,
    fuente: { t: 'ESC 2019 · Guías de TEP', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Acute-Pulmonary-Embolism' },
    revisado: '26 nov 2026',
    alcance: 'Estratificación de riesgo, anticoagulación y trombólisis.',
    kw: 'tep tromboembolismo pulmonar embolia pulmonar wells score d dimero anticoagulacion trombolisis',
    nodos: {
        inicio: { tipo: 'q', corto: 'Sospechar TEP',
            t: '¿Hay sospecha de TEP (disnea súbita, dolor pleurítico, taquipnea, síncope, hemoptisis)?',
            det: ['Factores de riesgo: inmovilización, cirugía reciente, cáncer, TVP previa, embarazo, ACO',
                  'Signos: taquipnea, taquicardia, hipotensión, SatO₂ baja, signos de TVP'],
            opts: [{ t: 'Sí: sospecha de TEP', to: 'wells' },
                   { t: 'No: otra causa', to: 'no_tep' }] },
        no_tep: { tipo: 'fin', tono: 'ok', corto: 'No es TEP',
            t: 'Buscar otra causa de los síntomas',
            det: ['NAC, neumotórax, pericarditis, insuficiencia cardíaca, ansiedad'] },
        wells: { tipo: 'q', corto: 'Wells para TEP',
            t: '¿El score de Wells para TEP es > 4 (probabilidad alta)?',
            det: ['Wells: TVP (3), TEP más probable que alternativa (3), FC > 100 (1.5), inmovilización/cirugía (1.5), hemoptisis (1), cáncer (1)',
                  'Si Wells ≤ 4: probabilidad baja/intermedia → D-dímero',
                  'Si Wells > 4: probabilidad alta → angio-TC de tórax'],
            opts: [{ t: 'Wells > 4 (alta probabilidad)', to: 'angio' },
                   { t: 'Wells ≤ 4 (baja/intermedia)', to: 'ddimero' }] },
        ddimero: { tipo: 'q', corto: 'D-dímero',
            t: '¿El D-dímero es positivo (> 500 ng/mL o ajustado por edad)?',
            det: ['D-dímero negativo excluye TEP en probabilidad baja/intermedia',
                  'D-dímero positivo: realizar angio-TC de tórax'],
            opts: [{ t: 'Positivo', to: 'angio' },
                   { t: 'Negativo', to: 'excluido' }] },
        excluido: { tipo: 'fin', tono: 'ok', corto: 'TEP excluido',
            t: 'TEP excluido: buscar otra causa',
            det: ['Considera NAC, neumotórax, insuficiencia cardíaca, ansiedad'] },
        angio: { tipo: 'q', corto: 'Angio-TC de tórax',
            t: '¿La angio-TC confirma TEP?',
            det: ['Angio-TC de tórax con contraste es el estándar diagnóstico',
                  'Si no es posible: gammagrafía V/Q o ecocardiograma (si hay inestabilidad)'],
            opts: [{ t: 'Sí: TEP confirmado', to: 'riesgo' },
                   { t: 'No: TEP excluido', to: 'excluido' }] },
        riesgo: { tipo: 'q', corto: 'Estratificar riesgo',
            t: '¿El paciente está hemodinámicamente inestable (PAS < 90 o caída > 40 mmHg)?',
            det: ['Alto riesgo (masivo): hipotensión o shock',
                  'Intermedio (submasivo): normotenso con disfunción VD o troponina elevada',
                  'Bajo riesgo: normotenso sin disfunción VD'],
            opts: [{ t: 'Inestable (alto riesgo)', to: 'trombolisis' },
                   { t: 'Estable (intermedio/bajo)', to: 'anticoag' }] },
        trombolisis: { tipo: 'act', corto: 'Trombólisis',
            t: 'TEP masivo: trombólisis sistémica',
            det: ['Alteplasa 100 mg IV en 2 h (o 0.6 mg/kg en 15 min, máx 50 mg)',
                  'Si hay contraindicación: embolectomía quirúrgica o percutánea',
                  'Anticoagulación después de la trombólisis',
                  'Soporte hemodinámico: noradrenalina, líquidos'],
            dosis: [{ n: 'Alteplasa', nota: '100 mg IV en 2 h (o 0.6 mg/kg en 15 min, máx 50 mg).',
                      f: (kg, pob) => `${Math.min(50, Math.round(0.6 * kg))} mg IV en 15 min` }],
            opts: [{ t: 'Estabilizado', to: 'anticoag' }] },
        anticoag: { tipo: 'fin', tono: 'ok', corto: 'Anticoagulación',
            t: 'Anticoagulación y manejo',
            det: ['Heparina no fraccionada (bolo + infusión) o enoxaparina 1 mg/kg c/12h',
                  'Warfarina o DOAC (rivaroxabán, apixabán, edoxabán, dabigatrán) para mantenimiento',
                  'Duración: 3 meses mínimo; indefinida si hay cáncer o recurrencia',
                  'Si hay contraindicación a anticoagulación: filtro de vena cava inferior',
                  'Buscar la causa (TVP, cáncer, trombofilia)'] }
    }
},
{
    id: 'cetoacidosis', titulo: 'Cetoacidosis diabética (CAD)', area: 'Urgencias', pob: ['adulto', 'pediatrico'], peso: true,
    fuente: { t: 'ADA 2024 · Consenso de CAD', url: 'https://diabetesjournals.org/care/article/47/Supplement_1/S158/153954' },
    revisado: '26 nov 2026',
    alcance: 'Reconocimiento, líquidos, insulina, potasio y bicarbonato.',
    kw: 'cetoacidosis diabetica cad dka hiperglucemia cetosis acidosis insulina potasio bicarbonato',
    nodos: {
        inicio: { tipo: 'q', corto: 'Reconocer CAD',
            t: '¿Hay hiperglucemia (> 250 mg/dL) + cetosis + acidosis metabólica (pH < 7.3 o HCO₃ < 18)?',
            det: ['Síntomas: poliuria, polidipsia, náuseas, vómito, dolor abdominal, respiración de Kussmaul',
                  'Signos: deshidratación, taquipnea, aliento cetónico',
                  'Factores precipitantes: infección, omisión de insulina, debut de DM, IAM, ACV'],
            opts: [{ t: 'Sí: CAD', to: 'reanimar' },
                   { t: 'No: otra causa', to: 'no_cad' }] },
        no_cad: { tipo: 'fin', tono: 'ok', corto: 'No es CAD',
            t: 'Buscar otra causa de la acidosis/cetosis',
            det: ['Considera: acidosis láctica, intoxicación, sepsis, HHS (estado hiperosmolar)'] },
        reanimar: { tipo: 'act', corto: 'Reanimación y líquidos',
            t: 'Reanimación inicial: líquidos y electrolitos',
            det: ['Bolo de SSN 0.9%: 1 L/h en la primera hora (o 15-20 mL/kg/h)',
                  'Si PAS < 90 mmHg: bolo de 1 L en 15-30 min, repetir si es necesario',
                  'Evalúa potasio: si K⁺ < 3.3, da KCl 20-30 mEq/h IV ANTES de la insulina',
                  'Si K⁺ 3.3-5.2: da KCl 20-30 mEq/L en la infusión',
                  'Si K⁺ > 5.2: no dar potasio, reevaluar',
                  'No dar bicarbonato a menos que pH < 6.9'],
            dosis: [{ n: 'Bolo de SSN 0.9%', nota: '1 L/h en la primera hora (o 15-20 mL/kg/h).',
                      f: (kg, pob) => `${Math.round(15 * kg)} - ${Math.round(20 * kg)} mL/h` },
                    { n: 'Potasio (KCl)', nota: 'Si K⁺ < 3.3: 20-30 mEq/h IV. Si K⁺ 3.3-5.2: 20-30 mEq/L en infusión.',
                      f: (kg, pob) => `20 - 30 mEq/h IV` }],
            opts: [{ t: 'Líquidos iniciados', to: 'insulina' }] },
        insulina: { tipo: 'act', corto: 'Insulina IV',
            t: 'Insulina regular IV en infusión continua',
            det: ['Bolo de insulina regular: 0.1 UI/kg IV (opcional, si no se dio bolo de líquidos)',
                  'Infusión: 0.1 UI/kg/h (o 0.14 UI/kg/h sin bolo)',
                  'Meta: descenso de glucosa de 50-75 mg/dL/h',
                  'Si la glucosa no baja en la primera hora: duplicar la infusión',
                  'Cuando la glucosa llegue a 200-250 mg/dL: reducir a 0.02-0.05 UI/kg/h y agregar dextrosa',
                  'No suspender la insulina hasta que el anión gap se normalice'],
            dosis: [{ n: 'Insulina regular', nota: 'Bolo 0.1 UI/kg IV + infusión 0.1 UI/kg/h.',
                      f: (kg, pob) => `Bolo: ${Math.round(0.1 * kg * 10) / 10} UI IV; infusión: ${Math.round(0.1 * kg * 10) / 10} UI/h` }],
            opts: [{ t: 'Glucosa en descenso, gap cerrando', to: 'transicion' },
                   { t: 'No mejora en 1-2 h', to: 'reanimar' }] },
        transicion: { tipo: 'fin', tono: 'ok', corto: 'Transición a SC',
            t: 'Transición a insulina subcutánea',
            det: ['Cuando el anión gap se normalice y el paciente tolere vía oral',
                  'Dar insulina basal (NPH o glargina) 2 h antes de suspender la infusión',
                  'Calcular la dosis basal: 0.5-0.8 UI/kg/día (ajustar según la infusión requerida)',
                  'Agregar insulina prandial si come',
                  'Monitorear glucemia cada 4-6 h',
                  'Buscar y tratar la causa precipitante'] }
    }
},
{
    id: 'asma', titulo: 'Crisis asmática', area: 'Urgencias', pob: ['adulto', 'pediatrico'], peso: true,
    fuente: { t: 'GINA 2024 · Guía de asma', url: 'https://ginasthma.org/2024-gina-report-global-strategy-for-asthma-management-and-prevention/' },
    revisado: '26 nov 2026',
    alcance: 'Evaluación de gravedad, tratamiento inicial, criterios de hospitalización.',
    kw: 'asma crisis broncoespasmo salbutamol corticoide oxigeno wheezing disnea',
    nodos: {
        inicio: { tipo: 'q', corto: 'Evaluar gravedad',
            t: '¿Cuál es la gravedad de la crisis?',
            det: ['Leve: disnea solo con esfuerzo, puede hablar, FR < 20, FC < 100, SatO₂ > 95%',
                  'Moderada: disnea en reposo, habla en frases, FR 20-30, FC 100-120, SatO₂ 90-95%',
                  'Grave: disnea en reposo, habla en palabras, FR > 30, FC > 120, SatO₂ < 90%, uso de accesorios, sibilancias silenciosas',
                  'Amenaza vital: confusión, cianosis, bradicardia, silencio auscultatorio, PEF < 33%'],
            opts: [{ t: 'Leve', to: 'leve' },
                   { t: 'Moderada', to: 'moderada' },
                   { t: 'Grave', to: 'grave' },
                   { t: 'Amenaza vital', to: 'vital' }] },
        leve: { tipo: 'fin', tono: 'ok', corto: 'Crisis leve',
            t: 'Crisis leve: tratamiento ambulatorio',
            det: ['Salbutamol 2-4 puff con cámara espaciadora (o 2.5-5 mg nebulizado)',
                  'Repetir cada 20 min x 3 dosis',
                  'Prednisona 40-50 mg VO (o equivalente) si no mejora',
                  'Observar 1 h; si mejora, dar plan de acción y alta',
                  'Educar sobre el uso correcto del inhalador'] },
        moderada: { tipo: 'act', corto: 'Crisis moderada',
            t: 'Crisis moderada: tratamiento y observación',
            det: ['Salbutamol 4-10 puff con cámara (o 2.5-5 mg nebulizado) c/20 min',
                  'Ipratropio bromuro 0.5 mg nebulizado (si grave)',
                  'Prednisona 40-50 mg VO',
                  'Oxígeno si SatO₂ < 92%',
                  'Observar 1-2 h; reevaluar',
                  'Si no mejora en 1-2 h: escalar a grave'],
            opts: [{ t: 'Mejoró', to: 'alta' },
                   { t: 'No mejoró', to: 'grave' }] },
        grave: { tipo: 'act', corto: 'Crisis grave',
            t: 'Crisis grave: tratamiento intensivo',
            det: ['Oxígeno para mantener SatO₂ 93-95%',
                  'Salbutamol 2.5-5 mg nebulizado c/20 min (o continuo)',
                  'Ipratropio 0.5 mg nebulizado',
                  'Prednisona 50 mg VO o hidrocortisona 100-200 mg IV',
                  'Considera sulfato de magnesio 2 g IV en 20 min',
                  'Acceso IV, monitorización continua',
                  'Gasometría arterial si no mejora'],
            dosis: [{ n: 'Salbutamol', nota: '2.5-5 mg nebulizado c/20 min.',
                      f: (kg, pob) => pob === 'pediatrico' ? `2.5 mg nebulizado` : `5 mg nebulizado` },
                    { n: 'Sulfato de magnesio', nota: '2 g IV en 20 min.',
                      f: (kg, pob) => `2 g IV en 20 min` }],
            opts: [{ t: 'Mejoró', to: 'alta' },
                   { t: 'Amenaza vital', to: 'vital' },
                   { t: 'No mejoró', to: 'uci' }] },
        vital: { tipo: 'act', corto: 'Amenaza vital',
            t: 'Amenaza vital: UCI y ventilación',
            det: ['Ventilación mecánica si hay fatiga, confusión o silencio auscultatorio',
                  'Ketamina para sedación (broncodilatador)',
                  'Continuar salbutamol nebulizado + ipratropio',
                  'Hidrocortisona 200 mg IV',
                  'Sulfato de magnesio 2 g IV',
                  'Considera heliox si está disponible'],
            opts: [{ t: 'Estabilizado', to: 'uci' }] },
        uci: { tipo: 'fin', tono: 'crit', corto: 'UCI',
            t: 'Ingreso a UCI',
            det: ['Ventilación mecánica con estrategia protectora',
                  'Sedación y analgesia',
                  'Continuar broncodilatadores y corticoides',
                  'Monitoreo continuo'] },
        alta: { tipo: 'fin', tono: 'ok', corto: 'Alta',
            t: 'Alta: plan de acción y seguimiento',
            det: ['Plan de acción por escrito (qué hacer si empeora)',
                  'Ajuste del tratamiento de mantenimiento',
                  'Control en 1-2 días',
                  'Educar sobre el uso correcto del inhalador y la cámara',
                  'Identificar y evitar desencadenantes'] }
    }
},
{
    id: 'ictus', titulo: 'Código ictus (ACV agudo)', area: 'Urgencias', pob: ['adulto'], peso: false,
    fuente: { t: 'AHA/ASA 2026 · Guías de ACV agudo', url: 'https://www.heart.org/en/professional/quality-improvement/get-with-the-guidelines/get-with-the-guidelines-stroke' },
    revisado: '26 nov 2026',
    alcance: 'Reconocimiento (FAST), NIHSS, ventana trombolítica y trombectomía.',
    kw: 'ictus acv stroke codigo ictus nihss trombolisis alteplasa trombectomia',
    nodos: {
        inicio: { tipo: 'q', corto: 'Reconocer ictus',
            t: '¿Déficit neurológico focal de instauración súbita (FAST: Face, Arm, Speech, Time)?',
            det: ['Face: asimetría facial al sonreír',
                  'Arm: debilidad de un brazo (prueba de deriva)',
                  'Speech: disartria o afasia',
                  'Time: anotar hora de inicio (último bien visto)'],
            opts: [{ t: 'Sí: sospecha de ictus', to: 'evaluar' },
                   { t: 'No: otra causa', to: 'no_ictus' }] },
        no_ictus: { tipo: 'fin', tono: 'ok', corto: 'No es ictus',
            t: 'Buscar otra causa del déficit neurológico',
            det: ['Considera: hipoglucemia, convulsión, migraña, tumor, infección, deshidratación'] },
        evaluar: { tipo: 'act', corto: 'Evaluación inicial',
            t: 'Evaluación inicial y activación del código ictus',
            det: ['Activar código ictus (equipo de neurología, imagen, laboratorio)',
                  'NIHSS: evaluar gravedad (0-42) — ver módulo de Examen neurológico',
                  'Glucemia (descartar hipoglucemia)',
                  'PA: si > 185/110, tratar antes de trombólisis',
                  'TC de cráneo sin contraste urgente (descartar hemorragia)',
                  'Tiempo: puerta-aguja ≤ 60 min'],
            links: [{ l: 'Abrir NIHSS', tab: 'neurologico' }],
            opts: [{ t: 'TC sin hemorragia', to: 'trombolisis' },
                   { t: 'TC con hemorragia', to: 'hemorragico' }] },
        hemorragico: { tipo: 'fin', tono: 'crit', corto: 'Ictus hemorrágico',
            t: 'Ictus hemorrágico: manejo neuroquirúrgico',
            det: ['Revertir anticoagulación si está anticoagulado',
                  'Control de PA: meta PAS < 140 mmHg',
                  'Neurocirugía si hay hematoma con efecto de masa',
                  'UCI neurocrítica'] },
        trombolisis: { tipo: 'q', corto: 'Ventana trombolítica',
            t: '¿El paciente está dentro de la ventana de 4.5 horas del inicio de los síntomas?',
            det: ['Ventana estándar: ≤ 4.5 h del inicio (o del último bien visto)',
                  'Trombectomía mecánica: hasta 6 h (o 24 h con mismatch en perfusión)'],
            opts: [{ t: 'Sí: ≤ 4.5 h', to: 'trombolisis_act' },
                   { t: 'No: > 4.5 h', to: 'trombectomia' }] },
        trombolisis_act: { tipo: 'act', corto: 'Trombólisis IV',
            t: 'Alteplasa IV (trombólisis)',
            det: ['Alteplasa 0.9 mg/kg (máx 90 mg): 10% en bolo, 90% en infusión de 1 h',
                  'Contraindicaciones: hemorragia activa, cirugía mayor reciente, PA > 185/110, plaquetas < 100.000, INR > 1.7',
                  'Si NIHSS > 25 o edad > 80: considerar riesgo/beneficio',
                  'Monitoreo: PA cada 15 min x 2 h, luego cada 30 min x 6 h'],
            dosis: [{ n: 'Alteplasa', nota: '0.9 mg/kg (máx 90 mg): 10% bolo + 90% infusión 1 h.',
                      f: (kg, pob) => `Bolo: ${Math.round(0.09 * kg * 10) / 10} mg; infusión: ${Math.round(0.81 * kg * 10) / 10} mg` }],
            opts: [{ t: 'Trombolizado', to: 'post' }] },
        trombectomia: { tipo: 'act', corto: 'Trombectomía mecánica',
            t: 'Trombectomía mecánica (si hay oclusión de gran vaso)',
            det: ['Indicada en oclusión de arteria cerebral media (M1/M2) o carótida interna',
                  'Ventana: hasta 6 h del inicio (o 24 h con mismatch)',
                  'Requiere centro con neurointervencionismo',
                  'Puede combinarse con trombólisis si está en ventana'],
            opts: [{ t: 'Trombectomizado', to: 'post' }] },
        post: { tipo: 'fin', tono: 'ok', corto: 'Post-tratamiento',
            t: 'Post-tratamiento: monitorización y prevención',
            det: ['UCI/intermedios por 24 h',
                  'Control de PA: PAS < 180/105 en las primeras 24 h',
                  'Antiagregación: aspirina 100-300 mg (si no trombolizado) o doble antiagregación',
                  'Tromboprofilaxis: heparina de bajo peso molecular',
                  'Rehabilitación temprana',
                  'Buscar la causa (FA, aterosclerosis, foramen oval permeable)'] }
    }
},
{
    id: 'hemorragia_digestiva', titulo: 'Hemorragia digestiva (HDA/HDB)', area: 'Urgencias', pob: ['adulto'], peso: true,
    fuente: { t: 'AHA 2021 · Guías de hemorragia digestiva', url: 'https://www.ahajournals.org' },
    revisado: '26 nov 2026',
    alcance: 'Reconocimiento, reanimación, estratificación de riesgo y tratamiento.',
    kw: 'hemorragia digestiva hda hdb sangrado gastrointestinal melena hematemesis rectorragia',
    nodos: {
        inicio: { tipo: 'q', corto: 'Reconocer sangrado',
            t: '¿Hay sangrado del tubo digestivo (hematemesis, melena, rectorragia)?',
            det: ['HDA: hematemesis, melena, síncope, shock',
                  'HDB: rectorragia, hematoquecia',
                  'Evaluar: volumen estimado, signos de shock (TA, FC, perfusión)'],
            opts: [{ t: 'Sí: sangrado digestivo', to: 'reanimar' },
                   { t: 'No: otra causa', to: 'no_hd' }] },
        no_hd: { tipo: 'fin', tono: 'ok', corto: 'No es hemorragia digestiva',
            t: 'Buscar otra causa del sangrado',
            det: ['Considera: epistaxis tragada, hemoptisis, menstruación, hematuria'] },
        reanimar: { tipo: 'act', corto: 'Reanimación',
            t: 'Reanimación y estabilización',
            det: ['Acceso IV (2 vías gruesas), monitorización',
                  'Bolo de cristaloide si hay hipotensión o taquicardia',
                  'Transfusión si Hb < 7 g/dL (o < 8 en cardiopatía)',
                  'Sonda nasogástrica si hay hematemesis (confirmar HDA)',
                  'Protección de vía aérea si hay sangrado masivo'],
            dosis: [{ n: 'Bolo de cristaloide (SSN 0.9%)', nota: '500-1000 mL en bolo, repetir según respuesta.',
                      f: (kg, pob) => `${Math.round(10 * kg)} - ${Math.round(20 * kg)} mL` }],
            opts: [{ t: 'Estabilizado', to: 'estratificar' }] },
        estratificar: { tipo: 'q', corto: 'Estratificar riesgo',
            t: '¿Es HDA o HDB?',
            det: ['HDA: úlcera péptica (más común), varices, Mallory-Weiss, neoplasia',
                  'HDB: diverticulosis, angiodisplasia, neoplasia, colitis'],
            opts: [{ t: 'HDA (hematemesis/melena)', to: 'hda' },
                   { t: 'HDB (rectorragia)', to: 'hdb' }] },
        hda: { tipo: 'act', corto: 'HDA',
            t: 'Hemorragia digestiva alta',
            det: ['Endoscopia digestiva alta (EDA) en ≤ 24 h',
                  'Si hay varices: vasoconstrictor (terlipresina o somatostatina) + antibiótico (norfloxacino o ceftriaxona)',
                  'Si hay úlcera: IBP IV (omeprazol 80 mg bolo + 8 mg/h)',
                  'Si hay sangrado activo: hemostasia endoscópica',
                  'Escala de Glasgow-Blatchford para decidir ingreso'],
            dosis: [{ n: 'Omeprazol IV', nota: '80 mg bolo IV + 8 mg/h en infusión.',
                      f: (kg, pob) => `80 mg bolo IV + 8 mg/h` }],
            opts: [{ t: 'Estabilizado', to: 'post' }] },
        hdb: { tipo: 'act', corto: 'HDB',
            t: 'Hemorragia digestiva baja',
            det: ['Colonoscopia en ≤ 24 h (si está estable)',
                  'Si hay inestabilidad: angio-TC o arteriografía',
                  'Si hay diverticulosis: considera embolización',
                  'Transfusión según necesidad'],
            opts: [{ t: 'Estabilizado', to: 'post' }] },
        post: { tipo: 'fin', tono: 'ok', corto: 'Post-estabilización',
            t: 'Post-estabilización: manejo y seguimiento',
            det: ['Monitoreo en UCI/intermedios si fue grave',
                  'Reevaluar Hb a las 6-12 h',
                  'Tratamiento de la causa (erradicar H. pylori, beta-bloqueadores para varices)',
                  'Profilaxis de resangrado',
                  'Alta con seguimiento si está estable'] }
    }
},
{
    id: 'preeclampsia', titulo: 'Preeclampsia / Eclampsia', area: 'Urgencias', pob: ['adulto'], peso: true,
    fuente: { t: 'ACOG 2023 · Hipertensión en el embarazo', url: 'https://www.acog.org/clinical/clinical-guidance/practice-bulletin/articles/2020/06/gestational-hypertension-and-preeclampsia' },
    revisado: '26 nov 2026',
    alcance: 'Reconocimiento, sulfato de magnesio y control de PA.',
    kw: 'preeclampsia eclampsia sulfato magnesio hipertension embarazo convulsion',
    nodos: {
        inicio: { tipo: 'q', corto: 'Reconocer preeclampsia',
            t: '¿Gestante ≥ 20 semanas con HTA (PAS ≥ 140 o PAD ≥ 90) + proteinuria o signos de gravedad?',
            det: ['Signos de gravedad: PA ≥ 160/110, cefalea, alteración visual, epigastralgia, trombocitopenia, creatinina elevada, transaminasas elevadas, edema pulmonar',
                  'Eclampsia: convulsión en gestante con preeclampsia',
                  'HELLP: hemólisis, enzimas hepáticas elevadas, plaquetas bajas'],
            opts: [{ t: 'Preeclampsia sin gravedad', to: 'sin_gravedad' },
                   { t: 'Preeclampsia con gravedad', to: 'con_gravedad' },
                   { t: 'Eclampsia (convulsión)', to: 'eclampsia' }] },
        sin_gravedad: { tipo: 'fin', tono: 'ok', corto: 'Preeclampsia sin gravedad',
            t: 'Preeclampsia sin gravedad: manejo expectante',
            det: ['Reposo relativo, monitoreo de PA y proteinuria',
                  'Control de PA: labetalol, nifedipina o hidralazina',
                  'Seguimiento estrecho (2 veces/semana)',
                  'Parto a las 37 semanas o antes si hay deterioro'] },
        con_gravedad: { tipo: 'act', corto: 'Preeclampsia con gravedad',
            t: 'Preeclampsia con gravedad: sulfato de magnesio + control de PA',
            det: ['Sulfato de magnesio: bolo 4-6 g IV en 15-20 min + infusión 1-2 g/h',
                  'Control de PA: labetalol 20 mg IV (repetir hasta 80 mg) o hidralazina 5-10 mg IV',
                  'Meta: PAS 140-150, PAD 90-100 mmHg',
                  'Parto: inducir a las 34 semanas o antes si hay deterioro',
                  'Monitorear: reflejos, FR, diuresis (toxicidad del Mg)'],
            dosis: [{ n: 'Sulfato de magnesio', nota: 'Bolo 4-6 g IV en 15-20 min + infusión 1-2 g/h.',
                      f: (kg, pob) => `Bolo: 4-6 g IV; infusión: 1-2 g/h` }],
            opts: [{ t: 'Estabilizada', to: 'post' }] },
        eclampsia: { tipo: 'act', corto: 'Eclampsia',
            t: 'Eclampsia: control de la convulsión + sulfato de magnesio',
            det: ['Sulfato de magnesio: bolo 4-6 g IV en 15-20 min + infusión 1-2 g/h',
                  'Si la convulsión persiste: bolo adicional de 2 g IV',
                  'Proteger vía aérea, posición lateral, oxígeno',
                  'Control de PA: labetalol o hidralazina',
                  'Parto: después de estabilizar (urgente)',
                  'Antídoto de Mg: gluconato de calcio 1 g IV'],
            dosis: [{ n: 'Sulfato de magnesio', nota: 'Bolo 4-6 g IV en 15-20 min + infusión 1-2 g/h.',
                      f: (kg, pob) => `Bolo: 4-6 g IV; infusión: 1-2 g/h` }],
            opts: [{ t: 'Convulsión controlada', to: 'post' }] },
        post: { tipo: 'fin', tono: 'ok', corto: 'Post-estabilización',
            t: 'Post-estabilización: manejo y seguimiento',
            det: ['Monitoreo en UCI por 24-48 h',
                  'Continuar sulfato de magnesio por 24 h post-parto',
                  'Control de PA con labetalol o nifedipina',
                  'Vigilar complicaciones: HELLP, edema pulmonar, falla renal',
                  'Planificación familiar y seguimiento'] }
    }
},
{
    id: 'hemorragia_posparto', titulo: 'Hemorragia posparto (código rojo)', area: 'Urgencias', pob: ['adulto'], peso: true,
    fuente: { t: 'FIGO 2022 · Manejo de hemorragia posparto', url: 'https://www.figo.org' },
    revisado: '26 nov 2026',
    alcance: 'Reconocimiento, reanimación, uterotónicos y manejo quirúrgico.',
    kw: 'hemorragia posparto codigo rojo utero atonia oxitocina misoprostol tranexamico',
    nodos: {
        inicio: { tipo: 'q', corto: 'Reconocer hemorragia',
            t: '¿Sangrado vaginal > 500 mL (parto vaginal) o > 1000 mL (cesárea) en las primeras 24 h?',
            det: ['Signos: taquicardia, hipotensión, palidez, sangrado vaginal abundante',
                  'Causas (4T): Tono (atonía), Trauma (desgarros), Tejido (retención placentaria), Trombina (coagulopatía)'],
            opts: [{ t: 'Sí: hemorragia posparto', to: 'reanimar' },
                   { t: 'No: sangrado normal', to: 'normal' }] },
        normal: { tipo: 'fin', tono: 'ok', corto: 'Sangrado normal',
            t: 'Sangrado dentro de lo esperado',
            det: ['Continuar vigilancia post-parto',
                  'Control de signos vitales cada 15 min x 1 h, luego cada 30 min'] },
        reanimar: { tipo: 'act', corto: 'Reanimación y uterotónicos',
            t: 'Reanimación + uterotónicos de primera línea',
            det: ['Activar código rojo (equipo multidisciplinario)',
                  'Oxitocina 10 UI IV lento + infusión 20-40 UI en 1 L SSN',
                  'Masaje uterino bimanual',
                  'Vejiga vacía (sonda)',
                  'Líquidos IV y transfusión si es necesario',
                  'Evaluar causa (4T)'],
            dosis: [{ n: 'Oxitocina', nota: '10 UI IV lento + infusión 20-40 UI en 1 L SSN.',
                      f: (kg, pob) => `10 UI IV + infusión` }],
            opts: [{ t: 'Controlado', to: 'post' },
                   { t: 'Persiste (atonía)', to: 'segunda_linea' },
                   { t: 'Trauma (desgarro)', to: 'trauma' }] },
        segunda_linea: { tipo: 'act', corto: 'Segunda línea',
            t: 'Uterotónicos de segunda línea',
            det: ['Misoprostol 800-1000 mcg rectal o sublingual',
                  'Metilergonovina 0.2 mg IM (evitar en HTA)',
                  'Carboprost 250 mcg IM (evitar en asma)',
                  'Ácido tranexámico 1 g IV en 10 min (si sangrado > 1 h o cesárea)',
                  'Evaluar retención placentaria (extracción manual)'],
            dosis: [{ n: 'Ácido tranexámico', nota: '1 g IV en 10 min.',
                      f: (kg, pob) => `1 g IV en 10 min` }],
            opts: [{ t: 'Controlado', to: 'post' },
                   { t: 'Refractario', to: 'quirurgico' }] },
        trauma: { tipo: 'act', corto: 'Trauma',
            t: 'Reparación de desgarros',
            det: ['Inspeccionar cuello uterino, vagina y periné',
                  'Reparar desgarros con sutura',
                  'Evaluar hematoma (puede requerir drenaje)',
                  'Si hay desgarro cervical profundo: reparación en quirófano'],
            opts: [{ t: 'Reparado', to: 'post' }] },
        quirurgico: { tipo: 'fin', tono: 'crit', corto: 'Quirúrgico',
            t: 'Hemorragia refractaria: manejo quirúrgico',
            det: ['Compresión uterina (B-Lynch, suturas de Hayman)',
                  'Ligadura de arterias uterinas o hipogástricas',
                  'Balón de Bakri (taponamiento intrauterino)',
                  'Histerectomía como último recurso',
                  'Embolización arterial si está disponible'],
            links: [{ l: 'Calculadora de infusión', tab: 'farmaco' }] },
        post: { tipo: 'fin', tono: 'ok', corto: 'Post-estabilización',
            t: 'Post-estabilización: manejo y seguimiento',
            det: ['Monitoreo en UCI/intermedios',
                  'Transfusión según necesidad (Hb > 7-8 g/dL)',
                  'Hierro IV si hay anemia',
                  'Control de signos vitales cada 15 min x 2 h',
                  'Planificación familiar y seguimiento'] }
    }
},
{
    id: 'atls', titulo: 'ATLS básico (trauma)', area: 'Urgencias', pob: ['adulto', 'pediatrico'], peso: true,
    fuente: { t: 'ATLS 10th edition · ACS', url: 'https://www.facs.org/quality-programs/trauma/atls/' },
    revisado: '26 nov 2026',
    alcance: 'Evaluación primaria (ABCDE) y reanimación inicial del trauma.',
    kw: 'atls trauma abcde reanimacion via aerea respiracion circulacion discapacidad exposicion',
    nodos: {
        inicio: { tipo: 'q', corto: 'Evaluación primaria',
            t: '¿Hay trauma con riesgo vital? Inicia el ABCDE.',
            det: ['A (Airway): vía aérea permeable con protección cervical',
                  'B (Breathing): ventilación y oxigenación',
                  'C (Circulation): hemorragia y perfusión',
                  'D (Disability): estado neurológico (Glasgow)',
                  'E (Exposure): desvestir y examinar completamente'],
            opts: [{ t: 'Iniciar ABCDE', to: 'via_aerea' }] },
        via_aerea: { tipo: 'act', corto: 'A: Vía aérea',
            t: 'A: Vía aérea con protección cervical',
            det: ['Inmovilizar columna cervical (collarín + tabla)',
                  'Evaluar patencia: hablar, toser, respirar',
                  'Maniobra frente-mentón (sin trauma) o tracción mandibular (con trauma)',
                  'Aspirar secreciones/vómito',
                  'Vía aérea avanzada si: Glasgow ≤ 8, obstrucción, hipoxemia refractaria',
                  'Considera cricotiroidotomía si no se puede intubar'],
            opts: [{ t: 'Vía aérea permeable', to: 'respiracion' },
                   { t: 'Vía aérea comprometida', to: 'via_aerea' }] },
        respiracion: { tipo: 'act', corto: 'B: Respiración',
            t: 'B: Respiración y ventilación',
            det: ['Oxígeno a alto flujo (máscara con reservorio)',
                  'Evaluar: FR, SatO₂, simetría torácica, uso de accesorios',
                  'Buscar: neumotórax a tensión (descompresión con aguja), hemotórax, volet costal',
                  'Descompresión con aguja: 2º EIC línea medio-clavicular (o 4º-5º EIC línea axilar anterior)',
                  'Tubo de toracostomía si hay hemotórax o neumotórax'],
            opts: [{ t: 'Ventilación adecuada', to: 'circulacion' },
                   { t: 'Compromiso respiratorio', to: 'respiracion' }] },
        circulacion: { tipo: 'act', corto: 'C: Circulación',
            t: 'C: Circulación y hemorragia',
            det: ['Control de hemorragia externa (presión directa, torniquete)',
                  'Acceso IV (2 vías gruesas) o IO',
                  'Bolo de cristaloide: 1 L (adulto) o 20 mL/kg (niño)',
                  'Transfusión si hay shock hemorrágico (protocolo de transfusión masiva)',
                  'Buscar hemorragia interna: FAST, TC',
                  'Permissive hypotension: PAS 80-90 en trauma penetrante (sin TCE)'],
            dosis: [{ n: 'Bolo de cristaloide', nota: 'Adulto: 1 L. Niño: 20 mL/kg.',
                      f: (kg, pob) => pob === 'pediatrico' ? `${Math.round(20 * kg)} mL` : '1000 mL' }],
            opts: [{ t: 'Estabilizado', to: 'discapacidad' },
                   { t: 'Shock persistente', to: 'circulacion' }] },
        discapacidad: { tipo: 'act', corto: 'D: Discapacidad',
            t: 'D: Estado neurológico',
            det: ['Glasgow (GCS): apertura ocular, respuesta verbal, respuesta motora',
                  'Pupilas: tamaño, simetría, reactividad',
                  'Glucemia (descartar hipoglucemia)',
                  'Si Glasgow ≤ 8: asegurar vía aérea (intubación)',
                  'Buscar lesión de médula espinal (priapismo, nivel sensitivo)'],
            opts: [{ t: 'Glasgow 15', to: 'exposicion' },
                   { t: 'Glasgow < 15', to: 'exposicion' }] },
        exposicion: { tipo: 'fin', tono: 'ok', corto: 'E: Exposición',
            t: 'E: Exposición y ambiente',
            det: ['Desvestir completamente y examinar (log roll con protección cervical)',
                  'Buscar lesiones ocultas: espalda, periné, axilas',
                  'Prevenir hipotermia: mantas, líquidos calientes',
                  'Reevaluar: ABCDE secundario (head-to-toe)',
                  'Considerar analgesia',
                  'Documentar y comunicar al equipo'] }
    }
},
{
    id: 'arritmias', titulo: 'Taquiarritmias y bradiarritmias', area: 'Urgencias', pob: ['adulto'], peso: false,
    fuente: { t: 'AHA 2020 · Guías de taquiarritmias y bradiarritmias', url: 'https://www.heart.org' },
    revisado: '26 nov 2026',
    alcance: 'Reconocimiento, clasificación y manejo inicial de taquiarritmias y bradiarritmias.',
    kw: 'taquicardia bradicardia arritmia fibrilacion auricular flutter taquicardia ventricular bloqueo av',
    nodos: {
        inicio: { tipo: 'q', corto: 'Clasificar arritmia',
            t: '¿El paciente tiene taquicardia (FC > 100) o bradicardia (FC < 60)?',
            det: ['Evalúa: FC, ritmo, QRS ancho/estrecho, estabilidad hemodinámica',
                  'Estable: PA normal, sin dolor torácico, sin alteración del sensorio',
                  'Inestable: hipotensión, dolor torácico, alteración del sensorio, shock, IC aguda'],
            opts: [{ t: 'Taquicardia', to: 'taqui' },
                   { t: 'Bradicardia', to: 'bradi' }] },
        taqui: { tipo: 'q', corto: 'Taquicardia',
            t: '¿Es taquicardia de QRS estrecho o ancho?',
            det: ['QRS estrecho (< 120 ms): supraventricular',
                  'QRS ancho (≥ 120 ms): ventricular o supraventricular con aberrancia'],
            opts: [{ t: 'QRS estrecho', to: 'estrecho' },
                   { t: 'QRS ancho', to: 'ancho' }] },
        estrecho: { tipo: 'q', corto: 'QRS estrecho',
            t: '¿El paciente está estable o inestable?',
            det: ['Estable: puede esperar evaluación y tratamiento farmacológico',
                  'Inestable: requiere cardioversión eléctrica inmediata'],
            opts: [{ t: 'Estable', to: 'estrecho_estable' },
                   { t: 'Inestable', to: 'cardioversion' }] },
        estrecho_estable: { tipo: 'act', corto: 'Taquicardia estable (QRS estrecho)',
            t: 'Taquicardia supraventricular estable',
            det: ['Maniobras vagales (Valsalva, masaje carotídeo)',
                  'Adenosina 6 mg IV rápido + 20 mL SSN (repetir 12 mg)',
                  'Si FA con respuesta ventricular rápida: betabloqueador o calcioantagonista (diltiazem)',
                  'Si flutter auricular: igual que FA',
                  'Si TSV (reentrada): adenosina es de elección'],
            dosis: [{ n: 'Adenosina', nota: '6 mg IV rápido + 20 mL SSN; repetir 12 mg.',
                      f: (kg, pob) => `6 mg IV rápido` }],
            opts: [{ t: 'Convertida', to: 'post' },
                   { t: 'Persiste', to: 'cardioversion' }] },
        ancho: { tipo: 'q', corto: 'QRS ancho',
            t: '¿El paciente está estable o inestable?',
            det: ['TV monomórfica estable: amiodarona o procainamida',
                  'TV polimórfica (torsades): magnesio + corrección de QT',
                  'Inestable: cardioversión eléctrica'],
            opts: [{ t: 'Estable', to: 'ancho_estable' },
                   { t: 'Inestable', to: 'cardioversion' }] },
        ancho_estable: { tipo: 'act', corto: 'Taquicardia estable (QRS ancho)',
            t: 'Taquicardia ventricular estable',
            det: ['Amiodarona 150 mg IV en 10 min',
                  'Procainamida 20-50 mg/min (máx 17 mg/kg)',
                  'Si torsades de pointes: MgSO₄ 2 g IV',
                  'Corregir hipokalemia, hipomagnesemia',
                  'Evitar antiarrítmicos clase I en cardiopatía estructural'],
            dosis: [{ n: 'Amiodarona', nota: '150 mg IV en 10 min.',
                      f: (kg, pob) => `150 mg IV en 10 min` }],
            opts: [{ t: 'Convertida', to: 'post' },
                   { t: 'Persiste / inestable', to: 'cardioversion' }] },
        cardioversion: { tipo: 'act', corto: 'Cardioversión eléctrica',
            t: 'Cardioversión eléctrica sincronizada',
            det: ['Sedación si está consciente',
                  'Energía: QRS estrecho 50-100 J; QRS ancho 100-200 J',
                  'Sincronizar con el QRS',
                  'Si inestable: no esperar sedación'],
            opts: [{ t: 'Convertida', to: 'post' },
                   { t: 'Persiste', to: 'post' }] },
        bradi: { tipo: 'q', corto: 'Bradicardia',
            t: '¿El paciente está sintomático (hipotensión, alteración del sensorio, dolor torácico, IC)?',
            det: ['Bradicardia sinusal, bloqueo AV de 1º, 2º (Mobitz I/II), 3º grado',
                  'Causas: isquemia, medicamentos (betabloqueadores, calcioantagonistas), hipoxia, hipotermia'],
            opts: [{ t: 'Sintomático', to: 'bradi_trat' },
                   { t: 'Asintomático', to: 'bradi_obs' }] },
        bradi_trat: { tipo: 'act', corto: 'Bradicardia sintomática',
            t: 'Tratamiento de bradicardia sintomática',
            det: ['Atropina 0.5 mg IV (repetir cada 3-5 min, máx 3 mg)',
                  'Si no responde: isoproterenol 2-10 mcg/min IV',
                  'Marcapasos transcutáneo si es necesario',
                  'Considerar causa reversible (isquemia, medicamentos)'],
            dosis: [{ n: 'Atropina', nota: '0.5 mg IV, repetir cada 3-5 min, máx 3 mg.',
                      f: (kg, pob) => `0.5 mg IV` }],
            opts: [{ t: 'Mejoró', to: 'post' },
                   { t: 'Persiste', to: 'marcapasos' }] },
        marcapasos: { tipo: 'act', corto: 'Marcapasos transcutáneo',
            t: 'Marcapasos transcutáneo',
            det: ['Colocar electrodos anteroposterior',
                  'Iniciar a 60 lpm, ajustar hasta captura',
                  'Sedación si está consciente',
                  'Considerar marcapasos transvenoso definitivo'],
            opts: [{ t: 'Captura', to: 'post' }] },
        bradi_obs: { tipo: 'fin', tono: 'ok', corto: 'Bradicardia asintomática',
            t: 'Bradicardia asintomática: observación',
            det: ['Monitoreo continuo',
                  'Buscar y tratar la causa',
                  'No requiere tratamiento si está asintomático'] },
        post: { tipo: 'fin', tono: 'ok', corto: 'Post-tratamiento',
            t: 'Post-tratamiento: manejo y seguimiento',
            det: ['Monitoreo en UCI/intermedios',
                  'Buscar la causa (isquemia, medicamentos, electrolitos)',
                  'Considerar ablación o marcapasos definitivo',
                  'Control de factores de riesgo'] }
    }
},
{
    id: 'epoc', titulo: 'EPOC exacerbado', area: 'Urgencias', pob: ['adulto'], peso: false,
    fuente: { t: 'GOLD 2024 · Guía de EPOC', url: 'https://goldcopd.org/2024-gold-report/' },
    revisado: '26 nov 2026',
    alcance: 'Evaluación de gravedad, tratamiento inicial y criterios de hospitalización.',
    kw: 'epoc exacerbacion broncoespasmo salbutamol ipratropio corticoide oxigeno',
    nodos: {
        inicio: { tipo: 'q', corto: 'Evaluar gravedad',
            t: '¿Cuál es la gravedad de la exacerbación?',
            det: ['Leve: disnea solo con esfuerzo, puede hablar, FR < 20, SatO₂ > 92%',
                  'Moderada: disnea en reposo, habla en frases, FR 20-30, SatO₂ 88-92%',
                  'Grave: disnea en reposo, habla en palabras, FR > 30, SatO₂ < 88%, uso de accesorios, alteración del sensorio',
                  'Amenaza vital: confusión, cianosis, bradicardia, silencio auscultatorio'],
            opts: [{ t: 'Leve', to: 'leve' },
                   { t: 'Moderada', to: 'moderada' },
                   { t: 'Grave', to: 'grave' },
                   { t: 'Amenaza vital', to: 'vital' }] },
        leve: { tipo: 'fin', tono: 'ok', corto: 'Exacerbación leve',
            t: 'Exacerbación leve: tratamiento ambulatorio',
            det: ['Salbutamol 2-4 puff con cámara espaciadora (o 2.5-5 mg nebulizado)',
                  'Repetir cada 20 min x 3 dosis',
                  'Prednisona 40 mg VO x 5 días',
                  'Observar 1 h; si mejora, dar plan de acción y alta',
                  'Considerar antibiótico si hay signos de infección bacteriana (Anthonisen)'] },
        moderada: { tipo: 'act', corto: 'Exacerbación moderada',
            t: 'Exacerbación moderada: tratamiento y observación',
            det: ['Salbutamol 4-10 puff con cámara (o 2.5-5 mg nebulizado) c/20 min',
                  'Ipratropio bromuro 0.5 mg nebulizado',
                  'Prednisona 40 mg VO',
                  'Oxígeno para mantener SatO₂ 88-92%',
                  'Observar 1-2 h; reevaluar',
                  'Considerar antibiótico si hay infección bacteriana'],
            opts: [{ t: 'Mejoró', to: 'alta' },
                   { t: 'No mejoró', to: 'grave' }] },
        grave: { tipo: 'act', corto: 'Exacerbación grave',
            t: 'Exacerbación grave: tratamiento intensivo',
            det: ['Oxígeno para mantener SatO₂ 88-92%',
                  'Salbutamol 2.5-5 mg nebulizado c/20 min (o continuo)',
                  'Ipratropio 0.5 mg nebulizado',
                  'Prednisona 40 mg VO o hidrocortisona 100-200 mg IV',
                  'Considerar NIMV (ventilación no invasiva) si hay acidosis respiratoria',
                  'Gasometría arterial',
                  'Acceso IV, monitorización continua'],
            opts: [{ t: 'Mejoró', to: 'alta' },
                   { t: 'Amenaza vital', to: 'vital' },
                   { t: 'No mejoró', to: 'uci' }] },
        vital: { tipo: 'act', corto: 'Amenaza vital',
            t: 'Amenaza vital: UCI y ventilación',
            det: ['Ventilación mecánica si hay fatiga, confusión o acidosis severa',
                  'Continuar broncodilatadores nebulizados',
                  'Hidrocortisona 200 mg IV',
                  'Considerar NIMV si no hay contraindicación'],
            opts: [{ t: 'Estabilizado', to: 'uci' }] },
        uci: { tipo: 'fin', tono: 'crit', corto: 'UCI',
            t: 'Ingreso a UCI',
            det: ['Ventilación mecánica con estrategia protectora',
                  'Sedación y analgesia',
                  'Continuar broncodilatadores y corticoides',
                  'Monitoreo continuo'] },
        alta: { tipo: 'fin', tono: 'ok', corto: 'Alta',
            t: 'Alta: plan de acción y seguimiento',
            det: ['Plan de acción por escrito',
                  'Ajuste del tratamiento de mantenimiento (LAMA, LABA, CI)',
                  'Control en 1-2 días',
                  'Educar sobre el uso correcto del inhalador',
                  'Identificar y evitar desencadenantes',
                  'Vacunación (influenza, neumococo)'] }
    }
}






];
/* =====================================================================
   ALGORITMOS · LOTE 2
   ===================================================================== */
const fx = (n, txt, nota) => ({ n, nota, fijo: true, f: () => txt });

// Reutilizables de asma
const ASMA_SABA = { n: 'Salbutamol (SABA)', fijo: true, nota: 'Cada 20 min durante la primera hora; después según respuesta. Adultos con espaciador; en niños, regla por peso.',
    f: (kg, pob) => pob === 'pediatrico'
        ? (kg > 0 ? (kg < 20 ? '5 inhalaciones (100 mcg) con espaciador o 2.5 mg nebulizado' : '10 inhalaciones (100 mcg) con espaciador o 5 mg nebulizado') : 'Ingresa el peso: < 20 kg = 5 inhalaciones o 2.5 mg neb; ≥ 20 kg = 10 inhalaciones o 5 mg neb')
        : '4-10 inhalaciones (100 mcg) con espaciador, o 5 mg nebulizado' };
const ASMA_IPRA = { n: 'Bromuro de ipratropio (añadir en crisis moderada-grave)', fijo: true, nota: 'Cada 20 min x 3 dosis, junto con el salbutamol. En niños las guías difieren: TREKK usa 0.25 mg a cualquier edad; otras usan 0.5 mg desde los 5 años.',
    f: (kg, pob) => pob === 'pediatrico' ? '0.25 mg nebulizado (o 4 inhalaciones de 20 mcg)' : '0.5 mg nebulizado (o 8 inhalaciones de 20 mcg)' };
const ASMA_CORT = { n: 'Corticoide sistémico (no esperes: dalo temprano)', fijo: true, nota: 'Si no puede tragar, usa un equivalente IV (hidrocortisona o metilprednisolona) según protocolo.',
    f: (kg, pob) => pob === 'pediatrico'
        ? (kg > 0 ? `Prednisolona o prednisona ${fmtN(Math.min(kg, 60))} mg VO (1 mg/kg, máx 60 mg) · alternativa: dexametasona ${fmtN(Math.min(0.6 * kg, 12))} mg VO` : 'Ingresa el peso: prednisolona 1 mg/kg (máx 60 mg)')
        : 'Prednisona 40-50 mg VO una vez al día x 5 días' };

ALG_DATA.push(
{
    id: 'sepsis', titulo: 'Sepsis y choque séptico (adulto)', area: 'Infectología', pob: ['adulto'], peso: true,
    fuente: { t: 'Surviving Sepsis Campaign 2026 (adultos)', url: 'https://www.sccm.org/clinical-resources/guidelines/guidelines/surviving-sepsis-campaign-international-guidelines-for-management-of-sepsis-and-septic-shock-2026' },
    revisado: '1 nov 2026',
    alcance: 'Tiempos del antibiótico, volumen inicial de cristaloide, noradrenalina como primera línea y vasopresina fija. Los rangos de noradrenalina vienen de protocolos hospitalarios. La sepsis pediátrica no está cubierta',
    kw: 'sepsis choque septico shock infeccion hipotension lactato noradrenalina vasopresor antibiotico cristaloide qsofa bacteriemia',
    nodos: {
        inicio: { tipo: 'q', corto: 'Sospecha de sepsis',
            t: '¿Hay sospecha de infección con deterioro agudo?',
            det: ['Fiebre o hipotermia, taquicardia, taquipnea, alteración del estado mental',
                  'Hipotensión o mala perfusión: llenado capilar > 2 s, piel moteada, oliguria',
                  'Usa una herramienta de tamizaje estandarizada (NEWS, MEWS o SIRS): las guías Surviving Sepsis recomiendan NO usar qSOFA como única herramienta, y un qSOFA negativo no descarta sepsis'],
            links: [{ l: 'Calcular PAM', calc: 'pam' }, { l: 'Abrir qSOFA', calc: 'qsofa' }],
            opts: [{ t: 'Sepsis PROBABLE o con choque (hipotensión, hipoperfusión)', to: 'hora1' },
                   { t: 'Sepsis solo POSIBLE, sin choque', to: 'posible' },
                   { t: 'Es poco probable que sea infección', to: 'otra' }] },
        posible: { tipo: 'q', corto: 'Sepsis solo posible',
            t: 'Sepsis posible, sin choque: estudio acotado y reevaluación',
            det: ['Haz un estudio rápido y dirigido (foco, laboratorio, imágenes) en pocas horas',
                  'Si tras ese estudio persiste la sospecha de infección, el antibiótico debe darse dentro de las primeras 3 horas desde que reconociste la posibilidad de sepsis',
                  'Si aparece hipotensión, mala perfusión o deterioro: trátala como sepsis probable (antibiótico en la primera hora)'],
            opts: [{ t: 'Persiste la sospecha o hay deterioro', to: 'hora1' }, { t: 'Otro diagnóstico es más probable', to: 'otra' }] },
        otra: { tipo: 'fin', tono: 'warn', corto: 'Otra causa',
            t: 'Busca otra causa del deterioro',
            det: ['Reevalúa con frecuencia: la sepsis puede evolucionar en horas',
                  'Descarta otras causas de hipotensión: hipovolemia, sangrado, falla cardíaca, embolia pulmonar, anafilaxia, insuficiencia suprarrenal, cetoacidosis',
                  'Si cae la PAM o aparecen signos de hipoperfusión, vuelve a este algoritmo'],
            links: [{ l: 'Abrir PAM', calc: 'pam' }] },
        hora1: { tipo: 'act', corto: 'Primera hora',
            t: 'Primera hora: cultivos, antibiótico y líquidos',
            det: ['Hemocultivos (idealmente antes del antibiótico, sin retrasarlo), lactato, glucemia y creatinina',
                  'Dos accesos venosos (o intraóseo) y oxígeno si hay hipoxemia',
                  'Antibiótico empírico de amplio espectro EN LA PRIMERA HORA si la sepsis es probable o hay choque',
                  'Elige según el foco y tu antibiograma local (ver Infectología); da la primera dosis completa y, si es posible, infusión prolongada de los betalactámicos',
                  'Prefiere un cristaloide balanceado (Ringer lactato) sobre la solución salina 0.9%: al menos 30 mL/kg en las primeras 3 horas si hay hipoperfusión o choque',
                  'Controla el foco lo antes posible (drenaje, retiro de dispositivos, cirugía)'],
            dosis: [{ n: 'Cristaloide (30 mL/kg)', nota: 'Con IMC > 30 usa el peso ajustado o ideal. Reevalúa después de cada bolo (PAM, llenado capilar, diuresis, auscultación).',
                      f: kg => `${Math.round(30 * kg)} mL en las primeras 3 h` }],
            links: [{ l: 'Síndromes de Infectología', tab: 'infectologia' }],
            sig: 'perfusion' },
        perfusion: { tipo: 'q', corto: 'Reevaluar perfusión',
            t: 'Durante o después del bolo: ¿la PAM sigue < 65 mmHg o persiste la hipoperfusión?',
            det: ['Mide PAM, llenado capilar, estado mental, diuresis y repite el lactato si estaba elevado'],
            links: [{ l: 'Calcular PAM', calc: 'pam' }],
            opts: [{ t: 'Sí: PAM < 65 pese a los líquidos', to: 'vaso' }, { t: 'No: PAM ≥ 65 y la perfusión mejora', to: 'estable' }] },
        vaso: { tipo: 'act', corto: 'Noradrenalina',
            t: 'Inicia noradrenalina para una PAM ≥ 65 mmHg',
            det: ['La noradrenalina es el vasopresor de primera línea: inicia a 0.02-0.1 mcg/kg/min y titula cada pocos minutos',
                  'Meta de PAM ≥ 65 mmHg (en mayores de 65 años se acepta 60-65)',
                  'Con requerimientos crecientes, agrega vasopresina a dosis FIJA de 0.03 U/min (no se titula)',
                  'Dobutamina (2-20 mcg/kg/min) solo si hay disfunción miocárdica con hipoperfusión pese a una PAM adecuada',
                  'Monitoreo continuo; línea arterial si hay disponibilidad'],
            dosis: [{ n: 'Noradrenalina', nota: 'Rango habitual 0.05-0.5 mcg/kg/min (descrito hasta 3 en refractario). Usa la calculadora de infusión para pasar a mL/h.',
                      f: kg => `0.05 = ${fmtN(0.05 * kg)} · 0.1 = ${fmtN(0.1 * kg)} · 0.5 = ${fmtN(0.5 * kg)} mcg/min` }],
            links: [{ l: 'Calculadora de infusión', tab: 'farmaco' }, { l: 'Ver Noradrenalina', drug: 'Noradrenalina' }],
            opts: [{ t: 'PAM ≥ 65 con noradrenalina', to: 'estable' }, { t: 'PAM < 65 pese a noradrenalina creciente', to: 'refract' }] },
        refract: { tipo: 'fin', tono: 'crit', corto: 'Choque refractario',
            t: 'Choque séptico refractario: UCI',
            det: ['Remite a UCI lo antes posible; mantén noradrenalina y vasopresina fija (0.03 U/min)',
                    'Hidrocortisona IV 200 mg/día (50 mg c/6 h o infusión continua) si persiste la necesidad de vasopresor',                  'Adrenalina en infusión (0.01-0.5 mcg/kg/min) como tercer agente',
                    'Reconsidera el foco: ¿se controló? ¿hay absceso, obstrucción o necrosis? ¿el antibiótico cubre?',
                    'Descarta otras causas de choque (cardiogénico, hipovolémico, obstructivo)'],
            links: [{ l: 'Ver Hidrocortisona', drug: 'Hidrocortisona' }] },
        estable: { tipo: 'fin', tono: 'ok', corto: 'Estable',
            t: 'Estabilizado: reevaluación continua',
            det: ['Monitoreo continuo de PAM, perfusión y diuresis; repite el lactato si estaba elevado',
                  'Desescala el antibiótico apenas tengas germen y sensibilidad, y revisa la duración según foco y respuesta',
                  'Continúa el control del foco infeccioso',
                  'Valora la remisión según tu nivel de complejidad; si reaparece hipotensión, vuelve al paso de vasopresor'] }
    }
},
{
    id: 'asma', titulo: 'Crisis asmática', area: 'Respiratorio', pob: ['adulto', 'pediatrico'], peso: true,
    fuente: { t: 'AFP 2024 · asma aguda; TREKK 2024 (pediatría); guías MSF', url: 'https://www.aafp.org/afp/2024/0100/acute-asthma-exacerbations' },
    revisado: '1 nov 2026',
    alcance: 'Tratamiento inicial, corticoide, ipratropio, magnesio y criterios de alta. La clasificación de gravedad usa criterios clínicos generales. Las guías pediátricas difieren en la dosis de ipratropio.',
    kw: 'asma crisis asmatica broncoespasmo sibilancias salbutamol ipratropio prednisona magnesio exacerbacion disnea',
    nodos: {
        inicio: { tipo: 'q', corto: 'Gravedad',
            t: '¿Hay signos de crisis GRAVE o de riesgo vital?',
            det: ['No puede hablar frases (habla en palabras) o no puede acostarse', 'Uso marcado de músculos accesorios, FR muy elevada', 'SatO₂ < 92%', 'Agitación, somnolencia o confusión', 'Tórax silencioso, cianosis o agotamiento'],
            links: [{ l: 'Ver Salbutamol', drug: 'Salbutamol (Albuterol)' }],
            opts: [{ t: 'Sí: crisis grave / riesgo vital', to: 'grave' }, { t: 'No: leve a moderada', to: 'moderada' }] },
        grave: { tipo: 'act', corto: 'Tratamiento intensivo',
            t: 'Crisis grave: broncodilatador, oxígeno y corticoide YA',
            det: ['Oxígeno para SatO₂ 93-95% en adultos y 94-98% en niños (evita la hiperoxia)',
                  'Salbutamol repetido + ipratropio, corticoide sistémico desde el inicio',
                  'Sulfato de magnesio IV si es grave y no responde a los broncodilatadores iniciales',
                  'Si está en extremis o no puede inhalar: adrenalina IM',
                  'Mantén al paciente sentado, monitorizado y con acompañamiento continuo',
                  'Descarta neumotórax, neumonía o anafilaxia si no mejora'],
            dosis: [ASMA_SABA, ASMA_IPRA, ASMA_CORT,
                { n: 'Sulfato de magnesio IV', fijo: true, nota: 'Una sola dosis en 20 minutos.',
                  f: (kg, pob) => pob === 'pediatrico' ? (kg > 0 ? `${fmtN(Math.min(50 * kg, 2000))} mg (50 mg/kg, máx 2 g)` : 'Ingresa el peso: 50 mg/kg (máx 2 g)') : '2 g IV' },
                { n: 'Adrenalina IM (si no puede inhalar o está en extremis)', fijo: true, nota: 'Repetible cada 20 minutos hasta 3 dosis.',
                  f: (kg, pob) => pob === 'pediatrico' ? (kg > 0 ? `${fmtN(Math.min(0.01 * kg, 0.5))} mg (0.01 mg/kg, máx 0.5 mg)` : 'Ingresa el peso: 0.01 mg/kg (máx 0.5 mg)') : '0.3-0.5 mg' }],
            links: [{ l: 'Ver Ipratropio', drug: 'Bromuro de ipratropio' }, { l: 'Ver Sulfato de magnesio', drug: 'Sulfato de magnesio' }],
            sig: 'reeval' },
        moderada: { tipo: 'act', corto: 'Tratamiento inicial',
            t: 'Crisis leve a moderada: salbutamol repetido y corticoide',
            det: ['Salbutamol cada 20 minutos durante la primera hora (3 dosis)',
                  'Oxígeno solo si SatO₂ < 92-93%, con meta de 93-95% en adultos y 94-98% en niños',
                  'Corticoide oral temprano, sin esperar la respuesta al broncodilatador',
                  'Agrega ipratropio si la respuesta es incompleta'],
            dosis: [ASMA_SABA, ASMA_CORT, ASMA_IPRA],
            links: [{ l: 'Ver Salbutamol', drug: 'Salbutamol (Albuterol)' }, { l: 'Ver Prednisolona', drug: 'Prednisolona / Prednisona' }],
            sig: 'reeval' },
        reeval: { tipo: 'q', corto: 'Reevaluar a la hora',
            t: 'Reevalúa tras la primera hora: ¿cómo está?',
            det: ['Habla en frases, SatO₂ ≥ 94%, FR y esfuerzo respiratorio disminuidos = mejoría clara'],
            opts: [{ t: 'Mejoría clara y sostenida', to: 'alta' }, { t: 'Mejoría parcial', to: 'obs' }, { t: 'Sin mejoría o empeora', to: 'refractaria' }] },
        obs: { tipo: 'act', corto: 'Observación',
            t: 'Mejoría parcial: continúa el tratamiento y observa',
            det: ['Salbutamol cada 1-4 horas según necesidad; completa el corticoide y agrega ipratropio si aún no lo diste', 'Observa de 1 a 4 horas con reevaluación seriada'],
            opts: [{ t: 'Mejoró hasta criterios de alta', to: 'alta' }, { t: 'No mejora o empeora', to: 'refractaria' }] },
        alta: { tipo: 'fin', tono: 'ok', corto: 'Alta',
            t: 'Respuesta buena y sostenida: plan de alta',
            det: ['Observa al menos 1 hora tras la mejoría, con salbutamol que no se necesite con frecuencia',
                  'Corticoide oral: adultos 5 días; niños 3-5 días',
                  'Salbutamol a demanda cada 3-4 horas y revisa la técnica con espaciador',
                  'Inicia o ajusta el corticoide inhalado de mantenimiento (revisa el control del asma)',
                  'Entrega un plan de acción por escrito y explica los signos para volver: sigue sin poder hablar, necesita salbutamol cada menos de 4 horas o empeora',
                  'Control en pocos días'] },
        refractaria: { tipo: 'fin', tono: 'crit', corto: 'Refractaria',
            t: 'Sin respuesta: hospitalización o UCI',
            det: ['Remite a un centro con UCI; mantén oxígeno, salbutamol e ipratropio durante el traslado',
                  'Sulfato de magnesio IV si aún no lo diste; adrenalina IM si no puede inhalar',
                  'Prepárate para vía aérea difícil: la intubación en asma es de alto riesgo (hazla solo si hay fatiga o falla ventilatoria y por el más experimentado)',
                  'Busca neumotórax, neumonía, anafilaxia o cuerpo extraño'] }
    }
},
{
    id: 'hipo_cad', titulo: 'Hipoglucemia y cetoacidosis diabética', area: 'Endocrino', pob: ['adulto', 'pediatrico'], peso: true,
    fuente: { t: 'Consenso ADA 2024 (crisis hiperglucémicas) e ISPAD 2022; protocolos de hipoglucemia', url: 'https://www.ccjm.org/content/92/3/152' },
    revisado: '1 nov 2026',
    alcance: 'Umbrales de potasio, dosis de insulina, dosis de glucagón y dextrosa, y tratamiento de la hipoglucemia. La velocidad de reposición de potasio, la dosis de bicarbonato y el manejo del edema cerebral no están verificados en este lote.',
    kw: 'hipoglucemia cetoacidosis diabetica CAD diabetes glucosa insulina glucagon dextrosa potasio hiperglucemia cetonas',
    nodos: {
        inicio: { tipo: 'q', corto: 'Qué trato',
            t: '¿Qué cuadro estás tratando?',
            opts: [{ t: 'Hipoglucemia (glucemia < 70 mg/dL con síntomas, o < 54)', to: 'hipo' },
                   { t: 'Hiperglucemia con sospecha de CAD (vómito, dolor abdominal, respiración profunda, deshidratación)', to: 'cad_dx' }] },
        hipo: { tipo: 'q', corto: 'Vía de tratamiento',
            t: '¿Está consciente y puede tragar con seguridad?',
            opts: [{ t: 'Sí', to: 'hipo_oral' }, { t: 'No (inconsciente, convulsiona o no coopera)', to: 'hipo_grave' }] },
        hipo_oral: { tipo: 'act', corto: 'Carbohidrato oral',
            t: 'Da carbohidrato de acción rápida y repite la glucemia a los 15 minutos',
            det: ['Jugo, bebida azucarada o tabletas de glucosa (no grasas ni chocolate: se absorben lento)',
                  'Espera 15 minutos y repite la glucemia; si sigue baja (< 70 mg/dL), repite la dosis',
                  'Cuando se corrija, da una comida o merienda con carbohidrato complejo y proteína'],
            dosis: [{ n: 'Carbohidrato de acción rápida', fijo: true, nota: 'Niños: 0.3 g/kg (≈ 5-10 g si < 30 kg; 10-15 g si ≥ 30 kg).',
                      f: (kg, pob) => pob === 'pediatrico' ? (kg > 0 ? `${fmtN(0.3 * kg)} g (0.3 g/kg)` : 'Ingresa el peso: 0.3 g/kg') : '15-20 g' }],
            opts: [{ t: 'Glucemia normalizada', to: 'hipo_fin' }, { t: 'Sigue baja tras 2 ciclos', to: 'hipo_grave' }] },
        hipo_grave: { tipo: 'act', corto: 'Hipoglucemia grave',
            t: 'Hipoglucemia grave: glucosa IV, o glucagón si no hay vía IV',
            det: ['Con acceso IV: dextrosa IV (preferida)', 'Sin acceso IV: glucagón IM o SC; repetible una vez a los 15 minutos',
                  'Voltea al paciente de lado y no le des nada por la boca',
                  'Tras recuperar la conciencia: da carbohidratos orales o IV para evitar la recurrencia (el glucagón falla si hay ayuno prolongado, cirrosis o alcohol)',
                  'Hipoglucemia por insulina o sulfonilurea (glibenclamida) puede recurrir por horas: observa y hospitaliza'],
            dosis: [{ n: 'Dextrosa IV', fijo: true, nota: 'Control de glucemia a los 10-15 min; repite si sigue < 70 mg/dL. Recién nacidos: dextrosa al 10%, 2 mL/kg.',
                      f: (kg, pob) => pob === 'pediatrico' ? (kg > 0 ? `${Math.round(5 * kg)} mL de dextrosa al 10% (0.5 g/kg)` : 'Ingresa el peso: dextrosa al 10%, 5 mL/kg') : '50 mL de dextrosa al 50% (25 g)' },
                { n: 'Glucagón IM / SC', fijo: true, nota: 'Algunas presentaciones (GlucaGen) usan el corte de 25 kg. Sin peso: 0.5 mg si < 6 años; 1 mg si ≥ 6 años.',
                  f: (kg, pob) => pob === 'pediatrico' ? (kg > 0 ? (kg < 20 ? '0.5 mg' : '1 mg') : '0.5 mg si < 6 años; 1 mg si ≥ 6 años') : '1 mg' }],
            links: [{ l: 'Ver Dextrosa', drug: 'Dextrosa (hipoglucemia)' }, { l: 'Ver Glucagón', drug: 'Glucagón' }],
            opts: [{ t: 'Recuperó y glucemia > 70 mg/dL', to: 'hipo_fin' }, { t: 'No responde', to: 'hipo_refr' }] },
        hipo_fin: { tipo: 'fin', tono: 'ok', corto: 'Recuperado',
            t: 'Hipoglucemia corregida: previene la recurrencia',
            det: ['Glucemias seriadas durante las horas siguientes', 'Busca la causa: dosis de insulina, ayuno, sulfonilurea, alcohol, sepsis, insuficiencia suprarrenal',
                  'En pacientes con riesgo de hipoglucemia grave, prescribe glucagón y educa a la familia'] },
        hipo_refr: { tipo: 'fin', tono: 'crit', corto: 'No responde',
            t: 'Hipoglucemia que no responde: remite',
            det: ['Repite la dextrosa y deja infusión de dextrosa al 5-10% con control seriado de glucemia',
                  'Descarta otras causas del compromiso de conciencia: intoxicación, ACV, sepsis, convulsión',
                  'Remite a un centro con capacidad de monitoreo'] },
        cad_dx: { tipo: 'q', corto: 'Confirmar CAD',
            t: '¿Cumple criterios de cetoacidosis diabética?',
            det: ['Glucemia > 200 mg/dL (o diabetes conocida)', 'Cetonas: β-hidroxibutirato ≥ 3 mmol/L o cetonuria ≥ 2+', 'Acidosis: pH < 7.3 o HCO₃⁻ < 18 mEq/L',
                  'Sin laboratorio: gravedad clínica (vómito, dolor abdominal, respiración de Kussmaul, deshidratación) + glucemia alta: trata como posible CAD y remite'],
            opts: [{ t: 'Cumple criterios', to: 'cad_fluid' }, { t: 'No cumple, o no tengo laboratorio', to: 'cad_lab' }] },
        cad_lab: { tipo: 'fin', tono: 'warn', corto: 'Sin confirmar',
            t: 'Sin confirmación: hidrata, vigila y remite',
            det: ['Hidratación IV inicial, glucemia horaria y búsqueda del desencadenante (infección, omisión de insulina, SGLT2)',
                  'Remite para gasometría, cetonas y electrolitos si hay respiración profunda, vómito o alteración de conciencia',
                  'No inicies insulina sin conocer el potasio'] },
        cad_fluid: { tipo: 'q', corto: 'Líquidos y potasio',
            t: 'Líquidos primero; mide el potasio antes de la insulina',
            det: {
                adulto: ['Solución salina 0.9% o cristaloide balanceado: 500-1000 mL/h durante las primeras 2-4 horas; luego ajusta a hidratación y sodio corregido',
                         'Mide el potasio ANTES de iniciar la insulina: si es < 3.5 mEq/L, repón potasio y retrasa la insulina',
                         'Reposición de potasio: según protocolo (velocidad no verificada en este lote)'],
                pediatrico: ['Bolo de 10-20 mL/kg solo si hay choque o deshidratación grave; luego rehidratación gradual en 24-48 h. Evita bolos repetidos (riesgo de edema cerebral)',
                             'Mide el potasio ANTES de la insulina: si es < 3.0 mmol/L, repón potasio y retrasa la insulina',
                             'Reposición de potasio y líquidos: según el protocolo ISPAD de tu servicio']
            },
            opts: [{ t: 'Potasio por debajo del umbral', to: 'cad_k' }, { t: 'Potasio normal o alto', to: 'cad_ins' }, { t: 'No tengo potasio disponible', to: 'cad_sinK' }] },
        cad_k: { tipo: 'act', corto: 'Reponer potasio',
            t: 'Repón el potasio y retrasa la insulina',
            det: ['Reposición IV de potasio con monitoreo (ECG si es posible), y reevalúa el potasio cada 2 horas',
                  'Inicia la insulina cuando el potasio supere el umbral (3.5 mEq/L en adultos; 3.0 mmol/L en niños)',
                  'La insulina hace entrar potasio a la célula: iniciarla con potasio bajo puede causar arritmias graves'],
            sig: 'cad_ins' },
        cad_sinK: { tipo: 'fin', tono: 'crit', corto: 'Sin potasio',
            t: 'Sin potasio disponible: no inicies insulina; remite',
            det: ['Continúa la hidratación IV y el monitoreo', 'Remite a un centro con laboratorio para potasio y gasometría'] },
        cad_ins: { tipo: 'act', corto: 'Insulina en infusión',
            t: 'Insulina cristalina en infusión IV continua',
            det: {
                adulto: ['Infusión de tasa fija: 0.1 UI/kg/h', 'Estado hiperosmolar: 0.05 UI/kg/h (si hay cetosis o acidosis significativa, trátalo como CAD)'],
                pediatrico: ['0.05-0.1 UI/kg/h (0.05 si pH > 7.15 o edad < 5 años), SIN bolo inicial', 'Inicia al menos 1 hora después de empezar los líquidos']
            },
            dosis: [{ n: 'Insulina cristalina IV', nota: 'Usa bomba de infusión y verifica la concentración preparada.',
                      f: (kg, pob) => pob === 'pediatrico' ? `${fmtN(0.05 * kg)} - ${fmtN(0.1 * kg)} UI/h` : `${fmtN(0.1 * kg)} UI/h` }],
            links: [{ l: 'Ver Insulina cristalina', drug: 'Insulina cristalina (regular)' }],
            sig: 'cad_mon' },
        cad_mon: { tipo: 'q', corto: 'Monitoreo',
            t: 'Monitoreo: glucemia cada hora; electrolitos y gasometría cada 2-4 horas. ¿Cómo evoluciona?',
            det: ['Cuando la glucemia baje de 250 mg/dL, agrega dextrosa al líquido para seguir con la insulina hasta resolver la acidosis',
                  'Resolución: pH ≥ 7.3 o HCO₃⁻ ≥ 18 mEq/L, con cetonas controladas y el paciente tolerando la vía oral',
                  'Bicarbonato solo si el pH es < 7.0 (según fuentes secundarias; dosis no verificada)'],
            opts: [{ t: 'Cumple criterios de resolución', to: 'cad_fin' }, { t: 'Continúa en tratamiento', to: 'cad_mon' }, { t: 'Empeora (pH baja, choque, alteración de conciencia)', to: 'cad_crit' }] },
        cad_fin: { tipo: 'fin', tono: 'ok', corto: 'Resuelta',
            t: 'CAD resuelta: transición a insulina subcutánea',
            det: ['Inicia la insulina subcutánea (basal) y solapa con la infusión 1-2 horas antes de suspenderla',
                  'Busca y trata el desencadenante: infección, omisión de insulina, inhibidores de SGLT2 (cetoacidosis euglucémica), infarto, embarazo',
                  'Educación sobre días de enfermedad y control en pocos días'] },
        cad_crit: { tipo: 'fin', tono: 'crit', corto: 'Empeora',
            t: 'CAD que empeora: UCI',
            det: ['Remite a UCI; reevalúa potasio, volumen y la dosis de insulina',
                  'En niños: cefalea, bradicardia o alteración del sensorio sugieren edema cerebral. Trátalo de inmediato (manitol o solución salina hipertónica según protocolo) y remite',
                  'Busca sepsis o infarto como desencadenante'] }
    }
},
{
    id: 'preeclampsia', titulo: 'Preeclampsia severa y eclampsia', area: 'Obstetricia', pob: ['gestante'], peso: false,
    fuente: { t: 'ACOG Committee Opinion 767 · hipertensión grave de inicio agudo en el embarazo; ACOG / OMS (sulfato de magnesio)', url: 'https://opqic.org/?p=8745' },
    revisado: '1 nov 2026',
    alcance: 'Umbral de hipertensión grave (≥ 160/110 sostenida), tiempo de tratamiento (30-60 min), esquemas de labetalol, hidralazina y nifedipino, y sulfato de magnesio. El momento y la vía del parto no están cubiertos.',
    kw: 'preeclampsia eclampsia embarazo hipertension gestacional convulsion sulfato de magnesio labetalol hidralazina nifedipino HELLP posparto',
    nodos: {
        inicio: { tipo: 'q', corto: 'Gravedad',
            t: 'Gestante o puérpera (hasta 6 semanas) con hipertensión: ¿qué hay?',
            det: ['Hipertensión grave: PA ≥ 160/110 mmHg sostenida por al menos 15 minutos',
                  'Signos de gravedad: cefalea intensa, alteraciones visuales, dolor epigástrico o en hipocondrio derecho, disnea, oliguria, alteración del estado mental',
                  'Laboratorio de gravedad: plaquetas < 100 000, creatinina elevada, transaminasas elevadas'],
            opts: [{ t: 'Convulsión (eclampsia)', to: 'eclampsia' }, { t: 'PA ≥ 160/110 sostenida o signos de gravedad', to: 'severa' }, { t: 'PA 140-159 / 90-109 sin signos de gravedad', to: 'leve' }] },
        leve: { tipo: 'fin', tono: 'warn', corto: 'Sin criterios de gravedad',
            t: 'Hipertensión sin criterios de gravedad: vigilancia estrecha',
            det: ['Confirma la PA con una nueva toma y solicita hemograma con plaquetas, creatinina, transaminasas y proteinuria',
                  'Explica los signos de alarma: cefalea intensa, visión borrosa, dolor epigástrico, disnea, convulsión, disminución de movimientos fetales',
                  'Control en 24-72 horas o remisión según la edad gestacional y los hallazgos',
                  'Si la PA alcanza 160/110 en cualquier momento, vuelve a este algoritmo'] },
        eclampsia: { tipo: 'act', corto: 'Eclampsia',
            t: 'Eclampsia: protege a la madre y administra sulfato de magnesio',
            det: ['Decúbito lateral izquierdo, vía aérea, oxígeno y acceso IV; protege de lesiones durante la convulsión',
                  'Sulfato de magnesio: es el anticonvulsivante de elección (no uses benzodiacepinas ni fenitoína como primera línea)',
                  'Continúa el magnesio solo si FR ≥ 16/min, reflejos rotulianos presentes y diuresis ≥ 30 mL/h',
                  'Toxicidad por magnesio: suspende, da oxígeno y gluconato de calcio 1 g (10 mL al 10%) IV lento',
                  'Controla la PA si es grave (ver siguiente paso), estabiliza y remite con acompañamiento: la eclampsia requiere interrupción del embarazo en un centro con capacidad obstétrica'],
            dosis: [fx('Sulfato de magnesio', 'Carga 4-6 g IV en 20-30 min; mantenimiento 1-2 g/h hasta 24 h posparto', 'Sin vía IV: 10 g IM (5 g en cada glúteo) y luego 5 g IM c/4 h. Convulsión recurrente: 2 g IV adicionales en 5 min.')],
            links: [{ l: 'Ver Sulfato de magnesio', drug: 'Sulfato de magnesio' }, { l: 'Ver Gluconato de calcio', drug: 'Gluconato de calcio' }],
            sig: 'severa' },
        severa: { tipo: 'act', corto: 'Control de la PA',
            t: 'Hipertensión grave: baja la PA en 30-60 minutos y da magnesio',
            det: ['Trata con un antihipertensivo de acción rápida dentro de 30-60 minutos desde que confirmas la PA ≥ 160/110',
                  'Elige UNO de los esquemas (labetalol, hidralazina o nifedipino de liberación inmediata) y sigue su protocolo sin saltarte pasos',
                  'No bajes la PA de golpe: la meta es una PA de 140-150 / 90-100 mmHg (evita la hipoperfusión uteroplacentaria)',
                  'Sulfato de magnesio para prevenir la eclampsia en preeclampsia grave',
                  'Laboratorio (hemograma con plaquetas, creatinina, transaminasas, LDH) y monitoreo fetal; descarta síndrome HELLP y edema pulmonar',
                  'Remite con acompañamiento si no tienes capacidad obstétrica y neonatal'],
            dosis: [fx('Labetalol IV', '20 mg en 2 min → 40 mg a los 10 min → 80 mg a los 10 min (máx 300 mg acumulados)', 'No usar en asma, bradicardia, bloqueo AV ni insuficiencia cardíaca descompensada.'),
                    fx('Hidralazina IV', '5-10 mg en 2 min; si no hay respuesta a los 20 min, 10 mg', 'Si persiste, cambia a labetalol. Puede causar taquicardia refleja y cefalea.'),
                    fx('Nifedipino de liberación inmediata VO', '10 mg → si persiste a los 20 min, 20 mg → luego 20 mg c/20 min', 'Evita la vía sublingual. Con sulfato de magnesio vigila la hipotensión y la debilidad neuromuscular.'),
                    fx('Sulfato de magnesio', 'Carga 4-6 g IV en 20-30 min; mantenimiento 1-2 g/h', 'Vigila FR ≥ 16/min, reflejos y diuresis ≥ 30 mL/h.')],
            links: [{ l: 'Ver Labetalol', drug: 'Labetalol' }, { l: 'Ver Hidralazina', drug: 'Hidralazina' }, { l: 'Ver Nifedipino', drug: 'Nifedipino' }],
            opts: [{ t: 'PA controlada y estable', to: 'estable' }, { t: 'La PA grave persiste tras el esquema', to: 'refr' }, { t: 'Convulsión', to: 'eclampsia' }] },
        refr: { tipo: 'fin', tono: 'crit', corto: 'PA refractaria',
            t: 'PA grave refractaria: cambia de fármaco y remite',
            det: ['Si agotaste un esquema sin control, cambia a otro antihipertensivo de acción rápida y busca ayuda urgente',
                  'Descarta edema pulmonar, HELLP, hemorragia intracraneal y desprendimiento de placenta',
                  'Remite a un centro con UCI obstétrica manteniendo el magnesio y el monitoreo'] },
        estable: { tipo: 'fin', tono: 'warn', corto: 'Estabilizada',
            t: 'PA controlada: manejo hospitalario y plan del parto',
            det: ['Hospitaliza o remite: la preeclampsia grave se maneja con monitoreo materno y fetal y define el momento del parto según la edad gestacional y la gravedad',
                  'Continúa el magnesio hasta 24 horas después del parto',
                  'Si la gestación es menor de 34 semanas, considera el corticoide antenatal para maduración pulmonar fetal',
                  'Posparto: la PA puede subir hasta 6 semanas después; mantén la vigilancia y los signos de alarma'] }
    }
},
{
    id: 'hpp', titulo: 'Hemorragia posparto (Código Rojo)', area: 'Obstetricia', pob: ['gestante'], peso: false,
    fuente: { t: 'OMS 2017 · recomendación sobre ácido tranexámico en hemorragia posparto', url: 'https://www.rhsupplies.org/activities-resources/publications/updated-who-recommendation-on-tranexamic-acid-for-the-treatment-of-postpartum-haemorrhage-highlights-and-key-messages-from-the-world-health-organizations-2017-global-recommendation-8842/' },
    revisado: '1 nov 2026',
    alcance: 'Ácido tranexámico (OMS 2017), oxitocina (bolo e infusión) y misoprostol (800 mcg) verificados. Las medidas mecánicas siguen el consenso OMS/FIGO y no se contrastaron con el texto completo.',
    kw: 'hemorragia posparto HPP codigo rojo atonia uterina oxitocina misoprostol acido tranexamico sangrado parto puerperio',
    nodos: {
        inicio: { tipo: 'q', corto: 'Reconocer HPP',
            t: '¿Hay sangrado posparto excesivo (> 500 mL en parto vaginal) o con signos de inestabilidad?',
            det: ['Cuantifica el sangrado de forma objetiva (compresas pesadas, recipientes graduados)', 'Signos de inestabilidad: taquicardia, hipotensión, palidez, sudoración, alteración de conciencia'],
            opts: [{ t: 'Sí: hay hemorragia o inestabilidad', to: 'activar' }, { t: 'No: pérdida normal, sin inestabilidad', to: 'vigilar' }] },
        vigilar: { tipo: 'fin', tono: 'warn', corto: 'Vigilancia',
            t: 'Pérdida normal: prevención y vigilancia',
            det: ['Masaje uterino tras el alumbramiento y oxitocina 10 UI IM como manejo activo del alumbramiento', 'Vigila el sangrado y los signos vitales de forma frecuente durante las primeras horas',
                  'Si el sangrado aumenta o aparecen signos de inestabilidad, activa el código rojo (vuelve a este algoritmo)'],
            links: [{ l: 'Ver Oxitocina', drug: 'Oxitocina' }] },
        activar: { tipo: 'act', corto: 'Activar Código Rojo',
            t: 'Activa el Código Rojo y haz las primeras medidas EN PARALELO',
            det: ['Pide ayuda, mide el sangrado y registra la hora: dos accesos IV de buen calibre', 'Laboratorio: hemoglobina, grupo y Rh, pruebas cruzadas y coagulación',
                  'Reposición con cristaloides calientes; oxígeno; evita la hipotermia',
                  'Masaje uterino bimanual continuo y vaciamiento de la vejiga (sonda)',
                  'Uterotónico de primera línea: oxitocina IM o IV lenta',
                  'Ácido tranexámico IV en cuanto empiece el sangrado, dentro de las primeras 3 horas del parto',
                  'Busca la causa con las 4 T: tono, tejido, trauma y trombina'],
            dosis: [fx('Oxitocina', '10 UI IM o IV lenta', 'Infusión: 20-40 UI en 1 L de cristaloide (máx 40 UI por litro); pasa el primer litro rápido y luego a ritmo de mantenimiento. No pases de 3 L de líquido con oxitocina.'),
                    fx('Ácido tranexámico', '1 g IV en 10 min, dentro de las primeras 3 h tras el parto', 'Segunda dosis de 1 g si el sangrado continúa tras 30 min o reinicia en las siguientes 24 h.')],
            links: [{ l: 'Ver Oxitocina', drug: 'Oxitocina' }, { l: 'Ver Ácido tranexámico', drug: 'Ácido tranexámico' }],
            sig: 'causa' },
        causa: { tipo: 'q', corto: 'Las 4 T',
            t: '¿Cuál es la causa más probable?',
            opts: [{ t: 'Tono: útero blando, atónico', to: 'atonia' }, { t: 'Tejido: placenta retenida o incompleta', to: 'tejido' },
                   { t: 'Trauma: desgarros, hematoma, inversión o rotura uterina', to: 'trauma' }, { t: 'Trombina: coagulopatía', to: 'coag' }] },
        atonia: { tipo: 'act', corto: 'Atonía uterina',
            t: 'Atonía: uterotónicos y medidas mecánicas escalonadas',
            det: ['Continúa el masaje uterino y la oxitocina',
                  'Si no hay oxitocina o no responde: misoprostol sublingual',
                  'Metilergonovina / ergometrina: contraindicada en hipertensión o preeclampsia',
                  'Si no responde en pocos minutos: taponamiento con balón uterino (o equivalente), compresión bimanual o aórtica durante el traslado',
                  'Si persiste: cirugía (suturas compresivas, ligaduras o histerectomía) en un centro con capacidad'],
            dosis: [fx('Misoprostol', '800 mcg sublingual (o rectal), dosis única', 'Si no hay oxitocina o no responde (fuentes secundarias: protocolo CMT y resumen perinatal).')],
            links: [{ l: 'Ver Misoprostol', drug: 'Misoprostol' }],
            opts: [{ t: 'Sangrado controlado', to: 'ctrl' }, { t: 'Persiste el sangrado', to: 'refr' }] },
        tejido: { tipo: 'act', corto: 'Tejido retenido',
            t: 'Tejido: revisa la placenta y evacúa los restos',
            det: ['Examina la placenta y las membranas: ¿están completas?', 'Alumbramiento manual o evacuación de restos bajo analgesia, según tu capacidad y entrenamiento',
                  'Profilaxis antibiótica tras la manipulación intrauterina; continúa el uterotónico y el masaje'],
            opts: [{ t: 'Sangrado controlado', to: 'ctrl' }, { t: 'Persiste el sangrado', to: 'refr' }] },
        trauma: { tipo: 'act', corto: 'Trauma obstétrico',
            t: 'Trauma: repara la lesión',
            det: ['Revisa cérvix, vagina y periné con buena iluminación; sutura los desgarros y drena los hematomas',
                  'Inversión uterina: reposiciona el útero de inmediato (maniobra de Johnson) y suspende los uterotónicos hasta lograrlo',
                  'Sospecha de rotura uterina (dolor, shock, parto previo con cicatriz): laparotomía urgente'],
            opts: [{ t: 'Sangrado controlado', to: 'ctrl' }, { t: 'Persiste el sangrado', to: 'refr' }] },
        coag: { tipo: 'act', corto: 'Coagulopatía',
            t: 'Trombina: coagulopatía',
            det: ['Reposición con hemoderivados (plasma, crioprecipitado, plaquetas) según protocolo de transfusión masiva', 'Ácido tranexámico (ver dosis) y corrección del calcio, la temperatura y la acidosis',
                  'Busca la causa: abruptio, sepsis, embolia de líquido amniótico, preeclampsia/HELLP, feto muerto retenido', 'Remite a un centro con banco de sangre y UCI'],
            opts: [{ t: 'Sangrado controlado', to: 'ctrl' }, { t: 'Persiste el sangrado', to: 'refr' }] },
        ctrl: { tipo: 'fin', tono: 'ok', corto: 'Controlada',
            t: 'Hemorragia controlada: vigilancia estrecha',
            det: ['Monitoreo continuo del sangrado, signos vitales y diuresis durante varias horas; mantén el uterotónico', 'Hemoglobina de control y reposición de hierro o transfusión según el caso',
                  'Antibiótico si hubo manipulación; traslada a observación y documenta el volumen perdido y las medidas'] },
        refr: { tipo: 'fin', tono: 'crit', corto: 'Refractaria',
            t: 'Hemorragia refractaria: cirugía y remisión urgente',
            det: ['Mantén el masaje o la compresión bimanual / aórtica durante todo el traslado', 'Reanimación con hemoderivados según protocolo de transfusión masiva; calienta al paciente y corrige el calcio',
                  'Informa de antemano al centro receptor: hora del parto, sangrado, medidas realizadas y dosis de ácido tranexámico y uterotónicos'] }
    }
}
);
/* =====================================================================
   ALGORITMOS · LOTE 3
   ===================================================================== */
const D_ASA = fx('Aspirina masticada', '162-325 mg VO, dosis única', 'Contraindicada si hay alergia o sangrado activo.');
const D_HEP = { n: 'Heparina no fraccionada', nota: 'Elige UNA anticoagulación. Verifica la concentración y la bomba de infusión.',
    f: kg => `Bolo ${Math.round(Math.min(60 * kg, 4000))} UI (60 UI/kg, máx 4 000) y luego ${Math.round(Math.min(12 * kg, 1000))} UI/h (12 UI/kg/h, máx 1 000)` };
const D_ENOX = { n: 'Enoxaparina (alternativa a la heparina)', nota: 'Calcula el ClCr (Cockcroft-Gault): si es < 30 mL/min, ajusta.',
    f: kg => `< 75 años: 30 mg IV en bolo + ${fmtN(kg)} mg SC (1 mg/kg), luego 1 mg/kg c/12h · ≥ 75 años: ${fmtN(0.75 * kg)} mg SC (0.75 mg/kg) c/12h, sin bolo` };
const D_TNK = { n: 'Tenecteplasa (dosis por peso)', nota: 'Tabla de la ficha técnica; verificación pendiente: confírmala con la ficha de tu producto.',
    f: kg => kg < 60 ? '30 mg IV en bolo' : kg < 70 ? '35 mg IV en bolo' : kg < 80 ? '40 mg IV en bolo' : kg < 90 ? '45 mg IV en bolo' : '50 mg IV en bolo' };

ALG_DATA.push(
{
    id: 'dolor_toracico', titulo: 'Dolor torácico agudo y sospecha de síndrome coronario', area: 'Cardiovascular', pob: ['adulto'], peso: true,
    fuente: { t: 'Guías ACC/AHA de SCA y dolor torácico; tarjetas ALS 2025 (Cruz Roja Americana)', url: 'https://guidelines.redcross.org/wp-content/uploads/2025/12/ALS-Code-Cards-ADULT-ACUTE-CORONARY-SYNDROMES-FINAL-PRINT.pdf' },
    revisado: '1 nov 2026',
    alcance: 'Tiempo del ECG (10 min), aspirina, nitroglicerina, oxígeno solo con SatO₂ < 90%, metas de reperfusión (ICP ≤ 90 min o fibrinólisis ≤ 30 min si la ICP no llega en 120 min) y anticoagulación. La tabla de tenecteplasa y la lista de contraindicaciones de la fibrinólisis siguen el estándar ACC/AHA y no se re-verificaron hoy.',
    kw: 'dolor toracico infarto IAMCEST SCA sindrome coronario angina troponina ECG elevacion ST fibrinolisis tenecteplasa aspirina nitroglicerina',
    nodos: {
        inicio: { tipo: 'q', corto: 'Estabilidad',
            t: 'Dolor o molestia torácica aguda: ¿hay inestabilidad o una causa inmediata de riesgo vital?',
            det: ['Hipotensión o choque, síncope, hipoxemia grave, arritmia ventricular o falla cardíaca aguda',
                  'Dolor desgarrante hacia la espalda, con pulsos o PA asimétricos (disección aórtica)',
                  'Disnea súbita con factores de riesgo (embolia pulmonar) o ausencia de murmullo unilateral (neumotórax)',
                  'Ingurgitación yugular con hipotensión y ruidos velados (taponamiento)'],
            opts: [{ t: 'Sí: inestable o sospecha de causa de riesgo vital', to: 'estab' }, { t: 'No: estable', to: 'ecg' }] },
        estab: { tipo: 'act', corto: 'Estabilizar',
            t: 'Estabiliza y busca la causa mientras haces el ECG',
            det: ['Vía aérea, acceso IV, monitor y desfibrilador a mano',
                  'Oxígeno solo si la SatO₂ es < 90%',
                  'ECG de 12 derivaciones inmediato',
                  'Sospecha de disección: NO anticoagules ni fibrinolices; control del dolor y de la PA y remisión urgente',
                  'Neumotórax a tensión: descompresión inmediata. Taponamiento: remisión urgente (ver Tríada de Beck)'],
            links: [{ l: 'Tríadas clínicas', tab: 'triadas' }, { l: 'Calcular PAM', calc: 'pam' }],
            sig: 'ecg' },
        ecg: { tipo: 'q', corto: 'ECG en 10 min',
            t: 'ECG de 12 derivaciones en los primeros 10 minutos desde que llega. ¿Qué muestra?',
            det: ['Elevación del ST en 2 derivaciones contiguas, o BRI nuevo con clínica compatible = IAMCEST',
                  'Depresión del ST o inversión de la onda T = posible SCA sin elevación',
                  'Repite el ECG cada 15-30 minutos si el dolor persiste y el primero fue normal'],
            opts: [{ t: 'Elevación del ST / sospecha de IAMCEST', to: 'stemi' },
                   { t: 'Cambios isquémicos sin elevación del ST', to: 'nste' },
                   { t: 'ECG normal o inespecífico', to: 'normal' }] },
        stemi: { tipo: 'act', corto: 'IAMCEST',
            t: 'IAMCEST: aspirina, analgesia, anticoagulación y reperfusión URGENTE',
            det: ['Aspirina masticada ahora, si no hay alergia ni sangrado activo',
                  'Nitroglicerina 0.4 mg sublingual c/5 min hasta 3 dosis si la PAS es > 90 mmHg. Evítala si hay infarto de ventrículo derecho, bradicardia o taquicardia marcada, o uso reciente de sildenafilo o tadalafilo',
                  'Dolor que no cede: opioide IV a dosis bajas con precaución (morfina 1-5 mg o fentanilo 25-50 mcg)',
                  'Descarta disección aórtica antes de anticoagular o fibrinolizar',
                  'Meta de reperfusión: ICP primaria en ≤ 90 min desde el primer contacto. Si la ICP no puede hacerse en 120 min: fibrinólisis en ≤ 30 min desde la llegada',
                  'Inicia el traslado a un centro con ICP en paralelo con el tratamiento'],
            dosis: [D_ASA, D_HEP, D_ENOX],
            links: [{ l: 'Ver Aspirina', drug: 'Ácido acetilsalicílico (ASA)' }, { l: 'Ver Nitroglicerina', drug: 'Nitroglicerina' }, { l: 'Ver Heparina', drug: 'Heparina no fraccionada' }, { l: 'Ver Enoxaparina', drug: 'Enoxaparina' }],
            opts: [{ t: 'La ICP es posible en ≤ 120 min', to: 'icp' }, { t: 'La ICP NO es posible en 120 min: evaluar fibrinólisis', to: 'lisis' }] },
        icp: { tipo: 'fin', tono: 'crit', corto: 'Traslado a ICP',
            t: 'Traslado urgente a un centro con ICP primaria',
            det: ['Activa el código infarto y la red de referencia; envía el ECG por adelantado',
                  'Viaja con monitor y desfibrilador, acceso IV y la medicación ya iniciada',
                  'Entrega la hora de inicio de los síntomas, la hora de la aspirina y las dosis del anticoagulante',
                  'Si hay contraindicación absoluta para la fibrinólisis, la ICP es la única opción de reperfusión: traslada aunque se supere el tiempo ideal'] },
        lisis: { tipo: 'q', corto: 'Contraindicaciones',
            t: 'Fibrinólisis: ¿hay alguna contraindicación ABSOLUTA?',
            det: ['Hemorragia intracraneal previa; ACV isquémico en los últimos 3 meses',
                  'Tumor o malformación arteriovenosa intracraneal; cirugía intracraneal o espinal reciente',
                  'Sangrado interno activo (excluyendo la menstruación); sospecha de disección aórtica',
                  'Traumatismo craneal o facial significativo reciente (3 meses)',
                  'Relativas (valora el balance): PA > 180/110 sostenida, anticoagulación oral, embarazo, cirugía mayor en las últimas 3 semanas, reanimación prolongada o traumática'],
            opts: [{ t: 'Sin contraindicaciones absolutas', to: 'tnk' }, { t: 'Hay contraindicación absoluta', to: 'icp' }] },
        tnk: { tipo: 'act', corto: 'Fibrinólisis',
            t: 'Fibrinólisis, anticoagulación y traslado',
            det: ['Tiempo puerta-aguja ≤ 30 minutos: el beneficio es máximo en las primeras horas',
                  'Usa el fibrinolítico que tengas (tenecteplasa, alteplasa o estreptoquinasa) con el esquema de su ficha',
                  'Aspirina (ya administrada) + inhibidor P2Y12 según el protocolo local; anticoagulación con enoxaparina o heparina',
                  'Vigila arritmias de reperfusión, sangrado y cambios neurológicos',
                  'Tras la lisis, traslada a un centro con ICP (habitualmente dentro de las primeras 24 horas)'],
            dosis: [D_TNK, D_HEP, D_ENOX],
            links: [{ l: 'Ver Tenecteplasa', drug: 'Tenecteplasa' }],
            opts: [{ t: 'Reperfusión exitosa (cede el dolor y el ST baja > 50% a los 60-90 min)', to: 'post_lisis' }, { t: 'Sin criterios de reperfusión', to: 'icp' }] },
        post_lisis: { tipo: 'fin', tono: 'warn', corto: 'Post-lisis',
            t: 'Lisis exitosa: observación y traslado programado a un centro con ICP',
            det: ['Monitoreo continuo y ECG seriados', 'Reevalúa sangrado y estado neurológico con frecuencia', 'Traslada para angiografía y estratificación en un centro con ICP'] },
        nste: { tipo: 'act', corto: 'SCA sin elevación',
            t: 'SCA sin elevación del ST (o sospecha alta): tratamiento y estratificación',
            det: ['Aspirina masticada y nitroglicerina para el dolor (mismas precauciones)',
                  'Anticoagulación con enoxaparina (1 mg/kg c/12h) o heparina no fraccionada',
                  'Troponina (o troponina de alta sensibilidad) y ECG seriados',
                  'ICP inmediata si hay dolor refractario, arritmia ventricular, falla cardíaca o choque',
                  'Si estás en un servicio sin hemodinamia ni troponina, remite al paciente con riesgo moderado o alto'],
            dosis: [D_ASA, D_HEP, D_ENOX],
            links: [{ l: 'Ver Enoxaparina', drug: 'Enoxaparina' }],
            opts: [{ t: 'Inestable (dolor refractario, arritmia, choque)', to: 'icp' }, { t: 'Estable', to: 'hosp_sca' }] },
        hosp_sca: { tipo: 'fin', tono: 'warn', corto: 'Hospitalizar',
            t: 'SCA sin elevación estable: hospitalización o remisión',
            det: ['Monitoreo continuo, reposo y repetición de troponina según el protocolo', 'Estratificación del riesgo y decisión de coronariografía en un centro con hemodinamia', 'Continúa la anticoagulación y la antiagregación; trata el dolor y la ansiedad'] },
        normal: { tipo: 'q', corto: 'ECG normal',
            t: 'ECG normal o inespecífico: ¿cuál es el riesgo clínico?',
            det: ['Alto riesgo: dolor opresivo típico, irradiado, con esfuerzo o diaforesis; edad > 65; diabetes, enfermedad coronaria previa; troponina elevada',
                  'Un solo ECG normal NO descarta un síndrome coronario'],
            opts: [{ t: 'Dolor típico o alto riesgo, o troponina elevada', to: 'nste' },
                   { t: 'Bajo riesgo y troponina de alta sensibilidad negativa', to: 'bajo' },
                   { t: 'No tengo troponina disponible', to: 'sin_trop' }] },
        bajo: { tipo: 'fin', tono: 'ok', corto: 'Bajo riesgo',
            t: 'Bajo riesgo con troponina negativa: alta con seguimiento',
            det: ['Busca otras causas: pericarditis, embolia pulmonar, neumotórax, neumonía, reflujo, dolor musculoesquelético', 'Explica los signos de alarma: dolor opresivo, disnea, sudoración, síncope', 'Control temprano y manejo de los factores de riesgo'],
            links: [{ l: 'Escala de Wells para TVP', calc: 'wellstvp' }] },
        sin_trop: { tipo: 'fin', tono: 'warn', corto: 'Sin troponina',
            t: 'Sin troponina: no descartes el síndrome coronario con un solo ECG',
            det: ['Observación prolongada con ECG seriados (cada 15-30 minutos mientras haya dolor), o remisión a un centro con troponina',
                  'Da aspirina si la sospecha clínica es moderada o alta y no hay contraindicación',
                  'El dolor reproducible a la palpación no descarta un síndrome coronario',
                  'Si el dolor es atípico, busca otras causas (pericarditis, embolia pulmonar, neumotórax, neumonía, reflujo)'] }
    }
},
{
    id: 'fiebre_lactante', titulo: 'Fiebre en el lactante menor de 90 días', area: 'Pediatría', pob: ['pediatrico'], peso: false,
    fuente: { t: 'AAP 2021 · lactante febril de 8 a 60 días (guía de práctica clínica)', url: 'https://downloads.aap.org/AAP/QI/REVISE2/REVISE%20II%20Febrile%20Infant%20Matrix%206.6.pdf' },
    revisado: '1 nov 2026',
    alcance: 'Estratificación por edad y valores de referencia de los marcadores según la AAP 2021 (lactantes de 8 a 60 días con buen aspecto). Los lactantes de 61 a 90 días, los menores de 8 días y las dosis antibióticas por peso no están verificados: se remite a neonatología.',
    kw: 'fiebre lactante recien nacido neonato bebe menor de 3 meses fiebre sin foco sepsis neonatal meningitis procalcitonina urocultivo',
    nodos: {
        inicio: { tipo: 'q', corto: 'Aspecto',
            t: 'Lactante menor de 90 días con fiebre (≥ 38.0 °C, medida rectal): ¿se ve enfermo o inestable?',
            det: ['Letargia, irritabilidad inconsolable, rechazo de la alimentación, mala perfusión', 'Apnea o dificultad respiratoria; hipotermia (< 36 °C); petequias; fontanela abombada', 'No uses la respuesta al antipirético para decidir la conducta'],
            opts: [{ t: 'Mal aspecto o inestable', to: 'sepsis' }, { t: 'Buen aspecto', to: 'edad' }] },
        sepsis: { tipo: 'fin', tono: 'crit', corto: 'Sepsis',
            t: 'Mal aspecto: trata como sepsis / meningitis neonatal y remite de inmediato',
            det: ['ABC, oxígeno, glucemia, acceso IV/IO y monitoreo; bolos de cristaloide según la perfusión, con cautela',
                  'Hemocultivo y antibiótico empírico SIN demora: no esperes el resultado de la punción lumbar',
                  'Esquema habitual: ampicilina + gentamicina, o ampicilina + cefotaxima si sospechas meningitis. Evita la ceftriaxona en neonatos de 28 días o menos. Dosis por peso: neonatología / tu vademécum (verificación pendiente)',
                  'Considera aciclovir si hay vesículas, convulsiones, hipotermia o antecedente materno de herpes',
                  'Remite a una unidad neonatal o de cuidados intensivos pediátricos con acompañamiento'],
            links: [{ l: 'Ver Ceftriaxona', drug: 'Ceftriaxona' }] },
        edad: { tipo: 'q', corto: 'Edad',
            t: '¿Qué edad tiene el lactante?',
            opts: [{ t: 'Menos de 8 días o prematuro', to: 'rn' }, { t: '8 a 21 días', to: 'hosp' }, { t: '22 a 28 días', to: 'd28' }, { t: '29 a 60 días', to: 'd60' }, { t: '61 a 90 días', to: 'd90' }] },
        rn: { tipo: 'fin', tono: 'crit', corto: 'Recién nacido',
            t: 'Menor de 8 días o prematuro: manejo como sepsis neonatal',
            det: ['La guía AAP no cubre a estos lactantes: tienen el mayor riesgo de infección bacteriana invasiva', 'Estudio completo (hemocultivo, urocultivo, líquido cefalorraquídeo) y antibiótico empírico', 'Remite a neonatología'] },
        d28: { tipo: 'q', corto: '22-28 días',
            t: '22 a 28 días con buen aspecto: hemocultivo, urocultivo y marcadores inflamatorios. ¿Cómo salen?',
            det: ['Referencia AAP 2021: procalcitonina > 0.5 ng/mL, PCR > 20 mg/L, recuento absoluto de neutrófilos > 4 000/mm³ (> 5 200 si no hay procalcitonina) o T > 38.5 °C = marcadores anormales',
                  'Sin laboratorio: trata a este lactante como si tuviera marcadores anormales y remite'],
            opts: [{ t: 'Marcadores anormales, o no tengo laboratorio', to: 'hosp' }, { t: 'Marcadores normales', to: 'hosp_obs' }] },
        d60: { tipo: 'q', corto: '29-60 días',
            t: '29 a 60 días con buen aspecto: urianálisis, urocultivo y marcadores inflamatorios. ¿Cómo salen?',
            det: ['Un urianálisis anormal o marcadores anormales (valores de referencia: ver 22-28 días) obligan a punción lumbar, antibiótico y hospitalización',
                  'Si todo es normal y puedes garantizar el seguimiento a las 24 horas, el manejo en observación o domiciliario es una opción (bajo riesgo)'],
            opts: [{ t: 'Anormal, o no tengo laboratorio ni seguimiento garantizado', to: 'hosp' }, { t: 'Todo normal y seguimiento garantizado a las 24 h', to: 'ambul' }] },
        d90: { tipo: 'q', corto: '61-90 días',
            t: '61 a 90 días: la guía AAP no cubre este grupo',
            det: ['Muchos protocolos locales los incluyen: examen clínico, urianálisis y marcadores según tu protocolo', 'La fiebre en un lactante menor de 3 meses es de alto riesgo: ante la duda, remite'],
            opts: [{ t: 'Anormal, dudoso o sin laboratorio', to: 'hosp' }, { t: 'Todo normal y seguimiento garantizado a las 24 h', to: 'ambul' }] },
        hosp: { tipo: 'fin', tono: 'crit', corto: 'Hospitalizar',
            t: 'Hospitalización con estudio completo y antibiótico empírico',
            det: ['Hemocultivo, urocultivo (sonda o punción), punción lumbar y marcadores inflamatorios', 'Antibiótico IV empírico; la dosis por peso la define neonatología (verificación pendiente en este módulo)',
                  'Si no puedes hacer el estudio completo en tu servicio, remite: no manejes ambulatoriamente a un lactante febril de menos de 28 días', 'Notifica a la familia el motivo y los signos de alarma'],
            links: [{ l: 'Ver Ceftriaxona', drug: 'Ceftriaxona' }] },
        hosp_obs: { tipo: 'fin', tono: 'warn', corto: 'Observación',
            t: 'Marcadores normales a los 22-28 días: observación hospitalaria',
            det: ['La AAP permite observar sin antibiótico, o iniciarlo si hay dudas, con vigilancia hospitalaria hasta el resultado de los cultivos', 'Si no puedes observarlo en tu servicio, remite'] },
        ambul: { tipo: 'fin', tono: 'warn', corto: 'Seguimiento',
            t: 'Bajo riesgo: observación y control a las 24 horas',
            det: ['Control a las 24 horas con examen clínico y revisión del resultado del urocultivo y hemocultivo', 'Explica los signos de alarma: rechazo de la alimentación, somnolencia, dificultad para respirar, vómito, irritabilidad, cambio de color', 'Asegura que la familia pueda volver a cualquier hora'] }
    }
},
{
    id: 'ofidismo', titulo: 'Accidente ofídico (mordedura de serpiente)', area: 'Urgencias de campo', pob: ['adulto', 'pediatrico'], peso: false,
    fuente: { t: 'INS e INVIMA · protocolo de accidente ofídico en Colombia', url: 'https://www.ins.gov.co/buscador-eventos/Informesdeevento/ACCIDENTE%20OFIDICO%20INFORME%20DE%20EVENTO%202024.pdf' },
    revisado: '1 nov 2026',
    alcance: 'Predominio de los envenenamientos botrópicos (≈ 90% de los casos), dosis del suero antiofídico polivalente y antielapídico por gravedad según el material del INS/INVIMA, y medidas de primeros auxilios. La dosis del suero depende del lote: confirma con el inserto y con toxicología. No se verificaron las dosis para crotálico y laquésico.',
    kw: 'accidente ofidico mordedura serpiente culebra mapana talla equis cascabel coral verrugosa suero antiofidico veneno botropico crotalico elapidico',
    nodos: {
        inicio: { tipo: 'act', corto: 'Primeros auxilios',
            t: 'Primeros auxilios y traslado inmediato',
            det: ['Calma al paciente, retira anillos, relojes y ropa ajustada; inmoviliza el miembro afectado y trasládalo sin esfuerzo',
                  'NO apliques torniquete, ni hielo, ni cortes, ni succión, ni remedios caseros o plantas',
                  'Marca el borde del edema y la hora; repite la marca cada 30 minutos',
                  'Analgesia con paracetamol; evita los AINE y la aspirina (riesgo de sangrado)',
                  'No captures la serpiente: una fotografía a distancia basta para identificarla',
                  'Acceso IV, hidratación y tétanos según el estado de vacunación',
                  'Traslada a un centro con suero antiofídico y laboratorio de coagulación'],
            links: [{ l: 'Ver Paracetamol', drug: 'Acetaminofén (Paracetamol)' }, { l: 'Notificar (SIVIGILA)', tab: 'sivigila' }],
            sig: 'tipo' },
        tipo: { tipo: 'q', corto: 'Tipo de accidente',
            t: '¿Qué tipo de envenenamiento sugiere la clínica?',
            det: ['Botrópico (mapaná, X, talla equis): dolor y edema que progresa, equimosis, ampollas, sangrado (gingivorragia, hematuria) y coagulopatía. Es ≈ 90% de los casos en Colombia',
                  'Laquésico (verrugosa, cuaima): igual que el botrópico más signos vagales (bradicardia, hipotensión, diarrea)',
                  'Crotálico (cascabel): poco edema local, ptosis, visión borrosa, mialgias y orina oscura (rabdomiólisis)',
                  'Elapídico (coral): poco dolor local, ptosis, oftalmoplejía, disfagia y debilidad progresiva (puede llegar a parálisis respiratoria)'],
            opts: [{ t: 'Botrópico o laquésico', to: 'bothrops' }, { t: 'Crotálico', to: 'crotalus' }, { t: 'Elapídico (coral)', to: 'micrurus' }, { t: 'No hay signos de envenenamiento', to: 'obs' }] },
        obs: { tipo: 'fin', tono: 'warn', corto: 'Observación',
            t: 'Sin signos de envenenamiento: observación y reevaluación seriada',
            det: ['No descartes el envenenamiento con un solo examen: puede manifestarse horas después, sobre todo en el accidente elapídico', 'Reevalúa el sitio, los signos neurológicos y la coagulación de forma seriada; mantén la observación varias horas', 'Si aparece edema progresivo, sangrado, ptosis o debilidad, vuelve a este algoritmo'] },
        bothrops: { tipo: 'q', corto: 'Gravedad botrópica',
            t: 'Clasifica la gravedad del accidente botrópico / laquésico',
            det: ['Prueba de coagulación en tubo (20 minutos) y laboratorio: si la sangre no coagula, hay coagulopatía',
                  'Leve: edema local limitado, sin sangrado y con coagulación normal',
                  'Moderado: edema que progresa a más segmentos, equimosis, sangrado leve o coagulación alterada',
                  'Grave: edema extenso, sangrado sistémico, hipotensión o choque, falla renal o compromiso neurológico'],
            opts: [{ t: 'Leve', to: 'sb1' }, { t: 'Moderado', to: 'sb2' }, { t: 'Grave', to: 'sb3' }] },
        sb1: { tipo: 'act', corto: 'Suero: leve',
            t: 'Accidente botrópico LEVE: suero antiofídico polivalente',
            det: ['Diluye y administra IV lento según el inserto, con monitoreo y adrenalina lista por el riesgo de anafilaxia (ver el algoritmo de Anafilaxia)', 'Reevalúa la coagulación y el edema c/6 horas'],
            dosis: [fx('Suero antiofídico polivalente (INS)', '2 viales IV', 'Tabla del INS; confirma con el inserto del lote y con toxicología.')],
            sig: 'soporte' },
        sb2: { tipo: 'act', corto: 'Suero: moderado',
            t: 'Accidente botrópico MODERADO: suero antiofídico polivalente',
            det: ['Diluye y administra IV lento según el inserto, con monitoreo y adrenalina lista', 'Remite a un nivel de mayor complejidad con laboratorio de coagulación'],
            dosis: [fx('Suero antiofídico polivalente (INS)', '4 viales IV', 'Tabla del INS; confirma con el inserto del lote y con toxicología.')],
            sig: 'soporte' },
        sb3: { tipo: 'act', corto: 'Suero: grave',
            t: 'Accidente botrópico GRAVE: suero antiofídico polivalente y remisión urgente',
            det: ['Diluye y administra IV lento según el inserto, con monitoreo continuo y adrenalina lista', 'Reposición de líquidos, vigilancia renal y de la diuresis; remisión urgente a UCI o nivel IV'],
            dosis: [fx('Suero antiofídico polivalente (INS)', '6 viales IV', 'Tabla del INS; confirma con el inserto del lote y con toxicología.')],
            sig: 'soporte' },
        soporte: { tipo: 'q', corto: 'Reevaluación',
            t: 'Reevalúa a las 6 horas: ¿cómo evolucionan el sangrado, la coagulación y el edema?',
            det: ['Mantén la hidratación, la analgesia sin AINE y el control de la diuresis', 'Vigila el síndrome compartimental (dolor desproporcionado, parestesias, pulsos disminuidos): la fasciotomía solo con confirmación y después de corregir la coagulopatía', 'No des antibiótico profiláctico de rutina; trata solo si hay infección'],
            opts: [{ t: 'Mejora: cede el sangrado y la coagulación se normaliza', to: 'alta' }, { t: 'Persiste el sangrado o la coagulación alterada, o empeora', to: 'repetir' }] },
        repetir: { tipo: 'fin', tono: 'crit', corto: 'Repetir suero',
            t: 'Respuesta insuficiente: repite el suero y remite',
            det: ['Repite la dosis de suero según el inserto y la indicación de toxicología', 'Remite a un centro con UCI, banco de sangre y soporte renal', 'Descarta otras causas de sangrado y de coagulopatía'] },
        alta: { tipo: 'fin', tono: 'ok', corto: 'Evolución favorable',
            t: 'Evolución favorable: observación y seguimiento',
            det: ['Observa hasta que la coagulación se mantenga normal y el edema se estabilice', 'Explica los signos de alarma: sangrado, dolor intenso, fiebre, orina oscura, disminución de la orina', 'Notifica el evento (SIVIGILA) y completa el esquema antitetánico'],
            links: [{ l: 'Notificar (SIVIGILA)', tab: 'sivigila' }] },
        crotalus: { tipo: 'fin', tono: 'crit', corto: 'Crotálico',
            t: 'Accidente crotálico: trátalo como GRAVE y remite a nivel III-IV',
            det: ['Suero antiofídico según la tabla del INS y la indicación de toxicología (no se incluyó una dosis en esta versión)', 'Hidratación abundante y vigilancia de la orina oscura (mioglobinuria) y de la función renal', 'Vigila la función ventilatoria y el compromiso neuromuscular; evita los AINE'] },
        micrurus: { tipo: 'fin', tono: 'crit', corto: 'Elapídico',
            t: 'Accidente elapídico (coral): suero antielapídico y vigilancia ventilatoria',
            det: ['El cuadro puede evolucionar en horas hacia la parálisis respiratoria: mantén la vía aérea y la ventilación a mano', 'Remite a un nivel de mayor complejidad con ventilación mecánica'],
            dosis: [fx('Suero antielapídico (anticoral)', '5 viales si no hay signos paralíticos o solo ptosis; 10 viales si el cuadro es moderado a grave', 'Confirma con el inserto del suero y con toxicología.')] }
    }
},
{
    id: 'organofosforados', titulo: 'Intoxicación por organofosforados y carbamatos', area: 'Urgencias de campo', pob: ['adulto', 'pediatrico'], peso: true,
    fuente: { t: 'LITFL · intoxicación por organofosforados; BMJ Best Practice', url: 'https://litfl.com/ccc/organophosphate-poisoning' },
    revisado: '1 nov 2026',
    alcance: 'Atropina (inicio, duplicación hasta atropinizar, vía IM y mantenimiento), pralidoxima, benzodiacepinas, descontaminación y preferencia por relajantes no despolarizantes. El beneficio clínico de la pralidoxima es discutido y menor en carbamatos; consulta a toxicología.',
    kw: 'organofosforados carbamatos plaguicidas intoxicacion atropina pralidoxima colinergico miosis sialorrea broncorrea paration insecticida agroquimico',
    nodos: {
        inicio: { tipo: 'q', corto: 'Reconocer',
            t: '¿Hay exposición a un plaguicida con un síndrome colinérgico?',
            det: ['Miosis, salivación y lagrimeo, broncorrea y sibilancias, bradicardia', 'Vómito, diarrea, incontinencia, sudoración intensa', 'Fasciculaciones, debilidad, convulsiones, alteración de la conciencia', 'Olor a ajo o a solvente, ropa impregnada, antecedente de fumigación o ingestión'],
            opts: [{ t: 'Sí: síndrome colinérgico probable', to: 'seguridad' }, { t: 'Poco probable', to: 'otra' }] },
        otra: { tipo: 'fin', tono: 'warn', corto: 'Poco probable',
            t: 'Otra intoxicación u otra causa',
            det: ['Considera otros toxidromas (anticolinérgico, simpaticomimético, opioide) y otras causas de coma o insuficiencia respiratoria', 'Si hay dudas, reevalúa con frecuencia y consulta a toxicología'] },
        seguridad: { tipo: 'act', corto: 'Seguridad y descontaminación',
            t: 'Protege al personal y descontamina SIN retrasar la atropina',
            det: ['Guantes y bata impermeables; ventila el área: el plaguicida puede contaminar al personal',
                  'Quita toda la ropa y lava la piel y el cabello con agua y jabón',
                  'Vía aérea y oxígeno: en entornos con pocos recursos no retrases la atropina esperando el oxígeno',
                  'Acceso IV, monitor y aspiración de secreciones',
                  'Evita la succinilcolina (parálisis prolongada); si hay que intubar, prefiere un relajante no despolarizante',
                  'Carbón activado 1 g/kg solo si la ingestión fue en la última hora y la vía aérea está protegida (utilidad incierta)'],
            sig: 'atropina' },
        atropina: { tipo: 'act', corto: 'Atropina',
            t: 'Atropina IV a dosis crecientes hasta ATROPINIZAR',
            det: ['Duplica la dosis cada 5 minutos hasta lograr atropinización: pecho limpio (sin sibilancias ni estertores), FC > 80, PAS > 80 y secreciones secas',
                  'La miosis y la sudoración NO son metas de la atropina',
                  'Sin vía IV: atropina IM 2-4 mg (leve a moderada) o 6 mg (grave) y luego 2 mg c/5-10 min',
                  'Una vez atropinizado: infusión del 10-20% de la dosis total de carga por hora, ajustada a la respuesta',
                  'Vigila signos de exceso (delirio, fiebre, retención urinaria, taquicardia marcada) y reduce la infusión'],
            dosis: [{ n: 'Atropina IV: dosis inicial', fijo: true, nota: 'Niños: 0.02 mg/kg (mínimo 0.1 mg). Duplica cada 5 min hasta atropinizar.',
                      f: (kg, pob) => pob === 'pediatrico' ? (kg > 0 ? `${fmtN(Math.max(0.02 * kg, 0.1))} mg` : 'Ingresa el peso: 0.02 mg/kg (mín 0.1 mg)') : '1 - 3 mg' }],
            links: [{ l: 'Ver Atropina', drug: 'Atropina' }],
            opts: [{ t: 'Atropinizado', to: 'oxima' }, { t: 'Aún no: duplica la dosis', to: 'atropina' }] },
        oxima: { tipo: 'act', corto: 'Pralidoxima y soporte',
            t: 'Pralidoxima (si hay disponible) y benzodiacepinas para convulsiones',
            det: ['La pralidoxima se da JUNTO con la atropina, nunca en lugar de ella; su beneficio clínico es discutido y menor en carbamatos',
                  'Convulsiones o agitación: benzodiacepina (diazepam)',
                  'Insuficiencia respiratoria: intubación con relajante no despolarizante y ventilación; remite a UCI',
                  'Sin pralidoxima en tu servicio: continúa la atropina y remite; consulta a toxicología'],
            dosis: [{ n: 'Pralidoxima IV: carga', nota: 'En 20-30 minutos, y luego infusión continua. Si no hay peso: adultos 2 g, luego 500 mg/h.',
                      f: (kg, pob) => pob === 'pediatrico' ? `${fmtN(25 * kg)} - ${fmtN(50 * kg)} mg (25-50 mg/kg); luego ${fmtN(10 * kg)} - ${fmtN(20 * kg)} mg/h (10-20 mg/kg/h)` : `${fmtN(30 * kg)} mg (30 mg/kg); luego ${fmtN(8 * kg)} mg/h (8 mg/kg/h)` },
                { n: 'Diazepam IV', nota: 'Repetible según la respuesta.', f: (kg, pob) => pob === 'pediatrico' ? `${fmtN(0.05 * kg)} - ${fmtN(Math.min(0.3 * kg, 10))} mg` : '5 - 10 mg' }],
            links: [{ l: 'Ver Pralidoxima', drug: 'Pralidoxima' }, { l: 'Ver Diazepam', drug: 'Diazepam' }],
            opts: [{ t: 'Estable y mejorando', to: 'obs' }, { t: 'Insuficiencia respiratoria, convulsiones o inestable', to: 'uci' }] },
        obs: { tipo: 'fin', tono: 'warn', corto: 'Observación',
            t: 'Estable: observación prolongada y notificación',
            det: ['Observa al menos 24-48 horas con monitoreo: puede reaparecer el síndrome colinérgico o aparecer el síndrome intermedio (24-96 h: debilidad de cuello, de flexores proximales y de músculos respiratorios)', 'Reevalúa la atropinización y reduce la infusión de forma gradual',
                  'Notifica el evento (intoxicación por sustancias químicas) en SIVIGILA; si fue intencional, notifica también el intento de suicidio y pide valoración de salud mental', 'Remite a un nivel con UCI si hay debilidad respiratoria progresiva'],
            links: [{ l: 'Notificar (SIVIGILA)', tab: 'sivigila' }] },
        uci: { tipo: 'fin', tono: 'crit', corto: 'UCI',
            t: 'Insuficiencia respiratoria o inestabilidad: soporte avanzado y remisión a UCI',
            det: ['Intubación (relajante no despolarizante, como rocuronio) y ventilación mecánica', 'Mantén la atropina a dosis altas y la pralidoxima; benzodiacepinas para las convulsiones', 'Remite a UCI con toxicología; avisa la sustancia, la hora de la exposición y las dosis recibidas'] }
    }
},
{
    id: 'rabia_tetanos', titulo: 'Mordedura o herida: profilaxis de rabia y tétanos', area: 'Urgencias de campo', pob: ['adulto', 'pediatrico'], peso: true,
    fuente: { t: 'OMS · profilaxis posexposición de la rabia (ACIP 2022 para el esquema IM)', url: 'https://content.oppia-mobile.org/mod/page/view.php?id=6468' },
    revisado: '1 nov 2026',
    alcance: 'Lavado, categorías de exposición, inmunoglobulina por peso, infiltración y esquemas de vacuna según OMS y ACIP. El esquema oficial colombiano (MinSalud / INS) y la profilaxis antitetánica (estándar CDC/OMS) no se re-verificaron hoy.',
    kw: 'rabia mordedura perro gato murcielago murciélago herida tetanos vacuna antirrabica inmunoglobulina profilaxis posexposicion agresion animal',
    nodos: {
        inicio: { tipo: 'act', corto: 'Lavado de la herida',
            t: 'Lava la herida de inmediato, durante 15 minutos',
            det: ['Agua y jabón (o detergente) abundantes durante 15 minutos; luego un antiséptico (povidona yodada o alcohol al 70%)',
                  'No suturar la herida salvo hemorragia: si es indispensable, primero la inmunoglobulina',
                  'Analgesia y valoración del daño; en mordeduras considera antibiótico profiláctico (amoxicilina/clavulánico)',
                  'Notifica la agresión (código 300 en SIVIGILA)'],
            links: [{ l: 'Ver Amoxicilina/clavulánico', drug: 'Amoxicilina / Ácido clavulánico' }, { l: 'Notificar (SIVIGILA)', tab: 'sivigila' }],
            sig: 'cat' },
        cat: { tipo: 'q', corto: 'Categoría del contacto',
            t: '¿Cuál es la categoría del contacto (OMS)?',
            det: ['Categoría I: tocar o alimentar al animal, lamedura en piel íntegra = sin exposición',
                  'Categoría II: mordisco en piel descubierta, rasguños leves sin sangrado',
                  'Categoría III: mordeduras o rasguños que atraviesan la piel, lamedura de mucosas o piel con heridas, y cualquier contacto con murciélagos. Las mordeduras en cabeza, cuello, cara, manos y genitales cuentan como categoría III'],
            opts: [{ t: 'Categoría I', to: 'cat1' }, { t: 'Categoría II', to: 'animal2' }, { t: 'Categoría III', to: 'animal3' }] },
        cat1: { tipo: 'fin', tono: 'ok', corto: 'Sin exposición',
            t: 'Sin exposición: no necesita profilaxis antirrábica',
            det: ['Educa sobre prevención y vacunación de las mascotas', 'Revisa el estado de vacunación antitetánica si hubo herida (siguiente paso)'], links: [] },
        animal2: { tipo: 'q', corto: 'Animal (cat. II)',
            t: '¿El agresor es un perro o gato sano, vacunado y observable durante 10 días?',
            opts: [{ t: 'Sí, observable', to: 'v2obs' }, { t: 'No: silvestre, murciélago, desconocido o escapó', to: 'v2' }] },
        animal3: { tipo: 'q', corto: 'Animal (cat. III)',
            t: '¿El agresor es un perro o gato sano, vacunado y observable durante 10 días?',
            opts: [{ t: 'Sí, observable', to: 'v3obs' }, { t: 'No: silvestre, murciélago, desconocido o escapó', to: 'v3' }] },
        v2obs: { tipo: 'act', corto: 'Vacuna (cat. II, observable)',
            t: 'Categoría II con animal observable: inicia la vacuna y observa al animal',
            det: [...VAC_RABIA, 'Si el animal permanece sano durante los 10 días de observación, se puede suspender la vacuna (confirma con el lineamiento local)', 'Si el animal enferma, muere o desaparece: completa el esquema'], sig: 'tetanos' },
        v2: { tipo: 'act', corto: 'Vacuna (cat. II)',
            t: 'Categoría II sin animal observable: esquema completo de vacuna',
            det: VAC_RABIA, sig: 'tetanos' },
        v3obs: { tipo: 'act', corto: 'Vacuna + inmunoglobulina (cat. III, observable)',
            t: 'Categoría III con animal observable: vacuna + inmunoglobulina',
            det: [...VAC_RABIA, 'Inmunoglobulina antirrábica: infiltra la mayor parte en la herida y alrededor de ella, y el resto IM en un sitio distinto al de la vacuna; no la mezcles con la vacuna en la misma jeringa',
                  'Puede retrasarse hasta 7 días desde la primera dosis de vacuna, pero no después',
                  'Si el animal permanece sano 10 días, puedes suspender el esquema (confirma con el lineamiento local)'],
            dosis: [{ n: 'Inmunoglobulina antirrábica HUMANA', fijo: true, nota: 'Dosis total máxima: no la excedas.', f: kg => kg > 0 ? `${Math.round(20 * kg)} UI (20 UI/kg)` : 'Ingresa el peso: 20 UI/kg' },
                    { n: 'Inmunoglobulina antirrábica EQUINA', fijo: true, nota: 'Mayor riesgo de reacciones alérgicas: ten adrenalina lista.', f: kg => kg > 0 ? `${Math.round(40 * kg)} UI (40 UI/kg)` : 'Ingresa el peso: 40 UI/kg' }],
            sig: 'tetanos' },
        v3: { tipo: 'act', corto: 'Vacuna + inmunoglobulina (cat. III)',
            t: 'Categoría III sin animal observable: vacuna + inmunoglobulina, sin demora',
            det: [...VAC_RABIA, 'Inmunoglobulina antirrábica: infiltra la mayor parte en la herida y alrededor de ella, y el resto IM en un sitio distinto al de la vacuna', 'Puede retrasarse hasta 7 días desde la primera dosis de vacuna, pero no después',
                  'Si no hay inmunoglobulina en tu servicio, inicia la vacuna de inmediato y remite para conseguirla'],
            dosis: [{ n: 'Inmunoglobulina antirrábica HUMANA', fijo: true, nota: 'Dosis total máxima: no la excedas.', f: kg => kg > 0 ? `${Math.round(20 * kg)} UI (20 UI/kg)` : 'Ingresa el peso: 20 UI/kg' },
                    { n: 'Inmunoglobulina antirrábica EQUINA', fijo: true, nota: 'Mayor riesgo de reacciones alérgicas: ten adrenalina lista.', f: kg => kg > 0 ? `${Math.round(40 * kg)} UI (40 UI/kg)` : 'Ingresa el peso: 40 UI/kg' }],
            sig: 'tetanos' },
        tetanos: { tipo: 'q', corto: 'Tétanos',
            t: 'Profilaxis antitetánica: ¿cuál es su estado de vacunación?',
            det: ['Estándar CDC/OMS: depende de las dosis previas y de si la herida es limpia o sucia (tetanígena)'],
            opts: [{ t: '3 o más dosis y la última hace menos de 5 años (herida sucia) o menos de 10 años (limpia)', to: 'tet_ok' },
                   { t: 'Esquema completo pero la última dosis es más antigua', to: 'tet_boost' },
                   { t: 'Menos de 3 dosis o estado desconocido', to: 'tet_full' }] },
        tet_ok: { tipo: 'fin', tono: 'ok', corto: 'Tétanos: al día',
            t: 'Vacunación antitetánica al día: no necesita refuerzo ahora',
            det: ['Explica los signos de alarma de la herida (infección, fiebre, dolor creciente) y el control'] },
        tet_boost: { tipo: 'fin', tono: 'ok', corto: 'Tétanos: refuerzo',
            t: 'Refuerzo antitetánico: una dosis de Td / Tdap',
            det: ['No necesita inmunoglobulina antitetánica si el esquema previo estaba completo', 'Control de la herida y signos de alarma'] },
        tet_full: { tipo: 'fin', tono: 'warn', corto: 'Tétanos: vacuna + IG',
            t: 'Esquema incompleto o desconocido: vacuna antitetánica y, si la herida es sucia, inmunoglobulina',
            det: ['Inicia o completa el esquema con Td / Tdap', 'Herida sucia o tetanígena: inmunoglobulina antitetánica humana 250 UI IM en un sitio distinto al de la vacuna', 'Control de la herida y signos de alarma; completa las dosis restantes'] }
    }
}
);

/* ---------- Motor ---------- */
const ALG_TONES = {
    indigo:  { box: 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/70 dark:bg-indigo-950/30', lab: 'text-indigo-600 dark:text-indigo-400', name: 'PREGUNTA' },
    teal:    { box: 'border-teal-300 dark:border-teal-700 bg-teal-50/70 dark:bg-teal-950/30', lab: 'text-teal-600 dark:text-teal-400', name: 'ACCIÓN' },
    emerald: { box: 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/30', lab: 'text-emerald-600 dark:text-emerald-400', name: 'RESULTADO · CONTROLADO' },
    amber:   { box: 'border-amber-300 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-950/30', lab: 'text-amber-600 dark:text-amber-400', name: 'RESULTADO · ATENCIÓN' },
    rose:    { box: 'border-rose-300 dark:border-rose-700 bg-rose-50/70 dark:bg-rose-950/30', lab: 'text-rose-600 dark:text-rose-400', name: 'RESULTADO · URGENTE' },
    slate:   { box: 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800', lab: 'text-slate-500', name: 'RESULTADO' }
};

function algInit() { if (ALG.cur) algShowRun(); else algShowList(); }

function algShowList() {
    ALG.cur = null; ALG.path = [];
    document.getElementById('alg-run-view')?.classList.add('hidden');
    const lv = document.getElementById('alg-list-view'); if (!lv) return;
    lv.classList.remove('hidden');
    const areas = [...new Set(ALG_DATA.map(a => a.area))];
    const chip = (on, label, js) => `<button type="button" class="hc-chip${on ? ' on' : ''}" onclick="${js}">${label}</button>`;
    const fa = [chip(ALG.fArea === 'all', 'Todas las áreas', "ALG.fArea='all';algShowList()"), ...areas.map(x => chip(ALG.fArea === x, x, `ALG.fArea='${x}';algShowList()`))].join('');
    const fp = [['all', 'Todas las edades'], ['pediatrico', 'Pediátrico'], ['adulto', 'Adulto'], ['gestante', 'Gestante']].map(([v, l]) => chip(ALG.fPob === v, l, `ALG.fPob='${v}';algShowList()`)).join('');
    const list = ALG_DATA.filter(a => (ALG.fArea === 'all' || a.area === ALG.fArea) && (ALG.fPob === 'all' || a.pob.includes(ALG.fPob)));
    lv.innerHTML = `
        <div class="space-y-2"><div class="flex flex-wrap gap-1.5">${fa}</div><div class="flex flex-wrap gap-1.5">${fp}</div></div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        ${list.map(a => `
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-3">
                <div class="space-y-2">
                    <div class="flex items-start justify-between gap-2">
                        <h3 class="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">${a.titulo}</h3>
                        ${favStar('alg:' + a.id)}
                    </div>
                    <div class="flex flex-wrap gap-1.5 text-[10px] font-bold">
                        <span class="px-2 py-0.5 rounded bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300">${a.area}</span>
                        ${a.pob.map(p => `<span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">${POB_L[p]}</span>`).join('')}
                    </div>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">Fuente: ${a.fuente.t} · revisado ${a.revisado}</p>
                </div>
                <button type="button" onclick="algOpen('${a.id}')" class="py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow">Abrir algoritmo <i class="fa-solid fa-arrow-right ml-1"></i></button>
            </div>`).join('') || '<p class="text-xs text-slate-400 col-span-full">No hay algoritmos con esos filtros.</p>'}
        </div>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">En preparación: dolor torácico, sepsis y choque, crisis asmática, hipoglucemia y cetoacidosis, preeclampsia y hemorragia posparto, fiebre del lactante menor de 3 meses y urgencias de campo (ofidismo, organofosforados, rabia, tétanos).</p>`;
}

function algOpen(id) {
    const a = ALG_DATA.find(x => x.id === id); if (!a) return;
    ALG.cur = a; ALG.path = [{ id: 'inicio', choice: '' }];
    ALG.pob = a.pob.includes(ALG.pob) ? ALG.pob : a.pob[0];
    algShowRun();
}

function algShowRun() {
    const a = ALG.cur; if (!a) { algShowList(); return; }
    document.getElementById('alg-list-view')?.classList.add('hidden');
    const rv = document.getElementById('alg-run-view'); if (!rv) return;
    rv.classList.remove('hidden');
    const pobBtns = a.pob.length > 1
        ? `<div class="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">${a.pob.map(p => `<button type="button" onclick="algSetPob('${p}')" class="px-3 py-1.5 rounded-xl ${ALG.pob === p ? 'bg-teal-600 text-white shadow' : 'bg-transparent text-slate-600 dark:text-slate-300'}">${POB_L[p]}</button>`).join('')}</div>`
        : `<span class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">${POB_L[a.pob[0]]}</span>`;
    const pesoBox = a.peso
        ? `<div class="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><label for="alg-peso">Peso (kg):</label><input id="alg-peso" type="number" inputmode="decimal" step="any" min="0" value="${algEsc(ALG.peso)}" oninput="algPeso(this.value)" placeholder="Ej: 20" class="w-24 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"></div>` : '';
    rv.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
            <button type="button" onclick="algBack()" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"><i class="fa-solid fa-arrow-left mr-1"></i>Todos los algoritmos</button>
            <button type="button" onclick="algRestart()" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"><i class="fa-solid fa-rotate-left mr-1"></i>Reiniciar</button>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 space-y-3">
            <div class="flex flex-wrap items-start justify-between gap-3">
                <div><h3 class="font-extrabold text-base text-slate-900 dark:text-white">${a.titulo}</h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Fuente: <a href="${a.fuente.url}" target="_blank" rel="noopener" class="underline hover:text-teal-600">${a.fuente.t}</a> · revisado ${a.revisado}</p></div>
                <div class="flex flex-wrap items-center gap-3">${pobBtns}${pesoBox}</div>
            </div>
            <p class="text-[10px] text-slate-400 italic leading-snug">Alcance de la verificación: ${a.alcance}</p>
        </div>
        <div id="alg-trail"></div>
        <div id="alg-node"></div>
        <p class="text-[10px] text-slate-400 leading-snug">Apoyo a la decisión clínica: no sustituye la guía de tu institución, la ficha técnica ni el juicio clínico. Confirma las dosis antes de administrar.</p>`;
    algRenderNode();
}

function algRenderNode() {
    const a = ALG.cur; if (!a) return;
    const pob = ALG.pob, kg = parseFloat(ALG.peso), hasKg = !isNaN(kg) && kg > 0;
    const trail = ALG.path.slice(0, -1).map((p, i) => {
        const n = a.nodos[p.id];
        return `<button type="button" onclick="algGoStep(${i})" class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-left">${i + 1}. ${n.corto}${p.choice ? ': <b>' + algEsc(p.choice) + '</b>' : ''}</button>`;
    }).join('');
    document.getElementById('alg-trail').innerHTML = trail
        ? `<div class="flex flex-wrap gap-1.5"><span class="text-[10px] font-bold text-slate-400 self-center">Recorrido (toca un paso para volver):</span>${trail}</div>` : '';

    const cur = ALG.path[ALG.path.length - 1], n = a.nodos[cur.id];
    const box = document.getElementById('alg-node');
    if (!n) { box.innerHTML = `<p class="text-xs text-rose-600">Error: el nodo "${algEsc(cur.id)}" no existe.</p>`; return; }

    const T = ALG_TONES[n.tipo === 'q' ? 'indigo' : n.tipo === 'act' ? 'teal' : ({ ok: 'emerald', warn: 'amber', crit: 'rose' }[n.tono] || 'slate')];
    const det = algPick(n.det, pob) || [];
    const detHtml = det.length ? `<ul class="space-y-1.5 text-xs text-slate-700 dark:text-slate-200">${det.map(d => `<li class="flex gap-2"><i class="fa-solid fa-angle-right text-teal-500 mt-0.5 shrink-0"></i><span>${d}</span></li>`).join('')}</ul>` : '';

    let dosisHtml = '';
    if (n.dosis) {
        const rows = n.dosis.map(d => {
            const val = (hasKg || d.fijo) ? `<b class="text-teal-700 dark:text-teal-300">${d.f(kg, pob)}</b>` : '<span class="text-slate-400 font-normal">ingresa el peso</span>';
            return `<div class="py-1.5 border-b border-slate-100 dark:border-slate-700 last:border-0"><div class="flex flex-wrap items-baseline justify-between gap-2"><span class="font-bold">${d.n}</span>${val}</div>${d.nota ? `<div class="text-[10px] text-slate-500 dark:text-slate-400">${d.nota}</div>` : ''}</div>`;

        }).join('');
        dosisHtml = `<div class="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs"><div class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Dosis para ${hasKg ? kg + ' kg' : 'el paciente'}</div>${rows}</div>`;
    }

    const links = (n.links || []).map(l => {
        if (l.calc) return `<button type="button" onclick="openCalc('${l.calc}')" class="hc-chip">${l.l}</button>`;
        if (l.drug) return `<button type="button" data-n="${algEsc(l.drug)}" onclick="algOpenDrug(this.dataset.n)" class="hc-chip">${l.l}</button>`;
        return `<button type="button" onclick="switchTab('${l.tab}')" class="hc-chip">${l.l}</button>`;
    }).join('');

    let actions;
    if (n.opts) actions = `<div class="flex flex-col sm:flex-row flex-wrap gap-2 pt-1">${n.opts.map((o, i) => `<button type="button" onclick="algChoose(${i})" class="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/30 text-xs font-bold text-left">${o.t}</button>`).join('')}</div>`;
    else if (n.sig) actions = `<button type="button" onclick="algChoose(-1)" class="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow">Continuar <i class="fa-solid fa-arrow-right ml-1"></i></button>`;
    else actions = `<div class="flex flex-wrap gap-2 pt-1 text-xs font-bold">
            <button type="button" onclick="algToHC()" class="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white shadow"><i class="fa-solid fa-file-medical mr-1"></i>Llevar al plan de la Historia Clínica</button>
            <button type="button" onclick="algCopy()" class="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"><i class="fa-solid fa-copy mr-1"></i>Copiar recorrido</button>
            <button type="button" onclick="algRestart()" class="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"><i class="fa-solid fa-rotate-left mr-1"></i>Reiniciar</button>
            <span id="alg-msg" class="self-center text-emerald-600 dark:text-emerald-400 font-normal"></span></div>`;

    box.innerHTML = `
        <div class="rounded-2xl border-2 p-5 space-y-3 ${T.box}">
            <div class="text-[10px] font-extrabold tracking-wider ${T.lab}">${T.name}</div>
            <h3 class="font-extrabold text-base text-slate-900 dark:text-white leading-snug">${algPick(n.t, pob)}</h3>
            ${detHtml}${dosisHtml}
            ${links ? `<div class="flex flex-wrap gap-1.5">${links}</div>` : ''}
            ${actions}
        </div>`;
}

function algChoose(i) {
    const a = ALG.cur, last = ALG.path[ALG.path.length - 1], n = a.nodos[last.id];
    let to;
    if (i >= 0) { const o = n.opts[i]; last.choice = o.t; to = o.to; } else { last.choice = ''; to = n.sig; }
    ALG.path.push({ id: to, choice: '' });
    algRenderNode();
    document.getElementById('alg-node')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function algGoStep(i) { ALG.path = ALG.path.slice(0, i + 1); ALG.path[i].choice = ''; algRenderNode(); }
function algRestart() { ALG.path = [{ id: 'inicio', choice: '' }]; algRenderNode(); }
function algBack() { ALG.cur = null; ALG.path = []; algShowList(); }
function algPeso(v) { ALG.peso = v; algRenderNode(); }
function algSetPob(p) { ALG.pob = p; algShowRun(); }
function algOpenDrug(name) {
    switchTab('farmaco');
    document.querySelector('.vad-grp-btn')?.click();
    const s = document.getElementById('vademecum-search'); if (s) s.value = name;
    renderVademecum();
}

/* ---------- Resumen del recorrido ---------- */
function algSummary() {
    const a = ALG.cur, pob = ALG.pob, kg = parseFloat(ALG.peso);
    const L = [`ALGORITMO: ${a.titulo}${a.pob.length > 1 ? ' (' + POB_L[pob].toLowerCase() + ')' : ''}${!isNaN(kg) && kg > 0 ? ' · peso ' + kg + ' kg' : ''}`,
               `Fuente: ${a.fuente.t} · revisado ${a.revisado}`];
    ALG.path.forEach((p, i) => {
        const n = a.nodos[p.id], last = i === ALG.path.length - 1;
        L.push(`${i + 1}. ${n.corto}${p.choice ? ': ' + p.choice : ''}`);
        if (n.tipo === 'act' || last) L.push(`   → ${algPick(n.t, pob)}`);
        if (last) (algPick(n.det, pob) || []).forEach(d => L.push(`   - ${d}`));
    });
    return L.join('\n');
}
function algCopy() {
    const t = algSummary(), msg = () => { const m = document.getElementById('alg-msg'); if (m) { m.textContent = 'Recorrido copiado ✓'; setTimeout(() => m.textContent = '', 2500); } };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(msg);
    else { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); msg(); } catch (e) {} ta.remove(); }
}
function algToHC() {
    if (typeof hcOpen !== 'function') { alert('Para usar esta función necesitas el módulo Historia Clínica.'); return; }
    const txt = algSummary();
    switchTab('hc');
    const el = document.getElementById('hc-conducta'); if (!el) return;
    el.value = (el.value ? el.value + '\n\n' : '') + txt;
    hcUpdate();
    document.getElementById('hc-sec-dx')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function vadPendientes() {
    const el = document.getElementById('vad-pend'); if (!el) return;
    const g = {};
    vademecumData.filter(v => !v.verificado).forEach(v => (g[v.group] = g[v.group] || []).push(v.name));
    el.innerHTML = Object.entries(g).map(([k, a]) => `<div class="mb-1"><b class="text-slate-700 dark:text-slate-200">${k} (${a.length}):</b> ${a.join(', ')}</div>`).join('') || '<div>Todo verificado.</div>';
}

// ============================================================
// ADROOSIS | EXAMEN NEUROLÓGICO INTERACTIVO
// ============================================================

const NEURO_KEY = 'adroosis_neuro_exam_v1';


let neuroState = {
    status: {},
    detail: {},
    side: {},
    metric: {}
};

let neuroActiveSection = 'mental';

function neuroEsc(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({
        '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    })[c]);
}

function neuroLoad() {
    try {
        const saved = localStorage.getItem(NEURO_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            neuroState = {
                status: parsed.status || {},
                detail: parsed.detail || {},
                side: parsed.side || {},
                metric: parsed.metric || {}
            };
        }
    } catch (e) {
        console.warn('No fue posible recuperar el examen neurológico.', e);
    }
}

function neuroSave() {
    try {
        localStorage.setItem(NEURO_KEY, JSON.stringify(neuroState));
    } catch (e) {
        console.warn('No fue posible guardar el examen neurológico.', e);
    }
}

function neuroSet(type, id, value) {
    if (!neuroState[type]) neuroState[type] = {};
    neuroState[type][id] = value;
    neuroSave();
    neuroUpdateProgress();
    neuroUpdateSectionNav();
}

function neuroSetMetric(id, side, value) {
    if (!neuroState.metric[id]) neuroState.metric[id] = {};
    neuroState.metric[id][side] = value;
    neuroSave();
    neuroUpdateProgress();
}

function neuroGetStatus(id) {
    return neuroState.status[id] || 'pending';
}

function neuroStatusLabel(status) {
    return {
        normal: 'Normal',
        abnormal: 'Alterado',
        pending: 'No evaluado',
        na: 'No aplica'
    }[status] || 'No evaluado';
}

function neuroRender() {
    neuroLoad();
    neuroRenderNav();
    neuroRenderSection(neuroActiveSection);
    neuroUpdateProgress();
}

function neuroRenderNav() {
    const nav = document.getElementById('neuro-section-nav');
    if (!nav) return;

    nav.innerHTML = NEURO_SECTIONS.map(s => {
        const total = s.items.length;
        const done = s.items.filter(i => neuroGetStatus(i[0]) !== 'pending').length;
        const altered = s.items.filter(i => neuroGetStatus(i[0]) === 'abnormal').length;
        const active = neuroActiveSection === s.id;

        return `
        <button type="button" onclick="neuroRenderSection('${s.id}')"
            class="text-left rounded-xl border p-3 transition-all
            ${active
                ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal-300'}">
            <div class="flex items-center justify-between gap-2">
                <i class="fa-solid ${s.icon} text-${s.color}-600 dark:text-${s.color}-400"></i>
                <span class="text-[10px] font-bold ${altered ? 'text-rose-600' : 'text-slate-400'}">
                    ${altered ? altered + ' alterado(s)' : done + '/' + total}
                </span>
            </div>
            <div class="mt-2 text-xs font-extrabold text-slate-800 dark:text-slate-100">${s.short}</div>
            <div class="mt-1 text-[10px] text-slate-500">${done} de ${total} registradas</div>
        </button>`;
    }).join('');
}

function neuroUpdateSectionNav() {
    neuroRenderNav();
}

function neuroRenderSection(sectionId) {
    const section = NEURO_SECTIONS.find(s => s.id === sectionId);
    const container = document.getElementById('neuro-section-content');
    if (!section || !container) return;

    neuroActiveSection = sectionId;
    neuroRenderNav();

    let html = `
    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-100 dark:border-slate-700">
            <div class="flex items-start gap-3">
                <div class="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                    <i class="fa-solid ${section.icon} text-lg"></i>
                </div>
                <div class="flex-1">
                    <h3 class="font-black text-base">${section.title}</h3>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">${section.intro}</p>
                </div>
            </div>
        </div>

        <div class="p-4 space-y-3">
    `;

    if (section.id === 'motor') {
        html += neuroMotorTables();
    }

    section.items.forEach((item, index) => {
        const [id, label, how, normal] = item;
        const status = neuroGetStatus(id);
        const detail = neuroState.detail[id] || '';
        const side = neuroState.side[id] || 'No especificado';

        const border = status === 'normal'
            ? 'border-emerald-200 dark:border-emerald-900/60'
            : status === 'abnormal'
                ? 'border-rose-300 dark:border-rose-900/60'
                : 'border-slate-200 dark:border-slate-700';

        html += `
        <article class="rounded-xl border ${border} p-3 space-y-3">
            <div class="flex flex-wrap items-start justify-between gap-2">
                <div class="flex-1 min-w-[180px]">
                    <div class="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                        <span class="text-slate-400 mr-1">${String(index + 1).padStart(2,'0')}.</span>${label}
                    </div>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">${how}</p>
                </div>
                <span class="text-[9px] font-bold px-2 py-1 rounded-full
                    ${status === 'normal' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' :
                    status === 'abnormal' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' :
                    'bg-slate-100 text-slate-500 dark:bg-slate-700'}">
                    ${neuroStatusLabel(status)}
                </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button type="button" onclick="neuroSet('status','${id}','normal'); neuroRenderSection('${section.id}')"
                    class="py-2 px-2 rounded-lg text-[10px] font-bold ${status === 'normal' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'}">
                    <i class="fa-solid fa-check mr-1"></i>Normal
                </button>
                <button type="button" onclick="neuroSet('status','${id}','abnormal'); neuroRenderSection('${section.id}')"
                    class="py-2 px-2 rounded-lg text-[10px] font-bold ${status === 'abnormal' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300'}">
                    <i class="fa-solid fa-exclamation mr-1"></i>Alterado
                </button>
                <button type="button" onclick="neuroSet('status','${id}','pending'); neuroRenderSection('${section.id}')"
                    class="py-2 px-2 rounded-lg text-[10px] font-bold ${status === 'pending' ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}">
                    No evaluado
                </button>
                <button type="button" onclick="neuroSet('status','${id}','na'); neuroRenderSection('${section.id}')"
                    class="py-2 px-2 rounded-lg text-[10px] font-bold ${status === 'na' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300'}">
                    No aplica
                </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div class="sm:col-span-1">
                    <label class="block text-[10px] font-bold text-slate-500 mb-1">Lateralidad</label>
                    <select onchange="neuroSet('side','${id}',this.value)"
                        class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[11px]">
                        ${['No especificado','Derecha','Izquierda','Bilateral','Axial / línea media'].map(v =>
                            `<option ${side === v ? 'selected' : ''}>${v}</option>`).join('')}
                    </select>
                </div>
                <div class="sm:col-span-2">
                    <label class="block text-[10px] font-bold text-slate-500 mb-1">
                        Hallazgo / observación
                    </label>
                    <input type="text" value="${neuroEsc(detail)}"
                        onchange="neuroSet('detail','${id}',this.value)"
                        oninput="neuroSet('detail','${id}',this.value)"
                        placeholder="${status === 'abnormal' ? 'Describe el hallazgo, intensidad y distribución...' : 'Opcional: agrega observaciones...'}"
                        class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[11px]">
                </div>
            </div>

            ${status === 'normal' ? `<div class="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-lg"><i class="fa-solid fa-check-circle mr-1"></i>Referencia: ${normal}</div>` : ''}
        </article>`;
    });

    if (section.id === 'motor') {
        html += `
        <div class="rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 p-3">
            <p class="text-[10px] text-blue-800 dark:text-blue-300 leading-relaxed">
                <strong>Escala MRC:</strong> 0 = ausencia de contracción; 1 = contracción visible o palpable sin movimiento;
                2 = movimiento con gravedad eliminada; 3 = movimiento contra gravedad;
                4 = movimiento contra resistencia; 5 = fuerza normal.
                El grado 4 puede subdividirse clínicamente, pero se registra aquí como 4.
            </p>
        </div>`;
    }

    html += `
        </div>
        <div class="p-4 border-t border-slate-100 dark:border-slate-700 flex flex-wrap justify-between gap-2">
            <button type="button" onclick="neuroPrevious()"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold">
                <i class="fa-solid fa-arrow-left mr-1"></i>Anterior
            </button>
            <button type="button" onclick="neuroNext()"
                class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold">
                Siguiente sección<i class="fa-solid fa-arrow-right ml-2"></i>
            </button>
        </div>
    </div>`;

    container.innerHTML = html;
    neuroUpdateProgress();
}

function neuroMotorTables() {
    const muscles = [
        ['deltoides','Deltoides','Abducción del hombro'],
        ['biceps','Bíceps','Flexión del codo'],
        ['triceps','Tríceps','Extensión del codo'],
        ['muneca','Extensores de muñeca','Extensión de muñeca'],
        ['dedos','Interóseos','Abducción de dedos'],
        ['iliopsoas','Iliopsoas','Flexión de cadera'],
        ['cuadriceps','Cuádriceps','Extensión de rodilla'],
        ['tibial','Tibial anterior','Dorsiflexión del pie'],
        ['gastrocnemio','Gastrocnemio','Flexión plantar']
    ];

    const reflexes = [
        ['bicipital','Bicipital (C5–C6)'],
        ['estiloradial','Estilorradial (C5–C6)'],
        ['tricipital','Tricipital (C7–C8)'],
        ['rotuliano','Rotuliano (L3–L4)'],
        ['aquileo','Aquíleo (S1–S2)']
    ];

    const strengthOptions = `
        <option value="">—</option>
        ${[0,1,2,3,4,5].map(n => `<option value="${n}">${n}/5</option>`).join('')}
    `;

    const reflexOptions = `
        <option value="">—</option>
        ${['0','1+','2+','3+','4+'].map(n => `<option value="${n}">${n}</option>`).join('')}
    `;

    return `
    <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-3">
        <div>
            <h4 class="text-xs font-extrabold">Fuerza muscular · Escala MRC</h4>
            <p class="text-[10px] text-slate-500 mt-1">Registra cada grupo muscular por separado.</p>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-[10px] min-w-[300px]">
                <thead>
                    <tr class="text-slate-500 border-b border-slate-200 dark:border-slate-700">
                        <th class="text-left py-2">Grupo muscular</th>
                        <th class="text-center py-2">Derecha</th>
                        <th class="text-center py-2">Izquierda</th>
                    </tr>
                </thead>
                <tbody>
                    ${muscles.map(m => `
                    <tr class="border-b border-slate-100 dark:border-slate-700/60">
                        <td class="py-2 pr-2">
                            <div class="font-bold">${m[1]}</div>
                            <div class="text-slate-400">${m[2]}</div>
                        </td>
                        <td class="p-1">
                            <select onchange="neuroSetMetric('mrc-${m[0]}','right',this.value)"
                                class="w-full p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                ${strengthOptions.replace(`value="${neuroState.metric['mrc-'+m[0]]?.right || ''}"`, `value="${neuroState.metric['mrc-'+m[0]]?.right || ''}" selected`)}
                            </select>
                        </td>
                        <td class="p-1">
                            <select onchange="neuroSetMetric('mrc-${m[0]}','left',this.value)"
                                class="w-full p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                ${strengthOptions.replace(`value="${neuroState.metric['mrc-'+m[0]]?.left || ''}"`, `value="${neuroState.metric['mrc-'+m[0]]?.left || ''}" selected`)}
                            </select>
                        </td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>
        <p class="text-[10px] text-slate-500">0–5 por lado. Deja en blanco los grupos que no hayas explorado.</p>
    </div>

    <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-3">
        <div>
            <h4 class="text-xs font-extrabold">Reflejos osteotendinosos</h4>
            <p class="text-[10px] text-slate-500 mt-1">Graduación: 0 ausente · 1+ disminuido · 2+ normal · 3+ aumentado · 4+ clonus.</p>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-[10px] min-w-[300px]">
                <thead>
                    <tr class="text-slate-500 border-b border-slate-200 dark:border-slate-700">
                        <th class="text-left py-2">Reflejo</th>
                        <th class="text-center py-2">Derecha</th>
                        <th class="text-center py-2">Izquierda</th>
                    </tr>
                </thead>
                <tbody>
                    ${reflexes.map(r => `
                    <tr class="border-b border-slate-100 dark:border-slate-700/60">
                        <td class="py-2 font-bold">${r[1]}</td>
                        <td class="p-1">
                            <select onchange="neuroSetMetric('ref-${r[0]}','right',this.value)"
                                class="w-full p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                ${reflexOptions.replace(`value="${neuroState.metric['ref-'+r[0]]?.right || ''}"`, `value="${neuroState.metric['ref-'+r[0]]?.right || ''}" selected`)}
                            </select>
                        </td>
                        <td class="p-1">
                            <select onchange="neuroSetMetric('ref-${r[0]}','left',this.value)"
                                class="w-full p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                ${reflexOptions.replace(`value="${neuroState.metric['ref-'+r[0]]?.left || ''}"`, `value="${neuroState.metric['ref-'+r[0]]?.left || ''}" selected`)}
                            </select>
                        </td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>
        <p class="text-[10px] text-slate-500">La interpretación debe considerar simetría, contexto y respuesta de cada paciente.</p>
    </div>`;
}

function neuroUpdateProgress() {
    const total = NEURO_SECTIONS.length;
    let completed = 0;
    let registered = 0;
    let altered = 0;
    let all = 0;

    NEURO_SECTIONS.forEach(s => {
        const states = s.items.map(i => neuroGetStatus(i[0]));
        const done = states.filter(v => v !== 'pending').length;
        if (done > 0) completed++;
        registered += done;
        altered += states.filter(v => v === 'abnormal').length;
        all += states.length;
    });

    const percent = Math.round((completed / total) * 100);
    const number = document.getElementById('neuro-progress-number');
    const count = document.getElementById('neuro-progress-count');
    const bar = document.getElementById('neuro-progress-bar');

    if (number) number.textContent = percent + '%';
    if (count) count.textContent = completed + ' de ' + total + ' secciones';
    if (bar) bar.style.width = percent + '%';

    const output = document.getElementById('neuro-output-card');
    if (output && registered === 0) output.classList.add('hidden');
}

function neuroPrevious() {
    const index = NEURO_SECTIONS.findIndex(s => s.id === neuroActiveSection);
    if (index > 0) neuroRenderSection(NEURO_SECTIONS[index - 1].id);
}

function neuroNext() {
    const index = NEURO_SECTIONS.findIndex(s => s.id === neuroActiveSection);
    if (index < NEURO_SECTIONS.length - 1) neuroRenderSection(NEURO_SECTIONS[index + 1].id);
    else neuroGenerate();
}

function neuroGenerate() {
    const lines = [];
    const abnormalLines = [];
    let totalEvaluated = 0;
    let totalAbnormal = 0;

    lines.push('EXAMEN NEUROLÓGICO');
    lines.push('');

    NEURO_SECTIONS.forEach(section => {
        const normal = [];
        const abnormal = [];
        const notEvaluated = [];

        section.items.forEach(item => {
            const id = item[0];
            const label = item[1];
            const normalText = item[3];
            const status = neuroGetStatus(id);
            const detail = (neuroState.detail[id] || '').trim();
            const side = neuroState.side[id] || '';

            if (status === 'normal') {
                totalEvaluated++;
                normal.push(label + ': ' + (detail || normalText));
            } else if (status === 'abnormal') {
                totalEvaluated++;
                totalAbnormal++;
                const description = detail || 'Hallazgo alterado; descripción pendiente.';
                const line = label + (side && side !== 'No especificado' ? ' (' + side + ')' : '') + ': ' + description;
                abnormal.push(line);
                abnormalLines.push(section.title + ' — ' + line);
            } else if (status === 'pending') {
                notEvaluated.push(label);
            }
        });

        lines.push(section.title.toUpperCase());

        if (normal.length) lines.push('Hallazgos conservados: ' + normal.join('; ') + '.');
        if (abnormal.length) {
            lines.push('Hallazgos alterados:');
            abnormal.forEach(x => lines.push('- ' + x));
        }
        if (notEvaluated.length) lines.push('No evaluado: ' + notEvaluated.join(', ') + '.');

        const notApplicable = section.items
            .filter(i => neuroGetStatus(i[0]) === 'na')
            .map(i => i[1]);
        if (notApplicable.length) lines.push('No aplica: ' + notApplicable.join(', ') + '.');

        lines.push('');
    });

    // Fuerza MRC
    const muscleNames = {
        deltoides:'Deltoides', biceps:'Bíceps', triceps:'Tríceps',
        muneca:'Extensores de muñeca', dedos:'Interóseos',
        iliopsoas:'Iliopsoas', cuadriceps:'Cuádriceps',
        tibial:'Tibial anterior', gastrocnemio:'Gastrocnemio'
    };

    const mrcLines = [];
    Object.keys(muscleNames).forEach(k => {
        const v = neuroState.metric['mrc-' + k] || {};
        if (v.right !== undefined && v.right !== '' || v.left !== undefined && v.left !== '') {
            mrcLines.push(`${muscleNames[k]}: derecha ${v.right !== undefined && v.right !== '' ? v.right + '/5' : 'no evaluada'}; izquierda ${v.left !== undefined && v.left !== '' ? v.left + '/5' : 'no evaluada'}`);
        }
    });
    if (mrcLines.length) {
        lines.push('FUERZA MUSCULAR — ESCALA MRC');
        mrcLines.forEach(x => lines.push('- ' + x));
        lines.push('');
    }

    const reflexNames = {
        bicipital:'Bicipital', estiloradial:'Estilorradial',
        tricipital:'Tricipital', rotuliano:'Rotuliano', aquileo:'Aquíleo'
    };

    const reflexLines = [];
    Object.keys(reflexNames).forEach(k => {
        const v = neuroState.metric['ref-' + k] || {};
        if (v.right !== undefined && v.right !== '' || v.left !== undefined && v.left !== '') {
            reflexLines.push(`${reflexNames[k]}: derecha ${v.right || 'no evaluado'}; izquierda ${v.left || 'no evaluado'}`);
        }
    });
    if (reflexLines.length) {
        lines.push('REFLEJOS OSTEOTENDINOSOS');
        reflexLines.forEach(x => lines.push('- ' + x));
        lines.push('');
    }

    lines.push(`Resumen: ${totalEvaluated} maniobras registradas como normales o alteradas; ${totalAbnormal} con hallazgos alterados.`);
    lines.push('Las maniobras no registradas no deben interpretarse como normales.');

    const output = document.getElementById('neuro-output-card');
    const textarea = document.getElementById('neuro-generated-text');

    if (output) output.classList.remove('hidden');
    if (textarea) textarea.value = lines.join('\n');

    window.neuroAbnormalText = abnormalLines.length
        ? 'HALLAZGOS NEUROLÓGICOS ALTERADOS\n\n' + abnormalLines.map(x => '- ' + x).join('\n')
        : 'No se registraron maniobras como alteradas.';

    output?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function neuroCopy() {
    const text = document.getElementById('neuro-generated-text')?.value || '';
    if (!text.trim()) return alert('Primero genera el examen neurológico.');
    try {
        await navigator.clipboard.writeText(text);
        alert('Examen neurológico copiado.');
    } catch (e) {
        const el = document.getElementById('neuro-generated-text');
        el.select();
        document.execCommand('copy');
        alert('Examen neurológico copiado.');
    }
}

async function neuroCopyAbnormal() {
    if (!window.neuroAbnormalText) neuroGenerate();
    const text = window.neuroAbnormalText || '';
    try {
        await navigator.clipboard.writeText(text);
        alert('Hallazgos alterados copiados.');
    } catch (e) {
        prompt('Copia los hallazgos alterados:', text);
    }
}

function neuroReset() {
    if (!confirm('¿Deseas borrar todos los datos del examen neurológico guardados en este dispositivo?')) return;

    neuroState = { status: {}, detail: {}, side: {}, metric: {} };
    try { localStorage.removeItem(NEURO_KEY); } catch(e) {}
    // También reiniciar los datos del examen rápido
try {
    localStorage.removeItem(NEURO_QUICK_KEY);
} catch(e) {}

neuroQuickState = {
    status: {},
    detail: {}
};
    neuroActiveSection = 'mental';
    neuroRender();
    document.getElementById('neuro-output-card')?.classList.add('hidden');
    alert('Examen neurológico reiniciado.');
}


// ============================================================
// ADROOSIS | EXAMEN NEUROLÓGICO RÁPIDO (5 MINUTOS)
// ============================================================

// Se almacena por separado para no confundir el tamizaje
// con las maniobras del examen neurológico completo.

const NEURO_QUICK_KEY = 'adroosis_neuro_quick_v1';

let neuroQuickState = {
    status: {},
    detail: {}
};

// Cinco estaciones de exploración.
// Los estados posibles son: normal, abnormal y pending.


// ============================================================
// GUÍAS PRÁCTICAS DE EXPLORACIÓN
// Solo se muestran en maniobras que necesitan explicación extra.
// ============================================================

const NEURO_QUICK_GUIDES = {

    q_pupils: {
        say: '«Voy a revisar sus pupilas. Mire hacia el frente y trate de no mover los ojos».',
        do: 'Con iluminación adecuada, observa el tamaño y la simetría pupilar. Ilumina cada ojo desde un lado y observa la respuesta de esa pupila y de la contralateral. Compara ambos lados.',
        look: 'Tamaño, simetría y respuesta fotomotora directa y consensual. Registra anisocoria o respuesta disminuida/ausente.',
        caution: 'Una anisocoria de aparición aguda, especialmente con cefalea intensa, alteración de conciencia o déficit neurológico, requiere valoración urgente.'
    },

    q_visual: {
        say: '«Tape un ojo y mire directamente a mis ojos. Dígame cuándo vea mis dedos».',
        do: 'Colócate frente al paciente a una distancia aproximada de un brazo. Explora un ojo a la vez, comparando cada campo visual. Introduce los dedos desde la periferia hacia el centro en distintos cuadrantes, mientras el paciente mantiene la mirada fija.',
        look: 'Compara la detección de estímulos entre ambos ojos y entre los distintos cuadrantes. Identifica posibles defectos del campo visual.',
        caution: 'Es una prueba de confrontación y no sustituye la campimetría formal.'
    },

    q_ocular: {
        say: '«Sin mover la cabeza, siga mi dedo solamente con los ojos».',
        do: 'Sostén un objetivo frente al paciente y desplázalo lentamente describiendo una H. Explora las posiciones extremas de la mirada sin forzarla. Pregunta si ve doble.',
        look: 'Observa limitaciones de movimiento, diplopía y movimientos involuntarios como nistagmo. Compara ambos ojos.',
        caution: 'No confundas la limitación por dolor o falta de cooperación con una paresia oculomotora.'
    },

    q_face: {
        say: '«Levante las cejas, cierre los ojos fuerte y ahora muéstreme los dientes o sonría».',
        do: 'Observa primero la cara en reposo. Después solicita cada movimiento y compara la contracción de ambos lados. Si es necesario, intenta abrir suavemente los párpados mientras los mantiene cerrados.',
        look: 'Simetría facial en reposo y movimiento, cierre palpebral y fuerza de la musculatura facial.',
        caution: 'Ante asimetría facial de inicio súbito, especialmente con alteración del habla o debilidad de una extremidad, activa la evaluación urgente correspondiente.'
    },

    q_speech: {
        say: '«Dígame su nombre, cuénteme qué le ocurre y repita esta frase».',
        do: 'Escucha el lenguaje espontáneo. Solicita nombrar un objeto, repetir una frase y ejecutar una orden sencilla. Observa la claridad de la articulación y la calidad de la voz.',
        look: 'Distingue dificultad para articular palabras (disartria) de dificultad para encontrar, comprender o producir lenguaje (posible afasia). Observa voz nasal o ronca.',
        caution: 'Si hay sospecha de disfagia, alteración de conciencia o riesgo de aspiración, no realices pruebas de deglución con agua como parte de este tamizaje.'
    },

    q_drift: {
        say: '«Extienda ambos brazos al frente, con las palmas hacia arriba. Cierre los ojos y mantenga esa posición».',
        do: 'Con el paciente sentado o acostado, coloca ambos brazos extendidos y las palmas hacia arriba. Solicita mantener la posición durante aproximadamente 10 segundos mientras observas.',
        look: 'Busca descenso progresivo de un brazo, pronación de la mano o asimetría entre ambos lados.',
        caution: 'Dolor, limitaciones articulares, alteración de comprensión o problemas de equilibrio pueden dificultar la interpretación.'
    },

    q_arms: {
        say: '«Voy a comparar la fuerza de sus brazos. Empuje contra mi mano, ahora tire hacia usted y apriete mis dedos».',
        do: 'Compara ambos lados con resistencia manual: abducción de hombros, flexión y extensión de codos, extensión de muñecas y prensión. Mantén una posición similar en ambos lados.',
        look: 'Identifica debilidad, asimetría o incapacidad para vencer la gravedad o la resistencia. Si hay alteración, cuantifica cada grupo muscular con escala MRC de 0 a 5 en el examen completo.',
        caution: 'Considera dolor, lesiones osteoarticulares y esfuerzo insuficiente antes de interpretar una disminución de fuerza.'
    },

    q_legs: {
        say: '«Levante una pierna, manténgala arriba. Ahora estire la rodilla y lleve la punta del pie hacia usted».',
        do: 'Compara ambos miembros inferiores. Explora flexión de cadera, extensión de rodilla y dorsiflexión del tobillo, aplicando resistencia cuando sea posible.',
        look: 'Busca diferencias entre lados, dificultad para mantener la extremidad elevada o para vencer la resistencia. Cuantifica con escala MRC si encuentras alteraciones.',
        caution: 'Adapta la exploración a la movilidad, el dolor y la condición física del paciente.'
    },

    q_sensory: {
        say: '«Voy a tocar suavemente diferentes partes de su cuerpo. Cierre los ojos y dígame si siente el contacto y si lo percibe igual en ambos lados».',
        do: 'Con los ojos cerrados, aplica un estímulo táctil ligero —por ejemplo, con algodón o la yema del dedo— en regiones equivalentes de ambos lados de la cara, los brazos y las piernas. Alterna los lados y pregunta si la sensación es igual o diferente. Compara siempre regiones anatómicas equivalentes.',
        look: 'Busca disminución, ausencia o asimetría de la percepción táctil. Si encuentras una diferencia, identifica exactamente la región y el lado afectados y amplía la exploración en el examen completo.',
        caution: 'Esta maniobra es un tamizaje de tacto superficial: no evalúa por sí sola dolor, temperatura, vibración ni propiocepción. No utilices objetos punzantes ni concluyas una localización neurológica únicamente con este resultado.'
    },

    q_reflexes: {
        say: '«Relaje el brazo y deje caer el peso de la pierna; no haga fuerza».',
        do: 'Coloca la extremidad en una posición relajada. Percute suavemente el tendón con el martillo de reflejos y compara ambos lados. Explora, según el contexto, bicipital, tricipital, rotuliano y aquíleo. Si cuesta obtener la respuesta, utiliza una maniobra de refuerzo cuando corresponda.',
        look: 'Registra presencia, intensidad y simetría. Escala habitual: 0 ausente, 1+ disminuido, 2+ esperado, 3+ aumentado y 4+ muy aumentado o con clonus, según la convención utilizada.',
        caution: 'La interpretación depende del contexto y de la comparación entre lados. Un reflejo aislado no permite establecer por sí solo una localización neurológica.'
    },

    q_coordination: {
        say: '«Con su dedo índice, toque la punta de su nariz y después mi dedo. Repita varias veces».',
        do: 'Coloca tu dedo frente al paciente y cambia ligeramente su posición. Solicita alternar entre tu dedo y su nariz, primero con una mano y luego con la otra.',
        look: 'Observa precisión, trayectoria, temblor de intención, descomposición del movimiento y diferencias entre ambos lados.',
        caution: 'Ten en cuenta alteraciones visuales, debilidad o limitaciones articulares que puedan afectar la prueba.'
    },

    q_gait: {
        say: '«Si se siente seguro, póngase de pie y camine unos pasos como lo hace habitualmente. Después gire y regrese».',
        do: 'Observa al paciente levantarse, iniciar la marcha, caminar, girar y detenerse. Mantente cerca y ofrece apoyo si lo necesita.',
        look: 'Evalúa base de sustentación, longitud y simetría del paso, balanceo de brazos, estabilidad y giros.',
        caution: 'No fuerces la marcha si hay riesgo de caída, debilidad importante, mareo intenso o incapacidad para mantenerse de pie.'
    },

    q_tandem: {
        say: '«Si puede hacerlo con seguridad, camine colocando un pie justo delante del otro, como si caminara sobre una línea».',
        do: 'Permanece al lado del paciente, preparado para sostenerlo. Solicita unos pasos colocando el talón de un pie delante de la punta del otro.',
        look: 'Observa pérdida de equilibrio, desviaciones, separación de los pies o incapacidad para mantener la secuencia.',
        caution: 'Omite esta prueba si el paciente presenta inestabilidad o riesgo de caída. No es obligatorio realizarla para completar el tamizaje.'
    },

    q_romberg: {
        say: '«Junte los pies, manténgase quieto y mire al frente. Si se siente seguro, después cierre los ojos».',
        do: 'Colócate muy cerca del paciente y listo para sujetarlo. Primero observa la estabilidad con ojos abiertos y después solicita cerrarlos brevemente, solo si puede mantenerse seguro.',
        look: 'Compara la estabilidad con ojos abiertos y cerrados. Un aumento marcado de la inestabilidad al cerrar los ojos puede sugerir alteración de la propiocepción o de la integración sensorial.',
        caution: 'No realices la prueba si no puede mantenerse de pie con seguridad. No dejes nunca al paciente sin supervisión.'
    }

};

// Mostrar u ocultar una guía individual.
function neuroQuickToggleGuide(id) {
    const panel = document.getElementById('neuro-guide-' + id);
    const button = document.getElementById('neuro-guide-button-' + id);

    if (!panel || !button) return;

    const willOpen = panel.classList.contains('hidden');

    panel.classList.toggle('hidden', !willOpen);

    button.innerHTML = willOpen
        ? '<i class="fa-solid fa-chevron-up mr-1"></i> Ocultar guía'
        : '<i class="fa-solid fa-circle-question mr-1"></i> ¿Cómo explorar?';
}

// Construir la ayuda visual de cada maniobra.
function neuroQuickGuideHtml(id) {
    const guide = NEURO_QUICK_GUIDES[id];

    if (!guide) return '';

    return `
        <div class="pt-1">

            <button
                id="neuro-guide-button-${id}"
                type="button"
                onclick="neuroQuickToggleGuide('${id}')"
                class="text-[10px] font-extrabold text-teal-700 dark:text-teal-300 hover:underline">

                <i class="fa-solid fa-circle-question mr-1"></i>
                ¿Cómo explorar?

            </button>

            <div
                id="neuro-guide-${id}"
                class="hidden mt-3 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50 dark:bg-teal-950/20 p-3 space-y-3">

                <div>
                    <div class="text-[10px] font-black text-teal-800 dark:text-teal-300 mb-1">
                        <i class="fa-solid fa-comments mr-1"></i> Qué decir
                    </div>
                    <p class="text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed">
                        ${neuroQuickEsc(guide.say)}
                    </p>
                </div>

                <div>
                    <div class="text-[10px] font-black text-teal-800 dark:text-teal-300 mb-1">
                        <i class="fa-solid fa-hand-holding-medical mr-1"></i> Cómo hacerlo
                    </div>
                    <p class="text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed">
                        ${neuroQuickEsc(guide.do)}
                    </p>
                </div>

                <div>
                    <div class="text-[10px] font-black text-teal-800 dark:text-teal-300 mb-1">
                        <i class="fa-solid fa-eye mr-1"></i> Qué buscar
                    </div>
                    <p class="text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed">
                        ${neuroQuickEsc(guide.look)}
                    </p>
                </div>

                <div class="rounded-lg bg-amber-100 dark:bg-amber-950/40 p-2">
                    <div class="text-[10px] font-black text-amber-800 dark:text-amber-300 mb-1">
                        <i class="fa-solid fa-triangle-exclamation mr-1"></i> Precaución
                    </div>
                    <p class="text-[10px] text-amber-900 dark:text-amber-200 leading-relaxed">
                        ${neuroQuickEsc(guide.caution)}
                    </p>
                </div>

            </div>
        </div>
    `;
}

// ------------------------------------------------------------
// CARGA Y GUARDADO DEL TAMIZAJE
// ------------------------------------------------------------

function neuroQuickLoad() {
    try {
        const saved = localStorage.getItem(NEURO_QUICK_KEY);

        if (saved) {
            const parsed = JSON.parse(saved);

            neuroQuickState = {
                status: parsed.status || {},
                detail: parsed.detail || {}
            };
        }
    } catch (error) {
        console.warn('No se pudo recuperar el examen rápido.', error);
    }
}

function neuroQuickSave() {
    try {
        localStorage.setItem(
            NEURO_QUICK_KEY,
            JSON.stringify(neuroQuickState)
        );
    } catch (error) {
        console.warn('No se pudo guardar el examen rápido.', error);
    }
}

function neuroQuickGetStatus(id) {
    return neuroQuickState.status[id] || 'pending';
}

function neuroQuickStatusLabel(status) {
    if (status === 'normal') return 'Normal';
    if (status === 'abnormal') return 'Alterado';
    return 'No evaluado';
}

function neuroQuickEsc(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

// ------------------------------------------------------------
// ABRIR Y CERRAR EL EXAMEN RÁPIDO
// ------------------------------------------------------------


function neuroLocalize() {
    const pattern = document.getElementById('neuro-loc-pattern')?.value;
    const associated = document.getElementById('neuro-loc-associated')?.value;
    const reflexes = document.getElementById('neuro-loc-reflexes')?.value;
    const result = document.getElementById('neuro-localization-result');

    if (!result) return;

    if (!pattern) {
        alert('Selecciona primero el patrón neurológico predominante.');
        return;
    }

    let title = 'Localización no definida';
    let explanation = '';
    let clues = [];
    let caution = '';

    switch (pattern) {
        case 'hemibody':
            title = 'Sistema nervioso central: posible localización supratentorial';
            explanation = 'La afectación de cara, brazo y pierna del mismo lado orienta hacia una lesión central, frecuentemente en el hemisferio cerebral contralateral o sus vías motoras y sensitivas.';
            clues.push('Busca signos corticales como afasia, negligencia, alteración de campos visuales o crisis epilépticas.');
            clues.push('Si no hay signos corticales, considera también estructuras subcorticales y otras localizaciones centrales.');
            break;

        case 'brainstem':
            title = 'Posible localización en tronco encefálico';
            explanation = 'La combinación de alteraciones de pares craneales y déficits corporales puede orientar hacia el tronco encefálico.';
            clues.push('Busca signos cruzados: compromiso de un par craneal ipsilateral y alteración motora o sensitiva contralateral.');
            clues.push('Valora movimientos oculares, sensibilidad facial, deglución, habla, fuerza y sensibilidad corporal.');
            break;

        case 'spinal':
            title = 'Posible localización medular';
            explanation = 'La presencia de alteraciones bilaterales por debajo de un nivel sensitivo en el tronco orienta hacia compromiso de la médula espinal.';
            clues.push('Define con precisión el nivel sensitivo y busca signos de neurona motora superior por debajo de ese nivel.');
            clues.push('Investiga dolor vertebral, debilidad, alteraciones esfinterianas y evolución temporal.');
            break;

        case 'root':
            title = 'Posible compromiso de raíz nerviosa';
            explanation = 'Un patrón dermatomérico, especialmente con dolor irradiado, puede orientar hacia una radiculopatía.';
            clues.push('Correlaciona el dermatoma con la fuerza de músculos relacionados y los reflejos correspondientes.');
            clues.push('Busca signos de irritación radicular y compara ambos lados.');
            break;

        case 'nerve':
            title = 'Posible compromiso de nervio periférico';
            explanation = 'Un déficit limitado al territorio de un nervio puede orientar hacia una mononeuropatía.';
            clues.push('Comprueba si la alteración sensitiva y motora coincide con el territorio anatómico de ese nervio.');
            clues.push('Considera también lesiones proximales o patrones que puedan imitar una neuropatía focal.');
            break;

        case 'polyneuropathy':
            title = 'Posible compromiso de nervios periféricos múltiples';
            explanation = 'Una alteración distal y simétrica, especialmente con predominio en pies, puede orientar hacia una polineuropatía.';
            clues.push('Explora sensibilidad distal, vibración, propiocepción, fuerza distal y reflejos aquíleos.');
            clues.push('Investiga evolución, distribución y posibles causas sistémicas o metabólicas.');
            break;

        case 'muscle':
            title = 'Posible localización muscular';
            explanation = 'La debilidad simétrica predominantemente proximal puede orientar hacia una miopatía.';
            clues.push('Busca dificultad para levantarse de una silla, subir escaleras o elevar los brazos.');
            clues.push('Correlaciona con sensibilidad, reflejos, dolor muscular y evolución.');
            break;

        case 'junction':
            title = 'Posible compromiso de la unión neuromuscular';
            explanation = 'La debilidad fluctuante o fatigable puede orientar hacia un trastorno de la transmisión neuromuscular.';
            clues.push('Investiga fatigabilidad, ptosis, diplopía, disartria, disfagia y variación de los síntomas durante el día.');
            clues.push('La sensibilidad suele estar conservada; los reflejos pueden variar según la enfermedad.');
            break;

        case 'unclear':
            title = 'Patrón insuficiente para localizar';
            explanation = 'Los hallazgos descritos no permiten proponer una localización anatómica predominante con suficiente confianza.';
            clues.push('Repite y completa la exploración motora, sensitiva, de pares craneales, reflejos y coordinación.');
            clues.push('Define inicio, evolución, simetría y distribución anatómica.');
            break;
    }

    if (associated === 'cortical') {
        clues.push('El hallazgo cortical aumenta la sospecha de compromiso hemisférico cerebral.');
    }

    if (associated === 'crossed') {
        clues.push('Los signos cruzados refuerzan la posibilidad de una localización en tronco encefálico.');
    }

    if (associated === 'sphincter') {
        clues.push('La alteración esfinteriana o anestesia en silla de montar exige descartar compromiso medular o de cola de caballo según el contexto.');
    }

    if (associated === 'sensory') {
        clues.push('Caracteriza la modalidad sensitiva afectada y su distribución antes de concluir la localización.');
    }

    if (reflexes === 'increased') {
        clues.push('La hiperreflexia o los signos piramidales apoyan compromiso de vías motoras centrales, si son concordantes con el resto del examen.');
    }

    if (reflexes === 'decreased') {
        clues.push('La hiporreflexia puede orientar hacia arco reflejo, raíz, nervio periférico o músculo, según el patrón clínico.');
    }

    if (reflexes === 'preserved') {
        clues.push('Los reflejos conservados no excluyen una lesión neurológica; interpreta este dato junto con el resto de la exploración.');
    }

    if (pattern === 'spinal' && associated === 'sphincter') {
        caution = 'ALERTA: si hay déficit progresivo, retención urinaria, anestesia en silla de montar o debilidad aguda, requiere valoración urgente.';
    } else if (pattern === 'hemibody' || pattern === 'brainstem') {
        caution = 'ALERTA: si el déficit es de inicio súbito, activa la ruta institucional de sospecha de ictus. No retrases la atención para completar esta herramienta.';
    } else {
        caution = 'Correlaciona con la historia clínica y la exploración completa. Si hay progresión rápida, compromiso respiratorio o deglutorio, o deterioro del estado de conciencia, prioriza valoración urgente.';
    }

    result.innerHTML = `
        <h4 class="font-black text-sm text-indigo-900 dark:text-indigo-200">
            ${title}
        </h4>
        <p class="text-xs text-indigo-950 dark:text-indigo-100 leading-relaxed">
            ${explanation}
        </p>
        <div class="pt-2">
            <p class="text-xs font-extrabold mb-2">Claves para correlacionar:</p>
            <ul class="list-disc pl-5 space-y-1 text-xs leading-relaxed">
                ${clues.map(clue => `<li>${clue}</li>`).join('')}
            </ul>
        </div>
        <div class="mt-3 p-3 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
            <strong>Precaución clínica:</strong> ${caution}
        </div>
    `;

    result.classList.remove('hidden');
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}


function neuroRedFlagsUpdate() {
    const container = document.getElementById('neuro-red-flags');
    const alertBox = document.getElementById('neuro-red-flags-alert');
    const list = document.getElementById('neuro-red-flags-list');

    if (!container || !alertBox || !list) return;

    const selected = Array.from(
        container.querySelectorAll('input[type="checkbox"]:checked')
    );

    if (selected.length === 0) {
        alertBox.classList.add('hidden');
        list.textContent = '';
        return;
    }

    const labels = selected.map(input => input.dataset.label);

    list.textContent = labels.map(label => '• ' + label).join('\n');

    alertBox.classList.remove('hidden');
}

function neuroRedFlagsClear() {
    const container = document.getElementById('neuro-red-flags');
    const alertBox = document.getElementById('neuro-red-flags-alert');
    const list = document.getElementById('neuro-red-flags-list');

    if (!container) return;

    container.querySelectorAll('input[type="checkbox"]').forEach(input => {
        input.checked = false;
    });

    alertBox?.classList.add('hidden');

    if (list) list.textContent = '';
}


function neuroNihssOpen() {
    const nihssPanel = document.getElementById('neuro-nihss-panel');
    const quickPanel = document.getElementById('neuro-quick-panel');
    const nav = document.getElementById('neuro-section-nav');
    const content = document.getElementById('neuro-section-content');
    const output = document.getElementById('neuro-output-card');

    if (quickPanel) quickPanel.classList.add('hidden');
    if (nav) nav.classList.add('hidden');
    if (content) content.classList.add('hidden');
    if (output) output.classList.add('hidden');

    const progressNumber = document.getElementById('neuro-progress-number');
    const progressCard = progressNumber?.closest('.bg-white');

    if (progressCard) progressCard.classList.add('hidden');

    if (nihssPanel) nihssPanel.classList.remove('hidden');

    nihssPanel?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function neuroNihssClose() {
    const nihssPanel = document.getElementById('neuro-nihss-panel');
    const nav = document.getElementById('neuro-section-nav');
    const content = document.getElementById('neuro-section-content');

    if (nihssPanel) nihssPanel.classList.add('hidden');
    if (nav) nav.classList.remove('hidden');
    if (content) content.classList.remove('hidden');

    const progressNumber = document.getElementById('neuro-progress-number');
    const progressCard = progressNumber?.closest('.bg-white');

    if (progressCard) progressCard.classList.remove('hidden');

    neuroRender();
}

function neuroQuickOpen() {
    neuroQuickLoad();
    neuroQuickRender();

    const quickPanel = document.getElementById('neuro-quick-panel');
    const nav = document.getElementById('neuro-section-nav');
    const content = document.getElementById('neuro-section-content');
    const output = document.getElementById('neuro-output-card');

    if (quickPanel) quickPanel.classList.remove('hidden');
    if (nav) nav.classList.add('hidden');
    if (content) content.classList.add('hidden');
    if (output) output.classList.add('hidden');

    const progressNumber = document.getElementById('neuro-progress-number');
    const progressCard = progressNumber?.closest('.bg-white');

    if (progressCard) progressCard.classList.add('hidden');

    quickPanel?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function neuroQuickClose() {
    const quickPanel = document.getElementById('neuro-quick-panel');
    const nav = document.getElementById('neuro-section-nav');
    const content = document.getElementById('neuro-section-content');

    if (quickPanel) quickPanel.classList.add('hidden');
    if (nav) nav.classList.remove('hidden');
    if (content) content.classList.remove('hidden');

    const progressNumber = document.getElementById('neuro-progress-number');
    const progressCard = progressNumber?.closest('.bg-white');

    if (progressCard) progressCard.classList.remove('hidden');

    neuroRender();
}

// ------------------------------------------------------------
// CAMBIAR RESPUESTA DE UNA MANIOBRA
// ------------------------------------------------------------

function neuroQuickSet(id, status) {
    neuroQuickState.status[id] = status;
    neuroQuickSave();

    const summary = document.getElementById('neuro-quick-summary');
    if (summary) summary.classList.add('hidden');

    neuroQuickRender();
}

function neuroQuickSetDetail(id, value) {
    neuroQuickState.detail[id] = value;
    neuroQuickSave();
}

// ------------------------------------------------------------
// RENDERIZAR LAS CINCO ESTACIONES
// ------------------------------------------------------------

function neuroQuickRender() {
    const container = document.getElementById('neuro-quick-fields');
    if (!container) return;

    let html = '';

    NEURO_QUICK_STATIONS.forEach(station => {
        html += `
        <section class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">

            <div class="p-4 border-b border-slate-100 dark:border-slate-700">
                <div class="flex items-start gap-3">

                    <div class="w-10 h-10 shrink-0 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                        <i class="fa-solid ${station.icon} text-lg"></i>
                    </div>

                    <div class="flex-1">
                        <div class="flex flex-wrap items-center gap-2">
                            <h3 class="text-sm font-black">${station.title}</h3>
                            <span class="text-[9px] font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                                ${station.time}
                            </span>
                        </div>

                        <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                            ${station.description}
                        </p>
                    </div>

                </div>
            </div>

            <div class="p-3 sm:p-4 space-y-4">
        `;

        station.items.forEach(item => {
            const status = neuroQuickGetStatus(item.id);
            const detail = neuroQuickState.detail[item.id] || '';

            const statusClass = status === 'normal'
                ? 'border-emerald-300 dark:border-emerald-800'
                : status === 'abnormal'
                    ? 'border-rose-300 dark:border-rose-800'
                    : 'border-slate-200 dark:border-slate-700';

            html += `
            <article class="rounded-xl border ${statusClass} p-3 space-y-3">

                <div>
                    <div class="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                        ${item.label}
                    </div>

                    <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        ${item.how}
                    </p>

                    ${neuroQuickGuideHtml(item.id)}
                </div>

                <div class="grid grid-cols-3 gap-1.5">

                    <button type="button"
                        onclick="neuroQuickSet('${item.id}','normal')"
                        class="py-2 px-1 rounded-lg text-[10px] font-bold ${
                            status === 'normal'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
                        }">
                        <i class="fa-solid fa-check mr-1"></i>Normal
                    </button>

                    <button type="button"
                        onclick="neuroQuickSet('${item.id}','abnormal')"
                        class="py-2 px-1 rounded-lg text-[10px] font-bold ${
                            status === 'abnormal'
                                ? 'bg-rose-600 text-white'
                                : 'bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300'
                        }">
                        <i class="fa-solid fa-exclamation mr-1"></i>Alterado
                    </button>

                    <button type="button"
                        onclick="neuroQuickSet('${item.id}','pending')"
                        class="py-2 px-1 rounded-lg text-[10px] font-bold ${
                            status === 'pending'
                                ? 'bg-slate-600 text-white'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        }">
                        No evaluado
                    </button>

                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-500 mb-1">
                        Observaciones / lateralidad
                    </label>

                    <input
                        type="text"
                        value="${neuroQuickEsc(detail)}"
                        oninput="neuroQuickSetDetail('${item.id}',this.value)"
                        placeholder="Ej. debilidad derecha, pupila izquierda dilatada..."
                        class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[11px]">
                </div>

                ${
                    status === 'abnormal'
                    ? `
                    <div class="rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-3 space-y-2">

                        <p class="text-[10px] text-rose-800 dark:text-rose-300 font-bold">
                            <i class="fa-solid fa-triangle-exclamation mr-1"></i>
                            Hallazgo alterado: requiere evaluación dirigida.
                        </p>

                        <button type="button"
                            onclick="neuroQuickDeepen('${item.id}')"
                            class="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-extrabold">
                            <i class="fa-solid fa-magnifying-glass-plus mr-2"></i>
                            Profundizar en el examen completo
                        </button>

                    </div>
                    `
                    : ''
                }

            </article>
            `;
        });

        html += `
            </div>
        </section>
        `;
    });

    container.innerHTML = html;

    neuroQuickUpdateSummary();
}

// ------------------------------------------------------------
// CONTADOR DE REGISTROS Y HALLAZGOS
// ------------------------------------------------------------

function neuroQuickUpdateSummary() {
    let normal = 0;
    let abnormal = 0;
    let pending = 0;

    NEURO_QUICK_STATIONS.forEach(station => {
        station.items.forEach(item => {
            const status = neuroQuickGetStatus(item.id);

            if (status === 'normal') normal++;
            else if (status === 'abnormal') abnormal++;
            else pending++;
        });
    });

    const summary = document.getElementById('neuro-quick-summary');

    if (!summary) return;

    summary.classList.remove('hidden');

    summary.innerHTML = `
        <h3 class="text-sm font-black">Estado del examen rápido</h3>

        <div class="grid grid-cols-3 gap-2">

            <div class="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3 text-center">
                <div class="text-xl font-black text-emerald-700 dark:text-emerald-300">${normal}</div>
                <div class="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Normales</div>
            </div>

            <div class="rounded-xl bg-rose-50 dark:bg-rose-950/30 p-3 text-center">
                <div class="text-xl font-black text-rose-700 dark:text-rose-300">${abnormal}</div>
                <div class="text-[10px] font-bold text-rose-700 dark:text-rose-300">Alteradas</div>
            </div>

            <div class="rounded-xl bg-slate-100 dark:bg-slate-700 p-3 text-center">
                <div class="text-xl font-black text-slate-700 dark:text-slate-200">${pending}</div>
                <div class="text-[10px] font-bold text-slate-600 dark:text-slate-300">No evaluadas</div>
            </div>

        </div>

        ${
            abnormal > 0
            ? `<p class="text-[11px] text-rose-700 dark:text-rose-300 font-bold">
                Se registraron ${abnormal} hallazgo(s) alterado(s). Revisa cada uno y realiza la evaluación dirigida correspondiente.
               </p>`
            : `<p class="text-[11px] text-slate-500 dark:text-slate-400">
                Recuerda que las pruebas no realizadas permanecen como no evaluadas.
               </p>`
        }
    `;
}

// ------------------------------------------------------------
// PROFUNDIZAR: CONECTAR EL TAMIZAJE CON EL EXAMEN COMPLETO
// ------------------------------------------------------------

function neuroQuickFindItem(id) {
    for (const station of NEURO_QUICK_STATIONS) {
        const item = station.items.find(x => x.id === id);
        if (item) return item;
    }

    return null;
}

function neuroQuickDeepen(id) {
    const item = neuroQuickFindItem(id);

    if (!item) {
        alert('No se encontró la maniobra seleccionada.');
        return;
    }

    if (neuroQuickGetStatus(id) !== 'abnormal') {
        alert('La opción Profundizar está disponible para hallazgos alterados.');
        return;
    }

    // Se conserva el resultado rápido y se abre la sección detallada.
    const quickPanel = document.getElementById('neuro-quick-panel');
    const nav = document.getElementById('neuro-section-nav');
    const content = document.getElementById('neuro-section-content');

    if (quickPanel) quickPanel.classList.add('hidden');
    if (nav) nav.classList.remove('hidden');
    if (content) content.classList.remove('hidden');

    const progressNumber = document.getElementById('neuro-progress-number');
    const progressCard = progressNumber?.closest('.bg-white');

    if (progressCard) progressCard.classList.remove('hidden');

    // Renderiza la sección del examen completo.
    neuroRenderSection(item.section);

    const observation = neuroQuickState.detail[id] || 'No se agregó una observación adicional.';

    const targetLabels = item.targets.length
        ? item.targets.map(target => {
            for (const section of NEURO_SECTIONS) {
                const found = section.items.find(x => x[0] === target);
                if (found) return found[1];
            }
            return target;
        }).join(', ')
        : 'Exploración detallada de los reflejos osteotendinosos y comparación bilateral';

    const contextHTML = `
        <div class="mb-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-4">

            <div class="flex items-center gap-2 text-rose-800 dark:text-rose-300">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <h4 class="text-xs font-extrabold">Hallazgo del examen rápido</h4>
            </div>

            <p class="text-xs text-rose-900 dark:text-rose-200 mt-2">
                <strong>${neuroQuickEsc(item.label)}:</strong>
                ${neuroQuickEsc(observation)}
            </p>

            <p class="text-[10px] text-rose-800 dark:text-rose-300 mt-2">
                Profundiza en: ${neuroQuickEsc(targetLabels)}.
                El resultado del tamizaje no sustituye la exploración detallada.
            </p>

            <button type="button"
                onclick="neuroQuickOpen()"
                class="mt-3 text-[10px] font-extrabold text-rose-700 dark:text-rose-300 underline">
                Volver al examen rápido
            </button>

        </div>
    `;

    content.insertAdjacentHTML('afterbegin', contextHTML);

    content.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// ------------------------------------------------------------
// GENERAR INFORME DEL EXAMEN RÁPIDO
// ------------------------------------------------------------

function neuroQuickGenerate() {
    const lines = [];

    let normal = 0;
    let abnormal = 0;
    let pending = 0;

    lines.push('TAMIZAJE NEUROLÓGICO RÁPIDO');
    lines.push('ADROOSIS');
    lines.push('');

    NEURO_QUICK_STATIONS.forEach(station => {
        lines.push(station.title.toUpperCase());

        station.items.forEach(item => {
            const status = neuroQuickGetStatus(item.id);
            const detail = (neuroQuickState.detail[item.id] || '').trim();

            if (status === 'normal') normal++;
            else if (status === 'abnormal') abnormal++;
            else pending++;

            let line = '- ' + item.label + ': ' + neuroQuickStatusLabel(status);

            if (detail) {
                line += '. Observación: ' + detail;
            }

            lines.push(line);
        });

        lines.push('');
    });

    lines.push('RESUMEN');
    lines.push('Maniobras registradas como normales: ' + normal);
    lines.push('Maniobras registradas como alteradas: ' + abnormal);
    lines.push('Maniobras no evaluadas: ' + pending);
    lines.push('');

    lines.push(
        'Este resultado corresponde a un tamizaje neurológico inicial. ' +
        'No sustituye el examen neurológico completo ni descarta por sí solo ' +
        'patología neurológica. Los hallazgos anormales requieren evaluación ' +
        'dirigida según el contexto clínico.'
    );

    const report = lines.join('\n');
    const summary = document.getElementById('neuro-quick-summary');

    if (!summary) return;

    summary.classList.remove('hidden');

    summary.innerHTML = `
        <div class="flex items-center gap-2">
            <i class="fa-solid fa-file-lines text-teal-600 dark:text-teal-400"></i>
            <h3 class="text-sm font-black">Informe del examen rápido</h3>
        </div>

        <textarea id="neuro-quick-report"
            rows="15"
            class="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs leading-relaxed text-slate-800 dark:text-slate-200"
        >${neuroQuickEsc(report)}</textarea>

        <button type="button"
            onclick="neuroQuickCopy()"
            class="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-extrabold">
            <i class="fa-solid fa-copy mr-2"></i>Copiar informe rápido
        </button>
    `;

    summary.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// ------------------------------------------------------------
// COPIAR INFORME
// ------------------------------------------------------------

async function neuroQuickCopy() {
    const report = document.getElementById('neuro-quick-report');

    if (!report || !report.value.trim()) {
        alert('Primero genera el informe del examen rápido.');
        return;
    }

    try {
        await navigator.clipboard.writeText(report.value);
        alert('Informe del examen rápido copiado.');
    } catch (error) {
        report.select();
        document.execCommand('copy');
        alert('Informe del examen rápido copiado.');
    }
}

// ------------------------------------------------------------
// FIN EXAMEN NEUROLÓGICO RÁPIDO
// ============================================================

// Inicialización diferida del módulo
document.addEventListener('DOMContentLoaded', () => {
    neuroRender();
});

// ============================================================
// FIN DEL MÓDULO EXAMEN NEUROLÓGICO
// ============================================================

        // INITIALIZATION
        /* ---------------------------------------------------------
   Líquidos basales pediátricos (Holliday-Segar)
   --------------------------------------------------------- */
function calcLiquidosPed() {
    const peso = Number(document.getElementById('liq-peso').value);
    const talla = Number(document.getElementById('liq-talla').value);
    const edadRaw = document.getElementById('liq-edad').value.trim();
    const edad = Number(edadRaw);
    const res = document.getElementById('liq-res');

    if (!Number.isFinite(peso) || peso < 0.5 || peso > 150) {
        alert('Ingrese un peso válido entre 0,5 y 150 kg.');
        return;
    }

    let mlDia, mlHora, detalle;
    if (peso <= 10) {
        mlDia = peso * 100;
        mlHora = peso * 4;
        detalle = peso + ' kg × 100 mL/kg/día';
    } else if (peso <= 20) {
        mlDia = 1000 + (peso - 10) * 50;
        mlHora = 40 + (peso - 10) * 2;
        detalle = '1.000 mL + (' + (peso - 10) + ' kg × 50 mL)';
    } else {
        mlDia = 1500 + (peso - 20) * 20;
        mlHora = 60 + (peso - 20) * 1;
        detalle = '1.500 mL + (' + (peso - 20) + ' kg × 20 mL)';
    }

    let extra = '';
    if (Number.isFinite(talla) && talla >= 30) {
        const sc = Math.sqrt((talla * peso) / 3600);
        extra += '<div class="text-[11px] text-slate-500 dark:text-slate-400">Superficie corporal (Mosteller): <strong>' +
            sc.toFixed(2) + ' m²</strong> · 1.500 mL/m²/día ≈ <strong>' + Math.round(1500 * sc) + ' mL/día</strong></div>';
    }
    if (peso > 30) {
        extra += '<div class="text-[10px] leading-snug text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 rounded-lg p-2">' +
            'En mayores de 30 kg la fórmula sobreestima: usa 1.500 mL/m²/día o 30 - 35 mL/kg/día.</div>';
    }

    res.innerHTML =
        '<div class="flex items-baseline justify-between">' +
        '<span class="text-[11px] font-bold text-slate-500 dark:text-slate-400">Mantenimiento (Holliday-Segar)</span>' +
        '<span class="text-[10px] text-slate-400">' + peso + ' kg' + (edadRaw !== '' ? ' · ' + edad + ' años' : '') + '</span>' +
        '</div>' +
        '<div class="text-2xl font-extrabold text-teal-700 dark:text-teal-300">' + Math.round(mlDia) + ' mL/día</div>' +
        '<div class="text-sm font-bold text-slate-700 dark:text-slate-200">' + mlHora.toFixed(1) + ' mL/h</div>' +
        '<div class="text-[11px] text-slate-500 dark:text-slate-400">' + detalle + '</div>' +
        extra +
        '<div class="text-[10px] leading-snug text-slate-500 dark:text-slate-400 pt-1">' +
        'Es solo mantenimiento: no reemplaza los bolos de rehidratación ni el manejo del choque. En neonatos usa el esquema por días de vida. Ajusta en fiebre, quemaduras, cardiopatía o falla renal.</div>';
    res.classList.remove('hidden');
}

window.onload = function() {
            const darkToggle = document.getElementById('dark-mode-toggle');
            if (darkToggle) darkToggle.setAttribute('aria-checked', String(document.documentElement.classList.contains('dark')));
            renderSidebarModules();
            rotatePerla();
            renderNovedades();
            renderCalculators();        // <- nuevo (llena window.calcsData)
            tplLoadTemplate('urg_dolor');
            renderFavoritos();
            renderInfectoSindromes();   // <- nuevo
            renderInfectoGermenes();    // <- nuevo
            enhanceNumericInputs();
            switchTab('inicio');
        };
        function calcRIFLE() {
            const g = id => document.getElementById(id);
            const crBasal = parseFloat(g('rifle-cr-basal')?.value || 0);
            const crActual = parseFloat(g('rifle-cr-actual')?.value || 0);
            const diuresis = parseFloat(g('rifle-diuresis')?.value || 0);
            const duracion = parseFloat(g('rifle-duracion')?.value || 0);
            const res = g('rifle-res');
            if (!res) return;
            let estadio = 'Sin AKI';
            if (crBasal > 0 && crActual > 0) {
                const ratio = crActual / crBasal;
                if (ratio >= 3 || crActual >= 4.0) estadio = 'Failure (F)';
                else if (ratio >= 2.0) estadio = 'Injury (I)';
                else if (ratio >= 1.5) estadio = 'Risk (R)';
            }
            if (diuresis > 0 && duracion >= 6) {
                if (diuresis < 0.3 && duracion >= 24) estadio = 'Failure (F)';
                else if (diuresis < 0.5 && duracion >= 12) estadio = estadio === 'Sin AKI' ? 'Injury (I)' : estadio;
                else if (diuresis < 0.5 && duracion >= 6) estadio = estadio === 'Sin AKI' ? 'Risk (R)' : estadio;
            }
            const colors = { 'Sin AKI': 'text-emerald-700 dark:text-emerald-400', 'Risk (R)': 'text-amber-700 dark:text-amber-400', 'Injury (I)': 'text-rose-600 dark:text-rose-400', 'Failure (F)': 'text-rose-700 dark:text-rose-400' };
            res.innerHTML = `<div class="font-bold ${colors[estadio]}">${estadio}</div>`;
            res.classList.remove('hidden');
        }

        function calcAKIN() {
            const g = id => document.getElementById(id);
            const crBasal = parseFloat(g('akin-cr-basal')?.value || 0);
            const crActual = parseFloat(g('akin-cr-actual')?.value || 0);
            const diuresis = parseFloat(g('akin-diuresis')?.value || 0);
            const duracion = parseFloat(g('akin-duracion')?.value || 0);
            const res = g('akin-res');
            if (!res) return;
            let estadio = 0;
            if (crBasal > 0 && crActual > 0) {
                const ratio = crActual / crBasal;
                if (ratio > 3 || crActual >= 4.0) estadio = 3;
                else if (ratio >= 2.0) estadio = 2;
                else if (ratio >= 1.5 || (crActual - crBasal >= 0.3)) estadio = 1;
            }
            if (diuresis > 0 && duracion >= 6) {
                if (diuresis < 0.3 && duracion >= 24) estadio = Math.max(estadio, 3);
                else if (diuresis < 0.5 && duracion >= 12) estadio = Math.max(estadio, 2);
            }
            const labels = ['Sin AKI', 'AKIN 1', 'AKIN 2', 'AKIN 3'];
            const colors = ['text-emerald-700 dark:text-emerald-400', 'text-amber-700 dark:text-amber-400', 'text-rose-600 dark:text-rose-400', 'text-rose-700 dark:text-rose-400'];
            res.innerHTML = `<div class="font-bold ${colors[estadio]}">${labels[estadio]}</div>`;
            res.classList.remove('hidden');
        }

        function calcPRISM() {
            const g = id => document.getElementById(id);
            const pas = parseFloat(g('prism-pas')?.value || 0);
            const fc = parseFloat(g('prism-fc')?.value || 0);
            const fr = parseFloat(g('prism-fr')?.value || 0);
            const gcs = parseFloat(g('prism-gcs')?.value || 0);
            const pup = parseInt(g('prism-pup')?.value || 0);
            const pao2 = parseFloat(g('prism-pao2')?.value || 0);
            const vent = g('prism-vent')?.checked;
            const conv = g('prism-conv')?.checked;
            const res = g('prism-res');
            if (!res) return;
            let score = 0;
            if (pas < 65) score += 6; else if (pas < 80) score += 3;
            if (fc > 160 || fc < 80) score += 4;
            if (fr > 60 || fr < 10) score += 4;
            if (gcs < 8) score += 5; else if (gcs < 11) score += 3;
            score += pup * 5;
            if (pao2 < 50) score += 6; else if (pao2 < 70) score += 3;
            if (vent) score += 3;
            if (conv) score += 4;
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">PRISM: ${score} pts</div><div class="text-[10px] text-slate-500 mt-1">Mayor score = mayor riesgo de mortalidad.</div>`;
            res.classList.remove('hidden');
        }

        function calcPELOD() {
            const g = id => document.getElementById(id);
            const gcs = parseFloat(g('pelod-gcs')?.value || 0);
            const fc = parseFloat(g('pelod-fc')?.value || 0);
            const pas = parseFloat(g('pelod-pas')?.value || 0);
            const pao2 = parseFloat(g('pelod-pao2')?.value || 0);
            const paco2 = parseFloat(g('pelod-paco2')?.value || 0);
            const cr = parseFloat(g('pelod-cr')?.value || 0);
            const plq = parseFloat(g('pelod-plq')?.value || 0);
            const leu = parseFloat(g('pelod-leu')?.value || 0);
            const vent = g('pelod-vent')?.checked;
            const res = g('pelod-res');
            if (!res) return;
            let score = 0;
            if (gcs < 7) score += 21; else if (gcs < 11) score += 10;
            if (fc > 160 || fc < 60) score += 4;
            if (pas < 65) score += 6; else if (pas < 80) score += 3;
            if (pao2 < 50) score += 6; else if (pao2 < 70) score += 3;
            if (paco2 > 60) score += 4;
            if (cr > 1.4) score += 4;
            if (plq < 50) score += 4;
            if (leu < 2 || leu > 40) score += 4;
            if (vent) score += 3;
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">PELOD: ${score} pts</div><div class="text-[10px] text-slate-500 mt-1">PELOD ≥ 20: alto riesgo de mortalidad.</div>`;
            res.classList.remove('hidden');
        }

        function calcPhoenix() {
            const g = id => document.getElementById(id);
            const resp = g('phoenix-resp')?.checked;
            const cv = g('phoenix-cv')?.checked;
            const coag = g('phoenix-coag')?.checked;
            const hep = g('phoenix-hep')?.checked;
            const count = [resp, cv, coag, hep].filter(Boolean).length;
            const res = g('phoenix-res');
            if (!res) return;
            let interp = '';
            if (count >= 2) {
                if (cv) interp = 'Choque séptico (Phoenix ≥ 2 con disfunción cardiovascular)';
                else interp = 'Sepsis (Phoenix ≥ 2)';
            } else if (count === 1) interp = 'Disfunción orgánica (1 criterio) — monitorizar';
            else interp = 'Sin disfunción orgánica';
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">${interp} (${count}/4 criterios)</div>`;
            res.classList.remove('hidden');
        }
        function calcGeneva() {
            const g = id => document.getElementById(id);
            let score = 0;
            if (g('geneva-tvp')?.checked) score += 3;
            if (g('geneva-fc')?.checked) score += 5;
            if (g('geneva-hem')?.checked) score += 2;
            if (g('geneva-can')?.checked) score += 2;
            if (g('geneva-unilat')?.checked) score += 3;
            if (g('geneva-dolor')?.checked) score += 4;
            if (g('geneva-cir')?.checked) score += 2;
            const res = g('geneva-res');
            if (!res) return;
            let interp = '';
            if (score <= 3) interp = 'Probabilidad baja (≤ 3)';
            else if (score <= 10) interp = 'Probabilidad intermedia (4-10)';
            else interp = 'Probabilidad alta (≥ 11)';
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">Geneva: ${score} pts — ${interp}</div>`;
            res.classList.remove('hidden');
        }

        function calcHestia() {
            const g = id => document.getElementById(id);
            const checks = ['hestia-1','hestia-2','hestia-3','hestia-4','hestia-5','hestia-6','hestia-7','hestia-8','hestia-9','hestia-10'];
            const anyPositive = checks.some(id => g(id)?.checked);
            const res = g('hestia-res');
            if (!res) return;
            if (anyPositive) {
                res.innerHTML = `<div class="font-bold text-amber-700 dark:text-amber-400">Hestia positivo → hospitalizar (no ambulatorio)</div>`;
            } else {
                res.innerHTML = `<div class="font-bold text-emerald-700 dark:text-emerald-400">Hestia negativo → puede manejarse ambulatoriamente</div>`;
            }
            res.classList.remove('hidden');
        }

        function calcPIM3() {
            const g = id => document.getElementById(id);
            const pas = parseFloat(g('pim3-pas')?.value || 0);
            const pao2 = parseFloat(g('pim3-pao2')?.value || 0);
            const fio2 = parseFloat(g('pim3-fio2')?.value || 0);
            const paco2 = parseFloat(g('pim3-paco2')?.value || 0);
            const be = parseFloat(g('pim3-be')?.value || 0);
            const pup = parseInt(g('pim3-pup')?.value || 0);
            const vent = g('pim3-vent')?.checked;
            const bypass = g('pim3-bypass')?.checked;
            const nocancer = g('pim3-nocancer')?.checked;
            const res = g('pim3-res');
            if (!res) return;
            // Simplified PIM3 (full formula requires more variables)
            let logit = -4.8;
            if (pas > 0) logit += (100 - pas) * 0.01;
            if (pao2 > 0 && fio2 > 0) {
                const ratio = pao2 / (fio2 / 100);
                if (ratio < 100) logit += 1.5;
                else if (ratio < 200) logit += 0.8;
            }
            if (paco2 > 0) logit += (paco2 - 40) * 0.02;
            if (be < 0) logit += Math.abs(be) * 0.1;
            logit += pup * 0.5;
            if (vent) logit += 0.5;
            if (bypass) logit -= 1.0;
            if (nocancer) logit -= 0.3;
            const prob = 1 / (1 + Math.exp(-logit));
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">PIM3: probabilidad de muerte ${(prob * 100).toFixed(1)}%</div><div class="text-[10px] text-slate-500 mt-1">Estimación simplificada. Usar con precaución.</div>`;
            res.classList.remove('hidden');
        }

        function calcOttawaTobillo() {
            const g = id => document.getElementById(id);
            const c1 = g('ott-tob-1')?.checked;
            const c2 = g('ott-tob-2')?.checked;
            const c3 = g('ott-tob-3')?.checked;
            const res = g('ottawa-tobillo-res');
            if (!res) return;
            if (c1 || c2 || c3) {
                res.innerHTML = `<div class="font-bold text-amber-700 dark:text-amber-400">Ottawa positivo → radiografía de tobillo indicada</div>`;
            } else {
                res.innerHTML = `<div class="font-bold text-emerald-700 dark:text-emerald-400">Ottawa negativo → no radiografía</div>`;
            }
            res.classList.remove('hidden');
        }
        function calcCockcroftGault() {
            const g = id => document.getElementById(id);
            const edad = parseFloat(g('cg-edad')?.value || 0);
            const peso = parseFloat(g('cg-peso')?.value || 0);
            const cr = parseFloat(g('cg-cr')?.value || 0);
            const sexo = g('cg-sexo')?.value;
            if (!edad || !peso || !cr) { const res = g('cg-res'); if (res) { res.innerHTML = '<div class="font-bold text-amber-600">Completa todos los campos.</div>'; res.classList.remove('hidden'); } return; }
            let crcl = (140 - edad) * peso / (72 * cr);
            if (sexo === 'f') crcl *= 0.85;
            const res = g('cg-res');
            if (!res) return;
            let interp = '';
            if (crcl >= 90) interp = 'Normal (≥ 90)';
            else if (crcl >= 60) interp = 'Leve (60-89)';
            else if (crcl >= 30) interp = 'Moderado (30-59)';
            else if (crcl >= 15) interp = 'Severo (15-29)';
            else interp = 'Falla renal (< 15)';
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">CrCl: ${crcl.toFixed(1)} mL/min — ${interp}</div>`;
            res.classList.remove('hidden');
        }

        function calcIBW() {
            const g = id => document.getElementById(id);
            const sexo = g('ibw-sexo')?.value;
            const altura = parseFloat(g('ibw-altura')?.value || 0);
            const peso = parseFloat(g('ibw-peso')?.value || 0);
            if (!altura || !peso) { const res = g('ibw-res'); if (res) { res.innerHTML = '<div class="font-bold text-amber-600">Completa todos los campos.</div>'; res.classList.remove('hidden'); } return; }
            const alturaIn = altura / 2.54;
            let ibw = 0;
            if (sexo === 'm') ibw = 50 + 2.3 * (alturaIn - 60);
            else ibw = 45.5 + 2.3 * (alturaIn - 60);
            const abw = ibw + 0.4 * (peso - ibw);
            let lbw = 0;
            if (sexo === 'm') lbw = 0.407 * peso + 0.267 * altura - 19.2;
            else lbw = 0.252 * peso + 0.473 * altura - 48.3;
            const res = g('ibw-res');
            if (!res) return;
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">IBW: ${ibw.toFixed(1)} kg · ABW: ${abw.toFixed(1)} kg · LBW: ${lbw.toFixed(1)} kg</div><div class="text-[10px] text-slate-500 mt-1">IBW = peso ideal. ABW = peso ajustado (obesos). LBW = peso magro.</div>`;
            res.classList.remove('hidden');
        }

        function calcKDIGO() {
            const g = id => document.getElementById(id);
            const crBasal = parseFloat(g('kdigo-cr-basal')?.value || 0);
            const crActual = parseFloat(g('kdigo-cr-actual')?.value || 0);
            const diuresis = parseFloat(g('kdigo-diuresis')?.value || 0);
            const duracion = parseFloat(g('kdigo-duracion')?.value || 0);
            const res = g('kdigo-res');
            if (!res) return;
            let estadio = 0;
            let criterio = '';
            if (crBasal > 0 && crActual > 0) {
                const ratio = crActual / crBasal;
                if (ratio >= 3 || crActual >= 4.0) { estadio = 3; criterio = 'Cr ≥ 3× basal o ≥ 4.0 mg/dL'; }
                else if (ratio >= 2.0) { estadio = 2; criterio = 'Cr 2.0-2.9× basal'; }
                else if (ratio >= 1.5 || (crActual - crBasal >= 0.3)) { estadio = 1; criterio = 'Cr 1.5-1.9× basal o ≥ 0.3 mg/dL en 48h'; }
            }
            if (diuresis > 0 && duracion >= 6) {
                if (diuresis < 0.3) estadio = Math.max(estadio, 3);
                else if (diuresis < 0.5) estadio = Math.max(estadio, 2);
                else if (diuresis < 0.6) estadio = Math.max(estadio, 1);
            }
            const labels = ['Sin AKI', 'KDIGO 1', 'KDIGO 2', 'KDIGO 3'];
            const colors = ['text-emerald-700 dark:text-emerald-400', 'text-amber-700 dark:text-amber-400', 'text-rose-600 dark:text-rose-400', 'text-rose-700 dark:text-rose-400'];
            res.innerHTML = `<div class="font-bold ${colors[estadio]}">${labels[estadio]}${criterio ? ' — ' + criterio : ''}</div>`;
            res.classList.remove('hidden');
        }

        function calcParkland() {
            const g = id => document.getElementById(id);
            const peso = parseFloat(g('parkland-peso')?.value || 0);
            const sctq = parseFloat(g('parkland-sctq')?.value || 0);
            const res = g('parkland-res');
            if (!res) return;
            if (!peso || !sctq) { res.innerHTML = '<div class="font-bold text-amber-600">Completa todos los campos.</div>'; res.classList.remove('hidden'); return; }
            const vol24 = 4 * peso * sctq;
            const primeras8 = vol24 / 2;
            const siguientes16 = vol24 / 2;
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">Volumen 24h: ${vol24.toFixed(0)} mL</div><div class="text-[10px] text-slate-500 mt-1">Primeras 8 h: ${primeras8.toFixed(0)} mL (${(primeras8/8).toFixed(0)} mL/h). Siguientes 16 h: ${siguientes16.toFixed(0)} mL (${(siguientes16/16).toFixed(0)} mL/h).</div>`;
            res.classList.remove('hidden');
        }

        function calcRuleOfNines() {
            const g = id => document.getElementById(id);
            const cabeza = parseFloat(g('ron-cabeza')?.value || 0);
            const troncoant = parseFloat(g('ron-troncoant')?.value || 0);
            const troncopost = parseFloat(g('ron-troncopost')?.value || 0);
            const brd = parseFloat(g('ron-brd')?.value || 0);
            const bri = parseFloat(g('ron-bri')?.value || 0);
            const pd = parseFloat(g('ron-pd')?.value || 0);
            const pi = parseFloat(g('ron-pi')?.value || 0);
            const gen = parseFloat(g('ron-gen')?.value || 0);
            const total = cabeza + troncoant + troncopost + brd + bri + pd + pi + gen;
            const res = g('ron-res');
            if (!res) return;
            let interp = '';
            if (total >= 20) interp = 'Quemadura mayor — reanimación con Parkland';
            else if (total >= 10) interp = 'Quemadura moderada — hospitalizar';
            else interp = 'Quemadura menor — manejo ambulatorio';
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">SCTQ: ${total}% — ${interp}</div>`;
            res.classList.remove('hidden');
        }

        function calcMELD() {
            const g = id => document.getElementById(id);
            let bili = parseFloat(g('meld-bili')?.value || 0);
            let inr = parseFloat(g('meld-inr')?.value || 0);
            let cr = parseFloat(g('meld-cr')?.value || 0);
            const na = parseFloat(g('meld-na')?.value || 0);
            const dialisis = g('meld-dialisis')?.checked;
            if (dialisis) cr = 4.0;
            if (bili < 1) bili = 1;
            if (inr < 1) inr = 1;
            if (cr < 1) cr = 1;
            if (cr > 4) cr = 4;
            const meld = 3.78 * Math.log(bili) + 11.2 * Math.log(inr) + 9.57 * Math.log(cr) + 6.43;
            const meldNa = meld + 1.32 * (137 - na) - 0.033 * meld * (137 - na);
            const res = g('meld-res');
            if (!res) return;
            let interp = '';
            if (meld >= 15) interp = 'Prioridad para trasplante (≥ 15)';
            else if (meld >= 10) interp = 'Riesgo moderado (10-14)';
            else interp = 'Riesgo bajo (< 10)';
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">MELD: ${meld.toFixed(1)} · MELD-Na: ${meldNa.toFixed(1)} — ${interp}</div>`;
            res.classList.remove('hidden');
        }
        function calcFLACC() {
            const g = id => document.getElementById(id);
            const cara = parseInt(g('flacc-cara')?.value || 0);
            const piernas = parseInt(g('flacc-piernas')?.value || 0);
            const act = parseInt(g('flacc-act')?.value || 0);
            const llanto = parseInt(g('flacc-llanto')?.value || 0);
            const cons = parseInt(g('flacc-cons')?.value || 0);
            const total = cara + piernas + act + llanto + cons;
            const res = g('flacc-res');
            if (!res) return;
            let interp = '';
            if (total >= 7) interp = 'Dolor severo (7-10)';
            else if (total >= 4) interp = 'Dolor moderado (4-6)';
            else if (total >= 1) interp = 'Dolor leve (1-3)';
            else interp = 'Sin dolor (0)';
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">FLACC: ${total}/10 — ${interp}</div>`;
            res.classList.remove('hidden');
        }

        function calcBraden() {
            const g = id => document.getElementById(id);
            const sens = parseInt(g('braden-sens')?.value || 0);
            const hum = parseInt(g('braden-hum')?.value || 0);
            const act = parseInt(g('braden-act')?.value || 0);
            const mov = parseInt(g('braden-mov')?.value || 0);
            const nut = parseInt(g('braden-nut')?.value || 0);
            const fric = parseInt(g('braden-fric')?.value || 0);
            const total = sens + hum + act + mov + nut + fric;
            const res = g('braden-res');
            if (!res) return;
            let interp = '';
            if (total <= 9) interp = 'Riesgo muy alto (≤ 9)';
            else if (total <= 12) interp = 'Riesgo alto (10-12)';
            else if (total <= 14) interp = 'Riesgo moderado (13-14)';
            else if (total <= 18) interp = 'Riesgo leve (15-18)';
            else interp = 'Sin riesgo (19-23)';
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">Braden: ${total}/23 — ${interp}</div>`;
            res.classList.remove('hidden');
        }

        function calcMorse() {
            const g = id => document.getElementById(id);
            const hist = parseInt(g('morse-hist')?.value || 0);
            const dx = parseInt(g('morse-dx')?.value || 0);
            const ayuda = parseInt(g('morse-ayuda')?.value || 0);
            const iv = parseInt(g('morse-iv')?.value || 0);
            const marcha = parseInt(g('morse-marcha')?.value || 0);
            const mental = parseInt(g('morse-mental')?.value || 0);
            const total = hist + dx + ayuda + iv + marcha + mental;
            const res = g('morse-res');
            if (!res) return;
            let interp = '';
            if (total >= 45) interp = 'Alto riesgo (≥ 45)';
            else if (total >= 25) interp = 'Riesgo moderado (25-44)';
            else interp = 'Bajo riesgo (< 25)';
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">Morse: ${total} pts — ${interp}</div>`;
            res.classList.remove('hidden');
        }

        function calcCPOT() {
            const g = id => document.getElementById(id);
            const cara = parseInt(g('cpot-cara')?.value || 0);
            const mov = parseInt(g('cpot-mov')?.value || 0);
            const musc = parseInt(g('cpot-musc')?.value || 0);
            const vent = parseInt(g('cpot-vent')?.value || 0);
            const total = cara + mov + musc + vent;
            const res = g('cpot-res');
            if (!res) return;
            let interp = '';
            if (total >= 3) interp = 'Dolor significativo (≥ 3) — tratar con analgesia';
            else interp = 'Sin dolor significativo (< 3)';
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">CPOT: ${total}/8 — ${interp}</div>`;
            res.classList.remove('hidden');
        }
        function calcPHQ9() {
            const g = id => document.getElementById(id);
            let total = 0;
            for (let i = 1; i <= 9; i++) total += parseInt(g(`phq9-q${i}`)?.value || 0);
            const res = g('phq9-res');
            if (!res) return;
            let interp = '';
            if (total >= 20) interp = 'Depresión severa';
            else if (total >= 15) interp = 'Depresión moderadamente severa';
            else if (total >= 10) interp = 'Depresión moderada';
            else if (total >= 5) interp = 'Depresión leve';
            else interp = 'Sin depresión significativa';
            const q9 = parseInt(g('phq9-q9')?.value || 0);
            const alerta = q9 > 0 ? ' ⚠ Pregunta 9 positiva: evaluar riesgo suicida.' : '';
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">PHQ-9: ${total}/27 — ${interp}${alerta}</div>`;
            res.classList.remove('hidden');
        }

        function calcGAD7() {
            const g = id => document.getElementById(id);
            let total = 0;
            for (let i = 1; i <= 7; i++) total += parseInt(g(`gad7-q${i}`)?.value || 0);
            const res = g('gad7-res');
            if (!res) return;
            let interp = '';
            if (total >= 15) interp = 'Ansiedad severa';
            else if (total >= 10) interp = 'Ansiedad moderada';
            else if (total >= 5) interp = 'Ansiedad leve';
            else interp = 'Sin ansiedad significativa';
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">GAD-7: ${total}/21 — ${interp}</div>`;
            res.classList.remove('hidden');
        }

        function calcAUDITC() {
            const g = id => document.getElementById(id);
            const q1 = parseInt(g('auditc-q1')?.value || 0);
            const q2 = parseInt(g('auditc-q2')?.value || 0);
            const q3 = parseInt(g('auditc-q3')?.value || 0);
            const total = q1 + q2 + q3;
            const res = g('auditc-res');
            if (!res) return;
            let interp = '';
            if (total >= 4) interp = 'Consumo de riesgo (hombres: ≥ 4, mujeres: ≥ 3)';
            else interp = 'Consumo de bajo riesgo';
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">AUDIT-C: ${total}/12 — ${interp}</div>`;
            res.classList.remove('hidden');
        }

        function calcMoCA() {
            const g = id => document.getElementById(id);
            const ve = parseInt(g('moca-ve')?.value || 0);
            const den = parseInt(g('moca-den')?.value || 0);
            const at = parseInt(g('moca-at')?.value || 0);
            const len = parseInt(g('moca-len')?.value || 0);
            const abs = parseInt(g('moca-abs')?.value || 0);
            const rec = parseInt(g('moca-rec')?.value || 0);
            const ori = parseInt(g('moca-ori')?.value || 0);
            const total = ve + den + at + len + abs + rec + ori;
            const res = g('moca-res');
            if (!res) return;
            let interp = '';
            if (total >= 26) interp = 'Normal (≥ 26)';
            else if (total >= 18) interp = 'Deterioro cognitivo leve (18-25)';
            else interp = 'Deterioro moderado-severo (< 18)';
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">MoCA: ${total}/30 — ${interp}</div>`;
            res.classList.remove('hidden');
        }

        function calcCAM() {
            const g = id => document.getElementById(id);
            const c1 = g('cam-1')?.checked;
            const c2 = g('cam-2')?.checked;
            const c3 = g('cam-3')?.checked;
            const c4 = g('cam-4')?.checked;
            const positivo = c1 && c2 && (c3 || c4);
            const res = g('cam-res');
            if (!res) return;
            if (positivo) {
                res.innerHTML = `<div class="font-bold text-rose-700 dark:text-rose-400">CAM positivo → DELIRIUM. Evaluar y tratar la causa.</div>`;
            } else {
                res.innerHTML = `<div class="font-bold text-emerald-700 dark:text-emerald-400">CAM negativo → sin delirium.</div>`;
            }
            res.classList.remove('hidden');
        }

        function calc4AT() {
            const g = id => document.getElementById(id);
            const alert = parseInt(g('4at-alert')?.value || 0);
            const amt = parseInt(g('4at-amt')?.value || 0);
            const at = parseInt(g('4at-at')?.value || 0);
            const cambio = parseInt(g('4at-cambio')?.value || 0);
            const total = alert + amt + at + cambio;
            const res = g('4at-res');
            if (!res) return;
            let interp = '';
            if (total >= 4) interp = 'Probable delirium (≥ 4)';
            else if (total >= 1) interp = 'Posible deterioro cognitivo (1-3)';
            else interp = 'Delirium improbable (0)';
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">4AT: ${total}/12 — ${interp}</div>`;
            res.classList.remove('hidden');
        }
        function calcNEWS2() {
            const g = id => document.getElementById(id);
            const fr = parseInt(g('news2-fr')?.value || 0);
            const sat = parseInt(g('news2-sat')?.value || 0);
            const t = parseInt(g('news2-t')?.value || 0);
            const pas = parseInt(g('news2-pas')?.value || 0);
            const fc = parseInt(g('news2-fc')?.value || 0);
            const avpu = parseInt(g('news2-avpu')?.value || 0);
            const total = fr + sat + t + pas + fc + avpu;
            const res = g('news2-res');
            if (!res) return;
            let interp = '', color = '';
            if (total >= 7) { interp = 'Riesgo ALTO — activar respuesta rápida'; color = 'text-rose-700 dark:text-rose-400'; }
            else if (total >= 5) { interp = 'Riesgo MEDIO — evaluar y tratar'; color = 'text-amber-700 dark:text-amber-400'; }
            else if (total >= 1) { interp = 'Riesgo BAJO — monitorizar'; color = 'text-teal-700 dark:text-teal-400'; }
            else { interp = 'Sin riesgo — monitorización rutinaria'; color = 'text-emerald-700 dark:text-emerald-400'; }
            res.innerHTML = `<div class="font-bold ${color}">NEWS2: ${total} pts — ${interp}</div>`;
            res.classList.remove('hidden');
        }

        function calcSOFA() {
            const g = id => document.getElementById(id);
            const pafi = parseInt(g('sofa-pafi')?.value || 0);
            const plq = parseInt(g('sofa-plq')?.value || 0);
            const bili = parseInt(g('sofa-bili')?.value || 0);
            const pam = parseInt(g('sofa-pam')?.value || 0);
            const gcs = parseInt(g('sofa-gcs')?.value || 0);
            const cr = parseInt(g('sofa-cr')?.value || 0);
            const total = pafi + plq + bili + pam + gcs + cr;
            const res = g('sofa-res');
            if (!res) return;
            let interp = '';
            if (total >= 2) interp = 'SOFA ≥ 2 → SEPSIS (disfunción orgánica)';
            else interp = 'SOFA < 2 → sin disfunción orgánica significativa';
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">SOFA: ${total} pts — ${interp}</div>`;
            res.classList.remove('hidden');
        }

        function calcWellsTEP() {
            const g = id => document.getElementById(id);
            let score = 0;
            if (g('wtep-tvp')?.checked) score += 3;
            if (g('wtep-alt')?.checked) score += 3;
            if (g('wtep-fc')?.checked) score += 1.5;
            if (g('wtep-inm')?.checked) score += 1.5;
            if (g('wtep-hem')?.checked) score += 1;
            if (g('wtep-can')?.checked) score += 1;
            const res = g('wells-tep-res');
            if (!res) return;
            let interp = '';
            if (score > 4) interp = 'Probabilidad ALTA → Angio-TC de tórax';
            else if (score >= 2) interp = 'Probabilidad INTERMEDIA → D-dímero';
            else interp = 'Probabilidad BAJA → D-dímero';
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">Wells TEP: ${score} pts — ${interp}</div>`;
            res.classList.remove('hidden');
        }

        function calcPERC() {
            const g = id => document.getElementById(id);
            const checks = ['perc-edad','perc-fc','perc-sat','perc-hem','perc-est','perc-tvp','perc-trauma','perc-unilat'];
            const allNegative = checks.every(id => !g(id)?.checked);
            const res = g('perc-res');
            if (!res) return;
            if (allNegative) {
                res.innerHTML = `<div class="font-bold text-emerald-700 dark:text-emerald-400">PERC negativo → TEP excluido (sin pruebas adicionales)</div>`;
            } else {
                res.innerHTML = `<div class="font-bold text-amber-700 dark:text-amber-400">PERC positivo → realizar D-dímero o angio-TC</div>`;
            }
            res.classList.remove('hidden');
        }

        function calcPESI() {
            const g = id => document.getElementById(id);
            const edad = parseFloat(g('pesi-edad')?.value || 0);
            const fc = parseFloat(g('pesi-fc')?.value || 0);
            const pas = parseFloat(g('pesi-pas')?.value || 0);
            const sat = parseFloat(g('pesi-sat')?.value || 0);
            let score = edad;
            if (fc >= 110) score += 10;
            if (pas < 100) score += 30;
            if (sat < 90) score += 20;
            if (g('pesi-can')?.checked) score += 30;
            if (g('pesi-ic')?.checked) score += 10;
            if (g('pesi-enf')?.checked) score += 10;
            const res = g('pesi-res');
            if (!res) return;
            let clase = '', interp = '';
            if (score <= 65) { clase = 'I'; interp = 'Muy bajo riesgo (1.6%)'; }
            else if (score <= 85) { clase = 'II'; interp = 'Bajo riesgo (3.5%)'; }
            else if (score <= 105) { clase = 'III'; interp = 'Riesgo intermedio (3.2%)'; }
            else if (score <= 125) { clase = 'IV'; interp = 'Alto riesgo (4.0%)'; }
            else { clase = 'V'; interp = 'Muy alto riesgo (10.4%)'; }
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">PESI: ${Math.round(score)} pts — Clase ${clase} — ${interp}</div>`;
            res.classList.remove('hidden');
        }

        function calcGlasgowBlatchford() {
            const g = id => document.getElementById(id);
            const urea = parseFloat(g('gb-urea')?.value || 0);
            const hb = parseFloat(g('gb-hb')?.value || 0);
            const pas = parseFloat(g('gb-pas')?.value || 0);
            const fc = parseFloat(g('gb-fc')?.value || 0);
            let score = 0;
            if (urea >= 10 && urea <= 25) score += 2;
            else if (urea > 25) score += 3;
            if (hb >= 12 && hb <= 13) score += 1;
            else if (hb >= 10 && hb < 12) score += 3;
            else if (hb < 10) score += 6;
            if (pas >= 100 && pas <= 109) score += 1;
            else if (pas >= 90 && pas < 100) score += 2;
            else if (pas < 90) score += 3;
            if (fc >= 100) score += 1;
            if (g('gb-melena')?.checked) score += 1;
            if (g('gb-sincope')?.checked) score += 2;
            if (g('gb-hepatic')?.checked) score += 2;
            if (g('gb-cardiac')?.checked) score += 2;
            const res = g('gb-res');
            if (!res) return;
            let interp = '';
            if (score <= 1) interp = 'Bajo riesgo — puede manejarse ambulatoriamente';
            else interp = 'Alto riesgo — hospitalizar y endoscopia urgente';
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">Glasgow-Blatchford: ${score} pts — ${interp}</div>`;
            res.classList.remove('hidden');
        }

        function calcRockall() {
            const g = id => document.getElementById(id);
            const edad = parseInt(g('rock-edad')?.value || 0);
            const shock = parseInt(g('rock-shock')?.value || 0);
            const com = parseInt(g('rock-com')?.value || 0);
            const dx = parseInt(g('rock-dx')?.value || 0);
            const sang = parseInt(g('rock-sang')?.value || 0);
            const total = edad + shock + com + dx + sang;
            const res = g('rockall-res');
            if (!res) return;
            let interp = '';
            if (total <= 2) interp = 'Bajo riesgo — mortalidad < 5%';
            else if (total <= 4) interp = 'Riesgo intermedio — mortalidad 5-10%';
            else interp = 'Alto riesgo — mortalidad > 10%, resangrado alto';
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">Rockall: ${total} pts — ${interp}</div>`;
            res.classList.remove('hidden');
        }

        function calcAIMS65() {
            const g = id => document.getElementById(id);
            let score = 0;
            if (g('aims-alb')?.checked) score++;
            if (g('aims-inr')?.checked) score++;
            if (g('aims-pas')?.checked) score++;
            if (g('aims-edad')?.checked) score++;
            if (g('aims-alt')?.checked) score++;
            const res = g('aims65-res');
            if (!res) return;
            let interp = '';
            if (score <= 1) interp = 'Bajo riesgo';
            else interp = 'Alto riesgo — mortalidad aumentada, UCI';
            res.innerHTML = `<div class="font-bold text-slate-800 dark:text-slate-200">AIMS65: ${score} pts — ${interp}</div>`;
            res.classList.remove('hidden');
        }

