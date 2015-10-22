var express = require('express.io');
var router = express();
var fs = require('fs');

var frondFilePath = '';


router.post('/fileupload', function (req, res) {
    var uploadFilePath = req.files.file.path;
    var uploadFileName = uploadFilePath.split("\\");
    uploadFileName = uploadFileName[uploadFileName.length-1];
    var filePath = './public/uploads/' + uploadFileName;
    frondFilePath = '/uploads/' + uploadFileName;
//    console.log(frondFilePath);
    fs.readFile(uploadFilePath, function (err, data) {
        fs.writeFile(filePath, data, function (err) {
            if (err) {
            } else {
                res.redirect('back');
            }
        });
    });
});

var getFilepath = function () {
    return frondFilePath;
};

module.exports = router;
module.exports.getFilepath = getFilepath;
