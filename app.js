const STORAGE_KEY = "meevo_v9_segmentado";

const state = loadState();

const ids = [
  "hospitalInput","setorInput","pacienteInput","sexoInput","contextBar","currentModelTag",
  "hdInput","hmaInput","comorbidadesInput","impressaoInput","condutaInput",
  "geralEstadoSelect","geralHidratacaoSelect","geralCoradoSelect","geralCianoseSelect","geralIctericiaSelect","geralFebreSelect","geralLivreInput",
  "anConscienciaSelect","anGlasgowSelect","anPupilasSelect","anDeficitSelect","anDeficitLivreInput","anMeningeosSelect","anMeningeosLivreInput",
  "arMvSelect","arTopografiaSelect","arRuidosSelect","arDistribuicaoSelect","arLivreInput",
  "acvRitmoSelect","acvBulhasSelect","acvSoproSelect","acvFocoSelect","acvTipoSoproSelect","acvIrradiacaoInput","acvIntensidadeSelect","acvPerfusaoSelect","acvLivreInput",
  "abdPadraoSelect","abdAspectoInput","abdPalpacaoInput","abdRhaSelect","abdLivreInput",
  "extPadraoSelect","extEdemaSelect","extPerfusaoSelect","extPanturrilhasSelect","extLivreInput",
  "renalInput","hematoInput","utiExtras","examModelSelect","normalExamBtn","saveBtn","copyBtn","duplicateBtn","exportBtn",
  "historyPatientFilter","historyList","totalEvolucoes","totalPacientes","refreshPreviewBtn","examPreview","newEvolutionBtn","clearAllBtn"
];
const el = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));

init();

function init(){
  for(let i=3;i<=15;i++){
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `Glasgow ${i}`;
    el.anGlasgowSelect.appendChild(opt);
  }
  bind();
  hydrateDraft();
  syncExamModelWithSector(false);
  updateContext();
  renderHistory();
  renderExamPreview();
}

function bind(){
  ["hospitalInput","setorInput","pacienteInput","sexoInput","hdInput","hmaInput","comorbidadesInput","impressaoInput","condutaInput"].forEach(id=>{
    el[id].addEventListener("input", () => { updateContext(); persistDraft(); });
    el[id].addEventListener("change", () => { updateContext(); persistDraft(); });
  });

  [
    "geralEstadoSelect","geralHidratacaoSelect","geralCoradoSelect","geralCianoseSelect","geralIctericiaSelect","geralFebreSelect","geralLivreInput",
    "anConscienciaSelect","anGlasgowSelect","anPupilasSelect","anDeficitSelect","anDeficitLivreInput","anMeningeosSelect","anMeningeosLivreInput",
    "arMvSelect","arTopografiaSelect","arRuidosSelect","arDistribuicaoSelect","arLivreInput",
    "acvRitmoSelect","acvBulhasSelect","acvSoproSelect","acvFocoSelect","acvTipoSoproSelect","acvIrradiacaoInput","acvIntensidadeSelect","acvPerfusaoSelect","acvLivreInput",
    "abdPadraoSelect","abdAspectoInput","abdPalpacaoInput","abdRhaSelect","abdLivreInput",
    "extPadraoSelect","extEdemaSelect","extPerfusaoSelect","extPanturrilhasSelect","extLivreInput",
    "renalInput","hematoInput"
  ].forEach(id=>{
    el[id].addEventListener("input", onExamChange);
    el[id].addEventListener("change", onExamChange);
  });

  el.setorInput.addEventListener("change", () => syncExamModelWithSector(true));
  el.examModelSelect.addEventListener("change", () => { applyExamModel(el.examModelSelect.value); onExamChange(); });
  el.normalExamBtn.addEventListener("click", fillNormalExam);
  el.saveBtn.addEventListener("click", saveEvolution);
  el.copyBtn.addEventListener("click", copyCurrentText);
  el.duplicateBtn.addEventListener("click", duplicateLastEvolution);
  el.exportBtn.addEventListener("click", exportData);
  el.refreshPreviewBtn.addEventListener("click", renderExamPreview);
  el.newEvolutionBtn.addEventListener("click", newEvolution);
  el.clearAllBtn.addEventListener("click", clearAll);
  el.historyPatientFilter.addEventListener("change", renderHistory);
}

function onExamChange(){
  persistDraft();
  renderExamPreview();
}

function updateContext(){
  const hospital = el.hospitalInput.value.trim() || "Sem hospital";
  const setor = el.setorInput.value || "Sem setor";
  const paciente = el.pacienteInput.value.trim() || "Sem paciente";
  el.contextBar.textContent = `${hospital} • ${setor} • ${paciente}`;
  el.utiExtras.classList.toggle("hidden", setor !== "UTI");
  el.currentModelTag.textContent = `Modelo: ${labelModel(el.examModelSelect.value)}`;
}

