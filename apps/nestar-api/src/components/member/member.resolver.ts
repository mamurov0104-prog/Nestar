import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { AgentsInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { Member, Members } from '../../libs/dto/member/member';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'bson';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';

@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {}
	//Querty Rest Api'dagi => GET
	//Mutation Rest Api'dagi => POST

	@Mutation(() => Member)
	public async signup(@Args('input') input: MemberInput): Promise<Member> {
		//Args = Arguments //NestJS requestdan input ni olib, seni functioning ichidagi input o‘zgaruvchisiga joylayapti.
		console.log('Mutation signup');
		console.log('input', input);
		const result = await this.memberService.signup(input);
		return result;
	}

	@Mutation(() => Member)
	public async login(@Args('input') input: LoginInput): Promise<Member> {
		console.log('Mutation login');
		return await this.memberService.login(input);
	}

	//Authentication
	@UseGuards(AuthGuard)
	@Mutation(() => Member)
	//authenticate bo'lgan memberni ma'lumotini olish uchun createParam decorator yozish kerak bo'ldi
	public async updateMember(
		@Args('input') input: MemberUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Member> {
		console.log('Mutation updateMember');
		console.log('memberId', memberId);

		return await this.memberService.updateMember(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Query(() => String)
	//authenticate bo'lgan memberni ma'lumotini olish uchun createParam decorator yozish kerak bo'ldi
	public async checkAuth(@AuthMember('memberNick') memberNick: string): Promise<string> {
		console.log('Query checkAuth');
		console.log('memberNick', memberNick);
		return `Hi ${memberNick}, you are authenticated!`;
	}

	@Roles(MemberType.USER, MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Query(() => String)
	public async checkAuthRoles(@AuthMember() authMember: Member): Promise<string> {
		console.log('Query checkAuthRoles');
		// console.log('authMember', authMember);
		return `Hi ${authMember.memberNick},you are ${authMember.memberType} your member id are ${authMember._id} !`;
	}
	@UseGuards(WithoutGuard)
	@Query(() => Member)
	public async getMember(@Args('input') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Member> {
		console.log('Mutation getMember');

		const targetId = shapeIntoMongoObjectId(input);

		return await this.memberService.getMember(memberId, targetId);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Members)
	public async getAgents(@Args('input') input: AgentsInquiry, @AuthMember('_id') memberId: ObjectId): Promise<Members> {
		console.log('Query getAgents');
		return await this.memberService.getAgents(memberId, input);
	}

	/** ADMIN **/

	//Authorization: ADMIN
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Members)
	public async getAllMembersByAdmin(@Args('input') input: MembersInquiry): Promise<Members> {
		console.log('Mutation getAllMembersByAdmin');
		return await this.memberService.getAllMembersByAdmin(input);
	}

	//Authorization: ADMIN
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Member)
	public async updateMemberByAdmin(@Args('input') input: MemberUpdate): Promise<Member> {
		console.log('Mutation updateMemberByAdmin');
		return await this.memberService.updateMemberByAdmin(input);
	}
}
