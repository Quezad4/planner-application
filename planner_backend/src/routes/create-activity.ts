import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/pt-br';

import { z } from "zod";
import dayjs from "dayjs";

import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";



dayjs.extend(localizedFormat)
dayjs.locale('pt-br')

export async function createActivity(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/activities', {
        schema :{
            params : z.object({
                tripId : z.string().uuid()
            }),
            body : z.object({
                title : z.string().min(4),
                occurs_at : z.coerce.date(), 
            })
        }
    }, async (request)=>{
        const {tripId} = request.params
        const {title, occurs_at} = request.body
        
        const trip = await prisma.trip.findUnique({
            where: {id : tripId}
        })

        if(!trip){
            throw new ClientError ("Trip not exists")
        }
         
        if(dayjs(occurs_at).isBefore(trip.starts_at)){
            throw new ClientError ("Invalid activity date")
        }

        if(dayjs(occurs_at).isAfter(trip.ends_at)){
            throw new ClientError ("Invalid activity date")
        }

        const activity = await prisma.activity.create({
            data : {
                title,
                occurs_at,
                trip_id : tripId
            }
        })
            
        return {
            activityId : activity.id
        }
    })
}


