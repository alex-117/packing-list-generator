// style date objects for input vals and mins
function formatDate(date) {
  const dd = String(date.getDate()).padStart(2, `0`);
  const mm = String(date.getMonth() + 1).padStart(2, `0`);
  const yyyy = date.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}

function formatHistoricalAPIDate(date) {
  const dd = String(date.getDate());
  const mm = String(date.getMonth() + 1);
  const yyyy = date.getFullYear() - 1;
  return `${yyyy}/${mm}/${dd}`;

}

function currentDate() {
  const today = formatDate(new Date());
  return today;
}

function tomorrowsDate() {
  const today = new Date();
  let tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow = formatDate(tomorrow);
  return tomorrow;
}

function calculateAverage(number, denominator) {
  return number / denominator;
}

function convertToFahrenheit(c) {
  return (c * (9 / 5)) + 32
}

/**
 * Gets the packing list from storage
 * @returns {Array<Packing-Item>}
 */
function getPackingListFromStorage() {
  return JSON.parse(localStorage.getItem('packing-list'))
}

/**
 * Saves the list to localStorage
 * @param list 
 */
function savePackingListToStorage(list) {
  localStorage.setItem('packing-list', JSON.stringify(list));
}