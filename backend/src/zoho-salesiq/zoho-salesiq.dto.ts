import { ZohoListParams } from "../shared/shared.dto";

// â”€â”€â”€ Visitor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type VisitorStatus = "browsing" | "chatting" | "idle" | "triggered";

export interface SalesIQVisitor {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  ip?: string;
  status?: VisitorStatus;
  url?: string;
  referrer?: string;
  user_agent?: string;
  time_spent?: number;
  no_of_visits?: number;
  first_visit?: string;
  last_visit?: string;
  custom_data?: Record<string, unknown>;
}

// â”€â”€â”€ Chat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type ChatStatus = "open" | "missed" | "waiting" | "completed";

export interface SalesIQChat {
  id?: string;
  visitor_id?: string;
  visitor_name?: string;
  visitor_email?: string;
  operator_id?: string;
  operator_name?: string;
  departmentid?: string;
  status?: ChatStatus;
  queue_time?: number;
  wait_time?: number;
  chat_duration?: number;
  rating?: number;
  feedback?: string;
  start_time?: string;
  end_time?: string;
  messages?: SalesIQMessage[];
}

export interface SalesIQMessage {
  id?: string;
  type?: "visitor" | "operator" | "bot";
  text?: string;
  time?: string;
  attacher_name?: string;
}

// â”€â”€â”€ Operator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type OperatorStatus = "online" | "busy" | "offline";

export interface SalesIQOperator {
  id?: string;
  name?: string;
  email?: string;
  status?: OperatorStatus;
  concurrent_chats?: number;
  departments?: string[];
}

// â”€â”€â”€ Department â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface SalesIQDepartment {
  id?: string;
  name?: string;
  description?: string;
  enabled?: boolean;
  operator_ids?: string[];
}

// â”€â”€â”€ Feedback Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface SalesIQFeedbackForm {
  id?: string;
  name?: string;
  questions?: {
    id?: string;
    type?: "rating" | "yesno" | "text";
    question?: string;
  }[];
}

// â”€â”€â”€ Bot â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface SalesIQBot {
  id?: string;
  name?: string;
  type?: "webhook" | "codal";
  url?: string;
  is_enabled?: boolean;
}

// â”€â”€â”€ List params â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface SalesIQListParams extends ZohoListParams {
  status?: string;
  department_id?: string;
  operator_id?: string;
  from?: string;
  to?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}
