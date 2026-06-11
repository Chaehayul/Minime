import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DemoReadOnlyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      method: string;
      user?: { isDemo?: boolean };
    }>();
    const readOnlyMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

    if (request.user?.isDemo && !readOnlyMethods.has(request.method.toUpperCase())) {
      throw new ForbiddenException({
        code: 'DEMO_READ_ONLY',
        message: '포트폴리오 데모에서는 조회 기능만 사용할 수 있습니다.',
      });
    }

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
