const c2j = require('csvtojson');
const fetch = require('node-fetch').default;
const fs = require('fs');


/** https://ourworldindata.org/coronavirus-source-data */
const dataUrl = 'http://cowid.netlify.com/data/full_data.csv';
// const dataUrl = 'http://localhost:3500/full_data.csv';
fetch(dataUrl)
  .then(res => res.text())
  .then(csvString => {
    c2j({
        noheader: false,
        output: "csv",
        delimiter: ','
      })
      .fromString(csvString)
      .then((csvJson) => {
        // console.log(csvJson) // => [["1","2","3"], ["4","5","6"], ["7","8","9"]]
        const data = formatData(csvJson);
        // console.log(data)
        write2File('src/assets/data/coronavirus-source-data.json', data);
      })
  });


/**
 * Array<[date, location, new_cases, new_deaths, total_cases, total_deaths]>
 * @param {Array<[string, string, string, string, string, string ]>} csvJson
 * @returns { import('./globals').ICsvData }
 */
function formatData(csvJson) {
  /**
   * @type import('./globals').ICsvData
   */
  const formatData = {
    daterage: {
      min: null,
      max: null,
      count: null
    },
    source: dataUrl,
    locations: {},
    dates: {}
  };
  const dates = new Set();
  const countries = new Set();

  // get all dates unique
  csvJson.filter(row => {
    const date = row[0];
    const location = row[1];
    countries.add(location);
    dates.add(date);
  });

  /**
   * add dates
   */
  const datesArr = Array.from(dates).sort();
  const datesLen = datesArr.length;
  for (let d = 0; d < datesLen; d++) {
    const tempDate = datesArr[d];
    formatData.dates[tempDate] = {}
  }
  formatData.daterage.min = datesArr[0];
  formatData.daterage.max = datesArr[datesLen - 1];
  formatData.daterage.count = datesLen;

  /**
   * add countries
   */
  const countriesArr = Array.from(countries).sort();
  for (let c = 0; c <= datesArr.length; c++) {
    const tempCountry = countriesArr[c];
    formatData.locations[tempCountry] = c
  }




  csvJson.filter(row => {
    const date = row[0];
    const location = row[1];
    const new_cases = row[2];
    const new_deaths = row[3];
    const total_cases = row[4];
    const total_deaths = row[5];

    const contryIndex = countriesArr.indexOf(location);
    if (formatData.dates[date]) {

      /**
       * @type import('./globals').ICsvItem
       */
      const ciItem = {
        new_cases: parseFloat(new_cases),
        new_deaths: parseFloat(new_deaths),
        total_cases: parseFloat(total_cases),
        total_deaths: parseFloat(total_deaths)
      }

      formatData.dates[date][contryIndex] = ciItem;

      /* if (!formatData.data[dateIndex][contryIndex]) {
        formatData.data[dateIndex][contryIndex] = null
      } else {
        
      } */
    }
  })
  return formatData;
}
/**
 * 
 * @param {string} path 
 * @param {any} data 
 */
function write2File(path, data) {
  fs.writeFile(path, JSON.stringify(data), err => {
    if (err) {
      console.log('Error writing file', err);
    } else {
      console.log(`Update file ${path}`);
    }
  });
}
