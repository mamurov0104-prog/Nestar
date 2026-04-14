// enums/register-enums.ts
import { registerEnumType } from "@nestjs/graphql";
import { MemberType, MemberStatus, MemberAuthType } from "./member.enum";

export function registerAllEnums() {
  registerEnumType(MemberType, { name: "MemberType" });
  registerEnumType(MemberStatus, { name: "MemberStatus" });
  registerEnumType(MemberAuthType, { name: "MemberAuthType" });
}