# Mini Message Board

Small Express/PostgreSQL app where users can post short messages and click into a single-message view.

I kept this project intentionally simple. The main goal was to build a clean little full stack app that covers routing, form handling, input validation, and database reads/writes without a lot of extra noise.

## What It Does

- Shows all messages on the home page, newest first
- Lets users add a new message through a form
- Validates the author and message fields before saving
- Has a separate page for viewing an individual message

## Stack

- Node.js
- Express
- EJS
- PostgreSQL
- `express-validator`

## Run It Locally

1. Install dependencies with `npm install`
2. Create a PostgreSQL database
3. Copy `.env.example` to `.env`
4. Set `DATABASE_URL` in `.env` to point at your database
5. Set `DB_SSL=false` if you are running locally without SSL
6. Run `npm run db:seed`
7. Run `npm start`

The app will be available at `http://localhost:3000`.

## Testing

Run the tests with `npm test`.

The test file covers the main controller behavior: loading messages, rendering the form, validating submissions, saving valid data, and handling missing message IDs. It uses a mocked data layer, so you do not need a live database connection just to run the tests.
