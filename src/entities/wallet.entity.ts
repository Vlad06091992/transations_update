import { Check, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'wallets' })
export class Wallets {
  @PrimaryGeneratedColumn()
  @Check('"balance" >= 0')
  id: number;

  @Column()
  balance: number;

  @Column()
  title: string;

  static createFromData({ title, balance }: Omit<Wallets, 'id'>): Wallets {
    const wallet = new Wallets();
    wallet.title = title;
    wallet.balance = balance;

    return wallet;
  }
}
