import { Module } from '@nestjs/common';
import { LinkService } from './link.service';
import { LinkController } from './link.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Link} from "./entities/link.entity";
import {Board} from "../board/entities/board.entity";

@Module({
    controllers: [LinkController],
    providers: [LinkService],
    imports: [TypeOrmModule.forFeature([Link, Board])],
})
export class LinkModule {}
