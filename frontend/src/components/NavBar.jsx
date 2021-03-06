import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import axios from 'axios'
 
// logo
import logo from '../imgs/logo.png'
 
const NavBar = () => {
  const [user, setUser] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  // const [isAdmin, setIsAdmin] = useState(false)

  const navigate = useNavigate()

  const logout = async () => {
    await axios.post('/api/logout')
      .then(() => {
        setLoggedIn(false)
        navigate('/')
      })
      .catch(error => {
        alert(`${error.response.data}`)
      })
  }

  useEffect(() => {
    const getUsername = async () => {
      const {data} = (await axios.get('/api/username').catch(err => {
        if (err.response) {
          if (err.response.status === 406) {
            navigate('/') //user not logged in
          } 
        }
      }))
      if (data.message !== 'Not signed in') {
        setLoggedIn(true)
        setUser(data) 
      } 
    }

    // const getUserdetails = async () => {
    //   const {data} = await axios.get('/api/details')
    //   setIsAdmin(data.admin)
    // }

    getUsername()
    // getUserdetails()
  }, [])

  return (
    <>
      <nav className="shadow-sm bg-light_greentea font-mono">
        <div className="flex flex-row justify-between align-center py-4 px-4">
          <div className="basis-1/3 flex">
            <img src={logo} alt="" className="justify-self-start w-20 h-20 py-1 ml-3 rounded-full shadow-md hover:shadow-xl bg-light_lemon" />
          </div>
          <ul className="basis-1/3 flex justify-self-center justify-center items-center gap-12 text-dark_matcha text-xl font-semibold">
            <li>
              <Link to="/gallery" className="hover:bg-matcha hover:shadow-md py-3 px-8 rounded-xl">Gallery</Link>
            </li>
            <li>
              <Link to="/home" className="hover:bg-matcha hover:shadow-md border-x-4 border-dotted border-matcha py-3 px-8 rounded-xl">Home</Link>
            </li>
            {/* {isAdmin && (
              <li>
                <Link to="/admin" className="hover:bg-matcha hover:shadow-md py-3 px-8 rounded-xl">Admin</Link>
              </li>
            )} */}
            <li>
              <Link to="/profile" className="hover:bg-matcha hover:shadow-md py-3 px-8 rounded-xl">Profile</Link>
            </li>
          </ul>
          <div className="basis-1/3 self-center text-dark_matcha text-2xl">
            {loggedIn && (
              <div className="text-right mr-3">
                <span>Hi {user}! </span>
                <button onClick={e => logout()} type='submit'>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
 
export default NavBar