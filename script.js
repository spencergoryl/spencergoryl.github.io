// ================================================================
// ARTWORK DATA
// ================================================================

const artworkPaths = {
    "solar-steam": "solar-steam.jpg",
    "cloud-break": "cloud-break.jpg",
    "clinical-perception": "clinical-perception.jpg",
    "idle-thought": "idle-thought.jpg"
};


// ================================================================
// ELEMENTS
// ================================================================

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const navigation = document.getElementById("art-navigation");

const engramTrigger =
    document.getElementById("engram-trigger");

const engramDefinition =
    document.getElementById("engram-definition");

const artViewer =
    document.getElementById("art-viewer");

const viewerStage =
    document.getElementById("viewer-stage");

const viewerImage =
    document.getElementById("viewer-image");

const viewerClose =
    document.getElementById("viewer-close");

const briefItem =
    document.getElementById("brief-item");

const briefButton =
    document.getElementById("brief-button");


// ================================================================
// NAVIGATION
// ================================================================

const artButtons =
    document.querySelectorAll(
        "#art-navigation .art-item:not(#brief-item) .art-button"
    );

const artItems =
    document.querySelectorAll(
        "#art-navigation .art-item"
    );


// ================================================================
// DEVICE
// ================================================================

const isTouchDevice =
    window.matchMedia("(hover: none)").matches;


// ================================================================
// TRACK WHICH ARTWORKS HAVE BEEN OPENED
// ================================================================

const openedArtworks = new Set();


// ================================================================
// PRELOAD ARTWORK
// ================================================================

Object.values(artworkPaths).forEach(path => {

    const image = new Image();

    image.src = path;

});


// ================================================================
// ENGRAM PARTICLE ANIMATION
// ================================================================

