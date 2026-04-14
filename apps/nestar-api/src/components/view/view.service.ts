import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/viewInput';
import { T } from '../../libs/types/common';
import { run } from 'node:test';

@Injectable()
export class ViewService {
	constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

	public async recordView(input: ViewInput): Promise<View | null> {
		const existingView = await this.findViewExistence(input);
		if (!existingView) {
			console.log('---- NEW VIEW INSERTED ---');
			return await this.viewModel.create(input);
		}
		return null;
	}

	private async findViewExistence(input: ViewInput): Promise<View | null> {
		const result = await this.viewModel.findOne(input).exec();
		console.log('VIEW NATIJASI: ', result);
		return result;
	}
}
