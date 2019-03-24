import { InMemoryDbService } from 'angular-in-memory-web-api';

import { ChatFakeDb } from './chat';

export class FuseFakeDbService implements InMemoryDbService
{
    createDb()
    {
        return {
            'chat-contacts'              : ChatFakeDb.contacts,
            'chat-chats'                 : ChatFakeDb.chats,
            'chat-user'                  : ChatFakeDb.user,
        };
    }
}
