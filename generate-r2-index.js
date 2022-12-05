import { ApiFactory } from "https://deno.land/x/aws_api/client/mod.ts";
import { S3 } from "https://deno.land/x/aws_api/services/s3/mod.ts";
import nunjucks from "https://deno.land/x/nunjucks@3.2.3-2/mod.js";
import { format as bytesFormat } from "https://deno.land/std@0.167.0/fmt/bytes.ts";
import { format as dateFormat } from "https://deno.land/std@0.167.0/datetime/mod.ts";
import Kia from "https://deno.land/x/kia@0.4.1b/mod.ts";

// Configure R2 Credentials and Bucket information
const R2_ACCOUNT_ID = "";
const R2_ACCESS_KEY_ID = "";
const R2_SECRET_ACCESS_KEY = "";
const R2_BUCKET = "";
// Prefix is the folder in the bucket where the index will be generated
// Prefix should be without the beginning slash, but with the ending slash
const R2_PREFIX = "";
const R2_PUBLIC_BUCKET_URL = "";
// To upload, the R2 access token should have rights to write to the bucket
const R2_UPLOAD_INDEX = true;

// Save as a local file
const SAVE_TO_FILE = true;
const OPEN_IN_BROWSER = false;
// End of R2 Credentials and Bucket information

const indexFilePath = "index.html";
const templateFile = "template.html";

const api = new ApiFactory({
  fixedEndpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: "auto", // cloudflare r2 only has one region
  credentials: {
    awsAccessKeyId: R2_ACCESS_KEY_ID,
    awsSecretKey: R2_SECRET_ACCESS_KEY,
  },
}).makeNew(S3);

let progess = new Kia("Getting file list from Cloudflare R2");
const contentList = await api.listObjectsV2({
  Bucket: R2_BUCKET,
  Prefix: R2_PREFIX,
});
progess.succeed();

progess = new Kia("Processing file list");
let files = contentList.Contents.filter((file) => file.Size > 0).filter(
  (file) => file.Key !== ""
);

const indexFile = files.find((file) => file.Key.endsWith("index.html"));
if (indexFile) {
  files.splice(files.indexOf(indexFile), 1);
}

files = files.map((file) => {
  file.FileName = file.Key.replace(R2_PREFIX, "");
  file.FileSize = bytesFormat(file.Size);
  if (R2_PUBLIC_BUCKET_URL) {
    file.FileUrl = `${R2_PUBLIC_BUCKET_URL}/${file.Key}`;
  } else {
    file.FileUrl = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${file.Key}`;
  }
  file.TimeStamp = dateFormat(new Date(file.LastModified), "yyyy-MM-dd HH:mm");
  return file;
});
progess.succeed(`Collected ${files.length} files`);

progess = new Kia("Rendering index file");
const template = await Deno.readTextFile(templateFile);
const indexHtml = nunjucks.renderString(template, {
  files,
});

if (SAVE_TO_FILE) {
  await Deno.writeTextFile(indexFilePath, indexHtml);
  progess.succeed("Index file saved at " + indexFilePath);
  if (OPEN_IN_BROWSER) {
    progess = new Kia("Opening generated index file in default browser");
    const browser = Deno.run({
      cmd: ["open", indexFilePath],
      stdout: "piped",
      stderr: "piped",
    });
    // const { code } = await browser.status();
    progess.succeed();
  }
} else {
  progess.succeed("Index HTML rendered");
}

if (R2_UPLOAD_INDEX) {
  // Upload the index file to the bucket
  progess = new Kia("Uploading index file to Cloudflare R2");
  const response = await api.putObject({
    Bucket: R2_BUCKET,
    Key: `${R2_PREFIX}index.html`,
    Body: indexHtml,
    ContentType: "text/html",
  });
  let finalUrl;
  if (R2_PUBLIC_BUCKET_URL) {
    finalUrl = `${R2_PUBLIC_BUCKET_URL}/${R2_PREFIX}index.html`;
  } else {
    finalUrl = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${R2_PREFIX}index.html`;
  }
  if (response.ETag) {
    progess.succeed(`Index file uploaded to ${finalUrl}`);
  } else {
    progess.fail("Index file upload failed");
  }
}
