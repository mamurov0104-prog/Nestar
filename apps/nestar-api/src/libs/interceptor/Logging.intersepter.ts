import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger: Logger = new Logger();
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const RecordTime = Date.now();
		const type = context.getType<GqlContextType>();
		console.log('Before...');
		if (type === 'http') {
			// Develop if needed 
			return next.handle();
		} else if (type === 'graphql') {
			/** (1)print request */
			const gqlContext = GqlExecutionContext.create(context);

			this.logger.log(`${this.stringify(gqlContext.getContext().req.body)}`, 'REQUEST');

			/** (2) GraphQl handl qiladi error  bolsa shu yerdan qaytadi */

			/** (3) Xatolik bolmasa pastdagi qism ham ishlaydi */

			return next.handle().pipe(
				tap((context) => {
					const resTime = Date.now() - RecordTime;
					this.logger.log(`${this.stringify(context)} - ${resTime}ms \n\n`, 'RESPONSE');
				}),
			);
		}
		return next.handle();
	}

	private stringify(context: ExecutionContext): string {
		return JSON.stringify(context).slice(0, 75);
	}
}
