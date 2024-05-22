import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
////////////////////////////  Init  ///////////////////////////////
// svg

const svg = d3.select("#svg-container").append("svg").attr("id", "svg");

let width = parseInt(d3.select("#svg-container").style("width"));
let height = parseInt(d3.select("#svg-container").style("height"));

const margin = { top: 25, right: 20, bottom: 50, left: 70 };

// parsing & formatting
const formatXAxis = d3.format("~s"); //숫자를 간결하게 표현하기 위한 포매팅 방식(K,M)
const formatYAxis = d3.format("");

// scale
const xScale = d3.scaleLog().range([margin.left, width - margin.right]);
const yScale = d3.scaleLog().range([height - margin.bottom, margin.top]);
const radiusScale = d3.scaleSqrt().range([0, 50]);
const colorScale = d3
  .scaleOrdinal()
  .range(["#e3a58a", "#537987", "#aac1ad", "#a0af72", "#e9633e", "#eaaa42"]); //데이터 순서대로 색 지정

// axis
const xAxis = d3
  .axisBottom(xScale)
  .tickFormat((d) => formatXAxis(d))
  .tickValues([500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 128000]);

const yAxis = d3
  .axisLeft(yScale)
  .tickFormat((d) => formatYAxis(d))
  .tickValues([0, 10, 100, 1000]);

// const tooltip = d3
//   .select("#svg-container")
//   .append("div")
//   .attr("class", "tooltip");

// svg elements
let circles, xUnit, yUnit, legendRects, legendTexts;

////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////
let data = [];
let region;

let africaSelected = false; //아시아라는 버튼이 아직 선택되지 않음
let europeSelected = false;
let koreaSelected = false;

// data

