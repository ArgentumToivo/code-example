import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { NursingHomeGateway } from './gateways/nursing-home.gateway';
import { ChatGateway } from './gateways/chat.gateway';
import { EventType } from './types/event.type';
import { IGateway } from './types/interfaces/gateway.interface';
import { GatewayList } from './types/enums/gateway-list.enum';

@Injectable()
export class GatewayInterceptor {
    constructor(
        @Inject(forwardRef(() => NursingHomeGateway))
        private readonly nursingHomeGateway: IGateway,
        @Inject(forwardRef(() => ChatGateway))
        private readonly chatGateway: IGateway,
    ) {}

    interceptForRoom(
        intercepted: GatewayList,
        room: string,
        event: EventType,
        data?: any,
    ) {
        this[intercepted].sendFromServerToRoom(room, event, data);
    }
}
