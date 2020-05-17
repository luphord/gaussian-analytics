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
        assert.strictEqual(round(res.callPrice, 3), 3.788);
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
            const actual = gauss.margrabesFormulaShort(S1, S2, T, sigma, q1, q2).callPrice;
            assert.strictEqual(
                actual,
                gauss.margrabesFormula(S1, S2, T, sigma, 0, 0.123, q1, q2).callPrice
            );
            assert.strictEqual(
                actual,
                gauss.margrabesFormula(S1, S2, T, 0, sigma, 0.456, q1, q2).callPrice
            );
            assert.strictEqual(
                actual,
                gauss.margrabesFormula(S1, S2, T, sigma, sigma, 0.5, q1, q2).callPrice
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
        assert.strictEqual(round(res1.callPrice, digits), round(res2.putPrice, digits));
        assert.strictEqual(round(res1.putPrice, digits), round(res2.callPrice, digits));
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
        assert.strictEqual(round(res.callPrice, 3), 3.788);
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
        assert.strictEqual(round(res.N_d1, 2), round(0.6664, 2));
        assert.strictEqual(round(res.N_d2, 2), round(0.5714, 2));
    });

    it('should match example from http://sfb649.wiwi.hu-berlin.de/fedc_homepage/xplore/tutorials/xlghtmlnode62.html', function() {
        const S = 100,
            K = 120,
            T = 0.5,
            sigma = 0.25,
            r = 0.05;
        const res = gauss.eqBlackScholes(S, K, T, sigma, 0, r);
        const callPrice = res.callPrice;
        const putPrice = res.putPrice;
        assert.strictEqual(round(callPrice, 3), 1.952);
        assert.strictEqual(round(putPrice, 3), 18.989); // 18.898 in original source
    });
    
    it('should match examples from https://aaronschlegel.me/black-scholes-formula-python.html', function() {
        const S = 50,
            K = 100,
            r = 0.05,
            T = 1,
            sigma = 0.25;
        const digits = 5;
        const res = gauss.eqBlackScholes(S, K, T, sigma, 0, r);
        const callPrice = res.callPrice;
        const putPrice = res.putPrice;
        assert.strictEqual(round(callPrice, digits), round(0.027352509369436617, digits));
        assert.strictEqual(round(putPrice, digits), round(45.15029495944084, digits));
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
        const callPrice = res.callPrice;
        const putPrice = res.putPrice;
        assert.strictEqual(round(callPrice, digits), round(2.4575673110408576, digits));
        assert.strictEqual(round(putPrice, digits), round(2.4575673110408576, digits));
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
        const callPrice = res.callPrice;
        const putPrice = res.putPrice;
        assert.strictEqual(round(callPrice, digits), round(13.568091317729753, digits));
        assert.strictEqual(round(putPrice, digits), round(3.0041954610456045, digits));
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
            const callPrice = res.callPrice;
            const putPrice = res.putPrice;
            assert.strictEqual(round(callPrice - putPrice, digits), round(fwdPrice, digits));
        }
        // with dividends
        const q = 0.05;
        for (let K=80; K<=150; K+=2.7) {
            const fwdPrice = Math.exp(-q*T)*S - Math.exp(-r*T)*K;
            const res = gauss.eqBlackScholes(S, K, T, sigma, q, r);
            const callPrice = res.callPrice;
            const putPrice = res.putPrice;
            assert.strictEqual(round(callPrice - putPrice, digits), round(fwdPrice, digits));
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
        const callPrice = res.callPrice;
        const putPrice = res.putPrice;
        assert.strictEqual(round(callPrice, digits), round(0.005810283556875531, digits));
        assert.strictEqual(round(putPrice, digits), round(0.5225061853230608, digits));
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
            assert.strictEqual(round(resFor.putPrice, digits), round(resDom.callPrice/K/S, digits));
            assert.strictEqual(round(resFor.callPrice, digits), round(resDom.putPrice/K/S, digits));
        }
    });
});