// NestJS dan Module decoratorini import qilamiz
import { Module } from '@nestjs/common';

// GraphQL resolver (requestlarni qabul qilib service ga uzatadi)
import { MemberResolver } from './member.resolver';

// Business logic yoziladigan service
import { MemberService } from './member.service';

// MongoDB bilan ishlash uchun Mongoose modulini import qilamiz
import { MongooseModule } from '@nestjs/mongoose';

// Member uchun yaratilgan schema (model)
import MemberSchema from '../../schemas/Member.model';

// Module decorator orqali ushbu modulni sozlaymiz
@Module({
	// imports: boshqa modullarni ulash uchun ishlatiladi
	imports: [
		// Mongoose ga 'Member' nomli modelni va uning schema sini ro'yxatdan o'tkazyapmiz
		MongooseModule.forFeature([
			{ name: 'Member', schema: MemberSchema },
		]),
	],

	// providers: dependency injection orqali ishlatiladigan classlar
	providers: [
		// GraphQL resolver (controllerga o‘xshash, lekin GraphQL uchun)
		MemberResolver,

		// Business logic (database bilan ishlash, validation va h.k.)
		MemberService,
	],
})

// MemberModule - Member bilan bog‘liq barcha logiclarni jamlaydi
export class MemberModule {}