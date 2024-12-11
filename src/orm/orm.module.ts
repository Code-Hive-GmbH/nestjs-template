import { MikroORM } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import {
  Inject,
  Injectable,
  Logger,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import MikroORMConfig from './mikro-orm.config';
import { MikroOrmExceptionInterceptor } from './mikro-orm-exception.filter';

@Injectable()
export class DBInitService implements OnModuleInit {
  private readonly logger = new Logger(DBInitService.name);

  @Inject()
  private readonly orm: MikroORM;

  async onModuleInit() {
    this.logger.log('MikroORM Running Migrations');
    await this.orm.getMigrator().up();
    this.logger.log('MikroORM Migrations complete');
  }
}

@Module({
  imports: [MikroOrmModule.forRoot(MikroORMConfig)],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MikroOrmExceptionInterceptor,
    },
    DBInitService,
  ],
})
export class OrmModule {}
