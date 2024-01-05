import { IsEnum, IsOptional } from 'class-validator';
import { Network } from '../types';

export class QueryNetworkDto {
  @IsOptional()
  @IsEnum(Network)
  network: Network = Network.Testnet;
}
