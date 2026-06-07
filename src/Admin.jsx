import { useState, useEffect } from "react"
import axios from "axios"

const API = "https://mi-app-admin.onrender.com"

export default function Admin(){

  const [matches,setMatches] = useState([])

  useEffect(()=>{
    axios.get(API + "/matches")
      .then(r => setMatches(r.data || []))
  },[])

  const cerrar = async (id)=>{
    await axios.post(API + "/admin/cerrar/" + id)

    const r = await axios.get(API + "/matches")
    setMatches(r.data || [])
  }

  const borrar = async (id)=>{
    await axios.delete(API + "/admin/match/" + id)

    const r = await axios.get(API + "/matches")
    setMatches(r.data || [])
  }

  return (
    <div style={{padding:20,color:"#fff"}}>

      <h2>Panel de administración</h2>

      <h3>Partidos</h3>

      {matches.map(m=>(
        <div key={m.id} style={{
          background:"#1e293b",
          padding:"10px",
          borderRadius:"10px",
          marginBottom:"10px"
        }}>

          <div>{m.equipo1} vs {m.equipo2}</div>

          <div style={{fontSize:"12px"}}>
            {new Date(m.limite).toLocaleString()}
          </div>

          <div style={{marginTop:"6px"}}>
            {m.cerrado ? "Cerrado ❌" : "Disponible ✅"}
          </div>

          <div style={{marginTop:"8px",display:"flex",gap:"10px"}}>

            <button onClick={()=>cerrar(m.id)}>
              Cerrar
            </button>

            <button onClick={()=>borrar(m.id)}>
              Borrar
            </button>

          </div>

        </div>
      ))}

    </div>
  )
}