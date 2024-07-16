import { Link2} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../lib/axios";




interface Link{
    id : string;
    title : string;
    url : string
}



export function ImportantLink(){



    const { tripsID } = useParams()
    const [links, setLinks] = useState<Link[]>([])

    useEffect(() => {
        api.get(`trips/${tripsID}/links`).then(response => setLinks(response.data.links))
    }, [tripsID])
    return (
        <div className="space-y-6">
            <h2 className="font-semibold text-xl">Links Importantes</h2>
            {links.map( link => {
                return (
                    <div className="space-y-5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1.5">
                            <span className="block font-medium text-zinc-100"> {link.title} </span>
                            <a href = '#' className="block text-xs text-zinc-400 truncate hover:text-zinc-200">{link.url}</a>
                        </div>
                        <Link2 className="text-zinc-400 shrink-0"/>
                    </div>
                </div>
                )
            })}
            

        </div>
    )
}