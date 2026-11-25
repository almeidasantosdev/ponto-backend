export interface TimeEntry {
  email: unknown;
  type: unknown;
  timestamp: Date;
  ip: string;
}

export interface PunchBody {
  email?: unknown;
  password?: unknown;
  type?: unknown;
  timestamp?: unknown;
  ip?: unknown;
}

export interface PunchSuccess {
  message: string;
  data: TimeEntry;
}

export interface PunchFailure {
  error: 'Dados insuficientes.';
}
