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
      axios.get(API+'/matches').then(r=>setMatches(r.data))
      axios.get(API+'/top-bets').then(r=>{
        setRanking(r.data || {})
      })
    }
  },[step])

  const entrar = async ()=>{

    if(form.telefono.length !== 10){
      alert("El teléfono debe tener 10 dígitos")
      return
    }

    if(!form.telefono.startsWith("3")){
      alert("Número inválido")
      return
    }

    await axios.post(API+'/register',form)
    setStep("apuestas")
  }

  const apostar = async (id)=>{

    const match = matches.find(m => m.id === id)

    // ✅ SOLO bloquea si está cerrado
    if(match && match.cerrado === true){
      alert("Este partido está cerrado")
      return
    }

    const local = inputs[id]?.local
    const visitante = inputs[id]?.visitante

    if(local === "" || visitante === "" || local === undefined || visitante === undefined){
      alert("Completa ambos marcadores")
      return
    }

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

      alert("Apuesta registrada")

      const res = await axios.get(API+'/top-bets')
      setRanking(res.data)

    }catch(e){
      alert(e.response?.data?.error || "Error")
    }
  }

  if(step==="login"){
    return (
      <div style={wrap}>
        <div style={card}>
          <input
            style={input}
            placeholder="Nombre"
            value={form.nombre}
            onChange={e=>{
              let valor = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,"")
              setForm({...form,nombre:valor})
            }}
          />

          <input
            style={input}
            placeholder="Apellido"
            value={form.apellido}
            onChange={e=>{
              let valor = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,"")
              setForm({...form,apellido:valor})
            }}
          />

          <input
            style={input}
            placeholder="3001234567"
            maxLength={10}
            value={form.telefono}
            onChange={e=>{
              let valor = e.target.value.replace(/\D/g,"")
              if(valor.length > 10) valor = valor.slice(0,10)
              setForm({...form,telefono:valor})
            }}
          />

          <button style={btn} onClick={entrar}>
            Entrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={wrap}>
      <div style={card}>

        <h3 style={{textAlign:"center"}}>Selecciona tu apuesta</h3>

        {matches.map(m=>{

          const cerrado = m.cerrado === true
          const top = ranking[m.id] || []
          const total = top.reduce((acc,r)=>acc+r.cantidad,0)

          return (
            <div key={m.id} style={box}>

              <div style={teams}>
                {m.equipo1} VS {m.equipo2}
              </div>

              {/* ✅ SOLO MENSAJE, NO BLOQUEA INPUT */}
              {cerrado && (
                <div style={{color:"red", fontSize:"12px", textAlign:"center"}}>
                  Apuestas cerradas
                </div>
              )}

              <div style={scoreBox}>

                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={inputs[m.id]?.local ?? ""}
                  style={scoreInput}
                  onChange={e=>setInputs({
                    ...inputs,
                    [m.id]: {
                      ...inputs[m.id],
                      local: e.target.value
                    }
                  })}
                />

                <span>-</span>

                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={inputs[m.id]?.visitante ?? ""}
                  style={scoreInput}
                  onChange={e=>setInputs({
                    ...inputs,
                    [m.id]: {
                      ...inputs[m.id],
                      visitante: e.target.value
                    }
                  })}
                />

              </div>

              {/* ✅ BOTÓN SOLO BLOQUEA EL ENVÍO */}
              <button
                style={btn}
                onClick={()=>apostar(m.id)}
              >
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