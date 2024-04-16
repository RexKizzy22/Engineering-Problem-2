# Engineering Problems

This repo contains programming challenges you should be able to solve in a reasonable amount of time (5 days).
It tests your understanding of programming fundamentals.

- [Drivers report](drivers-report.md)
- [Trips Analysis](trips-analysis.md)


## How to Run

You can run the test cases by running

```bash
yarn
yarn jest --watch
```

You can elide the `--watch` flag to just run tests

If all tests pass, you have successfully solved the questions.

The solution to trips analysis should go in `src/analysis.js`

The solution to drivers report should go in `src/report.js`

Ensure to write tests as necessary for any utility functions that you may create.

---
Do not delete the `node_modules` folder in the `src` folder, it is a hack to get the `api` files to be absolute.

You need the `api` module for both challenges.
