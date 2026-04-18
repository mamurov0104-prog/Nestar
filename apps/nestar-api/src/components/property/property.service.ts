import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { AgentPropertiesInquiry, AllPropertiesInquiry, PISearch, PropertiesInquiry, PropertyInput } from '../../libs/dto/property/property.input';
import { Properties, Property } from '../../libs/dto/property/property';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';
import { ViewInput } from '../../libs/dto/view/view.input';
import { StatisticModifier, T } from '../../libs/types/common';
import { LikeService } from '../like/like.service';
import { ViewService } from '../view/view.service';
import { PropertyStatus } from '../../libs/enums/property.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import moment from 'moment';

@Injectable()
export class PropertyService {
    constructor(
        // Property modelini loyihaga ulaymiz
        @InjectModel('Property') private readonly propertyModel: Model<Property>,
        // Tashqi servicelarni inject qilamiz
        private memberService: MemberService,
        private viewService: ViewService,
        private likeService: LikeService,
    ) {}

    /** YANGI PROPERTY YARATISH **/
    public async createProperty(input: PropertyInput): Promise<Property> {
        try {
            // Ma'lumotlar bazasida yangi property yaratamiz
            const result = await this.propertyModel.create(input);
            
            // Property yaratilgach, agentning (member) statistikalarini yangilaymiz
            await this.memberService.memberStatsEditor({
                _id: result.memberId as any, // result ichidagi memberId ni ishlatamiz
                targetKey: 'memberProperties', // agentning propertylar sonini oshiramiz
                modifier: 1, // 1 taga ko'paytirsin
            });
            
            return result; // Yaratilgan propertyni qaytaramiz
        } catch (err) {
            console.log('Error, ', err.message);
            throw new BadRequestException(Message.CREATE_FAILED);
        }
    }

    /** BITTA PROPERTYNI OLISH (VIEW REKORD BILAN) **/
    public async getProperty(memberId: Types.ObjectId | null, propertyId: Types.ObjectId): Promise<Property> {
        // Qidiruv ob'ektini shakllantiramiz
        const search: Record<string, any> = {
            _id: propertyId,
            propertyStatus: PropertyStatus.ACTIVE, // Faqat aktiv propertylarni ko'rish mumkin
        };

        // Bazadan izlaymiz va lean() orqali tezroq (readonly) formatda olamiz
        const targetProperty: Property | null = await this.propertyModel.findOne(search).lean().exec();
        
        // Agar property topilmasa xato qaytaramiz
        if (!targetProperty) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        // Agar foydalanuvchi login qilgan bo'lsa (memberId bo'lsa), ko'rishlar sonini hisoblaymiz
        if (memberId) {
            const viewInput: ViewInput = { 
                memberId: memberId as any, 
                viewRefId: propertyId as any, 
                viewGroup: ViewGroup.PROPERTY 
            };
            
            // ViewService orqali ko'rilganini rekord qilamiz
            const newView = await this.viewService.recordView(viewInput);

            // Agar bu yangi ko'rish bo'lsa (birinchi marta), statistika oshiriladi
            if (newView) {
                await this.propertyStatsEditor({ _id: propertyId as any, targetKey: 'propertyViews', modifier: 1 });
                targetProperty.propertyViews++;
            }
        }

        // Property egasi (agent) haqidagi ma'lumotlarni aggregation qilmasdan, service orqali ulaymiz
        (targetProperty as any).memberData = await this.memberService.getMember(
            memberId as any, 
            new Types.ObjectId(targetProperty.memberId as any)
        );

        return targetProperty;
    }

