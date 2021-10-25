import {Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import {AuthGuard} from "@nestjs/passport";
import {Request} from "express";
import {CreateTodoDto} from "./dto/create-todo.dto";
import {DeleteTodoDto} from "./dto/delete-todo.dto";

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @UseGuards(AuthGuard("jwt"))
  @Post("create")
  create(@Body() createBoardDto: CreateBoardDto, @Req() request: Request) {
    // @ts-ignore
    return this.boardService.create(createBoardDto, request.user.id);
  }

  @UseGuards(AuthGuard("auth"))
  @Get("get")
  findAll(@Req() request: Request) {
    // @ts-ignore
    return this.boardService.findAll(request.user.id);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("create-todo")
  createTodo(@Body() createTodoDto: CreateTodoDto, @Req() request: Request) {
    // @ts-ignore
    return this.boardService.createTodo(createTodoDto, request.user.id);
  }

  @UseGuards(AuthGuard("auth"))
  @Get(':id')
  findOne(@Param('id') owner: string, @Req() request: Request) {
    // @ts-ignore
    return this.boardService.findOne(+owner, request.user.id);
  }

  @UseGuards(AuthGuard("jwt"))
  @Patch('complete-todo/:id')
  completeTodo(@Param('id') id: string, @Body('boardId') boardId: string) {
    return this.boardService.completeTodo(id, +boardId);
  }

  @UseGuards(AuthGuard("jwt"))
  @Patch('important-todo/:id')
  importantTodo(@Param('id') id: string, @Body('boardId') boardId: string) {
    return this.boardService.importantTodo(id, +boardId);
  }

  @UseGuards(AuthGuard("jwt"))
  @Delete('remove-todo')
  remove(@Query() dto: DeleteTodoDto) {
    return this.boardService.remove(dto);
  }
}
