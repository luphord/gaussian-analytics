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

    it('should fail with bad parameters', function() {
        assert.throws(() => gauss.pdf('0'));
        assert.throws(() => gauss.pdf());
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

    it('should fail with bad parameters', function() {
        assert.throws(() => gauss.cdf('0'));
        assert.throws(() => gauss.cdf());
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
        const digits2 = 3;
        for (let K=80; K<=160; K+=5) {
            const res = gauss.eqBlackScholes(S, K, T, sigma, q, r);
            const digiCallPrice = function(s) {
                return gauss.eqBlackScholes(s, K, T, sigma, q, r).digitalCall.price;
            };
            const digiPutPrice = function(s) {
                return gauss.eqBlackScholes(s, K, T, sigma, q, r).digitalPut.price;
            };
            // delta
            assertEqualRounded(res.digitalCall.delta, diffquot(digiCallPrice, S), digits);
            assertEqualRounded(res.digitalPut.delta, diffquot(digiPutPrice, S), digits);
            // gamma
            assertEqualRounded(res.digitalCall.gamma, diffquot2(digiCallPrice, S), digits2);
            assertEqualRounded(res.digitalPut.gamma, diffquot2(digiPutPrice, S), digits2);
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

describe('irBlack76', function() {
    it('should match first example from https://aaronschlegel.me/generalized-black-scholes-formula-european-options.html', function() {
        const F = 20,
            K = 20,
            r = .15,
            T = 9 / 12,
            sigma = 0.40;
        const digits = 7;
        const res = gauss.irBlack76(F, K, T, sigma, r);
        assertEqualRounded(res.call.price, 2.4575673110408576, digits);
        assertEqualRounded(res.put.price, 2.4575673110408576, digits);
    });

    it('should match (highly adapted) example of slide 8-12 of http://www.cmat.edu.uy/~mordecki/hk/lecture24.pdf (which is apparently from Hull', function() {
        const T = 10 / 12,
            bondDirtyForward = 939.68,
            bondDirtyStrike = 1008.33,
            r = 0.1,
            sigma = 0.09;
        const res = gauss.irBlack76(bondDirtyForward, bondDirtyStrike, T, sigma, r);
        assertEqualRounded(res.call.price, 7.968, 3);
    });

    it('should match (adapted) example from Hull, example 28.1', function() {
        const optionMaturity = 10 / 12,
            expectedCouponBeforeOptionNpv = 95.45,
            bondDirtyPrice = 960,
            bondDirtyForwardPrice = 939.68,
            rates = [
                {t: 3/12, rate: 0.09},
                {t: 9/12, rate: 0.095},
                {t: 10/12, rate: 0.10},
            ],
            bond = new gauss.Bond(1000, 0.1, -0.25, 9.75, gauss.irFrequency.semiannually),
            forwardVolatility = 0.09,
            strike1 = 1000,
            expectedOptionPremium1 = 9.49;
        // we want to calculate the forward in an alternative way for which we need a complete discount curve
        // first step is to *determine the implied rate*, s.t. the given dirty price is matched without breaking
        // the values of the given two coupons at 3m and 9m
        const helperCurve = gauss.irSpotCurve2DiscountCurve(gauss.irLinearInterpolationSpotCurve(rates));
        const couponsBeforeOption = bond.cashflows.filter(cf => cf.t < optionMaturity);
        assert.deepStrictEqual(couponsBeforeOption, [{t: 0.25, value: 50}, {t: 0.75, value: 50}]);
        const couponBeforeOptionNpv = gauss.irForwardPrice(couponsBeforeOption, helperCurve, 0);
        assertEqualRounded(couponBeforeOptionNpv, expectedCouponBeforeOptionNpv, 2);
        const helperBond = Object.assign({ __proto__: bond.__proto__ }, bond);
        helperBond.start = 0.75;
        const helperBondDirtyPrice = bondDirtyPrice - couponBeforeOptionNpv;
        const impliedRate = helperBond.yieldToMaturity(helperBondDirtyPrice); // this is the result of step one
        const impliedSpotCurve = gauss.irLinearInterpolationSpotCurve([...rates, {t: helperBond.cashflows[0].t, rate: impliedRate}]);
        const impliedCurve = gauss.irSpotCurve2DiscountCurve(impliedSpotCurve);
        assertEqualRounded(bond.dirtyPrice(impliedCurve), bondDirtyPrice, 0); // dirty price matches
        assertEqualRounded(gauss.irForwardPrice(couponsBeforeOption, impliedCurve, 0), expectedCouponBeforeOptionNpv, 0); // coupons before option match
        assertEqualRounded(bond.forwardDirtyPrice(impliedCurve, optionMaturity), bondDirtyForwardPrice, 2); // forward price matches
        // second step is to evaluate the option
        const result = gauss.irBlack76BondOption(bond, strike1, optionMaturity, forwardVolatility, impliedSpotCurve);
        assertEqualRounded(result.call.price, expectedOptionPremium1, 2);
    });
});

describe('irBlack76CapletFloorlet', function() {
    it('should match caplet example from Hull 28.3', function() {
        const volatility = 0.2,
            discCurve = gauss.irFlatDiscountCurve(0.069394),
            notional = 10000,
            libor = {t: 1, T: 1.25, notional: notional},
            strike = 0.08,
            res = gauss.irBlack76CapletFloorlet(libor, strike, volatility, gauss.irDiscountCurve2SpotCurve(discCurve));
        console.log();
        assertEqualRounded(res.d1, -0.5677, 4);
        assertEqualRounded(res.d2, -0.7677, 4);
        assertEqualRounded(res.call.price * (libor.T - libor.t) * notional * discCurve(libor.T) / discCurve(libor.t), 5.162, 2); // rounding in source
    });

    it('should match cap / floor example from https://financetrainingcourse.com/education/2010/06/online-finance-interest-rate-options-pricing-caps-floors/', function() {
        const discreteCurve = [
                {t: 0.59, rate: 0.12150},
                {t: 1.59, rate: 0.12225},
                {t: 2.59, rate: 0.12349},
                {t: 3.59, rate: 0.12418}
            ],
            spotCurve = gauss.irLinearInterpolationSpotCurve(discreteCurve.map(rt => ({t: rt.t, rate: Math.log(1 + rt.rate)}))),
            notional = 100000,
            strike = 0.1250,
            volatility = 0.0313,
            libors = [
                {t: -0.41, T: 0.59, notional: notional},
                {t: 0.59, T: 1.59, notional: notional},
                {t: 1.59, T: 2.59, notional: notional},
                {t: 2.59, T: 3.59, notional: notional}
            ],
            options = libors.map(libor => gauss.irBlack76CapletFloorlet(libor, strike, volatility, spotCurve)),
            targetCaplets = [
                0,
                31.02,
                178.77,
                198.53,
            ],
            targetFloorlets = [
                192.7,
                223.14,
                117.12,
                136.26,
            ];
        for (let i=0; i<targetCaplets.length; i++) {
            const fdf = Math.exp(spotCurve(libors[i].t)*libors[i].t-spotCurve(libors[i].T)*libors[i].T);
            console.log(options[i].call.price * notional * fdf, targetCaplets[i]);
            console.log(options[i].put.price * notional * fdf, targetFloorlets[i]);
            //assertEqualRounded(options[i].call.price, targetValues[i], 2);
        }
    });
});

describe('irForwardPrice', function() {
    const rate = 0.05;
    const flatDiscCurve = gauss.irFlatDiscountCurve(rate);
    const cf = {
        t: 1.0,
        value: 123.45
    };
    
    it('empty cashflows should have a forward price of 0', function() {
        assert.strictEqual(gauss.irForwardPrice([], flatDiscCurve, 0), 0);
    });

    it('already paid cashflows should have a forward price of 0', function() {
        assert.strictEqual(gauss.irForwardPrice([cf], flatDiscCurve, 1.00001), 0);
    });

    it('forward price at time 0 should be equal to spot', function() {
        assert.strictEqual(gauss.irForwardPrice([cf], flatDiscCurve, 0), flatDiscCurve(cf.t) * cf.value);
    });

    it('forward price at cashflow time should be equal to notional', function() {
        assertEqualRounded(gauss.irForwardPrice([cf], flatDiscCurve, cf.t), cf.value, 13);
    });

    it('should match example from wikipedia at https://en.wikipedia.org/wiki/Internal_rate_of_return', function() {
        const cashflows = [
                {t: 0, value: -123400},
                {t: 1, value: 36200},
                {t: 2, value: 54800},
                {t: 3, value: 48100},
            ],
            rate = Math.log(1 + 0.0596), // discrete compounding in source
            rateRoundedUp = Math.log(1 + 0.0597),
            flatDiscCurve = gauss.irFlatDiscountCurve(rate),
            flatDiscCurveRoundedUp = gauss.irFlatDiscountCurve(rateRoundedUp);
        assertEqualRounded(gauss.irForwardPrice(cashflows, flatDiscCurve, 0), 3.91, 2);
        assert(gauss.irForwardPrice(cashflows, flatDiscCurveRoundedUp, 0) < 0); // true IRR is in rounding interval
    });

    it('floater should be par', function() {
        const notional = 100,
            cashflows = [
                {t: 0, T: 1, notional: notional},
                {t: 1, T: 2, notional: notional},
                {t: 2, T: 3, notional: notional},
                {t: 3, T: 4, notional: notional},
                {t: 4, T: 5, notional: notional},
                {t: 5, value: notional}
            ];
        for (var rate = 0.0; rate <= 0.1; rate += 0.01) {
            const curve = gauss.irFlatDiscountCurve(rate);
            assertEqualRounded(gauss.irForwardPrice(cashflows, curve, 0), notional, 12);
        }
        const curve = gauss.irSpotCurve2DiscountCurve(gauss.irLinearInterpolationSpotCurve([
            {t: 1/12, rate: 0.01},
            {t: 2/12, rate: 0.015},
            {t: 3/12, rate: 0.02},
            {t: 6/12, rate: 0.025},
            {t: 1, rate: 0.04},
            {t: 2, rate: 0.045},
            {t: 5, rate: 0.05},
        ]));
        assertEqualRounded(gauss.irForwardPrice(cashflows, curve, 0), notional, 12);
    });
});

describe('irFlatDiscountCurve', function() {
    it('should fail on bad parameter types', function() {
        assert.throws(() => gauss.irFlatDiscountCurve('0.1'));
        assert.throws(() => gauss.irFlatDiscountCurve());
        const curve = gauss.irFlatDiscountCurve(0.1);
        assert.throws(() => curve('0.1'));
        assert.throws(() => curve());
    });
});

describe('curve conversions', function() {
    const rates = [
            {t: 1/12, rate: 0.01},
            {t: 2/12, rate: 0.015},
            {t: 3/12, rate: 0.02},
            {t: 6/12, rate: 0.025},
            {t: 1, rate: 0.04},
            {t: 2, rate: 0.045},
            {t: 5, rate: 0.05},
        ],
        curve = gauss.irLinearInterpolationSpotCurve(rates);

    it('should properly invert', function() {
        const transformedCurve = gauss.irDiscountCurve2SpotCurve(gauss.irSpotCurve2DiscountCurve(curve));
        for (let t = 0; t < 30; t += 0.2) {
            assertEqualRounded(transformedCurve(t), curve(t), 8);
        }
    });

    it('should fail on bad parameter types', function() {
        assert.throws(() => gauss.irDiscountCurve2SpotCurve());
        const spotCurve = gauss.irDiscountCurve2SpotCurve(gauss.irSpotCurve2DiscountCurve(curve));
        assert.throws(() => spotCurve('0.1'));
        assert.throws(() => spotCurve());
        assert.throws(() => gauss.irSpotCurve2DiscountCurve());
        const discCurve = gauss.irSpotCurve2DiscountCurve(curve);
        assert.throws(() => discCurve('0.1'));
        assert.throws(() => discCurve());
    });
});

describe('irInternalRateOfReturn', function() {
    it('should throw on equal initial guesses', function() {
        assert.throws(() => gauss.irInternalRateOfReturn([], 0.123, 0.123));
    });

    it('should throw on single cashflow', function() {
        assert.throws(() => gauss.irInternalRateOfReturn([{t: 0, value: 1}]));
    });

    it('should throw on only positive cashflows', function() {
        assert.throws(() => gauss.irInternalRateOfReturn([{t: 0, value: 1}, {t: 1, value: 1}]));
    });

    it('should match zero rate', function() {
        const notional = 100;
        for (let t = 1; t < 5; t++) {
            for (let zeroBondPrice = 10; zeroBondPrice < 150; zeroBondPrice += 3) {
                const zeroRate = Math.log(notional / zeroBondPrice) / t,
                    cashflows = [{t: 0, value: -zeroBondPrice}, {t: t, value: notional}];
                assertEqualRounded(gauss.irInternalRateOfReturn(cashflows), zeroRate, 4);
            }
        }
    });

    it('should match example from wikipedia at https://en.wikipedia.org/wiki/Internal_rate_of_return', function() {
        const cashflows = [
                {t: 0, value: -123400},
                {t: 1, value: 36200},
                {t: 2, value: 54800},
                {t: 3, value: 48100},
            ],
            expectedRate = Math.log(1 + 0.0596); // discrete compounding in source
        assertEqualRounded(gauss.irInternalRateOfReturn(cashflows), expectedRate, 4);
    });

    it('should match example from https://corporatefinanceinstitute.com/resources/knowledge/finance/internal-rate-return-irr/', function() {
        const cashflows = [
                {t: 0, value: -500000},
                {t: 1, value: 160000},
                {t: 2, value: 160000},
                {t: 3, value: 160000},
                {t: 4, value: 160000},
                {t: 5, value: 50000}
            ],
            expectedRate = Math.log(1 + 0.13); // discrete compounding in source
        assertEqualRounded(gauss.irInternalRateOfReturn(cashflows), expectedRate, 2);
    });

    it('should fail on bad parameter types', function() {
        assert.throws(() => gauss.irInternalRateOfReturn());
        assert.throws(() => gauss.irInternalRateOfReturn([]));
        assert.throws(() => gauss.irInternalRateOfReturn([{t: 1, value: 1}], '0'));
        assert.throws(() => gauss.irInternalRateOfReturn([{t: 1, value: 1}], 0, '1'));
        assert.throws(() => gauss.irInternalRateOfReturn([{t: 1, value: 1}], 0, 1, '1'));
        assert.throws(() => gauss.irInternalRateOfReturn([{t: 1, value: 1}], 0, 1, 1, '1'));
    });
});

describe('irRollFromEnd', function() {
    it('should give natural numbers when rolling full years', function() {
        const schedule = gauss.irRollFromEnd(5, 11, 1);
        assert.deepStrictEqual(schedule, [6, 7, 8, 9, 10, 11]);
    });

    it('should work with fraction frequencies', function() {
        const schedule = gauss.irRollFromEnd(5, 11, 0.5);
        assert.deepStrictEqual(schedule, [7, 9, 11]);
        const schedule2 = gauss.irRollFromEnd(5, 11, 1/3);
        assert.deepStrictEqual(schedule2, [8, 11]);
    });

    it('should always have # frequency dates', function() {
        for (let start = 0.1; start < 1e10; start *= 11) {
            for (let frequency in gauss.irFrequency) {
                const schedule = gauss.irRollFromEnd(start, start + 1, gauss.irFrequency[frequency]);
                assert.strictEqual(schedule.length, gauss.irFrequency[frequency],
                    `failing at start ${start} with frequency "${frequency}", schedule = ${schedule}`);

            }
        }
    });

    it('should not have periods below irMinimumPeriod length', function() {
        for (let start = 0.1; start < 1e5; start *= 111) {
            for (let frequency in gauss.irFrequency) {
                for (let fractionalPeriod of [0, 0.0001, 0.001, 0.01, 0.1, 1/3]) {
                    const period = 1 + fractionalPeriod;
                    const schedule = gauss.irRollFromEnd(start, start + period, gauss.irFrequency[frequency]);
                    let tLast = start;
                    for (let t of schedule) {
                        const dt = t - tLast;
                        assert(dt >= gauss.irMinimumPeriod, `failing at start ${start}, period ${period} with frequency "${frequency}", period length ${dt} < ${gauss.irMinimumPeriod}`);
                    }
                }
            }
        }
    });

    it('should fail on bad parameter types', function() {
        assert.throws(() => gauss.irRollFromEnd('1', 2, gauss.irFrequency.annually));
        assert.throws(() => gauss.irRollFromEnd(1, '2', gauss.irFrequency.annually));
        assert.throws(() => gauss.irRollFromEnd(1, 2, 'annually'));
    });

    it('should fail on start >= end', function() {
        assert.throws(() => gauss.irRollFromEnd(1, 1, gauss.irFrequency.annually));
    });

    it('should fail on negative frequency', function() {
        assert.throws(() => gauss.irRollFromEnd(1, 2, -1));
    });

    it('should fail on frequencies too large', function() {
        assert.throws(() => gauss.irRollFromEnd(1, 2, 2000));
    });
});

describe('irLinearInterpolationSpotCurve', function() {
    const rates = [
            {t: 1/12, rate: 0.01},
            {t: 2/12, rate: 0.015},
            {t: 3/12, rate: 0.02},
            {t: 6/12, rate: 0.025},
            {t: 1, rate: 0.04},
            {t: 2, rate: 0.045},
            {t: 5, rate: 0.05},
        ],
        curve = gauss.irLinearInterpolationSpotCurve(rates);

    it('should match control points', function() {
        for (let rate of rates) {
            assert.strictEqual(curve(rate.t), rate.rate);
        }
    });

    it('should be in the middle inbetween', function() {
        for (let i=1; i<rates.length; i++) {
            for (let alpha = 0; alpha <= 1; alpha += 0.1) {
                const t = rates[i-1].t + alpha * (rates[i].t - rates[i-1].t);
                assert(curve(t) >= Math.min(rates[i].rate, rates[i-1].rate));
                assert(curve(t) <= Math.max(rates[i].rate, rates[i-1].rate));
            }
        }
    });

    it('should extrapolate constantly', function() {
        assert.strictEqual(curve(0.0001), rates[0].rate);
        assert.strictEqual(curve(0.001), rates[0].rate);
        assert.strictEqual(curve(0.01), rates[0].rate);
        assert.strictEqual(curve(6), rates[rates.length-1].rate);
        assert.strictEqual(curve(7), rates[rates.length-1].rate);
        assert.strictEqual(curve(10), rates[rates.length-1].rate);
        assert.strictEqual(curve(100), rates[rates.length-1].rate);
    });

    it('should not modify passed argument', function() {
        const rates = [{t: 1, rate: 0.123}, {t: 0, rate: 0.123}]; // *not* sorted by t
        gauss.irLinearInterpolationSpotCurve(rates);
        assert.strictEqual(rates[0].t, 1);
        assert.strictEqual(rates[1].t, 0);
    });

    it('should fail with bad parameters', function() {
        assert.throws(() => curve('0.1'));
        assert.throws(() => curve());
        assert.throws(() => gauss.irLinearInterpolationSpotCurve());
        assert.throws(() => gauss.irLinearInterpolationSpotCurve([]));
    });
});

describe('Bond', function() {
    const bond1 = new gauss.Bond(100, 0.04, 0, 5, gauss.irFrequency.annually),
        bond2 = new gauss.Bond(100, 0.04, 0, 1, gauss.irFrequency.quarterly),
        bond3 = new gauss.Bond(100, 0.04, 3, 4, gauss.irFrequency.quarterly),
        zeroBond = new gauss.Bond(100, 0, 0, 5, gauss.irFrequency.annually),
        curve0 = gauss.irFlatDiscountCurve(0.0),
        curve1 = gauss.irFlatDiscountCurve(0.02),
        curve2 = gauss.irFlatDiscountCurve(0.05),
        curve3 = gauss.irFlatDiscountCurve(0.1),
        curve4 = gauss.irFlatDiscountCurve(-0.03),
        bonds = [bond1, bond2, bond3],
        curves = [curve0, curve1, curve2, curve3, curve4];
    
    it('should fail with bad parameters', function() {
        assert.throws(() => new gauss.Bond('100', 0.04, 0, 1.5, gauss.irFrequency.annually));
        assert.throws(() => new gauss.Bond(100, '0.04', 0, 1.5, gauss.irFrequency.annually));
        assert.throws(() => new gauss.Bond(100, 0.04, '0', 1.5, gauss.irFrequency.annually));
        assert.throws(() => new gauss.Bond(100, 0.04, 0, '1.5', gauss.irFrequency.annually));
        assert.throws(() => new gauss.Bond(100, 0.04, 0, 1.5, 'annually'));
        assert.throws(() => new gauss.Bond(100, 0.04, 0, 1.5, 0));
        assert.throws(() => new gauss.Bond(100, 0.04, 0, 1.5, -1));
        assert.throws(() => new gauss.Bond(100, 0.04, 0, 1.5, 1 / gauss.irMinimumPeriod + 1));
        assert.throws(() => new gauss.Bond());

        assert.throws(() => bond1.yieldToMaturity('100'));
    });
    
    it('should have some expected example cashflows', function() {
        assert.deepStrictEqual(bond1.cashflows, 
            [{t: 1, value: 4}, {t: 2, value: 4}, {t: 3, value: 4},
                {t: 4, value: 4}, {t: 5, value: 4}, {t: 5, value: 100}]);
        assert.deepStrictEqual(bond2.cashflows, 
            [{t: 0.25, value: 1}, {t: 0.5, value: 1}, {t: 0.75, value: 1},
                {t: 1, value: 1}, {t: 1, value: 100}]);
        assert.deepStrictEqual(bond3.cashflows, 
            [{t: 3.25, value: 1}, {t: 3.5, value: 1}, {t: 3.75, value: 1},
                {t: 4, value: 1}, {t: 4, value: 100}]);
    });

    it('should handle fractional periods at the beginning', function() {
        const bondWithFractionalPeriod = new gauss.Bond(100, 0.04, 0, 1.5, gauss.irFrequency.annually);
        assert.deepStrictEqual(bondWithFractionalPeriod.cashflows,
            [{t: 0.5, value: 2}, {t: 1.5, value: 4}, {t: 1.5, value: 100}]);
    });

    it('should have forward price notional + last coupon payment at maturity', function() {
        for (const bond of bonds) {
            for (const curve of curves) {
                const expected = bond.notional * (1 + bond.coupon / bond.frequency);
                assertEqualRounded(bond.forwardDirtyPrice(curve, bond.end), expected, 13);
            }
        }
    });

    it('should have value 100% when discounting with par yield', function() {
        for (const bond of bonds) {
            const curve = gauss.irFlatDiscountCurve(bond.yieldToMaturity());
            assertEqualRounded(bond.dirtyPrice(curve), bond.notional, 7);
        }
    });

    it('should have price == sum of cashflows if interest rate is 0', function() {
        for (const bond of bonds) {
            const expected = bond.cashflows.map(cf => cf.value).reduce((x, y) => x + y, 0);
            assert.strictEqual(bond.dirtyPrice(curve0), expected);
        }
    });

    it('should match zero rate', function() {
        const notional = 100;
        for (let t = 1; t < 5; t++) {
            for (let zeroRate = -0.05; zeroRate < 0.1; zeroRate += 0.001) {
                const curve = gauss.irFlatDiscountCurve(zeroRate),
                    bond = new gauss.Bond(notional, 0, 0, t, gauss.irFrequency.annually);
                assertEqualRounded(bond.yieldToMaturity(bond.dirtyPrice(curve)), zeroRate, 4);
            }
        }
    });

    it('should have no coupons for zero bonds', function() {
        assert.strictEqual(zeroBond.cashflows.length, 1);
        assert.strictEqual(zeroBond.cashflows[0].t, zeroBond.end);
        assert.strictEqual(zeroBond.cashflows[0].value, zeroBond.notional);
    });

    it('duration should match example from Wikipedia https://en.wikipedia.org/wiki/Bond_duration Fig. 1', function() {
        const bond = new gauss.Bond(100, 0.2, 0, 2, gauss.irFrequency.semiannually),
            bondYield = 0.039605,
            npv = bond.dirtyPrice(gauss.irFlatDiscountCurve(bondYield));
        assertEqualRounded(bond.yieldToMaturity(npv), bondYield, 6);
        assertEqualRounded(bond.duration(npv), 1.78, 2);
    });

    it('duration should match second example from Wikipedia https://en.wikipedia.org/wiki/Bond_duration', function() {
        const bond = new gauss.Bond(100, 0.05, 0, 10, gauss.irFrequency.semiannually),
            bondYield = 0.05,
            npv = bond.dirtyPrice(gauss.irFlatDiscountCurve(bondYield));
        assertEqualRounded(npv, 100, 0); // Wikipedia results seem somewhat inconsistent
        assertEqualRounded(bond.yieldToMaturity(npv), bondYield, 6);
        assertEqualRounded(bond.duration(npv), 7.99, 1); // Wikipedia results seem somewhat inconsistent
        assertEqualRounded(bond.duration(), 7.99, 2);
    });

    it('zero coupon bond should have duration == maturity', function() {
        for (const npv of [10, 20, 50, 80, 100, 120, 150]) {
            assertEqualRounded(zeroBond.duration(npv), zeroBond.end, 8);
        }
    });

    it('duration should be positive and less than maturity', function() {
        for (const bond of bonds) {
            for (const npv of [10, 20, 50, 80, 100, 120, 150]) {
                const duration = bond.duration(npv);
                assert.ok(duration > 0);
                assert.ok(duration < bond.end);
            }
        }
    });

    it('numerically differentiating bond price by yield should match with duration', function() {
        for (const bond of bonds) {
            for (const npv of [10, 20, 50, 80, 100, 120, 150]) {
                const y0 = bond.yieldToMaturity(npv),
                    fnpv = function(y) {
                        const curve = gauss.irFlatDiscountCurve(y);
                        return bond.dirtyPrice(curve);
                    };
                assertEqualRounded(fnpv(y0), npv, 7);
                assertEqualRounded(bond.duration(npv), -diffquot(fnpv, y0)/npv, 7);
            }
        }
    });
});