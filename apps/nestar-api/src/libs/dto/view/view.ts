//Backenddan Frontenga jo'natiladigan DTO'ni hosil qilamiz

import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'bson';
import { ViewGroup } from '../../enums/view.enum';
import { Types } from 'mongoose';

@ObjectType()
export class View {
	@Field(() => String)
	_id: Types.ObjectId;

	@Field(() => ViewGroup)
	viewGroup: ViewGroup;

	@Field(() => String)
	viewRefId: ObjectId;

	@Field(() => String)
	memberId: ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}
