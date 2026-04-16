/**
 * Disk Scheduling Algorithms Logic
 * Returns structured data for visualization and breakdown.
 */

const createMovements = (sequence, jumps = []) => {
    const movements = [];
    let totalMovement = 0;
    for (let i = 0; i < sequence.length - 1; i++) {
        const from = sequence[i];
        const to = sequence[i + 1];
        const val = Math.abs(to - from);
        
        // A jump is a movement that doesn't count towards seek time in some models,
        // but standardly it is just a large movement. We mark it for visualization.
        const isJump = jumps.some(j => j.from === from && j.to === to);
        
        totalMovement += val;
        movements.push({
            step: i + 1,
            from,
            to,
            calc: `|${to} - ${from}|`,
            val,
            isJump
        });
    }
    return { movements, totalMovement };
};

/**
 * 1. FCFS (First-Come, First-Served)
 */
export function calculateFCFS(initialHead, requests) {
    const sequence = [initialHead, ...requests];
    const { movements, totalMovement } = createMovements(sequence);
    return { sequence, movements, totalMovement };
}

/**
 * 2. SSTF (Shortest Seek Time First)
 */
export function calculateSSTF(initialHead, requests) {
    let current = initialHead;
    const pending = [...requests];
    const sequence = [initialHead];
    
    while (pending.length > 0) {
        let minIdx = 0;
        let minDistance = Math.abs(current - pending[0]);
        
        for (let i = 1; i < pending.length; i++) {
            const dist = Math.abs(current - pending[i]);
            if (dist < minDistance) {
                minDistance = dist;
                minIdx = i;
            }
        }
        
        current = pending.splice(minIdx, 1)[0];
        sequence.push(current);
    }
    
    const { movements, totalMovement } = createMovements(sequence);
    return { sequence, movements, totalMovement };
}

/**
 * 3. SCAN (Elevator)
 */
export function calculateSCAN(initialHead, requests, maxTrack, direction) {
    const sequence = [initialHead];
    const sorted = [...requests].sort((a, b) => a - b);
    
    const left = sorted.filter(t => t < initialHead).reverse();
    const right = sorted.filter(t => t >= initialHead);
    
    if (direction === 'UP') {
        sequence.push(...right);
        if (left.length > 0) sequence.push(maxTrack);
        sequence.push(...left);
    } else {
        sequence.push(...left);
        if (right.length > 0) sequence.push(0);
        sequence.push(...right);
    }
    
    const { movements, totalMovement } = createMovements(sequence);
    return { sequence, movements, totalMovement };
}

/**
 * 4. C-SCAN (Circular SCAN)
 */
export function calculateCSCAN(initialHead, requests, maxTrack, direction) {
    const sequence = [initialHead];
    const sorted = [...requests].sort((a, b) => a - b);
    const jumps = [];
    
    const left = sorted.filter(t => t < initialHead);
    const right = sorted.filter(t => t >= initialHead);
    
    if (direction === 'UP') {
        sequence.push(...right);
        if (left.length > 0) {
            sequence.push(maxTrack);
            jumps.push({ from: maxTrack, to: 0 }); // Circular jump
            sequence.push(0);
            sequence.push(...left);
        }
    } else {
        sequence.push(...left.reverse());
        if (right.length > 0) {
            sequence.push(0);
            jumps.push({ from: 0, to: maxTrack }); // Circular jump
            sequence.push(maxTrack);
            sequence.push(...right.reverse());
        }
    }
    
    const { movements, totalMovement } = createMovements(sequence, jumps);
    return { sequence, movements, totalMovement };
}

/**
 * 5. LOOK
 */
export function calculateLOOK(initialHead, requests, direction) {
    const sequence = [initialHead];
    const sorted = [...requests].sort((a, b) => a - b);
    
    const left = sorted.filter(t => t < initialHead).reverse();
    const right = sorted.filter(t => t >= initialHead);
    
    if (direction === 'UP') {
        sequence.push(...right);
        sequence.push(...left);
    } else {
        sequence.push(...left);
        sequence.push(...right);
    }
    
    const { movements, totalMovement } = createMovements(sequence);
    return { sequence, movements, totalMovement };
}

/**
 * 6. C-LOOK
 */
export function calculateCLOOK(initialHead, requests, direction) {
    const sequence = [initialHead];
    const sorted = [...requests].sort((a, b) => a - b);
    const jumps = [];
    
    const left = sorted.filter(t => t < initialHead);
    const right = sorted.filter(t => t >= initialHead);
    
    if (direction === 'UP') {
        sequence.push(...right);
        if (left.length > 0) {
            jumps.push({ from: right.length > 0 ? right[right.length - 1] : initialHead, to: left[0] });
            sequence.push(...left);
        }
    } else {
        sequence.push(...left.reverse());
        if (right.length > 0) {
            jumps.push({ from: left.length > 0 ? left[0] : initialHead, to: right[right.length - 1] });
            sequence.push(...right.reverse());
        }
    }
    
    const { movements, totalMovement } = createMovements(sequence, jumps);
    return { sequence, movements, totalMovement };
}