function labelModel(v){
  return v === "uti" ? "UTI" : v === "enfermaria" ? "Enfermaria" : "Geral";
}

function genderize(baseMasc, baseFem){
  return el.sexoInput.value === "feminino" ? baseFem : baseMasc;
}

function fillNormalExam(){
  el.geralEstadoSelect.value = "EGB";
  el.geralHidratacaoSelect.value = "hidratado";
  el.geralCoradoSelect.value = genderize("normocorado","normocorada");
  el.geralCianoseSelect.value = genderize("acianótico","acianótica");
  el.geralIctericiaSelect.value = genderize("anictérico","anictérica");
  el.geralFebreSelect.value = "afebril ao toque";
  el.geralLivreInput.value = "";

  el.anConscienciaSelect.value = "vigil";
  el.anGlasgowSelect.value = "15";
  el.anPupilasSelect.value = "isocóricas fotorreagentes";
  el.anDeficitSelect.value = "déficit motor ausente";
  el.anDeficitLivreInput.value = "";
  el.anMeningeosSelect.value = "sinais meníngeos ausentes";
  el.anMeningeosLivreInput.value = "";

  el.arMvSelect.value = "MV presente bilateralmente";
  el.arTopografiaSelect.value = "";
  el.arRuidosSelect.value = "sem ruídos adventícios";
  el.arDistribuicaoSelect.value = "";
  el.arLivreInput.value = "";

  el.acvRitmoSelect.value = "RCR";
  el.acvBulhasSelect.value = "2T";
  el.acvSoproSelect.value = "s/s";
  el.acvFocoSelect.value = "";
  el.acvTipoSoproSelect.value = "";
  el.acvIrradiacaoInput.value = "";
  el.acvIntensidadeSelect.value = "";
  el.acvPerfusaoSelect.value = genderize("normoperfundido","normoperfundida");
  el.acvLivreInput.value = "";

  el.abdPadraoSelect.value = "normal";
  el.abdAspectoInput.value = "plano";
  el.abdPalpacaoInput.value = "flácido, indolor";
  el.abdRhaSelect.value = "RHA presentes";
  el.abdLivreInput.value = "";

  el.extPadraoSelect.value = "normal";
  el.extEdemaSelect.value = "sem edema";
  el.extPerfusaoSelect.value = "extremidades perfundidas";
  el.extPanturrilhasSelect.value = "panturrilhas livres";
  el.extLivreInput.value = "";

  if(el.setorInput.value === "UTI"){
    el.renalInput.value = "";
    el.hematoInput.value = "";
  }
  onExamChange();
}

function applyExamModel(model){
  if(model === "uti"){
    fillNormalExam();
    el.anConscienciaSelect.value = "sedado";
    el.renalInput.value = "";
    el.hematoInput.value = "";
  } else if(model === "enfermaria"){
    fillNormalExam();
    el.anConscienciaSelect.value = "vigil";
  } else {
    fillNormalExam();
  }
}

function syncExamModelWithSector(apply=true){
  if(el.setorInput.value === "UTI") el.examModelSelect.value = "uti";
  else if(el.setorInput.value === "Enfermaria") el.examModelSelect.value = "enfermaria";
  else el.examModelSelect.value = "geral";
  updateContext();
  if(apply) applyExamModel(el.examModelSelect.value);
}

function buildLine(title, parts){
  const vals = parts.map(v => String(v || "").trim()).filter(Boolean);
  return vals.length ? `${title}: ${vals.join(", ")}.` : `${title}:`;
}

