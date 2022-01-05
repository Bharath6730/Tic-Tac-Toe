const express = require("express")
const socketio = require("socket.io")
const  randomString = require("random-string")

const app = express()
app.use(express.static("Public"))

const Server = app.listen(3000)
const io = socketio(Server)


var roomslist=[]

// Check for winner
function check(x,o){
    var win = [["01","02","03"],["04","05","06"],["07","08","09"],["01","04","07"],["02","05","08"],["03","06","09"],["01","05","09"],["03","05","07"]]
    var value=""
    win.forEach(i => {
        var countX = 0
        var countO = 0
        i.forEach(j =>{
            if (x.includes(j)){
                countX = countX + 1
            }else if (o.includes(j)){
                countO = countO + 1
            }
        })
        if (countX == 3){
            value = ["X",i]
            
        }else if (countO == 3){
            value = ["O",i]
        }
    });
    if (value == ""){
        value = "No winner"
    }
    return value
}





// Socket.io
io.on("connection",(socket)=>{
    console.log(socket.id,"Socket COnnected")
    socket.emit("messageFromServer",{data:"Thanks for connecting CLient!!"})
    socket.on("messageToServer",(data)=>{
        console.log(data)
    })
    socket.on("createGame",(data)=>{
        var room = randomString({length:4})
        console.log(room)
        roomslist.push(room)
        socket.join(room)
        socket.emit("gameCreated",{"room":room,"Player1": data.name})
    })
    socket.on("joinGame",(data)=>{
        var room = data.room
        var player2 = data.player2

        if (roomslist.includes(room) == true ){
            if (io.sockets.adapter.rooms.get(room).size < 2){
                io.to(room).emit("arrange",{"player2":player2,"room":room})
                socket.join(room)
                console.log("Joined room")
            }else{
                socket.emit("roomFull",{data:"Room Full"})
            }

        }else{
            console.log(roomslist)
            socket.emit("wrongRoom",{data: "Wrong room dude"})
        }
        
    })

    socket.on("playerAlreadyLeft",(message)=>{
        console.log("IT WORked")
        if (message.wrongName){
            socket.broadcast.to(message.room).emit("wrongName",{data:"Wrong Name"})
        }
        socket.broadcast.to(message.room).emit("details",message)
    })

    socket.on("p1Detail",(data)=>{
        socket.broadcast.to(data.room).emit("details",data)
    })
    socket.on("game",(data)=>{
        var x = data.xList.sort()
        var o = data.oList.sort()
        var checking = check(x,o)
        if (checking == "No winner"){
            if ((x.length + o.length) == 9){
                if (data.X){
                    io.to(data.room).emit("winner",{"winner": "draw","X":data.X})
                }else{
                    io.to(data.room).emit("winner",{"winner": "draw","Y":data.Y})                    
                }
            }else{
                socket.broadcast.to(data.room).emit("game",data)
            }
        }else{
            if (checking[0] == "X"){
                io.to(data.room).emit("winner",{"winner": checking[0],"who":checking[1],"X":data.X})
            }else{
                io.to(data.room).emit("winner",{"winner": checking[0],"who":checking[1],"Y":data.Y})                
            }
        }
    })
    socket.on("disconnecting",()=>{
        for (const room of socket.rooms){
            if (room !== socket.id){
                if (io.sockets.adapter.rooms.get(room).size == 1){
                    var index = roomslist.indexOf(room)
                    if (index > -1){
                        roomslist.splice(index,1)
                    }
                }
                console.log(io.sockets.adapter.rooms.get(room).size + "Number of players")
                console.log(roomslist)
                io.to(room).emit("playerLeft")
            }
        }
        console.log(socket.id +"Has left the Server")
    })

})

app.get("/",(req,res)=>{
    res.sendFile(__dirname + "/Public/Game.html")
})