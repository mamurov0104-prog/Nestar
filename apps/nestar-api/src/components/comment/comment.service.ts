import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// MUHIM: isolatedModules xatosi uchun 'import type' ishlatamiz
import type { ObjectId } from 'mongoose';
import { CommentInput, CommentsInquiry } from '../../libs/dto/comment/comment.input';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { BoardArticleService } from '../board-article/board-article.service';
import { MemberService } from '../member/member.service';
import { PropertyService } from '../property/property.service';
import { Comment, Comments } from '../../libs/dto/comment/comment';
import { lookupMember } from '../../libs/config';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';
import { T } from '../../libs/types/common';

@Injectable()
export class CommentService {
    constructor(
        @InjectModel('Comment') private readonly commentModel: Model<Comment>,
        private readonly memberService: MemberService,
        private readonly propertyService: PropertyService,
        private readonly boardArticleService: BoardArticleService,
    ) {}

    public async createComment(memberId: ObjectId, input: CommentInput): Promise<Comment> {
        input.memberId = memberId;
        let result: Comment;
        try {
            result = await this.commentModel.create(input);
        } catch (error) {
            console.log('Error creating comment:', error);
            throw new BadRequestException(Message.CREATE_FAILED);
        }

        switch (input.commentGroup) {
            case CommentGroup.PROPERTY:
                await this.propertyService.propertyStatsEditor({
                    _id: input.commentRefId as any, // TS2740 xatosini bartaraf qilish uchun
                    targetKey: 'propertyComments',
                    modifier: 1,
                });
                break;

            case CommentGroup.ARTICLE:
                await this.boardArticleService.boardArticleStatsEditor({
                    _id: input.commentRefId as any,
                    targetKey: 'articleComments',
                    modifier: 1,
                });
                break;

            case CommentGroup.MEMBER:
                await this.memberService.memberStatsEditor({
                    _id: input.commentRefId as any,
                    targetKey: 'memberComments',
                    modifier: 1,
                });
                break;
        }

        if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);
        return result;
    }

    public async updateComment(memberId: ObjectId, input: CommentUpdate): Promise<Comment> {
        const { _id } = input;

        const result = await this.commentModel.findOneAndUpdate(
            {
                _id: _id,
                memberId: memberId,
                commentStatus: CommentStatus.ACTIVE,
            },
            input,
            {
                new: true,
            },
        ).exec(); // exec() qo'shildi yaxshiroq promise handling uchun

        if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
        return result;
    }

    public async getComments(memberId: ObjectId, input: CommentsInquiry): Promise<Comments> {
        const { commentRefId } = input.search;

        const match: T = { commentRefId: commentRefId, commentStatus: CommentStatus.ACTIVE };
        const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

        const result: Comments[] = await this.commentModel.aggregate([
            { $match: match },
            { $sort: sort },
            {
                $facet: {
                    list: [
                        { $skip: (input.page - 1) * input.limit },
                        { $limit: input.limit },
                        // meLiked qismi kelajakda shu yerga qo'shiladi
                        lookupMember,
                        { $unwind: '$memberData' },
                    ],
                    metaCounter: [{ $count: 'total' }],
                },
            },
        ]).exec();

        if (!result.length || !result[0].list.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        return result[0];
    }

    /** ADMIN */
    public async removeCommentByAdmin(input: ObjectId): Promise<Comment> {
        const result = await this.commentModel.findByIdAndDelete(input).exec();
        if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
        return result;
    }
}