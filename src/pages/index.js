import React, { useState } from "react"

import { v4 as uuid } from "uuid"

import Layout from "../components/layout"

import SEO from "../components/seo"

const style = {
  imageInputContainer: {
    width: 150,
    height: 150,
    border: "1px solid black",
    borderRadius: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
  largeImageContainer: {
    width: 250,
    height: 250,
    borderRadius: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
  mediumImageContainer: {
    width: 160,
    height: 160,
    borderRadius: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
  smallImageContainer: {
    width: 85,
    height: 85,
    borderRadius: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
  buttonStyle: {
    background: "#3d7dc1",
    color: "aliceblue",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    padding: 10,
  },
  inputContainer: {
    width: "20%",
    height: "100%",
    background: "#cac8c8",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  ouputContainer: {
    width: "80%",
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
}

const IndexPage = () => {

  const [file, setFile] = useState()
  const [loading, setLoading] = useState(false)
  const [imageKey, setImageKey] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [isThumbnailCreated, setThumbnailCreated] = useState(false)

  function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  function setImageFile(e) {
    if (e.target.files && e.target.files.length) {
      if (FileReader) {
        var reader = new FileReader()
        reader.readAsDataURL(e.target.files[0])
        reader.onload = function (e) {
          var image = new Image()
          image.src = e.target.result
          image.onload = function () {
            setImageUrl(image.src)
          }
        }
      }
      setFile(e.target.files)
    }
  }

  function createThumbnails(e) {
    e.preventDefault()
    setLoading(true)

    const { name, type: mimeType } = file[0]
    const [, , , extension] = /([^.]+)(\.(\w+))?$/.exec(name)
    const fileKey = uuid()
    const key = [fileKey, extension].filter(x => !!x).join(".")

    getBase64(file[0])
      .then(data => {
        const s3file = {
          region: "BUCKET_REGION",
          bucket: "UPLOAD_BUCKET_NAME",
          key: key,
          mimeType: mimeType,
          data: data,
        }
        fetch(
          "UPLOAD_IMAGE_API_END_POINT",
          {
            method: "POST",
            body: JSON.stringify(s3file),
          }
        )
          .then(res => res.json())
          .then(result => {
            const keyWithoutExtension = key.replace(/.[^.]+$/, "")
            setImageKey(keyWithoutExtension)
            setTimeout(() => {
              setLoading(false)
              setThumbnailCreated(true)
            }, 5000)

          })
          .catch(console.log)
      })
      .catch(console.log)
  }
  return (
    <Layout>
      <SEO title="Home" />

      <h3>Create Thumbnail Images:</h3>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          height: 300,
          background: "#efefef",
        }}
      >
        <div style={style.inputContainer}>
          {imageUrl && !isThumbnailCreated ? (
            <div style={style.imageInputContainer}>
              <img
                id="imagenFondo"
                src={imageUrl}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "scale-down",
                  margin: 0,
                }}
              />
            </div>
          ) : (
              <>
                <div style={style.imageInputContainer}>
                  <label
                    style={{ fontSize: 100, cursor: "pointer" }}
                    htmlFor="getFile"
                  >
                    +
          </label>
                </div>
                <input
                  type={"file"}
                  name="pic"
                  accept="image/*"
                  id="getFile"
                  style={{ display: "none" }}
                  onChange={setImageFile}
                />
              </>
            )}

          <div style={style.buttonContainer}>
            <button
              type={"submit"}
              onClick={createThumbnails}
              style={style.buttonStyle}
            >
              Create Thumbnails
              </button>
          </div>
        </div>
        <div style={style.ouputContainer}>
          {loading && <label>Creating thumbnail images. Please wait....</label>}
          {isThumbnailCreated && (
            <>
              <div style={style.largeImageContainer}>
                <img
                  id="imagenFondo"
                  src={`THUMBNAIL_BUCKET_URL/${imageKey}-size-large.jpg`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "scale-down",
                    margin: 0,
                  }}
                />
              </div>
              <div style={style.mediumImageContainer}>
                <img
                  id="imagenFondo"
                  src={`THUMBNAIL_BUCKET_URL/${imageKey}-size-medium.jpg`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "scale-down",
                    margin: 0,
                  }}
                />
              </div>
              <div style={style.smallImageContainer}>
                <img
                  id="imagenFondo"
                  src={`THUMBNAIL_BUCKET_URL/${imageKey}-size-small.jpg`}
                  createThumbnails
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "scale-down",
                    margin: 0,
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

    </Layout>
  )
}

export default IndexPage
