const fs = require('fs');
const path = require('path');
const xmlConvert = require('xml-js');

export function processCsProj(csprojFilePath, versionSemantic, versionBuild) {
    // load file content
    const xmlFile = fs.readFileSync(csprojFilePath, 'utf8');
    // parse xml file as a json object
    const jsonData = JSON.parse(xmlConvert.xml2json(xmlFile, { compact: true, spaces: 4 }));

    if (jsonData.Project?._attributes.Sdk) {
        console.log('The assembly type is .Net Core, .Net Standard or .Net >= 5');

        if (jsonData.Project?.PropertyGroup) {
            if (Array.isArray(jsonData.Project.PropertyGroup)) {
                var nodeFound = false;
                jsonData.Project.PropertyGroup.forEach((node) => {
                    if (!nodeFound && node.Version) {
                        nodeFound = true;

                        console.log(`Current version: ${node.Version?._text}`);
                        node.Version = { "_text": versionSemantic };
                        console.log(`New version: ${node.Version._text}`);

                        console.log(`Current assembly version: ${node.AssemblyVersion?._text}`);
                        node.AssemblyVersion = { "_text": versionBuild };
                        console.log(`New assembly version: ${node.AssemblyVersion._text}`);

                        console.log(`Current file version: ${node.FileVersion?._text}`);
                        node.FileVersion = { "_text": versionBuild };
                        console.log(`New file version: ${node.FileVersion._text}`);
                    }
                });
            }
            else {
                console.log(`Current version: ${jsonData.Project.PropertyGroup.Version?._text}`);
                jsonData.Project.PropertyGroup.Version = { "_text": versionSemantic };
                console.log(`New version: ${jsonData.Project.PropertyGroup.Version._text}`);

                console.log(`Current assembly version: ${jsonData.Project.PropertyGroup.AssemblyVersion?._text}`);
                jsonData.Project.PropertyGroup.AssemblyVersion = { "_text": versionBuild };
                console.log(`New assembly version: ${jsonData.Project.PropertyGroup.AssemblyVersion._text}`);

                console.log(`Current file version: ${jsonData.Project.PropertyGroup.FileVersion?._text}`);
                jsonData.Project.PropertyGroup.FileVersion = { "_text": versionBuild };
                console.log(`New file version: ${jsonData.Project.PropertyGroup.FileVersion._text}`);
            }

            fs.writeFileSync(csprojFilePath, xmlConvert.json2xml(jsonData, { compact: true, ignoreComment: true, spaces: 4 }));
            console.log(`${csprojFilePath} has been updated`);
        }
        else {
            console.warn('No PropertyGroup node was found');
        }
    }
    else {
        console.log('The assembly type is .Net Framework or UWP');
        processNetFrameworkAndDatabaseAndUwp(csprojFilePath);
    }
}

export function processMsix(wapprojFilePath, versionSemantic) {
    const folderPath = path.dirname(wapprojFilePath);
    console.log(`Searching .appxmanifest files in ${folderPath}`);
    const appxmanifestFiles = searchRecursive(folderPath, '.appxmanifest');
    if (appxmanifestFiles) {
        appxmanifestFiles.forEach((appxmanifestFile) => {
            console.log(`Processing ${appxmanifestFile}`);

            const xmlFile = fs.readFileSync(appxmanifestFile, 'utf8');
            const jsonData = JSON.parse(xmlConvert.xml2json(xmlFile, { compact: true, spaces: 4 }));

            if (jsonData.Package?.Identity) {
                console.log(`Current version number: ${jsonData.Package.Identity?._attributes?.Version}`);
                jsonData.Package.Identity._attributes.Version = versionSemantic;
                console.log(`New version number: ${jsonData.Package.Identity._attributes.Version}`);

                fs.writeFileSync(appxmanifestFile, xmlConvert.json2xml(jsonData, { compact: true, ignoreComment: true, spaces: 4 }));
                console.log(`${appxmanifestFile} has been updated`);
            }
            else {
                console.warn(`The Identity node has not been found in ${appxmanifestFile}`);
            }
        });
    }
    else {
        console.warn('No .appxmanifest found');
    }
}

