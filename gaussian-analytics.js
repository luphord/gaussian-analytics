const stdnormalNormalizingConstant = 1 / Math.sqrt(2 * Math.PI);

/**
 * Probability density function (pdf) for a standard normal distribution.
 * 
 * @param {number} x value for which the density is to be calculated
 * @returns {number} density of standard normal distribution
 */
export function pdf(x) {
    assertNumber(x, 'x');
    return stdnormalNormalizingConstant * Math.exp(-0.5*x**2);
}

const p = 0.2316419,
    b1 = 0.319381530,
    b2 = -0.356563782,
    b3 = 1.781477937,
    b4 = -1.821255978,
    b5 = 1.330274429;

/**
 * Cumulative distribution function (cdf) for a standard normal distribution.
 * Approximation by Zelen, Marvin and Severo, Norman C. (1964),
 * [formula 26.2.17](http://people.math.sfu.ca/~cbm/aands/page_932.htm).
 * 
 * @param {number} x value for which the cumulative distribution is to be calculated
 * @returns {number} cumulative distribution of standard normal distribution
 */
export function cdf(x) {
    assertNumber(x, 'x');
    if (x === 0) {
        return 0.5;
    }
    let intercept = 1,
        slope = -1;
    if (x <= 0) {
        x = -x;
        intercept = 0;
        slope = 1;
    }
    const t = 1 / (1 + p*x);
    return intercept + slope * pdf(x) * (b1*t + b2*t**2 + b3*t**3 + b4*t**4 + b5*t**5);
}

function discountFactor(r, t) {
    return Math.exp(-r*t);
}

function assertDefined(value, name) {
    if (typeof value === 'undefined') {
        throw `${name} must be given, got undefined`;
    }
}

function assertNonEmptyArray(value, name) {
    if (!Array.isArray(value)) {
        throw `${name} must be a array`;
    }
    if (value.length < 1) {
        throw `${name} must contain at least one element, got zero`;
    }
}

function assertNumber(value, name) {
    if (typeof value !== 'number') {
        throw `${name} must be a number`;
    }
}

function assertPositive(value, name) {
    assertNumber(value, name);
    if (value < 0) {
        throw `${name} must be greater or equal to 0; got ${value}`;
    }
}

function assertStrictlyPositive(value, name) {
    assertNumber(value, name);
    if (value <= 0) {
        throw `${name} must be greater than 0; got ${value}`;
    }
}

function assertFrequency(value, name) {
    assertStrictlyPositive(value, name);
    const maxFreq = 1 / irMinimumPeriod;
    if (value > maxFreq) {
        throw `${name} must be less than ${maxFreq}; got ${value}`;
    }
}

function assertCorrelation(value, name) {
    assertNumber(value, name);
    if (value < -1 || value > 1) {
        throw `${name} must be in interval [-1, 1]; got ${value}`;
    }
}

/**
 * @typedef {Object} PricingResult
 * @property {OptionPricingResult} call results for the call option
 * @property {OptionPricingResult} put results for the put optionCall
 * @property {OptionPricingResult} digitalCall results for digital call option
 * @property {OptionPricingResult} digitalPut results for digital put option
 * @property {number} N_d1 cumulative probability of `d1`
 * @property {number} N_d2 cumulative probability of `d2`
 * @property {number} d1
 * @property {number} d2
 * @property {number} sigma pricing volatility
 */

/**
 * @typedef {PricingResult} EqPricingResult
 * @property {OptionPricingResult} digitalCall results for digital (a.k.a. binary) call option
 * @property {OptionPricingResult} digitalPut results for digital (a.k.a. binary) put option
 */

/**
 * @typedef {Object} OptionPricingResult
 * @property {number} price price of the option
 * @property {number} delta delta, i.e. derivative by (first) underlying of the option
 * @property {number} gamma gamma, i.e. second derivative by (first) underlying of the option
 */

/**
 * @callback DiscountCurve
 * @param {number} t time (typically expressed in years)
 * @returns {number} discount factor at time t
 */

/**
 * @callback SpotCurve
 * @param {number} t time (typically expressed in years)
 * @returns {number} spot interest rate to time t
 */

/**
  * @typedef {Object} SpotRate
  * @property {number} t time (typically expressed in years)
  * @property {number} rate spot rate to time {@link t}
  */

/**
  * @typedef {Object} FixedCashflow
  * @property {number} t time (typically expressed in years)
  * @property {number} value cash amount paid at t
  */


