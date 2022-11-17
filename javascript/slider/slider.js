//To make this double range slider, I used code from: 
//https://codingartistweb.com/2021/06/double-range-slider-html-css-javascript/

window.onload = function(){
    slideOne();
    slideTwo();
}

//new variables for making color less painful
//getColorFromCSS("input[type=\"range\"]:active::-webkit-slider-thumb");
notRangeColor = getColorFromCSS("range1", "color");
rangeColor = getColorFromCSS("slider1", "color");
//let spotifyColor = 
//og variables
let sliderOne = document.getElementById("slider1");
let sliderTwo = document.getElementById("slider2");
let displayValOne = document.getElementById("range1");
let displayValTwo = document.getElementById("range2");
let minGap = 0; //zero because our ranges are inclusive (unchanged)
let sliderTrack = document.querySelector(".sliderTrack");

//variables to fix assumption that a slider starts at 0
let sliderMaxValue = document.getElementById("slider1").max;
let sliderMinValue = document.getElementById("slider1").min; //for making a slider with a different min than 0

function slideOne(){
    if(parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
        sliderOne.value = parseInt(sliderTwo.value) - minGap;
    }
    displayValOne.textContent = sliderOne.value;
    fillColor();
}

function slideTwo(){
    if(parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
        sliderTwo.value = parseInt(sliderOne.value) + minGap;
    }
    displayValTwo.textContent = sliderTwo.value;
    fillColor();
}

function fillColor(){
    //adjusted percents to work with any min value
    percent1 = ((sliderOne.value-sliderMinValue) / (sliderMaxValue-sliderMinValue)) * 100;
    percent2 = ((sliderTwo.value-sliderMinValue) / (sliderMaxValue-sliderMinValue)) * 100;
    sliderTrack.style.background = `linear-gradient(to right, ${notRangeColor} ${percent1}% , ${rangeColor} ${percent1}% , ${rangeColor} ${percent2}%, ${notRangeColor} ${percent2}%)`;
}

//help from https://www.geeksforgeeks.org/how-to-read-css-rule-values-with-javascript
function getColorFromCSS(idName, style) { //does what it says!
    return window.getComputedStyle(document.getElementById(idName), null).getPropertyValue(style);
}