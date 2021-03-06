import React, { useState, useEffect } from 'react'
import Answer from './Answer'

import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import axios from 'axios'

const FORM_NUMBER = 1

const successToast = () => toast.success(`Survey Form Succesfully Submited, Please Wait For Your Matcha :P`, { icon: '🍵', duration: 4000 })
const throwError = error => toast.error(`${error.message}`, { icon: '🥲' })
const throwMessage = message => toast.error(`${message}`, { icon: '🙃' })

const Survey = () => {
  const navigate = useNavigate()

  const [initialized, setInitialized] = useState(false)

  const [user, setUser] = useState('')

  const [questions, setQuestions] = useState([])
  const [currIndex, setCurrIndex] = useState(0)
  const [currType, setCurrType] = useState('')
  const [currQuestion, setCurrQuestion] = useState()
  const [currOptions, setCurrOptions] = useState([])
  const [currSelected, setCurrSelected] = useState(-1)

  useEffect(() => {
    const getQuestions = async () => {
      const { data } = (await axios.get(`/api/form/${FORM_NUMBER}`))
      setQuestions(data)
      const { question, options, type, selected } = data[currIndex]
      setCurrType(type)
      setCurrOptions(options)
      setCurrQuestion(question)
      if (selected) {
        setCurrSelected(selected)
      }
      setInitialized(true)
    }

    const getUsername = async () => {
      const { data } = (await axios.get('/api/username'))
      if (data !== 'Not signed in') {
        setUser(data)
      }
    }

    getQuestions()
    getUsername()
  }, [])

  useEffect(() => {
    if (initialized) {
      const { question, options, type } = questions[currIndex]
      setCurrType(type)
      setCurrOptions(options)
      setCurrQuestion(question)
    }
  }, [currIndex])

  const onSubmitForm = async () => {
    await axios.post('/api/form_submit', { username: user, responses: questions, form_number: FORM_NUMBER })
    .then(res => {
      successToast()
      navigate('/')
    })
    .catch(error => {
      throwError(error)
    })
  }

  const markChoice = index => {
    questions[currIndex].selected = index
    setCurrSelected(index)
  }

  const lastQuestion = () => {
    if (currIndex <= 0) {
      return
    }
    const { selected } = questions[currIndex - 1]
    if (currIndex === questions.length - 1) {
      setCurrIndex(currIndex - 1)
    } else {
      setCurrIndex(currIndex - 1)
    }
    if (selected || selected === 0) {
      setCurrSelected(selected)
    } else {
      setCurrSelected(-1)
    }
    const { question, options, type } = questions[currIndex]
    setCurrType(type)
    setCurrOptions(options)
    setCurrQuestion(question)
  }

  const nextQuestion = () => {
    if (currSelected === -1) {
      throwMessage('Select a choice first!!')
      return
    }
    if (currIndex >= questions.length - 1) {
      setCurrQuestion('Time to Submit :PP')
      setCurrType('submit')
      return
    }
    const { selected } = questions[currIndex + 1]
    if (selected) {
      setCurrSelected(selected)
    } else {
      setCurrSelected(-1)
    }
    setCurrIndex(currIndex + 1)
    const { question, options, type } = questions[currIndex]
    setCurrType(type)
    setCurrOptions(options)
    setCurrQuestion(question)
  }

  const Left = () => {
    return (
      <button onClick={e => lastQuestion()} type="button" className="mr-10 text-6xl hover:drop-shadow-md hover:text-light_lemon">
        &lt;
      </button>
    )
  }

  const Right = () => {
    return (
      <button onClick={e => nextQuestion()} type="button" className="ml-10 text-6xl hover:drop-shadow-md hover:text-light_lemon">
        &gt;
      </button>
    )
  }

  const AnswerBlock = () => {
    if (initialized) {
      return <Answer type={currType} options={currOptions} markChoice={markChoice} selected={currSelected} onSubmitForm={onSubmitForm}/>
    } else {
      return <></>
    }
  }

  return (
    <>
      <div className="flex justify-center items-center w-screen h-screen py-10 bg-greentea font-mono text-dark_matcha">
        <div className="flex justify-center items-center w-screen">
          <Left />
          <div className="bg-light_matcha w-3/4 h-4/6 p-14 rounded-3xl shadow-lg">
            <div>
              <h1 className="ml-5 mb-10 text-2xl">{currQuestion}</h1>
              <div className="flex flex-col gap-5">
                <AnswerBlock />
              </div>
            </div>
          </div>
          <Right />
        </div>
      </div>
    </>
  )
}

export default Survey
