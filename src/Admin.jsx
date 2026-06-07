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

  // ✅ Cargar datos
  useEffect(()=>{
    cargarTodo()
  },[])

  const cargarTodo = async ()=>{
    try{
      const m = await axios.get(API+"/matches")
      setMatches(m.data || [])

      const b = await axios.get(API+"/bets")
      setBets(b.data || [])
    }catch(e){
      console.log(e)
    }
  }

  // ✅ Crear partido
  const crear = async ()=>{
    await axios.post(API+"/admin/match",form)
    setForm({equipo1:"",equipo2:"",limite:""})
    cargarTodo()
  }

  // ✅ Cerrar
  const cerrar = async (id)=>{
    await axios.post(API+"/admin/cerrar/"+id)
    cargarTodo()
  }

  // ✅ Borrar
  const borrar = async (id)=>{
    await axios.delete(API+"/admin/match/"+id)
    cargarTodo()
  }

  return (
    <div style={container}>

      <div style={card}>

        <h2>Panel de administración</h2>

        {/* FORM */}
        <input
          style={input}
          placeholder="Equipo 1"
          value={form.equipo1}
          onChange={e=>setForm({...form,equipo1:e.target.value})}
        />

        <input
          style={input}
          placeholder="Equipo 2"
          value={form.equipo2}
          onChange={e=>setForm({...form,equipo2:e.target.value})}
        />

        <input
          style={input}
          type="datetime-local"
          value={form.limite}
          onChange={e=>setForm({...form,limite:e.target.value})}
        />

        <button style={btn} onClick={crear}>
          Crear partido
        </button>

        {/* PARTIDOS */}
        <h3 style={{marginTop:20}}>Partidos</h3>

        {matches.map(m=>(
          <div key={m.id} style={matchBox}>

            <div style={{fontWeight:"600"}}>
              {m.equipo1} vs {m.equipo2}
            </div>

            <div style={{fontSize:"12px"}}>
              {new Date(m.limite).toLocaleString()}
            </div>

            <div style={{marginTop:6}}>
              {m.cerrado ? "Cerrado ❌" : "Disponible ✅"}
            </div>

            <div style={{display:"flex",gap:8,marginTop:8}}>

              <button style={btnSmall} onClick={()=>cerrar(m.id)}>
                Cerrar
              </button>

              <button style={btnDanger} onClick={()=>borrar(m.id)}>
                Borrar
              </button>

            </div>

          </div>
        ))}

        {/* APUESTAS */}
        <h3 style={{marginTop:20}}>Apuestas</h3>

        {bets.map((b,i)=>(
          <div key={i} style={betBox}>

            <div><b>{b.usuario}</b></div>
            <div>{b.telefono}</div>
            <div>{b.resultado}</div>

          </div>
        ))}

      </div>
    </div>
  )
}


// 🔧 ESTILOS

const container={
  minHeight:"100vh",
  display:"flex",
  justifyContent:"center",
  paddingTop:"60px",
  background:"#020617"
}

const card={
  background:"#0f172a",
  padding:"25px",
  borderRadius:"16px",
  width:"380px",
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
  cursor:"pointer",
  marginTop:"5px"
}

const btnSmall={
  padding:"6px 10px",
  border:"none",
  borderRadius:"6px",
  background:"#facc15",
  color:"#000",
  cursor:"pointer"
}

const btnDanger={
  padding:"6px 10px",
  border:"none",
  borderRadius:"6px",
  background:"#ef4444",
  color:"#fff",
  cursor:"pointer"
}

const matchBox={
  background:"#1e293b",
  padding:"12px",
  borderRadius:"10px"
}

const betBox={
  background:"#020617",
  padding:"8px",
  borderRadius:"8px",
  fontSize:"12px"
}