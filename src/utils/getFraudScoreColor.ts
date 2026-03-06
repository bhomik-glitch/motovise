export function getFraudScoreColor(score: number): 'green' | 'yellow' | 'red' {
    if (score <= 30) return 'green';
    if (score <= 60) return 'yellow';
    return 'red';
}
