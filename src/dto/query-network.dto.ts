import { Network } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class QueryNetworkDto {
  @IsEnum(Network)
  network: Network;

  @IsOptional()
  protocols: string[] = [];
}
