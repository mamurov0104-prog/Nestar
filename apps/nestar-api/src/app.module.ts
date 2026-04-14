import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';
import { registerAllEnums } from './libs/enums/register-enums';
import { T } from './libs/types/common';

// registerAllEnums(); // bir mantiq bilan reg qilish
@Module({
	imports: [
    ConfigModule.forRoot(), // .env faylni o'qib beradi. Bu mantiq doim birinchi keladi
		GraphQLModule.forRoot({
			driver: ApolloDriver,
			playground: true, // root/graphql => playground
			uploads: false,
			autoSchemaFile: true,
			formatError: (error: T) => {
				const graphQLFormattedError = {
					code: error?.extensions.code,
					message:
						error?.extensions?.exception?.response?.message || error.extensions?.response?.message || error?.message,
				};
				console.log('GRAPHQL GLOBAL ERROR:', graphQLFormattedError);
				return graphQLFormattedError;
			},
		}),
		ComponentsModule, // bizning barcha componentlarni o'z ichiga olgan modul
		DatabaseModule, // DB bilan bog'lanish uchun modul
 	],
	controllers: [AppController],
	providers: [AppService, AppResolver],
})
export class AppModule {}
