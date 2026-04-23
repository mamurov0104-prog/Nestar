import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';
/** * DIQQAT: 'import type' - bu TypeScript-ga 'ObjectId' faqat ma'lumot turi sifatida 
 * ishlatilishini bildiradi. Bu NestJS-dagi 'isolatedModules' xatosini (TS1272) tuzatadi.
 */
import type { ObjectId } from 'mongoose'; 

/**
 * =========================================================================================
 * FOLLOW SEARCH INPUT - QIDIRUV KRITERIYALARI
 * =========================================================================================
 * Bu klas obuna bo'lganlar (Following) yoki obuna qilganlar (Followers) ro'yxatini 
 * qidirishda filtr vazifasini bajaradi.
 */
@InputType() // GraphQL-da kiruvchi ma'lumot turi (Input) ekanligini bildiradi
class FollowSearch {
    
    @IsOptional() // Bu maydon bo'lishi shart emas
    @Field(() => String, { nullable: true }) // GraphQL-ga bu maydon String va bo'sh bo'lishi mumkinligini aytadi
    followingId?: ObjectId; // Kimga obuna bo'linganligini qidirish uchun

    @IsOptional()
    @Field(() => String, { nullable: true })
    followerId?: ObjectId; // Kim obuna bo'lganligini qidirish uchun
}

/**
 * =========================================================================================
 * FOLLOW INQUIRY - ASOSIY SO'ROV DTO
 * =========================================================================================
 * Bu klas pagination (sahifalash) va yuqoridagi 'search' filtrini birlashtiradi.
 */
@InputType()
export class FollowInquiry {
    
    @IsNotEmpty() // Bo'sh bo'lishi mumkin emas
    @Min(1) // Minimal qiymat 1 bo'lishi shart (1-sahifadan boshlanadi)
    @Field(() => Int) // GraphQL-ga bu son (Integer) ekanligini aytadi
    page: number;

    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    limit: number; // Har bir sahifada nechta ma'lumot ko'rsatish (masalan: 10 ta)

    @IsNotEmpty()
    @Field(() => FollowSearch) // Yuqoridagi FollowSearch klasini ichma-ich (nested) ishlatamiz
    search: FollowSearch;
}