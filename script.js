let url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
let req = new XMLHttpRequest()

let width = window.innerWidth/1.5
let height = window.innerHeight/1.8
let padding = window.innerWidth/20

let svg = d3.select('svg')

let tempColors = ['#E7AB79','#B25068','#774360','#4C3A51','#4A304D']

let minYear
let maxYear

let baseTemp
let monthlyVar

let xScale
let yScale

let drawCanvas = () => {
    svg.attr("width", width)
    svg.attr("height", height)

}

let generateScales = () => {

    minYear = d3.min(monthlyVar,(x)=>{return x['year']})
    maxYear = d3.max(monthlyVar,(x)=>{return x['year']})

    xScale = d3.scaleLinear()
               .domain([minYear,maxYear+1])
               .range([padding,width-padding])
    yScale = d3.scaleTime()
               .domain([new Date(0,0,0,0,0,0,0),new Date(0,12,0,0,0,0,0)])
               .range([padding,height-padding])

}

let drawAxes = () => {
    let xAxis = d3.axisBottom(xScale)
                  .tickFormat(d3.format('d'))
    let yAxis = d3.axisLeft(yScale)
                  .tickFormat(d3.timeFormat('%B'))
    
    svg.append('g')
       .call(xAxis)
       .attr('id','x-axis')
       .attr('transform','translate(0,'+ (height-padding) +')')

    svg.append('g')
       .call(yAxis)
       .attr('id','y-axis')
       .attr('transform','translate('+ padding +',0)')
       
}

let drawCells = () => {

    let tooltip = d3.select('body')
                    .append('div')
                    .attr('id','tooltip')
                    .style('position','absolute')
                    .style('visibility','hidden')

    svg.selectAll('rect')
       .data(monthlyVar)
       .enter()
       .append('rect')
       .attr('class','cell')
       .attr('fill',(d)=>{
            let variance = d['variance']
            if(variance <= -1){
                return tempColors[0]
            } else if (variance <= 0){
                return tempColors[1]
            } else if (variance <= 1){
                return tempColors[2]
            } else if (variance <= 2){
                return tempColors[3]
            } else if (variance < 3){
                return tempColors[4]
            }
       })
       .attr('data-month',(d)=>{return d['month']-1})
       .attr('data-year',(d)=>{return d['year']})
       .attr('data-temp',(d)=>{return baseTemp + d['variance']})
       .attr('height',((height-(padding*2))/12))
       .attr('width',(width-(padding*2))/(maxYear-minYear))
       .attr('x',(d)=>{return xScale(d['year'])})
       .attr('y',(d)=>{return yScale(new Date(0,d['month']-1,0,0,0,0,0))})
       .on('mouseover', (event,d)=>{
        tooltip.transition()
               .style('visibility','visible')
               .style('left',(event.clientX+15)+'px')
               .style('top',(event.clientY-15)+'px')
        tooltip.text((new Date(0,d['month']-1,0,0,0,0,0)).toLocaleString('default', { month: 'long' })+' '+d['year']+' Temp: '+ (baseTemp + d['variance']).toPrecision(4)+"\u00B0C")
        tooltip.attr('data-year',d['year'])
   })
   .on('mouseout', ()=>{
        tooltip.transition()
            .style('visibility','hidden')
   })
       
}

let drawLegend = () => {
    let xScaleLegend = d3.scaleLinear()
                    .domain([-1,4])
                    .range([padding,width-padding*9])

    let xAxisLegend = d3.axisBottom(xScaleLegend)

    let rectWidth = (width-padding*10)/tempColors.length
    let rectHeight = (width-padding*12.5)/tempColors.length

    d3.select('#legend')
       .attr("width", width)
       .attr("height", height/5)

    for (i in tempColors){
        d3.select('#legend').append('rect')
       .attr('fill',tempColors[i])
       .attr('width', rectWidth)
       .attr('height', rectHeight)
       .attr('x', padding+rectWidth*i)
    }
        
    d3.select('#legend').append('g')
       .call(xAxisLegend)
       .attr('id','x-axis-legend')
       .attr('transform','translate(0,'+rectHeight+')')

   
    
}

req.open('GET',url,true)
req.onload = () => {
    let dataset = JSON.parse(req.responseText)
    baseTemp = dataset['baseTemperature']
    monthlyVar = dataset['monthlyVariance']
    console.log(baseTemp,monthlyVar)
    drawCanvas()
    generateScales()
    drawAxes()
    drawCells()
    drawLegend()
}
req.send()

window.onresize = function(){ location.reload() }