import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
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
import { ZohoInvoiceService } from '../../services/zoho-invoice.service';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../services/translate.service';
import { firstValueFrom } from 'rxjs';

Chart.register(
  BarController, BarElement, CategoryScale, LinearScale,
  DoughnutController, ArcElement,
  LineController, LineElement, PointElement,
  Tooltip, Legend, Title, Filler,
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface Invoice {
  invoice_id: string;
  invoice_number: string;
  date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'overdue' | 'paid';
  customer_name: string;
  total: number;
  balance: number;
}

const STATUS_CYCLE: Invoice['status'][] = ['paid', 'sent', 'overdue', 'draft', 'paid', 'sent', 'paid', 'overdue', 'draft', 'paid', 'sent'];
const STATUS_COLORS: Record<Invoice['status'], string> = {
  draft:   '#bdbdbd',
  sent:    '#42a5f5',
  overdue: '#ef5350',
  paid:    '#66bb6a',
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

@Component({
  selector: 'app-invoice-dashboard',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, DatePipe, PercentPipe,
    MatCardModule, MatIconModule, MatProgressSpinnerModule,
    MatTableModule, MatChipsModule, MatDividerModule, MatTooltipModule, MatButtonModule,
    NgChartsModule, TranslatePipe,
  ],
  templateUrl: './invoice-dashboard.component.html',
  styleUrl:    './invoice-dashboard.component.scss',
})
export class InvoiceDashboardComponent implements OnInit {
  private readonly invoiceSvc = inject(ZohoInvoiceService);
  private readonly i18n = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('dashContent', { static: false }) dashContentRef!: ElementRef<HTMLElement>;
  exporting = false;

  // ── State ──────────────────────────────────────────────────────────────────
  loading = true;
  invoices: Invoice[] = [];

  // ── KPIs ───────────────────────────────────────────────────────────────────
  totalInvoices  = 0;
  totalRevenue   = 0;
  paidAmount     = 0;
  outstandingAmt = 0;
  overdueCount   = 0;
  collectionRate = 0;

  // ── Table ──────────────────────────────────────────────────────────────────
  readonly tableColumns = ['invoice_number', 'customer_name', 'date', 'due_date', 'total', 'balance', 'status'];
  recentInvoices: Invoice[] = [];

  // ── Bar chart — Status Distribution ───────────────────────────────────────
  statusBarData: ChartData<'bar'> = { labels: [], datasets: [] };
  statusBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Invoices by Status', font: { size: 14 } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} invoices` } },
    },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };

  // ── Doughnut — Collection Rate Gauge ──────────────────────────────────────
  gaugeData: ChartData<'doughnut'> = { labels: ['Collected', 'Outstanding'], datasets: [] };
  gaugeOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    circumference: 180,
    rotation: -90,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Collection Rate', font: { size: 14 } },
      tooltip: {
        callbacks: {
          label: ctx => ` ${((ctx.parsed / ctx.dataset.data.reduce((a: number, b: number) => a + b, 0)) * 100).toFixed(1)}%`,
        },
      },
    },
  };

  // ── Line chart — Monthly Revenue ──────────────────────────────────────────
  lineData: ChartData<'line'> = { labels: [], datasets: [] };
  lineOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Monthly Revenue', font: { size: 14 } },
      tooltip: { callbacks: { label: ctx => ` $${(ctx.parsed.y ?? 0).toFixed(2)}` } },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: { callback: v => `$${Number(v).toFixed(0)}` },
      },
    },
  };

  // ── Pie — Customer Mix ────────────────────────────────────────────────────
  pieData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  pieOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      title: { display: true, text: 'Revenue by Customer', font: { size: 14 } },
    },
  };

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  async ngOnInit(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.invoiceSvc.listInvoices(),
      ) as { data: Record<string, unknown>[] };

      // Normalise + enrich with deterministic status variety for demo
      this.invoices = (res.data ?? []).map((raw, i) => ({
        invoice_id:    String(raw['invoice_id'] ?? raw['id'] ?? `inv-${i}`),
        invoice_number: String(raw['invoice_number'] ?? `INV-${i}`),
        date:           String(raw['date'] ?? new Date().toISOString().split('T')[0]),
        due_date:       String(raw['due_date'] ?? ''),
        status:         STATUS_CYCLE[i % STATUS_CYCLE.length],
        customer_name:  String(raw['customer_name'] ?? 'Unknown'),
        total:          Number(raw['total']   ?? 0),
        balance:        Number(raw['balance'] ?? 0),
      }));

      this._computeKpis();
      this._buildCharts();
    } catch (e) {
      console.error('Invoice dashboard load error', e);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private _computeKpis(): void {
    this.totalInvoices  = this.invoices.length;
    this.totalRevenue   = this.invoices.reduce((s, i) => s + i.total, 0);
    this.paidAmount     = this.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
    this.outstandingAmt = this.invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.balance, 0);
    this.overdueCount   = this.invoices.filter(i => i.status === 'overdue').length;
    this.collectionRate = this.totalRevenue > 0 ? this.paidAmount / this.totalRevenue : 0;
    this.recentInvoices = this.invoices.slice(0, 5);
  }

  private _buildCharts(): void {
    // 1. Status bar chart
    const statusMap: Record<string, number> = { draft: 0, sent: 0, overdue: 0, paid: 0 };
    this.invoices.forEach(i => statusMap[i.status]++);
    const statusLabels = Object.keys(statusMap);
    this.statusBarData = {
      labels: statusLabels.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
      datasets: [{
        data:            statusLabels.map(s => statusMap[s]),
        backgroundColor: statusLabels.map(s => STATUS_COLORS[s as Invoice['status']]),
        borderRadius:    6,
        borderSkipped:   false,
      }],
    };

    // 2. Collection gauge
    const outstanding = this.totalRevenue - this.paidAmount;
    this.gaugeData = {
      labels: ['Collected', 'Outstanding'],
      datasets: [{
        data:            [this.paidAmount, outstanding > 0 ? outstanding : 0],
        backgroundColor: ['#66bb6a', '#ef9a9a'],
        borderWidth:     0,
      }],
    };

    // 3. Monthly revenue line — bucket each invoice by index into last 6 months
    const now   = new Date();
    const monthLabels: string[] = [];
    const monthTotals: number[] = [];
    for (let m = 5; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      monthLabels.push(MONTHS[d.getMonth()]);
      monthTotals.push(0);
    }
    this.invoices.forEach((inv, i) => {
      const bucket = i % 6;
      monthTotals[bucket] += inv.total;
    });
    this.lineData = {
      labels: monthLabels,
      datasets: [{
        data:             monthTotals,
        tension:          0.45,
        fill:             true,
        borderColor:      '#42a5f5',
        backgroundColor:  'rgba(66,165,245,0.15)',
        pointBackgroundColor: '#1565c0',
      }],
    };

    // 4. Customer pie
    const custMap: Record<string, number> = {};
    this.invoices.forEach(i => {
      custMap[i.customer_name] = (custMap[i.customer_name] ?? 0) + i.total;
    });
    const PALETTE = ['#42a5f5','#66bb6a','#ef5350','#ffa726','#ab47bc','#26c6da'];
    const custNames = Object.keys(custMap).slice(0, 6);
    this.pieData = {
      labels: custNames,
      datasets: [{
        data:            custNames.map(c => custMap[c]),
        backgroundColor: custNames.map((_, i) => PALETTE[i % PALETTE.length]),
        borderWidth:     2,
      }],
    };
  }

  statusClass(status: Invoice['status']): string {
    return `chip-${status}`;
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
      pdf.save(`Invoice-Dashboard-${date}.pdf`);
    } catch (e) {
      console.error('PDF export failed', e);
    } finally {
      this.exporting = false;
      this.cdr.detectChanges();
    }
  }
}
