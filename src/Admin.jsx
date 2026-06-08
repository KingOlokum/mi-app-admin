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

  const cargar = async ()=>{
    const r = await axios.get(API+"/matches")
    setMatches(r.data || [])
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

      <h2>Admin</h2>

      <button onClick={crear}>Crear partido</button>

      {matches.map(m=>(
        <div key={m.id}>

          {m.equipo1} vs {m.equipo2} - {m.cerrado ? "CERRADO" : "ABIERTO"}

          <br/>

          <button onClick={()=>cerrar(m.id)}>
            Cerrar
          </button>

          <button onClick={()=>borrar(m.id)}>
            Borrar
          </button>

        </div>
      ))}

    </div>
  )
}