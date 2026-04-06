import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongoose';



@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {}

	@Mutation(() => Member)
	public async signup(
		@Args('input') input: MemberInput
	): Promise<Member> {
		console.log('Mutation: singup');
		return await this.memberService.signup(input);
	}

	@Mutation(() => Member)
	public async login(
		@Args('input') input: LoginInput
	): Promise<Member> {
		console.log('Mutation: login');
		return await this.memberService.login(input);
	}

	
	@Mutation(() => Member)
	public async updateMember(
		@Args('input') input: MemberUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Member> {
		console.log('Mutation updateMember');
		delete input._id;
		return await this.memberService.updateMember(memberId, input);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Member)
	public async getMember(
		@Args('memberId') input: string, 
		@AuthMember('_id') memberId: ObjectId
	): Promise<Member> {
		console.log('Query: getMember');
		const targetId = shapeIntoMongoObjectId(input);
		return await this.memberService.getMember(memberId, targetId);
	}


}
