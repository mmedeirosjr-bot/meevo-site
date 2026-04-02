const STORAGE_KEY = "meevo_v6_data";

const defaultData = {
  hospitais: [],
  pacientes: [],
  plantoes: [],
  evolucoes: [],
  prescricaoTexto: "",
  prescricaoFormatada: "",
  currentEditingEvolutionId: null
};

const templateBase = {
  hd: "",
  hma: "Paciente em acompanhamento no setor, mantendo seguimento clínico diário. Sem intercorrências relevantes no momento, salvo descritas abaixo.",
  comorbidades: "",
  impressao: "Paciente em acompanhamento, estável no momento, mantendo necessidade de seguimento clínico e reavaliação seriada.",
  conduta: "Manter monitorização clínica.\nSeguir ajustes conforme evolução.\nReavaliar exames e resposta terapêutica."
};

const examTemplates = {
  geral: {
    an: "BEG, contactuante.",
    ar: "MV presente, sem ruídos adventícios.",
    acv: "BRNF 2T, sem sopros.",
    abd: "Plano, flácido, indolor.",
    ext: "Sem edema."
  },
  uti: {
    an: "Paciente em leito, vigil, contactuante ou conforme nível de consciência.",
    ar: "Em ar ambiente ou sob suporte, sem sinais importantes de desconforto.",
    acv: "Hemodinamicamente estável, bulhas rítmicas.",
    abd: "Plano, flácido, sem defesa.",
    ext: "Extremidades perfundidas, sem edema significativo."
  },
  enfermaria: {
    an: "BEG, em leito, contactuante.",
    ar: "MV presente bilateralmente.",
    acv: "BRNF 2T, sem sopros.",
    abd: "Plano, flácido, indolor à palpação.",
    ext: "Sem edema, panturrilhas livres."
  }
};

const medicationCategories = [
  { name: "Anti-hipertensivos", keywords: ["losartana", "enalapril", "anlodipino", "amlodipino", "hidralazina", "valsartana", "captopril", "atenolol", "carvedilol", "propranolol"] },
  { name: "Insulinoterapia / Antidiabéticos", keywords: ["insulina", "glargina", "lispro", "nph", "regular", "metformina", "glifage", "dapagliflozina", "empagliflozina", "glicazida"] },
  { name: "Diuréticos", keywords: ["furosemida", "espironolactona", "hidroclorotiazida", "clortalidona", "bumetanida"] },
  { name: "Antibióticos", keywords: ["ceftriaxona", "cefepime", "piperacilina", "tazobactam", "meropenem", "vancomicina", "azitromicina", "amoxicilina", "clavulanato"] },
  { name: "Psicotrópicos / Sedação", keywords: ["sertralina", "fluoxetina", "clonazepam", "alprazolam", "quetiapina", "haloperidol", "propofol", "midazolam", "fentanil", "cetamina"] },
  { name: "Anticoagulação / Antiagregação", keywords: ["enoxaparina", "heparina", "rivaroxabana", "apixabana", "varfarina", "aas", "clopidogrel"] }
];

let state = loadState();

