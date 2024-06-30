# CV Generator

A simple TypeScript tool that utilizes OpenAI's API to effortlessly create job-specific CVs that are ATS-friendly with a cover letter.

## Installation

Use the package manager [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install:

```bash
npm install
```

## Usage

* In src create "cvs.json" file and fill your cv as mentioned in the CVType interface in the cv.ts file
* Create a .env file, then add OPEN_AI_KEY & OPEN_AI_MODEL
* Then simply Run:

```bash
npm run start
```