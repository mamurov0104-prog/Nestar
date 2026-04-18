import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { MemberAuthType, MemberStatus, MemberType } from '../../enums/member.enum';
import { availableAgentsSorts, availableMembersSorts } from '../../config'; // S harflari qo'shildi
import { Direction } from '../../enums/common.enum';

@InputType()
export class MemberInput {
    @IsNotEmpty()
    @Length(3, 12)
    @Field(() => String)
    memberNick!: string; // ! belgilari qo'shildi

    @IsNotEmpty()
    @Length(5, 12)
    @Field(() => String)
    memberPassword!: string;

    @IsNotEmpty()
    @Field(() => String)
    memberPhone!: string;

    @IsOptional()
    @Field(() => MemberAuthType, { nullable: true })
    memberAuthType?: MemberAuthType;

    @IsOptional()
    @Field(() => MemberType, { nullable: true })
    memberType?: MemberType;
}

@InputType()
export class LoginInput {
    @IsNotEmpty()
    @Length(3, 12)
    @Field(() => String)
    memberNick!: string;

    @IsNotEmpty()
    @Length(5, 12)
    @Field(() => String)
    memberPassword!: string;
}

@InputType()
class AISearch {
    @IsOptional()
    @Field(() => String, { nullable: true })
    text?: string;
}

@InputType()
export class AgentsInquiry {
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Field(() => Int) // String emas, Int bo'lishi kerak
    page!: number;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Field(() => Int)
    limit!: number;

    @IsOptional()
    @IsIn(availableAgentsSorts) // Array ichiga olish shart emas, config o'zi array
    @Field(() => String, { nullable: true })
    sort?: string;

    @IsOptional()
    @Field(() => Direction, { nullable: true })
    direction?: Direction;

    @IsNotEmpty()
    @Field(() => AISearch)
    search!: AISearch;
}

@InputType()
class MISearch {
    @IsOptional()
    @Field(() => MemberStatus, { nullable: true })
    memberStatus?: MemberStatus;

    @IsOptional()
    @Field(() => MemberType, { nullable: true })
    memberType?: MemberType;

    @IsOptional()
    @Field(() => String, { nullable: true })
    text?: string;
}

@InputType()
export class MembersInquiry {
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Field(() => Int)
    page!: number;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Field(() => Int)
    limit!: number;

    @IsOptional()
    @IsIn(availableMembersSorts)
    @Field(() => String, { nullable: true })
    sort?: string;

    @IsOptional()
    @Field(() => Direction, { nullable: true })
    direction?: Direction;

    @IsNotEmpty()
    @Field(() => MISearch)
    search!: MISearch;
}