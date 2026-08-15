import { lastValueFrom, of, throwError } from 'rxjs';
import { AuditInterceptor } from './audit.interceptor';
import { AuditService } from './audit.service';

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let auditService: { log: jest.Mock };

  beforeEach(() => {
    auditService = { log: jest.fn().mockResolvedValue(undefined) };
    interceptor = new AuditInterceptor(auditService as any);
  });

  const buildContext = (method: string, url: string, user: any = { sub: 1, employeeId: 'EMP001' }) => ({
    switchToHttp: () => ({
      getRequest: () => ({ method, url, user, body: { name: 'John' }, ip: '10.0.0.1' }),
    }),
  }) as any;

  const callHandler = (observable: any) => ({ handle: () => observable });

  it('skips read-only requests', async () => {
    await lastValueFrom(
      interceptor.intercept(buildContext('GET', '/employees'), callHandler(of({ ok: true }))),
    );
    expect(auditService.log).not.toHaveBeenCalled();
  });

  it('records a mutation with actor and entity', async () => {
    await lastValueFrom(
      interceptor.intercept(buildContext('POST', '/employees'), callHandler(of({ id: 5 }))),
    );
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'create',
        entity: 'employees',
        entityId: null,
        actorId: 1,
        actorEmployeeId: 'EMP001',
        ip: '10.0.0.1',
      }),
    );
  });

  it('skips /auth and /health routes', async () => {
    await lastValueFrom(
      interceptor.intercept(buildContext('POST', '/auth/login', {}), callHandler(of({}))),
    );
    await lastValueFrom(
      interceptor.intercept(buildContext('POST', '/health', {}), callHandler(of({}))),
    );
    expect(auditService.log).not.toHaveBeenCalled();
  });

  it('strips password-like fields from the stored body', async () => {
    await lastValueFrom(
      interceptor.intercept(
        {
          switchToHttp: () => ({
            getRequest: () => ({
              method: 'PUT',
              url: '/employees/5',
              user: { sub: 1, employeeId: 'EMP001' },
              body: { name: 'John', password: 'hunter2', accessToken: 'abc', nested: { token: 'x' } },
              ip: '127.0.0.1',
            }),
          }),
        } as any,
        callHandler(of({})),
      ),
    );
    const details = auditService.log.mock.calls[0][0].details;
    expect(details.body).toEqual({ name: 'John', nested: {} });
    expect(JSON.stringify(details)).not.toContain('hunter2');
    expect(JSON.stringify(details)).not.toContain('abc');
  });

  it('records failed mutations with a _failed suffix', async () => {
    await expect(
      lastValueFrom(
        interceptor.intercept(
          buildContext('DELETE', '/attendance/clear'),
          callHandler(throwError(() => new Error('boom'))),
        ),
      ),
    ).rejects.toThrow('boom');

    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'delete_failed',
        entity: 'attendance',
        entityId: 'clear',
      }),
    );
  });
});
