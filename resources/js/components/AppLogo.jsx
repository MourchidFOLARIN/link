import React from 'react';

// Centralized logo component
// Assumes logo.jpeg is placed in the public folder and served at /logo.jpeg
const AppLogo = () => (
  <div className="auth-logo" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <img src="/logo.jpeg" alt="ExellenceLink Logo" style={{ height: 40, width: 'auto' }} />
  </div>
);

export default AppLogo;
