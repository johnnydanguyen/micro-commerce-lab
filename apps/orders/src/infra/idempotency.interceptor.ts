import {
  BadRequestException,
  ConflictException,
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { catchError, from, mergeMap, of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import type { Request } from 'express';
import type { Prisma } from '@prisma/client';
import { IdempotencyService } from './idempotency.service';
import { hashObject } from './hash';

type Replay =
  | { kind: 'REPLAY'; statusCode: number; body: Prisma.JsonValue }
  | { kind: 'BEGIN' }
  | { kind: 'IN_PROGRESS' };

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly idem: IdempotencyService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();

    const key = req.headers['idempotency-key'] as string | undefined;
    if (!key) throw new BadRequestException('Idempotency-Key is required');

    // stable enough; or set fixed string like "POST /orders"
    const route = `${req.method} ${req.baseUrl ?? ''}${req.path}`.split('?')[0];

    const requestBody = req.body as unknown;
    const requestHash = hashObject(requestBody);

    return from(this.idem.beginOrReplay({ key, route, requestHash })).pipe(
      mergeMap((r: Replay) => {
        if (r.kind === 'REPLAY') {
          // Return cached response body; let controller decorators handle status
          // If you *must* control status code from interceptor, see note below.
          return of(r.body);
        }
        if (r.kind === 'IN_PROGRESS') {
          // Choose your policy: 409, 425 Too Early, or 202 Accepted
          throw new ConflictException(
            'Request with same Idempotency-Key is in progress',
          );
        }

        // BEGIN: proceed to handler, then store response
        return next.handle().pipe(
          mergeMap(async (body: unknown) => {
            // You decide statusCode policy: for POST /orders, hardcode 201
            // Or if you have it in metadata, read it.
            await this.idem.complete(key, {
              statusCode: 201,
              responseBody: body as Prisma.InputJsonValue,
            });
            return body;
          }),
          catchError((err: Error) =>
            from(
              this.idem.fail(key, {
                statusCode: 500,
                responseBody: { message: 'failed' },
              }),
            ).pipe(mergeMap(() => throwError(() => err))),
          ),
        );
      }),
    );
  }
}
