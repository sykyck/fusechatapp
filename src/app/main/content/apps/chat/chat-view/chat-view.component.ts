import { AfterViewInit, Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { ChatService } from '../chat.service';
import { NgForm } from '@angular/forms';
import { FusePerfectScrollbarDirective } from '../../../../../core/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
    selector   : 'fuse-chat-view',
    templateUrl: './chat-view.component.html',
    styleUrls  : ['./chat-view.component.scss']
})
export class FuseChatViewComponent implements OnInit, AfterViewInit
{
    user: any;
    chat: any;
    dialog: any;
    contact: any;
    replyInput: any;
    selectedChat: any;
    @ViewChild(FusePerfectScrollbarDirective) directiveScroll: FusePerfectScrollbarDirective;
    @ViewChildren('replyInput') replyInputField;
    @ViewChild('replyForm') replyForm: NgForm;

    constructor(private chatService: ChatService, private activatedRoute: ActivatedRoute)
    {
    }

    ngOnInit()
    {
        this.user = this.chatService.user;
        this.chatService.onChatSelected
            .subscribe(chatData => {
                if ( chatData )
                {
                    this.selectedChat = chatData;
                    this.contact = chatData.contact;
                    this.dialog = chatData.dialog;
                    this.readyToReply();
                }
            });
        this.chatService.onUpdateChatView
             .subscribe(dialogData => {
             console.log(dialogData);
             if(dialogData != null && dialogData.id == this.selectedChat.chatId)
             {
                const chatItem = this.user.chatList.find((item) => {
                     return item.id === this.selectedChat.chatId;
                });
                chatItem.unread = 0;
             }
        });

    }

    ngAfterViewInit()
    {
        this.replyInput = this.replyInputField.first.nativeElement;
        this.readyToReply();
    }

    selectContact()
    {
        this.chatService.selectContact(this.contact);
    }

    readyToReply()
    {
        setTimeout(() => {
            this.replyForm.reset();
            this.focusReplyInput();
            this.scrollToBottom();
        });

    }

    focusReplyInput()
    {
        setTimeout(() => {
            this.replyInput.focus();
        });
    }

    scrollToBottom(speed?: number)
    {
        speed = speed || 400;
        if ( this.directiveScroll )
        {
            this.directiveScroll.update();

            setTimeout(() => {
                this.directiveScroll.scrollToBottom(0, speed);
            });
        }
    }
    
    reply(event)
    {
        // Message
        const message = {
            who    : this.user.id,
            message: this.replyForm.form.value.message,
            time   : new Date().toISOString()
        };

        // Add the message to the chat
        this.dialog.push(message);

        // Update the server
        this.chatService.updateDialog(this.selectedChat.chatId, message, this.contact.id).then(response => {
            this.readyToReply();
        });

    }
}
