
import MNIST from "./mnist"

function App() {
  return (
    <div className='container'>
      <div className='description'>
        <h1>React MNIST</h1>
        <text><a href="https://en.wikipedia.org/wiki/MNIST_database" target="_blank">MNIST</a> is a large database of handwritten digits from 0 to 9. It is commonly used for training purposes of various image preprocessing systems.</text>
        <text>To test the machine learning model trained with MNIST, <b>draw a digit in the black board.</b></text>
      </div>
      <div className='board'>
        <MNIST />
      </div>
      <footer>
        <a target="_blank" href="https://xbdrcx.github.io"><h1>BC</h1></a>
      </footer>
    </div>
  )
}

export default App
