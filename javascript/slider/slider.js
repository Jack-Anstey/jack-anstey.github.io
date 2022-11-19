//To make this double range slider, I used code from: 
//https://codingartistweb.com/2021/06/double-range-slider-html-css-javascript/

window.onload = function(){
    slideOne();
    slideTwo();
}

//check to see if we want to swap. Once we are done, say for certain that we do not want to swap
window.onclick = function(){
    checkSwap();
    wantSwap = "none";
}

//new variables for making color less painful
let notRangeColor = getColorFromCSS("range1", "color");
let rangeColor = getColorFromCSS("slider1", "color");
const swap = document.getElementById("swap") //the div whose contents we will be swapping around
inFront = "one"; //which thumb starts in front
wantSwap = "none"; //if we click, do we actually want to swap

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
    wantSwap = "one";
    if(parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
        sliderOne.value = parseInt(sliderTwo.value) - minGap;
    }
    displayValOne.textContent = sliderOne.value;
    fillColor();
    
}

function slideTwo(){
    wantSwap = "two";
    if(parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
        sliderTwo.value = parseInt(sliderOne.value) + minGap;
    }
    displayValTwo.textContent = sliderTwo.value;
    fillColor();
}

//swap the draw order of the thumbs on the slider
function swapOrder(thumb){
    if (thumb.localeCompare("one")){
        swap.appendChild(sliderTwo);
    } else if (thumb.localeCompare("two")){
        swap.appendChild(sliderOne);
    }
}

//checks to see if we want to swap. If so, see if we should swap.
function checkSwap(){
    if (wantSwap == "one"){
        if (inFront != "one"){
            swapOrder("one");
            inFront = "one";
        } 
    }
    if (wantSwap == "two"){        
        if(inFront != "two") {
            swapOrder("two");
            inFront = "two";
        }
        wantSwap = false;
    }
}

function fillColor(){
    //adjusted percents to work with any min value
    percent1 = ((sliderOne.value-sliderMinValue) / (sliderMaxValue-sliderMinValue)) * 100;
    percent2 = ((sliderTwo.value-sliderMinValue) / (sliderMaxValue-sliderMinValue)) * 100;
    sliderTrack.style.background = `linear-gradient(to right, ${notRangeColor} ${percent1}% , ${rangeColor} ${percent1}% , ${rangeColor} ${percent2}%, ${notRangeColor} ${percent2}%)`;
    localStorage.setItem('minYear', parseInt(displayValOne.textContent));
    localStorage.setItem('maxYear', parseInt(displayValTwo.textContent));
}

//help from https://www.geeksforgeeks.org/how-to-read-css-rule-values-with-javascript
function getColorFromCSS(idName, style) { //does what it says!
    return window.getComputedStyle(document.getElementById(idName), null).getPropertyValue(style);
}