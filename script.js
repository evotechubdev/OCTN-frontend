document.getElementById("year").textContent = new Date().getFullYear();

const animatedElements = document.querySelectorAll(".reveal");
const views = document.querySelectorAll("[data-view]");
const viewLinks = document.querySelectorAll("[data-view-link]");
const scrollButtons = document.querySelectorAll("[data-scroll-target]");
const validViews = new Set(["home", "consultoria", "servicos", "capacitacao", "formularios"]);

const simulator = document.getElementById("service-simulator");
const serviceCatalog = document.getElementById("service-catalog");
const summaryItems = document.getElementById("summary-items");
const summaryTotal = document.getElementById("summary-total");
const summaryServiceName = document.getElementById("summary-service-name");
const summaryServiceCount = document.getElementById("summary-service-count");
const summarySelectionSuffix = document.getElementById("summary-selection-suffix");
const summaryPlanLabel = document.getElementById("summary-plan-label");
const summaryTotalLabel = document.getElementById("summary-total-label");
const summaryDeliverables = document.getElementById("summary-deliverables");
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const serviceGroups = [
  {
    name: "Consultoria e gestão",
    services: [
      { id: "hora-tecnica", name: "Hora técnica", unit: "hora", unitCents: 16079 },
      { id: "assessoria-rt", name: "Assessoria com responsabilidade técnica", unit: "hora", unitCents: 21428 },
      { id: "assessoria", name: "Assessoria sem responsabilidade técnica", unit: "hora", unitCents: 10714 },
      { id: "consultoria", name: "Consultoria", unit: "hora", unitCents: 16079 },
      { id: "checklist-rdc", name: "Checklist de acordo com a RDC 216/04 Anvisa", unit: "checklist", unitCents: 21428 },
      { id: "auditoria", name: "Auditoria com relatório", unit: "auditoria", unitCents: 430828 },
      { id: "mbp", name: "MBP, POPs, fluxograma e layout", unit: "projeto", unitCents: 430828 },
    ],
  },
  {
    name: "Nutrição clínica e cuidado",
    services: [
      { id: "avaliacao-enteral", name: "Avaliação clínica enteral", unit: "avaliação", unitCents: 42856 },
      { id: "avaliacao-parenteral", name: "Avaliação clínica parenteral", unit: "avaliação", unitCents: 42856 },
      { id: "avaliacao-nutricional", name: "Avaliação nutricional", unit: "avaliação", unitCents: 21428, selected: true },
      { id: "bioimpedancia", name: "Bioimpedância", unit: "avaliação", unitCents: 21428 },
      { id: "consulta-clinica", name: "Consulta clínica", unit: "consulta", unitCents: 21428 },
      { id: "consulta-convenio", name: "Consulta por convênio", unit: "consulta", unitCents: 10714 },
      { id: "consultorio-academia", name: "Consultório em academia", unit: "atendimento", unitCents: 21428 },
      { id: "home-care", name: "Home care — consulta domiciliar", unit: "visita", unitCents: 42856 },
      { id: "orientacao", name: "Orientação nutricional", unit: "orientação", unitCents: 10714 },
      { id: "personal-diet", name: "Personal Diet", unit: "atendimento", unitCents: 42828 },
    ],
  },
  {
    name: "Cardápios e produção",
    services: [
      { id: "cardapio-diario", name: "Cardápio diário", unit: "cardápio", unitCents: 10714 },
      { id: "cardapio-semanal", name: "Cardápio semanal", unit: "cardápio", unitCents: 53570 },
      { id: "cardapio-mensal", name: "Cardápio mensal", unit: "cardápio", unitCents: 214280 },
      { id: "ficha-tecnica", name: "Ficha técnica", unit: "ficha", unitCents: 42856 },
      { id: "rotulagem", name: "Rotulagem nutricional", unit: "rótulo", unitCents: 16079 },
    ],
  },
  {
    name: "Educação e capacitação",
    services: [
      { id: "educacao-nutricional", name: "Atividade de educação nutricional", unit: "atividade", unitCents: 16079 },
      { id: "palestra", name: "Palestra", unit: "participante", unitCents: 16079 },
      { id: "treinamento-rt", name: "Treinamento e capacitação em RT", unit: "hora", unitCents: 16079 },
    ],
  },
];

const servicesById = new Map(
  serviceGroups.flatMap((group) => group.services).map((service) => [service.id, service])
);

const fnnOfficialNames = {
  "hora-tecnica": "Hora Técnica",
  "assessoria-rt": "Assessoria com RT - (por hora)",
  assessoria: "Assessoria sem RT - (por hora)",
  consultoria: "Consultoria - (por hora)",
  "checklist-rdc": "CheckList de Acordo com RDC 216/04 ANVISA",
  auditoria: "Auditoria com Relatório",
  mbp: "MBP - (POP’s, Fluxograma, Layout)",
  "avaliacao-enteral": "Avaliação Clínica Enteral",
  "avaliacao-parenteral": "Avaliação Clínica Parenteral",
  "avaliacao-nutricional": "Avaliação Nutricional",
  bioimpedancia: "Bioimpedância",
  "consulta-clinica": "Consulta Clínica",
  "consulta-convenio": "Consulta Convênio",
  "consultorio-academia": "Consultório - (academia)",
  "home-care": "Home Care - (consulta domiciliar / por visita)",
  orientacao: "Orientação Nutricional",
  "personal-diet": "Personal Diet",
  "cardapio-diario": "Cardápio Diário",
  "cardapio-semanal": "Cardápio Semanal",
  "cardapio-mensal": "Cardápio Mensal",
  "ficha-tecnica": "Ficha Técnica - (por ficha)",
  rotulagem: "Rotulagem Nutricional - (por rótulo)",
  "educacao-nutricional": "Atividade de Educação Nutricional",
  palestra: "Palestra - (por participante)",
  "treinamento-rt": "Treinamento Capacitação RT - (por hora)",
};

