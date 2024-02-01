import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
export class AllPoolsRequestBodyDto {
    @IsNotEmpty()
    addresses: string[];
}
export class AllPoolsResponseDto {
    pools: liquidityPool[];
}

export class liquidityPool {
    @IsString()
    token0: string;
    @IsString()
    token1: string;
    @IsString()
    reserve0: string;
    @IsString()
    reserve1: string;
}