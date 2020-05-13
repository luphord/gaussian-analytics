const stdnormalNormalizingConstant = 1 / Math.sqrt(2 * Math.PI);

/**
 * Probability density function (pdf) for a standard normal distribution.
 * 
 * @param {number} x value for which the density is to be calculated
 * @returns {number} density of standard normal distribution
 */
export function pdf(x) {
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

/**
 * @typedef {Object} PricingResult
 * @property {number} price price of the derivative
 * @property {number} N_d1 cumulative probability of `d1`
 * @property {number} N_d2 cumulative probability of `d2`
 * @property {number} d1
 * @property {number} d2
 * @property {number} sigma pricing volatility
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
 * @returns {PricingResult}
 */
export function margrabesFormula(S1, S2, T, sigma1, sigma2, rho, q1, q2) {
    const sigma = Math.sqrt(sigma1**2 + sigma2**2 - 2*sigma1*sigma2*rho);
    return margrabesFormulaShort(S1, S2, T, sigma, q1, q2);
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
 * @returns {PricingResult}
 */
export function margrabesFormulaShort(S1, S2, T, sigma, q1, q2) {
    const sigmaSqrtT = sigma * Math.sqrt(T);
    const d1 = (Math.log(S1 / S2) + (q2 - q1 + sigma**2/2)*T) / sigmaSqrtT;
    const d2 = d1 - sigmaSqrtT;
    const N_d1 = cdf(d1);
    const N_d2 = cdf(d2);
    const price = discountFactor(q1, T)*S1*N_d1 - discountFactor(q2, T)*S2*N_d2;
    return {
        price: price,
        N_d1: N_d1,
        N_d2: N_d2,
        d1: d1,
        d2: d2,
        sigma: sigma
    };
}

/**
 * Black-Scholes formula for a European call option on a stock (asset class equity).
 * 
 * @param {number} S spot value of the stock
 * @param {number} K strike price of the option
 * @param {number} T time to maturity (typically expressed in years)
 * @param {number} sigma volatility of the underlying stock
 * @param {number} r risk-less rate of return
 * @returns {PricingResult}
 */
export function eqBlackScholesCall(S, K, T, sigma, r) {
    return margrabesFormulaShort(S, K, T, sigma, 0, r);
}

/**
 * Black-Scholes formula for a European put option on a stock (asset class equity).
 * 
 * @param {number} S spot value of the stock
 * @param {number} K strike price of the option
 * @param {number} T time to maturity (typically expressed in years)
 * @param {number} sigma volatility of the underlying stock
 * @param {number} r risk-less rate of return
 * @returns {PricingResult}
 */
export function eqBlackScholesPut(S, K, T, sigma, r) {
    return margrabesFormulaShort(K, S, T, sigma, r, 0);
}