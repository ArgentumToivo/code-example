import { TransportEvent } from './enums/transport-event.enum';
import { ChatEvent } from './enums/chat-event.enum';
import { HomeEvent } from './enums/home-event.enum';

export type EventType = TransportEvent | ChatEvent | HomeEvent;
