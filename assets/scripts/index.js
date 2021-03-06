/** Using `cors-anywhere` proxy to solve CORS error */
const url = 'https://cors-anywhere.herokuapp.com/https://www.metaweather.com/api';
const snowConditionAbbr = ['sn', 'sl'];
const rainConditionAbbr = ['h', 't', 'hr', 'lr', 's'];
const sunnyConditionAbbr = ['c'];

// create form
const $formCreate = $(`#form-create`);
const $startDateInput = $(`#startDate`);
const $endDateInput = $(`#endDate`);
const $destinationInput = $(`#destination`);
const $typeInput = $(`#type`);
const $createBtn = $(`#createBtn`);

// packing list form
const $packingListForm = $('#form-new-packing-list');
const $packingLists = $(`#packingLists`);
const $savePackingListBtn = $(`#savePackingListBtn`);

// local storage stored list display
const $storedListDisplay = $(`#storedListsDisplay`);

// edit form
const $updatePackingListBtn = $(`#updatePackingListBtn`);


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
  // const compareDate = new Date();
  // compareDate.setDate(compareDate.getDate() + 5);

  getHistoricalData(location.woeid, startDate)
    .then(handleHistoricalData);

  if (startDate.getTime() > compareDate.getTime()) {
  } else {
    // getLocationById(location.woeid)
    //   .then(function (locationDetails) {
    //     // console.log(locationDetails)
    //   });
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

    generateNewPackingList(weather);
  } catch (e) {
    console.log(e)
  }
}

function generateNewPackingList(weather) {
  // take packing list & weather conditions
  getTravelTypePackingList($typeInput.val())
    .then(function (list) {

      if (!weather.conditions.rain) delete list.rain;
      if (!weather.conditions.snow) delete list.snow;
      if (!weather.conditions.sunny) delete list.sunny;

      for (let category in list) {
        const packingItems = list[category];

        const $listHeader = $(`<h3 class="form_packing-list-header">`);
        $listHeader.text(category);

        const $listWrapper = $(`<ul class="form__packing-list">`);

        $packingLists.append($listHeader);
        $packingLists.append($listWrapper);

        for (let packingItem of packingItems) {
          const newListItem = packingListItem(packingItem, category);
          $listWrapper.append(newListItem);
        }

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

function packingListItem(item, category) {
  const $listItem = $(`<li class="form__packing-list-item">`);
  const $itemLabel = $(`<label class="form__list-item-label" />`);
  const $itemCheckbox = $(`<input class="form__list-item-checkbox" />`);

  $itemLabel.attr(`for`, `${category}-${item.name}`);
  $itemLabel.text(item.name);

  $itemCheckbox.data(`type`, `${category}`);
  $itemCheckbox.attr(`id`, `${category}-${item.name}`);
  $itemCheckbox.attr(`name`, `packing-item`);
  $itemCheckbox.attr(`type`, `checkbox`);
  $itemCheckbox.prop(`checked`, item.checked);
  $itemCheckbox.val(item.name);


  $listItem.append($itemCheckbox);
  $listItem.append($itemLabel);
  return $listItem;
}

function packingListDisplay(headerText, listItems) {
  try {

    const $listHeader = $(`<h3 class="form_packing-list-header">`);
    $listHeader.text(headerText);

    const $listWrapper = $(`<ul class="form__packing-list">`);

    $packingLists.append($listHeader);
    $packingLists.append($listWrapper);

    for (let i = 0; i < listItems.length; i++) {
      const packingItem = packingListItem(listItems[i]);
      $listWrapper.append(packingItem);
    }
  } catch (e) {
    console.log(e)
  }
}

function editPackingListDisplay(list) {
  try {
    const $editPackingListName = $(`#edit-packing-list-name`);
    $editPackingListName.val(list.name);

    for (let category in list.items) {
      const packingItems = list.items[category];

      const $listHeader = $(`<h3 class="form_packing-list-header">`);
      $listHeader.text(category);

      const $listWrapper = $(`<ul class="form__packing-list">`);

      $packingLists.append($listHeader);
      $packingLists.append($listWrapper);

      for (let packingItem of packingItems) {
        const newListItem = packingListItem(packingItem, category);
        $listWrapper.append(newListItem);
      }

    }
  } catch (e) { console.log(e) }
}

$(document).ready(() => {
  setDateVals();

  $('#nav-menu-btn').on('click', function (e) {
    $('#nav-menu-list').toggle('show');
  });

  $createBtn.click((e) => {
    e.preventDefault();

    const destVal = $destinationInput.val().trim();
    const travelVal = $typeInput.val().trim();

    if (destVal && travelVal) {
      const queryUrl = `${url}/location/search/?query=${destVal}`;

      getLocationDetails(queryUrl)
        .then((response) => {
          // todo: change where hide/show happens & add error handling if req. fails 
          $formCreate.hide();
          $packingListForm.show();
          return handleLocationDetails(response);
        });
    }
  });

  $savePackingListBtn.on('click', function (e) {
    e.preventDefault();

    const packingList = generateListForLocalStorage();
    const listName = $(`#packing-list-name`).val().trim();
    savePackingListToStorage(listName, packingList);

    // TODO: add better success handler    
    $(this).text('Success!');
    setTimeout(() => {
      window.location = '/view.html';
    }, 1000);
  });

  $startDateInput.change(() => {
    // prevent end date from occuring BEFORE start date
    $endDateInput.attr({ min: $startDateInput.val() });
  });

  $updatePackingListBtn.on('click', function (e) {
    e.preventDefault();

    const updatedPackingList = generateListForLocalStorage();
    updatesPackingListToStorage($(this).data(`listName`), updatedPackingList)
  });


  if (window.location.pathname === `/view.html`) {
    const storedLists = getPackingListFromStorage();

    if (storedLists.length) {
      for (let list of storedLists) {
        const $listContainer = $(`<div class="stored-lists__list pure-u-1 pure-u-sm-1-2 pure-u-md-1-3">`);

        const $listName = $(`<h2 class="stored-lists__list-name">`);
        $listName.text(list.name);

        const $listEditBtn = $(`<a class="stored-lists__edit-btn">`);
        $listEditBtn.text(`edit`);
        $listEditBtn.attr(`href`, `/edit.html?listname=${list.name}`);


        $listContainer.append($listName);
        $listContainer.append($listEditBtn);

        $storedListDisplay.append($listContainer);
      }
    } else {
      $('#stored-list-header').text(`You have no saved lists...`);
    }
  }

  if (window.location.pathname === `/edit.html`) {
    const storedLists = getPackingListFromStorage();
    const urlParams = new URLSearchParams(window.location.search);
    const listNameParam = urlParams.get('listname');


    const listToEdit = storedLists.find(function (list) {
      return list.name === listNameParam;
    });

    $updatePackingListBtn.data(`listName`, listToEdit.name);

    editPackingListDisplay(listToEdit);
    $packingListForm.show();
  }

});
