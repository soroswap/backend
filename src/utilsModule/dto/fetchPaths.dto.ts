import { IsDefined, IsNumber, IsString } from 'class-validator';

class token {
    
    @IsString()
    name: string;
    @IsString()
    @IsDefined()
    contract: string;
    @IsString()
    code: string;
    @IsNumber()
    decimals: number;
    
}
export class fetchPathsDto {
    
    @IsDefined()
    asset0: token;

    @IsDefined()
    asset1: token;
}