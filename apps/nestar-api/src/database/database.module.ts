// NestJS dan kerakli modullarni import qilyapmiz
import { Module } from '@nestjs/common';

// MongooseModule - MongoDB bilan ishlash uchun
// InjectConnection - DB connectionni inject qilish uchun
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';

// Mongoose dan Connection type ni olib kelamiz
import { Connection } from 'mongoose';

// Bu decorator orqali class ni NestJS moduliga aylantiramiz
@Module({
	// imports - boshqa modullarni ulash uchun ishlatiladi
	imports: [
		MongooseModule.forRootAsync({
			// async config - env orqali dynamic ulanish
			useFactory: () => ({
				// Agar production bo‘lsa MONGO_PROD ni oladi
				// aks holda (development) MONGO_DEV ni ishlatadi
				uri:
					process.env.NODE_ENV === 'production'
						? process.env.MONGO_PROD
						: process.env.MONGO_DEV,
			}),
		}),
	],

	// Bu moduldan boshqa modullar ham foydalanishi uchun export qilinyapti
	exports: [MongooseModule],
})

// DatabaseModule - MongoDB ulanishni boshqaruvchi modul
export class DatabaseModule {

	// constructor orqali DB connectionni inject qilyapmiz
	constructor(@InjectConnection() private readonly connection: Connection) {

		// connection.readyState === 1 bo‘lsa -> DB ulangan
		if (connection.readyState === 1) {

			console.log(
				// qaysi environmentga ulanganini ham chiqaradi
				`MongoDB is connected into ${
					process.env.NODE_ENV === 'production'
						? 'production'
						: 'development'
				} db`,
			);

		} else {
			// Agar ulanmagan bo‘lsa
			console.log('DB is not connected!');
		}
	}
}