/**
  * @typedef {Object} FloatingCashflow
  * @property {number} t fixing time
  * @property {number} T payment time, yearfraction is T - t
  * @property {number} notional notional amount that the rate fixed at will refer to
  */

/**
  * @typedef {FixedCashflow | FloatingCashflow} Cashflow
  */

/**
 * Margrabe's formula for pricing the exchange option between two risky assets.
 * 
 * See William  Margrabe, [The Value of an Option to Exchange One Asset for Another](http://www.stat.nus.edu.sg/~stalimtw/MFE5010/PDF/margrabe1978.pdf),
 * Journal of Finance, Vol. 33, No. 1, (March 1978), pp. 177-186.
 * 
 * @param {number} S1 spot value of the first asset
 * @param {number} S2 spot value of the second asset
 * @param {number} T time to maturity (typically expressed in years)
 * @param {number} sigma1 volatility of the first asset
 * @param {number} sigma2 volatility of the second asset
 * @param {number} rho correlation of the Brownian motions driving the asset prices
 * @param {number} q1 dividend yield of the first asset
 * @param {number} q2 dividend yield of the second asset
 * @param {number} [scale=1.0] scaling of all money amount and sensitivity results; think "number of options", but with fractional parts allowed
 * @returns {PricingResult}
 */
export function margrabesFormula(S1, S2, T, sigma1, sigma2, rho, q1, q2, scale) {
    assertPositive(sigma1, 'sigma1');
    assertPositive(sigma2, 'sigma2');
    assertCorrelation(rho, 'rho');
    const sigma = Math.sqrt(sigma1**2 + sigma2**2 - 2*sigma1*sigma2*rho);
    return margrabesFormulaShort(S1, S2, T, sigma, q1, q2, scale);
}

/**
 * Margrabe's formula for pricing the exchange option between two risky assets.
 * Equivalent to `margrabesFormula` but accepting only the volatility corresponding
 * to the ratio `S1/S2` instead of their individual volatilities.
 * @see margrabesFormula
 * 
 * @param {number} S1 spot value of the first asset
 * @param {number} S2 spot value of the second asset
 * @param {number} T time to maturity (typically expressed in years)
 * @param {number} sigma volatility of the ratio of both assets
 * @param {number} q1 dividend yield of the first asset
 * @param {number} q2 dividend yield of the second asset
 * @param {number} [scale=1.0] scaling of all money amount and sensitivity results; think "number of options", but with fractional parts allowed
 * @returns {PricingResult}
 */
export function margrabesFormulaShort(S1, S2, T, sigma, q1, q2, scale) {
    assertPositive(S1, 'S1');
    assertPositive(S2, 'S2');
    assertPositive(T, 'T');
    assertPositive(sigma, 'sigma');
    assertNumber(q1, 'q1');
    assertNumber(q2, 'q2');
    if (typeof scale === 'undefined') {
        scale = 1.0;
    }
    assertNumber(scale);
    const sigmaSqrtT = sigma * Math.sqrt(T);
    const callLogSimpleMoneyness = Math.log(S1 / S2) + (q2 - q1 + sigma**2/2)*T;
    const isMoneynessEdgeCase = callLogSimpleMoneyness === 0 &&  sigmaSqrtT === 0;
    const d1 = isMoneynessEdgeCase ? Infinity : callLogSimpleMoneyness / sigmaSqrtT;
    const d2 = d1 - sigmaSqrtT;
    const N_d1 = cdf(d1);
    const N_d2 = cdf(d2);
    const df1 = discountFactor(q1, T);
    const df2 = discountFactor(q2, T);
    const asset1OrNothingCall = df1 * S1 * N_d1;
    const asset2OrNothingCall = df2 * S2 * N_d2;
    const asset1OrNothingPut = df1 * S1 * (1-N_d1);
    const asset2OrNothingPut = df2 * S2 * (1-N_d2);
    const call = {
        price: scale * (asset1OrNothingCall - asset2OrNothingCall),
        delta: scale * df1 * N_d1,
        gamma: scale * df1 * pdf(d1) / sigmaSqrtT / S1
    };
    const put = {
        price: scale * (asset2OrNothingPut - asset1OrNothingPut),
        delta: scale * df1 * (N_d1 - 1),
        gamma: call.gamma
    };
    return {
        call: call,
        put: put,
        N_d1: N_d1,
        N_d2: N_d2,
        d1: d1,
        d2: d2,
        sigma: sigma
    };
}

