import {ForbiddenException, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import { Link } from "./entities/link.entity";
import {GenerateLinkDto} from "./dto/generate-link.dto";
import * as shortid from "shortid";
import {JoinBoardDto} from "./dto/join-board.dto";
import {Board} from "../board/entities/board.entity";
import {Response} from "express";


@Injectable()
export class LinkService {
    constructor(@InjectRepository(Link) private linkRepository: typeof Link, @InjectRepository(Board) private boardRepository: typeof Board) {}
        url = 'https://fasfafsa.fun';

    async generateLink(dto: GenerateLinkDto) {
        const {boardId} = dto;
        const board = await this.boardRepository.findOne({where: {id: boardId}});
        const code = shortid.generate();
        const to = this.url + '/invite/' + code;
        const generatedLink = await this.linkRepository.create({code, board_id: boardId, to}).save();
        board.generatedLink = to;
        await board.save();
        return generatedLink;
    }

    async joinBoard(dto: JoinBoardDto, contributor) {
        const {board_id} = await this.linkRepository.findOne({where: {code: dto.code}});
        if (!board_id) {
            throw new ForbiddenException();
        }
        const board = await this.boardRepository.findOne({where: {id: board_id}});
        if (board.owner === contributor || board.contributors.includes(contributor)) {
            return {boardId: board_id}
        }
        board.contributors.push(contributor);
        await board.save();
        return {boardId: board_id}
    }
}
