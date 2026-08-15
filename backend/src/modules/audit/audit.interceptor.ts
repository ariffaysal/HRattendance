import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Fields that must never be persisted to the audit trail.
const SENSITIVE_KEYS = new Set([
  'password',
  'passwordHash',
  'password_hash',
  'oldPassword',
  'newPassword',
  'confirmPassword',
  'token',
  'accessToken',
  'jwt',
  'authorization',
]);

/** Deep-copy an object, removing any sensitive fields before audit storage. */
function stripSensitive(value: any, depth = 0): any {
  if (depth > 4 || value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map((v) => stripSensitive(v, depth + 1));
  if (typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      if (SENSITIVE_KEYS.has(key)) continue;
      out[key] = stripSensitive(val, depth + 1);
    }
    return out;
  }
  return value;
}

/**
 * Records every mutating API request (create/update/delete) with the
 * authenticated actor, the target entity, and the sanitized request body.
 *
 * Sensitive routes (/auth, /health) are skipped here - auth events are logged
 * explicitly by AuthService instead.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method: string = request?.method || '';
    const url: string = request?.url || '';

    if (!MUTATING_METHODS.includes(method)) {
      return next.handle();
    }
    if (url.startsWith('/auth') || url.startsWith('/health')) {
      return next.handle();
    }

    const user = request.user || {};
    const pathParts = url.split('?')[0].split('/').filter(Boolean);
    const entity = pathParts[0] || 'unknown';
    // Only meaningful when the URL targets a specific resource (e.g. /employees/5, /attendance/clear).
    const entityId = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;

    const actionByMethod: Record<string, string> = {
      POST: 'create',
      PUT: 'update',
      PATCH: 'update',
      DELETE: 'delete',
    };

    return next.handle().pipe(
      tap({
        next: () => {
          void this.auditService.log({
            action: actionByMethod[method] || method.toLowerCase(),
            entity,
            entityId,
            actorId: user.sub ?? null,
            actorEmployeeId: user.employeeId ?? null,
            details: { body: stripSensitive(request.body ?? {}) },
            ip: request.ip ?? null,
          });
        },
        error: () => {
          // Record failed mutations too - attempted changes are audit-worthy.
          void this.auditService.log({
            action: `${actionByMethod[method] || method.toLowerCase()}_failed`,
            entity,
            entityId,
            actorId: user.sub ?? null,
            actorEmployeeId: user.employeeId ?? null,
            details: { body: stripSensitive(request.body ?? {}) },
            ip: request.ip ?? null,
          });
        },
      }),
    );
  }
}
