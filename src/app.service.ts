import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallets } from 'src/entities/wallet.entity';
import { Repository } from 'typeorm';
import { OtherService } from 'src/other-service';
import { Purchase } from 'src/entities/purchase.entity';
import { DbRepo } from 'src/repos/db.repo';

@Injectable()
export class AppService {
  constructor(
    private readonly otherService: OtherService,
    private readonly repo: DbRepo,
  ) {}

  async slowBySomething(id: number, price: number): Promise<boolean> {
    console.log('START SLOW', price);
    const wallet = await this.repo.findWallet(id);
    debugger;
    if (wallet.balance < price) {
      debugger;
      console.warn(
        `No money for Quick payment! Balance: ${wallet.balance}, price: ${price}`,
      );
      return false;
    }

    const result = await this.otherService.checkProductAvailability(
      'milk',
      5000,
    );

    if (!result) {
      console.warn('No product!!!');
      return false;
    }

    console.log('CONTINUE SLOW', price);

    wallet.balance = wallet.balance - price;
    await this.repo.saveWallet(wallet);

    const purchase = Purchase.createFromData({ price, title: 'SLOW' });
    await this.repo.savePurchase(purchase);
    return true;
  }

  async quickBySomething(id: number, price: number): Promise<boolean> {
    console.log('START QUICK', price);
    const wallet = await this.repo.findWallet(id);

    if (wallet.balance < price) {
      console.warn(
        `No money for Quick payment! Balance: ${wallet.balance}, price: ${price}`,
      );
      return false;
    }

    const result = await this.otherService.checkProductAvailability(
      'milk',
      500,
    );

    if (!result) {
      console.warn('No product!!!');
      return false;
    }

    console.log('CONTINUE QUICK', price);

    wallet.balance = wallet.balance - price;
    await this.repo.saveWallet(wallet);

    const purchase = Purchase.createFromData({ price, title: 'QUICK' });
    await this.repo.savePurchase(purchase);
    return true;
  }

  getHello(): string {
    return 'Hello World!';
  }

  async getData() {
    const wallets = await this.repo.findWallet(1);
    const purchases = await this.repo.findPurchases();

    return { wallets, purchases };
  }

  async prepareData() {
    await this.repo.clearPurchases();
    const wallet = await this.repo.findWallet(1);
    wallet.balance = 100;
    await this.repo.saveWallet(wallet);
  }
}
