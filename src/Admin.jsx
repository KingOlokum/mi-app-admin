import { useState, useEffect } from "react"
import axios from "axios"

const API = "https://mi-app-admin.onrender.com"

export default function Admin(){

  const [matches,setMatches] = useState([])

  const [form,setForm] = useState({
    equipo1:"",
    equipo2:"",
    limite:""
  })

  useEffect(()=>{
    cargar()
  },[])

  const cargar = ()=>{
    axios.get(API+"/matches").then(r=>{
      setMatches(r.data || [])
    })
  }

  const crear = async ()=>{
    await axios.post(API+"/admin/match",form)
    cargar()
  }

  const cerrar = async (id)=>{
    await axios.post(API+"/admin/cerrar/"+id)
    cargar()
  }

  const borrar = async (id)=>{
    await axios.delete(API+"/admin/match/"+id)
    cargar()
  }

  return (
    <div style={{padding:20,color:"#fff"}}>

      <h2>Panel Admin</h2>

      <input
        placeholder="Equipo 1"
        onChange={e=>setForm({...form,equipo1:e.target.value})}
      />

      <input
        placeholder="Equipo 2"
        onChange={e=>setForm({...form,equipo2:e.target.value})}
      />

      <input
        type="datetime-local"
        onChange={e=>setForm({...form,limite:e.target.value})}
      />

      <button onClick={crear}>Crear</button>

      <h3>Partidos</h3>

      {matches.map(m=>(
        <div key={m.id}>
          {m.equipo1} vs {m.equipo2}

          <button onClick={()=>cerrar(m.id)}>Cerrar</button>
          <button onClick={()=>borrar(m.id)}>Borrar</button>
        </div>
      ))}

    </div>
  )
}