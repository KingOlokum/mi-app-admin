import { useState, useEffect } from 'react'
import axios from 'axios'
import Player from './Player'
import Admin from './Admin'
import AdminLogin from './AdminLogin'

// ✅ URL DEL BACKEND EN RENDER
const API = "https://mi-app-admin.onrender.com"


export default function App(){

  // ✅ controla vista (home / player / admin)
  const [view,setView] = useState("home")

  // ✅ controla login admin
  const [adminOk,setAdminOk] = useState(false)

  // ✅ guarda los partidos
  const [matches,setMatches] = useState([])


  // ✅ CARGA LOS PARTIDOS AL INICIAR
  useEffect(()=>{
    axios.get(API + '/matches').then(r=>setMatches(r.data))
  },[])


  // ✅ MAPA DE BANDERAS (CLAVE)
  const countryCodes = {
    
  "Colombia": "co",
  "Alemania": "de",
  "Brasil": "br",
  "Argentina": "ar",
  "España": "es",
  "Francia": "fr",
  "Portugal": "pt",
  "Inglaterra": "gb",
  "Uzbekistán": "uz",
  "RD Congo": "cd"

  }


  return (
    <div>

      {/* ✅ PANTALLA PRINCIPAL */}
      {view === "home" && (
        <div style={container}>

          <h1 style={title}>Apuestas Mundialista</h1>

            <p style={subtitle}>
              Pronostica partidos y gana
             </p>

                  <p style={{
                   color:"#cbd5f5",
                   fontSize:"14px",
                   marginTop:"-10px"
                   }}>
                   Acierta el marcador exacto y compite con otros jugadores
                   </p>

          <div style={pagoBox}>
            <strong>$5.000 por apuesta</strong>
            <div style={{marginTop:"4px"}}>
              Nequi: 3146051396
            </div>
          </div>


          {/* ✅ MOSTRAR PARTIDOS CREADOS */}
          {matches.map(m => {

            const cerrado = new Date(m.limite) < new Date()

            return (
              <div key={m.id} style={matchCard}>

                {/* ✅ PARTIDO CON BANDERAS + NOMBRE */}
                <div style={teams}>

                  {/* Equipo 1 */}
                  <div style={{display:"flex", alignItems:"center", gap:"5px"}}>
                    <img 
                      src={`https://flagcdn.com/w40/${countryCodes[m.equipo1]}.png`}
                      width="24"
                    />
                    <span>{m.equipo1}</span>
                  </div>

                  <span style={vs}>VS</span>

                  {/* Equipo 2 */}
                  <div style={{display:"flex", alignItems:"center", gap:"5px"}}>
                    <img 
                      src={`https://flagcdn.com/w40/${countryCodes[m.equipo2]}.png`}
                      width="24"
                    />
                    <span>{m.equipo2}</span>
                  </div>

                </div>

                {/* ✅ FECHA */}
                <div style={date}>
                  {new Date(m.limite).toLocaleString()}
                </div>

                {/* ✅ ESTADO */}
                <div style={{
                  marginTop:"6px",
                  color: cerrado ? "#ef4444" : "#22c55e"
                }}>
                  {cerrado ? "Cerrado" : "Disponible"}
                </div>

              </div>
            )
          })}


          {/* ✅ BOTONES */}
          <button style={btn} onClick={()=>setView("player")}>
            Entrar como jugador
          </button>

          <button style={btn} onClick={()=>setView("admin")}>
            Modo administrador
          </button>

        </div>
      )}


      {/* ✅ PLAYER */}
      {view === "player" && (
        <>
          <button style={backBtn} onClick={()=>setView("home")}>
            ← Volver
          </button>

          <Player/>
        </>
      )}


      {/* ✅ ADMIN */}
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


// 🎨 ESTILOS

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
  gap:"10px",
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