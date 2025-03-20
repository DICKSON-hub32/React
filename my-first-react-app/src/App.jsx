import { use, useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'


const Card = ( {title}) => {
  const [count, setCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    console.log(`The ${title} has been liked: ${hasLiked}`);
  }, [hasLiked, title]);


  return (
    <div className="card"  onClick={() => setCount(count + 1)}>
      <h2>{ title } <br /> {count || null}</h2>

      <button onClick={() => setHasLiked(!hasLiked)}>
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
