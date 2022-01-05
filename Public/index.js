$(".notice").hide()
$(".display").hide()
$(".ranking").hide()
$(".left").hide()
$(".Ox").hide()


var Totalgames = 0
var draw = 0
var myScore = 0  
var  Player = "X"
var myTurn = false
var xList=[]
var oList = []
var myTurnCopy
var playerLeft = false


// To DO
// Allow player to choose X or O during each game alternatively
// Fix Join error after leaving if player1 has not chosen options


var myname = ""
var oppname = ""
var room = ""


// Client Socket connection
const socket= io("http://localhost:3000")
socket.emit("messageToServer",{data:"Messge from Clinet dude!"})
socket.on("messageFromServer",(data)=>{
        console.log(data)
})


//Creating Game
document.getElementById("createSubmit").addEventListener("click",(event)=>{
    myname = document.getElementById("createName").value
    if (myname == ""){
        alert("Plz enter name . name cannot ve null")
    }
    else{
        socket.emit("createGame",{"name":myname})
    }
})
socket.on("gameCreated",(data)=>{
    $(".start").hide()
    $(".notice").show()
    $(".Ox").show()
    $(".notice").html("<h1> Hey, " + data.Player1 + ". Please ask your friend to enter Game ID: " + data.room +". Waiting for player 2...</h1>")
})

//Joining Game
document.getElementById("joinSubmit").addEventListener("click",()=>{
    myname = document.getElementById("joinName").value
    if (myname == ""){
        alert("Plz enter name . Name cannot Be Empty")
    }
    else{
        const room = document.getElementById("joinRoom").value
        socket.emit("joinGame",{"player2":myname,"room":room})
    }

})
function showRanking(){
        $(".rankingPlayer1").html("<h1 class='rankingh1'>"+ myname + " : " + myScore +"</h1>")
        $(".rankingPlayer2").html("<h1 class='rankingh1'>" + oppname + " : "+ (Totalgames - myScore - draw)+ "</h1>")
}
// Player 1 Sends Details
socket.on("arrange",(data)=>{
    if (playerLeft == false){
        oppname = data.player2
        room =data.room
        $(".notice").hide()
        $(".display").show()
        showRanking()
        $(".ranking").show()
        myTurn = true
        socket.emit("p1Detail",{"player1":myname,"player2":oppname,"room":data.room})
    }else{
        myTurn = myTurnCopy
        console.log(myTurn+"MyTurn")
        if (myTurn == false){

            $(".display").html("<h1> Opponent's Turn</h1>")
        }else{
            $(".display").html("<h1> Your Turn</h1>")
        }

        $(".display").show()
        $(".notice").hide()
        console.log(xList + " : XList , OList : " + oList)
        if (oppname == data.player2 ){
            socket.emit("playerAlreadyLeft",{"xList":xList,"oList":oList,"myScore":myScore,"TotalGames":Totalgames,"draw":draw,"oppName":oppname,"Player":Player,"myTurn":myTurn,"player1":myname,"room":data.room})
        }else{
            socket.emit("playerAlreadyLeft",{"xList":xList,"oList":oList,"myScore":myScore,"TotalGames":Totalgames,"draw":draw,"oppName":oppname,"Player":Player,"myTurn":myTurn,"player1":myname,"room":data.room,"wrongName":true})
        }
        console.log("Sent")
    }
})

// Get Player 1 Details
socket.on("details",(data)=>{
    console.log("GOT back")
    if (data.Player){
        console.log("Yes")
        xList = data.xList
        oList = data.oList
        Totalgames = data.TotalGames
        draw = data.draw
        oppname = data.player1
        room = data.room
        myScore = (Totalgames - (data.myScore)) -draw
        if (data.Player == "X"){
            Player = "O"
        }else{
            Player = "X"
        }
        $(".start").hide()
        showRanking()
        $(".ranking").show()
        console.log(xList + " : XList , OList : " + oList)

        if (data.myTurn == true){
            myTurn = false
            $(".display").html("<h1> Opponent's Turn</h1>")
        }else{
            myTurn = true
            $(".display").html("<h1> Your Turn</h1>")
        }

        $(".display").show()

        xList.forEach(i=>{
            $("#"+ i).html("<div class='PlayerX'></div>")
        })
        oList.forEach(i=>{
            $("#"+ i).html("<i class='far fa-circle'></i>")
        })
        $(".Ox").show()
    }else{
        oppname  =  data.player1
        room = data.room
        $(".start").hide()
        showRanking()
        $(".ranking").show()
        $(".display").html("<h1> Opponent's Turn</h1>")
        $(".display").show()
        $(".Ox").show()
        Player = "O"   
    }
})




