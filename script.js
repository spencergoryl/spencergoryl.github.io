const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const artworkPaths = {
    "solar-steam": "solar-steam.jpg",
    "cloud-break": "cloud-break.jpg",
    "clinical-perception": "clinical-perception.jpg",
    "idle-thought": "idle-thought.jpg"
};

const navigation = document.getElementById("art-navigation");

const artItems = document.querySelectorAll(".art-item:not(#brief-item)");
const artButtons = document.querySelectorAll(
    ".art-item:not(#brief-item) .art-button"
);

const briefItem = document.getElementById("brief-item");
const briefButton = document.getElementById("brief-button");

const isMobile = window.matchMedia("(hover: none)").matches;


// ================================================================
// PRELOAD ARTWORK
// ================================================================

Object.values(artworkPaths).forEach(path => {

    const image = new Image();
    image.src = path;

});


// ================================================================
// TRACK OPENED ARTWORK
// ================================================================

const openedArtworks = new Set();


// ================================================================
// THE BRIEF STARTS COMPLETELY HIDDEN
// ================================================================

briefItem.style.opacity = "0";
briefItem.style.pointerEvents = "none";
briefItem.style.visibility = "hidden";


// ================================================================
// ENGRAM PARTICLE ANIMATION
// ================================================================

document.fonts.ready.then(() => {

    // ------------------------------------------------------------
    // Canvas setup
    // ------------------------------------------------------------

    const dpr =
        Math.min(window.devicePixelRatio || 1, 2);

    const width =
        window.innerWidth;

    const height =
        window.innerHeight;

    canvas.width =
        width * dpr;

    canvas.height =
        height * dpr;

    canvas.style.width =
        `${width}px`;

    canvas.style.height =
        `${height}px`;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    // ------------------------------------------------------------
    // Animation controls
    // ------------------------------------------------------------

    const PARTICLE_COUNT = 1200;
    const FOLLOW_SPEED = 0.01;
    const HOLD_TIME = 1500;
    const MELT_DURATION = 900;
    const FONT_APPEAR_POINT = 0.80;
    const FONT_START_SCALE = 0.9;
    const FONT_SETTLE_DURATION = 1000;
    const PARTICLE_CONTRACT_DURATION = 900;
    const MAX_FONT_SIZE = 100;


    // ------------------------------------------------------------
    // Typography
    // ------------------------------------------------------------

    const fontSize =
        Math.min(
            width * 0.1,
            MAX_FONT_SIZE
        );

    const centerX =
        Math.round(width / 2);

    const centerY =
        Math.round(height / 2);

    const font =
        `700 ${fontSize}px "Averia Serif Libre"`;


    // ------------------------------------------------------------
    // Create text mask
    // ------------------------------------------------------------

    const textCanvas =
        document.createElement("canvas");

    const textCtx =
        textCanvas.getContext("2d");

    textCanvas.width =
        width * dpr;

    textCanvas.height =
        height * dpr;

    textCtx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    textCtx.font =
        font;

    textCtx.textAlign =
        "center";

    textCtx.textBaseline =
        "middle";

    textCtx.fillStyle =
        "white";

    textCtx.fillText(
        "Engram",
        centerX,
        centerY
    );


    // ------------------------------------------------------------
    // Find text pixels
    // ------------------------------------------------------------

    const imageData =
        textCtx.getImageData(
            0,
            0,
            textCanvas.width,
            textCanvas.height
        );

    const pixels = [];

    const sampleSize =
        Math.max(
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

            if (
                imageData.data[index + 3] > 128
            ) {

                pixels.push({
                    x: x / dpr,
                    y: y / dpr
                });

            }

        }

    }


    // ------------------------------------------------------------
    // Create particles
    // ------------------------------------------------------------

    const particles = [];

    for (
        let i = 0;
        i < PARTICLE_COUNT;
        i++
    ) {

        const target =
            pixels[i % pixels.length];

        particles.push({

            x:
                Math.random() * width,

            y:
                Math.random() * height,

            targetX:
                target.x,

            targetY:
                target.y,

            size:
                Math.random() * 2 + 0.5,

            sizeVariation:
                Math.random() * 0.8 + 0.6

        });

    }


    // ------------------------------------------------------------
    // Animation state
    // ------------------------------------------------------------

    let phase = "forming";

    let phaseTime = 0;

    let meltProgress = 0;

    let fontSettleProgress = 0;

    let particleContractProgress = 0;

    let lastTime =
        performance.now();


    // ------------------------------------------------------------
    // Easing
    // ------------------------------------------------------------

    function easeInOut(t) {

        return t < 0.5
            ? 2 * t * t
            : 1 -
              Math.pow(
                  -2 * t + 2,
                  2
              ) / 2;

    }


    function easeOut(t) {

        return 1 -
            Math.pow(
                1 - t,
                3
            );

    }


    // ------------------------------------------------------------
    // Animation
    // ------------------------------------------------------------

    function animate(currentTime) {

        const deltaTime =
            Math.min(
                currentTime - lastTime,
                32
            );

        lastTime =
            currentTime;

        const dt =
            deltaTime / 1000;


        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        // --------------------------------------------------------
        // Move particles
        // --------------------------------------------------------

        if (
            phase === "forming" ||
            phase === "holding" ||
            phase === "melting"
        ) {

            const followAmount =
                1 -
                Math.exp(
                    -FOLLOW_SPEED * 60 * dt
                );

            let totalDistanceSquared = 0;

            for (
                let i = 0;
                i < particles.length;
                i++
            ) {

                const particle =
                    particles[i];

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


            if (
                phase === "forming"
            ) {

                const averageDistanceSquared =
                    totalDistanceSquared /
                    particles.length;

                if (
                    averageDistanceSquared <
                    12 * 12
                ) {

                    phase =
                        "holding";

                    phaseTime =
                        0;

                }

            }

        }


        // --------------------------------------------------------
        // Hold
        // --------------------------------------------------------

        if (
            phase === "holding"
        ) {

            phaseTime +=
                deltaTime;

            if (
                phaseTime >= HOLD_TIME
            ) {

                phase =
                    "melting";

                phaseTime =
                    0;

            }

        }


        // --------------------------------------------------------
        // Melt
        // --------------------------------------------------------

        if (
            phase === "melting"
        ) {

            meltProgress +=
                deltaTime /
                MELT_DURATION;

            if (
                meltProgress >=
                FONT_APPEAR_POINT
            ) {

                meltProgress =
                    FONT_APPEAR_POINT;

                phase =
                    "resolving";

                phaseTime =
                    0;

            }

        }


        // --------------------------------------------------------
        // Resolve
        // --------------------------------------------------------

        if (
            phase === "resolving"
        ) {

            phaseTime +=
                deltaTime;

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

                phase =
                    "complete";

            }

        }


        // --------------------------------------------------------
        // Particle expansion
        // --------------------------------------------------------

        let expansion = 0;

        if (
            phase === "melting"
        ) {

            expansion =
                easeInOut(
                    meltProgress /
                    FONT_APPEAR_POINT
                );

        }


        // --------------------------------------------------------
        // Font scale
        // --------------------------------------------------------

        let fontScale = 0;

        if (
            phase === "resolving"
        ) {

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


        if (
            phase === "complete"
        ) {

            fontScale = 1;

            if (
                !navigation.classList.contains(
                    "visible"
                )
            ) {

                navigation.classList.add(
                    "visible"
                );

            }

        }


        // --------------------------------------------------------
        // Draw particles
        // --------------------------------------------------------

        if (
            phase === "forming" ||
            phase === "holding" ||
            phase === "melting" ||
            phase === "resolving"
        ) {

            ctx.fillStyle =
                "white";

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


                if (
                    phase === "forming" ||
                    phase === "holding"
                ) {

                    size =
                        normalSize;

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

                    const contract =
                        easeInOut(
                            particleContractProgress
                        );

                    const minimumSize =
                        0.15;

                    size =
                        expandedSize *
                        (
                            minimumSize +
                            (
                                1 -
                                minimumSize
                            ) *
                            (
                                1 -
                                contract
                            )
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


        // --------------------------------------------------------
        // Draw crisp typography
        // --------------------------------------------------------

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

            ctx.font =
                font;

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";

            ctx.fillStyle =
                "white";

            ctx.fillText(
                "Engram",
                0,
                0
            );

            ctx.restore();

        }


        requestAnimationFrame(
            animate
        );

    }


    requestAnimationFrame(
        animate
    );

});


// ================================================================
// ARTWORK VIEWER
// ================================================================

const artViewer =
    document.getElementById("art-viewer");

const viewerStage =
    document.getElementById("viewer-stage");

const viewerImage =
    document.getElementById("viewer-image");

const viewerClose =
    document.getElementById("viewer-close");

const briefContent =
    document.getElementById("brief-content");


// ================================================================
// VIEWER STATE
// ================================================================

let viewerBaseScale = 1;

let viewerScale = 1;

let viewerX = 0;

let viewerY = 0;

const MIN_ZOOM = 1;

const MAX_ZOOM = 4;


// ================================================================
// TOUCH STATE
// ================================================================

let lastDistance = null;

let lastTouchX = null;

let lastTouchY = null;


// ================================================================
// DESKTOP DRAG STATE
// ================================================================

let isDragging = false;

let dragStartX = 0;

let dragStartY = 0;

let dragOriginX = 0;

let dragOriginY = 0;


// ================================================================
// UPDATE IMAGE TRANSFORM
// ================================================================

function updateViewerTransform() {

    const actualScale =
        viewerBaseScale *
        viewerScale;

    viewerImage.style.transform =
        `translate3d(
            ${viewerX}px,
            ${viewerY}px,
            0
        ) scale(${actualScale})`;

}


// ================================================================
// RESET VIEWER
// ================================================================

function resetViewer() {

    viewerBaseScale = 1;

    viewerScale = 1;

    viewerX = 0;

    viewerY = 0;

    viewerImage.style.width = "";

    viewerImage.style.height = "";

    viewerImage.style.opacity = "0";

    viewerImage.style.transform =
        "translate3d(0, 0, 0) scale(1)";

}


// ================================================================
// CALCULATE IMAGE SCALE
// ================================================================

function calculateBaseScale() {

    const imageWidth =
        viewerImage.naturalWidth;

    const imageHeight =
        viewerImage.naturalHeight;

    const stageWidth =
        viewerStage.clientWidth;

    const stageHeight =
        viewerStage.clientHeight;


    if (
        !imageWidth ||
        !imageHeight ||
        !stageWidth ||
        !stageHeight
    ) {

        viewerBaseScale = 1;

        return;

    }


    viewerBaseScale =
        Math.min(
            stageWidth / imageWidth,
            stageHeight / imageHeight
        ) * 0.94;


    const displayWidth =
        imageWidth *
        viewerBaseScale;

    const displayHeight =
        imageHeight *
        viewerBaseScale;


    viewerImage.style.width =
        `${displayWidth}px`;

    viewerImage.style.height =
        `${displayHeight}px`;

}


// ================================================================
// OPEN ARTWORK
// ================================================================

function openArtwork(artName) {

    const imagePath =
        artworkPaths[artName];


    if (!imagePath) {

        console.error(
            "Artwork not found:",
            artName
        );

        return;

    }


    // ------------------------------------------------------------
    // Close Brief state
    // ------------------------------------------------------------

    artViewer.classList.remove(
        "brief-open"
    );


    viewerStage.style.visibility =
        "visible";


    // ------------------------------------------------------------
    // Reset viewer
    // ------------------------------------------------------------

    viewerScale = 1;

    viewerX = 0;

    viewerY = 0;

    viewerImage.style.opacity =
        "0";


    // ------------------------------------------------------------
    // Image load
    // ------------------------------------------------------------

    viewerImage.onload = () => {

        calculateBaseScale();

        viewerScale = 1;

        viewerX = 0;

        viewerY = 0;

        updateViewerTransform();


        // Small fade-in
        requestAnimationFrame(() => {

            viewerImage.style.transition =
                "opacity 0.25s ease";

            viewerImage.style.opacity =
                "1";

        });

    };


    // ------------------------------------------------------------
    // Set image
    // ------------------------------------------------------------

    viewerImage.src =
        imagePath;

    viewerImage.alt =
        artName.replace(
            /-/g,
            " "
        );


    // ------------------------------------------------------------
    // Open viewer
    // ------------------------------------------------------------

    artViewer.classList.add(
        "open"
    );

    document.body.style.overflow =
        "hidden";


    // ------------------------------------------------------------
    // Remember artwork
    // ------------------------------------------------------------

    openedArtworks.add(
        artName
    );


    checkBriefUnlock();

}


// ================================================================
// CHECK BRIEF UNLOCK
// ================================================================

function checkBriefUnlock() {

    const artworkCount =
        Object.keys(
            artworkPaths
        ).length;


    if (
        openedArtworks.size >=
        artworkCount
    ) {

        briefItem.classList.add(
            "visible"
        );


        // Override the general
        // navigation item rule

        briefItem.style.opacity =
            "1";

        briefItem.style.pointerEvents =
            "auto";

        briefItem.style.visibility =
            "visible";

    }

}


// ================================================================
// OPEN THE BRIEF
// ================================================================

function openBrief() {

    if (
        openedArtworks.size <
        Object.keys(artworkPaths).length
    ) {

        return;

    }


    artViewer.classList.add(
        "open"
    );

    artViewer.classList.add(
        "brief-open"
    );


    viewerStage.style.visibility =
        "hidden";


    document.body.style.overflow =
        "hidden";

}


// ================================================================
// CLOSE VIEWER
// ================================================================

function closeViewer() {

    artViewer.classList.remove(
        "open"
    );

    artViewer.classList.remove(
        "brief-open"
    );


    viewerStage.style.visibility =
        "visible";


    document.body.style.overflow =
        "";


    viewerImage.src = "";


    resetViewer();


    lastDistance = null;

    lastTouchX = null;

    lastTouchY = null;

    isDragging = false;

}


// ================================================================
// ARTWORK BUTTONS
// ================================================================

artButtons.forEach(button => {

    button.addEventListener(
        "click",
        event => {

            const item =
                button.closest(
                    ".art-item"
                );

            const artName =
                button.dataset.art;


            // ----------------------------------------------------
            // Mobile first tap
            // ----------------------------------------------------

            if (
                isMobile &&
                !item.classList.contains(
                    "focused"
                )
            ) {

                event.preventDefault();


                artItems.forEach(
                    otherItem => {

                        otherItem.classList.remove(
                            "focused"
                        );

                    }
                );


                item.classList.add(
                    "focused"
                );


                return;

            }


            // ----------------------------------------------------
            // Desktop click
            // OR mobile second tap
            // ----------------------------------------------------

            item.classList.remove(
                "focused"
            );


            openArtwork(
                artName
            );

        }
    );

});


// ================================================================
// BRIEF BUTTON
// ================================================================

briefButton.addEventListener(
    "click",
    event => {

        // --------------------------------------------------------
        // Mobile first tap
        // --------------------------------------------------------

        if (
            isMobile &&
            !briefItem.classList.contains(
                "focused"
            )
        ) {

            event.preventDefault();


            artItems.forEach(
                item => {

                    item.classList.remove(
                        "focused"
                    );

                }
            );


            briefItem.classList.add(
                "focused"
            );


            return;

        }


        // --------------------------------------------------------
        // Mobile second tap / desktop click
        // --------------------------------------------------------

        briefItem.classList.remove(
            "focused"
        );


        openBrief();

    }
);


// ================================================================
// CLOSE BUTTON
// ================================================================

viewerClose.addEventListener(
    "click",
    closeViewer
);


// ================================================================
// ESCAPE KEY
// ================================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            artViewer.classList.contains(
                "open"
            )
        ) {

            closeViewer();

        }

    }
);


