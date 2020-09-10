/** Using `cors-anywhere` proxy to solve CORS error */
const url = 'https://cors-anywhere.herokuapp.com/https://www.metaweather.com/api';
const snowConditionAbbr = ['sn', 'sl'];
const rainConditionAbbr = ['h', 't', 'hr', 'lr', 's'];
const sunnyConditionAbbr = ['c'];

// create form fields
const $startDateInput = $(`#startDate`);
const $endDateInput = $(`#endDate`);
const $destinationInput = $(`#destination`);
const $typeInput = $(`#type`);
// create form button
const $createBtn = $(`#createBtn`);

// packing list form
const $packingLists = $(`#packingLists`);
const $savePackingListBtn = $(`#savePackingListBtn`);



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

  const queryUrl = `${url}/location/search/?query=${$destinationInput.val()}`;


  getLocationDetails(queryUrl)
    .then(function (location) {
      // compare if startDate > 5 days in future 
      const startDate = new Date($startDateInput.val());
      const compareDate = new Date();
      compareDate.setDate(compareDate.getDate() + 5);


      if (startDate.getTime() > compareDate.getTime()) {
        getHistoricalData(location.woeid, startDate)
          .then(useHistoricalData);
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

function useHistoricalData(data) {
  try {

    const tempTotals = {
      max: 0,
      min: 0,
    };

    const weatherConditions = {
      rain: false,
      snow: false,
      sunny: false
    };

    data.reduce(function (result, current) {

      result.max += current.max_temp;
      result.min += current.min_temp;

      if (snowConditionAbbr.includes(current.weather_state_abbr)) {
        weatherConditions.snow = true;
      }

      if (rainConditionAbbr.includes(current.weather_state_abbr)) {
        weatherConditions.rain = true;
      }

      if (sunnyConditionAbbr.includes(current.weather_state_abbr)) {
        weatherConditions.sunny = true;
      }

      return result;

    }, tempTotals);

    const weatherAvgs = {
      max: calculateAverage(tempTotals.max, data.length),
      min: calculateAverage(tempTotals.min, data.length),
    };

    weatherAvgs.max = convertToFahrenheit(weatherAvgs.max);
    weatherAvgs.min = convertToFahrenheit(weatherAvgs.min);

    generatePackingListUI(weatherAvgs, weatherConditions);
  } catch (e) {
    console.log(e)
  }
}

function generatePackingListUI(weatherAvgs, weatherConditions) {
  // take packing list & weather conditions
  getTravelTypePackingList($typeInput.val())
    .then(function (list) {

      if (!weatherConditions.rain) delete list.rain;
      if (!weatherConditions.snow) delete list.snow;
      if (!weatherConditions.sunny) delete list.sunny;

      for (let key in list) {
        packingListDisplay(key, list[key]);
      }

    });
}

$savePackingListBtn.on('click', function (e) {
  e.preventDefault();
  
  const packingList = {};

  const $packingItems = $(`input[name="packing-item"]`)

  for (let i = 0; i < $packingItems.length; i++) {
    const $item = $($packingItems[i]);
    const itemType = $item.data(`type`);
    const isItemChecked = $item.is(`:checked`);
    const itemValue = $item.val();

    if (!packingList[itemType]) {
      packingList[itemType] = {
        checked: [],
        unchecked: []
      }
    }

    if (isItemChecked) {
      packingList[itemType].checked.push(itemValue);
    } else {
      packingList[itemType].unchecked.push(itemValue);
    }
  }

  // TODO: save to local storage
  console.log(packingList);


});

function packingListDisplay(headerText, listItems) {
  try {

    const $listHeader = $(`<h3 class="form_packing-list-header">`);
    $listHeader.text(headerText);

    const $listWrapper = $(`<ul class="form__packing-list">`);

    $packingLists.append($listHeader);
    $packingLists.append($listWrapper);

    for (let i = 0; i < listItems.length; i++) {
      const item = listItems[i];
      const $listItem = $(`<li class="form__packing-list-item">`);
      const $itemLabel = $(`<label class="form__list-item-label" />`);
      const $itemCheckbox = $(`<input class="form__list-item-checkbox" />`);

      $itemLabel.attr(`for`, `${headerText}-${i}`);
      $itemLabel.text(item);

      $itemCheckbox.data(`type`, `${headerText}`);
      $itemCheckbox.attr(`id`, `${headerText}-${i}`);
      $itemCheckbox.attr(`name`, `packing-item`);
      $itemCheckbox.attr(`type`, `checkbox`);
      $itemCheckbox.val(item);


      $listItem.append($itemCheckbox);
      $listItem.append($itemLabel);
      $listWrapper.append($listItem);

    }
  } catch (e) { console.log(e) }


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
 * Gets the packing list from storage
 * @returns {Array<Packing-Item>}
 */
const getPackingListFromStorage = () => {
  return JSON.parse(localStorage.getItem('packing-list'))
}

/**
 * Saves the list to localStorage
 * @param list 
 */
const savePackingListToStorage = (list) => {
  localStorage.setItem('packing-list', JSON.stringify(list));
}
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

/**
 * @param type
 * @returns {Promise<T>}
 */
const getTravelTypePackingList = (type) => {

  return $.ajax(`/assets/travel-type-packing-lists/${type}.json`)
    .then((response) => {
      console.log(response);
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
