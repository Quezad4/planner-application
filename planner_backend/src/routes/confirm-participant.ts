import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { z } from "zod";
import { prisma } from "../lib/prisma";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import { ClientError } from "../errors/client-error";
import { env } from "../env";



dayjs.extend(localizedFormat)
dayjs.locale('pt-br')

export async function confirmParticipant(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().get('/participants/:participantId/confirm', {
        schema :{
            params : z.object({
                participantId : z.string().uuid(),
            })
        }
    }, async (request, reply)=>{

        const {participantId} = request.params
        
           
        const participant = await prisma.participant.findUnique({
            where :{
                id : participantId,
            }
        })

        if(!participant){
            throw new ClientError("Participant not found")
        }

        if(participant.is_confirmed){
            return reply.redirect(`${env.WEB_BASE_URL}/${participant.trip_id}`)
        }

        await prisma.participant.update({
            where : {id : participant.id},
            data : {is_confirmed : true}
        })
        return reply.redirect(`${env.WEB_BASE_URL}/${participant.trip_id}`)
    })
}


