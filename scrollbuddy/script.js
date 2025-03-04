const buddy = document.getElementById('scrollBuddy');
let lastScroll = 0;
let walkPhase = 0;
const walkSpeed = 0.0314;

// Check for reduced motion preferences
const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const prefersReducedMotion = prefersReducedMotionQuery.matches || 
                           navigator.platform.toLowerCase().includes('mac') && 
                           window.matchMedia('(-apple-reduce-motion: reduce)').matches;

// Hide scroll buddy if reduced motion is preferred
if (prefersReducedMotion) {
    buddy.style.display = 'none';
}

// Cache DOM elements for better performance
const leftArm = buddy.querySelector('.left-arm');
const rightArm = buddy.querySelector('.right-arm');
const leftArmLower = buddy.querySelector('.left-arm-lower');
const rightArmLower = buddy.querySelector('.right-arm-lower');
const leftLegUpper = buddy.querySelector('.left-leg-upper');
const rightLegUpper = buddy.querySelector('.right-leg-upper');
const leftLegLower = buddy.querySelector('.left-leg-lower');
const rightLegLower = buddy.querySelector('.right-leg-lower');
const leftFoot = buddy.querySelector('.left-foot');
const rightFoot = buddy.querySelector('.right-foot');

// Set initial neutral pose if reduced motion is preferred
if (prefersReducedMotion) {
    // Set all limbs to neutral standing position
    leftArm.style.transform = rightArm.style.transform = 'rotate(90deg)';
    leftArmLower.style.transform = rightArmLower.style.transform = 'rotate(90deg)';
    leftLegUpper.style.transform = rightLegUpper.style.transform = 'rotate(90deg)';
    leftLegLower.style.transform = rightLegLower.style.transform = 'rotate(90deg)';
    leftFoot.style.transform = rightFoot.style.transform = 'rotate(180deg)';
}

function updateArmMovement(phase) {
    if (prefersReducedMotion) return;

    // Upper arm movement
    const upperArmAngle = Math.sin(phase) * 30;
    leftArm.style.transform = `rotate(${90 + upperArmAngle}deg)`;
    rightArm.style.transform = `rotate(${90 - upperArmAngle}deg)`;

    // Lower arm movement (elbow bend)
    // Only bend elbow when arm swings forward (positive angle for left, negative for right)
    const leftLowerArmAngle = Math.sin(phase + Math.PI/4) * 20 * (upperArmAngle > 0 ? 1 : 0.2);
    const rightLowerArmAngle = Math.sin(phase + Math.PI/4) * 20 * (upperArmAngle < 0 ? 1 : 0.2);

    const leftElbowX = Math.cos((90 + upperArmAngle) * Math.PI/180) * 10;
    const leftElbowY = Math.sin((90 + upperArmAngle) * Math.PI/180) * 10;
    const rightElbowX = Math.cos((90 - upperArmAngle) * Math.PI/180) * 10;
    const rightElbowY = Math.sin((90 - upperArmAngle) * Math.PI/180) * 10;

    leftArmLower.style.transform = `translate(${leftElbowX}px, ${leftElbowY}px) rotate(${90 + upperArmAngle + leftLowerArmAngle}deg)`;
    rightArmLower.style.transform = `translate(${rightElbowX}px, ${rightElbowY}px) rotate(${90 - upperArmAngle - rightLowerArmAngle}deg)`;
}

function updateLegMovement(phase) {
    if (prefersReducedMotion) return;

    // Upper leg movement
    const upperLegAngle = Math.sin(phase) * 25;
    leftLegUpper.style.transform = `rotate(${90 - upperLegAngle}deg)`;
    rightLegUpper.style.transform = `rotate(${90 + upperLegAngle}deg)`;

    // Lower leg movement (knee bend)
    const lowerLegAngle = Math.sin(phase + Math.PI/4) * 20;
    const leftKneeX = Math.cos((90 - upperLegAngle) * Math.PI/180) * 12;
    const leftKneeY = Math.sin((90 - upperLegAngle) * Math.PI/180) * 12;
    const rightKneeX = Math.cos((90 + upperLegAngle) * Math.PI/180) * 12;
    const rightKneeY = Math.sin((90 + upperLegAngle) * Math.PI/180) * 12;

    leftLegLower.style.transform = `translate(${leftKneeX}px, ${leftKneeY}px) rotate(${90 - upperLegAngle - lowerLegAngle}deg)`;
    rightLegLower.style.transform = `translate(${rightKneeX}px, ${rightKneeY}px) rotate(${90 + upperLegAngle + lowerLegAngle}deg)`;

    // Foot movement
    const leftFootX = leftKneeX + Math.cos((90 - upperLegAngle - lowerLegAngle) * Math.PI/180) * 10;
    const leftFootY = leftKneeY + Math.sin((90 - upperLegAngle - lowerLegAngle) * Math.PI/180) * 10;
    const rightFootX = rightKneeX + Math.cos((90 + upperLegAngle + lowerLegAngle) * Math.PI/180) * 10;
    const rightFootY = rightKneeY + Math.sin((90 + upperLegAngle + lowerLegAngle) * Math.PI/180) * 10;

    const footAngle = Math.sin(phase) * 15;
    leftFoot.style.transform = `translate(${leftFootX}px, ${leftFootY}px) rotate(${180 - footAngle}deg)`;
    rightFoot.style.transform = `translate(${rightFootX}px, ${rightFootY}px) rotate(${180 + footAngle}deg)`;
}

function updateBuddyVerticalPosition(scrollPosition) {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPercent = scrollPosition / (documentHeight - windowHeight);
    const buddyHeight = buddy.offsetHeight;
    const maxTop = windowHeight - buddyHeight;
    const newTop = scrollPercent * maxTop;

    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
        buddy.style.top = `${newTop}px`;
    });
}

function updateBuddyPosition() {
    const scrollPosition = window.scrollY;
    const scrollDelta = scrollPosition - lastScroll;

    // Only update walk phase if animations are enabled
    if (!prefersReducedMotion) {
        walkPhase += scrollDelta * walkSpeed;
        updateArmMovement(walkPhase);
        updateLegMovement(walkPhase);
    }

    // Always update vertical position
    updateBuddyVerticalPosition(scrollPosition);

    lastScroll = scrollPosition;
}

// Listen for changes to motion preference (both standard and macOS specific)
prefersReducedMotionQuery.addEventListener('change', (e) => {
    location.reload();
});

window.matchMedia('(-apple-reduce-motion: reduce)').addEventListener('change', (e) => {
    location.reload();
});

// Event listeners
window.addEventListener('scroll', updateBuddyPosition);
window.addEventListener('resize', updateBuddyPosition);

// Set initial position
updateBuddyPosition();