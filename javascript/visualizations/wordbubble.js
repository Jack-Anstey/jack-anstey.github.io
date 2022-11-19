//When working on the word bubble, here are some things to consider:
//The id to insert the SVG is #contentWordBubble

let maxYear = localStorage.getItem('minYear');
let minYear = localStorage.getItem('maxYear');

window.setInterval(updateYears, 100);

function updateYears(){ //updates the values of the year range as adjusted by the user
    maxYear = localStorage.getItem('minYear');
    minYear = localStorage.getItem('maxYear');
    console.log("minYear: "+minYear+" maxYear: "+maxYear);
}
