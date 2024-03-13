import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class subscribeToLedgerEntriesDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  contractId: string[];
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  keyXdr: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  durability: string;
  @ApiProperty()
  @IsOptional()
  hydrate?: boolean;
}
export class UpdateAdminDto extends PartialType(subscribeToLedgerEntriesDto) {}
