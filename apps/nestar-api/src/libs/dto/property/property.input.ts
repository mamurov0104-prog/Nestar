import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';

import { PropertyLocation, PropertyStatus, PropertyType } from '../../enums/property.enum';
import { ObjectId } from 'mongoose';
import { Direction } from '../../enums/common.enum';
import { availablePropertySort } from '../../config';

@InputType()
export class PropertyInput {
	@IsNotEmpty()
	@Field(() => PropertyType)
	propertyType?: PropertyType;

	@IsNotEmpty()
	@Field(() => PropertyLocation)
	propertyLocation?: PropertyLocation;

	@IsNotEmpty()
	@Field(() => String)
	propertyAddress?: string;

	@IsNotEmpty()
	@Field(() => String)
	propertyTitle?: string;

	@IsNotEmpty()
	@Field(() => Number)
	propertyPrice?: number;

	@IsNotEmpty()
	@IsInt()
	@Min(1)
	@Field(() => Number)
	propertySquare?: number;

	@IsNotEmpty()
	@IsInt()
	@Min(1)
	@Field(() => Number)
	propertyBeds?: number;

	@IsNotEmpty()
	@IsInt()
	@Min(1)
	@Field(() => Number)
	propertyRooms?: number;

	@IsNotEmpty()
	@Field(() => [String])
	propertyImages?: string[];

	@IsOptional()
	@Length(5, 500)
	@Field(() => String, { nullable: true })
	propertyDesc?: string;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	propertyBarter?: boolean;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	propertyRent?: boolean;

	memberId?: ObjectId;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	constructedAt?: Date;
}

@InputType()
class APISearch {
	@IsOptional()
	@Field(() => PropertyStatus, { nullable: true })
	propertyStatus?: PropertyStatus;
}

@InputType()
export class AgentPropertiesInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page?: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit?: number;

	@IsOptional()
	@IsIn(availablePropertySort)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => APISearch)
	search?: APISearch;
}

@InputType()
class ALPISearch {
    @IsOptional()
    @Field(() => PropertyStatus, { nullable: true })
    propertyStatus?: PropertyStatus;

    @IsOptional()
    @Field(() => [PropertyLocation], { nullable: true })
    propertyLocationList?: PropertyLocation[];
}

@InputType()
export class AllPropertiesInquiry {
    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    page?: number;

    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    limit?: number;

    @IsOptional()
    @IsIn(availablePropertySort)
    @Field(() => String, { nullable: true })
    sort?: string;

    @IsOptional()
    @Field(() => Direction, { nullable: true })
    direction?: Direction;

    @IsNotEmpty()
    @Field(() => ALPISearch)
    search?: ALPISearch;
}

@InputType()
export class OrdinaryInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page?: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit?: number;
}