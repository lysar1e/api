import {Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, Res} from '@nestjs/common';
import {AuthGuard} from "@nestjs/passport";
import {Request, Response} from "express";
import {GenerateLinkDto} from "./dto/generate-link.dto";
import { LinkService } from './link.service';
import {JoinBoardDto} from "./dto/join-board.dto";

@Controller('link')
export class LinkController {
    constructor(private readonly linkService: LinkService) {}

    @UseGuards(AuthGuard("jwt"))
    @Post("generate")
    generateLink(@Body() GenerateLinkDto: GenerateLinkDto) {
        return this.linkService.generateLink(GenerateLinkDto);
    }

    @UseGuards(AuthGuard("auth"))
    @Post("join")
    joinBoard(@Body() JoinBoardDto: JoinBoardDto, @Req() request: Request) {
        //@ts-ignore
        return this.linkService.joinBoard(JoinBoardDto, request.user.id);
    }

}
