import apiRequest from "../utils";
import { useState } from "react"

interface signupProps {
  onSignup: () => void;
  onChangeAuthView: () => void;
}

export default function Signup({onSignup, onChangeAuthView}:signupProps) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('');

    function handleSignup(username:string, password:string){
        return apiRequest<undefined>('/signup', {
            method: 'POST', 
            body: JSON.stringify({username, password})
        });
    }

    function handleSubmit(e:React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        handleSignup(username, password)
        .then(res => {
        if (!res || res.success === false) {
          setError(res?.message || 'Something went wrong');
          return;
        } else {
          onSignup(); 
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
          <h1 className="auth-heading">Create an account</h1>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        
            {error && <p className="form-error">{error}</p>}
        
            <button type="submit" className="btn btn-primary btn-block">Sign up</button>
          </form>
          <p className="auth-switch">Already have an account? <button type="button" className="link-btn" onClick={onChangeAuthView}>Log in</button></p>
        </div>
      </section>
    </>
  )
}