'use client'
import React, { useState } from 'react'
import "./login.css"
const Login = () => {

  const [usuario, setUsuario] = useState({
    correo: "",
    contrasena: ""
  })

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setUsuario({
      ...usuario,
      [event.target.name]: event.target.value
    })
  }

  function handleLogIn() {

  }
  return (
    <>

     
      
      <div className='container '>
   
        <div className='row d-flex justify-content-between'>
          <div className='col-5 d-flex imagenLogIn'>
            <img src="https://www.freeiconspng.com/thumbs/gear-icon-png/white-gear-png-gear-icon-png-white-gear-icon-30.png"/>
          </div>
       
          <div className="col-5 loginForm">
            <form >
              <div className="form-group">
                <label>Correo electronico</label>
                <input 
                type="text"
                className='form-control'
                name="correo"
                onChange={handleChange}
                />
              </div>

              <div className="form-group mt-3">
                <label>Contraseña</label>
                <input 
                className='form-control'
                type="password"
                name='contrasena'
                onChange={handleChange}
                />
              </div>

              <div className="form-group mt-3">
                <input type="checkbox"
                  name='remember'
                />
                <label>Recordarme</label>
              </div>
              <div className='row justify-content-center mt-3'>
                    <button 
                    className='btn btn-primary'
                    onClick={handleLogIn}
                    >Iniciar Sesion</button>
              </div>
                
              <p className='mt-3'>No tienes una cuenta? <a href="/register">Registrate</a></p>
            </form>
          </div>
        </div>
      </div>
    </>

  )
}

export default Login