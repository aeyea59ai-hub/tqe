import type { Response } from 'express';

import { MarketParamError } from './marketParams';
import { ProviderUrlError } from './providerUrlPolicy';
import { SecretRefError } from './secretRef';

/**
 * Structured, non-leaking API error responses.
 *
 * Handlers previously returned `err.message` straight to the client, which
 * exposes internal details such as SQLite constraint text, filesystem paths and
 * upstream response bodies. Only errors that are deliberately raised as client
 * input errors carry their message outward; everything else is reported as a
 * generic internal error and logged server-side.
 */

export type ApiErrorCode =
  | 'INVALID_REQUEST'
  | 'PROVIDER_URL_REJECTED'
  | 'SECRET_REF_REJECTED'
  | 'UPSTREAM_UNAVAILABLE'
  | 'INTERNAL_ERROR';

export interface ApiErrorBody {
  success: false;
  error: { code: ApiErrorCode; message: string };
}

/** An error whose message is intentionally safe to return to the client. */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string, status = 400) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

function classify(err: unknown): { status: number; body: ApiErrorBody } {
  if (err instanceof ApiError) {
    return { status: err.status, body: { success: false, error: { code: err.code, message: err.message } } };
  }
  if (err instanceof MarketParamError) {
    return { status: 400, body: { success: false, error: { code: 'INVALID_REQUEST', message: err.message } } };
  }
  if (err instanceof ProviderUrlError) {
    return { status: 400, body: { success: false, error: { code: 'PROVIDER_URL_REJECTED', message: err.message } } };
  }
  if (err instanceof SecretRefError) {
    return { status: 400, body: { success: false, error: { code: 'SECRET_REF_REJECTED', message: err.message } } };
  }
  return {
    status: 500,
    body: {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'An internal error occurred. See server logs for details.' },
    },
  };
}

/**
 * Send a structured error response and log the underlying cause server-side.
 * `context` identifies the handler in the server log.
 */
export function sendError(res: Response, err: unknown, context: string): void {
  const { status, body } = classify(err);
  if (body.error.code === 'INTERNAL_ERROR') {
    console.error(`[${context}]`, err);
  } else {
    console.warn(`[${context}] ${body.error.code}: ${body.error.message}`);
  }
  res.status(status).json(body);
}
