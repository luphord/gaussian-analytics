import assert from 'assert';
import * as gauss from './gaussian-analytics.js';

describe('pdf()', function() {
    it('should be symmetric', function() {
        for (let i=0; i<20; i++) {
            let x = Math.exp(0.1*i) - 1;
            assert.strictEqual(gauss.pdf(x), gauss.pdf(-x));
        }
    });
});
