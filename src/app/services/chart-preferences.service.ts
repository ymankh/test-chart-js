import { computed, Injectable, signal } from '@angular/core';
import { ChartConfiguration, ChartDataset, ChartOptions, ChartType } from 'chart.js';

export type AnyChartDataset = ChartDataset<ChartType, any>;
export type AnyChartOptions = ChartOptions<ChartType>;

export interface ChartTheme {
  palette?: string[];
  borderColor?: string;
  backgroundOpacity?: number;
  globalOptions?: AnyChartOptions;
  typeOptions?: Partial<Record<ChartType, AnyChartOptions>>;
  datasetDefaults?: Partial<Record<ChartType, Partial<AnyChartDataset>>>;
}

const DEFAULT_THEME_NAME = 'default';

const DEFAULT_THEME: ChartTheme = {
  palette: ['#2563eb', '#22c55e', '#f97316', '#0ea5e9', '#a855f7', '#eab308'],
  borderColor: '#0f172a',
  backgroundOpacity: 0.32,
  globalOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#0f172a',
          boxWidth: 16,
          font: { weight: 500 },
        },
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#f8fafc',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(241,245,249,0.2)',
        borderWidth: 1,
        padding: 10,
      },
    },
    elements: {
      line: {
        tension: 0.35,
        borderWidth: 3,
      },
      bar: {
        borderWidth: 0,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(148,163,184,0.2)' },
        ticks: { color: '#475569' },
      },
      y: {
        grid: { color: 'rgba(148,163,184,0.2)' },
        ticks: { color: '#475569' },
        beginAtZero: true,
      },
    },
  } as AnyChartOptions,
  typeOptions: {
    radar: {
      scales: {
        r: {
          angleLines: { color: 'rgba(148,163,184,0.3)' },
          grid: { color: 'rgba(148,163,184,0.25)' },
          pointLabels: { color: '#0f172a', font: { size: 12 } },
          ticks: { display: false },
        },
      },
    } as AnyChartOptions,
    line: {
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
      },
    } as AnyChartOptions,
  },
  datasetDefaults: {
    line: {
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderCapStyle: 'round',
    } as Partial<AnyChartDataset>,
    radar: {
      fill: true,
      borderWidth: 2,
    } as Partial<AnyChartDataset>,
    bar: {
      borderRadius: 8,
      borderSkipped: false,
    } as Partial<AnyChartDataset>,
  },
};

@Injectable({ providedIn: 'root' })
export class ChartPreferencesService {
  private readonly themes = new Map<string, ChartTheme>();
  private readonly activeThemeName = signal(DEFAULT_THEME_NAME);
  readonly activeTheme = computed(() => this.resolveTheme());

  constructor() {
    this.registerTheme(DEFAULT_THEME_NAME, DEFAULT_THEME, { setActive: true });
  }

  registerTheme(name: string, theme: ChartTheme, options?: { setActive?: boolean }): void {
    if (!name.trim()) {
      throw new Error('Theme name must be a non-empty string.');
    }

    this.themes.set(name, this.clone(theme));

    if (options?.setActive) {
      this.setActiveTheme(name);
    }
  }

  listThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  getActiveThemeName(): string {
    return this.activeThemeName();
  }

  setActiveTheme(name: string): void {
    if (!this.themes.has(name)) {
      throw new Error(`Theme '${name}' is not registered.`);
    }

    this.activeThemeName.set(name);
  }

  applyTheme<TType extends ChartType>(
    config: ChartConfiguration<TType>,
    explicitThemeName?: string | null
  ): ChartConfiguration<TType> {
    const theme = this.resolveTheme(explicitThemeName ?? undefined);
    const baseConfig: ChartConfiguration<TType> = this.clone(config);

    const themedDatasets = (baseConfig.data?.datasets ?? []).map((dataset, datasetIndex) =>
      this.applyThemeToDataset(dataset, datasetIndex, theme, baseConfig)
    );

    const themedOptions = this.mergeOptions(
      theme.globalOptions as ChartOptions<TType>,
      theme.typeOptions?.[baseConfig.type] as ChartOptions<TType>,
      baseConfig.options
    );

    return {
      ...baseConfig,
      data: {
        ...baseConfig.data,
        datasets: themedDatasets,
      },
      options: themedOptions,
    };
  }

