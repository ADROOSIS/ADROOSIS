/* =========================================================
   ADROOSIS · NIHSS COMPLETA
   11 ítems / 15 apartados puntuables / 0-42 puntos
========================================================= */

(function () {
    const containerId = 'neuro-nihss-items';

    const nihssItems = [
        {
            id: '1a',
            title: '1a. Nivel de conciencia',
            instruction: 'Observe el estado de alerta y la respuesta del paciente. Si es necesario, utilice estímulos para valorar su respuesta.',
            options: [
                [0, 'Alerta; responde con atención normal.'],
                [1, 'No está alerta, pero despierta con estimulación leve y obedece, responde o reacciona.'],
                [2, 'Requiere estimulación repetida o intensa para responder; está estuporoso.'],
                [3, 'Responde únicamente con reflejos motores o autonómicos, o está totalmente arreactivo.']
            ]
        },
        {
            id: '1b',
            title: '1b. Preguntas de orientación',
            instruction: 'Pregunte el mes actual y la edad del paciente. No dé pistas. Califique únicamente la primera respuesta.',
            options: [
                [0, 'Responde correctamente ambas preguntas.'],
                [1, 'Responde correctamente una pregunta. También corresponde si no puede hablar por intubación, disartria grave, trauma orotraqueal o barrera idiomática no atribuible a afasia.'],
                [2, 'No responde correctamente ninguna pregunta, o no comprende por afasia o estupor.']
            ]
        },
        {
            id: '1c',
            title: '1c. Órdenes',
            instruction: 'Pida abrir y cerrar los ojos y luego cerrar y abrir la mano no parética. Si las manos no pueden utilizarse, sustituya por otra orden sencilla de un paso.',
            options: [
                [0, 'Realiza correctamente ambas órdenes.'],
                [1, 'Realiza correctamente una de las dos órdenes.'],
                [2, 'No realiza correctamente ninguna de las dos órdenes.']
            ]
        },
        {
            id: '2',
            title: '2. Mejor mirada (movimientos horizontales)',
            instruction: 'Evalúe los movimientos oculares horizontales voluntarios o reflejos. No realice pruebas calóricas. La mirada se puede evaluar en pacientes con afasia.',
            options: [
                [0, 'Normal.'],
                [1, 'Parálisis parcial de la mirada o paresia aislada de los pares craneales III, IV o VI.'],
                [2, 'Desviación forzada o parálisis total de la mirada que no se supera mediante maniobras oculocefálicas.']
            ]
        },
        {
            id: '3',
            title: '3. Campos visuales',
            instruction: 'Explore los cuadrantes superiores e inferiores por confrontación. Si existe ceguera unilateral o enucleación, evalúe el ojo restante. Realice estimulación visual bilateral simultánea.',
            options: [
                [0, 'Sin pérdida visual.'],
                [1, 'Hemianopsia parcial o asimetría clara, incluida cuadrantanopsia.'],
                [2, 'Hemianopsia completa.'],
                [3, 'Ceguera bilateral o pérdida visual completa por cualquier causa.']
            ]
        },
        {
            id: '4',
            title: '4. Parálisis facial',
            instruction: 'Solicite mostrar los dientes, elevar las cejas y cerrar los ojos. En pacientes con disminución de conciencia, valore la respuesta a estímulos nocivos.',
            options: [
                [0, 'Movimientos faciales normales y simétricos.'],
                [1, 'Parálisis menor: borramiento del surco nasolabial o asimetría leve al sonreír.'],
                [2, 'Parálisis parcial: parálisis total o casi total de la parte inferior de la cara.'],
                [3, 'Parálisis completa de uno o ambos lados; ausencia de movimiento facial.']
            ]
        },
        {
            id: '5a',
            title: '5a. Motor del brazo izquierdo',
            instruction: 'Coloque el brazo a 90° si está sentado o 45° si está en decúbito supino, con la palma hacia abajo. Mantenga durante 10 segundos. Evalúe primero el lado no parético.',
            allowUN: true,
            unReason: 'Amputación o fusión articular del hombro izquierdo.',
            options: [
                [0, 'Sin caída; mantiene la posición durante 10 segundos.'],
                [1, 'Desciende antes de 10 segundos, pero no llega a tocar la cama o soporte.'],
                [2, 'Algún esfuerzo contra gravedad; no logra mantener la posición y desciende hasta el soporte.'],
                [3, 'No vence la gravedad; el brazo cae.'],
                [4, 'Ausencia de movimiento.']
            ]
        },
        {
            id: '5b',
            title: '5b. Motor del brazo derecho',
            instruction: 'Coloque el brazo a 90° si está sentado o 45° si está en decúbito supino, con la palma hacia abajo. Mantenga durante 10 segundos.',
            allowUN: true,
            unReason: 'Amputación o fusión articular del hombro derecho.',
            options: [
                [0, 'Sin caída; mantiene la posición durante 10 segundos.'],
                [1, 'Desciende antes de 10 segundos, pero no llega a tocar la cama o soporte.'],
                [2, 'Algún esfuerzo contra gravedad; no logra mantener la posición y desciende hasta el soporte.'],
                [3, 'No vence la gravedad; el brazo cae.'],
                [4, 'Ausencia de movimiento.']
            ]
        },
        {
            id: '6a',
            title: '6a. Motor de la pierna izquierda',
            instruction: 'Con el paciente en decúbito supino, eleve la pierna a 30° y mantenga durante 5 segundos.',
            allowUN: true,
            unReason: 'Amputación o fusión articular de la cadera izquierda.',
            options: [
                [0, 'Sin caída; mantiene la posición durante 5 segundos.'],
                [1, 'Desciende antes de 5 segundos, pero no toca la cama.'],
                [2, 'Algún esfuerzo contra gravedad; cae hasta la cama antes de 5 segundos.'],
                [3, 'No vence la gravedad; la pierna cae inmediatamente.'],
                [4, 'Ausencia de movimiento.']
            ]
        },
        {
            id: '6b',
            title: '6b. Motor de la pierna derecha',
            instruction: 'Con el paciente en decúbito supino, eleve la pierna a 30° y mantenga durante 5 segundos.',
            allowUN: true,
            unReason: 'Amputación o fusión articular de la cadera derecha.',
            options: [
                [0, 'Sin caída; mantiene la posición durante 5 segundos.'],
                [1, 'Desciende antes de 5 segundos, pero no toca la cama.'],
                [2, 'Algún esfuerzo contra gravedad; cae hasta la cama antes de 5 segundos.'],
                [3, 'No vence la gravedad; la pierna cae inmediatamente.'],
                [4, 'Ausencia de movimiento.']
            ]
        },
        {
            id: '7',
            title: '7. Ataxia de las extremidades',
            instruction: 'Realice dedo-nariz y talón-rodilla en ambos lados. Puntúe únicamente si la ataxia es desproporcionada a la debilidad. Si el paciente está paralizado o no comprende, no atribuya ataxia por ello.',
            allowUN: true,
            unReason: 'Amputación o fusión articular que impide la exploración.',
            options: [
                [0, 'Ausente.'],
                [1, 'Presente en una extremidad.'],
                [2, 'Presente en dos extremidades.']
            ]
        },
        {
            id: '8',
            title: '8. Sensibilidad',
            instruction: 'Evalúe la respuesta al pinchazo o estímulo doloroso en cara, brazos, piernas y tronco según sea necesario. Puntúe la pérdida sensitiva atribuible al ictus.',
            options: [
                [0, 'Normal; sin pérdida sensitiva.'],
                [1, 'Pérdida sensitiva leve o moderada; percibe el tacto, pero el pinchazo es menos intenso o menos agudo.'],
                [2, 'Pérdida sensitiva grave o total; no percibe el tacto en cara, brazo o pierna.']
            ]
        },
        {
            id: '9',
            title: '9. Mejor lenguaje',
            instruction: 'Solicite describir la imagen de la escena, denominar los objetos de la lámina oficial y leer las frases del material oficial. Valore comprensión y expresión. Si existe pérdida visual, adapte la evaluación mediante objetos al tacto, repetición o producción verbal.',
            options: [
                [0, 'Sin afasia; lenguaje normal.'],
                [1, 'Afasia leve o moderada; pérdida evidente de fluidez o comprensión, pero permite identificar el contenido de los estímulos.'],
                [2, 'Afasia grave; comunicación fragmentaria y el examinador debe inferir gran parte del significado.'],
                [3, 'Mutismo o afasia global; no existe lenguaje útil ni comprensión auditiva funcional.']
            ]
        },
        {
            id: '10',
            title: '10. Disartria',
            instruction: 'Obtenga una muestra adecuada del habla mediante lectura o repetición de palabras del material oficial. Si existe afasia grave, valore la articulación del habla espontánea.',
            allowUN: true,
            unReason: 'Intubación u otra barrera física que impide producir habla.',
            options: [
                [0, 'Articulación normal.'],
                [1, 'Disartria leve o moderada; arrastra algunas palabras, pero puede entenderse con cierta dificultad.'],
                [2, 'Disartria grave; habla ininteligible, o mutismo/anart ria.']
            ]
        },
        {
            id: '11',
            title: '11. Extinción e inatención',
            instruction: 'Evalúe inatención visual, táctil, auditiva, espacial o personal. Realice estimulación bilateral simultánea cuando corresponda. Puede utilizar hallazgos de los apartados previos. Este ítem nunca se marca como no evaluable.',
            options: [
                [0, 'Sin alteraciones.'],
                [1, 'Inatención o extinción ante estimulación bilateral simultánea en una modalidad sensorial.'],
                [2, 'Hemi-inatención profunda o extinción en más de una modalidad; no reconoce su propia mano u orienta únicamente hacia un lado del espacio.']
            ]
        }
    ];

    function renderNihss() {
        const container = document.getElementById(containerId);
        if (!container || container.dataset.rendered === 'true') return;

        container.dataset.rendered = 'true';

        container.innerHTML = `
            <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
                <div class="flex items-center justify-between gap-3 flex-wrap">
                    <h4 class="font-black text-sm text-slate-900 dark:text-white">
                        Evaluación NIHSS
                    </h4>
                    <span class="text-xs text-slate-500 dark:text-slate-400">
                        15 apartados · Máximo 42 puntos
                    </span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                    Registre cada respuesta en el orden indicado. Califique lo que el paciente hace, no lo que usted cree que podría hacer. No modifique puntuaciones anteriores.
                </p>
            </div>

            <div id="nihss-fields" class="space-y-4"></div>

            <div id="nihss-result" class="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/30 p-4 space-y-3">
                <div class="flex items-center justify-between gap-3">
                    <h4 class="font-black text-sm text-indigo-950 dark:text-indigo-200">
                        Resultado NIHSS
                    </h4>
                    <span id="nihss-progress" class="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                        0 / 15 apartados
                    </span>
                </div>
                <div id="nihss-total" class="text-3xl font-black text-indigo-950 dark:text-white">
                    —
                </div>
                <p id="nihss-status" class="text-xs text-indigo-900 dark:text-indigo-300">
                    Complete los apartados para calcular el resultado.
                </p>
                <div id="nihss-breakdown" class="text-xs text-slate-700 dark:text-slate-300"></div>
                <button type="button" onclick="neuroNihssReset()"
                    class="w-full rounded-xl px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-200">
                    <i class="fa-solid fa-rotate-left mr-2"></i>
                    Reiniciar escala
                </button>
            </div>
        `;

        const fields = document.getElementById('nihss-fields');

        nihssItems.forEach(item => {
            const options = item.options.map(option =>
                `<option value="${option[0]}">${option[0]} · ${option[1]}</option>`
            ).join('');

            const unOption = item.allowUN
                ? `<option value="UN">UN · No evaluable (solo por la causa permitida)</option>`
                : '';

            const card = document.createElement('section');
            card.className = 'rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3';
            card.innerHTML = `
                <div>
                    <h4 class="font-black text-sm text-slate-900 dark:text-white">${item.title}</h4>
                    <p class="text-xs leading-relaxed text-slate-600 dark:text-slate-400 mt-2">${item.instruction}</p>
                </div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300" for="nihss-score-${item.id}">
                    Seleccione la puntuación
                </label>
                <select id="nihss-score-${item.id}" data-nihss-id="${item.id}"
                    class="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3 text-xs">
                    <option value="">Seleccione una respuesta...</option>
                    ${options}
                    ${unOption}
                </select>
                ${item.allowUN ? `
                    <div id="nihss-un-box-${item.id}" class="hidden space-y-2">
                        <p class="text-xs font-bold text-amber-700 dark:text-amber-400">
                            Motivo permitido para UN
                        </p>
                        <p class="text-xs text-slate-600 dark:text-slate-400">${item.unReason}</p>
                        <input id="nihss-un-reason-${item.id}" type="text"
                            placeholder="Explique la causa concreta..."
                            class="w-full rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white">
                    </div>
                ` : ''}
            `;
            fields.appendChild(card);
        });

        container.addEventListener('change', event => {
            if (event.target.matches('[data-nihss-id]')) {
                const id = event.target.dataset.nihssId;
                const unBox = document.getElementById('nihss-un-box-' + id);
                if (unBox) {
                    unBox.classList.toggle('hidden', event.target.value !== 'UN');
                }
                updateNihss();
            }
        });

        container.addEventListener('input', event => {
            if (event.target.id && event.target.id.startsWith('nihss-un-reason-')) {
                updateNihss();
            }
        });

        updateNihss();
    }

    function updateNihss() {
        const fields = document.getElementById('nihss-fields');
        if (!fields) return;

        const coma = document.getElementById('nihss-score-1a')?.value === '3';

        // Regla oficial: coma (1a = 3) asigna automáticamente 2 en sensibilidad
        // y 3 en mejor lenguaje.
        ['8', '9'].forEach((id, index) => {
            const select = document.getElementById('nihss-score-' + id);
            if (!select) return;
            if (coma) {
                select.value = index === 0 ? '2' : '3';
                select.disabled = true;
                select.classList.add('opacity-60');
            } else {
                select.disabled = false;
                select.classList.remove('opacity-60');
            }
        });

        let total = 0;
        let completed = 0;
        let hasUN = false;
        let missingReason = false;
        const breakdown = [];

        nihssItems.forEach(item => {
            const select = document.getElementById('nihss-score-' + item.id);
            if (!select || select.value === '') return;

            completed++;

            if (select.value === 'UN') {
                hasUN = true;
                const reason = document.getElementById('nihss-un-reason-' + item.id)?.value.trim();
                if (!reason) missingReason = true;
                breakdown.push(`${item.id}: UN`);
            } else {
                total += Number(select.value);
                breakdown.push(`${item.id}: ${select.value}`);
            }
        });

        const progress = document.getElementById('nihss-progress');
        const totalBox = document.getElementById('nihss-total');
        const status = document.getElementById('nihss-status');
        const detail = document.getElementById('nihss-breakdown');

        if (progress) progress.textContent = `${completed} / 15 apartados`;

        if (completed < 15) {
            totalBox.textContent = '—';
            status.textContent = `Faltan ${15 - completed} apartados por completar.`;
        } else if (hasUN) {
            totalBox.textContent = 'No calculable';
            status.textContent = missingReason
                ? 'Debe registrar el motivo de cada apartado marcado UN. No se debe presentar la suma parcial como total NIHSS.'
                : 'Existe al menos un apartado no evaluable (UN). No se puede presentar una suma parcial como total NIHSS.';
        } else {
            totalBox.textContent = `${total} / 42`;
            status.textContent = 'Puntuación total NIHSS calculada. Interprete junto con la valoración clínica.';
        }

        if (detail) detail.textContent = breakdown.join(' · ');
    }

    window.neuroNihssReset = function () {
        nihssItems.forEach(item => {
            const select = document.getElementById('nihss-score-' + item.id);
            if (select) {
                select.value = '';
                select.disabled = false;
                select.classList.remove('opacity-60');
            }
            const reason = document.getElementById('nihss-un-reason-' + item.id);
            if (reason) reason.value = '';
            const unBox = document.getElementById('nihss-un-box-' + item.id);
            if (unBox) unBox.classList.add('hidden');
        });
        updateNihss();
    };

    // Renderiza el formulario cuando el módulo ya está disponible.
    renderNihss();

    // Permite abrir NIHSS aunque el módulo se haya cargado después.
    const originalOpen = window.neuroNihssOpen;
    if (typeof originalOpen === 'function') {
        window.neuroNihssOpen = function () {
            renderNihss();
            originalOpen();
        };
    }
})();

