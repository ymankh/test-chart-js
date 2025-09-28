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
  protected readonly barDataset: BarDataset = { borderRadius: 12 };
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
    const activeTheme = this.chartPreferences.getActiveThemeName();
    this.selectedTheme.set(activeTheme);
    this.updateAvailableThemes(activeTheme);
  }

  protected onThemeChange(theme: string): void {
    if (!theme || theme === this.selectedTheme()) {
      return;
    }

    this.chartPreferences.setActiveTheme(theme);
    this.selectedTheme.set(theme);
    this.updateAvailableThemes(theme);
  }

  private updateAvailableThemes(activeTheme: string): void {
    const themes = this.chartPreferences.listThemes();
    themes.sort((a, b) => {
      if (a === activeTheme) {
        return -1;
      }
      if (b === activeTheme) {
        return 1;
      }
      return a.localeCompare(b);
    });

    this.availableThemes.set(themes);
  }

  private registerDemoThemes(): void {
    this.chartPreferences.registerTheme(
      'aurora',
      {
        palette: ['#4f46e5', '#6366f1', '#22d3ee', '#2dd4bf', '#f97316', '#facc15'],
        borderColor: '#312e81',
        backgroundOpacity: 0.28,
        globalOptions: {
          plugins: {
            legend: { labels: { color: '#1e1b4b' } },
            tooltip: {
              backgroundColor: '#1e293b',
              titleColor: '#e0f2fe',
              bodyColor: '#dbeafe',
            },
          },
          scales: {
            x: {
              ticks: { color: '#1e293b' },
              grid: { color: 'rgba(148,163,184,0.18)' },
            },
            y: {
              ticks: { color: '#1e293b' },
              grid: { color: 'rgba(148,163,184,0.18)' },
            },
          },
        },
        datasetDefaults: {
          line: { borderWidth: 3 },
          bar: { borderRadius: 16 },
        },
      },
      { setActive: true }
    );

    this.chartPreferences.registerTheme('sunset', {
      palette: ['#fb7185', '#f97316', '#facc15', '#fbbf24', '#4ade80', '#38bdf8'],
      borderColor: '#7f1d1d',
      backgroundOpacity: 0.45,
      globalOptions: {
        plugins: {
          legend: { labels: { color: '#7f1d1d' } },
          tooltip: {
            backgroundColor: '#451a03',
            titleColor: '#fef3c7',
            bodyColor: '#fde68a',
          },
        },
        scales: {
          x: {
            ticks: { color: '#7f1d1d' },
            grid: { color: 'rgba(249,115,22,0.18)' },
          },
          y: {
            ticks: { color: '#7f1d1d' },
            grid: { color: 'rgba(249,115,22,0.18)' },
          },
        },
      },
      datasetDefaults: {
        line: { tension: 0.35, fill: true },
        radar: { borderWidth: 3 },
      },
    });

    this.chartPreferences.registerTheme('twilight', {
      palette: ['#38bdf8', '#818cf8', '#f472b6', '#facc15', '#34d399', '#f97316'],
      borderColor: '#e2e8f0',
      backgroundOpacity: 0.25,
      globalOptions: {
        plugins: {
          legend: { labels: { color: '#e2e8f0' } },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#f1f5f9',
            bodyColor: '#cbd5f5',
          },
        },
        scales: {
          x: {
            ticks: { color: '#cbd5f5' },
            grid: { color: 'rgba(148,163,184,0.25)' },
          },
          y: {
            ticks: { color: '#cbd5f5' },
            grid: { color: 'rgba(148,163,184,0.25)' },
          },
        },
      },
      datasetDefaults: {
        line: { fill: true, borderWidth: 3 },
        radar: { borderWidth: 2 },
      },
    });
  }
}
