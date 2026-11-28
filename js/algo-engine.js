/* ===== ALGORITHM VISUAL ENGINE (FASE 0) ===== */
/* Reusable data-driven engine for clinical algorithms */

window.ALGO = window.ALGO || { data: [], current: null, view: 'step', pob: 'adulto', notes: {} };

// ---- Visual renderer for existing ALG_DATA algorithms ----

function algVisualRender(alg) {
    if (!alg) return;
    const container = document.getElementById('algo-container') || document.getElementById('alg-run-view');
    if (!container) return;
    container.classList.remove('hidden');
    const listEl = document.getElementById('alg-list-view');
    if (listEl) listEl.classList.add('hidden');

    const pob = ALG.pob || alg.pob[0];
    if (!alg.pob.includes(pob)) ALG.pob = alg.pob[0];
    const curPob = ALG.pob;

    // Population tabs
    const pobBtns = alg.pob.length > 1
        ? `<div class="alg-pob-tabs">${alg.pob.map(p => {
            const labels = { adulto: 'Adulto', pediatrico: 'Pediátrico', gestante: 'Gestante' };
            return `<button class="alg-pob-tab ${curPob === p ? 'active' : ''}" onclick="algSetPobVisual('${p}')">${labels[p] || p}</button>`;
        }).join('')}</div>`
        : '';

    // Peso box
    const pesoBox = alg.peso
        ? `<div class="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300"><label>Peso (kg):</label><input id="alg-peso" type="number" inputmode="decimal" step="any" min="0" value="${algEsc(ALG.peso || '')}" oninput="algPeso(this.value)" placeholder="Ej: 20" class="w-24 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"></div>` : '';

    let html = '';

    // Banner
    html += `<div class="alg-banner"><span class="alg-banner-num">${alg.num || '#'}</span><span>${alg.titulo}</span></div>`;

    // View toggle
    html += `<div class="alg-view-toggle">
        <button class="alg-view-btn ${ALGO.view === 'diagram' ? 'active' : ''}" onclick="ALGO.view='diagram';algVisualRender(ALG.cur)">Diagrama completo</button>
        <button class="alg-view-btn ${ALGO.view === 'step' ? 'active' : ''}" onclick="ALGO.view='step';algVisualRender(ALG.cur)">Paso a paso</button>
    </div>`;

    // Header with source
    html += `<div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 space-y-2">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div><h3 class="font-extrabold text-base text-slate-900 dark:text-white">${alg.titulo}</h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Fuente: <a href="${alg.fuente.url}" target="_blank" rel="noopener" class="underline hover:text-teal-600">${alg.fuente.t}</a> · revisado ${alg.revisado}</p></div>
            <div class="flex flex-wrap items-center gap-3">${pobBtns}${pesoBox}</div>
        </div>
        <p class="text-[10px] text-slate-400 italic leading-snug">Alcance: ${alg.alcance}</p>
    </div>`;

    // Content
    if (ALGO.view === 'diagram') {
        html += algVisualDiagram(alg, curPob);
    } else {
        html += algVisualStep(alg, curPob);
    }

    // Note panel
    html += `<div id="alg-note-panel"></div>`;

    // Footer
    html += algVisualFooter(alg);

    // Back button
    html += `<div class="flex gap-2 mt-2">
        <button onclick="algBackVisual()" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold"><i class="fa-solid fa-arrow-left mr-1"></i>Todos los algoritmos</button>
        <button onclick="algRestartVisual()" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold"><i class="fa-solid fa-rotate-left mr-1"></i>Reiniciar</button>
    </div>`;

    container.innerHTML = html;
    if (ALGO.view === 'step') {
        setTimeout(() => algVisualRenderCurrentNode(), 0);
    }
}

