import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { ISEMPLOYEE_KEY } from 'src/decorator/isEmployee.decorator';
import { UserService } from 'src/user/user.service';

@Injectable()
export class IsEmployeeGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const requiredRoleFlag = this.reflector.getAllAndOverride(ISEMPLOYEE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const user = await this.userService.getUserById(request.userId);
    const isEmployee = this.hasRequiredRoles(
      user.isAdmin,
      user.isEmployee,
      requiredRoleFlag,
    );
    return isEmployee;
  }
  hasRequiredRoles(
    userRole1: boolean,
    userRole2: boolean,
    requiredRole: boolean,
  ) {
    if (userRole1 === requiredRole || userRole2 === requiredRole) {
      return this.configService.get<boolean>('roleFlags.isEmployee');
    } else {
      return this.configService.get<boolean>('roleFlags.isEmployeeFalse');
    }
  }
}
