import React from 'react';
import {useChromeLocalStorage} from 'rechex';
import './App.scss';

const App: React.FC = () => {
  const [counter, setCounter, clearCounter] = useChromeLocalStorage('counter', 0);

  return (
    <>
      <h1 className="text-lg font-medium mb-2">
        My name is <span className="text-cyan-400">RE</span>
        <span className="text-yellow-400">CH</span>
        <span className="text-red-600">EX</span>
      </h1>

      <div className="mb-2">
        <button
          className="p-2 bg-cyan-100 border border-red-950 rounded-md"
          onClick={() => setCounter(counter + 1)}
        >
          Counter: {counter}
        </button>
      </div>

      <div className="mb-2">
        <button className="p-1 bg-red-100 rounded" onClick={() => clearCounter()}>
          Clear local storage
        </button>
      </div>

      <p className="font-medium">Edit src/pages/options/App.tsx</p>
    </>
  );
};

export default App;
