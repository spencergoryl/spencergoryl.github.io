const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const navigation =
    document.getElementById("art-navigation");

document.fonts.ready.then(() => {

    // --------------------------------
    // Canvas setup
    // --------------------------------

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // --------------------------------
    // Animation Controls
    // --------------------------------

    const PARTICLE_COUNT = 1200;

    const FOLLOW_SPEED = 0.01;

    const HOLD_TIME = 1500;

    const MELT_DURATION = 900;

    const FONT_APPEAR_POINT = 0.80;

    const FONT_START_SCALE = 1.2;

    const FONT_SETTLE_DURATION = 1000;

    const PARTICLE_CONTRACT_DURATION = 900;

    const MAX_FONT_SIZE = 100;

    // --------------------------------
    // Typography
    // --------------------------------

    const fontSize = Math.min(
        width * 0.1,
        MAX_FONT_SIZE
    );

    const centerX = Math.round(width / 2);
    const centerY = Math.round(height / 2);

    const font =
        `700 ${fontSize}px "Averia Serif Libre"`;

    // --------------------------------
    // Create text mask
    // --------------------------------

    const textCanvas = document.createElement("canvas");
    const textCtx = textCanvas.getContext("2d");

    textCanvas.width = width * dpr;
    textCanvas.height = height * dpr;

    textCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    textCtx.font = font;
    textCtx.textAlign = "center";
    textCtx.textBaseline = "middle";
    textCtx.fillStyle = "white";

    textCtx.fillText(
        "Engram",
        centerX,
        centerY
    );

    // --------------------------------
    // Find text pixels
    // --------------------------------

    const imageData = textCtx.getImageData(
        0,
        0,
        textCanvas.width,
        textCanvas.height
    );

    const pixels = [];

    const sampleSize = Math.max(
        1,
        Math.round(5 * dpr)
    );

    for (
        let y = 0;
        y < textCanvas.height;
        y += sampleSize
    ) {

        for (
            let x = 0;
            x < textCanvas.width;
            x += sampleSize
        ) {

            const index =
                (y * textCanvas.width + x) * 4;

            if (imageData.data[index + 3] > 128) {

                pixels.push({

                    x: x / dpr,
                    y: y / dpr

                });

            }
        }
    }

    // --------------------------------
    // Create particles
    // --------------------------------

    const particles = [];

    for (
        let i = 0;
        i < PARTICLE_COUNT;
        i++
    ) {

        const target =
            pixels[i % pixels.length];

        particles.push({

            x: Math.random() * width,
            y: Math.random() * height,

            targetX: target.x,
            targetY: target.y,

            size:
                Math.random() * 2 + 0.5,

            sizeVariation:
                Math.random() * 0.8 + 0.6

        });
    }

    // --------------------------------
    // Animation state
    // --------------------------------

    let phase = "forming";

    let phaseTime = 0;

    let meltProgress = 0;
    let fontSettleProgress = 0;
    let particleContractProgress = 0;

    let lastTime = performance.now();

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

    function animate(currentTime) {

        const deltaTime =
            Math.min(
                currentTime - lastTime,
                32
            );

        lastTime = currentTime;

        // Convert milliseconds to seconds

        const dt = deltaTime / 1000;

        // --------------------------------
        // Clear canvas
        // --------------------------------

        ctx.clearRect(
            0,
            0,
            width,
            height
        );

        // --------------------------------
        // Move particles toward targets
        // --------------------------------

        if (
            phase === "forming" ||
            phase === "holding" ||
            phase === "melting"
        ) {

            const followAmount =
                1 - Math.exp(
                    -FOLLOW_SPEED * 60 * dt
                );

            let totalDistanceSquared = 0;

            for (let i = 0; i < particles.length; i++) {

                const particle = particles[i];

                const dx =
                    particle.targetX -
                    particle.x;

                const dy =
                    particle.targetY -
                    particle.y;

                particle.x +=
                    dx * followAmount;

                particle.y +=
                    dy * followAmount;

                totalDistanceSquared +=
                    dx * dx +
                    dy * dy;
            }

            // --------------------------------
            // Detect completed formation
            // --------------------------------

            if (phase === "forming") {

                const averageDistanceSquared =
                    totalDistanceSquared /
                    particles.length;

                if (
                    averageDistanceSquared <
                    12 * 12
                ) {

                    phase = "holding";
                    phaseTime = 0;

                }
            }
        }

        // --------------------------------
        // Hold dotted ENGRAM
        // --------------------------------

        if (phase === "holding") {

            phaseTime += deltaTime;

            if (phaseTime >= HOLD_TIME) {

                phase = "melting";
                phaseTime = 0;

            }
        }

        // --------------------------------
        // Melt particles
        // --------------------------------

        if (phase === "melting") {

            meltProgress +=
                deltaTime / MELT_DURATION;

            if (meltProgress >= FONT_APPEAR_POINT) {

                meltProgress =
                    FONT_APPEAR_POINT;

                phase = "resolving";
                phaseTime = 0;

            }
        }

        // --------------------------------
        // Resolve font and particles
        // --------------------------------

        if (phase === "resolving") {

            phaseTime += deltaTime;

            fontSettleProgress =
                Math.min(
                    phaseTime /
                    FONT_SETTLE_DURATION,
                    1
                );

            particleContractProgress =
                Math.min(
                    phaseTime /
                    PARTICLE_CONTRACT_DURATION,
                    1
                );

            if (
                fontSettleProgress >= 1 &&
                particleContractProgress >= 1
            ) {

                phase = "complete";

            }
        }

        // --------------------------------
        // Particle expansion
        // --------------------------------

        let expansion = 0;

        if (phase === "melting") {

            expansion =
                easeInOut(
                    meltProgress /
                    FONT_APPEAR_POINT
                );

        }

        // --------------------------------
        // Font scale
        // --------------------------------

        let fontScale = 0;

        if (phase === "resolving") {

            const eased =
                easeOut(
                    fontSettleProgress
                );

            fontScale =
                FONT_START_SCALE -
                (
                    FONT_START_SCALE - 1
                ) * eased;

        }

 if (phase === "complete") {

    fontScale = 1;

    if (!navigation.classList.contains("visible")) {

        navigation.classList.add("visible");

    }

}

        // --------------------------------
        // Draw particles
        // --------------------------------

        if (
            phase === "forming" ||
            phase === "holding" ||
            phase === "melting" ||
            phase === "resolving"
        ) {

            ctx.fillStyle = "white";

            for (
                let i = 0;
                i < particles.length;
                i++
            ) {

                const particle =
                    particles[i];

                const normalSize =
                    particle.size;

                const expandedSize =
                    5.5 *
                    particle.sizeVariation;

                let size;

                // --------------------------------
                // Normal particle → expanded
                // --------------------------------

                if (
                    phase === "forming" ||
                    phase === "holding"
                ) {

                    size = normalSize;

                } else if (
                    phase === "melting"
                ) {

                    size =
                        normalSize +
                        (
                            expandedSize -
                            normalSize
                        ) * expansion;

                } else {

                    // --------------------------------
                    // Contract particles
                    // --------------------------------

                    const contract =
                        easeInOut(
                            particleContractProgress
                        );

                    const minimumSize = 0.15;

                    size =
                        expandedSize *
                        (
                            minimumSize +
                            (
                                1 -
                                minimumSize
                            ) *
                            (1 - contract)
                        );
                }

                ctx.beginPath();

                ctx.arc(
                    particle.x,
                    particle.y,
                    size,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

            }
        }

        // --------------------------------
        // Draw crisp typography
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
                "Engram",
                0,
                0
            );

            ctx.restore();

        }

        requestAnimationFrame(animate);

    }

    requestAnimationFrame(animate);

});
