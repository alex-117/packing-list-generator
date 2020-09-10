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

function handleLocationDetails(location) {
  // compare if startDate > 5 days in future 
  const startDate = new Date($startDateInput.val());
  const compareDate = new Date();
  compareDate.setDate(compareDate.getDate() + 5);


  if (startDate.getTime() > compareDate.getTime()) {
    getHistoricalData(location.woeid, startDate)
      .then(handleHistoricalData);
  } else {

    getLocationById(location.woeid)
      .then(function (locationDetails) {
        // console.log(locationDetails)
      });
  }

}

function handleHistoricalData(data) {
  try {
    const weather = {
      temp: {
        max: 0,
        min: 0,
      },
      conditions: {
        rain: false,
        snow: false,
        sunny: false
      }
    }

    for (let item of data) {
      weather.temp.max += item.max_temp;
      weather.temp.min += item.min_temp;

      if (snowConditionAbbr.includes(item.weather_state_abbr)) {
        weather.conditions.snow = true;
      }

      if (rainConditionAbbr.includes(item.weather_state_abbr)) {
        weather.conditions.rain = true;
      }

      if (sunnyConditionAbbr.includes(item.weather_state_abbr)) {
        weather.conditions.sunny = true;
      }
    }


    weather.temp.max = calculateAverage(weather.temp.max, data.length);
    weather.temp.min = calculateAverage(weather.temp.min, data.length);

    weather.temp.max = convertToFahrenheit(weather.temp.max);
    weather.temp.min = convertToFahrenheit(weather.temp.min);

    weather.temp.max = convertToFahrenheit(weather.temp.max);
    weather.temp.min = convertToFahrenheit(weather.temp.min);

    generatePackingListUI(weather);
  } catch (e) {
    console.log(e)
  }
}

function generatePackingListUI(weather) {
  // take packing list & weather conditions
  // getTravelTypePackingList($typeInput.val())
  getTravelTypePackingList('camping-no-rv')
    .then(function (list) {

      if (!weather.conditions.rain) delete list.rain;
      if (!weather.conditions.snow) delete list.snow;
      if (!weather.conditions.sunny) delete list.sunny;

      for (let key in list) {
        packingListDisplay(key, list[key]);
      }

    })
    .catch(function (error) {
      console.log(error);
    });
}


function generateListForLocalStorage() {
  const packingList = {};

  const $packingItems = $(`input[name="packing-item"]`)

  for (let i = 0; i < $packingItems.length; i++) {
    const $item = $($packingItems[i]);
    const itemType = $item.data(`type`);
    const isItemChecked = $item.is(`:checked`);
    const itemValue = $item.val();

    if (!packingList[itemType]) {
      packingList[itemType] = []
    }

    packingList[itemType].push({ checked: isItemChecked, name: itemValue });
  }

  return packingList;
}

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
  } catch (e) {
    console.log(e)
  }
}

$(document).ready(() => {
  setDateVals();

  $createBtn.click((e) => {
    e.preventDefault();

    const queryUrl = `${url}/location/search/?query=${$destinationInput.val()}`;

    handleHistoricalData(data);
    $packingListForm.show();
    $formCreate.hide();

    // getLocationDetails(queryUrl)
    //   .then((response) => {
    //     $packingListForm.show();
    //     $formCreate.hide();
    //     return handleLocationDetails(response);
    // });
  });

  $savePackingListBtn.on('click', function (e) {
    e.preventDefault();

    const packingList = generateListForLocalStorage();
    const listName = prompt(`What would you like to name your new travel list?`);
    savePackingListToStorage(listName, packingList)
  });

  $startDateInput.change(() => {
    // prevent end date from occuring BEFORE start date
    $endDateInput.attr({ min: $startDateInput.val() });
  });

});
