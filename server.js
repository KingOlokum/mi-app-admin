import express from 'express'
import cors from 'cors'
import fs from 'fs'

const app = express()

app.use(cors({ origin: "*" }))
app.use(express.json())

const DATA_FILE = './data.json'

function loadData() {
  const raw = fs.readFileSync(DATA_FILE)
  return JSON.parse(raw)
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}


/* =========================
   REGISTRO
========================= */
app.post('/register',(req,res)=>{
  const data = loadData()
  data.users.push(req.body)
  saveData(data)
  res.send({ok:true})
})


/* =========================
   PARTIDOS
========================= */
app.get('/matches',(req,res)=>{
  const data = loadData()
  res.send(data.matches)
})

app.post('/admin/match',(req,res)=>{
  const data = loadData()

  data.matches.push({
    id: Date.now(),
    equipo1: req.body.equipo1,
    equipo2: req.body.equipo2,
    limite: req.body.limite
  })

  saveData(data)
  res.send({ok:true})
})

app.delete('/admin/match/:id',(req,res)=>{
  const data = loadData()
  const id = req.params.id

  data.matches = data.matches.filter(m => m.id != id)
  data.predictions = data.predictions.filter(p => p.matchId != id)

  saveData(data)
  res.send({ok:true})
})


/* =========================
   APUESTAS
========================= */
app.post('/predict',(req,res)=>{

  const data = loadData()

  const match = data.matches.find(m => m.id == req.body.matchId)

  if(!match){
    return res.status(400).send({error:"Partido no existe"})
  }

  if(new Date(match.limite) < new Date()){
    return res.status(400).send({error:"Apuestas cerradas"})
  }

  const ya = data.predictions.find(p =>
    p.telefono === req.body.telefono &&
    String(p.matchId) === String(req.body.matchId)
  )

  if(ya){
    return res.status(400).send({error:"Ya apostaste"})
  }

  data.predictions.push({
    ...req.body,
    matchId: Number(req.body.matchId),
    pagado:false
  })

  saveData(data)
  res.send({ok:true})
})

app.get('/bets',(req,res)=>{
  const data = loadData()
  res.send(data.predictions)
})


/* =========================
   PAGOS
========================= */
app.post('/admin/pago',(req,res)=>{

  const data = loadData()
  const {telefono,matchId} = req.body

  const p = data.predictions.find(x =>
    x.telefono === telefono &&
    String(x.matchId) === String(matchId)
  )

  if(p){
    p.pagado = true
  }

  saveData(data)
  res.send({ok:true})
})


/* =========================
   TOTAL GLOBAL
========================= */
app.get('/total',(req,res)=>{
  const data = loadData()

  const total = data.predictions
    .filter(p => p.pagado === true)
    .length * 5000

  res.send({total})
})


/* =========================
   ✅ NUEVO: TOTAL POR PARTIDO
========================= */
app.get('/total-by-match',(req,res)=>{

  const data = loadData()

  let totales = {}

  data.matches.forEach(match => {

    const apuestas = data.predictions.filter(p =>
      p.matchId == match.id &&
      p.pagado === true
    )

    totales[match.id] = apuestas.length * 5000
  })

  res.send(totales)
})


/* =========================
   RANKING
========================= */
app.get('/top-bets',(req,res)=>{

  const data = loadData()

  let resultado = {}

  data.matches.forEach(match => {

    const apuestas = data.predictions.filter(p => p.matchId == match.id)

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


/* =========================
   EXPORTAR
========================= */
app.get('/export',(req,res)=>{

  const data = loadData()

  let csv = "Usuario;Telefono;Partido;Resultado;Pagado\n"

  data.predictions.forEach(p=>{

    const match = data.matches.find(m => m.id == p.matchId)

    const nombrePartido = match
      ? `${match.equipo1} vs ${match.equipo2}`
      : "Partido eliminado"

    csv += `"${p.usuario}";"${p.telefono}";"${nombrePartido}";"'${p.resultado}'";"${p.pagado}"\n`
  })

  res.setHeader("Content-Type","text/csv; charset=utf-8")
  res.setHeader("Content-Disposition","attachment; filename=quiniela.csv")

  res.send("\uFEFF" + csv)
})


/* =========================
   LOGIN
========================= */
app.post('/admin/login',(req,res)=>{

  const {user,pass} = req.body

  if(user === "admin" && pass === "Segf.2208**++"){
    return res.send({ok:true})
  }

  res.status(401).send({error:"Credenciales incorrectas"})
})


/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 3001

app.listen(PORT, ()=>{
  console.log("backend listo en puerto", PORT)
})