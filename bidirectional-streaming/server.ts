import path from 'path'
import * as grpc from "@grpc/grpc-js"
import * as protoLoader from "@grpc/proto-loader"
import {ProtoGrpcType} from "./proto/random"
import {RandomHandlers} from './proto/randomPackage/Random'
import { TodoResponse } from './proto/randomPackage/TodoResponse'
import { TodoRequest } from './proto/randomPackage/TodoRequest'
import { ChatRequest } from './proto/randomPackage/ChatRequest'
import { ChatResponse } from './proto/randomPackage/ChatResponse'

const PORT=8082;
const PROTO_FILE=path.join(__dirname,'proto','random.proto');
const packageDef=protoLoader.loadSync(path.resolve(PROTO_FILE));
const grpcObj= (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType;
const randomPackage = grpcObj.randomPackage;

function main(){
    const server=getServer();
    server.bindAsync(`0.0.0.0:${PORT}`,grpc.ServerCredentials.createInsecure(),(err,port)=>{
        if(err){
            console.error(err);
            return
        }
        console.log(`Your server has stared on port ${port}`)
    })
}
const todoList:TodoResponse={todos:[]}
const callObjByUsername=new Map<string, grpc.ServerDuplexStream<ChatRequest,ChatResponse>>()

function getServer(){
    const server=new grpc.Server();
    server.addService(randomPackage.Random.service, {
        RandomNumbers:(call)=>{
            const{maxVal=10}=call.request
            console.log({maxVal})
            let runCount=0;
        
            const id=setInterval(()=>{
                runCount=runCount+1;
                call.write({num:Math.floor(Math.random()*maxVal)})
                if(runCount>=10){
                    clearInterval(id)
                    call.end();
                }
            },500)
        },
        TodoList:(call,callback)=>{
            call.on("data",(chunk:TodoRequest)=>{
                todoList.todos?.push(chunk)
                console.log(chunk)
            })
            call.on("end",()=>{
                callback(null,{todos: todoList.todos})
            })
        },
        Chat:(call)=>{
            call.on("data",(req:ChatRequest)=>{
                const username= call.metadata.get('username')[0] as string
                const message= req.message
                console.log(username,req.message)

                //broadcast the message to everyone else
                for(let [user,usersCall] of callObjByUsername){
                    if(username!=user){
                        usersCall.write({
                            username,message
                        })
                    }
                }
                if (callObjByUsername.get(username)==undefined){
                    callObjByUsername.set(username,call)
                }
            })

            call.on("end",()=>{
                const username= call.metadata.get('username')[0] as string
                for(let [user,usersCall] of callObjByUsername){
                    usersCall.write({
                        username,message:"Has left the chat"
                    })
                }
                callObjByUsername.delete(username)
                console.log(`${username} is ending their chat session.`)
                call.write({
                    username:"Server",
                    message:`See you later ${username}`
                })
                call.end()
            })
        }
    } as RandomHandlers)
    return server;
}
main();