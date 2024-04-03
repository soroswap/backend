import { IsString } from 'class-validator';
export class fetchPathsDto {
    @IsString()
    contractId0: string;

    @IsString()
    contractId1: string;
}