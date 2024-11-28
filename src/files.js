const fs = require('fs');
const path = require('path');

export function searchRecursive(dir, filesExtension) {
    // This is where we store pattern matches of all files inside the directory
    var results = [];

    // Read contents of directory
    fs.readdirSync(dir).forEach(function (dirInner) {
        // Obtain absolute path
        dirInner = path.resolve(dir, dirInner);

        // Get stats to determine if path is a directory or a file
        var stat = fs.statSync(dirInner);

        // If path is a directory, scan it and combine results
        if (stat.isDirectory()) {
            results = results.concat(searchRecursive(dirInner, filesExtension));
        }

        // If path is a file and ends with pattern then push it onto results
        if (stat.isFile() && dirInner.endsWith(filesExtension)) {
            results.push(dirInner);
        }
    });

    return results;
}