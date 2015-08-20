var Decompress = require('decompress'),
    supportedFilesSuffix = {
        zip: Decompress.zip,
        tar: Decompress.tar,
        'tar.bz': Decompress.tarbz2,
        'tar.gz': Decompress.targz
    };

module.exports =  function decompressUpload(folder, file, callback) {
    var suffix = file.substr(file.length - 3, file.length),
        longSuffix = file.substr(file.length - 6, file.length);

    if (supportedFilesSuffix[suffix] || supportedFilesSuffix[longSuffix]) {
        if (supportedFilesSuffix[longSuffix]) {
            suffix = longSuffix;
        }

        var decompress = new Decompress({mode: '755'});
        decompress.src(file).dest(folder).use(supportedFilesSuffix[suffix]()).run(callback);
    }

    return suffix;
};

