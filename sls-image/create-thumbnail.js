const AWS = require('aws-sdk');
const sharp = require('sharp');
const S3 = new AWS.S3();
const bucket = process.env.BUCKET;
const thumbnail_bucket = process.env.THUMBNAIL_BUCKET;
const transforms = [
  { name: 'small', size: 85 },
  { name: 'medium', size: 160 },
  { name: 'large', size: 250 },
];

module.exports.createThumbnail = (event, context, callback) => {
  // console.log("event ", event)
  const { key } = event.Records[0].s3.object;
  const sanitizedKey = key.replace(/\+/g, ' ');
  const keyWithoutExtension = sanitizedKey.replace(/.[^.]+$/, '');

  let getParams = {
    Bucket: bucket, // your bucket name,
    Key: sanitizedKey  // path to the object you're looking for
  }

  // get original key from S3 with Sharp library, resize and put back to S3
  for (const t of transforms) {
    S3.getObject(getParams).promise()
      .then(data => sharp(data.Body)
        .resize(t.size, t.size, { fit: "outside" })
        .toFormat("jpeg", { quality: 80 })
        .toBuffer()
      )
      .then(buffer => S3.putObject({
        Body: buffer,
        Bucket: `${thumbnail_bucket}/thumbnail`,
        ContentType: 'image/' + "jpeg",
        Key: `${keyWithoutExtension}-size-${t.name}.jpg`,
      }).promise()
      )
      .then((result) => { console.log(result) })
      .catch(err => {
        if (err.code === "NoSuchKey") err.message = "Image not found.";
        console.log(err);
      })
  }
};