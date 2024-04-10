import { ApiProperty } from '@nestjs/swagger';
import { Network } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { Protocols } from 'src/config/supportedProtocols';

export class QueryNetworkDto {
  @IsEnum(Network)
  @ApiProperty({ enum: Network, default: Network.MAINNET })
  network: Network;

  @IsOptional()
  @IsEnum(Protocols, { each: true })
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
  protocols: Protocols[] = [];
}
