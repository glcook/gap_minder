/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    Project 2 - Gapminder Clone
 */
// __________ CONFIGURE CHART AREA __________
//
// Set width and height of overall chart space, including axes, labels
var CHART_SPACE_WIDTH = 700;
var CHART_SPACE_HEIGHT = 600;

// Initialize time variable to 0
var time = 0;

// Set margins between actual chart and edge of chart space
var margin = { right: 20, left: 100, top: 50, bottom: 100 };

// Set width and height of actual chart
var width = CHART_SPACE_WIDTH - margin.right - margin.left;
var height = CHART_SPACE_HEIGHT - margin.top - margin.bottom;

// Append svg -- whole chart area -- configure width and height
var svg = d3
  .select("#chart-area")
  .append("svg")
  .attr("width", CHART_SPACE_WIDTH)
  .attr("height", CHART_SPACE_HEIGHT);

// Append actual chart to svg, translate margin.left to the right and margin.top down
var g = svg
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//
// __________ SET STATIC CHART COMPONENTS __________
//
// Create x & y scales, set range & domain
var xScale = d3
  .scaleLog()
  .base(10)
  .domain([40, 150000])
  .range([0, width]);

var yScale = d3
  .scaleLinear()
  .domain([0, 90])
  .range([height, 0]);

// Create x & y axes
var xAxis = d3
  .axisBottom(xScale)
  .tickValues([400, 4000, 40000])
  .tickFormat(d3.format("$,"));

var yAxis = d3.axisLeft(yScale);

// Append axes
g.append("g")
  .attr("class", "x-axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

g.append("g")
  .attr("class", "y-axis")
  .call(yAxis);

// Create color scale, set domain in data load function
colorScale = d3
  .scaleOrdinal()
  .range(["steelblue", "orangered", "gold", "aquamarine"]);

// Create area scale, set domain in data load function
aScale = d3.scaleSqrt().range([2, 40]);

// Create labels
// X axis label
g.append("text")
  .attr("x", width / 2)
  .attr("y", height + 60)
  .attr("text-anchor", "middle")
  .text("Income per person");

// Y axis label
g.append("text")
  .attr("x", -(height / 2))
  .attr("y", -60)
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .text("Life expectancy");

// Year label
var yearLabel = g
  .append("text")
  .attr("id", "year-label")
  .attr("x", width)
  .attr("y", height - 30)
  .attr("text-anchor", "end")
  .text("1800");

// Chart label
// var labelText = "Income per person & life expectancy by country, 1810 - 2010";
// g.append("text")
//   .attr("x", -20)
//   .attr("y", -30)
//   .style("font-size", "18px")
//   .text(labelText);

//
// __________ UPDATE FUNCTION __________
//
function update(data) {
  // Set transition
  var t = d3.transition().duration(100);

  // JOIN new data with old elements
  var points = g.selectAll("circle").data(data, function(d) {
    return d.country;
  });

  // Remove points that no longer correspond to data
  points.exit().remove();

  // Draw points for new data
  points
    .enter()
    .append("circle")
    .attr("fill", function(d) {
      return colorScale(d.continent);
    })
    .attr("opacity", 0.5)
    .merge(points)
    .transition(t)
    .attr("cx", function(d) {
      return xScale(d.income);
    })
    .attr("cy", function(d) {
      return yScale(d.life_exp);
    })
    .attr("r", function(d) {
      return aScale(d.population);
    });

  // Update existing points
  // points
  //   // .transition(t)
  //   .attr("cx", function(d) {
  //     return xScale(d.income);
  //   })
  //   .attr("cy", function(d) {
  //     return yScale(d.life_exp);
  //   })
  //   .attr("r", function(d) {
  //     return aScale(d.population);
  //   })
  //   .attr("fill", function(d) {
  //     return colorScale(d.continent);
  //   })
  //   .attr("opacity", 0.5);

  var year = 1800 + time;
  yearLabel.text(year);
}

//
// __________ HELPER FUNCTIONS __________
//
// Function to get array of unique continents from data
function getContinents(data) {
  var continentList = data.map(function(d) {
    return d.continent;
  });

  var continentsUnique = [];

  continentList.forEach(function(d) {
    if (!continentsUnique.includes(d)) {
      continentsUnique.push(d);
    }
  });

  return continentsUnique.sort();
}

// Function to capitalize first letter in string
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

//
// __________ LOAD DATA & RUN UPDATE __________
//
d3.json("data/data.json").then(function(data) {
  // Convert string year to integer &
  // filter out null values of income, LE, population
  data.forEach(function(d) {
    d.year = +d.year;
  });

  var cleanData = data.map(function(year) {
    return year["countries"].filter(function(d) {
      return d.income !== null && d.life_exp !== null && d.population !== null;
    });
  });

  var year1 = cleanData[0];

  //Set domain for color scale with unique continents
  var conts = getContinents(year1);
  colorScale.domain(conts);

  // Set domain for area scale with max value for population
  var popMax = d3.max(
    cleanData.map(function(year) {
      return d3.max(
        year.map(function(country) {
          return country.population;
        })
      );
    })
  );

  aScale.domain([0, popMax]);

  // Create color legend
  var leftIndent = margin.left + 20;
  var topIndent = margin.top + 20;

  var legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + leftIndent + "," + topIndent + ")");

  // Legend circles
  legend
    .selectAll("circle")
    .data(conts)
    .enter()
    .append("circle")
    .attr("cx", 0)
    .attr("cy", function(d, i) {
      return i * 15;
    })
    .attr("r", 5)
    .attr("opacity", 0.8)
    .style("fill", function(d) {
      return colorScale(d);
    });

  // Legend text
  legend
    .selectAll("text")
    .data(conts)
    .enter()
    .append("text")
    .attr("x", 10)
    .attr("y", function(d, i) {
      return i * 15;
    })
    .attr("alignment-baseline", "middle")
    .style("font-size", "12px")
    .text(function(d) {
      return capitalize(d);
    });

  d3.interval(function() {
    time = time < 214 ? time + 1 : 0;
    update(cleanData[time]);
  }, 100);

  update(cleanData[0]);
});
