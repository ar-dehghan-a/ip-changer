chrome.runtime.onInstalled.addListener(({reason}) => {
  if (reason === 'install') chrome.storage.local.set({message: 'Hello from RECHEX'});
});

chrome.storage.local.get('message').then(({message}) => console.log(message));
