import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/strategy/jwt/jwt-auth.guard';
import { UserJwtDecorator } from '../auth/decorator';
import { CreatePostDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('api/post')
export class PostController {
  constructor(private postService: PostService) {}

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.postService.get(id);
  }

  @Post('create')
  create(
    @Body() dto: CreatePostDto,
    @UserJwtDecorator('userId') userId: number,
  ) {
    return this.postService.create(userId, dto);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @UserJwtDecorator('userId') userId: number,
  ) {
    return this.postService.delete(id);
  }
}