// ================================================================
// ENGRAM DEFINITION
// ================================================================

const engramTrigger =
    document.getElementById(
        "engram-trigger"
    );

const engramDefinition =
    document.getElementById(
        "engram-definition"
    );

let definitionTimer;


engramTrigger.addEventListener(
    "click",
    () => {

        clearTimeout(
            definitionTimer
        );


        engramDefinition.classList.add(
            "visible"
        );


        definitionTimer =
            setTimeout(
                () => {

                    engramDefinition.classList.remove(
                        "visible"
                    );

                },
                4000
            );

    }
);


// ================================================================
// TOUCH HELPERS
// ================================================================

function getTouchDistance(
    touch1,
    touch2
) {

    const dx =
        touch2.clientX -
        touch1.clientX;

    const dy =
        touch2.clientY -
        touch1.clientY;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );

}


// ================================================================
// MOBILE TOUCH START
// ================================================================

viewerStage.addEventListener(
    "touchstart",
    event => {

        event.preventDefault();


        // --------------------------------------------------------
        // Two fingers
        // --------------------------------------------------------

        if (
            event.touches.length === 2
        ) {

            lastDistance =
                getTouchDistance(
                    event.touches[0],
                    event.touches[1]
                );

            lastTouchX = null;
            lastTouchY = null;

            return;

        }


        // --------------------------------------------------------
        // One finger
        // --------------------------------------------------------

        if (
            event.touches.length === 1
        ) {

            lastTouchX =
                event.touches[0].clientX;

            lastTouchY =
                event.touches[0].clientY;

        }

    },
    {
        passive: false
    }
);


