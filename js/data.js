/* ADROOSIS - Datos clínicos (cargado antes de app.js) */

let moduleList = [
            { id: 'infectologia', label: 'Infectología', icon: 'fa-bugs' },
            { id: 'dengue', label: 'Dengue & Arbovirus', icon: 'fa-virus', kw: 'dengue zika chikungunya arbovirus fiebre amarilla aedes mosquito arbovirosis' },
            { id: 'gases', label: 'Gases Arteriales', icon: 'fa-vial-circle-check' },
            { id: 'cardiologia', label: 'Cardiología', icon: 'fa-heart-pulse', kw: 'cardiologia ecg electrocardiograma insuficiencia cardiaca sca sindrome coronario infarto' },
            { id: 'semiologia', label: 'Síndromes Clínicos', icon: 'fa-notes-medical' },
            { id: 'neurologico', label: 'Examen neurológico', icon: 'fa-brain', kw: 'neurología examen neurológico pares craneales fuerza sensibilidad reflejos coordinación marcha meninges estado mental' },
            { id: 'calculadoras', label: 'Calculadoras', icon: 'fa-calculator' },
            { id: 'plantillas', label: 'Plantillas inteligentes', icon: 'fa-file-pen' },
            { id: 'farmaco', label: 'Vademécum', icon: 'fa-pills' },
            { id: 'sivigila', label: 'Salud Pública / RIAS', icon: 'fa-hospital-user' },
            { id: 'triadas', label: 'Tríadas Clínicas', icon: 'fa-layer-group' },
            { id: 'algoritmos', label: 'Algoritmos', icon: 'fa-diagram-project', kw: 'algoritmo flujograma decision paso a paso anafilaxia estado epileptico convulsion diarrea deshidratacion planes A B C urgencias de campo' },
        ];

const triadsDatabase = [
            { id: 'beck', name: 'Tríada de Beck', category: 'cardio', entity: 'Taponamiento Cardíaco', items: ['1. Hipotensión arterial', '2. Ruidos cardíacos velados', '3. Ingurgitación yugular'], pearl: 'Urgencia vital. Confirmar con ETT.' },
            { id: 'charcot', name: 'Tríada de Charcot', category: 'gastro', entity: 'Colangitis Aguda', items: ['1. Fiebre', '2. Ictericia', '3. Dolor en HCD'], pearl: 'Añadir shock y mental alterado = Péntada de Reynolds.' },
            { id: 'reynolds', name: 'Péntada de Reynolds', category: 'gastro', entity: 'Colangitis Severa', items: ['1. Fiebre', '2. Ictericia', '3. Dolor en HCD', '4. Shock / Hipotensión', '5. Alteración del estado mental'], pearl: 'Drenaje biliar urgente por CPRE.' },
            { id: 'virchow', name: 'Tríada de Virchow', category: 'urgencias', entity: 'Trombosis (TVP/TEP)', items: ['1. Estasis venosa', '2. Lesión endotelial', '3. Hipercoagulabilidad'], pearl: 'Eje fisiopatológico de la trombogénesis.' },
            { id: 'cushing', name: 'Tríada de Cushing', category: 'neuro', entity: 'Hipertensión Intracraneal Severa', items: ['1. Hipertensión con pulso amplio', '2. Bradicardia', '3. Irregularidad respiratoria'], pearl: 'Signo pre-terminal de herniación cerebral.' },
            { id: 'whipple', name: 'Tríada de Whipple', category: 'urgencias', entity: 'Hipoglucemia', items: ['1. Síntomas compatibles con hipoglucemia', '2. Glucosa plasmática baja documentada (< 55 mg/dL)', '3. Resolución de los síntomas al corregir la glucosa'], pearl: 'Confirma que los síntomas SON por hipoglucemia. Si falta algún elemento, busca otra causa del cuadro.' },
            { id: 'samter', name: 'Tríada de Samter', category: 'urgencias', entity: 'Enfermedad respiratoria exacerbada por aspirina', items: ['1. Asma', '2. Poliposis nasosinusal', '3. Reacción a aspirina y AINE'], pearl: 'Evita aspirina y AINE; el acetaminofén suele tolerarse. La aspirina solo con desensibilización supervisada.' },
            { id: 'wernicke', name: 'Tríada de Wernicke', category: 'neuro', entity: 'Encefalopatía de Wernicke (déficit de tiamina)', items: ['1. Confusión / alteración del estado mental', '2. Ataxia de la marcha', '3. Oftalmoplejía / nistagmo'], pearl: 'Tiamina IV ANTES de la glucosa en alcohólicos o desnutridos. La tríada completa aparece solo en una minoría.' },
            { id: 'horner', name: 'Tríada de Horner', category: 'neuro', entity: 'Síndrome de Horner (lesión de la vía simpática)', items: ['1. Miosis', '2. Ptosis leve', '3. Anhidrosis ipsilateral'], pearl: 'Horner doloroso agudo: descarta disección carotídea. Con dolor apical y de hombro: tumor de Pancoast.' },
            { id: 'mackler', name: 'Tríada de Mackler', category: 'gastro', entity: 'Rotura esofágica (síndrome de Boerhaave)', items: ['1. Vómito intenso previo', '2. Dolor torácico / epigástrico', '3. Enfisema subcutáneo cervical'], pearl: 'Emergencia con alta mortalidad si se retrasa el diagnóstico. Sospecha en vómito forzado + dolor torácico.' },
            { id: 'meningitis', name: 'Tríada de la meningitis', category: 'neuro', entity: 'Meningitis bacteriana aguda', items: ['1. Fiebre', '2. Cefalea', '3. Rigidez de nuca'], pearl: 'La tríada completa está presente en menos de la mitad de los casos; con alteración del estado mental, dos de cuatro ya es sospecha. No retrases el antibiótico por la TC.' },
            { id: 'meigs', name: 'Tríada de Meigs', category: 'gastro', entity: 'Tumor ovárico benigno con ascitis y derrame pleural', items: ['1. Tumor ovárico (fibroma/tecroma)', '2. Ascitis', '3. Derrame pleural'], pearl: 'La resección del tumor resuelve la ascitis y el derrame. Descarta malignidad.' },
            { id: 'sipple', name: 'Tríada de Sipple (MEN 2A)', category: 'endo', entity: 'Neoplasia endocrina múltiple tipo 2A', items: ['1. Feocromocitoma', '2. Carcinoma medular de tiroides', '3. Hiperparatiroidismo'], pearl: 'Mutación RET. Cirugía profiláctica de tiroides en portadores. Vigila calcitonina.' },
            { id: 'wermer', name: 'Tríada de Wermer (MEN 1)', category: 'endo', entity: 'Neoplasia endocrina múltiple tipo 1', items: ['1. Hiperparatiroidismo', '2. Tumores neuroendocrinos pancreáticos', '3. Adenoma hipofisario'], pearl: 'Mutación MEN1. Hiperparatiroidismo es la manifestación más frecuente.' },
            { id: 'carcinoid', name: 'Tríada del carcinoide', category: 'gastro', entity: 'Síndrome carcinoide', items: ['1. Flushing (rubor facial)', '2. Diarrea secretora', '3. Broncoespasmo / sibilancias'], pearl: 'Tumor neuroendocrino con metástasis hepáticas. Valora 5-HIAA en orina.' },
            { id: 'saint', name: 'Tríada de Saint', category: 'gastro', entity: 'Colecistitis + colangitis + pancreatitis', items: ['1. Colecistitis aguda', '2. Colangitis aguda', '3. Pancreatitis aguda'], pearl: 'Obstrucción biliar común (cálculo en ámpula). Drenaje biliar urgente.' },
            { id: 'courvoisier', name: 'Tríada de Courvoisier', category: 'gastro', entity: 'Obstrucción biliar maligna', items: ['1. Ictericia obstructiva', '2. Vesícula biliar palpable y no dolorosa', '3. Masa en hipocondrio derecho'], pearl: 'Sugiere cáncer de páncreas (cabeza) o ampolla de Vater. La vesícula no está fibrosada.' },
            { id: 'bouveret', name: 'Tríada de Bouveret', category: 'gastro', entity: 'Obstrucción duodenal por cálculo biliar', items: ['1. Obstrucción intestinal', '2. Fístula bilioentérica', '3. Cálculo biliar en duodeno'], pearl: 'Síndrome de Bouveret: obstrucción gástrica/duodenal por cálculo. Endoscopia o cirugía.' },
            { id: 'gradenigo', name: 'Tríada de Gradenigo', category: 'neuro', entity: 'Síndrome del ápex petroso', items: ['1. Otitis media aguda', '2. Parálisis del VI par (abducens)', '3. Dolor facial (V par)'], pearl: 'Infección del ápex petroso. Requiere antibióticos IV y drenaje quirúrgico.' },
            { id: 'tolosa_hunt', name: 'Tríada de Tolosa-Hunt', category: 'neuro', entity: 'Oftalmoplejía dolorosa', items: ['1. Dolor retroocular unilateral', '2. Parálisis de III, IV y VI pares', '3. Respuesta a corticoides'], pearl: 'Granulomatosis inflamatoria del seno cavernoso. Diagnóstico de exclusión.' },
            { id: 'weber', name: 'Tríada de Weber', category: 'neuro', entity: 'Síndrome de Weber (mesencéfalo)', items: ['1. Hemiparesia contralateral', '2. Parálisis del III par ipsilateral', '3. Desviación de la mirada'], pearl: 'Lesión del pedúnculo cerebral. Arteria cerebral posterior.' },
            { id: 'millard_gubler', name: 'Tríada de Millard-Gubler', category: 'neuro', entity: 'Síndrome de Millard-Gubler (protuberancia)', items: ['1. Hemiparesia contralateral', '2. Parálisis del VI par ipsilateral', '3. Parálisis del VII par ipsilateral'], pearl: 'Lesión de la protuberancia ventral. Arteria basilar.' },
            { id: 'benedikt', name: 'Tríada de Benedikt', category: 'neuro', entity: 'Síndrome de Benedikt (mesencéfalo)', items: ['1. Hemiparesia contralateral', '2. Parálisis del III par ipsilateral', '3. Temblor / ataxia cerebelosa'], pearl: 'Lesión del tegmento mesencefálico. Arteria cerebral posterior.' },
            { id: 'claude', name: 'Tríada de Claude', category: 'neuro', entity: 'Síndrome de Claude (mesencéfalo)', items: ['1. Ataxia cerebelosa', '2. Parálisis del III par ipsilateral', '3. (sin hemiparesia)'], pearl: 'Lesión del tegmento mesencefálico. Menos común que Benedikt.' },
            { id: 'nothnagel', name: 'Tríada de Nothnagel', category: 'neuro', entity: 'Síndrome de Nothnagel (mesencéfalo)', items: ['1. Ataxia cerebelosa', '2. Parálisis del III par ipsilateral', '3. (sin temblor)'], pearl: 'Lesión del tegmento mesencefálico superior.' },
            { id: 'parinaud', name: 'Tríada de Parinaud', category: 'neuro', entity: 'Síndrome del pretectum (mesencéfalo)', items: ['1. Parálisis de la mirada vertical (arriba)', '2. Retracción palpebral (signo de Collier)', '3. Nistagmo de convergencia-retracción'], pearl: 'Lesión del pretectum. Tumor pineal, hidrocefalia.' },
            { id: 'foster_kennedy', name: 'Tríada de Foster Kennedy', category: 'neuro', entity: 'Síndrome de Foster Kennedy', items: ['1. Atrofia óptica ipsilateral', '2. Papiledema contralateral', '3. Anosmia ipsilateral'], pearl: 'Tumor del lóbulo frontal (meningioma del surco olfatorio). Aumento de PIC.' },
            { id: 'anton', name: 'Tríada de Anton', category: 'neuro', entity: 'Ceguera cortical con negación (síndrome de Anton)', items: ['1. Ceguera cortical bilateral', '2. Negación de la ceguera (anosognosia)', '3. Confabulación visual'], pearl: 'Lesión bilateral de la corteza occipital. Asociado a síndrome de Balint.' },
            { id: 'balint', name: 'Tríada de Balint', category: 'neuro', entity: 'Síndrome de Balint', items: ['1. Simultanagnosia', '2. Ataxia óptica', '3. Apraxia oculomotora'], pearl: 'Lesión bilateral parieto-occipital. Incapacidad para ver más de un objeto a la vez.' },
            { id: 'gerstmann', name: 'Tríada de Gerstmann', category: 'neuro', entity: 'Síndrome de Gerstmann', items: ['1. Agrafía', '2. Acalculia', '3. Agnosia digital', '4. Desorientación izquierda-derecha'], pearl: 'Lesión del giro angular (hemisferio dominante). Cuatro síntomas clásicos.' },
            { id: 'klüver_bucy', name: 'Tríada de Kluver-Bucy', category: 'neuro', entity: 'Síndrome de Kluver-Bucy', items: ['1. Hiperoralidad', '2. Hipersexualidad', '3. Placidez / docilidad'], pearl: 'Lesión bilateral de los lóbulos temporales (amígdala). Asociado a herpes encefalitis.' },
            { id: 'capgras', name: 'Tríada de Capgras', category: 'psiq', entity: 'Delirio de Capgras (suplantación)', items: ['1. Delirio de que un familiar ha sido reemplazado por un impostor', '2. Reconocimiento facial intacto', '3. Ausencia de respuesta emocional (desconexión amígdala-corteza)'], pearl: 'Asociado a esquizofrenia, demencia, lesión cerebral. Tratamiento antipsicótico.' },
            { id: 'cotard', name: 'Tríada de Cotard', category: 'psiq', entity: 'Síndrome de Cotard (negación de la existencia)', items: ['1. Negación de la existencia propia o de partes del cuerpo', '2. Delirio de inmortalidad o de putrefacción', '3. Depresión severa'], pearl: 'Asociado a depresión psicótica, esquizofrenia. Tratamiento: antidepresivos + antipsicóticos.' },
            { id: 'othello', name: 'Tríada de Othello', category: 'psiq', entity: 'Celos delirantes', items: ['1. Creencia delirante de infidelidad de la pareja', '2. Evidencia contraria ignorada', '3. Conducta de vigilancia / acoso'], pearl: 'Asociado a alcoholismo, esquizofrenia, demencia. Riesgo de violencia.' },
            { id: 'ekbom', name: 'Tríada de Ekbom', category: 'psiq', entity: 'Parasitosis delirante', items: ['1. Creencia de estar infestado por parásitos', '2. Sensación de picazón o movimiento bajo la piel', '3. Lesiones autoinfligidas por rascado'], pearl: 'Asociado a esquizofrenia, demencia, intoxicación. Tratamiento antipsicótico.' },
            { id: 'ganser', name: 'Tríada de Ganser', category: 'psiq', entity: 'Síndrome de Ganser (respuestas aproximadas)', items: ['1. Respuestas aproximadas (2+2=5)', '2. Amnesia', '3. Desorientación', '4. Alucinaciones visuales'], pearl: 'Asociado a estrés extremo, disociación, simulación. Diagnóstico de exclusión.' },
            { id: 'munchausen', name: 'Tríada de Munchausen', category: 'psiq', entity: 'Trastorno facticio (simulación de enfermedad)', items: ['1. Simulación de síntomas o signos', '2. Hospitalización repetida', '3. Fuga cuando se descubre'], pearl: 'El paciente se hace daño a sí mismo. Difícil de tratar. Requiere manejo psiquiátrico.' },
            { id: 'briquet', name: 'Tríada de Briquet', category: 'psiq', entity: 'Trastorno de somatización (histeria)', items: ['1. Múltiples síntomas físicos sin causa orgánica', '2. Inicio antes de los 30 años', '3. Curso crónico y fluctuante'], pearl: 'Asociado a depresión, ansiedad. Tratamiento: psicoterapia, evitar procedimientos innecesarios.' },
            { id: 'conversion', name: 'Tríada de conversión', category: 'psiq', entity: 'Trastorno de conversión (síntomas neurológicos funcionales)', items: ['1. Déficit neurológico sin causa orgánica (parálisis, convulsiones, ceguera)', '2. Inconsistencia con la anatomía (no sigue territorios vasculares)', '3. Mejora con distracción o sugestión'], pearl: 'Asociado a estrés, trauma. Tratamiento: rehabilitación, psicoterapia.' },
            { id: 'meigs', name: 'Tríada de Meigs', category: 'gastro', entity: 'Tumor ovárico benigno con ascitis y derrame pleural', items: ['1. Tumor ovárico (fibroma/tecroma)', '2. Ascitis', '3. Derrame pleural'], pearl: 'La resección del tumor resuelve la ascitis y el derrame. Descarta malignidad.' },
            { id: 'sipple', name: 'Tríada de Sipple (MEN 2A)', category: 'endo', entity: 'Neoplasia endocrina múltiple tipo 2A', items: ['1. Feocromocitoma', '2. Carcinoma medular de tiroides', '3. Hiperparatiroidismo'], pearl: 'Mutación RET. Cirugía profiláctica de tiroides en portadores. Vigila calcitonina.' },
            { id: 'wermer', name: 'Tríada de Wermer (MEN 1)', category: 'endo', entity: 'Neoplasia endocrina múltiple tipo 1', items: ['1. Hiperparatiroidismo', '2. Tumores neuroendocrinos pancreáticos', '3. Adenoma hipofisario'], pearl: 'Mutación MEN1. Hiperparatiroidismo es la manifestación más frecuente.' },
            { id: 'carcinoid', name: 'Tríada del carcinoide', category: 'gastro', entity: 'Síndrome carcinoide', items: ['1. Flushing (rubor facial)', '2. Diarrea secretora', '3. Broncoespasmo / sibilancias'], pearl: 'Tumor neuroendocrino con metástasis hepáticas. Valora 5-HIAA en orina.' },
            { id: 'saint', name: 'Tríada de Saint', category: 'gastro', entity: 'Colecistitis + colangitis + pancreatitis', items: ['1. Colecistitis aguda', '2. Colangitis aguda', '3. Pancreatitis aguda'], pearl: 'Obstrucción biliar común (cálculo en ámpula). Drenaje biliar urgente.' },
            { id: 'courvoisier', name: 'Tríada de Courvoisier', category: 'gastro', entity: 'Obstrucción biliar maligna', items: ['1. Ictericia obstructiva', '2. Vesícula biliar palpable y no dolorosa', '3. Masa en hipocondrio derecho'], pearl: 'Sugiere cáncer de páncreas (cabeza) o ampolla de Vater. La vesícula no está fibrosada.' },
            { id: 'bouveret', name: 'Tríada de Bouveret', category: 'gastro', entity: 'Obstrucción duodenal por cálculo biliar', items: ['1. Obstrucción intestinal', '2. Fístula bilioentérica', '3. Cálculo biliar en duodeno'], pearl: 'Síndrome de Bouveret: obstrucción gástrica/duodenal por cálculo. Endoscopia o cirugía.' },
            { id: 'gradenigo', name: 'Tríada de Gradenigo', category: 'neuro', entity: 'Síndrome del ápex petroso', items: ['1. Otitis media aguda', '2. Parálisis del VI par (abducens)', '3. Dolor facial (V par)'], pearl: 'Infección del ápex petroso. Requiere antibióticos IV y drenaje quirúrgico.' },
            { id: 'tolosa_hunt', name: 'Tríada de Tolosa-Hunt', category: 'neuro', entity: 'Oftalmoplejía dolorosa', items: ['1. Dolor retroocular unilateral', '2. Parálisis de III, IV y VI pares', '3. Respuesta a corticoides'], pearl: 'Granulomatosis inflamatoria del seno cavernoso. Diagnóstico de exclusión.' },
            { id: 'weber', name: 'Tríada de Weber', category: 'neuro', entity: 'Síndrome de Weber (mesencéfalo)', items: ['1. Hemiparesia contralateral', '2. Parálisis del III par ipsilateral', '3. Desviación de la mirada'], pearl: 'Lesión del pedúnculo cerebral. Arteria cerebral posterior.' },
            { id: 'millard_gubler', name: 'Tríada de Millard-Gubler', category: 'neuro', entity: 'Síndrome de Millard-Gubler (protuberancia)', items: ['1. Hemiparesia contralateral', '2. Parálisis del VI par ipsilateral', '3. Parálisis del VII par ipsilateral'], pearl: 'Lesión de la protuberancia ventral. Arteria basilar.' },
            { id: 'benedikt', name: 'Tríada de Benedikt', category: 'neuro', entity: 'Síndrome de Benedikt (mesencéfalo)', items: ['1. Hemiparesia contralateral', '2. Parálisis del III par ipsilateral', '3. Temblor / ataxia cerebelosa'], pearl: 'Lesión del tegmento mesencefálico. Arteria cerebral posterior.' },
            { id: 'claude', name: 'Tríada de Claude', category: 'neuro', entity: 'Síndrome de Claude (mesencéfalo)', items: ['1. Ataxia cerebelosa', '2. Parálisis del III par ipsilateral', '3. (sin hemiparesia)'], pearl: 'Lesión del tegmento mesencefálico. Menos común que Benedikt.' },
            { id: 'nothnagel', name: 'Tríada de Nothnagel', category: 'neuro', entity: 'Síndrome de Nothnagel (mesencéfalo)', items: ['1. Ataxia cerebelosa', '2. Parálisis del III par ipsilateral', '3. (sin temblor)'], pearl: 'Lesión del tegmento mesencefálico superior.' },
            { id: 'parinaud', name: 'Tríada de Parinaud', category: 'neuro', entity: 'Síndrome del pretectum (mesencéfalo)', items: ['1. Parálisis de la mirada vertical (arriba)', '2. Retracción palpebral (signo de Collier)', '3. Nistagmo de convergencia-retracción'], pearl: 'Lesión del pretectum. Tumor pineal, hidrocefalia.' },
            { id: 'foster_kennedy', name: 'Tríada de Foster Kennedy', category: 'neuro', entity: 'Síndrome de Foster Kennedy', items: ['1. Atrofia óptica ipsilateral', '2. Papiledema contralateral', '3. Anosmia ipsilateral'], pearl: 'Tumor del lóbulo frontal (meningioma del surco olfatorio). Aumento de PIC.' },
            { id: 'anton', name: 'Tríada de Anton', category: 'neuro', entity: 'Ceguera cortical con negación (síndrome de Anton)', items: ['1. Ceguera cortical bilateral', '2. Negación de la ceguera (anosognosia)', '3. Confabulación visual'], pearl: 'Lesión bilateral de la corteza occipital. Asociado a síndrome de Balint.' },
            { id: 'balint', name: 'Tríada de Balint', category: 'neuro', entity: 'Síndrome de Balint', items: ['1. Simultanagnosia', '2. Ataxia óptica', '3. Apraxia oculomotora'], pearl: 'Lesión bilateral parieto-occipital. Incapacidad para ver más de un objeto a la vez.' },
            { id: 'gerstmann', name: 'Tríada de Gerstmann', category: 'neuro', entity: 'Síndrome de Gerstmann', items: ['1. Agrafía', '2. Acalculia', '3. Agnosia digital', '4. Desorientación izquierda-derecha'], pearl: 'Lesión del giro angular (hemisferio dominante). Cuatro síntomas clásicos.' },
            { id: 'klüver_bucy', name: 'Tríada de Kluver-Bucy', category: 'neuro', entity: 'Síndrome de Kluver-Bucy', items: ['1. Hiperoralidad', '2. Hipersexualidad', '3. Placidez / docilidad'], pearl: 'Lesión bilateral de los lóbulos temporales (amígdala). Asociado a herpes encefalitis.' },
            { id: 'mirizzi', name: 'Tríada de Mirizzi', category: 'gastro', entity: 'Síndrome de Mirizzi', items: ['1. Ictericia obstructiva', '2. Dolor en hipocondrio derecho', '3. Masa palpable en hipocondrio derecho'], pearl: 'Obstrucción del conducto hepático común por cálculo impactado en el conducto cístico. Cirugía (colecistectomía + exploración de vías biliares).' },
            { id: 'opitz', name: 'Tríada de Opitz (G/BBB)', category: 'genetica', entity: 'Síndrome de Opitz G/BBB', items: ['1. Hipertelorismo (ojos muy separados)', '2. Hipospadias', '3. Disfagia / dificultad para la deglución (por anomalía laríngea)'], pearl: 'Síndrome genético (mutación MID1 en Xp22). Asociado a defectos cardíacos y anorrectales. Evaluación multidisciplinaria.' },
            { id: 'fallot', name: 'Tríada de Fallot (tetralogía)', category: 'cardio', entity: 'Tetralogía de Fallot', items: ['1. Estenosis pulmonar', '2. Comunicación interventricular (CIV)', '3. Dextroposición de la aorta', '4. Hipertrofia ventricular derecha'], pearl: 'La cardiopatía congénita cianótica más frecuente. Crisis hipóxicas (tet spells). Cirugía correctiva.' },
            { id: 'eisenmenger', name: 'Tríada de Eisenmenger', category: 'cardio', entity: 'Síndrome de Eisenmenger', items: ['1. Comunicación interventricular (CIV) o CIA', '2. Hipertensión pulmonar severa', '3. Cianosis (shunt derecha-izquierda)'], pearl: 'Inversión del shunt por HAP. Contraindicado el cierre quirúrgico. Manejo con vasodilatadores pulmonares.' },
            { id: 'austin_flint', name: 'Tríada de Austin Flint', category: 'cardio', entity: 'Soplo de Austin Flint (insuficiencia aórtica)', items: ['1. Insuficiencia aórtica severa', '2. Soplo diastólico en foco mitral', '3. Ausencia de estenosis mitral'], pearl: 'El chorro de la IA golpea la valva anterior mitral, simulando estenosis mitral. No hay fusión comisural.' },
            { id: 'graham_steell', name: 'Tríada de Graham Steell', category: 'cardio', entity: 'Insuficiencia pulmonar (HAP)', items: ['1. Hipertensión pulmonar severa', '2. Dilatación del tronco pulmonar', '3. Insuficiencia pulmonar (soplo diastólico)'], pearl: 'Soplo diastólico en foco pulmonar por dilatación del anillo. Asociado a HAP severa.' },
            { id: 'quincke', name: 'Pulso de Quincke', category: 'cardio', entity: 'Insuficiencia aórtica (signo periférico)', items: ['1. Pulsación capilar visible en el lecho ungueal', '2. Al comprimir la uña', '3. Alternancia de enrojecimiento y palidez'], pearl: 'Signo de insuficiencia aórtica severa. También en anemia, tirotoxicosis.' },
            { id: 'musset', name: 'Signo de De Musset', category: 'cardio', entity: 'Insuficiencia aórtica (cabeceo)', items: ['1. Cabeceo rítmico con el pulso', '2. Insuficiencia aórtica severa', '3. Pulso amplio (Corrigan)'], pearl: 'Cabeceo sincronizado con el latido. Signo de insuficiencia aórtica.' },
            { id: 'corrigan', name: 'Pulso de Corrigan', category: 'cardio', entity: 'Insuficiencia aórtica (pulso martillo de agua)', items: ['1. Pulso rápido y colapsante', '2. Ascenso brusco y descenso rápido', '3. Insuficiencia aórtica severa'], pearl: 'Pulso de martillo de agua. También en fístula arteriovenosa, ductus.' },
            { id: 'hill', name: 'Signo de Hill', category: 'cardio', entity: 'Insuficiencia aórtica (presión en pierna)', items: ['1. PAS en pierna > PAS en brazo por > 40 mmHg', '2. Insuficiencia aórtica severa', '3. Pulso amplio'], pearl: 'Diferencia de presión pierna-brazo > 40 mmHg. Signo de insuficiencia aórtica.' },
            { id: 'duroziez', name: 'Soplo de Duroziez', category: 'cardio', entity: 'Insuficiencia aórtica (soplo de Duroziez)', items: ['1. Soplo sistólico en arteria femoral (compresión proximal)', '2. Soplo diastólico (compresión distal)', '3. Insuficiencia aórtica severa'], pearl: 'Doble soplo en la femoral. Signo de insuficiencia aórtica severa.' },
            { id: 'traube', name: 'Doble tono de Traube', category: 'cardio', entity: 'Insuficiencia aórtica (doble tono)', items: ['1. Doble tono en la arteria femoral', '2. Sístole y diástole', '3. Insuficiencia aórtica severa'], pearl: 'Doble tono (pistol shot). Signo de insuficiencia aórtica.' },
            { id: 'gibson', name: 'Soplo de Gibson (maquinaria)', category: 'cardio', entity: 'Conducto arterioso persistente (PCA)', items: ['1. Soplo continuo en maquinaria', '2. Segundo espacio intercostal izquierdo', '3. Pulso amplio'], pearl: 'Soplo continuo que abarca S1 y S2. Signo de PCA.' },
            { id: 'roger', name: 'Tríada de Roger', category: 'cardio', entity: 'Comunicación interventricular (CIV) pequeña', items: ['1. Soplo holosistólico intenso', '2. Segundo espacio intercostal izquierdo', '3. Sin síntomas (CIV pequeña)'], pearl: 'Soplo de Roger: CIV pequeña, asintomática, soplo intenso. No requiere cirugía.' },
            { id: 'taussig_bing', name: 'Tríada de Taussig-Bing', category: 'cardio', entity: 'Transposición de grandes arterias con CIV', items: ['1. Transposición de grandes arterias', '2. CIV subpulmonar', '3. Estenosis pulmonar'], pearl: 'Cardiopatía congénita compleja. Cirugía de Rastelli.' },
            { id: 'shock', name: 'Tríada de shock', category: 'urgencias', entity: 'Shock (cualquier tipo)', items: ['1. Hipotensión arterial', '2. Taquicardia', '3. Mala perfusión (piel fría, oliguria, alteración del sensorio)'], pearl: 'Toda hipotensión con taquicardia y mala perfusión es shock hasta que se demuestre lo contrario.' },
            { id: 'sepsis_triad', name: 'Tríada de sepsis (qSOFA)', category: 'urgencias', entity: 'Sepsis (qSOFA)', items: ['1. FR ≥ 22 rpm', '2. Alteración del estado mental (Glasgow < 15)', '3. PAS ≤ 100 mmHg'], pearl: 'qSOFA ≥ 2: alto riesgo de sepsis. Activar protocolo de sepsis.' },
            { id: 'anafilaxia_triad', name: 'Tríada de anafilaxia', category: 'urgencias', entity: 'Anafilaxia', items: ['1. Urticaria / angioedema', '2. Broncoespasmo / estridor / disnea', '3. Hipotensión / mala perfusión'], pearl: 'Adrenalina IM inmediata. No esperar el acceso venoso.' },
            { id: 'hipoglucemia_triad', name: 'Tríada de hipoglucemia (Whipple)', category: 'urgencias', entity: 'Hipoglucemia', items: ['1. Síntomas compatibles con hipoglucemia', '2. Glucosa plasmática baja (< 55 mg/dL)', '3. Resolución de los síntomas al corregir la glucosa'], pearl: 'Confirma que los síntomas SON por hipoglucemia. Si falta algún elemento, busca otra causa.' },
            { id: 'hipercalcemia_triad', name: 'Tríada de hipercalcemia', category: 'urgencias', entity: 'Hipercalcemia', items: ['1. Stones (cálculos renales)', '2. Bones (dolor óseo, osteoporosis)', '3. Groans (dolor abdominal, náuseas, estreñimiento)', '4. Psychic moans (depresión, confusión, psicosis)'], pearl: 'Las 4 B: bones, stones, abdominal groans, psychic moans. Tratar con hidratación y bisfosfonatos.' },
            { id: 'hiponatremia_triad', name: 'Tríada de hiponatremia', category: 'urgencias', entity: 'Hiponatremia', items: ['1. Náuseas / vómito', '2. Cefalea', '3. Confusión / convulsiones / coma'], pearl: 'Corregir lento (< 8-10 mEq/L en 24 h) para evitar mielinólisis pontina.' },
            { id: 'hipernatremia_triad', name: 'Tríada de hipernatremia', category: 'urgencias', entity: 'Hipernatremia', items: ['1. Sed intensa', '2. Oliguria', '3. Confusión / convulsiones / coma'], pearl: 'Corregir con agua libre. Causa: pérdida de agua o exceso de sodio.' },
            { id: 'hipokalemia_triad', name: 'Tríada de hipokalemia', category: 'urgencias', entity: 'Hipokalemia', items: ['1. Debilidad muscular', '2. Arritmias (QT largo, U wave)', '3. Poliuria / polidipsia'], pearl: 'K⁺ < 3.0: reponer IV. Vigilar ECG (U wave, QT largo). Causa: diuréticos, vómito, diarrea.' },
            { id: 'hiperkalemia_triad', name: 'Tríada de hiperkalemia', category: 'urgencias', entity: 'Hiperkalemia', items: ['1. Debilidad muscular', '2. Arritmias (QRS ancho, onda T picuda)', '3. Parálisis flácida'], pearl: 'K⁺ > 6.0: calcio IV, insulina + glucosa, salbutamol, bicarbonato. Dializar si refractario.' },
            { id: 'hipocalcemia_triad', name: 'Tríada de hipocalcemia', category: 'urgencias', entity: 'Hipocalcemia', items: ['1. Tetania (Chvostek, Trousseau)', '2. Convulsiones', '3. Arritmias (QT largo)'], pearl: 'Ca²⁺ < 8.0: gluconato de calcio IV. Vigilar Mg (hipomagnesemia causa hipocalcemia refractaria).' },
            { id: 'hipermagnesemia_triad', name: 'Tríada de hipermagnesemia', category: 'urgencias', entity: 'Hipermagnesemia', items: ['1. Hipotensión', '2. Bradicardia', '3. Depresión respiratoria'], pearl: 'Mg²⁺ > 2.5: gluconato de calcio IV (antídoto). Dializar si refractario.' },
            { id: 'hipomagnesemia_triad', name: 'Tríada de hipomagnesemia', category: 'urgencias', entity: 'Hipomagnesemia', items: ['1. Temblor', '2. Convulsiones', '3. Arritmias (torsades de pointes)'], pearl: 'Mg²⁺ < 1.5: sulfato de magnesio IV. Causa: alcoholismo, diuréticos, diarrea.' },
            { id: 'acidosis_triad', name: 'Tríada de acidosis metabólica', category: 'urgencias', entity: 'Acidosis metabólica', items: ['1. Respiración de Kussmaul', '2. Anión gap elevado o normal', '3. Compensación respiratoria (PaCO₂ baja)'], pearl: 'MUDPILES: metanol, uremia, DKA, paracetamol/propilenglicol, isoniacida/iron, lactato, etilenglicol, salicilatos.' },
            { id: 'alcalosis_triad', name: 'Tríada de alcalosis metabólica', category: 'urgencias', entity: 'Alcalosis metabólica', items: ['1. Tetania (por hipocalcemia iónica)', '2. Hipokalemia', '3. Hipocloremia'], pearl: 'Causa: vómito, diuréticos, hiperaldosteronismo. Tratar la causa y reponer K⁺ y Cl⁻.' },
            { id: 'tep_triad', name: 'Tríada de TEP', category: 'urgencias', entity: 'Tromboembolismo pulmonar', items: ['1. Disnea súbita', '2. Taquipnea', '3. Taquicardia'], pearl: 'La tríada completa aparece en < 20% de los casos. Sospecha con disnea + taquipnea + taquicardia.' },
            { id: 'neumotorax_triad', name: 'Tríada de neumotórax', category: 'urgencias', entity: 'Neumotórax', items: ['1. Dolor pleurítico súbito', '2. Disnea', '3. Disminución o ausencia del murmullo vesicular'], pearl: 'Neumotórax a tensión: hipotensión, desviación traqueal, ingurgitación yugular. Descompresión inmediata.' },
            { id: 'hemorragia_masiva_triad', name: 'Tríada de hemorragia masiva', category: 'urgencias', entity: 'Hemorragia masiva', items: ['1. Hipotensión arterial', '2. Taquicardia', '3. Palidez cutánea/mucosa'], pearl: 'Activar protocolo de transfusión masiva. Reponer volumen y hemoderivados.' },
            { id: 'addison', name: 'Tríada de Addison', category: 'endo', entity: 'Insuficiencia suprarrenal primaria', items: ['1. Hipotensión ortostática', '2. Hiperpigmentación (piel y mucosas)', '3. Astenia y fatiga severa'], pearl: 'Crisis addisoniana: hipotensión refractaria, hiponatremia, hiperpotasemia. Tratar con hidrocortisona IV.' },
            { id: 'conn', name: 'Tríada de Conn', category: 'endo', entity: 'Aldosteronismo primario', items: ['1. Hipertensión arterial', '2. Hipokalemia', '3. Alcalosis metabólica'], pearl: 'Aldosterona autónoma. Confirmar con aldosterona/renina. TC de suprarrenales.' },
            { id: 'feocromocitoma', name: 'Tríada de feocromocitoma', category: 'endo', entity: 'Feocromocitoma', items: ['1. Cefalea', '2. Sudoración profusa', '3. Palpitaciones / taquicardia'], pearl: 'Tumores de la médula suprarrenal. Metanefrinas en orina/plasma. Cirugía tras alfa-bloqueo.' },
            { id: 'glucagonoma', name: 'Tríada de glucagonoma', category: 'endo', entity: 'Glucagonoma', items: ['1. Diabetes mellitus de nueva aparición', '2. Rash (eritema necrolítico migratorio)', '3. Pérdida de peso'], pearl: 'Tumor de células alfa del páncreas. Glucagón elevado. Cirugía.' },
            { id: 'somatostatinoma', name: 'Tríada de somatostatinoma', category: 'endo', entity: 'Somatostatinoma', items: ['1. Diabetes mellitus', '2. Esteatorrea', '3. Colelitiasis'], pearl: 'Tumor de células delta del páncreas. Somatostatina elevada. Cirugía.' },
            { id: 'vipoma', name: 'Tríada de VIPoma (WDHA)', category: 'endo', entity: 'VIPoma', items: ['1. Diarrea acuosa (secretora)', '2. Hipokalemia', '3. Aclorhidria'], pearl: 'Tumor de células no beta del páncreas. VIP elevado. Cirugía.' },
            { id: 'gastrinoma', name: 'Tríada de gastrinoma (Zollinger-Ellison)', category: 'endo', entity: 'Gastrinoma', items: ['1. Úlcera péptica recurrente o múltiple', '2. Diarrea', '3. Hipersecreción ácida (gastrina elevada)'], pearl: 'Tumor de células G del páncreas/duodeno. Gastrina elevada. IBP + cirugía.' },
            { id: 'hipertiroidismo', name: 'Tríada de hipertiroidismo', category: 'endo', entity: 'Hipertiroidismo', items: ['1. Pérdida de peso', '2. Taquicardia / palpitaciones', '3. Temblor / intolerancia al calor'], pearl: 'TSH baja, T4/T3 elevadas. Causas: Graves, toxic nodule, tiroiditis.' },
            { id: 'hipotiroidismo', name: 'Tríada de hipotiroidismo', category: 'endo', entity: 'Hipotiroidismo', items: ['1. Bradicardia', '2. Estreñimiento', '3. Intolerancia al frío'], pearl: 'TSH elevada, T4 baja. Tratamiento: levotiroxina. Coma mixedematoso en casos graves.' },
            { id: 'crisis_tirotoxica', name: 'Tríada de crisis tirotóxica', category: 'endo', entity: 'Crisis tirotóxica', items: ['1. Fiebre alta', '2. Taquicardia severa', '3. Alteración del estado mental'], pearl: 'Emergencia endocrina. Tratamiento: betabloqueadores, PTU, yodo, corticoides.' },
            { id: 'coma_mixedematoso', name: 'Tríada de coma mixedematoso', category: 'endo', entity: 'Coma mixedematoso', items: ['1. Hipotermia', '2. Bradicardia', '3. Hiponatremia'], pearl: 'Emergencia endocrina. Tratamiento: levotiroxina IV, corticoides, soporte.' },
            { id: 'hipoparatiroidismo', name: 'Tríada de hipoparatiroidismo', category: 'endo', entity: 'Hipoparatiroidismo', items: ['1. Tetania (Chvostek, Trousseau)', '2. Convulsiones', '3. Cataratas'], pearl: 'PTH baja, Ca²⁺ bajo, P elevado. Tratamiento: calcio + vitamina D.' },
            { id: 'hiperparatiroidismo', name: 'Tríada de hiperparatiroidismo', category: 'endo', entity: 'Hiperparatiroidismo', items: ['1. Stones (cálculos renales)', '2. Bones (osteoporosis, dolor óseo)', '3. Abdominal groans (dolor abdominal, náuseas)', '4. Psychic moans (depresión, confusión)'], pearl: 'PTH elevada, Ca²⁺ elevado. Tratamiento: paratiroidectomía.' },
            { id: 'graves', name: 'Tríada de Graves', category: 'endo', entity: 'Enfermedad de Graves', items: ['1. Bocio (difuso, vascular)', '2. Oftalmopatía (exoftalmos, diplopia)', '3. Dermopatía (mixedema pretibial)'], pearl: 'Enfermedad autoinmune. TSH baja, T4/T3 elevadas, anticuerpos anti-receptor TSH.' },
            { id: 'hashimoto', name: 'Tríada de Hashimoto', category: 'endo', entity: 'Tiroiditis de Hashimoto', items: ['1. Bocio (difuso, firme)', '2. Hipotiroidismo', '3. Anticuerpos anti-TPO y anti-tiroglobulina'], pearl: 'Enfermedad autoinmune. La causa más frecuente de hipotiroidismo en áreas con suficiente yodo.' },
            { id: 'mixedema', name: 'Tríada de mixedema', category: 'endo', entity: 'Mixedema (hipotiroidismo severo)', items: ['1. Mixedema (edema no depresible)', '2. Bradicardia', '3. Hipotermia'], pearl: 'Hipotiroidismo severo. Tratamiento: levotiroxina (IV si es coma mixedematoso).' },
            { id: 'tiroiditis', name: 'Tríada de tiroiditis subaguda', category: 'endo', entity: 'Tiroiditis subaguda (de Quervain)', items: ['1. Dolor cervical anterior (tiroiditis)', '2. Fiebre', '3. Hipertiroidismo transitorio'], pearl: 'Dolorosa, autolimitada. Tratamiento: AINE o corticoides. TSH baja inicial, luego normal.' }



        ];

