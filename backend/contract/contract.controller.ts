import { Controller, Post, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { ContractService } from './contract.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateContractDto } from './dto/create-contract.dto';

@Controller('contract')
@UseGuards(JwtAuthGuard)
export class ContractController {
  constructor(private contractService: ContractService) {}

  @Post('create')
  async createContract(@Body() dto: CreateContractDto, @Req() req: any) {
    console.log('=== CONTRACT CREATE REQUEST ===');
    console.log('Full DTO:', JSON.stringify(dto));
    console.log('itemIds:', dto.itemIds);
    console.log('User ID:', req.user?.id);
    console.log('User object:', req.user);
    
    console.log('Calling service with:', req.user.id, dto.itemIds);
    
    try {
      const result = await this.contractService.createContract(req.user.id, dto.itemIds);
      console.log('Contract created successfully:', result);
      return result;
    } catch (error) {
      console.error('Contract creation error:', error);
      throw error;
    }
  }
}
