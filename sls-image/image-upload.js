'use strict';
const AWS = require('aws-sdk');
const s3Bucket = new AWS.S3({ params: { Bucket: process.env.BUCKET_NAME } });

module.exports.uploadImage = function (event, context, callback) {

  const body = JSON.parse(event.body);

  let buf = new Buffer(body.data.replace(/^data:image\/\w+;base64,/, ""), 'base64')


  let data = {
    Key: body.key,
    Body: buf,
    ContentEncoding: 'base64',
    ContentType: body.mimeType
  };

  s3Bucket.putObject(data, function (err, data) {
    if (err) {
      console.log(err);
      console.log('Error uploading data: ', data);
      const response = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*", // Required for CORS support to work
          "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS 
        },
        body: JSON.stringify({ "message": "Upload Failed" })
      };

      callback(null, response);
    } else {
      console.log('succesfully uploaded the image!');
      const response = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*", // Required for CORS support to work
          "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS 
        },
        body: JSON.stringify({ "message": "Successfully Uploaded" })
      };

      callback(null, response);
    }
  });
};