export function processNetFrameworkAndDatabaseAndUwp(projectFilePath, versionBuild) {
    const assemblyInfoFile = path.join(path.dirname(projectFilePath), '/Properties/AssemblyInfo.cs');
    console.log(`Searching ${assemblyInfoFile}`);
    if (fs.existsSync(assemblyInfoFile)) {
        console.log('AssemblyInfo.cs has been found, processing it');

        var assemblyInfoContent = fs.readFileSync(assemblyInfoFile, 'utf8');

        const newAssemblyVersion = `[assembly: AssemblyVersion("${versionBuild}")]`;
        const newAssemblyFileVersion = `[assembly: AssemblyFileVersion("${versionBuild}")]`;
        const newAssemblyInformationalVersion = `[assembly: AssemblyInformationalVersion("${versionBuild}")]`;

        const assemblyVersionsRegExp = RegExp('\\[\\s*assembly\\s*:\\s*AssemblyVersion(Attribute)?\\s*\\(.*?\\)\\s*\\]');
        const assemblyVersions = assemblyVersionsRegExp.exec(assemblyInfoContent);
        if (assemblyVersions) {
            assemblyVersions.forEach((assemblyVersion) => {
                if (assemblyVersion && !assemblyVersion.startsWith('//')) {
                    console.log(`AssemblyVersion attribute found, updating it (current is ${assemblyVersion})`);
                    assemblyInfoContent = assemblyInfoContent.replace(assemblyVersion, newAssemblyVersion);
                }
            });
        }
        else {
            console.log('AssemblyVersion attribute not found, adding it');
            assemblyInfoContent += `\n${newAssemblyVersion}`;
        }

        const assemblyFileVersionsRegExp = RegExp('\\[\\s*assembly\\s*:\\s*AssemblyFileVersion(Attribute)?\\s*\\(.*?\\)\\s*\\]');
        const assemblyFileVersions = assemblyFileVersionsRegExp.exec(assemblyInfoContent);
        if (assemblyFileVersions) {
            assemblyFileVersions.forEach((assemblyFileVersion) => {
                if (assemblyFileVersion && !assemblyFileVersion.startsWith('//')) {
                    console.log(`AssemblyFileVersion attribute found, updating it (current is ${assemblyFileVersion})`);
                    assemblyInfoContent = assemblyInfoContent.replace(assemblyFileVersion, newAssemblyFileVersion);
                }
            });
        }
        else {
            console.log('AssemblyFileVersion attribute not found, adding it');
            assemblyInfoContent += `\n${newAssemblyFileVersion}`;
        }

        const assemblyInformationalVersionsRegExp = RegExp('\\[\\s*assembly\\s*:\\s*AssemblyInformationalVersion(Attribute)?\\s*\\(.*?\\)\\s*\\]');
        const assemblyInformationalVersions = assemblyInformationalVersionsRegExp.exec(assemblyInfoContent);
        if (assemblyInformationalVersions) {
            assemblyInformationalVersions.forEach((assemblyInformationalVersion) => {
                if (assemblyInformationalVersion && !assemblyInformationalVersion.startsWith('//')) {
                    console.log(`AssemblyInformationalVersion attribute found, updating it (current is ${assemblyInformationalVersion})`);
                    assemblyInfoContent = assemblyInfoContent.replace(assemblyInformationalVersion, newAssemblyInformationalVersion);
                }
            });
        }
        else {
            console.log('AssemblyInformationalVersion attribute not found, adding it');
            assemblyInfoContent += `\n${newAssemblyInformationalVersion}`;
        }

        fs.writeFileSync(assemblyInfoFile, assemblyInfoContent);
        console.log(`${assemblyInfoFile} has been updated`);
    }
    else {
        console.warn('No /Properties/AssemblyInfo.cs found');
    }
}