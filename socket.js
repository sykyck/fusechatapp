module.exports = function (io) {
    console.log("Socket initialized");
    io.on('connection', (socket) => {
        console.log("Client connected!After authentication");
        let cusId = socket.decoded_token.cusId;
        let nickname = socket.decoded_token.nickName;
        console.log("Connected CustomerId=" + cusId);
        console.log("Connected Customer nickname=" + nickname);
        //socket.id =cusId;
        socket.nickname = nickname;
        socket.cusId = cusId;

      //  console.log('hello!', socket.handshake.decoded_token.name);
        // console.log(socket.decoded_token);
        // console.log('hello! ', socket.decoded_token.name);
        
        var joinedUser = {
            id: cusId,
            name: nickname,
            avatar  : 'assets/images/avatars/profile.jpg',
            status  : 'online',
            mood    : 'Using Vaibhav App ...',
            // TODO: fetch from db
            chatList: []
        };

        socket.emit('userchats', joinedUser);

        //console.log(io.sockets.connected);
        var users = Object.keys(io.sockets.connected).filter( k => io.sockets.connected[k].connected
                            && io.sockets.connected[k].cusId != cusId).map(k => { return {
            id      : io.sockets.connected[k].cusId,
            name    : io.sockets.connected[k].nickname,
            avatar  : 'assets/images/avatars/profile.jpg',
            status  : 'online',
            mood    : 'Using UsArcades ...',
        };});
        // Send the contact list to the freshly connected Socket
        socket.emit('contacts', users);
        // Send the new contact to others that are connected.
        socket.broadcast.emit('newContact', joinedUser);
        

        // TODO: Fetch chats from db
        socket.emit('chats', []);
        // TODO: fetch chats from db

        socket.on('join', function(contactId, cb) {
            var chatWithUserId = contactId;
            var chatFromUserId = socket.cusId;

            var roomId = Math.min(chatWithUserId, chatFromUserId) + '-' + Math.max(chatWithUserId, chatFromUserId);
            
            socket.join(roomId);
            var otherSocketKey = Object.keys(io.sockets.connected).find(k => {
                return io.sockets.connected[k].cusId == contactId;
            });
            
            if(otherSocketKey) {
               io.sockets.connected[otherSocketKey].join(roomId);
            }

            cb({
                id: roomId,
                dialog: [] // TODO: fetch the chat from db for this user pair
            });
        });

        socket.on('updateDialog',function(chat) {
            socket.to(chat.id).emit('message', chat);
        });

        socket.on('statusChanged',function(data) {
            for(var sendingSocket in io.sockets.connected)
            {
                if(sendingSocket.cusId != data.cusId)
                {
                   io.sockets.connected[sendingSocket].emit('contactStatusChange',data); 
                }
            }
        });

        socket.on('disconnect', (reason) => {
            // ...
            console.log("Disconected:" + socket.cusId);
            for(var sendingSocket in io.sockets.connected)
            {
                if(sendingSocket.cusId != cusId)
                {
                   io.sockets.connected[sendingSocket].emit('disconnectedSocketId',{id:socket.cusId});
                }
            }
        });
        
    });
}