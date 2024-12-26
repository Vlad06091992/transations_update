import { BadRequestException, Injectable } from '@nestjs/common';
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
    const { balanceVersion, balance, title } = await this.repo.findWallet(id);
    debugger;
    if (balance < price) {
      debugger;
      console.warn(
        `No money for Quick payment! Balance: ${balance}, price: ${price}`,
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

    const isUpdated = await this.repo.updateBalanceWithVersion(
      1,
      balance,
      balanceVersion,
    );

    if (!isUpdated) {
      console.error('VERSION ERROR');
      throw new BadRequestException({ message: 'VERSION ERROR' });
    }
    const purchase = Purchase.createFromData({ price, title: 'SLOW' });
    await this.repo.savePurchase(purchase);
    return true;
  }

  async quickBySomething(id: number, price: number): Promise<boolean> {
    console.log('START QUICK', price);
    const { balanceVersion, balance } = await this.repo.findWallet(id);

    if (balance < price) {
      console.warn(
        `No money for Quick payment! Balance: ${balance}, price: ${price}`,
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

    //передаем баланс и баланс который хоим установить, если баланс поменялся, не делаем
    //операцию(не проходит по условию запроса)
    const isUpdated = await this.repo.updateBalanceWithVersion(
      1,
      balance,
      balanceVersion,
    );

    if (!isUpdated) {
      console.error('VERSION ERROR');
      throw new BadRequestException({ message: 'VERSION ERROR' });
    }

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
    wallet.balanceVersion = 0;
    await this.repo.saveWallet(wallet);
  }
}
