const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

document.fonts.ready.then(() => {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 1200;

    // --------------------------------
    // Typography settings
    // --------------------------------

    const fontSize = Math.min(
        canvas.width * 0.12,
        120
    );

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // --------------------------------
    // Create text canvas
    // --------------------------------

    const textCanvas = document.createElement("canvas");
    const textCtx = textCanvas.getContext("2d");

    textCanvas.width = canvas.width;
    textCanvas.height = canvas.height;

    textCtx.font = `700 ${fontSize}px "Averia Serif Libre"`;
    textCtx.textAlign = "center";
    textCtx.textBaseline = "middle";
    textCtx.fillStyle = "white";

    textCtx.fillText(
        "ENGRAM",
        centerX,
        centerY
    );

    // --------------------------------
    // Find text pixels
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

            const index =
                (y * canvas.width + x) * 4;

            if (imageData.data[index + 3] > 128) {

                pixels.push({
                    x,
                    y
                });

            }
        }
    }

    // --------------------------------
    // Create particles
    // --------------------------------

    for (let i = 0; i < particleCount; i++) {

        const target =
            pixels[i % pixels.length];

        particles.push({

            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,

            targetX: target.x,
            targetY: target.y,

            size: Math.random() * 2 + 0.5

        });
    }

    // --------------------------------
    // Animation state
    // --------------------------------

    let phase = "forming";
    let textOpacity = 0;
    let particleOpacity = 1;
    let holdTimer = 0;

    // --------------------------------
    // Animation
    // --------------------------------

    function animate() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        // Move particles
        particles.forEach(particle => {

            particle.x +=
                (particle.targetX - particle.x) * 0.01;

            particle.y +=
                (particle.targetY - particle.y) * 0.01;

        });

        // --------------------------------
        // Detect when word has formed
        // --------------------------------

        if (phase === "forming") {

            let totalDistance = 0;

            particles.forEach(particle => {

                const dx =
                    particle.targetX - particle.x;

                const dy =
                    particle.targetY - particle.y;

                totalDistance +=
                    Math.sqrt(dx * dx + dy * dy);

            });

            const averageDistance =
                totalDistance / particles.length;

            if (averageDistance < 12) {

                phase = "holding";

            }
        }

        // --------------------------------
        // Hold particle ENGRAM briefly
        // --------------------------------

        if (phase === "holding") {

            holdTimer++;

            if (holdTimer > 35) {

                phase = "resolving";

            }
        }

        // --------------------------------
        // Resolve into typography
        // --------------------------------

        if (phase === "resolving") {

            textOpacity += 0.025;
            particleOpacity -= 0.025;

            if (textOpacity >= 1) {

                textOpacity = 1;
                particleOpacity = 0;

                phase = "complete";

            }
        }

        // --------------------------------
        // Draw particles
        // --------------------------------

        if (particleOpacity > 0) {

            ctx.save();

            ctx.globalAlpha =
                particleOpacity;

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

        }

        // --------------------------------
        // Draw final ENGRAM
        // --------------------------------

        if (textOpacity > 0) {

            ctx.save();

            ctx.globalAlpha =
                textOpacity;

            ctx.drawImage(
                textCanvas,
                0,
                0
            );

            ctx.restore();

        }

        requestAnimationFrame(animate);
    }

    animate();

});
