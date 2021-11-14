import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import {AuthService} from "../auth.service";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private authService: AuthService) {}
     canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const {id} = request.user;
        return this.authService.validateRole(id);
    }
}
