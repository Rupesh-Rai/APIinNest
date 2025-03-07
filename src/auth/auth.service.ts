import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService, 
    private config: ConfigService, 
    private jwt: JwtService) {}

  //Signup Function
  async signup(dto: AuthDto) {
    //Generate the password
    const hash = await argon.hash(dto.password);
    console.log(hash);
    console.log(dto.password);

    try {
      //Save the new user in the database
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      //return the saved user
      return this.signToken(user.id, user.email);

    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email is taken');
        }
      }
    }
  }

  //Signin Function
  async signin(dto: AuthDto) {
    //find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    //if user does not exit throw exception
    if (!user) throw new ForbiddenException('User not exist');
    //compare password
    const pwMatches =  await argon.verify(user.hash, dto.password)
    // password did not match
    //if password is incorrect throw exception
    if(!pwMatches) throw new ForbiddenException('Incorrect Password');

    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ) : Promise<{access_token: string}> {
    const payload = {
      sub: userId,
      email,
    }
    const secret = this.config.get('JWT_SECRET')

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '30m',
      secret: secret,
    });

    return {
      access_token: token,
    }
  };
}
