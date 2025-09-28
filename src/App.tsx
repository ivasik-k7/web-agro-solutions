import { Routes, Route, HashRouter } from 'react-router-dom';
import './App.css'

import IndexPage from '@pages/IndexPage';
import { AnalyticsView } from './components/AnalyticsPage';
import { AgroDataProvider } from '@/contexts/AgroDataProvider';
import { PlanningView } from './components/PlanningView';
import type { Task } from './types';



function App() {
  return (
    <AgroDataProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/analytics" element={<AnalyticsView />} />
          <Route path="/planning" element={<PlanningView fields={[]} tasks={[]} onTaskUpdate={function (_taskId: string, _status: Task['status'], _actualDuration?: number): void {
            throw new Error('Function not implemented.');
          }} />} />
        </Routes>
      </HashRouter>
    </AgroDataProvider>

  )
}

export default App