d3.csv("data/mortality_data_update.csv").then((raw_data) => {
  //   console.log(raw_data);
  data = raw_data.map((d) => {
    d.population = parseInt(d.population);
    d.income = parseInt(d.income);
    d.death = parseInt(d.mortality_ratio);
    return d; //데이터가 텍스트로 되어있어서 바꿔주는 과정
  });
  console.log(data);

  region = [...new Set(data.map((d) => d.region))];
  // console.log(region);

  //   xScale.domain(d3.extent(data, (d) => d.income)); // 두 가지가 같은 방식
  xScale.domain([500, d3.max(data, (d) => d.income)]);
  yScale.domain([1, d3.max(data, (d) => d.death)]);
  radiusScale.domain([0, d3.max(data, (d) => d.population)]);
  colorScale.domain(region);

  //axis
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(yAxis);

  //circles
  circles = svg
    .selectAll("circles")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.income))
    .attr("cy", (d) => yScale(d.death))
    .attr("r", (d) => radiusScale(d.population))
    .attr("fill", (d) => colorScale(d.region))
    .attr("stroke", "whitesmoke");
  // .on("mousemove", function (event, d, index) {
  //   tooltip //mousemove는 툴팁이 따라와서 mouseover보다 더 자연스러움
  //     .style("left", event.pageX + "px")
  //     .style("top", event.pageY - 52 + "px")
  //     .style("display", "block")
  //     .html(
  //       `<div>Country: ${d.country}, <span class="test">Life Expectancy: ${d.life_expectancy}</span></div>`
  //     );

  //   d3.select(this).style("stroke-width", 2).attr("stroke", "#333");
  // })
  // .on("mouseout", function () {
  //   tooltip.style("display", "none");
  //   d3.select(this).style("stroke-width", 1).attr("stroke", "#fff");
  // });

  // Units
  xUnit = svg
    .append("text")
    .attr("transform", `translate(${width / 2}, ${height - 10})`)
    .text("GDP per capita")
    .attr("fill", "#666")
    .attr("class", "unit");

  yUnit = svg
    .append("text")
    .attr("transform", "translate(20," + height / 2 + ") rotate(-90)")
    .text("Maternal Mortality Ratio")
    .attr("fill", "#666")
    .attr("class", "unit");

  legendRects = svg
    .selectAll("legend-rects")
    .data(region)
    .enter()
    .append("rect")
    .attr("x", (d, i) => width - margin.right - 100)
    .attr("y", (d, i) => height - margin.bottom - 70 - 25 * i - 250)
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", (d) => colorScale(d));

  legendTexts = svg
    .selectAll("legend-texts")
    .data(region)
    .enter()
    .append("text")
    .attr("x", (d, i) => width - margin.right - 100 + 20)
    .attr("y", (d, i) => height - margin.bottom - 70 - 25 * i + 10 - 250)
    .text((d) => d)
    .attr("fill", "#666")
    .attr("class", "legend-texts");

  //Button//

  //1.africa//
  d3.select("#button-africa").on("click", () => {
    africaSelected = !africaSelected;
    europeSelected = false;
    koreaSelected = false;
    // console.log(asiaSelected);

    d3.select("#text-desc").text("African countries Selected");

    d3.select("#button-africa").classed("button-clicked", africaSelected);
    d3.select("#button-europe").classed("button-clicked", false);
    d3.select("#button-korea").classed("button-clicked", false);

    circles.attr("fill", (d) => {
      if (africaSelected) {
        return d.region == "Africa" ? colorScale(d.region) : "rgba(0,0,0,0.1)";
      } else {
        return colorScale(d.region);
      }
    });
  });

  //2.europe//
  d3.select("#button-europe").on("click", () => {
    europeSelected = !europeSelected;
    africaSelected = false;
    koreaSelected = false;

    d3.select("#text-desc").text("european countries Selected");

    d3.select("#button-europe").classed("button-clicked", europeSelected);
    d3.select("#button-africa").classed("button-clicked", false);
    d3.select("#button-korea").classed("button-clicked", false);

    circles.attr("fill", (d) => {
      if (europeSelected) {
        return d.region == "Europe" ? colorScale(d.region) : "rgba(0,0,0,0.1)";
      } else {
        return colorScale(d.region);
      }
    });
  });
  //3.korea//
  d3.select("#button-korea").on("click", () => {
    koreaSelected = !koreaSelected;
    africaSelected = false;
    europeSelected = false;

    d3.select("#text-desc").text("South Korea Selected");

    d3.select("#button-korea").classed("button-clicked", koreaSelected);
    d3.select("#button-africa").classed("button-clicked", false);
    d3.select("#button-europe").classed("button-clicked", false);

    circles.attr("fill", (d) => {
      if (koreaSelected) {
        return d.country == "South Korea"
          ? colorScale(d.region)
          : "rgba(0,0,0,0.1)";
      } else {
        return colorScale(d.region);
      }
    });
  });
});

////////////////////////////  Resize  //////////////////////////////
window.addEventListener("resize", () => {
  //  width, height updated
  width = parseInt(d3.select("#svg-container").style("width"));
  height = parseInt(d3.select("#svg-container").style("height"));

  //  scale updated
  xScale.range([margin.left, width - margin.right]);
  yScale.range([height - margin.bottom, margin.top]);

  //  axis updated
  d3.select(".x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

  d3.select(".y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(yAxis);

  // circles updated
  circles
    .attr("cx", (d) => xScale(d.income))
    .attr("cy", (d) => yScale(d.death))
    .attr("r", (d) => radiusScale(d.population));

  // units updated
  xUnit.attr("transform", `translate(${width / 2}, ${height - 10})`);
  yUnit.attr("transform", "translate(20," + height / 2 + ") rotate(-90)");

  //  legend updated
  legendRects
    .attr("x", (d, i) => width - margin.right - 100)
    .attr("y", (d, i) => height - margin.bottom - 70 - 25 * i - 250);

  legendTexts
    .attr("x", (d, i) => width - margin.right - 100 + 20)
    .attr("y", (d, i) => height - margin.bottom - 70 - 25 * i + 10 - 250);
});
