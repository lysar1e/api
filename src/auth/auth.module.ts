import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { AuthStrategy } from "./strategies/auth.strategy";
import { User } from "./entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import {MailModule} from "../mail/mail.module";
@Module({
  providers: [AuthService, JwtStrategy, AuthStrategy],
  controllers: [AuthController],
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: "access",
    }),
      MailModule
  ],
})
export class AuthModule {}
