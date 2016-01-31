Pull Requests are happily accepted, provided that you add or update QUnit tests related to your changes. Also, please update the README documentation, if appropriate.

## Development

Please set your editors to use spaces, rather than tabs, (4 spaces per tab) and trim empty lines if possible.

If you want to run your tests, serve the project with something like [http-server](https://github.com/indexzero/http-server) and visit the ./tests/index.html page.

If you want to build the source:

Before building the project, initialize git submodules as follows, otherwise the build script will fail:  
`git submodule init; git submodule update`

Run npm install in the root, then run ./scripts/build

Please don't submit pull-requests with the distribution scripts built.  By all means, test the build by visiting the page ./tests/distribution.html

If you do build to test, checkout the distribution* folders before committing.

Thanks