const vademecumData = [
            // TANDA 1: CARDIOVASCULAR (12 FÁRMACOS ESENCIALES PBS / OMS)
            {
                name: 'Noradrenalina',
                group: 'Cardiovascular',
                adult: '0.05 - 1.0 mcg/kg/min IV en infusión continua',
                ped: '0.05 - 0.5 mcg/kg/min IV',
                renal: 'Sin ajuste renal requerido',
                warning: 'Monitoreo invasivo de PA continuo por riesgo de necrosis tisular en extravasación',
                indicaciones: ['Choque séptico', 'Choque cardiogénico', 'Hipotensión refractaria'],
                presentacion: 'Ampolla 4 mg / 4 mL (1 mg/mL)',
                embarazo: 'Precaución: Puede causar hipoxia fetal por vasoconstricción placentaria',
                interacciones: ['Inhibidores de la MAO (crisis hipertensiva severa)', 'Antidepresivos tricíclicos', 'Betabloqueadores no selectivos'],
                descripcion: 'Catecolamina endógena y agonista alfa/beta adrenérgico potente. Fármaco de primera línea en choque distributivo y séptico para restaurar la presión arterial media (PAM ≥ 65 mmHg).',
                verificado: false
            },
            {
                name: 'Adrenalina (Epinefrina)',
                group: 'Cardiovascular',
                adult: 'Paro cardíaco: 1 mg IV c/3-5 min. Anafilaxia: 0.3 - 0.5 mg IM',
                ped: 'Paro: 0.01 mg/kg (0.1 mL/kg de sol 1:10.000) IV. Anafilaxia: 0.01 mg/kg IM (máx 0.5mg)',
                renal: 'Sin ajuste renal requerido',
                warning: 'Evitar inyección intravascular accidental en administración intramuscular',
                indicaciones: ['Paro cardiorrespiratorio', 'Anafilaxia severa', 'Crisis asmática grave refractaria'],
                presentacion: 'Ampolla 1 mg / 1 mL (1:1.000)',
                embarazo: 'Precaución: Disminución transitoria del flujo uteroplacentario',
                interacciones: ['Betabloqueadores (pueden causar hipertensión severa y bradicardia)', 'Digoxina (arritmias)', 'Antidepresivos tricíclicos'],
                descripcion: 'Agonista alfa y beta adrenérgico potente de acción rápida. Indispensable en reanimación cerebro-cardiopulmonar avanzada y manejo de reacciones anafilácticas agudas.',
                verificado: false
            },
            {
                name: 'Dobutamina',
                group: 'Cardiovascular',
                adult: '2.5 - 20 mcg/kg/min IV en infusión continua',
                ped: '2.5 - 15 mcg/kg/min IV',
                renal: 'Sin ajuste renal requerido',
                warning: 'Puede desencadenar taquiarritmias ventriculares o supraventriculares',
                indicaciones: ['Choque cardiogénico', 'Insuficiencia cardíaca aguda descompensada con bajo gasto'],
                presentacion: 'Ampolla 250 mg / 20 mL',
                embarazo: 'Precaución: Usar solo si el beneficio maternal supera el riesgo fetal',
                interacciones: ['Betabloqueadores (antagonizan su efecto inotrópico)', 'Inhibidores de la MAO', 'Nitroprusiato (efecto sinérgico en gasto cardíaco)'],
                descripcion: 'Inotrópico positivo sintético con actividad selectiva beta-1 adrenérgica y leve efecto beta-2/alfa. Incrementa el gasto cardíaco en estados de falla miocárdica aguda.',
                verificado: false
            },
            {
                name: 'Nitroglicerina',
                group: 'Cardiovascular',
                adult: '5 - 200 mcg/min IV infusión continua',
                ped: '0.5 - 5 mcg/kg/min IV',
                renal: 'Sin ajuste renal requerido',
                warning: 'Riesgo de hipotensión severa, colapso circulatorio y cefalea intensa',
                indicaciones: ['Síndrome coronario agudo', 'Edema agudo de pulmón hipertensivo', 'Crisis hipertensiva'],
                presentacion: 'Ampolla 50 mg / 10 mL',
                embarazo: 'Precaución: Seguridad no establecida firmemente en primer trimestre',
                interacciones: ['Inhibidores de la fosfodiesterasa-5 (Sildenafilo: hipotensión severa fatal)', 'Antihipertensivos', 'Alcohol'],
                descripcion: 'Vasodilatador venoso y arterial coronario de acción directa que libera óxido nítrico. Disminuye la precarga y el consumo miocárdico de oxígeno.',
                verificado: false
            },
            {
                name: 'Amiodarona',
                group: 'Cardiovascular',
                adult: 'Paro: 300 mg IV bolo (seguido de 150 mg). Taquiarritmias: 150 mg en 10 min, luego 1 mg/min x 6h',
                ped: '5 mg/kg IV en bolo lento en 20-30 min (máx 300mg/dosis)',
                renal: 'Sin ajuste renal requerido',
                warning: 'Riesgo de hipotensión arterial severa y bradicardia sinusal durante la infusión rápida',
                indicaciones: ['Fibrilación ventricular / Taquicardia ventricular sin pulso', 'Taquicardias supraventriculares y ventriculares estables'],
                presentacion: 'Ampolla 150 mg / 3 mL',
                embarazo: 'Contraindicado: Riesgo de hipotiroidismo neonatal y bocio congénito',
                interacciones: ['Digoxina (eleva niveles séricos)', 'Warfarina (potencia efecto anticoagulante)', 'Fármacos que prolongan el intervalo QT'],
                descripcion: 'Antiarrítmico de clase III que bloquea canales de potasio, sodio y calcio, prolongando la repolarización y el período refractario miocárdico.',
                verificado: false
            },
            {
                name: 'Metoprolol',
                group: 'Cardiovascular',
                adult: 'IV: 5 mg cada 5 min (máx 15mg). VO: 50 - 200 mg c/24h',
                ped: '1 - 2 mg/kg/día VO dividido c/12h (Dosis máxima 2 mg/kg/día)',
                renal: 'Sin ajuste renal requerido',
                warning: 'Contraindicado en bloqueo AV de 2º o 3er grado y asma bronquial activa',
                indicaciones: ['Hipertensión arterial', 'Taquiarritmias supraventriculares', 'Infarto agudo de miocardio'],
                presentacion: 'Tableta 50 mg y 100 mg; Ampolla 5 mg / 5 mL',
                embarazo: 'Precaución: Puede asociarse a retraso del crecimiento intrauterino y bradicardia fetal',
                interacciones: ['Verapamilo o Diltiazem IV (asistolia y bradicardia severa)', 'Insulina (enmascara síntomas de hipoglucemia)', 'Antagonistas del calcio'],
                descripcion: 'Betabloqueador cardioselectivo (beta-1) que reduce la frecuencia cardíaca, la contractilidad miocárdica y la presión arterial.',
                verificado: false
            },
            {
                name: 'Enalapril',
                group: 'Cardiovascular',
                adult: '5 - 40 mg VO al día dividido en 1 o 2 tomas',
                ped: '0.08 mg/kg/día VO (Dosis máxima 0.6 mg/kg/día)',
                renal: 'eTFG 30-50: iniciar 5 mg/día; eTFG <30: iniciar 2.5 mg/día',
                warning: 'Riesgo de hiperpotasemia e insuficiencia renal aguda en estenosis bilateral de arteria renal',
                indicaciones: ['Hipertensión arterial', 'Insuficiencia cardíaca crónica', 'Nefropatía diabética'],
                presentacion: 'Tableta 5 mg, 10 mg y 20 mg',
                embarazo: 'Contraindicado en 2º y 3er trimestre: Fetotoxicidad y oligohidramnios',
                interacciones: ['Suplementos de potasio o diuréticos ahorradores de potasio (hiperpotasemia grave)', 'AINEs (reducen efecto antihipertensivo)', 'Litio'],
                descripcion: 'Inhibidor de la enzima convertidora de angiotensina (IECA). Reduce la resistencia vascular periférica y previene el remodelado ventricular.',
                verificado: false
            },
            {
                name: 'Losartán',
                group: 'Cardiovascular',
                adult: '50 - 100 mg VO una vez al día',
                ped: '0.7 mg/kg VO una vez al día (Dosis máxima 50 mg/día)',
                renal: 'Sin ajuste requerido para pacientes con falla renal leve a moderada',
                warning: 'Monitorear niveles séricos de potasio y creatinina post-inicio',
                indicaciones: ['Hipertensión arterial', 'Nefropatía en diabetes tipo 2', 'Reducción de riesgo cardiovascular en hipertrofia VI'],
                presentacion: 'Tableta 50 mg y 100 mg',
                embarazo: 'Contraindicado en 2º y 3er trimestre: Lesión renal fetal y muerte',
                interacciones: ['Litio (riesgo de toxicidad por litio)', 'AINEs', 'Diuréticos ahorradores de potasio'],
                descripcion: 'Antagonista de los receptores de angiotensina II (ARA II) tipo AT1. Produce vasodilatación y natriuresis sin generar tos seca asociada a IECA.',
                verificado: false
            },
            {
                name: 'Furosemida',
                group: 'Cardiovascular',
                adult: '20 - 80 mg IV/VO dosis única (titulable hasta 200mg)',
                ped: '1 - 2 mg/kg/dosis IV/VO c/6-12h (Dosis máxima 6 mg/kg/dosis)',
                renal: 'Dosis elevadas requeridas en falla renal crónica avanzada (hasta 250-500mg)',
                warning: 'Riesgo de deshidratación severa, hipopotasemia, hiponatremia y ototoxicidad con bolos rápidos',
                indicaciones: ['Edema agudo de pulmón', 'Insuficiencia cardíaca congestiva', 'Sobrecarga hídrica refractaria'],
                presentacion: 'Tableta 40 mg; Ampolla 20 mg / 2 mL',
                embarazo: 'Precaución: Usar solo si es estrictamente necesario; atraviesa la barrera placentaria',
                interacciones: ['Aminoglucósidos (ototoxicidad potenciada)', 'Digoxina (toxicidad digitálica por hipopotasemia)', 'Litio'],
                descripcion: 'Diurético de asa potente que inhibe el cotransportador Na+/K+/2Cl- en la rama ascendente gruesa del asa de Henle, promoviendo rápida excreción de agua y electrolitos.',
                verificado: false
            },
            {
                name: 'Espironolactona',
                group: 'Cardiovascular',
                adult: '25 - 100 mg VO una o dos veces al día',
                ped: '1 - 3 mg/kg/día VO dividido c/12-24h (Dosis máxima 200 mg/día)',
                renal: 'Contraindicado si eTFG < 30 mL/min o K+ sérico > 5.0 mEq/L',
                warning: 'Alto riesgo de hiperpotasemia severa, especialmente al asociarse a IECA o ARA II',
                indicaciones: ['Insuficiencia cardíaca con fracción de eyección reducida', 'Ascitis por cirrosis hepática', 'Hipertensión resistente'],
                presentacion: 'Tableta 25 mg y 100 mg',
                embarazo: 'Precaución: Propiedades antiandrogénicas teóricas en feto masculino',
                interacciones: ['IECA / ARA II (riesgo letal de hiperpotasemia)', 'Suplementos de potasio', 'AINEs'],
                descripcion: 'Diurético ahorrador de potasio antagonista competitivo de la aldosterona en el túbulo contorneado distal. Mejora la supervivencia en falla cardíaca crónica.',
                verificado: false
            },
            {
                name: 'Verapamilo',
                group: 'Cardiovascular',
                adult: 'IV: 5 - 10 mg en 2 min. VO: 80 - 120 mg c/8h',
                ped: '1 - 3 mg/kg/día VO dividido c/8h (Dosis máxima 120 mg/día)',
                renal: 'Sin ajuste significativo requerido en daño renal leve',
                warning: 'Contraindicado en insuficiencia cardíaca descompensada y bloqueo AV avanzado',
                indicaciones: ['Taquicardia supraventricular paroxística', 'Control de frecuencia en fibrilación atrial', 'Angina de pecho'],
                presentacion: 'Tableta 80 mg; Ampolla 5 mg / 2 mL',
                embarazo: 'Precaución: Puede inducir hipoxia uterina por hipotensión materna',
                interacciones: ['Betabloqueadores IV (riesgo de bradicardia severa y asistolia)', 'Digoxina', 'Estatinas metabolizadas por CYP3A4'],
                descripcion: 'Antagonista de los canales de calcio no dihidropiridínico que actúa directamente sobre el nodo sinusal y auriculoventricular reduciendo la contractilidad y frecuencia cardíaca.',
                verificado: false
            },
            {
                name: 'Digoxina',
                group: 'Cardiovascular',
                adult: 'Carga: 0.25 - 0.5 mg IV/VO, luego 0.125 - 0.25 mg/día',
                ped: 'Neonatos/Lactantes: 0.01 - 0.02 mg/kg dosis total de carga dividida',
                renal: 'Ajustar estrictamente según eTFG y niveles séricos (terapéutico 0.8 - 2.0 ng/mL)',
                warning: 'Estrecho margen terapéutico; riesgo alto de intoxicación digitálica mortal',
                indicaciones: ['Insuficiencia cardíaca crónica con FEVI reducida', 'Control de respuesta ventricular en fibrilación auricular'],
                presentacion: 'Tableta 0.25 mg; Ampolla 0.5 mg / 2 mL',
                embarazo: 'Precaución: Atraviesa la placenta con seguridad clínica aceptada bajo monitorización',
                interacciones: ['Amiodarona y Verapamilo (incrementan niveles de digoxina un 50-100%)', 'Diuréticos perdedores de potasio', 'Eritromicina'],
                descripcion: 'Glucósido cardíaco con efecto inotrópico positivo débil y cronotrópico negativo (disminuye la conducción AV a través del tono vagal).',
                verificado: false
            }
        ];

