import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DemoReadOnlyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ user?: { isDemo?: boolean } }>();

    if (!request.user?.isDemo) return next.handle();

    return next.handle().pipe(map((data) => this.sanitizeDemoResponse(data)));
  }

  private sanitizeDemoResponse(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeDemoResponse(item));
    }

    if (!value || typeof value !== 'object' || value instanceof Date) {
      return value;
    }

    const source = value as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};

    for (const [key, item] of Object.entries(source)) {
      if (key === 'password') continue;
      if (key === 'socialId' || key === 'pgTransactionId') {
        sanitized[key] = null;
        continue;
      }
      if (key === 'paymentMethodLast4') {
        sanitized[key] = item ? '****' : null;
        continue;
      }
      if (key === 'adminMemo') {
        sanitized[key] = item ? '데모에서는 비공개' : null;
        continue;
      }
      if (key === 'email' && typeof item === 'string') {
        const id = typeof source.id === 'number' ? source.id : 'visitor';
        sanitized[key] = `user${id}@demo.techletter`;
        continue;
      }
      sanitized[key] = this.sanitizeDemoResponse(item);
    }

    return sanitized;
  }
}
