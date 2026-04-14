import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthMember = createParamDecorator((data: string, context: ExecutionContext | any) => {
	let request: any;
	if (context.contextType === 'graphql') {
		request = context.getArgByIndex(2).req;
		if (request.body.authMember) {
			request.body.authMember.authorization = request.headers?.authorization;
		}
	} else request = context.switchToHttp().getRequest();

	const member = request.body.authMember;

	if (member) return data ? member?.[data] : member;
	else return null;
});


// @AuthMember() => authMember ni butunlay qaytaradi
// @AuthMember('memberNick') => authMember ichidan memberNick ni qaytaradi 
// Biz ayni biir data kerak bolsa shuni o'zini sorab olishimiz mumkin . 