document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('time-entry-form');
  const saveBtn = document.getElementById('save-btn');
  const tableBody = document.querySelector('#entries-table tbody');

  const startHour = document.getElementById('start-hour');
  const startMinute = document.getElementById('start-minute');
  const startAmpm = document.getElementById('start-ampm');
  const endHour = document.getElementById('end-hour');
  const endMinute = document.getElementById('end-minute');
  const endAmpm = document.getElementById('end-ampm');

  // Populate hour and minute dropdowns
  for (let i = 1; i <= 12; i++) {
    const option = new Option(i.toString().padStart(2, '0'), i);
    startHour.appendChild(option.cloneNode(true));
    endHour.appendChild(option.cloneNode(true));
  }

  for (let i = 0; i < 60; i += 5) {
    const option = new Option(i.toString().padStart(2, '0'), i);
    startMinute.appendChild(option.cloneNode(true));
    endMinute.appendChild(option.cloneNode(true));
  }

  // Set default time: 08:00 AM to 05:30 PM
  function setDefaultTimes() {
    startHour.value = '8';
    startMinute.value = '0';
    startAmpm.value = 'AM';

    endHour.value = '5';
    endMinute.value = '30';
    endAmpm.value = 'PM';
  }
  setDefaultTimes();

  // Helper to convert 12-hour time to minutes
  function getTimeInMinutes(hour, minute, ampm) {
    let h = parseInt(hour);
    const m = parseInt(minute);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }

  function formatTime(hour, minute, ampm) {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }

  function calculateHours(startMins, endMins, hasLunchBreak) {
    let duration = endMins - startMins;
    if (hasLunchBreak) duration -= 60;
    return (duration / 60).toFixed(2);
  }

  function addEntryToTable(date, startTime, endTime, lunch, hours) {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${date}</td>
      <td>${startTime}</td>
      <td>${endTime}</td>
      <td>${lunch ? '✔️' : ''}</td>
      <td>${hours}</td>
      <td><button class="action-btn">Delete</button></td>
    `;

    row.querySelector('.action-btn').addEventListener('click', () => row.remove());
    tableBody.appendChild(row);
  }

  saveBtn.addEventListener('click', function () {
    const lunchCheckbox = document.getElementById('lunch-break');
    const wasChecked = lunchCheckbox.checked;

    const date = document.getElementById('date').value;

    if (!date || !startHour.value || !startMinute.value || !endHour.value || !endMinute.value) {
      alert('Please complete all time fields.');
      return;
    }

    const startMins = getTimeInMinutes(startHour.value, startMinute.value, startAmpm.value);
    const endMins = getTimeInMinutes(endHour.value, endMinute.value, endAmpm.value);

    if (endMins <= startMins) {
      alert('End time must be after start time.');
      return;
    }

    const formattedStart = formatTime(startHour.value, startMinute.value, startAmpm.value);
    const formattedEnd = formatTime(endHour.value, endMinute.value, endAmpm.value);

    // Check for duplicate entries
    const isDuplicate = Array.from(tableBody.rows).some(row => {
      const cells = row.cells;
      return (
        cells[0].textContent === date &&
        cells[1].textContent === formattedStart &&
        cells[2].textContent === formattedEnd
      );
    });

    if (isDuplicate) {
      alert('An entry for this date and time already exists.');
      return;
    }

    const totalHours = calculateHours(startMins, endMins, wasChecked);
    addEntryToTable(date, formattedStart, formattedEnd, wasChecked, totalHours);

    form.reset(); // Reset all fields
    lunchCheckbox.checked = wasChecked; // Restore checkbox state
    setDefaultTimes(); // Reapply default times
  });
});
