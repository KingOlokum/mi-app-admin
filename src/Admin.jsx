import { useState, useEffect } from "react"
import axios from "axios"

const API = "https://mi-app-admin.onrender.com"

// ✅ LISTA DE PAÍSES (PRO)
const countries = [
  { name: "Colombia", code: "co" },
  { name: "Alemania", code: "de" },
  { name: "Brasil", code: "br" },
  { name: "Argentina", code: "ar" },
  { name: "España", code: "es" },
  { name: "Francia", code: "fr" },
  { name: "Portugal", code: "pt" },
  { name: "Inglaterra", code: "gb" },
  { name: "Uzbekistán", code: "uz" },
  { name: "RD Congo", code: "cd" }
]

export default function Admin(){

  const [matches,setMatches] = useState([])

  // ✅ estados
  const [equipo1,setEquipo1] = useState("")
  const [equipo2,setEquipo2] = useState("")
  const [limite,setLimite] = useState("")

  // ✅ cargar partidos
  useEffect(()=>{
    cargar()
  },[])

  const cargar = async ()=>{
    const r = await axios.get(API+'/matches')
    setMatches(r.data)
  }

  // ✅ crear partido
  const crear = async ()=>{

    if(!equipo1 || !equipo2){
      alert("Selecciona los equipos")
      return
    }

    if(equipo1 === equipo2){
      alert("No pueden ser iguales")
      return
    }

    await axios.post(API+'/admin/match',{
      equipo1,
      equipo2,
      limite
    })

    alert("Partido creado ✅")

    // limpiar
    setEquipo1("")
    setEquipo2("")
    setLimite("")

    cargar()
  }

  // ✅ eliminar
  const eliminar = async (id)=>{
    await axios.delete(API+'/admin/match/'+id)
    cargar()
  }

  // ✅ encontrar código bandera
  const getCode = (name)=>{
    const pais = countries.find(c => c.name === name)
    return pais?.code
  }

  return (
    <div style={wrap}>
      <div style={card}>

        <h3 style={{textAlign:"center"}}>Crear Partido</h3>

        {/* ✅ SELECT EQUIPO 1 */}
        <select
          style={input}
          value={equipo1}
          onChange={e=>setEquipo1(e.target.value)}
        >
          <option value="">Selecciona equipo 1</option>
          {countries.map(c=>(
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        {/* ✅ SELECT EQUIPO 2 */}
        <select
          style={input}
          value={equipo2}
          onChange={e=>setEquipo2(e.target.value)}
        >
          <option value="">Selecciona equipo 2</option>
          {countries.map(c=>(
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        {/* ✅ PREVIEW CON BANDERAS (PRO 🔥) */}
        {(equipo1 && equipo2) && (
          <div style={preview}>

            <div style={teamBox}>
             
              <span>{equipo1}</span>
            </div>

            <span>VS</span>

            <div style={teamBox}>
             
              <span>{equipo2}</span>
            </div>

          </div>
        )}

        {/* ✅ FECHA */}
        <input
          type="datetime-local"
          style={input}
          value={limite}
          onChange={e=>setLimite(e.target.value)}
        />

        <button style={btn} onClick={crear}>
          Crear partido
        </button>

        <h4 style={{marginTop:"10px"}}>Partidos creados</h4>

        {matches.map(m=>(
          <div key={m.id} style={box}>

            <div style={{fontWeight:"600"}}>
              {m.equipo1} VS {m.equipo2}
            </div>

            <button
              style={deleteBtn}
              onClick={()=>eliminar(m.id)}
            >
              Eliminar
            </button>

          </div>
        ))}

      </div>
    </div>
  )
}


// 🎨 ESTILOS

const wrap={
  minHeight:"100vh",
  display:"flex",
  justifyContent:"center",
  alignItems:"flex-start",
  paddingTop:"80px",
  background:"#020617"
}

const card={
  background:"#0f172a",
  padding:"20px",
  borderRadius:"16px",
  width:"350px",
  color:"#fff",
  display:"flex",
  flexDirection:"column",
  gap:"10px"
}

const input={
  padding:"10px",
  borderRadius:"8px",
  border:"1px solid #334155",
  background:"#020617",
  color:"#fff"
}

const btn={
  padding:"10px",
  borderRadius:"10px",
  border:"none",
  background:"#0284c7",
  color:"#fff",
  cursor:"pointer"
}

const box={
  background:"#1e293b",
  padding:"10px",
  borderRadius:"10px",
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center"
}

const deleteBtn={
  background:"#ef4444",
  border:"none",
  color:"#fff",
  padding:"6px 8px",
  borderRadius:"6px",
  cursor:"pointer"
}

const preview={
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  gap:"10px",
  marginTop:"10px"
}

const teamBox={
  display:"flex",
  alignItems:"center",
  gap:"5px"
}