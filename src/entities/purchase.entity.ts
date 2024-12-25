import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'purchases' })
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  price: number;

  @Column()
  title: string;

  static createFromData({ title, price }: Omit<Purchase, 'id'>): Purchase {
    const purchase = new Purchase();
    purchase.title = title;
    purchase.price = price;

    return purchase;
  }
}
