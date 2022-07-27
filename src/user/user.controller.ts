import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UserJwtDecorator } from '../auth/decorator';
import { JwtAuthGuard } from '../auth/strategy/jwt/jwt-auth.guard';
import { EditUser } from './dto/edit-user';
import { UserService } from './user.service';

@UseGuards(JwtAuthGuard)
@Controller('api/user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('profile')
  profile(@UserJwtDecorator('userId') userId: number) {
    return this.userService.getUserById(userId);
  }

  @Patch('edit')
  edit(@UserJwtDecorator('userId') userId: number, @Body() dto: EditUser) {
    return this.userService.editUserById(userId, dto);
  }
}
