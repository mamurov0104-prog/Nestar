import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports: [
		HttpModule, //boshqa serverlarga request yuborish uchun kerak
		JwtModule.register({
			secret: `${process.env.SECRET_TOKEN}`,
			signOptions: { expiresIn: '30d' },
		}),
	],
	providers: [AuthResolver, AuthService],
	exports: [AuthService],
})
export class AuthModule {}
