let bikeTypes = {};
let bikes = {};
let activeRentals = {};

window.onload = function () {
  initialLoad().then(() => {
    processData();
    initialRender();
  });
};
async function initialLoad() {
  try {
    const responses = await Promise.all([
      fetch('http://localhost:8080/api/biketypes'),
      fetch('http://localhost:8080/api/bikes'),
      fetch('http://localhost:8080/api/bikes/rentActive'),
    ]);
    const results = await Promise.all(responses.map((r) => r.json()));
    const _bikeType = results[0];
    const _bikes = results[1];
    const _activeRentals = results[2];
    for (const type of _bikeType) {
      bikeTypes[type.id] = type;
    }
    for (const bike of _bikes) {
      bikes[bike.id] = bike;
    }
    for (const rental of _activeRentals) {
      activeRentals[rental.id] = rental;
    }
  } catch (error) {
    console.log(error);
  }
}

function processData() {
  const rentedBikeIds = [];
  for (let id in activeRentals) {
    rentedBikeIds.push(activeRentals[id].bike_id);
  }
  for (let id in bikes) {
    bikes[id].available = !rentedBikeIds.includes(+id);
  }
}

function initialRender() {
  const typeNames = [];
  const hoursspan = [];
  const rentedBikeTime = [];
  const rentHours = [];

  for (let id in bikeTypes) {
    typeNames.push(bikeTypes[id].name);
  }
  // bikeTypeName options handle
  for (let type of Object.values(bikeTypes)) {
    let typeOptions = document.createElement('option');
    typeOptions.innerHTML = type.name;
    document.querySelector('#typeselect').append(typeOptions);
  }
  // Your rent
  for (let id in activeRentals) {
    rentedBikeTime.push(activeRentals[id].rented_on);
  }
  const timeZone = 3;
  for (let date of rentedBikeTime) {
    let sub = Date.now() - Date.parse(date);
    const hours = Math.ceil(sub / (60 * 60 * 1000) - timeZone);
    rentHours.push(hours);
  }

  for (const el of rentHours) {
    el > 1 ? hoursspan.push('hours') : hoursspan.push('hour');
  }
  rentRender(rentHours, typeNames, hoursspan);
  availableBicyclesRender(typeNames, rentHours);
  addButtonRender(typeNames, rentHours);
}

