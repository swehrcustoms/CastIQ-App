import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="flex min-h-screen items-center justify-center bg-castiq-blue-dark">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-castiq-teal">CastIQ</h1>
                <p className="mt-2 text-castiq-muted">Minnesota Fisheries Intelligence</p>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
