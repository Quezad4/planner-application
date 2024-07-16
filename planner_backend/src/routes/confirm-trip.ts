import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { z } from "zod";
import nodemailer from 'nodemailer'
import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";
import dayjs from "dayjs"
import 'dayjs/locale/pt-br'
import { ClientError } from "../errors/client-error";
import { env } from "../env";



dayjs.extend(localizedFormat)
dayjs.locale('pt-br')

export async function confirmTrip(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/confirm', {
        schema :{
            params : z.object({
                tripId : z.string().uuid(),
            })
        }
    }, async (request, reply)=>{

        const {tripId} = request.params
        const trip = await prisma.trip.findUnique({
            where:{
                id : tripId,
            },
            include :{
                participants :{
                    where :{
                        is_owner : false
                    }
                }
            }
        })

        if(!trip){
            throw new ClientError ("Trip not exists")
        }

        if(trip.isConfirmed){
            return reply.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`)
        }

        await prisma.trip.update({
            where :{
                id : tripId
            },
            data :{
                isConfirmed : true,
            }
        })

        const formatedStartDate = dayjs(trip.starts_at).format('LL')
        const formatedEndDate = dayjs(trip.ends_at).format('LL')

        
        const mail = await getMailClient()


        await Promise.all(trip.participants.map(async (participant) => {
            const confirmationLink = `${env.API_BASE_URL}/${participant.id}/confirm`
            const message = await mail.sendMail({
                from: {
                    name : 'Equipe plann.er',
                    address : 'oi@planner.com'
                },
                to : participant.email,
                subject : `Confirme sua presença na viagem para ${trip.destination}`,
                html : `
                    <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
                        <p>Você foi convidado(a) para um viagem com destino a <strong> ${trip.destination} </strong> nas datas de <strong>  ${formatedStartDate}</strong>  até <strong> ${formatedEndDate}. </strong> </p>
                        <p></p>
                        <p>Para confirmar sua viagem clique no link abaixo: </p>
                        <p></p>
                        <p>
                            <a href="${confirmationLink}">Confimar viagem!</a>
                        </p>
                        <p></p>
                        <p>Caso você não saiba do que se trata esse e-mail, por favor, apenas o ignore.</p>
                    </div>
                `.trim()
            })
    
            console.log(nodemailer.getTestMessageUrl(message))
        }))

        return reply.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`)
    })
}


