import React, { useState, useEffect } from 'react'
import NavBar from './NavBar'
import Answer from './Answer'

import axios from 'axios'

const Survey = () => {
  const [initialized, setInitialized] = useState(false)

  const [questions, setQuestions] = useState([])
  const [currIndex, setCurrIndex] = useState(0)
  const [currType, setCurrType] = useState('')
  const [currQuestion, setCurrQuestion] = useState()
  const [currOptions, setCurrOptions] = useState([])

  useEffect(() => {
    const getQuestions = async () => {
      const { data } = (await axios.get('/form/1'))
      setQuestions(data)
      const { question, options, type } = data[currIndex]
      setCurrType(type)
      setCurrOptions(options)
      setCurrQuestion(question)
      setInitialized(true)
    }
    getQuestions()
  }, [])

  useEffect(() => {
    if (initialized) {
      const { question, options, type } = questions[currIndex]
      setCurrType(type)
      setCurrOptions(options)
      setCurrQuestion(question)
    }
  }, [currIndex])

  const lastQuestion = () => {
    if (currIndex <= 0) {
      return
    }
    setCurrIndex(currIndex - 1)
    const { question, options, type } = questions[currIndex]
    setCurrType(type)
    setCurrOptions(options)
    setCurrQuestion(question)
  }

  const nextQuestion = () => {
    if (currIndex >= questions.length - 1) {
      return
    }
    setCurrIndex(currIndex + 1)
    const { question, options, type } = questions[currIndex]
    setCurrType(type)
    setCurrOptions(options)
    setCurrQuestion(question)
  }

  const Left = () => {
    return (
      <button onClick={e => lastQuestion()} type="button" className="mr-10 text-6xl">
        &lt;
      </button>
    )
  }

  const Right = () => {
    return (
      <button onClick={e => nextQuestion()} type="button" className="ml-10 text-6xl">
        &gt;
      </button>
    )
  }

  const markChoice = index => {
    questions[currIndex].selected = index
  }

  const AnswerBlock = () => {
    if (initialized) {
      console.log(currOptions)
      return <Answer type={currType} options={currOptions} markChoice={markChoice} />
    } else {
      return <></>
    }
  }

  return (
    <>
      <NavBar />
      <div className="w-screen h-screen py-10 bg-greentea font-mono text-dark_matcha">
        <div className="flex justify-center">
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
