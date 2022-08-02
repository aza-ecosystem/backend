import { ForbiddenException, Injectable, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthDto } from './dto';
import { hash, verify } from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async validateUser(credential: AuthDto): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {
        username: credential.username,
      },
    });

    if (!user) {
      throw new ForbiddenException('Account is not found');
    }

    const isVerified = await verify(user.hash, credential.password);

    if (!isVerified) {
      throw new ForbiddenException('Password is incorrect');
    }

    delete user.hash;

    return user;
  }

  //todo define type
  async getJwtToken(user: any) {
    return {
      access_token: await this.jwtService.signAsync({
        userId: user.id,
        username: user.username,
      }),
    };
  }

  async signup(dto: AuthDto) {
    const hashedPassword = await hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          username: dto.username,
          hash: hashedPassword,
        },
        select: {
          username: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credential taken');
        }
      }

      throw error;
    }
  }
}
