import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import TileSet from "./TileSet";

@Entity()
class DefaultRule {

  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: "varchar", length: 80, unique: false, nullable: false })
  public rule: string;

  @ManyToOne(type => TileSet, ts => ts.defaultRules)
  public tileSet: Promise<TileSet>;

  constructor(rule: string) {
    this.rule = rule;
  }
}
export default DefaultRule;