const els = {
  views: Array.from(document.querySelectorAll(".view")),
  navButtons: Array.from(document.querySelectorAll("[data-view-target]")),
  clearDataBtn: document.getElementById("clearDataBtn"),
  loadTemplateBtn: document.getElementById("loadTemplateBtn"),
  loadExamTemplateBtn: document.getElementById("loadExamTemplateBtn"),
  clearEvolucaoBtn: document.getElementById("clearEvolucaoBtn"),
  exportPdfBtn: document.getElementById("exportPdfBtn"),
  newEvolutionBtn: document.getElementById("newEvolutionBtn"),

  hospitalNomeInput: document.getElementById("hospitalNomeInput"),
  hospitalSetorInput: document.getElementById("hospitalSetorInput"),
  addHospitalBtn: document.getElementById("addHospitalBtn"),
  hospitalListSelect: document.getElementById("hospitalListSelect"),

  pacienteNomeInput: document.getElementById("pacienteNomeInput"),
  addPacienteBtn: document.getElementById("addPacienteBtn"),
  pacienteList: document.getElementById("pacienteList"),

  evolucaoSetorSelect: document.getElementById("evolucaoSetorSelect"),
  evolucaoPacienteSelect: document.getElementById("evolucaoPacienteSelect"),
  contextBar: document.getElementById("contextBar"),
  savedEvolutionSelect: document.getElementById("savedEvolutionSelect"),
  loadSavedEvolutionBtn: document.getElementById("loadSavedEvolutionBtn"),
  savedEvolutionPreview: document.getElementById("savedEvolutionPreview"),
  savedEvolutionMeta: document.getElementById("savedEvolutionMeta"),

  hdInput: document.getElementById("hdInput"),
  hmaInput: document.getElementById("hmaInput"),
  comorbidadesInput: document.getElementById("comorbidadesInput"),
  anInput: document.getElementById("anInput"),
  arInput: document.getElementById("arInput"),
  acvInput: document.getElementById("acvInput"),
  abdInput: document.getElementById("abdInput"),
  extInput: document.getElementById("extInput"),
  examModelSelect: document.getElementById("examModelSelect"),
  impressaoInput: document.getElementById("impressaoInput"),
  condutaInput: document.getElementById("condutaInput"),
  saveEvolucaoBtn: document.getElementById("saveEvolucaoBtn"),
  copyEvolucaoBtn: document.getElementById("copyEvolucaoBtn"),

  prescricaoTextoInput: document.getElementById("prescricaoTextoInput"),
  prescricaoFormatoInput: document.getElementById("prescricaoFormatoInput"),
  analisarPrescricaoBtn: document.getElementById("analisarPrescricaoBtn"),
  copiarPrescricaoBtn: document.getElementById("copiarPrescricaoBtn"),
  categoriasPrescricao: document.getElementById("categoriasPrescricao"),

  plantaoDataInput: document.getElementById("plantaoDataInput"),
  plantaoLocalInput: document.getElementById("plantaoLocalInput"),
  plantaoValorInput: document.getElementById("plantaoValorInput"),
  plantaoStatusInput: document.getElementById("plantaoStatusInput"),
  addPlantaoBtn: document.getElementById("addPlantaoBtn"),
  plantaoList: document.getElementById("plantaoList"),

  statHospitais: document.getElementById("statHospitais"),
  statPacientes: document.getElementById("statPacientes"),
  statPlantoes: document.getElementById("statPlantoes"),
  statRecebido: document.getElementById("statRecebido"),
  heroTotal: document.getElementById("heroTotal"),
  heroPacientes: document.getElementById("heroPacientes"),
  financePrevisto: document.getElementById("financePrevisto"),
  financeRecebido: document.getElementById("financeRecebido"),
  financePendente: document.getElementById("financePendente")
};

init();

function init() {
  bindEvents();
  renderAll();
  hydratePrescriptionFields();
}

function bindEvents() {
  els.navButtons.forEach(btn => btn.addEventListener("click", () => setActiveView(btn.dataset.viewTarget)));
  els.addHospitalBtn.addEventListener("click", addHospital);
  els.addPacienteBtn.addEventListener("click", addPaciente);
  els.addPlantaoBtn.addEventListener("click", addPlantao);
  els.saveEvolucaoBtn.addEventListener("click", saveEvolucao);
  els.copyEvolucaoBtn.addEventListener("click", copyEvolucaoText);
  els.loadTemplateBtn.addEventListener("click", loadTemplate);
  els.loadExamTemplateBtn.addEventListener("click", () => loadExamTemplate(els.examModelSelect.value));
  els.examModelSelect.addEventListener("change", () => loadExamTemplate(els.examModelSelect.value));
  els.clearEvolucaoBtn.addEventListener("click", clearEvolucaoForm);
  els.exportPdfBtn.addEventListener("click", exportSavedEvolutionPdf);
  els.newEvolutionBtn.addEventListener("click", startNewEvolution);

  els.hospitalListSelect.addEventListener("change", onHospitalSelectionChange);
  els.evolucaoPacienteSelect.addEventListener("change", updateContextBar);
  els.evolucaoSetorSelect.addEventListener("change", updateContextBar);

  els.savedEvolutionSelect.addEventListener("change", renderSelectedEvolutionPreview);
  els.loadSavedEvolutionBtn.addEventListener("click", openSelectedEvolutionForEditing);

  els.analisarPrescricaoBtn.addEventListener("click", analisarPrescricao);
  els.copiarPrescricaoBtn.addEventListener("click", copiarPrescricao);
  els.prescricaoTextoInput.addEventListener("input", persistPrescriptionText);
  els.prescricaoFormatoInput.addEventListener("input", persistPrescriptionFormat);
  els.clearDataBtn.addEventListener("click", clearAllData);
}

