// Saves options to chrome.storage
function save_options() {
  var color = document.getElementById('source').value;
  var likesColor = document.getElementById('isenable').checked;
  chrome.storage.sync.set({
    source: color,
    isEnable: likesColor
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    source: 'YouTube',
    isEnable: true
  }, function(items) {
    document.getElementById('source').value = items.source;
    document.getElementById('isenable').checked = items.isEnable;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
