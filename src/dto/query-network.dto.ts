import { ApiProperty } from '@nestjs/swagger';
import { Network } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

export class QueryNetworkDto {
  @IsEnum(Network)
  @ApiProperty({ enum: Network, default: Network.MAINNET })
  network: Network;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((protocol) => protocol.trim());
    } else if (Array.isArray(value)) {
      return value.map((protocol) => protocol.trim());
    }
    return [];
  })
  protocols: string[] = [];
}
