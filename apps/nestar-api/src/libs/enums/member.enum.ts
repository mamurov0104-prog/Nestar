//to'g'ridan-to'g'ni bu enumlarni graphQL bilan ishlataolmaymiz
//ishlatish uchun enumlarni ro'yhatga oladigan package kerak bo'ladi

import { registerEnumType } from '@nestjs/graphql';

export enum MemberType {
	USER = 'USER',
	AGENT = 'AGENT',
	ADMIN = 'ADMIN',
}
registerEnumType(MemberType, {
	//Men yozgan TypeScript enum ni GraphQL schema ichida ham ishlatmoqchiman
	name: 'MemberType',
});

export enum MemberStatus {
	ACTIVE = 'ACTIVE',
	BLOCK = ' BLOCK',
	DELETE = 'DELETE',
}
registerEnumType(MemberStatus, {
	name: 'MemberStatus',
});

export enum MemberAuthType {
	PHONE = 'PHONE',
	EMAIL = 'EMAIL',
	TELEGRAM = 'TELEGRAM',
}
registerEnumType(MemberAuthType, {
	name: 'MemberAuthType',
});