    /** PROPERTY STATISTIKALARINI TAHRIRLASH (LIKES, VIEWS) **/
    public async propertyStatsEditor(input: StatisticModifier): Promise<Property> {
        const { _id, targetKey, modifier } = input;
        
        // Berilgan ID bo'yicha targetKey (masalan propertyViews) qiymatini modifier miqdoriga o'zgartiradi
        return (await this.propertyModel
            .findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true })
            .exec()) as unknown as Property;
    }

    /** PROPERTYNI YANGILASH (AGENT TOMONIDAN) **/
    public async updateProperty(memberId: Types.ObjectId, input: PropertyUpdate): Promise<Property> {
        let { propertyStatus, soldAt, deletedAt } = input;

        // Faqat o'ziga tegishli va ACTIV bo'lgan propertyni update qilish sharti
        const search: T = {
            _id: input._id,
            memberId: memberId,
            propertyStatus: PropertyStatus.ACTIVE,
        };

        // Agar status o'zgarsa, vaqtlarini belgilaymiz
        if (propertyStatus === PropertyStatus.SOLD) soldAt = new Date();
        else if (propertyStatus === PropertyStatus.DELETE) deletedAt = new Date();

        // Bazada yangilashni amalga oshiramiz
        const result = await this.propertyModel.findOneAndUpdate(search, input, { new: true }).exec();
        
        // Agar natija bo'lmasa (masalan unga tegishli bo'lmasa), xato qaytaramiz
        if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

        // Agar sotilsa yoki o'chirilsa, agentning aktiv propertylar sonini 1 taga kamaytiramiz
        if (soldAt || deletedAt) {
            await this.memberService.memberStatsEditor({
                _id: memberId as any,
                targetKey: 'memberProperties',
                modifier: -1,
            });
        }

        return result;
    }

    /** BARCHA PROPERTYLARNI FILTRLAR BILAN OLISH (CLIENT UCHUN) **/
    public async getProperties(memberId: Types.ObjectId, input: PropertiesInquiry): Promise<Properties> {
        const { page, limit, sort, direction, search } = input;

        // Faqat aktiv propertylar ko'rinadi
        const match: T = { propertyStatus: PropertyStatus.ACTIVE };
        
        // Sortlash mantiqi (agar berilmasa createdAt bo'yicha DESC)
        const sortFinal: T = { [sort ?? 'createdAt']: direction ?? Direction.DESC };

        // Filtrlarni match ob'ektiga yuklaymiz
        this.shapeMatchQuery(match, search);

        // Murakkab so'rovni Aggregation orqali bajaramiz
        const result = await this.propertyModel
            .aggregate([
                { $match: match },
                { $sort: sortFinal },
                {
                    $facet: {
                        list: [
                            { $skip: (page - 1) * limit }, // Sahifalash
                            { $limit: limit }, // Limit
                            lookupAuthMemberLiked(memberId as any), // User yoqtirganmi yoki yo'q
                            lookupMember, // Agent ma'lumotlarini ulash
                            { $unwind: '$memberData' }, // Arrayni ob'ektga aylantirish
                        ],
                        metaCounter: [{ $count: 'total' }], // Umumiy sonini hisoblash
                    },
                },
            ])
            .exec();

        if (!result || !result[0]) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        return result[0];
    }

    /** QIDIRUV SHARTLARINI SHAKLLANTIRISH (PRIVATE HELPER) **/
    private shapeMatchQuery(match: T, search: PISearch): void {
        const {
            memberId,
            locationList,
            typeList,
            roomsList,
            bedsList,
            options,
            pricesRange,
            periodsRange,
            squaresRange,
            text,
        } = search;

        // Agar aniq bir agentning propertylari so'ralsa
        if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
        
        // Ro'yxat asosida filtrlar ($in operatori)
        if (locationList && locationList.length) match.propertyLocation = { $in: locationList };
        if (roomsList && roomsList.length) match.propertyRooms = { $in: roomsList };
        if (bedsList && bedsList.length) match.propertyBeds = { $in: bedsList };
        if (typeList && typeList.length) match.propertyType = { $in: typeList };

        // Diapazonli filtrlar ($gte - dan katta, $lte - gacha)
        if (pricesRange) match.propertyPrice = { $gte: pricesRange.start, $lte: pricesRange.end };
        if (periodsRange) match.constructedAt = { $gte: periodsRange.start, $lte: periodsRange.end };
        if (squaresRange) match.propertySquare = { $gte: squaresRange.start, $lte: squaresRange.end };

        // Matnli qidiruv (regex orqali, case-insensitive)
        if (text) match.propertyTitle = { $regex: text, $options: 'i' };
        
        // Qo'shimcha optionlar (masalan barter, rent)
        if (options) {
            match['$or'] = options.map((ele) => {
                return { [ele]: true };
            });
        }
    }

    /** AGENTNING O'ZIGA TEGISHLI PROPERTYLARNI OLISH **/
    public async getAgentProperties(memberId: Types.ObjectId, input: AgentPropertiesInquiry): Promise<Properties> {
        const { page, limit, sort, direction, search } = input;
        const { propertyStatus } = search;

        // O'chirilganlarni ko'rishga ruxsat yo'q
        if (propertyStatus === PropertyStatus.DELETE) throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);

        // Agent ID va status bo'yicha filtr
        const match: T = {
            memberId: memberId,
            propertyStatus: propertyStatus ?? { $ne: PropertyStatus.DELETE },
        };
        
        const sortFinal = { [sort ?? 'createdAt']: direction ?? Direction.DESC };

        const result = await this.propertyModel
            .aggregate([
                { $match: match },
                { $sort: sortFinal },
                {
                    $facet: {
                        list: [
                            { $skip: (page - 1) * limit }, // To'g'ri pagination: (page-1)*limit
                            { $limit: limit },
                            lookupMember, // Agent o'zi haqidagi ma'lumotlar
                            { $unwind: '$memberData' }
                        ],
                        metaCounter: [{ $count: 'total' }],
                    },
                },
            ])
            .exec();

        if (!result || !result[0]) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        return result[0];
    }
	/** ADMIN */
	public async getAllPropertiesByAdmin(input: AllPropertiesInquiry): Promise<Properties> {
		const { page, limit, sort, direction, search } = input;
		const { propertyStatus, propertyLocationList } = search;

		const match: T = {}; // match objectni hosil qildik
		const sortFinal = { [sort ?? 'createdAt']: direction ?? Direction.DESC };
		// kiritilmagan bo'lsa default qiymatlarini ko'rsatyapmiz

		if (propertyStatus) match.propertyStatus = propertyStatus;
		if (propertyLocationList) match.propertyLocation = { $in: propertyLocationList };
		// LocationList izlash mantig'ini matchni iciga yuklayapmiz

		const result = await this.propertyModel
			.aggregate([
				// aggregate static methodini chaqirib unga [] ni argument sifatida path bo'ladi
				{ $match: match }, // bitta pipelineda match  qilinyapti
				{ $sort: sortFinal }, // bitta pipelineda sort qilinyapti
				{
					$facet: {
						// faced orqali alohida 2 ta pipeline hosil qildik
						list: [
							// listda pagination qonuniyatini hosil qildik
							{ $skip: (input.page - 1) * input.limit }, // qatorlarni o'tkazib yuborish
							{ $limit: input.limit }, // faqat kerkali miqdordagi qatorni olib beradi
							lookupMember, // [memberData] ni olib beradi
							{ $unwind: '$memberData' }, // bu [memberData] => arrayni tushirib memberData ni olib beradi
						],
						metaCounter: [{ $count: 'total' }],
						// pagination ni hosil qilyapmiz
					},
				},
			])
			.exec();
		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async updatePropertyByAdmin(input: PropertyUpdate): Promise<Property> {
		let { propertyStatus, soldAt, deletedAt } = input;
		const search: T = {
			_id: input._id,
			propertyStatus: PropertyStatus.ACTIVE, // AMIN faqat ACTIVE propertylarni o'zgartirishi mumkin
		};

		if (propertyStatus === PropertyStatus.SOLD) input.soldAt = moment().toDate();
		// o'zgartirmoqwchi bo'lgan propetryimiz statusi SOLD bo'lsa uni vaqtini belgilayapmiz
		else if (propertyStatus === PropertyStatus.DELETE) input.deletedAt = moment().toDate();
		// propetryimiz statusi DELETE bo'lsa uni o'chirilgan vaqtini belgilayapmiz

		const result = await this.propertyModel
			.findOneAndUpdate(
				search, // yuqoridagi search objecti
				input, // o'zgarayotgan qiymatlar ketma ketigi
				{ new: true }, // o'zgargan qiymat
			)
			.exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (soldAt || deletedAt) {
			// agar admin soldAt yoki deletedAt qilgan bo'lsa
			await this.memberService.memberStatsEditor({
           _id: result.memberId as any, // propertyimizni egasini
				targetKey: 'memberProperties', // memberProperties sonini
				modifier: -1, // -1 ga kamaytiramiz
			});
		}

		return result;
	}

	public async removePropertyByAdmin(propertyId: ObjectId): Promise<Property> {
		const search: T = { _id: propertyId, propertyStatus: PropertyStatus.DELETE };
		// {biz o'chirmoqchi bo'lgan propertyIDsi, faqat statusi DELETE bo'lgan propertyni o'chira olamiz}
		const result = await this.propertyModel.findOneAndDelete(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
		// agar o'chirilmagan bo'lsa shu mantiq ishga tushadi

		return result;
	}

}