/**
 * Black-Scholes formula for a European vanilla option on a stock (asset class equity).
 * 
 * See Fischer Black and Myron Scholes, [The Pricing of Options and Corporate Liabilities](https://www.cs.princeton.edu/courses/archive/fall09/cos323/papers/black_scholes73.pdf),
 * The Journal of Political Economy, Vol. 81, No. 3 (May - June 1973), pp. 637-654.
 * 
 * @param {number} S spot value of the stock
 * @param {number} K strike price of the option
 * @param {number} T time to maturity (typically expressed in years)
 * @param {number} sigma volatility of the underlying stock
 * @param {number} q dividend rate of the underlying stock
 * @param {number} r risk-less rate of return
 * @param {number} [scale=1.0] scaling of all money amount and sensitivity results; think "number of options", but with fractional parts allowed
 * @returns {EqPricingResult}
 */
export function eqBlackScholes(S, K, T, sigma, q, r, scale) {
    if (typeof scale === 'undefined') {
        scale = 1.0;
    }
    assertNumber(scale);
    const res = margrabesFormulaShort(S, K, T, sigma, q, r, scale);
    const df = discountFactor(r, T);
    const sigmaSqrtT = sigma * Math.sqrt(T);
    const digitalCall = {
        price: scale * df * res.N_d2,
        delta: scale * df * pdf(res.d2) / sigmaSqrtT / S,
        gamma: -scale * df * res.d1 * pdf(res.d1) / S / K / (sigmaSqrtT**2)
    };
    const digitalPut = {
        price: scale * df * (1 - res.N_d2),
        delta: -digitalCall.delta,
        gamma: -digitalCall.gamma
    };
    return {
        call: res.call,
        put: res.put,
        digitalCall: digitalCall,
        digitalPut: digitalPut,
        N_d1: res.N_d1,
        N_d2: res.N_d2,
        d1: res.d1,
        d2: res.d2,
        sigma: res.sigma
    };
}

/**
 * Black-Scholes formula for a European vanilla currency option (asset class foreign exchange).
 * This is also known as the Garman–Kohlhagen model.
 * 
 * See Mark B. Garman and Steven W. Kohlhagen [Foreign currency option values](https://www.sciencedirect.com/science/article/pii/S0261560683800011),
 * Journal of International Money and Finance, Vol. 2, Issue 3 (1983), pp. 231-237.
 * 
 * @param {number} S spot value of the currency exchange rate; this has to be expressed in unit of domestic currency / unit of foreign currency
 * @param {number} K strike price of the option
 * @param {number} T time to maturity (typically expressed in years)
 * @param {number} sigma volatility of the currency exchange rate
 * @param {number} rFor risk-less rate of return in the foreign currency
 * @param {number} rDom risk-less rate of return in the domestic currency
 * @param {number} [scale=1.0] scaling of all money amount and sensitivity results; think "number of options", but with fractional parts allowed
 * @returns {PricingResult} prices in domestic currency
 */
export function fxBlackScholes(S, K, T, sigma, rFor, rDom, scale) {
    return margrabesFormulaShort(S, K, T, sigma, rFor, rDom, scale);
}

/**
 * Black-Scholes formula for European option on forward / future (asset class interest rates),
 * known as the Black 76 model.
 * 
 * See Fischer Black [The pricing of commodity contracts](https://www.sciencedirect.com/science/article/abs/pii/0304405X76900246),
 * Journal of Financial Economics, 3 (1976), 167-179.
 * 
 * @param {number} F forward price of the underlying
 * @param {number} K strike price of the option
 * @param {number} T time to maturity (typically expressed in years)
 * @param {number} sigma volatility of the underlying forward price
 * @param {number} r risk-less rate of return
 * @param {number} [scale=1.0] scaling of all money amount and sensitivity results; think "number of options", but with fractional parts allowed
 * @returns {PricingResult} prices of forward / future option
 */
export function irBlack76(F, K, T, sigma, r, scale) {
    return margrabesFormulaShort(discountFactor(r, T) * F, K, T, sigma, 0, r, scale);
}

/**
 * Black 76 model for an option on a coupon-paying bond (asset class interest rates).
 * 
 * @param {Bond} bond underlying bond of the option
 * @param {number} K (dirty) strike price of the option
 * @param {number} T time to maturity (typically expressed in years)
 * @param {number} sigma volatility of the bond forward price
 * @param {SpotCurve} spotCurve risk-less spot curve (used for forwards and discounting)
 * @returns {PricingResult} prices of bond options
 */