// Alerts
socket.on("wrongRoom",(data)=>{
    alert("Given room does not exist")
})
socket.on("roomFull",(data)=>{
    console.log(data.data)
    alert("Room Full")
})
socket.on("wrongName",(data)=>{
    console.log(data)
    alert("We have detected that you have provided a different name from the previous Game. Avoid Doing that in further games to avoid confusion.")
})

// Game playing
socket.on("game",(data)=>{
    if (data.X){
        $("#"+ data.X).html("<div class='PlayerX'></div>")
        xList.push(data.X)
        console.log("xList"+ xList)
    }else if (data.Y){
        $("#"+ data.Y).html("<i class='far fa-circle'></i>")
        oList.push(data.Y)
        console.log("oList"  + oList)
    }
    $(".display").html("<h1>Your Turn</h1>")
    myTurn = true    
})

// Player left
socket.on("playerLeft",()=>{
    myTurnCopy = myTurn
    console.log("Copy:" + myTurnCopy)
    myTurn = false
    playerLeft = true
    alert("Opponent has left the Game")

    // Show left notice
    $(".notice").hide()
    $(".display").hide()
    $(".ranking").hide()
    $(".start").hide()
    $(".Ox").hide()
    $(".left").show()

    document.getElementById("leftWait").addEventListener("click",()=>{
        $(".left").hide()
        $(".notice").html("<h1>Waiting for Opponent to reconnect. Room id: "+ room +"</h1>")
        $(".notice").show()
        $(".ranking").show()
        $(".Ox").show()
    })

    document.getElementById("leftReturn").addEventListener("click",()=>{
        window.location.href = "/"
    })
   
})

//  XO Game

function check(id){
    if (document.getElementById(id).childElementCount == 0 && myTurn == true){
        if (Player == "X"){
            document.getElementById(id).innerHTML = "<div class='PlayerX'></div>"
            xList.push(id)
            console.log(xList)
            socket.emit("game",{"room":room,"X" : id,"xList":xList,"oList":oList})
            $(".display").html("<h1> Opponent's Turn</h1>")
            myTurn = false

        }
        else {
            if (Player == "O"){
                document.getElementById(id).innerHTML = "<i class='far fa-circle'></i>"
                // For SinglePlayer Switching Player
                // Player="X" 
                oList.push(id)
                console.log(oList)
                socket.emit("game",{"room":room,"Y" : id,"xList":xList,"oList":oList})
                $(".display").html("<h1> Opponent's Turn</h1>")
                myTurn = false
            }
        }
        
    }
    
}

const butons = document.getElementsByClassName("buton")
for (let i = 0; i < butons.length; i++) {
    const id = butons[i].id;
    document.getElementById(id).addEventListener("click",(event)=>{
        check(id)
    })
    
}



