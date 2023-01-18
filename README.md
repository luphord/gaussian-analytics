# gaussian-analytics

[![npm version](http://img.shields.io/npm/v/gaussian-analytics.svg)](https://npmjs.org/package/gaussian-analytics "View gaussian-analytics on npm")
[![Test and Lint](https://github.com/luphord/gaussian-analytics/actions/workflows/test-lint.yml/badge.svg)](https://github.com/luphord/gaussian-analytics/actions/workflows/test-lint.yml)

JavaScript library for analytical pricings of financial derivatives under (log)normal distribution assumptions.

## Usage

### Usage in Node.js

Please make sure to have a recent version of [Node.js with npm](https://nodejs.org/en/download/) installed, at least [v13.2.0](https://medium.com/@nodejs/announcing-core-node-js-support-for-ecmascript-modules-c5d6dc29b663).

`gaussian-analytics.js` is available from npm via
```bash
> npm install gaussian-analytics
```

Create a file `mymodule.mjs` (notice the extension `.mjs` which tells Node.js that this is an [ES6 module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)) containing

```javascript
import * as gauss from 'gaussian-analytics';

console.log(gauss.pdf(0));
```

and run it by

```bash
> node mymodule.mjs
0.3989422804014327
```

For more details on Node.js and ES6 modules please see https://nodejs.org/api/esm.html#esm_enabling.

### Experiment in browser console

As `gaussian-analytics.js` is published as an [ES6 module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) you have to apply the following trick to play with it in your browser's dev console. First open the dev console (in Firefox press `F12`) and execute

```javascript
// dynamically import ES6 module and store it as global variable gauss
import('//unpkg.com/gaussian-analytics').then(m => window.gauss=m);
```

Afterwards, the global variable `gauss` will contain the module and you can call exported functions on it, e.g.

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

#### Classes

<dl>
<dt><a href="#Bond">Bond</a></dt>
<dd><p>Coupon-paying bond with schedule rolled from end.
First coupon period is (possibly) shorter than later periods.</p>
</dd>
</dl>

#### Constants

<dl>
<dt><a href="#irFrequency">irFrequency</a></dt>
<dd><p>Frequencies expressed as number of payments per year.</p>
</dd>
<dt><a href="#irMinimumPeriod">irMinimumPeriod</a></dt>
<dd><p>Minimum period <a href="#irRollFromEnd">irRollFromEnd</a> will create.</p>
</dd>
</dl>

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
<dt><a href="#margrabesFormula">margrabesFormula(S1, S2, T, sigma1, sigma2, rho, q1, q2, [scale])</a> ⇒ <code><a href="#PricingResult">PricingResult</a></code></dt>
<dd><p>Margrabe&#39;s formula for pricing the exchange option between two risky assets.</p>
<p>See William  Margrabe, <a href="http://www.stat.nus.edu.sg/~stalimtw/MFE5010/PDF/margrabe1978.pdf">The Value of an Option to Exchange One Asset for Another</a>,
Journal of Finance, Vol. 33, No. 1, (March 1978), pp. 177-186.</p>
</dd>
<dt><a href="#margrabesFormulaShort">margrabesFormulaShort(S1, S2, T, sigma, q1, q2, [scale])</a> ⇒ <code><a href="#PricingResult">PricingResult</a></code></dt>
<dd><p>Margrabe&#39;s formula for pricing the exchange option between two risky assets.
Equivalent to <code>margrabesFormula</code> but accepting only the volatility corresponding
to the ratio <code>S1/S2</code> instead of their individual volatilities.</p>
</dd>
<dt><a href="#eqBlackScholes">eqBlackScholes(S, K, T, sigma, q, r, [scale])</a> ⇒ <code><a href="#EqPricingResult">EqPricingResult</a></code></dt>
<dd><p>Black-Scholes formula for a European vanilla option on a stock (asset class equity).</p>
<p>See Fischer Black and Myron Scholes, <a href="https://www.cs.princeton.edu/courses/archive/fall09/cos323/papers/black_scholes73.pdf">The Pricing of Options and Corporate Liabilities</a>,
The Journal of Political Economy, Vol. 81, No. 3 (May - June 1973), pp. 637-654.</p>
</dd>
<dt><a href="#fxBlackScholes">fxBlackScholes(S, K, T, sigma, rFor, rDom, [scale])</a> ⇒ <code><a href="#PricingResult">PricingResult</a></code></dt>
<dd><p>Black-Scholes formula for a European vanilla currency option (asset class foreign exchange).
This is also known as the Garman–Kohlhagen model.</p>
<p>See Mark B. Garman and Steven W. Kohlhagen <a href="https://www.sciencedirect.com/science/article/pii/S0261560683800011">Foreign currency option values</a>,
Journal of International Money and Finance, Vol. 2, Issue 3 (1983), pp. 231-237.</p>
</dd>
<dt><a href="#irBlack76">irBlack76(F, K, T, sigma, r, [scale])</a> ⇒ <code><a href="#PricingResult">PricingResult</a></code></dt>
<dd><p>Black-Scholes formula for European option on forward / future (asset class interest rates),
known as the Black 76 model.</p>
<p>See Fischer Black <a href="https://www.sciencedirect.com/science/article/abs/pii/0304405X76900246">The pricing of commodity contracts</a>,
Journal of Financial Economics, 3 (1976), 167-179.</p>
</dd>
<dt><a href="#irBlack76BondOption">irBlack76BondOption(bond, K, T, sigma, spotCurve)</a> ⇒ <code><a href="#PricingResult">PricingResult</a></code></dt>
<dd><p>Black 76 model for an option on a coupon-paying bond (asset class interest rates).</p>
</dd>
<dt><a href="#irBlack76CapletFloorlet">irBlack76CapletFloorlet(floatingRate, K, sigma, spotCurve)</a> ⇒ <code><a href="#PricingResult">PricingResult</a></code></dt>
<dd><p>Black 76 model for a caplet / floorlet (asset class interest rates).
Notional is retrieved from floatingRate.notional.</p>
</dd>
<dt><a href="#irForwardLinearRate">irForwardLinearRate(floatingRate, discountCurve)</a></dt>
<dd><p>Calculates the linear forward rate given a floating cashflow and a discount curve.</p>
</dd>
<dt><a href="#irForwardPrice">irForwardPrice(cashflows, discountCurve, t)</a> ⇒ <code>number</code></dt>
<dd><p>Calculates the forward price at time t for a series of cashflows.
Cashflows before t are ignored (i.e. do not add any value).</p>
</dd>
<dt><a href="#irRollFromEnd">irRollFromEnd(start, end, frequency)</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>Creates a payment schedule with payment frequency <a href="frequency">frequency</a>
that has last payment at <a href="end">end</a> and no payments before <a href="start">start</a>.
First payment period is (possibly) shorter than later periods.</p>
</dd>
<dt><a href="#irFlatDiscountCurve">irFlatDiscountCurve(flatRate)</a> ⇒ <code><a href="#DiscountCurve">DiscountCurve</a></code></dt>
<dd><p>Creates a <a href="#DiscountCurve">DiscountCurve</a> discounting with the constant <a href="flatRate">flatRate</a>.</p>
</dd>
<dt><a href="#irLinearInterpolationSpotCurve">irLinearInterpolationSpotCurve(spotRates)</a> ⇒ <code><a href="#SpotCurve">SpotCurve</a></code></dt>
<dd><p>Creates a <a href="#SpotCurve">SpotCurve</a> by linearly interpolating the given points in time.
Extrapolation in both directions is constant.</p>
</dd>
<dt><a href="#irSpotCurve2DiscountCurve">irSpotCurve2DiscountCurve(spotCurve)</a> ⇒ <code><a href="#DiscountCurve">DiscountCurve</a></code></dt>
<dd><p>Turns a <a href="#SpotCurve">SpotCurve</a> into a <a href="#DiscountCurve">DiscountCurve</a>.
Inverse of <a href="#irDiscountCurve2SpotCurve">irDiscountCurve2SpotCurve</a>.</p>
</dd>
<dt><a href="#irDiscountCurve2SpotCurve">irDiscountCurve2SpotCurve(discountCurve)</a> ⇒ <code><a href="#SpotCurve">SpotCurve</a></code></dt>
<dd><p>Turns a <a href="#DiscountCurve">DiscountCurve</a> into a <a href="#SpotCurve">SpotCurve</a>.
Inverse of <a href="#irSpotCurve2DiscountCurve">irSpotCurve2DiscountCurve</a>.</p>
</dd>
<dt><a href="#irInternalRateOfReturn">irInternalRateOfReturn(cashflows, [r0], [r1], [abstol], [maxiter])</a> ⇒ <code>number</code></dt>
<dd><p>Calculates the internal rate of return (IRR) of the given series of cashflows,
i.e. the flat discount rate (continuously compounded) for which the total NPV of
the given cashflows is 0. The secant method is used. If no IRR can be found
after <a href="maxiter">maxiter</a> iteration, an exception is thrown.</p>
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
<dt><a href="#DiscountCurve">DiscountCurve</a> ⇒ <code>number</code></dt>
<dd></dd>
<dt><a href="#SpotCurve">SpotCurve</a> ⇒ <code>number</code></dt>
<dd></dd>
<dt><a href="#SpotRate">SpotRate</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#FixedCashflow">FixedCashflow</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#FloatingCashflow">FloatingCashflow</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#Cashflow">Cashflow</a> : <code><a href="#FixedCashflow">FixedCashflow</a></code> | <code><a href="#FloatingCashflow">FloatingCashflow</a></code></dt>
<dd></dd>
</dl>

<a name="Bond"></a>

#### Bond
Coupon-paying bond with schedule rolled from end.
First coupon period is (possibly) shorter than later periods.

**Kind**: global class  

* [Bond](#Bond)
    * [new Bond(notional, coupon, start, end, frequency)](#new_Bond_new)
    * [.cashflows](#Bond+cashflows) ⇒ [<code>Array.&lt;FixedCashflow&gt;</code>](#FixedCashflow)
    * [.forwardDirtyPrice(discountCurve, t)](#Bond+forwardDirtyPrice) ⇒ <code>number</code>
    * [.dirtyPrice(discountCurve)](#Bond+dirtyPrice) ⇒ <code>number</code>
    * [.yieldToMaturity([npv])](#Bond+yieldToMaturity) ⇒ <code>number</code>
    * [.duration([npv])](#Bond+duration) ⇒ <code>number</code>

<a name="new_Bond_new"></a>

##### new Bond(notional, coupon, start, end, frequency)
Creates an instance of a coupon-paying bond.


| Param | Type | Description |
| --- | --- | --- |
| notional | <code>number</code> | notional payment, i.e. last cashflow and reference amount for [notional](notional) |
| coupon | <code>number</code> | annual coupon relative to [notional](notional) (i.e. 0.04 for 4%, not a currency amount) |
| start | <code>number</code> | start time of bond (schedule will be rolled from [end](end)) |
| end | <code>number</code> | end time of bond (time of notional payment) |
| frequency | <code>number</code> | number of payments per year |

<a name="Bond+cashflows"></a>

##### bond.cashflows ⇒ [<code>Array.&lt;FixedCashflow&gt;</code>](#FixedCashflow)
Cashflows of this bond as an array.
Last coupon and notional payment are returned separately.
For zero bonds (i.e. coupon === 0), only the notional payment is returned as cashflow.

**Kind**: instance property of [<code>Bond</code>](#Bond)  
<a name="Bond+forwardDirtyPrice"></a>

##### bond.forwardDirtyPrice(discountCurve, t) ⇒ <code>number</code>
Calculates the forward price (dirty, i.e. including accrued interest) at time [t](t) for this bond.

**Kind**: instance method of [<code>Bond</code>](#Bond)  

| Param | Type | Description |
| --- | --- | --- |
| discountCurve | [<code>DiscountCurve</code>](#DiscountCurve) | discount curve (used for discounting and forwards) |
| t | <code>number</code> | time for which the forward dirty price is to be calculated |

<a name="Bond+dirtyPrice"></a>

##### bond.dirtyPrice(discountCurve) ⇒ <code>number</code>
Calculates the current price (dirty, i.e. including accrued interest) for this bond.

**Kind**: instance method of [<code>Bond</code>](#Bond)  

| Param | Type | Description |
| --- | --- | --- |
| discountCurve | [<code>DiscountCurve</code>](#DiscountCurve) | discount curve (used for discounting and forwards) |

<a name="Bond+yieldToMaturity"></a>

##### bond.yieldToMaturity([npv]) ⇒ <code>number</code>
Calculates the bond yield given [npv](npv), i.e the flat discount rate
(continuously compounded) for which the dirty price of the bond equals [npv](npv).

**Kind**: instance method of [<code>Bond</code>](#Bond)  
**Returns**: <code>number</code> - bond yield given npv  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [npv] | <code>number</code> | <code>this.notional</code> | present value of the bond for yield calculation, defaults to 100% (i.e. notional) |

<a name="Bond+duration"></a>

##### bond.duration([npv]) ⇒ <code>number</code>
Calculates the bond duration given npv. There is no difference between Macaulay duration
and Modified duration here as we use continuous yields for discounting.

**Kind**: instance method of [<code>Bond</code>](#Bond)  
**Returns**: <code>number</code> - bond duration given npv  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [npv] | <code>number</code> | <code>this.notional</code> | present value of the bond for yield calculation, defaults to 100% (i.e. notional) |

<a name="irFrequency"></a>

#### irFrequency
Frequencies expressed as number of payments per year.

**Kind**: global constant  
<a name="irMinimumPeriod"></a>

#### irMinimumPeriod
Minimum period [irRollFromEnd](#irRollFromEnd) will create.

**Kind**: global constant  
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

#### margrabesFormula(S1, S2, T, sigma1, sigma2, rho, q1, q2, [scale]) ⇒ [<code>PricingResult</code>](#PricingResult)
Margrabe's formula for pricing the exchange option between two risky assets.

See William  Margrabe, [The Value of an Option to Exchange One Asset for Another](http://www.stat.nus.edu.sg/~stalimtw/MFE5010/PDF/margrabe1978.pdf),
Journal of Finance, Vol. 33, No. 1, (March 1978), pp. 177-186.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| S1 | <code>number</code> |  | spot value of the first asset |
| S2 | <code>number</code> |  | spot value of the second asset |
| T | <code>number</code> |  | time to maturity (typically expressed in years) |
| sigma1 | <code>number</code> |  | volatility of the first asset |
| sigma2 | <code>number</code> |  | volatility of the second asset |
| rho | <code>number</code> |  | correlation of the Brownian motions driving the asset prices |
| q1 | <code>number</code> |  | dividend yield of the first asset |
| q2 | <code>number</code> |  | dividend yield of the second asset |
| [scale] | <code>number</code> | <code>1.0</code> | scaling of all money amount and sensitivity results; think "number of options", but with fractional parts allowed |

<a name="margrabesFormulaShort"></a>

#### margrabesFormulaShort(S1, S2, T, sigma, q1, q2, [scale]) ⇒ [<code>PricingResult</code>](#PricingResult)
Margrabe's formula for pricing the exchange option between two risky assets.
Equivalent to `margrabesFormula` but accepting only the volatility corresponding
to the ratio `S1/S2` instead of their individual volatilities.

**Kind**: global function  
**See**: margrabesFormula  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| S1 | <code>number</code> |  | spot value of the first asset |
| S2 | <code>number</code> |  | spot value of the second asset |
| T | <code>number</code> |  | time to maturity (typically expressed in years) |
| sigma | <code>number</code> |  | volatility of the ratio of both assets |
| q1 | <code>number</code> |  | dividend yield of the first asset |
| q2 | <code>number</code> |  | dividend yield of the second asset |
| [scale] | <code>number</code> | <code>1.0</code> | scaling of all money amount and sensitivity results; think "number of options", but with fractional parts allowed |

<a name="eqBlackScholes"></a>

#### eqBlackScholes(S, K, T, sigma, q, r, [scale]) ⇒ [<code>EqPricingResult</code>](#EqPricingResult)
Black-Scholes formula for a European vanilla option on a stock (asset class equity).

See Fischer Black and Myron Scholes, [The Pricing of Options and Corporate Liabilities](https://www.cs.princeton.edu/courses/archive/fall09/cos323/papers/black_scholes73.pdf),
The Journal of Political Economy, Vol. 81, No. 3 (May - June 1973), pp. 637-654.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| S | <code>number</code> |  | spot value of the stock |
| K | <code>number</code> |  | strike price of the option |
| T | <code>number</code> |  | time to maturity (typically expressed in years) |
| sigma | <code>number</code> |  | volatility of the underlying stock |
| q | <code>number</code> |  | dividend rate of the underlying stock |
| r | <code>number</code> |  | risk-less rate of return |
| [scale] | <code>number</code> | <code>1.0</code> | scaling of all money amount and sensitivity results; think "number of options", but with fractional parts allowed |

<a name="fxBlackScholes"></a>

#### fxBlackScholes(S, K, T, sigma, rFor, rDom, [scale]) ⇒ [<code>PricingResult</code>](#PricingResult)
Black-Scholes formula for a European vanilla currency option (asset class foreign exchange).
This is also known as the Garman–Kohlhagen model.

See Mark B. Garman and Steven W. Kohlhagen [Foreign currency option values](https://www.sciencedirect.com/science/article/pii/S0261560683800011),
Journal of International Money and Finance, Vol. 2, Issue 3 (1983), pp. 231-237.

**Kind**: global function  
**Returns**: [<code>PricingResult</code>](#PricingResult) - prices in domestic currency  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| S | <code>number</code> |  | spot value of the currency exchange rate; this has to be expressed in unit of domestic currency / unit of foreign currency |
| K | <code>number</code> |  | strike price of the option |
| T | <code>number</code> |  | time to maturity (typically expressed in years) |
| sigma | <code>number</code> |  | volatility of the currency exchange rate |
| rFor | <code>number</code> |  | risk-less rate of return in the foreign currency |
| rDom | <code>number</code> |  | risk-less rate of return in the domestic currency |
| [scale] | <code>number</code> | <code>1.0</code> | scaling of all money amount and sensitivity results; think "number of options", but with fractional parts allowed |

<a name="irBlack76"></a>

#### irBlack76(F, K, T, sigma, r, [scale]) ⇒ [<code>PricingResult</code>](#PricingResult)
Black-Scholes formula for European option on forward / future (asset class interest rates),
known as the Black 76 model.

See Fischer Black [The pricing of commodity contracts](https://www.sciencedirect.com/science/article/abs/pii/0304405X76900246),
Journal of Financial Economics, 3 (1976), 167-179.

**Kind**: global function  
**Returns**: [<code>PricingResult</code>](#PricingResult) - prices of forward / future option  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| F | <code>number</code> |  | forward price of the underlying |
| K | <code>number</code> |  | strike price of the option |
| T | <code>number</code> |  | time to maturity (typically expressed in years) |
| sigma | <code>number</code> |  | volatility of the underlying forward price |
| r | <code>number</code> |  | risk-less rate of return |
| [scale] | <code>number</code> | <code>1.0</code> | scaling of all money amount and sensitivity results; think "number of options", but with fractional parts allowed |

<a name="irBlack76BondOption"></a>

#### irBlack76BondOption(bond, K, T, sigma, spotCurve) ⇒ [<code>PricingResult</code>](#PricingResult)
Black 76 model for an option on a coupon-paying bond (asset class interest rates).

**Kind**: global function  
**Returns**: [<code>PricingResult</code>](#PricingResult) - prices of bond options  

| Param | Type | Description |
| --- | --- | --- |
| bond | [<code>Bond</code>](#Bond) | underlying bond of the option |
| K | <code>number</code> | (dirty) strike price of the option |
| T | <code>number</code> | time to maturity (typically expressed in years) |
| sigma | <code>number</code> | volatility of the bond forward price |
| spotCurve | [<code>SpotCurve</code>](#SpotCurve) | risk-less spot curve (used for forwards and discounting) |

<a name="irBlack76CapletFloorlet"></a>

#### irBlack76CapletFloorlet(floatingRate, K, sigma, spotCurve) ⇒ [<code>PricingResult</code>](#PricingResult)
Black 76 model for a caplet / floorlet (asset class interest rates).
Notional is retrieved from floatingRate.notional.

**Kind**: global function  
**Returns**: [<code>PricingResult</code>](#PricingResult) - prices of caplet / floorlet  

| Param | Type | Description |
| --- | --- | --- |
| floatingRate | [<code>FloatingCashflow</code>](#FloatingCashflow) | underlying floating rate of the option |
| K | <code>number</code> | strike price of the option |
| sigma | <code>number</code> | volatility of the floating rate |
| spotCurve | [<code>SpotCurve</code>](#SpotCurve) | risk-less spot curve (used for forwards and discounting) |

<a name="irForwardLinearRate"></a>

#### irForwardLinearRate(floatingRate, discountCurve)
Calculates the linear forward rate given a floating cashflow and a discount curve.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| floatingRate | [<code>FloatingCashflow</code>](#FloatingCashflow) | floating rate (notional is ignored) |
| discountCurve | [<code>DiscountCurve</code>](#DiscountCurve) | discount curve used for forwards |

<a name="irForwardPrice"></a>

#### irForwardPrice(cashflows, discountCurve, t) ⇒ <code>number</code>
Calculates the forward price at time t for a series of cashflows.
Cashflows before t are ignored (i.e. do not add any value).

**Kind**: global function  
**Returns**: <code>number</code> - forward price of given cashflows  

| Param | Type | Description |
| --- | --- | --- |
| cashflows | [<code>Array.&lt;Cashflow&gt;</code>](#Cashflow) | future cashflows to be paid |
| discountCurve | [<code>DiscountCurve</code>](#DiscountCurve) | discount curve (used for discounting and forwards) |
| t | <code>number</code> | time point of the forward (typically expressed in years) |

<a name="irRollFromEnd"></a>

#### irRollFromEnd(start, end, frequency) ⇒ <code>Array.&lt;number&gt;</code>
Creates a payment schedule with payment frequency [frequency](frequency)
that has last payment at [end](end) and no payments before [start](start).
First payment period is (possibly) shorter than later periods.

**Kind**: global function  
**Returns**: <code>Array.&lt;number&gt;</code> - payment times  

| Param | Type | Description |
| --- | --- | --- |
| start | <code>number</code> | start time of schedule (usually expressed in years) |
| end | <code>number</code> | end time of schedule (usually expressed in years) |
| frequency | <code>number</code> | number of payments per time unit (usually per year) |

<a name="irFlatDiscountCurve"></a>

#### irFlatDiscountCurve(flatRate) ⇒ [<code>DiscountCurve</code>](#DiscountCurve)
Creates a [DiscountCurve](#DiscountCurve) discounting with the constant [flatRate](flatRate).

**Kind**: global function  

| Param | Type |
| --- | --- |
| flatRate | <code>number</code> | 

<a name="irLinearInterpolationSpotCurve"></a>

#### irLinearInterpolationSpotCurve(spotRates) ⇒ [<code>SpotCurve</code>](#SpotCurve)
Creates a [SpotCurve](#SpotCurve) by linearly interpolating the given points in time.
Extrapolation in both directions is constant.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| spotRates | [<code>Array.&lt;SpotRate&gt;</code>](#SpotRate) | individual spot rates used for interpolation; will be sorted automatically |

<a name="irSpotCurve2DiscountCurve"></a>

#### irSpotCurve2DiscountCurve(spotCurve) ⇒ [<code>DiscountCurve</code>](#DiscountCurve)
Turns a [SpotCurve](#SpotCurve) into a [DiscountCurve](#DiscountCurve).
Inverse of [irDiscountCurve2SpotCurve](#irDiscountCurve2SpotCurve).

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| spotCurve | [<code>SpotCurve</code>](#SpotCurve) | spot rate curve to be converted |

<a name="irDiscountCurve2SpotCurve"></a>

#### irDiscountCurve2SpotCurve(discountCurve) ⇒ [<code>SpotCurve</code>](#SpotCurve)
Turns a [DiscountCurve](#DiscountCurve) into a [SpotCurve](#SpotCurve).
Inverse of [irSpotCurve2DiscountCurve](#irSpotCurve2DiscountCurve).

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| discountCurve | [<code>DiscountCurve</code>](#DiscountCurve) | discount curve to be converted |

<a name="irInternalRateOfReturn"></a>

#### irInternalRateOfReturn(cashflows, [r0], [r1], [abstol], [maxiter]) ⇒ <code>number</code>
Calculates the internal rate of return (IRR) of the given series of cashflows,
i.e. the flat discount rate (continuously compounded) for which the total NPV of
the given cashflows is 0. The secant method is used. If no IRR can be found
after [maxiter](maxiter) iteration, an exception is thrown.

**Kind**: global function  
**Returns**: <code>number</code> - continuously compounded IRR  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| cashflows | [<code>Array.&lt;FixedCashflow&gt;</code>](#FixedCashflow) |  | cashflows for which the IRR is to be calculated |
| [r0] | <code>number</code> | <code>0</code> | first guess for IRR |
| [r1] | <code>number</code> | <code>0.05</code> | second guess for IRR, may not be equal to [r0](r0) |
| [abstol] | <code>number</code> | <code>1e-8</code> | absolute tolerance to accept the current rate as solution |
| [maxiter] | <code>number</code> | <code>100</code> | maximum number of secant method iteration after which root finding aborts |

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
| logSimpleMoneyness | <code>number</code> | logarithm of simple moneyness, i.e. ln(forward / strike) |
| standardizedMoneyness | <code>number</code> | standardized logSimpleMoneyness, i.e. ln(forward / strike) / (sigma * sqrt(T)) |

<a name="DiscountCurve"></a>

#### DiscountCurve ⇒ <code>number</code>
**Kind**: global typedef  
**Returns**: <code>number</code> - discount factor at time t  

| Param | Type | Description |
| --- | --- | --- |
| t | <code>number</code> | time (typically expressed in years) |

<a name="SpotCurve"></a>

#### SpotCurve ⇒ <code>number</code>
**Kind**: global typedef  
**Returns**: <code>number</code> - spot interest rate to time t  

| Param | Type | Description |
| --- | --- | --- |
| t | <code>number</code> | time (typically expressed in years) |

<a name="SpotRate"></a>

#### SpotRate : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| t | <code>number</code> | time (typically expressed in years) |
| rate | <code>number</code> | spot rate to time [t](t) |

<a name="FixedCashflow"></a>

#### FixedCashflow : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| t | <code>number</code> | time (typically expressed in years) |
| value | <code>number</code> | cash amount paid at t |

<a name="FloatingCashflow"></a>

#### FloatingCashflow : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| t | <code>number</code> | fixing time |
| T | <code>number</code> | payment time, yearfraction is T - t |
| notional | <code>number</code> | notional amount that the rate fixed at will refer to |

<a name="Cashflow"></a>

#### Cashflow : [<code>FixedCashflow</code>](#FixedCashflow) \| [<code>FloatingCashflow</code>](#FloatingCashflow)
**Kind**: global typedef  
## History

### 0.7.0 (not yet)
* introduce [`FloatingCashflows`](#FloatingCashflow), supported by [`irForwardPrice`](#irForwardPrice)
* implement [`duration`](#Bond+duration) method for [`Bonds`](#Bond)
* add `scale` parameter to option pricing functions
* add `logSimpleMoneyness` and `standardizedMoneyness` to [OptionPricingResult](#OptionPricingResult)
- migrate from Travis-CI to [GitHub Actions]((https://github.com/luphord/gaussian-analytics/actions/workflows/test-lint.yml))
* upgrade development dependencies

### 0.6.1 (2020-06-24)
* assert parameter types and numerical ranges of [`Bond`](#Bond) [`irRollFromEnd`](#irRollFromEnd), [Bond.yieldToMaturity](#Bond+yieldToMaturity), [`cdf`](#cdf), [`pdf`](#pdf), [`irFlatDiscountCurve`](#irFlatDiscountCurve), [`irLinearInterpolationSpotCurve`](#irLinearInterpolationSpotCurve), [`irInternalRateOfReturn`](#irInternalRateOfReturn) and curve conversion methods
* ensure non-empty arrays in [`irLinearInterpolationSpotCurve`](#irLinearInterpolationSpotCurve) and [`irInternalRateOfReturn`](#irInternalRateOfReturn)
* do not modify spotRates passed to [`irLinearInterpolationSpotCurve`](#irLinearInterpolationSpotCurve)
* for zero bonds (i.e. coupon === 0), only the notional payment is returned as cashflow by [Bond.cashflows](#Bond+cashflows)

### 0.6.0 (2020-06-07)
* implement [`irBlack76`](#irBlack76) (Black-Scholes formula for futures / forwards, particularly in interest rates)
* implement [`irBlack76BondOption`](#irBlack76BondOption) for specifically evaluating options on coupon-paying bonds
* implement [`irForwardPrice`](#irForwardPrice) for calculation of forward prices for fixed cashflows
* implement [`irRollFromEnd`](#irRollFromEnd) for creating regular payment schedules
* implement [`irInternalRateOfReturn`](#irInternalRateOfReturn) to solve for IRR using the secant method
* implement class [`Bond`](#Bond) with methods for obtaining cashflows, (forward) dirty price and yield to maturity
* implement helper and conversion functions for dealing with spot and discount curves

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
* set up `eslint` linting (also on [Travis CI](https://travis-ci.com/github/luphord/gaussian-analytics))

### 0.1.2 (2020-05-09)
* integrate API doc in README
* API doc in README can automatically be updated by running `npm run update-docs`
* set up `.npmignore`

### 0.1.1 (2020-05-09)
* add first tests
* set up CI infrastructure with [Travis CI](https://travis-ci.com/github/luphord/gaussian-analytics) for testing

### 0.1.0 (2020-05-09)
* `pdf` (probability density function) for a standard normal distribution
* First release on [npm](https://www.npmjs.com/package/gaussian-analytics)