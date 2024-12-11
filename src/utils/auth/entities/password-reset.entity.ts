import { User } from '@api/users/entities/user.entity';
import { Entity, ManyToOne, PrimaryKey } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class PasswordReset {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => User)
  user: User;
}