function algVisualDiagram(alg, pob) {
    const nodes = alg.nodos;
    let html = '<div class="alg-diagram-container">';

    // Traverse the node tree in order
    const visited = new Set();
    const order = [];
    function traverse(nid) {
        if (!nid || visited.has(nid)) return;
        visited.add(nid);
        order.push(nid);
        const n = nodes[nid];
        if (!n) return;
        if (n.opts) n.opts.forEach(o => traverse(o.to));
        if (n.sig) traverse(n.sig);
        if (n.to) traverse(n.to);
    }
    const startNode = Object.keys(nodes).find(k => nodes[k].tipo === 'q' || nodes[k].tipo === 'act') || Object.keys(nodes)[0];
    // Find the actual start - usually 'inicio' or first node
    const start = nodes['inicio'] ? 'inicio' : (nodes['estab'] ? 'estab' : Object.keys(nodes)[0]);
    traverse(start);

    order.forEach(nid => {
        const n = nodes[nid];
        if (!n) return;
        const type = n.tipo || 'act';

        if (type === 'fin') {
            const tone = n.tono === 'crit' ? 'crit' : n.tono === 'warn' ? 'warn' : 'ok';
            const bg = tone === 'crit' ? 'var(--alg-phase-crit-bg)' : tone === 'warn' ? 'var(--alg-phase-bg)' : 'var(--alg-node-bg)';
            const border = tone === 'crit' ? 'var(--alg-phase-crit-text)' : 'var(--alg-node-border)';
            const color = tone === 'crit' ? 'var(--alg-phase-crit-text)' : 'var(--alg-node-text)';
            html += `<div class="alg-node" style="background:${bg};border-color:${border};color:${color};margin-bottom:0.5rem;">`;
            html += `<div class="alg-node-title">${n.t || n.corto || nid}</div>`;
            if (n.det) {
                const items = Array.isArray(n.det) ? n.det : (n.det[pob] || n.det.adulto || []);
                html += '<ul>' + items.map(d => '<li>' + algoFmtText(d) + '</li>').join('') + '</ul>';
            }
            html += '</div>';
        } else if (type === 'q') {
            html += `<div class="alg-decision" style="margin-bottom:0.25rem;">${n.t || n.corto || nid}</div>`;
            if (n.opts) {
                html += '<div style="display:flex;gap:0.5rem;margin:0.25rem 0 0.5rem 1rem;flex-wrap:wrap;">';
                n.opts.forEach(o => {
                    html += `<span class="alg-time-badge" style="background:var(--alg-node-border);cursor:pointer;" onclick="algVisualChoose('${o.to}','${o.t.replace(/'/g, "\\'")}')">${o.t} &rarr;</span>`;
                });
                html += '</div>';
            }
        } else {
            // act node
            html += `<div class="alg-node" style="margin-bottom:0.25rem;">`;
            html += `<div class="alg-node-title">${n.t || n.corto || nid}</div>`;
            if (n.det) {
                const items = Array.isArray(n.det) ? n.det : (n.det[pob] || n.det.adulto || []);
                html += '<ul>' + items.map(d => '<li>' + algoFmtText(d) + '</li>').join('') + '</ul>';
            }
            if (n.links) {
                html += '<div class="mt-1 text-[10px]">' + n.links.map(l => `<a href="#" onclick="algOpenDrug('${l.drug}');return false;" class="text-teal-600 dark:text-teal-400 underline">${l.l}</a>`).join(' · ') + '</div>';
            }
            html += '</div>';
        }
        html += '<div style="text-align:center;color:var(--alg-arrow);font-size:0.75rem;margin:0.125rem 0;">↓</div>';
    });

    html += '</div>';
    return html;
}

function algVisualStep(alg, pob) {
    // Reuse the trail + node pattern
    return '<div id="alg-trail" class="text-[10px] text-slate-500 mb-2"></div><div id="alg-node"></div>';
}

