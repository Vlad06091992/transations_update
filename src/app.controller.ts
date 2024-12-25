import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('prepare')
  prepare() {
    return this.appService.prepareData();
  }

  @Get('get')
  async get() {
    return await this.appService.getData();
  }

  @Get('slow')
  async slow(@Query('id') id: string, @Query('price') price: string) {
    if (!id || !price) {
      throw new BadRequestException();
    }

    await this.appService.slowBySomething(+id, +price);
  }

  @Get('quick')
  async quick(@Query('id') id: string, @Query('price') price: string) {
    if (!id || !price) {
      throw new BadRequestException();
    }

    await this.appService.quickBySomething(+id, +price);
  }
}
