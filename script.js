const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

document.fonts.ready.then(() => {
    
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];

const particleCount = 1200;


// --------------------------------
// Create an invisible version of ENGRAM
// --------------------------------

const textCanvas = document.createElement("canvas");
const textCtx = textCanvas.getContext("2d");

textCanvas.width = canvas.width;
textCanvas.height = canvas.height;

textCtx.fillStyle = "white";
textCtx.font = "700 100px "Averia Serif Libre";
textCtx.textAlign = "center";
textCtx.textBaseline = "middle";

textCtx.fillText(
    "ENGRAM",
    canvas.width / 2,
    canvas.height / 2
);


// --------------------------------
// Find the pixels that make up the word
// --------------------------------

const imageData = textCtx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
);

const pixels = [];

for (let y = 0; y < canvas.height; y += 5) {

    for (let x = 0; x < canvas.width; x += 5) {

        const index = (y * canvas.width + x) * 4;

        const alpha = imageData.data[index + 3];

        if (alpha > 128) {

            pixels.push({
                x: x,
                y: y
            });

        }

    }

}


// --------------------------------
// Create particles
// --------------------------------

for (let i = 0; i < particleCount; i++) {

    const target = pixels[i % pixels.length];

    particles.push({

        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,

        targetX: target.x,
        targetY: target.y,

        size: Math.random() * 2 + 0.5

    });

}


// --------------------------------
// Animate
// --------------------------------

function animate() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle = "white";

    particles.forEach(particle => {

        particle.x +=
            (particle.targetX - particle.x) * 0.01;

        particle.y +=
            (particle.targetY - particle.y) * 0.01;


        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

    });

    requestAnimationFrame(animate);

}

animate();
