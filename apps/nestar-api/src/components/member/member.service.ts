import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { MemberStatus } from '../../libs/enums/member.enum';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class MemberService {
	constructor(@InjectModel('Member') private readonly memberModel: Model<Member>) {}
	public async signup(input: MemberInput): Promise<Member> {
		// TODO: Hashshing password
		try {
			const result = await this.memberModel.create(input);
			return result;
		} catch (error) {
			console.log('Error, Service.model: ', error);
			throw new BadRequestException(error);
		}
	}

	public async login(input: LoginInput): Promise<Member> {
		try {
			const { memberNick, memberPassword } = input;
			// exist check
			const response: Member = (await this.memberModel
				.findOne({ memberNick: memberNick })
				.select('+memberPassword')
				.exec()) as Member;
			console.log('Member:', response);

			if (!response || response.memberStatus === MemberStatus.DELETE) {
				throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
			} else if (response.memberStatus === MemberStatus.BLOCK) {
				throw new InternalServerErrorException(Message.BLOCKED_USER);
			}

			// todo:  Password compare logic
			const isMatch = memberPassword === response.memberPassword;
			if (!isMatch) {
				throw new InternalServerErrorException(Message.WRONG_PASSWORD);
			}

			return response;
		} catch (error) {
			console.log('Error, Service.model: ', error);
			throw new BadRequestException(error);
		}
	}

	public async updateMember(): Promise<String> {
		return 'updateMember executed';
	}

	public async getMember(): Promise<String> {
		return 'getMember executed';
	}
}
