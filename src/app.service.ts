import { Injectable } from '@nestjs/common';
import { OptimalRouteRequestBodyDto, OptimalRouteResponseDto } from './dto';
import { Network } from './types';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHello(): Promise<{ message: string }> {
    const hello = await this.prisma.hello.findUnique({
      where: {
        id: 'hello',
      },
    });
    return { message: hello?.name };
  }

  getOptimalRoute(
    network: Network,
    body: OptimalRouteRequestBodyDto,
  ): OptimalRouteResponseDto {
    const { tokenIn, tokenOut } = body;
    return {
      tokenIn,
      tokenOut,
      path: [
        'token_a_address',
        'token_b_address',
        'token_c_address',
        'token_d_address',
        'token_f_address',
      ],
    };
  }

  getAssetInfo(): { message: string } {
    return { message: 'Hello World!' };
  }

  getLastTrades(): { message: string } {
    return { message: 'Hello World!' };
  }

  getInfo(): { message: string } {
    return { message: 'Hello World!' };
  }

}
