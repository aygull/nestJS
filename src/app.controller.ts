import { Controller, Get, Post, Body, BadRequestException, Param, Response } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
    console.log(this.appService);
  }

  validateUserData(data: any) {
    if (!data.login) {
      throw new BadRequestException({
        ok: false,
        error: 'login required',
      });
    }

    if (!data.password) {
      throw new BadRequestException({
        ok: false,
        error: 'password required',
      });
    }
  }

  @Post('/api/register')
  async register(@Body() data) {
    this.validateUserData(data);

    await this.appService.register(data);

    return {
      ok: true,
    };
  }

  @Post('/api/login')
  async login(@Body() data) {
    this.validateUserData(data);

    const id = await this.appService.login(data);
    return { id };
  }

  validateUrlCreateData(data: any) {
    if (!data.id) {
      throw new BadRequestException({
        ok: false,
        error: 'id required',
      });
    }

    if (!data.url) {
      throw new BadRequestException({
        ok: false,
        error: 'url required',
      });
    }
  }

  @Post('/api/urls')
  async createLink(@Body() data) {
    this.validateUrlCreateData(data);
    const link = await this.appService.createLink(data);
    return { link };
  }
  @Post('message')
  async getCode(@Body()data) {
    await this.appService.getCodeMessage(data);

    // if (await this.appService.getLogin(data.login)) {
    //   console.log(this.appService.getLogin(data.login));
    //   throw new BadRequestException({
    //     ok: false,
    //     error: 'id required',
    //   });
    // } else { await this.appService.getCodeMessage(data); }

    // console.log(data.login);
  }
  @Get('message')
  async sendCode() {
   return this.appService.sendCodeMessage();
  }

  @Get(':linkId')
  async redirect(@Param('linkId') linkId, @Response() response) {
    const longLink = await this.appService.getLongLink(linkId);
    response.redirect(longLink);
  }
}
