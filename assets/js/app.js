const svgWidth = 960
const svgHeight = 500

let margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
}

let width = svgWidth - margin.left - margin.right
let height = svgHeight - margin.top - margin.bottom

let svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)

let chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)

// View selection - changing this triggers transition
let currentSelection = "smokes"

/**
 * Returns a updated scale based on the current selection.
 **/
function xScale(data, currentSelection) {
  let xLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(data.map(d => parseInt(d[currentSelection]))) * 0.8,
      d3.max(data.map(d => parseInt(d[currentSelection]))) * 1.2
    ])
    .range([0, width])

  return xLinearScale
}

/**
 * Returns and appends an updated x-axis based on a scale.
 **/
function renderAxes(newXScale, xAxis) {
  let bottomAxis = d3.axisBottom(newXScale)

  xAxis
    .transition()
    .duration(1000)
    .call(bottomAxis)

  return xAxis
}


/**
 * Returns and appends an updated circles group based on a new scale and the currect selection.
 **/

function renderCircles(circlesGroup, newXScale, currentSelection) {
  circlesGroup
    .transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[currentSelection]))

  return circlesGroup
}


// function used to update the state labels for the circles
function renderXLabels(circlesText, newXScale, currentSelection) {
  circlesText.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[currentSelection]))

  return circlesText
}


// function used for updating circles group with new tooltip
function updateToolTip(currentSelection, circlesGroup) {
    let label  = "";
    if (chosenXAxis === "smokes") {
        label = "Smokes:";
    }
    else {
        label = "Poverty rate:";
    }

    const toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([0, 0])
      .html(function(d) {
        return (`<strong>${d.state}</strong>
        <br>
        <br> ${label} ${d[chosenXAxis]}`);
      });

    // add tooltip to circlesGroup
    circlesGroup.call(toolTip);

    // on mouseon event
    circlesGroup.on("mouseover", function(d) {
        toolTip.show(d, this);
    })
    // on mouseout event
    .on("mouseout", function(d, index) {
        toolTip.hide(d, this);
    });

  return circlesGroup;
}


(function() {
  d3.csv("/assets/data/data.csv").then(data => {


    let xLinearScale = xScale(data, currentSelection)
    let yLinearScale = d3
      .scaleLinear()
      .domain([0, d3.max(data.map(d => parseInt(d.obesity)))])
      .range([height, 0])

    let bottomAxis = d3.axisBottom(xLinearScale)
    let leftAxis = d3.axisLeft(yLinearScale)

    let xAxis = chartGroup
      .append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis)

    chartGroup.append("g").call(leftAxis)

    let circlesGroup = chartGroup
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[currentSelection]))
      .attr("cy", d => yLinearScale(d.obesity))
      .attr("r", 10)
      .attr("state", d => (d.abbr))
      .attr("fill", "red")
      .attr("opacity", ".2");

    let circlesText = chartGroup.selectAll("text.text-circles")
     .data(data)
     .enter()
     .append("text")
     .classed("text-circles",true)
     .text(d => d.abbr)
     .attr("x", d => xLinearScale(d[currentSelection]))
     .attr("y", d => yLinearScale(d.obesity))
     .attr("dy",5)
     .attr("text-anchor","middle")
     .attr("font-size","10px");
     

    let labelsGroup = chartGroup
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`)

    labelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "smokes")
      .classed("active", true)
      .text("Smokes")

    labelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "poverty")
      .classed("inactive", true)
      .text("Poverty Rate (%)")

    chartGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 40 - margin.left)
      .attr("x", 0 - height / 1.3)
      .attr("dy", "1em")
      .classed("axis-text", true)
      .text("Discovered Obesity Rate (%)")


    // Crate an event listener to call the update functions when a label is clicked
    labelsGroup.selectAll("text").on("click", function() {
      let value = d3.select(this).attr("value")
      if (value !== currentSelection) {
        currentSelection = value
        xLinearScale = xScale(data, currentSelection)
        xAxis = renderAxes(xLinearScale, xAxis)
        // update lables with new x values
        circlesText = renderXLabels(circlesText, xLinearScale, currentSelection)
        circlesGroup = renderCircles(
          circlesGroup,
          xLinearScale,
          currentSelection
        )
      }
    }
    )
  }
  )
})()