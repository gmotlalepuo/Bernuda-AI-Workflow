import type { AppPreviewDefinition, Persona, PreviewPage } from "@/lib/types";

export function getVisiblePages(preview: AppPreviewDefinition, persona: Persona): PreviewPage[] {
  return preview.pages.filter((page) => {
    return persona.visiblePages.includes(page.id) && page.allowedPersonas.includes(persona.id);
  });
}

export function getPreviewCompleteness(preview: AppPreviewDefinition): number {
  const totalComponents = preview.pages.reduce((sum, page) => sum + page.components.length, 0);
  const requiredCapabilities = ["dashboard", "form", "approval", "analytics"];
  const coveredCapabilities = requiredCapabilities.filter((type) => preview.pages.some((page) => page.type === type));
  return Math.round(((coveredCapabilities.length / requiredCapabilities.length) * 0.6 + Math.min(totalComponents / 18, 1) * 0.4) * 100);
}

export function simulateAction(currentPageId: string, targetPageId: string, preview: AppPreviewDefinition) {
  const target = preview.pages.find((page) => page.id === targetPageId);
  return {
    nextPageId: target?.id ?? currentPageId,
    event: target ? `Navigated to ${target.name}` : "Target page unavailable for this persona",
    timestamp: new Date().toISOString()
  };
}
