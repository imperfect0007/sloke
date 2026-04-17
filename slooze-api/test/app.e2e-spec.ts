import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

const hasPostgresUrl = () => {
  const u = process.env.DATABASE_URL ?? '';
  return u.startsWith('postgres://') || u.startsWith('postgresql://');
};

(hasPostgresUrl() ? describe : describe.skip)('GraphQL (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('login returns access token', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation Login($input: LoginInput!) {
          login(input: $input) { accessToken userId role }
        }`,
        variables: {
          input: {
            email: 'member.india@slooze.test',
            password: 'password123',
          },
        },
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.login.accessToken).toEqual(expect.any(String));
      });
  });
});
