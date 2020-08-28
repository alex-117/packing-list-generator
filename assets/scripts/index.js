console.log(`this is linked!`);

/* CREATE PAGE */
// create form fields
const $startDateInput = $(`#startDate`);
const $endDateInput = $(`#endDate`);
const $destinationInput = $(`#destination`);
// const $campingInput = $(`#camping`);
// const $businessInput = $(`#business`);
// const $roadTripInput = $(`#roadTrip`);
// create form button
const $createBtn = $(`#createBtn`);

$createBtn.click(function(e) {
    e.preventDefault();
    
    const startDateValue = $startDateInput.val();
    const endDateValue = $endDateInput.val();
    const destinationValue = $destinationInput.val();
    const typeValue = $('.form__radio:checked');
});