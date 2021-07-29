import logo from './logo.svg';
import './App.css';
import OpenCV from './components/opencvTest'

function App() {
  return (
    <div className="App">
      <header className="App-header">
       <OpenCV canvas_id={3}/>
       <OpenCV canvas_id={31}/>
       <OpenCV canvas_id={32}/>
      </header>
    </div>
  );
}

export default App;