function buildExamTextFromForm(){
  const lines = [];
  lines.push(buildLine("GERAL", [
    el.geralEstadoSelect.value,
    el.geralHidratacaoSelect.value,
    el.geralCoradoSelect.value,
    el.geralCianoseSelect.value,
    el.geralIctericiaSelect.value,
    el.geralFebreSelect.value,
    el.geralLivreInput.value
  ]));

  const anParts = [
    el.anConscienciaSelect.value,
    el.anGlasgowSelect.value ? `Glasgow ${el.anGlasgowSelect.value}` : "",
    el.anPupilasSelect.value,
    el.anDeficitSelect.value,
    el.anDeficitLivreInput.value,
    el.anMeningeosSelect.value,
    el.anMeningeosLivreInput.value
  ];
  lines.push(buildLine("AN", anParts));

  const arParts = [
    el.arMvSelect.value,
    el.arTopografiaSelect.value,
    el.arRuidosSelect.value,
    el.arDistribuicaoSelect.value,
    el.arLivreInput.value
  ];
  lines.push(buildLine("AR", arParts));

  const acvParts = [
    el.acvRitmoSelect.value,
    el.acvBulhasSelect.value,
    el.acvSoproSelect.value,
    el.acvFocoSelect.value,
    el.acvTipoSoproSelect.value,
    el.acvIrradiacaoInput.value ? `com irradiação para ${el.acvIrradiacaoInput.value}` : "",
    el.acvIntensidadeSelect.value,
    el.acvPerfusaoSelect.value,
    el.acvLivreInput.value
  ];
  lines.push(buildLine("ACV", acvParts));

  const abdParts = [
    el.abdPadraoSelect.value === "normal" ? "abdome sem alterações evidentes" : "",
    el.abdPadraoSelect.value === "alterado" ? "abdome com alterações" : "",
    el.abdAspectoInput.value,
    el.abdPalpacaoInput.value,
    el.abdRhaSelect.value,
    el.abdLivreInput.value
  ];
  lines.push(buildLine("ABD", abdParts));

  const extParts = [
    el.extPadraoSelect.value === "normal" ? "extremidades sem alterações evidentes" : "",
    el.extPadraoSelect.value === "alterado" ? "extremidades com alterações" : "",
    el.extEdemaSelect.value,
    el.extPerfusaoSelect.value,
    el.extPanturrilhasSelect.value,
    el.extLivreInput.value
  ];
  lines.push(buildLine("EXT", extParts));

  if(el.setorInput.value === "UTI"){
    if(el.renalInput.value.trim()) lines.push(buildLine("Renal/Metabólico", [el.renalInput.value]));
    if(el.hematoInput.value.trim()) lines.push(buildLine("Hematológico/Infeccioso", [el.hematoInput.value]));
  }

  return lines.join("\n");
}

function renderExamPreview(){
  el.examPreview.textContent = buildExamTextFromForm();
}

function buildCurrentEvolution(){
  return {
    id: Date.now(),
    hospital: el.hospitalInput.value.trim(),
    setor: el.setorInput.value,
    paciente: el.pacienteInput.value.trim(),
    sexo: el.sexoInput.value,
    hd: el.hdInput.value.trim(),
    hma: el.hmaInput.value.trim(),
    comorbidades: el.comorbidadesInput.value.trim(),
    impressao: el.impressaoInput.value.trim(),
    conduta: el.condutaInput.value.trim(),
    exame: buildExamTextFromForm(),
    createdAt: new Date().toLocaleString("pt-BR")
  };
}

function buildEvolutionText(item){
  return [
    item.hospital ? `Hospital: ${item.hospital}` : "",
    item.setor ? `Setor: ${item.setor}` : "",
    item.paciente ? `Paciente: ${item.paciente}` : "",
    "",
    `H.D.: ${item.hd || ""}`,
    "",
    `H.M.A.: ${item.hma || ""}`,
    "",
    `Comorbidades: ${item.comorbidades || ""}`,
    "",
    item.exame || "",
    "",
    `Impressão clínica: ${item.impressao || ""}`,
    "",
    `Conduta: ${item.conduta || ""}`
  ].join("\n");
}

function saveEvolution(){
  const item = buildCurrentEvolution();
  if(!item.paciente){
    alert("Preencha ao menos o nome do paciente.");
    return;
  }
  state.evolutions.unshift(item);
  saveState();
  renderHistory();
  persistDraft();
  alert("Evolução salva.");
}

async function copyCurrentText(){
  const txt = buildEvolutionText(buildCurrentEvolution());
  try{
    await navigator.clipboard.writeText(txt);
    alert("Texto copiado.");
  }catch{
    alert("Não foi possível copiar automaticamente.");
  }
}

function duplicateLastEvolution(){
  if(!state.evolutions.length){
    alert("Não há evolução salva para duplicar.");
    return;
  }
  hydrateFromEvolution(state.evolutions[0]);
  alert("Última evolução carregada.");
}

function hydrateFromEvolution(item){
  el.hospitalInput.value = item.hospital || "";
  el.setorInput.value = item.setor || "UTI";
  el.pacienteInput.value = item.paciente || "";
  el.sexoInput.value = item.sexo || "masculino";
  el.hdInput.value = item.hd || "";
  el.hmaInput.value = item.hma || "";
  el.comorbidadesInput.value = item.comorbidades || "";
  el.impressaoInput.value = item.impressao || "";
  el.condutaInput.value = item.conduta || "";
  updateContext();
  renderExamPreview();
}

