import { DomainEvent, DomainEventCtor } from './domain-event';
import { Type } from '@nestjs/common';

export const DOMAIN_EVENT_HANDLER_METADATA = '__domainEventHandler';

export interface DomainEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

export interface DomainEventHandlerMetadata {
  events: DomainEventCtor[];
  dispatcher: string | symbol | Type<any>;
}

export const DomainEventHandlerResolver = (
  metadata: DomainEventHandlerMetadata,
): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(DOMAIN_EVENT_HANDLER_METADATA, metadata, target);
  };
};
