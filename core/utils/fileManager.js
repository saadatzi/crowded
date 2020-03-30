const path = require('path');
const multer = require('multer');
const fs = require('fs');
const uuid = require('node-uuid');
const shortid = require('shortid');
// var mime = require('mime-types');
const logger = require('./winstonLogger');



/*
* UploadImage and save in path
* */
const uploader = async (req, res, next) => {
    const storage = await multer.diskStorage({
        destination: async (req, file, callback) => {
            console.log("######### multer.storage distination:")
            if (!file) {
                return callback(true, null);
            }
            const target = (req.originalUrl).split('/');
            const folder = await NZ.generateRandomFolder(target[0]);
            logger.info('API: UploadFile destination %j', {folder: folder});
            // path = `${folder}/${uuid.v4()}_${shortid.generate()}.${PATH.extname(old_path)}`;
            req._uploadPath = folder;
            callback(null, folder)
        },
        filename: (req, file, callback) => {
            console.log("######### multer.storage filename:")
            if (!file.originalname.match(/\.(png|PNG|jpeg|JPEG|jpg|JPG)$/)) {
                var err = new Error()
                err.code = 'fileType';
                return callback(err)
            } else {
                logger.info('API: UploadFile filename %j', {name: file.originalname});
                console.log(file);
                const fileName = `${uuid.v4()}_${shortid.generate()}.${path.extname(file.originalname)}`;
                req._uploadFilename = fileName;
                callback(null, fileName)
            }
        }
    });
    const upload = await multer({storage: storage}).single('fileUpload');
    upload(req, res, function (err) {
        if (err) {
            logger.error('API: UploadFile Error uploading file. %s', err);
            return new NZ.Response(null, 'Nothing uploaded.', 400).send(res);
        }
        logger.info('!!! API: UploadFile Last fileName: %s', req._uploadFilename);
        /*storeInDB(parseInt(req.params.type), req.body, fileName, req.userId)
            .then(result => {
                fileName = '';
                CheckException.handler(res, result);
            })
            .catch(e => null);*/
        next();
    })
};

/*router.get('/:fileName', function (req, res) {

    logger.info('API: DownloadFile/getFile %j', {params: req.params/!*, token_userId:token*!/});

    const file = uploadPath + path.sep + req.params.fileName;
    const filename = path.basename(file);
    logger.info('API: DownloadFile/getFile: %j', {file: file, fileName: filename});
    // var mimetype = mime.lookup(file);

    res.setHeader('Content-disposition', 'inline; filename=' + filename);
    // ToDo For Show in Browser
    // res.setHeader('Content-type', mimetype);


    const filestream = fs.createReadStream(file);
    filestream.on('error', function (err) {
        logger.error('API: DownloadFile/getFile Error!!! %s', err);
        res.status(404).send();
    });
    // This will wait until we know the readable stream is actually valid before piping
    filestream.on('open', function () {
        // This just pipes the read stream to the response object (which goes to the client)
        filestream.pipe(res);
    });

});*/

module.exports = {
    uploader
};