import express from 'express'
import cors from 'cors'
import { MongoClient } from 'mongodb'

const app = express()

app.use(cors({ origin: "*" }))
app.use(express.json())

// ✅ TU URL DE MONGO (YA CONFIGURADA)
const uri = "mongodb+srv://andressanchez03_db_user:ixmqPLWkTWBnSztxX@cluster0.wdalzh5.mongodb.net/?appName=Cluster0"

const client = new MongoClient(uri)

let db

async function conectar(){
  await client.connect()
  db = client.db("apuestas")
  console.log("✅ MongoDB conectado")
}

conectar()


/* =========================
   REGISTRO
========================= */
app.post('/register', async (req,res)=>{
  await db.collection("users").insertOne(req.body)
  res.send({ok:true})
})


/* =========================
   PARTIDOS
========================= */
app.get('/matches', async (req,res)=>{
  const data = await db.collection("matches").find().toArray()
  res.send(data)
})

app.post('/admin/match', async (req,res)=>{

  await db.collection("matches").insertOne({
    id: Date.now(),
    equipo1: req.body.equipo1,
    equipo2: req.body.equipo2,
    limite: req.body.limite,
    cerrado:false
  })

  res.send({ok:true})
})

app.post('/admin/cerrar/:id', async (req,res)=>{

  await db.collection("matches").updateOne(
    { id:Number(req.params.id) },
    { $set:{ cerrado:true } }
  )

  res.send({ok:true})
})

app.delete('/admin/match/:id', async (req,res)=>{

  const id = Number(req.params.id)

  await db.collection("matches").deleteOne({ id })
  await db.collection("predictions").deleteMany({ matchId:id })

  res.send({ok:true})
})


/* =========================
   APUESTAS
========================= */
app.post('/predict', async (req,res)=>{

  const match = await db.collection("matches").findOne({
    id:Number(req.body.matchId)
  })

  if(!match){
    return res.status(400).send({error:"Partido no existe"})
  }

  if(match.cerrado === true){
    return res.status(400).send({error:"Apuestas cerradas"})
  }

  const ya = await db.collection("predictions").findOne({
    telefono:req.body.telefono,
    matchId:Number(req.body.matchId)
  })

  if(ya){
    return res.status(400).send({error:"Ya apostaste"})
  }

  await db.collection("predictions").insertOne({
    ...req.body,
    matchId:Number(req.body.matchId),
    pagado:false
  })

  res.send({ok:true})
})

app.get('/bets', async (req,res)=>{
  const data = await db.collection("predictions").find().toArray()
  res.send(data)
})


/* =========================
   PAGOS
========================= */
app.post('/admin/pago', async (req,res)=>{

  const {telefono,matchId} = req.body

  await db.collection("predictions").updateOne(
    { telefono, matchId:Number(matchId) },
    { $set:{ pagado:true } }
  )

  res.send({ok:true})
})


/* =========================
   TOTAL GLOBAL
========================= */
app.get('/total', async (req,res)=>{

  const data = await db.collection("predictions").find().toArray()

  const total = data
    .filter(p => p.pagado === true)
    .length * 5000

  res.send({total})
})


/* =========================
   TOTAL POR PARTIDO
========================= */
app.get('/total-by-match', async (req,res)=>{

  const matches = await db.collection("matches").find().toArray()
  const predictions = await db.collection("predictions").find().toArray()

  let totales = {}

  matches.forEach(match => {

    const apuestas = predictions.filter(p =>
      p.matchId == match.id && p.pagado === true
    )

    totales[match.id] = apuestas.length * 5000
  })

  res.send(totales)
})


/* =========================
   RANKING
========================= */
app.get('/top-bets', async (req,res)=>{

  const matches = await db.collection("matches").find().toArray()
  const predictions = await db.collection("predictions").find().toArray()

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


/* =========================
   EXPORTAR
========================= */
app.get('/export', async (req,res)=>{

  const predictions = await db.collection("predictions").find().toArray()
  const matches = await db.collection("matches").find().toArray()

  let csv = "Usuario;Telefono;Partido;Resultado;Pagado\n"

  predictions.forEach(p=>{

    const match = matches.find(m => m.id == p.matchId)

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
  console.log("🚀 backend listo en puerto", PORT)
})
