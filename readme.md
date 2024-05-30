# Smoothly

Using Express JS as Backend Services, MySQL as Database

## Table of Contents

- [Smoothly](#smoothly)
  - [Documentation](#documentation)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Troubleshooting](#troubleshooting)
  - [Authors](#authors)
  - [License](#license)


## Documentation

- To view API documentation such as endpoints, request body, request params, and request query along with authentication middleware you can see through the following
  [SpreadSheet](https://docs.google.com/spreadsheets/d/1C4j_gn8kT-3VyplsPdFzW9ss2iVfElnWpqhdUcFlsLc/edit?usp=sharing)

-You can also test the API directly by importing the Collection to Postman

## Environment Variables

To run this project, you need to add the following environment variables to your .env file:

- `PORT` = 5000
- `DB_HOST` = localhost
- `DB_USER` = root
- `DB_PASSWORD` = 
- `DB_NAME` = smoothly
- `BASE_URL` = http://localhost:5000

## Installation

- Clone this project:

```bash
  git clone https://github.com/ghufronakbar/Smoothly-BE-ExpressJS.git
```

- Installing packages:

```bash
  npm install
```

- If you using local environment, renaming .env.example to .env. Customize with your configuration.

- Make sure MySQL is turned on in XAMPP control center.

- Import smoothly.sql to your database.

- Run your project with:

```bash
  node bin/www
```

- Enjoy your programs!

## Troubleshooting

### Database Connection Issues

If you are having problems connecting to the database, make sure:
- MySQL is running.
- The configuration in the .env file is correct.
- The 'smoothly' database has been imported correctly.

### Multer Upload Issues

If files are not uploading correctly:
- Make sure the `images/bukti-pembayaran/` & `images/profile` directory exists.
- Make sure you have permission to write to that directory.

## License

This project is licensed under the MIT license - see the [LICENSE](LICENSE) file for more details.

## Authors

- Github: [@ghufronakbar](https://www.github.com/ghufronakbar)
- Instagram: [@ghufronakbar\_](https://www.instagram.com/ghufronakbar_)
