import assert from 'assert';
import * as gauss from './gaussian-analytics.js';

function round(value, digits) {
    const pot = 10 ** digits;
    return Math.round(value * pot) / pot;
}

const eps = 2.2 * 1E-16;
const sqrt_eps = Math.sqrt(eps);
const two_sqrt_eps = 2 * sqrt_eps;

function diffquot(f, x) {
    return (f(x + sqrt_eps) - f(x - sqrt_eps)) / two_sqrt_eps;
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

    it('should arrivate at pdf by differentiation', function() {
        const digits = 5;
        positive_example_values.forEach(
            x => assert.strictEqual(
                round(diffquot(gauss.cdf, x), digits),
                round(gauss.pdf(x), digits)
            )
        );
    });
});


describe('margrabesFormula()', function() {
    it('should match example from https://xplaind.com/793334/black-scholes', function() {
        const S1 = 52,
            S2 = 50,
            T = 0.5,
            sigma1 = 0.12,
            sigma2 = 0,
            rho = 0,
            q1 = 0,
            q2 = 0.05;
        const res = gauss.margrabesFormula(S1, S2, T, sigma1, sigma2, rho, q1, q2);
        assert.strictEqual(round(res.price, 3), 3.788);
        assert.strictEqual(round(res.d1, 4), 0.7993);
        assert.strictEqual(round(res.d2, 4), 0.7144);
        assert.strictEqual(round(res.N_d1, 4), 0.7879);
        assert.strictEqual(round(res.N_d2, 4), 0.7625);
    });
});

describe('margrabesFormulaShort()', function() {
    it('should be evuivalent to margrabesFormula', function() {
        const S1 = 123,
            S2 = 321,
            T = 2.5,
            q1 = 0.012,
            q2 = 0.023;
        for (let sigma=0; sigma<=0.5; sigma+=0.05) {
            const actual = gauss.margrabesFormulaShort(S1, S2, T, sigma, q1, q2).price;
            assert.strictEqual(
                actual,
                gauss.margrabesFormula(S1, S2, T, sigma, 0, 0.123, q1, q2).price
            );
            assert.strictEqual(
                actual,
                gauss.margrabesFormula(S1, S2, T, 0, sigma, 0.456, q1, q2).price
            );
            assert.strictEqual(
                actual,
                gauss.margrabesFormula(S1, S2, T, sigma, sigma, 0.5, q1, q2).price
            );
        }
    });
});

describe('eqBlackScholesCall', function() {
    it('should match example from https://xplaind.com/793334/black-scholes', function() {
        const S = 52,
            K = 50,
            T = 0.5,
            sigma = 0.12,
            r = 0.05;
        const res = gauss.eqBlackScholesCall(S, K, T, sigma, r);
        assert.strictEqual(round(res.price, 3), 3.788);
        assert.strictEqual(round(res.d1, 4), 0.7993);
        assert.strictEqual(round(res.d2, 4), 0.7144);
        assert.strictEqual(round(res.N_d1, 4), 0.7879);
        assert.strictEqual(round(res.N_d2, 4), 0.7625);
    });
});