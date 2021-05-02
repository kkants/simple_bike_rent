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
    const _bikes = results[1].rows;
    const _activeRentals = results[2].rows;
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
    rentedBikeIds.push(activeRentals[id].bikeId);
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
    const hours = Math.ceil(sub / (60 * 60 * 1000 - timeZone));
    rentHours.push(hours);
  }

  for (const el of rentHours) {
    el > 1 ? hoursspan.push('hours') : hoursspan.push('hour');
  }
  rentRender(rentHours, typeNames, hoursspan);
  availableBicyclesRender(typeNames, rentHours);
}

function rentRender(rentHours, typeNames, hoursspan) {
  console.log(rentHours);
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
            <span class="bike-type"> /${typeNames[bike.biketypeId - 1]} </span>
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
            <span class="bike-type"> / ${typeNames[bike.biketypeId - 1]}</span>
            <span class="bike-price"> / $${dollarPrice}</span>
            <button class="rent-button" type="submit">Rent</button>
            <button class="delete-button" type="submit">Delete</button>
            </form>`;
      document.querySelector('#avlvblbikes').before(avlblDiv);
      document.querySelector('#amount').innerHTML = avaliableCount;
      continue;
    }
  }
}
