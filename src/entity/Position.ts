import { Entity, PrimaryGeneratedColumn, Column, getRepository } from "typeorm";
import { Field, ObjectType, Resolver, Arg, Query, ID } from "type-graphql";
import * as moment from "moment";
import * as randomLocation from "random-location";
import { randomIntFromInterval, timeout } from "./helpers";

@ObjectType()
@Entity("tc_positions_v")
export class Position {
  public constructor(init?: Partial<Position>) {
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
  altitude: number;

  @Field()
  @Column()
  latitude: number;

  @Field()
  @Column()
  longitude: number;

  @Field()
  @Column()
  course: number;

  @Field()
  @Column()
  accuracy: number;

  @Field()
  @Column()
  speed: number;
}

@Resolver(of => Position)
export class PositionResolver {
  @Query(returns => [Position])
  async getPositions(
    @Arg("deviceId") deviceId: string,
    @Arg("limit", { nullable: true }) limit?: 10,
    @Arg("startDate", { nullable: true }) startDate?: Date,
    @Arg("endDate", { nullable: true }) endDate?: Date
  ) {
    const wantedLimit = Math.floor(limit);
    const deviceExists = await getRepository(Position)
      .createQueryBuilder("position")
      .where("position.deviceId = :deviceId", { deviceId })
      .getOne();

    if (deviceExists) {
      let query = getRepository(Position)
        .createQueryBuilder("position")
        .where("position.deviceId = :deviceId", { deviceId });
      if (limit) {
        query.limit(wantedLimit);
      }
      if (startDate) {
        query.andWhere("position.serverTime >= :startDate", { startDate });
      }
      if (endDate) {
        query.andWhere("position.serverTime < :endDate", { endDate });
      }
      return await query.getMany();
    }

    // if device not found from db, return fake data.
    const randomLongitude = randomIntFromInterval(-180, 180);
    const randomLatitude = randomIntFromInterval(-90, 90);
    const randomRange = randomIntFromInterval(0, 200000);
    let fakeValues = new Array(wantedLimit)
      .fill(undefined)
      .map(() => {
        const randSubstrDays = randomIntFromInterval(0, 1000);
        let randomPos = randomLocation.randomCircumferencePoint(
          {
            latitude: randomLatitude,
            longitude: randomLongitude
          },
          randomRange
        );
        return new Position({
          id: randomIntFromInterval(0, 10000000),
          deviceId,
          ...randomPos,
          altitude: randomIntFromInterval(0, 1000),
          serverTime: moment()
            .subtract(randSubstrDays, "days")
            .toDate(),
          course: randomIntFromInterval(0, 360),
          speed: randomIntFromInterval(0, 50),
          accuracy: randomIntFromInterval(0, 1)
        });
      })
      .sort((aPos, bPos) => (aPos.serverTime < bPos.serverTime ? -1 : 1));

    const randomTimeout = randomIntFromInterval(100, 600);
    await timeout(randomTimeout);
    return fakeValues;
  }
}
