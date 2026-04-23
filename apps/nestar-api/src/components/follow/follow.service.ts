import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Follower, Followers, Following, Followings } from '../../libs/dto/follow/follow';
import { Model } from 'mongoose';
// MUHIM: 'import type' ishlatish TS1272 xatosini oldini oladi
import type { ObjectId } from 'mongoose'; 
import { MemberService } from '../member/member.service';
import { Direction, Message } from '../../libs/enums/common.enum';
import { FollowInquiry } from '../../libs/dto/follow/follow.input';
import { T } from '../../libs/types/common';
import {
    lookupAuthMemberFollowed,
    lookupAuthMemberLiked,
    lookupFollowerData,
    lookupFollowingData,
} from '../../libs/config';

@Injectable()
export class FollowService {
    constructor(
        // 'Follow' kolleksiyasini model sifatida ulaymiz
        @InjectModel('Follow') private readonly followModel: Model<Follower | Following>,
        private readonly memberService: MemberService,
    ) {}

    /**
     * =========================================================================================
     * SUBSCRIBE - AG'OLIKNI AMALGA OSHIRISH (FOLLOW QILISH)
     * =========================================================================================
     */
    public async subscribe(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
        // 1. O'ziga o'zi obuna bo'lishni tekshirish
        if (followerId.toString() === followingId.toString()) {
            throw new InternalServerErrorException(Message.SELF_SUBSCRIPTION_DENIED);
        }

        // 2. Obuna bo'linayotgan user (followingId) haqiqatda borligini tekshirish
        // 'null as any' - TS2345 (null is not assignable to ObjectId) xatosini tuzatadi
        const targetMember = await this.memberService.getMember(null as any, followingId as any);
        if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        // 3. Obunani bazada ro'yxatga olish
        const result = await this.registerSubscription(followerId, followingId);

        /**
         * 4. STATISTIKANI YANGILASH:
         * memberStatsEditor ichidagi '_id: followerId as any' - TS2740 xatosini tuzatish uchun.
         */
        
        // Obuna bo'gan odamning "Followings" (kimlarni kuzatyapti) sonini +1 qilamiz
        await this.memberService.memberStatsEditor({ 
            _id: followerId as any, 
            targetKey: 'memberFollowings', 
            modifier: 1 
        });

        // Obuna bo'lingan (target) odamning "Followers" (kuzatuvchilari) sonini +1 qilamiz
        await this.memberService.memberStatsEditor({ 
            _id: followingId as any, 
            targetKey: 'memberFollowers', 
            modifier: 1 
        });

        return result;
    }

    /**
     * BAZAGA YANGI FOLLOW HUJJATINI YOZISH
     */
    private async registerSubscription(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
        try {
            return await this.followModel.create({
                followingId: followingId,
                followerId: followerId,
            });
        } catch (err) {
            console.log('Error, Service.registerSubscription:', err);
            throw new BadRequestException(Message.CREATE_FAILED);
        }
    }

    /**
     * =========================================================================================
     * UNSUBSCRIBE - OBUNADAN CHIQISH
     * =========================================================================================
     */
    public async unsubscribe(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
        // 1. Obunadan chiqilayotgan user mavjudligini tekshirish
        // 'null as any' orqali argument tipi bilan bog'liq xato tuzatildi
        const targetMember = await this.memberService.getMember(null as any, followingId as any);
        if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        // 2. Bazadan ushbu follow hujjatini qidirib o'chirish
        const result = await this.followModel.findOneAndDelete({
            followingId: followingId,
            followerId: followerId,
        }).exec();

        if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        // 3. STATISTIKANI KAMAYTIRISH (-1)
        await this.memberService.memberStatsEditor({ 
            _id: followerId as any, 
            targetKey: 'memberFollowings', 
            modifier: -1 
        });
        
        await this.memberService.memberStatsEditor({ 
            _id: followingId as any, 
            targetKey: 'memberFollowers', 
            modifier: -1 
        });

        return result;
    }

    /**
     * =========================================================================================
     * GET MEMBER FOLLOWINGS - MEN KIMGADIR OBUNA BO'LGANLARIM RO'YXATI
     * =========================================================================================
     */
    public async getMemberFollowings(memberId: ObjectId | null, input: FollowInquiry): Promise<Followings> {
        const { page, limit, search } = input;
        
        // Kiruvchi followerId bo'lishi shart
        if (!search?.followerId) throw new InternalServerErrorException(Message.BAD_REQUEST);

        const match: T = { followerId: search?.followerId };

        const result = await this.followModel
            .aggregate([
                { $match: match },
                { $sort: { createdAt: Direction.DESC } }, // Saralash
                {
                    $facet: {
                        list: [
                            { $skip: (page - 1) * limit },
                            { $limit: limit },
                            // Login qilgan user bu odamga LIKE bosganmi yoki yo'qmi?
                            lookupAuthMemberLiked(memberId, '$followingId'),
                            // Login qilgan user bu odamga FOLLOW qilganmi?
                            lookupAuthMemberFollowed({
                                followerId: memberId,
                                followingId: '$followingId',
                            }),
                            // Obuna bo'lingan userning profil ma'lumotlarini (ism, rasm) olib kelish
                            lookupFollowingData,
                            { $unwind: '$followingData' }, 
                        ],
                        metaCounter: [{ $count: 'total' }],
                    },
                },
            ])
            .exec();
            
        if (!result || !result[0].list.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        return result[0];
    }

    /**
     * =========================================================================================
     * GET MEMBER FOLLOWERS - KIMLAR MENGA OBUNA BO'LGAN (KUZATUVCHILARIM)
     * =========================================================================================
     */
    public async getMemberFollowers(memberId: ObjectId | null, input: FollowInquiry): Promise<Followers> {
        const { page, limit, search } = input;
        
        if (!search?.followingId) throw new InternalServerErrorException(Message.BAD_REQUEST);

        const match: T = { followingId: search?.followingId };

        const result = await this.followModel
            .aggregate([
                { $match: match },
                { $sort: { createdAt: Direction.DESC } },
                {
                    $facet: {
                        list: [
                            { $skip: (page - 1) * limit },
                            { $limit: limit },
                            // Kuzatuvchilarim ichidan kimlarnidir LIKE qilganmanmi?
                            lookupAuthMemberLiked(memberId, '$followerId'),
                            // Kuzatuvchilarim ichidan kimlarnidir FOLLOW qilganmanmi?
                            lookupAuthMemberFollowed({
                                followerId: memberId,
                                followingId: '$followerId',
                            }),
                            // Menga obuna bo'lgan userning profil ma'lumotlarini olib kelish
                            lookupFollowerData,
                            { $unwind: '$followerData' },
                        ],
                        metaCounter: [{ $count: 'total' }],
                    },
                },
            ])
            .exec();

        if (!result || !result[0].list.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        return result[0];
    }
}