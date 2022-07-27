import { Module, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/strategy/jwt/jwt-auth.guard';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@UseGuards(JwtAuthGuard)
@Module({
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
