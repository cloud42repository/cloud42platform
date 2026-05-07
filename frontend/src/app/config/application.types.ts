export type ApplicationStatus = 'draft' | 'published';

/** A page/view in the application */
export interface AppPage {
  id: string;
  label: string;
  icon: string;
  /** What kind of content this page shows */
  type: 'form' | 'dashboard' | 'workflow';
  /** The ID of the form/dashboard/workflow to embed */
  itemId: string;
}

/** Navigation settings */
export interface AppNavigation {
  /** Navigation style */
  style: 'sidebar' | 'tabs' | 'top-bar';
  /** The page ID to show by default */
  homePage?: string;
}

/** Full application definition */
export interface ApplicationDefinition {
  id: string;
  name: string;
  description?: string;
  pages: AppPage[];
  navigation: AppNavigation;
  status: ApplicationStatus;
  createdAt?: string;
  updatedAt?: string;
  /** Pre-resolved page item data (used in shared/public views) */
  resolvedPages?: Record<string, Record<string, unknown>>;
}
