import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { Request, Response } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { uid } from "rand-token";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { MailService } from "src/mail/mail.service";
import * as moment from "moment";
import { Refresh } from "./entities/refresh.entity";
import { Board } from "../board/entities/board.entity";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: typeof User,
    @InjectRepository(Refresh) private refreshTokenRepository: typeof Refresh,
    @InjectRepository(Board) private boardRepository: typeof Board,
    private jwtService: JwtService,
    private mailService: MailService
  ) {}

  setAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken: string
  ) {
    response.cookie("access", accessToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      domain: process.env.DOMAIN,
      secure: JSON.parse(process.env.SECURE),
    });
    response.cookie("refresh", refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      domain: process.env.DOMAIN,
      secure: JSON.parse(process.env.SECURE),
    });
  }

  async generateAccessToken(userId: number, userRole: string) {
    return await this.jwtService.signAsync(
      { id: userId, role: userRole },
      { expiresIn: "20m" }
    );
  }

  async generateRefreshToken() {
    const refreshToken = uid(64);
    const refreshTokenExp = moment().day(200).format("YYYY/MM/DD");
    return {
      refreshToken,
      refreshTokenExp,
    };
  }

  clearAuthCookies(response: Response) {
    response.clearCookie("refresh", {
      domain: process.env.DOMAIN,
      path: "/",
    });
    response.clearCookie("access", { domain: process.env.DOMAIN, path: "/" });
  }

  async singUpUser({ email, password }: CreateUserDto) {
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

  async signIn({ email, password }: SignInDto, response: Response) {
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new BadRequestException(
        "Адрес электронной почты / пароль не совпадают."
      );
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException(
        "Адрес электронной почты / пароль не совпадают."
      );
    }
    const accessToken = await this.generateAccessToken(user.id, user.role);
    const { refreshToken, refreshTokenExp } = await this.generateRefreshToken();
    await this.refreshTokenRepository
      .create({
        user_id: user.id,
        user_role: user.role,
        refresh_token: refreshToken,
        refresh_exp: refreshTokenExp,
      })
      .save();
    this.setAuthCookies(response, accessToken, refreshToken);
    return { message: "success" };
  }

  async getUserData(payload: Express.User) {
    // @ts-ignore
    const { id, role } = payload;
    const user = await this.userRepository.findOne({
      where: { id },
      select: ["id", "sub"],
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    const usersBoards = await this.boardRepository.find({
      where: { owner: id },
    });
    let canAddMoreThanOneBoard = false;
    if (user.sub || usersBoards.length < 1) {
      canAddMoreThanOneBoard = true;
    } else if (!user.sub && usersBoards.length > 0) {
      canAddMoreThanOneBoard = false;
    }
    return { id: user.id, logged: true, role, sub: canAddMoreThanOneBoard };
  }
  async refreshToken(request: Request, response: Response) {
    // @ts-ignore
    const userIdFromRequest = request.user.id;
    const currentDate = moment().format("YYYY/MM/DD");
    const refreshTokenFromCookie = await request.cookies["refresh"];

    if (!refreshTokenFromCookie || !userIdFromRequest) {
      throw new UnauthorizedException("You are not authenticated!");
    }
    const tokenToValidate = await this.refreshTokenRepository.findOne({
      where: { refresh_token: refreshTokenFromCookie },
    });
    if (
      !tokenToValidate ||
      tokenToValidate.refresh_exp < currentDate ||
      tokenToValidate.user_id !== userIdFromRequest
    ) {
      this.clearAuthCookies(response);
      throw new ForbiddenException("Refresh token is not valid!");
    }
    const newAccessToken = await this.generateAccessToken(
      tokenToValidate.user_id,
      tokenToValidate.user_role
    );
    const { refreshToken, refreshTokenExp } = await this.generateRefreshToken();
    await tokenToValidate.remove();
    await this.refreshTokenRepository
      .create({
        user_id: userIdFromRequest,
        user_role: tokenToValidate.user_role,
        refresh_token: refreshToken,
        refresh_exp: refreshTokenExp,
      })
      .save();

    this.setAuthCookies(response, newAccessToken, refreshToken);
    return { message: "success", logged: true };
  }

  async logout(request: Request, response: Response) {
    const refreshToken = await this.refreshTokenRepository.findOne({
      refresh_token: request.cookies["refresh"],
    });
    if (refreshToken) {
      await refreshToken.remove();
    }
    this.clearAuthCookies(response);
    return { message: "success" };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException("Такого пользователя не существует!");
    }
    const secret = process.env.FORGOT_PASSWORD_SECRET + user.password;
    const token = await this.jwtService.signAsync(
      {
        email: user.email,
        id: user.id,
      },
      { secret, expiresIn: "15m" }
    );
    const link = `${process.env.CLIENT_URL}/reset-password/${user.id}/${token}`;
    await this.mailService.sendResetPassword(user.email, link);
    return { message: "success" };
  }
  async resetPassword(dto: ResetPasswordDto) {
    const { id, token } = dto;
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException("Неверный параметр идентификатора!");
    }
    const secret = process.env.FORGOT_PASSWORD_SECRET + user.password;
    try {
      const validated = await this.jwtService.verifyAsync(token, {
        secret,
      });
      return { email: validated.email };
    } catch (e) {
      console.log(e);
      throw new ForbiddenException(e);
    }
  }
  async resetPasswordPost(password: string, dto: ResetPasswordDto) {
    const { id, token } = dto;
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException("Неверный параметр идентификатора!");
    }
    const userRefreshTokens = await this.refreshTokenRepository.find({
      where: { user_id: id },
    });
    if (userRefreshTokens) {
      await this.refreshTokenRepository.remove(userRefreshTokens);
    }
    const secret = process.env.FORGOT_PASSWORD_SECRET + user.password;
    try {
      const validated = await this.jwtService.verifyAsync(token, {
        secret,
      });
      console.log(validated);
      user.password = await bcrypt.hash(password, 5);
      await user.save();
      return { message: "success" };
    } catch (e) {
      console.log(e);
      throw new ForbiddenException(e);
    }
  }

  async getUsers() {
    return await this.userRepository.find({
      select: ["id", "email", "role"],
    });
  }

  async validateRole(id: number) {
    const user = await this.userRepository.findOne(id);
    return user.role === "admin";
  }

  async issueAdminRole(userId: number) {
    const user = await this.userRepository.findOne(userId);
    user.role = "admin";
    await user.save();
    return { message: "Пользователю выдана роль админа" };
  }
  async buySub(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException();
    }
    user.sub = true;
    await user.save();
    return { message: "success" };
  }
}
