import { Component, computed, input } from '@angular/core';
import { ChartDataset, ChartOptions, Plugin } from 'chart.js';
import { ChartComponent } from '../chart/chart';

type RadarDataset = ChartDataset<'radar', number[]>;

type RadarPlugin = Plugin<'radar'>;

@Component({
  selector: 'app-radar-chart',
  standalone: true,
  imports: [ChartComponent],
  templateUrl: './radar-chart.html',
  styleUrls: ['./radar-chart.css'],
})
export class RadarChartComponent {
  readonly labels = input.required<string[]>();
  readonly data = input.required<number[]>();
  readonly dataset = input<Partial<RadarDataset> | null>(null);
  readonly options = input<ChartOptions<'radar'> | null>(null);
  readonly plugins = input<RadarPlugin[] | null>(null);
  readonly theme = input<string | null>(null);
  readonly height = input<number | undefined>(undefined);
  readonly width = input<number | undefined>(undefined);
  readonly canvasClass = input<string>('');

  private readonly baseDataset = computed<RadarDataset>(() => {
    const overrides = this.dataset() ?? {};

    return {
      label: overrides.label ?? 'Performance',
      data: this.data(),
      ...overrides,
    } as RadarDataset;
  });

  protected readonly datasets = computed<RadarDataset[]>(() => [this.baseDataset()]);
  protected readonly resolvedOptions = computed(() => this.options() ?? undefined);
  protected readonly resolvedPlugins = computed(() => this.plugins() ?? undefined);
}
