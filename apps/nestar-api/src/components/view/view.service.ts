import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';
import { shapeIntoMongoObjectId, lookupFavorite, lookupVisit } from '../../libs/config';
import { Properties } from '../../libs/dto/property/property';
import { OrdinaryInquiry } from '../../libs/dto/property/property.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { ViewGroup } from '../../libs/enums/view.enum';

@Injectable()
export class ViewService {
	constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

	public async recordView(input: ViewInput): Promise<View | null> {
		console.log('input:', input);

		const viewExistence = await this.checkViewExistence(input);
		console.log('viewexis:', viewExistence);
		if (!viewExistence) {
			console.log('new view');
			return await this.viewModel.create(input);
		}
		return null;
	}

	private async checkViewExistence(input: ViewInput): Promise<View | null> {
		const { memberId, viewRefId } = input;
		const search: T = { memberId: memberId, viewRefId: viewRefId };
		return await this.viewModel.findOne(search).exec();
	}

	public async getVisitedProperties(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties> {
			const { page = 1, limit = 10 } = input;
			const match: T = {
				viewGroup: ViewGroup.PROPERTY,
				memberId: shapeIntoMongoObjectId(memberId),
			};
			
	
			const data: T = await this.viewModel
				.aggregate([
					{ $match: match },
					{ $sort: { updatedAt: -1 } },
					{
						$lookup: {
							from: 'properties',
							localField: 'viewRefId',
							foreignField: '_id',
							as: 'visitedProperty',
						},
					},
					{ $unwind: '$visitedProperty' },
					{
						$facet: {
							list: [
								
								{ $skip: (page - 1) * limit },
								{ $limit: limit },
								lookupVisit,
								{ $unwind: '$visitedProperty.memberData' },
							],
							metaCounter: [{ $count: 'total' }],
						},
					},
				])
				.exec();
	
			const result: Properties = { list: [], metaCounter: data[0].metaCounter };
	
			result.list = data[0].list.map((item: T) => {
				return item.visitedProperty;
			});
			
			return result;
		}
}
