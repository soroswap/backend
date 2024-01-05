import { IsString } from 'class-validator';

export class OptimalRouteRequestBodyDto {
  @IsString()
  tokenIn: string;

  @IsString()
  tokenOut: string;
}
