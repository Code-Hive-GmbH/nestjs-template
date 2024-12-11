import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { BcryptService } from '@utils/auth/bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EntityManager } from '@mikro-orm/core';
import { User } from '@api/users/entities/user.entity';
import { omit } from 'lodash';
import { Org } from '@api/org/entities/org.entity';
import { PasswordReset } from '@utils/auth/entities/password-reset.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly em: EntityManager,
    private readonly bcryptService: BcryptService,
  ) {}

  async create(data: CreateUserDto) {
    // For now, create a personal org for each user
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new HttpException(
        `Error: A user with email ${data.email} already exists`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    // Create personal organization for user
    const readableName = data.name || data.username || data.email;
    const org = new Org();
    await this.em.assign(org, {
      name: `${readableName}'s Personal Organization`,
      domain: `${readableName}.personal`,
    });
    await this.em.persist(org);

    const passwordHash = await this.bcryptService.hash(data.password);
    const refreshTokenHash = !!data.refreshToken
      ? await this.bcryptService.hash(data.refreshToken)
      : null;
    const user = new User();
    await this.em.assign(user, {
      ...omit(data, ['password', 'refreshToken']),
      passwordHash,
      refreshToken: refreshTokenHash,
      organization: org,
    });

    await this.em.persistAndFlush(user);
  }

  async findOne(id: string) {
    return this.em.findOne(User, id, {
      populate: ['organization'],
    });
  }

  async findUser(id: string) {
    return this.prismaService.user.findUnique({
      where: { id: id },
    });
  }

  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email: email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const passwordHash = updateUserDto.password
      ? await this.bcryptService.hash(updateUserDto.password)
      : null;

    delete updateUserDto.password;
    const data: Prisma.UserUpdateInput = {
      ...updateUserDto,
    };
    if (passwordHash) {
      data.passwordHash = passwordHash;
    }
    const existingUser = this.em.findOneOrFail(User, id);

    this.em.assign(existingUser, {
      ...omit(updateUserDto, ['password']),
      passwordHash,
    });
    await this.em.flush();

    return this.em.refresh(existingUser);
  }

  async remove(id: string) {
    return this.em.removeAndFlush(await this.em.findOneOrFail(User, id));
  }

  async deleteAllPAsswordResetsByUserId(userId: string) {
    this.em.removeAndFlush(await this.em.find(PasswordReset, { user: userId }));
  }

  async createPasswordReset(userId: string, token: string) {
    return this.prismaService.passwordReset.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        token: token,
      },
    });
  }

  async findPasswordReset(userId: string, token: string) {
    return this.prismaService.passwordReset.findUnique({
      where: { token: token, userId: userId },
    });
  }

  async deletePasswordResetsOlderThan(date: Date) {
    return this.prismaService.passwordReset.deleteMany({
      where: {
        createdAt: {
          lt: date,
        },
      },
    });
  }

  async deletePasswordReset(id: string) {
    return this.prismaService.passwordReset.delete({
      where: { id: id },
    });
  }
}
