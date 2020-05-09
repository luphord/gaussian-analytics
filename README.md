# gaussian-analytics

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

## History

### 0.1.0 (2020-05-09)
* `pdf` (probability density function) for a standard normal distribution
* First release on [npm](https://www.npmjs.com/package/gaussian-analytics)