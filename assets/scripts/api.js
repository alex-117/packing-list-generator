/**
 * @param queryUrl
 * @returns {Promise<location>}
 */
function getLocationDetails(queryUrl) {

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
}

/**
 * @param woeid
 * @returns {Promise<T>}
 */
function getLocationById(woeid) {
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
}


/**
 * @param woeid
 * @returns {Promise<T>}
 */
function getHistoricalData(woeid, date) {
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
}

/**
 * @param type
 * @returns {Promise<T>}
 */
function getTravelTypePackingList(type) {

  return $.ajax(`/assets/travel-type-packing-lists/${type}.json`)
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((error) => {
      // TODO: handle error messages
      console.log(error);
    });
}