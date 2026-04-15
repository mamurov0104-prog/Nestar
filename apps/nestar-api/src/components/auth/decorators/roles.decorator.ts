import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
//custom decorator (o‘zimiz yaratyapmiz)
//routega role ma’lumotini biriktiradi
//Guard o‘qishi uchun metadata saqlaydi
//routega “qaysi userlar kira oladi” deb belgi qo‘yadi
