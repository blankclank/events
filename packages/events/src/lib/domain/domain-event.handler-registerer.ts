import { Injectable } from '@nestjs/common';
import { ModuleRef, ModulesContainer } from '@nestjs/core';
import { DomainEventDispatcher } from './domain-event.dispatcher';
import { DOMAIN_EVENT_HANDLER_METADATA, DomainEventHandler, DomainEventHandlerMetadata } from './domain-event.handler';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';

export interface MetadataWithInstance<MetadataInterface> {
  instance: DomainEventHandler<any>;
  metadata: MetadataInterface;
}

const isNullOrUndefined = (val: unknown) => val === undefined || val === null;

@Injectable()
export class DomainEventHandlerRegisterer {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly modulesContainer: ModulesContainer,
  ) {}

  registerEventHandlers() {
    const { eventsHandlersMetadata } = this.exploreProviders();

    eventsHandlersMetadata.forEach(({ metadata, instance }) => {
      const dispatcher: DomainEventDispatcher = this.moduleRef.get(metadata.dispatcher, { strict: false });
      metadata.events.forEach(event => {
        dispatcher.registerDomainEvents(event, instance);
      });
    });
  }

  private exploreProviders(): {
    eventsHandlersMetadata: MetadataWithInstance<DomainEventHandlerMetadata>[],
  } {
    const modules = [...this.modulesContainer.values()];

    const eventsHandlersMetadata = this.flatMap<MetadataWithInstance<DomainEventHandlerMetadata>>(modules, instance =>
      this.filterProvider<DomainEventHandlerMetadata>(instance, DOMAIN_EVENT_HANDLER_METADATA),
    );

    return { eventsHandlersMetadata };
  }

  private flatMap<T>(
    modules: Module[],
    callback: (instance: InstanceWrapper) => T,
  ): T[] {
    return modules
      .flatMap(module => [...module.providers.values()].map(callback))
      .filter(value => !isNullOrUndefined(value)) as T[];
  }

  private filterProvider<T>(
    wrapper: InstanceWrapper,
    metadataKey: string,
  ): any | undefined {
    const { instance } = wrapper;

    if (!instance) {
      return undefined;
    }

    return this.extractMetadata<T>(instance, metadataKey);
  }

  private extractMetadata<T>(instance: DomainEventHandler<any>, metadataKey: string): MetadataWithInstance<T> | undefined {
    if (!instance.constructor) {
      return;
    }

    const metadata = Reflect.getMetadata(metadataKey, instance.constructor);

    return metadata ? {
      metadata,
      instance,
    } : undefined;
  }
}
