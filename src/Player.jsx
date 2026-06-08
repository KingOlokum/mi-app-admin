import { useState, useEffect } from 'react'
import axios from 'axios'

const API = "https://mi-app-admin.onrender.com"

export default function Player(){

  const [step,setStep] = useState("login")
  const [matches,setMatches] = useState([])
  const [ranking,setRanking] = useState({})
  const [inputs,setInputs] = useState({})

  const [form,setForm] = useState({
    nombre:"",
    apellido:"",
    telefono:""
  })

  useEffect(()=>{
    if(step==="apuestas"){

      axios.get(API+'/matches')
        .then(r=>setMatches(r.data))
        .catch(()=>setMatches([]))

      axios.get(API+'/top-bets')
        .then(r=>setRanking(r.data || {}))
        .catch(()=>setRanking({}))
    }
  },[step])

  // ✅ ENTRAR
  const entrar = ()=>{
    if(form.telefono.length !== 10){
      alert("Teléfono inválido")
      return
    }

    if(!form.telefono.startsWith("3")){
      alert("Número inválido")
      return
    }

    setStep("apuestas")
  }

  // ✅ APOSTAR (CORREGIDO)
  const apostar = async (id)=>{

    const local = inputs[id]?.local
    const visitante = inputs[id]?.visitante

    if(local === "" || visitante === "" || local === undefined || visitante === undefined){
      alert("Completa marcador")
      return
    }

    // ✅ BLOQUEA NEGATIVOS
    if(Number(local) < 0 || Number(visitante) < 0){
      alert("Los goles no pueden ser negativos")
      return
    }

    const resultado = `${local}-${visitante}`

    try{
      await axios.post(API+'/predict',{
        usuario: form.nombre + " " + form.apellido,
        telefono: form.telefono,
        matchId:id,
        resultado
      })

      alert("✅ Apuesta hecha")

      const res = await axios.get(API+'/top-bets')
      setRanking(res.data)

    }catch{
      alert("Error apostando")
    }
  }

  // ✅ LOGIN
  if(step==="login"){
    return (
      <div style={wrap}>
        <div style={card}>

          <input
            style={input}
            placeholder="Nombre"
            value={form.nombre}
            onChange={e=>setForm({...form,nombre:e.target.value})}
          />

          <input
            style={input}
            placeholder="Apellido"
            value={form.apellido}
            onChange={e=>setForm({...form,apellido:e.target.value})}
          />

          <input
            style={input}
            placeholder="3001234567"
            maxLength={10}
            value={form.telefono}
            onChange={e=>setForm({...form,telefono:e.target.value.replace(/\D/g,"")})}
          />

          <button style={btn} onClick={entrar}>
            Entrar
          </button>

        </div>
      </div>
    )
  }

  // ✅ APUESTAS
  return (
    <div style={wrap}>
      <div style={card}>

        <h3 style={{textAlign:"center"}}>Apuestas</h3>

        {matches.map(m=>{

          const top = ranking[m.id] || []
          const total = top.reduce((acc,r)=>acc+r.cantidad,0)

          return (
            <div key={m.id} style={box}>

              <div style={teams}>
                {m.equipo1} VS {m.equipo2}
              </div>

              {m.cerrado && (
                <div style={{color:"red", fontSize:"12px", textAlign:"center"}}>
                  Apuestas cerradas
                </div>
              )}

              <div style={scoreBox}>

                <input
                  type="number"
                  min="0"   // ✅ evita negativos en UI
                  value={inputs[m.id]?.local ?? ""}
                  style={scoreInput}
                  onChange={e=>setInputs({
                    ...inputs,
                    [m.id]: {...inputs[m.id], local: e.target.value}
                  })}
                />

                <span>-</span>

                <input
                  type="number"
                  min="0"   // ✅ evita negativos en UI
                  value={inputs[m.id]?.visitante ?? ""}
                  style={scoreInput}
                  onChange={e=>setInputs({
                    ...inputs,
                    [m.id]: {...inputs[m.id], visitante: e.target.value}
                  })}
                />

              </div>

              <button style={btn} onClick={()=>apostar(m.id)}>
                Apostar
              </button>

              <div style={{marginTop:10}}>

                {top.map((r,i)=>{
                  const porcentaje = total
                    ? Math.round((r.cantidad/total)*100)
                    : 0

                  return (
                    <div key={i}>
                      {r.resultado} - {porcentaje}%
                    </div>
                  )
                })}

              </div>

            </div>
          )
        })}

      </div>
    </div>
  )
}

// ✅ estilos
const wrap={ minHeight:"100vh",display:"flex",justifyContent:"center",paddingTop:"80px",background:"#020617" }
const card={ background:"#0f172a",padding:"25px",borderRadius:"16px",width:"360px",color:"#fff",display:"flex",flexDirection:"column",gap:"15px" }
const box={ background:"#1e293b",padding:"15px",borderRadius:"12px" }
const teams={ textAlign:"center", fontWeight:"700" }
const scoreBox={ display:"flex", justifyContent:"center", gap:"10px" }
const scoreInput={ width:"60px", padding:"10px", textAlign:"center", borderRadius:"8px", border:"1px solid #334155", background:"#020617", color:"#fff" }
const input={ padding:"10px", borderRadius:"8px", border:"1px solid #334155", background:"#020617", color:"#fff" }
const btn={ padding:"10px", borderRadius:"10px", border:"none", background:"#0284c7", color:"#fff" }