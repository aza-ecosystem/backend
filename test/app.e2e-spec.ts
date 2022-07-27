import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreatePostDto } from '../src/post/dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const authDTO: AuthDto = {
    username: 'viet',
    password: '123qwe',
  };

  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    app.listen('3333');

    prisma = app.get(PrismaService);
    //clean test db
    prisma.$transaction([prisma.post.deleteMany(), prisma.user.deleteMany()]);
    pactum.request.setBaseUrl('http://localhost:3333/');
  });

  afterAll(async () => {
    app.close();
  });

  describe('Auth', () => {
    it('Should signup', () => {
      return pactum
        .spec()
        .post('api/auth/signup')
        .withBody(authDTO)
        .expectStatus(201);
    });
    it('Should signup fail because of taken credential', () => {
      return pactum
        .spec()
        .post('api/auth/signup')
        .withBody(authDTO)
        .expectStatus(403);
    });
    it('Should Login', () => {
      return pactum
        .spec()
        .post('api/auth/login')
        .withBody(authDTO)
        .stores('accessToken', 'access_token')
        .expectStatus(200);
    });

    it('Should Login fail', () => {
      return pactum
        .spec()
        .post('api/auth/login')
        .withBody({ ...authDTO, password: '123' })
        .expectStatus(403);
    });
  });

  describe('User', () => {
    describe('Should do with user session', () => {
      it('Get profile', () => {
        return pactum
          .spec()
          .post('api/user/profile')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .expectStatus(201);
      });

      it('Edit user', () => {
        const email = 'vit@gmail.com';

        return pactum
          .spec()
          .patch('api/user/edit')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .withBody({
            email,
          })
          .expectStatus(200)
          .expectBodyContains(email);
      });
    });
  });

  describe('Post', () => {
    const createPostDto: CreatePostDto = {
      title: 'Hello',
      content: 'content',
    };

    describe('Should do with user session', () => {
      it('Create', () => {
        return pactum
          .spec()
          .post('api/post/create')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .withBody(createPostDto)
          .stores('postId', 'id')
          .expectStatus(201);
      });

      it('Get', () => {
        return pactum
          .spec()
          .get('api/post/$S{postId}')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .expectStatus(200)
          .expectBodyContains(createPostDto.title);
      });

      it('Delete', () => {
        return pactum
          .spec()
          .delete('api/post/$S{postId}')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .expectStatus(200)
          .expectBodyContains(createPostDto.title);
      });

      it('Delete unknown', () => {
        return pactum
          .spec()
          .delete('api/post/$S{postId}')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .expectStatus(404);
      });
    });
  });
});
