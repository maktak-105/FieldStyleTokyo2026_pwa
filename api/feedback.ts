/**
 * フィードバック受信。
 * 送信先は Vercel の環境変数 FEEDBACK_URL、またはローカルの .env.local。
 * 値は https://script.google.com/ の Web アプリ URL のみ。ブラウザには出さない。
 * GAS は e.parameter.message の追記だけにし、シートの中身は返さない。
 */

const MAX_MESSAGE_LENGTH = 500;
const ALLOWED_HOST = 'script.google.com';

type Decision =
  | { action: 'reject' }
  | { action: 'drop' }
  | { action: 'forward'; message: string };

type FeedbackResult = {
  status: number;
  json: { enabled?: boolean; ok?: boolean; error?: string };
  allow?: string;
};

type Forward = (message: string, targetUrl: string) => Promise<'ok' | 'upstream'>;

export function feedbackTarget(raw: string | undefined): string | null {
  if (typeof raw !== 'string' || raw.trim() === '') return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== 'https:' || url.hostname !== ALLOWED_HOST) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function assessFeedbackBody(body: unknown): Decision {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { action: 'reject' };
  }
  const record = body as { message?: unknown; website?: unknown };

  if (Object.prototype.hasOwnProperty.call(record, 'website')) {
    const website = record.website;
    if (typeof website !== 'string' || website.trim() !== '') {
      return { action: 'drop' };
    }
  }

  if (typeof record.message !== 'string') return { action: 'reject' };
  const message = record.message.trim();
  if (message === '' || message.length > MAX_MESSAGE_LENGTH) {
    return { action: 'reject' };
  }
  return { action: 'forward', message };
}

export async function forwardFeedback(message: string, targetUrl: string): Promise<'ok' | 'upstream'> {
  const form = new URLSearchParams();
  form.set('message', message);
  form.set('timestamp', new Date().toISOString());

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: form.toString(),
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });
    await response.body?.cancel();
    return response.ok ? 'ok' : 'upstream';
  } catch {
    return 'upstream';
  }
}

export async function runFeedback(
  method: string | undefined,
  body: unknown,
  targetUrl: string | null,
  forward: Forward = forwardFeedback,
): Promise<FeedbackResult> {
  if (method === 'GET') {
    return { status: 200, json: { enabled: targetUrl !== null } };
  }
  if (method !== 'POST') {
    return { status: 405, json: { ok: false, error: 'method' }, allow: 'GET, POST' };
  }
  if (targetUrl === null) {
    return { status: 503, json: { ok: false, error: 'unconfigured' } };
  }

  const decision = assessFeedbackBody(body);
  if (decision.action === 'drop') {
    return { status: 200, json: { ok: true } };
  }
  if (decision.action !== 'forward') {
    return { status: 400, json: { ok: false, error: 'invalid' } };
  }

  const result = await forward(decision.message, targetUrl);
  if (result !== 'ok') {
    return { status: 502, json: { ok: false, error: 'upstream' } };
  }
  return { status: 200, json: { ok: true } };
}

function normalizeBody(body: unknown): unknown {
  if (typeof body !== 'string') return body;
  if (body.length > 4096) return null;
  try {
    return JSON.parse(body) as unknown;
  } catch {
    return null;
  }
}

type FeedbackResponse = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body: string) => void;
};

type FeedbackRequest = {
  method?: string;
  body?: unknown;
};

export function applyResult(res: FeedbackResponse, result: FeedbackResult) {
  res.statusCode = result.status;
  if (result.allow) res.setHeader('Allow', result.allow);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(result.json));
}

export default async function handler(req: FeedbackRequest, res: FeedbackResponse) {
  const body = req.method === 'POST' ? normalizeBody(req.body) : undefined;
  const env = (globalThis as { process?: { env?: { FEEDBACK_URL?: string } } }).process?.env?.FEEDBACK_URL;
  const target = feedbackTarget(env);
  const result = await runFeedback(req.method, body, target);
  applyResult(res, result);
}
