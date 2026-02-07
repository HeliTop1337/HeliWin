import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getStats(@Req() req: any) {
    return this.usersService.getStats(req.user.id);
  }

  @Get(':id')
  getUserProfile(@Param('id') id: string) {
    return this.usersService.getProfile(id);
  }

  @Get(':id/stats')
  getUserStats(@Param('id') id: string) {
    return this.usersService.getStats(id);
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  updateAvatar(@Req() req: any, @Body('avatarUrl') avatarUrl: string) {
    return this.usersService.updateAvatar(req.user.id, avatarUrl);
  }

  @Post('avatar/delete')
  @UseGuards(JwtAuthGuard)
  deleteAvatar(@Req() req: any) {
    return this.usersService.deleteAvatar(req.user.id);
  }
}
