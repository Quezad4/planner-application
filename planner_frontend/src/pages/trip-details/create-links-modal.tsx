import { useParams } from "react-router-dom"
import { api } from "../../lib/axios"
import { Button } from "../../components/button"
import { FormEvent } from "react"
import { Captions, Link, X } from "lucide-react"



interface CreateLinksModalProps{
    closeCreateLinksModal : () => void
}



export function CreateLinksModal({
    closeCreateLinksModal
} : CreateLinksModalProps){


    const { tripsID } = useParams()

    async function createLink(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const data = new FormData(event.currentTarget)

        const title = data.get('title')?.toString()
        const url = data.get('url')?.toString()
      
        await api.post(`/trips/${tripsID}/links`, {
          title,
          url
        })
    
        window.document.location.reload()
      }

      return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="w-[640px] rounded-xl py-5 px-6 shadow-shape bg-zinc-900 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-lg font-semibold">Cadastrar Link</h2>
                <button>
                  <X className="size-5 text-zinc-400" onClick={closeCreateLinksModal} />
                </button>
              </div>
    
              <p className="text-sm text-zinc-400">
                Todos convidados podem visualizar os links.
              </p>
            </div>
            
            <form onSubmit={createLink} className="space-y-3">
              <div className="h-14 px-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2">
                <Captions className="text-zinc-400 size-5" />
                <input
                  name="title"
                  placeholder="Qual o título?"
                  className="bg-transparent text-lg placeholder-zinc-400 outline-none flex-1"
                />
              </div>
    
              <div className="h-14 flex-1 px-4 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-2">
                <Link className="text-zinc-400 size-5" />
                <input
                  type="url"
                  name="url"
                  placeholder="Link"
                  className="bg-transparent text-lg placeholder-zinc-400 outline-none flex-1"
                />
              </div>
    
              <Button size="full">
                Salvar link
              </Button>
            </form>
          </div>
        </div>
      )
}