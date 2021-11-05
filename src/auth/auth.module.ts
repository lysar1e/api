import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { AuthStrategy } from "./strategies/auth.strategy";
import { User } from "./entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import {MailModule} from "../mail/mail.module";
import {Refresh} from "./entities/refresh.entity";
import {ConfigModule, ConfigService} from "@nestjs/config";
@Module({
  providers: [AuthService, JwtStrategy, AuthStrategy],
  controllers: [AuthController],
  imports: [
    TypeOrmModule.forFeature([User, Refresh]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET")
      }),
      inject: [ConfigService],
    }),
      MailModule
  ],
})
export class AuthModule {}