function setActiveView(viewId) {
  els.views.forEach(view => view.classList.toggle("active", view.id === viewId));
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.viewTarget === viewId));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function addHospital() {
  const nome = els.hospitalNomeInput.value.trim();
  const setorPadrao = els.hospitalSetorInput.value;
  if (!nome) return alert("Digite o nome do hospital.");
  state.hospitais.unshift({ id: crypto.randomUUID(), nome, setorPadrao });
  els.hospitalNomeInput.value = "";
  els.hospitalSetorInput.value = "UTI";
  persistAndRender();
}

function addPaciente() {
  const nome = els.pacienteNomeInput.value.trim();
  if (!nome) return alert("Digite o nome do paciente.");
  state.pacientes.unshift({ id: crypto.randomUUID(), nome });
  els.pacienteNomeInput.value = "";
  persistAndRender();
}

function addPlantao() {
  const data = els.plantaoDataInput.value;
  const local = els.plantaoLocalInput.value.trim();
  const valor = parseFloat(els.plantaoValorInput.value);
  const status = els.plantaoStatusInput.value;
  if (!data || !local || Number.isNaN(valor)) return alert("Preencha data, local e valor do plantão.");
  state.plantoes.unshift({ id: crypto.randomUUID(), data, local, valor, status });
  els.plantaoDataInput.value = "";
  els.plantaoLocalInput.value = "";
  els.plantaoValorInput.value = "";
  els.plantaoStatusInput.value = "Previsto";
  persistAndRender();
}

function loadTemplate() {
  els.hdInput.value = templateBase.hd;
  els.hmaInput.value = templateBase.hma;
  els.comorbidadesInput.value = templateBase.comorbidades;
  els.impressaoInput.value = templateBase.impressao;
  els.condutaInput.value = templateBase.conduta;
}

function loadExamTemplate(modelKey) {
  const model = examTemplates[modelKey] || examTemplates.geral;
  els.anInput.value = model.an;
  els.arInput.value = model.ar;
  els.acvInput.value = model.acv;
  els.abdInput.value = model.abd;
  els.extInput.value = model.ext;
}

function buildExamTextFromFields() {
  return [
    `AN: ${els.anInput.value.trim()}`,
    `AR: ${els.arInput.value.trim()}`,
    `ACV: ${els.acvInput.value.trim()}`,
    `ABD: ${els.abdInput.value.trim()}`,
    `EXT: ${els.extInput.value.trim()}`
  ].join("\n");
}