  mergeOptions<TType extends ChartType>(
    ...options: Array<ChartOptions<TType> | undefined>
  ): ChartOptions<TType> | undefined {
    const definedOptions = options.filter((opt): opt is ChartOptions<TType> => Boolean(opt));
    if (!definedOptions.length) {
      return undefined;
    }

    return definedOptions.reduce((acc, current) => this.mergeObjects(acc, current));
  }

  private resolveTheme(requestedName?: string): ChartTheme {
    if (requestedName && this.themes.has(requestedName)) {
      return this.clone(this.themes.get(requestedName)!);
    }

    const active = this.activeThemeName();
    const activeTheme = this.themes.get(active) ?? this.themes.get(DEFAULT_THEME_NAME);
    if (!activeTheme) {
      throw new Error('No chart theme is available.');
    }

    return this.clone(activeTheme);
  }

  private applyThemeToDataset<TType extends ChartType>(
    dataset: ChartDataset<TType, any>,
    index: number,
    theme: ChartTheme,
    config: ChartConfiguration<TType>
  ): ChartDataset<TType, any> {
    const baseDefaults = theme.datasetDefaults?.[config.type] as Partial<ChartDataset<TType, any>> | undefined;
    const themedDataset = this.mergeObjects<ChartDataset<TType, any>>(
      {} as ChartDataset<TType, any>,
      baseDefaults ?? {},
      dataset
    );

    const palette = theme.palette ?? [];
    if (!palette.length) {
      return themedDataset;
    }

    const baseColor = palette[index % palette.length];
    const opacity = theme.backgroundOpacity ?? 0.45;
    const fallbackLength = this.resolveDataLength(themedDataset, config);

    if (!themedDataset.borderColor) {
      themedDataset.borderColor = theme.borderColor ?? baseColor;
    }

    if (!themedDataset.backgroundColor) {
      if (config.type === 'line' || config.type === 'radar') {
        themedDataset.backgroundColor = this.applyOpacity(baseColor, opacity);
      } else if (config.type === 'pie' || config.type === 'doughnut' || config.type === 'polarArea') {
        themedDataset.backgroundColor = Array.from({ length: fallbackLength }, (_, dataIndex) =>
          this.applyOpacity(palette[(dataIndex + index) % palette.length], opacity)
        );
      } else {
        themedDataset.backgroundColor = this.applyOpacity(baseColor, opacity);
      }
    }

    if (!('pointBackgroundColor' in themedDataset) && (config.type === 'line' || config.type === 'radar')) {
      (themedDataset as any).pointBackgroundColor = themedDataset.borderColor;
      (themedDataset as any).pointBorderColor = '#ffffff';
    }

    return themedDataset;
  }

  private resolveDataLength<TType extends ChartType>(
    dataset: ChartDataset<TType, any>,
    config: ChartConfiguration<TType>
  ): number {
    if (Array.isArray(dataset.data)) {
      return dataset.data.length;
    }

    if (Array.isArray(config.data?.labels)) {
      return config.data.labels.length;
    }

    return fallbackLengthByType(config.type);
  }

  private mergeObjects<T>(target: T, ...sources: Partial<T>[]): T {
    const output = Array.isArray(target) ? [...(target as unknown as unknown[])] : { ...target } as any;

    for (const source of sources) {
      if (!source) {
        continue;
      }

      for (const [key, value] of Object.entries(source)) {
        if (value === undefined) {
          continue;
        }

        const existing = (output as any)[key];
        if (this.isPlainObject(value) && this.isPlainObject(existing)) {
          (output as any)[key] = this.mergeObjects(existing, value);
        } else if (Array.isArray(value)) {
          (output as any)[key] = [...value];
        } else {
          (output as any)[key] = value;
        }
      }
    }

    return output as T;
  }

  private applyOpacity(color: string, opacity: number): string {
    if (!color.startsWith('#')) {
      return color;
    }

    const hex = color.replace('#', '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, opacity))})`;
  }

  private clone<T>(value: T): T {
    if (value === undefined || value === null) {
      return value;
    }

    if (typeof structuredClone === 'function') {
      return structuredClone(value);
    }

    return JSON.parse(JSON.stringify(value)) as T;
  }

  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && value.constructor === Object;
  }
}

function fallbackLengthByType(type: ChartType): number {
  switch (type) {
    case 'pie':
    case 'doughnut':
      return 6;
    case 'radar':
    case 'line':
      return 4;
    default:
      return 3;
  }
}
