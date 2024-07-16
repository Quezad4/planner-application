import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/pt-br';

import { date, z } from "zod";
import dayjs from "dayjs";

import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";



dayjs.extend(localizedFormat)
dayjs.locale('pt-br')

export async function getParticipants(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/participants', {
        schema :{
            params : z.object({
                tripId : z.string().uuid()
            }),
        }
    }, async (request)=>{
        const {tripId} = request.params
        
        const trip = await prisma.trip.findUnique({
            where: {id : tripId},
            include :  {
                participants :{
                    select : {
                        id : true,
                        name : true,
                        email : true,
                        is_confirmed : true

                    }
                }
            }
        })

        if(!trip){
            throw new ClientError ("Trip not exists")
        }
         
        return {
            participants : trip.participants
        }
    })
}


