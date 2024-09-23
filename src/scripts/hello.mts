const {message} = await chrome.storage.local.get('message');
console.log(message);
