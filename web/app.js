"use strict";
(function () {
  const get = id => document.getElementById(id);
  const example = get("sections").value;
  let lastPlan = null;

  function parseRows(raw) {
    const rows = raw.split(/\r?\n/).filter(line => line.trim());
    return rows.map((line, index) => {
      const fields = line.split(",").map(field => field.trim());
      if (fields.length !== 4 || fields.some(field => !field)) {
        throw new Error("Line " + (index + 1) + ": use name, demand, minimum, priority");
      }
      if (fields.slice(1).some(field => !/^\d+$/.test(field))) {
        throw new Error("Line " + (index + 1) + ": token counts and priority must be integers");
      }
      return {name: fields[0], requested_tokens: Number(fields[1]),
              minimum_tokens: Number(fields[2]), priority: Number(fields[3])};
    });
  }

  function numeric(id) {
    const value = get(id).value.trim();
    if (!/^\d+$/.test(value)) throw new Error(id + " must be a non-negative integer");
    return Number(value);
  }

  function render(plan) {
    const stats = get("stats");
    stats.replaceChildren();
    const measures = [
      ["Input capacity", plan.input_budget], ["Allocated", plan.allocated_tokens],
      ["Output reserve", plan.reserve_tokens], ["Unused input", plan.unused_input_tokens],
    ];
    for (const [label, value] of measures) {
      const span = document.createElement("span");
      span.textContent = label + ": " + value.toLocaleString();
      stats.append(span);
    }
    const table = document.createElement("table");
    const head = document.createElement("thead");
    const tr = document.createElement("tr");
    for (const label of ["Section", "Demand", "Minimum", "Priority", "Allocated"]) {
      const th = document.createElement("th");
      th.textContent = label;
      tr.append(th);
    }
    head.append(tr);
    table.append(head);
    const body = document.createElement("tbody");
    for (const section of plan.sections) {
      const row = document.createElement("tr");
      for (const field of ["name", "requested_tokens", "minimum_tokens", "priority", "allocated_tokens"]) {
        const cell = document.createElement("td");
        cell.textContent = String(section[field]);
        row.append(cell);
      }
      body.append(row);
    }
    table.append(body);
    get("result").replaceChildren(table);
  }

  get("calculate").addEventListener("click", () => {
    try {
      lastPlan = allocateBudget(numeric("total"), parseRows(get("sections").value), numeric("reserve"));
      render(lastPlan);
      get("error").textContent = "";
      get("download").disabled = false;
    } catch (error) {
      lastPlan = null;
      get("error").textContent = error.message;
      get("download").disabled = true;
      get("stats").replaceChildren();
      get("result").textContent = "No valid allocation plan.";
    }
  });

  get("reset").addEventListener("click", () => {
    get("total").value = 8192;
    get("reserve").value = 1024;
    get("sections").value = example;
    get("calculate").click();
  });

  get("download").addEventListener("click", () => {
    if (!lastPlan) return;
    const blob = new Blob([JSON.stringify(lastPlan, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "token-allocation.json";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  });

  get("audit").addEventListener("click", () => {
    const primaryRaw = get("metric-primary").value.trim();
    const secondaryRaw = get("metric-secondary").value.trim();
    const primary = Number(primaryRaw), secondary = Number(secondaryRaw);
    if (!primaryRaw || !secondaryRaw || !Number.isFinite(primary) || !Number.isFinite(secondary)) {
      get("audit-result").textContent = "Enter finite numeric metric values.";
      return;
    }
    const alerts = [];
    if (primary > 25) alerts.push("ELEVATED: primary metric exceeds 25");
    if (secondary > 12 || get("critical").checked) {
      alerts.push((get("critical").checked ? "CRITICAL" : "ELEVATED") +
                  ": secondary/critical threshold triggered");
    }
    if (/DISCORDANT|ANOMALY|MUTANT|VIOLATION|FAIL|REJECT/i.test(get("descriptor").value)) {
      alerts.push("ELEVATED: anomaly descriptor detected");
    }
    get("audit-result").textContent = alerts.length ? alerts.join("\n") : "ROUTINE: no thresholds triggered";
  });
  get("calculate").click();
})();
