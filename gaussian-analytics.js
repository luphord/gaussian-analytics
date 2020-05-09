const stdnormalNormalizingConstant = 1 / Math.sqrt(2 * Math.PI);

/**
 * Probability density function (pdf) for a standard normal distribution.
 * 
 * @param {number} x
 */
export function pdf(x) {
    return stdnormalNormalizingConstant * Math.exp(-0.5*x**2);
}