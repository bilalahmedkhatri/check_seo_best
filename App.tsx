
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ToolSuite from './ToolSuite';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      {/* Any path other than the exact "/" will be handled by the ToolSuite */}
      <Route path="/*" element={<ToolSuite />} />
    </Routes>
  );
};

export default App;