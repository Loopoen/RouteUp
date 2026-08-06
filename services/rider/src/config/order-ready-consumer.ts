    import axios from "axios"
    import { Rider } from "../model/Rider"
    import { getChannel } from "./rabbitmq"



    export const startOrderReadyConsumer  = async()=>{
        const channel = getChannel()

    channel.consume(process.env.ORDER_READY_QUEUE!, async(msg)=>{
            if(!msg){
                console.log("chua co msg tai rider")
                return 
            }

            try{
                console.log("nhan duoc msg" ,msg.content.toString)

                const event  = JSON.parse(msg.content.toString())

                console.log("event type", event.type)

                if(event.type !=="ORDER_READY_FOR_RIDER"){
                    console.log("khong tim thay type event")

                    channel.ack(msg)

                    return
                }

                const {orderId,restaurantId, location} = event.data 
                console.log("da nhan duoc data su kien")


                const riders = await Rider.find({
                    isAvailable:true,
                    isVerified:true,
                    location:{
                        $near:{
                            $geometry:location,
                            $maxDistance:500

                        }
                    }
                })

                if(riders.length === 0){
                    console.log("khong co rider nao gan")

                    channel.ack(msg)
                }

                for(const rider of riders){
                    try{
                        await axios.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,{
                            event:"order:available",
                            room:`user:${rider.userId}`,
                            payload:{orderId,restaurantId}
                        },{
                            headers:{
                                "x-internal-key": process.env.INTERNAL_SERVICE_KEY
                            }
                        })

                                console.log("tao phong rider thanh cong")
                    }
                    catch(err){
                        console.log(err)
                    }
                }
                channel.ack(msg)

                console.log("thanh cong")
            }


            catch(err){ 
                console.log("thiet lap order consumer khong thanh cong", err)
            }
    }) 
    }