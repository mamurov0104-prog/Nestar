import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';
import { T } from './libs/types/common';

@Module({
	//shu class ichida loyiha qismlarini ro‘yxatdan o‘tkazaman
	imports: [
		ConfigModule.forRoot(), // nestar-api server da .env ni o'qishga imkon yaratadi //forRoot()=>Modulni boshlang‘ich sozlama bilan ishga tushir
		GraphQLModule.forRoot({
			//Bu GraphQL modulini NestJS ichiga ulayapti.
			driver: ApolloDriver, //Bu yerda GraphQL qaysi engine/driver bilan ishlashini aytyapti.
			playground: true, //test qiladigan maxsus sahifa.
			uploads: false,
			autoSchemaFile: true, //“Schema faylni NestJS o‘zi avtomatik generatsiya qilsin”
			formatError: (error: T) => {
				const graphQLFormattedError = {
					code: error?.extensions.code,
					message:
						error?.extensions?.exception?.response?.message || error?.extensions?.response?.message || error?.message,
				};
				console.log('GRAPHQL GLOBAL ERR:', graphQLFormattedError);
				return graphQLFormattedError;
			},
		}),
		ComponentsModule, //HTTP
		DatabaseModule, //TCP
	],
	controllers: [AppController],
	providers: [AppService, AppResolver],
})
export class AppModule {}
