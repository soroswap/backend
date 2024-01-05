import { ApiQuery } from '@nestjs/swagger';
import { Network } from '../types';

export function NetworkApiQuery() {
  return ApiQuery({
    name: 'network',
    required: false,
    description: 'Network to use, defaults to testnet',
    enum: Network,
  });
}
