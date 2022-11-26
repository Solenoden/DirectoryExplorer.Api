# DirectoryExplorer.Api

The api for an Angular Web application which allows you to browse a directory.

## Installation

Requirements:
- Node v12.20.xx

Steps:
1. Run `npm install` to install the dependencies
2. Run `npm run start` to start the application

## Configuration

The API can be configured via the following environment variables:

- `EXPOSED_DIRECTORIES_ROOT`: The path of the root directory which is exposed via the API (defaults to './')
- `DIRECTORY_RESULT_DEPTH`: Determines how many levels deep the results of the returned directory are populated. Enables pagination of results (defaults to 1)