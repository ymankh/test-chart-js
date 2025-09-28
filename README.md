# TestChartJs

This Angular workspace demonstrates a unified Chart.js integration with reusable theming. Every chart-specific component simply forwards configuration into a shared `app-chart` wrapper which applies global preferences provided by the `ChartPreferencesService`.

## Getting Started

```bash
npm install
npm start
```

Visit `http://localhost:4200/` to explore the live chart playground. The home page lets you toggle predefined themes and inspect how per-chart overrides blend with the global styling.

## Project Scripts

| Command | Description |
| --- | --- |
| `npm start` | Run the dev server with live reload (`ng serve`). |
| `npm run build` | Produce an optimized production bundle (`ng build`). |
| `npm test` | Execute Karma unit tests. |

## Shared Chart Component

`src/app/components/chart/chart.ts` wraps Chart.js creation and tear-down. It registers required controllers once, accepts generic inputs (`type`, `labels`, `datasets`, `options`, `plugins`, etc.), and listens for changes through Angular signals. Updates to datasets, options, or the active theme automatically flow into the rendered chart.

Individual chart components - `app-bar-chart`, `app-line-chart`, `app-pi-chart`, and `app-radar-chart` - only describe the dataset defaults for their chart type and expose optional customisation inputs. You can use them directly in templates or create additional wrappers following the same pattern.

## Theme & Preferences Service

`src/app/services/chart-preferences.service.ts` centralizes palette and option management:

- Register named themes with `registerTheme(name, theme)` (optionally activate immediately with `{ setActive: true }`).
- Switch the active theme anywhere by injecting the service and calling `setActiveTheme(name)`.
- `applyTheme()` merges global options, type-specific overrides, and palette-driven dataset decoration before the chart renders.
- Use `listThemes()` to populate selectors (see `App` component for an example).

Themes control palette, default opacities, plugin styling (tooltips, legends), per-type options, and dataset defaults (e.g., line tension, border radius).

## Creating Custom Charts

1. Import `ChartComponent` into a standalone component.
2. Accept your preferred inputs (labels, dataset overrides, custom options, theme name, etc.).
3. Use the base component in your template:

```html
<app-chart
  [type]="'polarArea'"
  [labels]="labels()"
  [datasets]="datasets()"
  [options]="options()"
  [theme]="customTheme()"
></app-chart>
```

To add a reusable theme, call `chartPreferences.registerTheme('my-theme', themeDefinition)` during application bootstrap or inside a feature module.

## Structure Reference

- `src/app/app.ts` - Demo shell wiring charts to the theme selector.
- `src/app/app.html` - Layout with theme picker and chart grid.
- `src/app/components/` - Chart wrappers plus the core `chart` component.
- `src/app/services/` - Theme and preference service.

## Further Reading

- [Angular Standalone Components](https://angular.dev/guide/standalone-components)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [Angular CLI Reference](https://angular.dev/tools/cli)
