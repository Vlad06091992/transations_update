import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallets } from 'src/entities/wallet.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { Repository } from 'typeorm';
import { OtherService } from 'src/other-service';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'sa',
      database: 'transactions_update',
      autoLoadEntities: true,
      logging: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Wallets, Purchase]),
  ],
  controllers: [AppController],
  providers: [AppService, Repository, OtherService],
})
export class AppModule {}
