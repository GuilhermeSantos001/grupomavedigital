import {
  HttpException,
  HttpStatus,
  Controller,
  UseGuards,
  UsePipes,
  Get,
  Post,
  Body,
  Req,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { Request } from 'express';

import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { queuePool } from '@/core/bull/bull-board-queue';

import EmailNameJob from '@/users/constants/email-name-job.constant';
import AccountActivateProcess from '@/users/jobs/constants/email/account-activate-process.constant';
import { AccountActivateType } from '@/users/jobs/types/email/account-activate.type';
import { AccountActivateOptions } from '@/users/jobs/configs/email/account-activate.config';

import { RolesGuard } from '@/users/guards/roles.guard';
// import { Roles } from '@/customers/guards/roles.decorator';

import { TokenGuard } from '@/users/guards/token.guard';
// import { Token } from '@/customers/guards/token.decorator';

import { JoiValidationPipe } from '@/core/pipes/joi-validation.pipe';

import { CoreService } from '@/core/core.service';
import { HttpService } from '@nestjs/axios';

import { UsersService } from '@/users/users.service';

import { CreateUserDto } from '@/users/dto/create-users.dto';
import { CreateUserSchema } from '@/users/dto/schemas/create-users-joi.schema';
import { ActivateUserDto } from '@/users/dto/activate-users.dto';
import { ActivateUserSchema } from '@/users/dto/schemas/activate-users-joi.schema';
import { LoginUserDto } from '@/users/dto/login-users.dto';
import { LoginUserSchema } from '@/users/dto/schemas/login-users-joi.schema';
import { SessionValidateUserDto } from '@/users/dto/session-validate-users.dto';
import { SessionValidateUserSchema } from '@/users/dto/schemas/session-validate-users-joi.schema';
import { LogoutUserDto } from '@/users/dto/logout-users.dto';
import { LogoutUserSchema } from '@/users/dto/schemas/logout-users-joi.schema';
import { UpdateUserDto } from '@/users/dto/update-users.dto';
import { UpdateUserSchema } from '@/users/dto/schemas/update-users-joi.schema';

import { UsersParser } from '@/users/parsers/users.parser';

import { JsonWebToken } from '@/core/libs/jwt.lib';

@Controller('api/users')
@UseGuards(RolesGuard, TokenGuard)
export class CustomersController {
  constructor(
    @InjectQueue(EmailNameJob)
    private readonly emailQueue: Queue<AccountActivateType>,
    private readonly coreService: CoreService,
    private readonly httpService: HttpService,
    private readonly usersService: UsersService,
    private readonly usersParser: UsersParser,
  ) {
    queuePool.add(emailQueue);
  }

  @Post()
  @UsePipes(new JoiValidationPipe(CreateUserSchema))
  async create(@Body() data: CreateUserDto) {
    const user = await this.usersService.create(data);

    if (user instanceof Error)
      throw new HttpException(user.message, HttpStatus.FORBIDDEN);

    try {
      const jwt = new JsonWebToken({
        id: user.id,
        username: user.username,
        timestamp: new Date().getTime(),
      });

      await this.emailQueue.add(
        AccountActivateProcess,
        {
          email: data.email,
          username: data.username,
          token: jwt.save(null, `7d`) as string,
          temporarypass: null,
        },
        AccountActivateOptions,
      );

      return this.usersParser.toJSON(user);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }

  @Post('activate')
  @UsePipes(new JoiValidationPipe(ActivateUserSchema))
  async activate(@Body() data: ActivateUserDto) {
    const jwt = new JsonWebToken<{ id: string }>({});
    const token = jwt.load(data.token, null);

    if (token instanceof Error)
      throw new HttpException(
        'Account activation token is invalid. Please try again.',
        HttpStatus.FORBIDDEN,
      );

    const { id } = token as { id: string };

    const user = await this.usersService.activate(id);

    if (user instanceof Error)
      throw new HttpException(user.message, HttpStatus.FORBIDDEN);

    return true;
  }

  @Post('auth/login')
  @UsePipes(new JoiValidationPipe(LoginUserSchema))
  async login(@Body() data: LoginUserDto, @Req() request: Request) {
    const clientGeoIP = await this.coreService.getClientGeoIP(request);

    const user = await this.usersService.login(
      data.email,
      data.password,
      clientGeoIP.device_name,
      {
        ...clientGeoIP,
        token_signature: '',
      },
    );

    if (user instanceof Error)
      throw new HttpException(user.message, HttpStatus.FORBIDDEN);

    return this.usersParser.toJSON(user);
  }

  @Post('auth/validate')
  @UsePipes(new JoiValidationPipe(SessionValidateUserSchema))
  async sessionValidate(
    @Body() data: SessionValidateUserDto,
    @Req() request: Request,
  ) {
    const clientGeoIP = await this.coreService.getClientGeoIP(request);

    const user = await this.usersService.sessionValidate(
      data.id,
      data.token_value,
      data.token_signature,
      data.token_revalidate_value,
      data.token_revalidate_signature,
      clientGeoIP.device_name,
      {
        ...clientGeoIP,
        token_signature: data.token_signature,
      },
    );

    if (user instanceof Error)
      throw new HttpException(user.message, HttpStatus.FORBIDDEN);

    return user;
  }

  @Post('auth/logout')
  @UsePipes(new JoiValidationPipe(LogoutUserSchema))
  async logout(@Body() data: LogoutUserDto) {
    const user = await this.usersService.logout(data.id, data.token_value);

    if (user instanceof Error)
      throw new HttpException(user.message, HttpStatus.FORBIDDEN);

    return true;
  }

  @Get()
  async findAll() {
    return (await this.usersService.findAll()).map((user) =>
      this.usersParser.toJSON(user),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);

    if (user instanceof Error)
      throw new HttpException(user.message, HttpStatus.FORBIDDEN);

    return this.usersParser.toJSON(user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(UpdateUserSchema))
    data: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, data);

    if (user instanceof Error)
      throw new HttpException(user.message, HttpStatus.FORBIDDEN);

    return this.usersParser.toJSON(user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deleted = await this.usersService.remove(id);

    if (deleted instanceof Error)
      throw new HttpException(deleted.message, HttpStatus.FORBIDDEN);

    return deleted;
  }
}
