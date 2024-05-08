console.log('coming from CensusIncome.js');

async function fetchACSIncomeData() {
  const apiKey = "74a87d99b53d3b3effd2bd3148493f810c40bb5e";
  const baseQueryURL = "https://api.census.gov/data/2019/acs/acs5";
  const fields = "get=B19013_001E,NAME";
  const state = "06";  // State code for California
  const counties = ["037", "059"];  // Los Angeles and Orange County
  const incomeDataByTract = {};

  try {
    for (const county of counties) {
      const queryURL = `${baseQueryURL}?${fields}&for=tract:*&in=state:${state}+county:${county}&key=${apiKey}`;
    //   console.log(queryURL);
      const response = await fetch(queryURL);
      const data = await response.json();

      if (response.ok) {
        data.slice(1).forEach((row) => {
          if (!row || row.length < 5 || row[0] === undefined || row[2] === undefined || row[3] === undefined || row[4] === undefined) {
            console.warn("Skipping malformed row:", row);
            return; // Skip this iteration due to missing or undefined required properties
          }
          // Correctly format the tract code by padding with zeros where necessary
          const tractCode = `${row[2].padStart(2, '0')}${row[3].padStart(3, '0')}${row[4].padStart(6, '0')}`;
          incomeDataByTract[tractCode] = {
            medianIncome: row[0] === '-' ? null : parseInt(row[0], 10),
            tractName: row[1]
          };
        });
        // console.log(`Data for county ${county}:`, data.slice(1, 11));  // Log the first 10 records
      } else {
        throw new Error(`Failed to fetch data for county ${county}: ${response.statusText}`);
      }
    }
  } catch (error) {
    console.error("Error fetching ACS income data:", error);
  }

  console.log("Income data by tract:", incomeDataByTract);
  return incomeDataByTract; // Returning the data may be useful for further processing
}

fetchACSIncomeData();
