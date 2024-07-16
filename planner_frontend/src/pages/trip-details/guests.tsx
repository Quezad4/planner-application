import { CheckCircle2, CircleDashed } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../lib/axios";
import { useParams } from "react-router-dom";


interface Participants{
    id: string
    name: string | null
    email: string
    is_confirmed: boolean
}





export function Guests(){


    const {tripsID} = useParams()
    const [participants, setParticipants] = useState<Participants[]>([])


    
    useEffect(() => {
        api.get(`/trips/${tripsID}/participants`).then(response => setParticipants(response.data.participants))
    }, [tripsID])


    return (
        <div className="space-y-6">
            <h2 className="font-semibold text-xl">Convidados</h2>
            <div className="space-y-5">
              {participants.map((participant,index) => {
                return (
                    <div key = {participant.id} className="flex items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <span className="block font-medium text-zinc-100">{participant.name ?? `Convidado ${index}`}</span>
                        <span className="block text-xs text-zinc-400 truncate">{participant.email}</span>
                    </div>
                    {participant.is_confirmed ? (
                        <CheckCircle2 className = "size-5 shrink-0 text-green-400" /> 
                    ) : (
                        <CircleDashed className = "size-5 shrink-0 text-green-400" /> 
                    )}
                </div>
                )
              })}
            </div>

            
        </div>
    )
}