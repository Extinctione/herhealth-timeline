import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import LogExperience from './pages/LogExperience.jsx'
import Timeline from './pages/Timeline.jsx'
import HealthStory from './pages/HealthStory.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/log" element={<LogExperience />} />
        <Route path="/log/:editId" element={<LogExperience />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/health-story" element={<HealthStory />} />
      </Routes>
    </Layout>
  )
}
