import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { GqlContextType, GqlExecutionContext } from "@nestjs/graphql";
import { tap } from "rxjs";
import { Observable } from "rxjs/internal/Observable";



@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger: Logger = new Logger();

	public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const recordTime = Date.now();
		const requestType = context.getType<GqlContextType>();

            /* Develop if needed! */
            /* Zarur bo‘lsa shu qism keyin to‘ldiriladi! */
			return next.handle().pipe();
		if (requestType === 'graphql') {
            /* (1) Print Request */
            /* (1) So‘rovni chiqarish */
			const gqlContext = GqlExecutionContext.create(context);
			this.logger.log(`${this.stringify(gqlContext.getContext().req.body)}`, 'REQUEST');
		}
        
        /* (2) Errors handling via Graph QL */
        /* (2) GraphQL orqali xatolarni boshqarish */

			/* (3) No Errors, giving response below */
            /* (3) Xato bo‘lmasa, pastda javob qaytariladi */
		return next.handle().pipe(
			tap((data) => {
				const responseTime = Date.now() - recordTime;
				this.logger.log(`${this.stringify(data)} - ${responseTime}ms \n\n`, 'RESPONSE');
			}),
		);
	}

	private stringify(data: any): string {
		return JSON.stringify(data).slice(0, 75);
	}
}