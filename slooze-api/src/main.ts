import { createNestApp } from './bootstrap';

async function bootstrap() {
  const app = await createNestApp();
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`GraphQL http://localhost:${port}/graphql`);
}
bootstrap();
