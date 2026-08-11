const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

document.fonts.ready.then(() => {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 1200;

    // --------------------------------
    // Animation settings
    // --------------------------------

    let textOpacity = 0;
    let particleOpacity = 1;

    let transitionStarted = false;
    let transitionProgress = 0;

    // --------------------------------
    // Create invisible version of ENGRAM
    // --------------------------------

    const textCanvas = document.createElement("canvas");
    const textCtx = textCanvas.getContext("2d");

    textCanvas.width = canvas.width;
    textCanvas.height = canvas.height;

    const fontSize = Math.min(canvas.width * 0.1, 100);

    textCtx.font = `700 ${fontSize}px "Averia Serif Libre"`;
    textCtx.textAlign = "center";
    textCtx.textBaseline = "middle";

    textCtx.fillStyle = "white";

    textCtx.fillText(
        "Engram",
        canvas.width / 2,
        canvas.height / 2
    );

    // --------------------------------
    // Find the pixels that make up ENGRAM
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
    // Check how close particles are
    // --------------------------------

    function particlesHaveConverged() {

        let totalDistance = 0;

        particles.forEach(particle => {

            const dx = particle.targetX - particle.x;
            const dy = particle.targetY - particle.y;

            totalDistance += Math.sqrt(dx * dx + dy * dy);

        });

        const averageDistance =
            totalDistance / particles.length;

        return averageDistance < 8;
    }

    // --------------------------------
    // Draw the real ENGRAM
    // --------------------------------

    function drawRealText() {

        ctx.save();

        ctx.globalAlpha = textOpacity;

        ctx.font = `700 ${fontSize}px "Averia Serif Libre"`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillStyle = "white";

        ctx.fillText(
            "Engram",
            canvas.width / 2,
            canvas.height / 2
        );

        ctx.restore();
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

        // --------------------------------
        // Move particles toward ENGRAM
        // --------------------------------

        particles.forEach(particle => {

            particle.x +=
                (particle.targetX - particle.x) * 0.01;

            particle.y +=
                (particle.targetY - particle.y) * 0.01;

        });

        // --------------------------------
        // Detect when ENGRAM has formed
        // --------------------------------

        if (
            !transitionStarted &&
            particlesHaveConverged()
        ) {

            transitionStarted = true;

        }

        // --------------------------------
        // Begin particle → typography transition
        // --------------------------------

        if (transitionStarted) {

            transitionProgress += 0.012;

            textOpacity = Math.min(
                transitionProgress,
                1
            );

            particleOpacity =
                Math.max(
                    1 - transitionProgress,
                    0
                );

        }

        // --------------------------------
        // Draw particles
        // --------------------------------

        ctx.save();

        ctx.globalAlpha = particleOpacity;
        ctx.fillStyle = "white";

        particles.forEach(particle => {

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

        ctx.restore();

        // --------------------------------
        // Draw real typography
        // --------------------------------

        drawRealText();

        requestAnimationFrame(animate);
    }

    animate();

});
