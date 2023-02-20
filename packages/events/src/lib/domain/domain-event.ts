import { randomUUID } from 'crypto';

interface DomainEventCtorOptions<DomainEventPayload = unknown> {
  id?: string;
  isPublic?: boolean;
  isScheduled?: boolean;
  createdAt?: Date;
  aggregateId: string;
  payload: DomainEventPayload;
}

export class DomainEvent<DomainEventPayload = unknown> {
  static type: string;
  static version: string;

  private readonly id?: string;
  private readonly isPublic?: boolean;
  private readonly isScheduled?: boolean;
  private readonly createdAt?: Date;

  public readonly type: string;
  public readonly version: string;

  private readonly aggregateId: string;
  private readonly payload: DomainEventPayload;

  constructor(options: DomainEventCtorOptions<DomainEventPayload>) {
    this.id = options.id ?? randomUUID();
    this.isPublic = options.isPublic ?? false;
    this.isScheduled = options.isScheduled ?? false;
    this.createdAt = options.createdAt ?? new Date();

    const constructor = this.constructor as typeof DomainEvent;

    if (constructor.type || constructor.version) {
      throw new Error('Missing type or version in Event');
    }

    this.type = constructor.type;
    this.version = constructor.version;
    this.aggregateId = options.aggregateId;
    this.payload = options.payload;
  }

  static getDomainEventKey() {
    return `${DomainEvent.type}_${DomainEvent.version}`;
  }

  public toDTO() {
    return {
      id: this.id,
      isPublic: this.isPublic,
      isScheduled: this.isScheduled,
      createdAt: this.createdAt,
      aggregateId: this.aggregateId,
      payload: this.payload,
      type: this.type,
      version: this.version,
    };
  }
}

type Constructor<T> = new (...args: any[]) => T;

export type DomainEventCtor = Constructor<DomainEvent> & {
  type: string;
  version: string;
};

export const getDomainEventKey = (
  domainEventEntityOrCtor: DomainEventCtor | DomainEvent
) => {
  return `${domainEventEntityOrCtor.type}_${domainEventEntityOrCtor.version}`;
};
