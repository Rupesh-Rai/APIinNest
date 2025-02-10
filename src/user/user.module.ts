import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { AuthGuard } from 'src/auth/authGuard/auth.guard';
import { JwtModule } from "@nestjs/jwt";


@Module({
  imports: [JwtModule.register({})],
  controllers: [UserController]
})
export class UserModule {}
