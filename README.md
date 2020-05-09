# gaussian-analytics

[![npm version](http://img.shields.io/npm/v/gaussian-analytics.svg)](https://npmjs.org/package/gaussian-analytics "View gaussian-analytics on npm")
[![Build status](https://img.shields.io/travis/luphord/gaussian-analytics)](https://travis-ci.org/luphord/gaussian-analytics)

JavaScript library for analytical pricings of financial derivatives under (log)normal distribution assumptions.

## Usage

### Experiment in browser console

As `gaussian-analytics.js` is published as an [ES6 module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) your have to apply the following trick to play with it in your browser's dev console. First open the dev console (in Firefox press `F12`) and execute

```javascript
// dynamically import ES6 module and store it as global variable gauss
import('//unpkg.com/gaussian-analytics').then(m => window.gauss=m);
```

Afterwards, the global variable `gauss` will contain the module and you can run call exported functions on it, e.g.

```javascript
gauss.pdf(0);
// 0.3989422804014327
```

This should work at least for Firefox and Chrome.

## API Documentation

#### Functions

<dl>
<dt><a href="#pdf">pdf(x)</a> ⇒</dt>
<dd><p>Probability density function (pdf) for a standard normal distribution.</p>
</dd>
<dt><a href="#cdf">cdf(x)</a> ⇒</dt>
<dd><p>Cumulative distribution function (cdf) for a standard normal distribution.
Approximation by Zelen, Marvin and Severo, Norman C. (1964),
<a href="http://people.math.sfu.ca/~cbm/aands/page_932.htm">formula 26.2.17</a>.</p>
</dd>
</dl>

<a name="pdf"></a>

#### pdf(x) ⇒
Probability density function (pdf) for a standard normal distribution.

**Kind**: global function  
**Returns**: density of standard normal distribution  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | value for which the density is to be calculated |

<a name="cdf"></a>

#### cdf(x) ⇒
Cumulative distribution function (cdf) for a standard normal distribution.
Approximation by Zelen, Marvin and Severo, Norman C. (1964),
[formula 26.2.17](http://people.math.sfu.ca/~cbm/aands/page_932.htm).

**Kind**: global function  
**Returns**: cumulative distribution of standard normal distribution  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | value for which the cumulative distribution is to be calculated |

## History

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