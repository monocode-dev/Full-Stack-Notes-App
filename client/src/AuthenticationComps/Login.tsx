import apiRequest from "../../utils";
import { useState } from "react"

interface loginProps {
  onLogin: () => void;
  onChangeAuthView: () => void;
}

export default function Login({onLogin, onChangeAuthView}:loginProps) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('');

    function handleLogin(username:string, password:string){
        return apiRequest<undefined>('/login', {
            method: 'POST', 
            body: JSON.stringify({username, password})
        });
    }

    function handleSubmit(e:React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        handleLogin(username, password)
        .then(res => {
        if (!res || res.success === false) {
          setError(res?.message || 'Something went wrong');
          return;
        } else {
          onLogin(); 
          setUsername('');
          setPassword('');
        }
      })
    }

  return (
    <>
      <section className="auth-view">
        <div className="auth-card">
          <div className="auth-brand">
            <span className="brand-mark">N</span>
            <span className="brand-name">Notebook</span>
          </div>
          <h1 className="auth-heading">Welcome back</h1>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        
            {error && <p className="form-error">{error}</p>}
        
            <button type="submit" className="btn btn-primary btn-block">Log in</button>
          </form>
          <p className="auth-switch">New here? <button type="button" className="link-btn" onClick={onChangeAuthView}>Create an account</button></p>
        </div>
      </section>
    </>
  )
}