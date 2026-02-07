import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  getAllUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getAllUsers(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50
    );
  }

  @Post('users/:id/balance')
  updateUserBalance(
    @Param('id') userId: string,
    @Body('amount') amount: number,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    return this.adminService.adjustBalance(userId, amount, reason || 'Корректировка администратором', req.user.id);
  }

  @Post('users/:id/ban')
  banUser(
    @Param('id') userId: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    return this.adminService.banUser(userId, reason, req.user.id);
  }

  @Post('users/:id/unban')
  unbanUser(@Param('id') userId: string, @Req() req: any) {
    return this.adminService.unbanUser(userId, req.user.id);
  }

  @Get('items')
  getAllItems() {
    return this.adminService.getAllItems();
  }

  @Post('items')
  @UseInterceptors(FileInterceptor('icon', {
    storage: diskStorage({
      destination: './uploads/items',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  createItem(
    @Body() data: any,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    let iconUrl = data.icon || '';
    
    // If file was uploaded, use the uploaded file path
    if (file) {
      iconUrl = `/uploads/items/${file.filename}`;
    }
    
    const createData = {
      name: data.name,
      category: data.category,
      rarity: data.rarity,
      basePrice: parseFloat(data.basePrice),
      icon: iconUrl,
    };
    return this.adminService.createItem(createData, req.user.id);
  }

  @Patch('items/:id')
  @UseInterceptors(FileInterceptor('icon', {
    storage: diskStorage({
      destination: './uploads/items',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  updateItem(
    @Param('id') itemId: string,
    @Body() data: any,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    let iconUrl = data.icon || undefined;
    
    // If file was uploaded, use the uploaded file path
    if (file) {
      iconUrl = `/uploads/items/${file.filename}`;
    }
    
    const updateData = {
      name: data.name,
      category: data.category,
      rarity: data.rarity,
      basePrice: data.basePrice ? parseFloat(data.basePrice) : undefined,
      icon: iconUrl,
    };
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );
    
    return this.adminService.updateItem(itemId, updateData, req.user.id);
  }

  @Delete('items/:id')
  deleteItem(@Param('id') itemId: string, @Req() req: any) {
    return this.adminService.deleteItem(itemId, req.user.id);
  }

  @Get('cases')
  getAllCases() {
    return this.adminService.getAllCases();
  }

  @Patch('cases/:id')
  updateCase(
    @Param('id') caseId: string,
    @Body() updateData: any,
    @Req() req: any,
  ) {
    return this.adminService.updateCase(caseId, updateData, req.user.id);
  }

  @Get('promo-codes')
  getAllPromoCodes() {
    return this.adminService.getAllPromoCodes();
  }

  @Post('promo-codes')
  createPromoCode(@Body() data: any, @Req() req: any) {
    return this.adminService.createPromoCode(data, req.user.id);
  }

  @Delete('promo-codes/:id')
  deletePromoCode(@Param('id') id: string, @Req() req: any) {
    return this.adminService.deletePromoCode(id, req.user.id);
  }

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('logs')
  getLogs(@Query('limit') limit?: string) {
    return this.adminService.getLogs(limit ? parseInt(limit) : 100);
  }
}
