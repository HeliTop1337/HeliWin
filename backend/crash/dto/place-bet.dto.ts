import { IsNumber, IsString, IsEnum, IsOptional, Min } from 'class-validator';

export class PlaceBetDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsEnum(['balance', 'item'])
  type: 'balance' | 'item';

  @IsNumber()
  @Min(1.01)
  autoCashout: number;

  @IsOptional()
  @IsString()
  itemId?: string;
}
