import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { Link } from 'react-router-dom'

import toast from 'react-hot-toast'
import axios from 'axios'

import pouring_tea from '../imgs/logowords.png'

const successToast = () => toast.success(`Succesfully Signed Up, Welcome to Matchamaker :)`, { icon: '🥳', duration: 4000 })
const throwError = error => toast.error(`${error.response.data.message}`, { icon: '🥲' })

const Signup = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  const createUser = async () => {
    await axios.post('/api/sign-up', { username, password })
      .then(() => {
        successToast()
        axios.post('/api/login', { username, password })
        .then(() => {
          navigate('/home')
        })
        .catch(error => {
          throwError(error)
        })
      })
      .catch(error => {
        throwError(error)
      })
  }

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      createUser()
    }
  }  

  return (
    <div className="flex justify-center items-center w-screen h-screen">
      <div className="flex justify-center items-center">
        <div className="grid grid-cols-5 bg-light_matcha w-3/4 h-4/6 p-20 rounded-3xl drop-shadow-banner">
          <img src={pouring_tea} alt="" className="object-cover col-span-3 h-full w-5/6 rounded-2xl bg-white shadow-md hover:shadow-xl py-10 px-12" />
          <div className="col-span-2 flex flex-col justify-center items-center">
            <h1 className="text-dark_matcha font-semibold text-6xl font-mono mb-2 mt-8">Signup</h1>
            <h2 className="text-greentea text-2xl inline">
              already have an account?
              <Link to="/" className="text-2xl text-black inline">&nbsp; login</Link>
            </h2>
            <div className="mb-4">
              <input onChange={e => setUsername(e.target.value)} onKeyDown={handleKeyDown} value={username} className="w-80 shadow border rounded-lg py-4 px-3 mt-16 text-center text-black text-lg leading-tight focus:outline-none focus:shadow-outline focus:border-lemon" id="username" type="text" placeholder="Username" />
            </div>
            <div className="mb-4">
              <input onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} value={email} className="w-80 shadow border rounded-lg py-4 px-3 mt-2 text-center text-black text-lg leading-tight focus:outline-none focus:shadow-outline focus:border-lemon" id="email" type="text" placeholder="Email" />
            </div>
            <div className="mb-4">
              <input onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} value={password} className="w-80 shadow border rounded-lg py-4 px-3 mt-2 text-center text-black text-lg leading-tight focus:outline-none focus:shadow-outline focus:border-lemon" id="password" type="password" placeholder="Password" />
            </div>
            <button onClick={e => createUser()} type="submit" className="w-60 shadow appearance-none border rounded-lg py-4 px-3 mt-2 text-orange-700 bg-orange-200 border-chocolate border-t-0 border-l-1 border-r-4 border-b-4 text-lg leading-tight">
              signup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
