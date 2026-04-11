import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalInterceptors(new LoggingInterceptor());
	app.useGlobalPipes(new ValidationPipe());
	await app.listen(process.env.PORT_API ?? 3000);
}
bootstrap();

//PIPES => Validate & Transform
//resolverga borgunga qadar ma'lumotlar to'g'ri tashkillashtirilganmi tekshirib beradi

//Validatiton 4 xil bo'ladi
//1- Frontend'da => HTML & Frontend JS orqali qilish mumkin
//2- Pipe validation => backenda Api lariga kirishdan oldin tekshiradi
//3- Backend validation =>  (user kiritgan password bilan databasedagi passwordni solishtirish)
//4- Schema validation =>  (xato ma'lumotni databasega kirishdan saqlaydi)

// Pipe nima qiladi?
// 1) Validation (tekshiradi)
// to‘g‘rimi?
// bo‘shmi?
// type mosmi?

// 2) Transformation (o‘zgartiradi)
// string → number
// string → boolean
// JSON → object

//Pipelarni 3 xil integratsiya qilish mumkin
//1-Global Pipe (butun app uchun) => Barcha request’larda ishlaydi

//Qayerda yoziladi?
// main.ts da
// app.useGlobalPipes(new ValidationPipe());

// Nima bo‘ladi?
// Har bir API request avtomatik tekshiriladi
// DTO validation hammasiga ishlaydi

// 2. Controller-level Pipe
// Faqat bitta controller uchun ishlaydi

// Qayerda yoziladi?
// @UsePipes(new ValidationPipe())
// @Controller('users')
// export class UsersController {}

// Faqat UsersController ichidagi endpointlarda ishlaydi
// Boshqa controllerlarga ta’sir qilmaydi

//3. Route (Method / Param) Pipe

// Eng kichik scope
// Bitta endpoint yoki param uchun

// Method level:
// @Post()
// @UsePipes(new ValidationPipe())
// createUser(@Body() dto: CreateUserDto) {}
//-------------------------------------------------------------------

// Param level (eng ko‘p ishlatiladi 🔥):
// @Get(':id')
// getUser(@Param('id', ParseIntPipe) id: number) {}
