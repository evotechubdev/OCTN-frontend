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
const dimensionNote = document.getElementById("dimension-note");
const extendedScope = document.getElementById("extended-scope");
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const serviceRates = {
  avaliacao: {
    name: "Apenas avaliação nutricional",
    unitCents: 14990,
    factor: 1,
    label: "avaliações × R$ 149,90",
    deliverables: ["Avaliação nutricional individual", "Registro individual dos resultados", "Classificação de risco nutricional"],
  },
  "clinica-social": {
    name: "Atendimento nutricional clínico — condição social",
    unitCents: 40307,
    factor: 0.5,
    label: "consultas × R$ 403,07 × 50%",
    deliverables: ["Consulta clínica individual", "Avaliação e diagnóstico nutricional", "Plano de cuidado e orientações", "Registro de evolução"],
  },
  clinica: {
    name: "Atendimento nutricional clínico integral",
    unitCents: 40307,
    factor: 1,
    label: "consultas × R$ 403,07",
    deliverables: ["Consulta clínica individual", "Avaliação e diagnóstico nutricional", "Plano de cuidado e orientações", "Registro de evolução"],
  },
};

const extraServices = {
  relatorio: "Relatório consolidado",
  reuniao: "Reunião com a equipe",
  educacao: "Orientação coletiva",
};

const technicalHourCents = 27123;

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
