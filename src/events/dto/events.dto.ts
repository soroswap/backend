import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export enum RouterTopic2 {
  init = 'AAAADwAAAARpbml0',
  swap = 'AAAADwAAAARzd2Fw',
  add = 'AAAADwAAAANhZGQA',
  remove = 'AAAADwAAAAZyZW1vdmUAAA==',
}

export class getRouterEventsDto {
  @ApiProperty({ enum: RouterTopic2 })
  @IsOptional()
  @Transform(({ value }) => RouterTopic2[value] || value)
  @IsEnum(RouterTopic2)
  topic2: RouterTopic2;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  first: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  last: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  offset: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  before: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  after: string;
}
