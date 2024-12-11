import { defineConfig } from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { join } from 'path';

export default defineConfig({
  // TODO: Add Request interceptor
  // https://gitlab.com/barriersystems/utilities/docker/-/merge_requests/373#note_1850383956
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  // If you want to use any other registered NestJS services in your subscriber (e.g. the CommandBus), you cannot register the subscriber here
  // Instead, add the Subscriber to the "providers" array of your respective module and then
  // you must inject the EntityManager in the subscriber class and use it to register the subscriber in its constructor
  // See src/permissions/orm/permission.subscriber.ts for an example
  subscribers: [],
  allowGlobalContext: false,
  host: process.env.ORM_DB_HOST,
  port: parseInt(process.env.ORM_DB_PORT),
  dbName: process.env.ORM_DB_NAME,
  user: process.env.ORM_DB_USER,
  password: process.env.ORM_DB_PASSWORD,
  driver: PostgreSqlDriver,
  baseDir: __dirname,
  extensions: [Migrator],
  debug: process.env.MIKRO_ORM_DEBUG === 'true',
  migrations: {
    tableName: 'mikro_orm_migrations',
    path: join(__dirname, 'migrations'),
    transactional: process.env.MIKRO_ORM_MIGRATIONS_TRANSACTIONAL === 'true',
  },
  serialization: { forceObject: true },
});
