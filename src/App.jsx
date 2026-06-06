import { useState, useEffect } from 'react'
import axios from 'axios'
import Player from './Player'
import Admin from './Admin'
import AdminLogin from './AdminLogin'

const API = "http://192.168.1.45:3001"

export default function App(){

  const [view,setView] = useState("home")
  const [adminOk,setAdminOk] = useState(false)
  const [matches,setMatches] = useState([])

  useEffect(()=>{
    axios.get(API + '/matches').then(r=>setMatches(r.data))
  },[])

  return (
    <div>

      {/* HOME */}
      {view === "home" && (
        <div style={container}>

          <h1 style={title}>Apuestas Mundialista</h1>

          <p style={subtitle}>
            Pronostica partidos y gana
          </p>

          <div style={pagoBox}>
            <strong>$5.000 por apuesta</strong>
            <div style={{marginTop:"4px"}}>
              Nequi: 3146051396
            </div>
          </div>

          {matches.map(m => {

            const cerrado = new Date(m.limite) < new Date()

            return (
              <div key={m.id} style={matchCard}>

                <div style={teams}>
                  {m.equipo1}
                  <span style={vs}>VS</span>
                  {m.equipo2}
                </div>

                <div style={date}>
                  {new Date(m.limite).toLocaleString()}
                </div>

                <div style={{
                  marginTop:"6px",
                  color: cerrado ? "#ef4444" : "#22c55e"
                }}>
                  {cerrado ? "Cerrado" : "Disponible"}
                </div>

              </div>
            )
          })}

          <button style={btn} onClick={()=>setView("player")}>
            Entrar como jugador
          </button>

          <button style={btn} onClick={()=>setView("admin")}>
            Modo administrador
          </button>

        </div>
      )}

      {/* PLAYER */}
      {view === "player" && (
        <>
          <button style={backBtn} onClick={()=>setView("home")}>
            ← Volver
          </button>

          <Player/>
        </>
      )}

      {/* ADMIN */}
      {view === "admin" && (
        <>
          <button
            style={backBtn}
            onClick={()=>{
              setAdminOk(false)
              setView("home")
            }}
          >
            ← Volver
          </button>

          {adminOk
            ? <Admin/>
            : <AdminLogin onLogin={()=>setAdminOk(true)} />
          }
        </>
      )}

    </div>
  )
}


// 🎨 ESTILOS OPTIMIZADOS PARA CELULAR

const container={
  minHeight:"100vh",
  display:"flex",
  flexDirection:"column",
  alignItems:"center",
  gap:"25px",
  background:"#020617",
  paddingTop:"60px",
  color:"#fff"
}

const title={
  fontSize:"26px",
  fontWeight:"700"
}

const subtitle={
  color:"#94a3b8"
}

const pagoBox={
  background:"#166534",
  padding:"16px",
  borderRadius:"12px",
  width:"90%",
  maxWidth:"360px",
  textAlign:"center"
}

const matchCard={
  background:"#1e293b",
  padding:"16px",
  borderRadius:"12px",
  width:"90%",
  maxWidth:"360px",
  textAlign:"center",
  display:"flex",
  flexDirection:"column",
  gap:"6px"
}

const teams={
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  gap:"6px",
  fontWeight:"600"
}

const vs={
  background:"#f97316",
  padding:"2px 6px",
  borderRadius:"6px",
  fontSize:"12px"
}

const date={
  fontSize:"12px",
  color:"#94a3b8"
}

const btn={
  width:"90%",
  maxWidth:"360px",
  padding:"14px",
  borderRadius:"10px",
  border:"none",
  background:"#0284c7",
  color:"#fff",
  cursor:"pointer",
  fontSize:"16px"
}

/* ✅ móvil-friendly */
const backBtn={
  position:"fixed",
  top:"15px",
  left:"15px",
  padding:"6px 12px",
  borderRadius:"8px",
  border:"none",
  background:"#1e293b",
  color:"#fff",
  cursor:"pointer",
  zIndex:1000
}