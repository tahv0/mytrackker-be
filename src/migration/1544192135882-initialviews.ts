import { MigrationInterface, QueryRunner } from "typeorm";

export class initialviews1544192135882 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE OR REPLACE VIEW tc_batterylevel_v AS SELECT tc_positions.id as id, tc_devices.uniqueid AS deviceId, servertime AS serverTime, JSON_EXTRACT(tc_positions.attributes, "$.batteryLevel") AS batteryLevel FROM tc_positions JOIN tc_devices ON deviceId=tc_devices.id WHERE JSON_EXTRACT(tc_positions.attributes, "$.batteryLevel") IS NOT NULL ORDER BY id DESC;`
    );
    await queryRunner.query(
      `CREATE OR REPLACE VIEW tc_positions_v AS SELECT tc_positions.id as id, tc_devices.uniqueid AS deviceId, servertime AS serverTime, latitude, longitude, altitude, course, accuracy, speed FROM tc_positions JOIN tc_devices ON deviceId=tc_devices.id ORDER BY id DESC;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP VIEW IF EXISTS tc_batterylevel_v`);
    await queryRunner.query(`DROP VIEW IF EXISTS tc_positions_v`);
  }
}
