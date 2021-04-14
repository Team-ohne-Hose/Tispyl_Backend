import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import User from "./User";
@Entity()
class Role {

  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: "varchar", length: 65, unique: false, nullable: false })
  public description: string;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP(6)" })
  public createdAt: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
  public updatedAt: Date;

  @ManyToMany(type => User, user => user.roles)
  public users: User[]

  constructor(description: string) {
    this.description = description
  }
}

export default Role;