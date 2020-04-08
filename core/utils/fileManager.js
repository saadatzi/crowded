const path = require('path');
const multer = require('multer');
const fs = require('fs');
const uuid = require('node-uuid');
const shortid = require('shortid');
// var mime = require('mime-types');
const settings = require('./settings');

const NZ = require('./nz');

const storage = multer.diskStorage({
    destination: async (req, file, callback) => {
        if (!file) {
            return callback(true, null);
        }
        const target = (req.originalUrl).slice(1).split('/');
        let folder = await NZ.generateRandomFolder(target[1]);
		folder = path.join(settings.media_path, folder);
		// console.log(folder, process.env.PWD, require.main, path.dirname(require.main.filename));
        console.info('API: UploadFile destination %j', {folder: folder});

        req._uploadPath = (folder).substring((folder).indexOf(settings.media_folder)+(settings.media_folder).length);
        callback(null, folder)
    },
    filename: (req, file, callback) => {
        if (!file.originalname.match(/\.(png|PNG|jpeg|JPEG|jpg|JPG)$/)) {
            return callback(new Error('fileType'))
        } else {
            const fileName = `${uuid.v4()}_${shortid.generate()}${path.extname(file.originalname)}`;
            req._uploadFilename = fileName;
            callback(null, fileName)
        }
    }
});

/*
* UploadImage and save in path
* */
const uploader = async (req, res, next) => {
    const upload = await multer({storage}).single('fileUpload');
    upload(req, res, (err) => {
        if (err) {
            console.error('API: UploadFile Error uploading file. %s', err);
            return new NZ.Response(null, 'Nothing uploaded.', 400).send(res);
        }
        next();
    })
};

/*
* multiple UploadImage and save in path
* */
const multiUploader = async (req, res, next) => {
    const upload = await multer({storage}).array('fileUpload', settings.maxImageForEvent);
    upload(req, res, (err) => {
        if (err) {
            console.error('API: UploadFile Error uploading file. %s', err);
            return new NZ.Response(null, 'Nothing uploaded.', 400).send(res);
        }
        next();
    })
};

/*router.get('/:fileName', function (req, res) {

    console.info('API: DownloadFile/getFile %j', {params: req.params/!*, token_userId:token*!/});

    const file = uploadPath + path.sep + req.params.fileName;
    const filename = path.basename(file);
    console.info('API: DownloadFile/getFile: %j', {file: file, fileName: filename});
    // var mimetype = mime.lookup(file);

    res.setHeader('Content-disposition', 'inline; filename=' + filename);
    // ToDo For Show in Browser
    // res.setHeader('Content-type', mimetype);


    const filestream = fs.createReadStream(file);
    filestream.on('error', function (err) {
        console.error('API: DownloadFile/getFile Error!!! %s', err);
        res.status(404).send();
    });
    // This will wait until we know the readable stream is actually valid before piping
    filestream.on('open', function () {
        // This just pipes the read stream to the response object (which goes to the client)
        filestream.pipe(res);
    });

});*/

module.exports = {
	uploader,
    multiUploader
};