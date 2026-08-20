import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, UserRoleValue } from '../decorators/roles.decorator';

/**
 * Enforces role-based access control on top of JwtAuthGuard.
 *
 * Registered as a global APP_GUARD after JwtAuthGuard, so `request.user`
 * (the verified JWT payload) is always available here. Routes without
 * @Roles(...) metadata are open to any authenticated user.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoleValue[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRole: string | undefined = request.user?.role;

    if (!userRole || !requiredRoles.includes(userRole as UserRoleValue)) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }

    return true;
  }
}
