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
      host: 'localhost',
      port: 5432,
      username: 'fasfafsa_user',
      password: 'fasfafsa',
      database: 'fasfafsa_db',
      entities: [User, Board, Link],
      synchronize: true
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
