import assert from 'assert';
import * as gauss from './gaussian-analytics.js';

describe('pdf()', function() {
    it('should be symmetric', function() {
        assert.strictEqual(gauss.pdf(1.23), gauss.pdf(1.23));
    });
});
