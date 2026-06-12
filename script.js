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
    
    const hexColors = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#9b59b6', '#34495e', '#1abc9c', '#e67e22'];

    // Paint routine draws slices natively using offset tracking markers
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

    // Paint initial graphics layout placeholder
    renderWheelGraphics(itemsList, 0);

    // Frame rendering execution loop
    function spinRotationLoop() {
        currentStartAngle += 0.45; 
        renderWheelGraphics(itemsList, currentStartAngle);
        activeAnimationId = requestAnimationFrame(spinRotationLoop);
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
        
        startBtn.disabled = true;
        stopBtn.disabled = false;
        spinRotationLoop();
    });

    stopBtn.addEventListener('click', function() {
        cancelAnimationFrame(activeAnimationId);
        
        stopBtn.disabled = true;
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
    });
});
