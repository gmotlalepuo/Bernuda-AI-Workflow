"use client";

import { useMemo, useState } from "react";
import { ArrowRight, MousePointerClick, RotateCcw } from "lucide-react";
import { getVisiblePages, simulateAction } from "@/lib/preview-engine";
import type { ApplicationBlueprint, PreviewComponent } from "@/lib/types";

function RenderComponent({ component, onNavigate }: { component: PreviewComponent; onNavigate: (target: string) => void }) {
  if (component.kind === "metric") {
    return (
      <div className="card">
        <p className="muted">{component.label}</p>
        <div className="metric-value">{component.value}</div>
      </div>
    );
  }

  if (component.kind === "input") {
    return (
      <div className="field">
        <label>{component.label}{component.required ? " *" : ""}</label>
        <input defaultValue={component.value ?? ""} aria-label={component.label} />
      </div>
    );
  }

  if (component.kind === "select") {
    return (
      <div className="field">
        <label>{component.label}</label>
        <select defaultValue={component.value} aria-label={component.label}>
          {component.options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>
    );
  }

  if (component.kind === "table") {
    return (
      <div>
        <h3>{component.label}</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>{component.columns.map((column) => <th key={column}>{column}</th>)}</tr>
            </thead>
            <tbody>
              {component.rows.map((row) => (
                <tr key={row.join("-")}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (component.kind === "timeline") {
    return (
      <div className="card">
        <h3>{component.label}</h3>
        {component.events.map((event) => (
          <p className="muted" key={event}>
            <span className="status-dot" />
            {event}
          </p>
        ))}
      </div>
    );
  }

  return (
    <button className="button primary" type="button" onClick={() => onNavigate(component.targetPage)}>
      {component.label}
      <ArrowRight size={17} />
    </button>
  );
}

export function PreviewSimulator({ blueprint }: { blueprint: ApplicationBlueprint }) {
  const [personaId, setPersonaId] = useState("manager");
  const persona = blueprint.personas.find((item) => item.id === personaId) ?? blueprint.personas[0];
  const visiblePages = useMemo(() => getVisiblePages(blueprint.preview, persona), [blueprint.preview, persona]);
  const [pageId, setPageId] = useState(visiblePages[0]?.id ?? "dashboard");
  const page = visiblePages.find((item) => item.id === pageId) ?? visiblePages[0];
  const [event, setEvent] = useState("Preview runtime is ready.");

  function navigate(target: string) {
    const result = simulateAction(page?.id ?? "", target, blueprint.preview);
    if (visiblePages.some((item) => item.id === result.nextPageId)) {
      setPageId(result.nextPageId);
    }
    setEvent(result.event);
  }

  return (
    <div className="preview-frame" id="preview-engine">
      <div className="preview-toolbar">
        <div>
          <strong>{blueprint.preview.appName}</strong>
          <div className="muted">Version {blueprint.preview.version} executable preview</div>
        </div>
        <div className="segmented" aria-label="Persona switcher">
          {blueprint.personas.map((item) => (
            <button type="button" className={item.id === personaId ? "active" : ""} key={item.id} onClick={() => {
              setPersonaId(item.id);
              setPageId(item.visiblePages[0] ?? "dashboard");
            }}>
              {item.name}
            </button>
          ))}
        </div>
      </div>
      <div className="preview-toolbar">
        <div className="segmented" aria-label="Preview page switcher">
          {visiblePages.map((item) => (
            <button type="button" className={item.id === page?.id ? "active" : ""} key={item.id} onClick={() => setPageId(item.id)}>
              {item.name}
            </button>
          ))}
        </div>
        <button className="button" type="button" onClick={() => setEvent("Runtime state reset for this persona.")}>
          <RotateCcw size={17} />
          Reset
        </button>
      </div>
      <div className="preview-body">
        {page ? (
          <>
            <h2>{page.name}</h2>
            <div className="grid cols-2">
              {page.components.map((component) => (
                <RenderComponent key={component.id} component={component} onNavigate={navigate} />
              ))}
            </div>
          </>
        ) : (
          <div className="card">No pages are available for this persona.</div>
        )}
        <div className="toast" aria-live="polite">
          <MousePointerClick size={16} aria-hidden="true" /> {event}
        </div>
      </div>
    </div>
  );
}
