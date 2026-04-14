import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Salom Nestar Rest Api xush keldiz';
  }
}
