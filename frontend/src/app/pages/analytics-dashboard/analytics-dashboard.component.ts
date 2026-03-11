import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, PercentPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { NgChartsModule } from 'ng2-charts';
import {
  Chart,
  BarController, BarElement, CategoryScale, LinearScale,
  DoughnutController, ArcElement,
  LineController, LineElement, PointElement,
  Tooltip, Legend, Title, Filler,
  type ChartData, type ChartOptions,
} from 'chart.js';
import { ZohoAnalyticsService } from '../../services/zoho-analytics.service';
import { firstValueFrom } from 'rxjs';

Chart.register(
  BarController, BarElement, CategoryScale, LinearScale,
  DoughnutController, ArcElement,
  LineController, LineElement, PointElement,
  Tooltip, Legend, Title, Filler,
);

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule, PercentPipe,
    MatCardModule, MatIconModule, MatProgressSpinnerModule,
    MatTableModule, MatChipsModule, MatDividerModule, MatTooltipModule, MatButtonModule,
    NgChartsModule,
  ],
  templateUrl: './analytics-dashboard.component.html',
  styleUrl:    './analytics-dashboard.component.scss',
})
export class AnalyticsDashboardComponent implements OnInit {
  private readonly analyticsSvc = inject(ZohoAnalyticsService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('dashContent', { static: false }) dashContentRef!: ElementRef<HTMLElement>;
  exporting = false;

  // ── State ──────────────────────────────────────────────────────────────────
  loading = true;

  // ── KPIs ───────────────────────────────────────────────────────────────────
  totalWorkspaces = 0;
  totalViews      = 0;
  totalReports    = 0;
  totalDashboards = 0;

  // ── Table ──────────────────────────────────────────────────────────────────
  workspaces: any[] = [];
  readonly tableColumns = ['name', 'workspaceId', 'views', 'reports', 'dashboards'];

  // ── Charts ─────────────────────────────────────────────────────────────────
  viewsBarData: ChartData<'bar'> = { labels: [], datasets: [] };
  viewsBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Views per Workspace', font: { size: 14 } },
    },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };

  gaugeData: ChartData<'doughnut'> = { labels: ['Reports', 'Dashboards'], datasets: [] };
  gaugeOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    circumference: 180,
    rotation: -90,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Reports vs Dashboards', font: { size: 14 } },
    },
  };

  lineData: ChartData<'line'> = { labels: [], datasets: [] };
  lineOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Workspace Data Coverage', font: { size: 14 } },
    },
    scales: { y: { beginAtZero: true } },
  };

  pieData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  pieOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      title: { display: true, text: 'Views Distribution', font: { size: 14 } },
    },
  };

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  async ngOnInit(): Promise<void> {
    try {
      const wsRes = await firstValueFrom(this.analyticsSvc.listWorkspaces()) as any;
      const rawWs = (wsRes?.data ?? wsRes?.workspaces ?? wsRes ?? []) as any[];
      const workspaceList = Array.isArray(rawWs) ? rawWs : [];

      this.totalWorkspaces = workspaceList.length;

      // Fetch views, reports, dashboards for each workspace (limit to first 6)
      const wsSlice = workspaceList.slice(0, 6);
      const wsData: any[] = [];

      for (const ws of wsSlice) {
        const wsId = ws.workspaceId ?? ws.workspace_id ?? ws.id ?? '';
        let views: any[] = [];
        let reports: any[] = [];
        let dashboards: any[] = [];
        try {
          const vRes = await firstValueFrom(this.analyticsSvc.listViews(wsId)) as any;
          views = vRes?.data ?? vRes?.views ?? vRes ?? [];
          if (!Array.isArray(views)) views = [];
        } catch { /* ignore */ }
        try {
          const rRes = await firstValueFrom(this.analyticsSvc.listReports(wsId)) as any;
          reports = rRes?.data ?? rRes?.reports ?? rRes ?? [];
          if (!Array.isArray(reports)) reports = [];
        } catch { /* ignore */ }
        try {
          const dRes = await firstValueFrom(this.analyticsSvc.listDashboards(wsId)) as any;
          dashboards = dRes?.data ?? dRes?.dashboards ?? dRes ?? [];
          if (!Array.isArray(dashboards)) dashboards = [];
        } catch { /* ignore */ }

        wsData.push({
          name: ws.workspaceName ?? ws.name ?? 'Unnamed',
          workspaceId: wsId,
          views: views.length,
          reports: reports.length,
          dashboards: dashboards.length,
        });
      }

      this.workspaces = wsData;
      this.totalViews      = wsData.reduce((s, w) => s + w.views, 0);
      this.totalReports    = wsData.reduce((s, w) => s + w.reports, 0);
      this.totalDashboards = wsData.reduce((s, w) => s + w.dashboards, 0);

      this._buildCharts(wsData);
    } catch (e) {
      console.error('Analytics dashboard load error', e);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private _buildCharts(wsData: any[]): void {
    const PALETTE = ['#42a5f5', '#66bb6a', '#ef5350', '#ffa726', '#ab47bc', '#26c6da'];

    // 1. Views per workspace bar
    this.viewsBarData = {
      labels: wsData.map(w => w.name),
      datasets: [{
        data: wsData.map(w => w.views),
        backgroundColor: wsData.map((_, i) => PALETTE[i % PALETTE.length]),
        borderRadius: 6,
        borderSkipped: false,
      }],
    };

    // 2. Reports vs Dashboards gauge
    this.gaugeData = {
      labels: ['Reports', 'Dashboards'],
      datasets: [{
        data: [this.totalReports, this.totalDashboards],
        backgroundColor: ['#42a5f5', '#ffa726'],
        borderWidth: 0,
      }],
    };

    // 3. Coverage line (views + reports + dashboards per workspace)
    this.lineData = {
      labels: wsData.map(w => w.name),
      datasets: [{
        data: wsData.map(w => w.views + w.reports + w.dashboards),
        tension: 0.45,
        fill: true,
        borderColor: '#ab47bc',
        backgroundColor: 'rgba(171,71,188,0.15)',
        pointBackgroundColor: '#6a1b9a',
      }],
    };

    // 4. Views distribution pie
    this.pieData = {
      labels: wsData.map(w => w.name),
      datasets: [{
        data: wsData.map(w => w.views),
        backgroundColor: wsData.map((_, i) => PALETTE[i % PALETTE.length]),
        borderWidth: 2,
      }],
    };
  }

  async exportPdf(): Promise<void> {
    const el = this.dashContentRef?.nativeElement;
    if (!el) return;
    this.exporting = true;
    this.cdr.detectChanges();
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      const date = new Date().toISOString().slice(0, 10);
      pdf.save(`Analytics-Dashboard-${date}.pdf`);
    } catch (e) {
      console.error('PDF export failed', e);
    } finally {
      this.exporting = false;
      this.cdr.detectChanges();
    }
  }
}
