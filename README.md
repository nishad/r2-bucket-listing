# Cloudflare R2 Index Generator

A Deno script to generate an HTML index page for a Cloudflare R2 bucket. This index page can be uploaded to the bucket, or saved to a local file.

Example : [https://nishad.github.io/r2-bucket-listing/index-sample.html](https://nishad.github.io/r2-bucket-listing/index-sample.html)

## Features

*   Uses the S3 compatible API of R2 to get a list of objects from the bucket
*   Filters the list to only include files with non-zero size
*   Sorts the list by last modified date
*   Formats the file size and last modified date
*   Generates a HTML page with the file list
*   Optionally saves the HTML page to a local file
*   Optionally opens the HTML page in the browser
*   Optionally uploads the HTML page to the bucket

## Requirements

*   Deno 1.24.3 or higher
*   Cloudflare R2 account credentials (A token with atleast read permission to the bucket)
*   R2 bucket name
*   (Optional) Public URL of the bucket

## Usage

1.  Install Deno if you don't have it already: [https://deno.land/](https://deno.land/)
2.  Download or clone the script
3.  Configure the script by filling in the R2 credentials, bucket name, and (optionally) public URL in the `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, and `R2_PUBLIC_BUCKET_URL` variables at the top of the script
4.  Optionally edit the `template.html` 
4.  Run the script: `deno run --allow-net --allow-read --allow-write --allow-run generate-r2-index.js`
5.  The HTML page will be generated, and depending on your configuration, saved to a local file, opened in the browser, or uploaded to the bucket

## Configuration

This configuration is setting up the credentials and information needed to access and use an R2 bucket. The `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY` are the credentials needed to authenticate with the R2 service. The `R2_BUCKET` is the specific bucket that will be used for the index generation.

The `R2_PREFIX` is the folder within the bucket where the index will be generated, and should be specified without the beginning slash but with the ending slash. The `R2_PUBLIC_BUCKET_URL` is the URL of the bucket that can be accessed publicly.

The `R2_UPLOAD_INDEX` flag determines whether the index will be uploaded to the R2 bucket or not. If set to true, the R2 access token must have the appropriate rights to write to the bucket.

Additionally, the configuration specifies whether the generated index should be saved as a local file (SAVE_TO_FILE) and whether it should be opened in a browser (`OPEN_IN_BROWSER`).

## Template

You can also modify `template.html`. This is an HTML template using the [nunjucks](https://mozilla.github.io/nunjucks/) templating language. It creates an HTML page with a directory index of files. The page has a title, table of files, and a footer with a link to a website and a copyright notice. The files are passed to the template as a variable files, which is an array of objects containing information about each file. The file information is used to populate the table with the file name, last modified date, size, and a download button. The template uses the [bulma CSS framework](https://bulma.io) for styling.

## License

This script is licensed under the MIT license. See [LICENSE](LICENSE) for more details.
