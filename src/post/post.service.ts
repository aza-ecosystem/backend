import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto';

@Injectable()
export class PostService {
  constructor(private primsa: PrismaService) {}

  create(userId: number, dto: CreatePostDto) {
    return this.primsa.post.create({
      data: { userId, ...dto },
    });
  }

  async get(id: number) {
    const post = await this.primsa.post.findUnique({
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException('Not found');
    }

    return post;
  }

  async delete(id: number) {
    try {
      const post = await this.primsa.post.delete({
        where: {
          id,
        },
      });
      return post;
    } catch (error) {
      throw new NotFoundException('Not found to delete');
    }
  }
}
