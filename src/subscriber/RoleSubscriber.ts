import { EventSubscriber, EntitySubscriberInterface, InsertEvent, RemoveEvent } from "typeorm";
import Role from "../entity/Role";

@EventSubscriber()
export class RoleSubscriber implements EntitySubscriberInterface<any> {

    /**
     * Indicates that this subscriber only listen to Post events.
     */
     listenTo() {
        return Role;
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