function saveEvolucao() {
  const hospitalId = els.hospitalListSelect.value;
  const pacienteId = els.evolucaoPacienteSelect.value;
  const setor = els.evolucaoSetorSelect.value;

  if (!hospitalId) return alert("Cadastre e selecione um hospital.");
  if (!pacienteId) return alert("Cadastre e selecione um paciente.");

  const evolucao = {
    id: state.currentEditingEvolutionId || crypto.randomUUID(),
    createdAt: state.currentEditingEvolutionId ? getEvolutionById(state.currentEditingEvolutionId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hospitalId,
    pacienteId,
    setor,
    hd: els.hdInput.value.trim(),
    hma: els.hmaInput.value.trim(),
    comorbidades: els.comorbidadesInput.value.trim(),
    exameFisico: {
      an: els.anInput.value.trim(),
      ar: els.arInput.value.trim(),
      acv: els.acvInput.value.trim(),
      abd: els.abdInput.value.trim(),
      ext: els.extInput.value.trim()
    },
    impressao: els.impressaoInput.value.trim(),
    conduta: els.condutaInput.value.trim()
  };

  const existingIndex = state.evolucoes.findIndex(item => item.id === evolucao.id);
  if (existingIndex >= 0) {
    state.evolucoes[existingIndex] = evolucao;
  } else {
    state.evolucoes.unshift(evolucao);
  }

  state.currentEditingEvolutionId = evolucao.id;
  persistAndRender();
  renderSelectedEvolutionPreview();
  alert(existingIndex >= 0 ? "Evolução atualizada." : "Evolução salva.");
}

async function copyEvolucaoText() {
  const texto = buildEvolucaoTextFromForm();
  if (!texto.trim()) return alert("Preencha a evolução antes de copiar.");
  try {
    await navigator.clipboard.writeText(texto);
    alert("Texto copiado.");
  } catch {
    alert("Não foi possível copiar automaticamente.");
  }
}

function buildEvolucaoTextFromForm() {
  const hospital = getHospitalById(els.hospitalListSelect.value)?.nome || "";
  const paciente = getPacienteById(els.evolucaoPacienteSelect.value)?.nome || "";
  const setor = els.evolucaoSetorSelect.value || "";

  return [
    hospital ? `Hospital: ${hospital}` : "",
    setor ? `Setor: ${setor}` : "",
    paciente ? `Paciente: ${paciente}` : "",
    "",
    `H.D.: ${els.hdInput.value.trim()}`,
    "",
    `H.M.A.: ${els.hmaInput.value.trim()}`,
    "",
    `Comorbidades: ${els.comorbidadesInput.value.trim()}`,
    "",
    buildExamTextFromFields(),
    "",
    `Impressão clínica: ${els.impressaoInput.value.trim()}`,
    "",
    `Conduta: ${els.condutaInput.value.trim()}`
  ].join("\n");
}

function openSelectedEvolutionForEditing() {
  const id = els.savedEvolutionSelect.value;
  const item = getEvolutionById(id);
  if (!item) return alert("Selecione uma evolução salva.");

  state.currentEditingEvolutionId = item.id;
  els.hospitalListSelect.value = item.hospitalId;
  els.evolucaoPacienteSelect.value = item.pacienteId;
  els.evolucaoSetorSelect.value = item.setor;
  els.hdInput.value = item.hd || "";
  els.hmaInput.value = item.hma || "";
  els.comorbidadesInput.value = item.comorbidades || "";
  els.anInput.value = item.exameFisico?.an || "";
  els.arInput.value = item.exameFisico?.ar || "";
  els.acvInput.value = item.exameFisico?.acv || "";
  els.abdInput.value = item.exameFisico?.abd || "";
  els.extInput.value = item.exameFisico?.ext || "";
  els.impressaoInput.value = item.impressao || "";
  els.condutaInput.value = item.conduta || "";
  updateContextBar();
  renderSelectedEvolutionPreview();
  alert("Evolução carregada para edição.");
}

function startNewEvolution() {
  state.currentEditingEvolutionId = null;
  clearEvolucaoForm();
  renderSelectedEvolutionPreview();
}

function exportSavedEvolutionPdf() {
  const id = state.currentEditingEvolutionId || els.savedEvolutionSelect.value;
  const item = getEvolutionById(id);
  if (!item) return alert("Selecione ou abra uma evolução salva antes de exportar.");

  const hospital = getHospitalById(item.hospitalId)?.nome || "";
  const paciente = getPacienteById(item.pacienteId)?.nome || "";
  const janela = window.open("", "_blank");
  if (!janela) return alert("Seu navegador bloqueou a abertura da janela de impressão.");

  const exame = item.exameFisico || {};
  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>Evolução - ${escapeHtml(paciente)}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 32px; color: #111827; }
        h1 { margin: 0 0 8px; font-size: 22px; }
        .meta { color: #4b5563; margin-bottom: 24px; }
        .block { margin-bottom: 18px; }
        .label { font-weight: 700; margin-bottom: 6px; }
        .value { white-space: pre-wrap; line-height: 1.5; }
      </style>
    </head>
    <body>
      <h1>MEEVO - Evolução médica</h1>
      <div class="meta">${escapeHtml(hospital)} • ${escapeHtml(item.setor)} • ${escapeHtml(paciente)}</div>
      <div class="block"><div class="label">H.D.</div><div class="value">${escapeHtml(item.hd || "")}</div></div>
      <div class="block"><div class="label">H.M.A.</div><div class="value">${escapeHtml(item.hma || "")}</div></div>
      <div class="block"><div class="label">Comorbidades</div><div class="value">${escapeHtml(item.comorbidades || "")}</div></div>
      <div class="block"><div class="label">Exame físico</div><div class="value">${escapeHtml(`AN: ${exame.an || ""}\nAR: ${exame.ar || ""}\nACV: ${exame.acv || ""}\nABD: ${exame.abd || ""}\nEXT: ${exame.ext || ""}`)}</div></div>
      <div class="block"><div class="label">Impressão clínica</div><div class="value">${escapeHtml(item.impressao || "")}</div></div>
      <div class="block"><div class="label">Conduta</div><div class="value">${escapeHtml(item.conduta || "")}</div></div>
      <script>window.onload = function(){ window.print(); };</script>
    </body>
    </html>
  `;
  janela.document.open();
  janela.document.write(html);
  janela.document.close();
}

function onHospitalSelectionChange() {
  const hospital = getHospitalById(els.hospitalListSelect.value);
  if (hospital?.setorPadrao) els.evolucaoSetorSelect.value = hospital.setorPadrao;
  updateContextBar();
  renderSavedEvolutionSelect();
}

function renderSelectedEvolutionPreview() {
  const id = state.currentEditingEvolutionId || els.savedEvolutionSelect.value;
  const item = getEvolutionById(id);
  if (!item) {
    els.savedEvolutionMeta.textContent = "Nenhuma evolução selecionada.";
    els.savedEvolutionPreview.className = "preview-box empty-output";
    els.savedEvolutionPreview.textContent = "Selecione uma evolução salva para visualizar ou editar.";
    return;
  }

  const hospital = getHospitalById(item.hospitalId)?.nome || "Hospital removido";
  const paciente = getPacienteById(item.pacienteId)?.nome || "Paciente removido";
  const exame = item.exameFisico || {};
  const texto = [
    `H.D.: ${item.hd || ""}`,
    "",
    `H.M.A.: ${item.hma || ""}`,
    "",
    `Comorbidades: ${item.comorbidades || ""}`,
    "",
    `AN: ${exame.an || ""}`,
    `AR: ${exame.ar || ""}`,
    `ACV: ${exame.acv || ""}`,
    `ABD: ${exame.abd || ""}`,
    `EXT: ${exame.ext || ""}`,
    "",
    `Impressão clínica: ${item.impressao || ""}`,
    "",
    `Conduta: ${item.conduta || ""}`
  ].join("\n");

  els.savedEvolutionMeta.textContent = `${hospital} • ${item.setor} • ${paciente}`;
  els.savedEvolutionPreview.className = "preview-box";
  els.savedEvolutionPreview.textContent = texto;
}

function clearEvolucaoForm() {
  els.hdInput.value = "";
  els.hmaInput.value = "";
  els.comorbidadesInput.value = "";
  els.anInput.value = "";
  els.arInput.value = "";
  els.acvInput.value = "";
  els.abdInput.value = "";
  els.extInput.value = "";
  els.impressaoInput.value = "";
  els.condutaInput.value = "";
}

function updateContextBar() {
  const hospital = getHospitalById(els.hospitalListSelect.value);
  const paciente = getPacienteById(els.evolucaoPacienteSelect.value);
  const setor = els.evolucaoSetorSelect.value;
  if (!hospital && !paciente) return els.contextBar.textContent = "Sem contexto selecionado.";
  els.contextBar.textContent = [hospital ? hospital.nome : "Sem hospital", setor || "Sem setor", paciente ? paciente.nome : "Sem paciente"].join(" • ");
}

function analisarPrescricao() {
  const texto = els.prescricaoTextoInput.value.trim();
  if (!texto) return alert("Cole o texto da prescrição primeiro.");

  const linhas = texto.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const categorias = {};
  const naoClassificados = [];
  medicationCategories.forEach(cat => categorias[cat.name] = []);

  linhas.forEach(linha => {
    const lower = linha.toLowerCase();
    let matched = false;
    for (const cat of medicationCategories) {
      if (cat.keywords.some(keyword => lower.includes(keyword))) {
        categorias[cat.name].push(linha);
        matched = true;
        break;
      }
    }
    if (!matched) naoClassificados.push(linha);
  });

  renderPrescriptionCategories(categorias, naoClassificados);
  const saida = buildPrescriptionOutput(categorias, naoClassificados);
  els.prescricaoFormatoInput.value = saida;
  state.prescricaoTexto = els.prescricaoTextoInput.value;
  state.prescricaoFormatada = saida;
  saveState();
}

function renderPrescriptionCategories(categorias, naoClassificados) {
  const blocos = Object.entries(categorias).filter(([, items]) => items.length > 0);
  if (blocos.length === 0 && naoClassificados.length === 0) {
    els.categoriasPrescricao.className = "prescription-output empty-output";
    els.categoriasPrescricao.textContent = "Nenhuma medicação encontrada.";
    return;
  }
  els.categoriasPrescricao.className = "prescription-output";
  els.categoriasPrescricao.innerHTML = "";
  blocos.forEach(([categoria, items]) => {
    const div = document.createElement("div");
    div.className = "prescription-block";
    div.innerHTML = `<h4>${escapeHtml(categoria)}</h4><div>${items.map(item => `• ${escapeHtml(item)}`).join("<br>")}</div>`;
    els.categoriasPrescricao.appendChild(div);
  });
  if (naoClassificados.length) {
    const div = document.createElement("div");
    div.className = "prescription-block";
    div.innerHTML = `<h4>Outros / revisar</h4><div>${naoClassificados.map(item => `• ${escapeHtml(item)}`).join("<br>")}</div>`;
    els.categoriasPrescricao.appendChild(div);
  }
}

function buildPrescriptionOutput(categorias, naoClassificados) {
  const linhas = [];
  Object.entries(categorias).forEach(([categoria, items]) => { if (items.length) linhas.push(`${categoria}: ${items.join("; ")}`); });
  if (naoClassificados.length) linhas.push(`Outros / revisar: ${naoClassificados.join("; ")}`);
  return linhas.join("\n\n");
}

async function copiarPrescricao() {
  const texto = els.prescricaoFormatoInput.value.trim();
  if (!texto) return alert("Não há resultado para copiar.");
  try {
    await navigator.clipboard.writeText(texto);
    alert("Resultado copiado.");
  } catch {
    alert("Não foi possível copiar automaticamente.");
  }
}

function persistPrescriptionText() {
  state.prescricaoTexto = els.prescricaoTextoInput.value;
  saveState();
}
function persistPrescriptionFormat() {
  state.prescricaoFormatada = els.prescricaoFormatoInput.value;
  saveState();
}
function hydratePrescriptionFields() {
  els.prescricaoTextoInput.value = state.prescricaoTexto || "";
  els.prescricaoFormatoInput.value = state.prescricaoFormatada || "";
}

function persistAndRender() {
  saveState();
  renderAll();
}
function renderAll() {
  renderHospitais();
  renderPacientes();
  renderPlantoes();
  renderStats();
  renderSavedEvolutionSelect();
  renderSelectedEvolutionPreview();
  updateContextBar();
}

function renderHospitais() {
  const currentValue = els.hospitalListSelect.value;
  els.hospitalListSelect.innerHTML = "";
  if (state.hospitais.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Cadastre um hospital primeiro";
    els.hospitalListSelect.appendChild(option);
    return;
  }
  state.hospitais.forEach(item => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.nome} • ${item.setorPadrao}`;
    els.hospitalListSelect.appendChild(option);
  });
  const exists = state.hospitais.some(item => item.id === currentValue);
  els.hospitalListSelect.value = exists ? currentValue : state.hospitais[0].id;
  onHospitalSelectionChange();
}

