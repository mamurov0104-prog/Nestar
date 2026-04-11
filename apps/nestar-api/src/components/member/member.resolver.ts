import {  Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'bson';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

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
		return this.memberService.login(input);
	}


//Authentication
  @UseGuards(AuthGuard)
	@Mutation(() => String)
	//authenticate bo'lgan memberni ma'lumotini olish uchun createParam decorator yozish kerak bo'ldi
	public async updateMember(@AuthMember("_id") Id: ObjectId): Promise<string> {
		console.log('Mutation updateMember');
		console.log('Id', Id);
		return this.memberService.updateMember();
	}

  @UseGuards(AuthGuard)
	@Query(() => String)
	//authenticate bo'lgan memberni ma'lumotini olish uchun createParam decorator yozish kerak bo'ldi
	public async checkAuth(@AuthMember("memberNick") memberNick: string): Promise<string> {
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

	@Query(() => String)
	public async getMember(): Promise<string> {
		console.log('Mutation getMember');
		return this.memberService.getMember();
	}

	/** ADMIN **/

	//Authorization: ADMIN
@Roles(MemberType.ADMIN)
@UseGuards(RolesGuard)
@Mutation(() => String)
public async getAllMembersByAdmin(): Promise<string> {
	return this.memberService.getAllMembersByAdmin();
}

	//Authorization: ADMIN
@Mutation(() => String)
public async updateMemberByAdmin(): Promise<string> {
	console.log('Mutation updateMemberByAdmin');
	return this.memberService.updateMemberByAdmin();
}
}
