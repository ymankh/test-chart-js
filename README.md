# TestChartJs

A chart playground built with Angular standalone components and Chart.js. The app demonstrates how a single reusable chart host (`app-chart`) can power multiple visualisations while a centralized `ChartPreferencesService` manages palettes, dataset defaults, and shared options.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [High-Level Architecture](#high-level-architecture)
3. [Core Concepts](#core-concepts)
   - [Shared Chart Component](#shared-chart-component)
   - [Chart Preferences Service](#chart-preferences-service)
4. [Chart Use Cases](#chart-use-cases)
   - [Bar Charts](#bar-charts)
   - [Line Charts](#line-charts)
   - [Pie / Doughnut Charts](#pie--doughnut-charts)
   - [Radar Charts](#radar-charts)
5. [Theming](#theming)
   - [Registering Themes](#registering-themes)
   - [Switching Themes at Runtime](#switching-themes-at-runtime)
   - [Overriding Palette Usage](#overriding-palette-usage)
6. [Advanced Customisation](#advanced-customisation)
   - [Plugins](#plugins)
   - [Sizing and Layout](#sizing-and-layout)
   - [Per-Chart Options](#per-chart-options)
7. [Project Structure Reference](#project-structure-reference)
8. [Development Workflow](#development-workflow)
9. [Additional Resources](#additional-resources)

---

## Quick Start

```bash
npm install
npm start
```

Navigate to `http://localhost:4200/` to view the interactive playground. Use the theme picker to see how global preferences affect every chart while local inputs fine-tune individual datasets.

Run a production build when you are ready to deploy:

```bash
npm run build
```

---

## High-Level Architecture

```
+-------------------------------------------------------+
| App Component                                         |
|  - Registers demo themes via ChartPreferencesService  |
|  - Exposes data/dataset/option signals per chart      |
|  - Hosts theme selector UI                            |
+----------------------------+--------------------------+
| Chart Wrappers             | Chart Preferences        |
|  - Bar / Line / Pie / Radar| Service                  |
|  - Prepare dataset defaults|  - Stores named themes   |
|  - Forward inputs to       |  - Applies palettes      |
|    shared <app-chart>      |  - Merges options        |
|                            |  - Supplies active theme |
+----------------------------+--------------------------+
             |                              |
             v                              v
      Shared Chart Component       Chart.js lifecycle
```

---

## Core Concepts

### Shared Chart Component

File: `src/app/components/chart/chart.ts`

- Registers all required Chart.js controllers once.
- Accepts generic inputs (`type`, `labels`, `datasets`, `options`, `plugins`, `theme`, `height`, `width`, `canvasClass`).
- Uses Angular signals to rebuild chart configuration whenever inputs or the active theme change.
- Applies the active theme by delegating to `ChartPreferencesService`.

### Chart Preferences Service

File: `src/app/services/chart-preferences.service.ts`

- Maintains a registry of named `ChartTheme` objects.
- Provides helpers to list, register, update, and activate themes.
- Auto-decorates datasets with palette-driven colours, sensible opacities, and per-type defaults.
- Merges global options, type-specific overrides, and per-chart settings without mutating caller-provided objects.

Key API surface:

```ts
registerTheme(name: string, theme: ChartTheme, options?: { setActive?: boolean }): void;
setActiveTheme(name: string): void;
listThemes(): string[];
getActiveThemeName(): string;
applyTheme<TType extends ChartType>(config: ChartConfiguration<TType>, themeName?: string): ChartConfiguration<TType>;
mergeOptions<TType extends ChartType>(...options: Array<ChartOptions<TType> | undefined>): ChartOptions<TType> | undefined;
```

---

## Chart Use Cases

Each chart wrapper lives under `src/app/components/<type>-chart/` and simply composes the shared component with type-safe defaults.

### Bar Charts

File: `src/app/components/bar-chart/bar-chart.ts`

```html
<app-bar-chart
  [labels]="['Q1', 'Q2', 'Q3', 'Q4']"
  [data]="[120, 150, 180, 210]"
  [dataset]="{ label: 'Revenue', borderRadius: 12 }"
  [options]="{ scales: { y: { ticks: { stepSize: 30 } } } }"
  [plugins]="[barDataLabels]"
  [theme]="'midnight'"
></app-bar-chart>
```

Use cases:
- Emphasise comparisons across categories (e.g., quarterly revenue, feature usage counts).
- Apply rounded corners via dataset `borderRadius` or stack bars with standard Chart.js options.
- Attach custom plugins (like data labels) through the `[plugins]` input.

### Line Charts

File: `src/app/components/line-chart/line-chart.ts`

```html
<app-line-chart
  [labels]="timelineLabels"
  [data]="velocitySamples"
  [dataset]="{ label: 'Velocity', tension: 0.5, fill: false }"
  [options]="{ scales: { y: { suggestedMin: 20, suggestedMax: 120 } } }"
></app-line-chart>
```

Use cases:
- Monitor trends over time (velocity, conversion rate, API latency).
- Toggle smoothing by adjusting `tension` or disable fill for a cleaner look.
- Combine multiple line series by extending the wrapper or using the base component directly.

### Pie / Doughnut Charts

File: `src/app/components/pi-chart/pi-chart.ts`

```html
<app-pi-chart
  [labels]="['Search', 'Direct', 'Referral', 'Email']"
  [data]="[48, 26, 14, 12]"
  [dataset]="{ hoverOffset: 18, borderWidth: 0 }"
  [options]="{ cutout: '55%', plugins: { legend: { position: 'right' } } }"
></app-pi-chart>
```

Use cases:
- Display proportional data such as traffic sources or budget distribution.
- Switch between pie and doughnut styles by adjusting `cutout`.
- The active theme automatically assigns palette colours to each segment.

### Radar Charts

File: `src/app/components/radar-chart/radar-chart.ts`

```html
<app-radar-chart
  [labels]="['UX', 'Performance', 'Accessibility', 'Documentation', 'Community']"
  [data]="[72, 88, 65, 90, 80]"
  [dataset]="{ label: 'Score', pointRadius: 5 }"
  [options]="{ plugins: { legend: { display: true } } }"
  [theme]="'sunset'"
></app-radar-chart>
```

Use cases:
- Compare multidimensional performance (team skills, product KPIs, survey results).
- Themes adjust radial grids, tick colours, and filled area opacity for readable spider charts.

---

## Theming

Themes define palette colours, default opacities, global options, and dataset overrides per chart type. They are stored in the `ChartPreferencesService` and applied automatically.

### Registering Themes

```ts
import { ChartPreferencesService } from '../services/chart-preferences.service';

export class ReportingDashboardComponent {
  constructor(private readonly chartPreferences: ChartPreferencesService) {
    this.chartPreferences.registerTheme('ocean', {
      palette: ['#0ea5e9', '#14b8a6', '#22d3ee', '#38bdf8'],
      backgroundOpacity: 0.3,
      globalOptions: {
        plugins: {
          legend: { labels: { color: '#0f172a' } },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#f1f5f9',
            bodyColor: '#f8fafc',
          },
        },
        scales: {
          x: { ticks: { color: '#0f172a' } },
          y: { ticks: { color: '#0f172a' } },
        },
      },
      datasetDefaults: {
        line: { borderWidth: 3 },
        bar: { borderRadius: 10 },
      },
    });
  }
}
```

### Switching Themes at Runtime

Inject the service anywhere to change the active theme. The shared chart component listens to the active theme signal and repaints every chart instantly.

```ts
const availableThemes = this.chartPreferences.listThemes();
this.chartPreferences.setActiveTheme('ocean');
```

Template usage:

```html
<select (change)="chartPreferences.setActiveTheme($any($event.target).value)">
  <option *ngFor="let theme of chartPreferences.listThemes()" [value]="theme">
    {{ theme }}
  </option>
</select>
```

### Overriding Palette Usage

All wrappers expose a `[theme]` input, allowing you to opt into a different theme on a single chart while the rest of the app uses the global active theme.

```html
<app-line-chart
  [labels]="labels"
  [data]="seriesA"
  [theme]="'sunset'"
></app-line-chart>
```

You can also override dataset colours directly. Theme defaults only apply to properties you leave undefined:

```html
<app-bar-chart
  [labels]="labels"
  [dataset]="{ label: 'Custom', data, backgroundColor: '#1d4ed8', borderColor: '#1e3a8a' }"
></app-bar-chart>
```

---

## Advanced Customisation

### Plugins

Chart.js plugins (including community plugins) can be supplied through the `[plugins]` input on any wrapper or directly on `<app-chart>`.

```ts
import annotationPlugin from 'chartjs-plugin-annotation';

barPlugins = [annotationPlugin];
```

```html
<app-bar-chart
  [labels]="labels"
  [data]="values"
  [plugins]="barPlugins"
></app-bar-chart>
```

### Sizing and Layout

- `[height]` and `[width]` pass explicit pixel sizes to the canvas.
- `[canvasClass]` allows attaching utility classes for advanced layout control.
- Wrapper components are standalone; place them in any container or grid system.

### Per-Chart Options

All Chart.js options remain available. For example, enabling stacked axes and custom tooltips:

```html
<app-bar-chart
  [labels]="['North', 'South', 'East', 'West']"
  [dataset]="{ label: 'Units', data: [45, 52, 38, 61] }"
  [options]="{
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} units`,
        },
      },
    },
  }"
></app-bar-chart>
```

---

## Project Structure Reference

```
src/
|-- app/
|   |-- components/
|   |   |-- chart/          # Shared chart host
|   |   |-- bar-chart/      # Bar wrapper + template/style
|   |   |-- line-chart/
|   |   |-- pi-chart/
|   |   |-- radar-chart/
|   |-- services/
|   |   |-- chart-preferences.service.ts
|   |-- app.ts / app.html / app.css
|   |-- app.routes.ts
|-- main.ts
```

---

## Development Workflow

| Command | Purpose |
| --- | --- |
| `npm start` | Launch dev server with live reload. |
| `npm run build` | Compile production bundle. |
| `npm test` | Execute Karma unit tests. |
| `ng generate component <name>` | Scaffold new components following Angular CLI conventions. |

Hot tips:
- Prefer extending the shared chart component rather than duplicating Chart.js setup logic.
- Themes are plain objects; store reusable palettes in shared libraries or load them from an API before bootstrapping the app.
- The shared component clones incoming configs, so you can reuse dataset objects safely across multiple charts.

---

## Additional Resources

- [Angular Standalone Components](https://angular.dev/guide/standalone-components)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [Chart.js Samples](https://www.chartjs.org/samples/latest/)
- [Angular CLI Reference](https://angular.dev/tools/cli)
- [Chart.js Plugin Guide](https://www.chartjs.org/docs/latest/developers/plugins.html)

Happy charting!
