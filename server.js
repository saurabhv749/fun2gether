const express = require('express')
const path = require('path')
const { Server } = require('socket.io')
const http = require('http')
const cors = require('cors')


const app = express()
app.use(cors())
app.use(express.static(__dirname + '/assets'))

const server = http.createServer(app)


const io = new Server(server, {
    cors:{origin:'*',methods:['GET','POST']}
})

let members=[],ready={},movie={}
io.on('connection', sock => {
    sock.on('joinRoom', ({ uname, room, peer }) => {
        if (movie[room])
            sock.emit('updateURI', movie[room])
        // peer is peer id
        sock.join(room) 
        members.push({id:sock.id,uname,room,peer})
        // welcome msg to sender
        sock.broadcast.to(room).emit('add-member', peer)
    })

    sock.on('requestPause',({uname,room,tStamp})=>{
        sock.broadcast.to(room).emit('pause', { tStamp })
    })
    sock.on('requestPlay', ({ room, tStamp }) => {
        ready[room] = 0 
        sock.broadcast.to(room).emit('play', { tStamp })
    })
    sock.on('readyToPlay', ({ room }) => {
        let temp = members.filter(u => u.room == room)
        ready[room] ? ready[room]=ready[room]+1: ready[room]=1
        if(temp.length==ready[room])
            io.in(room).emit('play', { tStamp:0 })
    })

    sock.on('requestURIUpdate', ({ room, uri }) => {
        movie[room] = uri
        sock.broadcast.to(room).emit('updateURI', uri)
    })

    
    sock.on('disconnect', () => {
    let member = members.find(u => u.id === sock.id)
    members = members.filter(u => u.id !== sock.id)
        if (member) {   
            let temp = members.filter(u => u.room == member.room)
            if (!temp.length)
                movie[member.room] = `magnet:?xt=urn:btih:9642bac296f2e4857f557963078e55bf97798a99&dn=mixkit-forest-stream-in-the-sunlight-529-large.mp4&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337`

        io.in(member.room).emit('member-left',{peer:member.peer})
    }
    })
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'./assets/index.html'))
})
app.get('/:creds', (req, res) => {
    if(req.params.creds.split('@').filter(x=>x.length>=1).length===2)
        res.sendFile(path.join(__dirname, './assets/player.html'))
    else
        res.json('bad request')
})

server.listen(process.env.PORT || 3000, () => console.log('server started at port 3000'))
