import { Field, ObjectType } from '@nestjs/graphql';
import { LikeGroup } from '../../enums/like.enum';
// MUHIM: isolatedModules xatosi uchun 'import type'
import type { ObjectId } from 'mongoose';

@ObjectType() // Murojatchi malum bir targetga like bosgan yoki bosmaganligini aniqlab beruvchi object type
export class MeLiked {
    @Field(() => String)
    memberId: ObjectId;

    @Field(() => String)
    likeRefId: ObjectId;

    @Field(() => Boolean)
    myFavorite: boolean;
}

@ObjectType() // Like hosil bo'lganda qanday keylar bo'ladi
export class Like {
    @Field(() => String)
    _id: ObjectId;

    @Field(() => LikeGroup)
    likeGroup: LikeGroup;

    @Field(() => String)
    likeRefId: ObjectId;

    @Field(() => String)
    memberId: ObjectId;

    @Field(() => Date)
    createdAt: Date; // MongoDB avtomatik hosil qilib beradi

    @Field(() => Date)
    updatedAt: Date; // MongoDB avtomatik hosil qilib beradi
}