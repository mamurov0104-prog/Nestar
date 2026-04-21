import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { BoardArticleStatus } from '../../enums/board-article.enum';
// Majburiy o'zgarish: import type dan foydalanamiz
import type { ObjectId } from 'mongoose'; 

@InputType()
export class BoardArticleUpdate {
    @IsNotEmpty()
    @Field(() => String)
    _id!: ObjectId; // Property'dagi kabi majburiy va ObjectId turi

    @IsOptional()
    @Field(() => BoardArticleStatus, { nullable: true })
    articleStatus?: BoardArticleStatus;

    @IsOptional()
    @Length(3, 100) // Odatda title uchun 100 belgacha ruxsat beriladi
    @Field(() => String, { nullable: true })
    articleTitle?: string;

    @IsOptional()
    @Length(3, 500) // Content uchun uzunroq joy kerak bo'ladi
    @Field(() => String, { nullable: true })
    articleContent?: string;

    @IsOptional()
    @Field(() => String, { nullable: true })
    articleImage?: string;
}