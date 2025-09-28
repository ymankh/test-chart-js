import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  input,
  viewChild,
} from '@angular/core';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartConfiguration,
  ChartDataset,
  ChartOptions,
  ChartType,
  DoughnutController,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  Plugin,
  PointElement,
  RadarController,
  RadialLinearScale,
  Tooltip,
} from 'chart.js';
import { ChartPreferencesService } from '../../services/chart-preferences.service';

type GenericChartConfiguration = ChartConfiguration<ChartType>;

let chartControllersRegistered = false;

function ensureChartControllersRegistered(): void {
  if (chartControllersRegistered) {
    return;
  }

  Chart.register(
    ArcElement,
    BarController,
    BarElement,
    CategoryScale,
    DoughnutController,
    Legend,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    RadarController,
    RadialLinearScale,
    Tooltip
  );

  chartControllersRegistered = true;
}

@Component({
  selector: 'app-chart',
  standalone: true,
  templateUrl: './chart.html',
  styleUrl: './chart.css',
})
export class ChartComponent implements AfterViewInit, OnDestroy {
  readonly type = input.required<ChartType>();
  readonly labels = input<string[]>([]);
  readonly datasets = input<ChartDataset<any, any>[]>([]);
  readonly options = input<ChartOptions<ChartType> | undefined>(undefined);
  readonly plugins = input<Plugin<ChartType>[] | undefined>(undefined);
  readonly theme = input<string | null>(null);
  readonly height = input<number | undefined>(undefined);
  readonly width = input<number | undefined>(undefined);
  readonly canvasClass = input<string>('');

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chartInstance?: Chart<ChartType>;

  private readonly themedConfiguration = computed(() => {
    if (!this.theme()) {
      this.chartPreferences.activeTheme();
    }
    return this.buildConfig();
  });

  constructor(private readonly chartPreferences: ChartPreferencesService) {
    ensureChartControllersRegistered();

    effect(() => {
      const config = this.themedConfiguration();

      if (!this.chartInstance) {
        return;
      }

      const currentConfig = this.chartInstance.config as GenericChartConfiguration;
      const currentType = currentConfig.type ?? this.type();
      const nextType = config.type ?? this.type();

      if (currentType !== nextType) {
        this.chartInstance.destroy();
        this.instantiateChart(config);
        return;
      }

      this.chartInstance.data.labels = config.data?.labels ?? [];
      this.chartInstance.data.datasets = (config.data?.datasets ?? []) as any;

      if (config.options) {
        this.chartInstance.options = config.options;
        currentConfig.options = config.options;
      }

      currentConfig.plugins = config.plugins ?? [];
      this.chartInstance.update();
    });
  }

  ngAfterViewInit(): void {
    this.instantiateChart(this.themedConfiguration());
  }

  ngOnDestroy(): void {
    this.chartInstance?.destroy();
    this.chartInstance = undefined;
  }

  private instantiateChart(config: GenericChartConfiguration): void {
    this.chartInstance = new Chart(this.canvasRef().nativeElement, {
      ...config,
      plugins: config.plugins ?? [],
    });
  }

  private buildConfig(): GenericChartConfiguration {
    const type = this.type();
    const labels = [...(this.labels() ?? [])];
    const datasets = (this.datasets() ?? []).map((dataset) => ({ ...dataset }));
    const plugins = this.plugins() ?? undefined;

    const config: GenericChartConfiguration = {
      type,
      data: {
        labels,
        datasets,
      },
      options: this.options() ?? undefined,
      plugins,
    };

    return this.chartPreferences.applyTheme(config, this.theme()) as GenericChartConfiguration;
  }
}

