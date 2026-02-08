import { IsArray, ArrayMinSize, ArrayMaxSize, IsString } from 'class-validator';

export class CreateContractDto {
  @IsArray()
  @ArrayMinSize(3, { message: 'Необходимо минимум 3 предмета' })
  @ArrayMaxSize(10, { message: 'Максимум 10 предметов' })
  @IsString({ each: true })
  itemIds: string[];
}
