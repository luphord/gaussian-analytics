import assert from 'assert';
import * as gauss from './gaussian-analytics.js';

function round(value, digits) {
    const pot = 10 ** digits;
    return Math.round(value * pot) / pot;
}

function assertEqualRounded(actual, expected, digits) {
    assert.strictEqual(round(actual, digits), round(expected, digits));
}

const eps = 2.2 * 1E-16;
const sqrt_eps = Math.sqrt(eps);
const sqrt_sqrt_eps = Math.sqrt(sqrt_eps);
const two_sqrt_eps = 2 * sqrt_eps;

function diffquot(f, x) {
    return (f(x + sqrt_eps) - f(x - sqrt_eps)) / two_sqrt_eps;
}

function diffquot2(f, x) {
    return (f(x + sqrt_sqrt_eps) - 2*f(x) + f(x - sqrt_sqrt_eps)) / sqrt_eps;
}

describe('diffquot', function() {
    it('second derivative should be constant', function() {
        const f = x => x**2;
        for (let x=-2; x<=10; x+=0.1) {
            assertEqualRounded(diffquot2(f, x), 2, 5);
        }
    });
});

function invertFxParameters(S, K, T, sigma, rFor, rDom) {
    return {
        S: 1/S,
        K: 1/K,
        T: T,
        sigma: sigma,
        rFor: rDom,
        rDom: rFor
    };
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
            assertEqualRounded(gauss.pdf(i), pdf_example_values[i], 6);
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
            assertEqualRounded(gauss.cdf(i), cdf_example_values[i], 6);
        }
    });

    it('should arrive at pdf by differentiation', function() {
        const digits = 5;
        positive_example_values.forEach(
            x => assertEqualRounded(diffquot(gauss.cdf, x), gauss.pdf(x), digits)
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
        assert.strictEqual(round(res.call.price, 3), 3.788);
        assert.strictEqual(round(res.d1, 4), 0.7993);
        assert.strictEqual(round(res.d2, 4), 0.7144);
        assert.strictEqual(round(res.N_d1, 4), 0.7879);
        assert.strictEqual(round(res.N_d2, 4), 0.7625);
    });

    it('should fail with bad parameters', function() {
        const S1 = 52,
            S2 = 50,
            T = 0.5,
            sigma1 = 0.12,
            sigma2 = 0.1,
            rho = 0,
            q1 = 0,
            q2 = 0.05;
        assert.throws(() => gauss.margrabesFormula(-S1, S2, T, sigma1, sigma2, rho, q1, q2));
        assert.throws(() => gauss.margrabesFormula(S1, -S2, T, sigma1, sigma2, rho, q1, q2));
        assert.throws(() => gauss.margrabesFormula(S1, S2, -T, sigma1, sigma2, rho, q1, q2));
        assert.throws(() => gauss.margrabesFormula(S1, S2, T, -sigma1, sigma2, rho, q1, q2));
        assert.throws(() => gauss.margrabesFormula(S1, S2, T, sigma1, -sigma2, rho, q1, q2));
        assert.throws(() => gauss.margrabesFormula(S1, S2, T, sigma1, sigma2, -1.1, q1, q2));
        assert.throws(() => gauss.margrabesFormula(S1, S2, T, sigma1, sigma2, 1.1, q1, q2));
        assert.throws(() => gauss.margrabesFormula('1', S2, T, sigma1, sigma2, rho, q1, q2));
        assert.throws(() => gauss.margrabesFormula(S1, '1', T, sigma1, sigma2, rho, q1, q2));
        assert.throws(() => gauss.margrabesFormula(S1, S2, '1', sigma1, sigma2, rho, q1, q2));
        assert.throws(() => gauss.margrabesFormula(S1, S2, T, '1', sigma2, rho, q1, q2));
        assert.throws(() => gauss.margrabesFormula(S1, S2, T, sigma1, '1', rho, q1, q2));
        assert.throws(() => gauss.margrabesFormula(S1, S2, T, sigma1, sigma2, '1', q1, q2));
        assert.throws(() => gauss.margrabesFormula(S1, S2, T, sigma1, sigma2, rho, '1', q2));
        assert.throws(() => gauss.margrabesFormula(S1, S2, T, sigma1, sigma2, rho, q1, '1'));
    });
});

