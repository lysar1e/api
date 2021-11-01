import {BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import {CreateUserDto} from "./dto/create-user.dto";
import {SignInDto} from "./dto/sign-in.dto";
import {Response, Request} from "express";
import {InjectRepository} from "@nestjs/typeorm";
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {ResetPasswordDto} from "./dto/reset-password.dto";
import { MailService } from 'src/mail/mail.service';
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRepository: typeof User,
        private jwtService: JwtService,
        private mailService: MailService
    ) {}
    async singUpUser(dto: CreateUserDto) {
        const { email, password } = dto;
        if (!email || !password) {
            throw new BadRequestException("Данные не могут быть пустыми!");
        }
        const isEmailUsed = await this.userRepository.findOne({ email });
        if (isEmailUsed) {
            throw new BadRequestException("Такой Email уже существует!");
        }
        const hashedPassword = await bcrypt.hash(password, 5);
        await this.userRepository
            .create({
                email,
                password: hashedPassword,
            })
            .save();
        return { success: true };
    }

    async signIn(dto: SignInDto, response: Response) {
        const { email, password } = dto;
        const user = await this.userRepository.findOne({ email });
        if (!user) {
            throw new BadRequestException("Адрес электронной почты / пароль не совпадают.");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new BadRequestException("Адрес электронной почты / пароль не совпадают.");
        }

        const accessToken = await this.generateAccessToken(user.id);
        const refreshToken = await this.generateRefreshToken(user.id);

        response.cookie("access", accessToken, { httpOnly: true, domain: ".fasfafsa.fun", secure: true });
        response.cookie("refresh", refreshToken, { httpOnly: true, domain: ".fasfafsa.fun", secure: true });
        user.refreshToken = refreshToken;
        await user.save();
        return { message: "success" };
    }

    async generateAccessToken(userId: number) {
        return await this.jwtService.signAsync(
            { id: userId },
            { expiresIn: "20m" }
        );
    }
    async generateRefreshToken(userId: number) {
        return await this.jwtService.signAsync(
            { id: userId },
            {
                secret: "refresh",
                expiresIn: "200d",
            }
        );
    }
    async getUserData(payload: Express.User) {
        // @ts-ignore
        const { id } = payload;
        const user = await this.userRepository.findOne({where: {id}, select: ["id"]});
        if (!user) {
            throw new UnauthorizedException();
        }
        return { id: user.id, logged: true };
    }
    async refreshToken(request: Request, response: Response) {
        const refreshToken = await request.cookies["refresh"];
        const user = await this.userRepository.findOne({ refreshToken });
        if (!refreshToken) {
            throw new UnauthorizedException("You are not authenticated!");
        }
        if (!user) {
            throw new ForbiddenException("Refresh token is not valid!");
        }
        const validated = await this.jwtService.verifyAsync(refreshToken, {
            secret: "refresh",
        });
        const newAccessToken = await this.generateAccessToken(validated.id);
        const newRefreshToken = await this.generateRefreshToken(validated.id);
        user.refreshToken = newRefreshToken;
        await user.save();
        response.cookie("access", newAccessToken, { httpOnly: true, domain: ".fasfafsa.fun", secure: true });
        response.cookie("refresh", newRefreshToken, { httpOnly: true, domain: ".fasfafsa.fun", secure: true });
        return { message: "success" };
    }
    async logout(response: Response) {
        await response.clearCookie("refresh", {domain: ".fasfafsa.fun", path: "/"});
        await response.clearCookie("access", {domain: ".fasfafsa.fun", path: "/"});
        return { message: "success" };
    }
    async forgotPassword(email: string) {
        const user = await this.userRepository.findOne({where: {email}});
        if (!user) {
            throw new BadRequestException("Такого пользователя не существует!")
        };
        const secret = "fsafsafsajpisaf" + user.password;
        const token = await this.jwtService.signAsync({
            email: user.email,
            id: user.id
        }, {secret,expiresIn: "15m"});
        const link = `https://fasfafsa.fun/reset-password/${user.id}/${token}`;
        console.log(link);
        await this.mailService.sendResetPassword(user.email, link);
        return {message: "success"}
    }
    async resetPassword(dto: ResetPasswordDto) {
        const {id, token} = dto;
        const user = await this.userRepository.findOne({where: {id}});
        if (!user) {
            throw new BadRequestException("Неверный параметр идентификатора!");
        }
        const secret = "fsafsafsajpisaf" + user.password;
        try {
            const validated = await this.jwtService.verifyAsync(token, {
                secret
            });
            return {email: validated.email}
        } catch (e) {
            console.log(e)
            throw new ForbiddenException(e);
        }
    }
    async resetPasswordPost(password: string, dto: ResetPasswordDto) {
        const {id, token} = dto;
        const user = await this.userRepository.findOne({where: {id}});
        if (!user) {
            throw new BadRequestException("Неверный параметр идентификатора!");
        }
        const secret = "fsafsafsajpisaf" + user.password;
        try {
            const validated = await this.jwtService.verifyAsync(token, {
                secret
            });
            const hashedPassword = await bcrypt.hash(password, 5);
            user.password = hashedPassword;
            await user.save();
            return {message: "success"}
        } catch (e) {
            console.log(e)
            throw new ForbiddenException(e);
        }
    }
}