// ================================================================
// MOBILE TOUCH MOVE
// ================================================================

viewerStage.addEventListener(
    "touchmove",
    event => {

        event.preventDefault();


        // ========================================================
        // PINCH ZOOM
        // ========================================================

        if (
            event.touches.length === 2
        ) {

            const distance =
                getTouchDistance(
                    event.touches[0],
                    event.touches[1]
                );


            if (
                lastDistance !== null
            ) {

                const zoomAmount =
                    distance /
                    lastDistance;


                viewerScale *=
                    zoomAmount;


                viewerScale =
                    Math.max(
                        MIN_ZOOM,
                        Math.min(
                            MAX_ZOOM,
                            viewerScale
                        )
                    );


                if (
                    viewerScale <= MIN_ZOOM
                ) {

                    viewerScale =
                        MIN_ZOOM;

                    viewerX = 0;
                    viewerY = 0;

                }


                updateViewerTransform();

            }


            lastDistance =
                distance;

            return;

        }


        // ========================================================
        // ONE FINGER PAN
        // ========================================================

        if (
            event.touches.length === 1 &&
            viewerScale > 1
        ) {

            const touch =
                event.touches[0];

            const x =
                touch.clientX;

            const y =
                touch.clientY;


            if (
                lastTouchX !== null &&
                lastTouchY !== null
            ) {

                viewerX +=
                    x -
                    lastTouchX;

                viewerY +=
                    y -
                    lastTouchY;


                updateViewerTransform();

            }


            lastTouchX = x;

            lastTouchY = y;

        }

    },
    {
        passive: false
    }
);