const vademecumTanda2 = [

    // =================== ANALGÉSICOS ===================
    {
        name: 'Acetaminofén (Paracetamol)', group: 'Analgésicos',
        adult: '500 - 1000 mg VO/IV c/6-8h. Máx 4 g/día (2 - 3 g/día en hepatopatía, desnutrición o alcoholismo crónico)',
        ped: '10 - 15 mg/kg/dosis VO c/6h. Máx 75 mg/kg/día sin exceder 4 g/día. IV en < 50 kg: 15 mg/kg c/6h (máx 60 mg/kg/día)',
        renal: 'eTFG < 10: espaciar a c/8h; sin otros ajustes',
        warning: 'Hepatotoxicidad por sobredosis (antídoto: N-acetilcisteína). Revisar que el paciente no tome otros productos que también lo contengan',
        indicaciones: ['Dolor leve a moderado', 'Fiebre'],
        presentacion: 'Tableta 500 mg; jarabe y gotas pediátricas (verificar concentración); bolsa IV 1 g/100 mL',
        embarazo: 'Seguro: analgésico y antipirético de elección en gestación y lactancia',
        interacciones: ['Warfarina (uso crónico a dosis altas aumenta el INR)', 'Alcohol (mayor riesgo hepático)', 'Carbamazepina y fenitoína (aumentan el metabolito hepatotóxico)'],
        descripcion: 'Analgésico y antipirético de primera línea; sin efecto antiinflamatorio ni gastrolesivo.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Ibuprofeno', group: 'Analgésicos',
        adult: '400 - 600 mg VO c/6-8h con alimentos. Máx 2400 mg/día',
        ped: '5 - 10 mg/kg/dosis VO c/6-8h. Máx 40 mg/kg/día. No usar en < 6 meses',
        renal: 'Evitar si eTFG < 30 mL/min; riesgo de lesión renal aguda con deshidratación',
        warning: 'Riesgo de sangrado GI, lesión renal aguda y eventos CV. Evitar en deshidratación, dengue (riesgo de sangrado) y falla cardíaca descompensada',
        indicaciones: ['Dolor leve a moderado', 'Fiebre', 'Dismenorrea', 'Dolor musculoesquelético'],
        presentacion: 'Tableta 400 mg y 600 mg; suspensión 100 mg/5 mL',
        embarazo: 'Evitar desde la semana 20; contraindicado en el 3er trimestre (cierre ductal, oligohidramnios)',
        interacciones: ['IECA / ARA II + diurético (lesión renal aguda)', 'Anticoagulantes y antiagregantes (sangrado)', 'Ácido acetilsalicílico (bloquea su efecto antiagregante)'],
        descripcion: 'AINE no selectivo con efecto analgésico, antipirético y antiinflamatorio.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Diclofenaco', group: 'Analgésicos',
        adult: '50 mg VO c/8-12h con alimentos (máx 150 mg/día). IM: 75 mg dosis única, repetible a las 12h (máx 2 días)',
        ped: '1 - 3 mg/kg/día VO dividido c/8-12h (máx 150 mg/día) en mayores de 1 año; uso restringido. No usar IM en niños',
        renal: 'Evitar si eTFG < 30 mL/min',
        warning: 'Mayor riesgo cardiovascular y GI que otros AINE. Evitar en cardiopatía isquémica, falla cardíaca, úlcera activa y dengue',
        indicaciones: ['Dolor musculoesquelético', 'Cólico renal', 'Dolor posoperatorio', 'Artritis'],
        presentacion: 'Tableta 50 mg; ampolla 75 mg/3 mL',
        embarazo: 'Evitar; contraindicado en el 3er trimestre',
        interacciones: ['Anticoagulantes y antiagregantes (sangrado)', 'IECA / ARA II / diuréticos (lesión renal)', 'Litio y metotrexato (aumentan niveles)'],
        descripcion: 'AINE potente de uso frecuente en dolor agudo y cólico renal.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Dipirona (Metamizol)', group: 'Analgésicos',
        adult: '500 - 1000 mg VO/IV c/6-8h. Máx 4 g/día. IV lento (al menos 5 min)',
        ped: '8 - 16 mg/kg/dosis VO/IV c/6-8h. No usar en < 3 meses o < 5 kg',
        renal: 'Reducir dosis y espaciar en insuficiencia renal grave; evitar dosis altas repetidas',
        warning: 'Riesgo de agranulocitosis (suspender si hay fiebre, dolor de garganta o úlceras bucales) e hipotensión con infusión IV rápida. Está prohibida en algunos países: verificar la normativa local',
        indicaciones: ['Dolor moderado', 'Fiebre refractaria', 'Cólico renal o biliar'],
        presentacion: 'Tableta 500 mg; ampolla 1 g/2 mL; gotas (verificar concentración)',
        embarazo: 'Evitar en el 1er trimestre y desde la semana 28-30; precaución en lactancia',
        interacciones: ['Ciclosporina (reduce sus niveles)', 'Clorpromazina (hipotermia grave)', 'Metotrexato (toxicidad hematológica)'],
        descripcion: 'Analgésico y antipirético con efecto espasmolítico leve.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Ketorolaco', group: 'Analgésicos',
        adult: 'IV/IM: 10 - 30 mg c/6h (15 mg si ≥ 65 años, < 50 kg o falla renal). Máx 120 mg/día IV/IM. VO: 10 mg c/6h (máx 40 mg/día). Duración máxima: 5 días',
        ped: '0.5 mg/kg/dosis IV/IM c/6-8h (máx 15 mg/dosis), solo por 48-72h',
        renal: 'Contraindicado si eTFG < 30 mL/min o riesgo de deshidratación',
        warning: 'Contraindicado en sangrado activo, úlcera péptica, falla renal, dengue, asma sensible a AINE y antes de cirugía mayor. Duración máxima 5 días',
        indicaciones: ['Dolor agudo moderado a severo', 'Cólico renal', 'Dolor posoperatorio'],
        presentacion: 'Ampolla 30 mg/1 mL; tableta 10 mg',
        embarazo: 'Contraindicado en trabajo de parto y en el 3er trimestre; evitar en lactancia',
        interacciones: ['Otros AINE y anticoagulantes (sangrado)', 'Probenecid y pentoxifilina (contraindicados)', 'IECA y diuréticos (lesión renal)'],
        descripcion: 'AINE parenteral de potencia analgésica elevada para dolor agudo de corta duración.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Tramadol', group: 'Analgésicos',
        adult: '50 - 100 mg VO/IV lento c/6-8h. Máx 400 mg/día (300 mg/día en > 75 años)',
        ped: 'Evitar en < 12 años (contraindicado por la FDA). En ≥ 12 años: 1 - 2 mg/kg/dosis c/6-8h (máx 100 mg/dosis)',
        renal: 'eTFG < 30: c/12h, máx 200 mg/día',
        warning: 'Riesgo de convulsiones, síndrome serotoninérgico, depresión respiratoria y dependencia. Náuseas y vómito frecuentes',
        indicaciones: ['Dolor moderado a severo', 'Dolor neuropático (adyuvante)'],
        presentacion: 'Cápsula 50 mg; gotas 100 mg/mL; ampolla 100 mg/2 mL',
        embarazo: 'Evitar; riesgo de síndrome de abstinencia neonatal',
        interacciones: ['ISRS / IRSN / IMAO / triptanes (síndrome serotoninérgico)', 'Carbamazepina (reduce su efecto)', 'Benzodiacepinas y otros depresores del SNC (depresión respiratoria)'],
        descripcion: 'Opioide débil con acción inhibidora de la recaptación de serotonina y noradrenalina.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Morfina', group: 'Analgésicos',
        adult: 'IV: 2 - 5 mg titulados c/5-15 min según respuesta (0.05 - 0.1 mg/kg). SC/IM: 5 - 10 mg c/4h. VO liberación inmediata: 5 - 15 mg c/4h',
        ped: 'IV: 0.05 - 0.1 mg/kg/dosis c/2-4h titulada. VO: 0.2 - 0.5 mg/kg c/4-6h. Neonatos: dosis menores y monitoreo continuo',
        renal: 'Los metabolitos activos se acumulan: reducir y espaciar si eTFG < 30; preferir fentanilo o hidromorfona',
        warning: 'ALTO RIESGO: depresión respiratoria, hipotensión y náuseas. Tener naloxona disponible y monitoreo continuo (SatO₂, FR, sedación)',
        indicaciones: ['Dolor severo agudo', 'Dolor del infarto agudo de miocardio', 'Disnea refractaria en cuidados paliativos'],
        presentacion: 'Ampolla 10 mg/1 mL; tableta o solución oral (medicamento de control especial: verificar disponibilidad)',
        embarazo: 'Precaución: solo si es necesario; riesgo de depresión respiratoria neonatal cerca del parto',
        interacciones: ['Benzodiacepinas y alcohol (depresión respiratoria)', 'IMAO (contraindicado)', 'Otros opioides y sedantes'],
        descripcion: 'Opioide agonista puro de referencia para dolor severo.',
        altoRiesgo: true, verificado: false
    },

    // =================== ANTIBIÓTICOS ===================
    {
        name: 'Amoxicilina', group: 'Antibióticos',
        adult: '500 mg VO c/8h o 875 - 1000 mg c/12h. NAC leve: 1 g c/8h. Faringitis estreptocócica: 500 mg c/12h x10 días',
        ped: '25 - 50 mg/kg/día VO dividido c/8-12h. Dosis alta (otitis media, NAC): 80 - 90 mg/kg/día c/12h. Máx 3 - 4 g/día',
        renal: 'eTFG 10-30: 250 - 500 mg c/12h; eTFG < 10: 250 - 500 mg c/24h',
        warning: 'Contraindicada en alergia a penicilinas. Erupción frecuente en mononucleosis infecciosa',
        indicaciones: ['Faringoamigdalitis estreptocócica', 'Otitis media aguda', 'NAC leve', 'Sinusitis bacteriana', 'ITU en embarazo (según antibiograma)'],
        presentacion: 'Cápsula/tableta 500 mg; suspensión 250 mg/5 mL',
        embarazo: 'Seguro; antibiótico de elección en gestación y lactancia',
        interacciones: ['Metotrexato (aumenta toxicidad)', 'Warfarina (puede aumentar el INR)', 'Alopurinol (mayor riesgo de erupción)'],
        descripcion: 'Aminopenicilina de amplio uso ambulatorio con excelente biodisponibilidad oral.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Amoxicilina / Ácido clavulánico', group: 'Antibióticos',
        adult: '875/125 mg VO c/12h o 500/125 mg c/8h. IV: 1.2 g c/8h',
        ped: '25 - 45 mg/kg/día (componente amoxicilina) VO dividido c/12h (presentación 7:1). Dosis alta: 90 mg/kg/día c/12h (presentación 14:1)',
        renal: 'eTFG < 30: no usar la tableta 875/125; dar 500/125 c/12h. eTFG < 10: c/24h',
        warning: 'Hepatotoxicidad colestásica (más frecuente en ancianos y cursos prolongados). Diarrea frecuente',
        indicaciones: ['Sinusitis y otitis media (falla a amoxicilina)', 'Mordeduras', 'Infección de piel y tejidos blandos', 'ITU', 'NAC con comorbilidad'],
        presentacion: 'Tableta 500/125 mg y 875/125 mg; suspensión 400/57 mg por 5 mL; vial IV 1.2 g',
        embarazo: 'Aceptable',
        interacciones: ['Warfarina (aumenta el INR)', 'Metotrexato (aumenta toxicidad)', 'Alopurinol (erupción)'],
        descripcion: 'Aminopenicilina con inhibidor de betalactamasa; amplía el espectro a gérmenes productores de betalactamasa y anaerobios orales.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Cefalexina', group: 'Antibióticos',
        adult: '500 mg VO c/6h (o 1 g c/12h). Celulitis no purulenta: 500 mg c/6h x5 días',
        ped: '25 - 50 mg/kg/día VO dividido c/6-8h (hasta 100 mg/kg/día en infecciones graves). Máx 4 g/día',
        renal: 'eTFG 10-40: 500 mg c/8-12h; eTFG < 10: 250 - 500 mg c/12-24h',
        warning: 'Precaución en alergia grave a penicilinas (reactividad cruzada baja)',
        indicaciones: ['Celulitis / erisipela leve', 'Impétigo', 'ITU no complicada', 'Faringitis (alergia no grave a penicilina)'],
        presentacion: 'Cápsula/tableta 500 mg; suspensión 250 mg/5 mL',
        embarazo: 'Seguro',
        interacciones: ['Metformina (aumenta sus niveles)', 'Probenecid (aumenta niveles de cefalexina)', 'Warfarina (puede aumentar el INR)'],
        descripcion: 'Cefalosporina de primera generación oral para infecciones de piel y urinarias.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Cefazolina', group: 'Antibióticos',
        adult: '1 - 2 g IV c/8h. Profilaxis quirúrgica: 2 g IV (3 g si > 120 kg) 30 - 60 min antes de la incisión',
        ped: '50 - 100 mg/kg/día IV dividido c/8h (máx 6 g/día). Profilaxis quirúrgica: 30 mg/kg (máx 2 g)',
        renal: 'eTFG 35-54: dosis habitual; 11-34: 50% de la dosis c/12h; ≤ 10: 50% c/18-24h',
        warning: 'En alergia a penicilinas la reactividad cruzada es baja (cadenas laterales distintas): valorar el tipo de reacción',
        indicaciones: ['Profilaxis quirúrgica', 'Celulitis y abscesos (SASM)', 'Bacteriemia por SASM', 'Osteomielitis y artritis séptica (SASM)'],
        presentacion: 'Vial 1 g',
        embarazo: 'Seguro',
        interacciones: ['Probenecid (aumenta sus niveles)', 'Warfarina (puede aumentar el INR)', 'Aminoglucósidos (nefrotoxicidad aditiva)'],
        descripcion: 'Cefalosporina de primera generación IV; elección en profilaxis quirúrgica e infecciones por estafilococo sensible.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Ceftriaxona', group: 'Antibióticos',
        adult: '1 - 2 g IV/IM c/24h. Meningitis: 2 g c/12h. Gonorrea no complicada: 500 mg IM dosis única',
        ped: '50 - 100 mg/kg/día IV/IM c/12-24h (máx 4 g/día). Meningitis: 100 mg/kg/día c/12h',
        renal: 'Sin ajuste (máx 2 g/día si coexiste falla hepática grave)',
        warning: 'Neonatos: evitar con soluciones que contengan calcio y en hiperbilirrubinemia. No mezclar con calcio IV. Puede causar barro biliar',
        indicaciones: ['NAC hospitalizada', 'Meningitis bacteriana', 'Pielonefritis', 'Sepsis de foco urinario o abdominal (con anaerobios)', 'Gonorrea'],
        presentacion: 'Vial 500 mg y 1 g IM/IV',
        embarazo: 'Seguro',
        interacciones: ['Calcio IV (precipitación: no administrar simultáneamente)', 'Anticoagulantes orales (aumenta riesgo de sangrado)', 'Aminoglucósidos (no mezclar en el mismo equipo)'],
        descripcion: 'Cefalosporina de tercera generación de amplio uso hospitalario y ambulatorio parenteral.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Piperacilina / Tazobactam', group: 'Antibióticos',
        adult: '4.5 g IV c/6h (infusión de 30 min, o extendida de 4h: 4.5 g c/8h). Infecciones menos graves: 3.375 g c/6h',
        ped: '2 - 9 meses: 80 mg/kg (piperacilina) c/8h. > 9 meses y ≤ 40 kg: 100 mg/kg c/8h. Máx 4 g de piperacilina por dosis',
        renal: 'eTFG 20-40: 2.25 g c/6h; eTFG < 20: 2.25 g c/8h; hemodiálisis: 2.25 g c/8h + 0.75 g tras la diálisis',
        warning: 'Combinado con vancomicina aumenta el riesgo de lesión renal aguda. Contraindicado en alergia grave a penicilinas',
        indicaciones: ['Sepsis de foco abdominal o nosocomial', 'Neumonía nosocomial', 'Pie diabético infectado', 'Neutropenia febril', 'Infección por Pseudomonas'],
        presentacion: 'Vial 4.5 g (4 g/0.5 g) y 2.25 g',
        embarazo: 'Aceptable si es necesario',
        interacciones: ['Vancomicina (nefrotoxicidad)', 'Anticoagulantes (alteración de la coagulación)', 'Metotrexato (aumenta sus niveles)'],
        descripcion: 'Penicilina antipseudomónica con inhibidor de betalactamasa; amplio espectro que incluye anaerobios.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Meropenem', group: 'Antibióticos',
        adult: '1 g IV c/8h (infusión de 30 min o extendida de 3h). Meningitis y SNC: 2 g c/8h',
        ped: '20 mg/kg/dosis IV c/8h (meningitis: 40 mg/kg c/8h). Máx 2 g/dosis',
        renal: 'eTFG 26-50: 1 g c/12h; 10-25: 500 mg c/12h; < 10: 500 mg c/24h',
        warning: 'Reservar para infecciones graves o por BLEE (uso racional). Puede reducir el umbral convulsivo. No combinar con ácido valproico',
        indicaciones: ['Infección por BLEE', 'Sepsis nosocomial grave', 'Meningitis nosocomial', 'Peritonitis complicada', 'Neutropenia febril'],
        presentacion: 'Vial 500 mg y 1 g',
        embarazo: 'Precaución; usar solo si es necesario',
        interacciones: ['Ácido valproico (reduce marcadamente sus niveles: evitar combinar)', 'Probenecid (aumenta niveles de meropenem)', 'Warfarina (puede aumentar el INR)'],
        descripcion: 'Carbapenémico de amplio espectro; antibiótico de reserva para gérmenes multirresistentes.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Vancomicina', group: 'Antibióticos',
        adult: '15 - 20 mg/kg/dosis IV c/8-12h (carga 25 - 30 mg/kg en sepsis grave), ajustada por AUC/MIC 400-600 o por el protocolo de niveles de tu hospital. Infundir a ≤ 10 mg/min',
        ped: '15 mg/kg/dosis IV c/6h (40 - 60 mg/kg/día), ajustada por niveles o AUC',
        renal: 'Ajustar según función renal y niveles séricos; riesgo de nefrotoxicidad. La dosis de carga no se ajusta',
        warning: 'ALTO RIESGO: nefrotoxicidad y ototoxicidad. Síndrome del hombre rojo con infusión rápida. Monitorear creatinina y niveles. No usar IM',
        indicaciones: ['Infección por SARM', 'Bacteriemia y endocarditis por estafilococo resistente', 'Colitis por C. difficile (vía oral)', 'Meningitis (con ceftriaxona)'],
        presentacion: 'Vial 500 mg y 1 g',
        embarazo: 'Precaución; usar si es necesario',
        interacciones: ['Piperacilina/tazobactam (mayor riesgo de lesión renal)', 'Aminoglucósidos y furosemida (nefro y ototoxicidad)', 'Anestésicos (reacciones infusionales)'],
        descripcion: 'Glicopéptido para infecciones graves por gram positivos resistentes.',
        altoRiesgo: true, verificado: false
    },
    {
        name: 'Gentamicina', group: 'Antibióticos',
        adult: '5 - 7 mg/kg IV c/24h (dosis única diaria; usar peso ajustado en obesidad). ITU: 3 - 5 mg/kg c/24h',
        ped: '5 - 7.5 mg/kg/día IV c/24h en > 1 mes. Neonatos: esquema por edad gestacional y postnatal',
        renal: 'Extender el intervalo según CrCl (c/36-48h) y niveles; evitar si hay alternativas en falla renal avanzada',
        warning: 'ALTO RIESGO: nefro y ototoxicidad; monitorear creatinina y niveles. Evitar uso prolongado (> 5-7 días)',
        indicaciones: ['Pielonefritis y sepsis urinaria', 'Sepsis (sinergia con betalactámico)', 'Endocarditis (sinergia)'],
        presentacion: 'Ampolla 80 mg/2 mL y 160 mg/2 mL',
        embarazo: 'Evitar: riesgo de ototoxicidad fetal',
        interacciones: ['Vancomicina, furosemida y AINE (nefro y ototoxicidad)', 'Bloqueadores neuromusculares (potencian el bloqueo)', 'Anfotericina B y cisplatino (nefrotoxicidad)'],
        descripcion: 'Aminoglucósido bactericida concentración-dependiente con efecto sinérgico con betalactámicos.',
        altoRiesgo: true, verificado: false
    },
    {
        name: 'Azitromicina', group: 'Antibióticos',
        adult: '500 mg VO/IV c/24h x3 días (o 500 mg el día 1 y 250 mg x4 días). NAC con atípicos: 500 mg c/24h x3-5 días. Clamidia: 1 g dosis única',
        ped: '10 mg/kg c/24h x3 días (o 10 mg/kg el día 1 y 5 mg/kg los días 2-5). Máx 500 mg/dosis',
        renal: 'Sin ajuste; precaución si eTFG < 10',
        warning: 'Prolonga el QT: evitar con otros fármacos que lo prolonguen o con hipopotasemia. Hepatotoxicidad rara',
        indicaciones: ['NAC (cobertura de atípicos)', 'Faringitis (alergia a penicilina)', 'Clamidia / ITS', 'Diarrea bacteriana (Campylobacter, cólera)', 'Tos ferina'],
        presentacion: 'Tableta 500 mg; suspensión 200 mg/5 mL; vial IV 500 mg',
        embarazo: 'Aceptable',
        interacciones: ['Fármacos que prolongan el QT (amiodarona, haloperidol, ondansetrón, quinolonas)', 'Warfarina (aumenta el INR)', 'Digoxina (aumenta sus niveles)'],
        descripcion: 'Macrólido de vida media larga y esquemas cortos.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Ciprofloxacino', group: 'Antibióticos',
        adult: '500 mg VO c/12h (ITU: 250 - 500 mg c/12h x3-7 días). IV: 400 mg c/12h (c/8h para Pseudomonas)',
        ped: 'Uso restringido (riesgo articular): ITU complicada, Pseudomonas, ántrax. 10 - 15 mg/kg/dosis VO c/12h (máx 750 mg/dosis)',
        renal: 'eTFG 30-50: 250 - 500 mg c/12h; eTFG 5-29: 250 - 500 mg c/18-24h',
        warning: 'Tendinopatía y ruptura tendinosa, neuropatía, prolongación del QT, disglucemia y efectos neuropsiquiátricos. Reservar cuando no hay alternativas. Evitar en miastenia gravis',
        indicaciones: ['ITU complicada / pielonefritis', 'Diarrea disentérica', 'Infección por Pseudomonas', 'Prostatitis', 'Profilaxis en contactos de meningococo'],
        presentacion: 'Tableta 500 mg; solución IV 400 mg/200 mL',
        embarazo: 'Evitar; considerar solo si no hay alternativa',
        interacciones: ['Antiácidos, calcio, hierro y zinc (separar 2h antes o 6h después)', 'Warfarina (aumenta el INR)', 'Teofilina (aumenta sus niveles) y fármacos que prolongan el QT'],
        descripcion: 'Fluoroquinolona con buena biodisponibilidad oral y actividad antipseudomónica.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Trimetoprim / Sulfametoxazol (TMP/SMX)', group: 'Antibióticos',
        adult: '160/800 mg VO c/12h (cistitis 3 días; piel/SARM 5-10 días). Neumonía por P. jirovecii: 15 - 20 mg/kg/día (TMP) IV/VO dividido c/6-8h',
        ped: '6 - 12 mg/kg/día (componente TMP) VO dividido c/12h. Contraindicado en < 2 meses',
        renal: 'eTFG 15-30: 50% de la dosis; eTFG < 15: evitar o usar 50% con monitoreo',
        warning: 'Hiperpotasemia (sobre todo con IECA, ARA II o espironolactona), síndrome de Stevens-Johnson, mielosupresión. Contraindicado en déficit grave de G6PD y en < 2 meses',
        indicaciones: ['Cistitis no complicada', 'Infección de piel por SARM comunitario', 'Neumonía por P. jirovecii', 'Diarrea del viajero'],
        presentacion: 'Tableta 80/400 mg y 160/800 mg; suspensión 40/200 mg por 5 mL',
        embarazo: 'Evitar en el 1er trimestre (antagonista de folato) y cerca del parto (ictericia nuclear neonatal)',
        interacciones: ['Warfarina (aumenta mucho el INR)', 'IECA / ARA II / espironolactona (hiperpotasemia)', 'Metotrexato (toxicidad medular)'],
        descripcion: 'Combinación bacteriostática/bactericida útil en ITU, SARM comunitario y neumonía por Pneumocystis.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Nitrofurantoína', group: 'Antibióticos',
        adult: '100 mg VO c/12h x5 días (macrocristales/monohidrato) en cistitis no complicada',
        ped: '5 - 7 mg/kg/día VO dividido c/6h en mayores de 1 mes, por 5-7 días',
        renal: 'Evitar si eTFG < 30 mL/min (ineficaz y más tóxica)',
        warning: 'No sirve para pielonefritis, prostatitis ni bacteriemia (no alcanza niveles tisulares). Neuropatía y toxicidad pulmonar en uso prolongado. Evitar en déficit de G6PD',
        indicaciones: ['Cistitis no complicada', 'Profilaxis de ITU recurrente'],
        presentacion: 'Cápsula 100 mg',
        embarazo: 'Aceptable en 1er y 2º trimestre; evitar en las semanas 38-42 y en el parto (hemólisis neonatal)',
        interacciones: ['Antiácidos con magnesio (reducen la absorción)', 'Probenecid (reduce su eficacia)', 'Quinolonas (antagonismo in vitro)'],
        descripcion: 'Antiséptico urinario de elección en cistitis no complicada por buena actividad contra E. coli.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Metronidazol', group: 'Antibióticos',
        adult: '500 mg VO/IV c/8h x7-10 días. Giardiasis/amebiasis: 250 - 750 mg c/8h x5-10 días. Tricomoniasis: 2 g dosis única o 500 mg c/12h x7 días',
        ped: '7.5 mg/kg/dosis VO/IV c/8h (máx 500 mg/dosis). Amebiasis y giardiasis: esquema específico por peso',
        renal: 'Sin ajuste habitual; reducir dosis en eTFG < 10',
        warning: 'Efecto tipo disulfiram con alcohol (evitar hasta 48-72h después). Neuropatía y encefalopatía con uso prolongado; sabor metálico',
        indicaciones: ['Infecciones por anaerobios', 'Colitis por C. difficile (leve)', 'Amebiasis y giardiasis', 'Vaginosis bacteriana y tricomoniasis', 'Peritonitis (combinado)'],
        presentacion: 'Tableta 500 mg; suspensión (verificar concentración); bolsa IV 500 mg/100 mL',
        embarazo: 'Aceptable; evitar su uso innecesario en el 1er trimestre',
        interacciones: ['Alcohol (reacción tipo disulfiram)', 'Warfarina (aumenta el INR)', 'Litio (aumenta sus niveles)'],
        descripcion: 'Nitroimidazol con actividad contra anaerobios y protozoos.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Penicilina G benzatínica', group: 'Antibióticos',
        adult: 'Sífilis temprana: 2.4 millones UI IM dosis única. Sífilis latente tardía o de duración desconocida: 2.4 MUI IM semanal x3. Faringitis estreptocócica: 1.2 MUI IM dosis única',
        ped: 'Faringitis: 600.000 UI (< 27 kg) o 1.2 MUI (≥ 27 kg) IM dosis única. Sífilis adquirida: 50.000 UI/kg (máx 2.4 MUI) IM',
        renal: 'Sin ajuste',
        warning: 'SOLO vía intramuscular profunda (la vía IV puede causar paro cardiorrespiratorio). Riesgo de anafilaxia: tener adrenalina disponible. Reacción de Jarisch-Herxheimer en sífilis',
        indicaciones: ['Sífilis (incluida la gestacional)', 'Faringitis estreptocócica', 'Profilaxis de fiebre reumática'],
        presentacion: 'Vial 1.2 MUI y 2.4 MUI (polvo para suspensión IM)',
        embarazo: 'Tratamiento de elección en sífilis gestacional (si hay alergia, desensibilizar)',
        interacciones: ['Probenecid (aumenta sus niveles)', 'Metotrexato (aumenta su toxicidad)', 'Tetraciclinas (antagonismo teórico)'],
        descripcion: 'Penicilina de depósito de acción prolongada; tratamiento de elección de la sífilis.',
        altoRiesgo: false, verificado: false
    },

    // =================== RESPIRATORIO ===================
    {
        name: 'Salbutamol (Albuterol)', group: 'Respiratorio',
        adult: 'Crisis: 4 - 8 inhalaciones (100 mcg) con espaciador c/20 min x3, o nebulización 2.5 - 5 mg c/20 min x3; luego c/4-6h según necesidad. Rescate: 1 - 2 inhalaciones PRN',
        ped: 'Crisis: 4 - 8 inhalaciones con espaciador c/20 min x3, o nebulización 0.15 mg/kg/dosis (mín 2.5 mg, máx 5 mg) c/20 min x3; luego c/1-4h',
        renal: 'Sin ajuste',
        warning: 'Hipopotasemia, taquicardia y temblor con dosis altas. Vigilar el potasio en crisis graves y con uso de corticoides o diuréticos',
        indicaciones: ['Crisis asmática', 'Exacerbación de EPOC', 'Broncoespasmo', 'Hiperpotasemia (nebulizado, adyuvante)'],
        presentacion: 'Inhalador 100 mcg/dosis; solución para nebulizar (verificar concentración)',
        embarazo: 'Seguro',
        interacciones: ['Betabloqueadores no selectivos (antagonizan el efecto y pueden causar broncoespasmo)', 'Diuréticos de asa y corticoides (hipopotasemia)', 'Digoxina (la hipopotasemia aumenta su toxicidad)'],
        descripcion: 'Agonista beta-2 de acción corta; broncodilatador de rescate de primera línea.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Bromuro de ipratropio', group: 'Respiratorio',
        adult: 'Crisis: 0.5 mg (500 mcg) nebulizado, o 4 - 8 inhalaciones (20 mcg), c/20 min x3; luego c/4-6h',
        ped: 'Crisis moderada a grave: 250 mcg (< 20 kg) o 500 mcg (≥ 20 kg) nebulizado c/20 min x3 dosis, junto con salbutamol',
        renal: 'Sin ajuste',
        warning: 'Su beneficio es sobre todo en las primeras horas de la crisis. Cuidado con glaucoma de ángulo cerrado si cae en los ojos y con retención urinaria',
        indicaciones: ['Crisis asmática moderada a grave (adyuvante)', 'Exacerbación de EPOC'],
        presentacion: 'Inhalador 20 mcg/dosis; solución para nebulizar 0.25 mg/mL',
        embarazo: 'Precaución; aceptable si es necesario',
        interacciones: ['Otros anticolinérgicos (efectos adversos aditivos)', 'Agonistas beta-2 (sinergia deseada en crisis)'],
        descripcion: 'Anticolinérgico inhalado de acción corta; se asocia al salbutamol en crisis moderadas y graves.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Prednisolona / Prednisona', group: 'Respiratorio',
        adult: 'Exacerbación de asma o EPOC: 40 - 50 mg VO c/24h x5 días (sin descenso gradual). Prednisona y prednisolona son equivalentes en mg',
        ped: 'Asma: 1 - 2 mg/kg/día VO (máx 40 - 60 mg/día) c/24h x3-5 días',
        renal: 'Sin ajuste',
        warning: 'Hiperglucemia, hipertensión, alteraciones del ánimo e infecciones con uso prolongado. Con más de 2-3 semanas: descenso gradual',
        indicaciones: ['Exacerbación asmática', 'Exacerbación de EPOC', 'Croup (alternativa a dexametasona)', 'Enfermedades inflamatorias y autoinmunes'],
        presentacion: 'Prednisona tableta 5 mg y 20 mg; prednisolona solución o tableta (verificar disponibilidad)',
        embarazo: 'Aceptable si se requiere (menor paso placentario que dexametasona)',
        interacciones: ['AINE (mayor riesgo de úlcera y sangrado GI)', 'Antidiabéticos e insulina (reducen su efecto)', 'Anticoagulantes orales (alteran el INR)'],
        descripcion: 'Corticoide oral de acción intermedia; base del tratamiento de las exacerbaciones respiratorias.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Budesonida inhalada', group: 'Respiratorio',
        adult: 'Dosis baja 200 - 400 mcg/día; media > 400 - 800 mcg/día; alta > 800 mcg/día, dividida c/12h. Enjuagar la boca tras cada uso',
        ped: '6 - 11 años: dosis baja 100 - 200 mcg/día; media > 200 - 400 mcg/día. Nebulizada: 0.25 - 0.5 mg c/12h',
        renal: 'Sin ajuste',
        warning: 'Candidiasis oral y disfonía (usar espaciador y enjuagar). Controlar el crecimiento en niños con dosis medias o altas. Las guías actuales priorizan combinaciones con formoterol como rescate y mantenimiento (GINA)',
        indicaciones: ['Asma persistente (controlador)', 'Croup (nebulizada)', 'EPOC con eosinofilia (combinada)'],
        presentacion: 'Inhalador 100 mcg y 200 mcg; solución para nebulizar 0.25 mg/mL y 0.5 mg/mL',
        embarazo: 'Seguro; corticoide inhalado preferido en el asma gestacional',
        interacciones: ['Ketoconazol, itraconazol y ritonavir (aumentan niveles sistémicos)', 'Betabloqueadores (reducen el efecto broncodilatador)'],
        descripcion: 'Corticoide inhalado, base del tratamiento controlador del asma.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Montelukast', group: 'Respiratorio',
        adult: '10 mg VO c/24h en la noche',
        ped: '6 meses - 5 años: 4 mg; 6 - 14 años: 5 mg; ≥ 15 años: 10 mg VO c/24h en la noche',
        renal: 'Sin ajuste',
        warning: 'Advertencia por efectos neuropsiquiátricos (agitación, pesadillas, depresión, ideación suicida): informar al paciente y a los cuidadores',
        indicaciones: ['Rinitis alérgica', 'Asma leve (alternativa al corticoide inhalado)', 'Broncoconstricción inducida por ejercicio'],
        presentacion: 'Tableta 10 mg; tableta masticable 4 mg y 5 mg; granulado 4 mg',
        embarazo: 'Precaución; usar solo si es necesario',
        interacciones: ['Fenobarbital y rifampicina (reducen sus niveles)', 'Gemfibrozilo (aumenta sus niveles)'],
        descripcion: 'Antagonista de receptores de leucotrienos.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Loratadina', group: 'Respiratorio',
        adult: '10 mg VO c/24h',
        ped: '2 - 5 años: 5 mg c/24h; ≥ 6 años (o > 30 kg): 10 mg c/24h',
        renal: 'eTFG < 30: 10 mg cada 48h',
        warning: 'Antihistamínico de segunda generación poco sedante; precaución en hepatopatía grave',
        indicaciones: ['Rinitis alérgica', 'Urticaria', 'Conjuntivitis alérgica'],
        presentacion: 'Tableta 10 mg; jarabe 5 mg/5 mL',
        embarazo: 'Aceptable',
        interacciones: ['Ketoconazol y eritromicina (aumentan sus niveles)', 'Alcohol (sedación leve)'],
        descripcion: 'Antihistamínico H1 de segunda generación.',
        altoRiesgo: false, verificado: false
    },

    // =================== NEUROLOGÍA ===================
    {
        name: 'Diazepam', group: 'Neurología',
        adult: 'Status epiléptico: 5 - 10 mg IV lento (≤ 5 mg/min), repetible a los 10-15 min (máx 30 mg). Ansiedad o espasmo muscular: 2 - 10 mg VO c/8-12h',
        ped: 'Status: 0.1 - 0.3 mg/kg IV lento (máx 10 mg/dosis). Rectal: 0.5 mg/kg en 2-5 años (0.3 mg/kg en 6-11 años), máx 10 mg. Evitar IM por absorción errática',
        renal: 'Sin ajuste; precaución en hepatopatía y ancianos (reducir 50%)',
        warning: 'ALTO RIESGO: depresión respiratoria, sobre todo combinado con opioides y alcohol. Tener soporte ventilatorio y flumazenil disponibles. No diluir (precipita); riesgo de flebitis',
        indicaciones: ['Status epiléptico', 'Convulsión febril (vía rectal)', 'Abstinencia alcohólica', 'Ansiedad aguda y espasmo muscular'],
        presentacion: 'Tableta 10 mg; ampolla 10 mg/2 mL; solución rectal',
        embarazo: 'Evitar: riesgo neonatal (hipotonía, abstinencia) si se usa cerca del parto',
        interacciones: ['Opioides y alcohol (depresión respiratoria potencialmente fatal)', 'Omeprazol y cimetidina (aumentan sus niveles)', 'Fenitoína (alteración de niveles)'],
        descripcion: 'Benzodiacepina de acción rápida; primera línea en el tratamiento inicial del status epiléptico.',
        altoRiesgo: true, verificado: false
    },
    {
        name: 'Midazolam', group: 'Neurología',
        adult: 'Status epiléptico: 10 mg IM (> 40 kg) o 5 mg IM (13 - 40 kg); IV 0.1 - 0.2 mg/kg lento (máx 10 mg). Sedación procedimental: 1 - 2.5 mg IV titulados',
        ped: 'Status: IM 0.2 mg/kg (máx 10 mg); intranasal 0.2 mg/kg o bucal 0.3 - 0.5 mg/kg (máx 10 mg); IV 0.1 - 0.2 mg/kg. Sedación: 0.05 - 0.1 mg/kg IV titulada',
        renal: 'Reducir dosis en falla renal y en ancianos; el metabolito activo se acumula',
        warning: 'ALTO RIESGO: depresión respiratoria y apnea; requiere monitoreo continuo y capacidad de ventilación asistida',
        indicaciones: ['Status epiléptico (sin acceso venoso: vía IM)', 'Sedación procedimental', 'Agitación (con haloperidol)'],
        presentacion: 'Ampolla 5 mg/5 mL y 15 mg/3 mL',
        embarazo: 'Evitar; riesgo neonatal si se usa cerca del parto',
        interacciones: ['Opioides y alcohol (depresión respiratoria)', 'Claritromicina, eritromicina, fluconazol, diltiazem y verapamilo (potencian su efecto)', 'Fenitoína y carbamazepina (reducen sus niveles)'],
        descripcion: 'Benzodiacepina de acción corta con absorción IM e intranasal fiable.',
        altoRiesgo: true, verificado: false
    },
    {
        name: 'Fenitoína', group: 'Neurología',
        adult: 'Carga: 15 - 20 mg/kg IV (máx 50 mg/min; ≤ 25 mg/min en ancianos o cardiópatas). Mantenimiento: 5 - 7 mg/kg/día (100 mg c/8h IV/VO)',
        ped: 'Carga: 15 - 20 mg/kg IV (≤ 1 mg/kg/min, máx 50 mg/min). Mantenimiento: 5 - 8 mg/kg/día dividido c/12h',
        renal: 'Sin ajuste de dosis; con hipoalbuminemia y uremia la fracción libre aumenta (interpretar el nivel corregido)',
        warning: 'ALTO RIESGO: hipotensión y arritmias con infusión rápida (monitoreo ECG); extravasación (síndrome del guante púrpura). Diluir solo en SSN 0.9% (precipita con dextrosa). Margen terapéutico estrecho',
        indicaciones: ['Status epiléptico (2ª línea)', 'Crisis tónico-clónicas generalizadas y focales', 'Prevención de crisis postraumáticas'],
        presentacion: 'Ampolla 250 mg/5 mL; tableta o cápsula 100 mg',
        embarazo: 'Evitar si es posible: riesgo de síndrome fetal por hidantoína; suplementar ácido fólico y vitamina K',
        interacciones: ['Warfarina, anticonceptivos orales y múltiples fármacos (inductor enzimático potente)', 'Valproato, amiodarona, fluconazol y omeprazol (alteran sus niveles)', 'Alimentación enteral y antiácidos (reducen la absorción)'],
        descripcion: 'Antiepiléptico bloqueador de canales de sodio; segunda línea en status epiléptico.',
        altoRiesgo: true, verificado: false
    },
    {
        name: 'Ácido valproico (Valproato)', group: 'Neurología',
        adult: 'Status: 20 - 40 mg/kg IV (máx 3000 mg) en 10 min. Epilepsia: 10 - 15 mg/kg/día VO c/8-12h, titulando hasta 20 - 30 mg/kg/día (máx 60 mg/kg/día)',
        ped: 'Status: 20 - 40 mg/kg IV. Epilepsia: 10 - 15 mg/kg/día VO dividido c/8-12h, titulando hasta 30 - 60 mg/kg/día. Evitar en < 2 años (riesgo de hepatotoxicidad)',
        renal: 'Sin ajuste; reducir en hipoalbuminemia (mayor fracción libre)',
        warning: 'Contraindicado en mujeres en edad fértil y en embarazo salvo indicación estricta (teratogénico: defectos del tubo neural y trastornos del neurodesarrollo). Hepatotoxicidad, pancreatitis, hiperamonemia y trombocitopenia',
        indicaciones: ['Epilepsia generalizada y focal', 'Status epiléptico (2ª línea)', 'Trastorno bipolar', 'Profilaxis de migraña'],
        presentacion: 'Tableta 250 mg y 500 mg; jarabe 250 mg/5 mL; ampolla 400 mg/4 mL',
        embarazo: 'Contraindicado salvo que no haya alternativa; requiere programa de prevención de embarazo',
        interacciones: ['Carbapenémicos (reducen sus niveles: no combinar)', 'Lamotrigina (aumenta niveles y riesgo de erupción grave)', 'Warfarina y ácido acetilsalicílico (sangrado)'],
        descripcion: 'Antiepiléptico de amplio espectro.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Levetiracetam', group: 'Neurología',
        adult: '500 - 1000 mg VO/IV c/12h (máx 3000 mg/día). Status: 60 mg/kg IV (máx 4500 mg) en 10-15 min',
        ped: '10 mg/kg/dosis c/12h, titulando hasta 30 mg/kg/dosis c/12h. Status: 60 mg/kg IV (máx 4500 mg)',
        renal: 'eTFG 50-80: 500 - 1000 mg c/12h; 30-50: 250 - 750 mg c/12h; < 30: 250 - 500 mg c/12h',
        warning: 'Efectos neuropsiquiátricos (irritabilidad, agresividad, depresión) y somnolencia. Retirar de forma gradual',
        indicaciones: ['Epilepsia focal y generalizada', 'Status epiléptico (2ª línea)', 'Profilaxis de crisis en lesión cerebral'],
        presentacion: 'Tableta 500 mg y 1000 mg; solución oral 100 mg/mL; ampolla 500 mg/5 mL',
        embarazo: 'Uno de los antiepilépticos con menor riesgo teratogénico',
        interacciones: ['Pocas interacciones farmacocinéticas', 'Otros depresores del SNC (sedación aditiva)'],
        descripcion: 'Antiepiléptico con perfil favorable de interacciones; opción cómoda IV y oral.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Carbamazepina', group: 'Neurología',
        adult: 'Inicio 200 mg VO c/12h; aumentar 200 mg por semana hasta 400 - 1200 mg/día divididos c/8-12h. Neuralgia del trigémino: inicio 100 - 200 mg c/12h',
        ped: '10 - 20 mg/kg/día VO dividido c/8-12h, titulando (máx 35 mg/kg/día)',
        renal: 'Sin ajuste habitual; precaución en falla renal grave',
        warning: 'Hiponatremia, discrasias sanguíneas, hepatotoxicidad y reacciones cutáneas graves (SSJ/NET; mayor riesgo con HLA-B*1502). Inductor enzimático potente',
        indicaciones: ['Epilepsia focal y tónico-clónica', 'Neuralgia del trigémino', 'Trastorno bipolar (alternativa)'],
        presentacion: 'Tableta 200 mg; suspensión 100 mg/5 mL',
        embarazo: 'Evitar si es posible; riesgo de defectos del tubo neural (suplementar ácido fólico)',
        interacciones: ['Warfarina, anticonceptivos orales y múltiples fármacos (inducción CYP3A4)', 'Macrólidos, azoles, verapamilo y diltiazem (aumentan sus niveles: riesgo de toxicidad)', 'Fenitoína y valproato (alteran los niveles)'],
        descripcion: 'Antiepiléptico bloqueador de canales de sodio; primera línea en neuralgia del trigémino.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Gabapentina', group: 'Neurología',
        adult: 'Dolor neuropático: iniciar 300 mg VO c/24h en la noche, titular hasta 900 - 3600 mg/día dividido c/8h',
        ped: '≥ 3 años: 10 - 15 mg/kg/día inicial dividido c/8h, titulando hasta 25 - 35 mg/kg/día (uso por especialista)',
        renal: 'eTFG 30-59: 400 - 1400 mg/día c/12h; 15-29: 200 - 700 mg/día; < 15: 100 - 300 mg/día',
        warning: 'Somnolencia, mareo y edema periférico. Riesgo de depresión respiratoria combinada con opioides o en EPOC. Retirada gradual',
        indicaciones: ['Dolor neuropático (neuralgia posherpética, neuropatía diabética)', 'Epilepsia focal (adyuvante)'],
        presentacion: 'Cápsula 300 mg y 400 mg; tableta 600 mg',
        embarazo: 'Precaución; usar solo si el beneficio supera el riesgo',
        interacciones: ['Opioides y benzodiacepinas (depresión respiratoria y sedación)', 'Antiácidos con aluminio/magnesio (reducen la absorción: separar 2h)'],
        descripcion: 'Análogo del GABA usado en dolor neuropático y como antiepiléptico adyuvante.',
        altoRiesgo: false, verificado: false
    },

    // =================== ENDOCRINO / METABOLISMO ===================
    {
        name: 'Metformina', group: 'Endocrino / Metabolismo',
        adult: 'Iniciar 500 mg VO c/12h con las comidas; titular según tolerancia hasta 2000 - 2550 mg/día',
        ped: '≥ 10 años (DM2): 500 mg c/12h con las comidas, hasta 2000 mg/día',
        renal: 'eTFG ≥ 45: sin ajuste; 30-44: reducir 50% (máx 1000 mg/día) y no iniciar; < 30: contraindicada',
        warning: 'Riesgo de acidosis láctica: suspender en sepsis, hipoxia, falla renal aguda y alrededor de contraste yodado según la función renal. Déficit de B12 con uso prolongado; molestias GI',
        indicaciones: ['Diabetes mellitus tipo 2', 'Prediabetes', 'Síndrome de ovario poliquístico (uso fuera de indicación)'],
        presentacion: 'Tableta 500 mg, 850 mg y 1000 mg',
        embarazo: 'Aceptable en DM2 y diabetes gestacional según criterio clínico',
        interacciones: ['Contrastes yodados (suspender temporalmente)', 'Alcohol (riesgo de acidosis láctica)', 'Cimetidina y dolutegravir (aumentan sus niveles)'],
        descripcion: 'Biguanida de primera línea en DM2; no produce hipoglucemia por sí sola.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Insulina NPH', group: 'Endocrino / Metabolismo',
        adult: 'DM2 al inicio: 0.1 - 0.2 UI/kg/día (aprox. 10 UI) SC en la noche; ajustar según la glucemia en ayunas. DM1: dosis total 0.5 - 1 UI/kg/día repartida en esquema basal-bolo',
        ped: 'DM1: dosis total 0.5 - 1 UI/kg/día (hasta 1 - 1.5 en la pubertad), repartida en esquema basal-bolo; individualizar por especialista',
        renal: 'Reducir dosis (la depuración de insulina disminuye); vigilar hipoglucemia',
        warning: 'ALTO RIESGO: hipoglucemia. Verificar siempre el tipo de insulina y la dosis (no confundir con la cristalina). Rotar sitios de aplicación',
        indicaciones: ['Diabetes mellitus tipo 1 y 2', 'Hiperglucemia por corticoides', 'Diabetes gestacional'],
        presentacion: 'Frasco 100 UI/mL; pluma prellenada',
        embarazo: 'Seguro; la insulina es el tratamiento de elección en el embarazo',
        interacciones: ['Betabloqueadores (enmascaran los síntomas de hipoglucemia)', 'Corticoides y tiazidas (aumentan la glucemia)', 'Alcohol (hipoglucemia)'],
        descripcion: 'Insulina de acción intermedia (inicio 1-2h, pico 4-10h, duración 12-18h).',
        altoRiesgo: true, verificado: false
    },
    {
        name: 'Insulina cristalina (regular)', group: 'Endocrino / Metabolismo',
        adult: 'Cetoacidosis diabética: infusión IV 0.1 UI/kg/h (iniciar con K⁺ ≥ 3.3 mEq/L). Hiperpotasemia: 10 UI IV con 25 g de dextrosa. SC: según esquema de corrección o prandial',
        ped: 'CAD: infusión IV 0.05 - 0.1 UI/kg/h (sin bolo), iniciada tras 1 hora de hidratación y con K⁺ ≥ 3.3 mEq/L',
        renal: 'Reducir dosis en falla renal; vigilar hipoglucemia',
        warning: 'ALTO RIESGO: hipoglucemia e hipopotasemia (medir el potasio antes y durante la infusión). Usar bomba de infusión y verificar la concentración preparada',
        indicaciones: ['Cetoacidosis diabética', 'Estado hiperglucémico hiperosmolar', 'Hiperpotasemia', 'Hiperglucemia hospitalaria'],
        presentacion: 'Frasco 100 UI/mL (para infusión se suele preparar 1 UI/mL en SSN: verificar protocolo local)',
        embarazo: 'Seguro',
        interacciones: ['Betabloqueadores (enmascaran la hipoglucemia)', 'Corticoides y tiazidas (aumentan la glucemia)', 'Alcohol (hipoglucemia)'],
        descripcion: 'Insulina de acción corta, la única apta para infusión IV.',
        altoRiesgo: true, verificado: false
    },
    {
        name: 'Insulina glargina', group: 'Endocrino / Metabolismo',
        adult: 'DM2: iniciar 0.1 - 0.2 UI/kg/día (aprox. 10 UI) SC una vez al día a la misma hora; titular 2 UI cada 3 días según la glucemia en ayunas. DM1: aprox. 40 - 50% de la dosis total diaria',
        ped: '≥ 6 años (DM1): individualizar; aprox. 40 - 50% de la dosis total diaria como basal',
        renal: 'Reducir dosis; vigilar hipoglucemia',
        warning: 'ALTO RIESGO: hipoglucemia. No mezclar con otras insulinas ni administrar por vía IV. Verificar la concentración (100 vs 300 UI/mL)',
        indicaciones: ['DM1 y DM2 (insulina basal)'],
        presentacion: 'Pluma prellenada 100 UI/mL',
        embarazo: 'Aceptable según la experiencia disponible',
        interacciones: ['Betabloqueadores (enmascaran la hipoglucemia)', 'Corticoides (aumentan la glucemia)', 'Análogos de GLP-1 y sulfonilureas (mayor riesgo de hipoglucemia)'],
        descripcion: 'Análogo de insulina basal de acción prolongada (aprox. 24h).',
        altoRiesgo: true, verificado: false
    },
    {
        name: 'Glibenclamida', group: 'Endocrino / Metabolismo',
        adult: '2.5 - 5 mg VO c/24h antes del desayuno; máx 20 mg/día (preferible ≤ 10 mg)',
        ped: 'No recomendada',
        renal: 'Evitar si eTFG < 60 mL/min (metabolitos activos, hipoglucemia prolongada)',
        warning: 'Alto riesgo de hipoglucemia prolongada, sobre todo en ancianos, falla renal y ayuno. Considerar alternativas más seguras (metformina, iSGLT2, iDPP4)',
        indicaciones: ['Diabetes mellitus tipo 2'],
        presentacion: 'Tableta 5 mg',
        embarazo: 'Evitar; la insulina es el tratamiento de elección',
        interacciones: ['Fluconazol, TMP/SMX, quinolonas y warfarina (potencian la hipoglucemia)', 'Betabloqueadores (enmascaran los síntomas)', 'Alcohol'],
        descripcion: 'Sulfonilurea de acción prolongada de uso frecuente pero con alto riesgo de hipoglucemia.',
        altoRiesgo: true, verificado: false
    },
    {
        name: 'Empagliflozina', group: 'Endocrino / Metabolismo',
        adult: '10 mg VO c/24h (en DM2 puede aumentarse a 25 mg). Falla cardíaca y enfermedad renal crónica: 10 mg c/24h',
        ped: '≥ 10 años (DM2): 10 mg c/24h (uso por especialista)',
        renal: 'DM2: poca eficacia glucémica con eTFG < 30; para falla cardíaca y ERC puede iniciarse con eTFG ≥ 20',
        warning: 'Cetoacidosis euglucémica, infecciones genitourinarias micóticas, gangrena de Fournier (rara) y depleción de volumen. Suspender 3 días antes de cirugía y durante enfermedad aguda con poca ingesta',
        indicaciones: ['DM2 con enfermedad cardiovascular o renal', 'Insuficiencia cardíaca (FEVI reducida y preservada)', 'Enfermedad renal crónica'],
        presentacion: 'Tableta 10 mg y 25 mg (verificar cobertura en el PBS)',
        embarazo: 'Evitar',
        interacciones: ['Diuréticos (hipovolemia e hipotensión)', 'Insulina y sulfonilureas (aumentan el riesgo de hipoglucemia)'],
        descripcion: 'Inhibidor SGLT2 con beneficio cardiovascular y renal demostrado.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Levotiroxina', group: 'Endocrino / Metabolismo',
        adult: 'Hipotiroidismo: 1.6 mcg/kg/día VO en ayunas (iniciar con 12.5 - 25 mcg/día en ancianos o cardiópatas); ajustar según la TSH a las 6-8 semanas',
        ped: 'Según la edad: 0 - 3 meses 10 - 15 mcg/kg/día; 1 - 5 años 5 - 6; 6 - 12 años 4 - 5; adolescentes 2 - 3 mcg/kg/día (por especialista)',
        renal: 'Sin ajuste',
        warning: 'Tomar en ayunas, 30-60 min antes del desayuno, y separada 4h de calcio, hierro y antiácidos. El exceso causa taquiarritmias, osteoporosis y angina',
        indicaciones: ['Hipotiroidismo', 'Hipotiroidismo congénito', 'Supresión de TSH en cáncer de tiroides'],
        presentacion: 'Tableta 25, 50, 75, 88, 100, 112, 125 y 150 mcg',
        embarazo: 'Seguro y necesario: aumentar la dosis 25-30% al confirmar el embarazo y controlar la TSH c/4-6 semanas',
        interacciones: ['Calcio, hierro, sucralfato, IBP y antiácidos (reducen la absorción)', 'Warfarina (aumenta el efecto anticoagulante)', 'Fenitoína y carbamazepina (aumentan su catabolismo)'],
        descripcion: 'Hormona tiroidea sintética de reemplazo.',
        altoRiesgo: false, verificado: false
    },

    // =================== GASTROINTESTINAL ===================
    {
        name: 'Omeprazol', group: 'Gastrointestinal',
        adult: '20 - 40 mg VO c/24h en ayunas. HDA: 80 mg IV en bolo y luego 40 mg IV c/12h (o infusión de 8 mg/h)',
        ped: '0.7 - 1 mg/kg/día VO c/24h (máx 40 mg/día)',
        renal: 'Sin ajuste',
        warning: 'Uso prolongado: hipomagnesemia, déficit de B12, fracturas e infección por C. difficile. Reevaluar la indicación periódicamente. Evitar junto con clopidogrel (preferir pantoprazol)',
        indicaciones: ['ERGE y esofagitis', 'Úlcera péptica', 'Hemorragia digestiva alta', 'Gastroprotección con AINE', 'Erradicación de H. pylori'],
        presentacion: 'Cápsula 20 mg; vial IV 40 mg',
        embarazo: 'Aceptable',
        interacciones: ['Clopidogrel (reduce su activación: evitar omeprazol y esomeprazol)', 'Warfarina y fenitoína (aumentan niveles)', 'Metotrexato (aumenta niveles)'],
        descripcion: 'Inhibidor de la bomba de protones de uso muy frecuente.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Pantoprazol', group: 'Gastrointestinal',
        adult: '40 mg VO/IV c/24h. HDA: 80 mg IV en bolo y luego 40 mg IV c/12h',
        ped: '≥ 5 años: 20 mg (15 - 40 kg) o 40 mg (≥ 40 kg) VO c/24h',
        renal: 'Sin ajuste',
        warning: 'Menos interacciones que el omeprazol; mismos riesgos del uso prolongado de IBP (hipomagnesemia, déficit de B12, fracturas)',
        indicaciones: ['Hemorragia digestiva alta', 'Gastroprotección con antiagregantes y anticoagulantes', 'ERGE', 'Úlcera péptica'],
        presentacion: 'Tableta 40 mg; vial IV 40 mg',
        embarazo: 'Precaución: datos limitados; el omeprazol tiene más experiencia',
        interacciones: ['Clopidogrel (interacción mínima: IBP de elección)', 'Metotrexato en dosis altas', 'Warfarina (monitorear INR)'],
        descripcion: 'Inhibidor de la bomba de protones con menor interacción con clopidogrel.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Metoclopramida', group: 'Gastrointestinal',
        adult: '10 mg VO/IV/IM c/8h (máx 30 mg/día, por un máximo de 5 días)',
        ped: '0.1 - 0.15 mg/kg/dosis c/8h (máx 0.5 mg/kg/día); evitar en < 1 año; uso breve (≤ 5 días)',
        renal: 'eTFG ≤ 60: 50% de la dosis; falla renal grave: 25%',
        warning: 'Distonía aguda (más frecuente en jóvenes), acatisia y discinesia tardía con uso prolongado. Contraindicada en obstrucción GI, hemorragia o perforación, feocromocitoma y epilepsia',
        indicaciones: ['Náuseas y vómito', 'Gastroparesia', 'Migraña (coadyuvante)'],
        presentacion: 'Tableta 10 mg; ampolla 10 mg/2 mL; gotas',
        embarazo: 'Aceptable',
        interacciones: ['Antipsicóticos (mayor riesgo de efectos extrapiramidales)', 'Levodopa (antagonismo)', 'Fármacos serotoninérgicos (síndrome serotoninérgico)'],
        descripcion: 'Procinético y antiemético antagonista dopaminérgico.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Ondansetrón', group: 'Gastrointestinal',
        adult: '4 - 8 mg IV/VO c/8h (dosis IV única máx 16 mg). Profilaxis posoperatoria: 4 mg IV',
        ped: '0.1 - 0.15 mg/kg/dosis IV (máx 4 mg). VO: 2 mg (8-15 kg), 4 mg (15-30 kg), 8 mg (> 30 kg) en dosis única en gastroenteritis',
        renal: 'Sin ajuste',
        warning: 'Prolonga el QT: evitar con otros fármacos que lo prolonguen o con alteraciones electrolíticas. Estreñimiento y cefalea',
        indicaciones: ['Náuseas y vómito agudo (gastroenteritis)', 'Quimioterapia y posoperatorio', 'Hiperémesis (según criterio clínico)'],
        presentacion: 'Tableta 4 mg y 8 mg; ampolla 4 mg/2 mL y 8 mg/4 mL',
        embarazo: 'Precaución en el 1er trimestre (posible mayor riesgo de hendiduras orofaciales)',
        interacciones: ['Fármacos que prolongan el QT (amiodarona, haloperidol, azitromicina, quinolonas)', 'Apomorfina (contraindicada)', 'Tramadol y serotoninérgicos (síndrome serotoninérgico)'],
        descripcion: 'Antagonista 5-HT3; antiemético de elección con menos efectos extrapiramidales.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Hioscina (butilbromuro)', group: 'Gastrointestinal',
        adult: '10 - 20 mg VO/IM/IV c/6-8h (máx 100 mg/día)',
        ped: '6 - 12 años: 10 mg VO c/8h. No usar en < 6 años salvo indicación médica',
        renal: 'Sin ajuste',
        warning: 'Contraindicada en glaucoma de ángulo cerrado, miastenia gravis, megacolon, íleo paralítico y taquiarritmias. Puede causar taquicardia, sequedad bucal y retención urinaria',
        indicaciones: ['Cólico biliar', 'Cólico renal (coadyuvante)', 'Espasmo gastrointestinal o ginecológico'],
        presentacion: 'Tableta 10 mg; ampolla 20 mg/1 mL',
        embarazo: 'Precaución; evitar en el 1er trimestre',
        interacciones: ['Otros anticolinérgicos (antihistamínicos, tricíclicos, antipsicóticos)', 'Metoclopramida (antagonismo)', 'Agonistas beta-adrenérgicos (aumenta la taquicardia)'],
        descripcion: 'Antiespasmódico anticolinérgico para cólicos abdominales.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Sales de rehidratación oral (SRO)', group: 'Gastrointestinal',
        adult: 'Deshidratación leve a moderada: 75 mL/kg en 4 horas (OMS) o 200 - 400 mL tras cada deposición líquida',
        ped: 'Plan A: 50 - 100 mL (< 2 años) o 100 - 200 mL (2 - 10 años) tras cada deposición líquida. Plan B (algún grado de deshidratación): 75 mL/kg en 4 horas, luego reevaluar',
        renal: 'Sin ajuste; precaución en falla renal con restricción de líquidos',
        warning: 'El vómito no contraindica las SRO: dar sorbos pequeños y frecuentes (5 mL c/1-2 min). Si hay deshidratación grave, íleo, alteración de la conciencia o falla de la vía oral: usar vía IV',
        indicaciones: ['Diarrea aguda con o sin deshidratación', 'Gastroenteritis', 'Prevención de deshidratación'],
        presentacion: 'Sobre de SRO de baja osmolaridad (disolver en 1 L de agua potable o hervida)',
        embarazo: 'Seguro',
        interacciones: ['Sin interacciones relevantes'],
        descripcion: 'Tratamiento de elección de la deshidratación leve a moderada por diarrea (OMS).',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Loperamida', group: 'Gastrointestinal',
        adult: '4 mg VO inicial y luego 2 mg tras cada deposición líquida (máx 16 mg/día)',
        ped: 'No recomendada de rutina en niños. Contraindicada en < 2 años (riesgo de íleo y depresión del SNC)',
        renal: 'Sin ajuste',
        warning: 'Contraindicada en diarrea con sangre o moco, fiebre alta, o sospecha de colitis por C. difficile o colitis fulminante (riesgo de megacolon tóxico). Dosis altas: arritmias (QT)',
        indicaciones: ['Diarrea acuosa aguda del adulto sin signos de invasión'],
        presentacion: 'Cápsula o tableta 2 mg',
        embarazo: 'Evitar en el 1er trimestre; precaución',
        interacciones: ['Ritonavir, quinidina, itraconazol y gemfibrozilo (aumentan niveles: riesgo de QT)', 'Opioides y anticolinérgicos (estreñimiento severo)'],
        descripcion: 'Opioide antidiarreico sin efecto central a dosis habituales.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Lactulosa', group: 'Gastrointestinal',
        adult: 'Estreñimiento: 15 - 30 mL VO c/24h. Encefalopatía hepática: 20 - 30 g (30 - 45 mL) VO c/8-12h, titulando a 2-3 deposiciones blandas al día',
        ped: 'Estreñimiento: 1 - 3 mL/kg/día dividido c/12-24h (máx 60 mL/día)',
        renal: 'Sin ajuste',
        warning: 'Distensión, flatulencia y diarrea con sobredosis (en encefalopatía puede causar deshidratación e hipernatremia). Evitar en galactosemia',
        indicaciones: ['Estreñimiento crónico', 'Encefalopatía hepática', 'Prevención de recurrencia de encefalopatía hepática'],
        presentacion: 'Solución 667 mg/mL (10 g/15 mL)',
        embarazo: 'Seguro',
        interacciones: ['Neomicina (puede reducir el efecto de la lactulosa)', 'Otros laxantes (diarrea)'],
        descripcion: 'Disacárido no absorbible con efecto laxante y reductor de amonio.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Zinc (suplemento en diarrea)', group: 'Gastrointestinal',
        adult: 'No indicado de rutina en diarrea del adulto (suplementación por déficit: 8 - 11 mg/día)',
        ped: 'Diarrea aguda: < 6 meses 10 mg/día; ≥ 6 meses 20 mg/día VO x10-14 días (OMS)',
        renal: 'Sin ajuste',
        warning: 'Puede causar náuseas y vómito; administrar con SRO si es necesario. Uso prolongado en dosis altas: déficit de cobre',
        indicaciones: ['Diarrea aguda en niños (reduce la duración y la recurrencia)'],
        presentacion: 'Tableta dispersable 20 mg; jarabe 10 mg/5 mL (verificar concentración)',
        embarazo: 'Seguro a dosis fisiológicas',
        interacciones: ['Quinolonas y tetraciclinas (reducen su absorción: separar 2-3h)', 'Hierro y cobre (compiten por la absorción)'],
        descripcion: 'Suplemento recomendado por la OMS junto con SRO en la diarrea aguda pediátrica.',
        altoRiesgo: false, verificado: false
    },

    // =================== URGENCIAS / REANIMACIÓN ===================
    {
        name: 'Atropina', group: 'Urgencias / Reanimación',
        adult: 'Bradicardia sintomática: 1 mg IV en bolo, repetible c/3-5 min (máx 3 mg). Organofosforados: 1 - 2 mg IV, duplicar c/5 min hasta atropinización (secreciones secas)',
        ped: 'Bradicardia: 0.02 mg/kg IV/IO (mín 0.1 mg; máx 0.5 mg por dosis en niños y 1 mg en adolescentes), repetible una vez. Organofosforados: 0.02 - 0.05 mg/kg c/5-10 min',
        renal: 'Sin ajuste',
        warning: 'Dosis < 0.5 mg pueden causar bradicardia paradójica. Precaución en glaucoma de ángulo cerrado, taquicardia y retención urinaria. No sustituye el marcapasos transcutáneo en bloqueos de alto grado',
        indicaciones: ['Bradicardia sintomática', 'Intoxicación por organofosforados y carbamatos', 'Sialorrea y secreciones'],
        presentacion: 'Ampolla 1 mg/1 mL',
        embarazo: 'Aceptable si es necesario',
        interacciones: ['Otros anticolinérgicos (antihistamínicos, tricíclicos): efectos aditivos', 'Betabloqueadores (efecto contrapuesto sobre la frecuencia cardíaca)'],
        descripcion: 'Anticolinérgico antagonista muscarínico; antídoto de los organofosforados.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Adenosina', group: 'Urgencias / Reanimación',
        adult: 'TSV: 6 mg IV en bolo rápido (1 - 2 s) seguido de 20 mL de SSN; si no responde en 1-2 min, 12 mg; puede repetirse 12 mg una vez más',
        ped: '0.1 mg/kg IV rápido (máx 6 mg); luego 0.2 mg/kg (máx 12 mg)',
        renal: 'Sin ajuste',
        warning: 'ALTO RIESGO: asistolia transitoria y sensación de muerte inminente (avisar al paciente). Contraindicada en asma con broncoespasmo y en bloqueo AV de 2º-3er grado sin marcapasos. Usar vena proximal grande con llave de 3 vías; monitoreo y desfibrilador disponibles',
        indicaciones: ['Taquicardia supraventricular paroxística por reentrada', 'Diagnóstico de taquicardias de complejo estrecho'],
        presentacion: 'Ampolla 6 mg/2 mL',
        embarazo: 'Seguro; puede usarse',
        interacciones: ['Dipiridamol y carbamazepina (potencian: reducir la dosis a 3 mg)', 'Teofilina y cafeína (antagonizan el efecto)', 'Verapamilo, diltiazem y betabloqueadores IV (bradicardia severa)'],
        descripcion: 'Bloqueador transitorio del nodo AV de vida media ultracorta.',
        altoRiesgo: true, verificado: false
    },
    {
        name: 'Naloxona', group: 'Urgencias / Reanimación',
        adult: '0.04 - 0.4 mg IV titulada c/2-3 min hasta obtener respuesta (hasta 2 mg); IM/SC/intranasal 0.4 - 2 mg. Si recurre la depresión respiratoria: infusión a 2/3 de la dosis efectiva por hora',
        ped: '0.01 mg/kg IV/IM/SC (puede repetirse c/2-3 min); sobredosis completa: 0.1 mg/kg (máx 2 mg)',
        renal: 'Sin ajuste',
        warning: 'Efecto corto (30 - 90 min) frente a opioides de acción prolongada: riesgo de renarcotización, observar 2-4h. Puede precipitar abstinencia aguda, edema pulmonar y agitación; titular en usuarios crónicos',
        indicaciones: ['Intoxicación o depresión respiratoria por opioides', 'Reversión de opioides en el posoperatorio'],
        presentacion: 'Ampolla 0.4 mg/1 mL',
        embarazo: 'Usar si es necesario (puede precipitar abstinencia fetal)',
        interacciones: ['Antagoniza todos los opioides, incluida la buprenorfina (se requieren dosis altas)', 'Clonidina (efectos variables)'],
        descripcion: 'Antagonista opioide competitivo para sobredosis.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Dexametasona', group: 'Urgencias / Reanimación',
        adult: 'Edema cerebral por tumor: 10 mg IV y luego 4 mg c/6h. Asma o EPOC: 6 - 10 mg IV/VO dosis única o c/24h x1-2 días. Anafilaxia (adyuvante): 4 - 8 mg IV. COVID-19 con oxígeno: 6 mg c/24h x10 días',
        ped: 'Croup: 0.15 - 0.6 mg/kg VO/IM/IV dosis única (máx 16 mg). Asma: 0.6 mg/kg dosis única (máx 16 mg)',
        renal: 'Sin ajuste',
        warning: 'Hiperglucemia (controlar la glucemia en diabéticos), inmunosupresión y alteraciones del ánimo. Ante sospecha de linfoma, puede enmascarar el diagnóstico antes de la biopsia',
        indicaciones: ['Croup', 'Edema cerebral', 'Exacerbación asmática', 'Náuseas y vómito por quimioterapia', 'Maduración pulmonar fetal'],
        presentacion: 'Ampolla 4 mg/mL y 8 mg/2 mL; tableta 4 mg',
        embarazo: 'Indicada para maduración pulmonar fetal (24-34 semanas); para otros usos, valorar riesgo y beneficio',
        interacciones: ['Fenitoína, carbamazepina y rifampicina (reducen su efecto)', 'AINE (úlcera y sangrado GI)', 'Insulina y antidiabéticos (aumentan la glucemia)'],
        descripcion: 'Corticoide de acción prolongada y alta potencia antiinflamatoria.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Hidrocortisona', group: 'Urgencias / Reanimación',
        adult: 'Choque séptico refractario: 50 mg IV c/6h (200 mg/día). Insuficiencia suprarrenal aguda: 100 mg IV en bolo y luego 200 mg/24h (infusión o 50 mg c/6h). Anafilaxia (adyuvante): 200 mg IV',
        ped: 'Insuficiencia suprarrenal aguda: 50 - 100 mg/m² IV en bolo (máx 100 mg), luego 50 - 100 mg/m²/día dividido c/6h. Choque refractario: 50 - 100 mg/m²/día',
        renal: 'Sin ajuste',
        warning: 'En insuficiencia suprarrenal no retrasar la dosis por pruebas diagnósticas. Hiperglucemia y retención de sodio. En anafilaxia nunca reemplaza a la adrenalina',
        indicaciones: ['Insuficiencia suprarrenal aguda (crisis addisoniana)', 'Choque séptico refractario', 'Anafilaxia (adyuvante)', 'Exacerbaciones graves de asma o EPOC (alternativa)'],
        presentacion: 'Vial 100 mg y 500 mg',
        embarazo: 'Aceptable; corticoide de elección en crisis suprarrenal gestacional',
        interacciones: ['Fenitoína, rifampicina y carbamazepina (reducen su efecto)', 'AINE (úlcera y sangrado)', 'Insulina y antidiabéticos (reducen su efecto)'],
        descripcion: 'Glucocorticoide con actividad mineralocorticoide; reemplazo de urgencia en crisis suprarrenal.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Sulfato de magnesio', group: 'Urgencias / Reanimación',
        adult: 'Preeclampsia severa o eclampsia: carga 4 - 6 g IV en 15-20 min, mantenimiento 1 - 2 g/h (hasta 24h posparto). Asma grave: 2 g IV en 20 min. Torsades de pointes: 2 g IV en 5-20 min',
        ped: 'Asma grave: 25 - 50 mg/kg IV en 20 min (máx 2 g). Torsades de pointes: 25 - 50 mg/kg IV (máx 2 g)',
        renal: 'Se elimina por vía renal: reducir el mantenimiento y vigilar niveles si hay oliguria o creatinina > 1.2 mg/dL',
        warning: 'ALTO RIESGO: toxicidad por hipermagnesemia (pérdida de reflejos rotulianos, FR < 12, diuresis < 30 mL/h, hipotensión). Antídoto: gluconato de calcio 1 g IV. Monitoreo continuo en eclampsia',
        indicaciones: ['Eclampsia y prevención de convulsiones en preeclampsia severa', 'Asma grave refractaria (adyuvante)', 'Torsades de pointes', 'Hipomagnesemia'],
        presentacion: 'Ampolla al 20% o al 50% (verificar concentración y volumen del producto)',
        embarazo: 'Indicado en preeclampsia severa y eclampsia (anticonvulsivante de elección)',
        interacciones: ['Bloqueadores de calcio como el nifedipino (hipotensión y debilidad neuromuscular)', 'Bloqueadores neuromusculares (potencian el bloqueo)', 'Aminoglucósidos (debilidad neuromuscular)'],
        descripcion: 'Electrolito con efecto anticonvulsivante, broncodilatador y antiarrítmico.',
        altoRiesgo: true, verificado: false
    },
    {
        name: 'Gluconato de calcio', group: 'Urgencias / Reanimación',
        adult: 'Hiperpotasemia con cambios en el ECG, hipocalcemia sintomática o intoxicación por magnesio: 1 - 2 g (10 - 20 mL al 10%) IV en 10 min, repetible',
        ped: '50 - 100 mg/kg/dosis (0.5 - 1 mL/kg al 10%) IV lento en 5-10 min (máx 2 g)',
        renal: 'Sin ajuste; vigilar la calcemia',
        warning: 'Infundir lento con monitoreo ECG (bradicardia o asistolia con infusión rápida). La extravasación causa necrosis. No mezclar con ceftriaxona ni bicarbonato. Precaución en pacientes digitalizados',
        indicaciones: ['Hiperpotasemia (estabilización de membrana)', 'Hipocalcemia sintomática', 'Toxicidad por sulfato de magnesio', 'Intoxicación por bloqueadores de calcio'],
        presentacion: 'Ampolla al 10% (1 g/10 mL)',
        embarazo: 'Seguro',
        interacciones: ['Digoxina (riesgo de arritmias con calcio IV)', 'Ceftriaxona (precipitación: contraindicado simultáneo)', 'Bicarbonato y fosfatos (precipitan)'],
        descripcion: 'Sal de calcio de elección por vía periférica para emergencias.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Dextrosa (hipoglucemia)', group: 'Urgencias / Reanimación',
        adult: 'Paciente consciente: 15 - 20 g de carbohidrato VO. Hipoglucemia grave con alteración de conciencia: 25 g (50 mL de dextrosa al 50%) IV; luego infusión de dextrosa al 5-10% y control c/15 min',
        ped: '0.5 - 1 g/kg IV (dextrosa al 10%: 5 - 10 mL/kg) en 5-10 min. Recién nacidos: dextrosa al 10% 2 mL/kg',
        renal: 'Sin ajuste',
        warning: 'Las soluciones concentradas (> 12.5%) por extravasación causan necrosis: preferir D10% y vena de buen calibre. Ante sospecha de alcoholismo o desnutrición, dar tiamina antes o junto con la glucosa. Controlar la glucemia c/15-30 min',
        indicaciones: ['Hipoglucemia sintomática', 'Hiperpotasemia (con insulina)', 'Hidratación y aporte calórico'],
        presentacion: 'Dextrosa al 5%, 10% y 50% (frascos y ampollas)',
        embarazo: 'Seguro',
        interacciones: ['Insulina y sulfonilureas (puede requerir dosis repetidas por hipoglucemia prolongada)', 'Diuréticos y corticoides (hiperglucemia)'],
        descripcion: 'Tratamiento de la hipoglucemia grave.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Bicarbonato de sodio', group: 'Urgencias / Reanimación',
        adult: 'Acidosis metabólica grave (pH < 7.0 - 7.1) o hiperpotasemia con acidosis: 1 mEq/kg IV en 15-30 min. Intoxicación por tricíclicos o salicilatos: 1 - 2 mEq/kg en bolo IV',
        ped: '1 mEq/kg/dosis IV lento; en neonatos y lactantes diluir al 4.2% (1:1 con agua estéril)',
        renal: 'Precaución con sobrecarga de sodio y de volumen',
        warning: 'No usar de rutina en paro cardiorrespiratorio ni en cetoacidosis diabética (salvo pH < 6.9). Hipernatremia, hipopotasemia, alcalosis y sobrecarga de volumen. Incompatible con calcio y vasopresores en la misma línea',
        indicaciones: ['Acidosis metabólica grave', 'Hiperpotasemia con acidosis', 'Intoxicación por antidepresivos tricíclicos o salicilatos', 'Rabdomiólisis (alcalinización urinaria, según protocolo)'],
        presentacion: 'Ampolla 1 mEq/mL (8.4%) de 10 mL y 50 mL',
        embarazo: 'Aceptable si es necesario',
        interacciones: ['Calcio y catecolaminas (precipitación o inactivación en la misma línea)', 'Fármacos ácidos o básicos (modifica la excreción urinaria)'],
        descripcion: 'Alcalinizante sistémico de uso selectivo en acidosis grave e intoxicaciones.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Ketamina', group: 'Urgencias / Reanimación',
        adult: 'Analgesia: 0.1 - 0.3 mg/kg IV. Sedación-analgesia para procedimientos: 1 - 2 mg/kg IV en 1 min (o 4 - 5 mg/kg IM). Inducción: 1 - 2 mg/kg IV',
        ped: 'Sedación para procedimientos: 1 - 2 mg/kg IV lento (o 4 - 5 mg/kg IM)',
        renal: 'Sin ajuste significativo',
        warning: 'ALTO RIESGO: requiere personal con manejo de la vía aérea. Laringoespasmo (sobre todo en < 12 meses), hipersalivación, reacciones emergentes (disforia, alucinaciones), hipertensión y taquicardia. Contraindicada en < 3 meses, psicosis e hipertensión severa no controlada',
        indicaciones: ['Sedación y analgesia para procedimientos', 'Inducción de secuencia rápida (hipotensión o asma)', 'Analgesia en trauma'],
        presentacion: 'Vial 500 mg/10 mL (50 mg/mL); medicamento de control especial',
        embarazo: 'Evitar; atraviesa la placenta',
        interacciones: ['Benzodiacepinas (reducen las reacciones emergentes y aumentan la sedación)', 'Teofilina (reduce el umbral convulsivo)', 'Otros depresores del SNC (sedación aditiva)'],
        descripcion: 'Anestésico disociativo con efecto analgésico y estabilidad hemodinámica.',
        altoRiesgo: true, verificado: false
    },
    {
        name: 'Haloperidol', group: 'Urgencias / Reanimación',
        adult: 'Agitación aguda: 2.5 - 5 mg IM/IV c/30-60 min (máx 20 mg/día); ancianos: 0.5 - 2 mg. Delirium: 0.5 - 2 mg IV/IM',
        ped: 'Evitar en urgencias pediátricas sin indicación específica; uso por especialista',
        renal: 'Sin ajuste; precaución en hepatopatía',
        warning: 'Prolonga el QT (obtener ECG si hay riesgo y corregir K⁺/Mg²⁺), distonía aguda y síndrome neuroléptico maligno. Contraindicado en Parkinson, demencia con cuerpos de Lewy y depresión del SNC. Mayor mortalidad en ancianos con demencia. La vía IV no está aprobada: usar con monitoreo',
        indicaciones: ['Agitación psicomotriz', 'Delirium', 'Psicosis aguda'],
        presentacion: 'Ampolla 5 mg/1 mL; tableta 5 mg; gotas 2 mg/mL',
        embarazo: 'Precaución; usar si el beneficio supera el riesgo',
        interacciones: ['Fármacos que prolongan el QT (azitromicina, ondansetrón, amiodarona, quinolonas)', 'Metoclopramida (efectos extrapiramidales)', 'Carbamazepina y fenitoína (reducen sus niveles)'],
        descripcion: 'Antipsicótico típico de uso frecuente en agitación aguda.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Carbón activado', group: 'Urgencias / Reanimación',
        adult: '1 g/kg (máx 50 g) VO o por SNG dentro de 1 - 2 h de la ingestión de un tóxico adsorbible',
        ped: '1 g/kg (máx 50 g) VO o por SNG dentro de la primera hora',
        renal: 'Sin ajuste',
        warning: 'Solo con la vía aérea protegida. Contraindicado en ingestión de cáusticos e hidrocarburos (riesgo de aspiración), íleo u obstrucción y depresión de conciencia sin intubación. No adsorbe alcoholes, metales (hierro, litio) ni ácidos o álcalis fuertes. Consultar toxicología',
        indicaciones: ['Intoxicación aguda por tóxicos adsorbibles (acetaminofén, antidepresivos, carbamazepina)'],
        presentacion: 'Polvo o suspensión 50 g',
        embarazo: 'Seguro',
        interacciones: ['Reduce la absorción de fármacos orales administrados al mismo tiempo', 'N-acetilcisteína oral (separar o usar vía IV)'],
        descripcion: 'Adsorbente gastrointestinal para descontaminación en las primeras horas.',
        altoRiesgo: false, verificado: false
    },

    // =================== CARDIOVASCULAR (más usados) ===================
    {
        name: 'Amlodipino', group: 'Cardiovascular',
        adult: '5 - 10 mg VO c/24h (iniciar con 2.5 mg en ancianos o hepatopatía)',
        ped: '6 - 17 años: 2.5 - 5 mg VO c/24h',
        renal: 'Sin ajuste',
        warning: 'Edema periférico dosis-dependiente, cefalea y rubor. Hipotensión al asociarlo con otros antihipertensivos',
        indicaciones: ['Hipertensión arterial', 'Angina crónica estable'],
        presentacion: 'Tableta 5 mg y 10 mg',
        embarazo: 'Precaución: datos limitados; en gestación se prefieren labetalol, nifedipino o metildopa',
        interacciones: ['Simvastatina (limitar a 20 mg/día)', 'Claritromicina, azoles y ritonavir (aumentan sus niveles)', 'Otros antihipertensivos (hipotensión)'],
        descripcion: 'Bloqueador de canales de calcio dihidropiridínico de acción prolongada.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Hidroclorotiazida', group: 'Cardiovascular',
        adult: '12.5 - 25 mg VO c/24h (máx 50 mg/día)',
        ped: '1 - 2 mg/kg/día VO c/12-24h (máx 37.5 mg/día en < 2 años; 100 mg/día en 2 - 12 años)',
        renal: 'Poco eficaz con eTFG < 30 mL/min (usar diurético de asa)',
        warning: 'Hiponatremia, hipopotasemia, hiperuricemia o gota, hipercalcemia e hiperglucemia. Mayor riesgo de cáncer de piel no melanoma con uso prolongado (fotoprotección)',
        indicaciones: ['Hipertensión arterial', 'Edema leve', 'Hipercalciuria y litiasis cálcica'],
        presentacion: 'Tableta 25 mg y 50 mg',
        embarazo: 'Evitar (reduce el volumen plasmático); no iniciar durante la gestación',
        interacciones: ['Litio (aumenta niveles y toxicidad)', 'Digoxina (la hipopotasemia aumenta su toxicidad)', 'AINE (reducen el efecto antihipertensivo)'],
        descripcion: 'Diurético tiazídico de primera línea en hipertensión.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Captopril', group: 'Cardiovascular',
        adult: 'HTA: 12.5 - 50 mg VO c/8-12h (máx 150 mg/día). Crisis hipertensiva sin daño de órgano blanco: 12.5 - 25 mg VO',
        ped: '0.3 - 0.5 mg/kg/dosis VO c/8h (máx 6 mg/kg/día)',
        renal: 'eTFG 10-50: 75% de la dosis; < 10: 50%',
        warning: 'Angioedema, tos seca, hiperpotasemia y deterioro de la función renal. Contraindicado en estenosis bilateral de arteria renal y en embarazo. Suspender en depleción de volumen',
        indicaciones: ['Hipertensión arterial', 'Insuficiencia cardíaca', 'Nefropatía diabética', 'Posinfarto'],
        presentacion: 'Tableta 25 mg y 50 mg',
        embarazo: 'Contraindicado (fetotoxicidad en el 2º y 3er trimestre)',
        interacciones: ['Espironolactona y suplementos de potasio (hiperpotasemia)', 'AINE (reducen el efecto y favorecen la lesión renal)', 'Litio (aumenta sus niveles)'],
        descripcion: 'IECA de acción corta de uso frecuente en HTA y falla cardíaca.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Carvedilol', group: 'Cardiovascular',
        adult: 'Insuficiencia cardíaca: 3.125 mg VO c/12h, duplicar cada 2 semanas según tolerancia hasta 25 mg c/12h (50 mg c/12h si > 85 kg). HTA: 12.5 mg c/24h x2 días, luego 25 mg c/24h',
        ped: 'Uso por especialista; no recomendado de rutina',
        renal: 'Sin ajuste',
        warning: 'No iniciar en insuficiencia cardíaca descompensada. Bradicardia, hipotensión ortostática y broncoespasmo (no selectivo); enmascara la hipoglucemia. Contraindicado en asma y bloqueo AV de 2º-3er grado. No suspender bruscamente',
        indicaciones: ['Insuficiencia cardíaca con FEVI reducida', 'Hipertensión arterial', 'Posinfarto con disfunción del VI'],
        presentacion: 'Tableta 3.125, 6.25, 12.5 y 25 mg',
        embarazo: 'Precaución; datos limitados',
        interacciones: ['Verapamilo y diltiazem (bradicardia y bloqueo AV)', 'Insulina y antidiabéticos (enmascara la hipoglucemia)', 'Digoxina (aumenta niveles y la bradicardia)'],
        descripcion: 'Betabloqueador no selectivo con bloqueo alfa-1 y beneficio en mortalidad en falla cardíaca.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Atorvastatina', group: 'Cardiovascular',
        adult: '10 - 80 mg VO c/24h (alta intensidad 40 - 80 mg en síndrome coronario agudo o riesgo muy alto; 10 - 20 mg en riesgo bajo a moderado)',
        ped: '≥ 10 años con hipercolesterolemia familiar: 10 - 20 mg c/24h (por especialista)',
        renal: 'Sin ajuste',
        warning: 'Miopatía y rabdomiólisis (consultar si hay dolor muscular u orina oscura), elevación de transaminasas. Contraindicada en hepatopatía activa y embarazo',
        indicaciones: ['Dislipidemia', 'Prevención cardiovascular primaria y secundaria', 'Síndrome coronario agudo', 'ACV isquémico (prevención secundaria)'],
        presentacion: 'Tableta 10, 20, 40 y 80 mg',
        embarazo: 'Contraindicada; suspender al planear o confirmar el embarazo',
        interacciones: ['Claritromicina, itraconazol y ciclosporina (aumentan niveles: riesgo de rabdomiólisis)', 'Gemfibrozilo y niacina (riesgo de miopatía)', 'Jugo de toronja en grandes cantidades'],
        descripcion: 'Estatina de alta potencia, de uso muy extendido en prevención cardiovascular.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Ácido acetilsalicílico (ASA)', group: 'Cardiovascular',
        adult: 'SCA: carga 160 - 325 mg VO masticado, luego 75 - 100 mg c/24h. ACV isquémico agudo: 160 - 325 mg VO. Prevención secundaria: 75 - 100 mg/día',
        ped: 'Evitar en menores de 18 años con fiebre o infección viral (síndrome de Reye). Kawasaki y cardiopatías: solo por especialista',
        renal: 'Evitar dosis analgésicas o antiinflamatorias si eTFG < 30; la dosis antiagregante es aceptable',
        warning: 'Sangrado GI y de otros sitios. Contraindicado en úlcera activa, hemorragia intracraneal, dengue y alergia a AINE o asma sensible a aspirina',
        indicaciones: ['Síndrome coronario agudo', 'Prevención secundaria cardio y cerebrovascular', 'ACV isquémico', 'Prevención de preeclampsia (dosis baja)'],
        presentacion: 'Tableta 100 mg; tableta 500 mg (dosis analgésica)',
        embarazo: 'Dosis baja (75 - 150 mg en la noche desde la semana 12-16) para prevenir preeclampsia en mujeres de riesgo; evitar dosis analgésicas, sobre todo en el 3er trimestre',
        interacciones: ['Anticoagulantes y otros antiagregantes (sangrado)', 'Ibuprofeno (bloquea el efecto antiagregante)', 'Metotrexato y corticoides'],
        descripcion: 'Antiagregante plaquetario de primera línea.',
        altoRiesgo: false, verificado: false
    },
    {
        name: 'Enoxaparina', group: 'Cardiovascular',
        adult: 'Profilaxis: 40 mg SC c/24h (30 mg c/12h en trauma u ortopedia según protocolo). Tratamiento TVP/TEP: 1 mg/kg SC c/12h o 1.5 mg/kg c/24h. SCA: 1 mg/kg c/12h',
        ped: 'Tratamiento: 1 mg/kg SC c/12h (lactantes < 2 meses: 1.5 mg/kg c/12h). Profilaxis: 0.5 mg/kg c/12h. Ajustar por anti-Xa (por especialista)',
        renal: 'eTFG < 30: profilaxis 30 mg c/24h; tratamiento 1 mg/kg c/24h. Vigilar anti-Xa en falla renal, obesidad y embarazo',
        warning: 'ALTO RIESGO: sangrado, trombocitopenia inducida por heparina y hematoma espinal (precaución con anestesia neuroaxial). Verificar la dosis por peso; en jeringa prellenada para profilaxis no se expulsa la burbuja de aire',
        indicaciones: ['Profilaxis de tromboembolismo venoso', 'Tratamiento de TVP y TEP', 'Síndrome coronario agudo', 'Anticoagulación en embarazo'],
        presentacion: 'Jeringa prellenada 20, 40, 60, 80 y 100 mg',
        embarazo: 'Anticoagulante de elección en el embarazo (no atraviesa la placenta)',
        interacciones: ['Antiagregantes, AINE y otros anticoagulantes (sangrado)', 'IECA y otros fármacos que elevan el potasio (hiperpotasemia)', 'Trombolíticos (sangrado)'],
        descripcion: 'Heparina de bajo peso molecular de uso ambulatorio y hospitalario.',
        altoRiesgo: true, verificado: false
    },
    {
        name: 'Heparina no fraccionada', group: 'Cardiovascular',
        adult: 'TVP/TEP: bolo 80 UI/kg IV, luego 18 UI/kg/h; ajustar por TTPa (1.5 - 2.5 veces el control). SCA: bolo 60 UI/kg (máx 4000 UI), luego 12 UI/kg/h (máx 1000 UI/h). Profilaxis: 5000 UI SC c/8-12h',
        ped: 'Bolo 75 UI/kg IV, luego 20 UI/kg/h (28 UI/kg/h en < 1 año), ajustando por anti-Xa o TTPa (por especialista)',
        renal: 'Sin ajuste; opción preferida en falla renal grave (eTFG < 30)',
        warning: 'ALTO RIESGO: sangrado y trombocitopenia inducida por heparina (controlar plaquetas). Verificar la concentración y la velocidad de la bomba. Antídoto: sulfato de protamina 1 mg por cada 100 UI de heparina activa (máx 50 mg)',
        indicaciones: ['TVP y TEP', 'Síndrome coronario agudo', 'Profilaxis de tromboembolismo', 'Circuitos extracorpóreos'],
        presentacion: 'Vial 5000 UI/mL (5 mL = 25.000 UI)',
        embarazo: 'Seguro (no atraviesa la placenta)',
        interacciones: ['Antiagregantes, AINE y trombolíticos (sangrado)', 'Nitroglicerina IV (puede reducir su efecto)', 'Otros anticoagulantes'],
        descripcion: 'Anticoagulante parenteral de acción inmediata y reversible.',
        altoRiesgo: true, verificado: false
    }
];

