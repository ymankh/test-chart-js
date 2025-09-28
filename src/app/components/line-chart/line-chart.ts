import { Component, computed, input } from '@angular/core';
import { ChartDataset, ChartOptions, Plugin } from 'chart.js';
import { ChartComponent } from '../chart/chart';

type LineDataset = ChartDataset<'line', number[]>;

type LinePlugin = Plugin<'line'>;

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [ChartComponent],
  templateUrl: './line-chart.html',
  styleUrls: ['./line-chart.css'],
})
export class LineChartComponent {
  readonly labels = input.required<string[]>();
  readonly data = input.required<number[]>();
  readonly dataset = input<Partial<LineDataset> | null>(null);
  readonly options = input<ChartOptions<'line'> | null>(null);
  readonly plugins = input<LinePlugin[] | null>(null);
  readonly theme = input<string | null>(null);
  readonly height = input<number | undefined>(undefined);
  readonly width = input<number | undefined>(undefined);
  readonly canvasClass = input<string>('');

  private readonly baseDataset = computed<LineDataset>(() => {
    const overrides = this.dataset() ?? {};

    return {
      label: overrides.label ?? 'Trend',
      data: this.data(),
      tension: overrides.tension ?? 0.35,
      fill: overrides.fill ?? true,
      ...overrides,
    } as LineDataset;
  });

  protected readonly datasets = computed<LineDataset[]>(() => [this.baseDataset()]);
  protected readonly resolvedOptions = computed(() => this.options() ?? undefined);
  protected readonly resolvedPlugins = computed(() => this.plugins() ?? undefined);
}
