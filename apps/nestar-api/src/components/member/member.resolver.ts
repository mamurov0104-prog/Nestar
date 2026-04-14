import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'; // GraphQL dekoratorlarini import qiladi
import { MemberService } from './member.service'; // member service business logic faylini import qiladi
import { InternalServerErrorException, UseGuards} from '@nestjs/common'; // validation va error handling uchun import
import { AgentsInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input'; // login va signup input dto larini import qiladi
import { Member, Members } from '../../libs/dto/member/member'; // Member return type dto ni import qiladi
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';

@Resolver() // bu class GraphQL resolver ekanini bildiradi
export class MemberResolver {
  constructor(private readonly memberService: MemberService) {} // service ni dependency injection orqali oladi

  @Mutation(() => Member)
  public async signup(@Args('input') input: MemberInput): Promise<Member> { 
    console.log('Mutation: signup');
    return await this.memberService.signup(input);
  }

  @Mutation(() => Member)
  public async login(@Args('input') input: LoginInput): Promise<Member> {
    console.log('Mutation: login');
    return await this.memberService.login(input);
  }
  
@UseGuards(AuthGuard)
@Mutation(() => Member)
public async updateMember(
  @Args('input') input: MemberUpdate,
  @AuthMember('_id') memberId: ObjectId, // authMember dekoratori orqali memberId ni oladi
): Promise<Member> {
  console.log('Mutation: updateMember');
  delete input._id; // input dan _id ni o'chiradi, chunki memberId authMember dekoratori orqali olinadi
  return await this.memberService.updateMember(memberId, input); // member ma'lumotini service dan oladi
}

@UseGuards(AuthGuard)
@Query(() => String)
public async checkAuth(
  @AuthMember('memberNick') memberNick: string, // authMember dekoratori orqali memberNick ni oladi
): Promise<string> {
  console.log('Query: checkAuth');
  console.log('memberNick:', memberNick);

  return await `Hi ${memberNick}`;
}

@Roles(MemberType.USER, MemberType.AGENT)
@UseGuards(RolesGuard)
@Query(() => String)
public async checkAuthRoles(
  @AuthMember() authMember: Member,
): Promise<string> {
  console.log('Query: checkAuthRoles');

  return await `Hi ${authMember.memberNick}, you are ${authMember.memberType} (memberId: ${authMember._id})`;
}

@UseGuards(WithoutGuard)
@Query(() => Member)
public async getMember(
  @Args('memberId') input: string,
  @AuthMember('_id') memberId: ObjectId,
): Promise<Member> {
  console.log('Query: getMember');
  const targetId = shapeIntoMongoObjectId(input);
  return await this.memberService.getMember(memberId, targetId);
}

@UseGuards(WithoutGuard)
@Query(() => Members)
public async getAgents(
  @Args('input') input: AgentsInquiry,
  @AuthMember('_id') memberId: ObjectId,
): Promise<Members> {
  console.log('Query: getAgents');
  return await this.memberService.getAgents(memberId, input);
}


/** ADMIN **/

// Authorization: ADMIN
@Roles(MemberType.ADMIN)
@UseGuards(RolesGuard)
@Query(() => Members)
public async getAllMembersByAdmin(
  @Args('input') input: MembersInquiry,
): Promise<Members> {
  return await this.memberService.getAllMembersByAdmin(input);
}

@Roles(MemberType.ADMIN)
@UseGuards(RolesGuard)
@Mutation(() => Member)
public async updateMemberByAdmin(
  @Args('input') input: MemberUpdate,
): Promise<Member> {
  console.log('Mutation: updateMemberByAdmin');
  return await this.memberService.updateMemberByAdmin(input);
}
}