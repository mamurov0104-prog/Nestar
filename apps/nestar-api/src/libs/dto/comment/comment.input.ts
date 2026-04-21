import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
// Majburiy: 'isolatedModules' xatosini oldini olish uchun 'type' prefiksi bilan import qilamiz
import type { ObjectId } from 'mongoose'; 
import { CommentGroup } from '../../enums/comment.enum';
import { Direction } from '../../enums/common.enum';
import { availableCommentSorts } from '../../config';

@InputType()
export class CommentInput {
    @IsNotEmpty()
    @Field(() => CommentGroup)
    commentGroup!: CommentGroup; // Majburiy (!) belgisi qo'shildi

    @IsNotEmpty()
    @Length(1, 500) // Izohlar uchun 100 belgi kamlik qilishi mumkin, 500 gacha kengaytirildi
    @Field(() => String)
    commentContent!: string;

    @IsNotEmpty()
    @Field(() => String) // GraphQL baribir string sifatida qabul qiladi
    commentRefId!: ObjectId;

    // Ichki foydalanish (service) uchun, shuning uchun @Field kerak emas
    memberId?: ObjectId;
}

@InputType()
class CISearch {
    @IsNotEmpty()
    @Field(() => String)
    commentRefId!: ObjectId;
}

@InputType()
export class CommentsInquiry {
    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    page!: number;

    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    limit!: number;

    @IsOptional()
    @IsIn(availableCommentSorts)
    @Field(() => String, { nullable: true })
    sort?: string;

    @IsOptional()
    @Field(() => Direction, { nullable: true })
    direction?: Direction;

    @IsNotEmpty()
    @Field(() => CISearch)
    search!: CISearch;
}