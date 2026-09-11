document.getElementById("year").textContent = new Date().getFullYear();

const animatedElements = document.querySelectorAll(".reveal");
const views = document.querySelectorAll("[data-view]");
const viewLinks = document.querySelectorAll("[data-view-link]");
const scrollButtons = document.querySelectorAll("[data-scroll-target]");
const validViews = new Set(["home", "consultoria", "servicos", "capacitacao"]);

const simulator = document.getElementById("service-simulator");
const residentCountInput = document.getElementById("resident-count");
const summaryItems = document.getElementById("summary-items");
const summaryTotal = document.getElementById("summary-total");
const summaryServiceName = document.getElementById("summary-service-name");
const summaryResidentCount = document.getElementById("summary-resident-count");
const summaryDeliverables = document.getElementById("summary-deliverables");
const summaryUnitReference = document.getElementById("summary-unit-reference");
const extendedScope = document.getElementById("extended-scope");
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const serviceRates = {
  avaliacao: {
    name: "Plano mensal de avaliação nutricional",
    unitCents: 14990,
    factor: 1,
    deliverables: ["Avaliação nutricional individual", "Registro individual dos resultados", "Classificação de risco nutricional"],
  },
  "clinica-social": {
    name: "Plano clínico mensal — condição social",
    unitCents: 40307,
    factor: 0.5,
    deliverables: ["Consulta clínica individual", "Avaliação e diagnóstico nutricional", "Plano de cuidado e orientações", "Registro de evolução"],
  },
  clinica: {
    name: "Plano clínico mensal integral",
    unitCents: 40307,
    factor: 1,
    deliverables: ["Consulta clínica individual", "Avaliação e diagnóstico nutricional", "Plano de cuidado e orientações", "Registro de evolução"],
  },
};

const extraServices = {
  relatorio: "Relatório consolidado",
  reuniao: "Reunião com a equipe",
  educacao: "Orientação coletiva",
};

const technicalHourCents = 27123;

function setOutput(id, value) {
  document.getElementById(id).textContent = value;
}

function updateSimulation() {
  if (!simulator) return;

  const parsedCount = Number.parseInt(residentCountInput.value, 10) || 1;
  const count = Math.min(500, Math.max(1, parsedCount));
  residentCountInput.value = count;

  const selectedServiceKey = simulator.elements["primary-service"].value;
  const selectedService = serviceRates[selectedServiceKey];
  const selectedExtras = [...simulator.querySelectorAll('input[name="extra-service"]:checked')];
  const individualTotal = Math.round(selectedService.unitCents * count * selectedService.factor);
  const extrasTotal = selectedExtras.length * technicalHourCents;
  const total = individualTotal + extrasTotal;

  const rows = [
    `<div class="summary-row" role="row"><span role="cell">Pacote mensal — cobertura para até ${count} ${count === 1 ? "pessoa" : "pessoas"}</span><span role="cell">${currency.format(individualTotal / 100)}</span></div>`,
    ...selectedExtras.map((input) => `<div class="summary-row" role="row"><span role="cell">${extraServices[input.value]} — 1 hora técnica</span><span role="cell">${currency.format(technicalHourCents / 100)}</span></div>`),
  ];

  if (extendedScope.checked) {
    rows.push('<div class="summary-row" role="row"><span role="cell">Alimentação coletiva / responsabilidade técnica</span><span role="cell">Sob proposta</span></div>');
  }

  summaryItems.innerHTML = rows.join("");
  summaryTotal.textContent = currency.format(total / 100);
  summaryServiceName.textContent = selectedService.name;
  summaryResidentCount.textContent = count;
  summaryUnitReference.textContent = currency.format(Math.round(selectedService.unitCents * selectedService.factor) / 100);

  const deliverables = [
    `Cobertura individual mensal para até ${count} ${count === 1 ? "pessoa" : "pessoas"}`,
    ...selectedService.deliverables,
    ...selectedExtras.map((input) => extraServices[input.value]),
  ];
  if (extendedScope.checked) deliverables.push("Análise complementar solicitada — valor pendente de dimensionamento");
  summaryDeliverables.innerHTML = deliverables.map((item) => `<li>${item}</li>`).join("");

  const extraNames = selectedExtras.map((input) => extraServices[input.value]);
  const scopeItems = [selectedService.name, ...extraNames];

  setOutput("contract-object-output", `Prestação recorrente dos serviços de ${scopeItems.join(", ").toLowerCase()}, com cobertura mensal para até ${count} ${count === 1 ? "pessoa" : "pessoas"}.${extendedScope.checked ? " A análise de alimentação coletiva ou responsabilidade técnica não integra este valor e depende de proposta específica." : ""}`);
  setOutput("contract-payment-output", `A CONTRATANTE pagará à CONTRATADA a mensalidade de ${currency.format(total / 100)}. Valor individual de referência: ${summaryUnitReference.textContent}.`);
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
  simulator.addEventListener("input", updateSimulation);
  simulator.addEventListener("change", updateSimulation);
  simulator.addEventListener("reset", () => window.setTimeout(updateSimulation, 0));

  document.querySelectorAll("[data-quantity-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const currentCount = Number.parseInt(residentCountInput.value, 10) || 1;
      const change = button.dataset.quantityAction === "increase" ? 1 : -1;
      residentCountInput.value = Math.min(500, Math.max(1, currentCount + change));
      updateSimulation();
    });
  });

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