function setOutput(id, value) {
  document.getElementById(id).textContent = value;
}

function renderServiceCatalog() {
  if (!serviceCatalog) return;

  serviceCatalog.innerHTML = serviceGroups
    .map(
      (group, groupIndex) => `
        <details class="service-group" ${groupIndex === 1 || groupIndex === 2 ? "open" : ""}>
          <summary>
            <span>${group.name}</span>
            <small>${group.services.length} ${group.services.length === 1 ? "serviço" : "serviços"}</small>
          </summary>
          <div class="service-group-list">
            ${group.services
              .map(
                (service) => `
                  <div class="catalog-service" data-service-row>
                    <label class="catalog-service-select" data-fnn-name="${fnnOfficialNames[service.id] ?? service.name}">
                      <input type="checkbox" name="selected-service" value="${service.id}" ${service.selected ? "checked" : ""} />
                      <span>
                        <strong>${service.name}</strong>
                        <small>Por ${service.unit} · referência FNN 2026</small>
                      </span>
                      <b>${currency.format(service.unitCents / 100)}</b>
                    </label>
                    <label class="catalog-quantity">
                      <span data-quantity-label>Qtd./mês</span>
                      <input
                        type="number"
                        name="quantity-${service.id}"
                        min="1"
                        max="500"
                        step="1"
                        value="1"
                        inputmode="numeric"
                        aria-label="Quantidade de ${service.name}"
                        ${service.selected ? "" : "disabled"}
                      />
                    </label>
                  </div>
                `
              )
              .join("")}
          </div>
        </details>
      `
    )
    .join("");
}

function getSelectedServices() {
  return [...simulator.querySelectorAll('input[name="selected-service"]:checked')].map((checkbox) => {
    const service = servicesById.get(checkbox.value);
    const quantityInput = simulator.elements[`quantity-${checkbox.value}`];
    const parsedQuantity = Number.parseInt(quantityInput.value, 10) || 1;
    const quantity = Math.min(500, Math.max(1, parsedQuantity));
    quantityInput.value = quantity;
    return { ...service, quantity, subtotalCents: service.unitCents * quantity };
  });
}

function updateSimulation() {
  if (!simulator) return;

  const planType = simulator.elements["plan-type"].value;
  const isMonthly = planType === "mensal";

  simulator.querySelectorAll("[data-service-row]").forEach((row) => {
    const checkbox = row.querySelector('input[name="selected-service"]');
    const quantityInput = row.querySelector('input[type="number"]');
    quantityInput.disabled = !checkbox.checked;
    row.classList.toggle("selected", checkbox.checked);
  });
  simulator.querySelectorAll("[data-quantity-label]").forEach((label) => {
    label.textContent = isMonthly ? "Qtd./mês" : "Quantidade";
  });

  const selectedServices = getSelectedServices();
  const totalCents = selectedServices.reduce((sum, service) => sum + service.subtotalCents, 0);
  const serviceCount = selectedServices.length;

  summaryItems.innerHTML = serviceCount
    ? selectedServices
        .map(
          (service) =>
            `<div class="summary-row" role="row"><span role="cell"><strong>${service.name}</strong><small>${service.quantity} × ${currency.format(service.unitCents / 100)} por ${service.unit}</small></span><span role="cell">${currency.format(service.subtotalCents / 100)}</span></div>`
        )
        .join("")
    : '<div class="summary-empty">Selecione ao menos um serviço para montar a proposta.</div>';

  summaryTotal.textContent = currency.format(totalCents / 100);
  summaryPlanLabel.textContent = isMonthly ? "Resumo mensal" : "Resumo avulso";
  summaryServiceName.textContent = isMonthly ? "Plano mensal personalizado" : "Plano avulso personalizado";
  summaryTotalLabel.textContent = isMonthly ? "Mensalidade estimada" : "Total estimado";
  summaryServiceCount.textContent = `${serviceCount} ${serviceCount === 1 ? "serviço" : "serviços"}`;
  summarySelectionSuffix.textContent = serviceCount === 1 ? "selecionado" : "selecionados";

  const frequencyText = isMonthly ? "por mês" : "nesta contratação";
  summaryDeliverables.innerHTML = selectedServices
    .map((service) => `<li>${service.quantity} × ${service.name} ${frequencyText}</li>`)
    .join("");

  const scopeItems = selectedServices.map(
    (service) => `${service.name} (${service.quantity} × ${service.unit})`
  );
  const scopeDescription = scopeItems.length ? scopeItems.join("; ") : "serviços a definir";
  const paymentValue = currency.format(totalCents / 100);

  setOutput(
    "contract-object-output",
    isMonthly
      ? `Prestação mensal recorrente dos seguintes serviços: ${scopeDescription}.`
      : `Prestação avulsa dos seguintes serviços: ${scopeDescription}.`
  );
  setOutput(
    "contract-payment-output",
    isMonthly
      ? `A CONTRATANTE pagará à CONTRATADA a mensalidade de ${paymentValue}.`
      : `A CONTRATANTE pagará à CONTRATADA o valor total de ${paymentValue}.`
  );

  document.getElementById("contract-payment-title").textContent = isMonthly ? "Mensalidade." : "Pagamento.";
  document.getElementById("contract-payment-terms").innerHTML = isMonthly
    ? 'O pagamento vencerá no dia <span class="handwrite-line handwrite-day"></span> de cada mês, com início em <span class="handwrite-line handwrite-date"></span>.'
    : 'O pagamento será realizado na forma e nas datas acordadas entre as partes: <span class="handwrite-line handwrite-full"></span>.';
  document.getElementById("contract-adjustment-clause").hidden = !isMonthly;
  document.getElementById("contract-term-output").innerHTML = isMonthly
    ? 'O contrato vigorará pelo prazo de <span class="handwrite-line handwrite-day"></span> meses, a partir de <span class="handwrite-line handwrite-date"></span>, ou por prazo indeterminado se assinalado: (&nbsp;&nbsp;) indeterminado. Qualquer parte poderá encerrar a parceria mediante aviso escrito com antecedência mínima de 30 dias, sem prejuízo dos valores já vencidos.'
    : 'A contratação vigorará até a conclusão e entrega do escopo avulso, prevista para <span class="handwrite-line handwrite-date"></span>, preservadas as obrigações já assumidas pelas partes.';
}

