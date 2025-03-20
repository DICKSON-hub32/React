import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'


const Card = ( {title}) => {
  return (
    <div>
      <h2>{ title } </h2>
    </div>
  )
}
const App = () => {
  return (
    <div>
    <h2>Functional Arrow Component</h2>

    <Card title="Star Wars" />
    <Card title="Avatar" />
    <Card title="The Lion King" />
    </div>
  )
}

export default App
