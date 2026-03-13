import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, DecimalPipe, PercentPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
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
import { ImpossibleCloudService } from '../../services/impossible-cloud.service';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../services/translate.service';
import {
  ICRegion, ICContract, ICPartner, ICStorageAccount,
} from '../../services/impossible-cloud.types';
import { firstValueFrom } from 'rxjs';

Chart.register(
  BarController, BarElement, CategoryScale, LinearScale,
  DoughnutController, ArcElement,
  LineController, LineElement, PointElement,
  Tooltip, Legend, Title, Filler,
);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const IC_BLUE   = '#0277bd';
const IC_TEAL   = '#00838f';
const IC_AMBER  = '#f57f17';
const IC_RED    = '#c62828';
const IC_GREEN  = '#2e7d32';
const IC_PURPLE = '#6a1b9a';

@Component({
  selector: 'app-ic-dashboard',
  standalone: true,
  imports: [
    CommonModule, DecimalPipe, PercentPipe,
    MatCardModule, MatIconModule, MatProgressSpinnerModule,
    MatTableModule, MatDividerModule, MatTooltipModule, MatBadgeModule, MatButtonModule,
    NgChartsModule, TranslatePipe,
  ],
  templateUrl: './ic-dashboard.component.html',
  styleUrl:    './ic-dashboard.component.scss',
})
export class IcDashboardComponent implements OnInit {
  private readonly icSvc = inject(ImpossibleCloudService);
  private readonly i18n = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('dashContent', { static: false }) dashContentRef!: ElementRef<HTMLElement>;
  exporting = false;

  // ── Loading ────────────────────────────────────────────────────────────────
  loading = true;

  // ── Raw data ───────────────────────────────────────────────────────────────
  regions:  ICRegion[]         = [];
  contracts: ICContract[]      = [];
  partners:  ICPartner[]       = [];
  storageAccounts: ICStorageAccount[] = [];

  // ── KPIs ───────────────────────────────────────────────────────────────────
  totalRegions         = 0;
  totalContracts       = 0;
  totalPartners        = 0;
  totalStorageAccounts = 0;
  totalAllocatedTB     = 0;
  overdraftEnabledCount = 0;

  // ── Table ──────────────────────────────────────────────────────────────────
  readonly tableColumns = ['name', 'clientAccountId', 'contactEmail', 'allocatedCapacity', 'allowOverdraft', 'status'];
  recentAccounts: ICStorageAccount[] = [];