function activateView(viewName, shouldScroll = true) {
  const requestedView = validViews.has(viewName) ? viewName : "home";
  const selectedView = requestedView === "formularios" && !isAuthenticated() ? "home" : requestedView;

  views.forEach((view) => {
    const isActive = view.dataset.view === selectedView;
    view.hidden = !isActive;
    view.classList.toggle("active", isActive);
  });

  viewLinks.forEach((link) => {
    const isActive = link.dataset.viewLink === selectedView;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  document.title =
    selectedView === "consultoria"
      ? "Consultoria | OCTN"
      : selectedView === "servicos"
        ? "Serviços | OCTN"
      : selectedView === "capacitacao"
        ? "Capacitação | OCTN"
      : selectedView === "formularios"
        ? "Formulários | OCTN"
        : "OCTN | Consultoria Técnica Nutricional";

  if (shouldScroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

viewLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const targetView = link.dataset.viewLink;
    history.pushState(null, "", `#${targetView}`);
    activateView(targetView);
  });
});

window.addEventListener("popstate", () => {
  activateView(window.location.hash.slice(1), false);
});

scrollButtons.forEach((button) => {
  button.addEventListener("click", () => {
    document
      .getElementById(button.dataset.scrollTarget)
      ?.scrollIntoView({ behavior: "smooth" });
  });
});

if (simulator) {
  renderServiceCatalog();
  simulator.addEventListener("input", updateSimulation);
  simulator.addEventListener("change", updateSimulation);
  simulator.addEventListener("reset", () => window.setTimeout(updateSimulation, 0));

  document.getElementById("simulation-date").textContent = new Intl.DateTimeFormat("pt-BR").format(new Date());
  document.getElementById("print-simulation").addEventListener("click", () => {
    updateSimulation();
    window.print();
  });

  updateSimulation();
}

const initialView = window.location.hash.slice(1);
activateView(validViews.has(initialView) ? initialView : "home", false);

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  animatedElements.forEach((element) => observer.observe(element));
} else {
  animatedElements.forEach((element) => element.classList.add("visible"));
}

// Área profissional e banco local de diagnósticos ILPI.
const ILPI_STORAGE_KEY = "octn.ilpi.reports.v1";
const AUTH_SESSION_KEY = "octn.admin.session";
const ilpiForm = document.getElementById("ilpi-form");
const formsDashboard = document.getElementById("forms-dashboard");
const ilpiWorkspace = document.getElementById("ilpi-workspace");
let currentReportId = null;
let formIsDirty = false;

const healthItems = ["Diabetes mellitus", "Hipertensão arterial", "Demência/Alzheimer", "Disfagia", "Perda de peso recente", "Baixa aceitação alimentar", "Feridas/lesão por pressão", "Uso de suplemento nutricional", "Outras condições relevantes"];
const mealItems = ["Café da manhã", "Colação", "Almoço", "Lanche da tarde", "Jantar", "Ceia"];
const kitchenItems = [
  "Cozinha apresenta condições adequadas de organização",
  "Equipamentos disponíveis são suficientes para a produção",
  "Há espaço adequado para armazenamento dos alimentos",
  "Geladeira/freezer apresentam condições adequadas de uso",
  "Alimentos são armazenados de forma organizada",
  "Produtos possuem identificação e controle de validade",
  "Há separação entre alimentos crus e prontos para consumo",
  "Alimentos não são armazenados diretamente no chão",
  "Manipuladora utiliza vestimenta adequada",
  "Higienização das mãos é realizada adequadamente",
  "Há rotina de higienização de frutas e hortaliças",
  "Utensílios e superfícies apresentam boas condições",
  "Existe controle de temperatura dos alimentos",
  "Há organização da produção das refeições",
  "A cozinheira recebeu treinamento em boas práticas"
];
const observationItems = ["Apresentação da refeição", "Temperatura adequada", "Consistência adequada", "Porcionamento", "Aceitação pelos residentes", "Auxílio durante a alimentação", "Posicionamento dos idosos", "Ambiente durante a refeição"];

function isAuthenticated() {
  return sessionStorage.getItem("octn.admin.session") === "authenticated";
}

function updateAuthUI() {
  const authenticated = isAuthenticated();
  document.getElementById("forms-nav").hidden = !authenticated;
  document.getElementById("login-form").hidden = authenticated;
  document.getElementById("logged-panel").hidden = !authenticated;
}

function logout() {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  updateAuthUI();
  history.pushState(null, "", "#home");
  activateView("home");
  document.getElementById("acesso")?.scrollIntoView({ behavior: "smooth" });
}

document.getElementById("login-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = new FormData(event.currentTarget);
  const message = document.getElementById("login-message");
  if (values.get("username") === "admin" && values.get("password") === "1234") {
    sessionStorage.setItem(AUTH_SESSION_KEY, "authenticated");
    message.textContent = "";
    event.currentTarget.reset();
    updateAuthUI();
    history.pushState(null, "", "#formularios");
    activateView("formularios");
  } else {
    message.textContent = "Login ou senha inválidos.";
  }
});
document.getElementById("logout-button")?.addEventListener("click", logout);
document.querySelectorAll("[data-logout]").forEach((button) => button.addEventListener("click", logout));
updateAuthUI();

