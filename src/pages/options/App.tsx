import React from 'react';
import {useChromeLocalStorage} from 'rechex';
import './App.scss';

const App: React.FC = () => {
  const [proxies, setProxies] = useChromeLocalStorage<string[]>('proxies', []);
  const [value, setValue] = React.useState('');

  const handleExport = () => {
    setValue(() => JSON.stringify(proxies));
  };

  const handleImport = () => {
    const regex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{2,5}$/;
    try {
      const proxiesImported = JSON.parse(value) as string[];
      if (proxiesImported.every(proxy => proxy.match(regex))) {
        setProxies(proxiesImported);
        setValue('');
        alert('Import successful');
      } else setValue('Not valid address');
    } catch (error) {
      setValue('Not valid json');
    }
  };

  return (
    <section>
      <div>
        <label htmlFor="im-ex">Import / Export:</label>
        <textarea
          name="im-ex"
          id="im-ex"
          cols={80}
          rows={8}
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      </div>

      <div className="imex">
        <button onClick={handleImport}>Import</button>
        <button onClick={handleExport}>Export</button>
      </div>
    </section>
  );
};

export default App;
