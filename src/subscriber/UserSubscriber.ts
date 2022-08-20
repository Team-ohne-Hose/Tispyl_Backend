/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';
import User from '../entity/User';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<any> {
  /**
   * Indicates that this subscriber only listen to Post events.
   */
  listenTo(): any {
    return User;
  }

  /**
   * Called after entity insertion.
   */
  afterInsert(event: InsertEvent<any>): void {
    console.log(`INSERTED: ${event.metadata.tableName}`, event.entity);
  }

  /**
   * Called after entity removal.
   */
  afterRemove(event: RemoveEvent<any>): void {
    console.log(`REMOVED: ${event.metadata.tableName}`, event.entity);
  }
}
