/** Using `cors-anywhere` proxy to solve CORS error */
const url = 'https://cors-anywhere.herokuapp.com/https://www.metaweather.com/api';

// create form fields
const $startDateInput = $(`#startDate`);
const $endDateInput = $(`#endDate`);
const $destinationInput = $(`#destination`);
// create form button
const $createBtn = $(`#createBtn`);


$createBtn.click(async (e) => {
  e.preventDefault();

  const startDateValue = $startDateInput.val();
  const endDateValue = $endDateInput.val();
  const destinationValue = $destinationInput.val();
  const typeValue = $('.form__radio:checked');

  const queryUrl = `${url}/location/search/?query=${destinationValue}`;

  const locationDetails = await getLocationDetails(queryUrl);
  // if startDate > 5 days in future
  // getLocationByDay (need to set up still, /api/location/(woeid)/(date)/

  // else
  const locationById = await getLocationById(locationDetails.woeid);
});

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
