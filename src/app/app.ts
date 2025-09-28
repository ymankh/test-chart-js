import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChartDataset, ChartOptions } from 'chart.js';
import { PieChartComponent } from './components/pi-chart/pi-chart';
import { BarChartComponent } from './components/bar-chart/bar-chart';
import { LineChartComponent } from './components/line-chart/line-chart';
import { RadarChartComponent } from './components/radar-chart/radar-chart';
import { ChartPreferencesService } from './services/chart-preferences.service';

type BarDataset = Partial<ChartDataset<'bar', number[]>>;
type LineDataset = Partial<ChartDataset<'line', number[]>>;
type DoughnutDataset = Partial<ChartDataset<'doughnut', number[]>>;
type RadarDataset = Partial<ChartDataset<'radar', number[]>>;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PieChartComponent, BarChartComponent, LineChartComponent, RadarChartComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly pieLabels = ['Download', 'In-Store', 'Mail-Order'];
  protected readonly pieData = [300, 500, 100];
  protected readonly pieDataset: DoughnutDataset = { hoverOffset: 12 };
  protected readonly pieOptions: ChartOptions<'doughnut'> = {
    cutout: '58%',
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  protected readonly barLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  protected readonly barData = [65, 59, 80, 81, 56, 55, 40];
  protected readonly barDataset: BarDataset = { borderRadius: 8 };
  protected readonly barOptions: ChartOptions<'bar'> = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 20 },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  protected readonly lineLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  protected readonly lineData = [65, 59, 80, 81, 56, 55, 40];
  protected readonly lineDataset: LineDataset = { label: 'Velocity', borderDash: [4, 6] };
  protected readonly lineOptions: ChartOptions<'line'> = {
    plugins: {
      legend: { display: true, position: 'bottom' },
    },
  };

  protected readonly radarLabels = ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'];
  protected readonly radarData = [65, 59, 90, 81, 56, 55, 40];
  protected readonly radarDataset: RadarDataset = { label: 'Team A', pointRadius: 4 };
  protected readonly radarOptions: ChartOptions<'radar'> = {
    plugins: {
      legend: { display: true, position: 'top' },
    },
  };

  protected readonly availableThemes = signal<string[]>([]);
  protected readonly selectedTheme = signal('');

  constructor(private readonly chartPreferences: ChartPreferencesService) {
    this.registerDemoThemes();
    this.selectedTheme.set(this.chartPreferences.getActiveThemeName());
    this.availableThemes.set(this.chartPreferences.listThemes());
  }

  protected onThemeChange(theme: string): void {
    if (!theme || theme === this.selectedTheme()) {
      return;
    }

    this.chartPreferences.setActiveTheme(theme);
    this.selectedTheme.set(theme);
  }

  private registerDemoThemes(): void {
    this.chartPreferences.registerTheme(
      'midnight',
      {
        palette: ['#38bdf8', '#a855f7', '#f472b6', '#facc15', '#34d399', '#f97316'],
        borderColor: '#e2e8f0',
        backgroundOpacity: 0.25,
        globalOptions: {
          plugins: {
            legend: { labels: { color: '#e2e8f0' } },
            tooltip: { backgroundColor: '#0f172a', titleColor: '#f8fafc', bodyColor: '#f8fafc' },
          },
          scales: {
            x: {
              ticks: { color: '#cbd5f5' },
              grid: { color: 'rgba(148, 163, 184, 0.2)' },
            },
            y: {
              ticks: { color: '#cbd5f5' },
              grid: { color: 'rgba(148, 163, 184, 0.15)' },
            },
          },
        },
      },
      { setActive: true }
    );

    this.chartPreferences.registerTheme('sunset', {
      palette: ['#f87171', '#fb923c', '#facc15', '#34d399', '#38bdf8', '#c084fc'],
      borderColor: '#422006',
      backgroundOpacity: 0.55,
      globalOptions: {
        plugins: {
          legend: { labels: { color: '#0f172a' } },
        },
      },
    });
  }
}