const vademecumTanda3 = [
    {
        name: 'Labetalol', group: 'Cardiovascular',
        adult: 'Hipertensión grave en embarazo y posparto (≥ 160/110 sostenida): 20 mg IV en 2 min; si no hay respuesta a los 10 min, 40 mg; luego 80 mg a los 10 min (máx 300 mg acumulados). Otras indicaciones no verificadas en este lote',
        ped: 'Uso pediátrico no verificado',
        renal: 'Verificar en fuente',
        warning: 'Contraindicado en asma, bradicardia, bloqueo AV de 2º-3er grado e insuficiencia cardíaca descompensada. Monitorea PA y FC; vigila bradicardia neonatal si se usa cerca del parto.',
        indicaciones: ['Hipertensión grave del embarazo y el posparto'],
        presentacion: 'Ampolla 100 mg / 20 mL (5 mg/mL): verificar en el listado local',
        embarazo: 'Uno de los antihipertensivos de primera línea en el embarazo',
        interacciones: ['Otros betabloqueadores y bloqueadores de calcio no dihidropiridínicos (bradicardia, bloqueo AV)', 'Insulina e hipoglucemiantes (enmascara la hipoglucemia)'],
        descripcion: 'Bloqueador alfa y beta adrenérgico de acción rápida por vía IV; primera línea en la urgencia hipertensiva del embarazo.',
        altoRiesgo: false, verificado: true, revisado: '1 nov 2026',
        fuente: { t: 'ACOG Committee Opinion 767 · hipertensión grave de inicio agudo en el embarazo', url: 'https://opqic.org/?p=8745' },
        alcance: 'Esquema de hipertensión grave en embarazo y posparto.'
    },
    {
        name: 'Hidralazina', group: 'Cardiovascular',
        adult: 'Hipertensión grave en embarazo y posparto: 5 - 10 mg IV en 2 min; si no hay respuesta a los 20 min, 10 mg IV; si persiste, cambia a labetalol',
        ped: 'Uso pediátrico no verificado',
        renal: 'Verificar en fuente',
        warning: 'Puede causar hipotensión, taquicardia refleja y cefalea. Evita la caída brusca de la PA en la gestante (hipoperfusión uteroplacentaria).',
        indicaciones: ['Hipertensión grave del embarazo y el posparto'],
        presentacion: 'Ampolla 20 mg: verificar en el listado local',
        embarazo: 'Alternativa aceptada en hipertensión grave del embarazo',
        interacciones: ['Otros antihipertensivos (hipotensión aditiva)'],
        descripcion: 'Vasodilatador arterial directo; segunda línea en la urgencia hipertensiva del embarazo.',
        altoRiesgo: false, verificado: true, revisado: '1 nov 2026',
        fuente: { t: 'ACOG Committee Opinion 767 · hipertensión grave de inicio agudo en el embarazo', url: 'https://opqic.org/?p=8745' },
        alcance: 'Esquema de hipertensión grave en embarazo y posparto.'
    },
    {
        name: 'Nifedipino', group: 'Cardiovascular',
        adult: 'Hipertensión grave en embarazo y posparto: nifedipino de liberación inmediata 10 mg VO; si persiste a los 20 min, 20 mg; luego 20 mg a los 20 min si continúa',
        ped: 'Uso pediátrico no verificado',
        renal: 'Verificar en fuente',
        warning: 'En esta indicación usa solo liberación inmediata; evita la vía sublingual. Con sulfato de magnesio puede potenciar la hipotensión y la debilidad neuromuscular: monitorea. Cefalea, rubor y taquicardia refleja.',
        indicaciones: ['Hipertensión grave del embarazo y el posparto'],
        presentacion: 'Cápsula o tableta 10 mg (liberación inmediata); tableta de liberación prolongada 30 mg: verificar en el listado local',
        embarazo: 'Primera línea en la hipertensión grave del embarazo',
        interacciones: ['Sulfato de magnesio (hipotensión y debilidad neuromuscular)', 'Otros antihipertensivos'],
        descripcion: 'Bloqueador de canales de calcio dihidropiridínico; esquema oral de acción rápida en la urgencia hipertensiva del embarazo.',
        altoRiesgo: false, verificado: true, revisado: '1 nov 2026',
        fuente: { t: 'ACOG Committee Opinion 767 · hipertensión grave de inicio agudo en el embarazo', url: 'https://opqic.org/?p=8745' },
        alcance: 'Esquema de hipertensión grave en embarazo y posparto.'
    },
    {
        name: 'Ácido tranexámico', group: 'Urgencias / Reanimación',
        adult: 'Hemorragia posparto: 1 g IV en 10 min, dentro de las primeras 3 horas tras el parto; segunda dosis de 1 g si el sangrado continúa tras 30 min o reinicia en las siguientes 24 h. Otras indicaciones no incluidas en este lote',
        ped: 'No verificado',
        renal: 'Verificar en fuente (se elimina por vía renal)',
        warning: 'Riesgo trombótico: evita en tromboembolismo activo. La infusión rápida puede causar hipotensión. No sustituye a los uterotónicos ni al control quirúrgico del sangrado.',
        indicaciones: ['Hemorragia posparto'],
        presentacion: 'Ampolla 500 mg / 5 mL: verificar en el listado local',
        embarazo: 'Indicado en la hemorragia posparto',
        interacciones: ['Anticoagulantes y anticonceptivos hormonales (riesgo trombótico aditivo)'],
        descripcion: 'Antifibrinolítico; añadido al tratamiento estándar reduce la muerte por sangrado en la hemorragia posparto.',
        altoRiesgo: false, verificado: true, revisado: '1 nov 2026',
        fuente: { t: 'OMS 2017 · ácido tranexámico en la hemorragia posparto', url: 'https://www.rhsupplies.org/activities-resources/publications/updated-who-recommendation-on-tranexamic-acid-for-the-treatment-of-postpartum-haemorrhage-highlights-and-key-messages-from-the-world-health-organizations-2017-global-recommendation-8842/' },
        alcance: 'Dosis y tiempo en hemorragia posparto.'
    },
    {
        name: 'Glucagón', group: 'Endocrino / Metabolismo',
        adult: '1 mg IM, SC o IV; repetible una vez a los 15 min si no hay respuesta. Intranasal: 3 mg',
        ped: '< 20 kg: 0.5 mg; ≥ 20 kg: 1 mg IM / SC / IV (algunas presentaciones usan el corte de 25 kg). Sin peso: 0.5 mg si < 6 años; 1 mg si ≥ 6 años. Intranasal ≥ 4 años: 3 mg. Repetible una vez a los 15 min',
        renal: 'Sin ajuste habitual',
        warning: 'Actúa liberando glucógeno hepático: puede fallar en ayuno prolongado, desnutrición, cirrosis o hipoglucemia por alcohol (usa glucosa IV). Tras recuperar la conciencia, da carbohidratos orales o IV para evitar la recurrencia. Náuseas y vómito frecuentes. Si no responde: glucosa IV.',
        indicaciones: ['Hipoglucemia grave sin acceso IV'],
        presentacion: 'Kit de 1 mg (liofilizado + diluyente): verificar en el listado local',
        embarazo: 'Aceptable cuando es necesario',
        interacciones: ['Anticoagulantes orales como la warfarina (puede potenciar el efecto)', 'Betabloqueadores (respuesta variable)'],
        descripcion: 'Hormona que moviliza el glucógeno hepático; tratamiento de la hipoglucemia grave cuando no hay vía IV.',
        altoRiesgo: false, verificado: true, revisado: '1 nov 2026',
        fuente: { t: 'Monografía de glucagón (AHFS / Drugs.com) y ADA Standards of Care', url: 'https://www.drugs.com/ppa/glucagon.html' },
        alcance: 'Dosis de hipoglucemia grave (adulto y pediátrica).'
    },
    {
        name: 'Oxitocina', group: 'Urgencias / Reanimación',
        adult: 'Profilaxis del alumbramiento: 10 UI IM. Hemorragia posparto: 10 UI IM o IV lenta; mantenimiento en infusión según el protocolo local',
        ped: 'No aplica',
        renal: 'Sin ajuste',
        warning: 'No administrar en bolo IV rápido sin diluir (hipotensión y taquicardia graves). Riesgo de intoxicación hídrica con infusiones prolongadas de gran volumen.',
        indicaciones: ['Prevención y tratamiento de la hemorragia posparto'],
        presentacion: 'Ampolla 10 UI / mL: verificar en el listado local',
        embarazo: 'Indicada en el alumbramiento y el posparto',
        interacciones: ['Prostaglandinas (efecto uterotónico aditivo)', 'Vasopresores (hipertensión)'],
        descripcion: 'Uterotónico de primera línea en la prevención y el tratamiento de la hemorragia posparto.',
        altoRiesgo: true, verificado: false,
        nota: 'Dosis en revisión: falta contrastarlas con el texto completo de la OMS 2017 y la guía colombiana de hemorragia obstétrica.'
    },
    {
        name: 'Misoprostol', group: 'Urgencias / Reanimación',
        adult: 'Hemorragia posparto cuando no hay oxitocina o no responde: 800 mcg sublinguales, dosis única',
        ped: 'No aplica',
        renal: 'Verificar en fuente',
        warning: 'Fiebre, escalofríos y diarrea frecuentes. No es de primera elección si hay oxitocina disponible.',
        indicaciones: ['Hemorragia posparto por atonía (alternativa)'],
        presentacion: 'Tableta 200 mcg: verificar en el listado local',
        embarazo: 'Indicado en el posparto; contraindicado como abortivo sin criterio obstétrico',
        interacciones: ['Antiácidos con magnesio (más diarrea)'],
        descripcion: 'Análogo de prostaglandina E1 con efecto uterotónico; alternativa cuando no hay oxitocina.',
        altoRiesgo: false, verificado: false,
        nota: 'Dosis en revisión: falta contrastarla con el texto completo de la OMS 2017 y la guía colombiana.'
    }
];

