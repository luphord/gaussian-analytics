# gaussian-analytics

[![npm version](http://img.shields.io/npm/v/gaussian-analytics.svg)](https://npmjs.org/package/gaussian-analytics "View gaussian-analytics on npm")
[![Build status](https://img.shields.io/travis/luphord/gaussian-analytics)](https://travis-ci.org/luphord/gaussian-analytics)

JavaScript library for analytical pricings of financial derivatives under (log)normal distribution assumptions.

## Usage

### Experiment in browser console

As `gaussian-analytics.js` is published as an [ES6 module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) you have to apply the following trick to play with it in your browser's dev console. First open the dev console (in Firefox press `F12`) and execute

```javascript
// dynamically import ES6 module and store it as global variable gauss
import('//unpkg.com/gaussian-analytics').then(m => window.gauss=m);
```

Afterwards, the global variable `gauss` will contain the module and you can run call exported functions on it, e.g.

```javascript
gauss.eqBlackScholes(100, 100, 1.0, 0.2, 0.0, 0.02);
/* ->
{
  call: {
    price: 8.916035060662303,
    delta: 0.5792596877744174,
    gamma: 0.019552134698772795
  },
  put: {
    price: 6.935902391337827,
    delta: -0.4207403122255826,
    gamma: 0.019552134698772795
  },
  digitalCall: {
    price: 0.49009933716779436,
    delta: 0.019552134698772795,
    gamma: -0.00019164976492052065
  },
  digitalPut: {
    price: 0.4900993361389609,
    delta: -0.019552134698772795,
    gamma: 0.00019164976492052065
  },
  N_d1: 0.5792596877744174,
  N_d2: 0.5000000005248086,
  d1: 0.20000000000000004,
  d2: 2.7755575615628914e-17,
  sigma: 0.2
}
 */
```

This should work at least for Firefox and Chrome.

## API Documentation

#### Functions

<dl>
<dt><a href="#pdf">pdf(x)</a> ⇒ <code>number</code></dt>
<dd><p>Probability density function (pdf) for a standard normal distribution.</p>
</dd>
<dt><a href="#cdf">cdf(x)</a> ⇒ <code>number</code></dt>
<dd><p>Cumulative distribution function (cdf) for a standard normal distribution.
Approximation by Zelen, Marvin and Severo, Norman C. (1964),
<a href="http://people.math.sfu.ca/~cbm/aands/page_932.htm">formula 26.2.17</a>.</p>
</dd>
<dt><a href="#margrabesFormula">margrabesFormula(S1, S2, T, sigma1, sigma2, rho, q1, q2)</a> ⇒ <code><a href="#PricingResult">PricingResult</a></code></dt>
<dd><p>Margrabe&#39;s formula for pricing the exchange option between two risky assets.</p>
<p>See William  Margrabe, <a href="http://www.stat.nus.edu.sg/~stalimtw/MFE5010/PDF/margrabe1978.pdf">The Value of an Option to Exchange One Asset for Another</a>,
Journal of Finance, Vol. 33, No. 1, (March 1978), pp. 177-186.</p>
</dd>
<dt><a href="#margrabesFormulaShort">margrabesFormulaShort(S1, S2, T, sigma, q1, q2)</a> ⇒ <code><a href="#PricingResult">PricingResult</a></code></dt>
<dd><p>Margrabe&#39;s formula for pricing the exchange option between two risky assets.
Equivalent to <code>margrabesFormula</code> but accepting only the volatility corresponding
to the ratio <code>S1/S2</code> instead of their individual volatilities.</p>
</dd>
<dt><a href="#eqBlackScholes">eqBlackScholes(S, K, T, sigma, q, r)</a> ⇒ <code><a href="#EqPricingResult">EqPricingResult</a></code></dt>
<dd><p>Black-Scholes formula for a European vanilla option on a stock (asset class equity).</p>
<p>See Fischer Black and Myron Scholes, <a href="https://www.cs.princeton.edu/courses/archive/fall09/cos323/papers/black_scholes73.pdf">The Pricing of Options and Corporate Liabilities</a>,
The Journal of Political Economy, Vol. 81, No. 3 (May - June 1973), pp. 637-654.</p>
</dd>
<dt><a href="#fxBlackScholes">fxBlackScholes(S, K, T, sigma, rFor, rDom)</a> ⇒ <code><a href="#PricingResult">PricingResult</a></code></dt>
<dd><p>Black-Scholes formula for a European vanilla currency option (asset class foreign exchange).
This is also known as the Garman–Kohlhagen model.</p>
<p>See Mark B. Garman and Steven W. Kohlhagen <a href="https://www.sciencedirect.com/science/article/pii/S0261560683800011">Foreign currency option values</a>,
Journal of International Money and Finance, Vol. 2, Issue 3 (1983), pp. 231-237.</p>
</dd>
</dl>

#### Typedefs

<dl>
<dt><a href="#PricingResult">PricingResult</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#EqPricingResult">EqPricingResult</a> : <code><a href="#PricingResult">PricingResult</a></code></dt>
<dd></dd>
<dt><a href="#OptionPricingResult">OptionPricingResult</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="pdf"></a>

#### pdf(x) ⇒ <code>number</code>
Probability density function (pdf) for a standard normal distribution.

**Kind**: global function  
**Returns**: <code>number</code> - density of standard normal distribution  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | value for which the density is to be calculated |

<a name="cdf"></a>

#### cdf(x) ⇒ <code>number</code>
Cumulative distribution function (cdf) for a standard normal distribution.
Approximation by Zelen, Marvin and Severo, Norman C. (1964),
[formula 26.2.17](http://people.math.sfu.ca/~cbm/aands/page_932.htm).

**Kind**: global function  
**Returns**: <code>number</code> - cumulative distribution of standard normal distribution  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | value for which the cumulative distribution is to be calculated |

<a name="margrabesFormula"></a>

#### margrabesFormula(S1, S2, T, sigma1, sigma2, rho, q1, q2) ⇒ [<code>PricingResult</code>](#PricingResult)
Margrabe's formula for pricing the exchange option between two risky assets.

See William  Margrabe, [The Value of an Option to Exchange One Asset for Another](http://www.stat.nus.edu.sg/~stalimtw/MFE5010/PDF/margrabe1978.pdf),
Journal of Finance, Vol. 33, No. 1, (March 1978), pp. 177-186.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| S1 | <code>number</code> | spot value of the first asset |
| S2 | <code>number</code> | spot value of the second asset |
| T | <code>number</code> | time to maturity (typically expressed in years) |
| sigma1 | <code>number</code> | volatility of the first asset |
| sigma2 | <code>number</code> | volatility of the second asset |
| rho | <code>number</code> | correlation of the Brownian motions driving the asset prices |
| q1 | <code>number</code> | dividend yield of the first asset |
| q2 | <code>number</code> | dividend yield of the second asset |

<a name="margrabesFormulaShort"></a>

#### margrabesFormulaShort(S1, S2, T, sigma, q1, q2) ⇒ [<code>PricingResult</code>](#PricingResult)
Margrabe's formula for pricing the exchange option between two risky assets.
Equivalent to `margrabesFormula` but accepting only the volatility corresponding
to the ratio `S1/S2` instead of their individual volatilities.

**Kind**: global function  
**See**: margrabesFormula  

| Param | Type | Description |
| --- | --- | --- |
| S1 | <code>number</code> | spot value of the first asset |
| S2 | <code>number</code> | spot value of the second asset |
| T | <code>number</code> | time to maturity (typically expressed in years) |
| sigma | <code>number</code> | volatility of the ratio of both assets |
| q1 | <code>number</code> | dividend yield of the first asset |
| q2 | <code>number</code> | dividend yield of the second asset |

<a name="eqBlackScholes"></a>

#### eqBlackScholes(S, K, T, sigma, q, r) ⇒ [<code>EqPricingResult</code>](#EqPricingResult)
Black-Scholes formula for a European vanilla option on a stock (asset class equity).

See Fischer Black and Myron Scholes, [The Pricing of Options and Corporate Liabilities](https://www.cs.princeton.edu/courses/archive/fall09/cos323/papers/black_scholes73.pdf),
The Journal of Political Economy, Vol. 81, No. 3 (May - June 1973), pp. 637-654.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| S | <code>number</code> | spot value of the stock |
| K | <code>number</code> | strike price of the option |
| T | <code>number</code> | time to maturity (typically expressed in years) |
| sigma | <code>number</code> | volatility of the underlying stock |
| q | <code>number</code> | dividend rate of the underlying stock |
| r | <code>number</code> | risk-less rate of return |

<a name="fxBlackScholes"></a>

#### fxBlackScholes(S, K, T, sigma, rFor, rDom) ⇒ [<code>PricingResult</code>](#PricingResult)
Black-Scholes formula for a European vanilla currency option (asset class foreign exchange).
This is also known as the Garman–Kohlhagen model.

See Mark B. Garman and Steven W. Kohlhagen [Foreign currency option values](https://www.sciencedirect.com/science/article/pii/S0261560683800011),
Journal of International Money and Finance, Vol. 2, Issue 3 (1983), pp. 231-237.

**Kind**: global function  
**Returns**: [<code>PricingResult</code>](#PricingResult) - prices in domestic currency  

| Param | Type | Description |
| --- | --- | --- |
| S | <code>number</code> | spot value of the currency exchange rate; this has to be expressed in unit of domestic currency / unit of foreign currency |
| K | <code>number</code> | strike price of the option |
| T | <code>number</code> | time to maturity (typically expressed in years) |
| sigma | <code>number</code> | volatility of the currency exchange rate |
| rFor | <code>number</code> | risk-less rate of return in the foreign currency |
| rDom | <code>number</code> | risk-less rate of return in the domestic currency |

<a name="PricingResult"></a>

#### PricingResult : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| call | [<code>OptionPricingResult</code>](#OptionPricingResult) | results for the call option |
| put | [<code>OptionPricingResult</code>](#OptionPricingResult) | results for the put optionCall |
| digitalCall | [<code>OptionPricingResult</code>](#OptionPricingResult) | results for digital call option |
| digitalPut | [<code>OptionPricingResult</code>](#OptionPricingResult) | results for digital put option |
| N_d1 | <code>number</code> | cumulative probability of `d1` |
| N_d2 | <code>number</code> | cumulative probability of `d2` |
| d1 | <code>number</code> |  |
| d2 | <code>number</code> |  |
| sigma | <code>number</code> | pricing volatility |

<a name="EqPricingResult"></a>

#### EqPricingResult : [<code>PricingResult</code>](#PricingResult)
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| digitalCall | [<code>OptionPricingResult</code>](#OptionPricingResult) | results for digital (a.k.a. binary) call option |
| digitalPut | [<code>OptionPricingResult</code>](#OptionPricingResult) | results for digital (a.k.a. binary) put option |

<a name="OptionPricingResult"></a>

#### OptionPricingResult : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| price | <code>number</code> | price of the option |
| delta | <code>number</code> | delta, i.e. derivative by (first) underlying of the option |
| gamma | <code>number</code> | gamma, i.e. second derivative by (first) underlying of the option |

## History

### 0.5.0 (2020-05-30)
* BREAKING CHANGE: move `callPrice` to `call.price` and `putPrice` to `put.price` on `PricingResult` objects; this will simplify the addition of greeks to results
* implement [delta and gamma](#OptionPricingResult) (first- and second-order sensitivity of option price to spot change)
* implement digital calls and puts for [equity options](#EqPricingResult)

### 0.4.1 (2020-05-17)
* assertions for parameter types and numerical ranges
* test for fx pricing symmetry under currency switching

### 0.4.0 (2020-05-17)
* BREAKING CHANGE: rename `price` to `callPrice` in the result of Margrabe's formulas
* implement [`eqBlackScholes`](#eqBlackScholes) (Black-Scholes formula for stock options) 
* implement [`fxBlackScholes`](#fxBlackScholes) (Black-Scholes formula for currency options)

### 0.3.0 (2020-05-10)
* implement [`margrabesFormula`](#margrabesFormula) and [`margrabesFormulaShort`](#margrabesFormulaShort)
* first test cases for the correctness of Margrabe's formula implementation

### 0.2.0 (2020-05-09)
* `cdf` (cumulative distribution function) for a standard normal distribution
* test case for relationship between `cdf` and `pdf`

### 0.1.3 (2020-05-09)
* extract normalizing constant for improved performance
* test pdf example values
* set up `eslint` linting (also on [Travis CI](https://travis-ci.org/luphord/gaussian-analytics))

### 0.1.2 (2020-05-09)
* integrate API doc in README
* API doc in README can automatically be updated by running `npm run update-docs`
* set up `.npmignore`

### 0.1.1 (2020-05-09)
* add first tests
* set up CI infrastructure with [Travis CI](https://travis-ci.org/luphord/gaussian-analytics) for testing

### 0.1.0 (2020-05-09)
* `pdf` (probability density function) for a standard normal distribution
* First release on [npm](https://www.npmjs.com/package/gaussian-analytics)