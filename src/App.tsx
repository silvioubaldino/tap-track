import './App.css'
import Layout from './components/Layout'
import { TimeTracker } from './components/TimeTracker'
import { VercelAnalytics } from './features/analytics'

function App() {
  return (
    <>
      <Layout>
        <TimeTracker />
      </Layout>
      <VercelAnalytics />
    </>
  )
}

export default App
