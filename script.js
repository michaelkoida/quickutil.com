// Wait for DOM layout layers to sit ready
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const output = document.getElementById('outputMessage');
    const input = document.getElementById('choicesInput');

    let currentStartAngle = 0;
    let activeAnimationId = null;
    let itemsList = ["Spin", "To", "Pick", "A", "Random", "Choice"];
    
    // Physics control variables for lottery-style slowdown
    let currentVelocity = 0;
    let isStopping = false;
    let stopTimeStart = 0;
    const slowdownDuration = 3500; // Exact time target: 3.5 seconds in milliseconds
    let initialStopVelocity = 0;

    const hexColors = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#9b59b6', '#34495e', '#1abc9c', '#e67e22'];

    // Paint routine draws slices natively
    function renderWheelGraphics(items, globalAngleOffset = 0) {
        const totalSlices = items.length;
        const radiansPerSlice = (2 * Math.PI) / totalSlices;
        
        ctx.clearRect(0, 0, 260, 260);

        for (let i = 0; i < totalSlices; i++) {
            const arcStart = (i * radiansPerSlice) + globalAngleOffset;
            const arcEnd = arcStart + radiansPerSlice;
            
            const sliceGradient = ctx.createRadialGradient(130, 130, 10, 130, 130, 130);
            sliceGradient.addColorStop(0, '#ffffff');
            sliceGradient.addColorStop(0.2, hexColors[i % hexColors.length]);
            sliceGradient.addColorStop(1, '#111111');
            
            ctx.beginPath();
            ctx.fillStyle = sliceGradient;
            ctx.moveTo(130, 130);
            ctx.arc(130, 130, 130, arcStart, arcEnd);
            ctx.lineTo(130, 130);
            ctx.fill();
            
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.stroke();

            // Decorative lighting edge rivets
            ctx.save();
            ctx.translate(130, 130);
            ctx.rotate(arcStart + radiansPerSlice / 2);
            ctx.beginPath();
            ctx.arc(115, 0, 3, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.restore();

            // Text titles mapping layer
            ctx.save();
            ctx.translate(130, 130);
            ctx.rotate(arcStart + radiansPerSlice / 2);
            
            ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            
            let sliceName = items[i];
            if(sliceName.length > 9) sliceName = sliceName.substring(0, 8) + '..';
            
            ctx.fillText(sliceName, 100, 0);
            ctx.restore();
        }
    }

    // Paint initial placeholder graph layout
    renderWheelGraphics(itemsList, 0);

    // Frame rendering execution loop with smooth dynamic physics engine built-in
    function spinRotationLoop(timestamp) {
        if (isStopping) {
            if (!stopTimeStart) stopTimeStart = timestamp;
            const elapsed = timestamp - stopTimeStart;

            if (elapsed >= slowdownDuration) {
                // Time window complete! Freeze movement loop entirely
                currentVelocity = 0;
                cancelAnimationFrame(activeAnimationId);
                declareWinner();
                return;
            }

            // Cubic easing out math - standard developer approach to smoothly decelerate to 0
            const progress = elapsed / slowdownDuration;
            const remainingMultiplier = 1 - progress;
            // cubic curve deceleration drop
            currentVelocity = initialStopVelocity * (remainingMultiplier * remainingMultiplier * remainingMultiplier);
        }

        currentStartAngle += currentVelocity; 
        renderWheelGraphics(itemsList, currentStartAngle);
        activeAnimationId = requestAnimationFrame(spinRotationLoop);
    }

    // Declares the winning piece after stopping
    function declareWinner() {
        startBtn.disabled = false;
        
        const totalSlices = itemsList.length;
        const radiansPerSlice = (2 * Math.PI) / totalSlices;

        let netAngleOffset = currentStartAngle % (2 * Math.PI);
        if (netAngleOffset < 0) netAngleOffset += (2 * Math.PI);

        const pointReferenceAngle = (1.5 * Math.PI);
        let winningTargetAngle = (pointReferenceAngle - netAngleOffset) % (2 * Math.PI);
        if (winningTargetAngle < 0) winningTargetAngle += (2 * Math.PI);

        const finalWinningIndex = Math.floor(winningTargetAngle / radiansPerSlice) % totalSlices;
        const chosenWinner = itemsList[finalWinningIndex];

        output.innerHTML = `<span class="winner-display">🎉 Choice: ${chosenWinner}</span>`;
    }

    startBtn.addEventListener('click', function() {
        const freshInputs = input.value.split(',')
                                     .map(s => s.trim())
                                     .filter(s => s.length > 0);

        if (freshInputs.length < 2) {
            output.innerHTML = '<span style="color:#ef4444;">Please input at least 2 choices separated by a comma!</span>';
            return;
        }

        itemsList = freshInputs;
        output.innerText = "The wheel is spinning...";
        
        // Reset state metrics
        isStopping = false;
        stopTimeStart = 0;
        currentVelocity = 0.45; // baseline full rotation speed run index
        
        startBtn.disabled = true;
        stopBtn.disabled = false;
        
        // Pass timestamp handle right into engine loop
        activeAnimationId = requestAnimationFrame(spinRotationLoop);
    });

    stopBtn.addEventListener('click', function() {
        stopBtn.disabled = true;
        output.innerText = "Slowing down smoothly...";
        
        // Lock initial current speed and initialize time flags for gradual easing
        initialStopVelocity = currentVelocity;
        isStopping = true;
    });
});
