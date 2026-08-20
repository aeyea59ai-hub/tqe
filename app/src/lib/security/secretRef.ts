/**
 * Secret reference resolution.
 *
 * `secret_ref` is an *indirection only*. It names an environment variable and is
 * never itself a credential. This is enforced so that:
 *
 *  - a raw API key can never be persisted into the `ai_providers` table;
 *  - a raw API key can never be returned by the providers API;
 *  - a raw API key can never arrive over the wire from a UI form.
 *
 * The only accepted grammar is `env:NAME`, where NAME matches
 * `[A-Z_][A-Z0-9_]*`. `env:NONE` is the explicit "no credential" sentinel.
 */

export const NO_SECRET = 'env:NONE';

const SECRET_REF_PATTERN = /^env:([A-Z_][A-Z0-9_]*)$/;

export class SecretRefError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecretRefError';
  }
}

/** True when `ref` is a syntactically valid indirection. */
export function isValidSecretRef(ref: unknown): ref is string {
  return typeof ref === 'string' && SECRET_REF_PATTERN.test(ref);
}

/**
 * Validate a `secret_ref` supplied by a client before it is persisted.
 * Throws when the value looks like an inline credential.
 */
export function assertValidSecretRef(ref: unknown): string {
  if (ref === undefined || ref === null || ref === '') {
    return NO_SECRET;
  }
  if (!isValidSecretRef(ref)) {
    throw new SecretRefError(
      'secret_ref must be an environment indirection of the form "env:NAME". ' +
        'Inline API keys are not accepted and are never stored.',
    );
  }
  return ref;
}

/**
 * Resolve a `secret_ref` to its credential value.
 *
 * Returns `undefined` when there is no credential to use. Never falls back to
 * treating the reference itself as a key.
 */
export function resolveSecretRef(ref: string | undefined | null): string | undefined {
  if (!ref || ref === NO_SECRET) {
    return undefined;
  }
  const match = SECRET_REF_PATTERN.exec(ref);
  if (!match) {
    // A malformed reference must not be used as a literal credential.
    return undefined;
  }
  const value = process.env[match[1]];
  return value && value.length > 0 ? value : undefined;
}

/**
 * Strip credential-bearing fields from a provider record before it leaves the
 * process over an API boundary.
 */
export function redactProvider<T extends { secret_ref?: string }>(
  provider: T,
): Omit<T, 'secret_ref'> & { secret_ref: string; secret_configured: boolean } {
  const { secret_ref, ...rest } = provider;
  return {
    ...(rest as Omit<T, 'secret_ref'>),
    // The *name* of the indirection is safe to show; the value never leaves.
    secret_ref: secret_ref && secret_ref !== NO_SECRET ? secret_ref : NO_SECRET,
    secret_configured: resolveSecretRef(secret_ref) !== undefined,
  };
}