const vademecumTanda4 = [
    {
        name: 'Pralidoxima', group: 'Urgencias / Reanimación',
        adult: 'Intoxicación por organofosforados: 30 mg/kg IV (habitual 2 g) en 20 - 30 min y luego infusión de 8 mg/kg/h (habitual 500 mg/h)',
        ped: '25 - 50 mg/kg IV en 20 - 30 min y luego 10 - 20 mg/kg/h',
        renal: 'Se elimina por vía renal: reduce la dosis en falla renal (no verificado)',
        warning: 'Debe darse junto con atropina, nunca en lugar de ella. Su beneficio clínico es discutido y es menor en carbamatos. La infusión rápida puede causar hipotensión, laringoespasmo y debilidad muscular. Disponibilidad limitada: consulta a toxicología.',
        indicaciones: ['Intoxicación por organofosforados'],
        presentacion: 'Disponibilidad limitada en Colombia: verificar en el listado local',
        embarazo: 'Usar si es necesario',
        interacciones: ['Atropina (se usan juntas)', 'Barbitúricos (potenciación)'],
        descripcion: 'Reactivador de la acetilcolinesterasa; se usa como adyuvante de la atropina en organofosforados.',
        altoRiesgo: true, verificado: true, revisado: '1 nov 2026',
        fuente: { t: 'LITFL · intoxicación por organofosforados y OpenAnesthesia', url: 'https://litfl.com/ccc/organophosphate-poisoning' },
        alcance: 'Dosis de carga e infusión (adulto y pediátrica). El beneficio clínico es discutido.'
    },
    {
        name: 'Tenecteplasa', group: 'Cardiovascular',
        adult: 'IAMCEST: dosis única IV en bolo (5-10 s) según el peso: < 60 kg 30 mg; 60-69 kg 35 mg; 70-79 kg 40 mg; 80-89 kg 45 mg; ≥ 90 kg 50 mg',
        ped: 'No aplica',
        renal: 'Verificar en fuente',
        warning: 'ALTO RIESGO: sangrado (incluida la hemorragia intracraneal) y arritmias de reperfusión. Revisa SIEMPRE las contraindicaciones antes de administrarla. Debe darse con aspirina y anticoagulación, y el paciente debe trasladarse después a un centro con ICP.',
        indicaciones: ['IAMCEST cuando la ICP no está disponible en 120 minutos'],
        presentacion: 'Vial según la presentación del producto: verificar en el listado local',
        embarazo: 'Evitar salvo riesgo vital',
        interacciones: ['Anticoagulantes y antiagregantes (sangrado)'],
        descripcion: 'Fibrinolítico de acción prolongada en bolo único, dosificado por peso.',
        altoRiesgo: true, verificado: false,
        nota: 'La tabla por peso viene de la ficha técnica habitual, pero falta contrastarla con la ficha del producto que uses.'
    }
];

