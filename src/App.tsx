import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import News from './pages/News';
import Screener from './pages/Screener';
import Portfolio from './pages/Portfolio';
import AIAdvisor from './pages/AIAdvisor';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/news" element={<News />} />
          <Route path="/screener" element={<Screener />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/ai-advisor" element={<AIAdvisor />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
