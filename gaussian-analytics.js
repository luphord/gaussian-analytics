const stdnormalNormalizingConstant = 1 / Math.sqrt(2 * Math.PI);

/**
 * Probability density function (pdf) for a standard normal distribution.
 * 
 * @param {number} x value for which the density is to be calculated
 * @returns density of standard normal distribution
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
 * @returns cumulative distribution of standard normal distribution
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
    let t = 1 / (1 + p*x);
    return intercept + slope * pdf(x) * (b1*t + b2*t**2 + b3*t**3 + b4*t**4 + b5*t**5);
}