// Winner Check
socket.on("winner",(data)=>{
    // Displaying final item for the loser
    if (data.X){
        $("#"+ data.X).html("<div class='PlayerX'></div>")
    }else if(data.Y){
        $("#"+ data.Y).html("<i class='far fa-circle'></i>")
    } 
    var winner = data.winner
    // Ranking Display
    Totalgames++
    if (winner == "draw"){
        draw++
    }else{
        if (winner == Player){
            myScore++
            console.log(myScore,Totalgames,draw)
        }
    }
    showRanking()


    if (winner == "draw"){
        $(".display").html("<h1> Its a DRAW </h1>")
    }else{
        var who = data.who 

        // Highlight win boxes
        who.forEach(i => {
            document.getElementById(i).classList.add("winner")   
        });
        myTurn == false


        // Display winner names
        if (Player == winner){
            $(".display").html("<h1>"+ myname  +" Wins</h1>")
        }else{
            $(".display").html("<h1>"+ oppname  +" Wins</h1>")        
        }
    }

    // Restart Game
    
    xList = []
    oList = []    


    var counter = 11
    var timer = setInterval(() => {
        
        if (counter ==6){
             $(".display").html("<h1> Restarting Game </h1>")
        } else if(counter == 5){
            $(".display").html("<h1> Switching PlayerMode </h1>")
        }else if(counter == 4){
            if (winner == "draw"){
                $(".display").html("<h1> Alternate Player Starts First </h1>")    
            }else{
                $(".display").html("<h1> Winner Starts First </h1>") 
            }          
        }else if (counter < 4 && counter > 0 ){
            $(".display").html("<h1> Restarting Game  in " + counter + "</h1>")
        }else if (counter == 0){
            $(".buton").html("")
            if (winner != "draw"){
                who.forEach(i=>{
                document.getElementById(i).classList.remove("winner")
                })
                if (Player == "X"){
                    Player = "O"
                }else{
                    Player = "X"
                }
                if (winner != Player){
                    myTurn = true
                    $(".display").html("<h1>Your Turn</h1>")            
                }else{
                    $(".display").html("<h1> Opponent's Turn</h1>")
                    myTurn = false        
                }
            }else{
                if (Player == "X"){
                    Player = "O"
                }else{
                    Player = "X"
                }
                if (data.X){
                    if (Player == "X"){
                        myTurn = true
                        $(".display").html("<h1>Your Turn</h1>")
                    }else {
                        $(".display").html("<h1> Opponent's Turn</h1>")
                        myTurn = false                          
                    }
                }else if (data.Y){
                    if (Player == "O"){
                        myTurn = true
                        $(".display").html("<h1>Your Turn</h1>")
                    }else {
                        $(".display").html("<h1> Opponent's Turn</h1>")
                        myTurn = false                          
                    }                    
                }
            }
            clearInterval(timer)
        }
        
        counter = counter-1
    }, 1000);
})


// Theme Change
document.getElementById("slideTheme").addEventListener("input", function () {
    var theme = this.value
    var common = document.documentElement.style
    if (theme == 1){

        //Theme COlor
        common.setProperty("--body-color","#2E4C6D") 
        common.setProperty("--toggle-background","hsl(223, 31%, 20%)")
        common.setProperty("--toggle-btn","hsl(25, 98%, 40%)")
        common.setProperty("--font-color","hsl(45, 7%, 50%)")
        common.setProperty("--calctxt-color","#4B6587")
        common.setProperty("--hover-color","hsl(225, 21%, 89%)")
        common.setProperty("--buton-color","hsl(45, 7%, 70%)") 

        // Game color
        common.setProperty("--x-color","#FF0000")
        common.setProperty("--o-color","#D89216")
        $(".Submit").css("color","rgba(0,0,0,0.7)")
        $(".startInput").css("color","rgba(0,0,0,0.7)")

        //Box shadow
        $(".buton").css("box-shadow","0 3px hsl(35, 11%, 61%)")
    }
    else if (theme == 2){
        common.setProperty("--body-color","#222222") 
        common.setProperty("--toggle-background","hsl(0, 5%, 81%)")
        common.setProperty("--toggle-btn","hsl(25, 98%, 40%)")
        common.setProperty("--font-color","hsl(0, 5%, 81%)")
        common.setProperty("--calctxt-color","hsl(0, 0%, 10%)")
        common.setProperty("--hover-color","#444444")
        common.setProperty("--buton-color","#2D2D2D")

        // Game color
        common.setProperty("--x-color","hsl(176, 100%, 44%)")
        common.setProperty("--o-color","#FF8303")

        //Box shadow 1px 2px 2px 2px rgba(0, 0, 0, 0.5);
        $(".buton").css("box-shadow","1px 2px 2px 2px rgba(0, 0, 0, 0.5)")
    }
    else if (theme == 3){
        common.setProperty("--body-color","hsl(268, 75%, 9%)") 
        common.setProperty("--calculator-color","hsl(268, 71%, 12%)")
        common.setProperty("--toggle-background","hsl(268, 71%, 12%)")
        common.setProperty("--toggle-btn","hsl(176, 100%, 44%)")
        common.setProperty("--font-color","hsl(52, 100%, 62%)")
        common.setProperty("--calctxt-color","hsl(268, 71%, 12%)")
        common.setProperty("--hover-color","hsl(268, 47%, 29%)")
        common.setProperty("--buton-color","hsl(268, 47%, 21%)")

        // Game color
        common.setProperty("--x-color","hsl(176, 100%, 44%)")
        common.setProperty("--o-color","#FF8303")

        //Box shadow
        $(".buton").css("box-shadow","0 3px hsl(290, 70%, 36%)")
                
    }
})
