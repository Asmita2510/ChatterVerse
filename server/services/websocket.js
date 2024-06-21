const socketService = (socket) => {
    socket.on('send-message', ({ data, groupId }) => {

        socket.broadcast.emit('new-message', { data, groupId });

    });
    socket.on('add-media', ({ selectedFiles, groupId }) => {

        socket.broadcast.emit('media-added', { selectedFiles, groupId });

    });

}



module.exports = socketService