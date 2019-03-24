import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot , Router} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FuseUtils } from '../../../../core/fuseUtils';
import { config } from './chat.module';
import { Socket } from 'ngx-socket-io'; 


@Injectable()
export class ChatService implements Resolve<any>
{
    contacts: any[];
    chats: any[];
    user: any;
    onChatSelected = new BehaviorSubject<any>(null);
    onChatDeselected = new BehaviorSubject<any>(null);
    onContactSelected = new BehaviorSubject<any>(null);
    onUpdateChatView = new BehaviorSubject<any>(null);
    onChatsUpdated = new Subject<any>();
    onContactGet: BehaviorSubject<any> = new BehaviorSubject([]);
    onUserUpdated = new Subject<any>();
    onDataAvailable: BehaviorSubject<boolean> = new BehaviorSubject(false);
    onLeftSidenavViewChanged = new Subject<any>();
    onRightSidenavViewChanged = new Subject<any>();
    onMessageReceived = new Subject<any>();
    socket: Socket;

    constructor(private http: HttpClient,private router: Router)
    {
    }

    private setSocket(socket)
    {
        this.socket = socket;
        this.socket.on('connect',()=> {
            console.log("Inside connect event Sending Client Info");
        });

        this.socket.on('disconnect',()=> {
            console.log("client disconnected");
            this.user.status = "offline";
            this.router.navigateByUrl('/thankyou').then(_ => {
                console.log("after navigating");
            });
            this.socket.disconnect(true);
        });

         this.socket.on('contactStatusChange',(data)=> {
              var statusChangedContact = this.contacts.find(c => c.id == data.cusId);
              if(statusChangedContact) {
                 statusChangedContact.status = data.status;
              }
         });

       
        this.socket.on('disconnectedSocketId',(data)=> {
            console.log("Received disconnectedSocketId event -" + data.id);
            var removeContact = this.contacts.find(c => c.id == data.id);
            removeContact.status = 'offline';

             var chatIdToRemove = null;
             this.user.chatList = this.user.chatList.filter((c, index) => {
                 chatIdToRemove = c.contactId == data.id ? c.id : null;
                 return c.contactId != data.id;
             });
 
            if (chatIdToRemove) {
                this.chats = this.chats.filter(c => c.id != chatIdToRemove);
            } 
            this.onChatDeselected.next(data.id);
        });

        this.socket.on('contacts', clients => {
            this.contacts = clients;
            console.log("Contact List Received = ");
            console.log(clients);
            this.onContactGet.next(this.contacts);
        });

        this.socket.on('newContact', contact => {
            var existingContact = this.contacts.find(c => c.id == contact.id);

            if (!existingContact) {
                this.contacts.push(contact);
            } else {
                existingContact.status = 'online';
            }
        });

        this.socket.on('chats', chats => {
            this.chats = chats;
            console.log("Chats List Received = " + chats);
            console.log(chats);
            this.onDataAvailable.next(true);
        });
        this.socket.on('userchats', userChats => {
            this.user = userChats;
            console.log("UserChats List Received = " + userChats);
            console.log(userChats);
        });

        this.socket.on("message", chat => {
            var chatToUpdate = this.chats.find( c => c.id === chat.id);

            // TODO: HACK, remove once DB is implemented on server
            if (!chatToUpdate) {
                // add a new chat,
                chatToUpdate = {
                    id: chat.id,
                    dialog: [] // TODO: fetch the chat from db for this user pair
                };
                this.chats.push(chatToUpdate);

                var contact = this.contacts.find(c => c.id === chat.dialog.who );
                const chatListItem = {
                        contactId      : chat.dialog.who,
                        id             : chat.id,
                        lastMessageTime: chat.dialog.time, // TODO
                        name           : contact.name,
                        unread         : null
                    };
                this.user.chatList.push(chatListItem);
            }
            // HACK END
            
            if(chatToUpdate != null) {
               chatToUpdate.dialog.push(chat.dialog);
            }
            this.UpdateUnread(chat);
            this.onUpdateChatView.next(chat);
        });
    }

