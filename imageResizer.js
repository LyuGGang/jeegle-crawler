var im = require('imagemagick');




resizer = function(originalFileName) {

    im.identify(['-format', '%w:%h', originalFileName], function(err, originalSize) {
        if (err) throw err;
        console.log(originalSize);
        originalSize = originalSize.split(':');
        dstFileName = originalFileName.split('.')[0] + "-640." + originalFileName.split('.')[1];
        var option = {
            srcPath: originalFileName,
            dstPath: dstFileName
        };
        if (originalSize[0] >= originalSize[1]) {

            // width가 더 길다 -> height에 맞춰야함
            option.height = 640;
        } else {
            option.width = 640;
        }

        im.resize(option, function(err, stdout, stderr) {

            if (err) throw err;
            console.log('resized success');
        })
    });

}

resizer('chef-cooking-food-1000.jpg');
