import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, isIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { MemberAuthType, MemberStatus, MemberType } from '../../enums/member.enum';
import { availableAgentsSorts, availableMembersSorts } from '../../config';
import { Direction } from '../../enums/common.enum';
@InputType()
export class MemberInput {
	@IsNotEmpty()
	@Length(3, 12)
	@Field(() => String)
	memberNick: string | undefined;

	@IsNotEmpty()
	@Length(5, 12)
	@Field(() => String)
	memberPassword: string | undefined;

	@IsNotEmpty()
	@Field(() => String)
	memberPhone: string | undefined;

	@IsOptional()
	@Field(() => MemberType, { nullable: true })
	memberType?: MemberType;

	@IsOptional()
	@Field(() => MemberAuthType, { nullable: true })
	memberAuthType?: MemberAuthType;
}

@InputType()
export class LoginInput {
	@IsNotEmpty()
	@Length(3, 12)
	@Field(() => String)
	memberNick: string | undefined;

	@IsNotEmpty()
	@Length(5, 12)
	@Field(() => String)
	memberPassword: string | undefined;
}

@InputType()
class AIsearch {
	@IsNotEmpty()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class AgentsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number | undefined;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number | undefined;

	@IsOptional()
	@IsIn(availableAgentsSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => AIsearch)
	search: AIsearch | undefined;
}

@InputType()
class MIsearch {
    @IsOptional()
    @Field(() => String, { nullable: true })
    memberStatus?: MemberStatus

    @IsOptional()
    @Field(() => MemberType, { nullable: true })
    memberType?: MemberType
	@IsNotEmpty()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class MembersInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number | undefined;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number | undefined;

	@IsOptional()
	@IsIn(availableMembersSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => MIsearch)
	search: MIsearch | undefined;
}
