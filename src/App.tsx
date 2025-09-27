import { Routes, Route, HashRouter } from 'react-router-dom';
import './App.css'

import IndexPage from '@pages/IndexPage';


function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />
      </Routes>
    </HashRouter>
  )
}

export default App
