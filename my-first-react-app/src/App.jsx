import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'


const Card = ( {title}) => {
  const [hasLiked, setHasLiked] = useState(false);

  return (
    <div className="card">
      <h2>{ title } </h2>

      <button onClick={() => setHasLiked(true)}>
        {hasLiked ? '❤️' : '🤍'}
      </button>
    </div>
  )
}
const App = () => {


  return (
    <div className="card-container">
    <Card title="Star Wars" />
    <Card title="Avatar" />
    <Card title="The Lion King" />
    </div>
  )
}

export default App
