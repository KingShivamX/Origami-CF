# Training Tracker

This is a [web app](https://cp-training-tracker.vercel.app/) that helps you track your training history and performance for Competitive Programming.

The idea of this app is inspired by [this blog post](https://codeforces.com/blog/entry/136704). Huge thanks to the [author](https://codeforces.com/profile/pwned).

## Usage

1. Enter your Codeforces handle in Home page.
2. Generate random problems in Training page. You can also generate problems with tags.
3. View your training history in Statistics page.

## Note

1. The data are fetched from Codeforces API, so it may take a while to load.
2. The calculation of rating of generated problems and performance are from [this blog post](https://codeforces.com/blog/entry/136704).
3. For now, all the data (user info, training history, etc.) are stored in your browser's local storage, so once you clear the data, you will lose all your training history.

## Contributing

If you have any ideas or suggestions, please feel free to open an issue or a pull request.

### Run locally

1. Clone the repository.
2. Create a `.env.local` file and add your MongoDB URI and a JWT secret.
3. Run `npm install`.
4. Run `npm run dev`.
