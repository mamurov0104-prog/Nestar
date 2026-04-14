import { registerEnumType } from "@nestjs/graphql";

export enum Message {
  SOMETHING_WENT_WRONG = 'Nimadir xato ketdi!',
  NO_DATA_FOUND = 'Malumot topilmadi!',
  CREATE_FAILED = 'Yaratishda xatolik yuz berdi!',
  UPDATE_FAILED = 'Yangilashda xatolik yuz berdi!',
  REMOVE_FAILED = 'Ochirishda xatolik yuz berdi!',
  UPLOAD_FAILED = 'Yuklashda xatolik yuz berdi!',
  BAD_REQUEST = 'Notogri sorov!',

  
  USED_MEMBER_NICK_OR_PHONE = 'Already used member nick or phone',
  NO_MEMBER_NICK = 'Bunday nicknamega ega foydalanuvchi topilmadi!',
  BLOCKED_USER = 'Siz bloklangansiz!',
  WRONG_PASSWORD = 'Parol notogri, qayta urinib koring!',
  NOT_AUTHENTICATED = 'Siz tizimga kirmagansiz, iltimos login qiling!',
  TOKEN_NOT_EXIST = 'Bearer token taqdim etilmagan!',
  ONLY_SPECIFIC_ROLES_ALLOWED = 'Faqat malum rollarga ruxsat berilgan!',
  NOT_ALLOWED_REQUEST = 'Bu sorovga ruxsat yoq!',
  PROVIDE_ALLOWED_FORMAT = 'Iltimos, jpg, jpeg yoki png formatdagi rasm yuboring!',
  SELF_SUBSCRIPTION_DENIED = 'Ozingizga obuna bolish mumkin emas!',
}

export enum Direction {
	ASC = 1,
	DESC = -1,
}

registerEnumType(Direction, {
	name: 'Direction',
});