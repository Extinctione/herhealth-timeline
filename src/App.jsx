import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import LogExperience from './pages/LogExperience.jsx'
import Timeline from './pages/Timeline.jsx'
import HealthStory from './pages/HealthStory.jsx'
import Hera from './pages/Hera.jsx'
import Circle from './pages/Circle.jsx'
import CirclePost from './pages/CirclePost.jsx'
import CareConnect from './pages/CareConnect.jsx'
import HerCycle from './pages/HerCycle.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/log" element={<LogExperience />} />
        <Route path="/log/:editId" element={<LogExperience />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/her-cycle" element={<HerCycle />} />
        <Route path="/health-story" element={<HealthStory />} />
        <Route path="/hera" element={<Hera />} />
        <Route path="/circle" element={<Circle />} />
        <Route path="/circle/:postId" element={<CirclePost />} />
        <Route path="/care-connect" element={<CareConnect />} />
      </Routes>
    </Layout>
  )
}
