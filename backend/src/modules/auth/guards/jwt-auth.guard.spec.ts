import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: { verifyAsync: jest.Mock };
  let reflector: { getAllAndOverride: jest.Mock };

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() };
    reflector = { getAllAndOverride: jest.fn() };
    guard = new JwtAuthGuard(jwtService as any, reflector as any);
  });

  const buildContext = (headers: Record<string, string | undefined>) => {
    const request: any = { headers };
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => request }),
      __request: request,
    } as any;
  };

  it('allows public routes without a token', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    await expect(guard.canActivate(buildContext({}))).resolves.toBe(true);
  });

  it('rejects requests without an Authorization header', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    await expect(guard.canActivate(buildContext({}))).rejects.toThrow(UnauthorizedException);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects a malformed Authorization header', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const ctx = buildContext({ authorization: 'Basic abc123' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('attaches the verified payload to request.user', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwtService.verifyAsync.mockResolvedValue({ sub: 1, employeeId: 'EMP001' });
    const ctx = buildContext({ authorization: 'Bearer valid.token' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(ctx.__request.user).toEqual({ sub: 1, employeeId: 'EMP001' });
  });

  it('rejects an invalid or expired token', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));
    await expect(
      guard.canActivate(buildContext({ authorization: 'Bearer expired.token' })),
    ).rejects.toThrow(UnauthorizedException);
  });
});
