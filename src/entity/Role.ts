import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import User from './User';
@Entity()
class Role {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'varchar', length: 64, unique: false, nullable: false })
  public name: string;

  @Column({ type: 'varchar', length: 256, unique: false, nullable: false })
  public description: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP()' })
  public createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP()',
    onUpdate: 'CURRENT_TIMESTAMP()',
  })
  public updatedAt: Date;

  @ManyToMany(() => User, (user) => user.roles)
  public users: User[];

  constructor(description: string) {
    this.description = description;
  }
}

export default Role;