export function irBlack76BondOption(bond, K, T, sigma, spotCurve) {
    const bondForward = bond.forwardDirtyPrice(irSpotCurve2DiscountCurve(spotCurve), T);
    return irBlack76(bondForward, K, T, sigma, spotCurve(T));
}

/**
 * Black 76 model for a caplet / floorlet (asset class interest rates).
 * Notional is retrieved from floatingRate.notional.
 * 
 * @param {FloatingCashflow} floatingRate underlying floating rate of the option 
 * @param {number} K strike price of the option
 * @param {number} sigma volatility of the floating rate
 * @param {SpotCurve} spotCurve risk-less spot curve (used for forwards and discounting)
 * @returns {PricingResult} prices of caplet / floorlet
 */
export function irBlack76CapletFloorlet(floatingRate, K, sigma, spotCurve) {
    const discCurve = irSpotCurve2DiscountCurve(spotCurve),
        forwardRate = irForwardLinearRate(floatingRate, discCurve);
    if (floatingRate.t > 0) {
        const yearFraction = floatingRate.T - floatingRate.t,
            forwardDiscountFactor = discCurve(floatingRate.T) / discCurve(floatingRate.t),
            scale = floatingRate.notional * yearFraction * forwardDiscountFactor;
        return irBlack76(forwardRate, K, floatingRate.t, sigma, spotCurve(floatingRate.t), scale);
    } else {
        // ToDo: handle fixed rate
        return {
            call: {
                price: 0
            },
            put: {
                price: 0
            }
        };
    }
}

/**
 * Calculates the linear forward rate given a floating cashflow and a discount curve.
 * 
 * @param {FloatingCashflow} floatingRate floating rate (notional is ignored)
 * @param {DiscountCurve} discountCurve discount curve used for forwards
 */
function irForwardLinearRate(floatingRate, discountCurve) {
    return (discountCurve(floatingRate.t) / discountCurve(floatingRate.T) - 1) / (floatingRate.T - floatingRate.t);
}

/**
 * Calculates the forward price at time t for a series of cashflows.
 * Cashflows before t are ignored (i.e. do not add any value).
 * 
 * @param {Array<Cashflow>} cashflows future cashflows to be paid 
 * @param {DiscountCurve} discountCurve discount curve (used for discounting and forwards)
 * @param {number} t time point of the forward (typicall expressed in years)
 * @returns {number} forward price of given cashflows
 */
export function irForwardPrice(cashflows, discountCurve, t) {
    const df_t = discountCurve(t);
    let fw = 0.0;
    for (let i = 0; i < cashflows.length; i++) {
        const cf = cashflows[i];
        if (typeof cf.notional === 'number') { // FloatingCashflow
            if (cf.T >= t) {
                const df_T = discountCurve(cf.T),
                    forwardLinearRate = irForwardLinearRate(cf, discountCurve),
                    yearfraction = cf.T - cf.t;
                fw += cf.notional * forwardLinearRate * yearfraction * df_T / df_t;
            }

        } else { // FixedCashflow
            if (cf.t >= t) {
                fw += cf.value * discountCurve(cf.t) / df_t;
            }
        }
    }
    return fw;
}

/**
 * Frequencies expressed as number of payments per year.
 */
export const irFrequency = {
    annually: 1,
    semiannually: 2,
    triannually: 3,
    quarterly: 4,
    bimonthly: 6,
    monthly: 12,
    weekly: 52,
    businessdaily: 250,
    daily: 365
};

/**
 * Minimum period {@link irRollFromEnd} will create.
 */
export const irMinimumPeriod = 1 / 1000;

/**
 * Creates a payment schedule with payment frequency {@link frequency}
 * that has last payment at {@link end} and no payments before {@link start}.
 * First payment period is (possibly) shorter than later periods.
 * 
 * @param {number} start start time of schedule (usually expressed in years)
 * @param {number} end end time of schedule (usually expressed in years)
 * @param {number} frequency number of payments per time unit (usually per year)
 * @returns {Array<number>} payment times
 */
