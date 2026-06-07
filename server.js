import express from 'express'
import cors from 'cors'

const app = express()

// ✅ CORS para producción (Vercel → Render)
app.use(cors({
  origin: "*"
}))

app.use(express.json())

// ✅ datos en memoria
let users = []
let matches = []
let predictions = []


// ✅ REGISTRO
app.post('/register',(req,res)=>{
  users.push(req.body)
  res.send({ok:true})
})


// ✅ PARTIDOS
app.get('/matches',(req,res)=>{
  res.send(matches)
})


// ✅ CREAR PARTIDO
app.post('/admin/match',(req,res)=>{
  matches.push({
    id: Date.now(),
    equipo1: req.body.equipo1,
    equipo2: req.body.equipo2,
    limite: req.body.limite
  })
  res.send({ok:true})
})


// ✅ ELIMINAR PARTIDO
app.delete('/admin/match/:id',(req,res)=>{
  const id = req.params.id

  matches = matches.filter(m=>m.id != id)

  // borrar apuestas relacionadas
  predictions = predictions.filter(p=>p.matchId != id)

  res.send({ok:true})
})


// ✅ HACER APUESTA
app.post('/predict',(req,res)=>{

  const match = matches.find(m => m.id == req.body.matchId)

  if(!match){
    return res.status(400).send({error:"Partido no existe"})
  }

  if(new Date(match.limite) < new Date()){
    return res.status(400).send({error:"Apuestas cerradas"})
  }

  const ya = predictions.find(p =>
    p.telefono === req.body.telefono &&
    p.matchId == req.body.matchId
  )

  if(ya){
    return res.status(400).send({error:"Ya apostaste"})
  }

  predictions.push({
    ...req.body,
    pagado:false
  })

  res.send({ok:true})
})


// ✅ VER APUESTAS
app.get('/bets',(req,res)=>{
  res.send(predictions)
})


// ✅ ✅ ✅ RANKING
app.get('/top-bets',(req,res)=>{

  let resultado = {}

  matches.forEach(match => {

    const apuestas = predictions.filter(p => p.matchId == match.id)

    let conteo = {}

    apuestas.forEach(a=>{
      conteo[a.resultado] = (conteo[a.resultado] || 0) + 1
    })

    let top = Object.entries(conteo)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,3)
      .map(i=>({
        resultado:i[0],
        cantidad:i[1]
      }))

    resultado[match.id] = top
  })

  res.send(resultado)
})


// ✅ PAGOS
app.post('/admin/pago',(req,res)=>{

  const {telefono,matchId} = req.body

  const p = predictions.find(x =>
    x.telefono === telefono &&
    x.matchId == matchId
  )

  if(p){
    p.pagado = true
  }

  res.send({ok:true})
})


// ✅ TOTAL
app.get('/total',(req,res)=>{

  const total = predictions
    .filter(p=>p.pagado)
    .length * 5000

  res.send({total})
})


// ✅ EXPORTAR
app.get('/export',(req,res)=>{

  let csv = "Usuario;Telefono;Partido;Resultado;Pagado\n"

  predictions.forEach(p=>{
    csv += `${p.usuario};${p.telefono};${p.matchId};${p.resultado};${p.pagado}\n`
  })

  res.setHeader("Content-Type","text/csv")
  res.setHeader("Content-Disposition","attachment; filename=quiniela.csv")

  res.send(csv)
})


// ✅ LOGIN ADMIN
app.post('/admin/login',(req,res)=>{

  // DEBUG (puedes dejarlo)
  console.log("LOGIN:", req.body)

  const user = req.body.user
  const pass = req.body.pass

  if(user === "admin" && pass === "Segf.2208**++"){
    return res.send({ok:true})
  }

  res.status(401).send({error:"Credenciales incorrectas"})
})


// ✅ ✅ ✅ PUERTO CORRECTO PARA RENDER
const PORT = process.env.PORT || 3001

app.listen(PORT, ()=>{
  console.log("✅ backend listo en puerto", PORT)
})