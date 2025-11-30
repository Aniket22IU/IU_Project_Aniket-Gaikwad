import React, { useState } from 'react';

function App() {
  const [message, setMessage] = useState('MetroMorph - Urban City Planner');

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f0f0'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        {message}
      </h1>
      <p style={{ color: '#666', fontSize: '18px' }}>
        AI-powered urban planning with Graph Neural Networks
      </p>
      <div style={{ 
        marginTop: '40px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>Features</h2>
        <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
          <li>GNN-based city layout optimization</li>
          <li>Real-time terrain analysis</li>
          <li>Green zone planning</li>
          <li>Traffic flow simulation</li>
          <li>Sustainability scoring</li>
        </ul>
      </div>
    </div>
  );
}

export default App;