export function irRollFromEnd(start, end, frequency) {
    assertNumber(start, 'start');
    assertNumber(end, 'end');
    if (start + irMinimumPeriod >= end) {
        throw `start needs to be at least ${irMinimumPeriod} before end, got start=${start} and end=${end}`;
    }
    assertFrequency(frequency, 'frequency');
    const schedule = [],
        yearfraction = 1 / frequency,
        nPayments = Math.ceil(frequency * (end - start));
    let t = end;
    for (let i = 0; i < nPayments; i++) {
        if (t - start < irMinimumPeriod) {
            break;
        }
        schedule.unshift(t);
        t -= yearfraction;
    }
    return schedule;
}

/**
 * Creates a {@link DiscountCurve} discounting with the constant {@link flatRate}.
 * 
 * @param {number} flatRate 
 * @returns {DiscountCurve}
 */
export function irFlatDiscountCurve(flatRate) {
    assertNumber(flatRate, 'flatRate');
    return (t) => {
        assertNumber(t, 't');
        return Math.exp(-flatRate * t);
    };
}

/**
 * Creates a {@link SpotCurve} by linearly interpolating the given points in time.
 * Extrapolation in both directions is constant.
 * 
 * @param {Array<SpotRate>} spotRates individual spot rates used for interpolation; will be sorted automatically
 * @returns {SpotCurve}
 */
export function irLinearInterpolationSpotCurve(spotRates) {
    assertNonEmptyArray(spotRates, 'spotRates');
    spotRates = [...spotRates]; // do not modify non-local array
    spotRates.sort((rate1, rate2) => rate1.t - rate2.t);
    return (t) => {
        assertNumber(t, 't');
        if (t < spotRates[0].t) {
            return spotRates[0].rate;
        }
        for (let i = 1; i < spotRates.length; i++) {
            if (t < spotRates[i].t) {
                const slope = (spotRates[i].rate - spotRates[i-1].rate) / (spotRates[i].t - spotRates[i-1].t);
                return spotRates[i-1].rate + slope * (t - spotRates[i-1].t);
            }
        }
        return spotRates[spotRates.length - 1].rate;
    };
}


/**
 * Turns a {@link SpotCurve} into a {@link DiscountCurve}.
 * Inverse of {@link irDiscountCurve2SpotCurve}.
 * 
 * @param {SpotCurve} spotCurve spot rate curve to be converted
 * @returns {DiscountCurve}
 */
export function irSpotCurve2DiscountCurve(spotCurve) {
    assertDefined(spotCurve, 'spotCurve');
    return (t) => {
        assertNumber(t, 't');
        return Math.exp(-spotCurve(t) * t);
    };
}

const irDiscountCurveConversionTimeCutoff = 1e-8;

/**
 * Turns a {@link DiscountCurve} into a {@link SpotCurve}.
 * Inverse of {@link irSpotCurve2DiscountCurve}.
 * 
 * @param {DiscountCurve} discountCurve discount curve to be converted
 * @returns {SpotCurve}
 */
export function irDiscountCurve2SpotCurve(discountCurve) {
    assertDefined(discountCurve, 'discountCurve');
    return (t) => {
        assertNumber(t, 't');
        if (t >= 0 && t <= irDiscountCurveConversionTimeCutoff) {
            t = irDiscountCurveConversionTimeCutoff;
        }
        return -Math.log(discountCurve(t)) / t;
    };
}

/**
 * Calculates the internal rate of return (IRR) of the given series of cashflow,
 * i.e. the flat discount rate (continuously compounded) for which the total NPV of
 * the given cashflows is 0. The secant method is used. If not IRR can be found
 * after {@link maxiter} iteration, an exception is thrown.
 * 
 * @param {Array<FixedCashflow>} cashflows cashflows for which the IRR is to be calculated
 * @param {number} [r0=0] first guess for IRR
 * @param {number} [r1=0.05] second guess for IRR, may not be equal to {@link r0}
 * @param {number} [abstol=1e-8] absolute tolerance to accept the current rate as solution
 * @param {number} [maxiter=100] maximum number of secant method iteration after which root finding aborts
 * @returns {number} continuously compounded IRR
 */
