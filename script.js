const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

document.fonts.ready.then(() => {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 1200;

    // --------------------------------
    // Animation Controls
    // --------------------------------

    const MELT_SPEED = 0.012;
    const FONT_APPEAR_POINT = 0.8;

    const FONT_START_SCALE = 1.03;
    const FONT_SETTLE_SPEED = 0.3;

    const MAX_FONT_SIZE = 100;

    // --------------------------------
    // Typography
    // --------------------------------

    const fontSize = Math.min(
        canvas.width * 0.1,
        MAX_FONT_SIZE
    );

    const centerX = Math.round(canvas.width / 2);
    const centerY = Math.round(canvas.height / 2);

    const font = `700 ${fontSize}px "Averia Serif Libre"`;

    // --------------------------------
    // Invisible text canvas
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
    // Find pixels belonging to ENGRAM
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

        const target =
            pixels[i % pixels.length];

        particles.push({

            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,

            targetX: target.x,
            targetY: target.y,

            size: Math.random() * 2 + 0.5,

            sizeVariation:
                Math.random() * 0.8 + 0.6

        });
    }

    // --------------------------------
    // Animation state
    // --------------------------------

    let phase = "forming";

    let holdTimer = 0;
    let meltProgress = 0;
    let fontSettleProgress = 0;

    // --------------------------------
    // Easing
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
        // Detect completed formation
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
        // Hold the dotted ENGRAM
        // --------------------------------

        if (phase === "holding") {

            holdTimer++;

            if (holdTimer > 45) {

                phase = "melting";

            }
        }

        // --------------------------------
        // Particle expansion
        // --------------------------------

        if (phase === "melting") {

            meltProgress += MELT_SPEED;

            if (meltProgress >= FONT_APPEAR_POINT) {

                meltProgress = FONT_APPEAR_POINT;
                phase = "resolving";

            }
        }

        // --------------------------------
        // Font resolution
        // --------------------------------

        if (phase === "resolving") {

            fontSettleProgress += FONT_SETTLE_SPEED;

            if (fontSettleProgress >= 1) {

                fontSettleProgress = 1;
                phase = "complete";

            }
        }

        // --------------------------------
        // Determine particle size
        // --------------------------------

        let expansion = 0;

        if (phase === "melting") {

            expansion =
                easeInOut(meltProgress);

        }

        // --------------------------------
        // Calculate font scale
        // --------------------------------

        let fontScale = 0;

        if (phase === "resolving") {

            const easedSettle =
                easeOut(fontSettleProgress);

            fontScale =
                FONT_START_SCALE -
                (FONT_START_SCALE - 1) *
                easedSettle;

        }

        if (phase === "complete") {

            fontScale = 1;

        }

        // --------------------------------
        // Draw particles
        // --------------------------------

        if (
    phase === "forming" ||
    phase === "holding" ||
    phase === "melting"
) {

    ctx.fillStyle = "white";

    particles.forEach(particle => {

                const normalSize =
                    particle.size;

                const expandedSize =
                    5.5 * particle.sizeVariation;

                const size =
                    normalSize +
                    (expandedSize - normalSize)
                    * expansion;

                ctx.beginPath();

                ctx.arc(
                    particle.x,
                    particle.y,
                    size,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

            });

        }

        // --------------------------------
        // Draw final typography
        // --------------------------------

        if (
            phase === "resolving" ||
            phase === "complete"
        ) {

            ctx.save();

            ctx.translate(
                centerX,
                centerY
            );

            ctx.scale(
                fontScale,
                fontScale
            );

            ctx.font = font;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            ctx.fillStyle = "white";

            ctx.fillText(
                "ENGRAM",
                0,
                0
            );

            ctx.restore();

        }

        requestAnimationFrame(animate);

    }

    animate();

});
