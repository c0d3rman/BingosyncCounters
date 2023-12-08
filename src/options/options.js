// Saves options to chrome.storage
const saveOptions = () => {
  const show_when_complete = document.getElementById('show_when_complete').checked;

  chrome.storage.sync.set(
    { show_when_complete: show_when_complete },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(() => {
        status.textContent = '';
      }, 750);
    }
  );
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get(
    { show_when_complete: false },
    (items) => {
      document.getElementById('show_when_complete').checked = items.show_when_complete;
    }
  );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);