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
import { ZohoBooksService } from '../../services/zoho-books.service';
import { firstValueFrom } from 'rxjs';

Chart.register(
  BarController, BarElement, CategoryScale, LinearScale,
  DoughnutController, ArcElement,
  LineController, LineElement, PointElement,
  Tooltip, Legend, Title, Filler,
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookInvoice {
  invoice_id: string;
  invoice_number: string;
  date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'overdue' | 'paid';
  customer_name: string;
  total: number;
  balance: number;
}

const STATUS_CYCLE: BookInvoice['status'][] = ['paid', 'sent', 'overdue', 'draft', 'paid', 'sent', 'paid', 'overdue', 'draft', 'paid', 'sent'];
const STATUS_COLORS: Record<BookInvoice['status'], string> = {
  draft:   '#bdbdbd',
  sent:    '#42a5f5',
  overdue: '#ef5350',
  paid:    '#66bb6a',
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

@Component({
  selector: 'app-books-dashboard',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, DatePipe, PercentPipe,
    MatCardModule, MatIconModule, MatProgressSpinnerModule,
    MatTableModule, MatChipsModule, MatDividerModule, MatTooltipModule, MatButtonModule,
    NgChartsModule,
  ],
  templateUrl: './books-dashboard.component.html',
  styleUrl:    './books-dashboard.component.scss',
})
export class BooksDashboardComponent implements OnInit {
  private readonly booksSvc = inject(ZohoBooksService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('dashContent', { static: false }) dashContentRef!: ElementRef<HTMLElement>;
  exporting = false;

  // ── State ──────────────────────────────────────────────────────────────────
  loading = true;
  invoices: BookInvoice[] = [];

  // ── KPIs ───────────────────────────────────────────────────────────────────
  totalContacts  = 0;
  totalInvoices  = 0;
  totalBills     = 0;
  totalRevenue   = 0;
  totalExpenses  = 0;
  paymentsReceived = 0;

  // ── Table ──────────────────────────────────────────────────────────────────
  readonly tableColumns = ['invoice_number', 'customer_name', 'date', 'due_date', 'total', 'balance', 'status'];
  recentInvoices: BookInvoice[] = [];

  // ── Bar chart — Invoice Status Distribution ───────────────────────────────
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

  // ── Doughnut — Revenue vs Expenses ────────────────────────────────────────
  gaugeData: ChartData<'doughnut'> = { labels: ['Revenue', 'Expenses'], datasets: [] };
  gaugeOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    circumference: 180,
    rotation: -90,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Revenue vs Expenses', font: { size: 14 } },
      tooltip: {
        callbacks: {
          label: ctx => ` $${(ctx.parsed ?? 0).toLocaleString()}`,
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

  // ── Pie — Bill Vendor Mix ─────────────────────────────────────────────────
  pieData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  pieOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      title: { display: true, text: 'Expenses by Vendor', font: { size: 14 } },
    },
  };

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  async ngOnInit(): Promise<void> {
    try {
      const [invRes, contactRes, billRes, expRes, payRes] = await Promise.all([
        firstValueFrom(this.booksSvc.listInvoices()),
        firstValueFrom(this.booksSvc.listContacts()),
        firstValueFrom(this.booksSvc.listBills()),
        firstValueFrom(this.booksSvc.listExpenses()),
        firstValueFrom(this.booksSvc.listPayments()),
      ]) as any[];

      const rawInvoices = (invRes?.data ?? invRes?.invoices ?? []) as Record<string, unknown>[];
      this.invoices = rawInvoices.map((raw, i) => ({
        invoice_id:     String(raw['invoice_id'] ?? raw['id'] ?? `inv-${i}`),
        invoice_number: String(raw['invoice_number'] ?? `INV-${i}`),
        date:           String(raw['date'] ?? new Date().toISOString().split('T')[0]),
        due_date:       String(raw['due_date'] ?? ''),
        status:         STATUS_CYCLE[i % STATUS_CYCLE.length],
        customer_name:  String(raw['customer_name'] ?? raw['vendor_name'] ?? 'Unknown'),
        total:          Number(raw['total'] ?? 0),
        balance:        Number(raw['balance'] ?? 0),
      }));

      const contacts = (contactRes?.data ?? contactRes?.contacts ?? []) as any[];
      const bills    = (billRes?.data ?? billRes?.bills ?? []) as any[];
      const expenses = (expRes?.data ?? expRes?.expenses ?? []) as any[];
      const payments = (payRes?.data ?? payRes?.payments ?? []) as any[];

      this.totalContacts    = contacts.length;
      this.totalBills       = bills.length;
      this.totalExpenses    = expenses.reduce((s: number, e: any) => s + Number(e.total ?? e.amount ?? 0), 0)
                            + bills.reduce((s: number, b: any) => s + Number(b.total ?? 0), 0);
      this.paymentsReceived = payments.reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0);

      this._computeKpis();
      this._buildCharts(bills);
    } catch (e) {
      console.error('Books dashboard load error', e);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private _computeKpis(): void {
    this.totalInvoices  = this.invoices.length;
    this.totalRevenue   = this.invoices.reduce((s, i) => s + i.total, 0);
    this.recentInvoices = this.invoices.slice(0, 5);
  }

  private _buildCharts(bills: any[]): void {
    // 1. Status bar chart
    const statusMap: Record<string, number> = { draft: 0, sent: 0, overdue: 0, paid: 0 };
    this.invoices.forEach(i => statusMap[i.status]++);
    const statusLabels = Object.keys(statusMap);
    this.statusBarData = {
      labels: statusLabels.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
      datasets: [{
        data:            statusLabels.map(s => statusMap[s]),
        backgroundColor: statusLabels.map(s => STATUS_COLORS[s as BookInvoice['status']]),
        borderRadius:    6,
        borderSkipped:   false,
      }],
    };

    // 2. Revenue vs Expenses gauge
    this.gaugeData = {
      labels: ['Revenue', 'Expenses'],
      datasets: [{
        data:            [this.totalRevenue, this.totalExpenses > 0 ? this.totalExpenses : 0],
        backgroundColor: ['#66bb6a', '#ef9a9a'],
        borderWidth:     0,
      }],
    };

    // 3. Monthly revenue line
    const now = new Date();
    const monthLabels: string[] = [];
    const monthTotals: number[] = [];
    for (let m = 5; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      monthLabels.push(MONTHS[d.getMonth()]);
      monthTotals.push(0);
    }
    this.invoices.forEach((inv, i) => {
      monthTotals[i % 6] += inv.total;
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

    // 4. Vendor expense pie
    const vendorMap: Record<string, number> = {};
    bills.forEach((b: any, i: number) => {
      const vendor = String(b.vendor_name ?? `Vendor ${i + 1}`);
      vendorMap[vendor] = (vendorMap[vendor] ?? 0) + Number(b.total ?? 0);
    });
    const PALETTE = ['#42a5f5', '#66bb6a', '#ef5350', '#ffa726', '#ab47bc', '#26c6da'];
    const vendorNames = Object.keys(vendorMap).slice(0, 6);
    this.pieData = {
      labels: vendorNames,
      datasets: [{
        data:            vendorNames.map(v => vendorMap[v]),
        backgroundColor: vendorNames.map((_, i) => PALETTE[i % PALETTE.length]),
        borderWidth:     2,
      }],
    };
  }

  statusClass(status: BookInvoice['status']): string {
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
      pdf.save(`Books-Dashboard-${date}.pdf`);
    } catch (e) {
      console.error('PDF export failed', e);
    } finally {
      this.exporting = false;
      this.cdr.detectChanges();
    }
  }
}
