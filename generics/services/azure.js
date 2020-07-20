/**
 * name : aws.js
 * author : Aman Jung Karki
 * created-date : 20-July-2020
 * Description : All azure related functionality
 */

const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } = require('@azure/storage-blob');
const AZURE_ACCOUNT_NAME = (process.env.AZURE_ACCOUNT_NAME && process.env.AZURE_ACCOUNT_NAME != "") ? process.env.AZURE_ACCOUNT_NAME : "";
const AZURE_ACCOUNT_KEY = (process.env.AZURE_ACCOUNT_KEY && process.env.AZURE_ACCOUNT_KEY != "") ? process.env.AZURE_ACCOUNT_KEY : "";

// The name of the container that the files will be uploaded to.
const AZURE_STORAGE_CONTAINER = (process.env.AZURE_STORAGE_CONTAINER && process.env.AZURE_STORAGE_CONTAINER != "") ? process.env.AZURE_STORAGE_CONTAINER : "sl-dev-storage";

let blobServiceClient;

let containerClient;

(async () => {

  const sharedKeyCredential = new StorageSharedKeyCredential(AZURE_ACCOUNT_NAME, AZURE_ACCOUNT_KEY);

  // Create the BlobServiceClient object which will be used to create a container client
  blobServiceClient = new BlobServiceClient(
    `https://${AZURE_ACCOUNT_NAME}.blob.core.windows.net`,
    sharedKeyCredential
  );

  // Get a reference to a container
  containerClient = await blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER);

  const checkIfContainerExists = await containerClient.exists();

  if (!checkIfContainerExists) {
    // Create the container
    const createContainerResponse = await containerClient.create();
  }

})();

/**
  * Upload file in azure.
  * @function
  * @name uploadFile
  * @param file - file to upload.
  * @param filePath - file path
  * @returns {Object} - upload file information
*/

const uploadFile = async function (file, fileName, containerName) {

  return new Promise(async (resolve, reject) => {

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const content = file;
    const blobName = fileName;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const uploadBlobResponse = await blockBlobClient.upload(content, content.length);

    if (!uploadBlobResponse['requestId']) {
      return reject({
        message: "Could not upload file in azure"
      });
    } else {

      const result = {
        name: fileName,
        containerName: containerName,
        location: uploadBlobResponse.requestId
      };
      return resolve(result);

    }

  });
}


/**
  * Get downloadable url.
  * @function
  * @name getDownloadableUrl
  * @param filePath - file path
  * @returns {String} - Get downloadable url link
*/

const getDownloadableUrl = function (filePath, containerName) {

  return new Promise(async (resolve, reject) => {

    try {

      const sasToken = generateBlobSASQueryParameters({
        containerName: containerName,
        blobName: filePath,
        permissions: BlobSASPermissions.parse("rw"),
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + process.env.AZURE_LINK_EXPIRY_TIME)
      },
        blobServiceClient.credential
      ).toString();

      return resolve(containerClient.url + "/" + filePath + "?" + sasToken);

    } catch (error) {
      return reject(error);
    }

  });
}

 /**
  * Get azure cloud signed url.
  * @method
  * @name signedUrl
  * @param {String} fileName  - fileName.
  * @param {String} containerName - name of the container.  
  * @return {Object} - signed url and azure file name. 
*/

const signedUrl = ( fileName ,containerName ) => {
  return new Promise(async (resolve, reject) => {
    try {
      
      if( fileName == "" ) {
        throw new Error(httpStatusCode.bad_request.status);
      }
      
      let startDate = new Date();
      startDate.setMinutes(startDate.getMinutes() - 5);
      let expiryDate = new Date(startDate);
      expiryDate.setMinutes(startDate.getMinutes() + constants.common.NO_OF_EXPIRY_TIME);

      const sasToken = generateBlobSASQueryParameters({
        containerName : containerName,
        blobName : fileName,
        permissions: BlobSASPermissions.parse("w"),
        startsOn: startDate,
        expiresOn: expiryDate,
      },blobServiceClient.credential
      ).toString();

    const url = containerClient.url + "/" + fileName + "?" + sasToken;
    const result = {
      success : true,
      url : url
    };
    
    if(url && url != "") {

      result["name"] = fileName;
      
    } else {

      result.success = false;
    }

    return resolve(result);

  } catch (error) {
    return resolve({
      success : false,
      message : error.message,
      response : error
    });
  } 
})
}

module.exports = {
  uploadFile: uploadFile,
  getDownloadableUrl: getDownloadableUrl,
  signedUrl : signedUrl
};
