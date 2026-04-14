import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { MemberAuthType, MemberType } from '../../enums/member.enum';

@InputType()
export class MemberInput {
	// validations decoratordan tegishlilarini chaqiramiz
	@IsNotEmpty() // bosh bolmasligi kerak
	@Length(3, 12)
	@Field(() => String) // GraphQL type schema generation 시
	memberNick!: string; // TypeScript compile type

	@IsNotEmpty()
	@Length(3, 12)
	@Field(() => String)
	memberPassword!: string;

	@IsNotEmpty()
	@Field(() => String)
	memberPhone!: string;

	@IsOptional()
	@Field(() => MemberType, { nullable: true }) // null 가능
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
	memberNick!: string;

	@IsNotEmpty()
	@Length(3, 12)
	@Field(() => String)
	memberPassword!: string;
}
