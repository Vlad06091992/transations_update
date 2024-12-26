import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Wallets } from 'src/entities/wallet.entity';
import { DataSource, Repository } from 'typeorm';
import { Purchase } from 'src/entities/purchase.entity';

export class DbRepo {
  constructor(
    @InjectRepository(Wallets)
    private readonly walletsRepo: Repository<Wallets>,
    @InjectRepository(Purchase)
    private readonly purchaseRepo: Repository<Purchase>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async saveWallet(wallet: Wallets) {
    await this.walletsRepo.save(wallet);
  }

  async findWallet(id: number) {
    return await this.walletsRepo.findOne({ where: { id } });
  }

  async findPurchases() {
    return await this.purchaseRepo.find({});
  }

  async savePurchase(purchase: Purchase) {
    await this.purchaseRepo.save(purchase);
  }

  async clearPurchases() {
    await this.purchaseRepo.clear();
  }

  async updateBalanceWithVersion(id, balance, balanceVersion) {
    const result = await this.dataSource
      .createQueryBuilder()
      .update(Wallets)
      .set({ balance, balanceVersion: balanceVersion + 1 })
      .where('balanceVersion = :balanceVersion', { balanceVersion })
      .andWhere('id = :id', { id })
      .execute();

    return result.affected > 0;
  }
}
