import { useState } from 'react'
import axios from 'axios'

export default function Login({setUser}){

  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')

  const login=()=>{
    axios.post('http://localhost:3001/login',{email,password})
      .then(res=>{
        setUser(res.data.user)
      })
  }

  return(
    <div style={{display:'flex',height:'100vh',justifyContent:'center',alignItems:'center'}}>
      <div>
        <input placeholder="Email" onChange={e=>setEmail(e.target.value)} /><br/><br/>
        <input placeholder="Password" type="password" onChange={e=>setPassword(e.target.value)} /><br/><br/>
        <button onClick={login}>Entrar</button>
      </div>
    </div>
  )
}