function algVisualRenderCurrentNode() {
    const alg = ALG.cur;
    if (!alg) return;
    const pob = ALG.pob;
    const nodes = alg.nodos;
    const trail = document.getElementById('alg-trail');
    const nodeEl = document.getElementById('alg-node');
    if (!nodeEl) return;

    if (trail) {
        trail.innerHTML = ALG.path.map((p, i) => {
            const n = nodes[p.id];
            return `<span>${i > 0 ? ' → ' : ''}${n ? (n.corto || n.t || p.id) : p.id}</span>`;
        }).join('');
    }

    const nid = ALG.path.length ? ALG.path[ALG.path.length - 1].id : (nodes['inicio'] ? 'inicio' : Object.keys(nodes)[0]);
    const n = nodes[nid];
    if (!n) { nodeEl.innerHTML = '<div class="alg-node">Nodo no encontrado</div>'; return; }

    if (n.tipo === 'fin') {
        const tone = n.tono === 'crit' ? 'crit' : n.tono === 'warn' ? 'warn' : 'ok';
        const bg = tone === 'crit' ? 'var(--alg-phase-crit-bg)' : tone === 'warn' ? 'var(--alg-phase-bg)' : 'var(--alg-node-bg)';
        const border = tone === 'crit' ? 'var(--alg-phase-crit-text)' : 'var(--alg-node-border)';
        const color = tone === 'crit' ? 'var(--alg-phase-crit-text)' : 'var(--alg-node-text)';
        let html = `<div class="alg-step-card" style="background:${bg};border-color:${border};">
            <div style="font-weight:700;color:${color};">${n.t || n.corto || nid}</div>`;
        if (n.det) {
            const items = Array.isArray(n.det) ? n.det : (n.det[pob] || n.det.adulto || []);
            html += '<ul class="mt-2 space-y-1 text-xs list-disc ml-4" style="color:' + color + ';">' + items.map(d => '<li>' + algoFmtText(d) + '</li>').join('') + '</ul>';
        }
        html += '</div>';
        html += `<button onclick="algRestartVisual()" class="w-full py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs mt-2">Reiniciar</button>`;
        nodeEl.innerHTML = html;
        return;
    }

    if (n.tipo === 'q') {
        nodeEl.innerHTML = `<div class="alg-step-card">
            <div style="font-weight:600;">${n.t || n.corto || nid}</div>
            <div class="flex gap-2 mt-3">
                ${(n.opts || []).map(o => `<button onclick="algVisualChoose('${o.to}','${o.t.replace(/'/g, "\\'")}'')" class="flex-1 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs">${o.t}</button>`).join('')}
            </div>
        </div>`;
        return;
    }

    // act node
    const det = n.det;
    const detItems = Array.isArray(det) ? det : (det && (det[pob] || det.adulto) ? (det[pob] || det.adulto) : []);
    let html = `<div class="alg-step-card">
        <div style="font-weight:600;">${n.t || n.corto || nid}</div>`;
    if (detItems.length) {
        html += '<ul class="mt-2 space-y-1 text-xs list-disc ml-4">' + detItems.map(d => '<li>' + algoFmtText(d) + '</li>').join('') + '</ul>';
    }
    if (n.links) {
        html += '<div class="mt-2 text-[10px]">' + n.links.map(l => `<a href="#" onclick="algOpenDrug('${l.drug}');return false;" class="text-teal-600 dark:text-teal-400 underline">${l.l}</a>`).join(' · ') + '</div>';
    }
    const next = n.sig || (n.opts && n.opts[0] ? n.opts[0].to : null);
    if (next) {
        html += `<button onclick="algVisualGoStep('${next}')" class="w-full mt-3 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs">Siguiente →</button>`;
    }
    html += '</div>';
    nodeEl.innerHTML = html;
}

function algVisualChoose(to, label) {
    ALG.path.push({ id: to, choice: label });
    algVisualRenderCurrentNode();
}

function algVisualGoStep(to) {
    if (!to) return;
    ALG.path.push({ id: to, choice: '' });
    algVisualRenderCurrentNode();
}

function algRestartVisual() {
    const alg = ALG.cur;
    if (!alg) return;
    const start = alg.nodos['inicio'] ? 'inicio' : (alg.nodos['estab'] ? 'estab' : Object.keys(alg.nodos)[0]);
    ALG.path = [{ id: start, choice: '' }];
    algVisualRender(alg);
}

function algBackVisual() {
    ALG.cur = null;
    const container = document.getElementById('algo-container');
    if (container) container.classList.add('hidden');
    const listEl = document.getElementById('alg-list-view');
    if (listEl) listEl.classList.remove('hidden');
    const runEl = document.getElementById('alg-run-view');
    if (runEl) runEl.classList.add('hidden');
}

function algSetPobVisual(p) {
    ALG.pob = p;
    algVisualRender(ALG.cur);
}

function algVisualFooter(alg) {
    let html = '<div class="alg-footer">';
    // Abbreviations (extract from alcance or use defaults)
    html += '<div><strong>Abreviaturas:</strong> IV = intravenoso, IM = intramuscular, IO = intraóseo, PA = presión arterial, UCI = unidad de cuidados intensivos</div>';
    html += `<div class="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
        <strong>Fuente:</strong> ${alg.fuente.t} · revisado ${alg.revisado}
        · <span class="text-emerald-600 dark:text-emerald-400">✓ Verificado</span>
    </div>`;
    html += '<div class="mt-1 italic">Herramienta de apoyo: no sustituye el juicio clínico ni la guía institucional.</div>';
    html += '</div>';
    return html;
}

function algoFmtText(txt) {
    return String(txt)
        .replace(/\*\*(.+?)\*\*/g, '<span class="drug">$1</span>')
        .replace(/\n/g, '<br>');
}

function algEsc(v) { return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ---- Override algOpen to use visual renderer ----
const _origAlgOpen = (typeof algOpen === 'function') ? algOpen : null;
window.algOpen = function(id) {
    const a = (typeof ALG_DATA !== 'undefined') ? ALG_DATA.find(x => x.id === id) : null;
    if (!a) { if (_origAlgOpen) _origAlgOpen(id); return; }
    ALG.cur = a;
    const start = a.nodos && a.nodos['inicio'] ? 'inicio' : (a.nodos && a.nodos['estab'] ? 'estab' : (a.nodos ? Object.keys(a.nodos)[0] : 'inicio'));
    ALG.path = [{ id: start, choice: '' }];
    ALG.pob = a.pob && a.pob.includes(ALG.pob) ? ALG.pob : (a.pob ? a.pob[0] : 'adulto');
    ALGO.view = ALGO.view || 'step';
    // Show container, hide list
    const container = document.getElementById('algo-container');
    const listEl = document.getElementById('alg-list-view');
    const runEl = document.getElementById('alg-run-view');
    if (container) { container.classList.remove('hidden'); }
    if (listEl) listEl.classList.add('hidden');
    if (runEl) runEl.classList.add('hidden');
    algVisualRender(a);
};

// ---- Override algInit ----
const _origAlgInit = (typeof algInit === 'function') ? algInit : null;
window.algInit = function() {
    if (ALG.cur) {
        // Re-render
        const container = document.getElementById('algo-container');
        if (container && !container.classList.contains('hidden')) {
            algVisualRender(ALG.cur);
            return;
        }
    }
    // Show list
    const container = document.getElementById('algo-container');
    if (container) container.classList.add('hidden');
    const listEl = document.getElementById('alg-list-view');
    if (listEl) listEl.classList.remove('hidden');
    const runEl = document.getElementById('alg-run-view');
    if (runEl) runEl.classList.add('hidden');
    if (_origAlgInit) _origAlgInit();
};

// ---- Override algBack ----
window.algBack = function() {
    ALG.cur = null;
    const container = document.getElementById('algo-container');
    if (container) container.classList.add('hidden');
    const listEl = document.getElementById('alg-list-view');
    if (listEl) listEl.classList.remove('hidden');
    const runEl = document.getElementById('alg-run-view');
    if (runEl) runEl.classList.add('hidden');
};

// ---- Override algRestart ----
window.algRestart = function() {
    algRestartVisual();
};

// ---- Override algSetPob ----
window.algSetPob = function(p) {
    ALG.pob = p;
    if (ALG.cur) algVisualRender(ALG.cur);
};

// ---- Override algPeso ----
window.algPeso = function(v) {
    ALG.peso = v;
};

window.ALG = ALG;
window.ALGO = ALGO;

// ---- Override algShowList to hide algo-container ----
const _origAlgShowList = (typeof algShowList === 'function') ? algShowList : null;
window.algShowList = function() {
    const container = document.getElementById('algo-container');
    if (container) container.classList.add('hidden');
    if (_origAlgShowList) _origAlgShowList();
};

console.log('Algo visual engine loaded');
