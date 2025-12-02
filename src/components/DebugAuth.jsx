// components/DebugAuth.jsx - Add this temporarily to debug
import React, { useState, useEffect } from 'react';

const DebugAuth = () => {
  const [authData, setAuthData] = useState({
    sessionToken: null,
    sessionUser: null,
    localToken: null,
    localUser: null
  });

  useEffect(() => {
    setAuthData({
      sessionToken: sessionStorage.getItem('token'),
      sessionUser: sessionStorage.getItem('user'),
      localToken: localStorage.getItem('token'),
      localUser: localStorage.getItem('user')
    });
  }, []);

  const clearAll = () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-header bg-info text-white">
          <h3>Auth Debug Panel</h3>
        </div>
        <div className="card-body">
          <h5>SessionStorage</h5>
          <div className="mb-3">
            <strong>Token:</strong>
            <pre className="bg-light p-2 mt-1" style={{ fontSize: '12px', overflow: 'auto' }}>
              {authData.sessionToken || 'null'}
            </pre>
          </div>
          <div className="mb-4">
            <strong>User:</strong>
            <pre className="bg-light p-2 mt-1" style={{ fontSize: '12px', overflow: 'auto' }}>
              {authData.sessionUser || 'null'}
            </pre>
          </div>

          <hr />

          <h5>LocalStorage</h5>
          <div className="mb-3">
            <strong>Token:</strong>
            <pre className="bg-light p-2 mt-1" style={{ fontSize: '12px', overflow: 'auto' }}>
              {authData.localToken || 'null'}
            </pre>
          </div>
          <div className="mb-4">
            <strong>User:</strong>
            <pre className="bg-light p-2 mt-1" style={{ fontSize: '12px', overflow: 'auto' }}>
              {authData.localUser || 'null'}
            </pre>
          </div>

          <button className="btn btn-danger" onClick={clearAll}>
            Clear All Storage & Reload
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugAuth;