import express from 'express'
import cors from 'cors'
import fs from 'fs'

const app = express()

app.use(cors({
  origin: "*"
}))

app.use(express.json())

// archivo de datos
const DATA_FILE = './data.json'

// cargar datos
function loadData() {
  const raw = fs.readFileSync(DATA_FILE)
  return JSON.parse(raw)
}

// guardar datos
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

// inicializar
let { users, matches, predictions } = loadData()


// REGISTRO
app.post('/register',(req,res)=>{
  users.push(req.body)
  saveData({ users, matches, predictions })
  res.send({ok:true})
})


// VER PARTIDOS
app.get('/matches',(req,res)=>{
  res.send(matches)
})


// CREAR PARTIDO
app.post('/admin/match',(req,res)=>{
  matches.push({
    id: Date.now(),
    equipo1: req.body.equipo1,
    equipo2: req.body.equipo2,
    limite: req.body.limite
  })

  saveData({ users, matches, predictions })
  res.send({ok:true})
})


// ELIMINAR PARTIDO
app.delete('/admin/match/:id',(req,res)=>{

  const id = req.params.id

  matches = matches.filter(m => m.id != id)
  predictions = predictions.filter(p => p.matchId != id)

  saveData({ users, matches, predictions })

  res.send({ok:true})
})


// HACER APUESTA
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
    String(p.matchId) === String(req.body.matchId)
  )

  if(ya){
    return res.status(400).send({error:"Ya apostaste"})
  }

  predictions.push({
    ...req.body,
    matchId: Number(req.body.matchId),
    pagado:false
  })

  saveData({ users, matches, predictions })

  res.send({ok:true})
})


// VER APUESTAS
app.get('/bets',(req,res)=>{
  res.send(predictions)
})


// RANKING
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


// PAGOS (ARREGLADO ✅)
app.post('/admin/pago',(req,res)=>{

  const {telefono,matchId} = req.body

  const p = predictions.find(x =>
    x.telefono === telefono &&
    String(x.matchId) === String(matchId)
  )

  if(p){
    p.pagado = true
  }

  saveData({ users, matches, predictions })

  res.send({ok:true})
})


// ✅✅✅ TOTAL CORREGIDO (CLAVE)
app.get('/total',(req,res)=>{

  // leer siempre datos reales del archivo
  const data = loadData()

  const total = data.predictions
    .filter(p => p.pagado === true)
    .length * 5000

  res.send({total})
})


// EXPORTAR EXCEL
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


// LOGIN
app.post('/admin/login',(req,res)=>{

  const user = req.body.user
  const pass = req.body.pass

  if(user === "admin" && pass === "Segf.2208**++"){
    return res.send({ok:true})
  }

  res.status(401).send({error:"Credenciales incorrectas"})
})


// PUERTO
const PORT = process.env.PORT || 3001

app.listen(PORT, ()=>{
  console.log("backend listo en puerto", PORT)
})