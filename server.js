import express from 'express'
import cors from 'cors'
import { MongoClient } from 'mongodb'

const app = express()
app.use(cors({ origin: "*" }))
app.use(express.json())

// ✅ CONEXIÓN MONGO (CORRECTA)
const uri = "mongodb+srv://andressanchez03_db_user:ixmqPLWkTWBnSztxX@cluster0.wdalzh5.mongodb.net/apuestas?retryWrites=true&w=majority"

const client = new MongoClient(uri)

const PORT = process.env.PORT || 3001

let db = null

// ✅ ARRANCAR SERVIDOR CORRECTAMENTE
async function startServer(){
  try{
    await client.connect()
    db = client.db("apuestas")

    console.log("✅ Mongo conectado")

    app.listen(PORT, ()=>{
      console.log("🚀 servidor listo en puerto", PORT)
    })

  }catch(e){
    console.error("❌ Error conectando Mongo:", e)
  }
}

startServer()

/* =========================
   REGISTRO
========================= */
app.post('/register', async (req,res)=>{
  try{
    await db.collection("users").insertOne(req.body)
    res.send({ok:true})
  }catch(e){
    res.status(500).send({error:"Error registro"})
  }
})


/* =========================
   PARTIDOS
========================= */
app.get('/matches', async (req,res)=>{
  try{
    const data = await db.collection("matches").find().toArray()
    res.send(data)
  }catch(e){
    res.status(500).send([])
  }
})

app.post('/admin/match', async (req,res)=>{
  try{

    const nuevo = {
      id: Date.now(),
      equipo1: req.body.equipo1,
      equipo2: req.body.equipo2,
      limite: req.body.limite,
      cerrado:false
    }

    await db.collection("matches").insertOne(nuevo)

    res.send({ok:true})

  }catch(e){
    console.error(e)
    res.status(500).send({error:"Error creando partido"})
  }
})

app.post('/admin/cerrar/:id', async (req,res)=>{
  try{
    await db.collection("matches").updateOne(
      { id:Number(req.params.id) },
      { $set:{ cerrado:true } }
    )
    res.send({ok:true})
  }catch(e){
    res.status(500).send({error:"Error cerrar"})
  }
})

app.delete('/admin/match/:id', async (req,res)=>{
  try{
    const id = Number(req.params.id)

    await db.collection("matches").deleteOne({ id })
    await db.collection("predictions").deleteMany({ matchId:id })

    res.send({ok:true})
  }catch(e){
    res.status(500).send({error:"Error eliminar"})
  }
})


/* =========================
   APUESTAS
========================= */
app.post('/predict', async (req,res)=>{
  try{

    const match = await db.collection("matches").findOne({
      id:Number(req.body.matchId)
    })

    if(!match){
      return res.status(400).send({error:"Partido no existe"})
    }

    if(match.cerrado){
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

  }catch(e){
    res.status(500).send({error:"Error apuesta"})
  }
})

app.get('/bets', async (req,res)=>{
  try{
    const data = await db.collection("predictions").find().toArray()
    res.send(data)
  }catch(e){
    res.status(500).send([])
  }
})


/* =========================
   PAGOS
========================= */
app.post('/admin/pago', async (req,res)=>{
  try{
    const {telefono,matchId} = req.body

    await db.collection("predictions").updateOne(
      { telefono, matchId:Number(matchId) },
      { $set:{ pagado:true } }
    )

    res.send({ok:true})
  }catch(e){
    res.status(500).send({error:"Error pago"})
  }
})


/* =========================
   TOTAL POR PARTIDO
========================= */
app.get('/total-by-match', async (req,res)=>{
  try{
    const matches = await db.collection("matches").find().toArray()
    const predictions = await db.collection("predictions").find().toArray()

    let totales = {}

    matches.forEach(m=>{
      const total = predictions.filter(p=>p.matchId==m.id && p.pagado).length * 5000
      totales[m.id] = total
    })

    res.send(totales)
  }catch(e){
    res.status(500).send({})
  }
})


/* =========================
   RANKING
========================= */
app.get('/top-bets', async (req,res)=>{
  try{
    const matches = await db.collection("matches").find().toArray()
    const predictions = await db.collection("predictions").find().toArray()

    let resultado = {}

    matches.forEach(match=>{

      const apuestas = predictions.filter(p=>p.matchId == match.id)

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
  }catch(e){
    res.status(500).send({})
  }
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