document.fonts.ready.then(() => {

    const dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

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
    // Animation settings
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
    // Text canvas
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
            pixels[
                i % pixels.length
            ];

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
              Math.pow(-2 * t + 2, 2) / 2;

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

                    phaseTime = 0;

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

                phaseTime = 0;

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

                phaseTime = 0;

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

                navigation.classList.add(
                    "visible"
                );

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

                }
                else if (
                    phase === "melting"
                ) {

                    size =
                        normalSize +
                        (
                            expandedSize -
                            normalSize
                        ) * expansion;

                }
                else {

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
        // Draw crisp ENGRAM
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
// VIEWER STATE
// ================================================================

let viewerBaseScale = 1;

let viewerZoom = 1;

let viewerX = 0;

let viewerY = 0;

const MIN_ZOOM = 1;

const MAX_ZOOM = 4;


// ================================================================
// POINTER / TOUCH STATE
// ================================================================

let isDragging = false;

let dragStartX = 0;

let dragStartY = 0;

let startViewerX = 0;

let startViewerY = 0;

let lastPinchDistance = null;


// ================================================================
// VIEWER TRANSFORM
// ================================================================

function updateViewerTransform() {

    const scale =
        viewerBaseScale *
        viewerZoom;

    viewerImage.style.transform =
        `translate3d(
            ${viewerX}px,
            ${viewerY}px,
            0
        ) scale(${scale})`;

}


// ================================================================
// CALCULATE FIT
// ================================================================

function calculateViewerScale() {

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


    /*
    The image remains at its natural dimensions.
    The transform performs the fitting.

    This prevents the tiny-image problem caused by
    repeatedly changing width/height and then scaling.
    */

    viewerBaseScale =
        Math.min(
            stageWidth / imageWidth,
            stageHeight / imageHeight
        ) * 0.94;

}


// ================================================================
// RESET VIEWER
// ================================================================

function resetViewer() {

    viewerZoom = 1;

    viewerX = 0;

    viewerY = 0;

    isDragging = false;

    lastPinchDistance = null;

    viewerImage.style.width =
        `${viewerImage.naturalWidth}px`;

    viewerImage.style.height =
        `${viewerImage.naturalHeight}px`;

    updateViewerTransform();

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
    // Make sure Brief mode is completely off
    // ------------------------------------------------------------

    artViewer.classList.remove(
        "brief-open"
    );


    // ------------------------------------------------------------
    // Make artwork stage interactive again
    // ------------------------------------------------------------

    viewerStage.style.visibility =
        "visible";

    viewerStage.style.pointerEvents =
        "auto";


    // ------------------------------------------------------------
    // Load artwork
    // ------------------------------------------------------------

    viewerImage.onload = () => {

        calculateViewerScale();

        resetViewer();

    };


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

    artViewer.style.pointerEvents =
        "auto";


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
// BRIEF UNLOCK
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

    }

}


// ================================================================
// OPEN BRIEF
// ================================================================

function openBrief() {

    /*
    The Brief should only be accessible
    after all four artworks have been opened.
    */

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

    viewerStage.style.pointerEvents =
        "none";


    artViewer.style.pointerEvents =
        "auto";


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


    /*
    This is important.

    The viewer itself becomes completely
    non-interactive when closed, so an invisible
    full-screen layer can never sit over the
    navigation buttons.
    */

    artViewer.style.pointerEvents =
        "none";


    viewerStage.style.visibility =
        "visible";

    viewerStage.style.pointerEvents =
        "auto";


    document.body.style.overflow =
        "";


    viewerImage.onload =
        null;

    viewerImage.src =
        "";


    viewerZoom = 1;

    viewerBaseScale = 1;

    viewerX = 0;

    viewerY = 0;

    isDragging = false;

    lastPinchDistance = null;


    viewerImage.style.transform =
        "translate3d(0, 0, 0) scale(1)";

}


// ================================================================
// INITIAL VIEWER STATE
// ================================================================

/*
Important: the viewer must be completely inert
before the first artwork is opened.
*/

artViewer.style.pointerEvents =
    "none";

viewerStage.style.pointerEvents =
    "auto";


// ================================================================
// ARTWORK BUTTONS
// ================================================================

artButtons.forEach(button => {

    button.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();


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
                isTouchDevice &&
                !item.classList.contains(
                    "focused"
                )
            ) {

                artItems.forEach(
                    otherItem => {

                        if (
                            otherItem !== item
                        ) {

                            otherItem.classList.remove(
                                "focused"
                            );

                        }

                    }
                );


                item.classList.add(
                    "focused"
                );


                return;

            }


            // ----------------------------------------------------
            // Desktop click OR mobile second tap
            // ----------------------------------------------------

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

        event.preventDefault();

        event.stopPropagation();


        /*
        Do not allow the Brief to be clicked
        before it has been unlocked.
        */

        if (
            openedArtworks.size <
            Object.keys(artworkPaths).length
        ) {

            return;

        }


        // --------------------------------------------------------
        // Mobile first tap
        // --------------------------------------------------------

        if (
            isTouchDevice &&
            !briefItem.classList.contains(
                "focused"
            )
        ) {

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
        // Desktop click OR mobile second tap
        // --------------------------------------------------------

        openBrief();

    }
);


// ================================================================
// CLOSE BUTTON
// ================================================================

viewerClose.addEventListener(
    "click",
    event => {

        event.preventDefault();

        event.stopPropagation();

        closeViewer();

    }
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

let definitionTimer = null;

engramTrigger.addEventListener(
    "click",
    event => {

        event.preventDefault();

        event.stopPropagation();


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
// DESKTOP DRAG / GRAB
// ================================================================

viewerStage.addEventListener(
    "pointerdown",
    event => {

        /*
        Only allow grabbing when the artwork
        is actually zoomed in.
        */

        if (
            viewerZoom <= MIN_ZOOM
        ) {

            return;

        }


        if (
            event.pointerType === "mouse" &&
            event.button !== 0
        ) {

            return;

        }


        event.preventDefault();


        isDragging = true;


        dragStartX =
            event.clientX;

        dragStartY =
            event.clientY;


        startViewerX =
            viewerX;

        startViewerY =
            viewerY;


        viewerStage.setPointerCapture(
            event.pointerId
        );


        viewerImage.style.cursor =
            "grabbing";

    }
);


// ================================================================
// DESKTOP DRAGGING
// ================================================================

viewerStage.addEventListener(
    "pointermove",
    event => {

        if (
            !isDragging
        ) {

            return;

        }


        event.preventDefault();


        viewerX =
            startViewerX +
            (
                event.clientX -
                dragStartX
            );


        viewerY =
            startViewerY +
            (
                event.clientY -
                dragStartY
            );


        updateViewerTransform();

    }
);


// ================================================================
// DESKTOP DRAG END
// ================================================================

function endDragging(event) {

    if (
        !isDragging
    ) {

        return;

    }


    isDragging = false;


    viewerImage.style.cursor =
        "grab";


    if (
        event &&
        viewerStage.hasPointerCapture(
            event.pointerId
        )
    ) {

        viewerStage.releasePointerCapture(
            event.pointerId
        );

    }

}


viewerStage.addEventListener(
    "pointerup",
    endDragging
);

viewerStage.addEventListener(
    "pointercancel",
    endDragging
);


// ================================================================
// TOUCH PINCH ZOOM
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
// TOUCH START
// ================================================================

viewerStage.addEventListener(
    "touchstart",
    event => {

        event.preventDefault();


        // --------------------------------------------------------
        // Pinch
        // --------------------------------------------------------

        if (
            event.touches.length === 2
        ) {

            lastPinchDistance =
                getTouchDistance(
                    event.touches[0],
                    event.touches[1]
                );

            return;

        }


        // --------------------------------------------------------
        // One finger
        // --------------------------------------------------------

        if (
            event.touches.length === 1 &&
            viewerZoom > MIN_ZOOM
        ) {

            dragStartX =
                event.touches[0].clientX;

            dragStartY =
                event.touches[0].clientY;

            startViewerX =
                viewerX;

            startViewerY =
                viewerY;

        }

    },
    {
        passive: false
    }
);


// ================================================================
// TOUCH MOVE
// ================================================================

viewerStage.addEventListener(
    "touchmove",
    event => {

        event.preventDefault();


        // --------------------------------------------------------
        // Pinch zoom
        // --------------------------------------------------------

        if (
            event.touches.length === 2
        ) {

            const distance =
                getTouchDistance(
                    event.touches[0],
                    event.touches[1]
                );


            if (
                lastPinchDistance !== null
            ) {

                const zoomAmount =
                    distance /
                    lastPinchDistance;


                viewerZoom *=
                    zoomAmount;


                viewerZoom =
                    Math.max(
                        MIN_ZOOM,
                        Math.min(
                            MAX_ZOOM,
                            viewerZoom
                        )
                    );


                if (
                    viewerZoom <= MIN_ZOOM
                ) {

                    viewerZoom =
                        MIN_ZOOM;

                    viewerX = 0;

                    viewerY = 0;

                }


                updateViewerTransform();

            }


            lastPinchDistance =
                distance;


            return;

        }


        // --------------------------------------------------------
        // One finger pan
        // --------------------------------------------------------

        if (
            event.touches.length === 1 &&
            viewerZoom > MIN_ZOOM
        ) {

            const x =
                event.touches[0].clientX;

            const y =
                event.touches[0].clientY;


            viewerX =
                startViewerX +
                (
                    x -
                    dragStartX
                );


            viewerY =
                startViewerY +
                (
                    y -
                    dragStartY
                );


            updateViewerTransform();

        }

    },
    {
        passive: false
    }
);


// ================================================================
// TOUCH END
// ================================================================

viewerStage.addEventListener(
    "touchend",
    event => {

        event.preventDefault();


        if (
            event.touches.length < 2
        ) {

            lastPinchDistance =
                null;

        }

    },
    {
        passive: false
    }
);


// ================================================================
// DESKTOP WHEEL / TRACKPAD ZOOM
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


        viewerZoom *=
            zoomAmount;


        viewerZoom =
            Math.max(
                MIN_ZOOM,
                Math.min(
                    MAX_ZOOM,
                    viewerZoom
                )
            );


        if (
            viewerZoom <= MIN_ZOOM
        ) {

            viewerZoom =
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
// PREVENT BROWSER DOUBLE-TAP ZOOM
// ================================================================

document.addEventListener(
    "dblclick",
    event => {

        if (
            event.target.closest(
                ".art-button"
            ) ||
            event.target.closest(
                "#brief-button"
            ) ||
            event.target.closest(
                "#viewer-stage"
            )
        ) {

            event.preventDefault();

        }

    }
);


// ================================================================
// KEEP VIEWER CORRECT AFTER WINDOW RESIZE
// ================================================================

window.addEventListener(
    "resize",
    () => {

        if (
            !artViewer.classList.contains(
                "open"
            )
        ) {

            return;

        }


        if (
            artViewer.classList.contains(
                "brief-open"
            )
        ) {

            return;

        }


        calculateViewerScale();

        updateViewerTransform();

    }
);
