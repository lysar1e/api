import {Body, Controller, Get, Param, Post, Req, Res, UseGuards} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { SignInDto } from "./dto/sign-in.dto";
import {Response, Request} from "express";
import { AuthGuard } from "@nestjs/passport";
import {ResetPasswordDto} from "./dto/reset-password.dto";
import { RolesGuard } from "./decorators/roles.guard";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("sign-up")
    singUpUser(@Body() dto: CreateUserDto) {
        return this.authService.singUpUser(dto);
    }

    @Post("sign-in")
    signIn(
        @Body() dto: SignInDto,
        @Res({ passthrough: true }) response: Response
    ) {
        return this.authService.signIn(dto, response);
    }
    @UseGuards(AuthGuard("auth"))
    @Get()
    isLogin(@Req() request: Request) {
        return this.authService.getUserData(request.user);
    }


    @Get("reset-password/:id/:token")
    resetPassword(@Param() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }

    @UseGuards(AuthGuard("jwt"))
    @Get("check")
    checkAccessTokenValidity(@Req() request: Request) {
        //@ts-ignore
        return this.authService.getUserData(request.user);
    }

    @UseGuards(AuthGuard("auth"))
    @Post("refresh")
    refreshToken(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    ) {
        return this.authService.refreshToken(request, response);
    }
    @Post("logout")
    logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        return this.authService.logout(request, response);
    }

    @Post("forgot-password")
    forgotPassword(@Body('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    @Post("reset-password/:id/:token")
    resetPasswordPost(@Body('password') password: string, @Param() dto: ResetPasswordDto) {
        return this.authService.resetPasswordPost(password, dto);
    }

    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Get("admin/get-users")
    getUsers() {
        return this.authService.getUsers();
    }

    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Post("/admin/issue-admin-role")
    issueRole(@Body('userId') userId: string) {
        return this.authService.issueAdminRole(+userId);
    }

    @UseGuards(AuthGuard("jwt"))
    @Post("buy-sub")
    buySub(@Req() request: Request) {
        //@ts-ignore
        return this.authService.buySub(request.user.id);
    }
}