const semiologiaData = [
            { id: 'dolor_toracico', title: '1. Dolor Torácico Agudo', desc: 'Descarte urgente de IAM, Síndrome Aórtico Agudo, TEP y Neumotórax a Tensión.', alicia: 'Aparición súbita o progresiva. Opresivo retroesternal con irradiación a cuello, mandíbula o brazo izquierdo.', redFlags: 'Hipotensión, síncope, diaforesis profusa, disnea severa en reposo.', calcId: 'pam', calcLabel: 'Calcular PAM / Urgencias', cat: 'cardio' },
            { id: 'disnea', title: '2. Disnea Aguda', desc: 'Evaluación de falla cardíaca descompensada, crisis asmática, EPOC exacerbado y SDRA.', alicia: 'Tiempo de instauración, ortopnea, disnea paroxística nocturna (DPN), tos asociada.', redFlags: 'Uso de músculos accesorios, respiración paradoxal, cianosis, SatO₂ < 88%.', calcId: 'curb65', calcLabel: 'Escala CURB-65 / qSOFA', cat: 'cardio' },
            { id: 'cefalea', title: '3. Cefalea Aguda (En Estallido)', desc: 'Descarte de Hemorragia Subaracnoidea (HSA), meningitis aguda y crisis hipertensiva.', alicia: 'Cefalea trueno (peor de la vida), inicio hiperagudo en segundos.', redFlags: 'Fiebre, rigidez de nuca, déficit focal neurológico, alteración del sensorio.', calcId: 'glasgow', calcLabel: 'Escala de Glasgow (GCS)', cat: 'neuro' },
            { id: 'dolor_abdominal', title: '4. Dolor Abdominal Agudo', desc: 'Descarte de abdomen agudo quirúrgico (apendicitis, colecistitis, perforación, isquemia).', alicia: 'Cronología de Kocher (migración a FID), carácter cólico vs. continuo.', redFlags: 'Defensa muscular involuntaria, signo de Blumberg positivo, fiebre alta, shock.', calcId: 'alvarado', calcLabel: 'Escala de Alvarado', cat: 'gastro' },
            { id: 'sindrome_febril', title: '5. Síndrome Febril Agudo', desc: 'Enfoque de fiebre de origen desconocido o infeccioso en urgencias.', alicia: 'Duración, curva térmica (picos, remitente), escalofríos y síntomas asociados.', redFlags: 'Petequias, rigidez nucal, hipotensión, alteración del estado mental, taquicardia.', calcId: 'qsofa', calcLabel: 'Criterios qSOFA / Sepsis', cat: 'infecto' },
            { id: 'mareo_vertigo', title: '6. Mareo & Vértigo Agudo', desc: 'Diferenciación entre vértigo periférico (VPPB, Neuronitis) y central (ACV posterior).', alicia: 'Sensación de giro de objetos, duración de las crisis, factores desencadenantes (movimiento cefálico).', redFlags: 'Nistagmo vertical o direccional puro, ataxia troncal severa, signos focales.', calcId: 'glasgow', calcLabel: 'Evaluación Neurológica GCS', cat: 'neuro' },
            { id: 'palpitaciones', title: '7. Palpitaciones & Arritmias', desc: 'Enfoque de taquicardias, bradicardias y palpitaciones irregulares (FA).', alicia: 'Inicio y cese súbito (paroxístico), frecuencia estimada, síntomas asociados (mareo, disnea).', redFlags: 'Dolor torácico asociado, síncope, hipotensión, insuficiencia cardíaca aguda.', calcId: 'chads', calcLabel: 'Score CHA₂DS₂-VASc', cat: 'cardio' },
            { id: 'edema', title: '8. Edema Generalizado / Extremidades', desc: 'Enfoque de falla cardíaca, síndrome nefrótico, cirrosis hepática y TVP.', alicia: 'Simetría, signo de fóvea (godet), evolución matutina vs. vespertina.', redFlags: 'Disnea de rápida instauración, dolor unilateral en pantorrilla con signos inflamatorios.', calcId: 'wellstvp', calcLabel: 'Escala de Wells para TVP', cat: 'cardio' },
            { id: 'ictericia', title: '9. Ictericia & Coluria', desc: 'Diferenciación entre patología hepática (hepatitis), obstructiva (colangitis) y hemolítica.', alicia: 'Aparición progresiva, coloración de piel/escleras, presencia de acolia y coluria.', redFlags: 'Tríada de Charcot o Péntada de Reynolds (fiebre, ictericia, dolor HCD, shock).', calcId: 'childpugh', calcLabel: 'Escala de Child-Pugh', cat: 'gastro' },
            { id: 'diarrea_aguda', title: '10. Diarrea Aguda Infecciosa', desc: 'Manejo de diarrea acuosa vs. disentérica (invasiva) y deshidratación.', alicia: 'Frecuencia de deposiciones, presencia de moco/sangre, tenesmo, fiebre.', redFlags: 'Signos de deshidratación severa, fiebre persistente, sangre visible (disentería).', calcId: null, calcLabel: null, cat: 'gastro' },
            { id: 'nauseas_vomito', title: '11. Náuseas y Vómitos', desc: 'Enfoque de obstrucción intestinal, gastroenteritis, patología biliar o endocrina.', alicia: 'Contenido alimentario, biliar o fecaloide; relación con la ingesta.', redFlags: 'Hematemesis, vómito incoercible, abdomen en tabla, signos de deshidratación.', calcId: null, calcLabel: null, cat: 'gastro' },
            { id: 'hemorragia_digestiva', title: '12. Hemorragia Digestiva (HDA / HDB)', desc: 'Evaluación de sangrado tubo digestivo alto (hematemesis/melena) o bajo (rectorragia).', alicia: 'Volumen estimado del sangrado, presencia de melena o hematoquecia.', redFlags: 'Hipotensión ortostática, taquicardia sostenida, alteración del estado mental, shock.', calcId: null, calcLabel: null, cat: 'gastro' },
            { id: 'astenia_adinamia', title: '13. Astenia, Adinamia y Pérdida de Peso', desc: 'Enfoque sindrómico de anemia, neoplasias ocultas, endocrinopatías o depresión.', alicia: 'Tiempo de evolución, porcentaje de pérdida ponderal no intencional.', redFlags: 'Pérdida de peso >10% en 6 meses, fiebre nocturna, adenopatías generalizadas.', calcId: null, calcLabel: null, cat: 'general' },
            { id: 'oliguria', title: '14. Oliguria & Falla Renal Aguda', desc: 'Disminución del gasto urinario (< 0.5 mL/kg/h) prerrenal, renal o postrenal.', alicia: 'Momento de inicio, síntomas urinarios obstructivos o antecedente de nefrotóxicos.', redFlags: 'Anuria total, hiperpotasemia severa, sobrecarga hídrica con edema pulmonar.', calcId: 'tfg', calcLabel: 'Calculadora eTFG (CKD-EPI)', cat: 'renal' },
            { id: 'poliuria_polidipsia', title: '15. Poliuria y Polidipsia', desc: 'Descarte de Diabetes Mellitus descompensada y Diabetes Insípida.', alicia: 'Volumen urinario en 24 horas, inicio de la sed insaciable.', redFlags: 'Cetonuria, alteración del estado de conciencia, hiperosmolaridad.', calcId: 'osmolaridad', calcLabel: 'Osmolaridad Efectiva & Sodio', cat: 'renal' },
            { id: 'sincope', title: '16. Síncope & Lipotimia', desc: 'Pérdida transitoria de conciencia de origen vasovagal, cardiogénico u ortostático.', alicia: 'Pródromos (sudoración, visión borrosa), contexto de aparición (esfuerzo, reposo).', redFlags: 'Síncope durante el esfuerzo físico, palpitaciones previas, historia familiar de muerte súbita.', calcId: 'pam', calcLabel: 'Presión Arterial Media (PAM)', cat: 'cardio' },
            { id: 'alteracion_conciencia', title: '17. Alteración Aguda del Estado Mental', desc: 'Enfoque de delirium, encefalopatía metabólica, tóxica o ACV.', alicia: 'Instauración aguda vs. crónica, fluctuación del sensorio.', redFlags: 'Coma profundo (Glasgow ≤ 8), rigidez nucal, fiebre, focalización.', calcId: 'glasgow', calcLabel: 'Escala de Coma de Glasgow', cat: 'neuro' },
            { id: 'convulsiones', title: '18. Crisis Convulsivas & Status Epiléptico', desc: 'Manejo de crisis tónico-clónicas generalizadas, focales o estado epiléptico.', alicia: 'Duración del episodio, fase post-ictal, antecedentes de epilepsia.', redFlags: 'Status epiléptico (>5 min), fiebre alta asociada, trauma craneoencefálico.', calcId: 'glasgow', calcLabel: 'Escala de Coma de Glasgow', cat: 'neuro' },
            { id: 'tos_cronica', title: '19. Tos Crónica & Expectoración', desc: 'Enfoque de bronquitis crónica, asma, goteo postnasal, ERGE o tuberculosis.', alicia: 'Tiempo de evolución (>8 semanas), característica seca vs. productiva (hemoptoica).', redFlags: 'Hemoptisis franca, pérdida de peso, disnea progresiva, sudoración nocturna.', calcId: 'tabaquismo', calcLabel: 'Índice de Tabaquismo', cat: 'respiratorio' },
            { id: 'ansiedad_agitacion', title: '20. Ansiedad Aguda & Agitación Psicomotriz', desc: 'Manejo de crisis de pánico, abstinencia o agitación en urgencias.', alicia: 'Desencadenantes psicosociales o tóxicos, sensación de muerte inminente.', redFlags: 'Agresividad extrema, riesgo para sí mismo o terceros, intoxicación por sustancias.', calcId: null, calcLabel: null, cat: 'psiq' },
            { id: 'artritis_monoartritis', title: '21. Artritis & Monoartritis Aguda', desc: 'Descarte urgente de artritis séptica, gota aguda, pseudogota o patología inflamatoria.', alicia: 'Inicio súbito, articulación afectada (monoartritis vs poliartritis), rubor, calor, impotencia funcional.', redFlags: 'Fiebre alta asociada, escalofríos, derrame articular tenso, eritema extendido.', calcId: null, calcLabel: null, cat: 'msk' },
            { id: 'linfadenopatia', title: '22. Linfadenopatías Generalizadas / Localizadas', desc: 'Estudio de adenopatías reactivas, infecciosas o neoplásicas (linfomas, metástasis).', alicia: 'Tiempo de evolución, consistencia (duras, pétreas, elásticas), dolorosas vs indoloras, movilidad.', redFlags: 'Adenopatías > 2-3 cm, fijas a planos profundos, supraclaviculares, asociadas a fiebre y sudoración nocturna.', calcId: null, calcLabel: null, cat: 'general' },
            { id: 'rash_exantema', title: '23. Exantemas & Erupciones Cutáneas Agudas', desc: 'Evaluación de patologías exantemáticas virales, bacterianas o reacciones de hipersensibilidad severas.', alicia: 'Distribución corporal, morfología (maculopapular, vesiculoso, purpúrico), prurito o dolor.', redFlags: 'Purpura palpable, signo de Nikolsky positivo, compromiso de mucosas, ampollas extensas, fiebre alta y shock.', calcId: null, calcLabel: null, cat: 'infecto' },
            { id: 'hemoptisis', title: '24. Hemoptisis', desc: 'Descarte de TEP, neumonía necrotizante, bronquiectasias infectadas o carcinoma broncopulmonar.', alicia: 'Cantidad estimada de sangre expectorada, aspecto (espumosa, rutilante mezclada con moco).', redFlags: 'Hemoptisis masiva (>200-500 mL/24h), compromiso hemodinámico, insuficiencia respiratoria aguda.', calcId: null, calcLabel: null, cat: 'respiratorio' },
            { id: 'astenia_post_infecciosa', title: '25. Síndrome de Fatiga Post-Infecciosa', desc: 'Astenia crónica y mialgias persistentes tras infecciones virales o bacterianas.', alicia: 'Duración de la fatiga incapacitante, relación con el esfuerzo físico o mental.', redFlags: 'Pérdida de peso significativa, adenopatías persistentes, fiebre de origen desconocido.', calcId: null, calcLabel: null, cat: 'general' },
            { id: 'prurito_generalizado', title: '26. Prurito Generalizado (Prurito sine materia)', desc: 'Descarte de colestasis hepática, insuficiencia renal crónica, linfomas o patología dermatológica.', alicia: 'Intensidad, predominio nocturno, presencia de lesiones de rascado (excoriaciones).', redFlags: 'Ictericia asociada, pérdida de peso, hepatoesplenomegalia.', calcId: null, calcLabel: null, cat: 'gastro' },
            { id: 'trastornos_marcha', title: '27. Trastornos Agudos de la Marcha & Ataxia', desc: 'Enfoque de patología cerebelosa, vestibular, neuropática central o intoxicaciones.', alicia: 'Forma de instauración, tipo de marcha (festinante, atáxica, en estepaje, parética).', redFlags: 'Déficit neurológico focal agudo, alteración de conciencia, signos meníngeos.', calcId: 'glasgow', calcLabel: 'Escala de Coma de Glasgow', cat: 'neuro' },
            { id: 'dolor_cervical', title: '28. Cervicalgia Aguda & Radiculopatía', desc: 'Evaluación de patología discal cervical, compresión radicular o contractura muscular severa.', alicia: 'Irradiación hacia miembro superior (dermatomas), factores desencadenantes (trauma, postura).', redFlags: 'Déficit motor progresivo, alteración esfinteriana (mielopatía), fiebre y antecedentes de trauma.', calcId: null, calcLabel: null, cat: 'msk' },
            { id: 'lumbalgia', title: '29. Lumbalgia Aguda & Síndrome de Cola de Caballo', desc: 'Descarte de compresión radicular severa, hernia discal, infección o fractura vertebral.', alicia: 'Irradiación ciática (lumboischialgia), dolor mecánico vs inflamatorio (peor en reposo).', redFlags: 'Anestesia en silla de montar, incontinencia urinaria/fecal aguda (cola de caballo), fiebre, pérdida de peso.', calcId: null, calcLabel: null, cat: 'msk' },
            { id: 'impotencia_funcional_extremidad', title: '30. Dolor & Impotencia Funcional en Extremidades', desc: 'Descarte de fracturas óseas agudas, luxaciones, desgarros tendinosos o síndrome compartimental.', alicia: 'Mecanismo de trauma (alto vs bajo impacto), deformidad anatómica visible.', redFlags: 'Ausencia de pulsos distales, palidez, parestesias, dolor desproporcionado (síndrome compartimental).', calcId: null, calcLabel: null, cat: 'msk' },
            { id: 'disfagia', title: '31. Disfagia Aguda / Progresiva (Dificultad para Deglutir)', desc: 'Diferenciación entre disfagia mecánica (tumor, estenosis) y neuromuscular (ACV, trastornos motores).', alicia: 'Dificultad para sólidos vs líquidos, tiempo de evolución, odinofagia asociada.', redFlags: 'Imposibilidad absoluta para deglutir saliva, sialorrea, estridor, sospecha de cuerpo extraño.', calcId: null, calcLabel: null, cat: 'gastro' },
            { id: 'odinofagia', title: '32. Odinofagia & Faringitis Aguda', desc: 'Enfoque de amigdalitis bacteriana (Estreptococo), absceso periglosino o epiglotitis.', alicia: 'Dolor intenso al tragar, irradiación a oídos (otalgia refleja), voz engolada.', redFlags: 'Trismus, sialorrea, dificultad respiratoria, desviación de la úvula (absceso).', calcId: null, calcLabel: null, cat: 'gastro' },
            { id: 'otagia_otalgia_refleja', title: '33. Otalgia Aguda', desc: 'Diferenciación entre patología ótica primaria (otitis media/externa) y dolor referido.', alicia: 'Intensidad del dolor, otorrea, hipoacusia asociada, manipulación del pabellón auricular.', redFlags: 'Otorragia post-traumática, parálisis facial periférica asociada, fiebre alta y mastoides dolorosa.', calcId: null, calcLabel: null, cat: 'general' },
            { id: 'epistaxis', title: '34. Epistaxis Aguda', desc: 'Manejo de sangrado nasal anterior (Plexo de Kiesselbach) vs posterior.', alicia: 'Lateralidad (unilateral vs bilateral), cantidad estimada, facilidad para ceder con compresión.', redFlags: 'Epistaxis posterior incoercible, inestabilidad hemodinámica, anemia aguda.', calcId: 'pam', calcLabel: 'Presión Arterial Media (PAM)', cat: 'orl' },
            { id: 'conjuntivitis_ojo_rojo', title: '35. Síndrome de "Ojo Rojo" Agudo', desc: 'Descarte de glaucoma agudo de ángulo cerrado, queratitis, uveítis o conjuntivitis.', alicia: 'Dolor ocular intenso (glaucoma), alteración de la visión, secreción purulata vs acuosa.', redFlags: 'Pérdida visual aguda, pupila media fija no reactiva, córnea turbia, dolor con fotofobia severa.', calcId: null, calcLabel: null, cat: 'oftalmo' },
            { id: 'acufenos_tinnitus', title: '36. Acúfenos / Tinnitus Pulsátil & No Pulsátil', desc: 'Evaluación de patología coclear, enfermedad de Menière, HIC idiopática o malformaciones vasculares.', alicia: 'Tipo de sonido (pulsátil sincronizado con el pulso vs zumbido continuo), unilateralidad.', redFlags: 'Tinnitus pulsátil asociado a soplos carotídeos o cefalea persistente.', calcId: null, calcLabel: null, cat: 'orl' },
            { id: 'compromiso_multiorganico_shock', title: '37. Signos Tempranos de Shock (Hipotensión / Hipoperfusión)', desc: 'Identificación y soporte inicial en shock séptico, hipovolémico, cardiogénico o distributivo.', alicia: 'Estado de conciencia, tiempo de llenado capilar (>2 segundos), frialdad distal, diuresis.', redFlags: 'Presión arterial sistólica <90 mmHg o PAM <65 mmHg refractaria a fluidos iniciales.', calcId: 'qsofa', calcLabel: 'Criterios qSOFA / Sepsis', cat: 'urgencias' },
            { id: 'letargia_somnolencia', title: '38. Letargia, Somnolencia & Estupor', desc: 'Evaluación de depresión del sistema nervioso central por tóxicos, metabólicos o estructurales.', alicia: 'Grado de respuesta a estímulos verbales y dolorosos, evolución progresiva.', redFlags: 'Glasgow ≤ 8, pérdida de reflejos protectores de vía aérea, anisocoria.', calcId: 'glasgow', calcLabel: 'Escala de Coma de Glasgow', cat: 'neuro' },
            { id: 'tremor_movimientos_anormales', title: '39. Temblor & Movimientos Anormales Agudos', desc: 'Enfoque de temblor esencial, parkinsonismo agudo inducido por fármacos, crisis mioclónicas.', alicia: 'Temblor de reposo vs acción, simetría, medicamentos recientes administrados (neurolépticos).', redFlags: 'Rigidez en rueda dentada severa con hipertermia (síndrome neuroléptico maligno).', calcId: null, calcLabel: null, cat: 'neuro' },
            { id: 'distension_abdominal', title: '40. Distensión Abdominal Aguda / Meteorismo', desc: 'Descarte de íleo paralítico, obstrucción intestinal mecánica, ascitis masiva o peritonitis.', alicia: 'Tensión abdominal, timpanismo generalizado a la percusión, ausencia de ruidos hidroaéreos.', redFlags: 'Dolor abdominal insoportable, vómitos fecaloideos, defensa o rebote positivo.', calcId: null, calcLabel: null, cat: 'gastro' },
            { id: 'proteinuria_hematuria_macroscopica', title: '41. Hematuria Macroscópica & Síndrome Nefrítico', desc: 'Evaluación de sangrado en vía urinaria o patología glomerular aguda (glomerulonefritis postestreptocócica).', alicia: 'Coloración de la orina (roja, color "coca-cola"), presencia de coágulos vermiformes, dolor lumbar.', redFlags: 'Hipertensión arterial severa, edema generalizado, oliguria marcada o falla renal aguda.', calcId: 'tfg', calcLabel: 'Calculadora eTFG (CKD-EPI)', cat: 'renal' },
            { id: 'incontinencia_urinaria_aguda', title: '42. Incontinencia Urinaria Aguda o Retención', desc: 'Enfoque de retención aguda de orina (vejiga distendida y dolorosa) o incontinencia por rebosamiento.', alicia: 'Imposibilidad para miccionar a pesar de deseo intenso, goteo continuo, dolor suprapúbico.', redFlags: 'Balón vesical muy tenso, alteración neurológica asociada (síndrome de cola de caballo).', calcId: null, calcLabel: null, cat: 'renal' },
            { id: 'amenorrea_dolor_pelvico', title: '43. Dolor Pélvico Agudo & Retraso Menstrual en Mujeres', desc: 'Descarte urgente de embarazo ectópico roto, torsión ovárica o enfermedad inflamatoria pélvica.', alicia: 'Fecha de última regla (FUR), localización del dolor anexo-uterino, sangrado transvaginal anormal.', redFlags: 'Signos de irritación peritoneal, inestabilidad hemodinámica, prueba de embarazo positiva con dolor severo.', calcId: null, calcLabel: null, cat: 'gineco' },
            { id: 'escroto_agudo', title: '44. Escroto Agudo', desc: 'Descarte urgente de torsión testicular (emergencia quirúrgica), orquiepididimitis o trauma.', alicia: 'Inicio hiperagudo de dolor testicular intenso, irradiación al flanco, elevación del testículo (Signo de Prehn).', redFlags: 'Ausencia de reflejo cremastérico, testículo horizontalizado y doloroso, evolución > 6 horas (riesgo de necrosis).', calcId: null, calcLabel: null, cat: 'uro' },
            { id: 'astenia_depresiva_inquietud', title: '45. Malestar General Inespecífico (Constitucional)', desc: 'Evaluación inicial de pacientes con síntomas vagos, descompensación general leve o inicio de procesos sistémicos.', alicia: 'Sensación de "enfermarse", decaimiento general sin foco claro.', redFlags: 'Aparición de signos vitales alterados (fiebre, taquicardia, hipotensión) en el transcurso de las horas.', calcId: null, calcLabel: null, cat: 'general' },
            { id: 'delirio_agitado', title: '46. Delirio Agudo / Síndrome Confusional', desc: 'Manejo del paciente confuso, desorientado, alucinatorio (etiología metabólica, tóxica, infecciosa).', alicia: 'Fluctuación del nivel de conciencia, inversión del ciclo sueño-vigilia, alucinaciones visuales.', redFlags: 'Agitación extrema que pone en riesgo la vida del paciente o del personal, signos focales neurológicos.', calcId: 'glasgow', calcLabel: 'Escala de Coma de Glasgow', cat: 'neuro' },
            { id: 'intoxicacion_aguda_toxicos', title: '47. Sospecha de Intoxicación Aguda / Sobredosis', desc: 'Abordaje toxicológico de sustancias farmacológicas, alcoholes o drogas de abuso.', alicia: 'Tiempo transcurrido desde la ingesta/exposición, tipo de tóxico presumible, estado de pupilas (miosis vs midriasis).', redFlags: 'Depresión respiratoria severa (frecuencia respiratoria < 10 rpm), coma, arritmias cardíacas malignas.', calcId: 'glasgow', calcLabel: 'Escala de Coma de Glasgow', cat: 'toxico' },
            { id: 'hipotermia_hipertermia_sistemica', title: '48. Alteración Térmica Sistémica (Fiebre alta vs Hipotermia)', desc: 'Enfoque de golpe de calor, hipertermia maligna o hipotermia accidental severa.', alicia: 'Temperatura corporal central registrada, condiciones ambientales de exposición o consumo de fármacos.', redFlags: 'Temperatura > 40°C con alteración neurológica (golpe de calor) o temperatura < 32°C con bradicardia extrema.', calcId: null, calcLabel: null, cat: 'urgencias' },
            { id: 'linfedema_unilateral', title: '49. Edema Asimétrico de Extremidades (Sospecha TVP / Linfedema)', desc: 'Diferenciación entre trombosis venosa profunda, celulitis o linfedema secundario.', alicia: 'Aparición de aumento de volumen unilateral en miembro inferior, dolor a la palpación de los gastrocnemios.', redFlags: 'Signos de dificultad respiratoria asociada (sospecha de TEP secundario), flegmasia cerulea dolens.', calcId: 'wellstvp', calcLabel: 'Escala de Wells para TVP', cat: 'general' },
            { id: 'reaccion_alergica_anafilaxia', title: '50. Reacción Alérgica Sistémica & Anafilaxia', desc: 'Manejo urgente de reacción de hipersensibilidad inmediata mediada por IgE.', alicia: 'Inicio rápido tras la exposición al alérgeno (alimentos, medicamentos, picaduras), afectación cutánea (urticaria, angioedema).', redFlags: 'Compromiso de vía aérea (edema laríngeo, estridor, sibilancias severas) e hipotensión arterial sistémica.', calcId: 'pam', calcLabel: 'Presión Arterial Media (PAM)', cat: 'urgencias' },
            { id: 'sepsis_choque_septico', title: '51. Sepsis & Choque Séptico', desc: 'Disfunción orgánica por respuesta desregulada a infección. Identificación temprana con qSOFA/SOFA y reanimación dirigida por metas.', alicia: 'Fiebre o hipotermia, taquipnea, taquicardia, alteración del estado mental, hipotensión.', redFlags: 'PAM < 65 mmHg, lactato > 2 mmol/L, oliguria, SatO₂ < 90%, alteración del sensorio.', calcId: 'qsofa', calcLabel: 'Criterios qSOFA / Sepsis', cat: 'urgencias' },
            { id: 'acv_agudo', title: '52. Accidente Cerebrovascular (ACV) Agudo', desc: 'Déficit neurológico focal de instauración súbita. Descarte isquémico vs hemorrágico. Ventana trombolítica ≤ 4.5 h.', alicia: 'Debilidad/parálisis unilateral, disartria, afasia, desviación de la mirada, alteración visual.', redFlags: 'Glasgow ≤ 8, déficit progresivo, cefalea trueno (hemorragia), convulsiones, hipertensión severa.', calcId: 'glasgow', calcLabel: 'Escala de Coma de Glasgow', cat: 'neuro' },
            { id: 'cetoacidosis_diabetica', title: '53. Cetoacidosis Diabética (CAD)', desc: 'Hiperglucemia, cetosis y acidosis metabólica. Tratamiento con insulina IV, líquidos y potasio.', alicia: 'Poliuria, polidipsia, náuseas, vómito, dolor abdominal, respiración de Kussmaul.', redFlags: 'pH < 7.0, bicarbonato < 10, K⁺ < 3.3, alteración del sensorio, shock.', calcId: 'osmolaridad', calcLabel: 'Osmolaridad Efectiva & Sodio', cat: 'endo' },
            { id: 'pancreatitis_aguda', title: '54. Pancreatitis Aguda', desc: 'Inflamación del páncreas. Criterios de Atlanta 2012. Soporte, analgesia y nutrición enteral temprana.', alicia: 'Dolor epigástrico intenso con irradiación a espalda, náuseas, vómito.', redFlags: 'Necrosis pancreática, falla orgánica (respiratoria, renal, cardiovascular), hipocalcemia.', calcId: null, calcLabel: null, cat: 'gastro' },
            { id: 'tep', title: '55. Tromboembolismo Pulmonar (TEP)', desc: 'Obstrucción de arteria pulmonar por émbolo. Estratificación de riesgo (sPESI) y anticoagulación.', alicia: 'Disnea súbita, dolor pleurítico, taquipnea, hemoptisis, síncope.', redFlags: 'Hipotensión, shock, SatO₂ < 90%, signos de sobrecarga VD en ETT.', calcId: 'wellstvp', calcLabel: 'Escala de Wells para TVP', cat: 'cardio' },
            { id: 'sca', title: '56. Síndrome Coronario Agudo (SCA)', desc: 'IAM con o sin elevación del ST y angina inestable. Reperfusión urgente y antiagregación dual.', alicia: 'Dolor torácico opresivo retroesternal con irradiación, diaforesis, náuseas.', redFlags: 'Hipotensión, shock cardiogénico, arritmias malignas, insuficiencia cardíaca aguda.', calcId: 'pam', calcLabel: 'Presión Arterial Media (PAM)', cat: 'cardio' },
            { id: 'dengue_arbovirus', title: '57. Dengue & Arbovirus (Zika, Chikungunya)', desc: 'Fiebre, mialgias, artralgias, rash. Fase crítica con riesgo de choque. Evitar AINE y aspirina.', alicia: 'Fiebre alta, cefalea retroocular, mialgias intensas, rash maculopapular, trombocitopenia.', redFlags: 'Signos de alarma: dolor abdominal, vómito persistente, hepatomegalia, letargia, sangrado mucoso.', calcId: null, calcLabel: null, cat: 'infecto' },
            { id: 'ic_descompensada', title: '58. Insuficiencia Cardíaca Descompensada', desc: 'Edema agudo de pulmón, ortopnea, disnea paroxística nocturna. Diuréticos IV y vasodilatadores.', alicia: 'Disnea progresiva, ortopnea, edema de miembros inferiores, tos con expectoración rosada.', redFlags: 'SatO₂ < 90%, hipotensión, oliguria, confusión, edema pulmonar agudo.', calcId: 'pam', calcLabel: 'Presión Arterial Media (PAM)', cat: 'cardio' },
            { id: 'meningitis_encefalitis', title: '59. Meningitis & Encefalitis Aguda', desc: 'Fiebre, cefalea, rigidez nucal, alteración del sensorio. Antibiótico empírico sin demora.', alicia: 'Fiebre, cefalea intensa, rigidez de nuca, fotofobia, vómito.', redFlags: 'Glasgow ≤ 8, convulsiones, déficit focal, petequias (meningococo), shock.', calcId: 'glasgow', calcLabel: 'Escala de Coma de Glasgow', cat: 'neuro' },
            { id: 'intoxicacion_organofosforados', title: '60. Intoxicación por Organofosforados / Carbamatos', desc: 'Síndrome colinérgico: miosis, salorrea, broncorrea, bradicardia. Atropina + pralidoxima.', alicia: 'Exposición a plaguicidas, miosis, salorrea, lagrimeo, diaforesis, fasciculaciones.', redFlags: 'Broncorrea severa, bradicardia, convulsiones, depresión respiratoria, coma.', calcId: 'glasgow', calcLabel: 'Escala de Coma de Glasgow', cat: 'toxico' },
            { id: 'delirium_tremens', title: '61. Delirium Tremens (Abstinencia Alcohólica)', desc: 'Agitación, confusión, temblor, alucinaciones visuales/táctiles, hiperactividad autonómica. Benzodiazepinas.', alicia: 'Historia de consumo crónico de alcohol, cesación reciente, temblor, ansiedad, insomnio.', redFlags: 'Convulsiones, hipertermia, taquicardia severa, hipertensión, deshidratación.', calcId: 'glasgow', calcLabel: 'Escala de Coma de Glasgow', cat: 'neuro' },
            { id: 'sca_kawasaki', title: '62. Enfermedad de Kawasaki (Pediátrico)', desc: 'Fiebre ≥ 5 días + conjuntivitis, rash, adenopatía cervical, cambios en extremidades, mucositis. IVIG + aspirina.', alicia: 'Fiebre prolongada, rash polimorfo, conjuntivitis bilateral no purulenta, lengua aframbuesada.', redFlags: 'Aneurisma coronario, disfunción ventricular, shock, irritabilidad extrema.', calcId: null, calcLabel: null, cat: 'pediatria' },
            { id: 'sindrome_aplastamiento', title: '63. Síndrome de Aplastamiento (Crush Syndrome)', desc: 'Rabdomiólisis por compresión prolongada. Hiperpotasemia, falla renal, arritmias. Hidratación agresiva.', alicia: 'Compresión prolongada de extremidades, dolor muscular severo, orina oscura.', redFlags: 'Hiperpotasemia, CK > 5000, oliguria, arritmias, falla renal aguda.', calcId: 'tfg', calcLabel: 'Calculadora eTFG (CKD-EPI)', cat: 'trauma' },
            { id: 'rabia_exposicion', title: '64. Exposición a Rabia (Mordedura / Arañazo)', desc: 'Profilaxis post-exposición: lavado, inmunoglobulina antirrábica e inmunización. Urgente.', alicia: 'Mordedura o arañazo por animal potencialmente transmisor (perro, gato, murciélago).', redFlags: 'Exposición en cabeza/cuello, animal no disponible para observación, mordedura profunda.', calcId: null, calcLabel: null, cat: 'infecto' },
            { id: 'bronquiolitis', title: '65. Bronquiolitis (Lactante)', desc: 'Infección viral de vías aéreas inferiores en < 2 años. VRS es el agente más común. Manejo de soporte.', alicia: 'Rinorrea, tos, fiebre baja, dificultad respiratoria progresiva, sibilancias, retracciones.', redFlags: 'SatO₂ < 90%, apnea, cianosis, deshidratación, edad < 3 meses, prematuridad, cardiopatía.', calcId: 'silverman', calcLabel: 'Silverman-Andersen (Dificultad Respiratoria Neonatal)', cat: 'pediatria' },
            { id: 'neumonia_pediatrica', title: '66. Neumonía Pediátrica', desc: 'Infección del parénquima pulmonar en niños. Clasificación por gravedad (OMS). Antibióticos según edad y gravedad.', alicia: 'Fiebre, tos, dificultad respiratoria, taquipnea, retracciones, hipoxemia.', redFlags: 'SatO₂ < 90%, cianosis, incapacidad para beber, convulsiones, letargia, estridor en reposo.', calcId: 'curb65', calcLabel: 'Escala CURB-65 / qSOFA', cat: 'pediatria' },
            { id: 'convulsiones_febriles', title: '67. Convulsiones Febriles', desc: 'Crisis convulsiva asociada a fiebre en niños de 6 meses a 5 años. Generalmente benigna. Descartar causa infecciosa.', alicia: 'Fiebre > 38°C, crisis tónico-clónica generalizada, duración < 15 min, recuperación rápida.', redFlags: 'Duración > 15 min, focalidad, recurrencia en 24 h, edad < 6 meses o > 5 años, déficit neurológico post-ictal.', calcId: 'glasgow', calcLabel: 'Escala de Coma de Glasgow', cat: 'pediatria' },
            { id: 'ictericia_neonatal', title: '68. Ictericia Neonatal', desc: 'Hiperbilirrubinemia en el recién nacido. Fisiológica vs patológica. Fototerapia según nomograma de Bhutani.', alicia: 'Coloración amarilla de piel y escleras, inicio antes/después de 24 h, alimentación, deposiciones.', redFlags: 'Ictericia en < 24 h, bilirrubina > 20 mg/dL, ictericia prolongada > 2 semanas, acolia, hepatomegalia.', calcId: null, calcLabel: null, cat: 'neonato' },
            { id: 'sepsis_neonatal', title: '69. Sepsis Neonatal', desc: 'Infección sistémica en el recién nacido. Precoz (< 72 h) o tardía (≥ 72 h). Antibióticos empíricos sin demora.', alicia: 'Letargia, rechazo del alimento, inestabilidad térmica, apnea, taquipnea, hipotensión.', redFlags: 'Glasgow ≤ 8, apnea, hipotensión, oliguria, convulsiones, sangrado.', calcId: 'glasgow', calcLabel: 'Escala de Coma de Glasgow', cat: 'neonato' },
            { id: 'eda_pediatrica', title: '70. Enfermedad Diarreica Aguda (EDA) Pediátrica', desc: 'Diarrea aguda en niños. Plan A/B/C según deshidratación. Zinc y alimentación continua.', alicia: 'Deposiciones líquidas, vómito, fiebre, sangre en heces, duración.', redFlags: 'Deshidratación severa, sangre en heces, fiebre persistente, vómito incoercible, desnutrición.', calcId: 'liquidos-ped', calcLabel: 'Líquidos basales (Holliday-Segar)', cat: 'pediatria' },
            { id: 'desnutricion_pediatrica', title: '71. Desnutrición Pediátrica', desc: 'Evaluación antropométrica (peso/edad, talla/edad, peso/talla, IMC/edad). Clasificación OMS. Manejo F-75/F-100.', alicia: 'Pérdida de peso, edema, cambios en el cabello y piel, apetito, alimentación.', redFlags: 'Edema bilateral (kwashiorkor), desnutrición severa (SAM), infección, hipoglucemia, hipotermia.', calcId: 'imc', calcLabel: 'IMC & Superficie Corporal', cat: 'pediatria' },
            { id: 'asma_pediatrica', title: '72. Asma Pediátrica', desc: 'Diagnóstico y manejo de asma en niños. Clasificación por control. Plan de acción.', alicia: 'Tos nocturna, sibilancias recurrentes, disnea con ejercicio, despertares nocturnos.', redFlags: 'SatO₂ < 92%, uso de músculos accesorios, habla en palabras, silencio auscultatorio.', calcId: 'centor', calcLabel: 'Criterios de Centor', cat: 'pediatria' },
            { id: 'anemia_ferropenica', title: '73. Anemia Ferropénica Pediátrica', desc: 'Anemia por déficit de hierro. Diagnóstico con hemograma y ferritina. Suplementación con hierro oral.', alicia: 'Palidez, fatiga, irritabilidad, pica (geofagia), anorexia, infecciones recurrentes.', redFlags: 'Hb < 7 g/dL, signos de insuficiencia cardíaca, anemia severa en lactante.', calcId: null, calcLabel: null, cat: 'pediatria' },
            { id: 'parasitosis_intestinal', title: '74. Parasitosis Intestinal Pediátrica', desc: 'Giardia, Ascaris, Trichuris, Ameba. Diagnóstico con coprológico. Tratamiento antiparasitario.', alicia: 'Dolor abdominal, diarrea, distensión, prurito anal, bruxismo, palidez.', redFlags: 'Sangre en heces, deshidratación severa, desnutrición, anemia severa.', calcId: null, calcLabel: null, cat: 'pediatria' },
            { id: 'convulsiones_febriles', title: '75. Convulsiones Febriles', desc: 'Crisis convulsiva asociada a fiebre en niños de 6 meses a 5 años. Generalmente benigna. Descartar causa infecciosa.', alicia: 'Fiebre > 38°C, crisis tónico-clónica generalizada, duración < 15 min, recuperación rápida.', redFlags: 'Duración > 15 min, focalidad, recurrencia en 24 h, edad < 6 meses o > 5 años, déficit neurológico post-ictal.', calcId: 'glasgow', calcLabel: 'Escala de Coma de Glasgow', cat: 'pediatria' },
            { id: 'bronquiolitis', title: '76. Bronquiolitis (Lactante)', desc: 'Infección viral de vías aéreas inferiores en < 2 años. VRS es el agente más común. Manejo de soporte.', alicia: 'Rinorrea, tos, fiebre baja, dificultad respiratoria progresiva, sibilancias, retracciones.', redFlags: 'SatO₂ < 90%, apnea, cianosis, deshidratación, edad < 3 meses, prematuridad, cardiopatía.', calcId: 'silverman', calcLabel: 'Silverman-Andersen (Dificultad Respiratoria Neonatal)', cat: 'pediatria' },
            { id: 'ictericia_neonatal', title: '77. Ictericia Neonatal', desc: 'Hiperbilirrubinemia en el recién nacido. Fisiológica vs patológica. Fototerapia según nomograma de Bhutani.', alicia: 'Coloración amarilla de piel y escleras, inicio antes/después de 24 h, alimentación, deposiciones.', redFlags: 'Ictericia en < 24 h, bilirrubina > 20 mg/dL, ictericia prolongada > 2 semanas, acolia, hepatomegalia.', calcId: null, calcLabel: null, cat: 'neonato' },
            { id: 'sepsis_neonatal', title: '78. Sepsis Neonatal', desc: 'Infección sistémica en el recién nacido. Precoz (< 72 h) o tardía (≥ 72 h). Antibióticos empíricos sin demora.', alicia: 'Letargia, rechazo del alimento, inestabilidad térmica, apnea, taquipnea, hipotensión.', redFlags: 'Glasgow ≤ 8, apnea, hipotensión, oliguria, convulsiones, sangrado.', calcId: 'glasgow', calcLabel: 'Escala de Coma de Glasgow', cat: 'neonato' },
            { id: 'neumonia_pediatrica', title: '79. Neumonía Pediátrica', desc: 'Infección del parénquima pulmonar en niños. Clasificación por gravedad (OMS). Antibióticos según edad y gravedad.', alicia: 'Fiebre, tos, dificultad respiratoria, taquipnea, retracciones, hipoxemia.', redFlags: 'SatO₂ < 90%, cianosis, incapacidad para beber, convulsiones, letargia, estridor en reposo.', calcId: 'curb65', calcLabel: 'Escala CURB-65 / qSOFA', cat: 'pediatria' },
            { id: 'asma_pediatrica', title: '80. Asma Pediátrica', desc: 'Diagnóstico y manejo de asma en niños. Clasificación por control. Plan de acción.', alicia: 'Tos nocturna, sibilancias recurrentes, disnea con ejercicio, despertares nocturnos.', redFlags: 'SatO₂ < 92%, uso de músculos accesorios, habla en palabras, silencio auscultatorio.', calcId: 'centor', calcLabel: 'Criterios de Centor', cat: 'pediatria' },
            { id: 'anemia_ferropenica', title: '81. Anemia Ferropénica Pediátrica', desc: 'Anemia por déficit de hierro. Diagnóstico con hemograma y ferritina. Suplementación con hierro oral.', alicia: 'Palidez, fatiga, irritabilidad, pica (geofagia), anorexia, infecciones recurrentes.', redFlags: 'Hb < 7 g/dL, signos de insuficiencia cardíaca, anemia severa en lactante.', calcId: null, calcLabel: null, cat: 'pediatria' },
            { id: 'eda_pediatrica', title: '82. Enfermedad Diarreica Aguda (EDA) Pediátrica', desc: 'Diarrea aguda en niños. Plan A/B/C según deshidratación. Zinc y alimentación continua.', alicia: 'Deposiciones líquidas, vómito, fiebre, sangre en heces, duración.', redFlags: 'Deshidratación severa, sangre en heces, fiebre persistente, vómito incoercible, desnutrición.', calcId: 'liquidos-ped', calcLabel: 'Líquidos basales (Holliday-Segar)', cat: 'pediatria' },
            { id: 'desnutricion_pediatrica', title: '83. Desnutrición Pediátrica', desc: 'Evaluación antropométrica (peso/edad, talla/edad, peso/talla, IMC/edad). Clasificación OMS. Manejo F-75/F-100.', alicia: 'Pérdida de peso, edema, cambios en el cabello y piel, apetito, alimentación.', redFlags: 'Edema bilateral (kwashiorkor), desnutrición severa (SAM), infección, hipoglucemia, hipotermia.', calcId: 'imc', calcLabel: 'IMC & Superficie Corporal', cat: 'pediatria' },
            { id: 'parasitosis_intestinal', title: '84. Parasitosis Intestinal Pediátrica', desc: 'Giardia, Ascaris, Trichuris, Ameba. Diagnóstico con coprológico. Tratamiento antiparasitario.', alicia: 'Dolor abdominal, diarrea, distensión, prurito anal, bruxismo, palidez.', redFlags: 'Sangre en heces, deshidratación severa, desnutrición, anemia severa.', calcId: null, calcLabel: null, cat: 'pediatria' }



        ];

