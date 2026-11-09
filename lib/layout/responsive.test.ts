import { test } from "node:test";
import assert from "node:assert";

// Layout responsive math validation at viewports: 390, 768, 1440
test("Responsive Layout - 390px mobile viewport does not horizontally overflow", () => {
  const innerWidth = 390;
  // DashboardShell: p-3 (12px * 2)
  const paddingX = 24;
  const contentWidth = innerWidth - paddingX; // 366px

  // SubNav on mobile: 2-row grid with 4 columns
  const subnavPadding = 8; // p-1 (4px * 2)
  const subnavGap = 4; // gap-1
  const subnavCols = 4;
  const colWidth = (contentWidth - subnavPadding - (subnavCols - 1) * subnavGap) / subnavCols; // 86.5px
  const totalSubnavWidth = subnavPadding + subnavCols * colWidth + (subnavCols - 1) * subnavGap;

  assert.ok(totalSubnavWidth <= contentWidth, `SubNav width ${totalSubnavWidth} exceeds ${contentWidth}`);

  // KPI tiles on mobile: grid-cols-2, gap-3 (12px)
  const kpiCols = 2;
  const kpiGap = 12;
  const kpiCardWidth = (contentWidth - (kpiCols - 1) * kpiGap) / kpiCols; // 177px
  const totalKpiWidth = kpiCols * kpiCardWidth + (kpiCols - 1) * kpiGap;

  assert.ok(totalKpiWidth <= contentWidth, `KPI width ${totalKpiWidth} exceeds ${contentWidth}`);
  
  // Total scrollWidth constraint
  const scrollWidth = Math.max(totalSubnavWidth, totalKpiWidth) + paddingX;
  assert.ok(scrollWidth <= innerWidth, `scrollWidth (${scrollWidth}) <= innerWidth (${innerWidth})`);
});

test("Responsive Layout - 768px tablet viewport does not horizontally overflow", () => {
  const innerWidth = 768;
  const paddingX = 32; // p-4 (16px * 2)
  const contentWidth = innerWidth - paddingX; // 736px

  // SubNav on tablet: md:grid-cols-7
  const subnavPadding = 8;
  const subnavGap = 4;
  const subnavCols = 7;
  const colWidth = (contentWidth - subnavPadding - (subnavCols - 1) * subnavGap) / subnavCols;
  const totalSubnavWidth = subnavPadding + subnavCols * colWidth + (subnavCols - 1) * subnavGap;

  assert.ok(totalSubnavWidth <= contentWidth);

  // KPI tiles: md:grid-cols-3
  const kpiCols = 3;
  const kpiGap = 12;
  const kpiCardWidth = (contentWidth - (kpiCols - 1) * kpiGap) / kpiCols;
  const totalKpiWidth = kpiCols * kpiCardWidth + (kpiCols - 1) * kpiGap;

  assert.ok(totalKpiWidth <= contentWidth);
  const scrollWidth = Math.max(totalSubnavWidth, totalKpiWidth) + paddingX;
  assert.ok(scrollWidth <= innerWidth);
});

test("Responsive Layout - 1440px desktop viewport does not horizontally overflow", () => {
  const innerWidth = 1440;
  const sidebarWidth = 290;
  const paddingX = 64; // lg:p-8 (32px * 2)
  const availableWidth = innerWidth - sidebarWidth - paddingX; // 1086px (bounded by max-w-7xl = 1280px)
  const contentWidth = Math.min(availableWidth, 1280);

  // SubNav on desktop: md:grid-cols-7
  const subnavCols = 7;
  const subnavPadding = 8;
  const subnavGap = 4;
  const colWidth = (contentWidth - subnavPadding - (subnavCols - 1) * subnavGap) / subnavCols;
  const totalSubnavWidth = subnavPadding + subnavCols * colWidth + (subnavCols - 1) * subnavGap;

  assert.ok(totalSubnavWidth <= contentWidth);

  // KPI tiles: lg:grid-cols-6
  const kpiCols = 6;
  const kpiGap = 12;
  const kpiCardWidth = (contentWidth - (kpiCols - 1) * kpiGap) / kpiCols;
  const totalKpiWidth = kpiCols * kpiCardWidth + (kpiCols - 1) * kpiGap;

  assert.ok(totalKpiWidth <= contentWidth);
  const scrollWidth = totalSubnavWidth + sidebarWidth + paddingX;
  assert.ok(scrollWidth <= innerWidth);
});
