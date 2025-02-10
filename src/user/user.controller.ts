import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/authGuard/auth.guard';

@Controller('user')
export class UserController {
    // constructor(private AuthGuard: AuthGuard) {}

  @Get('he')
  he() {
    return "This is he";
  }


  @UseGuards(AuthGuard)
  @Get('me')
  me() {
    // console.log(dto);
    return 'This is me';
  }
}
