import { Component, computed, input } from '@angular/core';
import { ChartDataset, ChartOptions, Plugin } from 'chart.js';
import { ChartComponent } from '../chart/chart';

type DoughnutDataset = ChartDataset<'doughnut', number[]>;

type DoughnutPlugin = Plugin<'doughnut'>;

@Component({
  selector: 'app-pi-chart',
  standalone: true,
  imports: [ChartComponent],
  templateUrl: './pi-chart.html',
  styleUrls: ['./pi-chart.css'],
})
export class PieChartComponent {
  readonly labels = input.required<string[]>();
  readonly data = input.required<number[]>();
  readonly dataset = input<Partial<DoughnutDataset> | null>(null);
  readonly options = input<ChartOptions<'doughnut'> | null>(null);
  readonly plugins = input<DoughnutPlugin[] | null>(null);
  readonly theme = input<string | null>(null);
  readonly height = input<number | undefined>(undefined);
  readonly width = input<number | undefined>(undefined);
  readonly canvasClass = input<string>('');

  private readonly baseDataset = computed<DoughnutDataset>(() => {
    const overrides = this.dataset() ?? {};

    return {
      label: overrides.label ?? 'Distribution',
      data: this.data(),
      ...overrides,
    } as DoughnutDataset;
  });

  protected readonly datasets = computed<DoughnutDataset[]>(() => [this.baseDataset()]);
  protected readonly resolvedOptions = computed(() => this.options() ?? undefined);
  protected readonly resolvedPlugins = computed(() => this.plugins() ?? undefined);
}
