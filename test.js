import assert from 'assert';
import * as gauss from './gaussian-analytics.js';

function round(value, digits) {
    const pot = 10 ** digits;
    return Math.round(value * pot) / pot;
}

let positive_example_values = [];
for (let i=1; i<20; i++) {
    positive_example_values.push(Math.exp(0.1*i) - 1);
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
        positive_example_values.forEach(
            x => assert.strictEqual(gauss.pdf(x), gauss.pdf(-x))
        );
    });

    it('should match example values', function() {
        for (let i=0; i<pdf_example_values.length; i++) {
            assert.strictEqual(round(gauss.pdf(i), 6), pdf_example_values[i]);
        }
    });
});

describe('cdf()', function() {

    const cdf_example_values = [
        0.5,
        0.841345,
        0.97725,
        0.99865,
        0.999968,
        1
    ];

    it('should be symmetric', function() {
        positive_example_values.forEach(
            x => assert.strictEqual(gauss.cdf(x), 1 - gauss.cdf(-x))
        );
    });

    it('should match example values', function() {
        for (let i=0; i<cdf_example_values.length; i++) {
            assert.strictEqual(round(gauss.cdf(i), 6), cdf_example_values[i]);
        }
    });
});
