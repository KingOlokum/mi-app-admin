import { useState, useEffect } from "react"
import axios from "axios"

const API = "https://mi-app-admin.onrender.com"

export default function Admin(){

  const [matches,setMatches] = useState([])
  const [bets,setBets] = useState([])

  const [form,setForm] = useState({
    equipo1:"",
    equipo2:"",
    limite:""
  })

  const countries = [
    "Colombia","Alemania","Brasil","Argentina","España",
    "Francia","Portugal","Inglaterra","Uzbekistán",
    "RD Congo","Jordania"
  ]

  useEffect(()=>{
    cargar()
  },[])

  const cargar = async ()=>{
    const m = await axios.get(API+"/matches")
    setMatches(m.data || [])

    const b = await axios.get(API+"/bets")
    setBets(b.data || [])
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

      <button onClick={crear}>Crear</button>

      {matches.map(m=>(
        <div key={m.id}>
          {m.equipo1} vs {m.equipo2} - {m.cerrado ? "CERRADO" : "ABIERTO"}

          <button onClick={()=>cerrar(m.id)}>Cerrar</button>
          <button onClick={()=>borrar(m.id)}>Borrar</button>
        </div>
      ))}

    </div>
  )
}