import { DynamicModule, Injectable, OnModuleInit } from '@nestjs/common';
import { DomainEventHandlerRegisterer } from './domain/domain-event.handler-registerer';


@Injectable()
export class EventsModule implements OnModuleInit {
  static register(): DynamicModule {
    return {
      module: EventsModule,
      imports: [],
      providers: [DomainEventHandlerRegisterer],
      exports: [],
    };
  }
  constructor(
    private readonly handlersRegisterer: DomainEventHandlerRegisterer,
  ) {}

  onModuleInit() {
    this.handlersRegisterer.registerEventHandlers();
  }
}
