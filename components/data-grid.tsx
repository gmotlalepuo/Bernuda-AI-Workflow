"use client";

import { Download, Eye, Filter, Printer, Search } from "lucide-react";
import type { AuditEvent } from "@/lib/types";

export function AuditGrid({ events }: { events: AuditEvent[] }) {
  return (
    <section className="section" id="audit-logs">
      <div className="preview-toolbar">
        <div>
          <h2>Audit And Compliance</h2>
          <p className="muted">Server-side pagination, filters, export, and row actions are represented for the production data contract.</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button className="icon-button" aria-label="Search audit logs"><Search size={18} /></button>
          <button className="icon-button" aria-label="Filter audit logs"><Filter size={18} /></button>
          <button className="icon-button" aria-label="Export audit logs"><Download size={18} /></button>
          <button className="icon-button" aria-label="Print audit logs"><Printer size={18} /></button>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" aria-label="Select all audit rows" /></th>
              <th>Action</th>
              <th>Actor</th>
              <th>Timestamp</th>
              <th>IP Address</th>
              <th>Entity</th>
              <th>Outcome</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td><input type="checkbox" aria-label={`Select ${event.action}`} /></td>
                <td>{event.action}</td>
                <td>{event.actor}</td>
                <td>{event.at}</td>
                <td>{event.ipAddress}</td>
                <td>{event.entity}</td>
                <td><span className="badge">{event.outcome}</span></td>
                <td><button className="icon-button" aria-label={`View ${event.action}`}><Eye size={17} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
