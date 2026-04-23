import { Field, ObjectType } from '@nestjs/graphql';
/** * MUHIM: 'import type' - bu TypeScript-ga 'ObjectId' faqat ma'lumot turi sifatida ishlatilishini aytadi.
 * Bu dekoratorlar (@Field) ichida tipni xavfsiz ishlatish uchun shart.
 */
import type { ObjectId } from 'mongoose'; 
import { Member, TotalCounter } from '../member/member';
import { MeLiked } from '../like/like';

/**
 * =========================================================================================
 * 1. ME FOLLOWED - MENING OBUNALARIM (CHECKER)
 * =========================================================================================
 * Bu klas login qilgan foydalanuvchi biror kishiga obuna bo'lganmi yoki yo'qmi 
 * degan savolga javob beruvchi mantiqiy model.
 */
@ObjectType()
export class MeFollowed {
    @Field(() => String)
    followingId: ObjectId;

    @Field(() => String)
    followerId: ObjectId;

    @Field(() => Boolean)
    myFollowing: boolean; // Men bu odamni follow qilyapmanmi? (true/false)
}

/**
 * =========================================================================================
 * 2. FOLLOWER - KUZATUVCHI (MENGA OBUNA BO'LGANLAR)
 * =========================================================================================
 */
@ObjectType()
export class Follower {
    @Field(() => String)
    _id: ObjectId;

    @Field(() => String)
    followingId: ObjectId;

    @Field(() => String)
    followerId: ObjectId;

    @Field(() => Date)
    createdAt: Date;

    @Field(() => Date)
    updatedAt: Date;

    /** * AGGREGATION PIPELINE ORQALI KELADIGAN MA'LUMOTLAR:
     * Bu maydonlar bazada aslida yo'q, lekin biz ularni '$lookup' orqali vaqtincha birlashtiramiz.
     */

    @Field(() => [MeLiked], { nullable: true })
    meLiked?: MeLiked[]; // Bu foydalanuvchi men tomonidan yoqtirilganmi (liked)?

    @Field(() => [MeFollowed], { nullable: true })
    meFollowed?: MeFollowed[]; // Men ham unga obunamanmi?

    @Field(() => Member, { nullable: true })
    followerData?: Member; // Menga obuna bo'lgan odamning ismi, rasmi va boshqa ma'lumotlari
}

/**
 * =========================================================================================
 * 3. FOLLOWING - OBUNA BO'LINGAN (MEN KIMGADIR OBUNAMAN)
 * =========================================================================================
 */
@ObjectType()
export class Following {
    @Field(() => String)
    _id: ObjectId;

    @Field(() => String)
    followingId: ObjectId;

    @Field(() => String)
    followerId: ObjectId;

    @Field(() => Date)
    createdAt: Date;

    @Field(() => Date)
    updatedAt: Date;

    /** from aggregation **/

    @Field(() => [MeLiked], { nullable: true })
    meLiked?: MeLiked[];

    @Field(() => [MeFollowed], { nullable: true })
    meFollowed?: MeFollowed[];

    @Field(() => Member, { nullable: true })
    followingData?: Member; // Men kuzatib borayotgan odamning profil ma'lumotlari
}

/**
 * =========================================================================================
 * 4. FOLLOWINGS & FOLLOWERS - RO'YXAT VA STATISTIKA
 * =========================================================================================
 * Front-endda pagination qilish uchun ro'yxat bilan birga umumiy sonini (total) ham qaytaramiz.
 */
@ObjectType()
export class Followings {
    @Field(() => [Following])
    list: Following[]; // Obunalarim ro'yxati

    @Field(() => [TotalCounter], { nullable: true })
    metaCounter: TotalCounter[]; // Umumiy nechta odamga obuna ekanligim (masalan: total: 50)
}

@ObjectType()
export class Followers {
    @Field(() => [Follower])
    list: Follower[]; // Kuzatuvchilarim ro'yxati

    @Field(() => [TotalCounter], { nullable: true })
    metaCounter: TotalCounter[]; // Umumiy nechta kuzatuvchim borligi
}