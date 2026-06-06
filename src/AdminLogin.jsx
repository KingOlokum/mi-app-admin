import { useState } from 'react'
import axios from 'axios'

const API = "http://192.168.1.45:3001"

export default function AdminLogin({onLogin}){

  const [form,setForm] = useState({user:"",pass:""})

  const login = async ()=>{
    try{
      await axios.post(API+'/admin/login',form)
      onLogin()
    }catch{
      alert("Error")
    }
  }

  return (
    <div style={{padding:20}}>

      <input placeholder="Usuario"
        onChange={e=>setForm({...form,user:e.target.value})}/>

      <input type="password" placeholder="Clave"
        onChange={e=>setForm({...form,pass:e.target.value})}/>

      <button onClick={login}>Entrar</button>

    </div>
  )
}