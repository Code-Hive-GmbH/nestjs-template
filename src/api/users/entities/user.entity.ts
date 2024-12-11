import { Org } from '@api/org/entities/org.entity';
import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { ApiKey } from '@utils/api-key/entities/api-key.entity';
import { PasswordReset } from '@utils/auth/entities/password-reset.entity';
import { v4 } from 'uuid';

@Entity()
export class User {
  @PrimaryKey()
  id: string = v4();

  @Property()
  createdAt: Date = new Date();

  @Property()
  updatedAt: Date = new Date();

  @Property()
  @Unique()
  email: string;

  @Property()
  emailVerified: boolean = false;

  @Property()
  passwordHash: string;

  @Property({ nullable: true })
  @Unique()
  username?: string;

  @Property({ nullable: true })
  name?: string;

  @Property({ nullable: true })
  timezone?: string;

  @Property({ nullable: true })
  refreshToken?: string;

  @ManyToOne(() => Org)
  organization: Org;

  @OneToMany(() => ApiKey, (apiKey) => apiKey.user)
  apiKeys = new Collection<ApiKey>(this);

  @OneToMany(() => PasswordReset, (reset) => reset.user)
  passwordResets = new Collection<PasswordReset>(this);
}
