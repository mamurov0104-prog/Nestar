import { Module } from '@nestjs/common';
import { BoardArticleService } from './board-article.service';
import { BoardArticleResolver } from './board-article.resolver';

@Module({
  providers: [BoardArticleResolver, BoardArticleService],
})
export class BoardArticleModule {}
