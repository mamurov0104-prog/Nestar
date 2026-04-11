import { Module } from '@nestjs/common';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose'; //type uchun kerak

@Module({
	imports: [
		MongooseModule.forRootAsync({
			// MongoDB'ga diynamic ulanish process.env ishlatsa Async bo'lish kerak
			useFactory: () => ({
				//Bu config yaratadigan function
				uri: process.env.NODE_ENV === 'production' ? process.env.MONGO_PROD : process.env.MONGO_DEV,
			}),
		}),
	],
})
//qaysi databasega ulanganligini print qilib beradi
export class DatabaseModule {
	constructor(@InjectConnection() private readonly connection: Connection) {
		//@InjectConnection() => MongoDB connection objectni menga ber//connection: Connection=>MongoDB bilan live connection object

		if (connection.readyState === 1) {
			//readyState=> MongoDB connection holati 1 bo'lsa connected bo'ladi
			console.log(
				`MongoDB is connected intro ${process.env.NODE_ENV === 'production' ? 'production' : 'development'} db `,
			);
		} else {
			console.log('DB is not connected !');
		}
	}
}

//“inject” = ichiga qo‘yish
//Bu framework DI, MVC, AOP ga asoslangan
