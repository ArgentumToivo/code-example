import { OnGatewayInit } from '@nestjs/websockets';
import { EventType } from '../event.type';

export interface IGateway extends OnGatewayInit {
    sendFromServerToRoom(room: string, event: EventType, data?: any): void;
}
