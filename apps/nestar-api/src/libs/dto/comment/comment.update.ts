import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { CommentStatus } from '../../enums/comment.enum';
// Majburiy: isolatedModules xatoligini oldini olish uchun 'type' prefiksi bilan import qilamiz
import type { ObjectId } from 'mongoose'; 

@InputType()
export class CommentUpdate {
    @IsNotEmpty()
    @Field(() => String)
    _id!: ObjectId; // Property'dagi kabi majburiy (!) va ObjectId turi

    @IsOptional()
    @Field(() => CommentStatus, { nullable: true })
    commentStatus?: CommentStatus;

    @IsOptional()
    @Length(1, 500) // Izohlar mazmuni uchun uzunroq joy ajratildi
    @Field(() => String, { nullable: true })
    commentContent?: string;
}