describe('margrabesFormulaShort()', function() {
    it('should be equivalent to margrabesFormula', function() {
        const S1 = 123,
            S2 = 321,
            T = 2.5,
            q1 = 0.012,
            q2 = 0.023;
        for (let sigma=0; sigma<=0.5; sigma+=0.05) {
            const actual = gauss.margrabesFormulaShort(S1, S2, T, sigma, q1, q2).call.price;
            assert.strictEqual(
                actual,
                gauss.margrabesFormula(S1, S2, T, sigma, 0, 0.123, q1, q2).call.price
            );
            assert.strictEqual(
                actual,
                gauss.margrabesFormula(S1, S2, T, 0, sigma, 0.456, q1, q2).call.price
            );
            assert.strictEqual(
                actual,
                gauss.margrabesFormula(S1, S2, T, sigma, sigma, 0.5, q1, q2).call.price
            );
        }
    });
    
    it('should be symmetric regarding switch of assets and put call', function() {
        const S1 = 123,
            S2 = 321,
            T = 2.5,
            q1 = 0.012,
            q2 = 0.023,
            sigma = 0.2;
        const digits = 12;
        const res1 = gauss.margrabesFormulaShort(S1, S2, T, sigma, q1, q2);
        const res2 = gauss.margrabesFormulaShort(S2, S1, T, sigma, q2, q1);
        assertEqualRounded(res1.call.price, res2.put.price, digits);
        assertEqualRounded(res1.put.price, res2.call.price, digits);
    });

    it('delta (gamma) should be equal to differentating (twice) by S1', function() {
        const S1 = 123,
            T = 2.5,
            sigma = 0.23,
            q1 = 0.012,
            q2 = 0.023;
        const digits=3;
        for (let S2=80; S2<=160; S2+=5) {
            const res = gauss.margrabesFormulaShort(S1, S2, T, sigma, q1, q2);
            const callPrice = function(s) {
                return gauss.margrabesFormulaShort(s, S2, T, sigma, q1, q2).call.price;
            };
            const putPrice = function(s) {
                return gauss.margrabesFormulaShort(s, S2, T, sigma, q1, q2).put.price;
            };
            // delta
            assertEqualRounded(res.call.delta, diffquot(callPrice, S1), digits);
            assertEqualRounded(res.put.delta, diffquot(putPrice, S1), digits);
            // gamma
            assertEqualRounded(res.call.gamma, diffquot2(callPrice, S1), digits);
            assertEqualRounded(res.put.gamma, diffquot2(putPrice, S1), digits);
        }
    });
});

