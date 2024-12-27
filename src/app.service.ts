import { BadRequestException, Injectable } from '@nestjs/common';
import { OtherService } from 'src/other-service';
import { Purchase } from 'src/entities/purchase.entity';
import { DbRepo } from 'src/repos/db.repo';
import { DataSource } from 'typeorm';
import { Wallets } from 'src/entities/wallet.entity';

@Injectable()
export class AppService {
  constructor(
    private readonly otherService: OtherService,
    private readonly repo: DbRepo,
    private readonly dataSource: DataSource,
  ) {}

  async slowBySomethingWithTransaction(
    id: number,
    price: number,
  ): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    // establish real database connection using our new query runner
    await queryRunner.connect();
    // lets now open a new transaction:
    await queryRunner.startTransaction();

    const walletRepoFromQueryRunner =
      this.dataSource.manager.getRepository(Wallets);
    const purchaseRepoFromQueryRunner =
      this.dataSource.manager.getRepository(Purchase);

    try {
      console.log('START SLOW', price);
      const wallet = await walletRepoFromQueryRunner.findOne({ where: { id } });
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
      await walletRepoFromQueryRunner.save(wallet);

      const purchase = Purchase.createFromData({ price, title: 'SLOW' });
      await purchaseRepoFromQueryRunner.save(purchase);
      await queryRunner.commitTransaction();
      return true;
    } catch (e) {
      console.error('TRANSACTION ROLLBACK');
      await queryRunner.rollbackTransaction();
    }
  }

  async quickBySomethingWithTransaction(
    id: number,
    price: number,
  ): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    // establish real database connection using our new query runner
    await queryRunner.connect();
    // lets now open a new transaction:
    await queryRunner.startTransaction();

    const walletRepoFromQueryRunner =
      this.dataSource.manager.getRepository(Wallets);
    const purchaseRepoFromQueryRunner =
      this.dataSource.manager.getRepository(Purchase);

    try {
      console.log('START QUICK', price);
      const wallet = await walletRepoFromQueryRunner.findOne({ where: { id } });
      if (wallet.balance < price) {
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

      console.log('CONTINUE QUICK', price);
      wallet.balance = wallet.balance - price;
      await walletRepoFromQueryRunner.save(wallet);
      const purchase = Purchase.createFromData({ price, title: 'SLOW' });
      await purchaseRepoFromQueryRunner.save(purchase);
      await queryRunner.commitTransaction();
      return true;
    } catch (e) {
      debugger;
      console.error('TRANSACTION ROLLBACK');
      await queryRunner.rollbackTransaction();
      throw new Error();
    }
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
