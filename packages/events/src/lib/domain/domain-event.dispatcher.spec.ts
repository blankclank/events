import { DomainEventDispatcher } from './domain-event.dispatcher';
import { DomainEvent } from './domain-event';

class TestDomainEventDispatcher extends DomainEventDispatcher {}

class TestDomainEvent1 extends DomainEvent<{ event1: string }> {}
class TestDomainEvent2 extends DomainEvent<{ event2: boolean }> {}
class TestDomainEvent3 extends DomainEvent<{ event3: Buffer }> {}

const createMockedHandler = () => ({
  handle: jest.fn(),
});

describe('DomainEventDispatcher', () => {
  const mockedDe1Handler = createMockedHandler();
  const mockedDe2Handler = createMockedHandler();
  const mockedDe3Handler = createMockedHandler();

  const de1 = new TestDomainEvent1({
    payload: { event1: 'event1' },
    aggregateId: 'aggregateId',
  });

  const de2 = new TestDomainEvent2({
    payload: { event2: true },
    aggregateId: 'aggregateId',
  });

  const de3 = new TestDomainEvent3({
    payload: { event3: Buffer.from('buffer') },
    aggregateId: 'aggregateId',
  });

  it('should register and dispatch correct domain events', () => {
    const dispatcher = new TestDomainEventDispatcher();

    dispatcher.registerDomainEvents(TestDomainEvent1, mockedDe1Handler);
    dispatcher.registerDomainEvents(TestDomainEvent2, mockedDe2Handler);
    dispatcher.registerDomainEvents(TestDomainEvent3, mockedDe3Handler);

    dispatcher.dispatch(de1);
    dispatcher.dispatch(de2);
    dispatcher.dispatch(de2);

    expect(mockedDe1Handler.handle).toBeCalledWith(de1);
    expect(mockedDe2Handler.handle).toBeCalledWith(de2);
    expect(mockedDe3Handler.handle).not.toBeCalledWith(de3);
    expect(mockedDe1Handler.handle).toBeCalledTimes(1);
    expect(mockedDe2Handler.handle).toBeCalledTimes(2);
    expect(mockedDe3Handler.handle).toBeCalledTimes(0);
  });

  it('should throw when can not deserialize domain event', () => {
    const dispatcher = new TestDomainEventDispatcher();

    expect(() => dispatcher.deserializeMessage(de1)).toThrow();
  });

  it('should deserialize domain event', () => {
    const dispatcher = new TestDomainEventDispatcher();

    dispatcher.registerDomainEvents(TestDomainEvent1, mockedDe1Handler);

    const domainEvent = dispatcher.deserializeMessage(de1);

    expect(domainEvent).toBeInstanceOf(TestDomainEvent1);
  });
});
