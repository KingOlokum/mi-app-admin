import { useState, useEffect } from "react"
import axios from "axios"

const API = "https://mi-app-admin.onrender.com"

const countries = [
  "Colombia","Alemania","Brasil","Argentina","España",
  "Francia","Portugal","Inglaterra","Uzbekistán","RD Congo"
]

export default function Admin(){

  const [matches,setMatches] = useState([])
  const [bets,setBets] = useState([])

  const [equipo1,setEquipo1] = useState("")
  const [equipo2,setEquipo2] = useState("")
  const [limite,setLimite] = useState("")

  useEffect(()=>{
    cargarTodo()
  },[])

  const cargarTodo = async ()=>{
    try{
      const r = await axios.get(API + '/matches')
      const b = await axios.get(API + '/bets')

      setMatches(r.data)
      setBets(b.data)

    }catch(e){
      console.log(e)
    }
  }

  const crear = async ()=>{
    if(!equipo1 || !equipo2) return
    if(equipo1 === equipo2) return

    await axios.post(API + '/admin/match',{
      equipo1,
      equipo2,
      limite
    })

    setEquipo1("")
    setEquipo2("")
    setLimite("")

    await cargarTodo()
  }

  const eliminar = async (id)=>{
    await axios.delete(API + '/admin/match/' + id)
    await cargarTodo()
  }

  const pagar = async (telefono,matchId)=>{
    await axios.post(API + '/admin/pago',{
      telefono,
      matchId
    })

    await cargarTodo()
  }

  // ✅ NUEVO: cerrar partido manual
  const cerrar = async (id)=>{
    await axios.post(API + '/admin/cerrar/' + id)
    await cargarTodo()
  }

  return (
    <div style={wrap}>
      <div style={card}>

        <h3 style={{textAlign:"center"}}>Panel Admin</h3>

        {/* CREAR */}
        <select style={input}
          value={equipo1}
          onChange={e=>setEquipo1(e.target.value)}>
          <option value="">Equipo 1</option>
          {countries.map(e=>(
            <option key={e}>{e}</option>
          ))}
        </select>

        <select style={input}
          value={equipo2}
          onChange={e=>setEquipo2(e.target.value)}>
          <option value="">Equipo 2</option>
          {countries.map(e=>(
            <option key={e}>{e}</option>
          ))}
        </select>

        <input
          type="datetime-local"
          style={input}
          value={limite}
          onChange={e=>setLimite(e.target.value)}
        />

        <button style={btn} onClick={crear}>
          Crear partido
        </button>

        {/* PARTIDOS */}
        <h4>Partidos</h4>

        {matches.map(m=>{

          const cerrado = m.cerrado === true

          return (
            <div key={m.id} style={box}>
              <div>
                {m.equipo1} vs {m.equipo2}
                <br/>
                <small>{new Date(m.limite).toLocaleString()}</small>
                <br/>
                <span style={{color: cerrado ? "red":"green"}}>
                  {cerrado ? "Cerrado":"Abierto"}
                </span>
              </div>

              <div style={{display:"flex", gap:"5px"}}>
                
                {/* ✅ botón cerrar */}
                {!cerrado && (
                  <button
                    style={{background:"orange", color:"#fff"}}
                    onClick={()=>cerrar(m.id)}
                  >
                    Cerrar
                  </button>
                )}

                <button style={deleteBtn}
                  onClick={()=>eliminar(m.id)}>
                  Eliminar
                </button>

              </div>
            </div>
          )
        })}

        {/* APUESTAS */}
        <h4>Apuestas</h4>

        {bets.map((b,i)=>(
          <div key={i} style={box}>
            <div style={{fontSize:"12px"}}>
              {b.usuario}<br/>
              {b.telefono}<br/>
              Resultado: {b.resultado}
            </div>

            {b.pagado ? (
              <span style={{color:"lime"}}>Pagado</span>
            ) : (
              <button
                style={btn}
                onClick={()=>pagar(b.telefono,b.matchId)}
              >
                Pagar
              </button>
            )}
          </div>
        ))}

        {/* EXCEL */}
        <a href={API + '/export'} style={excelBtn}>
          Descargar Excel
        </a>

      </div>
    </div>
  )
}


// estilos (sin cambios)

const wrap={
  minHeight:"100vh",
  display:"flex",
  justifyContent:"center",
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
  padding:"6px 10px",
  borderRadius:"8px",
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
  background:"red",
  border:"none",
  color:"#fff",
  padding:"5px",
  borderRadius:"6px",
  cursor:"pointer"
}

const excelBtn={
  marginTop:"10px",
  textAlign:"center",
  padding:"10px",
  background:"#22c55e",
  borderRadius:"10px",
  color:"#fff",
  textDecoration:"none"
}