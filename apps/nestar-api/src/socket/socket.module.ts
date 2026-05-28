/**
 * SocketModule — WebSocket chat/informatsiya qatlamining modul konfiguratsiyasi.
 *
 * Nima uchun alohida modul:
 * - real-time gateway (`SocketGateway`) ni AppModule dan ajratib, tartibli arxitektura saqlanadi;
 * - gateway ichida token tekshirish kerak bo'lgani uchun `AuthModule` import qilinadi.
 *
 * Muhim:
 * - `providers` ichida `SocketGateway` ro'yxatga olinmasa, Nest bu gateway lifecycle methodlarini
 *   (`afterInit`, `handleConnection`, `handleDisconnect`) ishga tushirmaydi.
 */
import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { AuthModule } from '../components/auth/auth.module';

@Module({
	// Gateway ichida `AuthService` ishlatilgani sababli AuthModule import qilinadi.
	imports: [AuthModule],
	// WebSocket event handlerlar shu provider orqali ro'yxatdan o'tadi.
	providers: [SocketGateway],
})
export class SocketModule {}
