import { Injectable } from '@nestjs/common';

@Injectable()
export class OtherService {
  async checkProductAvailability(
    productTitle: string,
    ms: number,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), ms);
    });
  }
}
