/**
 * Deadlock Avoidance: Banker's Algorithm Logic
 * This module helps determine if a system is in a safe state and finds a safe sequence.
 */

/**
 * Banker's Algorithm
 * @param {Array} allocation Matrix (NxM) of currently allocated resources
 * @param {Array} max Matrix (NxM) of maximum resource requirements
 * @param {Array} available Array (M) of currently available resources
 * @param {Array} processIds Array (N) of process names/IDs
 * @returns {Object} { isSafe, safeSequence, logs }
 */
export function calculateBankersAlgorithm(allocation, max, available, processIds) {
    const n = allocation.length; // Number of processes
    const m = available.length; // Number of resource types

    // Calculate Need matrix: Need[i][j] = Max[i][j] - Allocation[i][j]
    const need = allocation.map((row, i) =>
        row.map((val, j) => max[i][j] - val)
    );

    const work = [...available];
    const finish = new Array(n).fill(false);
    const safeSequence = [];
    const logs = [];

    logs.push(`System initialized. Work: [${work.join(', ')}]. Need matrix calculated.`);

    let count = 0;
    while (count < n) {
        let found = false;
        for (let i = 0; i < n; i++) {
            if (!finish[i]) {
                // Check if all resource needs of process i can be satisfied by current work
                let canBeSatisfied = true;
                for (let j = 0; j < m; j++) {
                    if (need[i][j] > work[j]) {
                        canBeSatisfied = false;
                        break;
                    }
                }

                if (canBeSatisfied) {
                    logs.push(`Process ${processIds[i]} can be satisfied. Need: [${need[i].join(', ')}] <= Work: [${work.join(', ')}]`);
                    // Process can complete, release its allocated resources back to work
                    for (let j = 0; j < m; j++) {
                        work[j] += allocation[i][j];
                    }
                    finish[i] = true;
                    safeSequence.push(processIds[i]);
                    count++;
                    found = true;
                    logs.push(`Process ${processIds[i]} completed. New Work: [${work.join(', ')}]. Added to safe sequence.`);
                }
            }
        }

        if (!found) {
            logs.push("Deadlock detected or unsafe state. No more processes can be satisfied.");
            return {
                isSafe: false,
                safeSequence: [],
                logs
            };
        }
    }

    logs.push(`System is in a SAFE STATE. Safe Sequence: ${safeSequence.join(' -> ')}`);
    return {
        isSafe: true,
        safeSequence,
        logs,
        need
    };
}
