import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger: Logger = new Logger();

	public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		// ExecutionContext => Bu request qaysi contextda ishlayotganini bildiradi. => HTTP, GraphQL, WebSocket
		// CallHandler => Keyingi methodni ishga tushuruvchi object
		// Logger => NestJS’ning tayyor log chiqaruvchi class’i. Bu console.log() ga o‘xshaydi, lekin NestJS uslubida.
		// Observable => next.handle() odatda Observable qaytaradi.
		// tap() => log qilish, vaqtni o‘lchash, debug qilish

		const recordTime = Date.now();
		const requestType = context.getType<GqlContextType>();

		if (requestType === 'http') {
			/** Develop if needed! **/
			return next.handle();
		} else if (requestType === 'graphql') {
			/** (1) Print Request **/
			const gqlContext = GqlExecutionContext.create(context);

			this.logger.log(`${this.stringify(gqlContext.getContext().req.body)}`, 'REQUEST');

			/** (2) Errors handling via GraphQL **/
			/** (3) No Errors, giving Response below **/
			return next.handle().pipe(
				// pipe() ni suv quvuriga o‘xshat
				tap((context) => {
					// method tugagach tap ishlaydi
					const responseTime = Date.now() - recordTime;
					this.logger.log(`${this.stringify(context)} - ${responseTime}ms \n\n`, 'RESPONSE');
				}),
			);
		}

		return next.handle();
	}

	private stringify(context: any): string {
		return JSON.stringify(context).slice(0, 75);
	}
}

// Bu interceptor shunday ishlaydi:
// request kelganda vaqtni yozib oladi
// request turi nima ekanini biladi
// keyingi methodni ishga tushiradi
// method tugagach qancha vaqt ketganini hisoblaydi
// logga chiqaradi
