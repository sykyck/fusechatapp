/**
 * performerStatus
 * @param req
 * @param res
 * @returns void
 */
module.exports = function logout(req, res) {
    console.log("Received logout request.");
     console.log(req.body);
     console.log(req.body.id);
     var userSocket = Object.keys(req.io.sockets.connected).filter( k => req.io.sockets.connected[k].cusId == req.body.id);
     console.log(userSocket);
     req.io.sockets.connected[userSocket].disconnect(true);
     if(userSocket) {
        res.json({ success: true});
     } else {
        res.json({ success: false});
     }
}

