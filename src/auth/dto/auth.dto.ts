import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  password: string;
}

export interface UserJwt {
  userId: number;
  username: string;
}
