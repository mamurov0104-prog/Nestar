import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { Message } from '../../libs/enums/common.enum';
import { AuthService } from '../auth/auth.service';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { ViewService } from '../view/view.service';
import { ViewInput } from '../../libs/dto/view/viewInput';
import { ViewGroup } from '../../libs/enums/view.enum';

@Injectable()
export class MemberService {
	constructor(
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		private readonly authService: AuthService,
		private readonly viewService: ViewService,
	) {}
	public async signup(input: MemberInput): Promise<Member> {
		input.memberPassword = await this.authService.hashPassword(input.memberPassword);
		try {
			const result = await this.memberModel.create(input);
			result.accessToken = await this.authService.createToken(result);
			return result;
		} catch (error: any) {
			console.log('Error, Service.model: ', error.message);
			throw new BadRequestException(Message.USED_MEMBER_NICK_OR_PHONE);
		}
	}

	public async login(input: LoginInput): Promise<Member> {
		try {
			const { memberNick, memberPassword } = input;
			console.log('Input: ', input);
			const response: Member = (await this.memberModel
				.findOne({ memberNick: memberNick })
				.select('+memberPassword')
				.exec()) as Member;
			// status check

			if (!response || response.memberStatus === MemberStatus.DELETE) {
				throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
			} else if (response.memberStatus === MemberStatus.BLOCK) {
				throw new InternalServerErrorException(Message.BLOCKED_USER);
			}
			const isMatch = await this.authService.comparePassword(memberPassword, response.memberPassword as string);
			console.log('isMatch', isMatch);
			if (!isMatch) {
				throw new InternalServerErrorException(Message.WRONG_PASSWORD);
			}
			response.accessToken = await this.authService.createToken(response);

			return response;
		} catch (error) {
			console.log('Error, Service.model: ', error);
			throw new BadRequestException(error);
		}
	}

	public async getMember(memberId: Types.ObjectId, targetId: Types.ObjectId): Promise<Member> {
		const search = {
			_id: targetId,
			memberStatus: { $in: [MemberStatus.ACTIVE, MemberStatus.BLOCK] },
		};
		const targetMember = await this.memberModel.findOne(search).lean().exec();
		if (!targetMember) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}
		if (memberId) {
			console.log('memberId:', memberId, 'targetId:', targetId);
			// record view
			const viewInput: ViewInput = {
				viewGroup: ViewGroup.MEMBER,
				viewRefId: targetId,
				memberId: memberId,
			};
			const newView = await this.viewService.recordView(viewInput);
			// memberView ++
      if (newView) {
        console.log("NEWVIEW: ", newView)
				await this.memberModel.findByIdAndUpdate(search, { $inc: { memberViews: 1 } }).exec();
				console.log('VIEW SUCCESSFULLY QOSHILDI');
				targetMember.memberViews++; // response uchun real-timeda viewni oshiramiz.
			}
		}
		return targetMember;
	}

	public async updateMember(memberId: ObjectId, input: MemberUpdate): Promise<Member> {
		const result = await this.memberModel
			.findOneAndUpdate({ _id: memberId, memberStatus: MemberStatus.ACTIVE }, input, { new: true })
			.exec();
		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		result.accessToken = await this.authService.createToken(result);
		return result;
	}

	public async getAllMembersByAdmin(): Promise<String> {
		return 'getAllMembersByAdmin executed';
	}

	public async updateMemberByAdmin(): Promise<String> {
		return 'updateMemberByAdmin executed';
	}
}
