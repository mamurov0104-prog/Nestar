import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
 import {GraphQLModule} from '@nestjs/graphql'
 import { ApolloDriver } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';

@Module({
  imports: [
		ConfigModule.forRoot(),
GraphQLModule.forRoot({
			driver: ApolloDriver,
			playground: true,
			uploads: false,
			autoSchemaFile: true,
		
		}),
  
  ],
	controllers: [AppController], // bu server Rest Api sifatiada run bo'lyapti
	providers: [AppService, AppResolver], // graphQL sifatida ham run bo'lyapti
})
export class AppModule {}
