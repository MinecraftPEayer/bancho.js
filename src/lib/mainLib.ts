
function parseOsuVersion(version: string): string[] | undefined {
    let versionData = version.slice(1).split(".");
    if (versionData.length !== 3) return undefined;
    return versionData;
}