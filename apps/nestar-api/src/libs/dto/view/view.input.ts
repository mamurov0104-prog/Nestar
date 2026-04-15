import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { MemberAuthType, MemberType } from '../../enums/member.enum';
import { ViewGroup } from '../../enums/view.enum';
import { ObjectId } from 'bson';

@InputType()
export class ViewInput {
	@IsNotEmpty()
	@Field(() => ViewGroup)
	viewGroup: string;

	@IsNotEmpty()
	@Field(() => String)
	viewRefId: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	memberId: ObjectId;
}
