import { useState } from 'react'
import './App.css'
import Layout from './components/Layout'
import Card from './components/Card'
import TimeDisplay from './components/TimeDisplay'

function App() {
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Card className="mb-6">
          <TimeDisplay 
            seconds={elapsedTime}
            label="Tempo de Hoje"
          />
          
          <div className="mt-6">
            <button 
              onClick={toggleTracking}
              className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
                isTracking 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isTracking ? "Parar" : "Iniciar"}
            </button>
          </div>
        </Card>
        
        <Card title="Intervalos">
          <div className="text-gray-600 dark:text-gray-300 text-center p-4">
            Nenhum intervalo registrado hoje.
          </div>
        </Card>
      </div>
    </Layout>
  )
}

export default App