function textInput(name, value = "", type = "text") {
  return `<input type="${type}" data-field="${name}" value="${escapeAttribute(value)}" />`;
}

function selectInput(name, options, value = "") {
  return `<select data-field="${name}">${options.map((option) => `<option ${option === value ? "selected" : ""}>${option}</option>`).join("")}</select>`;
}

function escapeAttribute(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function renderFixedRows(data = {}) {
  document.getElementById("health-rows").innerHTML = healthItems.map((item, index) => `<tr><td>${item}</td><td><input type="number" min="0" name="health${index}Count" value="${escapeAttribute(data[`health${index}Count`] || "")}" /></td><td><input name="health${index}Note" value="${escapeAttribute(data[`health${index}Note`] || "")}" /></td></tr>`).join("");
  document.getElementById("meal-rows").innerHTML = mealItems.map((item, index) => `<tr><td>${item}</td><td><input type="time" name="meal${index}Time" value="${escapeAttribute(data[`meal${index}Time`] || "")}" /></td><td><input name="meal${index}Note" value="${escapeAttribute(data[`meal${index}Note`] || "")}" /></td></tr>`).join("");
  document.getElementById("kitchen-rows").innerHTML = kitchenItems.map((item, index) => `<tr><td>${item}</td><td><select name="kitchen${index}Status"><option value="">Selecione</option><option>S</option><option>N</option><option>NA</option></select></td><td><input name="kitchen${index}Note" /></td></tr>`).join("");
  document.getElementById("observation-rows").innerHTML = observationItems.map((item, index) => `<tr><td>${item}</td><td><select name="observation${index}Status"><option value="">Selecione</option><option>Adequado</option><option>Parcial</option><option>Inadequado</option><option>Não observado</option></select></td><td><input name="observation${index}Note" /></td></tr>`).join("");
}

function addResidentRow(resident = {}) {
  const row = document.createElement("tr");
  row.innerHTML = `<td>${textInput("name", resident.name)}</td><td>${textInput("age", resident.age, "number")}</td><td>${textInput("diagnosis", resident.diagnosis)}</td><td>${selectInput("bedridden", ["Não", "Sim"], resident.bedridden)}</td><td>${selectInput("weightLoss", ["Não", "Sim"], resident.weightLoss)}</td><td>${textInput("specialDiet", resident.specialDiet)}</td><td>${selectInput("priority", ["Baixa", "Moderada", "Alta", "Imediata"], resident.priority || "Baixa")}</td><td><button class="remove-row" type="button" aria-label="Remover residente">×</button></td>`;
  row.querySelector(".remove-row").addEventListener("click", () => { row.remove(); markDirty(); });
  document.getElementById("resident-rows").appendChild(row);
}

function addActionRow(action = {}) {
  const row = document.createElement("tr");
  row.innerHTML = `<td>${textInput("action", action.action)}</td><td>${selectInput("priority", ["Imediata", "Alta", "Moderada", "Baixa"], action.priority || "Moderada")}</td><td>${textInput("responsible", action.responsible)}</td><td>${textInput("deadline", action.deadline)}</td><td>${selectInput("status", ["Pendente", "Em andamento", "Concluída"], action.status || "Pendente")}</td><td><button class="remove-row" type="button" aria-label="Remover ação">×</button></td>`;
  row.querySelector(".remove-row").addEventListener("click", () => { row.remove(); markDirty(); });
  document.getElementById("action-rows").appendChild(row);
}

function getReports() {
  try { return JSON.parse(localStorage.getItem(ILPI_STORAGE_KEY)) || []; }
  catch { return []; }
}

function persistReports(reports) {
  localStorage.setItem(ILPI_STORAGE_KEY, JSON.stringify(reports));
}

function createImportedReport() {
  return {
    id: "ilpi-gerovinda-2026-09-10",
    createdAt: "2026-09-10T12:00:00.000Z",
    updatedAt: new Date().toISOString(),
    data: {
      reportNumber: "OCTN-ILPI-2026-001", version: "1.0", status: "Em elaboração",
      subtitle: "Diagnóstico inicial do serviço de alimentação e nutrição", issueCity: "Salvador/BA",
      institutionName: "Gerovinda", address: "Rua Geraldo Brasil, nº 3, Cajazeiras 11, Salvador/BA, CEP 41347-278",
      institutionManager: "Joseane Carvalho Lima", phone: "(71) 99983-6631", activityStart: "2026-02-10", visitDate: "2026-09-10",
      nutritionist: "Grazielle Matos", crn: "17272", totalResidents: "12", independentResidents: "4",
      partialResidents: "2", dependentResidents: "6", bedriddenResidents: "3", foodEmployees: "1",
      health0Count: "4", health1Count: "12", health2Count: "2", health3Count: "0", health4Count: "4", health5Count: "1", health6Count: "0", health7Count: "1",
      mealsPerDay: "4", plannedMenu: "Não", mealPlanner: "Cozinheira ou Joseane", acceptanceRecord: "", specialDiets: "Sim", specialDietsDetails: "Demência e Alzheimer — especificar a adaptação dietética adotada.",
      meal0Time: "08:00", meal1Time: "10:00", meal2Time: "12:00", meal3Time: "15:00", meal4Time: "18:30", meal5Time: "",
      residents: [], actions: [], reviewConfirmed: ""
    }
  };
}

function seedLocalDatabase() {
  if (localStorage.getItem(ILPI_STORAGE_KEY) === null) persistReports([createImportedReport()]);
}

function collectDynamicRows(containerId) {
  return [...document.querySelectorAll(`#${containerId} tr`)]
    .map((row) => Object.fromEntries([...row.querySelectorAll("[data-field]")].map((input) => [input.dataset.field, input.value])))
    .filter((item) => containerId === "action-rows" ? item.action?.trim() : [item.name, item.age, item.diagnosis, item.specialDiet].some((value) => value?.trim()));
}

function collectFormData() {
  const data = Object.fromEntries(new FormData(ilpiForm).entries());
  data.residents = collectDynamicRows("resident-rows");
  data.actions = collectDynamicRows("action-rows");
  data.reviewConfirmed = ilpiForm.elements.reviewConfirmed.checked ? "Sim" : "";
  return data;
}

function setFormValues(data) {
  [...ilpiForm.elements].forEach((element) => {
    if (!element.name || element.type === "hidden") return;
    if (element.type === "radio") element.checked = data[element.name] === element.value;
    else if (element.type === "checkbox") element.checked = data[element.name] === element.value;
    else element.value = data[element.name] ?? "";
  });
}

function defaultNewReportData() {
  const reports = getReports();
  const number = String(reports.length + 1).padStart(3, "0");
  return { reportNumber: `OCTN-ILPI-${new Date().getFullYear()}-${number}`, version: "1.0", status: "Em elaboração", subtitle: "Diagnóstico inicial do serviço de alimentação e nutrição", issueCity: "Salvador/BA", nutritionist: "Grazielle Matos", crn: "17272", residents: [], actions: [] };
}

function openReport(report = null) {
  currentReportId = report?.id || crypto.randomUUID?.() || `ilpi-${Date.now()}`;
  const data = report?.data || defaultNewReportData();
  ilpiForm.reset();
  renderFixedRows(data);
  setFormValues(data);
  document.getElementById("resident-rows").innerHTML = "";
  (data.residents?.length ? data.residents : [{}, {}, {}, {}]).forEach(addResidentRow);
  document.getElementById("action-rows").innerHTML = "";
  (data.actions?.length ? data.actions : [{}, {}, {}]).forEach(addActionRow);
  ilpiForm.elements.reportId.value = currentReportId;
  formsDashboard.hidden = true;
  ilpiWorkspace.hidden = false;
  document.getElementById("current-report-label").textContent = data.institutionName || "Novo diagnóstico";
  formIsDirty = false;
  updateSaveIndicator();
  updateFormInsights();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function saveCurrentReport() {
  if (!ilpiForm) return;
  const data = collectFormData();
  const reports = getReports();
  const index = reports.findIndex((report) => report.id === currentReportId);
  const now = new Date().toISOString();
  const record = { id: currentReportId, createdAt: index >= 0 ? reports[index].createdAt : now, updatedAt: now, data };
  if (index >= 0) reports[index] = record; else reports.unshift(record);
  persistReports(reports);
  formIsDirty = false;
  updateSaveIndicator("Salvo neste navegador");
  document.getElementById("current-report-label").textContent = data.institutionName || "Novo diagnóstico";
  renderSavedReports();
  return record;
}

function formatDate(value) {
  if (!value) return "Não informado";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function renderSavedReports() {
  const container = document.getElementById("saved-reports");
  const reports = getReports().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  container.innerHTML = reports.length ? reports.map((report) => `<article class="saved-report" data-report-id="${escapeAttribute(report.id)}"><div><strong>${escapeHtml(report.data.institutionName || "Instituição não informada")}</strong><span>${escapeHtml(report.data.reportNumber || "Sem número")}</span></div><div><strong>${formatDate(report.data.visitDate)}</strong><small>Data da visita</small></div><div><span class="status-pill">${escapeHtml(report.data.status || "Em elaboração")}</span><small>Atualizado ${formatDateTime(report.updatedAt)}</small></div><div class="report-actions"><button type="button" data-edit-report>Editar</button><button class="delete-report" type="button" data-delete-report>Excluir</button></div></article>`).join("") : '<div class="empty-reports">Nenhum relatório salvo. Crie o primeiro diagnóstico ILPI.</div>';
}

function updateSaveIndicator(customText) {
  const indicator = document.getElementById("save-indicator");
  indicator.textContent = customText || (formIsDirty ? "Alterações não salvas" : "Documento carregado");
}

function markDirty() {
  formIsDirty = true;
  updateSaveIndicator();
  updateFormInsights();
}

function updateFormInsights() {
  if (!ilpiForm) return;
  const basicFields = [...ilpiForm.querySelectorAll('input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]), select, textarea')];
  const radioNames = [...new Set([...ilpiForm.querySelectorAll('input[type="radio"]')].map((input) => input.name))];
  const completedBasics = basicFields.filter((field) => field.value.trim()).length;
  const completedRadios = radioNames.filter((name) => ilpiForm.querySelector(`input[name="${name}"]:checked`)).length;
  const total = basicFields.length + radioNames.length;
  const percent = total ? Math.round(((completedBasics + completedRadios) / total) * 100) : 0;
  document.getElementById("form-progress").style.width = `${percent}%`;
  document.getElementById("form-progress-text").textContent = `${percent}% preenchido`;

  const totalResidents = Number(ilpiForm.elements.totalResidents.value || 0);
  const dependencyTotal = ["independentResidents", "partialResidents", "dependentResidents"].reduce((sum, name) => sum + Number(ilpiForm.elements[name].value || 0), 0);
  const note = document.getElementById("resident-count-note");
  note.classList.toggle("warning", Boolean(totalResidents && dependencyTotal !== totalResidents));
  note.textContent = totalResidents ? (dependencyTotal === totalResidents ? `Conferência: os graus de dependência somam ${dependencyTotal} residentes.` : `Atenção: os graus de dependência somam ${dependencyTotal}, mas o total informado é ${totalResidents}.`) : "Informe o total de residentes para ativar a conferência automática.";

  const scheduledMeals = mealItems.filter((_, index) => ilpiForm.elements[`meal${index}Time`]?.value).length;
  const informedMeals = Number(ilpiForm.elements.mealsPerDay.value || 0);
  const mealNote = document.getElementById("meal-count-note");
  mealNote.classList.toggle("warning", Boolean(informedMeals && scheduledMeals !== informedMeals));
  mealNote.textContent = informedMeals ? (scheduledMeals === informedMeals ? `Conferência: ${scheduledMeals} horários preenchidos para ${informedMeals} refeições diárias.` : `Atenção: há ${scheduledMeals} horários preenchidos, mas foram informadas ${informedMeals} refeições diárias.`) : "Informe o número de refeições diárias para ativar a conferência automática.";

  const data = collectFormData();
  const kitchenStatuses = kitchenItems.map((_, index) => data[`kitchen${index}Status`]);
  const applicable = kitchenStatuses.filter((status) => status === "S" || status === "N");
  const compliance = applicable.length ? Math.round((applicable.filter((status) => status === "S").length / applicable.length) * 100) : 0;
  document.getElementById("review-cards").innerHTML = `<div class="review-card"><span>Preenchimento geral</span><strong>${percent}%</strong></div><div class="review-card"><span>Conformidade observada</span><strong>${applicable.length ? `${compliance}%` : "Aguardando avaliação"}</strong></div><div class="review-card"><span>Plano de ação</span><strong>${data.actions.length} ${data.actions.length === 1 ? "ação" : "ações"}</strong></div>`;
}

function setupSectionNavigation() {
  const sections = [...ilpiForm.querySelectorAll(".form-section")];
  const navigation = document.getElementById("form-section-nav");
  navigation.innerHTML = sections.map((section) => `<button type="button" data-section-target="${section.id}">${section.dataset.sectionTitle}</button>`).join("");
  navigation.addEventListener("click", (event) => {
    const button = event.target.closest("[data-section-target]");
    if (button) document.getElementById(button.dataset.sectionTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

document.getElementById("new-ilpi")?.addEventListener("click", () => openReport());
document.getElementById("back-to-forms")?.addEventListener("click", () => {
  if (formIsDirty && !confirm("Há alterações não salvas. Deseja voltar mesmo assim?")) return;
  ilpiWorkspace.hidden = true;
  formsDashboard.hidden = false;
  renderSavedReports();
});
document.getElementById("add-resident")?.addEventListener("click", () => { addResidentRow(); markDirty(); });
document.getElementById("add-action")?.addEventListener("click", () => { addActionRow(); markDirty(); });
document.getElementById("save-ilpi")?.addEventListener("click", saveCurrentReport);
document.querySelectorAll("[data-save]").forEach((button) => button.addEventListener("click", saveCurrentReport));
ilpiForm?.addEventListener("input", markDirty);
ilpiForm?.addEventListener("change", markDirty);
document.getElementById("saved-reports")?.addEventListener("click", (event) => {
  const card = event.target.closest("[data-report-id]");
  if (!card) return;
  const reports = getReports();
  const report = reports.find((item) => item.id === card.dataset.reportId);
  if (event.target.closest("[data-edit-report]")) openReport(report);
  if (event.target.closest("[data-delete-report]") && confirm(`Excluir o relatório de ${report?.data.institutionName || "esta instituição"}? Esta ação não pode ser desfeita.`)) {
    persistReports(reports.filter((item) => item.id !== card.dataset.reportId));
    renderSavedReports();
  }
});

seedLocalDatabase();
renderFixedRows();
setupSectionNavigation();
renderSavedReports();

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function shown(value, fallback = "Não informado") {
  return value === 0 || String(value ?? "").trim() ? escapeHtml(value) : fallback;
}

function reportField(label, value, full = false) {
  return `<div class="report-field ${full ? "full" : ""}"><span>${label}</span><strong>${shown(value)}</strong></div>`;
}

function reportHeader(data) {
  return `<header class="report-header"><img src="./public/imagens_pub/OCTN.png" alt="OCTN" /><div><strong>${shown(data.reportNumber, "Relatório ILPI")}</strong><small>Versão ${shown(data.version, "1.0")} · ${shown(data.status, "Em elaboração")}</small></div></header>`;
}

function reportFooter(data, page, total) {
  return `<footer class="report-page-footer"><span>OCTN · Documento técnico confidencial</span><span>${shown(data.institutionName, "ILPI")} · Página ${page} de ${total}</span></footer>`;
}

function reportPage(data, kicker, title, content, page, total) {
  return `<section class="report-page">${reportHeader(data)}<h2><span>${kicker}</span>${title}</h2>${content}${reportFooter(data, page, total)}</section>`;
}

function reportTable(headers, rows, emptyText = "Sem registros informados") {
  const body = rows.length ? rows.map((row) => `<tr>${row.map((cell) => `<td>${shown(cell, "—")}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${headers.length}">${emptyText}</td></tr>`;
  return `<table class="report-table"><thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table>`;
}

function buildReportHtml(data) {
  const totalPages = 7;
  const kitchenRows = kitchenItems.map((item, index) => [item, data[`kitchen${index}Status`], data[`kitchen${index}Note`]]);
  const applicable = kitchenRows.filter((row) => row[1] === "S" || row[1] === "N");
  const compliant = applicable.filter((row) => row[1] === "S").length;
  const nonCompliant = applicable.filter((row) => row[1] === "N").length;
  const compliance = applicable.length ? `${Math.round((compliant / applicable.length) * 100)}%` : "—";
  const highPriorityResidents = (data.residents || []).filter((resident) => resident.priority === "Alta" || resident.priority === "Imediata").length;
  const total = Number(data.totalResidents || 0);
  const diabetes = Number(data.health0Count || 0);
  const hypertension = Number(data.health1Count || 0);
  const weightLoss = Number(data.health4Count || 0);
  const executiveSummary = `A visita técnica realizada em ${formatDate(data.visitDate)} caracterizou uma instituição com ${shown(data.totalResidents, "quantitativo não informado")} residentes e ${shown(data.foodEmployees, "quantitativo não informado")} profissional(is) envolvido(s) na alimentação. Foram informados ${diabetes} caso(s) de diabetes mellitus, ${hypertension} de hipertensão arterial e ${weightLoss} de perda de peso recente. Na avaliação inicial do serviço de alimentação, ${applicable.length} item(ns) foram classificados como aplicáveis, com índice descritivo de ${compliance} de respostas conformes. Os achados devem ser interpretados em conjunto com o parecer e o plano de ação.`;

  const cover = `<section class="report-page report-cover"><div class="report-cover-brand"><img src="./public/imagens_pub/OCTN.png" alt="OCTN" /><span>Consultoria Técnica Nutricional</span></div><div class="report-cover-title"><span class="report-type">Relatório técnico</span><h1>Diagnóstico Nutricional Inicial — ILPI</h1><p>${shown(data.subtitle, "Avaliação inicial do serviço de alimentação, do perfil assistencial e das prioridades nutricionais")}</p><table class="cover-client"><tr><td>Instituição</td><td>${shown(data.institutionName)}</td></tr><tr><td>Responsável</td><td>${shown(data.institutionManager)}</td></tr><tr><td>Data da visita</td><td>${formatDate(data.visitDate)}</td></tr><tr><td>Nutricionista</td><td>${shown(data.nutritionist)} · ${shown(data.crn)}</td></tr></table></div><div class="cover-footer"><span>${shown(data.issueCity, "Brasil")} · ${new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date())}</span><span>${shown(data.reportNumber, "OCTN · ILPI")} · Versão ${shown(data.version, "1.0")}</span></div></section>`;

  const page2 = reportPage(data, "Resumo executivo", "Visão geral do diagnóstico", `<p class="report-paragraph">${executiveSummary}</p><div class="metric-grid"><div class="metric"><span>Residentes</span><strong>${shown(data.totalResidents, "—")}</strong></div><div class="metric"><span>Residentes acamados</span><strong>${shown(data.bedriddenResidents, "—")}</strong></div><div class="metric"><span>Conformidade descritiva</span><strong>${compliance}</strong></div><div class="metric"><span>Não conformidades</span><strong>${applicable.length ? nonCompliant : "—"}</strong></div></div><h3>Identificação da instituição</h3><div class="report-grid">${reportField("Nome da instituição", data.institutionName, true)}${reportField("Endereço", data.address, true)}${reportField("Responsável", data.institutionManager)}${reportField("Telefone", data.phone)}${reportField("Início das atividades", formatDate(data.activityStart))}${reportField("Data da visita", formatDate(data.visitDate))}${reportField("CNPJ", data.cnpj)}${reportField("E-mail", data.email)}</div><h3>Caracterização</h3>${reportTable(["Indicador", "Quantidade"], [["Total de residentes", data.totalResidents], ["Idosos independentes", data.independentResidents], ["Idosos parcialmente dependentes", data.partialResidents], ["Idosos dependentes", data.dependentResidents], ["Idosos acamados", data.bedriddenResidents], ["Funcionários envolvidos na alimentação", data.foodEmployees]])}<p class="report-note"><strong>Nota técnica:</strong> o percentual apresentado é um indicador descritivo deste levantamento inicial. Não constitui certificação, licenciamento sanitário ou substituição de inspeção oficial.</p>`, 2, totalPages);

  const healthRows = healthItems.map((item, index) => [item, data[`health${index}Count`], data[`health${index}Note`]]);
  const mealRows = mealItems.map((item, index) => [item, data[`meal${index}Time`], data[`meal${index}Note`]]);
  const scheduledMealCount = mealItems.filter((_, index) => data[`meal${index}Time`]).length;
  const page3 = reportPage(data, "Seções 03 e 04", "Perfil de saúde e rotina alimentar", `<h3>Perfil de saúde dos residentes</h3>${reportTable(["Condição / característica", "Nº de idosos", "Observações"], healthRows)}<h3>Organização da rotina alimentar</h3><div class="report-grid">${reportField("Refeições oferecidas por dia", data.mealsPerDay)}${reportField("Existe cardápio planejado", data.plannedMenu)}${reportField("Quem define as refeições", data.mealPlanner, true)}${reportField("Existem dietas especiais", data.specialDiets)}${reportField("Há registro de aceitação alimentar", data.acceptanceRecord)}${reportField("Dietas especiais / critérios", data.specialDietsDetails, true)}</div>${reportTable(["Refeição", "Horário", "Preparação / observações"], mealRows)}${total && (diabetes > total || hypertension > total || weightLoss > total) ? '<p class="report-note"><strong>Conferência necessária:</strong> há uma condição clínica com quantitativo superior ao total de residentes informado.</p>' : ""}${Number(data.mealsPerDay || 0) && scheduledMealCount !== Number(data.mealsPerDay) ? `<p class="report-note"><strong>Conferência necessária:</strong> foram registrados ${scheduledMealCount} horários, enquanto o total informado é de ${shown(data.mealsPerDay)} refeições diárias.</p>` : ""}`, 3, totalPages);

  const residentRows = (data.residents || []).filter((resident) => resident.name || resident.diagnosis).map((resident) => [resident.name, resident.age, resident.diagnosis, resident.bedridden, resident.weightLoss, resident.specialDiet, resident.priority]);
  const page4 = reportPage(data, "Seção 05", "Levantamento geral dos residentes", `<div class="metric-grid"><div class="metric"><span>Registros individualizados</span><strong>${residentRows.length}</strong></div><div class="metric"><span>Prioridade alta/imediata</span><strong>${highPriorityResidents}</strong></div><div class="metric"><span>Perda de peso informada</span><strong>${shown(data.health4Count, "—")}</strong></div><div class="metric"><span>Uso de suplemento</span><strong>${shown(data.health7Count, "—")}</strong></div></div>${reportTable(["Nome / identificação", "Idade", "Diagnóstico", "Acamado", "Perda de peso", "Dieta especial", "Prioridade"], residentRows)}<p class="report-note"><strong>Confidencialidade:</strong> esta página contém dados relacionados à saúde. O documento deve ser compartilhado apenas com pessoas autorizadas e armazenado conforme as políticas de privacidade aplicáveis.</p>`, 4, totalPages);

  const observationRows = observationItems.map((item, index) => [item, data[`observation${index}Status`], data[`observation${index}Note`]]);
  const page5 = reportPage(data, "Seções 06 e 08", "Avaliação do serviço de alimentação", `<div class="metric-grid"><div class="metric"><span>Itens avaliados</span><strong>${applicable.length}</strong></div><div class="metric"><span>Respostas conformes</span><strong>${applicable.length ? compliant : "—"}</strong></div><div class="metric"><span>Não conformidades</span><strong>${applicable.length ? nonCompliant : "—"}</strong></div><div class="metric"><span>Índice descritivo</span><strong>${compliance}</strong></div></div><h3>Visita técnica à cozinha</h3>${reportTable(["Item avaliado", "S / N / NA", "Observações / evidência"], kitchenRows)}<h3>Observação da refeição</h3>${reportTable(["Aspecto observado", "Avaliação", "Observações"], observationRows)}`, 5, totalPages);

  const page6 = reportPage(data, "Seções 07 e 09", "Entrevista e prioridades", `<h3>Entrevista com a cozinheira</h3><div class="report-grid">${reportField("Nome", data.cookName)}${reportField("Tempo de experiência", data.cookExperience)}${reportField("Capacitação em Boas Práticas", data.cookTraining)}${reportField("Planejamento das refeições", data.cookPlanning)}${reportField("Principais dificuldades", data.cookDifficulties, true)}${reportField("Alimentos com maior aceitação", data.mostAcceptedFoods)}${reportField("Alimentos com maior rejeição", data.mostRejectedFoods)}${reportField("Compras dos alimentos", data.foodPurchases, true)}${reportField("Dificuldade com dietas especiais", data.specialDietDifficulties)}${reportField("Equipamentos ou recursos ausentes", data.missingResources)}</div><h3>Demandas priorizadas</h3><div class="report-callout red"><strong>Prioridade imediata</strong>${shown(data.immediatePriority)}</div><div class="report-callout yellow"><strong>Curto prazo · até 30 dias</strong>${shown(data.shortPriority)}</div><div class="report-callout green"><strong>Médio prazo · 31 a 90 dias</strong>${shown(data.mediumPriority)}</div>`, 6, totalPages);

  const actionRows = (data.actions || []).filter((action) => action.action).map((action) => [action.action, action.priority, action.responsible, action.deadline, action.status]);
  const page7 = reportPage(data, "Seções 10 e 11", "Parecer e plano de ação", `<h3>Parecer diagnóstico inicial</h3><p class="report-paragraph">${shown(data.diagnosticOpinion)}</p><h3>Pontos fortes observados</h3><p class="report-paragraph">${shown(data.strengths)}</p><h3>Limitações do levantamento</h3><p class="report-paragraph">${shown(data.limitations, "Não foram registradas limitações específicas.")}</p><h3>Recomendações e próximos passos</h3><p class="report-paragraph">${shown(data.recommendations)}</p>${reportTable(["Ação recomendada", "Prioridade", "Responsável", "Prazo", "Status"], actionRows)}<p class="report-note"><strong>Metodologia e limites:</strong> diagnóstico inicial elaborado a partir de entrevista, informações disponibilizadas pela instituição e observação direta na data da visita. Os achados retratam o momento avaliado e devem ser reavaliados após as adequações. Recomendações clínicas individualizadas dependem de avaliação nutricional própria e integração com a equipe assistencial.</p><div class="signature-block"><div><strong>${shown(data.nutritionist, "Nutricionista responsável")}</strong><span>${shown(data.crn, "CRN")}</span></div><div><strong>${shown(data.institutionManager, "Responsável pela instituição")}</strong><span>Ciência e recebimento</span></div></div>`, 7, totalPages);

  return cover + page2 + page3 + page4 + page5 + page6 + page7;
}

function printCurrentReport() {
  const record = saveCurrentReport();
  if (!record) return;
  document.getElementById("ilpi-report").innerHTML = buildReportHtml(record.data);
  document.body.classList.add("printing-ilpi");
  document.title = `${record.data.reportNumber || "Relatório ILPI"} - ${record.data.institutionName || "OCTN"}`;
  window.setTimeout(() => window.print(), 120);
}

document.getElementById("print-ilpi")?.addEventListener("click", printCurrentReport);
document.querySelectorAll("[data-print]").forEach((button) => button.addEventListener("click", printCurrentReport));
window.addEventListener("afterprint", () => {
  document.body.classList.remove("printing-ilpi");
  document.title = "Formulários | OCTN";
});
