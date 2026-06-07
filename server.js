import express from 'express'
import cors from 'cors'
import { MongoClient } from 'mongodb'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3001

const uri = "mongodb+srv://andressanchez03_db_user:ClaveApuesta123@cluster0.wdalzh5.mongodb.net/apuestas?retryWrites=true&w=majority"

let db

async function start(){

  const client = new MongoClient(uri)
  await client.connect()
  db = client.db("apuestas")

  console.log("✅ Mongo conectado")

  app.post('/register', async (req,res)=>{
    await db.collection("users").insertOne(req.body)
    res.send({ok:true})
  })

  app.get('/matches', async (req,res)=>{
    const data = await db.collection("matches").find().toArray()
    res.send(data)
  })

  app.post('/admin/match', async (req,res)=>{
    const nuevo = {
      id: String(Date.now()),
      equipo1: req.body.equipo1,
      equipo2: req.body.equipo2,
      limite: req.body.limite,
      cerrado:false
    }

    await db.collection("matches").insertOne(nuevo)
    res.send({ok:true})
  })

  app.post('/admin/cerrar/:id', async (req,res)=>{
    const id = String(req.params.id)

    await db.collection("matches").updateOne(
      { id },
      { $set:{ cerrado:true } }
    )

    res.send({ok:true})
  })

  app.delete('/admin/match/:id', async (req,res)=>{
    const id = String(req.params.id)

    await db.collection("matches").deleteOne({ id })
    await db.collection("predictions").deleteMany({ matchId:id })

    res.send({ok:true})
  })

  app.post('/predict', async (req,res)=>{

    const id = String(req.body.matchId)

    const match = await db.collection("matches").findOne({ id })

    if(!match){
      return res.status(400).send({error:"Partido no existe"})
    }

    if(match.cerrado){
      return res.status(400).send({error:"Apuestas cerradas"})
    }

    const ya = await db.collection("predictions").findOne({
      telefono:req.body.telefono,
      matchId:id
    })

    if(ya){
      return res.status(400).send({error:"Ya apostaste"})
    }

    await db.collection("predictions").insertOne({
      usuario:req.body.usuario,
      telefono:req.body.telefono,
      matchId:id,
      resultado:req.body.resultado,
      pagado:false
    })

    res.send({ok:true})
  })

  app.get('/bets', async (req,res)=>{
    const data = await db.collection("predictions").find().toArray()
    res.send(data)
  })

  app.get('/top-bets', async (req,res)=>{

    const matches = await db.collection("matches").find().toArray()
    const predictions = await db.collection("predictions").find().toArray()

    let resultado = {}

    matches.forEach(match=>{

      const apuestas = predictions.filter(
        p => String(p.matchId) === String(match.id)
      )

      let conteo = {}

      apuestas.forEach(a=>{
        conteo[a.resultado] = (conteo[a.resultado] || 0) + 1
      })

      resultado[match.id] = Object.entries(conteo)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,3)
        .map(i=>({
          resultado:i[0],
          cantidad:i[1]
        }))

    })

    res.send(resultado)
  })

  app.post('/admin/login',(req,res)=>{
    const {user,pass} = req.body

    if(user==="admin" && pass==="Segf.2208**++"){
      return res.send({ok:true})
    }

    res.status(401).send({error:"Credenciales incorrectas"})
  })

  app.listen(PORT, ()=>{
    console.log("🚀 Servidor listo")
  })
}

start()
