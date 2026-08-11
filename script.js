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

    const font = `700 ${fontSize}px "Averia Serif Libre"`;

    // --------------------------------
    // Create invisible text canvas
    // Used only to find particle targets
    // --------------------------------

    const textCanvas = document.createElement("canvas");
    const textCtx = textCanvas.getContext("2d");

    textCanvas.width = canvas.width;
    textCanvas.height = canvas.height;

    textCtx.font = font;
    textCtx.textAlign = "center";
    textCtx.textBaseline = "middle";
    textCtx.fillStyle = "white";

    textCtx.fillText(
        "ENGRAM",
        centerX,
        centerY
    );

    // --------------------------------
    // Find pixels that make up ENGRAM
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

            size: Math.random() * 2 + 0.5,

            // Tiny movement used during settling
            driftX: Math.random() * Math.PI * 2,
            driftY: Math.random() * Math.PI * 2

        });
    }

    // --------------------------------
    // Animation state
    // --------------------------------

    let phase = "forming";

    let holdTimer = 0;
    let resolutionProgress = 0;

    // --------------------------------
    // Easing functions
    // --------------------------------

    function easeInOut(t) {

        return t < 0.5
            ? 2 * t * t
            : 1 - Math.pow(-2 * t + 2, 2) / 2;

    }

    function easeOut(t) {

        return 1 - Math.pow(1 - t, 3);

    }

    // --------------------------------
    // Draw final typography
    // --------------------------------

    function drawFinalText(opacity) {

        if (opacity <= 0) {
            return;
        }

        ctx.save();

        ctx.globalAlpha = opacity;

        ctx.font = font;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillStyle = "white";

        ctx.fillText(
            "ENGRAM",
            centerX,
            centerY
        );

        ctx.restore();
    }

    // --------------------------------
    // Draw particles
    // --------------------------------

    function drawParticles(opacity, settlingAmount) {

        if (opacity <= 0) {
            return;
        }

        ctx.save();

        ctx.globalAlpha = opacity;
        ctx.fillStyle = "white";

        particles.forEach(particle => {

            const driftAmount =
                settlingAmount * 0.7;

            const driftX =
                Math.sin(
                    particle.driftX +
                    performance.now() * 0.001
                ) * driftAmount;

            const driftY =
                Math.cos(
                    particle.driftY +
                    performance.now() * 0.001
                ) * driftAmount;

            ctx.beginPath();

            ctx.arc(
                particle.x + driftX,
                particle.y + driftY,
                particle.size,
                0,
                Math.PI * 2
            );

            ctx.fill();

        });

        ctx.restore();

    }

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

        // --------------------------------
        // Move particles toward targets
        // --------------------------------

        particles.forEach(particle => {

            particle.x +=
                (particle.targetX - particle.x) * 0.01;

            particle.y +=
                (particle.targetY - particle.y) * 0.01;

        });

        // --------------------------------
        // Formation phase
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
        // Recognition pause
        // --------------------------------

        if (phase === "holding") {

            holdTimer++;

            if (holdTimer > 40) {

                phase = "resolving";

            }
        }

        // --------------------------------
        // Resolution phase
        // --------------------------------

        if (phase === "resolving") {

            resolutionProgress += 0.012;

            if (resolutionProgress >= 1) {

                resolutionProgress = 1;
                phase = "complete";

            }
        }

        // --------------------------------
        // Calculate transition values
        // --------------------------------

        let particleOpacity = 1;
        let textOpacity = 0;
        let settlingAmount = 0;

        if (phase === "holding") {

            settlingAmount = 1;

        }

        if (phase === "resolving") {

            const eased =
                easeInOut(resolutionProgress);

            // Text appears slightly before
            // particles completely disappear.

            textOpacity =
                easeOut(
                    Math.min(
                        resolutionProgress / 0.75,
                        1
                    )
                );

            particleOpacity =
                1 - eased;

            settlingAmount =
                1 - eased;

        }

        if (phase === "complete") {

            particleOpacity = 0;
            textOpacity = 1;
            settlingAmount = 0;

        }

        // --------------------------------
        // Draw
        // --------------------------------

        drawParticles(
            particleOpacity,
            settlingAmount
        );

        drawFinalText(
            textOpacity
        );

        requestAnimationFrame(animate);

    }

    animate();

});
