# goose-assistant

> A GitHub App built with [Probot](https://github.com/probot/probot) that helps manage [Goose](https://github.com/pressly/goose) migration versions

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t goose-assistant .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> goose-assistant
```

## Contributing

If you have suggestions for how goose-assistant could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2020 Valentyn Vasylenko <vasylenko.valentyn@gmail.com>
