import { registerEnumType } from "@nestjs/graphql";

export enum MemberType {
    USER = 'USER',
    AGENT = 'AGENT',
    ADMIN = 'ADMIN',
}
registerEnumType(MemberType, {
    name: "MemberType",
})

export enum MemberStatus {
    ACTIVE = 'ACTIVE',
    DELETE = 'DELETE',
    BLOCK = 'BLOCK',
}
registerEnumType(MemberStatus, {
    name: "MemberStatus",
})

export enum MemberAuthType {
    PHONE = 'PHONE',
    EMAIL = 'EMAIL',
    TELEGRAM = 'TELEGRAM',
}
registerEnumType(MemberAuthType, {
    name: "MemberAuthType",
})


/**
 * 
 function registerEnums(enums: any[]) {
  enums.forEach((e) => {
    registerEnumType(e.enum, { name: e.name });
  });
}
  registerEnums([
  { enum: MemberType, name: "MemberType" },
  { enum: MemberStatus, name: "MemberStatus" },
  { enum: MemberAuthType, name: "MemberAuthType" },
]);
 */