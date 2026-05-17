declare module 'graphql-upload' {
  import { ReadStream } from 'fs';

  export interface FileUpload {
    filename: string;
    mimetype: string;
    encoding: string;
    createReadStream: () => ReadStream;
  }

  export class GraphQLUpload {
    static parseValue(value: unknown): Promise<FileUpload>;
  }

  export class FileUpload {}
}
