import { ObjectId } from 'bson';

export const availableAgentSorts = ['createdAt', 'updateAt', 'memberLikes', 'memberViews', 'memberRank'];
export const availableMembertSorts = ['createdAt', 'updateAt', 'memberLikes', 'memberViews'];
export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target;
};