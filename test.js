import assert from 'assert';
import * as gauss from './gaussian-analytics.js';

function round(value, digits) {
    const pot = 10 ** digits;
    return Math.round(value * pot) / pot;
}

describe('pdf()', function() {

    const pdf_example_values = [
        0.398942,
        0.241971,
        0.053991,
        0.004432,
        0.000134,
        1E-06,
        0
    ];

    it('should be symmetric', function() {
        for (let i=0; i<20; i++) {
            let x = Math.exp(0.1*i) - 1;
            assert.strictEqual(gauss.pdf(x), gauss.pdf(-x));
        }
    });

    it('should match example values', function() {
        for (let i=0; i<pdf_example_values.length; i++) {
            assert.strictEqual(round(gauss.pdf(i), 6), pdf_example_values[i]);
        }
    });
});