const perlasData = [
            { text: "En sospecha de Sepsis, la administración oportuna de antibióticos empíricos en la primera hora reduce la mortalidad en forma significativa.", author: "Guías Surviving Sepsis Campaign" },
            { text: "Un Anion Gap elevado en acidosis metabólica obliga a descartar CAD, Acidosis Láctica, Falla Renal o Intoxicaciones (MUDPILES).", author: "Fisiología Ácido-Base" },
            { text: "En FA no valvular, un puntaje CHA₂DS₂-VASc ≥ 2 en hombres o ≥ 3 en mujeres es indicación de anticoagulación oral.", author: "Guías ESC Fibrilación Auricular" },
            { text: "En Neumonía Adquirida en la Comunidad (NAC), un CURB-65 de 0 a 1 punto permite considerar manejo ambulatorio seguro.", author: "Guías BTS / IDSA" }
        ];

const sivigilaDirectory = [
    { code: '210', name: 'Dengue', urgency: 'Semanal', ficha: 'Ficha 210', action: 'Clasifica signos de alarma, hidratación y hemograma; seguimiento diario. Evita AINE.' },
    { code: '220', name: 'Dengue grave', urgency: 'Inmediata', ficha: 'Ficha 220', action: 'Estabilización, líquidos IV guiados por la clínica y remisión urgente.' },
    { code: '580', name: 'Mortalidad por dengue', urgency: 'Inmediata', ficha: 'Ficha 580', action: '' },
    { code: '217', name: 'Chikungunya', urgency: 'Semanal', ficha: 'Ficha 217', action: 'Manejo sintomático; vigila dolor articular persistente y formas graves.' },
    { code: '895', name: 'Zika', urgency: 'Semanal', ficha: 'Ficha 895', action: 'Prioriza a las gestantes (riesgo de microcefalia) y su seguimiento.' },
    { code: '465', name: 'Malaria', urgency: 'Semanal', ficha: 'Ficha 465', action: 'Gota gruesa o prueba rápida antes de tratar; define la especie y descarta complicaciones.' },
    { code: '455', name: 'Leptospirosis', urgency: 'Semanal', ficha: 'Ficha 455', action: 'Sospecha en fiebre + mialgias + exposición a agua o roedores; vigila falla renal y hepática.' },
    { code: '813', name: 'Tuberculosis (todas las formas / farmacorresistente)', urgency: 'Semanal', ficha: 'Ficha 813', action: 'Baciloscopia y cultivo (o prueba molecular), estudio de contactos y notificación a la secretaría.' },
    { code: '850', name: 'VIH / SIDA / mortalidad por SIDA', urgency: 'Semanal', ficha: 'Ficha 850', action: 'Prueba confirmatoria, consejería y derivación para tratamiento antirretroviral.' },
    { code: '750', name: 'Sífilis gestacional', urgency: 'Semanal', ficha: 'Ficha 750', action: 'Penicilina benzatínica, tratamiento de la pareja y seguimiento serológico.' },
    { code: '740', name: 'Sífilis congénita', urgency: 'Semanal', ficha: 'Ficha 740', action: 'Valoración y tratamiento del recién nacido según el antecedente materno.' },
    { code: '875', name: 'Violencias de género e intrafamiliar', urgency: 'Semanal', ficha: 'Ficha 875', action: 'Atención en salud y activación de ruta. En violencia sexual: urgencia médica (profilaxis ITS/VIH y anticoncepción de emergencia).' },
    { code: '356', name: 'Intento de suicidio', urgency: 'Semanal', ficha: 'Ficha 356', action: 'Valoración de riesgo, seguridad del paciente y remisión a salud mental.' },
    { code: '300', name: 'Agresiones por animales potencialmente transmisores de rabia', urgency: 'Semanal', ficha: 'Ficha 300', action: 'Lavado con agua y jabón, valoración de profilaxis antirrábica según el tipo de exposición.' },
    { code: '535', name: 'Meningitis', urgency: 'Inmediata si es meningocócica', ficha: 'Ficha 535', action: 'Antibiótico sin demora, aislamiento respiratorio y profilaxis de contactos.' },
    { code: '549', name: 'Morbilidad materna extrema', urgency: 'Semanal', ficha: 'Ficha 549', action: 'Criterios: preeclampsia severa, hemorragia grave, sepsis o disfunción orgánica.' },
    { code: '551', name: 'Mortalidad materna', urgency: 'Inmediata', ficha: 'Ficha 551', action: '' },
    { code: '113', name: 'Desnutrición aguda moderada y severa en menores de 5 años', urgency: 'Semanal', ficha: 'Ficha 113', action: 'Valoración antropométrica, manejo nutricional y ruta de atención.' },
    { code: '348', name: 'Infección respiratoria aguda grave (IRAG inusitado)', urgency: 'Inmediata', ficha: 'Ficha 348', action: 'Aislamiento, toma de muestras y valoración de criterios de UCI.' },
    { code: '340', name: 'Hepatitis B, C y coinfección B-D', urgency: 'Semanal', ficha: 'Ficha 340', action: '' },
    { code: '831', name: 'Varicela individual', urgency: 'Semanal', ficha: 'Ficha 831', action: '' },
    { code: '620', name: 'Parotiditis', urgency: 'Semanal', ficha: 'Ficha 620', action: '' },
    { code: '800', name: 'Tos ferina', urgency: '', ficha: 'Ficha 800', action: '' },
    { code: '452', name: 'Lesiones por artefactos explosivos (pólvora y minas antipersonal)', urgency: 'Semanal', ficha: 'Ficha 452', action: '' },
    { code: '215', name: 'Defectos congénitos', urgency: 'Semanal', ficha: 'Ficha 215', action: '' },
    { code: '', name: 'Accidente ofídico', urgency: '', ficha: '', action: 'Inmoviliza la extremidad, traslado urgente y suero antiofídico según el género de la serpiente. Busca el código en el listado del INS.' },
    { code: '', name: 'Intoxicaciones por sustancias químicas (plaguicidas, medicamentos, otras)', urgency: '', ficha: '', action: 'Soporte vital, descontaminación según la vía y consulta a toxicología. Busca el código en el listado del INS.' }
];