// ================================================================
// MOBILE TOUCH END
// ================================================================

viewerStage.addEventListener(
    "touchend",
    event => {

        lastDistance = null;


        if (
            event.touches.length === 1
        ) {

            lastTouchX =
                event.touches[0].clientX;

            lastTouchY =
                event.touches[0].clientY;

        } else {

            lastTouchX = null;

            lastTouchY = null;

        }

    },
    {
        passive: false
    }
);


// ================================================================
// DESKTOP MOUSE DRAG
// ================================================================

viewerStage.addEventListener(
    "mousedown",
    event => {

        // Only allow dragging
        // when actually zoomed

        if (
            viewerScale <= 1
        ) {

            return;

        }


        isDragging = true;


        dragStartX =
            event.clientX;

        dragStartY =
            event.clientY;


        dragOriginX =
            viewerX;

        dragOriginY =
            viewerY;


        viewerImage.style.cursor =
            "grabbing";


        event.preventDefault();

    }
);


// ================================================================
// DESKTOP MOUSE MOVE
// ================================================================

viewerStage.addEventListener(
    "mousemove",
    event => {

        if (
            !isDragging
        ) {

            return;

        }


        viewerX =
            dragOriginX +
            (
                event.clientX -
                dragStartX
            );

        viewerY =
            dragOriginY +
            (
                event.clientY -
                dragStartY
            );


        updateViewerTransform();

    }
);