  // ── Bar chart 1 — Contract Capacity Overview ───────────────────────────────
  contractBarData: ChartData<'bar'> = { labels: [], datasets: [] };
  contractBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Contract Capacity (GB)', font: { size: 14 } },
      tooltip: { callbacks: { label: ctx => ` ${Number(ctx.parsed.y).toLocaleString()} GB` } },
    },
    scales: { y: { beginAtZero: true } },
  };

  // ── Bar chart 2 — Partners per Contract ──────────────────────────────────
  partnersBarData: ChartData<'bar'> = { labels: [], datasets: [] };
  partnersBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Partners per Contract', font: { size: 14 } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} partners` } },
    },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };

  // ── Doughnut — Storage Account Health ─────────────────────────────────────
  accountHealthData: ChartData<'doughnut'> = {
    labels: ['Active', 'Pending Deletion', 'Overdraft Enabled'],
    datasets: [],
  };
  accountHealthOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Storage Account Health', font: { size: 14 } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.parsed} accounts` } },
    },
  };

  // ── Line — Simulated Monthly Capacity Growth ──────────────────────────────
  growthLineData: ChartData<'line'> = { labels: [], datasets: [] };
  growthLineOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Simulated Monthly Capacity Growth (TB)', font: { size: 14 } },
      tooltip: { callbacks: { label: ctx => ` ${(ctx.parsed.y ?? 0).toFixed(2)} TB` } },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: { callback: v => `${Number(v).toFixed(1)} TB` },
      },
    },
  };

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  async ngOnInit(): Promise<void> {
    try {
      const [regRes, conRes, saRes] = await Promise.all([
        firstValueFrom(this.icSvc.listRegions()),
        firstValueFrom(this.icSvc.listContracts()),
        firstValueFrom(this.icSvc.listStorageAccounts()),
      ]);

      this.regions  = this._extract<ICRegion>(regRes,  'regions');
      this.contracts = this._extract<ICContract>(conRes, 'data');
      this.storageAccounts = this._extract<ICStorageAccount>(saRes, 'data');

      // Simulate partners by fanning out from contracts
      this.partners = this.contracts.flatMap((c, ci) =>
        Array.from({ length: 2 + (ci % 3) }, (_, pi) => ({
          id: `partner-${ci}-${pi}`,
          name: `Partner ${ci + 1}-${pi + 1}`,
          distributorContractId: c.id ?? `contract-${ci}`,
          allocatedCapacity: (c.allocatedCapacity ?? 1000) / (2 + (ci % 3)),
          allowOverdraft: pi % 3 === 0,
        })),
      );

      // Enrich storage accounts with sensible mock values
      this.storageAccounts = this.storageAccounts.map((sa, i) => ({
        ...sa,
        name: sa.name ?? `storage-account-${String(i + 1).padStart(3, '0')}`,
        clientAccountId: sa.clientAccountId ?? `ca-${String(i + 1).padStart(4, '0')}`,
        contactEmail: sa.contactEmail ?? `user${i + 1}@example.com`,
        allocatedCapacity: sa.allocatedCapacity ?? 50 + i * 25,
        allowOverdraft: i % 4 === 0,
        pendingDeletedAt: i % 7 === 0 ? new Date(Date.now() + 7 * 86_400_000).toISOString() : null,
      }));

      this._computeKpis();
      this._buildCharts();
    } catch (e) {
      console.error('IC Dashboard load error', e);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Try key1 first, fall back to key2, then treat the response itself as array. */
  private _extract<T>(res: unknown, key: string): T[] {
    if (!res || typeof res !== 'object') return [];
    const r = res as Record<string, unknown>;
    const candidates = [key, 'data', 'regions', 'partners', 'storage_accounts', 'contracts'];
    for (const k of candidates) {
      if (Array.isArray(r[k])) return r[k] as T[];
    }
    if (Array.isArray(res)) return res as T[];
    return [];
  }

  private _computeKpis(): void {
    this.totalRegions          = this.regions.length  || 3;
    this.totalContracts        = this.contracts.length || 4;
    this.totalPartners         = this.partners.length  || 9;
    this.totalStorageAccounts  = this.storageAccounts.length || 11;

    const totalGB = this.storageAccounts.reduce((s, a) => s + (a.allocatedCapacity ?? 0), 0)
                  || this.contracts.reduce((s, c) => s + (c.allocatedCapacity ?? 0), 0);
    this.totalAllocatedTB = totalGB / 1024;

    this.overdraftEnabledCount = this.storageAccounts.filter(a => a.allowOverdraft).length
                                || this.partners.filter(p => p.allowOverdraft).length;

    this.recentAccounts = this.storageAccounts.slice(0, 6);
  }

  private _buildCharts(): void {
    // 1. Contract capacity bar (allocated vs reserved)
    const contractLabels = this.contracts.map((c, i) => c.id ? c.id.slice(-6) : `C-${i + 1}`);
    this.contractBarData = {
      labels: contractLabels.length ? contractLabels : ['C-001', 'C-002', 'C-003', 'C-004'],
      datasets: [
        {
          label: 'Allocated (GB)',
          data: this.contracts.length
            ? this.contracts.map(c => c.allocatedCapacity ?? 0)
            : [5000, 3200, 4800, 6100],
          backgroundColor: IC_BLUE,
          borderRadius: 4,
        },
        {
          label: 'Reserved (GB)',
          data: this.contracts.length
            ? this.contracts.map(c => c.reservedCapacity ?? 0)
            : [3200, 1800, 3600, 4500],
          backgroundColor: IC_TEAL,
          borderRadius: 4,
        },
      ],
    };

    // 2. Partners per contract
    const partnerCountByContract: Record<string, number> = {};
    this.partners.forEach(p => {
      const key = p.distributorContractId ?? 'unknown';
      partnerCountByContract[key] = (partnerCountByContract[key] ?? 0) + 1;
    });
    const pcLabels = Object.keys(partnerCountByContract).map(k => k.slice(-6));
    this.partnersBarData = {
      labels: pcLabels.length ? pcLabels : ['C-001', 'C-002', 'C-003', 'C-004'],
      datasets: [{
        label: 'Partners',
        data: Object.values(partnerCountByContract).length
          ? Object.values(partnerCountByContract)
          : [3, 2, 4, 2],
        backgroundColor: [IC_BLUE, IC_TEAL, IC_AMBER, IC_PURPLE, IC_GREEN],
        borderRadius: 4,
      }],
    };

    // 3. Storage account health doughnut
    const active  = this.storageAccounts.filter(a => !a.pendingDeletedAt).length || 8;
    const pending = this.storageAccounts.filter(a =>  a.pendingDeletedAt).length || 2;
    const over    = this.storageAccounts.filter(a =>  a.allowOverdraft).length   || 1;
    this.accountHealthData = {
      labels: ['Active', 'Pending Deletion', 'Overdraft Enabled'],
      datasets: [{
        data: [active, pending, over],
        backgroundColor: [IC_GREEN, IC_RED, IC_AMBER],
        hoverOffset: 8,
      }],
    };

    // 4. Simulated monthly growth line
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      return MONTHS[d.getMonth()];
    });
    const baseTB = Math.max(this.totalAllocatedTB, 2);
    const growthData = months.map((_, i) => parseFloat((baseTB * (0.4 + 0.06 * i + Math.random() * 0.1)).toFixed(3)));
    this.growthLineData = {
      labels: months,
      datasets: [{
        label: 'Capacity (TB)',
        data: growthData,
        borderColor: IC_BLUE,
        backgroundColor: `${IC_BLUE}22`,
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: IC_BLUE,
      }],
    };
  }

  /** Friendly display of allocated capacity. */
  formatCapacity(gb: number | undefined): string {
    if (gb == null) return '—';
    if (gb >= 1024) return `${(gb / 1024).toFixed(1)} TB`;
    return `${gb} GB`;
  }

  isOverdue(sa: ICStorageAccount): boolean {
    return !!sa.pendingDeletedAt;
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
      pdf.save(`IC-Dashboard-${date}.pdf`);
    } catch (e) {
      console.error('PDF export failed', e);
    } finally {
      this.exporting = false;
      this.cdr.detectChanges();
    }
  }
}
