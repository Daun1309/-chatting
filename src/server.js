
import http from "http";
// import WebSocket from "ws";
import { Server } from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug"); //view engine을 pug로 설정
app.set("views", __dirname + "/views");  //views 디렉토리 설정
app.use("/public", express.static(__dirname + "/public")); //(FE) public폴더를 유저에게 공개
app.get("/", (req, res) => res.render("home"));
//app.get("/*", (req, res) => res.redirect("/")); //어떤 경로를 입력해도 메인페이지로 이동 

const handleListen = () => console.log(`Listening on http://localhost:3000`)
//http, ws 2개의 프로토콜을 사용(같은 port 공유)
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

function publicRooms(){
    const {sockets : { adapter : {sids, rooms}}} = wsServer;
    const publicRooms = [];
    rooms.forEach((_,key) => {
        if(sids
            .get(key) === undefined){
            publicRooms.push(key)
        }
    })
    return publicRooms
}

wsServer.on("connection", (socket) => {

    socket["nickname"] = "익명의 쀼";
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`)
    });
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname); //한명에게 보내기
        wsServer.sockets.emit("room_change", publicRooms());  //모두에게 보내기
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname))    
    });
    socket.on("disconnect", () => {
         wsServer.sockets.emit("room_change", publicRooms());
    })
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
})

httpServer.listen(3000, handleListen);