const { Country, City } = require('country-state-city'); console.log('Countries:', Country.getAllCountries().slice(0, 3)); console.log('Cities for US:', City.getCitiesOfCountry('US').slice(0, 3));