describe('eqBlackScholes', function() {
    it('should match example from https://xplaind.com/793334/black-scholes', function() {
        const S = 52,
            K = 50,
            T = 0.5,
            sigma = 0.12,
            r = 0.05;
        const res = gauss.eqBlackScholes(S, K, T, sigma, 0, r);
        assert.strictEqual(round(res.call.price, 3), 3.788);
        assert.strictEqual(round(res.d1, 4), 0.7993);
        assert.strictEqual(round(res.d2, 4), 0.7144);
        assert.strictEqual(round(res.N_d1, 4), 0.7879);
        assert.strictEqual(round(res.N_d2, 4), 0.7625);
    });

    it('should match example from http://www.maxi-pedia.com/Black+Scholes+model', function() {
        // this is not a good example due to excessive rounding in the source
        const S = 100,
            K = 95,
            T = 0.24,
            sigma = 0.5,
            r = 0.1;
        const res = gauss.eqBlackScholes(S, K, T, sigma, 0, r);
        assert.strictEqual(round(res.d1, 2), 0.43);
        assert.strictEqual(round(res.d2, 2), 0.18);
        assertEqualRounded(res.N_d1, 0.6664, 2);
        assertEqualRounded(res.N_d2, 0.5714, 2);
    });

    it('should match example from http://sfb649.wiwi.hu-berlin.de/fedc_homepage/xplore/tutorials/xlghtmlnode62.html', function() {
        const S = 100,
            K = 120,
            T = 0.5,
            sigma = 0.25,
            r = 0.05;
        const res = gauss.eqBlackScholes(S, K, T, sigma, 0, r);
        assert.strictEqual(round(res.call.price, 3), 1.952);
        assert.strictEqual(round(res.put.price, 3), 18.989); // 18.898 in original source
    });
    
    it('should match examples from https://aaronschlegel.me/black-scholes-formula-python.html', function() {
        const S = 50,
            K = 100,
            r = 0.05,
            T = 1,
            sigma = 0.25;
        const digits = 5;
        const res = gauss.eqBlackScholes(S, K, T, sigma, 0, r);
        assertEqualRounded(res.call.price, 0.027352509369436617, digits);
        assertEqualRounded(res.put.price, 45.15029495944084, digits);
    });

    it('should match first example from https://aaronschlegel.me/generalized-black-scholes-formula-european-options.html', function() {
        const F = 20,
            K = 20,
            r = .15,
            T = 9 / 12,
            sigma = 0.40;
        const S = Math.exp(-r*T)*F;
        const digits = 7;
        const res = gauss.eqBlackScholes(S, K, T, sigma, 0, r);
        assertEqualRounded(res.call.price, 2.4575673110408576, digits);
        assertEqualRounded(res.put.price, 2.4575673110408576, digits);
    });

    it('should match second example from https://aaronschlegel.me/generalized-black-scholes-formula-european-options.html', function() {
        const S = 110,
            K = 100,
            r = 0.10,
            q = 0.08,
            T = 6 / 12,
            sigma = 0.25;
        const digits = 4;
        const res = gauss.eqBlackScholes(S, K, T, sigma, q, r);
        assertEqualRounded(res.call.price, 13.568091317729753, digits);
        assertEqualRounded(res.put.price, 3.0041954610456045, digits);
    });

    it('Put-Call-Parity should hold', function() {
        const S = 123,
            sigma = 0.23,
            T = 2.5,
            r = 0.012;
        const digits = 12;
        // without dividends
        for (let K=80; K<=150; K+=2.7) {
            const fwdPrice = S - Math.exp(-r*T)*K;
            const res = gauss.eqBlackScholes(S, K, T, sigma, 0, r);
            assertEqualRounded(res.call.price - res.put.price, fwdPrice, digits);
        }
        // with dividends
        const q = 0.05;
        for (let K=80; K<=150; K+=2.7) {
            const fwdPrice = Math.exp(-q*T)*S - Math.exp(-r*T)*K;
            const res = gauss.eqBlackScholes(S, K, T, sigma, q, r);
            assertEqualRounded(res.call.price - res.put.price, fwdPrice, digits);
        }
    });

    it('Synthetic forward without dividends should be delta 1', function() {
        // this works only for 0 dividends as we compute spot delta, not forward delta
        const S = 123,
            sigma = 0.23,
            T = 2.5,
            r = 0.012;
        const digits = 12;
        for (let K=80; K<=150; K+=2.7) {
            const res = gauss.eqBlackScholes(S, K, T, sigma, 0, r);
            assert.strictEqual(round(res.call.delta - res.put.delta, digits), 1);
        }
    });

    it('should match digital call example from http://janroman.dhis.org/finance/Exotic%20Options/Presentation%20Exotics/L2note.pdf slide 3', function() {
        const S = 480,
            K = 500,
            T = 0.5,
            sigma = 0.2,
            q = 0.03,
            r = 0.08;
        const res = gauss.eqBlackScholes(S, K, T, sigma, q, r);
        assertEqualRounded(res.digitalCall.price, 0.4108, 4);
    });

    it('delta (gamma) of digital options should be equal to differentating (twice) by S1', function() {
        const S = 123,
            T = 2.5,
            sigma = 0.23,
            q = 0.012,
            r = 0.023;
        const digits = 7;
        for (let K=80; K<=160; K+=5) {
            const res = gauss.eqBlackScholes(S, K, T, sigma, q, r);
            const digiCallPrice = function(s) {
                return gauss.eqBlackScholes(s, K, T, sigma, q, r).digitalCall.price;
            };
            //const digiPutPrice = function(s) {
            //    return gauss.eqBlackScholes(s, K, T, sigma, q, r).digitalPut.price;
            //};
            // delta
            assertEqualRounded(res.digitalCall.delta, diffquot(digiCallPrice, S), digits);
            //assertEqualRounded(res.digitalPut.delta, diffquot(digiPutPrice, S), digits);
            // gamma
            //assertEqualRounded(res.digitalCall.gamma, diffquot2(digiCallPrice, S), digits);
            //assertEqualRounded(res.digitalPut.gamma, diffquot2(digiPutPrice, S), digits);
        }
    });
});

describe('fxBlackScholes', function() {
    it('should match fx example from https://aaronschlegel.me/generalized-black-scholes-formula-european-options.html', function() {
        const S = 2,
            K = 2.5,
            T = 6 / 12,
            rDom = 0.05,
            rFor = 0.08,
            sigma = 0.2;
        const digits = 6;
        const res = gauss.fxBlackScholes(S, K, T, sigma, rFor, rDom);
        assertEqualRounded(res.call.price, 0.005810283556875531, digits);
        assertEqualRounded(res.put.price, 0.5225061853230608, digits);
    });

    it('should be symmetric with respect to currency switching', function() {
        const S = 2.345,
            sigma = 0.23,
            T = 2.5,
            rFor = 0.03,
            rDom = 0.012;
        const digits = 12;
        for (let K=1.2; K<=3.5; K+=0.1) {
            const resDom = gauss.fxBlackScholes(S, K, T, sigma, rFor, rDom);
            const parFor = invertFxParameters(S, K, T, sigma, rFor, rDom);
            const resFor = gauss.fxBlackScholes(parFor.S, parFor.K, parFor.T, parFor.sigma, parFor.rFor, parFor.rDom);
            assertEqualRounded(resFor.put.price, resDom.call.price/K/S, digits);
            assertEqualRounded(resFor.call.price, resDom.put.price/K/S, digits);
        }
    });
});