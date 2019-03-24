import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ChatService } from './chat.service';
import { fuseAnimations } from '../../../../core/animations';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Socket, SocketIoConfig } from 'ngx-socket-io';
import { config } from './chat.module';

@Component({
    selector     : 'fuse-chat',
    templateUrl  : './chat.component.html',
    styleUrls    : ['./chat.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})

export class FuseChatComponent implements OnInit
{
    selectedChat: any;
    
    constructor(private chatService: ChatService)
    {
    }

    ngOnInit()
    { 
        this.chatService.onChatSelected
            .subscribe(chatData => {

                this.selectedChat = chatData;
            });

        this.chatService.onChatDeselected
        .subscribe(id => {
            console.log(this.selectedChat);
            if (this.selectedChat != null && id == this.selectedChat.contact.id )
            {
                this.selectedChat = null;
            }
        });
    }

}
