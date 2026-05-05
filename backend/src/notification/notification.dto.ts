export interface CreateNotificationDto {
  userEmail: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationResponseDto {
  id: string;
  userEmail: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface MarkReadDto {
  ids: string[];
}
