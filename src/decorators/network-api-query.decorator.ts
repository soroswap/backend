import { ApiQuery } from '@nestjs/swagger';
import { Network } from '@prisma/client';

export function NetworkApiQuery() {
  return ApiQuery({
    name: 'network',
    required: true,
    description: 'Network to use.',
    enum: Network,
  });
}