const novedadesData = [
            {
                id: 'hf-esc-2026',
                especialidad: 'Cardiología',
                icono: 'fa-heart-pulse',
                color: 'rose',
                titulo: 'Insuficiencia cardíaca: guía ESC 2026',
                fecha: '2026',
                cambiaPractica: true,
                cifra: 'GDMT cuádruple',
                cifraTexto: 'Terapia médica óptima con los cuatro pilares (ARNI/IECA/ARA II + betabloqueador + ARM + SGLT2i) en HFrEF, con titulación rápida y manejo integrado de comorbilidades.',
                cambios: [
                    {
                        antes: 'Titulación lenta y secuencial de los fármacos (guía 2021).',
                        ahora: 'Se enfatiza la titulación rápida de los cuatro pilares, iniciando dosis bajas y ajustando cada 1 - 2 semanas.'
                    },
                    {
                        antes: 'SGLT2i solo en HFrEF.',
                        ahora: 'SGLT2i (dapagliflozina, empagliflozina) recomendados en todo el espectro de FE (HFrEF, HFmrEF y HFpEF) y en la insuficiencia cardíaca aguda estabilizada.'
                    },
                    {
                        ahora: 'Finerenona y vericiguat se incorporan como opciones en HFrEF con empeoramiento o intolerancia a los pilares estándar.'
                    },
                    {
                        ahora: 'El manejo de comorbilidades (fibrilación auricular, diabetes, enfermedad renal, anemia) se integra en el plan terapéutico.'
                    }
                ],
                detalle: 'La guía 2026 reemplaza a la de 2021 y actualiza el diagnóstico, la clasificación por FE y el manejo de la insuficiencia cardíaca aguda. Compárala con el protocolo de tu servicio y las guías colombianas. En Adroosis, el vademécum incluye los fármacos clave (sacubitril/valsartán, dapagliflozina, empagliflozina, espironolactona, furosemida).',
                fuente: { texto: 'ESC: 2026 Guidelines for the management of heart failure', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Heart-Failure' },
                aplica: { label: 'Ver Vademécum CV', tipo: 'tab', id: 'farmaco' },
                revisado: '25 nov 2026',
                verificado: false
            },
            {
                id: 'cvd-ckd-esc-2026',
                especialidad: 'Cardiología / Nefrología',
                icono: 'fa-kidneys',
                color: 'indigo',
                titulo: 'Enfermedad cardiovascular y renal crónica: guía ESC 2026',
                fecha: '2026',
                cambiaPractica: true,
                cifra: 'Manejo integrado',
                cifraTexto: 'Primera guía ESC dedicada al manejo integrado de la enfermedad cardiovascular y la enfermedad renal crónica, con énfasis en SGLT2i y finerenona.',
                cambios: [
                    {
                        antes: 'Manejo cardiovascular y renal por separado.',
                        ahora: 'Abordaje integrado: evaluar riesgo cardiovascular y renal de forma conjunta y tratar con fármacos que protegen ambos órganos.'
                    },
                    {
                        ahora: 'SGLT2i (dapagliflozina, empagliflozina) recomendados en ERC con o sin diabetes por su beneficio renal y cardiovascular.'
                    },
                    {
                        ahora: 'Finerenona recomendada en ERC con diabetes y albuminuria para reducir la progresión renal y los eventos CV.'
                    },
                    {
                        ahora: 'Control de PA < 130/80 mmHg y manejo intensivo de lípidos en pacientes con ERC.'
                    }
                ],
                detalle: 'La guía se centra en la prevención y el manejo de la enfermedad cardiovascular en pacientes con enfermedad renal crónica. Compárala con el protocolo de tu servicio. En Adroosis, el vademécum incluye los fármacos clave (dapagliflozina, empagliflozina, espironolactona, enalapril, losartán).',
                fuente: { texto: 'ESC: 2026 Guidelines for the management of cardiovascular disease and chronic kidney disease', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines' },
                aplica: { label: 'Ver Vademécum', tipo: 'tab', id: 'farmaco' },
                revisado: '25 nov 2026',
                verificado: false
            },
            {
                id: 'ckm-acc-2026',
                especialidad: 'Cardiología / Endocrinología',
                icono: 'fa-heart',
                color: 'amber',
                titulo: 'Síndrome cardio-reno-metabólico (CKM): guía ACC/AHA 2026',
                fecha: '2026',
                cambiaPractica: true,
                cifra: 'Estratificación CKM',
                cifraTexto: 'Primera guía dedicada al síndrome cardio-reno-metabólico, que integra obesidad, diabetes, enfermedad renal y cardiovascular en un solo marco de riesgo.',
                cambios: [
                    {
                        antes: 'Manejo por separado de obesidad, diabetes, ERC y enfermedad CV.',
                        ahora: 'Abordaje integrado: estratificar el riesgo CKM y tratar con fármacos que benefician múltiples órganos (SGLT2i, GLP-1 RA, finerenona).'
                    },
                    {
                        ahora: 'Estratificación en etapas 0 a 4 según la presencia de factores de riesgo y enfermedad establecida.'
                    },
                    {
                        ahora: 'Énfasis en la prevención primaria y el manejo del peso, la PA y la glucemia desde etapas tempranas.'
                    }
                ],
                detalle: 'El síndrome CKM reconoce la interacción entre obesidad, diabetes, enfermedad renal y cardiovascular. Es una guía estadounidense: compárala con el protocolo de tu servicio y las guías colombianas. En Adroosis, el vademécum incluye SGLT2i (dapagliflozina, empagliflozina) y los fármacos cardiovasculares clave.',
                fuente: { texto: 'ACC: 2026 Cardiovascular-Kidney-Metabolic Syndrome guideline', url: 'https://www.acc.org/guidelines' },
                aplica: { label: 'Ver Vademécum', tipo: 'tab', id: 'farmaco' },
                revisado: '25 nov 2026',
                verificado: false
            }

,
            
            {
                id: 'urosepsis-itu-2026',
                especialidad: 'Infectología',
                icono: 'fa-user-nurse',
                color: 'blue',
                titulo: 'Manejo de Urosepsis e ITU Complicada: Actualización 2026',
                fecha: 'Nov 2026',
                cambiaPractica: true,
                cifra: 'Descompresión urgente en ≤ 6 h',
                cifraTexto: 'Ante urosepsis con obstrucción urinaria (litiasis o compresión), el drenaje urgente (nefrostomía o catéter doble J) es prioridad absoluta antes o al mismo tiempo que los antibióticos.',
                cambios: [
                    {
                        antes: 'Uso empírico prolongado de fluoroquinolonas o aminoglucósidos en áreas con alta resistencia.',
                        ahora: 'Evitar fluoroquinolonas empíricas si la resistencia local a E. coli supera el 10%; preferir carbapenémicos de inicio o piperacilina/tazobactam según gravedad.'
                    },
                    {
                        antes: 'Duración estándar de tratamiento en urosepsis de 10 a 14 días.',
                        ahora: 'Se acorta la duración a 7 días en pacientes con resolución clínica completa y fuente de infección controlada.'
                    },
                    {
                        antes: 'Cultivo de control rutinario al finalizar el tratamiento antimicrobiano.',
                        ahora: 'No se recomienda urocultivo de control post-tratamiento en pacientes asintomáticos.'
                    }
                ],
                detalle: 'Se enfatiza la reanimación dirigida por metas y la toma de hemocultivos y urocultivo previo al inicio del antibiótico. En pacientes embarazadas o con anomalías anatómicas, se mantiene el umbral de precaución estricta y manejo intrahospitalario inmediato.',
                fuente: { texto: 'IDSA / EAU Guidelines Update 2026', url: 'https://www.idsociety.org' },
                aplica: { label: 'Ver Cuidado Crítico', tipo: 'tab', id: 'cuidado-critico' },
                revisado: '04 nov 2026',
                verificado: false
            },
            {
                id: 'sepsis-ssc-2026',
                especialidad: 'Cuidado crítico',
                icono: 'fa-heart-pulse',
                color: 'rose',
                titulo: 'Sepsis: guías Surviving Sepsis Campaign 2026',
                fecha: 'Mar 2026',
                cambiaPractica: true,
                cifra: 'Antibiótico en ≤ 1 h',
                cifraTexto: 'Sepsis probable o choque séptico. Si la sepsis solo es posible y no hay choque: estudio acotado y antibiótico en ≤ 3 h (esto se mantiene desde 2021).',
                cambios: [
                    {
                        antes: 'Infusión prolongada de betalactámicos: sugerencia condicional (2021).',
                        ahora: 'Recomendación fuerte de mantener la infusión prolongada después de la dosis de carga.'
                    },
                    {
                        antes: 'Desescalonar el antibiótico: sugerencia condicional.',
                        ahora: 'Recomendación fuerte de pasar a un antibiótico más estrecho cuando se conozcan el germen y la sensibilidad.'
                    },
                    {
                        antes: 'Evidencia de certeza baja a favor de cristaloides balanceados.',
                        ahora: 'Certeza moderada: cristaloides balanceados sobre solución salina 0.9%; y cristaloide solo sobre cristaloide más albúmina.'
                    }
                ],
                detalle: 'Son 129 recomendaciones, 46 de ellas nuevas. Se mantiene: al menos 30 mL/kg de cristaloide en las primeras 3 h ante hipoperfusión o choque (usar peso ajustado o ideal si IMC > 30). Nuevo: sugerir una herramienta estándar de tamizaje de sepsis y una meta inicial de PAM > 65 mmHg (en mayores de 65 años se sigue sugiriendo 60 - 65). La noradrenalina sigue siendo el vasopresor de primera línea.',
                fuente: { texto: 'SCCM: Surviving Sepsis Campaign, adultos 2026', url: 'https://www.sccm.org/clinical-resources/guidelines/guidelines/surviving-sepsis-campaign-international-guidelines-for-management-of-sepsis-and-septic-shock-2026' },
                aplica: { label: 'Ver Sepsis en Infectología', tipo: 'tab', id: 'infectologia' },
                revisado: '29 oct 2026',
                verificado: false
            },
            {
                id: 'nac-ats-2025',
                especialidad: 'Neumología',
                icono: 'fa-lungs',
                color: 'cyan',
                titulo: 'Neumonía adquirida en la comunidad: actualización ATS 2025',
                fecha: '2025',
                cambiaPractica: true,
                cifra: 'Mínimo 3 días',
                cifraTexto: 'Antibiótico en pacientes estables con NAC no grave (ambulatorios u hospitalizados). En NAC grave: 5 días o más.',
                cambios: [
                    {
                        antes: 'Duración mínima de 5 días (guía 2019).',
                        ahora: 'Menos de 5 días, con mínimo de 3, si el paciente alcanza estabilidad clínica y la NAC no es grave.'
                    },
                    {
                        antes: 'Corticoides: no usarlos de rutina, ni siquiera en NAC grave.',
                        ahora: 'NAC no grave hospitalizada: se recomienda no usarlos. NAC grave: se sugieren (excepto en neumonía por influenza).'
                    },
                    {
                        ahora: 'La ecografía pulmonar queda como alternativa a la radiografía de tórax para el diagnóstico.'
                    }
                ],
                detalle: 'CURB-65 y PSI no se diseñaron para decidir el ingreso a UCI y no definen la NAC grave en esta guía. Si el panel viral sale positivo: en NAC no grave hospitalizada se sugiere igual dar antibiótico empírico; en NAC grave, siempre. Una publicación señala que la IDSA no respaldó esta actualización: confirma el estado actual en la fuente.',
                fuente: { texto: 'Guideline Central: comparación ATS/IDSA 2019 vs 2025', url: 'https://www.guidelinecentral.com/insights/nov-2025-atsidsa-cap-guideline-timeline/' },
                aplica: { label: 'Abrir CURB-65', tipo: 'calc', id: 'curb65' },
                revisado: '29 oct 2026',
                verificado: false
            },
            {
                id: 'fa-esc-2024',
                especialidad: 'Cardiología',
                icono: 'fa-bolt',
                color: 'amber',
                titulo: 'Fibrilación auricular: de CHA₂DS₂-VASc a CHA₂DS₂-VA (ESC 2024)',
                fecha: '2024',
                cambiaPractica: true,
                cifra: 'CHA₂DS₂-VA ≥ 2',
                cifraTexto: 'Anticoagulación oral recomendada. Con 1 punto, considerarla de forma individualizada. Igual en hombres y mujeres.',
                cambios: [
                    {
                        antes: 'CHA₂DS₂-VASc: el sexo femenino sumaba 1 punto.',
                        ahora: 'CHA₂DS₂-VA: se elimina la categoría de sexo.'
                    },
                    {
                        antes: 'Umbral distinto según sexo (≥ 2 en hombres, ≥ 3 en mujeres).',
                        ahora: 'Un solo umbral: ≥ 2 recomendado, 1 punto se considera.'
                    }
                ],
                detalle: 'La razón es que el sexo femenino se comporta como modificador del riesgo y no como factor de riesgo independiente. La calculadora de Adroosis ahora muestra los dos puntajes (CHA₂DS₂-VA y CHA₂DS₂-VASc).',
                fuente: { texto: 'Revisión de las guías ESC/EACTS 2024 de FA (PMC)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11666470' },
                aplica: { label: 'Abrir CHA₂DS₂-VASc', tipo: 'calc', id: 'chads' },
                revisado: '29 oct 2026',
                verificado: false
            },
            {
                id: 'hta-aha-2025',
                especialidad: 'Cardiología',
                icono: 'fa-heart',
                color: 'indigo',
                titulo: 'Hipertensión: guía AHA/ACC 2025',
                fecha: 'Ago 2025',
                cambiaPractica: false,
                cifra: '≥ 130/80 mmHg',
                cifraTexto: 'El umbral diagnóstico se mantiene. PREVENT ayuda a decidir a quién tratar con fármacos en estadio 1.',
                cambios: [
                    {
                        antes: 'Riesgo cardiovascular a 10 años con ASCVD (guía 2017).',
                        ahora: 'Calculadora PREVENT: riesgo a 10 y a 30 años, con función renal y datos metabólicos.'
                    },
                    {
                        antes: 'Cociente albúmina/creatinina en orina: prueba opcional.',
                        ahora: 'Se recomienda en todos los pacientes con hipertensión.'
                    },
                    {
                        ahora: 'Meta de PAS < 130 mmHg en adultos con hipertensión, con énfasis en prevenir el deterioro cognitivo y la demencia.'
                    }
                ],
                detalle: 'La guía de 2025 reemplaza a la de 2017 e incluye recomendaciones antes, durante y después del embarazo. Es una guía estadounidense: compárala con la guía colombiana y el protocolo de tu servicio. En Adroosis todavía no hay calculadora PREVENT: está pendiente de agregar.',
                fuente: { texto: 'ACC: nueva guía de hipertensión AHA/ACC 2025', url: 'https://www.acc.org/Latest-in-Cardiology/Journal-Scans/2025/08/14/15/36/New-ACC-AHA-Guideline-Addresses-Prevention-Detection-Evaluation-and-Management-of-HBP' },
                aplica: null,
                revisado: '29 oct 2026',
                verificado: false
            },
            {
                id: 'arbovirus-oms-2025',
                especialidad: 'Infectología tropical',
                icono: 'fa-virus',
                color: 'emerald',
                titulo: 'Dengue, chikungunya, Zika y fiebre amarilla: guía OMS 2025',
                fecha: 'Jul 2025',
                cambiaPractica: true,
                cifra: '4 virus · 1 guía',
                cifraTexto: 'Primera guía global de la OMS que cubre las cuatro arbovirosis, desde la atención comunitaria hasta la hospitalización.',
                cambios: [
                    {
                        antes: 'Sin una guía global conjunta para las cuatro enfermedades.',
                        ahora: 'Guía integrada, útil cuando circulan varios arbovirus a la vez y no hay pruebas disponibles.'
                    },
                    {
                        ahora: 'Manejo guiado por monitoreo clínico: llenado capilar, lactato y respuesta a los líquidos.'
                    },
                    {
                        ahora: 'Se desaconsejan tratamientos sin respaldo: esteroides, inmunoglobulinas y transfusión profiláctica de plaquetas.'
                    }
                ],
                detalle: 'Es una de las fuentes más útiles para el rural en zonas con transmisión. En Adroosis falta agregar dengue al módulo de Infectología: usa esta guía junto con el protocolo vigente del INS y del Ministerio de Salud.',
                fuente: { texto: 'OMS: guía clínica de arbovirosis 2025', url: 'https://www.who.int/publications/i/item/9789240111110' },
                aplica: { label: 'Ir a Infectología', tipo: 'tab', id: 'infectologia' },
                revisado: '29 oct 2026',
                verificado: false
            },
            {
                id: 'ada-2026',
                especialidad: 'Endocrinología',
                icono: 'fa-droplet',
                color: 'violet',
                titulo: 'Diabetes: Standards of Care ADA 2026',
                fecha: '2026',
                cambiaPractica: false,
                cifra: 'MCG desde el diagnóstico',
                cifraTexto: 'Monitoreo continuo de glucosa para cualquier persona que pueda beneficiarse, no solo quienes usan insulina.',
                cambios: [
                    {
                        antes: 'MCG pensada sobre todo para quienes usan insulina o tienen riesgo de hipoglucemia.',
                        ahora: 'Se recomienda desde el inicio de la diabetes y en cualquier momento posterior si puede beneficiar.'
                    },
                    {
                        antes: 'Bombas e insulina automatizada condicionadas por tipo de diabetes, péptido C o autoanticuerpos.',
                        ahora: 'El criterio es usar insulina, no el tipo de diabetes; se ofrecen sistemas automatizados a adultos con DM2 en insulina.'
                    }
                ],
                detalle: 'La guía se actualiza cada enero. También aclara los factores de riesgo, el tamizaje y el manejo de la cetoacidosis diabética. En zonas rurales el acceso a MCG y bombas es limitado: aplica lo que tu servicio tenga disponible.',
                fuente: { texto: 'ADA: resumen de revisiones 2026 (Diabetes Care)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12690167' },
                aplica: { label: 'Ver Vademécum', tipo: 'tab', id: 'farmaco' },
                revisado: '29 oct 2026',
                verificado: false
            }
        ];

const PFEFFER_ITEMS = [
    'Manejar dinero, pagar cuentas, llevar cuentas del hogar',
    'Ordenar papeles y asuntos de negocios o impuestos',
    'Hacer compras solo (ropa, mercado, artículos del hogar)',
    'Jugar juegos de habilidad o trabajar en un pasatiempo',
    'Calentar agua, preparar café y apagar la estufa',
    'Preparar una comida completa',
    'Mantenerse al tanto de los acontecimientos recientes',
    'Prestar atención y entender un programa, libro o revista',
    'Recordar citas, ocasiones familiares y medicamentos',
    'Viajar fuera del vecindario, conducir u organizar el transporte'
];

const DOSIS_ADRE = { n: 'Adrenalina IM (ampolla 1 mg/mL)', nota: 'Tope: 0.5 mg en adultos y adolescentes; 0.3 mg en niños prepúberes.', f: (kg, pob) => {
    const tope = pob === 'pediatrico' ? 0.3 : 0.5;
    let d = 0.01 * kg, t = '';
    if (d > tope) { d = tope; t = ' (dosis máxima)'; }
    return `${fmtN(d)} mg = ${fmtN(d)} mL${t}`;
}};

const VAC_RABIA = ['Vacuna de cultivo celular (no la de tejido nervioso). Esquemas OMS: IM en 1 sitio días 0, 3 y 7 con una cuarta dosis entre los días 14 y 28; o intradérmico en 2 sitios días 0, 3 y 7',
                   'Esquema ACIP: IM días 0, 3, 7 y 14 (y 28 si hay inmunosupresión)',
                   'Confirma el esquema vigente del lineamiento colombiano (MinSalud / INS) con tu secretaría de salud',
                   'Aplícala en el deltoides (en lactantes, cara anterolateral del muslo): nunca en el glúteo',
                   'Si ya recibió una serie completa antes: 2 dosis (días 0 y 3) y SIN inmunoglobulina'];

const NEURO_SECTIONS = [
{
    id: 'mental',
    title: 'Estado mental y funciones corticales',
    short: 'Estado mental',
    icon: 'fa-brain',
    color: 'violet',
    intro: 'Evalúa conciencia, orientación, atención, memoria, lenguaje y funciones corticales superiores.',
    items: [
        ['conciencia','Nivel de conciencia','Valora apertura ocular, respuesta verbal y respuesta motora.','Alerta, vigil y responde espontáneamente.'],
        ['orientacion','Orientación','Pregunta por persona, lugar, tiempo y situación.','Orientado en persona, tiempo, espacio y situación.'],
        ['atencion','Atención y concentración','Dígitos, meses del año en orden inverso o tarea equivalente.','Mantiene la atención y realiza adecuadamente la tarea.'],
        ['memoria_inmediata','Memoria inmediata','Repite tres palabras inmediatamente después de escucharlas.','Registro inmediato conservado.'],
        ['memoria_reciente','Memoria reciente','Solicita recordar las palabras después de unos minutos.','Recuerdo diferido conservado.'],
        ['memoria_remota','Memoria remota','Pregunta por acontecimientos biográficos o históricos verificables.','Evocación de información remota conservada.'],
        ['lenguaje_espontaneo','Lenguaje espontáneo','Valora fluidez, articulación, contenido y coherencia.','Lenguaje fluido, coherente y comprensible.'],
        ['comprension','Comprensión','Da órdenes de uno o varios pasos.','Comprende y ejecuta órdenes adecuadamente.'],
        ['nominacion','Nominación','Solicita nombrar objetos comunes.','Nominación conservada.'],
        ['repeticion','Repetición','Solicita repetir palabras y frases.','Repetición conservada.'],
        ['lectura','Lectura','Solicita leer una frase y explicar su contenido.','Lectura y comprensión conservadas.'],
        ['escritura','Escritura','Solicita escribir una frase espontánea.','Escritura comprensible y coherente.'],
        ['calculo','Cálculo','Realiza operaciones sencillas adecuadas al contexto educativo.','Cálculo conservado para el nivel educativo.'],
        ['praxis','Praxias','Solicita gestos aprendidos, imitación y uso simulado de objetos.','Realiza adecuadamente las praxias exploradas.'],
        ['gnosias','Gnosias','Reconocimiento de objetos, formas o estímulos con modalidades sensoriales conservadas.','Reconocimiento de estímulos conservado.'],
        ['funciones_ejecutivas','Funciones ejecutivas','Valora planificación, secuenciación, abstracción y flexibilidad mental.','Funciones ejecutivas conservadas en las tareas exploradas.']
    ]
},
{
    id: 'cranial',
    title: 'Pares craneales I–XII',
    short: 'Pares craneales',
    icon: 'fa-eye',
    color: 'sky',
    intro: 'Explora cada nervio craneal de manera individual. Registra lateralidad cuando corresponda.',
    items: [
        ['pc_i','I · Olfatorio','Con ojos cerrados, explora identificación de olores familiares por cada fosa nasal, si está indicado.','Identificación olfatoria conservada bilateralmente.'],
        ['pc_ii_agudeza','II · Óptico: agudeza visual','Evalúa cada ojo por separado con cartilla apropiada y corrección habitual.','Agudeza visual conservada según evaluación realizada.'],
        ['pc_ii_campos','II · Óptico: campos visuales','Explora campos por confrontación en los cuatro cuadrantes.','Campos visuales por confrontación conservados.'],
        ['pc_ii_pupilas','II · Vía aferente pupilar','Valora respuesta fotomotora directa y consensual; compara pupilas.','Respuesta fotomotora conservada, sin defecto aferente evidente.'],
        ['pc_iii','III · Oculomotor','Evalúa movimientos oculares, elevación palpebral y respuesta pupilar.','Movimientos y funciones exploradas conservados.'],
        ['pc_iv','IV · Troclear','Evalúa movimiento ocular hacia abajo y adentro.','Movimiento conservado, sin diplopía en la maniobra.'],
        ['pc_v1','V · Trigémino: V1','Explora sensibilidad en región frontal y reflejo corneal si está indicado.','Sensibilidad V1 conservada.'],
        ['pc_v2','V · Trigémino: V2','Explora sensibilidad en región maxilar.','Sensibilidad V2 conservada.'],
        ['pc_v3','V · Trigémino: V3','Explora sensibilidad mandibular y contracción de maseteros y temporales.','Sensibilidad y función motora V3 conservadas.'],
        ['pc_vi','VI · Abducens','Evalúa abducción ocular bilateral.','Abducción ocular conservada bilateralmente.'],
        ['pc_vii','VII · Facial','Evalúa simetría facial: elevar cejas, cerrar ojos, sonreír e inflar mejillas.','Mímica facial simétrica y conservada.'],
        ['pc_viii','VIII · Vestibulococlear','Explora audición mediante voz o susurro; Weber y Rinne si se requiere.','Audición conservada en las pruebas realizadas.'],
        ['pc_ix_x','IX–X · Glosofaríngeo y vago','Valora voz, elevación del paladar y deglución; reflejo nauseoso solo si está indicado.','Voz y elevación palatina simétricas.'],
        ['pc_xi','XI · Accesorio','Evalúa elevación de hombros y rotación de cabeza contra resistencia.','Fuerza de trapecios y esternocleidomastoideos conservada.'],
        ['pc_xii','XII · Hipogloso','Inspecciona lengua en reposo y protrusión; valora movimientos.','Lengua centrada, sin atrofia ni fasciculaciones evidentes.']
    ]
},
{
    id: 'motor',
    title: 'Sistema motor y reflejos',
    short: 'Sistema motor',
    icon: 'fa-person-walking',
    color: 'blue',
    intro: 'Evalúa trofismo, tono, fuerza, movimientos involuntarios y reflejos osteotendinosos.',
    items: [
        ['trofismo','Trofismo muscular','Inspecciona volumen, simetría, atrofias e hipertrofias.','Trofismo conservado y simétrico.'],
        ['tono','Tono muscular','Moviliza pasivamente las articulaciones y valora resistencia.','Tono muscular conservado.'],
        ['movimientos','Movimientos involuntarios','Observa temblor, fasciculaciones, corea, distonía, tics o mioclonías.','Sin movimientos involuntarios observados.'],
        ['deriva','Prueba de deriva pronadora','Extiende brazos, palmas hacia arriba y ojos cerrados durante 20–30 segundos.','Sin deriva pronadora.'],
        ['marcha_motora','Movimientos voluntarios','Valora velocidad, amplitud, simetría y ejecución de movimientos.','Movimientos voluntarios conservados.']
    ],
    extra: 'motor'
},
{
    id: 'sensory',
    title: 'Sensibilidad',
    short: 'Sensibilidad',
    icon: 'fa-hand',
    color: 'amber',
    intro: 'Compara ambos lados y explora territorios anatómicos. El paciente debe mantener los ojos cerrados durante las pruebas.',
    items: [
        ['tacto','Sensibilidad táctil superficial','Explora tacto ligero con algodón o estímulo suave.','Tacto superficial conservado en las regiones exploradas.'],
        ['dolor','Sensibilidad dolorosa','Explora discriminación entre estímulo punzante y romo, sin lesionar.','Sensibilidad dolorosa conservada.'],
        ['temperatura','Sensibilidad térmica','Explora frío y calor con estímulos seguros, cuando esté indicado.','Sensibilidad térmica conservada.'],
        ['vibracion','Sensibilidad vibratoria','Utiliza diapasón de 128 Hz sobre prominencias óseas.','Sensibilidad vibratoria conservada.'],
        ['propiocepcion','Propiocepción','Mueve falanges distales hacia arriba o abajo sujetándolas por los lados.','Propiocepción conservada.'],
        ['estereognosia','Estereognosia','Identificación de objetos conocidos mediante palpación con ojos cerrados.','Estereognosia conservada.'],
        ['grafestesia','Grafestesia','Reconocimiento de números o figuras trazadas en la palma.','Grafestesia conservada.'],
        ['discriminacion','Discriminación sensitiva cortical','Explora discriminación de dos puntos y localización táctil cuando esté indicado.','Discriminación sensitiva conservada en las pruebas realizadas.']
    ]
},
{
    id: 'coord',
    title: 'Coordinación',
    short: 'Coordinación',
    icon: 'fa-bullseye',
    color: 'emerald',
    intro: 'Evalúa precisión, velocidad, alternancia y coordinación de movimientos.',
    items: [
        ['dedo_nariz','Dedo-nariz','El paciente alterna tocar su nariz y el dedo del examinador.','Prueba dedo-nariz sin dismetría.'],
        ['talon_rodilla','Talón-rodilla','En decúbito, coloca talón sobre rodilla contralateral y desliza por la tibia.','Prueba talón-rodilla conservada.'],
        ['alternantes','Movimientos alternantes rápidos','Solicita pronación y supinación rápida de las manos.','Movimientos alternantes rápidos conservados.'],
        ['rebote','Fenómeno de rebote','Evalúa control del movimiento al retirar una resistencia de forma segura.','Control del movimiento conservado.'],
        ['temblor_intencion','Temblor de intención','Observa la trayectoria durante movimientos dirigidos.','Sin temblor de intención evidente.']
    ]
},
{
    id: 'gait',
    title: 'Marcha y equilibrio',
    short: 'Marcha y equilibrio',
    icon: 'fa-shoe-prints',
    color: 'cyan',
    intro: 'Explora marcha espontánea y pruebas específicas. Asegura condiciones para evitar caídas.',
    items: [
        ['marcha_habitual','Marcha habitual','Observa inicio, base, longitud del paso, braceo, simetría y giro.','Marcha independiente y estable, de características habituales.'],
        ['talones','Marcha sobre talones','Solicita caminar unos pasos apoyando talones.','Marcha sobre talones conservada.'],
        ['puntas','Marcha en puntas','Solicita caminar unos pasos sobre antepié.','Marcha en puntas conservada.'],
        ['tandem','Marcha en tándem','Solicita caminar colocando un pie delante del otro.','Marcha en tándem conservada.'],
        ['romberg','Romberg','Pies juntos, primero ojos abiertos y luego cerrados, con protección del examinador.','Romberg negativo: estabilidad conservada al cerrar los ojos.'],
        ['equilibrio','Equilibrio estático y dinámico','Valora estabilidad al permanecer de pie, girar y cambiar de posición.','Equilibrio estático y dinámico conservado.']
    ]
},
{
    id: 'meningeal',
    title: 'Signos meníngeos',
    short: 'Signos meníngeos',
    icon: 'fa-shield-halved',
    color: 'rose',
    intro: 'Explora signos de irritación meníngea cuando el contexto clínico lo justifique. La ausencia de estos signos no excluye meningitis.',
    items: [
        ['rigidez','Rigidez nucal','Valora flexión pasiva del cuello, sin forzar si existe sospecha de lesión cervical.','Sin rigidez nucal.'],
        ['kernig','Signo de Kernig','Con cadera y rodilla flexionadas, intenta extender la rodilla y observa dolor o resistencia.','Kernig negativo.'],
        ['brudzinski','Signo de Brudzinski','Flexiona pasivamente el cuello y observa flexión involuntaria de caderas y rodillas.','Brudzinski negativo.']
    ]
}
];

const NEURO_QUICK_STATIONS = [
    {
        id: 'mental',
        title: '1. Estado mental',
        time: 'Aproximadamente 1 minuto',
        icon: 'fa-brain',
        description: 'Valora nivel de conciencia, orientación y comunicación.',
        items: [
            {
                id: 'q_alert',
                label: 'Nivel de conciencia',
                how: 'Observa si está alerta, mantiene contacto y responde adecuadamente.',
                section: 'mental',
                targets: ['conciencia']
            },
            {
                id: 'q_orientation',
                label: 'Orientación',
                how: 'Pregunta quién es, dónde está, fecha aproximada y qué está ocurriendo.',
                section: 'mental',
                targets: ['orientacion']
            },
            {
                id: 'q_language',
                label: 'Lenguaje y comprensión',
                how: 'Escucha el lenguaje espontáneo y solicita ejecutar una orden sencilla.',
                section: 'mental',
                targets: ['lenguaje_espontaneo', 'comprension']
            }
        ]
    },
    {
        id: 'cranial',
        title: '2. Pares craneales clave',
        time: 'Aproximadamente 1 minuto',
        icon: 'fa-eye',
        description: 'Tamizaje de pupilas, campos visuales, movimientos oculares y simetría facial.',
        items: [
            {
                id: 'q_pupils',
                label: 'Pupilas',
                how: 'Compara tamaño y simetría; explora respuesta a la luz directa y consensual.',
                section: 'cranial',
                targets: ['pc_ii_pupilas']
            },
            {
                id: 'q_visual',
                label: 'Campos visuales por confrontación',
                how: 'Explora cada ojo por separado y compara la detección de estímulos en los campos visuales.',
                section: 'cranial',
                targets: ['pc_ii_campos']
            },
            {
                id: 'q_ocular',
                label: 'Movimientos oculares',
                how: 'Solicita seguir un objetivo en las distintas direcciones de la mirada; observa limitaciones o diplopía.',
                section: 'cranial',
                targets: ['pc_iii', 'pc_iv', 'pc_vi']
            },
            {
                id: 'q_face',
                label: 'Simetría facial',
                how: 'Solicita elevar las cejas, cerrar los ojos con fuerza y mostrar los dientes.',
                section: 'cranial',
                targets: ['pc_vii']
            },
            {
                id: 'q_speech',
                label: 'Voz y articulación',
                how: 'Escucha la articulación y calidad de la voz. Si está indicado, explora deglución de forma segura.',
                section: 'cranial',
                targets: ['pc_ix_x', 'pc_xii']
            }
        ]
    },
    {
        id: 'motor',
        title: '3. Fuerza y función motora',
        time: 'Aproximadamente 1 minuto',
        icon: 'fa-hand-fist',
        description: 'Busca asimetrías, pérdida de fuerza y deriva pronadora.',
        items: [
            {
                id: 'q_drift',
                label: 'Deriva pronadora',
                how: 'Con los brazos extendidos al frente, palmas hacia arriba y ojos cerrados, observa pronación o descenso de un brazo.',
                section: 'motor',
                targets: ['deriva']
            },
            {
                id: 'q_arms',
                label: 'Fuerza de miembros superiores',
                how: 'Compara ambos lados con maniobras breves de empuje, tracción y prensión.',
                section: 'motor',
                targets: ['Fuerza muscular de miembros superiores por grupos (escala MRC)']
            },
            {
                id: 'q_legs',
                label: 'Fuerza de miembros inferiores',
                how: 'Compara ambos lados mediante flexión de cadera, extensión de rodilla y dorsiflexión del pie.',
                section: 'motor',
                targets: ['Fuerza muscular de miembros inferiores por grupos (escala MRC)']
            }
        ]
    },


    {
        id: 'sensory',
        title: '4. Sensibilidad superficial',
        time: 'Aproximadamente 1 minuto',
        icon: 'fa-hand',
        description: 'Compara la percepción del tacto ligero entre ambos lados de la cara y las extremidades.',
        items: [
            {
                id: 'q_sensory',
                label: 'Tacto superficial comparativo',
                how: 'Con los ojos cerrados, compara el tacto ligero en regiones equivalentes de ambos lados de la cara, los brazos y las piernas.',
                section: 'sensory',
                targets: ['tacto']
            }
        ]
    },

    {
        id: 'reflexes',
        title: '5. Reflejos osteotendinosos',
        time: 'Aproximadamente 1 minuto',
        icon: 'fa-bolt',
        description: 'Compara respuestas reflejas de ambos lados cuando la situación clínica lo requiere.',
        items: [
            {
                id: 'q_reflexes',
                label: 'Reflejos osteotendinosos',
                how: 'Explora y compara, según el contexto, reflejos bicipital, tricipital, rotuliano y aquíleo.',
                section: 'motor',
                targets: []
            }
        ]
    },
    {
        id: 'gait',
        title: '6. Coordinación, marcha y equilibrio',
        time: 'Aproximadamente 1 minuto',
        icon: 'fa-person-walking',
        description: 'Realiza estas pruebas únicamente si el paciente puede hacerlas de forma segura.',
        items: [
            {
                id: 'q_coordination',
                label: 'Coordinación dedo-nariz',
                how: 'Solicita tocar alternativamente la nariz y el dedo del examinador.',
                section: 'coord',
                targets: ['dedo_nariz']
            },
            {
                id: 'q_gait',
                label: 'Marcha habitual',
                how: 'Observa inicio, base de sustentación, simetría, estabilidad y giro, con asistencia si es necesaria.',
                section: 'gait',
                targets: ['marcha_habitual']
            },
            {
                id: 'q_tandem',
                label: 'Marcha en tándem',
                how: 'Si es seguro, solicita caminar colocando un pie delante del otro.',
                section: 'gait',
                targets: ['tandem']
            },
            {
                id: 'q_romberg',
                label: 'Romberg',
                how: 'Solo si puede mantenerse de pie con seguridad y supervisión. Compara estabilidad con ojos abiertos y cerrados.',
                section: 'gait',
                targets: ['romberg']
            }
        ]
    }
];

