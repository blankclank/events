import {
  DomainEvent,
  DomainEventCtor,
  getDomainEventKey,
} from './domain-event';
import { DomainEventHandler } from './domain-event.handler';

export abstract class DomainEventDispatcher {
  private readonly handlers: Map<
    DomainEventCtor,
    DomainEventHandler<DomainEvent>[]
  > = new Map();
  private readonly eventToClassMap: Map<string, DomainEventCtor> = new Map();

  registerDomainEvents<T extends DomainEvent>(
    domainEventCtor: DomainEventCtor,
    handler: DomainEventHandler<T>
  ) {
    const currentHandlers = this.handlers.get(domainEventCtor) || [];
    this.handlers.set(domainEventCtor, [...currentHandlers, handler]);
    this.eventToClassMap.set(
      getDomainEventKey(domainEventCtor),
      domainEventCtor
    );
  }

  deserializeMessage(domainEvent: DomainEvent) {
    const domainEventKey = getDomainEventKey(domainEvent);
    const domainEventCtor = this.eventToClassMap.get(domainEventKey);

    if (!domainEventCtor) {
      throw new Error(`Domain key ${domainEventKey} not registered`);
    }

    return new domainEventCtor(domainEvent);
  }

  async dispatch(domainEvent: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(
      domainEvent.constructor as DomainEventCtor
    );

    if (handlers) {
      for (const handler of handlers) {
        try {
          await handler.handle(domainEvent);
        } catch (err) {
          console.error(err);
          throw err;
        }
      }
    }
  }
}
