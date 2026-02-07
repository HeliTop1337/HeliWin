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

  @Post('cases')
  @UseInterceptors(FileInterceptor('icon', {
    storage: diskStorage({
      destination: './uploads/cases',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  createCase(
    @Body() data: any,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    let iconUrl = data.icon || '';
    
    if (file) {
      iconUrl = `/uploads/cases/${file.filename}`;
    }
    
    const createData = {
      name: data.name,
      description: data.description || '',
      price: parseFloat(data.price),
      discount: data.discount ? parseFloat(data.discount) : 0,
      icon: iconUrl,
      isActive: data.isActive === 'true' || data.isActive === true,
    };
    
    return this.adminService.createCase(createData, req.user.id);
  }

  @Patch('cases/:id')
  @UseInterceptors(FileInterceptor('icon', {
    storage: diskStorage({
      destination: './uploads/cases',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  updateCase(
    @Param('id') caseId: string,
    @Body() data: any,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    let iconUrl = data.icon || undefined;
    
    if (file) {
      iconUrl = `/uploads/cases/${file.filename}`;
    }
    
    const updateData: any = {};
    
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price) updateData.price = parseFloat(data.price);
    if (data.discount !== undefined) updateData.discount = parseFloat(data.discount);
    if (iconUrl) updateData.icon = iconUrl;
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive === 'true' || data.isActive === true;
    }
    
    return this.adminService.updateCase(caseId, updateData, req.user.id);
  }

  @Delete('cases/:id')
  deleteCase(@Param('id') caseId: string, @Req() req: any) {
    return this.adminService.deleteCase(caseId, req.user.id);
  }

  @Post('cases/:id/items')
  addItemToCase(
    @Param('id') caseId: string,
    @Body() data: { itemId: string; dropChance: number },
    @Req() req: any,
  ) {
    return this.adminService.addItemToCase(caseId, data.itemId, data.dropChance, req.user.id);
  }

  @Delete('cases/:caseId/items/:itemId')
  removeItemFromCase(
    @Param('caseId') caseId: string,
    @Param('itemId') itemId: string,
    @Req() req: any,
  ) {
    return this.adminService.removeItemFromCase(caseId, itemId, req.user.id);
  }

  @Patch('cases/:caseId/items/:itemId')
  updateCaseItemChance(
    @Param('caseId') caseId: string,
    @Param('itemId') itemId: string,
    @Body() data: { dropChance: number },
    @Req() req: any,
  ) {
    return this.adminService.updateCaseItemChance(caseId, itemId, data.dropChance, req.user.id);
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