export function irInternalRateOfReturn(cashflows, r0=0, r1=0.05, abstol=1e-8, maxiter=100) {
    assertNonEmptyArray(cashflows, 'cashflows');
    assertNumber(r0, 'r0');
    assertNumber(r1, 'r1');
    assertNumber(abstol, 'abstol');
    assertNumber(maxiter, 'maxiter');
    if (r0 === r1) {
        throw 'r0 and r1 initial IRR guesses have to be different';
    }
    const npv = (r) => irForwardPrice(cashflows, irFlatDiscountCurve(r), 0);
    let last = r0,
        current = r1,
        npv_last = npv(last);
    for (let i=0; i<=maxiter; i++) {
        const npv_current = npv(current);
        if (Math.abs(npv_current) <= abstol) {
            return current;
        }
        const next = current - npv_current * (current - last) / (npv_current - npv_last);
        last = current;
        npv_last = npv_current;
        current = next;
    }
    throw 'maximum number of iterations reached';
}

/**
 * Coupon-paying bond with schedule rolled from end.
 * First coupon period is (possibly) shorter than later periods.
 */
class Bond {
    /**
     * Creates an instance of a coupon-paying bond.
     * 
     * @param {number} notional notional payment, i.e. last cashflow and reference amount for {@link notional}
     * @param {number} coupon annual coupon relative to {@link notional} (i.e. 0.04 for 4%, not a currency amount)
     * @param {number} start start time of bond (schedule will be rolled from {@link end})
     * @param {number} end end time of bond (time of notional payment)
     * @param {number} frequency number of payments per year
     */
    constructor(notional, coupon, start, end, frequency) {
        assertNumber(notional, 'notional');
        assertNumber(coupon, 'coupon');
        assertNumber(start, 'start');
        assertNumber(end, 'end');
        assertFrequency(frequency, 'frequency');
        this.notional = notional;
        this.coupon = coupon;
        this.start = start;
        this.end = end;
        this.frequency = frequency;
    }

    /**
     * Cashflows of this bond as an array.
     * Last coupon and notional payment are returned separately.
     * For zero bonds (i.e. coupon === 0), only the notional payment is returned as cashflow.
     * 
     * @returns {Array<FixedCashflow>}
     */
    get cashflows() {
        const notionalCashflow = {t: this.end, value: this.notional};
        if (this.coupon === 0) {
            return [notionalCashflow];
        }
        const schedule = irRollFromEnd(this.start, this.end, this.frequency);
        const cashflows = [];
        let lastT = this.start;
        for (const t of schedule) {
            const yearfraction = t - lastT;
            cashflows.push({t: t, value: this.notional * this.coupon * yearfraction});
            lastT = t;
        }
        cashflows.push(notionalCashflow);
        return cashflows;
    }

    /**
     * Calculates the forward price (dirty, i.e. including accrued interest) at time {@link t} for this bond.
     * 
     * @param {DiscountCurve} discountCurve discount curve (used for discounting and forwards)
     * @param {number} t time for which the forward dirty price is to be calculated
     * @returns {number}
     */
    forwardDirtyPrice(discountCurve, t) {
        return irForwardPrice(this.cashflows, discountCurve, t);
    }

    /**
     * Calculates the current price (dirty, i.e. including accrued interest) for this bond.
     * 
     * @param {DiscountCurve} discountCurve discount curve (used for discounting and forwards)
     * @returns {number}
     */
    dirtyPrice(discountCurve) {
        return this.forwardDirtyPrice(discountCurve, 0);
    }

    /**
     * Calculates the bond yield given {@link npv}, i.e the flat discount rate
     * (continuously compounded) for which the dirty price of the bond equals {@link npv}.
     * 
     * @param {number} [npv=this.notional] present value of the bond for yield calculation, defaults to 100% (i.e. notional)
     * @returns {number} bond yield given npv
     */
    yieldToMaturity(npv) {
        if (typeof npv === 'undefined') {
            npv = this.notional;
        }
        assertNumber(npv);
        const cashflows = [...this.cashflows];
        cashflows.unshift({t: 0, value: -npv});
        return irInternalRateOfReturn(cashflows);
    }

    /**
     * Calculates the bond duration given npv. There is no difference between Macaulay duration
     * and Modified duration here as we use continuous yields for discounting.
     * 
     * @param {number} [npv=this.notional] present value of the bond for yield calculation, defaults to 100% (i.e. notional)
     * @returns {number} bond duration given npv
     */
    duration(npv) {
        if (typeof npv === 'undefined') {
            npv = this.notional;
        }
        const y = this.yieldToMaturity(npv);
        var time_weighted_cfs = 0;
        for (const cf of this.cashflows) {
            time_weighted_cfs += cf.t * cf.value * Math.exp(-y * cf.t);
        }
        return time_weighted_cfs / npv;
    }
}

export {Bond};
