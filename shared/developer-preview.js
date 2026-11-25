/* Temporary, URL-scoped inspection. No storage, fake completion or auth bypass. */
(function (root) {
  "use strict";
  if (!root.location?.href || !root.document?.createElement) return;
  const url = new URL(root.location.href);
  let enabled = url.searchParams.get("developerPreview") === "1",
    changing = false;
  let adapter = {
      lessons: () => [],
      steps: () => [],
      onChange: () => {},
      navigate: () => {},
    },
    panel = null,
    selected = url.searchParams.get("inspectLesson") || "",
    selectedStep = url.searchParams.get("inspectStep") || "";
  const params = ["developerPreview", "inspectLesson", "inspectStep"];
  function change(next) {
    if (enabled === next) return;
    enabled = next;
    changing = true;
    const link = new URL(root.location.href);
    for (const key of params) link.searchParams.delete(key);
    if (enabled) link.searchParams.set("developerPreview", "1");
    root.history.replaceState(root.history.state, "", link);
    try {
      adapter?.onChange(enabled);
    } finally {
      changing = false;
      render();
    }
    panel?.querySelector(enabled ? "h2" : "button")?.focus();
  }
  function render() {
    if (!panel || !adapter) return;
    panel.replaceChildren();
    panel.className = enabled
      ? "developer-preview-banner"
      : "developer-preview-entry";
    const el = (tag, text) => {
      const node = root.document.createElement(tag);
      if (text) node.textContent = text;
      return node;
    };
    const button = el(
      "button",
      enabled ? "Return to normal gating" : "Enable Developer Preview",
    );
    button.type = "button";
    button.onclick = () => change(!enabled);
    if (!enabled) {
      const details = el("details"),
        summary = el("summary", "Development tools");
      details.append(
        summary,
        el("p", "Inspect the path without recording progress."),
        button,
      );
      panel.append(details);
      return;
    }
    const title = el("h2", "Developer Preview Mode");
    title.tabIndex = -1;
    panel.append(
      title,
      el(
        "p",
        "All path gates are open for inspection. Progress, achievements and saved learner data are unchanged. Missing teaching material stays labelled.",
      ),
      button,
    );
    const links = el("nav");
    links.setAttribute("aria-label", "Developer preview units");
    for (const [href, label] of [
      [
        "../unit-01-fidel-foundations/index.html",
        "Unit 1 · all Fidäl families",
      ],
      ["../unit-02-first-words/path.html", "Unit 2 onward · all lessons"],
    ]) {
      const a = el("a", label);
      a.href = new URL(href, root.location.href);
      a.search = "?developerPreview=1";
      links.append(a);
    }
    const lesson = el("select"),
      step = el("select");
    const lessonLabel = el("label", "Inspect lesson"),
      stepLabel = el("label", "Jump to step");
    lessonLabel.append(lesson);
    stepLabel.append(step);
    lesson.setAttribute("aria-label", "Inspect lesson");
    step.setAttribute("aria-label", "Jump to step");
    const choices = adapter.lessons();
    if (choices.length && !choices.some((c) => c.id === selected))
      selected = choices[0]?.id || "";
    for (const item of choices) {
      const opt = el("option", item.label);
      opt.value = item.id;
      lesson.append(opt);
    }
    lesson.value = selected;
    const steps = () => {
      step.replaceChildren();
      for (const item of adapter.steps(lesson.value)) {
        const opt = el("option", item.label);
        opt.value = item.id;
        step.append(opt);
      }
    };
    steps();
    if ([...step.options].some((o) => o.value === selectedStep))
      step.value = selectedStep;
    lesson.onchange = () => {
      selected = lesson.value;
      steps();
    };
    const open = el("button", "Open selected step");
    open.type = "button";
    open.disabled = !choices.length;
    open.onclick = () => {
      selected = lesson.value;
      selectedStep = step.value;
      const link = new URL(root.location.href);
      link.searchParams.set("inspectLesson", selected);
      link.searchParams.set("inspectStep", step.value);
      root.history.replaceState(root.history.state, "", link);
      adapter.navigate(selected, step.value);
    };
    const controls = el("div");
    controls.className = "developer-preview-controls";
    controls.append(lessonLabel, stepLabel, open);
    const status = el("p");
    status.id = "developerPreviewNotice";
    status.setAttribute("role", "status");
    panel.append(links, controls, status);
  }
  root.DeveloperPreview = {
    get enabled() {
      return enabled;
    },
    get readOnly() {
      return enabled || changing;
    },
    select(id, step = "intro") {
      selected = id;
      selectedStep = step;
      render();
    },
    register(value) {
      adapter = value;
      if (!panel) {
        panel = root.document.createElement("aside");
        panel.setAttribute("aria-label", "Development tools");
        root.document.body.prepend(panel);
      }
      if (enabled) {
        changing = true;
        try {
          adapter.onChange(true);
        } finally {
          changing = false;
        }
      }
      render();
      if (enabled && url.searchParams.has("inspectLesson"))
        adapter.navigate(
          selected,
          url.searchParams.get("inspectStep") || "intro",
        );
    },
  };
  // Even a missing/invalid content file leaves a visible exit from preview.
  if (enabled) {
    panel = root.document.createElement("aside");
    panel.setAttribute("aria-label", "Development tools");
    root.document.body.prepend(panel);
    render();
  }
  // Carry the flag only within supported, read-only learning-path adapters.
  root.document.addEventListener(
    "click",
    (event) => {
      if (!enabled) return;
      const a = event.target.closest?.("a[href]");
      if (!a || a.hasAttribute("download")) return;
      const next = new URL(a.href, root.location.href);
      if (
        next.origin !== root.location.origin ||
        /\.(?:json|md|pdf)$/.test(next.pathname) ||
        (next.pathname === root.location.pathname && next.hash)
      )
        return;
      if (
        /\/(?:unit-01-fidel-foundations\/index|unit-02-first-words\/path)\.html$/.test(
          next.pathname,
        )
      ) {
        next.searchParams.set("developerPreview", "1");
        a.href = next;
        return;
      }
      event.preventDefault();
      const notice = root.document.querySelector("#developerPreviewNotice");
      if (notice)
        notice.textContent =
          "This link leaves the inspected path. Return to normal gating first to use other app sections.";
    },
    true,
  );
})(globalThis);
