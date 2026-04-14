import { ObjectId } from 'bson';
export const shapeIntoMongoObjectId = (target: string) => {
	return typeof target === 'string' ? new ObjectId(target) : target;
};
