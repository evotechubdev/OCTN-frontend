document.getElementById("year").textContent = new Date().getFullYear();

const animatedElements = document.querySelectorAll(".reveal");
const views = document.querySelectorAll("[data-view]");
const viewLinks = document.querySelectorAll("[data-view-link]");
const validViews = new Set(["home", "consultoria", "capacitacao"]);

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
      : selectedView === "capacitacao"
        ? "Capacitação | OCTN"
        : "OCTN | Consultoria Técnica Nutricional";

  if (shouldScroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function routeFromHash(shouldScroll = true) {
  const hashTarget = window.location.hash.replace("#", "");

  if (validViews.has(hashTarget)) {
    activateView(hashTarget, shouldScroll);
    return;
  }

  activateView("home", false);

  if (shouldScroll && hashTarget) {
    requestAnimationFrame(() => {
      document.getElementById(hashTarget)?.scrollIntoView({ behavior: "smooth" });
    });
  }
}

viewLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetView = link.dataset.viewLink;

    if (window.location.hash === `#${targetView}`) {
      event.preventDefault();
      activateView(targetView);
    }
  });
});

window.addEventListener("hashchange", () => routeFromHash());
routeFromHash(false);

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
