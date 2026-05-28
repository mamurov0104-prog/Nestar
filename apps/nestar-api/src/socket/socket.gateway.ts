/**
 * SocketGateway — loyiha ichidagi oddiy real-time chat/info kanali.
 *
 * Gateway vazifasi:
 * 1) yangi ulanishni qabul qilish va tokendan userni aniqlash;
 * 2) ulanish/uzilish bo'lganda barchaga "info" event yuborish;
 * 3) "message" event kelganda xabarni saqlab, online clientlarga emit qilish;
 * 4) yangi ulanayotgan clientga oxirgi xabarlar tarixini yuborish.
 *
 * Hozirgi dizayn:
 * - in-memory (`messageList`) saqlash: server restart bo'lsa tarix yo'qoladi;
 * - auth ixtiyoriy: token bo'lmasa ham `Guest` sifatida ulanadi;
 * - ws transport (`@nestjs/platform-ws`) ishlatilgan.
 */
import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import * as WebSocket from 'ws';
import { AuthService } from '../components/auth/auth.service';
import { Member } from '../libs/dto/member/member';
import * as url from 'url';

interface MessagePayload {
	// frontenda event type bo'yicha handler tanlash uchun
	event: string;
	// foydalanuvchi yuborgan text
	text: string;
	// yuboruvchi user ma'lumoti (token tasdiqlansa), aks holda null
	memberData: Member | null;
}

interface InfoPayload {
	// "info" event — system/status update
	event: string;
	// hozir online clientlar soni
	totalClients: number;
	// actionni qilgan member (joined/left), guest bo'lishi mumkin
	memberData: Member | null;
	// joined | left
	action: string;
}

@WebSocketGateway({ transports: ['websocket'], secure: false })
//TCP connection qaysi transports ni qo'llashi, va secure bo''lishini talab etmaymiz
export class SocketGateway implements OnGatewayInit {
	// Nest logger: terminalda gateway eventlarni kuzatish uchun
	private logger: Logger = new Logger('SocketEventsGateway');
	// online websocket ulanishlar soni
	private summaryClient: number = 0;
	// har bir socket clientga mos auth member ma'lumotini saqlaydi
	private clientsAuthMap = new Map<WebSocket, Member | null>();
	// oxirgi yuborilgan xabarlar (in-memory cache)
	private messageList: MessagePayload[] = [];

	constructor(private readonly authService: AuthService) {}

	@WebSocketServer()
	// Nest tomonidan real ws server instance inject qilinadi
	server: Server;

	public afterInit(server: Server) {
		// afterInit methodini chaqirib oldik, type Server bo'ladi
		this.logger.verbose(`WebSocket Server Initialized & total [${this.summaryClient}]`);
	}

	private async retrieveAuth(req: any): Promise<Member | null> {
		try {
			/**
			 * Client websocket handshake URL ichida token yuboradi:
			 * ws://host:port?token=...
			 * shu tokenni olib AuthService orqali verify qilamiz.
			 */
			const parseUrl = url.parse(req.url, true);
			const { token } = parseUrl.query;
			return await this.authService.verifyToken(token as string);
		} catch (err) {
			// token xato/yoki yo'q bo'lsa ham connection yiqilmaydi (Guest rejim)
			return null;
		}
	}

	public async handleConnection(client: WebSocket, req: any) {
		// WebSocketga yangi clientlar ulangan vaqti ushbu method ishga tushadi
		const authMember = await this.retrieveAuth(req);
		this.summaryClient++; // birinchi ulangan vaqti clientlar soni 1 ga oshishi kerak
		// keyinchalik message eventda shu clientning kimligini topish uchun mapga yozamiz
		this.clientsAuthMap.set(client, authMember);

		const clientNick: string = authMember?.memberNick ?? 'Guest';
		this.logger.verbose(`Connection [${clientNick}] & total: [${this.summaryClient}]`);

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
			memberData: authMember,
			action: 'joined',
		};
		// joined eventni barchaga yuboramiz (shu clientning o'ziga ham)
		this.emitMessage(infoMsg);
		// yangi clientga joriy chat history yuboriladi
		client.send(JSON.stringify({ event: 'getMessages', list: this.messageList }));
	}

	public handleDisconnect(client: WebSocket) {
		// WebSocketga ulanagan clientlar browserdan chiqib ketganda, connection yo'qolganda bu method ishga tushadi
		const authMember = this.clientsAuthMap.get(client) as Member | null;
		// disconnect bo'lganda sonni kamaytirish va mapdan tozalash
		if (this.summaryClient > 0) this.summaryClient--;
		this.clientsAuthMap.delete(client);

		const clientNick: string = authMember?.memberNick ?? 'Guest';
		this.logger.verbose(`Disconnection [${clientNick}] & total: [${this.summaryClient}]`);

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
			memberData: authMember,
			action: 'left',
		};
		// left eventni qolgan clientlarga yuboramiz (chiqib ketgan clientga emas)
		this.broadcastMessage(client, infoMsg);
	}

	@SubscribeMessage('message')
	public async handleMessage(client: WebSocket, payload: string | Record<string, unknown>): Promise<void> {
		const text = this.extractMessageText(payload);
		if (!text.trim()) return;

		// xabar yuborgan clientga bog'langan memberni mapdan olamiz
		const authMember = this.clientsAuthMap.get(client) as Member | null;
		const newMessage: MessagePayload = { event: 'message', text, memberData: authMember };

		const clientNick: string = authMember?.memberNick ?? 'Guest';
		this.logger.verbose(`NEW MESSAGE [${clientNick}]: ${text}`);

		this.messageList.push(newMessage);
		// xotirani cheklash: faqat oxirgi 5 ta xabarni qoldiramiz
		if (this.messageList.length > 5) this.messageList.splice(0, this.messageList.length - 5);

		// yangi xabarni barchaga emit qilamiz
		this.emitMessage(newMessage);
	}

	private broadcastMessage(sender: WebSocket, message: InfoPayload | MessagePayload) {
		// senderdan tashqari barcha OPEN clientlarga yuborish
		this.server.clients.forEach((client) => {
			if (client !== sender && client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}

	private extractMessageText(payload: string | Record<string, unknown>): string {
		if (typeof payload === 'string') {
			try {
				const parsed = JSON.parse(payload) as Record<string, unknown>;
				if (typeof parsed?.data === 'string') return parsed.data;
				if (typeof parsed?.text === 'string') return parsed.text;
			} catch {
				return payload;
			}
			return payload;
		}

		if (payload && typeof payload === 'object') {
			if (typeof payload.data === 'string') return payload.data;
			if (typeof payload.text === 'string') return payload.text;
		}

		return '';
	}

	private emitMessage(message: InfoPayload | MessagePayload) {
		// barcha OPEN clientlarga yuborish (sender ham ichida)
		this.server.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}
}

/*
MESSAGE TARGETS:
1. Client (only client)
2. Broadcast (except client)
3. Emit (all clients)
*/
