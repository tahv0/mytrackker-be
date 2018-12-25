import { Entity, PrimaryGeneratedColumn, Column, getRepository } from "typeorm";
import * as moment from "moment";
import { Field, ObjectType, Resolver, Arg, Query, ID } from "type-graphql";
import { randomIntFromInterval, timeout } from "./helpers";

@ObjectType()
@Entity("tc_batterylevel_v")
export class BatteryLevel {
  public constructor(init?: Partial<BatteryLevel>) {
    Object.assign(this, init);
  }
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  deviceId: string;

  @Field()
  @Column()
  serverTime: Date;

  @Field()
  @Column()
  batteryLevel: number;
}
class MyDate extends Date {}

@Resolver(of => BatteryLevel)
export class BatteryLevelResolver {
  @Query(returns => [BatteryLevel])
  async getBatteryLevels(
    @Arg("deviceId") deviceId: string,
    @Arg("limit", { nullable: true }) limit?: 10,
    @Arg("startDate", { nullable: true }) startDate?: Date,
    @Arg("endDate", { nullable: true }) endDate?: Date
  ) {
    const wantedLimit = Math.floor(limit);
    const deviceExists = await getRepository(BatteryLevel)
      .createQueryBuilder("batteryLevel")
      .where("batteryLevel.deviceId = :deviceId", { deviceId })
      .getOne();

    if (deviceExists) {
      let query = getRepository(BatteryLevel)
        .createQueryBuilder("batteryLevel")
        .where("batteryLevel.deviceId = :deviceId", { deviceId });
      if (limit) {
        query.limit(wantedLimit);
      }
      if (startDate) {
        query.andWhere("batteryLevel.serverTime >= :startDate", { startDate });
      }
      if (endDate) {
        query.andWhere("batteryLevel.serverTime < :endDate", { endDate });
      }
      return await query.getMany();
    }

    let fakeValues = new Array(wantedLimit)
      .fill(undefined)
      .map(() => {
        const randSubstrDays = randomIntFromInterval(0, 1000);
        return new BatteryLevel({
          id: randomIntFromInterval(0, 10000000),
          deviceId,
          serverTime: moment()
            .subtract(randSubstrDays, "days")
            .toDate(),
          batteryLevel: randomIntFromInterval(0, 100)
        });
      })
      .sort((aBat, bBat) => (aBat.serverTime < bBat.serverTime ? -1 : 1));

    const randomTimeout = randomIntFromInterval(100, 600);
    await timeout(randomTimeout);
    return fakeValues;
  }
}
