import { processCsProj, processMsix, processNetFrameworkAndDatabaseAndUwp } from './processing'
import { searchRecursive } from './files'

const core = require('@actions/core');

// ****INPUTS****

const versionSemantic = core.getInput('version-semantic');
const versionBuild = core.getInput('version-build');
const rootDirectory = core.getInput('root-directory');

// ****EXECUTION****

console.log('Searching C# project files (*.csproj)...');
var csprojFiles = searchRecursive(rootDirectory, '.csproj');
if (csprojFiles){
    console.log(`${csprojFiles.length} C# project(s) found`);
    console.log('');
    csprojFiles.forEach((csprojFile)=>
    {
        console.log(`Processing ${csprojFile}`);
        processCsProj(csprojFile, versionSemantic, versionBuild);
        console.log(`${csprojFile} has been processed`);
        console.log('');
    });
}
else {
    console.log('No C# project found');
}

if (!csprojFiles) console.log('');
console.log('Searching Database project files (*.sqlproj)...');
var sqlprojFiles = searchRecursive(rootDirectory, '.sqlproj');
if (sqlprojFiles){
    console.log(`${sqlprojFiles.length} Database project(s) found`);
    console.log('');
    sqlprojFiles.forEach((sqlprojFile)=>
    {
        console.log(`Processing ${sqlprojFile}`);
        processNetFrameworkAndDatabaseAndUwp(sqlprojFile, versionBuild);
        console.log(`${sqlprojFile} has been processed`);
        console.log('');
    });
}
else {
    console.log('No Database project found');
}

if (!csprojFiles && !sqlprojFiles) console.log('');
console.log('Searching Msix project files (*.wapproj)...');
var wapprojFiles = searchRecursive(rootDirectory, '.wapproj');
if (wapprojFiles){
    console.log(`${wapprojFiles.length} Msix project(s) found`);
    console.log('');
    wapprojFiles.forEach((wapprojFile)=>
    {
        console.log(`Processing ${wapprojFile}`);
        processMsix(wapprojFile, versionSemantic);
        console.log(`${wapprojFile} has been processed`);
        console.log('');
    });
}
else {
    console.log('No Msix project found');
}