    /**
     * Get chat
     * @param contactId
     * @returns {Promise<any>}
     */
    getChat(contactId)
    {
        const chatItem = this.user.chatList.find((item) => {
            return item.contactId === contactId;
        });

        /**
         * Create new chat, if it's not created yet.
         */
        if ( !chatItem )
        {
            this.createNewChat(contactId).then((newChats) => {
                this.getChat(contactId);
            });
            return;
        }

        for (let chatDescription of this.user.chatList) {
                if (chatDescription.contactId === contactId) {
                    chatDescription.unread = 0;
                    break;
                }
        }

         return new Promise(() => {

            const chat = this.user.chatList.find((chat) => {
                return chat.contactId === contactId;
            });

            const chatDialog = this.chats.find((chatObject)=>{
                 console.log(chatObject);
                 return chatObject.id == chat.id;
            });

            console.log("Showing chatDialog object");
            console.log(chatDialog);
            console.log("Showing chat object");
            console.log(chat);
            var chatContact = this.contacts.find(c => c.id == contactId)

            const chatData = {
                   chatId : chat.id,
                   dialog : chatDialog.dialog,
                   contact: chatContact
                };

            this.onChatSelected.next({...chatData});

        });

    }

    UpdateUnread(message)
    {
        var chat = this.user.chatList.find(c => c.id == message.id);

        if (chat != null && chat.unread) {
            chat.unread++;
        }
        else if (chat != null) {
            chat.unread = 1;
        }
        var contact = this.contacts.find(c => c.id === message.dialog.who );

        if (contact != null && contact.unread) {
            contact.unread++;
        }
        else if (contact != null) {
            contact.unread = 1;
        }
    }

    /**
     * Create New Chat
     * @param contact object containing cusId and Nickname
     * @returns {Promise<any>}
     */
    createNewChat(contactId)
    {
        return new Promise((resolve, reject) => {

            const contact = this.contacts.find((item) => {
                return item.id === contactId;
            });

            this.socket.emit("join", contactId, chat => {
                const chatListItem = {
                    contactId      : contactId,
                    id             : chat.id,
                    lastMessageTime: '2017-02-18T10:30:18.931Z', // TODO
                    name           : contact.name,
                    unread         : null
                };

                /**
                 * Add new chat list item to the user's chat list
                 */
                this.user.chatList.push(chatListItem);
                this.chats.push(chat);
                this.onUserUpdated.next(this.user);
                resolve(this.user);
            });
        });
    }

    /**
     * Select Contact
     * @param contact
     */
    selectContact(contact)
    {
        this.onContactSelected.next(contact);
    }

    /**
     * Set user status
     * @param status
     */
    setUserStatus(status)
    {
        this.user.status = status;
    }

    /**
     * Update user data
     * @param userData
     */
    updateUserData(userData)
    {
        this.socket.emit('statusChanged', {cusId:userData.id,status:userData.status}); 
        this.user = userData;
    }

    /**
     * Update the chat dialog
     * @param chatId
     * @param message
     * @returns {Promise<any>}
     */
    updateDialog(chatId, message, contact): Promise<any>
    {
        return new Promise((resolve, reject) => {

            const newData = {
                id    : chatId,
                dialog: message
            };
        
           this.socket.emit('updateDialog', newData);
           resolve(newData);
        });
    }

    /**
     * The Chat App Main Resolver
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        this.user = {
                    id      : 0,
                    name    : "name",
                    avatar  : 'assets/images/avatars/profile.jpg',
                    status  : 'offline',
                    mood    : 'Not Connected to Internet',
                };
        
        config.url = window.location.origin;

        this.socket = new Socket({...config, options: {
                query: {
                    token: route.url[1].path
                }
            } });

        this.setSocket(this.socket);
    }
}
