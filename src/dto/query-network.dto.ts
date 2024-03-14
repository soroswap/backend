import { ApiProperty } from '@nestjs/swagger';
import { Network } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class QueryNetworkDto {
  @IsEnum(Network)
  @ApiProperty({ enum: Network, default: Network.MAINNET })
  network: Network;

  @IsOptional()
  protocols: string[] = [];
}
