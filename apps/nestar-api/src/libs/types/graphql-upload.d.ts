declare module 'graphql-upload' {
	import { RequestHandler } from 'express';
	import { GraphQLScalarType } from 'graphql';
	import { Readable } from 'stream';

	export const GraphQLUpload: GraphQLScalarType;
	export const graphqlUploadExpress: (options?: {
		maxFileSize?: number;
		maxFiles?: number;
	}) => RequestHandler;

	export interface FileUpload {
		filename: string;
		mimetype: string;
		encoding: string;
		createReadStream: () => Readable;
	}
}
