// import DataUriParser from "datauri/parser.js"
// import path from "path"

// const getDataUri = (file) => {
//   // Check if file exists
//   if (!file || !file.originalname || !file.buffer) {
//     return null
//   }

//   const parser = new DataUriParser()
//   const extName = path.extname(file.originalname).toString()
//   return parser.format(extName, file.buffer)
// }

// export default getDataUri


import DataUriParser from "datauri/parser.js"
import path from "path"

const getDataUri = (file) => {
  try {
    // Check if file exists and has required properties
    if (!file) {
      console.log("No file provided to getDataUri")
      return null
    }

    if (!file.originalname) {
      console.log("File missing originalname property")
      return null
    }

    if (!file.buffer) {
      console.log("File missing buffer property")
      return null
    }

    const parser = new DataUriParser()
    const extName = path.extname(file.originalname).toString()

    console.log("Processing file:", {
      originalname: file.originalname,
      size: file.buffer.length,
      extension: extName,
    })

    const result = parser.format(extName, file.buffer)
    console.log("DataURI created successfully")
    return result
  } catch (error) {
    console.error("Error in getDataUri:", error.message)
    return null
  }
}

export default getDataUri
