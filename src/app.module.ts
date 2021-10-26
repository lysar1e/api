import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import {User} from "./auth/entities/user.entity";
import { BoardModule } from './board/board.module';
import {Board} from "./board/entities/board.entity";
import {Link} from "./link/entities/link.entity";
import { LinkModule } from './link/link.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'ec2-52-213-119-221.eu-west-1.compute.amazonaws.com',
      port: 5432,
      username: 'qhjbsdydtewzog',
      password: 'd352fbb87fbbbacbe2a40ace8472167c6247dee7df936d3be3279d3a7fb95cc4',
      database: 'dam98c4s5aj6hb',
      entities: [User, Board, Link],
      synchronize: false,
      ssl: { rejectUnauthorized: false },
    }),
    AuthModule,
    BoardModule,
    LinkModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
