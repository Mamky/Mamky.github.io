const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

let x=0;
let y=0;
let dx=5;

//define functions
function drawRect(x,y) {
    console.log("drawing rect");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    ctx.fillRect(x,y,50,50);
    ctx.fill();
}

function animate() {
    drawRect(x,y);

    // TODO: Add some code here 
    //  that will change the rectangle's position
x=x+dx;
y=y+1;
if(x > 350){
    dx=dx*-1;
    x=0;
    y=0;
}
    requestAnimationFrame(animate);
}

animate();
