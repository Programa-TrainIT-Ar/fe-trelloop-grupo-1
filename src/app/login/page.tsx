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

  async function handleLogIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
				let response = await fetch(`https://9t5fnt98-5000.use2.devtunnels.ms/auth/login`,
					{
						method: 'POST',
						headers: {
							"Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"

						},
						body: JSON.stringify(usuario)
					})
				let data = await response.json()
				if (response.ok) {
					console.log(data)
				}
				return response.status
				}
				catch (error) {
					return false
				}
  }
  return (
    <>

     
      
      <div className='container '>
   
        <div className='row d-flex justify-content-between'>
          <div className='col-5 d-flex imagenLogIn'>
            <img src="https://www.freeiconspng.com/thumbs/gear-icon-png/white-gear-png-gear-icon-png-white-gear-icon-30.png"/>
          </div>
       
          <div className="col-5 loginForm">
            <form onSubmit={(event) => event.preventDefault}>
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