function rentRender(rentHours, typeNames, hoursspan) {
  let i = 0;
  let totalSum = 0;
  const discountTime = 20;
  for (const bike of Object.values(bikes)) {
    if (bike.available == false) {
      let dollarPrice = bike.price / 100;

      // discount check

      if (rentHours[i] > discountTime)
        dollarPrice = +(dollarPrice / 2).toFixed(2);

      totalSum += dollarPrice * rentHours[i];
      let rentDiv = document.createElement('div');
      rentDiv.innerHTML = ` <form class="rent-form">
            <span class="bike-name">${bike.name}</span>
            <span class="bike-type"> /${typeNames[bike.type_id - 1]} </span>
            <span class="bike-price"> / $${dollarPrice}</span>
            <span class="rent-hours"> /${rentHours[i]} <span id="hoursspan">${
        hoursspan[i]
      }</span></span>
            <button class="cancel-button" type="submit">Return</button>
            </form>`;
      document.querySelector('#rentbikes').before(rentDiv);
      i++;
    }
    continue;
  }
  document.querySelector('#price').innerHTML = totalSum.toFixed(2);
  ///////////////////////////////////////////////////////////
  const rentedIds = [];

  for (const bike of Object.values(bikes)) {
    if (bike.available == false) {
      rentedIds.push(bike.id);
    }
  }
  const returnButtons = document.querySelectorAll('.cancel-button');
  for (let i = 0; i < returnButtons.length; i++) {
    returnButtons[i].addEventListener('click', returnButtonsHandler);
    function returnButtonsHandler(e) {
      e.preventDefault();
      const parent = e.target.parentElement;
      const prevDisplay = parent.style.display;
      parent.style.display = 'none';
      const returnBike = () => {
        const options = {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
        };
        return fetch(
          `http://localhost:8080/bikes/${rentedIds[i]}/return`,
          options
        )
          .then((res) => res.json())
          .then((res) => {
            parent.remove;
            for (const bike of Object.values(bikes)) {
              if (bike.id == res.bike_id) {
                const discountTime = 20;
                const timeZone = 3;
                let dollarPrice = bike.price / 100;
                let sub = Date.now() - Date.parse(res.rented_on);
                const hour = Math.ceil(sub / (60 * 60 * 1000) - timeZone);
                let count = 0;
                for (const bike of Object.values(bikes)) {
                  if (bike.available == true) {
                    count++;
                  }
                }
                // discount check
                if (hour > discountTime)
                  dollarPrice = +(dollarPrice / 2).toFixed(2);
                let avlblDiv = document.createElement('div');
                avlblDiv.innerHTML = `
                        <form class="avlbl-form">
                        <span class="bike-name">${bike.name}</span>
                        <span class="bike-type"> / ${
                          typeNames[bike.type_id - 1]
                        }</span>
                        <span class="bike-price"> / $${dollarPrice}</span>
                        <button class="rent-button" type="submit">Rent</button>
                        <button class="delete-button" type="submit">Delete</button>
                        </form>`;
                document.querySelector('#avlvblbikes').before(avlblDiv);
                document.querySelector('#amount').innerHTML = count + 1;
                let prevSum = 0;
                let i = 0;
                for (const bike of Object.values(bikes)) {
                  if (bike.available == false) {
                    prevSum += (bike.price / 100) * rentHours[i];
                    i++;
                  }
                }
                let currentSum = hour * dollarPrice;
                let newSum = +prevSum.toFixed(2) - currentSum;
                document.querySelector('#price').innerHTML = newSum.toFixed(2);
              }
            }
          })
          .catch((err) => {
            parent.style.display = prevDisplay;
            console.log(err);
            alert('Something wrong with response');
          });
      };

      returnBike();
    }
  }
}

function addButtonRender(typeNames) {
  document
    .querySelector('#addBikeBtn')
    .addEventListener('click', addBikeButtonHandler);

  function addBikeButtonHandler(e) {
    e.preventDefault();
    const inputName = document.querySelector('#bikename').value;
    const inputPrice = document.querySelector('#bikeprice').value;
    const selection = document.querySelector('#typeselect');
    const selectId = selection.selectedIndex;
    const validatePrice = inputPrice.replace(/[.]/g, '');
    if (inputName == '') throw alert('Enter a name field');
    if (selectId == 0) throw alert('Select a bike type');
    if (isNaN(parseInt(validatePrice)))
      throw alert('Enter a number in field Rent Price');

    const newBike = {
      name: inputName,
      type_id: selectId,
      price: +validatePrice,
    };
    const createNewBike = (bike) => {
      const options = {
        method: 'POST',
        body: JSON.stringify(bike),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      };
      return fetch('http://localhost:8080/bikes', options)
        .then((res) => res.json())
        .then((bikes) => {
          let dollarPrice = bikes.price / 100;
          let avlblDiv = document.createElement('div');
          const addTypeCount = bikes.type_id - 1;
          avlblDiv.innerHTML = `
            <form class="avlbl-form">
            <span class="bike-name">${bikes.name}</span>
            <span class="bike-type"> / ${typeNames[addTypeCount]}</span>
            <span class="bike-price"> / $${dollarPrice}</span>
            <button class="rent-button" type="submit">Rent</button>
            <button class="delete-button" type="submit">Delete</button>
            </form>`;
          document.querySelector('#avlvblbikes').before(avlblDiv);
          document.querySelector('#amount').innerHTML = bikes.availableCount;
        })
        .catch((err) => {
          parent.style.display = prevDisplay;
          alert('Something wrong with response');
        });
    };
    createNewBike(newBike);
  }
}

