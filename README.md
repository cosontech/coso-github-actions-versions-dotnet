# coso-github-actions-versions-dotnet
This action set version numbers in dotnet project files (csproj, sqlproj, wapproj/appxmanifest).

See also:  
[coso-github-actions-versions-calculate](https://github.com/cosontech/coso-github-actions-versions-calculate)  
[coso-github-actions-versions-release](https://github.com/cosontech/coso-github-actions-versions-release)  
[coso-github-actions-versions-json](https://github.com/cosontech/coso-github-actions-versions-json)  

## Inputs

#### `version-semantic`
**Required** Version Number (semantic format)

#### `version-build`
**Required** Version Number (build format)

#### `root-directory`
**Required** Path of the root directory that contains project files (use the environment variable ${{ github.workspace }} for root, the action will search project files recursively)

## Example usage

```yaml
steps:  
  # calculate the version number
  - name: Calculate Versions
    id: calculate-version
    uses: cosontech/coso-github-actions-versions-calculate@v1
    with:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      version-major-number: '1'
      version-minor-number: '0'

  # update project files with the version number
  - name: Set version
    id: set-dotnet-version
    uses: cosontech/coso-github-actions-versions-dotnet@v1
    with:
      version-semantic: ${{ steps.calculate-version.outputs.semVersion }}
      version-build: ${{ steps.calculate-version.outputs.buildVersion }}
      root-directory: ${{ github.workspace }}

  # create a release to be able to increment the version number at next run
  - name: Create release
    id: create-release
    uses: cosontech/coso-github-actions-versions-release@v1
    with:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      version-number: ${{ steps.calculate-version.outputs.semVersion }}
      create-version-release: 'true'
      update-major-release: 'true'
```
