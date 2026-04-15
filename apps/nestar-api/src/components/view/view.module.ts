import { Module } from '@nestjs/common';
import { ViewService } from './view.service';
import { ViewResolver } from './view.resolver';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import ViewSchema from '../../schemas/View.model';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'View', schema: ViewSchema }])],
	providers: [ViewResolver, ViewService],
	exports: [ViewService],
})
export class ViewModule {}
