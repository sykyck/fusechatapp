import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../core/modules/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { FuseChatComponent } from './chat.component';
import { ChatService } from './chat.service';
import { FuseChatViewComponent } from './chat-view/chat-view.component';
import { FuseChatStartComponent } from './chat-start/chat-start.component';
import { FuseChatChatsSidenavComponent } from './sidenavs/left/chats/chats.component';
import { FuseChatUserSidenavComponent } from './sidenavs/left/user/user.component';
import { FuseChatLeftSidenavComponent } from './sidenavs/left/left.component';
import { FuseChatRightSidenavComponent } from './sidenavs/right/right.component';
import { FuseChatContactSidenavComponent } from './sidenavs/right/contact/contact.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

export const config: SocketIoConfig = { url: '', options: {} };

const routes: Routes = [
    {
        path     : 'chat/:token',
        component: FuseChatComponent,
        children : [],
        resolve  : {
            chat: ChatService
        }
    }
];

@NgModule({
    imports     : [
        SharedModule,
        RouterModule.forChild(routes),
        SocketIoModule.forRoot(config)
    ],
    declarations: [
        FuseChatComponent,
        FuseChatViewComponent,
        FuseChatStartComponent,
        FuseChatChatsSidenavComponent,
        FuseChatUserSidenavComponent,
        FuseChatLeftSidenavComponent,
        FuseChatRightSidenavComponent,
        FuseChatContactSidenavComponent,
    ],
    providers   : [
        ChatService
    ]
})
export class FuseChatModule
{
}
