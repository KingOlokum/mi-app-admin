import { useEffect, useState } from 'react'
import axios from 'axios'

const API="http://localhost:3001"

export default function Ranking(){

  const [data,setData]=useState({})

  useEffect(()=>{
    axios.get(API+'/ranking').then(r=>setData(r.data))
  },[])

  return (
    <div>

      <h2>🏆 Ranking</h2>

      {Object.entries(data)
        .sort((a,b)=>b[1]-a[1])
        .map(([name,pts])=>(
          <div key={name}>
            {name}: {pts} pts
          </div>
        ))}

    </div>
  )
}