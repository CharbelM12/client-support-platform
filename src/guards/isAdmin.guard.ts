import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { ISADMIN_KEY } from 'src/decorator/isAdmin.decorator';
import { UserService } from 'src/user/user.service';

@Injectable()
export class IsAdminGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
    private readonly configService: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const requiredRoleFlag = this.reflector.getAllAndOverride(ISADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const user = await this.userService.getUserById(request.userId);
    const isAdmin = this.hasRequiredRoles(user.isAdmin, requiredRoleFlag);
    return isAdmin;
  }
  hasRequiredRoles(userRole: boolean, requiredRole: boolean) {
    if (userRole === requiredRole) {
      return this.configService.get<boolean>('roleFlags.isAdmin');
    } else {
      return this.configService.get<boolean>('roleFlags.isAdminFalse');
    }
  }
}