function availableBicyclesRender(typeNames, rentHours) {
  let avaliableCount = 0;
  for (const bike of Object.values(bikes)) {
    if (bike.available == true) {
      let dollarPrice = bike.price / 100;
      avaliableCount++;
      let avlblDiv = document.createElement('div');
      avlblDiv.innerHTML = `
            <form class="avlbl-form">
            <span class="bike-name">${bike.name}</span>
            <span class="bike-type"> / ${typeNames[bike.type_id - 1]}</span>
            <span class="bike-price"> / $${dollarPrice}</span>
            <button class="rent-button" type="submit">Rent</button>
            <button class="delete-button" type="submit">Delete</button>
            </form>`;
      document.querySelector('#avlvblbikes').before(avlblDiv);
      document.querySelector('#amount').innerHTML = avaliableCount;
      continue;
    }
  }
  /////////////////rent buttons handle///////////////////////
  const rentButtons = document.querySelectorAll('.rent-button');
  for (let i = 0; i < rentButtons.length; i++) {
    rentButtons[i].addEventListener('click', rentButtonsHandler);

    function rentButtonsHandler(e) {
      e.preventDefault();
      const parent = e.target.parentElement;
      const prevDisplay = parent.style.display;
      console.log(rentId);
      parent.style.display = 'none';
      const rentBike = () => {
        const options = {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
        };
        return fetch(
          `http://localhost:8080/bikes/${availableIds[i]}/rent`,
          options
        )
          .then((res) => res.json())
          .then((sum) => {
            parent.remove();
            for (const bike of Object.values(bikes)) {
              if (bike.id == sum.bike_id) {
                const discountTime = 20;
                const timeZone = 3;
                let hourspan = '';

                let dollarPrice = bike.price / 100;
                let sub = Date.now() - Date.parse(sum.rented_on);
                const hour = Math.ceil(sub / (60 * 60 * 1000) - timeZone);

                // discount check
                if (hour > discountTime)
                  dollarPrice = +(dollarPrice / 2).toFixed(2);
                //hourspan
                hour > 1 ? (hourspan += 'hours') : (hourspan += 'hour');

                let rentDiv = document.createElement('div');
                rentDiv.innerHTML = ` <form class="rent-form">
                      <span class="bike-name">${bike.name}</span>
                      <span class="bike-type"> /${
                        typeNames[bike.type_id - 1]
                      } </span>
                      <span class="bike-price"> / $${dollarPrice}</span>
                      <span class="rent-hours"> /${hour} <span id="hoursspan">${hourspan}</span></span>
                      <button class="cancel-button" type="submit">Return</button>
                      </form>`;
                document.querySelector('#rentbikes').before(rentDiv);

                document.querySelector('#amount').innerHTML =
                  rentButtons.length - 1;
                let prevSum = 0;
                let i = 0;
                for (const bike of Object.values(bikes)) {
                  if (bike.available == false) {
                    prevSum += (bike.price / 100) * rentHours[i];
                    i++;
                  }
                }
                let currentSum = hour * dollarPrice;
                let totalSum = +prevSum.toFixed(2) + currentSum;
                document.querySelector('#price').innerHTML = (
                  +prevSum.toFixed(2) + currentSum
                ).toFixed(2);
              }
            }
          })
          .catch((err) => {
            parent.style.display = prevDisplay;
            alert('Something wrong with response');
          });
      };

      rentBike();
    }
  }
  /////////// delete buttons handle //////////////
  const availableIds = [];

  for (const bike of Object.values(bikes)) {
    if (bike.available == true) {
      availableIds.push(bike.id);
    }
  }

  const deleteButtons = document.querySelectorAll('.delete-button');
  for (let i = 0; i < deleteButtons.length; i++) {
    deleteButtons[i].addEventListener('click', deleteButtonsHanlder);

    function deleteButtonsHanlder(e) {
      e.preventDefault();
      const parent = e.target.parentElement;
      const prevDisplay = parent.style.display;
      parent.style.display = 'none';
      const deleteBike = () => {
        const options = {
          method: 'DELETE',
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
        };
        return fetch(`http://localhost:8080/bikes/${availableIds[i]}`, options)
          .then((res) => res.json())
          .then((result) => {
            parent.remove();
            document.querySelector('#amount').innerHTML = result.availableCount;
          })
          .catch((err) => {
            parent.style.display = prevDisplay;
            alert('Something wrong with response');
          });
      };

      deleteBike();
    }
  }
}
