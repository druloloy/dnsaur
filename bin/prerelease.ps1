param (
    [Parameter(Mandatory = $true)]
    [string]
    $Tag,

    [Parameter(Mandatory = $true)]
    [string]
    $Title
)

if ([string]::IsNullOrEmpty($Tag)) {
    throw 'Missing tag'
}

if ([string]::IsNullOrEmpty($Title)) {
    throw 'Missing title'
}

try {
    gh release create $Tag -t "$Title" -F CHANGELOG.md -p --target develop
    gh release upload $Tag --clobber dnsaur.exe
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