function exportData(){
  if(!state.evolutions.length){
    alert("Nenhuma evolução salva para exportar.");
    return;
  }
  const content = state.evolutions.map(buildEvolutionText).join("\n\n------------------------------\n\n");
  const blob = new Blob([content], {type:"text/plain;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "meevo_evolucoes.txt";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function newEvolution(){
  [
    "hospitalInput","pacienteInput","hdInput","hmaInput","comorbidadesInput","impressaoInput","condutaInput",
    "geralLivreInput","anDeficitLivreInput","anMeningeosLivreInput","arLivreInput","acvIrradiacaoInput","acvLivreInput",
    "abdAspectoInput","abdPalpacaoInput","abdLivreInput","extLivreInput","renalInput","hematoInput"
  ].forEach(id => el[id].value = "");

  [
    "geralEstadoSelect","geralHidratacaoSelect","geralCoradoSelect","geralCianoseSelect","geralIctericiaSelect","geralFebreSelect",
    "anConscienciaSelect","anGlasgowSelect","anPupilasSelect","anDeficitSelect","anMeningeosSelect",
    "arMvSelect","arTopografiaSelect","arRuidosSelect","arDistribuicaoSelect",
    "acvRitmoSelect","acvBulhasSelect","acvSoproSelect","acvFocoSelect","acvTipoSoproSelect","acvIntensidadeSelect","acvPerfusaoSelect",
    "abdPadraoSelect","abdRhaSelect","extPadraoSelect","extEdemaSelect","extPerfusaoSelect","extPanturrilhasSelect"
  ].forEach(id => el[id].value = "");

  el.sexoInput.value = "masculino";
  syncExamModelWithSector(false);
  updateContext();
  renderExamPreview();
  persistDraft();
}

function renderHistory(){
  const filter = el.historyPatientFilter.value;
  const patients = [...new Set(state.evolutions.map(e => e.paciente).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  const current = filter;
  el.historyPatientFilter.innerHTML = '<option value="">Todos os pacientes</option>';
  patients.forEach(p=>{
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    el.historyPatientFilter.appendChild(opt);
  });
  el.historyPatientFilter.value = current;

  const list = current ? state.evolutions.filter(e => e.paciente === current) : state.evolutions;
  el.historyList.innerHTML = "";
  if(!list.length){
    el.historyList.textContent = "Nenhuma evolução salva.";
  } else {
    list.forEach(item=>{
      const div = document.createElement("div");
      div.className = "history-item";
      div.innerHTML = `
        <strong>${escapeHtml(item.paciente || "Paciente sem nome")}</strong>
        <div class="meta">${escapeHtml(item.createdAt)} • ${escapeHtml(item.setor || "")}</div>
        <pre>${escapeHtml(item.exame || "")}</pre>
      `;
      div.addEventListener("click", () => hydrateFromEvolution(item));
      el.historyList.appendChild(div);
    });
  }
  el.totalEvolucoes.textContent = String(state.evolutions.length);
  el.totalPacientes.textContent = String(patients.length);
}

function persistDraft(){
  state.draft = {};
  [
    "hospitalInput","setorInput","pacienteInput","sexoInput","hdInput","hmaInput","comorbidadesInput","impressaoInput","condutaInput",
    "geralEstadoSelect","geralHidratacaoSelect","geralCoradoSelect","geralCianoseSelect","geralIctericiaSelect","geralFebreSelect","geralLivreInput",
    "anConscienciaSelect","anGlasgowSelect","anPupilasSelect","anDeficitSelect","anDeficitLivreInput","anMeningeosSelect","anMeningeosLivreInput",
    "arMvSelect","arTopografiaSelect","arRuidosSelect","arDistribuicaoSelect","arLivreInput",
    "acvRitmoSelect","acvBulhasSelect","acvSoproSelect","acvFocoSelect","acvTipoSoproSelect","acvIrradiacaoInput","acvIntensidadeSelect","acvPerfusaoSelect","acvLivreInput",
    "abdPadraoSelect","abdAspectoInput","abdPalpacaoInput","abdRhaSelect","abdLivreInput",
    "extPadraoSelect","extEdemaSelect","extPerfusaoSelect","extPanturrilhasSelect","extLivreInput",
    "renalInput","hematoInput","examModelSelect"
  ].forEach(id => state.draft[id] = el[id].value);
  saveState();
}

function hydrateDraft(){
  if(!state.draft) return;
  Object.entries(state.draft).forEach(([id,val])=>{
    if(el[id]) el[id].value = val;
  });
}

function clearAll(){
  if(!confirm("Isso apagará todas as evoluções e o rascunho salvo neste navegador. Deseja continuar?")) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return { evolutions: [], draft: {} };
    const parsed = JSON.parse(raw);
    return {
      evolutions: Array.isArray(parsed.evolutions) ? parsed.evolutions : [],
      draft: parsed.draft || {}
    };
  }catch{
    return { evolutions: [], draft: {} };
  }
}

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(s){
  return String(s || "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}
