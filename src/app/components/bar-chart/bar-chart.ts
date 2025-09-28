import { Component, computed, input } from '@angular/core';
import { ChartDataset, ChartOptions, Plugin } from 'chart.js';
import { ChartComponent } from '../chart/chart';

type BarDataset = ChartDataset<'bar', number[]>;

type BarPlugin = Plugin<'bar'>;

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [ChartComponent],
  templateUrl: './bar-chart.html',
  styleUrls: ['./bar-chart.css'],
})
export class BarChartComponent {
  readonly labels = input.required<string[]>();
  readonly data = input.required<number[]>();
  readonly dataset = input<Partial<BarDataset> | null>(null);
  readonly options = input<ChartOptions<'bar'> | null>(null);
  readonly plugins = input<BarPlugin[] | null>(null);
  readonly theme = input<string | null>(null);
  readonly height = input<number | undefined>(undefined);
  readonly width = input<number | undefined>(undefined);
  readonly canvasClass = input<string>('');

  private readonly baseDataset = computed<BarDataset>(() => {
    const overrides = this.dataset() ?? {};

    return {
      label: overrides.label ?? 'Values',
      data: this.data(),
      ...overrides,
    } as BarDataset;
  });

  protected readonly datasets = computed<BarDataset[]>(() => [this.baseDataset()]);
  protected readonly resolvedOptions = computed(() => this.options() ?? undefined);
  protected readonly resolvedPlugins = computed(() => this.plugins() ?? undefined);
}
