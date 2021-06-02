import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';
import GameLog from '../entity/GameLog';

@EventSubscriber()
export class GameLogSubscriber implements EntitySubscriberInterface<any> {
  /**
   * Indicates that this subscriber only listen to Post events.
   */
  listenTo() {
    return GameLog;
  }

  /**
   * Called after entity insertion.
   */
  afterInsert(event: InsertEvent<any>) {
    console.log(`INSERTED: ${event.metadata.tableName}`, event.entity);
  }

  /**
   * Called after entity removal.
   */
  afterRemove(event: RemoveEvent<any>) {
    console.log(`REMOVED: ${event.metadata.tableName}`, event.entity);
  }
}