// ================================================================
// DESKTOP MOUSE UP
// ================================================================

function stopDragging() {

    if (
        !isDragging
    ) {

        return;

    }


    isDragging = false;

    viewerImage.style.cursor =
        "grab";

}


viewerStage.addEventListener(
    "mouseup",
    stopDragging
);

viewerStage.addEventListener(
    "mouseleave",
    stopDragging
);


// ================================================================
// DESKTOP / TRACKPAD ZOOM
// ================================================================

viewerStage.addEventListener(
    "wheel",
    event => {

        event.preventDefault();


        const zoomSpeed =
            0.0025;


        const zoomAmount =
            Math.exp(
                -event.deltaY *
                zoomSpeed
            );


        viewerScale *=
            zoomAmount;


        viewerScale =
            Math.max(
                MIN_ZOOM,
                Math.min(
                    MAX_ZOOM,
                    viewerScale
                )
            );


        if (
            viewerScale <= MIN_ZOOM
        ) {

            viewerScale =
                MIN_ZOOM;

            viewerX = 0;
            viewerY = 0;

        }


        updateViewerTransform();

    },
    {
        passive: false
    }
);


// ================================================================
// PREVENT MOBILE DOUBLE-TAP BROWSER ZOOM
// ================================================================
//
// touch-action: manipulation in the CSS handles the navigation
// buttons. This additional handler prevents the browser from
// interpreting rapid taps on the navigation as a zoom gesture.
//
// We deliberately DO NOT apply this to the artwork viewer,
// because pinch-to-zoom needs to remain available there.
// ================================================================

let lastNavigationTap = 0;

document.addEventListener(
    "touchend",
    event => {

        const navigationButton =
            event.target.closest(
                ".art-button"
            );


        if (
            !navigationButton
        ) {

            return;

        }


        const now =
            Date.now();


        if (
            now - lastNavigationTap <
            350
        ) {

            event.preventDefault();

        }


        lastNavigationTap =
            now;

    },
    {
        passive: false
    }
);
