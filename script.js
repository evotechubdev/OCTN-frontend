document.getElementById("year").textContent = new Date().getFullYear();

const animatedElements = document.querySelectorAll(".reveal");
const views = document.querySelectorAll("[data-view]");
const viewLinks = document.querySelectorAll("[data-view-link]");
const scrollButtons = document.querySelectorAll("[data-scroll-target]");
const validViews = new Set(["home", "consultoria", "servicos", "capacitacao"]);

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
  const selectedView = validViews.has(viewName) ? viewName : "home";

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
