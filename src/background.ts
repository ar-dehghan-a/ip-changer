interface LocalStorageType {
  proxies: string[];
  proxyAddress: string;
  proxyUsername: string;
  proxyPassword: string;
  ipRotate: boolean;
  ipRotateHour: number;
  active: boolean;
}

const initialValue: LocalStorageType = {
  proxies: [],
  proxyAddress: '',
  proxyUsername: 'admin',
  proxyPassword: 'admin@951753',
  ipRotate: false,
  ipRotateHour: 1,
  active: false,
};

chrome.runtime.onInstalled.addListener(({reason}) => {
  if (reason === 'install') chrome.storage.local.set(initialValue);
});

chrome.windows.onCreated.addListener(async () => {
  const {active} = await chrome.storage.local.get('active');

  var iconPath = {
    active: {
      16: 'icons/active-16.png',
      32: 'icons/active-32.png',
      48: 'icons/active-48.png',
      128: 'icons/active-128.png',
    },
    default: {
      16: 'icons/icon-16.png',
      32: 'icons/icon-32.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png',
    },
  };

  chrome.action.setIcon({path: active ? iconPath.active : iconPath.default});
});

class ProxyClass {
  storedData: LocalStorageType = initialValue;
  rotating: NodeJS.Timeout | string | number | undefined;

  config(proxyAddress: string) {
    if (proxyAddress === '') {
      return {
        mode: 'direct',
      };
    }
    return {
      mode: 'fixed_servers',
      rules: {
        singleProxy: {
          scheme: 'http',
          host: proxyAddress.split(':')[0],
          port: parseInt(proxyAddress.split(':')[1]),
        },
        bypassList: ['localhost'],
      },
    };
  }

  credentialsToHeader(details: any, proxyUsername: string, proxyPassword: string) {
    const encoder = new TextEncoder();

    if (proxyUsername === '' && proxyPassword === '') {
      return {requestHeaders: details.requestHeaders};
    }

    for (var header of details.requestHeaders) {
      if (header.name == 'Authorization') {
        return {};
      }
    }

    details.requestHeaders.push({
      name: 'Authorization',
      value: 'Basic ' + encoder.encode(proxyUsername + ':' + proxyPassword),
    });

    return {requestHeaders: details.requestHeaders};
  }

  authCredentials(proxyUsername: string, proxyPassword: string) {
    return {
      authCredentials: {
        username: proxyUsername,
        password: proxyPassword,
      },
    };
  }

  setProxy(proxyAddress: string, proxyUsername: string, proxyPassword: string) {
    if (proxyAddress.trim() === '') {
      chrome.proxy.settings.set({value: this.config(''), scope: 'regular'});
    } else {
      chrome.proxy.settings.set({value: this.config(proxyAddress), scope: 'regular'}, () => {
        if (proxyAddress !== '' && proxyUsername !== '') {
          if (chrome.webRequest.onAuthRequired) {
            chrome.webRequest.onAuthRequired.addListener(
              () => {
                return this.authCredentials(proxyUsername.trim(), proxyPassword.trim());
              },
              {urls: ['<all_urls>']},
              ['blocking']
            );
          } else {
            chrome.webRequest.onBeforeSendHeaders.addListener(
              details => {
                return this.credentialsToHeader(
                  details,
                  proxyUsername.trim(),
                  proxyPassword.trim()
                );
              },
              {urls: ['<all_urls>']},
              ['blocking', 'requestHeaders']
            );
          }
        }
      });
    }
    this.debugProxySettings();
  }

  rotateProxy(rotateHour: number) {
    this.rotating = setTimeout(() => {
      let index = this.storedData.proxies.findIndex(proxy => proxy == this.storedData.proxyAddress);

      if (++index >= this.storedData.proxies.length) index = 0;
      chrome.storage.local.set({proxyAddress: this.storedData.proxies[index]});
      console.log('IP Changed to ' + this.storedData.proxies[index]);
    }, rotateHour * 60 * 60 * 1000);
  }

  debugProxySettings() {
    chrome.proxy.settings.get({incognito: false}, config => {
      console.group('debugProxy');

      if (chrome.runtime.lastError)
        console.log('Error setting proxy: ' + chrome.runtime.lastError.message);
      else console.log('Proxy set successfully');
      console.log('Proxy settings: ' + JSON.stringify(config))

      console.groupEnd();
    });
  }

  init() {
    if (Object.keys(this.storedData).length !== 0) {
      if (this.storedData.active) {
        this.setProxy(
          this.storedData.proxyAddress,
          this.storedData.proxyUsername,
          this.storedData.proxyPassword
        );

        clearInterval(this.rotating);
        if (this.storedData.ipRotate) this.rotateProxy(this.storedData.ipRotateHour);
      } else this.setProxy('', '', '');
    }

    chrome.storage.onChanged.addListener(() => {
      chrome.storage.local.get(null, items => {
        this.storedData = items as LocalStorageType;
        if (this.storedData.active) {
          this.setProxy(
            this.storedData.proxyAddress,
            this.storedData.proxyUsername,
            this.storedData.proxyPassword
          );

          clearInterval(this.rotating);
          if (this.storedData.ipRotate) this.rotateProxy(this.storedData.ipRotateHour);
        } else this.setProxy('', '', '');
      });
    });
  }

  run() {
    chrome.storage.local.get(null, items => {
      this.storedData = items as LocalStorageType;
      this.init();
    });
  }
}

new ProxyClass().run();
