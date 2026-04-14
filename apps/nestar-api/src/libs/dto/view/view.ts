import { Field, ObjectType } from "@nestjs/graphql";
import { ViewGroup } from "../../enums/view.enum";
import { Types } from "mongoose";

@ObjectType()
export class View { 
    @Field(() => String)
    _id!: string;

    @Field(() => ViewGroup)
    viewGroup!: string;

    @Field(() => String)
    viewRefId!: Types.ObjectId;

    @Field(() => String)
    memberId!: Types.ObjectId;
    
    @Field(() => Date)
    createdAt!: Date;

    @Field(() => Date)
    updatedAt!: Date;
}