import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
// Majburiy: isolatedModules xatosini oldini olish uchun 'type' prefiksi bilan import qilamiz
import type { ObjectId } from 'mongoose'; 
import { BoardArticleCategory, BoardArticleStatus } from '../../enums/board-article.enum';
import { Direction } from '../../enums/common.enum';
import { availableBoardArticleSorts } from '../../config';

@InputType()
export class BoardArticleInput {
    @IsNotEmpty()
    @Field(() => BoardArticleCategory)
    articleCategory!: BoardArticleCategory; // Majburiy (!) belgilari qo'shildi

    @IsNotEmpty()
    @Length(3, 100)
    @Field(() => String)
    articleTitle!: string;

    @IsNotEmpty()
    @Length(3, 500)
    @Field(() => String)
    articleContent!: string;

    @IsOptional()
    @Field(() => String, { nullable: true })
    articleImage?: string;

    // Ichki foydalanish uchun, shuning uchun @Field kerak emas
    memberId?: ObjectId;
}

@InputType()
class BAISearch {
    @IsOptional()
    @Field(() => BoardArticleCategory, { nullable: true })
    articleCategory?: BoardArticleCategory;

    @IsOptional()
    @Field(() => String, { nullable: true })
    text?: string;

    @IsOptional()
    @Field(() => String, { nullable: true }) // GraphQL baribir string deb qabul qiladi
    memberId?: ObjectId;
}

@InputType()
export class BoardArticlesInquiry {
    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    page!: number;

    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    limit!: number;

    @IsOptional()
    @IsIn(availableBoardArticleSorts)
    @Field(() => String, { nullable: true })
    sort?: string;

    @IsOptional()
    @Field(() => Direction, { nullable: true })
    direction?: Direction;

    @IsNotEmpty()
    @Field(() => BAISearch)
    search!: BAISearch;
}

@InputType()
class ABAISearch {
    @IsOptional()
    @Field(() => BoardArticleStatus, { nullable: true })
    articleStatus?: BoardArticleStatus;

    @IsOptional()
    @Field(() => BoardArticleCategory, { nullable: true })
    articleCategory?: BoardArticleCategory;
}

@InputType()
export class AllBoardArticlesInquiry {
    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    page!: number;

    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    limit!: number;

    @IsOptional()
    @IsIn(availableBoardArticleSorts)
    @Field(() => String, { nullable: true })
    sort?: string;

    @IsOptional()
    @Field(() => Direction, { nullable: true })
    direction?: Direction;

    @IsNotEmpty()
    @Field(() => ABAISearch)
    search!: ABAISearch;
}