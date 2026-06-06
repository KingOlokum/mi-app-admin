import { useEffect, useState } from 'react'
import axios from 'axios'

const API = "https://mi-app-admin.onrender.com"

export default function Admin(){

  const [matches,setMatches] = useState([])
  const [bets,setBets] = useState([])
  const [total,setTotal] = useState(0)

  const [form,setForm] = useState({
    equipo1:"",
    equipo2:"",
    limite:""
  })

  const load=()=>{
    axios.get(API+'/matches').then(r=>setMatches(r.data))
    axios.get(API+'/bets').then(r=>setBets(r.data))
    axios.get(API+'/total').then(r=>setTotal(r.data.total))
  }

  useEffect(()=>{ load() },[])

  const crear=()=>{
    axios.post(API+'/admin/match',form).then(()=>{
      setForm({equipo1:"",equipo2:"",limite:""})
      load()
    })
  }

  const borrar=id=>{
    axios.delete(API+'/admin/match/'+id).then(load)
  }

  const pagar=b=>{
    axios.post(API+'/admin/pago',{
      telefono:b.telefono,
      matchId:b.matchId
    }).then(load)
  }

  return (
    <div className="card">

      <h2>Administración</h2>

      <h3>Total: ${total}</h3>

      <input
        placeholder="Equipo 1"
        value={form.equipo1}
        onChange={e=>setForm({...form,equipo1:e.target.value})}
      />

      <input
        placeholder="Equipo 2"
        value={form.equipo2}
        onChange={e=>setForm({...form,equipo2:e.target.value})}
      />

      <input
        type="datetime-local"
        value={form.limite}
        onChange={e=>setForm({...form,limite:e.target.value})}
      />

      <button onClick={crear}>Crear partido</button>

      <h3>Partidos</h3>

      {matches.map(m=>(
        <div key={m.id} className="box">
          {m.equipo1} vs {m.equipo2}
          <button onClick={()=>borrar(m.id)}>Eliminar</button>
        </div>
      ))}

      <h3>Apuestas</h3>

      {bets.map((b,i)=>(
        <div key={i} className="box">
          {b.usuario} - {b.resultado}

          {b.pagado
            ? " ✅"
            : <button onClick={()=>pagar(b)}>Pagar</button>
          }
        </div>
      ))}

      <a href={API+"/export"}>
        <button>Descargar Excel</button>
      </a>

    </div>
  )
}
