import React from 'react';
import {useChromeLocalStorage} from 'rechex';
import './App.scss';

const App: React.FC = () => {
  const [proxies, setProxies] = useChromeLocalStorage<string[]>('proxies', []);
  const [proxyAddress, setAddress] = useChromeLocalStorage('proxyAddress', '');
  const [proxyUsername, setProxyUsername] = useChromeLocalStorage('proxyUsername', 'admin');
  const [proxyPassword, setProxyPassword] = useChromeLocalStorage('proxyPassword', 'admin@951753');
  const [ipRotate, setIpRotate] = useChromeLocalStorage('ipRotate', false);
  const [ipRotateHour, setIpRotateHour] = useChromeLocalStorage('ipRotateHour', 1);
  const [active, setActive] = useChromeLocalStorage('active', false);

  const [addProxy, setAddProxy] = React.useState('');
  const [canSave, setCanSave] = React.useState(false);

  const [username, setUsername] = React.useState(proxyUsername);
  const [password, setPassword] = React.useState(proxyPassword);
  const [rotateHour, setRotateHour] = React.useState(ipRotateHour);

  React.useEffect(() => {
    setUsername(proxyUsername);
    setPassword(proxyPassword);
    setRotateHour(ipRotateHour);
  }, [proxyUsername, proxyPassword, ipRotateHour]);

  const proxyAdder = () => {
    const regex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{2,5}$/;

    if (!addProxy.match(regex)) {
      setAddProxy('Not valid address');
      return;
    }

    if (proxies.includes(addProxy)) {
      setAddProxy('This IP exists');
      return;
    }

    const newProxies = [...proxies, addProxy];
    if (proxyAddress === '') setAddress(newProxies[0]);
    setProxies(newProxies);
    setAddProxy('');
  };

  const proxyRemover = () => {
    if (proxyAddress === '') return;

    let newProxies = [...proxies];
    newProxies = newProxies.filter(proxy => proxy != proxyAddress);
    setProxies(newProxies);

    if (newProxies.length === 0) setAddress('');
    else setAddress(newProxies[0]);
  };

  const onSave = () => {
    setProxyUsername(username);
    setProxyPassword(password);
    setIpRotateHour(rotateHour);
    setCanSave(false);
  };

  React.useEffect(() => {
    const icons = (active: boolean) => ({
      16: `../icons/${active ? 'active' : 'icon'}-16.png`,
      32: `../icons/${active ? 'active' : 'icon'}-32.png`,
      48: `../icons/${active ? 'active' : 'icon'}-48.png`,
      128: `../icons/${active ? 'active' : 'icon'}-128.png`,
    });

    chrome.action.setIcon({
      path: icons(active),
    });
  }, [active]);

  return (
    <div className="app">
      <div className="row">
        <div className="section" style={{flexGrow: 1}}>
          <label htmlFor="addProxy">Add proxy:</label>
          <input
            type="text"
            id="addProxy"
            value={addProxy}
            onChange={({target: {value}}) => setAddProxy(value)}
            placeholder="ip:port"
          />
        </div>

        <button
          className="saveBTN"
          style={{marginTop: '16px', padding: '4px 10px', fontSize: '12px'}}
          onClick={proxyAdder}
        >
          Add
        </button>
      </div>

      <div className="row">
        <div className="section" style={{flexGrow: 1}}>
          <label>Proxy:</label>
          <select value={proxyAddress} onChange={({target: {value}}) => setAddress(value)}>
            {proxies.map(proxy => (
              <option key={crypto.randomUUID()} value={proxy}>
                {proxy}
              </option>
            ))}
          </select>
        </div>

        <button
          className="saveBTN"
          style={{marginTop: '16px', padding: '4px 10px', fontSize: '12px'}}
          onClick={proxyRemover}
        >
          Remove
        </button>
      </div>

      <div className="row">
        <div className="section">
          <label htmlFor="proxyUsername">Username:</label>
          <input
            type="text"
            id="proxyUsername"
            value={username}
            onChange={({target: {value}}) => {
              setUsername(value);
              setCanSave(true);
            }}
          />
        </div>

        <div className="section">
          <label htmlFor="proxyPassword">Password:</label>
          <input
            type="password"
            id="proxyPassword"
            value={password}
            onChange={({target: {value}}) => {
              setPassword(value);
              setCanSave(true);
            }}
          />
        </div>
      </div>

      <div className="checkboxSection">
        <label htmlFor="ipRotate">IP Rotate:</label>
        <input
          type="checkbox"
          id="ipRotate"
          name="ipRotate"
          checked={ipRotate}
          onChange={() => setIpRotate(!ipRotate)}
        />
      </div>

      {ipRotate && (
        <div className="section">
          <label htmlFor="ipRotateHour">IP Rotate Hour:</label>
          <input
            type="number"
            id="ipRotateHour"
            name="ipRotateHour"
            value={rotateHour}
            onChange={({target: {value}}) => {
              setRotateHour(+value);
              setCanSave(true);
            }}
          />
        </div>
      )}

      <div className="row">
        <button className="saveBTN" style={{width: '50%'}} onClick={onSave} disabled={!canSave}>
          Save
        </button>

        <div style={{width: '50%'}}>
          <button
            className={`active__btn ${active && 'active'}`}
            onClick={() => setActive(!active)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="ionicon"
              viewBox="0 0 512 512"
              width={30}
              height={30}
            >
              <path
                d="M378 108a191.41 191.41 0 0170 148c0 106-86 192-192 192S64 362 64 256a192 192 0 0169-148M256 64v192"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="42"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
