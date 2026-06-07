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
  try{
    const client = new MongoClient(uri)
    await client.connect()
    db = client.db("apuestas")

    console.log("✅ Mongo conectado")

    /* =========================
       PARTIDOS
    ========================= */

    app.get('/matches', async (req,res)=>{
      const data = await db.collection("matches").find().toArray()
      res.send(data)
    })

    app.post('/admin/match', async (req,res)=>{
      const nuevo = {
        id: Date.now(),
        equipo1: req.body.equipo1,
        equipo2: req.body.equipo2,
        limite: req.body.limite,
        cerrado:false
      }

      await db.collection("matches").insertOne(nuevo)
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
       APUESTAS (CORREGIDO)
    ========================= */

    app.post('/predict', async (req,res)=>{
      try{
        const { matchId, telefono, resultado, usuario } = req.body

        const id = Number(matchId)

        const match = await db.collection("matches").findOne({ id })

        if(!match){
          return res.status(400).send({error:"Partido no existe"})
        }

        if(match.cerrado){
          return res.status(400).send({error:"Apuestas cerradas"})
        }

        // ✅ evitar duplicados
        const ya = await db.collection("predictions").findOne({
          telefono,
          matchId:id
        })

        if(ya){
          return res.status(400).send({error:"Ya apostaste"})
        }

        await db.collection("predictions").insertOne({
          usuario,
          telefono,
          matchId:id,
          resultado,
          pagado:false
        })

        res.send({ok:true})

      }catch(e){
        console.error("ERROR PREDICT:", e)
        res.status(500).send({error:"Error al apostar"})
      }
    })

    /* =========================
       TOTALES
    ========================= */

    app.get('/total-by-match', async (req,res)=>{
      const matches = await db.collection("matches").find().toArray()
      const predictions = await db.collection("predictions").find().toArray()

      let totales = {}

      matches.forEach(m=>{
        const total = predictions.filter(p=>p.matchId==m.id && p.pagado).length * 5000
        totales[m.id] = total
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

      matches.forEach(match=>{
        const apuestas = predictions.filter(p=>p.matchId==match.id)

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

    /* =========================
       LOGIN ADMIN
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

    app.listen(PORT, ()=>{
      console.log("🚀 Servidor listo en puerto", PORT)
    })

  }catch(e){
    console.error("❌ ERROR FATAL:", e)
  }
}

start()
