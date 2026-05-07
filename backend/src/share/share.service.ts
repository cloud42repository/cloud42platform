import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'node:crypto';
import { ShareEntity } from './share.entity';
import { DashboardEntity } from '../dashboard/dashboard.entity';
import { FormEntity } from '../form/form.entity';
import { WorkflowEntity } from '../workflow/workflow.entity';
import { ApplicationEntity } from '../application/application.entity';
import type {
  CreateShareDto,
  ShareResponseDto,
  SharedItemResponseDto,
} from './share.dto';

@Injectable()
export class ShareService {
  constructor(
    @InjectRepository(ShareEntity)
    private readonly shareRepo: Repository<ShareEntity>,
    @InjectRepository(DashboardEntity)
    private readonly dashboardRepo: Repository<DashboardEntity>,
    @InjectRepository(FormEntity)
    private readonly formRepo: Repository<FormEntity>,
    @InjectRepository(WorkflowEntity)
    private readonly workflowRepo: Repository<WorkflowEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepo: Repository<ApplicationEntity>,
  ) {}

  private toDto(s: ShareEntity): ShareResponseDto {
    return {
      token: s.token,
      itemType: s.itemType,
      itemId: s.itemId,
      ownerEmail: s.ownerEmail,
      active: s.active,
      createdAt: s.createdAt.toISOString(),
      sharedWithEmail: s.sharedWithEmail,
    };
  }

  private generateToken(): string {
    return randomBytes(24).toString('base64url');
  }

  /** Create a share link (or return existing active one) */
  async create(dto: CreateShareDto): Promise<ShareResponseDto[]> {
    const emails = dto.sharedWithEmails?.length ? dto.sharedWithEmails : [null];
    const results: ShareResponseDto[] = [];

    for (const email of emails) {
      // Check if an active share already exists for this item + target
      const where: Record<string, unknown> = {
        itemType: dto.itemType,
        itemId: dto.itemId,
        ownerEmail: dto.ownerEmail,
        active: true,
      };
      if (email) {
        where['sharedWithEmail'] = email;
      } else {
        where['sharedWithEmail'] = null as any;
      }
      const existing = await this.shareRepo.findOneBy(where as any);
      if (existing) {
        results.push(this.toDto(existing));
        continue;
      }

      const share = this.shareRepo.create({
        token: this.generateToken(),
        itemType: dto.itemType,
        itemId: dto.itemId,
        ownerEmail: dto.ownerEmail,
        active: true,
        sharedWithEmail: email,
      });
      const saved = await this.shareRepo.save(share);
      results.push(this.toDto(saved));
    }

    return results;
  }

  /** List all shares for a given user */
  async findByOwner(ownerEmail: string): Promise<ShareResponseDto[]> {
    const rows = await this.shareRepo.find({
      where: { ownerEmail, active: true },
      order: { createdAt: 'DESC' },
    });
    return rows.map(s => this.toDto(s));
  }

  /** List shares that were shared WITH a specific user */
  async findSharedWithMe(email: string): Promise<ShareResponseDto[]> {
    const rows = await this.shareRepo.find({
      where: { sharedWithEmail: email, active: true },
      order: { createdAt: 'DESC' },
    });
    return rows.map(s => this.toDto(s));
  }

  /** Revoke (deactivate) a share */
  async revoke(token: string, ownerEmail: string): Promise<void> {
    const share = await this.shareRepo.findOneBy({ token, ownerEmail });
    if (!share) throw new NotFoundException('Share not found');
    share.active = false;
    await this.shareRepo.save(share);
  }

  /** Public: resolve a share token into item data */
  async resolvePublic(token: string): Promise<SharedItemResponseDto> {
    const share = await this.shareRepo.findOneBy({ token, active: true });
    if (!share) throw new NotFoundException('Share link not found or expired');

    let data: unknown;

    switch (share.itemType) {
      case 'dashboard': {
        const db = await this.dashboardRepo.findOneBy({ id: share.itemId });
        if (!db) throw new NotFoundException('Dashboard not found');
        data = {
          id: db.id,
          name: db.name,
          description: db.description,
          widgets: db.widgets,
          status: db.status,
        };
        break;
      }
      case 'form': {
        const form = await this.formRepo.findOneBy({ id: share.itemId });
        if (!form) throw new NotFoundException('Form not found');
        data = {
          id: form.id,
          name: form.name,
          description: form.description,
          fields: form.fields,
          submitActions: form.submitActions,
          status: form.status,
        };
        break;
      }
      case 'workflow': {
        const wf = await this.workflowRepo.findOneBy({ id: share.itemId });
        if (!wf) throw new NotFoundException('Workflow not found');
        data = {
          id: wf.id,
          name: wf.name,
          description: wf.description,
          steps: wf.steps,
          inputs: wf.inputs,
          outputs: wf.outputs,
          status: wf.status,
        };
        break;
      }
      case 'application': {
        const app = await this.applicationRepo.findOneBy({ id: share.itemId });
        if (!app) throw new NotFoundException('Application not found');

        // Resolve each page's referenced item so the shared viewer has all data
        const resolvedPages: Record<string, unknown> = {};
        for (const page of app.pages as any[]) {
          if (!page.itemId) continue;
          try {
            if (page.type === 'form') {
              const f = await this.formRepo.findOneBy({ id: page.itemId });
              if (f) resolvedPages[page.itemId] = { id: f.id, name: f.name, description: f.description, fields: f.fields, submitActions: f.submitActions, status: f.status };
            } else if (page.type === 'dashboard') {
              const d = await this.dashboardRepo.findOneBy({ id: page.itemId });
              if (d) resolvedPages[page.itemId] = { id: d.id, name: d.name, description: d.description, widgets: d.widgets, status: d.status };
            } else if (page.type === 'workflow') {
              const w = await this.workflowRepo.findOneBy({ id: page.itemId });
              if (w) resolvedPages[page.itemId] = { id: w.id, name: w.name, description: w.description, steps: w.steps, inputs: w.inputs, outputs: w.outputs, status: w.status };
            }
          } catch { /* skip unresolvable pages */ }
        }

        data = {
          id: app.id,
          name: app.name,
          description: app.description,
          pages: app.pages,
          navigation: app.navigation,
          status: app.status,
          resolvedPages,
        };
        break;
      }
    }

    return {
      token: share.token,
      itemType: share.itemType,
      itemId: share.itemId,
      data,
    };
  }
}
