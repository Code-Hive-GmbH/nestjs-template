import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class Org {
  @PrimaryKey()
  uuid: string = v4();

  @Property()
  name: string;

  @Property()
  domain: string;
}
