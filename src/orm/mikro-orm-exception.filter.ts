import {
  ForeignKeyConstraintViolationException,
  NotFoundError,
} from '@mikro-orm/core';
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class MikroOrmExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        if (err instanceof NotFoundError) {
          return throwError(() => new NotFoundException(err.message));
        } else if (err instanceof ForeignKeyConstraintViolationException) {
          return throwError(
            () =>
              new BadRequestException(
                'Foreign key constraint violation. You probably tried to create a record with a non-existing foreign key or delete a record that is still referenced by another record.',
              ),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
