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
        .catch(()=>{})

      axios.get(API+'/top-bets')
        .then(r=>setRanking(r.data || {}))
        .catch(()=>{})
    }
  },[step])

  // ✅ ENTRAR SIN BLOQUEOS
  const entrar = ()=>{

    if(form.telefono.length !== 10){
      alert("El teléfono debe tener 10 dígitos")
      return
    }

    if(!form.telefono.startsWith("3")){
      alert("Número inválido")
      return
    }

    setStep("apuestas")
  }

  // ✅ APOSTAR
  const apostar = async (id)=>{

    const local = inputs[id]?.local
    const visitante = inputs[id]?.visitante

    if(local === "" || visitante === "" || local === undefined || visitante === undefined){
      alert("Completa ambos marcadores")
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

      alert("Apuesta registrada ✅")

      const res = await axios.get(API+'/top-bets')
      setRanking(res.data)

    }catch(e){
      alert("Error al apostar")
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

        <h3 style={{textAlign:"center"}}>Selecciona tu apuesta</h3>

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
                    <div key={i} style={{marginBottom:8}}>
                      <div style={{
                        display:"flex",
                        justifyContent:"space-between",
                        fontSize:12
                      }}>
                        <span>{r.resultado}</span>
                        <span>{porcentaje}%</span>
                      </div>

                      <div style={barBg}>
                        <div style={{
                          width:`${porcentaje}%`,
                          height:"100%",
                          background:"#facc15"
                        }}></div>
                      </div>
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

// ✅ estilos (los mismos tuyos)
const wrap={ minHeight:"100vh", display:"flex", justifyContent:"center", paddingTop:"80px", background:"#020617" }
const card={ background:"#0f172a", padding:"25px", borderRadius:"16px", width:"360px", color:"#fff", display:"flex", flexDirection:"column", gap:"15px" }
const box={ background:"#1e293b", padding:"15px", borderRadius:"12px", display:"flex", flexDirection:"column", gap:"10px" }
const teams={ textAlign:"center", fontWeight:"700" }
const scoreBox={ display:"flex", justifyContent:"center", alignItems:"center", gap:"10px" }
const scoreInput={ width:"60px", padding:"10px", textAlign:"center", borderRadius:"8px", border:"1px solid #334155", background:"#020617", color:"#fff" }
const input={ padding:"10px", borderRadius:"8px", border:"1px solid #334155", background:"#020617", color:"#fff" }
const btn={ padding:"10px", borderRadius:"10px", border:"none", background:"#0284c7", color:"#fff", cursor:"pointer" }
const barBg={ height:"6px", background:"#334155", borderRadius:"6px", overflow:"hidden", marginTop:"4px" }
