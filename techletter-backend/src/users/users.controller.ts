import { Controller, Get, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req: any) {
    return req.user;
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@Request() req: any, @Body() body: { nickname?: string }) {
    return this.usersService.updateUser(req.user.id, body);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }
}