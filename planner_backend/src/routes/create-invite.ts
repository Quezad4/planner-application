import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import 'dayjs/locale/pt-br';

import { z } from "zod";
import nodemailer from 'nodemailer'

import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";
import dayjs from "dayjs";
import { ClientError } from "../errors/client-error";
import { env } from "../env";



export async function createInvite(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/invites', {
        schema :{
            params : z.object({
                tripId : z.string().uuid()
            }),
            body : z.object({
                email : z.string().email()
            }),
        },
    }, async (request)=>{
        const {tripId} = request.params
        const {email} = request.body
        
        const trip = await prisma.trip.findUnique({
            where: {id : tripId}
        })

        if(!trip){
            throw new ClientError ("Trip not exists")
        }

        const participant = await prisma.participant.create({
            data : {
                email,
                trip_id : tripId,
            }
        })
            

        const formatedStartDate = dayjs(trip.starts_at).format('LL')
        const formatedEndDate = dayjs(trip.ends_at).format('LL')

        
        const mail = await getMailClient()


      
        const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`
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
      

        return {
            participant : participant.id
        }
    })
}


