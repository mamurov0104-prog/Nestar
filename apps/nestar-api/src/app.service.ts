import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	getHello(): string {
		return 'WELCOME NESTAR REST_API !';
	}
}
