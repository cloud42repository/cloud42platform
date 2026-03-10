import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

const PREFIX = '/zoho-recruit';

@Injectable({ providedIn: 'root' })
export class ZohoRecruitService {
  private readonly api = inject(ApiService);

  // Job Openings
  listJobOpenings(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/job-openings', {}, query);
  }
  getJobOpening(id: string) {
    return this.api.get(PREFIX, '/job-openings/:id', { id });
  }
  createJobOpenings(data: unknown[]) {
    return this.api.post(PREFIX, '/job-openings', {}, { data });
  }
  updateJobOpenings(data: unknown[]) {
    return this.api.put(PREFIX, '/job-openings', {}, { data });
  }
  deleteJobOpening(id: string) {
    return this.api.delete(PREFIX, '/job-openings/:id', { id });
  }

  // Candidates
  listCandidates(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/candidates', {}, query);
  }
  searchCandidates(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/candidates/search', {}, query);
  }
  getCandidate(id: string) {
    return this.api.get(PREFIX, '/candidates/:id', { id });
  }
  createCandidates(data: unknown[]) {
    return this.api.post(PREFIX, '/candidates', {}, { data });
  }
  updateCandidates(data: unknown[]) {
    return this.api.put(PREFIX, '/candidates', {}, { data });
  }
  deleteCandidate(id: string) {
    return this.api.delete(PREFIX, '/candidates/:id', { id });
  }

  // Interviews
  listInterviews(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/interviews', {}, query);
  }
  getInterview(id: string) {
    return this.api.get(PREFIX, '/interviews/:id', { id });
  }
  createInterviews(data: unknown[]) {
    return this.api.post(PREFIX, '/interviews', {}, { data });
  }
  deleteInterview(id: string) {
    return this.api.delete(PREFIX, '/interviews/:id', { id });
  }

  // Offers
  listOffers(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/offers', {}, query);
  }
  getOffer(id: string) {
    return this.api.get(PREFIX, '/offers/:id', { id });
  }
}
