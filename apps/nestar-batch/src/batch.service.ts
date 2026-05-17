import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member } from '../../nestar-api/src/libs/dto/member/member';
import { Property } from '../../nestar-api/src/libs/dto/property/property';
import { PropertyStatus } from '../../nestar-api/src/libs/enums/property.enum';
import { MemberStatus, MemberType } from '../../nestar-api/src/libs/enums/member.enum';

@Injectable()
export class NestarBatchService {
	constructor(
		@InjectModel('Property') private readonly propertyModel: Model<Property>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}

	public async batchRollback(): Promise<void> {
		await this.propertyModel.updateMany({ propertyStatus: PropertyStatus.ACTIVE }, { propertyRank: 0 }).exec();
		await this.memberModel
			.updateMany(
				{
					memberStatus: MemberStatus.ACTIVE,
					memberType: MemberType.AGENT,
				},
				{ memberRank: 0 },
			)
			.exec();
	}

	public async batchTopProperties(): Promise<void> {
		const properties: Property[] = await this.propertyModel
			.find({ propertyStatus: PropertyStatus.ACTIVE, propertyRank: 0 })
			.exec();

		const promisedList = properties.map(async (property: Property) => {
			const {_id, propertyViews = 1, propertyLikes = 1} = property;
			const rank = propertyViews * 1 + propertyLikes * 2;
			await this.propertyModel.findByIdAndUpdate(_id, { propertyRank: rank }).exec();
		});

		await Promise.all(promisedList);
			
	}

	public async batchTopAgents(): Promise<void> {
		const agents: Member[] = await this.memberModel
			.find({ memberStatus: MemberStatus.ACTIVE, memberType: MemberType.AGENT, memberRank: 0 })
			.exec();

		const promisedList = agents.map(async (agent: Member) => {
			const {_id, memberProperties = 1, memberViews = 1, memberLikes = 1, memberArticles = 1} = agent;
			const rank = memberViews * 1 + memberLikes * 2 + memberArticles * 3 + memberProperties * 5;
			await this.memberModel.findByIdAndUpdate(_id, { memberRank: rank }).exec();
		});

		await Promise.all(promisedList);
	}

	getHello(): string {
		return 'Welcome to Nestar Batch Server!';
	}
}
