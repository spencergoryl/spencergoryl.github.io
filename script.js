const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];

const particleCount = 1200;

for (let i = 0; i < particleCount; i++) {

    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,

        targetX: canvas.width / 2,
        targetY: canvas.height / 2,

        size: Math.random() * 2 + 0.5
    });

}

function animate() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";

    particles.forEach(particle => {

        particle.x += (particle.targetX - particle.x) * 0.01;
        particle.y += (particle.targetY - particle.y) * 0.01;

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
