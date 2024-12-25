import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallets } from 'src/entities/wallet.entity';
import { Repository } from 'typeorm';
import { OtherService } from 'src/other-service';
import { Purchase } from 'src/entities/purchase.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Wallets)
    private readonly walletsRepo: Repository<Wallets>,
    @InjectRepository(Purchase)
    private readonly purchaseRepo: Repository<Purchase>,
    private readonly otherService: OtherService,
  ) {}

  async slowBySomething(id: number, price: number): Promise<boolean> {
    console.log('START SLOW', price);
    const wallet = await this.walletsRepo.findOne({
      where: { id },
    });
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
    await this.walletsRepo.save(wallet);

    const purchase = Purchase.createFromData({ price, title: 'SLOW' });
    await this.purchaseRepo.save(purchase);
    return true;
  }

  async quickBySomething(id: number, price: number): Promise<boolean> {
    console.log('START QUICK', price);
    const wallet = await this.walletsRepo.findOne({
      where: { id },
    });

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
    await this.walletsRepo.save(wallet);

    const purchase = Purchase.createFromData({ price, title: 'QUICK' });
    await this.purchaseRepo.save(purchase);
    return true;
  }

  getHello(): string {
    return 'Hello World!';
  }

  async getData() {
    const wallets = await this.walletsRepo.find({});
    const purchases = await this.purchaseRepo.find({});

    return { wallets, purchases };
  }

  async prepareData() {
    await this.purchaseRepo.clear();
    const wallet = await this.walletsRepo.findOne({ where: { id: 1 } });
    wallet.balance = 100;
    await this.walletsRepo.save(wallet);
  }
}
