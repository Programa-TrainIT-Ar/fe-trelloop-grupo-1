import React from 'react'
import fondoPureba from '../login/fondoPureba.jpeg'
const Login = () => {
  return (
    <>

      <div>
        <button>Login</button>
      </div>

      <div className='container '>
        <div className='row justify-content-center loginForm'>
          <div className="col-12 col-md-6">
            <form >
              <div className="form-group">
                <label>Correo electronico</label>
                <input 
                type="text"
                className='form-control'
                name="email"
                />
              </div>

              <div className="form-group mt-3">
                <label>Contraseña</label>
                <input 
                className='form-control'
                type="password"
                name='password'
                />
              </div>

              <div className="form-group mt-3">
                <input type="checkbox"
                  name='remember'
                />
                <label>Recordarme</label>
              </div>
              <div className='row justify-content-center mt-3'>
                    <button className='btn btn-primary '>Iniciar Sesion</button>
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