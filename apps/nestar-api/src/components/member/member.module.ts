import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberResolver } from './member.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from '../../schemas/Member.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]), AuthModule, ViewModule],
	providers: [MemberResolver, MemberService],
	exports: [MemberService],
})
export class MemberModule {}
