/** Using `cors-anywhere` proxy to solve CORS error */
const url = 'https://cors-anywhere.herokuapp.com/https://www.metaweather.com/api';
const snowConditionAbbr = ['sn', 'sl'];
const rainConditionAbbr = ['h', 't', 'hr', 'lr', 's'];

// create form fields
const $startDateInput = $(`#startDate`);
const $endDateInput = $(`#endDate`);
const $destinationInput = $(`#destination`);
// create form button
const $createBtn = $(`#createBtn`);

// style date objects for input vals and mins
const formatDate = (date) => {
  const dd = String(date.getDate()).padStart(2, `0`);
  const mm = String(date.getMonth() + 1).padStart(2, `0`);
  const yyyy = date.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};

const formatHistoricalAPIDate = (date) => {
  const dd = String(date.getDate());
  const mm = String(date.getMonth() + 1);
  const yyyy = date.getFullYear() - 1;
  return `${yyyy}/${mm}/${dd}`;

};

const currentDate = () => {
  const today = formatDate(new Date());
  return today;
};

const tomorrowsDate = () => {
  const today = new Date();
  let tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow = formatDate(tomorrow);
  return tomorrow;
};

const setDateVals = () => {
  // set current date as default value for start date
  $startDateInput.val(currentDate());
  // set current date as min for start date
  $startDateInput.attr({ min: currentDate() });
  // set tomorrow's date as default value for end date
  $endDateInput.val(tomorrowsDate());
  // set tomorrow's date as min for end date
  $endDateInput.attr({ min: currentDate() });
};

$createBtn.click((e) => {
  e.preventDefault();

  const startDateValue = $startDateInput.val();
  const endDateValue = $endDateInput.val();
  const destinationValue = $destinationInput.val();
  const typeValue = $('#type').val();

  const queryUrl = `${url}/location/search/?query=${destinationValue}`;


  // getLocationByDay (need to set up still, /api/location/(woeid)/(date)/
  // 1) get lat/lon and woeid
  getLocationDetails(queryUrl)
    .then(function (location) {
      // 2) if startDate > 5 days in future 
      const startDate = new Date(startDateValue);
      var compareDate = new Date();
      compareDate.setDate(compareDate.getDate() + 5);


      if (startDate.getTime() > compareDate.getTime()) {
        getHistoricalData(location.woeid, startDate)
          .then(function (data) {

            try {

              const tempTotals = {
                max: 0,
                min: 0,
              };

              const weatherWarnings = {
                rain: false,
                snow: false,
              };

              data.reduce(function (result, current) {

                result.max += current.max_temp;
                result.min += current.min_temp;

                if (snowConditionAbbr.includes(current.weather_state_abbr)) {
                  weatherWarnings.snow = true;
                }

                if (rainConditionAbbr.includes(current.weather_state_abbr)) {
                  weatherWarnings.rain = true;
                }

                return result;

              }, tempTotals);

              const weatherAvgs = {
                max: calculateAverage(tempTotals.max, data.length),
                min: calculateAverage(tempTotals.min, data.length),
              };

              weatherAvgs.max = convertToFahrenheit(weatherAvgs.max);
              weatherAvgs.min = convertToFahrenheit(weatherAvgs.min);

            } catch (e) {
              console.log(e)
            }
          });
      } else {

        getLocationById(location.woeid)
          .then(function (locationDetails) {
            // console.log(locationDetails)
          });
      }

    });
});


function calculateAverage(number, denominator) {
  return number / denominator;
}

function convertToFahrenheit(c) {
  return (c * (9 / 5)) + 32
}


/**
 * @param queryUrl
 * @returns {Promise<location>}
 */
const getLocationDetails = (queryUrl) => {
  return $.ajax(queryUrl)
    .then((response) => {
      // if no match is found, returns empty []
      if (!response.length) {
        throw Error('Empty response');
      }

      return response[0]; // get first response and hope it's the right one :)
    })
    .catch((error) => {
      // TODO: handle error messages
      console.log(error);
    });
};

/**
 * @param woeid
 * @returns {Promise<T>}
 */
const getLocationById = (woeid) => {
  return $.ajax(`${url}/location/${woeid}`)
    .then((response) => {
      if (!response) {
        throw Error('Invalid ID');
      }
      return response;
    })
    .catch((error) => {
      // TODO: handle error messages
      console.log(error);
    });
};

/**
 * @param woeid
 * @returns {Promise<T>}
 */
const getHistoricalData = (woeid, date) => {

  return $.ajax(`${url}/location/${woeid}/${formatHistoricalAPIDate(date)}`)
    .then((response) => {
      if (!response) {
        throw Error('Invalid ID');
      }
      return response;
    })
    .catch((error) => {
      // TODO: handle error messages
      console.log(error);
    });
};

$(document).ready(() => {
  $startDateInput.change(() => {
    // prevent end date from occuring BEFORE start date
    $endDateInput.attr({ min: $startDateInput.val() });
  });

  setDateVals();
});
