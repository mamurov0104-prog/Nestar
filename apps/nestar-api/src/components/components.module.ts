import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { PropertyModule } from './property/property.module';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { LikeModule } from './like/like.module';
import { ViewModule } from './view/view.module';
import { FollowModule } from './follow/follow.module';
import { BoardArticleModule } from './board-article/board-article.module';

@Module({
	imports: [
		MemberModule,
		PropertyModule,
		AuthModule,
		CommentsModule,
		LikeModule,
		ViewModule,
		FollowModule,
		BoardArticleModule, // bizning barcha componentlarni o'z ichiga olgan modul, 
	],
})
export class ComponentsModule {}