function renderPacientes() {
  if (state.pacientes.length === 0) {
    els.pacienteList.className = "simple-list empty-list";
    els.pacienteList.innerHTML = "<li>Nenhum paciente cadastrado.</li>";
    els.evolucaoPacienteSelect.innerHTML = '<option value="">Cadastre um paciente primeiro</option>';
    return;
  }

  els.pacienteList.className = "simple-list";
  els.pacienteList.innerHTML = "";
  state.pacientes.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item.nome;
    els.pacienteList.appendChild(li);
  });

  const currentValue = els.evolucaoPacienteSelect.value;
  els.evolucaoPacienteSelect.innerHTML = "";
  state.pacientes.forEach(item => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.nome;
    els.evolucaoPacienteSelect.appendChild(option);
  });
  const exists = state.pacientes.some(item => item.id === currentValue);
  els.evolucaoPacienteSelect.value = exists ? currentValue : state.pacientes[0].id;
}

function renderSavedEvolutionSelect() {
  const hospitalId = els.hospitalListSelect.value;
  const filtered = state.evolucoes.filter(item => !hospitalId || item.hospitalId === hospitalId);
  const currentValue = els.savedEvolutionSelect.value;

  els.savedEvolutionSelect.innerHTML = "";
  if (filtered.length === 0) {
    els.savedEvolutionSelect.innerHTML = '<option value="">Nenhuma evolução salva para este hospital</option>';
    return;
  }

  filtered.forEach(item => {
    const paciente = getPacienteById(item.pacienteId)?.nome || "Paciente removido";
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${formatDateTime(item.updatedAt || item.createdAt)} • ${paciente}`;
    els.savedEvolutionSelect.appendChild(option);
  });

  const exists = filtered.some(item => item.id === currentValue);
  els.savedEvolutionSelect.value = exists ? currentValue : (state.currentEditingEvolutionId && filtered.some(item => item.id === state.currentEditingEvolutionId) ? state.currentEditingEvolutionId : filtered[0].id);
}

function renderPlantoes() {
  if (state.plantoes.length === 0) {
    els.plantaoList.className = "record-list empty-list";
    els.plantaoList.innerHTML = "<li>Nenhum plantão salvo.</li>";
  } else {
    els.plantaoList.className = "record-list";
    els.plantaoList.innerHTML = "";
    state.plantoes.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `<div class="record-header"><strong>${formatDate(item.data)} • ${escapeHtml(item.local)}</strong><span>${formatCurrency(item.valor)}</span></div><div class="record-meta">Status: ${item.status}</div>`;
      els.plantaoList.appendChild(li);
    });
  }
  const previsto = state.plantoes.reduce((acc, item) => acc + item.valor, 0);
  const recebido = state.plantoes.filter(item => item.status === "Recebido").reduce((acc, item) => acc + item.valor, 0);
  els.financePrevisto.textContent = formatCurrency(previsto);
  els.financeRecebido.textContent = formatCurrency(recebido);
  els.financePendente.textContent = formatCurrency(previsto - recebido);
}

function renderStats() {
  const previsto = state.plantoes.reduce((acc, item) => acc + item.valor, 0);
  const recebido = state.plantoes.filter(item => item.status === "Recebido").reduce((acc, item) => acc + item.valor, 0);
  els.statHospitais.textContent = String(state.hospitais.length);
  els.statPacientes.textContent = String(state.pacientes.length);
  els.statPlantoes.textContent = String(state.plantoes.length);
  els.statRecebido.textContent = formatCurrency(recebido);
  els.heroTotal.textContent = formatCurrency(previsto);
  els.heroPacientes.textContent = String(state.pacientes.length);
}

function clearAllData() {
  if (!confirm("Isso apagará todos os dados locais do MEEVO neste navegador. Deseja continuar?")) return;
  state = structuredClone(defaultData);
  saveState();
  clearEvolucaoForm();
  hydratePrescriptionFields();
  renderAll();
  els.categoriasPrescricao.className = "prescription-output empty-output";
  els.categoriasPrescricao.textContent = "Nenhuma análise realizada ainda.";
  setActiveView("view-dashboard");
}

function getHospitalById(id) { return state.hospitais.find(item => item.id === id); }
function getPacienteById(id) { return state.pacientes.find(item => item.id === id); }
function getEvolutionById(id) { return state.evolucoes.find(item => item.id === id); }

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultData);
    const parsed = JSON.parse(raw);
    return {
      hospitais: Array.isArray(parsed.hospitais) ? parsed.hospitais : [],
      pacientes: Array.isArray(parsed.pacientes) ? parsed.pacientes : [],
      plantoes: Array.isArray(parsed.plantoes) ? parsed.plantoes : [],
      evolucoes: Array.isArray(parsed.evolucoes) ? parsed.evolucoes : [],
      prescricaoTexto: parsed.prescricaoTexto || "",
      prescricaoFormatada: parsed.prescricaoFormatada || "",
      currentEditingEvolutionId: parsed.currentEditingEvolutionId || null
    };
  } catch {
    return structuredClone(defaultData);
  }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
}
function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("pt-BR").format(date);
}
function formatDateTime(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}
